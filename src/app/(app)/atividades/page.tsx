import { createClient } from '@/lib/supabase/server'
import { AtividadesTable } from '@/components/atividades/AtividadesTable'
import type { TableActivity } from '@/components/atividades/AtividadesTable'

export default async function AtividadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: users },
    { data: crmActivities },
    { data: portfolioActivities },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, name')
      .order('name'),
    supabase
      .from('crm_activities')
      .select('id, type, title, date, status, note, responsible_id, startup_candidate_id, startup_candidates(id, name, funnel_id)')
      .order('date', { ascending: false })
      .limit(500),
    supabase
      .from('portfolio_activities')
      .select('id, type, date, status, notes, responsible_id, startup_id, portfolio_startups(id, name)')
      .order('date', { ascending: false })
      .limit(500),
  ])

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.name]))

  const activities: TableActivity[] = [
    ...(crmActivities ?? []).map((a) => {
      const sc = a.startup_candidates as { id: string; name: string; funnel_id: string } | null
      return {
        id:               a.id,
        source:           'crm' as const,
        type:             a.type,
        title:            a.title ?? a.note ?? null,
        date:             a.date,
        status:           a.status,
        responsible_id:   a.responsible_id,
        responsible_name: a.responsible_id ? (userMap[a.responsible_id] ?? null) : null,
        context_name:     sc?.name ?? null,
        href:             sc ? `/crm/${sc.funnel_id}/candidatas/${a.startup_candidate_id}#activity-${a.id}` : '#',
      }
    }),
    ...(portfolioActivities ?? []).map((a) => {
      const ps = a.portfolio_startups as { id: string; name: string } | null
      return {
        id:               a.id,
        source:           'portfolio' as const,
        type:             a.type,
        title:            a.notes ?? null,
        date:             a.date,
        status:           a.status,
        responsible_id:   a.responsible_id,
        responsible_name: a.responsible_id ? (userMap[a.responsible_id] ?? null) : null,
        context_name:     ps?.name ?? null,
        href:             ps ? `/portfolio/${a.startup_id}/operacional` : '#',
      }
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="font-headline text-2xl font-bold text-text-primary">Atividades</h1>
        <p className="text-xs text-text-muted mt-0.5">{activities.length} registros</p>
      </div>
      <div className="p-6">
        <AtividadesTable
          activities={activities}
          users={(users ?? []) as { id: string; name: string }[]}
          defaultResponsavel={user?.id ?? ''}
          defaultStatus="Pendente"
        />
      </div>
    </div>
  )
}
