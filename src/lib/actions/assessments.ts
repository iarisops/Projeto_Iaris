'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = ['Estratégia', 'Produto', 'Distribuição', 'Mercado', 'Operação', 'Founder'] as const
const SIGNALS = ['🔴', '🟠', '🟡', '🟢'] as const

const AssessmentItemSchema = z.object({
  category: z.enum(CATEGORIES),
  signal: z.enum(SIGNALS),
  observed_evidence: z.string().optional(),
  risk_interpretation: z.string().optional(),
  next_focus: z.string().optional(),
  responsible: z.string().optional(),
  deadline: z.string().optional(),
})

export async function createAssessment(
  startupId: string,
  quarter: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: existing } = await supabase
    .from('operational_assessments')
    .select('id')
    .eq('startup_id', startupId)
    .eq('quarter', quarter)
    .maybeSingle()

  if (existing) return { id: existing.id }

  const { data: created, error } = await supabase
    .from('operational_assessments')
    .insert({
      startup_id: startupId,
      quarter,
      responsible_id: user.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !created) return { error: error?.message ?? 'Erro ao criar assessment.' }
  return { id: created.id }
}

export async function upsertAssessmentItem(
  assessmentId: string,
  data: z.infer<typeof AssessmentItemSchema>
): Promise<{ error?: string }> {
  const parsed = AssessmentItemSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('assessment_items')
    .upsert(
      { assessment_id: assessmentId, ...parsed.data, updated_at: new Date().toISOString() },
      { onConflict: 'assessment_id,category' }
    )

  if (error) return { error: error.message }
  return {}
}
