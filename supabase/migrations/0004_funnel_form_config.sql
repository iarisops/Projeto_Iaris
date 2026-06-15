-- Add form_config JSONB to funnels
-- Stores the admin-configured field list for the startup intake form
ALTER TABLE public.funnels
  ADD COLUMN IF NOT EXISTS form_config JSONB DEFAULT NULL;
