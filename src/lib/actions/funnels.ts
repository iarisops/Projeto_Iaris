'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ─── Default stages (data-model.md) ──────────────────────────

const DEFAULT_STAGES = [
  { name: 'Avaliação', position: 1, is_default: true, is_final: false },
  { name: '1ª Reunião', position: 2, is_default: false, is_final: false },
  { name: '2ª Reunião', position: 3, is_default: false, is_final: false },
  { name: 'Contrato/MoU enviado', position: 4, is_default: false, is_final: false },
  { name: 'Startup avaliando', position: 5, is_default: false, is_final: false },
  { name: 'Investor Day', position: 6, is_default: false, is_final: false },
  { name: 'Pós-Investor Day', position: 7, is_default: false, is_final: false },
  { name: 'Entrada no Portfólio', position: 8, is_default: false, is_final: true },
]

// ─── Schemas ──────────────────────────────────────────────────

const CreateFunnelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  edition: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

const UpdateFunnelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  edition: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['Ativo', 'Encerrado', 'Arquivado']).optional(),
})

const CreateStageSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().positive(),
  is_default: z.boolean().optional(),
  is_final: z.boolean().optional(),
})

const ReorderStagesSchema = z.array(
  z.object({
    id: z.string().uuid(),
    position: z.number().int().positive(),
  })
)

const PanelCriterionSchema = z.object({
  label: z.string().min(1),
  type: z.enum(['numeric', 'boolean', 'text']),
  max_score: z.number().optional(),
})

const CreatePanelFormSchema = z.object({
  name: z.string().min(1),
  criteria: z.array(PanelCriterionSchema),
})

const UpdatePanelFormSchema = z.object({
  name: z.string().min(1).optional(),
  criteria: z.array(PanelCriterionSchema).optional(),
})

// ─── createFunnel ─────────────────────────────────────────────

export async function createFunnel(
  data: z.infer<typeof CreateFunnelSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = CreateFunnelSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: funnel, error: funnelError } = await supabase
    .from('funnels')
    .insert({ ...parsed.data, created_by: user.id, updated_by: user.id })
    .select('id')
    .single()

  if (funnelError || !funnel) return { error: funnelError?.message ?? 'Erro ao criar funil.' }

  const stages = DEFAULT_STAGES.map((s) => ({ funnel_id: funnel.id, ...s }))
  const { error: stagesError } = await supabase.from('funnel_stages').insert(stages)
  if (stagesError) return { error: stagesError.message }

  return { id: funnel.id }
}

// ─── updateFunnel ─────────────────────────────────────────────

export async function updateFunnel(
  id: string,
  data: z.infer<typeof UpdateFunnelSchema>
): Promise<{ error?: string }> {
  const parsed = UpdateFunnelSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('funnels')
    .update({ ...parsed.data, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

// ─── archiveFunnel ────────────────────────────────────────────

export async function archiveFunnel(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('funnels')
    .update({ status: 'Arquivado', updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

// ─── createStage ─────────────────────────────────────────────

export async function createStage(
  funnelId: string,
  data: z.infer<typeof CreateStageSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = CreateStageSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: stage, error } = await supabase
    .from('funnel_stages')
    .insert({
      funnel_id: funnelId,
      name: parsed.data.name,
      position: parsed.data.position,
      is_default: parsed.data.is_default ?? false,
      is_final: parsed.data.is_final ?? false,
    })
    .select('id')
    .single()

  if (error || !stage) return { error: error?.message ?? 'Erro ao criar etapa.' }
  return { id: stage.id }
}

// ─── reorderStages ────────────────────────────────────────────
// Two-pass update to avoid UNIQUE (funnel_id, position) conflicts.
// Pass 1 sets positions to unique negative values, pass 2 sets finals.

export async function reorderStages(
  funnelId: string,
  stages: { id: string; position: number }[]
): Promise<{ error?: string }> {
  const parsed = ReorderStagesSchema.safeParse(stages)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  for (let i = 0; i < parsed.data.length; i++) {
    const { error } = await supabase
      .from('funnel_stages')
      .update({ position: -(i + 1) })
      .eq('id', parsed.data[i].id)
      .eq('funnel_id', funnelId)
    if (error) return { error: error.message }
  }

  for (const stage of parsed.data) {
    const { error } = await supabase
      .from('funnel_stages')
      .update({ position: stage.position })
      .eq('id', stage.id)
      .eq('funnel_id', funnelId)
    if (error) return { error: error.message }
  }

  return {}
}

// ─── archiveStage ─────────────────────────────────────────────

export async function archiveStage(stageId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('funnel_stages')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', stageId)

  if (error) return { error: error.message }
  return {}
}

// ─── T019a: Panel Evaluation Form templates ───────────────────

export async function createPanelEvaluationForm(
  funnelId: string,
  data: z.infer<typeof CreatePanelFormSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = CreatePanelFormSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: form, error } = await supabase
    .from('panel_evaluation_forms')
    .insert({
      funnel_id: funnelId,
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !form) return { error: error?.message ?? 'Erro ao criar formulário.' }
  return { id: form.id }
}

export async function updatePanelEvaluationForm(
  id: string,
  data: z.infer<typeof UpdatePanelFormSchema>
): Promise<{ error?: string }> {
  const parsed = UpdatePanelFormSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('panel_evaluation_forms')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function duplicatePanelEvaluationForm(
  id: string,
  targetFunnelId: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: source, error: fetchError } = await supabase
    .from('panel_evaluation_forms')
    .select('name, criteria')
    .eq('id', id)
    .single()

  if (fetchError || !source) return { error: fetchError?.message ?? 'Formulário não encontrado.' }

  const { data: copy, error: insertError } = await supabase
    .from('panel_evaluation_forms')
    .insert({
      funnel_id: targetFunnelId,
      name: source.name,
      criteria: source.criteria,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !copy) return { error: insertError?.message ?? 'Erro ao duplicar formulário.' }
  return { id: copy.id }
}
