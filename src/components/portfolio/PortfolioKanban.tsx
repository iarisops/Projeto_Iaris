'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { createTask, moveTask } from '@/lib/actions/kanban'

const PHASES = ['Backlog', 'A fazer', 'Em andamento', 'Aguardando/Bloqueado', 'Em revisão', 'Concluído'] as const
type Phase = typeof PHASES[number]

interface Task {
  id: string
  title: string
  description: string | null
  phase: string
  responsible_id: string | null
  due_date: string | null
  comments: string | null
}

interface PortfolioKanbanProps {
  startupId: string
  quarter: string
  tasks: Task[]
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.phase === 'Concluído') return false
  return new Date(task.due_date) < new Date()
}

export function PortfolioKanban({ startupId, quarter, tasks: initialTasks }: PortfolioKanbanProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '' })
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const res = await createTask(startupId, {
      quarter,
      title: form.title,
      description: form.description || undefined,
      due_date: form.due_date || undefined,
    })
    setSaving(false)
    if (!res.error && res.id) {
      setTasks((prev) => [...prev, {
        id: res.id!,
        title: form.title,
        description: form.description || null,
        phase: 'Backlog',
        responsible_id: null,
        due_date: form.due_date || null,
        comments: null,
      }])
      setForm({ title: '', description: '', due_date: '' })
      setShowForm(false)
    }
  }

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newPhase = destination.droppableId as Phase
    const prevTasks = tasks
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, phase: newPhase } : t))
    )
    const res = await moveTask(draggableId, newPhase)
    if (res.error) setTasks(prevTasks)
  }

  const byPhase = (phase: string) => tasks.filter((t) => t.phase === phase)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Kanban</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>+ Nova Tarefa</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input label="Título" id="task-title" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Textarea label="Descrição" id="task-desc" rows={2} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Data limite" id="task-due" type="date" value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Criando…' : 'Criar'}</Button>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PHASES.map((phase) => {
            const cards = byPhase(phase)
            return (
              <div key={phase} className="flex-shrink-0 w-52 flex flex-col gap-2">
                <div className="flex items-center justify-between px-1 py-2 border-b border-border">
                  <span className="font-label text-[11px] text-text-secondary uppercase tracking-wider truncate">
                    {phase}
                  </span>
                  <span className="text-xs text-text-muted ml-1 shrink-0">{cards.length}</span>
                </div>
                <Droppable droppableId={phase}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={[
                        'flex-1 flex flex-col gap-2 p-1 min-h-[150px] transition-colors',
                        snapshot.isDraggingOver ? 'bg-primary/5' : '',
                      ].join(' ')}
                    >
                      {cards.map((task, index) => {
                        const overdue = isOverdue(task)
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(drag, dragSnapshot) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className={dragSnapshot.isDragging ? 'opacity-80 rotate-1' : ''}
                              >
                                <div className={[
                                  'bg-surface border p-2.5 flex flex-col gap-1',
                                  overdue ? 'border-signal-red/50' : 'border-border',
                                ].join(' ')}>
                                  <p className="text-xs text-text-primary leading-snug">{task.title}</p>
                                  {task.due_date && (
                                    <p className={[
                                      'text-[10px]',
                                      overdue ? 'text-signal-red' : 'text-text-muted',
                                    ].join(' ')}>
                                      {overdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
