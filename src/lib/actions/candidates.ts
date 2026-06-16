'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

// ─── Schemas ──────────────────────────────────────────────────

const CandidateCreateSchema = z.object({
  funnel_id: z.string().uuid(),
  stage_id: z.string().uuid().optional(),
  result: z.enum(['Em aberto', 'Ganha', 'Perdida', 'Acompanhar futuramente']).optional(),
  internal_owner_id: z.string().uuid().optional(),
  name: z.string().min(1),
  site: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  equity: z.string().optional(),
  vertical: z.string().optional(),
  phase: z.enum(['Ideação', 'Validação', 'Operação', 'Tração', 'Escala']).optional(),
  score: z.number().optional(),
  captable: z.string().optional(),
  mrr: z.number().optional(),
  customers: z.string().optional(),
  team: z.string().optional(),
  what_seeks: z.string().optional(),
  general_note: z.string().optional(),
  reminder_note: z.string().optional(),
  history_evolution: z.string().optional(),
  pitch_deck_url: z.string().optional(),
  next_action: z.string().optional(),
  import_note: z.string().optional(),
  extra_fields: z.record(z.string(), z.string()).optional(),
  contact_name: z.string().optional(),
})

const CandidateUpdateSchema = CandidateCreateSchema.omit({ funnel_id: true, contact_name: true }).partial()

const ActivityCreateSchema = z.object({
  startup_candidate_id: z.string().uuid(),
  type: z.string().min(1),
  date: z.string(),
  title: z.string().optional(),
  responsible_id: z.string().uuid().optional(),
  status: z
    .enum(['Pendente', 'Agendada', 'Concluída', 'Reagendada', 'Cancelada'])
    .optional(),
  note: z.string().optional(),
  external_link: z.string().optional(),
})

const ActivityUpdateSchema = ActivityCreateSchema.omit({ startup_candidate_id: true }).partial()

const QualitativeAssessmentSchema = z.object({
  recommendation: z.enum(['Investor Day', 'Potencial', 'Não avançar']).optional(),
  criteria_signals: z.record(z.string(), z.string()),
  notes: z.string().optional(),
})

const PanelEvaluationCreateSchema = z.object({
  startup_candidate_id: z.string().uuid(),
  form_id: z.string().uuid().optional(),
  evaluator_name: z.string().optional(),
  evaluator_email: z.string().optional(),
  evaluation_date: z.string().optional(),
  final_score: z.number().min(0).max(10).optional(),
  approved: z.boolean().optional(),
  general_comments: z.string().optional(),
  criteria_scores: z.record(z.string(), z.number()).optional(),
})

const PanelEvaluationUpdateSchema = PanelEvaluationCreateSchema.omit({
  startup_candidate_id: true,
}).partial()

// ─── createCandidate ──────────────────────────────────────────

