import { createClient } from '@/lib/supabase/server'
import { MeuKanbanClient } from '@/components/portfolio/MeuKanbanClient'

export default async function MeuKanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: startups }, { data: users }] = await Promise.all([
    supabase
      .from('kanban_tasks')
      .select('id, title, description, phase, due_date, quarter, startup_id, responsible_id, comments, links, created_at, created_by')
      .eq('responsible_id', user!.id)
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('portfolio_startups')
      .select('id, name')
      .order('name'),
    supabase
      .from('users')
      .select('id, name')
      .order('name'),
  ])

  const startupMap: Record<string, string> = {}
  for (const s of startups ?? []) startupMap[s.id] = s.name

  const enrichedTasks = (tasks ?? []).map((t) => ({
    ...t,
    description: t.description ?? null,
    responsible_id: t.responsible_id ?? null,
    comments: t.comments ?? null,
    links: Array.isArray(t.links) ? (t.links as { label: string; url: string }[]) : [],
    created_at: t.created_at ?? null,
    created_by: t.created_by ?? null,
    startup_name: startupMap[t.startup_id] ?? '—',
  }))

  const startupOptions = (startups ?? []).filter((s) =>
    enrichedTasks.some((t) => t.startup_id === s.id)
  )

  return (
    <MeuKanbanClient
      tasks={enrichedTasks}
      startupOptions={startupOptions}
      users={users ?? []}
      currentUserId={user!.id}
    />
  )
}
