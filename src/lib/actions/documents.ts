'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AddDocumentSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  url: z.string().optional(),
  kanban_task_id: z.string().uuid().optional(),
})

export async function addDocument(
  startupId: string,
  data: z.infer<typeof AddDocumentSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = AddDocumentSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      ...parsed.data,
      startup_id: startupId,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !doc) return { error: error?.message ?? 'Erro ao adicionar documento.' }
  return { id: doc.id }
}

export async function uploadDocument(
  startupId: string,
  formData: FormData
): Promise<{ id?: string; url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'Arquivo não fornecido.' }

  const name = (formData.get('name') as string | null) ?? file.name
  const type = formData.get('type') as string | null
  const kanban_task_id = formData.get('kanban_task_id') as string | null

  const path = `${startupId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: signedData, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 3600)

  if (signError || !signedData) return { error: signError?.message ?? 'Erro ao gerar URL.' }

  const { data: doc, error: insertError } = await supabase
    .from('documents')
    .insert({
      startup_id: startupId,
      name,
      type: type ?? undefined,
      kanban_task_id: kanban_task_id ?? undefined,
      storage_path: path,
      url: signedData.signedUrl,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !doc) return { error: insertError?.message ?? 'Erro ao salvar documento.' }
  return { id: doc.id, url: signedData.signedUrl }
}
