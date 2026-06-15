import { createClient } from '@/lib/supabase/server'
import { MeuKanbanClient } from '@/components/portfolio/MeuKanbanClient'

export default async function MeuKanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: startups }] = await Promise.all([
    supabase
      .from('kanban_tasks')
      .select('id, title, phase, due_date, quarter, startup_id')
      .eq('responsible_id', user!.id)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('portfolio_startups')
      .select('id, name')
      .order('name'),
  ])

  const startupMap: Record<string, string> = {}
  for (const s of startups ?? []) startupMap[s.id] = s.name

  const enrichedTasks = (tasks ?? []).map((t) => ({
    ...t,
    startup_name: startupMap[t.startup_id] ?? '—',
  }))

  const startupOptions = (startups ?? []).filter((s) =>
    enrichedTasks.some((t) => t.startup_id === s.id)
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">Meu Kanban</h1>
        <p className="text-sm text-text-muted mt-1">
          Todas as suas tarefas de todas as startups do portfólio.
        </p>
      </div>

      <MeuKanbanClient tasks={enrichedTasks} startupOptions={startupOptions} />
    </div>
  )
}
