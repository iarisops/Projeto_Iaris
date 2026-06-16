-- ============================================================
-- Migration 0007: IARIS Internal Tasks (iaris_tasks)
-- ============================================================
-- Kanban board for IARIS Venture Builder's own internal tasks.
-- Same structure as kanban_tasks, but not tied to a portfolio startup.
-- ============================================================

CREATE TABLE public.iaris_tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  phase          TEXT NOT NULL DEFAULT 'Backlog'
                 CHECK (phase IN ('Backlog','A fazer','Em andamento',
                                  'Aguardando/Bloqueado','Em revisão','Concluído')),
  responsible_id UUID REFERENCES auth.users,
  due_date       DATE,
  comments       TEXT,
  links          JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);

-- RLS
ALTER TABLE public.iaris_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_all" ON public.iaris_tasks
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- auto-update updated_at
CREATE TRIGGER trg_iaris_tasks_updated_at
  BEFORE UPDATE ON public.iaris_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index
CREATE INDEX idx_iaris_tasks_responsible ON public.iaris_tasks(responsible_id);
CREATE INDEX idx_iaris_tasks_phase       ON public.iaris_tasks(phase);
