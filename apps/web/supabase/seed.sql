-- ==============================================================================
-- AMar Fe / ToLove Faith - Seed Data
-- ==============================================================================

-- 1. Countries
INSERT INTO public.countries (code, alpha2, name_es, name_en, default_currency, phone_prefix, is_active)
VALUES 
    ('MEX', 'MX', 'México', 'Mexico', 'MXN', '+52', true),
    ('USA', 'US', 'Estados Unidos', 'United States', 'USD', '+1', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Cities
WITH mx AS (SELECT id FROM public.countries WHERE code = 'MEX' LIMIT 1)
INSERT INTO public.cities (country_id, name, state, timezone, center_lat, center_lng, is_active)
SELECT mx.id, 'Ciudad de México', 'CDMX', 'America/Mexico_City', 19.4326, -99.1332, true FROM mx
UNION ALL
SELECT mx.id, 'Guadalajara', 'Jalisco', 'America/Mexico_City', 20.6597, -103.3496, true FROM mx
UNION ALL
SELECT mx.id, 'Monterrey', 'Nuevo León', 'America/Monterrey', 25.6866, -100.3161, true FROM mx
ON CONFLICT DO NOTHING;

-- 3. Occasions
INSERT INTO public.occasions (slug, name_es, name_en, icon)
VALUES 
    ('amor', 'Amor & Romance', 'Love & Romance', 'heart'),
    ('amistad', 'Amistad', 'Friendship', 'users'),
    ('aniversario', 'Aniversario', 'Anniversary', 'sparkles'),
    ('cumpleanos', 'Cumpleaños', 'Birthday', 'cake'),
    ('perdon', 'Para pedir perdón', 'I am sorry', 'hand-heart'),
    ('agradecimiento', 'Agradecimiento', 'Thank you', 'gift')
ON CONFLICT (slug) DO NOTHING;
