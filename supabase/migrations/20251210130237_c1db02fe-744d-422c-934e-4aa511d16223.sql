-- Create table for AdSense settings
CREATE TABLE public.adsense_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id text,
  verification_script text,
  is_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for individual ad units
CREATE TABLE public.ad_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slot_id text NOT NULL,
  placement text NOT NULL,
  ad_format text DEFAULT 'auto',
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adsense_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_units ENABLE ROW LEVEL SECURITY;

-- RLS policies for adsense_settings
CREATE POLICY "Anyone can read adsense_settings" 
ON public.adsense_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can modify adsense_settings" 
ON public.adsense_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ad_units
CREATE POLICY "Anyone can read ad_units" 
ON public.ad_units 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can modify ad_units" 
ON public.ad_units 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_adsense_settings_updated_at
BEFORE UPDATE ON public.adsense_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_units_updated_at
BEFORE UPDATE ON public.ad_units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.adsense_settings (publisher_id, is_enabled) VALUES ('', false);