'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const METRIC_TYPES = [
  'MRR', 'Clientes ativos', 'Novos clientes', 'Leads qualificados',
  'Taxa de conversão', 'Churn Rate', 'CAC', 'LTV', 'LTV/CAC',
  'Burn Rate', 'Runway',
] as const

const MetricSchema = z.object({
  type: z.enum(METRIC_TYPES),
  current_value: z.number(),
  previous_value: z.number().optional(),
  period: z.string().optional(),
  notes: z.string().optional(),
})

export async function upsertMetric(
  startupId: string,
  quarter: string,
  data: z.infer<typeof MetricSchema>
): Promise<{ error?: string }> {
  const parsed = MetricSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { error } = await supabase
    .from('metrics')
    .upsert(
      {
        startup_id: startupId,
        quarter,
        ...parsed.data,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: 'startup_id,quarter,type' }
    )

  if (error) return { error: error.message }
  return {}
}
