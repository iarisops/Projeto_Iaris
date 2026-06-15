import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { currentQuarter } from '@/lib/utils/quarter'

const tierVariant = { 0: 'muted', 1: 'teal', 2: 'amber', 3: 'green' } as const

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const quarter = currentQuarter()

  const [
    { data: startups },
    { data: myTasks },
    { data: myActivities },
  ] = await Promise.all([
    supabase
      .from('portfolio_startups')
      .select('id, name, logo_url, tier, journey_status, vertical, last_update_at')
      .order('name'),
    supabase
      .from('kanban_tasks')
      .select('id, title, phase, due_date, quarter, startup_id')
      .eq('responsible_id', user!.id)
      .neq('phase', 'Concluído')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(20),
    supabase
      .from('portfolio_activities')
      .select('id, type, date, status, startup_id, notes')
      .eq('responsible_id', user!.id)
      .in('status', ['Pendente', 'Agendada', 'Reagendada'])
      .order('date', { ascending: true })
      .limit(20),
  ])

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Portfolio grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-text-primary">Portfólio</h1>
            <p className="text-xs text-text-muted mt-0.5">{quarter}</p>
          </div>
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
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Minhas Tarefas
            </h2>
            <a href="/meu-kanban" className="text-xs text-primary hover:underline">
              Ver kanban →
            </a>
          </div>

          {(!myTasks || myTasks.length === 0) ? (
            <p className="text-sm text-text-muted py-4 border border-border text-center bg-surface-2">
              Nenhuma tarefa pendente.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border border border-border">
              {myTasks.map((task) => {
                const overdue = !!task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.phase !== 'Concluído'
                return (
                  <a
                    key={task.id}
                    href={`/portfolio/${task.startup_id}/operacional?quarter=${task.quarter}`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <span className={[
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      task.phase === 'Em andamento' ? 'bg-primary' :
                      task.phase === 'Aguardando/Bloqueado' ? 'bg-signal-orange' :
                      'bg-border',
                    ].join(' ')} />
                    <span className="flex-1 text-sm text-text-primary truncate">{task.title}</span>
                    {task.due_date && (
                      <span className={['text-xs shrink-0', overdue ? 'text-signal-red font-semibold' : 'text-text-muted'].join(' ')}>
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </section>

        {/* Minhas Atividades */}
        <section>
          <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Minhas Atividades
          </h2>

          {(!myActivities || myActivities.length === 0) ? (
            <p className="text-sm text-text-muted py-4 border border-border text-center bg-surface-2">
              Nenhuma atividade pendente.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border border border-border">
              {myActivities.map((act) => {
                const overdue = new Date(act.date) < new Date()
                return (
                  <a
                    key={act.id}
                    href={`/portfolio/${act.startup_id}/operacional`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-label uppercase truncate">{act.type}</p>
                      {act.notes && <p className="text-xs text-text-muted truncate">{act.notes}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={['text-xs', overdue ? 'text-signal-red' : 'text-text-muted'].join(' ')}>
                        {new Date(act.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-text-muted">{act.status}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
