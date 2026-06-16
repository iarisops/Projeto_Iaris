# Server Actions Contract

**Date**: 2026-06-14 | **Plan**: [plan.md](../plan.md)

Todas as mutações do frontend usam Next.js Server Actions (`'use server'`).
Cada action valida inputs com Zod, acessa Supabase via `createServerClient()` e
retorna `{ data, error }` ou lança exceção capturada pelo Error Boundary.

---

## Autenticação & Usuários (`lib/actions/auth.ts`)

```typescript
login(email: string, password: string): Promise<void>
// POST para Supabase Auth; redireciona para / ou /primeiro-acesso se must_change_password

logout(): Promise<void>

changePasswordFirstAccess(password: string): Promise<void>
// Chama supabase.auth.updateUser({ password })
// Atualiza users.must_change_password = false

// Admin only
inviteUser(email: string, name: string, role: 'admin' | 'member'): Promise<{ userId: string }>
// Chama supabase.auth.admin.inviteUserByEmail()
// INSERT em public.users

deactivateUser(userId: string): Promise<void>
// supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })
// Marca inativo (sem DELETE para preservar auditoria)

resetUserPassword(userId: string): Promise<void>
// supabase.auth.admin.generateLink({ type: 'recovery', email })
// Reenvia e-mail de reset
```

---

## Funis (`lib/actions/funnels.ts`)

```typescript
createFunnel(data: {
  name: string; description?: string; edition?: string;
  start_date?: string; end_date?: string;
}): Promise<{ id: string }>

updateFunnel(id: string, data: Partial<FunnelData>): Promise<void>

archiveFunnel(id: string): Promise<void>
// status → 'Arquivado'

createStage(funnelId: string, data: {
  name: string; position: number; is_default?: boolean; is_final?: boolean;
}): Promise<{ id: string }>

reorderStages(funnelId: string, stages: { id: string; position: number }[]): Promise<void>

archiveStage(stageId: string): Promise<void>

// Formulários de avaliação de banca — template de critérios por funil
createPanelEvaluationForm(funnelId: string, data: {
  name: string;
  criteria: { label: string; type: 'numeric' | 'boolean' | 'text'; max_score?: number }[];
}): Promise<{ id: string }>

updatePanelEvaluationForm(id: string, data: Partial<PanelEvaluationFormData>): Promise<void>

duplicatePanelEvaluationForm(id: string, targetFunnelId: string): Promise<{ id: string }>
// Copia todos os critérios do formulário origem para o funil destino (nova edição)
```

---

## Candidatas (`lib/actions/candidates.ts`)

```typescript
createCandidate(data: StartupCandidateInput): Promise<{ id: string }>
// StartupCandidateInput: todos os campos de startup_candidates exceto auditoria e IDs gerados

updateCandidate(id: string, data: Partial<StartupCandidateInput>): Promise<void>

moveStage(candidateId: string, stageId: string): Promise<void>
// UPDATE stage_id; UPDATE last_update_at

setResult(candidateId: string, result: ResultEnum): Promise<void>
// UPDATE result; UPDATE last_update_at

convertToPortfolio(candidateId: string): Promise<{ portfolioStartupId: string }>
// Valida result === 'Ganha' e converted_portfolio_startup_id IS NULL
// INSERT portfolio_startups com dados migrados
// UPDATE startup_candidates SET converted_portfolio_startup_id, result = 'Ganha'
// Retorna portfolioStartupId

createActivity(data: CRMActivityInput): Promise<{ id: string }>
// responsible_id padrão = usuário logado

updateActivity(id: string, data: Partial<CRMActivityInput>): Promise<void>

saveQualitativeAssessment(candidateId: string, data: {
  recommendation: string; criteria_signals: Record<string, string>; notes?: string;
}): Promise<{ id: string }>
// UPSERT (uma avaliação IARIS por candidata)

savePanelEvaluation(data: PanelEvaluationInput): Promise<{ id: string }>

updatePanelEvaluation(id: string, data: Partial<PanelEvaluationInput>): Promise<void>
```

---

## Portfólio — Perfil (`lib/actions/portfolio.ts`)

```typescript
createPortfolioStartup(data: {
  name: string;
  site?: string;
  vertical?: string;
  stage?: 'Ideação' | 'Validação' | 'Operação' | 'Tração' | 'Escala';
  short_description?: string;
  entry_date?: string;
}): Promise<{ id?: string; error?: string }>
// Criação direta no portfólio sem passar pelo CRM (para startups já no portfólio)
// INSERT com founders: [] (required non-null field); retorna id da nova startup

updatePortfolioProfile(startupId: string, data: Partial<PortfolioProfileInput>): Promise<void>
// UPDATE portfolio_startups; UPDATE last_update_at

updateTierStatus(startupId: string, data: {
  tier?: number; journey_status?: string; engagement?: string;
}): Promise<void>
// UPDATE e dispara last_update_at

uploadLogo(startupId: string, file: File): Promise<{ url: string }>
// Upload para bucket 'logos'; UPDATE portfolio_startups.logo_url
```

---

## Assessments (`lib/actions/assessments.ts`)

