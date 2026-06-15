'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { currentQuarter } from '@/lib/utils/quarter'
import type { Json } from '@/types/supabase'

const OKR_STATUSES = ['Em andamento', 'Em atenção', 'Travado', 'Concluído', 'Cancelado', 'Não alcançado'] as const

const KeyResultSchema = z.object({
  text: z.string(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

const OKRCreateSchema = z.object({
  objective: z.string().min(1),
  key_results: z.array(KeyResultSchema).optional(),
  owner_id: z.string().uuid().optional(),
  status: z.enum(OKR_STATUSES).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  quarter: z.string().optional(),
})

const OKRUpdateSchema = OKRCreateSchema.partial()

export async function createOKR(
  startupId: string,
  data: z.infer<typeof OKRCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = OKRCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { key_results, ...rest } = parsed.data
  const { data: okr, error } = await supabase
    .from('okrs')
    .insert({
      ...rest,
      startup_id: startupId,
      quarter: rest.quarter ?? currentQuarter(),
      status: rest.status ?? 'Em andamento',
      key_results: (key_results ?? []) as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !okr) return { error: error?.message ?? 'Erro ao criar OKR.' }
  return { id: okr.id }
}

export async function updateOKR(
  id: string,
  data: z.infer<typeof OKRUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = OKRUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { key_results, ...rest } = parsed.data
  const { error } = await supabase
    .from('okrs')
    .update({
      ...rest,
      ...(key_results !== undefined ? { key_results: key_results as unknown as Json } : {}),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}
