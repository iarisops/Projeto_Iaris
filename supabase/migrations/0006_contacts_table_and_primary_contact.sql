-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  whatsapp    TEXT,
  email       TEXT,
  linkedin    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_by  UUID REFERENCES auth.users,
  updated_by  UUID REFERENCES auth.users
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contacts"
  ON public.contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
  ON public.contacts FOR UPDATE TO authenticated USING (true);

-- Link startup_candidates to contacts
ALTER TABLE public.startup_candidates
  ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES public.contacts(id);
