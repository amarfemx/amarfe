'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProductFormData {
  titleEs: string;
  titleEn: string;
  descriptionEs?: string;
  descriptionEn?: string;
  price: number;
  occasionId?: string;
  preparationMinutes: number;
  stockQuantity: number;
  imageUrl?: string;
}

export async function getFloristProfileAndShop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, shop: null };

  // Check florist shop
  let { data: shop } = await supabase
    .from('florist_shops')
    .select('*, cities(name, state)')
    .eq('owner_id', user.id)
    .single();

  // Auto-provision default shop if user is florist but has no shop yet
  if (!shop) {
    const { data: city } = await supabase.from('cities').select('id').limit(1).single();
    if (city) {
      const { data: newShop, error } = await supabase
        .from('florist_shops')
        .insert({
          owner_id: user.id,
          city_id: city.id,
          name: 'Mi Floristería Boutique',
          slug: `floristeria-${user.id.slice(0, 8)}`,
          description_es: 'Arreglos florales frescos elaborados con amor y dedicación.',
          description_en: 'Fresh floral arrangements crafted with love and care.',
          address: 'Av. Insurgentes Sur 1200, Benito Juárez, CDMX',
          lat: 19.3820,
          lng: -99.1764,
          phone: '+52 55 5555 1234',
          is_verified: true,
          is_open: true,
        })
        .select('*, cities(name, state)')
        .single();

      if (!error && newShop) {
        shop = newShop;
      }
    }
  }

  return { user, shop };
}

export async function getFloristProducts(shopId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_occasions(occasion_id, occasions(name_es, name_en, slug))')
    .eq('florist_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching florist products:', error);
    return [];
  }
  return data || [];
}

export async function getOccasions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('occasions')
    .select('*')
    .eq('is_active', true)
    .order('name_es');
  return data || [];
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No autorizado');

  const shopId = formData.get('shopId') as string;
  const titleEs = formData.get('titleEs') as string;
  const titleEn = formData.get('titleEn') as string;
  const descriptionEs = formData.get('descriptionEs') as string;
  const price = parseFloat(formData.get('price') as string);
  const preparationMinutes = parseInt(formData.get('prepMinutes') as string) || 30;
  const stockQuantity = parseInt(formData.get('stock') as string) || 50;
  const occasionId = formData.get('occasionId') as string;
  const imageFile = formData.get('imageFile') as File | null;

  let imageUrl = formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80';

  // Upload image to Supabase Storage if provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        imageUrl = publicUrlData.publicUrl;
      }
    } else {
      console.warn('Image upload fallback due to storage setup:', uploadError.message);
    }
  }

  // Insert product
  const { data: product, error: insertError } = await supabase
    .from('products')
    .insert({
      florist_id: shopId,
      title_es: titleEs,
      title_en: titleEn || titleEs,
      description_es: descriptionEs,
      description_en: descriptionEs,
      price: price,
      currency: 'MXN',
      images: [imageUrl],
      preparation_minutes: preparationMinutes,
      stock_quantity: stockQuantity,
      is_available: true,
      is_featured: false,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Link occasion
  if (occasionId && product) {
    await supabase.from('product_occasions').insert({
      product_id: product.id,
      occasion_id: occasionId,
    });
  }

  revalidatePath('/florist/dashboard');
  revalidatePath('/');
  return { success: true };
}

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', productId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  revalidatePath('/');
  return { success: true };
}

export async function toggleShopStatus(shopId: string, isOpen: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('florist_shops')
    .update({ is_open: isOpen })
    .eq('id', shopId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  return { success: true };
}

export async function getFloristActiveOrders(shopId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        subtotal,
        product_title,
        products (
          id,
          title_es,
          images
        )
      )
    `)
    .eq('florist_id', shopId)
    .in('status', ['placed', 'florist_accepted', 'preparing', 'ready_for_pickup', 'courier_assigned', 'in_transit'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching florist active orders:', error);
    return [];
  }
  return data || [];
}

export async function acceptFloristOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'preparing',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  return { success: true };
}

export async function markBouquetReadyAction(formData: FormData) {
  const supabase = await createClient();
  const orderId = formData.get('orderId') as string;
  const photoFile = formData.get('photoFile') as File | null;
  let bouquetPhotoUrl = formData.get('photoUrl') as string || '';

  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `prepared/${orderId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, photoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        bouquetPhotoUrl = publicUrlData.publicUrl;
      }
    }
  }

  const updatePayload: Record<string, any> = {
    status: 'ready_for_pickup',
    updated_at: new Date().toISOString(),
  };

  if (bouquetPhotoUrl) {
    updatePayload.prepared_photo_url = bouquetPhotoUrl;
  }

  const { error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/florist/dashboard');
  return { success: true, photoUrl: bouquetPhotoUrl };
}

