# Implementation Plan: IARIS Portfolio OS — MVP Completo

**Branch**: `001-iaris-portfolio-os-mvp` | **Date**: 2026-06-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-iaris-portfolio-os-mvp/spec.md`

## Summary

Sistema operacional interno da IARIS para gestão de startups da originação (CRM / Investor
Day) ao portfólio operacional — implementado em Next.js 14 App Router no Vercel, com
Supabase (Postgres + Auth + Storage) como única fonte de dados e um worker Node.js local
para geração de Resumo de Contexto via Ollama.

As quatro fases do MVP (Base → CRM → Portfólio → IA) são implementadas sequencialmente.
Toda mutação de dados passa por Server Actions no servidor — nunca pelo cliente direto com
service role. O worker acessa o Supabase diretamente com service role via variável de
ambiente exclusiva para servidor.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS

**Primary Dependencies**:
- `next` 14+ (App Router, Server Actions, Server Components)
- `@supabase/supabase-js` v2 + `@supabase/ssr` (auth helpers para App Router)
- `tailwindcss` 3.x (design system tokens via CSS variables)
- `@hello-pangea/dnd` (Kanban drag-and-drop — fork mantido de react-beautiful-dnd)
- `next-mdx-remote` (Wiki de Metodologia — MDX estático no repositório)
- `zod` (validação de inputs em Server Actions)
- `date-fns` (cálculo de quarters, atraso de atividades)
- `exceljs` (import script — lê .xlsm sem depender de COM / Office)
- `nodemailer` (não necessário — invites via Supabase Auth Admin API)

**Worker (separado, não Vercel)**:
- `@supabase/supabase-js` v2 com `SUPABASE_SERVICE_ROLE_KEY`
- `node-fetch` ou `axios` para chamadas HTTP ao Ollama

**Storage**: Supabase Postgres (PostgREST + RLS) · Supabase Storage (documentos/logos)

**Testing**: Vitest (utils/actions unitários) · Playwright (fluxos E2E críticos)

**Target Platform**: Vercel (Next.js) + Supabase Cloud + máquina local (worker Ollama)

**Project Type**: Web application (Next.js App Router) + script CLI de importação + worker

**Performance Goals**: Preparação de reunião em <2 min (SC-002, qualitativo). Sem SLA
técnico formal — ferramenta interna com ~10 usuários.

**Constraints**:
- IA NUNCA executa no Vercel ou Supabase Edge — somente no worker local
- Supabase é o único armazenamento persistente; sem estado local não sincronizado
- Design system: fundo Deep Navy `#000033`, ação primária Teal `#009999`, botões 0px
  border-radius, profundidade via camadas tonais (sem sombras)
- Sessão expira após 7 dias de inatividade (Supabase Auth JWT)
- Sem MFA no MVP

**Scale/Scope**: ~10 usuários internos, ~50-100 startups no portfólio, centenas de
candidatas CRM, dados do 4º Investor Day como carga inicial.

## Constitution Check

*GATE: avaliado antes da Fase 0. Re-avaliado após design da Fase 1.*

- [x] **I. Module Separation** — O feature inclui a fronteira CRM↔Portfólio. A única
  ação que cruza é "Converter em Startup do Portfólio" (US3 / FR-018). A candidata
  original é preservada com vínculo FK. Candidatos não se tornam portfólio automaticamente.
  **PASSA.**

- [x] **II. Temporal Traceability** — Todas as entidades possuem `created_at`,
  `updated_at`, `created_by`, `updated_by`. Entidades com escopo temporal têm campo
  `quarter`. `stage_id` e `result` são campos separados em `startup_candidates`.
  **PASSA.**

- [x] **III. MVP Scope** — Verificados todos os itens de "Fora do Escopo": acesso externo
  (startups/investidores/avaliadores), APIs de IA pagas, envio de WhatsApp/e-mail,
  integrações automáticas, agentes autônomos, Focus Month/Sprint Planning como features
  próprias — nenhum item fora do escopo está presente. **PASSA.**

- [x] **IV. AI Agnosticism** — Worker abstrai o provedor em `providers/ollama.js`
  (trocável por OpenAI/Anthropic sem tocar em produto, UI ou histórico). Jobs persistem
  em `ai_jobs` com status `Pendente`; worker processa ao reiniciar. Nenhuma chamada de
  modelo no Vercel ou Edge. **PASSA.**

