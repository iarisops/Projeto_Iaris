'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/supabase'

const FounderSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  linkedin: z.string().optional(),
  dedication: z.string().optional(),
})

const ProfileSchema = z.object({
  name: z.string().min(1).optional(),
  site: z.string().optional(),
  linkedin: z.string().optional(),
  short_description: z.string().optional(),
  segment: z.string().optional(),
  vertical: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  icp: z.string().optional(),
  business_model: z.string().optional(),
  revenue_model: z.string().optional(),
  stage: z.enum(['Ideação', 'Validação', 'Operação', 'Tração', 'Escala']).optional(),
  founders: z.array(FounderSchema).optional(),
  funding_round: z.string().optional(),
  funding_target: z.number().optional(),
  valuation_instrument: z.string().optional(),
  captable_summary: z.string().optional(),
  iaris_stake: z.number().optional(),
  funding_use: z.string().optional(),
  entry_date: z.string().optional(),
})

const TierStatusSchema = z.object({
  tier: z.number().int().min(0).max(3).optional(),
  journey_status: z.string().optional(),
  engagement: z.string().optional(),
})

const StartupCreateSchema = z.object({
  name:              z.string().min(1),
  site:              z.string().optional(),
  vertical:          z.string().optional(),
  stage:             z.enum(['Ideação', 'Validação', 'Operação', 'Tração', 'Escala']).optional(),
  short_description: z.string().optional(),
  entry_date:        z.string().optional(),
})

export async function createPortfolioStartup(
  data: z.infer<typeof StartupCreateSchema>
): Promise<{ id?: string; error?: string }> {
  const parsed = StartupCreateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: startup, error } = await supabase
    .from('portfolio_startups')
    .insert({
      ...parsed.data,
      founders:   [],
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error || !startup) return { error: error?.message ?? 'Erro ao criar startup.' }
  return { id: startup.id }
}

export async function updatePortfolioProfile(
  startupId: string,
  data: z.infer<typeof ProfileSchema>
): Promise<{ error?: string }> {
  const parsed = ProfileSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { founders, ...rest } = parsed.data
  const { error } = await supabase
    .from('portfolio_startups')
    .update({
      ...rest,
      ...(founders !== undefined ? { founders: founders as unknown as Json } : {}),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      last_update_at: new Date().toISOString(),
    })
    .eq('id', startupId)

  if (error) return { error: error.message }
  return {}
}

export async function updateTierStatus(
  startupId: string,
  data: z.infer<typeof TierStatusSchema>
): Promise<{ error?: string }> {
  const parsed = TierStatusSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('portfolio_startups')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      last_update_at: new Date().toISOString(),
    })
    .eq('id', startupId)

  if (error) return { error: error.message }
  return {}
}

export async function uploadLogo(
  startupId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'Arquivo não fornecido.' }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${startupId}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('portfolio_startups')
    .update({
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', startupId)

  if (updateError) return { error: updateError.message }
  return { url: publicUrl }
}

// ─── addDocumentLink ──────────────────────────────────────────
export async function addDocumentLink(
  startupId: string,
  name: string,
  url: string
): Promise<{ id?: string; error?: string }> {
  if (!name.trim() || !url.trim()) return { error: 'Nome e URL são obrigatórios.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      startup_id:  startupId,
      name:        name.trim(),
      url:         url.trim(),
      type:        'link',
      created_by:  user.id,
      updated_by:  user.id,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Erro ao salvar link.' }
  return { id: data.id }
}

// ─── uploadPortfolioDocument ──────────────────────────────────
export async function uploadPortfolioDocument(
  startupId: string,
  formData: FormData
): Promise<{ id?: string; url?: string; error?: string }> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Arquivo inválido.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const ext  = file.name.split('.').pop() ?? 'bin'
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const path = `${startupId}/${slug}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('portfolio-docs')
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('portfolio-docs').getPublicUrl(path)

  const { data, error } = await supabase
    .from('documents')
    .insert({
      startup_id:   startupId,
      name:         file.name,
      url:          publicUrl,
      storage_path: path,
      type:         ext,
      created_by:   user.id,
      updated_by:   user.id,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Erro ao salvar documento.' }
  return { id: data.id, url: publicUrl }
}

// ─── deleteDocument ───────────────────────────────────────────
export async function deleteDocument(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (doc?.storage_path) {
    await supabase.storage.from('portfolio-docs').remove([doc.storage_path])
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}
