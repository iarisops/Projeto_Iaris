'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createTask, updateTask, deleteTask, moveTask } from '@/lib/actions/kanban'
import { IARIS_STARTUP_ID, IARIS_QUARTER } from '@/lib/constants'
import { TaskModal, type Task, type TaskLink } from './TaskModal'
import { stripHtml } from '@/components/ui/RichTextEditor'

const PHASES = ['Backlog', 'A fazer', 'Em andamento', 'Aguardando/Bloqueado', 'Em revisão', 'Concluído'] as const
type Phase = typeof PHASES[number]

// ── Phase tokens ──────────────────────────────────────────────────────────────

const PHASE_TOKEN: Record<Phase, {
  dot: string
  chipBg: string; chipText: string; chipBorder: string; chipLabel: string
  badgeBg: string; badgeText: string
}> = {
  'Backlog':              { dot: 'bg-text-muted',   chipBg: 'bg-surface-2',   chipText: 'text-text-secondary', chipBorder: 'border-border',      chipLabel: 'Backlog',       badgeBg: 'bg-[#e2e8f4]', badgeText: 'text-[#4d5b7c]' },
  'A fazer':              { dot: 'bg-[#303f59]',    chipBg: 'bg-[#e8eef8]',   chipText: 'text-[#303f59]',      chipBorder: 'border-[#c8d5ed]',   chipLabel: 'A fazer',       badgeBg: 'bg-[#dce6f8]', badgeText: 'text-[#303f59]' },
  'Em andamento':         { dot: 'bg-primary',      chipBg: 'bg-[#e6f7f7]',   chipText: 'text-[#007a7a]',      chipBorder: 'border-[#b3e5e5]',   chipLabel: 'Em andamento',  badgeBg: 'bg-[#cceeee]', badgeText: 'text-[#007a7a]' },
  'Aguardando/Bloqueado': { dot: 'bg-[#fbb33d]',    chipBg: 'bg-[#fef3e2]',   chipText: 'text-[#b45309]',      chipBorder: 'border-[#f9d9a0]',   chipLabel: 'Aguardando',    badgeBg: 'bg-[#fde8c8]', badgeText: 'text-[#b45309]' },
  'Em revisão':           { dot: 'bg-[#6787bf]',    chipBg: 'bg-[#eff3fb]',   chipText: 'text-[#6787bf]',      chipBorder: 'border-[#c5d5ef]',   chipLabel: 'Em revisão',    badgeBg: 'bg-[#dce7f8]', badgeText: 'text-[#6787bf]' },
  'Concluído':            { dot: 'bg-signal-green', chipBg: 'bg-[#f0faf5]',   chipText: 'text-[#2d8653]',      chipBorder: 'border-[#b2dfc8]',   chipLabel: 'Concluído',     badgeBg: 'bg-[#d4f0e3]', badgeText: 'text-[#2d8653]' },
}

interface User { id: string; name: string }

interface IariasKanbanProps {
  tasks: Task[]
  users: User[]
  currentUserId?: string
}

type ModalState =
  | { mode: 'create'; phase: Phase }
  | { mode: 'edit'; task: Task }