- [x] **V. Low-Friction Entry** — `responsible` padrão = usuário logado. `startup`
  padrão = startup da página atual. Filtro padrão = quarter atual. `phase` do Kanban
  = status da tarefa (sem campo separado). **PASSA.**

**Todos os gates aprovados. Nenhuma violação a registrar em Complexity Tracking.**

## Project Structure

### Documentation (this feature)

```text
specs/001-iaris-portfolio-os-mvp/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — esquema Postgres completo
├── quickstart.md        # Fase 1 — guia de validação
├── contracts/
│   ├── server-actions.md   # Contratos das Server Actions
│   ├── worker-contract.md  # Contrato worker ↔ Supabase
│   └── ollama-contract.md  # Contrato worker ↔ Ollama
└── tasks.md             # Fase 2 — gerado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── primeiro-acesso/page.tsx
│   ├── (admin)/
│   │   └── usuarios/
│   │       ├── page.tsx            # lista + criação de usuários (Admin only)
│   │       └── [id]/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # nav principal + guard de autenticação
│   │   ├── page.tsx                # dashboard: lista portfólio + tarefas + atividades
│   │   ├── meu-kanban/page.tsx     # Meu Kanban consolidado
│   │   ├── crm/
│   │   │   ├── page.tsx            # lista de funis
│   │   │   └── [funnel-id]/
│   │   │       ├── page.tsx        # kanban do funil
│   │   │       ├── candidatas/
│   │   │       │   └── [id]/page.tsx   # página da startup candidata
│   │   │       └── metricas/page.tsx
│   │   ├── portfolio/
│   │   │   └── [startup-id]/
│   │   │       ├── perfil/page.tsx
│   │   │       └── operacional/page.tsx
│   │   └── metodologia/
│   │       └── [...slug]/page.tsx  # MDX Wiki pages
│   └── api/                        # apenas para integração externa (worker opcional)
│       └── health/route.ts
├── components/
│   ├── ui/                         # primitivos do design system (Button, Card, Badge…)
│   ├── crm/                        # KanbanBoard, CandidateCard, ActivityForm…
│   └── portfolio/                  # OperationalPage, AssessmentForm, OKRCard…
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient()
│   │   ├── server.ts               # createServerClient() com cookies
│   │   └── admin.ts                # createAdminClient() — service role, server-only
│   ├── actions/                    # Server Actions por domínio
│   │   ├── auth.ts
│   │   ├── funnels.ts
│   │   ├── candidates.ts
│   │   ├── assessments.ts
│   │   ├── portfolio.ts
│   │   ├── okrs.ts
│   │   ├── metrics.ts
│   │   ├── kanban.ts
│   │   ├── rituals.ts
│   │   ├── documents.ts
│   │   ├── activities.ts
│   │   └── ai-jobs.ts
│   └── utils/
│       ├── quarter.ts              # currentQuarter(), quarterLabel(), isOverdue()
│       └── whatsapp.ts             # buildWhatsAppUrl()
├── content/
│   └── metodologia/                # arquivos MDX da Wiki
│       ├── index.mdx
│       └── assessment.mdx
└── types/
    └── supabase.ts                 # gerado por supabase gen types typescript

worker/
├── index.js                        # polling loop: Supabase → Ollama → Supabase
├── context-builder.js              # buildStartupContext(supabase, startupId, quarter)
├── prompt-template.js              # buildPrompt(context): string — PROMPT_VERSION = "v1"
├── package.json                    # deps separados: @supabase/supabase-js, node-fetch, dotenv
├── .env.example                    # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OLLAMA_*
└── providers/
    └── ollama.js                   # adapter trocável: fetchCompletion(prompt)

scripts/
└── import-investor-day-4.ts        # CLI one-shot: lê .xlsm → insere no Supabase

supabase/
└── migrations/
    ├── 0001_initial_schema.sql     # todas as tabelas + enums
    ├── 0002_seed_criteria.sql      # dados de referência do Critério-v2
    └── 0003_rls_policies.sql       # Row Level Security (usuários autenticados)
```

## Complexity Tracking

Nenhuma violação de constituição identificada. Seção não aplicável.
