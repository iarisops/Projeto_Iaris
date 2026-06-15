# Data Model: IARIS Portfolio OS — MVP Completo

**Phase**: 1 | **Date**: 2026-06-14 | **Plan**: [plan.md](plan.md)

Esquema Postgres completo via Supabase. Todas as tabelas têm RLS habilitado.
Convenção de nomes: `snake_case`. UUIDs gerados pelo banco (`gen_random_uuid()`).
Campos de auditoria: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ`,
`created_by UUID REFERENCES auth.users`, `updated_by UUID REFERENCES auth.users`.

---

## Extensão de Perfil de Usuário

```sql
-- Estende auth.users do Supabase
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## Módulo CRM

### funnels

```sql
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
```

### funnel_stages

```sql
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
```

Etapas padrão semeadas ao criar funil:
`Avaliação → 1ª Reunião → 2ª Reunião → Contrato/MoU enviado → Startup avaliando →
Investor Day → Pós-Investor Day → Entrada no Portfólio`

### startup_candidates

```sql
CREATE TABLE public.startup_candidates (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id                   UUID NOT NULL REFERENCES public.funnels(id),
  stage_id                    UUID REFERENCES public.funnel_stages(id),
  -- result e stage_id são SEMPRE campos independentes (Constituição II)
  result                      TEXT NOT NULL DEFAULT 'Em aberto'
                              CHECK (result IN ('Em aberto','Ganha','Perdida',
                                               'Acompanhar futuramente')),
  internal_owner_id           UUID REFERENCES auth.users,
  name                        TEXT NOT NULL,
  site                        TEXT,
  whatsapp                    TEXT,
  email                       TEXT,
  equity                      TEXT,
  vertical                    TEXT,
  phase                       TEXT
                              CHECK (phase IN ('Ideação','Validação','Operação',
                                              'Tração','Escala') OR phase IS NULL),
  score                       NUMERIC(4,1),
  captable                    TEXT,
  mrr                         NUMERIC(15,2),
  customers                   TEXT,
  team                        TEXT,
  what_seeks                  TEXT,
  general_note                TEXT,
  reminder_note               TEXT,
  history_evolution           TEXT,
  pitch_deck_url              TEXT,
  next_action                 TEXT,
  last_update_at              TIMESTAMPTZ DEFAULT now(),
  converted_portfolio_startup_id UUID REFERENCES public.portfolio_startups(id),
  import_note                 TEXT,  -- preserva status original para 'Recusa' sem etapa
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now(),
  created_by                  UUID REFERENCES auth.users,
  updated_by                  UUID REFERENCES auth.users
);
```

### qualitative_assessments (avaliação IARIS de candidatas — CRM)

```sql
CREATE TABLE public.qualitative_assessments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id)
                       ON DELETE CASCADE,
  recommendation       TEXT CHECK (recommendation IN
                       ('Investor Day','Potencial','Não avançar')),
  -- criteria_signals: { "Founder / Time": "verde", "Produto": "amarelo", ... }
  criteria_signals     JSONB NOT NULL DEFAULT '{}',
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);
```

Sinais válidos por critério (CRM): `'verde'`, `'amarelo'`, `'vermelho'`.

Critérios fixos do CRM (PRD §14.2):
`Founder / Time`, `Clareza do problema`, `Produto`, `Distribuição / GTM`,
`Tração`, `Mercado`, `Diferencial`, `Modelo de negócio`, `Investimento`,
`Governança / Organização`

### panel_evaluation_forms

```sql
CREATE TABLE public.panel_evaluation_forms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id  UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  -- criteria: [{ "key": "atratividade", "label": "Atratividade", "weight": 1 }, ...]
  criteria   JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users
);
```

### panel_evaluations

```sql
CREATE TABLE public.panel_evaluations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id)
                       ON DELETE CASCADE,
  form_id              UUID REFERENCES public.panel_evaluation_forms(id),
  evaluator_name       TEXT,
  evaluator_email      TEXT,
  evaluation_date      DATE,
  final_score          NUMERIC(4,1) CHECK (final_score BETWEEN 0 AND 10),
  approved             BOOLEAN,
  general_comments     TEXT,
  -- criteria_scores: { "atratividade": 8.5, "inovacao": 9, ... }
  criteria_scores      JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);
```

### crm_activities

```sql
CREATE TABLE public.crm_activities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_candidate_id UUID NOT NULL REFERENCES public.startup_candidates(id)
                       ON DELETE CASCADE,
  type                 TEXT NOT NULL,
  date                 TIMESTAMPTZ NOT NULL,
  responsible_id       UUID REFERENCES auth.users,
  status               TEXT NOT NULL DEFAULT 'Pendente'
                       CHECK (status IN ('Pendente','Agendada','Concluída',
                                        'Reagendada','Cancelada')),
  note                 TEXT,
  external_link        TEXT,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  created_by           UUID REFERENCES auth.users,
  updated_by           UUID REFERENCES auth.users
);
-- Atraso calculado no cliente/server: date < now() AND status NOT IN ('Concluída','Cancelada')
```

