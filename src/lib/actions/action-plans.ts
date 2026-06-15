'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

const InitiativeSchema = z.object({
  text: z.string(),
  owner: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

const ActionPlanCreateSchema = z.object({
  okr_id: z.string().uuid().optional(),
  title: z.string().min(1),
  initiatives: z.array(InitiativeSchema).optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  quarter: z.string().min(1),
})

const ActionPlanUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  initiatives: z.array(InitiativeSchema).optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export async function createActionPlan(
  startupId: string,
  data: z.infer<typeof ActionPlanCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = ActionPlanCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { initiatives, ...rest } = parsed.data
  const { data: plan, error } = await supabase
    .from('action_plans')
    .insert({
      ...rest,
      startup_id: startupId,
      initiatives: (initiatives ?? []) as unknown as Json,
      owner_id: user.id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !plan) return { error: error?.message ?? 'Erro ao criar plano de ação.' }
  return { id: plan.id }
}

export async function updateActionPlan(
  id: string,
  data: z.infer<typeof ActionPlanUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = ActionPlanUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { initiatives, ...rest } = parsed.data
  const { error } = await supabase
    .from('action_plans')
    .update({
      ...rest,
      ...(initiatives !== undefined ? { initiatives: initiatives as unknown as Json } : {}),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteActionPlan(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('action_plans').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}
