import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FunnelPageClient } from '@/components/crm/FunnelPageClient'
import type { CandidateRow } from '@/components/crm/CandidateCard'

interface Props {
  params: Promise<{ 'funnel-id': string }>
}

const StatusDot = ({ status }: { status: string }) => {
  const color =
    status === 'Ativo'     ? 'bg-[#38a169]' :
    status === 'Encerrado' ? 'bg-[#fbb33d]' :
                             'bg-[#8492b0]'
  return <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
}

export default async function FunnelPage({ params }: Props) {
  const { 'funnel-id': funnelId } = await params
  const supabase = await createClient()

  const [{ data: funnel }, { data: stages }, { data: candidates }] =
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
    ])

  if (!funnel) notFound()

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

  return (
    <div className="flex flex-col gap-0 h-full overflow-hidden bg-[#f5f7fc]">

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-[#e2e8f4] shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/crm"
            className="text-xs text-[#8492b0] hover:text-[#009999] transition-colors"
          >
            CRM
          </Link>
          <span className="text-[#c8d0e0] text-xs">›</span>
          <span className="text-xs text-[#4d5b7c]">{funnel.name}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-headline text-xl font-bold text-[#0d1226] truncate">
              {funnel.name}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              <StatusDot status={funnel.status} />
              <span className="text-xs text-[#8492b0]">{funnel.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {funnel.edition && (
              <span className="text-xs text-[#8492b0]">{funnel.edition}</span>
            )}
            {(funnel.start_date || funnel.end_date) && (
              <span className="text-xs text-[#aab3c8]">
                {funnel.start_date && new Date(funnel.start_date).toLocaleDateString('pt-BR')}
                {funnel.start_date && funnel.end_date && ' – '}
                {funnel.end_date && new Date(funnel.end_date).toLocaleDateString('pt-BR')}
              </span>
            )}
            <Link
              href={`/crm/${funnelId}/metricas`}
              className="text-xs text-[#8492b0] hover:text-[#009999] transition-colors font-label uppercase tracking-wide"
            >
              Métricas →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-5">
        <FunnelPageClient
          funnelId={funnelId}
          funnelName={funnel.name}
          funnelStatus={funnel.status}
          stages={stages ?? []}
          candidates={candidatesWithOwners}
          rawFormConfig={(funnel as Record<string, unknown>)['form_config'] ?? null}
        />
      </div>
    </div>
  )
}
