import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { FunnelPageClient } from '@/components/crm/FunnelPageClient'
import type { CandidateRow } from '@/components/crm/CandidateCard'

interface Props {
  params: Promise<{ 'funnel-id': string }>
}

export default async function FunnelPage({ params }: Props) {
  const { 'funnel-id': funnelId } = await params
  const supabase = await createClient()

  const [{ data: funnel }, { data: stages }, { data: candidates }, { data: panelForms }] =
    await Promise.all([
      supabase.from('funnels').select('*').eq('id', funnelId).single(),
      supabase
        .from('funnel_stages')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('position', { ascending: true }),
      supabase
        .from('startup_candidates')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('last_update_at', { ascending: false }),
      supabase
        .from('panel_evaluation_forms')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false }),
    ])

  if (!funnel) notFound()

  // Fetch owner names from public.users
  const ownerIds = [...new Set(
    (candidates ?? []).map((c) => c.internal_owner_id).filter((id): id is string => !!id)
  )]

  let userMap: Record<string, string> = {}
  if (ownerIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', ownerIds)
    userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.name]))
  }

  const candidatesWithOwners: CandidateRow[] = (candidates ?? []).map((c) => ({
    ...c,
    owner_name: c.internal_owner_id ? (userMap[c.internal_owner_id] ?? null) : null,
  }))

  const statusBadgeVariant = funnel.status === 'Ativo'
    ? 'teal'
    : funnel.status === 'Encerrado'
    ? 'amber'
    : 'muted'

  const won = candidatesWithOwners.filter((c) => c.result === 'Ganha').length
  const total = candidatesWithOwners.length

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/crm" className="text-xs text-text-muted hover:text-primary transition-colors">
                CRM
              </Link>
              <span className="text-text-muted text-xs">›</span>
              <span className="text-xs text-text-secondary">{funnel.name}</span>
            </div>
            <h1 className="font-headline text-xl font-bold text-text-primary">{funnel.name}</h1>
            {funnel.edition && (
              <p className="text-xs text-text-muted mt-0.5">{funnel.edition}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={statusBadgeVariant as 'teal' | 'amber' | 'muted'}>{funnel.status}</Badge>
            <Link
              href={`/crm/${funnelId}/metricas`}
              className="text-xs text-text-muted hover:text-primary transition-colors font-label uppercase tracking-wide"
            >
              Ver métricas →
            </Link>
          </div>
        </div>

        <div className="flex gap-6 text-xs text-text-muted">
          <span>{total} candidata{total !== 1 ? 's' : ''}</span>
          <span>{won} ganha{won !== 1 ? 's' : ''}</span>
          {total > 0 && (
            <span>{Math.round((won / total) * 100)}% de conversão</span>
          )}
          {funnel.start_date && (
            <span>Início: {new Date(funnel.start_date).toLocaleDateString('pt-BR')}</span>
          )}
          {funnel.end_date && (
            <span>Fim: {new Date(funnel.end_date).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <FunnelPageClient
          funnelId={funnelId}
          funnelName={funnel.name}
          funnelStatus={funnel.status}
          stages={stages ?? []}
          candidates={candidatesWithOwners}
          panelForms={panelForms ?? []}
        />
      </div>
    </div>
  )
}
