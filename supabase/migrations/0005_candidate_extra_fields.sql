-- Add extra_fields JSONB to startup_candidates (applied via MCP in prior session)
ALTER TABLE public.startup_candidates
  ADD COLUMN IF NOT EXISTS extra_fields JSONB DEFAULT '{}';