// ── Helpers ───────────────────────────────────────────────────────────────────

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.phase === 'Concluído') return false
  return new Date(task.due_date) < new Date()
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCalendar({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="11" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7.5h13" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconDots() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="13" cy="8" r="1.2" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconUser({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconMessage({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M14 9.333A1.333 1.333 0 0 1 12.667 10.667H4.667L2 13.333V3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Phase chip ────────────────────────────────────────────────────────────────

function PhaseChip({ phase }: { phase: string }) {
  const token = PHASE_TOKEN[phase as Phase] ?? PHASE_TOKEN['Backlog']
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-semibold font-label ${token.chipBg} ${token.chipText} ${token.chipBorder}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${token.dot}`} />
      {token.chipLabel}
    </div>
  )
}

// ── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  usersMap,
  onClick,
}: {
  task: Task
  usersMap: Record<string, string>
  onClick: () => void
}) {
  const overdue = isOverdue(task)
  const responsibleName = task.responsible_id ? usersMap[task.responsible_id] : null
  const descriptionText = stripHtml(task.description)

  return (
    <div
      onClick={onClick}
      className={[
        'bg-surface border flex flex-col gap-0 cursor-pointer transition-colors',
        overdue
          ? 'border-signal-red/40 hover:border-signal-red/70'
          : 'border-border hover:border-primary/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-2">
        <PhaseChip phase={task.phase} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="text-text-muted hover:text-text-secondary transition-colors p-0.5 shrink-0 mt-0.5"
          tabIndex={-1}
        >
          <IconDots />
        </button>
      </div>

      <p className="px-3.5 text-sm font-semibold text-text-primary leading-snug">{task.title}</p>

      {descriptionText && (
        <p className="px-3.5 mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
          {descriptionText}
        </p>
      )}

      <div className="px-3.5 mt-3 flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-label shrink-0">Responsável:</span>
        {responsibleName ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold text-primary leading-none">{initials(responsibleName)}</span>
            </div>
            <span className="text-[10px] text-text-secondary font-label truncate max-w-[120px]">{responsibleName}</span>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-dashed border-border flex items-center justify-center">
            <IconUser className="text-text-muted opacity-40" />
          </div>
        )}
      </div>

      <div className="mx-3.5 mt-3 border-t border-border-subtle" />

      <div className="px-3.5 py-3 flex items-center gap-3 flex-wrap">
        {task.due_date && (
          <div className={`flex items-center gap-1 ${overdue ? 'text-signal-red' : 'text-text-muted'}`}>
            <IconCalendar />
            <span className="text-[10px] font-label">{overdue && '⚠ '}{formatDate(task.due_date)}</span>
          </div>
        )}
        {task.comments && (
          <div className="flex items-center gap-1 text-text-muted">
            <IconMessage />
            <span className="text-[10px] font-label">1</span>
          </div>
        )}
        {task.links && task.links.length > 0 && (
          <div className="flex items-center gap-1 text-text-muted">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L8.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-label">{task.links.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function IariasKanban({ tasks: initialTasks, users, currentUserId }: IariasKanbanProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [modalState, setModalState] = useState<ModalState | null>(null)

  const usersMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  function handleCreate(task: Task) {
    setTasks((prev) => [...prev, task])
    setModalState(null)
  }

  function handleUpdate(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setModalState(null)
  }

  function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setModalState(null)
  }

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newPhase = destination.droppableId as Phase
    const prevTasks = tasks
    setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, phase: newPhase } : t)))
    const res = await moveTask(draggableId, newPhase)
    if (res.error) setTasks(prevTasks)
  }

  const byPhase = (phase: string) => tasks.filter((t) => t.phase === phase)

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PHASES.map((phase) => {
            const cards = byPhase(phase)
            const token = PHASE_TOKEN[phase]

            return (
              <div key={phase} className="flex-shrink-0 w-[272px] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-headline text-sm font-semibold text-text-primary truncate">{phase}</span>
                    <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold font-label ${token.badgeBg} ${token.badgeText}`}>
                      {cards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalState({ mode: 'create', phase })}
                      className="text-text-muted hover:text-text-primary transition-colors p-1"
                      aria-label={`Adicionar tarefa em ${phase}`}
                    >
                      <IconPlus />
                    </button>
                    <button type="button" className="text-text-muted hover:text-text-primary transition-colors p-1" tabIndex={-1}>
                      <IconDots />
                    </button>
                  </div>
                </div>

                <Droppable droppableId={phase}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={[
                        'flex flex-col gap-2.5 p-2 min-h-[240px] border border-border transition-colors',
                        snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20' : 'bg-surface-2/60',
                      ].join(' ')}
                    >
                      {cards.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(drag, dragSnapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={dragSnapshot.isDragging ? 'opacity-80 rotate-1' : ''}
                            >
                              <TaskCard
                                task={task}
                                usersMap={usersMap}
                                onClick={() => setModalState({ mode: 'edit', task })}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {modalState && (
        <TaskModal
          mode={modalState.mode}
          task={modalState.mode === 'edit' ? modalState.task : undefined}
          defaultPhase={modalState.mode === 'create' ? modalState.phase : undefined}
          startupId={IARIS_STARTUP_ID}
          quarter={IARIS_QUARTER}
          users={users}
          currentUserId={currentUserId}
          usersMap={usersMap}
          onClose={() => setModalState(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
