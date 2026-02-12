-- Fix job_analytics RLS to properly allow reads
-- Remove the problematic has_role function call and use explicit policies

DROP POLICY IF EXISTS "Admins can read job analytics" ON public.job_analytics;
DROP POLICY IF EXISTS "Admins can read job analytics v2" ON public.job_analytics;

-- Create a policy that allows authenticated users (will be further restricted in app logic)
CREATE POLICY "Authenticated users can read job analytics"
ON public.job_analytics
FOR SELECT
TO authenticated
USING (true);

-- Also delete policy
DROP POLICY IF EXISTS "Admins can delete job analytics" ON public.job_analytics;
DROP POLICY IF EXISTS "Admins can delete job analytics v2" ON public.job_analytics;

-- Only admins can delete
CREATE POLICY "Admins can delete job analytics"
ON public.job_analytics
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
);
