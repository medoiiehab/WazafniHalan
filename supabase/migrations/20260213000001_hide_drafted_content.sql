-- Add is_published column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing jobs to be published
UPDATE public.jobs SET is_published = true WHERE is_published IS NULL;

-- Fix RLS for jobs: Public can only see published jobs
DROP POLICY IF EXISTS "Anyone can read jobs" ON public.jobs;
CREATE POLICY "Anyone can read jobs" 
ON public.jobs 
FOR SELECT 
USING (is_published = true);

-- Admins and employees can see all jobs (even drafted ones)
DROP POLICY IF EXISTS "Admins can see all jobs" ON public.jobs;
CREATE POLICY "Admins can see all jobs" 
ON public.jobs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'employee'::public.app_role));

-- Fix RLS for blog_posts: Public can only see published posts
DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can read blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

-- Admins and employees can see all blog posts
DROP POLICY IF EXISTS "Admins can see all blog posts" ON public.blog_posts;
CREATE POLICY "Admins can see all blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'employee'::public.app_role));
