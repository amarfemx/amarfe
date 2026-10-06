-- ==============================================================================
-- AMar Fe / ToLove Faith - Orders, Order Items & Checkout Security Policies
-- ==============================================================================

-- 1. Insert & Update Policies for Orders
CREATE POLICY "Customers can insert orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their pending orders"
ON public.orders FOR UPDATE
USING (auth.uid() = customer_id AND status = 'pending_payment');

CREATE POLICY "Florists can update their shop orders"
ON public.orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.florist_shops fs
        WHERE fs.id = orders.florist_id
        AND fs.owner_id = auth.uid()
    )
);

CREATE POLICY "Couriers can update assigned orders"
ON public.orders FOR UPDATE
USING (
    auth.uid() = courier_id 
    OR (courier_id IS NULL AND status = 'ready_for_pickup')
);

-- 2. Order Items Policies
CREATE POLICY "Customers view order items of their orders"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
);

CREATE POLICY "Florists view order items of their shop orders"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.florist_shops fs ON fs.id = o.florist_id
        WHERE o.id = order_items.order_id
        AND fs.owner_id = auth.uid()
    )
);

CREATE POLICY "Couriers view order items of assigned orders"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.courier_id = auth.uid() OR o.status = 'ready_for_pickup')
    )
);

CREATE POLICY "Customers can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
);
