'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'

const PHASES = ['Backlog', 'A fazer', 'Em andamento', 'Aguardando/Bloqueado', 'Em revisão', 'Concluído'] as const

interface Task {
  id: string
  title: string
  phase: string
  due_date: string | null
  quarter: string
  startup_id: string
  startup_name: string
}

interface MeuKanbanClientProps {
  tasks: Task[]
  startupOptions: { id: string; name: string }[]
}

export function MeuKanbanClient({ tasks, startupOptions }: MeuKanbanClientProps) {
  const [filterStartup, setFilterStartup] = useState('')
  const [filterPhase, setFilterPhase] = useState('')
  const [filterOverdue, setFilterOverdue] = useState(false)

  const filtered = useMemo(() => {
    const cutoff = new Date()
    return tasks.filter((t) => {
      if (filterStartup && t.startup_id !== filterStartup) return false
      if (filterPhase && t.phase !== filterPhase) return false
      if (filterOverdue) {
        const isOverdue = t.due_date && new Date(t.due_date) < cutoff && t.phase !== 'Concluído'
        if (!isOverdue) return false
      }
      return true
    })
  }, [tasks, filterStartup, filterPhase, filterOverdue])

  const now = new Date()

  const byPhase = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const p of PHASES) map[p] = []
    for (const t of filtered) {
      if (map[t.phase]) map[t.phase].push(t)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterStartup}
          onChange={(e) => setFilterStartup(e.target.value)}
          className="bg-surface-2 border border-border text-text-primary text-sm px-3 py-1.5 focus:outline-none focus:border-primary"
        >
          <option value="">Todas as startups</option>
          {startupOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterPhase}
          onChange={(e) => setFilterPhase(e.target.value)}
          className="bg-surface-2 border border-border text-text-primary text-sm px-3 py-1.5 focus:outline-none focus:border-primary"
        >
          <option value="">Todas as fases</option>
          {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
            className="accent-primary"
          />
          Apenas atrasadas
        </label>

        <span className="text-xs text-text-muted ml-auto">
          {filtered.length} {filtered.length === 1 ? 'tarefa' : 'tarefas'}
        </span>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PHASES.map((phase) => {
          const phaseTasks = byPhase[phase] ?? []
          return (
            <div key={phase} className="min-w-[220px] flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-label text-xs text-text-secondary uppercase tracking-wide">
                  {phase}
                </span>
                <span className="text-xs text-text-muted">{phaseTasks.length}</span>
              </div>

              <div className="flex flex-col gap-2 min-h-[100px]">
                {phaseTasks.map((task) => {
                  const overdue = !!task.due_date &&
                    new Date(task.due_date) < now &&
                    task.phase !== 'Concluído'

                  return (
                    <a
                      key={task.id}
                      href={`/portfolio/${task.startup_id}/operacional?quarter=${task.quarter}`}
                      className={[
                        'bg-surface-2 border p-3 flex flex-col gap-1.5 hover:border-primary/60 transition-colors',
                        overdue ? 'border-signal-red/50' : 'border-border',
                      ].join(' ')}
                    >
                      <p className="text-xs text-text-primary font-semibold leading-snug line-clamp-2">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-text-muted truncate">{task.startup_name}</span>
                        {task.due_date && (
                          <span className={[
                            'text-[10px] shrink-0',
                            overdue ? 'text-signal-red font-semibold' : 'text-text-muted',
                          ].join(' ')}>
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {overdue && (
                        <Badge variant="red" className="text-[9px] self-start">Atrasada</Badge>
                      )}
                    </a>
                  )
                })}

                {phaseTasks.length === 0 && (
                  <div className="border border-dashed border-border/50 min-h-[60px] flex items-center justify-center">
                    <span className="text-xs text-text-muted/50">—</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
