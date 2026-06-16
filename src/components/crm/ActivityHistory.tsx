'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { createActivity, updateActivity } from '@/lib/actions/candidates'
import { uploadCRMAttachment } from '@/lib/actions/storage'
import type { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['crm_activities']['Row']
type FilterType = 'Todos' | 'Notas' | 'Atividades' | 'Anexos'
type FormMode = null | 'atividade' | 'nota'

interface User { id: string; name: string }
interface Props {
  candidateId: string
  funnelId: string
  items: Activity[]
  users: User[]
}

// ── Status cycling ────────────────────────────────────────────────
const NEXT_STATUS: Record<string, string> = {
  Pendente:   'Concluída',
  Concluída:  'Cancelada',
  Cancelada:  'Pendente',
  Agendada:   'Pendente',
  Reagendada: 'Pendente',
}
const statusVariant: Record<string, 'default' | 'green' | 'red' | 'amber'> = {
  Pendente: 'amber', Concluída: 'green', Cancelada: 'red',
  Agendada: 'default', Reagendada: 'default',
}

// ── Form options ──────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'Pendente',  label: 'Pendente' },
  { value: 'Concluída', label: 'Concluída' },
  { value: 'Cancelada', label: 'Cancelada' },
]
const TYPE_OPTIONS = [
  { value: 'Reunião',   label: 'Reunião' },
  { value: 'Call',      label: 'Call' },
  { value: 'E-mail',    label: 'E-mail' },
  { value: 'WhatsApp',  label: 'WhatsApp' },
  { value: 'Evento',    label: 'Evento' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Outro',     label: 'Outro' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }
function nowTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(Math.round(d.getMinutes()/15)*15%60).padStart(2,'0')}`
}
function parseDateParts(dateStr: string) {
  return { date: dateStr.slice(0, 10), time: dateStr.slice(11, 16) || '00:00' }
}
function isOverdue(item: Activity) {
  if (['Concluída','Cancelada'].includes(item.status) || item.type === 'Nota' || item.type === 'Anexo') return false
  return new Date(item.date) < new Date()
}
function itemCategory(item: Activity): FilterType {
  if (item.type === 'Nota')  return 'Notas'
  if (item.type === 'Anexo') return 'Anexos'
  return 'Atividades'
}

// ── SVG Icons ─────────────────────────────────────────────────────
function Svg({ children, className = 'w-3.5 h-3.5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {children}
    </svg>
  )
}

// One icon per activity type + Nota + Anexo + gear
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Reunião':
      return <Svg><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></Svg>
    case 'Call':
      return <Svg><path d="M2.25 6.338c0-1.371 1.016-2.511 2.382-2.627l.106-.006a2.25 2.25 0 012.133 1.5l.311.933a2.25 2.25 0 01-.451 2.296l-.48.48a1.5 1.5 0 00-.333 1.564 11.974 11.974 0 004.93 4.93 1.5 1.5 0 001.563-.333l.48-.48a2.25 2.25 0 012.296-.45l.933.31a2.25 2.25 0 011.5 2.134v.106a2.25 2.25 0 01-2.628 2.38 16.49 16.49 0 01-14.724-14.724z"/></Svg>
    case 'E-mail':
      return <Svg><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></Svg>
    case 'WhatsApp':
      return <Svg><path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></Svg>
    case 'Evento':
      return <Svg><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15z"/></Svg>
    case 'Follow-up':
      return <Svg><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></Svg>
    case 'Nota':
      return <Svg><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></Svg>
    case 'Anexo':
      return <Svg><path d="m18.375 12.739-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"/></Svg>
    default: // Outro
      return <Svg><path d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></Svg>
  }
}

function GearIcon() {
  return (
    <Svg className="w-3.5 h-3.5">
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </Svg>
  )
}

// Circle icon per category with color coding
function ItemIconCircle({ item }: { item: Activity }) {
  const cat = itemCategory(item)
  const base = 'w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border'

  if (cat === 'Notas')  return <div className={`${base} bg-[#fffbeb] border-[#fbb33d]/60 text-[#b45309]`}><TypeIcon type="Nota" /></div>
  if (cat === 'Anexos') return <div className={`${base} bg-surface-2 border-border text-text-muted`}><TypeIcon type="Anexo" /></div>

  // Activity — same teal container, different icon per type
  return <div className={`${base} bg-[#eef8f8] border-[#009999]/50 text-[#007a7a]`}><TypeIcon type={item.type} /></div>
}

// ── TimelineItem ──────────────────────────────────────────────────
function TimelineItem({
  item, isLast, userMap, onStatusCycle, onEdit,
}: {
  item: Activity
  isLast: boolean
  userMap: Record<string, string>
  onStatusCycle: (id: string, nextStatus: string) => void
  onEdit: (item: Activity) => void
}) {
  const cat  = itemCategory(item)
  const overdue = isOverdue(item)
  const responsibleName = item.responsible_id ? (userMap[item.responsible_id] ?? null) : null

  const formattedDate = new Date(item.date).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  let attachmentName = item.note || 'Arquivo'
  if (cat === 'Anexos' && item.external_link && !item.note) {
    try { attachmentName = decodeURIComponent(new URL(item.external_link).pathname.split('/').pop() ?? 'Arquivo') }
    catch { /* noop */ }
  }

  return (
    <div id={`activity-${item.id}`} className="flex gap-3 relative pb-4 scroll-mt-4">
      {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />}

      <ItemIconCircle item={item} />

      <div className="flex-1 min-w-0 flex gap-2">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            {cat === 'Atividades' && (
              <>
                <span className="text-sm font-semibold text-text-primary leading-snug">
                  {item.title || item.type}
                </span>
                <span className="text-[10px] font-label uppercase tracking-wide text-text-muted bg-surface-2 border border-border px-1.5 py-0.5">
                  {item.type}
                </span>
                {overdue && <Badge variant="red" className="text-[9px]">Atrasada</Badge>}
                {/* Clickable status badge — cycles on click */}
                <button
                  onClick={() => onStatusCycle(item.id, NEXT_STATUS[item.status] ?? 'Pendente')}
                  title="Clique para alterar status"
                  className="transition-opacity hover:opacity-75"
                >
                  <Badge variant={statusVariant[item.status] ?? 'default'} className="text-[9px] cursor-pointer">
                    {item.status}
                  </Badge>
                </button>
              </>
            )}
            {cat === 'Notas' && (
              <span className="text-sm font-semibold text-text-primary">Nota</span>
            )}
            {cat === 'Anexos' && (
              <>
                <span className="text-sm font-semibold text-text-primary truncate max-w-[200px]">
                  {attachmentName}
                </span>
                {attachmentName.includes('.') && (
                  <span className="text-[9px] font-label font-bold text-text-muted bg-border px-1 py-0.5 shrink-0">
                    {attachmentName.split('.').pop()?.toUpperCase()}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Responsible */}
          {responsibleName && (
            <p className="text-[11px] text-text-muted font-label mb-0.5">{responsibleName}</p>
          )}

          {/* Note text */}
          {cat === 'Notas' && item.note && (
            <p className="text-xs text-text-secondary whitespace-pre-wrap">{item.note}</p>
          )}
          {cat === 'Atividades' && item.note && (
            <p className="text-xs text-text-secondary mt-0.5">{item.note}</p>
          )}

          {/* Links */}
          {cat === 'Anexos' && item.external_link && (
            <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              Baixar arquivo ↗
            </a>
          )}
          {cat === 'Atividades' && item.external_link && (
            <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
              Link externo ↗
            </a>
          )}
        </div>

        {/* Right: timestamp + actions */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 min-w-[110px]">
          <span className="text-[10px] text-text-muted font-label text-right leading-snug">{formattedDate}</span>
          {cat === 'Atividades' && (
            <button
              onClick={() => onEdit(item)}
              title="Editar atividade"
              className="text-text-muted hover:text-primary transition-colors"
            >
              <GearIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────
function EditActivityModal({
  item,
  users,
  onClose,
  onSaved,
}: {
  item: Activity
  users: User[]
  onClose: () => void
  onSaved: (updated: Partial<Activity>) => void
}) {
  const { date, time } = parseDateParts(item.date)
  const [form, setForm] = useState({
    title:          item.title ?? '',
    type:           item.type,
    responsible_id: item.responsible_id ?? '',
    date,
    time,
    status:         item.status,
    note:           item.note ?? '',
    external_link:  item.external_link ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const set = <K extends keyof typeof form>(key: K, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const userOptions = [
    { value: '', label: '— Nenhum —' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ]

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Nome da Tarefa é obrigatório.'); return }
    setSaving(true)
    setError(null)

    const isoDate = `${form.date}T${form.time || '00:00'}:00`
    const res = await updateActivity(item.id, {
      title:          form.title.trim(),
      type:           form.type,
      date:           isoDate,
      status:         form.status as 'Pendente' | 'Concluída' | 'Cancelada',
      responsible_id: form.responsible_id || undefined,
      note:           form.note || undefined,
      external_link:  form.external_link || undefined,
    })

    setSaving(false)
    if (res.error) { setError(res.error); return }

    onSaved({
      title:          form.title.trim(),
      type:           form.type,
      date:           isoDate,
      status:         form.status,
      responsible_id: form.responsible_id || null,
      note:           form.note || null,
      external_link:  form.external_link || null,
    })
  }

  return (
    <Modal open onClose={onClose} title="Editar atividade" size="lg">
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <Input label="Nome da Tarefa *" id="ea-title" value={form.title}
          onChange={(e) => set('title', e.target.value)} required autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" id="ea-type" options={TYPE_OPTIONS}
            value={form.type} onChange={(e) => set('type', e.target.value)} />
          <Select label="Responsável" id="ea-resp"
            options={[{ value: '', label: '— Nenhum —' }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
            value={form.responsible_id} onChange={(e) => set('responsible_id', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data *" id="ea-date" type="date" value={form.date}
            onChange={(e) => set('date', e.target.value)} required />
          <Input label="Hora" id="ea-time" type="time" value={form.time}
            onChange={(e) => set('time', e.target.value)} />
        </div>
        <Select label="Status" id="ea-status" options={STATUS_OPTIONS}
          value={form.status} onChange={(e) => set('status', e.target.value)} />
        <Textarea label="Descrição" id="ea-note" rows={2} value={form.note}
          onChange={(e) => set('note', e.target.value)} />
        <Input label="Link externo" id="ea-link" type="url" value={form.external_link}
          onChange={(e) => set('external_link', e.target.value)} />
        {error && <p className="text-xs text-signal-red">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button type="submit" size="sm" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main component ────────────────────────────────────────────────
export function ActivityHistory({ candidateId, funnelId, items: initial, users }: Props) {
  const [items,     setItems]     = useState(initial)
  const [filter,    setFilter]    = useState<FilterType>('Todos')
  const [formMode,  setFormMode]  = useState<FormMode>(null)
  const [editingItem, setEditingItem] = useState<Activity | null>(null)
  const [loading,   setLoading]   = useState(false)

  // Open edit modal when URL hash matches an activity id (e.g. #activity-{id})
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#activity-')) return
    const activityId = hash.slice('#activity-'.length)
    const found = initial.find(
      (item) => item.id === activityId && item.type !== 'Nota' && item.type !== 'Anexo'
    )
    if (found) setEditingItem(found)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [uploading, setUploading] = useState(false)
  const [, startTransition]       = useTransition()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  // ── Form states
  const [actForm, setActForm] = useState({
    title: '', type: 'Reunião', responsible_id: '',
    date: todayStr(), time: nowTimeStr(),
    status: 'Pendente', note: '', external_link: '',
  })
  const [noteText, setNoteText] = useState('')

  // ── Counts
  const counts = {
    Todos:      items.length,
    Notas:      items.filter((i) => i.type === 'Nota').length,
    Atividades: items.filter((i) => i.type !== 'Nota' && i.type !== 'Anexo').length,
    Anexos:     items.filter((i) => i.type === 'Anexo').length,
  }

  const filtered = [...items]
    .filter((i) => {
      if (filter === 'Notas')      return i.type === 'Nota'
      if (filter === 'Atividades') return i.type !== 'Nota' && i.type !== 'Anexo'
      if (filter === 'Anexos')     return i.type === 'Anexo'
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // ── Status cycle
  function handleStatusCycle(id: string, nextStatus: string) {
    startTransition(async () => {
      await updateActivity(id, { status: nextStatus as 'Pendente' | 'Concluída' | 'Cancelada' })
      setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: nextStatus } : a))
    })
  }

  // ── Save atividade
  async function handleSaveAtividade(e: React.FormEvent) {
    e.preventDefault()
    if (!actForm.title.trim() || !actForm.date) return
    setLoading(true)

    const isoDate = `${actForm.date}T${actForm.time || '00:00'}:00`
    const res = await createActivity({
      startup_candidate_id: candidateId,
      type:           actForm.type,
      title:          actForm.title.trim(),
      date:           isoDate,
      status:         actForm.status as 'Pendente' | 'Concluída' | 'Cancelada',
      responsible_id: actForm.responsible_id || undefined,
      note:           actForm.note || undefined,
      external_link:  actForm.external_link || undefined,
    })

    if (!res.error && res.id) {
      setItems((prev) => [{
        id: res.id!, startup_candidate_id: candidateId,
        type: actForm.type, title: actForm.title.trim(), date: isoDate,
        status: actForm.status, responsible_id: actForm.responsible_id || null,
        note: actForm.note || null, external_link: actForm.external_link || null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        created_by: null, updated_by: null,
      }, ...prev])
      setActForm({ title: '', type: 'Reunião', responsible_id: '', date: todayStr(), time: nowTimeStr(), status: 'Pendente', note: '', external_link: '' })
      setFormMode(null)
    }
    setLoading(false)
  }

  // ── Save nota
  async function handleSaveNota(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    setLoading(true)

    const res = await createActivity({
      startup_candidate_id: candidateId,
      type: 'Nota', date: new Date().toISOString(),
      status: 'Concluída', note: noteText.trim(),
    })

    if (!res.error && res.id) {
      setItems((prev) => [{
        id: res.id!, startup_candidate_id: candidateId,
        type: 'Nota', title: null, date: new Date().toISOString(),
        status: 'Concluída', note: noteText.trim(), external_link: null,
        responsible_id: null, created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), created_by: null, updated_by: null,
      }, ...prev])
      setNoteText('')
      setFormMode(null)
    }
    setLoading(false)
  }

  // ── Upload arquivo
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fd = new FormData()
      fd.append('file', file)
      const { url, error: upErr } = await uploadCRMAttachment(fd, funnelId)
      if (upErr || !url) continue

      const res = await createActivity({
        startup_candidate_id: candidateId,
        type: 'Anexo', date: new Date().toISOString(),
        status: 'Concluída', external_link: url, note: file.name,
      })

      if (!res.error && res.id) {
        setItems((prev) => [{
          id: res.id!, startup_candidate_id: candidateId,
          type: 'Anexo', title: null, date: new Date().toISOString(),
          status: 'Concluída', external_link: url, note: file.name,
          responsible_id: null, created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), created_by: null, updated_by: null,
        }, ...prev])
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const FILTERS: FilterType[] = ['Todos', 'Notas', 'Atividades', 'Anexos']

  return (
    <div className="px-4 pb-6 pt-4 flex flex-col gap-4">

      {/* Header: filters + actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={[
                'text-[11px] font-label uppercase tracking-wide px-2.5 py-1 border transition-colors',
                filter === f
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-muted border-border hover:border-primary/40 hover:text-primary',
              ].join(' ')}>
              {f} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setFormMode(formMode === 'atividade' ? null : 'atividade')}
            className={[
              'text-[11px] font-label font-semibold uppercase tracking-wide px-2 py-1 border transition-colors',
              formMode === 'atividade'
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-primary border-primary/30 hover:bg-primary/5',
            ].join(' ')}>
            + Atividade
          </button>
          <button onClick={() => setFormMode(formMode === 'nota' ? null : 'nota')}
            className={[
              'text-[11px] font-label font-semibold uppercase tracking-wide px-2 py-1 border transition-colors',
              formMode === 'nota'
                ? 'bg-[#fbb33d]/10 text-[#b45309] border-[#fbb33d]/40'
                : 'text-text-muted border-border hover:border-[#fbb33d]/40 hover:text-[#b45309]',
            ].join(' ')}>
            + Nota
          </button>
          <label className={[
            'text-[11px] font-label font-semibold uppercase tracking-wide px-2 py-1 border transition-colors cursor-pointer',
            uploading ? 'text-text-muted border-border' : 'text-text-muted border-border hover:border-primary/40 hover:text-primary',
          ].join(' ')}>
            {uploading ? 'Enviando…' : '+ Arquivo'}
            <input ref={fileInputRef} type="file" multiple className="hidden"
              disabled={uploading} onChange={(e) => handleFiles(e.target.files)} />
          </label>
        </div>
      </div>

      {/* Inline form: Atividade */}
      {formMode === 'atividade' && (
        <form onSubmit={handleSaveAtividade} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input label="Nome da Tarefa *" id="ah-title" value={actForm.title}
            onChange={(e) => setActForm((f) => ({ ...f, title: e.target.value }))} required autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" id="ah-type" options={TYPE_OPTIONS}
              value={actForm.type} onChange={(e) => setActForm((f) => ({ ...f, type: e.target.value }))} />
            <Select label="Responsável" id="ah-resp"
              options={[{ value: '', label: '— Nenhum —' }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
              value={actForm.responsible_id} onChange={(e) => setActForm((f) => ({ ...f, responsible_id: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data *" id="ah-date" type="date" value={actForm.date}
              onChange={(e) => setActForm((f) => ({ ...f, date: e.target.value }))} required />
            <Input label="Hora" id="ah-time" type="time" value={actForm.time}
              onChange={(e) => setActForm((f) => ({ ...f, time: e.target.value }))} />
          </div>
          <Select label="Status" id="ah-status" options={STATUS_OPTIONS}
            value={actForm.status} onChange={(e) => setActForm((f) => ({ ...f, status: e.target.value }))} />
          <Textarea label="Descrição" id="ah-note" rows={2} value={actForm.note}
            onChange={(e) => setActForm((f) => ({ ...f, note: e.target.value }))} />
          <Input label="Link externo" id="ah-link" type="url" value={actForm.external_link}
            onChange={(e) => setActForm((f) => ({ ...f, external_link: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormMode(null)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      )}

      {/* Inline form: Nota */}
      {formMode === 'nota' && (
        <form onSubmit={handleSaveNota} className="bg-[#fffbeb] border border-[#fbb33d]/30 p-4 flex flex-col gap-3">
          <Textarea label="Nota *" id="ah-nota-text" rows={3} value={noteText}
            onChange={(e) => setNoteText(e.target.value)} autoFocus />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setFormMode(null)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading || !noteText.trim()}>
              {loading ? 'Salvando…' : 'Salvar nota'}
            </Button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">
          Nenhum registro{filter !== 'Todos' ? ` em ${filter.toLowerCase()}` : ''}.
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((item, idx) => (
            <TimelineItem
              key={item.id}
              item={item}
              isLast={idx === filtered.length - 1}
              userMap={userMap}
              onStatusCycle={handleStatusCycle}
              onEdit={setEditingItem}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingItem && (
        <EditActivityModal
          item={editingItem}
          users={users}
          onClose={() => setEditingItem(null)}
          onSaved={(updated) => {
            setItems((prev) =>
              prev.map((a) => a.id === editingItem.id ? { ...a, ...updated } : a)
            )
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}
