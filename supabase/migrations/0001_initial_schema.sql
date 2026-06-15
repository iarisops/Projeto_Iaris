-- IARIS Portfolio OS — Initial Schema
-- T008: All 18+ tables with fields, constraints and indexes

-- ============================================================
-- SECTION 1: User Profile Extension
-- ============================================================

CREATE TABLE public.users (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  role                 TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 2: CRM Module
-- ============================================================

CREATE TABLE public.funnels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  edition     TEXT,
  start_date  DATE,
  end_date    DATE,
  status      TEXT NOT NULL DEFAULT 'Ativo'
              CHECK (status IN ('Ativo', 'Encerrado', 'Arquivado')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_by  UUID REFERENCES auth.users,
  updated_by  UUID REFERENCES auth.users
);

CREATE TABLE public.funnel_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id   UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  position    INT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  is_final    BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (funnel_id, position)
);

-- portfolio_startups created before startup_candidates (circular FK resolution)
-- source_candidate_id FK added after startup_candidates is created
CREATE TABLE public.portfolio_startups (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_candidate_id  UUID,
  name                 TEXT NOT NULL,
  logo_url             TEXT,
  site                 TEXT,
  linkedin             TEXT,
  entry_date           DATE,
  short_description    TEXT,
  segment              TEXT,
  vertical             TEXT,
  problem              TEXT,
  solution             TEXT,
  icp                  TEXT,
  business_model       TEXT,
  revenue_model        TEXT,
  stage                TEXT CHECK (stage IN ('Ideação','Validação','Operação','Tração','Escala')),
  founders             JSONB NOT NULL DEFAULT '[]',
  funding_round        TEXT,
  funding_target       NUMERIC(15,2),
  valuation_instrument TEXT,
  captable_summary     TEXT,
  iaris_stake          NUMERIC(5,2),
  funding_use          TEXT,
  tier                 SMALLINT CHECK (tier BETWEEN 0 AND 3),
  journey_status       TEXT,
  engagement           TEXT,
  last_update_at       TIMESTAMPTZ DEFAULT now(),
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);

CREATE TABLE public.startup_candidates (
  id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id                      UUID NOT NULL REFERENCES public.funnels(id),
  stage_id                       UUID REFERENCES public.funnel_stages(id),
  result                         TEXT NOT NULL DEFAULT 'Em aberto'
                                 CHECK (result IN ('Em aberto','Ganha','Perdida','Acompanhar futuramente')),
  internal_owner_id              UUID REFERENCES auth.users,
  name                           TEXT NOT NULL,
  site                           TEXT,
  whatsapp                       TEXT,
  email                          TEXT,
  equity                         TEXT,
  vertical                       TEXT,
  phase                          TEXT
                                 CHECK (phase IN ('Ideação','Validação','Operação','Tração','Escala') OR phase IS NULL),
  score                          NUMERIC(4,1),
  captable                       TEXT,
  mrr                            NUMERIC(15,2),
  customers                      TEXT,
  team                           TEXT,
  what_seeks                     TEXT,
  general_note                   TEXT,
  reminder_note                  TEXT,
  history_evolution              TEXT,
  pitch_deck_url                 TEXT,
  next_action                    TEXT,
  last_update_at                 TIMESTAMPTZ DEFAULT now(),
  converted_portfolio_startup_id UUID REFERENCES public.portfolio_startups(id),
  import_note                    TEXT,
  created_at                     TIMESTAMPTZ DEFAULT now(),
  updated_at                     TIMESTAMPTZ DEFAULT now(),
  created_by                     UUID REFERENCES auth.users,
  updated_by                     UUID REFERENCES auth.users
);

-- Close the circular FK: portfolio_startups → startup_candidates
ALTER TABLE public.portfolio_startups
  ADD CONSTRAINT fk_source_candidate
  FOREIGN KEY (source_candidate_id) REFERENCES public.startup_candidates(id);

CREATE TABLE public.qualitative_assessments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id) ON DELETE CASCADE,
  recommendation       TEXT CHECK (recommendation IN ('Investor Day','Potencial','Não avançar')),
  criteria_signals     JSONB NOT NULL DEFAULT '{}',
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);

CREATE TABLE public.panel_evaluation_forms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id  UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  criteria   JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

CREATE TABLE public.panel_evaluations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id) ON DELETE CASCADE,
  form_id              UUID REFERENCES public.panel_evaluation_forms(id),
  evaluator_name       TEXT,
  evaluator_email      TEXT,
  evaluation_date      DATE,
  final_score          NUMERIC(4,1) CHECK (final_score BETWEEN 0 AND 10),
  approved             BOOLEAN,
  general_comments     TEXT,
  criteria_scores      JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);

CREATE TABLE public.crm_activities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL,
  date                 TIMESTAMPTZ NOT NULL,
  responsible_id       UUID REFERENCES auth.users,
  status               TEXT NOT NULL DEFAULT 'Pendente'
                       CHECK (status IN ('Pendente','Agendada','Concluída','Reagendada','Cancelada')),
  note                 TEXT,
  external_link        TEXT,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);

-- ============================================================
-- SECTION 3: Portfolio Module
-- ============================================================

CREATE TABLE public.operational_assessments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  quarter        TEXT NOT NULL,
  responsible_id UUID REFERENCES auth.users,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users,
  UNIQUE (startup_id, quarter)
);

CREATE TABLE public.assessment_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id       UUID NOT NULL REFERENCES public.operational_assessments(id) ON DELETE CASCADE,
  category            TEXT NOT NULL
                      CHECK (category IN ('Estratégia','Produto','Distribuição','Mercado','Operação','Founder')),
  signal              TEXT NOT NULL
                      CHECK (signal IN ('🔴','🟠','🟡','🟢')),
  observed_evidence   TEXT,
  risk_interpretation TEXT,
  next_focus          TEXT,
  responsible         TEXT,
  deadline            DATE,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assessment_id, category)
);

