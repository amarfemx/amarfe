import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'AMar Fe - Stripe Webhook Endpoint',
    description: 'Listens for payment_intent.succeeded and checkout.session.completed to activate florist KDS and courier telemetry.',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing stripe-signature header' },
          { status: 400 }
        );
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In local dev/testing without active stripe CLI proxy, safely parse the JSON payload
      if (process.env.NODE_ENV === 'production') {
        console.error('STRIPE_WEBHOOK_SECRET is mandatory in production');
        return NextResponse.json(
          { error: 'Webhook secret is not configured in server environment' },
          { status: 500 }
        );
      }
      console.warn('⚠️ Webhook running in development mode without STRIPE_WEBHOOK_SECRET verification.');
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`❌ Stripe Webhook verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const orderCode = paymentIntent.metadata?.orderCode;

        console.log(`✅ [Stripe Webhook] Payment succeeded for order: ${orderCode || orderId || paymentIntent.id}`);

        if (orderId || orderCode) {
          const query = supabase
            .from('orders')
            .update({
              status: 'placed',
              payment_status: 'completed',
              payment_transaction_id: paymentIntent.id,
              updated_at: new Date().toISOString(),
            });

          if (orderId) {
            await query.eq('id', orderId);
          } else if (orderCode) {
            await query.eq('order_code', orderCode);
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId || session.client_reference_id;
        const orderCode = session.metadata?.orderCode;

        console.log(`✅ [Stripe Webhook] Checkout session completed for order: ${orderCode || orderId || session.id}`);

        if (orderId || orderCode) {
          const query = supabase
            .from('orders')
            .update({
              status: 'placed',
              payment_status: 'completed',
              payment_transaction_id: (session.payment_intent as string) || session.id,
              updated_at: new Date().toISOString(),
            });

          if (orderId) {
            await query.eq('id', orderId);
          } else if (orderCode) {
            await query.eq('order_code', orderCode);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const orderCode = paymentIntent.metadata?.orderCode;
        const failureReason = paymentIntent.last_payment_error?.message || 'Pago rechazado por emisor';

        console.warn(`⚠️ [Stripe Webhook] Payment failed for order ${orderCode || orderId}: ${failureReason}`);

        if (orderId || orderCode) {
          const query = supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            });

          if (orderId) {
            await query.eq('id', orderId);
          } else if (orderCode) {
            await query.eq('order_code', orderCode);
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        console.log(`ℹ️ [Stripe Webhook] Charge refunded: ${charge.id}, paymentIntent: ${paymentIntentId}`);

        if (paymentIntentId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'refunded',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('payment_transaction_id', paymentIntentId);
        }
        break;
      }

      default:
        console.log(`ℹ️ [Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type });
  } catch (dbErr: any) {
    console.error('❌ Error handling Stripe webhook in database:', dbErr);
    return NextResponse.json(
      { error: 'Internal database processing error', details: dbErr.message },
      { status: 500 }
    );
  }
}
