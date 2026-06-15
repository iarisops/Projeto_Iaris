'use server'

import { createClient } from '@/lib/supabase/server'

export async function requestContextUpdate(
  startupId: string
): Promise<{ jobId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: startup } = await supabase
    .from('portfolio_startups')
    .select('id, name, short_description, problem, solution')
    .eq('id', startupId)
    .single()

  if (!startup || !startup.name) return { error: 'Startup não encontrada.' }

  const hasDescription = startup.short_description || startup.problem || startup.solution
  if (!hasDescription) {
    return { error: 'Adicione uma descrição, problema ou solução antes de gerar o contexto.' }
  }

  const [
    { count: okrCount },
    { count: metricCount },
    { count: activityCount },
    { count: assessmentCount },
  ] = await Promise.all([
    supabase.from('okrs').select('id', { count: 'exact', head: true }).eq('startup_id', startupId),
    supabase.from('metrics').select('id', { count: 'exact', head: true }).eq('startup_id', startupId),
    supabase.from('portfolio_activities').select('id', { count: 'exact', head: true }).eq('startup_id', startupId),
    supabase.from('operational_assessments').select('id', { count: 'exact', head: true }).eq('startup_id', startupId),
  ])

  const totalRecords = (okrCount ?? 0) + (metricCount ?? 0) + (activityCount ?? 0) + (assessmentCount ?? 0)
  if (totalRecords === 0) {
    return { error: 'Adicione OKRs, métricas, atividades ou assessments antes de gerar o contexto.' }
  }

  const { data: job, error } = await supabase
    .from('ai_jobs')
    .insert({
      startup_id: startupId,
      status: 'Pendente',
      requester_id: user.id,
      prompt_version: 'v1',
    })
    .select('id')
    .single()

  if (error || !job) return { error: error?.message ?? 'Erro ao criar job.' }
  return { jobId: job.id }
}

export async function saveContextEdit(
  startupId: string,
  content: string
): Promise<{ error?: string }> {
  if (!content.trim()) return { error: 'Conteúdo não pode ser vazio.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase.from('context_versions').insert({
    startup_id: startupId,
    content,
    was_manually_edited: true,
    last_edited_by: user.id,
    last_edited_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  return {}
}
