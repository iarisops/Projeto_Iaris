import { createClient } from '@/lib/supabase/server'
import { IariasKanban } from '@/components/portfolio/IariasKanban'
import { IARIS_STARTUP_ID } from '@/lib/constants'
import type { TaskLink } from '@/components/portfolio/TaskModal'

export default async function IariasKanbanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: users }] = await Promise.all([
    supabase
      .from('kanban_tasks')
      .select('id, title, description, phase, responsible_id, due_date, comments, links, created_at, created_by')
      .eq('startup_id', IARIS_STARTUP_ID)
      .order('created_at', { ascending: true }),
    supabase
      .from('users')
      .select('id, name')
      .order('name'),
  ])

  const enrichedTasks = (tasks ?? []).map((t) => ({
    ...t,
    description: t.description ?? null,
    responsible_id: t.responsible_id ?? null,
    comments: t.comments ?? null,
    links: Array.isArray(t.links) ? (t.links as unknown as TaskLink[]) : [],
    created_at: t.created_at ?? null,
    created_by: t.created_by ?? null,
  }))

  return (
    <IariasKanban
      tasks={enrichedTasks}
      users={users ?? []}
      currentUserId={user?.id}
    />
  )
}