CREATE TABLE public.assessment_criteria (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category           TEXT NOT NULL,
  criterion          TEXT NOT NULL,
  what_to_observe    TEXT,
  red_description    TEXT,
  orange_description TEXT,
  yellow_description TEXT,
  green_description  TEXT,
  suggested_evidence TEXT,
  UNIQUE (category, criterion)
);

CREATE TABLE public.okrs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  quarter     TEXT NOT NULL,
  objective   TEXT NOT NULL,
  key_results JSONB NOT NULL DEFAULT '[]',
  owner_id    UUID REFERENCES auth.users,
  status      TEXT NOT NULL DEFAULT 'Em andamento'
              CHECK (status IN ('Em andamento','Em atenção','Travado','Concluído','Cancelado','Não alcançado')),
  progress    NUMERIC(5,2) DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_by  UUID REFERENCES auth.users,
  updated_by  UUID REFERENCES auth.users
);

CREATE TABLE public.metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  quarter        TEXT NOT NULL,
  type           TEXT NOT NULL
                 CHECK (type IN ('MRR','Clientes ativos','Novos clientes','Leads qualificados',
                                 'Taxa de conversão','Churn Rate','CAC','LTV','LTV/CAC',
                                 'Burn Rate','Runway')),
  current_value  NUMERIC(20,4),
  previous_value NUMERIC(20,4),
  period         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users,
  UNIQUE (startup_id, quarter, type)
);

CREATE TABLE public.action_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  okr_id      UUID REFERENCES public.okrs(id) ON DELETE SET NULL,
  quarter     TEXT NOT NULL,
  title       TEXT NOT NULL,
  initiatives JSONB NOT NULL DEFAULT '[]',
  owner_id    UUID REFERENCES auth.users,
  status      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_by  UUID REFERENCES auth.users,
  updated_by  UUID REFERENCES auth.users
);

CREATE TABLE public.kanban_tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  quarter        TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  phase          TEXT NOT NULL DEFAULT 'Backlog'
                 CHECK (phase IN ('Backlog','A fazer','Em andamento','Aguardando/Bloqueado','Em revisão','Concluído')),
  responsible_id UUID REFERENCES auth.users,
  due_date       DATE,
  comments       TEXT,
  links          JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);

CREATE TABLE public.rituals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  participants  JSONB NOT NULL DEFAULT '[]',
  notes         TEXT,
  external_link TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_by    UUID REFERENCES auth.users,
  updated_by    UUID REFERENCES auth.users
);

CREATE TABLE public.documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  kanban_task_id UUID REFERENCES public.kanban_tasks(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  type           TEXT,
  url            TEXT,
  storage_path   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);

CREATE TABLE public.portfolio_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  channel        TEXT,
  date           TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Pendente'
                 CHECK (status IN ('Pendente','Agendada','Concluída','Reagendada','Cancelada')),
  responsible_id UUID REFERENCES auth.users,
  participants   JSONB NOT NULL DEFAULT '[]',
  notes          TEXT,
  external_link  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);

-- ============================================================
-- SECTION 4: AI Module
-- ============================================================

CREATE TABLE public.ai_jobs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id),
  requester_id   UUID REFERENCES auth.users,
  status         TEXT NOT NULL DEFAULT 'Pendente'
                 CHECK (status IN ('Pendente','Processando','Concluído','Erro','Cancelado')),
  model          TEXT,
  prompt_version TEXT,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);

CREATE TABLE public.context_versions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id          UUID NOT NULL REFERENCES public.portfolio_startups(id) ON DELETE CASCADE,
  ai_job_id           UUID REFERENCES public.ai_jobs(id) ON DELETE SET NULL,
  content             TEXT NOT NULL,
  generated_at        TIMESTAMPTZ DEFAULT now(),
  model               TEXT,
  prompt_version      TEXT,
  was_manually_edited BOOLEAN NOT NULL DEFAULT FALSE,
  last_edited_at      TIMESTAMPTZ,
  last_edited_by      UUID REFERENCES auth.users
);

-- ============================================================
-- SECTION 5: Indexes
-- ============================================================

-- CRM
CREATE INDEX idx_startup_candidates_funnel  ON public.startup_candidates(funnel_id);
CREATE INDEX idx_startup_candidates_stage   ON public.startup_candidates(stage_id);
CREATE INDEX idx_startup_candidates_result  ON public.startup_candidates(result);
CREATE INDEX idx_crm_activities_candidate   ON public.crm_activities(startup_candidate_id);
CREATE INDEX idx_crm_activities_status_date ON public.crm_activities(status, date);

-- Portfolio
CREATE INDEX idx_kanban_tasks_startup_quarter ON public.kanban_tasks(startup_id, quarter);
CREATE INDEX idx_kanban_tasks_responsible     ON public.kanban_tasks(responsible_id);
CREATE INDEX idx_okrs_startup_quarter         ON public.okrs(startup_id, quarter);
CREATE INDEX idx_metrics_startup_quarter      ON public.metrics(startup_id, quarter);
CREATE INDEX idx_portfolio_activities_resp    ON public.portfolio_activities(responsible_id);

-- AI
CREATE INDEX idx_ai_jobs_status          ON public.ai_jobs(status);
CREATE INDEX idx_ai_jobs_startup         ON public.ai_jobs(startup_id);
CREATE INDEX idx_context_versions_startup ON public.context_versions(startup_id, generated_at DESC);
