-- ==============================================================================
-- AMar Fe / ToLove Faith - Auth Trigger for Profiles
-- Automatically synchronizes auth.users into public.profiles with role support
-- ==============================================================================

-- 1. Trigger Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_val public.user_role;
    raw_role_text TEXT;
BEGIN
    raw_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    
    -- Cast safely to user_role enum
    IF raw_role_text IN ('customer', 'courier', 'florist', 'admin') THEN
        user_role_val := raw_role_text::public.user_role;
    ELSE
        user_role_val := 'customer'::public.user_role;
    END IF;

    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        email,
        phone,
        avatar_url,
        preferred_language
    )
    VALUES (
        NEW.id,
        user_role_val,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'es')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = now();

    RETURN NEW;
END;
$$;

-- 2. Attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Additional RLS Policy for Profiles (allow insert from trigger / auth service)
CREATE POLICY "Public profiles can be created by authenticated users" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
