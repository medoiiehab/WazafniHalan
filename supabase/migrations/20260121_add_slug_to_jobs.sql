-- Add slug column to jobs table for URL-friendly identifiers
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD CONSTRAINT jobs_slug_unique UNIQUE(slug);

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS jobs_slug_idx ON public.jobs(slug);

-- Add comment explaining the slug column
COMMENT ON COLUMN public.jobs.slug IS 'URL-friendly slug for job posts, used in job detail URLs';
