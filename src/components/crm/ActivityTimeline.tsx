'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { createActivity, updateActivity } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['crm_activities']['Row']

interface User {
  id: string
  name: string
}

interface ActivityTimelineProps {
  candidateId: string
  activities: Activity[]
  users: User[]
}

const statusBadge: Record<string, 'default' | 'green' | 'red' | 'amber' | 'yellow'> = {
  Pendente:  'amber',
  Concluída: 'green',
  Cancelada: 'red',
  // legacy values — kept for existing data display
  Agendada:  'default',
  Reagendada:'yellow',
}

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

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function nowTimeStr() {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  // round to nearest 15 min
  const m = String(Math.round(d.getMinutes() / 15) * 15 % 60).padStart(2, '0')
  return `${h}:${m}`
}

function isOverdue(activity: Activity) {
  if (['Concluída', 'Cancelada'].includes(activity.status)) return false
  return new Date(activity.date) < new Date()
}

export function ActivityTimeline({ candidateId, activities: initialActivities, users }: ActivityTimelineProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    type:           'Reunião',
    date:           todayStr(),
    time:           nowTimeStr(),
    status:         'Pendente',
    responsible_id: '',
    note:           '',
    external_link:  '',
  })

  const userOptions = [
    { value: '', label: '— Nenhum —' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ]

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date) return
    setLoading(true)

    const isoDate = `${form.date}T${form.time || '00:00'}:00`

    const res = await createActivity({
      startup_candidate_id: candidateId,
      type:           form.type,
      date:           isoDate,
      status:         form.status as 'Pendente' | 'Concluída' | 'Cancelada',
      responsible_id: form.responsible_id || undefined,
      note:           form.note || undefined,
      external_link:  form.external_link || undefined,
    })

    if (!res.error && res.id) {
      const newActivity: Activity = {
        id:                    res.id,
        startup_candidate_id:  candidateId,
        type:                  form.type,
        title:                 null,
        date:                  isoDate,
        status:                form.status,
        responsible_id:        form.responsible_id || null,
        note:                  form.note || null,
        external_link:         form.external_link || null,
        created_at:            new Date().toISOString(),
        updated_at:            new Date().toISOString(),
        created_by:            null,
        updated_by:            null,
      }
      setActivities((prev) => [newActivity, ...prev])
      setForm({
        type: 'Reunião', date: todayStr(), time: nowTimeStr(),
        status: 'Pendente', responsible_id: '', note: '', external_link: '',
      })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleStatusChange(id: string, status: string) {
    await updateActivity(id, { status: status as 'Pendente' | 'Concluída' | 'Cancelada' })
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Atividades
        </h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          + Nova atividade
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          {/* Row 1: Tipo + Responsável */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              id="act-type"
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            />
            <Select
              label="Responsável"
              id="act-resp"
              options={userOptions}
              value={form.responsible_id}
              onChange={(e) => set('responsible_id', e.target.value)}
            />
          </div>

          {/* Row 2: Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Data *"
              id="act-date"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
            <Input
              label="Hora"
              id="act-time"
              type="time"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
            />
          </div>

          {/* Row 3: Status */}
          <Select
            label="Status"
            id="act-status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          />

          <Textarea
            label="Nota"
            id="act-note"
            rows={2}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
          />
          <Input
            label="Link externo"
            id="act-link"
            type="url"
            value={form.external_link}
            onChange={(e) => set('external_link', e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      )}

      {sorted.length === 0 && (
        <p className="text-sm text-text-muted py-4 text-center">Nenhuma atividade registrada.</p>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((act) => {
          const overdue = isOverdue(act)
          const responsibleName = act.responsible_id ? (userMap[act.responsible_id] ?? null) : null
          return (
            <div
              key={act.id}
              className={[
                'flex gap-3 p-3 border',
                overdue ? 'border-signal-red/40 bg-signal-red/5' : 'border-border bg-surface-2',
              ].join(' ')}
            >
              <div className="w-1 shrink-0 rounded-sm bg-border self-stretch" />
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label text-xs text-text-primary font-semibold uppercase">
                    {act.type}
                  </span>
                  {overdue && <Badge variant="red" className="text-[10px]">Atrasada</Badge>}
                  <Badge variant={statusBadge[act.status] ?? 'default'} className="text-[10px]">
                    {act.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>
                    {new Date(act.date).toLocaleString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {responsibleName && (
                    <span className="text-text-muted font-label">
                      {responsibleName}
                    </span>
                  )}
                </div>
                {act.note && (
                  <p className="text-xs text-text-secondary mt-0.5">{act.note}</p>
                )}
                {act.external_link && (
                  <a
                    href={act.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Link externo ↗
                  </a>
                )}
              </div>

              {/* Quick status change */}
              <div className="shrink-0 self-start mt-0.5">
                {editingId === act.id ? (
                  <select
                    className="bg-surface border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
                    value={act.status}
                    onChange={async (e) => {
                      await handleStatusChange(act.id, e.target.value)
                      setEditingId(null)
                    }}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    className="text-[10px] text-text-muted hover:text-primary transition-colors"
                    onClick={() => setEditingId(act.id)}
                  >
                    Alterar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
