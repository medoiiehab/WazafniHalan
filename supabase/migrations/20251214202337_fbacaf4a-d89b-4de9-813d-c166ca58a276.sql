-- Fix adsense_settings security: Remove public read access and restrict to admins only
DROP POLICY IF EXISTS "Anyone can read adsense_settings" ON public.adsense_settings;

CREATE POLICY "Only admins can read adsense_settings" 
ON public.adsense_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger to assign user role on new signup
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();