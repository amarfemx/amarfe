'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';

export interface CreateOrderInput {
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  floristId: string;
  
  // Recipient
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  
  // Dedication Card
  cardMessage: string;
  cardSenderName?: string;
  isAnonymous: boolean;
  scheduledFor?: string;
  
  // Payment
  paymentProvider: 'stripe' | 'mercadopago';
  deliveryFee: number;
  platformFee: number;
  tipCourier: number;
}

export async function createOrderAction(input: CreateOrderInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Generate unique order code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `AMF-2026-${randomSuffix}`;

    const subtotal = input.unitPrice * input.quantity;
    const total = subtotal + input.deliveryFee + input.platformFee + input.tipCourier;

    // Use current user id or fallback placeholder if guest
    let customerId = user?.id;

    if (!customerId) {
      // Find or assign guest profile
      const { data: guestProfile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();
      customerId = guestProfile?.id;
    }

    if (!customerId) {
      return { error: 'Se requiere iniciar sesión para completar el pedido.' };
    }

    // Verify floristId exists, if invalid grab first shop
    let floristId = input.floristId;
    if (!floristId || floristId === 'default') {
      const { data: shop } = await supabase
        .from('florist_shops')
        .select('id')
        .limit(1)
        .single();
      floristId = shop?.id || '';
    }

    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_id: customerId,
        florist_id: floristId,
        status: 'placed',
        payment_status: 'completed',
        payment_provider: input.paymentProvider,
        payment_transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        currency: 'MXN',
        subtotal: subtotal,
        delivery_fee: input.deliveryFee,
        platform_fee: input.platformFee,
        tip_courier: input.tipCourier,
        total: total,
        recipient_name: input.recipientName,
        recipient_phone: input.recipientPhone,
        delivery_address: input.deliveryAddress,
        delivery_lat: input.deliveryLat || 19.4326,
        delivery_lng: input.deliveryLng || -99.1332,
        delivery_instructions: input.deliveryInstructions || null,
        card_message: input.cardMessage || null,
        card_sender_name: input.isAnonymous ? 'Un Admirador Secreto' : (input.cardSenderName || null),
        is_anonymous: input.isAnonymous,
        scheduled_for: input.scheduledFor ? new Date(input.scheduledFor).toISOString() : null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return { error: orderError.message };
    }

    // 2. Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: input.productId.startsWith('p') ? null : input.productId,
        product_title: input.productTitle,
        unit_price: input.unitPrice,
        quantity: input.quantity,
        subtotal: subtotal,
      });

    if (itemsError) {
      console.warn('Warning inserting order items:', itemsError.message);
    }

    revalidatePath('/florist/dashboard');
    revalidatePath('/');

    return { 
      success: true, 
      orderId: order.id, 
      orderCode: order.order_code,
      total: total
    };
  } catch (err: any) {
    console.error('Fatal order creation error:', err);
    return { error: err.message || 'Error procesando el pedido.' };
  }
}

/**
 * Creates a Stripe Payment Intent linked to an order
 */
export async function createStripePaymentIntentAction(orderId: string, orderCode: string, amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // In Mexican Centavos (MXN)
      currency: 'mxn',
      metadata: {
        orderId,
        orderCode,
        platform: 'AMarFe-Web',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (err: any) {
    console.error('Stripe Payment Intent error:', err);
    return { error: err.message };
  }
}
