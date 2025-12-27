-- Create a function to get user email by id (security definer to access auth.users)
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_uuid
$$;

-- Create a function to search users by email (for admin use)
CREATE OR REPLACE FUNCTION public.search_users_by_email(search_term text)
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, created_at 
  FROM auth.users 
  WHERE email ILIKE '%' || search_term || '%'
  LIMIT 20
$$;

-- Create a function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_role_to_user(target_user_id uuid, target_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Insert or update the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create a function to remove role from user
CREATE OR REPLACE FUNCTION public.remove_role_from_user(target_user_id uuid, target_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can remove roles';
  END IF;
  
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = target_role;
END;
$$;

-- Create function to check if user is employee
CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
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
      AND role = 'employee'
  )
$$;

-- Update RLS policies to allow employees to manage jobs and blog_posts
CREATE POLICY "Employees can modify jobs" 
ON public.jobs 
FOR ALL 
USING (has_role(auth.uid(), 'employee'))
WITH CHECK (has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can modify blog_posts" 
ON public.blog_posts 
FOR ALL 
USING (has_role(auth.uid(), 'employee'))
WITH CHECK (has_role(auth.uid(), 'employee'));