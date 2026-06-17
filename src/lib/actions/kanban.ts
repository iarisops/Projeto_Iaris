'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

const PHASES = ['Backlog', 'A fazer', 'Em andamento', 'Aguardando/Bloqueado', 'Em revisão', 'Concluído'] as const

const LinkSchema = z.object({
  label: z.string(),
  url: z.string(),
})

const TaskCreateSchema = z.object({
  quarter: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  phase: z.enum(PHASES).optional(),
  responsible_id: z.string().uuid().optional(),
  due_date: z.string().optional(),
  comments: z.string().optional(),
  links: z.array(LinkSchema).optional(),
})

const TaskUpdateSchema = TaskCreateSchema.omit({ quarter: true }).partial()

export async function createTask(
  startupId: string,
  data: z.infer<typeof TaskCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = TaskCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { links, ...rest } = parsed.data
  const { data: task, error } = await supabase
    .from('kanban_tasks')
    .insert({
      ...rest,
      startup_id: startupId,
      phase: rest.phase ?? 'Backlog',
      responsible_id: rest.responsible_id ?? user.id,
      links: (links ?? []) as unknown as Json,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !task) return { error: error?.message ?? 'Erro ao criar tarefa.' }
  return { id: task.id }
}

export async function updateTask(
  id: string,
  data: z.infer<typeof TaskUpdateSchema>
): Promise<{ error?: string }> {
  const parsed = TaskUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { links, ...rest } = parsed.data
  const { error } = await supabase
    .from('kanban_tasks')
    .update({
      ...rest,
      ...(links !== undefined ? { links: links as unknown as Json } : {}),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function moveTask(
  taskId: string,
  phase: typeof PHASES[number]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('kanban_tasks')
    .update({ phase, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', taskId)

  if (error) return { error: error.message }
  return {}
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('kanban_tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { error: error.message }
  return {}
}
