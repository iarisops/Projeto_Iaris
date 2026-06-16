# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**IARIS Portfolio OS** — internal operating system for IARIS Venture Builder to manage the full startup journey from origination (CRM / Investor Day) through portfolio operations.

Full product spec: `.llm/PRD.md`  
Design system & visual tokens: `.llm/DESIGN.md`

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + Vercel |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| AI (local) | Worker process + Ollama (runs separately, not on Vercel or Supabase Edge) |

## Development commands

> Commands below apply once the Next.js app is scaffolded inside this repo.

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

Supabase local dev (once configured):

```bash
npx supabase start        # start local Supabase stack
npx supabase db reset     # reset and re-run migrations
npx supabase gen types typescript --local > src/types/supabase.ts
```

Ollama worker (separate process, not part of the Next.js app):

```bash
# From the worker directory, once created
node worker.js            # polls Supabase for pending AI jobs, calls Ollama, writes results back
```

## Architecture

### Two main modules (strictly separated)

1. **CRM de Originação / Investor Day** — candidate startup pipeline per edition (Funil → Etapas → Startup Candidata → Conversão)
2. **Gestão Operacional do Portfólio** — operational tracking for portfolio startups (Página Operacional → Assessment → OKRs → Métricas → Plano de Ação → Kanban → Rituais → IA)

A candidate startup (`startup_candidates`) becomes a portfolio startup (`portfolio_startups`) **only** via an explicit "Converter em Startup do Portfólio" action. Never auto-create.

### AI / Context Summary architecture

Vercel creates a job row in Supabase (`ai_jobs` table, status = `Pendente`).  
A separate local worker polls for pending jobs, fetches startup data, calls Ollama, saves a new `context_versions` row, and sets the job to `Concluído`.  
The worker must handle the offline case — jobs persist and are processed when the worker comes back.  
The AI layer must be swappable (Ollama → OpenAI/Anthropic/etc.) without touching product logic.

### Key data relationships

```
funnel (Investor Day edition)
  └── funnel_stages
  └── startup_candidates
        ├── result (Em aberto / Ganha / Perdida / Acompanhar futuramente)  ← separate from stage
        ├── assessments (qualitative IARIS evaluation)
        ├── panel_evaluations (imported from spreadsheet / form)
        ├── activities / follow-ups
        └── → converted_to → portfolio_startups

portfolio_startups
  ├── profile (structural/registration data)
  ├── operational_page (working data, filtered by quarter)
  │     ├── assessments (quarterly)
  │     ├── okrs
  │     ├── metrics
  │     ├── action_plans
  │     ├── kanban_tasks
  │     ├── rituals / meetings
  │     ├── documents / evidence
  │     └── activities
  └── context_versions (AI-generated, async via ai_jobs)
```

### Stage vs. result (CRM)

These are **two separate fields** on `startup_candidates`. Stage = current funnel step. Result = outcome (Em aberto / Ganha / Perdida / Acompanhar futuramente). A startup can be Ganha or Perdida at any stage.

### Kanban task status

Tasks do not have a separate status field. Status = Kanban phase (`Backlog`, `A fazer`, `Em andamento`, `Aguardando/Bloqueado`, `Em revisão`, `Concluído`).

## Assets

Brand assets in `/assets/`:
- `Logo-IARIS-fundo escuro.png` / `Logo-IARIS.png`
- `pattern-IARIS.svg`, `pattern-listras.svg`
- `simbolo-IARIS-azul.svg`, `simbolo-IARIS-branco.svg`

## Data / imports

`/data/imports/crm/investor-day-4/` — source spreadsheet for the first data load (4º Investor Day).

Tabs to import: `Startups`, `Framework IARIS — Avaliação Qualitativa`, `Legenda - Avaliação`, `Respostas ao formulário`, `Base_Respostas`, `Análise qualitativa`, `Contato, quando aplicável`.  
Ignore: `Agenda-PitchDay`.

Status mapping rule (spreadsheet mixes stage and result in one column):
- `Contrato` → stage: `Contrato/MoU enviado`, result: `Em aberto`
- `Startup avaliando` → stage: `Startup avaliando`, result: `Em aberto`
- `2a Reunião` → stage: `2ª Reunião`, result: `Em aberto`
- `Avaliação` → stage: `Avaliação`, result: `Em aberto`
- `Recusa` → result: `Perdida` (preserve original status in import note if stage unknown)

## Design system (summary)

Full spec in `.llm/DESIGN.md`. Key tokens:

| Token | Value | Use |
|---|---|---|
| `--color-background` | `#f5f7fc` | Page background (light) |
| `--color-surface` | `#ffffff` | Cards, panels |
| `--color-surface-2` | `#eceef7` | Secondary surfaces, Kanban columns |
| `--color-border` | `#e2e8f4` | Borders, dividers |
| `--color-text-primary` | `#0d1226` | Headings |
| `--color-text-secondary` | `#4d5b7c` | Body text |
| `--color-text-muted` | `#8492b0` | Metadata |
| Primary action | Vibrant Teal `#009999` | Buttons, active states |
| Accent | Innovation Amber `#fbb33d` | Highlights |
| Brand nav | Deep Navy `#000033` | Sidebar background |
| Headline font | Hanken Grotesk | |
| Body font | Plus Jakarta Sans | |
| Label / code font | Geist | |

**Theme:** Light by default. The sidebar uses `.dark-surface` CSS class to stay in Deep Navy.  
Primary buttons: rectangular, 0px radius, Teal fill.  
Depth via tonal layering (border + bg tint), no shadows. 30px grid pattern using `#e2e8f4` lines.

## Implementation phases (from PRD §51)

1. **Fase 1** — Base: project setup, Supabase, auth, users, layout, navigation
2. **Fase 2** — CRM de Originação: funnels, stages, candidates, Kanban, evaluations, activities, spreadsheet import, conversion
3. **Fase 3** — Portfólio: profile, operational page, tiers, OKRs, metrics, action plan, Kanban, rituals, documents, activities
4. **Fase 4** — IA Local: `ai_jobs` table, `context_versions` table, "Atualizar Contexto" button, Ollama worker

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/001-iaris-portfolio-os-mvp/plan.md`

Key design artifacts:
- Data model: `specs/001-iaris-portfolio-os-mvp/data-model.md`
- Server Actions contract: `specs/001-iaris-portfolio-os-mvp/contracts/server-actions.md`
- Worker contract: `specs/001-iaris-portfolio-os-mvp/contracts/worker-contract.md`
- Validation guide: `specs/001-iaris-portfolio-os-mvp/quickstart.md`
- Technical decisions: `specs/001-iaris-portfolio-os-mvp/research.md`
<!-- SPECKIT END -->
