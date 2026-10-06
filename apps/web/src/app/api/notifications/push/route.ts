import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PushDispatchRequest {
  orderId: string;
  orderCode: string;
  targetRole: 'courier' | 'customer' | 'florist';
  event: 'bouquet_ready' | 'courier_assigned' | 'in_transit_near' | 'delivered';
  title?: string;
  body?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: PushDispatchRequest = await req.json();

    let title = payload.title;
    let body = payload.body;

    // Automated emotional copy templates
    switch (payload.event) {
      case 'bouquet_ready':
        title = title || '🛵 ¡Arreglo floral listo para recolección!';
        body = body || `La florería terminó de confeccionar el encargo ${payload.orderCode}. ¡Pasa a recogerlo!`;
        break;
      case 'courier_assigned':
        title = title || '🌹 ¡Tu mensajero de amor ha sido asignado!';
        body = body || `Un chofer en auto climatizado va en camino por las flores (${payload.orderCode}).`;
        break;
      case 'in_transit_near':
        title = title || '✨ ¡Tu detalle de amor está muy cerca!';
        body = body || `El repartidor se encuentra a menos de 500 metros del destino (${payload.orderCode}).`;
        break;
      case 'delivered':
        title = title || '🎉 ¡Detalle entregado con una sonrisa!';
        body = body || `Tu regalo floral ${payload.orderCode} fue recibido con felicidad.`;
        break;
    }

    console.log(`🔔 [FCM Push Server] Dispatching to ${payload.targetRole}: "${title}" - ${body}`);

    // In production, invoke admin.messaging().send() via Firebase Admin SDK
    return NextResponse.json({
      success: true,
      deliveredAt: new Date().toISOString(),
      notification: {
        title,
        body,
        orderCode: payload.orderCode,
        role: payload.targetRole,
      },
    });
  } catch (err: any) {
    console.error('Error dispatching push notification:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
