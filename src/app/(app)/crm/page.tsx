import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { FunnelListClient } from '@/components/crm/FunnelListClient'


async function getFunnels() {
  const supabase = await createClient()

  const { data: funnels, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !funnels) return []

  const funnelsWithStats = await Promise.all(
    funnels.map(async (f) => {
      const { count: total } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)

      const { count: won } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)
        .eq('result', 'Ganha')

      const { count: lost } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)
        .eq('result', 'Perdida')

      const totalNum = total ?? 0
      const wonNum = won ?? 0

      return {
        ...f,
        total_candidates: totalNum,
        won_candidates: wonNum,
        lost_candidates: lost ?? 0,
        conversion_rate: totalNum > 0 ? Math.round((wonNum / totalNum) * 100) : 0,
      }
    })
  )

  return funnelsWithStats
}

export default async function CRMPage() {
  const funnels = await getFunnels()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">
            CRM de Originação
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Gerencie os funis de seleção do Investor Day
          </p>
        </div>
        <FunnelListClient />
      </div>

      {funnels.length === 0 && (
        <div className="bg-surface-2 border border-border p-12 text-center">
          <p className="text-text-muted text-sm">Nenhum funil cadastrado ainda.</p>
          <p className="text-text-muted text-xs mt-1">Clique em "Novo funil" para começar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funnels.map((funnel) => (
          <a
            key={funnel.id}
            href={`/crm/${funnel.id}`}
            className="bg-surface-2 border border-border p-5 flex flex-col gap-3 hover:border-primary/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-headline text-base font-semibold text-text-primary leading-snug">
                  {funnel.name}
                </h2>
                {funnel.edition && (
                  <p className="text-xs text-text-muted mt-0.5">{funnel.edition}</p>
                )}
              </div>
              <Badge
                variant={
                  funnel.status === 'Ativo'
                    ? 'teal'
                    : funnel.status === 'Encerrado'
                    ? 'amber'
                    : 'muted'
                }
                className="shrink-0"
              >
                {funnel.status}
              </Badge>
            </div>

            {funnel.description && (
              <p className="text-xs text-text-secondary line-clamp-2">{funnel.description}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="text-center">
                <p className="text-xl font-headline text-text-primary">{funnel.total_candidates}</p>
                <p className="text-[10px] text-text-muted uppercase font-label">Total</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-headline text-signal-green">{funnel.won_candidates}</p>
                <p className="text-[10px] text-text-muted uppercase font-label">Ganhas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-headline text-primary">{funnel.conversion_rate}%</p>
                <p className="text-[10px] text-text-muted uppercase font-label">Conversão</p>
              </div>
            </div>

            {(funnel.start_date || funnel.end_date) && (
              <div className="text-xs text-text-muted border-t border-border pt-2 flex gap-2">
                {funnel.start_date && (
                  <span>
                    Início: {new Date(funnel.start_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {funnel.end_date && (
                  <span>
                    · Fim: {new Date(funnel.end_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
