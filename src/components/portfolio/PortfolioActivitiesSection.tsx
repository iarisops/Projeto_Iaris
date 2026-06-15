'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { createPortfolioActivity, updatePortfolioActivity } from '@/lib/actions/activities'

interface PortfolioActivity {
  id: string
  startup_id: string
  type: string
  date: string
  status: string
  notes: string | null
  external_link: string | null
  responsible_id: string | null
  created_at: string | null
  updated_at: string | null
}

interface PortfolioActivitiesSectionProps {
  startupId: string
  activities: PortfolioActivity[]
}

const STATUS_BADGE: Record<string, 'default' | 'green' | 'red' | 'amber' | 'yellow'> = {
  Pendente: 'amber',
  Agendada: 'default',
  Concluída: 'green',
  Reagendada: 'yellow',
  Cancelada: 'red',
}

const STATUS_OPTIONS = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Agendada', label: 'Agendada' },
  { value: 'Concluída', label: 'Concluída' },
  { value: 'Reagendada', label: 'Reagendada' },
  { value: 'Cancelada', label: 'Cancelada' },
]

const TYPE_OPTIONS = [
  { value: 'Reunião', label: 'Reunião' },
  { value: 'Call', label: 'Call' },
  { value: 'E-mail', label: 'E-mail' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Evento', label: 'Evento' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Outro', label: 'Outro' },
]

function isOverdue(activity: PortfolioActivity) {
  const done = ['Concluída', 'Cancelada']
  if (done.includes(activity.status)) return false
  return new Date(activity.date) < new Date()
}

export function PortfolioActivitiesSection({ startupId, activities: initialActivities }: PortfolioActivitiesSectionProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ type: 'Reunião', date: '', status: 'Pendente', notes: '', external_link: '' })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date) return
    setLoading(true)
    const res = await createPortfolioActivity(startupId, {
      type: form.type,
      date: form.date,
      status: form.status as 'Pendente' | 'Agendada' | 'Concluída' | 'Reagendada' | 'Cancelada',
      notes: form.notes || undefined,
      external_link: form.external_link || undefined,
    })
    if (!res.error && res.id) {
      const now = new Date().toISOString()
      setActivities((prev) => [{
        id: res.id!,
        startup_id: startupId,
        type: form.type,
        date: form.date,
        status: form.status,
        notes: form.notes || null,
        external_link: form.external_link || null,
        responsible_id: null,
        created_at: now,
        updated_at: now,
      }, ...prev])
      setForm({ type: 'Reunião', date: '', status: 'Pendente', notes: '', external_link: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  async function handleStatusChange(id: string, status: string) {
    await updatePortfolioActivity(id, { status: status as 'Pendente' | 'Agendada' | 'Concluída' | 'Reagendada' | 'Cancelada' })
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    setEditingId(null)
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Atividades</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>+ Nova atividade</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" id="pact-type" options={TYPE_OPTIONS} value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
            <Input label="Data" id="pact-date" type="datetime-local" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <Select label="Status" id="pact-status" options={STATUS_OPTIONS} value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          <Textarea label="Nota" id="pact-notes" rows={2} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <Input label="Link externo" id="pact-link" type="url" value={form.external_link}
            onChange={(e) => setForm((f) => ({ ...f, external_link: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-text-muted py-4 text-center">Nenhuma atividade registrada.</p>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((act) => {
          const overdue = isOverdue(act)
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
                  <span className="font-label text-xs text-text-primary font-semibold uppercase">{act.type}</span>
                  {overdue && <Badge variant="red" className="text-[10px]">Atrasada</Badge>}
                  <Badge variant={STATUS_BADGE[act.status] ?? 'default'} className="text-[10px]">{act.status}</Badge>
                </div>
                <span className="text-xs text-text-muted">{new Date(act.date).toLocaleString('pt-BR')}</span>
                {act.notes && <p className="text-xs text-text-secondary mt-1">{act.notes}</p>}
                {act.external_link && (
                  <a href={act.external_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">
                    Link externo ↗
                  </a>
                )}
              </div>
              <div className="shrink-0">
                {editingId === act.id ? (
                  <select
                    className="bg-surface border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
                    value={act.status}
                    autoFocus
                    onChange={async (e) => handleStatusChange(act.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                ) : (
                  <button className="text-[10px] text-text-muted hover:text-primary" onClick={() => setEditingId(act.id)}>
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
