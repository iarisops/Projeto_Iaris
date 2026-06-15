import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ 'funnel-id': string }>
}

export default async function FunnelMetricsPage({ params }: Props) {
  const { 'funnel-id': funnelId } = await params
  const supabase = await createClient()

  const [{ data: funnel }, { data: stages }, { data: candidates }] = await Promise.all([
    supabase.from('funnels').select('*').eq('id', funnelId).single(),
    supabase.from('funnel_stages').select('*').eq('funnel_id', funnelId).order('position'),
    supabase.from('startup_candidates').select('*').eq('funnel_id', funnelId),
  ])

  if (!funnel) notFound()

  const all = candidates ?? []
  const total = all.length
  const won = all.filter((c) => c.result === 'Ganha').length
  const lost = all.filter((c) => c.result === 'Perdida').length
  const open = all.filter((c) => c.result === 'Em aberto').length
  const followUp = all.filter((c) => c.result === 'Acompanhar futuramente').length
  const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0'
  const withMoU = all.filter((c) => {
    const stage = (stages ?? []).find((s) => s.id === c.stage_id)
    return stage?.name === 'Contrato/MoU enviado'
  }).length
  const converted = all.filter((c) => c.converted_portfolio_startup_id !== null).length
  const withScore = all.filter((c) => c.score !== null)
  const avgScore =
    withScore.length > 0
      ? (withScore.reduce((sum, c) => sum + (c.score ?? 0), 0) / withScore.length).toFixed(1)
      : '—'

  // By stage
  const byStage = (stages ?? [])
    .filter((s) => !s.is_archived)
    .sort((a, b) => a.position - b.position)
    .map((s) => ({
      name: s.name,
      count: all.filter((c) => c.stage_id === s.id).length,
    }))

  // By vertical
  const verticals = [...new Set(all.map((c) => c.vertical).filter(Boolean))] as string[]
  const byVertical = verticals.map((v) => ({
    name: v,
    count: all.filter((c) => c.vertical === v).length,
  })).sort((a, b) => b.count - a.count)

  // By phase
  const phases = ['Ideação', 'Validação', 'Operação', 'Tração', 'Escala']
  const byPhase = phases.map((p) => ({
    name: p,
    count: all.filter((c) => c.phase === p).length,
  })).filter((p) => p.count > 0)

  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1 text-xs text-text-muted">
          <Link href="/crm" className="hover:text-primary transition-colors">CRM</Link>
          <span>›</span>
          <Link href={`/crm/${funnelId}`} className="hover:text-primary transition-colors">{funnel.name}</Link>
          <span>›</span>
          <span className="text-text-secondary">Métricas</span>
        </div>
        <h1 className="font-headline text-xl font-bold text-text-primary">
          Métricas — {funnel.name}
        </h1>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total no funil', value: total, color: 'text-text-primary' },
            { label: 'Ganhas', value: won, color: 'text-signal-green' },
            { label: 'Perdidas', value: lost, color: 'text-signal-red' },
            { label: 'Taxa de conversão', value: `${conversionRate}%`, color: 'text-primary' },
            { label: 'Em aberto', value: open, color: 'text-text-secondary' },
            { label: 'Acompanhar', value: followUp, color: 'text-accent' },
            { label: 'Com MoU enviado', value: withMoU, color: 'text-text-secondary' },
            { label: 'Convertidas p/ portfólio', value: converted, color: 'text-primary' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-surface-2 border border-border p-4 text-center">
              <p className={['text-3xl font-headline font-bold', kpi.color].join(' ')}>{kpi.value}</p>
              <p className="text-[10px] text-text-muted uppercase font-label tracking-wide mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Nota média */}
        <div className="bg-surface-2 border border-border p-4 flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-headline text-primary font-bold">{avgScore}</p>
            <p className="text-[10px] text-text-muted uppercase font-label tracking-wide mt-1">Nota média</p>
          </div>
          <div className="text-xs text-text-muted">
            Calculada sobre {withScore.length} candidata{withScore.length !== 1 ? 's' : ''} com nota registrada.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Por etapa */}
          <div className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
            <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Por etapa
            </h3>
            {byStage.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-secondary truncate">{s.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="h-1.5 bg-primary"
                    style={{ width: total > 0 ? `${(s.count / total) * 80}px` : 0 }}
                  />
                  <span className="text-xs text-text-primary font-label w-6 text-right">{s.count}</span>
                </div>
              </div>
            ))}
            {byStage.length === 0 && (
              <p className="text-xs text-text-muted">Nenhuma etapa ativa.</p>
            )}
          </div>

          {/* Por vertical */}
          {byVertical.length > 0 && (
            <div className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
              <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Por vertical
              </h3>
              {byVertical.map((v) => (
                <div key={v.name} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary truncate">{v.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="h-1.5 bg-accent"
                      style={{ width: total > 0 ? `${(v.count / total) * 80}px` : 0 }}
                    />
                    <span className="text-xs text-text-primary font-label w-6 text-right">{v.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Por fase */}
          {byPhase.length > 0 && (
            <div className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
              <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Por fase
              </h3>
              {byPhase.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="h-1.5 bg-primary/60"
                      style={{ width: total > 0 ? `${(p.count / total) * 80}px` : 0 }}
                    />
                    <span className="text-xs text-text-primary font-label w-6 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
