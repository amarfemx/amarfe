'use server';

import { createClient } from '@/lib/supabase/server';

export async function getLiveCatalog(occasionSlug?: string, searchQuery?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('*, florist_shops(name, is_open), product_occasions(occasions(slug, name_es, name_en))')
      .eq('is_available', true);

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`title_es.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null; // fallback to curated initial products
    }

    // Filter by occasion slug if selected
    if (occasionSlug && occasionSlug !== 'all') {
      return data.filter((item: any) => {
        return item.product_occasions?.some((po: any) => po.occasions?.slug === occasionSlug);
      });
    }

    return data;
  } catch (err) {
    console.error('Error fetching live catalog:', err);
    return null;
  }
}