---

## Módulo Portfólio

### portfolio_startups

```sql
CREATE TABLE public.portfolio_startups (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_candidate_id    UUID REFERENCES public.startup_candidates(id),
  name                   TEXT NOT NULL,
  logo_url               TEXT,
  site                   TEXT,
  linkedin               TEXT,
  entry_date             DATE,
  short_description      TEXT,
  segment                TEXT,
  vertical               TEXT,
  problem                TEXT,
  solution               TEXT,
  icp                    TEXT,
  business_model         TEXT,
  revenue_model          TEXT,
  stage                  TEXT CHECK (stage IN
                         ('Ideação','Validação','Operação','Tração','Escala')),
  -- founders: [{ name, role, email, whatsapp, linkedin, dedication }]
  founders               JSONB NOT NULL DEFAULT '[]',
  funding_round          TEXT,
  funding_target         NUMERIC(15,2),
  valuation_instrument   TEXT,
  captable_summary       TEXT,
  iaris_stake            NUMERIC(5,2),
  funding_use            TEXT,
  tier                   SMALLINT CHECK (tier BETWEEN 0 AND 3),
  journey_status         TEXT,
  engagement             TEXT,
  last_update_at         TIMESTAMPTZ DEFAULT now(),
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  created_by             UUID REFERENCES auth.users,
  updated_by             UUID REFERENCES auth.users
);
```

### operational_assessments

```sql
CREATE TABLE public.operational_assessments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id)
                 ON DELETE CASCADE,
  quarter        TEXT NOT NULL,  -- ex: 'Q2-2026'
  responsible_id UUID REFERENCES auth.users,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users,
  UNIQUE (startup_id, quarter)
);
```

### assessment_items

```sql
CREATE TABLE public.assessment_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id         UUID NOT NULL REFERENCES public.operational_assessments(id)
                        ON DELETE CASCADE,
  category              TEXT NOT NULL
                        CHECK (category IN ('Estratégia','Produto','Distribuição',
                                           'Mercado','Operação','Founder')),
  signal                TEXT NOT NULL
                        CHECK (signal IN ('🔴','🟠','🟡','🟢')),
  observed_evidence     TEXT,
  risk_interpretation   TEXT,
  next_focus            TEXT,
  responsible           TEXT,
  deadline              DATE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assessment_id, category)
);
```

### assessment_criteria (dados de referência — semeados, não editáveis via UI)

```sql
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
```

Populada pela migration `0002_seed_criteria.sql` com os 38 critérios da planilha
`Assessment-Evolucao-Startups-Iaris-v2.xlsm`, aba `Criterios-v2`.

### okrs

```sql
CREATE TABLE public.okrs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id   UUID NOT NULL REFERENCES public.portfolio_startups(id)
               ON DELETE CASCADE,
  quarter      TEXT NOT NULL,
  objective    TEXT NOT NULL,
  -- key_results: [{ text, progress (0-100), notes }]
  key_results  JSONB NOT NULL DEFAULT '[]',
  owner_id     UUID REFERENCES auth.users,
  status       TEXT NOT NULL DEFAULT 'Em andamento'
               CHECK (status IN ('Em andamento','Em atenção','Travado',
                                 'Concluído','Cancelado','Não alcançado')),
  progress     NUMERIC(5,2) DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  created_by   UUID REFERENCES auth.users,
  updated_by   UUID REFERENCES auth.users
);
```

### metrics

```sql
CREATE TABLE public.metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id)
                 ON DELETE CASCADE,
  quarter        TEXT NOT NULL,
  type           TEXT NOT NULL
                 CHECK (type IN ('MRR','Clientes ativos','Novos clientes',
                                 'Leads qualificados','Taxa de conversão',
                                 'Churn Rate','CAC','LTV','LTV/CAC',
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
```

### action_plans

```sql
CREATE TABLE public.action_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.portfolio_startups(id)
             ON DELETE CASCADE,
  okr_id     UUID REFERENCES public.okrs(id) ON DELETE SET NULL,
  quarter    TEXT NOT NULL,
  title      TEXT NOT NULL,
  -- initiatives: [{ text, owner, status, notes }]
  initiatives JSONB NOT NULL DEFAULT '[]',
  owner_id   UUID REFERENCES auth.users,
  status     TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users,
  updated_by UUID REFERENCES auth.users
);
```

### kanban_tasks

```sql
CREATE TABLE public.kanban_tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id)
                 ON DELETE CASCADE,
  quarter        TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  -- phase = status (Constituição V — sem campo de status separado)
  phase          TEXT NOT NULL DEFAULT 'Backlog'
                 CHECK (phase IN ('Backlog','A fazer','Em andamento',
                                  'Aguardando/Bloqueado','Em revisão','Concluído')),
  responsible_id UUID REFERENCES auth.users,
  due_date       DATE,
  comments       TEXT,
  -- links: [{ label, url }]
  links          JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);
```

### rituals

