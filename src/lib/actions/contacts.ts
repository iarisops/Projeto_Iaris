'use server'

import { createClient } from '@/lib/supabase/server'

export async function createContact(data: {
  name: string
  whatsapp?: string
  email?: string
  linkedin?: string
  notes?: string
}): Promise<{ id?: string; error?: string }> {
  if (!data.name.trim()) return { error: 'Nome do contato obrigatório.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      name:      data.name.trim(),
      whatsapp:  data.whatsapp?.trim() || null,
      email:     data.email?.trim() || null,
      linkedin:  data.linkedin?.trim() || null,
      notes:     data.notes?.trim() || null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !contact) return { error: error?.message ?? 'Erro ao criar contato.' }
  return { id: contact.id }
}

export async function updateContact(
  id: string,
  data: {
    name?: string
    whatsapp?: string
    email?: string
    linkedin?: string
    notes?: string
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('contacts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}
