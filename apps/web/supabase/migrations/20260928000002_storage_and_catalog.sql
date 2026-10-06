-- ==============================================================================
-- AMar Fe / ToLove Faith - Supabase Storage & Florist Catalog Policies
-- ==============================================================================

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('florist_media', 'florist_media', true),
    ('delivery_proofs', 'delivery_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'products' bucket
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Authenticated Florists Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Florists Delete Own Product Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'products' 
    AND auth.uid() = owner
);

-- 3. Additional RLS for Florist Shops
CREATE POLICY "Florist Owners Can Insert Shop"
ON public.florist_shops FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Florist Owners Can Update Own Shop"
ON public.florist_shops FOR UPDATE
USING (auth.uid() = owner_id);

-- 4. Additional RLS for Products CRUD
CREATE POLICY "Florist Owners Can Insert Products"
ON public.products FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.florist_shops fs
        WHERE fs.id = products.florist_id
        AND fs.owner_id = auth.uid()
    )
);

CREATE POLICY "Florist Owners Can Update Products"
ON public.products FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.florist_shops fs
        WHERE fs.id = products.florist_id
        AND fs.owner_id = auth.uid()
    )
);

CREATE POLICY "Florist Owners Can Delete Products"
ON public.products FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.florist_shops fs
        WHERE fs.id = products.florist_id
        AND fs.owner_id = auth.uid()
    )
);

-- 5. Product Occasions RLS
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product occasions"
ON public.product_occasions FOR SELECT
USING (true);

CREATE POLICY "Florists manage product occasions"
ON public.product_occasions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.florist_shops fs ON fs.id = p.florist_id
        WHERE p.id = product_occasions.product_id
        AND fs.owner_id = auth.uid()
    )
);
