'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Florist actions
export async function floristAcceptOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'preparing' })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  revalidatePath('/');
  return { success: true };
}

export async function floristMarkReady(orderId: string, preparedPhotoUrl?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'ready_for_pickup',
      prepared_photo_url: preparedPhotoUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  revalidatePath('/');
  return { success: true };
}

// Courier actions
export async function courierAcceptOrder(orderId: string, courierId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cId = courierId || user?.id;

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'courier_assigned',
      courier_id: cId 
    })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function courierStartTransit(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'in_transit' })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function courierCompleteDelivery(orderId: string, deliveredPhotoUrl?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'delivered',
      delivered_photo_url: deliveredPhotoUrl || 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80'
    })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

// Live Tracking info
export async function getLiveOrderTracking(orderCodeOrId: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      florist_shops(name, address, phone),
      couriers:profiles!orders_courier_id_fkey(full_name, phone, avatar_url),
      order_items(*)
    `);

  if (orderCodeOrId.startsWith('AMF-') || orderCodeOrId.includes('-2026-')) {
    query = query.eq('order_code', orderCodeOrId);
  } else {
    query = query.eq('id', orderCodeOrId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }
  return data;
}
