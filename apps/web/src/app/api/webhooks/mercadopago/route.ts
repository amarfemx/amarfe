import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Health check & diagnostic endpoint for Mercado Pago Webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'AMar Fe - Mercado Pago Checkout Pro Webhook & IPN',
    description: 'Listens for payment notifications to update order state, dispatch florist notifications, and trigger telemetry.',
    supportedEvents: ['payment.created', 'payment.updated', 'merchant_order'],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validates Mercado Pago HMAC SHA-256 signature
 */
function verifyMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !secret) return false;

  try {
    // xSignature format: "ts=1709900000,v1=5d610ac5273b063bed..."
    const parts = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) return false;

    // Optional: Check timestamp freshness (within 10 minutes) to avoid replay attacks
    const currentTs = Math.floor(Date.now() / 1000);
    const parsedTs = parseInt(ts, 10);
    if (Math.abs(currentTs - parsedTs) > 600) {
      console.warn(`⚠️ [Mercado Pago Webhook] Expired signature timestamp: ts=${ts}, current=${currentTs}`);
    }

    // Manifest template according to Mercado Pago Webhook spec:
    // id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
    const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'utf8'),
      Buffer.from(v1, 'utf8')
    );
  } catch (err) {
    console.error('❌ Error validating Mercado Pago signature:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let body: any = {};
  
  try {
    const rawBody = await req.text();
    if (rawBody && rawBody.trim().length > 0) {
      body = JSON.parse(rawBody);
    }
  } catch {
    body = {};
  }

  // Mercado Pago can send payment ID either in body.data.id or in query string (topic=payment&id=...)
  const paymentId = (
    body?.data?.id ||
    searchParams.get('data.id') ||
    searchParams.get('id') ||
    (body?.type === 'payment' ? body?.id : null)
  )?.toString();

  const eventType = body?.type || body?.action || searchParams.get('topic') || searchParams.get('type') || 'payment';

  console.log(`🔔 [Mercado Pago Webhook] Received ${eventType} notification: ID=${paymentId}`);

  // Signature validation if secret is configured
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (webhookSecret && paymentId) {
    const isValid = verifyMercadoPagoSignature(xSignature, xRequestId, paymentId, webhookSecret);
    if (!isValid) {
      console.error(`❌ [Mercado Pago Webhook] Invalid HMAC signature for payment ${paymentId}`);
      return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 });
    }
    console.log(`🛡️ [Mercado Pago Webhook] Signature verified successfully for ${paymentId}`);
  } else if (!webhookSecret && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado en entorno de producción.');
  }

  if (!paymentId) {
    // Acknowledge receipt even if not a direct payment notification (e.g. test ping)
    return NextResponse.json({ received: true, message: 'Notificación recibida sin ID de pago.' });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  let paymentDetails: any = null;

  if (accessToken) {
    try {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (mpResponse.ok) {
        paymentDetails = await mpResponse.json();
      } else {
        console.warn(`⚠️ [Mercado Pago API] Could not fetch payment ${paymentId}: ${mpResponse.statusText}`);
      }
    } catch (apiErr: any) {
      console.error('❌ Error fetching payment details from Mercado Pago API:', apiErr.message);
    }
  }

  // Fallback to payload or query if API is simulated/mock in dev
  const status = paymentDetails?.status || body?.data?.status || 'approved';
  const externalReference = paymentDetails?.external_reference || body?.data?.external_reference || body?.external_reference;

  console.log(`💳 [Mercado Pago Webhook] Payment ${paymentId} -> Status: ${status}, Ref: ${externalReference}`);

  const supabase = createAdminClient();

  try {
    let orderUpdate: Record<string, any> = {
      payment_provider: 'mercadopago',
      payment_transaction_id: paymentId,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      orderUpdate.payment_status = 'completed';
      orderUpdate.status = 'placed';
    } else if (status === 'in_process' || status === 'pending') {
      orderUpdate.payment_status = 'pending';
    } else if (status === 'rejected' || status === 'cancelled') {
      orderUpdate.payment_status = 'failed';
    } else if (status === 'refunded' || status === 'charged_back') {
      orderUpdate.payment_status = 'refunded';
      orderUpdate.status = 'cancelled';
    }

    if (externalReference) {
      // Find order by order_code (e.g. AMF-2026-XXXX) or by UUID id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference);
      
      const query = supabase.from('orders').update(orderUpdate);
      if (isUuid) {
        const { error } = await query.eq('id', externalReference);
        if (error) console.error('Error updating order by UUID:', error);
      } else {
        const { error } = await query.eq('order_code', externalReference);
        if (error) console.error('Error updating order by order_code:', error);
      }
    } else {
      // Check if any order has this transaction id
      await supabase
        .from('orders')
        .update(orderUpdate)
        .eq('payment_transaction_id', paymentId);
    }

    return NextResponse.json({
      received: true,
      paymentId,
      status,
      externalReference: externalReference || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (dbErr: any) {
    console.error('❌ Error handling Mercado Pago webhook in database:', dbErr);
    return NextResponse.json(
      { error: 'Error procesando webhook en base de datos', details: dbErr.message },
      { status: 500 }
    );
  }
}