```typescript
createAssessment(startupId: string, quarter: string): Promise<{ id: string }>
// INSERT operational_assessments; UPSERT padrão = quarter atual

upsertAssessmentItem(assessmentId: string, data: {
  category: CategoryEnum;
  signal: SignalEnum;
  observed_evidence?: string;
  risk_interpretation?: string;
  next_focus?: string;
  responsible?: string;
  deadline?: string;
}): Promise<void>
// UPSERT por (assessment_id, category)
// Dispara last_update_at na startup
```

---

## OKRs (`lib/actions/okrs.ts`)

```typescript
createOKR(startupId: string, data: OKRInput): Promise<{ id: string }>
// status padrão = 'Em andamento'; quarter padrão = currentQuarter()

updateOKR(id: string, data: Partial<OKRInput>): Promise<void>
// Dispara last_update_at na startup
```

---

## Métricas (`lib/actions/metrics.ts`)

```typescript
upsertMetric(startupId: string, quarter: string, data: {
  type: MetricType; current_value: number; previous_value?: number;
  period?: string; notes?: string;
}): Promise<void>
// UPSERT por (startup_id, quarter, type)
// Dispara last_update_at na startup
```

---

## Planos de Ação (`lib/actions/action-plans.ts`)

```typescript
createActionPlan(startupId: string, data: {
  okr_id?: string;
  initiatives: string;
  owner: string;
  status: 'Em andamento' | 'Concluído' | 'Cancelado';
  notes?: string;
  quarter: string;
}): Promise<{ id: string }>
// quarter obrigatório; derivar do OKR associado quando okr_id fornecido
// responsible_id padrão = usuário logado
// Dispara last_update_at na startup

updateActionPlan(id: string, data: Partial<ActionPlanInput>): Promise<void>
// Dispara last_update_at na startup

deleteActionPlan(id: string): Promise<void>
// Soft delete não implementado no MVP — DELETE direto; vincula-se a OKR, validar ausência de dependentes
```

---

## Kanban (`lib/actions/kanban.ts`)

```typescript
createTask(startupId: string, data: KanbanTaskInput): Promise<{ id: string }>
// phase padrão = 'Backlog'; quarter padrão = currentQuarter()
// responsible_id padrão = usuário logado
// Para tarefas IARIS: startupId = IARIS_STARTUP_ID, quarter = IARIS_QUARTER ('iaris')

updateTask(id: string, data: Partial<KanbanTaskInput>): Promise<void>
// description aceita HTML (gerado pelo RichTextEditor Tiptap)
// links: [{ label, url }]

deleteTask(taskId: string): Promise<{ error?: string }>
// DELETE direto; sem soft delete no MVP

moveTask(taskId: string, phase: PhaseEnum): Promise<void>
// UPDATE phase; Dispara last_update_at na startup
```

> As actions de Kanban são compartilhadas entre `PortfolioKanban`, `IariasKanban` e `MeuKanbanClient`.
> O Kanban interno IARIS usa `startupId = IARIS_STARTUP_ID` e `quarter = IARIS_QUARTER` (constantes
> em `src/lib/constants.ts`). Nenhuma action exclusiva foi necessária.

---

## Rituais (`lib/actions/rituals.ts`)

```typescript
createRitual(startupId: string, data: RitualInput): Promise<{ id: string }>

updateRitual(id: string, data: Partial<RitualInput>): Promise<void>
// Dispara last_update_at na startup (última/próxima reunião)
```

---

## Documentos (`lib/actions/documents.ts`)

```typescript
addDocument(startupId: string, data: {
  name: string; type?: string; url?: string;
  kanban_task_id?: string;
}): Promise<{ id: string }>

uploadDocument(startupId: string, file: File, metadata: {
  name: string; type?: string; kanban_task_id?: string;
}): Promise<{ id: string; url: string }>
// Upload para bucket 'documents'; INSERT em documents com storage_path
```

---

## Atividades de Portfólio (`lib/actions/activities.ts`)

```typescript
createPortfolioActivity(startupId: string, data: PortfolioActivityInput): Promise<{ id: string }>
// startup_id padrão = startup da página; responsible_id padrão = usuário logado

updatePortfolioActivity(id: string, data: Partial<PortfolioActivityInput>): Promise<void>
```

---

## IA / Contexto (`lib/actions/ai-jobs.ts`)

```typescript
requestContextUpdate(startupId: string): Promise<{ jobId: string }>
// INSERT ai_jobs com status 'Pendente'
// Valida que startup tem dados suficientes (portfolio_activities + okrs + metrics)

saveContextEdit(contextVersionId: string, content: string): Promise<void>
// INSERT nova context_versions com was_manually_edited = true
// Preserva versão anterior (não DELETE)
```

---

## Convenções

- Todas as actions checam autenticação via `createServerClient()` — sem exceptions,
  retornam erro 401 se sessão ausente.
- `must_change_password = true` → middleware redireciona para `/primeiro-acesso` antes
  de qualquer action.
- `role = 'admin'` é verificado nas actions de usuário (`inviteUser`, `deactivateUser`,
  `resetUserPassword`).
- `last_update_at` da startup é disparado por trigger Postgres (`update_startup_last_update`)
  nas tabelas: `assessment_items`, `okrs`, `metrics`, `action_plans`, `kanban_tasks`,
  `rituals`, `documents`, `portfolio_activities`, `context_versions`.
