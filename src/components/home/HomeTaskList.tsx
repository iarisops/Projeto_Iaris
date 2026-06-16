'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { moveTask } from '@/lib/actions/kanban'

interface Task {
  id: string
  title: string
  phase: string
  due_date: string | null
  quarter: string | null
  startup_id: string
  portfolio_startups: { name: string } | null
}

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

function phaseVariant(phase: string): 'default' | 'teal' | 'amber' | 'orange' | 'green' | 'muted' {
  if (phase === 'Em andamento')         return 'teal'
  if (phase === 'Aguardando/Bloqueado') return 'orange'
  if (phase === 'Em revisão')           return 'amber'
  if (phase === 'Concluído')            return 'green'
  if (phase === 'Backlog')              return 'muted'
  return 'default'
}

// Animated check circle — shows spinner while completing
function TaskCircle({ phase, completing, onClick }: {
  phase: string
  completing: boolean
  onClick: () => void
}) {
  const isActive   = phase === 'Em andamento'
  const isBlocked  = phase === 'Aguardando/Bloqueado'
  const isReview   = phase === 'Em revisão'

  const borderColor = isActive  ? 'border-primary' :
                      isBlocked ? 'border-signal-orange' :
                      isReview  ? 'border-[#fbb33d]' :
                                  'border-border'

  const dotColor = isActive  ? 'bg-primary' :
                   isBlocked ? 'bg-signal-orange' :
                   isReview  ? 'bg-[#fbb33d]' :
                               'bg-transparent'

  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick() }}
      disabled={completing}
      title="Marcar como concluída"
      className={[
        'w-[18px] h-[18px] rounded-full shrink-0 border-2 flex items-center justify-center',
        'transition-all hover:border-primary hover:bg-primary/10',
        completing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        borderColor,
      ].join(' ')}
    >
      {completing ? (
        <div className="w-2 h-2 rounded-full bg-border animate-pulse" />
      ) : (
        <div className={`w-2 h-2 rounded-full transition-colors ${dotColor}`} />
      )}
    </button>
  )
}

export function HomeTaskList({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks]         = useState(initial)
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  async function handleComplete(taskId: string) {
    setCompleting((prev) => new Set(prev).add(taskId))
    await moveTask(taskId, 'Concluído')
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setCompleting((prev) => { const s = new Set(prev); s.delete(taskId); return s })
  }

  if (tasks.length === 0) {
    return (
      <div className="border border-border bg-surface px-4 py-8 text-center">
        <p className="text-sm text-text-muted">Nenhuma tarefa pendente.</p>
      </div>
    )
  }

  return (
    <div className="border border-border bg-surface divide-y divide-border">
      {tasks.map((task) => {
        const overdue = !!task.due_date && new Date(task.due_date) < new Date()
        const ps = task.portfolio_startups
        const isCompleting = completing.has(task.id)

        return (
          <a
            key={task.id}
            href={`/portfolio/${task.startup_id}/operacional?quarter=${task.quarter}`}
            className={[
              'flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors group',
              isCompleting ? 'opacity-50' : '',
            ].join(' ')}
          >
            {/* Completable circle */}
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <TaskCircle
                phase={task.phase}
                completing={isCompleting}
                onClick={() => handleComplete(task.id)}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors leading-snug truncate">
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {task.due_date && (
                  <span className={[
                    'flex items-center gap-1 text-[11px] font-label',
                    overdue ? 'text-signal-red font-semibold' : 'text-text-muted',
                  ].join(' ')}>
                    <CalendarIcon />
                    {fmtDate(task.due_date)}
                  </span>
                )}
                <Badge variant={phaseVariant(task.phase)} className="text-[9px] py-0">
                  {task.phase}
                </Badge>
              </div>
            </div>

            {/* Startup name badge */}
            {ps?.name && (
              <span className="text-[10px] font-label font-medium text-text-muted bg-surface-2 border border-border px-2 py-0.5 shrink-0 self-center max-w-[96px] truncate">
                {ps.name}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}
