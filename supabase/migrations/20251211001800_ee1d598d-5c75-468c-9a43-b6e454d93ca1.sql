-- Create job analytics table to track views and clicks
CREATE TABLE public.job_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_job_analytics_job_id ON public.job_analytics(job_id);
CREATE INDEX idx_job_analytics_event_type ON public.job_analytics(event_type);
CREATE INDEX idx_job_analytics_created_at ON public.job_analytics(created_at);

-- Enable RLS
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert job analytics"
ON public.job_analytics
FOR INSERT
WITH CHECK (true);

-- Admins can read analytics
CREATE POLICY "Admins can read job analytics"
ON public.job_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete analytics
CREATE POLICY "Admins can delete job analytics"
ON public.job_analytics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));