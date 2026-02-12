-- Fix missing schema prefixes and potential recursion in user_roles policies
-- Also ensure all has_role calls are fully qualified

-- 1. Ensure has_role function is robust and uses fully qualified types
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 2. Update user_roles policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. Update jobs policies
DROP POLICY IF EXISTS "Admins can modify jobs" ON public.jobs;
CREATE POLICY "Admins can modify jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Employees can modify jobs" ON public.jobs;
CREATE POLICY "Employees can modify jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'employee'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'employee'::public.app_role));

-- 4. Update blog_posts policies
DROP POLICY IF EXISTS "Admins can modify blog_posts" ON public.blog_posts;
CREATE POLICY "Admins can modify blog_posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Employees can modify blog_posts" ON public.blog_posts;
CREATE POLICY "Employees can modify blog_posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'employee'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'employee'::public.app_role));

-- 5. Update categories policies
DROP POLICY IF EXISTS "Admins can modify categories" ON public.categories;
CREATE POLICY "Admins can modify categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6. Update adsense_settings policies
DROP POLICY IF EXISTS "Admins can modify adsense_settings" ON public.adsense_settings;
CREATE POLICY "Admins can modify adsense_settings" 
ON public.adsense_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Only admins can read adsense_settings" ON public.adsense_settings;
CREATE POLICY "Only admins can read adsense_settings" 
ON public.adsense_settings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 7. Update ad_units policies
DROP POLICY IF EXISTS "Admins can modify ad_units" ON public.ad_units;
CREATE POLICY "Admins can modify ad_units" 
ON public.ad_units 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 8. Fix handle_new_user_role trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- 9. Repair existing users with NULL internal columns
UPDATE auth.users
SET 
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  recovery_token = COALESCE(recovery_token, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
  email_change IS NULL OR
  email_change_token_new IS NULL OR
  email_change_token_current IS NULL OR
  recovery_token IS NULL OR
  confirmation_token IS NULL OR
  phone_change IS NULL OR
  phone_change_token IS NULL OR
  reauthentication_token IS NULL;
