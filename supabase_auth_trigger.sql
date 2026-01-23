-- ============================================================================
-- SUPABASE DATABASE TRIGGER: Sync auth.users to public.users
-- ============================================================================
-- Purpose: Automatically create a user record in public.users when a new 
--          user is created in auth.users (Supabase Authentication)
--
-- Instructions:
-- 1. Open Supabase Dashboard → Your Project
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Run the script
--
-- After this, when users sign up via supabase.auth.signUp(), they will
-- automatically appear in your public.users table with their metadata
-- ============================================================================

-- Step 1: Create the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  full_name TEXT;
  user_type TEXT;
  country TEXT;
  city TEXT;
  phone TEXT;
  gender TEXT;
  birthdate TEXT;
  company_name TEXT;
  company_address TEXT;
BEGIN
  -- Extract metadata from auth.users.raw_user_meta_data
  full_name := NEW.raw_user_meta_data->>'full_name';
  user_type := NEW.raw_user_meta_data->>'user_type';
  country := NEW.raw_user_meta_data->>'country';
  city := NEW.raw_user_meta_data->>'city';
  phone := NEW.raw_user_meta_data->>'phone';
  gender := NEW.raw_user_meta_data->>'gender';
  birthdate := NEW.raw_user_meta_data->>'birthdate';
  company_name := NEW.raw_user_meta_data->>'company_name';
  company_address := NEW.raw_user_meta_data->>'company_address';

  -- Insert new user record into public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    user_type,
    country,
    city,
    phone,
    gender,
    birthdate,
    company_name,
    company_address,
    is_verified,
    is_blocked,
    is_deleted,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::integer,  -- Convert UUID to integer if needed, or use UUID directly
    NEW.email,
    full_name,
    COALESCE(user_type, 'candidate'),
    COALESCE(country, 'congo'),
    city,
    phone,
    gender,
    birthdate,
    company_name,
    company_address,
    FALSE,  -- is_verified: email not confirmed yet
    FALSE,  -- is_blocked
    FALSE,  -- is_deleted
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger that executes the function
-- This trigger fires AFTER a new user is inserted into auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The trigger will execute automatically when users sign up
-- 2. Email confirmation will still be sent by Supabase Auth
-- 3. When user confirms their email, manually update is_verified = TRUE
--    OR create another trigger to handle email_confirmed_at changes
-- 4. If your users.id is UUID, use NEW.id directly instead of NEW.id::integer
-- 5. The trigger has SECURITY DEFINER to ensure it can insert even with RLS
--
-- Optional: To auto-update is_verified when email is confirmed, add this:
-- 
-- CREATE OR REPLACE FUNCTION public.handle_email_verified()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
--     UPDATE public.users
--     SET is_verified = TRUE, updated_at = NOW()
--     WHERE id = NEW.id::integer;
--   END IF;
--   RETURN NEW;
-- END;
-- $$;
--
-- CREATE OR REPLACE TRIGGER on_auth_email_verified
-- AFTER UPDATE ON auth.users
-- FOR EACH ROW
-- EXECUTE FUNCTION public.handle_email_verified();
-- ============================================================================
