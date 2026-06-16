import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { currentQuarter } from '@/lib/utils/quarter'
import { HomeTaskList } from '@/components/home/HomeTaskList'
import { HomeActivityList } from '@/components/home/HomeActivityList'
import type { UnifiedActivity } from '@/components/home/HomeActivityList'
import { AddStartupButton } from '@/components/portfolio/AddStartupButton'

const tierVariant = { 0: 'muted', 1: 'teal', 2: 'amber', 3: 'green' } as const

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function CalendarIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const quarter = currentQuarter()

  const [
    { data: startups },
    { data: myTasks },
    { data: myPortfolioActivities },
    { data: myCrmActivities },
  ] = await Promise.all([
    supabase
      .from('portfolio_startups')
      .select('id, name, logo_url, tier, journey_status, vertical, last_update_at')
      .eq('is_system', false)
      .order('name'),
    supabase
      .from('kanban_tasks')
      .select('id, title, phase, due_date, quarter, startup_id, portfolio_startups(name)')
      .eq('responsible_id', user!.id)
      .neq('phase', 'Concluído')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from('portfolio_activities')
      .select('id, type, date, status, startup_id, notes, portfolio_startups(name)')
      .eq('responsible_id', user!.id)
      .in('status', ['Pendente', 'Agendada', 'Reagendada'])
      .order('date', { ascending: true })
      .limit(20),
    supabase
      .from('crm_activities')
      .select('id, type, date, title, status, note, startup_candidate_id, startup_candidates(funnel_id, name)')
      .eq('responsible_id', user!.id)
      .eq('status', 'Pendente')
      .order('date', { ascending: true })
      .limit(20),
  ])

  const myActivities: UnifiedActivity[] = [
    ...(myPortfolioActivities ?? []).map((a) => {
      const ps = a.portfolio_startups as { name: string } | null
      return {
        source: 'portfolio' as const,
        id: a.id, type: a.type, date: a.date, status: a.status,
        title: a.notes,
        context: ps?.name ?? null,
        href: `/portfolio/${a.startup_id}/operacional`,
      }
    }),
    ...(myCrmActivities ?? []).map((a) => {
      const candidate = a.startup_candidates as { funnel_id: string; name: string } | null
      return {
        source: 'crm' as const,
        id: a.id, type: a.type, date: a.date, status: a.status,
        title: a.title ?? a.note,
        context: candidate?.name ?? null,
        href: candidate ? `/crm/${candidate.funnel_id}/candidatas/${a.startup_candidate_id}#activity-${a.id}` : '#',
      }
    }),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* Portfolio grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-text-primary">Home</h1>
            <p className="text-xs text-text-muted mt-0.5">{quarter}</p>
          </div>
          <AddStartupButton />
        </div>

        {(!startups || startups.length === 0) ? (
          <div className="bg-surface-2 border border-border p-12 text-center">
            <p className="text-text-muted text-sm">Nenhuma startup no portfólio ainda.</p>
            <p className="text-text-muted text-xs mt-1">
              Converta uma candidata &quot;Ganha&quot; no CRM para adicionar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {startups.map((s) => {
              const tier = (s.tier ?? 0) as 0 | 1 | 2 | 3
              return (
                <a
                  key={s.id}
                  href={`/portfolio/${s.id}/operacional`}
                  className="bg-surface-2 border border-border p-4 flex flex-col gap-3 hover:border-primary/60 transition-colors group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-surface border border-border overflow-hidden">
                    {s.logo_url ? (
                      <Image src={s.logo_url} alt={s.name} width={40} height={40} className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-headline text-lg font-bold text-primary">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className="font-headline text-sm font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors truncate">
                      {s.name}
                    </p>
                    {s.vertical && (
                      <p className="text-xs text-text-muted truncate">{s.vertical}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={tierVariant[tier]} className="text-[10px]">
                      {tier === 0 ? '—' : `T${tier}`}
                    </Badge>
                    {s.journey_status && (
                      <span className="text-[10px] text-text-muted truncate">{s.journey_status}</span>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </section>

      {/* My tasks + My activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Minhas Tarefas */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border border-b-0">
            <h2 className="font-headline text-sm font-semibold text-text-primary">Minhas Tarefas</h2>
            <a href="/meu-kanban" className="text-xs text-primary hover:underline font-label">
              Ver kanban →
            </a>
          </div>
          <HomeTaskList tasks={(myTasks ?? []) as Parameters<typeof HomeTaskList>[0]['tasks']} />
        </section>

        {/* Minhas Atividades */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border border-border border-b-0">
            <h2 className="font-headline text-sm font-semibold text-text-primary">Minhas Atividades</h2>
          </div>
          <HomeActivityList activities={myActivities} />
        </section>
      </div>
    </div>
  )
}
