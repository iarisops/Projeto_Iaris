<!--
## Sync Impact Report

**Version Change**: 0.0.0 → 1.0.0

**Status**: Initial constitution — all content was placeholder tokens. This is the first concrete fill derived from `.llm/PRD.md`, `.llm/DESIGN.md`, and `CLAUDE.md`.

**Modified Principles**: N/A (new document — no prior principles existed)

**Added Sections**:
- Core Principles (5 principles)
- Data & Architecture Rules
- Development Workflow & Quality Gates
- Governance

**Removed Sections**: None (was entirely placeholder)

**Templates**:
- `.specify/templates/plan-template.md` — Constitution Check placeholder updated ✅
- `.specify/templates/spec-template.md` — No constitution-specific references required ✅
- `.specify/templates/tasks-template.md` — No constitution-specific references required ✅
- `.specify/templates/commands/` — No command files found; nothing to update ✅

**Deferred TODOs**: None — all placeholder tokens resolved.
-->

# IARIS Portfolio OS Constitution

## Core Principles

### I. Module Separation (NON-NEGOTIABLE)

The CRM de Originação and Gestão Operacional do Portfólio MUST be strictly separate modules
with no implicit data sharing between them. A `startup_candidate` MUST NOT become a
`portfolio_startup` automatically. The transition MUST happen only through the explicit user
action "Converter em Startup do Portfólio." Candidate data is copied (not moved) into the
Portfolio module at conversion time, and the original candidate record MUST be preserved with
its full CRM history intact. The link between `startup_candidates` and `portfolio_startups`
MUST be a foreign key, not a merge.

**Rationale**: Mixing candidate pipeline data with portfolio operational data erases historical
context, corrupts Investor Day edition metrics, and violates audit integrity. This boundary
is a core product invariant that MUST never be relaxed in the MVP.

### II. Data Integrity & Temporal Traceability (NON-NEGOTIABLE)

Every entity that records business state MUST persist: `created_at`, `updated_at`,
`created_by` (user id), and `updated_by` (user id). Entities with time-bounded scope
(assessments, OKRs, metrics, Kanban tasks, rituals, activities) MUST also store a
`quarter` or `reference_date` field.

Stage and result (desfecho) on `startup_candidates` are ALWAYS two separate fields.
Stage = current funnel step. Result = outcome (`Em aberto / Ganha / Perdida /
Acompanhar futuramente`). These MUST never be collapsed into a single column in the
database or UI. Any legacy data source that mixes them (e.g., the 4º Investor Day
spreadsheet) MUST be decomposed according to the import mapping rules in `CLAUDE.md`.

**Rationale**: The product's core value is replacing scattered tools (spreadsheets,
Notion, WhatsApp) with a single operational truth. Without strict temporal records and
field discipline, historical reconstruction and AI context generation are impossible.

### III. MVP Scope Discipline (NON-NEGOTIABLE)

Features outside the defined MVP scope MUST NOT be implemented, even partially.
The MVP scope is defined as Fase 1 (base), Fase 2 (CRM), Fase 3 (Portfólio), and
Fase 4 (IA Local) per `.llm/PRD.md §51`. Any feature listed under "Fora do Escopo
do MVP" (external access for startups/investors/evaluators, paid AI APIs, WhatsApp/email
sending, automatic integrations, autonomous agents, Focus Month/Sprint Planning features)
MUST be deferred entirely — not scaffolded, not partially wired.

When in doubt, prefer the simpler, more extensible solution. Complexity MUST be justified
against an immediate, concrete need — three similar lines of code is acceptable; a premature
abstraction is not.

**Rationale**: Scope creep is the primary delivery risk. The target is a functional internal
tool that replaces operational chaos — not a platform product.

### IV. AI Provider Agnosticism

The AI layer MUST be architecturally isolated behind a service abstraction in the worker
process. Swapping providers (Ollama → OpenAI/Anthropic/Gemini/OpenRouter) MUST require
changes only to the AI service adapter — zero changes to product logic, UI, Supabase schema,
or context history.

In the MVP, the AI worker MUST use a local/open-source model via Ollama running on a
local machine or cheap server. Vercel and Supabase Edge Functions MUST NOT host or call
local models. AI generation MUST be triggered manually via a button ("Atualizar Contexto"),
never automatically. Jobs MUST be persisted in the `ai_jobs` Supabase table with a
`Pendente` status and MUST survive worker downtime — the worker picks them up on restart.

