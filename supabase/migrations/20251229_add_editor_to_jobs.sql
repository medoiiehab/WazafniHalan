-- Add editor column to jobs table to track who created/modified the job
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS editor UUID,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add constraint to reference auth.users if editor is provided
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_editor_fk FOREIGN KEY (editor) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create a function to get editor information
CREATE OR REPLACE FUNCTION public.get_job_editor_email(job_id UUID)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email 
  FROM auth.users u
  INNER JOIN public.jobs j ON j.editor = u.id
  WHERE j.id = job_id
$$;
