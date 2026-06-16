'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { createTask, updateTask, deleteTask } from '@/lib/actions/kanban'

const PHASES = ['Backlog', 'A fazer', 'Em andamento', 'Aguardando/Bloqueado', 'Em revisão', 'Concluído'] as const
type Phase = typeof PHASES[number]

export interface TaskLink {
  label: string
  url: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  phase: string
  responsible_id: string | null
  due_date: string | null
  comments: string | null
  links: TaskLink[]
  created_at: string | null
  created_by: string | null
}

interface User {
  id: string
  name: string
}

interface TaskModalProps {
  mode: 'create' | 'edit'
  task?: Task
  defaultPhase?: Phase
  startupId: string
  quarter: string
  users: User[]
  currentUserId?: string
  usersMap: Record<string, string>
  onClose: () => void
  onCreate: (task: Task) => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function formatRelative(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `há ${days} dia${days !== 1 ? 's' : ''}`
}

function formatDateInput(iso: string | null): string {
  if (!iso) return ''
  return iso.split('T')[0]
}

function formatDateDisplay(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="13" cy="8" r="1.3" />
    </svg>
  )
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L8.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Phase chip (local, reactive to form.phase) ─────────────────────────────────

const PHASE_CHIP_TOKEN: Record<string, { dot: string; bg: string; text: string; border: string; label: string }> = {
  'Backlog':              { dot: 'bg-text-muted',    bg: 'bg-surface-2',   text: 'text-text-secondary', border: 'border-border',      label: 'Backlog' },
  'A fazer':              { dot: 'bg-[#303f59]',     bg: 'bg-[#e8eef8]',   text: 'text-[#303f59]',      border: 'border-[#c8d5ed]',   label: 'A fazer' },
  'Em andamento':         { dot: 'bg-primary',       bg: 'bg-[#e6f7f7]',   text: 'text-[#007a7a]',      border: 'border-[#b3e5e5]',   label: 'Em andamento' },
  'Aguardando/Bloqueado': { dot: 'bg-[#fbb33d]',     bg: 'bg-[#fef3e2]',   text: 'text-[#b45309]',      border: 'border-[#f9d9a0]',   label: 'Aguardando' },
  'Em revisão':           { dot: 'bg-[#6787bf]',     bg: 'bg-[#eff3fb]',   text: 'text-[#6787bf]',      border: 'border-[#c5d5ef]',   label: 'Em revisão' },
  'Concluído':            { dot: 'bg-signal-green',  bg: 'bg-[#f0faf5]',   text: 'text-[#2d8653]',      border: 'border-[#b2dfc8]',   label: 'Concluído' },
}

function PhaseChip({ phase }: { phase: string }) {
  const t = PHASE_CHIP_TOKEN[phase] ?? PHASE_CHIP_TOKEN['Backlog']
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-semibold font-label ${t.bg} ${t.text} ${t.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
      {t.label}
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-label text-[10px] uppercase tracking-widest text-text-muted mb-2">{children}</p>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-7 h-7 text-[11px]' : 'w-5 h-5 text-[9px]'
  return (
    <div className={`${sz} rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0`}>
      <span className="font-semibold text-primary leading-none">{initials(name)}</span>
    </div>
  )
}

// ── Dots menu ──────────────────────────────────────────────────────────────────

function DotsMenu({ onDelete, disabled }: { onDelete: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
      >
        <IconDots />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border z-10 shadow-none">
          <button
            type="button"
            disabled={disabled}
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-signal-red hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <IconTrash />
            Excluir tarefa
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export function TaskModal({
  mode,
  task,
  defaultPhase,
  startupId,
  quarter,
  users,
  currentUserId,
  usersMap,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: TaskModalProps) {
  const isCreate = mode === 'create'

  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    responsible_id: task?.responsible_id ?? currentUserId ?? '',
    due_date: formatDateInput(task?.due_date ?? null),
    comments: task?.comments ?? '',
    phase: (task?.phase ?? defaultPhase ?? 'Backlog') as Phase,
    links: task?.links ?? [] as TaskLink[],
  })
  const [dirty, setDirty] = useState(isCreate)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [addingLink, setAddingLink] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    setError(null)
    setSaving(true)

    if (isCreate) {
      const res = await createTask(startupId, {
        quarter,
        title: form.title,
        description: form.description || undefined,
        phase: form.phase,
        responsible_id: form.responsible_id || undefined,
        due_date: form.due_date || undefined,
        comments: form.comments || undefined,
        links: form.links,
      })
      setSaving(false)
      if (res.error) { setError(res.error); return }
      onCreate({
        id: res.id!,
        title: form.title,
        description: form.description || null,
        phase: form.phase,
        responsible_id: form.responsible_id || null,
        due_date: form.due_date || null,
        comments: form.comments || null,
        links: form.links,
        created_at: new Date().toISOString(),
        created_by: currentUserId ?? null,
      })
    } else if (task) {
      const res = await updateTask(task.id, {
        title: form.title,
        description: form.description || undefined,
        phase: form.phase,
        responsible_id: form.responsible_id || undefined,
        due_date: form.due_date || undefined,
        comments: form.comments || undefined,
        links: form.links,
      })
      setSaving(false)
      if (res.error) { setError(res.error); return }
      onUpdate({
        ...task,
        title: form.title,
        description: form.description || null,
        phase: form.phase,
        responsible_id: form.responsible_id || null,
        due_date: form.due_date || null,
        comments: form.comments || null,
        links: form.links,
      })
    }
  }

  async function handleDelete() {
    if (!task) return
    if (!confirm('Excluir esta tarefa? Esta ação não pode ser desfeita.')) return
    setDeleting(true)
    const res = await deleteTask(task.id)
    setDeleting(false)
    if (res.error) { setError(res.error); return }
    onDelete(task.id)
  }

  function addLink() {
    if (!newLink.url.trim()) return
    const updated = [...form.links, { label: newLink.label || newLink.url, url: newLink.url }]
    set('links', updated)
    setNewLink({ label: '', url: '' })
    setAddingLink(false)
  }

  function removeLink(i: number) {
    set('links', form.links.filter((_, idx) => idx !== i))
  }

  const [activityFilter, setActivityFilter] = useState<'all' | 'atividades' | 'comentarios'>('all')

  const creatorName = task?.created_by ? usersMap[task.created_by] : null
  const userOptions = users.map((u) => ({ value: u.id, label: u.name }))
  const phaseOptions = PHASES.map((p) => ({ value: p, label: p }))

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        aria-modal
        role="dialog"
      >
        <div
          className="bg-surface border border-border w-full max-w-[540px] max-h-[92vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Top bar ── */}
          <div className="flex items-center justify-end gap-1 px-4 pt-3 pb-2 shrink-0">
            {!isCreate && (
              <DotsMenu onDelete={handleDelete} disabled={deleting} />
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Fechar"
            >
              <IconX />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">

            {/* Breadcrumb + due date */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <PhaseChip phase={form.phase} />
              <div className="text-right shrink-0">
                <p className="font-label text-[9px] uppercase tracking-widest text-text-muted">Data limite</p>
                {form.due_date
                  ? <p className="text-xs text-text-primary font-semibold">{formatDateDisplay(form.due_date)}</p>
                  : <p className="text-xs text-text-muted italic">Sem data</p>
                }
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Título da tarefa"
              className="w-full font-headline text-xl font-bold text-text-primary bg-transparent border-0 outline-none focus:ring-0 placeholder:text-text-muted/50 mb-1"
            />

            {/* Created by */}
            {!isCreate && creatorName && (
              <p className="text-[11px] text-text-muted mb-5">
                Criada por <span className="text-text-secondary font-medium">{creatorName}</span>
                {task?.created_at && <>, {formatRelative(task.created_at)}</>}
              </p>
            )}
            {!isCreate && !creatorName && task?.created_at && (
              <p className="text-[11px] text-text-muted mb-5">Criada {formatRelative(task.created_at)}</p>
            )}

            {/* ── RESPONSÁVEL ── */}
            <div className="mb-5">
              <SectionLabel>Responsável</SectionLabel>
              <Select
                id="task-resp"
                value={form.responsible_id}
                onChange={(e) => set('responsible_id', e.target.value)}
                options={userOptions}
                placeholder="Sem responsável"
              />
            </div>

            {/* ── DATA LIMITE ── */}
            <div className="mb-5">
              <SectionLabel>Data limite</SectionLabel>
              <Input
                id="task-due"
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
              />
            </div>

            {/* ── FASE ── */}
            <div className="mb-5">
              <SectionLabel>Fase</SectionLabel>
              <Select
                id="task-phase-select"
                value={form.phase}
                onChange={(e) => set('phase', e.target.value as Phase)}
                options={phaseOptions}
              />
            </div>

            {/* ── DESCRIÇÃO ── */}
            <div className="mb-5">
              <SectionLabel>Descrição</SectionLabel>
              <RichTextEditor
                value={form.description}
                onChange={(html) => set('description', html)}
                placeholder="Descreva a tarefa..."
                minHeight="140px"
              />
            </div>

            {/* ── LINKS ── */}
            <div className="mb-5">
              <SectionLabel>Links</SectionLabel>
              {form.links.length > 0 && (
                <ul className="flex flex-col gap-1.5 mb-2">
                  {form.links.map((link, i) => (
                    <li key={i} className="flex items-center gap-2 group">
                      <IconLink />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex-1 truncate"
                      >
                        {link.label}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-signal-red transition-all text-xs"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {addingLink ? (
                <div className="flex flex-col gap-2 bg-surface-2 border border-border p-3">
                  <Input
                    id="link-label"
                    label="Título do link"
                    value={newLink.label}
                    onChange={(e) => setNewLink((l) => ({ ...l, label: e.target.value }))}
                    placeholder="ex: Documento de especificação"
                  />
                  <Input
                    id="link-url"
                    label="URL"
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink((l) => ({ ...l, url: e.target.value }))}
                    placeholder="https://..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAddingLink(false)}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={addLink}>Adicionar</Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingLink(true)}
                  className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-primary transition-colors"
                >
                  <IconPlus />
                  Adicionar link
                </button>
              )}
            </div>

            {/* ── ATIVIDADES E COMENTÁRIOS ── */}
            <div className="mb-2">
              {/* Header + filter tabs */}
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Atividades e Comentários</SectionLabel>
                <div className="flex items-center gap-0 border border-border text-[10px] font-label shrink-0">
                  {(['all', 'atividades', 'comentarios'] as const).map((f) => {
                    const label = f === 'all' ? 'Todos' : f === 'atividades' ? 'Atividades' : 'Comentários'
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setActivityFilter(f)}
                        className={[
                          'px-2.5 py-1 transition-colors',
                          activityFilter === f
                            ? 'bg-primary text-white'
                            : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-2',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Atividades (log de criação) */}
              {activityFilter !== 'comentarios' && !isCreate && task?.created_at && (
                <div className="flex items-start gap-2.5 mb-3">
                  {creatorName
                    ? <Avatar name={creatorName} size="sm" />
                    : <div className="w-5 h-5 rounded-full bg-surface-2 border border-border shrink-0" />
                  }
                  <div className="flex-1">
                    <span className="text-xs text-text-secondary">
                      {creatorName
                        ? <><span className="font-medium">{creatorName}</span> criou esta tarefa</>
                        : 'Tarefa criada'
                      }
                    </span>
                    <span className="text-[10px] text-text-muted ml-2">{formatRelative(task.created_at)}</span>
                  </div>
                </div>
              )}

              {/* Comentários */}
              {activityFilter !== 'atividades' && (
                <Textarea
                  id="task-comments"
                  rows={5}
                  value={form.comments}
                  onChange={(e) => set('comments', e.target.value)}
                  placeholder="Adicionar comentário ou nota..."
                />
              )}
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex-1">
              {error && <p className="text-xs text-signal-red">{error}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
              <Button
                type="button"
                size="sm"
                disabled={saving || (!dirty && !isCreate)}
                onClick={handleSave}
              >
                {saving ? 'Salvando…' : isCreate ? 'Criar tarefa' : 'Salvar alterações'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