**Rationale**: Avoiding per-token costs in the MVP while ensuring the architecture supports
paid providers in the future without incurring technical debt.

### V. Low-Friction Data Entry

Every data entry flow MUST minimize required fields and avoid duplicate entry.
Sensible defaults MUST be applied wherever context is already known:
- `responsible` on activities and tasks MUST default to the logged-in user.
- `startup` MUST default to the current page's startup when an entity is created in-context.
- Period-scoped views (Operational Page, Assessments, OKRs, Metrics, Action Plans, Kanban)
  MUST default to the current quarter.

The Kanban task status MUST equal the Kanban phase — there is no separate `status` field
on `kanban_tasks`. The phase column IS the status. Any feature that requires the user to
enter the same information twice is a violation of this principle.

**Rationale**: The product replaces high-friction tools. If it introduces new friction,
users will revert to spreadsheets and WhatsApp — defeating the entire purpose.

## Data & Architecture Rules

- **Kanban phase = task status.** No separate `status` field on `kanban_tasks`. The
  phase (`Backlog / A fazer / Em andamento / Aguardando/Bloqueado / Em revisão / Concluído`)
  is the single source of status truth.
- **Funnel edition isolation.** Each Investor Day edition owns its funnel, stages, candidates,
  evaluations, and metrics. Cross-edition aggregation is a future feature, not MVP.
- **No auto-sends.** The MVP MUST NOT send WhatsApp messages, emails, or any external
  communications. The WhatsApp button MUST open WhatsApp Web with the registered number
  and nothing more.
- **Supabase as single data store.** All persistent state lives in Supabase Postgres.
  No local-only state that is not written back to Supabase.
- **Design system compliance.** UI MUST follow `.llm/DESIGN.md`: Deep Navy `#000033`
  base, Vibrant Teal `#009999` primary actions, Innovation Amber `#fbb33d` accent,
  primary buttons 0px radius, depth via tonal layering (no shadows), 30px technical
  marker grid as background pattern.

## Development Workflow & Quality Gates

**Phased delivery order** (Fase 1 → 2 → 3 → 4) MUST be respected. No Fase 3 (Portfólio)
work begins before Fase 2 (CRM) is functionally complete. No Fase 4 (IA) work begins before
`ai_jobs` and `context_versions` table contracts are defined.

**Constitution Check (mandatory gate on every feature plan — run before Phase 0 research)**:

- [ ] Does this feature touch the CRM↔Portfolio boundary? → Verify Principle I: only explicit
  conversion action can cross it.
- [ ] Does this feature store new entities? → Verify Principle II: temporal fields
  (`created_at`, `updated_at`, `created_by`, `updated_by`) and period field present.
- [ ] Is any part of this feature listed in "Fora do Escopo do MVP"? → Block entirely (III).
- [ ] Does this feature involve AI generation or model calls? → Verify Principle IV:
  worker abstraction, job persistence, no direct Vercel/Edge calls to local models.
- [ ] Does this feature require data entry? → Verify Principle V: no duplicate fields,
  sensible defaults applied, Kanban phase = status.

**Stack constraints** (deviation requires amending this constitution):

| Layer | Constraint |
|---|---|
| Frontend | Next.js App Router on Vercel |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| AI worker | Local process + Ollama — NOT on Vercel or Supabase Edge |

## Governance

This constitution supersedes all other development guidelines for IARIS Portfolio OS.
When it conflicts with a template default or an external reference, this constitution wins.

**Amendment procedure**: Any change MUST increment the version number using the rules below,
update `LAST_AMENDED_DATE` to the amendment date, and trigger a consistency check across
all `.specify/templates/` files. Amendments require explicit agreement before merging.

**Versioning policy**:
- MAJOR: removal or redefinition of a principle; breaking governance change.
- MINOR: new principle or section added; materially expanded guidance.
- PATCH: wording clarification, typo fix, non-semantic refinement.

**Compliance review**: Every feature plan (`plan.md`) MUST include a Constitution Check
section validating all five gates above before Phase 0 research begins. Every PR MUST
be reviewed against the gates relevant to its feature.

**Runtime guidance**: See `CLAUDE.md` for development commands, stack summary, and
import rules. See `.llm/PRD.md` for full product spec and acceptance criteria. See
`.llm/DESIGN.md` for visual tokens and design system.

**Version**: 1.0.0 | **Ratified**: 2026-06-14 | **Last Amended**: 2026-06-14
