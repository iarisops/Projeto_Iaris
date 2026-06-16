'use server'

import { createClient } from '@/lib/supabase/server'

export async function createContact(data: {
  startup_candidate_id?: string
  name: string
  role?: string
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
      startup_candidate_id: data.startup_candidate_id ?? null,
      name:      data.name.trim(),
      role:      data.role?.trim() || null,
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
    role?: string
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
      ...(data.name !== undefined && { name: data.name }),
      ...(data.role !== undefined && { role: data.role || null }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.linkedin !== undefined && { linkedin: data.linkedin || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function setPrimaryContact(
  candidateId: string,
  contactId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('startup_candidates')
    .update({ primary_contact_id: contactId, updated_by: user.id })
    .eq('id', candidateId)

  if (error) return { error: error.message }
  return {}
}