export async function createCandidate(
  data: z.infer<typeof CandidateCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = CandidateCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  // Create contact record if a contact name is provided
  let primaryContactId: string | undefined
  const { contact_name, ...candidateFields } = parsed.data
  if (contact_name?.trim()) {
    const { data: contact } = await supabase
      .from('contacts')
      .insert({
        name:       contact_name.trim(),
        whatsapp:   candidateFields.whatsapp?.trim() || null,
        email:      candidateFields.email?.trim() || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single()
    if (contact) primaryContactId = contact.id
  }

  const { data: candidate, error } = await supabase
    .from('startup_candidates')
    .insert({
      ...candidateFields,
      primary_contact_id: primaryContactId ?? null,
      extra_fields: (candidateFields.extra_fields ?? {}) as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !candidate) return { error: error?.message ?? 'Erro ao criar candidata.' }
  return { id: candidate.id }
}

// ─── updateCandidate ──────────────────────────────────────────

export async function updateCandidate(
  id: string,
  data: z.infer<typeof CandidateUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = CandidateUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('startup_candidates')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      last_update_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

// ─── moveStage ────────────────────────────────────────────────

export async function moveStage(
  candidateId: string,
  stageId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('startup_candidates')
    .update({ stage_id: stageId, last_update_at: now, updated_at: now, updated_by: user.id })
    .eq('id', candidateId)

  if (error) return { error: error.message }
  return {}
}

// ─── setResult ────────────────────────────────────────────────

export async function setResult(
  candidateId: string,
  result: 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('startup_candidates')
    .update({ result, last_update_at: now, updated_at: now, updated_by: user.id })
    .eq('id', candidateId)

  if (error) return { error: error.message }
  return {}
}

// ─── createActivity ───────────────────────────────────────────

export async function createActivity(
  data: z.infer<typeof ActivityCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = ActivityCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: activity, error } = await supabase
    .from('crm_activities')
    .insert({
      ...parsed.data,
      responsible_id: parsed.data.responsible_id ?? user.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !activity) return { error: error?.message ?? 'Erro ao criar atividade.' }
  return { id: activity.id }
}

// ─── updateActivity ───────────────────────────────────────────

export async function updateActivity(
  id: string,
  data: z.infer<typeof ActivityUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = ActivityUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('crm_activities')
    .update({ ...parsed.data, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

// ─── saveQualitativeAssessment (UPSERT) ───────────────────────
// One assessment per candidate — check and UPDATE if exists, INSERT if not.

export async function saveQualitativeAssessment(
  candidateId: string,
  data: z.infer<typeof QualitativeAssessmentSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = QualitativeAssessmentSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: existing } = await supabase
    .from('qualitative_assessments')
    .select('id')
    .eq('startup_candidate_id', candidateId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('qualitative_assessments')
      .update({
        recommendation: parsed.data.recommendation,
        criteria_signals: parsed.data.criteria_signals as unknown as Json,
        notes: parsed.data.notes,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', existing.id)

    if (error) return { error: error.message }
    return { id: existing.id }
  }

  const { data: inserted, error } = await supabase
    .from('qualitative_assessments')
    .insert({
      startup_candidate_id: candidateId,
      recommendation: parsed.data.recommendation,
      criteria_signals: parsed.data.criteria_signals as unknown as Json,
      notes: parsed.data.notes,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !inserted) return { error: error?.message ?? 'Erro ao salvar avaliação.' }
  return { id: inserted.id }
}

// ─── savePanelEvaluation ──────────────────────────────────────

export async function savePanelEvaluation(
  data: z.infer<typeof PanelEvaluationCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = PanelEvaluationCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: evaluation, error } = await supabase
    .from('panel_evaluations')
    .insert({
      ...parsed.data,
      criteria_scores: (parsed.data.criteria_scores ?? {}) as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !evaluation) return { error: error?.message ?? 'Erro ao salvar avaliação de banca.' }
  return { id: evaluation.id }
}

// ─── convertToPortfolio (US3) ────────────────────────────────

export async function convertToPortfolio(
  candidateId: string
): Promise<{ portfolioStartupId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: candidate } = await supabase
    .from('startup_candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (!candidate) return { error: 'Candidata não encontrada.' }
  if (candidate.result !== 'Ganha') {
    return { error: 'Somente candidatas com resultado "Ganha" podem ser convertidas.' }
  }
  if (candidate.converted_portfolio_startup_id) {
    return { error: 'Candidata já foi convertida em startup de portfólio.' }
  }

  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolio_startups')
    .insert({
      name: candidate.name,
      site: candidate.site ?? null,
      vertical: candidate.vertical ?? null,
      stage: candidate.phase ?? null,
      short_description: candidate.general_note ?? null,
      captable_summary: candidate.captable ?? null,
      source_candidate_id: candidateId,
      founders: [] as unknown as Json,
      entry_date: new Date().toISOString().split('T')[0],
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (portfolioError || !portfolio) {
    return { error: portfolioError?.message ?? 'Erro ao criar startup no portfólio.' }
  }

  const { error: updateError } = await supabase
    .from('startup_candidates')
    .update({
      converted_portfolio_startup_id: portfolio.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', candidateId)

  if (updateError) {
    await supabase.from('portfolio_startups').delete().eq('id', portfolio.id)
    return { error: updateError.message }
  }

  return { portfolioStartupId: portfolio.id }
}

// ─── updatePanelEvaluation ────────────────────────────────────

export async function updatePanelEvaluation(
  id: string,
  data: z.infer<typeof PanelEvaluationUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = PanelEvaluationUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('panel_evaluations')
    .update({
      ...parsed.data,
      criteria_scores: parsed.data.criteria_scores !== undefined
        ? (parsed.data.criteria_scores as unknown as Json)
        : undefined,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}
