-- Add image_url column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS image_url text;