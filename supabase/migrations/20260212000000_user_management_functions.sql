-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add 'employee' to the app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'employee') THEN
    ALTER TYPE public.app_role ADD VALUE 'employee';
  END IF;
END $$;

-- Function to create a new user
CREATE OR REPLACE FUNCTION public.create_new_user(user_email text, user_password text, user_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    last_sign_in_at,
    raw_app_meta_data, 
    raw_user_meta_data, 
    is_super_admin, 
    created_at, 
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token,
    email_change,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, user_email)::jsonb,
    'email',
    new_user_id::text,
    now(),
    now(),
    now()
  );

  -- Assign role (the trigger might already do 'user', but we want to be specific)
  -- Insert or update
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Function to delete a user
CREATE OR REPLACE FUNCTION public.delete_user_by_id(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Delete from auth.users (cascades to identities and user_roles if FK configured)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
