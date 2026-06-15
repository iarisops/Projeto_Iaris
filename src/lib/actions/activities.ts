'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

const ACTIVITY_STATUSES = ['Pendente', 'Agendada', 'Concluída', 'Reagendada', 'Cancelada'] as const

const ParticipantSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
})

const ActivityCreateSchema = z.object({
  type: z.string().min(1),
  channel: z.string().optional(),
  date: z.string().min(1),
  status: z.enum(ACTIVITY_STATUSES).optional(),
  responsible_id: z.string().uuid().optional(),
  participants: z.array(ParticipantSchema).optional(),
  notes: z.string().optional(),
  external_link: z.string().optional(),
})

const ActivityUpdateSchema = ActivityCreateSchema.partial()

export async function createPortfolioActivity(
  startupId: string,
  data: z.infer<typeof ActivityCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = ActivityCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { participants, ...rest } = parsed.data
  const { data: activity, error } = await supabase
    .from('portfolio_activities')
    .insert({
      ...rest,
      startup_id: startupId,
      status: rest.status ?? 'Pendente',
      responsible_id: rest.responsible_id ?? user.id,
      participants: (participants ?? []) as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !activity) return { error: error?.message ?? 'Erro ao criar atividade.' }
  return { id: activity.id }
}

export async function updatePortfolioActivity(
  id: string,
  data: z.infer<typeof ActivityUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = ActivityUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { participants, ...rest } = parsed.data
  const { error } = await supabase
    .from('portfolio_activities')
    .update({
      ...rest,
      ...(participants !== undefined ? { participants: participants as unknown as Json } : {}),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}
