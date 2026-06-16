'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadCRMAttachment(
  formData: FormData,
  funnelId: string
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Arquivo inválido.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const ext = file.name.split('.').pop() ?? 'bin'
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = `${funnelId}/${slug}.${ext}`

  const { data, error } = await supabase.storage
    .from('crm-attachments')
    .upload(path, file, { contentType: file.type })

  if (error || !data) return { error: error?.message ?? 'Erro no upload.' }

  const { data: { publicUrl } } = supabase.storage
    .from('crm-attachments')
    .getPublicUrl(path)

  return { url: publicUrl }
}
