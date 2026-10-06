-- ==============================================================================
-- AMar Fe / ToLove Faith - Initial Database Schema
-- Supabase PostgreSQL + PostGIS (Multi-country, Multi-role, Internationalized)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Multi-Country & Geolocation Configuration
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(3) UNIQUE NOT NULL, -- e.g. 'MEX', 'USA'
    alpha2 VARCHAR(2) UNIQUE NOT NULL, -- e.g. 'MX', 'US'
    name_es VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    phone_prefix VARCHAR(10) NOT NULL DEFAULT '+52',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    base_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
    per_km_fee NUMERIC(10, 2) NOT NULL DEFAULT 12.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Profiles & Roles
CREATE TYPE user_role AS ENUM ('customer', 'courier', 'florist', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'es', -- 'es' | 'en'
    country_id UUID REFERENCES public.countries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Florist Shops
CREATE TABLE IF NOT EXISTS public.florist_shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_es TEXT,
    description_en TEXT,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone VARCHAR(30) NOT NULL,
    banner_url TEXT,
    logo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_open BOOLEAN NOT NULL DEFAULT true,
    bank_clabe VARCHAR(30),
    bank_beneficiary_name VARCHAR(255),
    commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Occasions & Products
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'amor', 'amistad', 'aniversario', 'cumpleanos', 'perdon'
    name_es VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    florist_id UUID NOT NULL REFERENCES public.florist_shops(id) ON DELETE CASCADE,
    title_es VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_es TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    images TEXT[] NOT NULL DEFAULT '{}',
    stock_quantity INTEGER NOT NULL DEFAULT 99,
    preparation_minutes INTEGER NOT NULL DEFAULT 30,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_occasions (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    occasion_id UUID NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, occasion_id)
);

-- 6. Couriers
CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'bicycle', 'car');

CREATE TABLE IF NOT EXISTS public.couriers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL DEFAULT 'motorcycle',
    vehicle_plate VARCHAR(20),
    is_online BOOLEAN NOT NULL DEFAULT false,
    is_busy BOOLEAN NOT NULL DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    last_location_updated_at TIMESTAMPTZ,
    bank_clabe VARCHAR(30),
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Orders & Workflow
CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'placed',
    'florist_accepted',
    'preparing',
    'ready_for_pickup',
    'courier_assigned',
    'in_transit',
    'delivered',
    'cancelled'
);

CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. AMF-2026-9021
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    florist_id UUID NOT NULL REFERENCES public.florist_shops(id) ON DELETE RESTRICT,
    courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Status
    status order_status NOT NULL DEFAULT 'pending_payment',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_provider VARCHAR(50) DEFAULT 'stripe',
    payment_transaction_id VARCHAR(255),
    
    -- Financials
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip_courier NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    
    -- Delivery Recipient Info
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_lat DOUBLE PRECISION NOT NULL,
    delivery_lng DOUBLE PRECISION NOT NULL,
    delivery_instructions TEXT,
    
    -- Emotional Gift Personalization
    card_message TEXT,
    card_sender_name VARCHAR(100),
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    scheduled_for TIMESTAMPTZ,
    
    -- Proof of delivery
    prepared_photo_url TEXT,
    delivered_photo_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 8. Courier Realtime Tracking Points
CREATE TABLE IF NOT EXISTS public.order_tracking (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON public.order_tracking(order_id, recorded_at DESC);

-- 9. Row Level Security (RLS) Baseline
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.florist_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

-- Public read for active catalogs & shops
CREATE POLICY "Public read florist shops" ON public.florist_shops FOR SELECT USING (is_verified = true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_available = true);
CREATE POLICY "Public read occasions" ON public.occasions FOR SELECT USING (is_active = true);

-- User Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT 
    USING (auth.uid() = customer_id);

CREATE POLICY "Florists view their shop orders" ON public.orders FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.florist_shops fs WHERE fs.id = orders.florist_id AND fs.owner_id = auth.uid()));

CREATE POLICY "Couriers view assigned orders" ON public.orders FOR SELECT 
    USING (auth.uid() = courier_id OR (status = 'ready_for_pickup' AND courier_id IS NULL));