```sql
CREATE TABLE public.rituals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id    UUID NOT NULL REFERENCES public.portfolio_startups(id)
                ON DELETE CASCADE,
  type          TEXT NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  -- participants: [{ name, role }]
  participants  JSONB NOT NULL DEFAULT '[]',
  notes         TEXT,
  external_link TEXT,  -- ex: link Granola
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_by    UUID REFERENCES auth.users,
  updated_by    UUID REFERENCES auth.users
);
```

### documents

```sql
CREATE TABLE public.documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id       UUID NOT NULL REFERENCES public.portfolio_startups(id)
                   ON DELETE CASCADE,
  kanban_task_id   UUID REFERENCES public.kanban_tasks(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  type             TEXT,
  url              TEXT,  -- link externo OU gerado pelo Supabase Storage
  storage_path     TEXT,  -- caminho no bucket 'documents' (quando upload)
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  created_by       UUID REFERENCES auth.users,
  updated_by       UUID REFERENCES auth.users
);
```

### portfolio_activities

```sql
CREATE TABLE public.portfolio_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id)
                 ON DELETE CASCADE,
  type           TEXT NOT NULL,
  channel        TEXT,
  date           TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Pendente'
                 CHECK (status IN ('Pendente','Agendada','Concluída',
                                   'Reagendada','Cancelada')),
  responsible_id UUID REFERENCES auth.users,
  -- participants: [{ name, email }]
  participants   JSONB NOT NULL DEFAULT '[]',
  notes          TEXT,
  external_link  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  created_by     UUID REFERENCES auth.users,
  updated_by     UUID REFERENCES auth.users
);
```

---

## Módulo IA

### ai_jobs

```sql
CREATE TABLE public.ai_jobs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id     UUID NOT NULL REFERENCES public.portfolio_startups(id),
  requester_id   UUID REFERENCES auth.users,
  status         TEXT NOT NULL DEFAULT 'Pendente'
                 CHECK (status IN ('Pendente','Processando','Concluído',
                                   'Erro','Cancelado')),
  model          TEXT,
  prompt_version TEXT,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);
```

### context_versions

```sql
CREATE TABLE public.context_versions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id         UUID NOT NULL REFERENCES public.portfolio_startups(id)
                     ON DELETE CASCADE,
  ai_job_id          UUID REFERENCES public.ai_jobs(id) ON DELETE SET NULL,
  content            TEXT NOT NULL,
  generated_at       TIMESTAMPTZ DEFAULT now(),
  model              TEXT,
  prompt_version     TEXT,
  was_manually_edited BOOLEAN NOT NULL DEFAULT FALSE,
  last_edited_at     TIMESTAMPTZ,
  last_edited_by     UUID REFERENCES auth.users
);
```

---

## Índices relevantes

```sql
-- CRM
CREATE INDEX idx_startup_candidates_funnel  ON public.startup_candidates(funnel_id);
CREATE INDEX idx_startup_candidates_stage   ON public.startup_candidates(stage_id);
CREATE INDEX idx_startup_candidates_result  ON public.startup_candidates(result);
CREATE INDEX idx_crm_activities_candidate   ON public.crm_activities(startup_candidate_id);
CREATE INDEX idx_crm_activities_status_date ON public.crm_activities(status, date);

-- Portfólio
CREATE INDEX idx_kanban_tasks_startup_quarter ON public.kanban_tasks(startup_id, quarter);
CREATE INDEX idx_kanban_tasks_responsible     ON public.kanban_tasks(responsible_id);
CREATE INDEX idx_okrs_startup_quarter         ON public.okrs(startup_id, quarter);
CREATE INDEX idx_metrics_startup_quarter      ON public.metrics(startup_id, quarter);
CREATE INDEX idx_portfolio_activities_resp    ON public.portfolio_activities(responsible_id);

-- IA
CREATE INDEX idx_ai_jobs_status     ON public.ai_jobs(status);
CREATE INDEX idx_ai_jobs_startup    ON public.ai_jobs(startup_id);
CREATE INDEX idx_context_versions_startup ON public.context_versions(startup_id, generated_at DESC);
```

---

## Diagrama de relacionamentos (simplificado)

```
auth.users
  └── public.users (1:1)

funnels
  ├── funnel_stages (1:N)
  └── startup_candidates (1:N)
        ├── qualitative_assessments (1:1)
        ├── panel_evaluations (1:N)
        ├── crm_activities (1:N)
        └── portfolio_startups (FK converted_portfolio_startup_id)

portfolio_startups
  ├── operational_assessments (1:N por quarter)
  │     └── assessment_items (1:N, uma por categoria)
  ├── okrs (1:N)
  │     └── action_plans (1:N via okr_id)
  ├── metrics (1:N)
  ├── kanban_tasks (1:N)
  │     └── documents (N:1 via kanban_task_id)
  ├── rituals (1:N)
  ├── documents (1:N)
  ├── portfolio_activities (1:N)
  ├── ai_jobs (1:N)
  └── context_versions (1:N)

assessment_criteria (dados de referência, sem FK com assessment_items)
```
