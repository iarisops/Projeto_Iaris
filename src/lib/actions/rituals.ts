'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

const ParticipantSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
})

const RitualCreateSchema = z.object({
  type: z.string().min(1),
  date: z.string().min(1),
  participants: z.array(ParticipantSchema).optional(),
  notes: z.string().optional(),
  external_link: z.string().optional(),
})

const RitualUpdateSchema = RitualCreateSchema.partial()

export async function createRitual(
  startupId: string,
  data: z.infer<typeof RitualCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = RitualCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { participants, ...rest } = parsed.data
  const { data: ritual, error } = await supabase
    .from('rituals')
    .insert({
      ...rest,
      startup_id: startupId,
      participants: (participants ?? []) as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !ritual) return { error: error?.message ?? 'Erro ao criar ritual.' }
  return { id: ritual.id }
}

export async function updateRitual(
  id: string,
  data: z.infer<typeof RitualUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = RitualUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { participants, ...rest } = parsed.data
  const { error } = await supabase
    .from('rituals')
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
