'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { createPortfolioActivity, updatePortfolioActivity } from '@/lib/actions/activities'

// ── Raw types from DB ─────────────────────────────────────────────
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

interface CrmActivity {
  id: string
  startup_candidate_id: string
  type: string
  date: string
  title: string | null
  status: string
  note: string | null
  external_link: string | null
  responsible_id: string | null
  created_at: string | null
}

// ── Unified type for display ──────────────────────────────────────
interface UnifiedActivity {
  id: string
  source: 'portfolio' | 'crm'
  type: string
  title: string | null
  date: string
  status: string
  notes: string | null
  external_link: string | null
  responsible_id: string | null
  created_at: string | null
}

function fromPortfolio(a: PortfolioActivity): UnifiedActivity {
  return {
    id: a.id, source: 'portfolio', type: a.type, title: null,
    date: a.date, status: a.status, notes: a.notes,
    external_link: a.external_link, responsible_id: a.responsible_id,
    created_at: a.created_at,
  }
}

function fromCrm(a: CrmActivity): UnifiedActivity {
  return {
    id: a.id, source: 'crm', type: a.type, title: a.title,
    date: a.date, status: a.status, notes: a.note,
    external_link: a.external_link, responsible_id: a.responsible_id,
    created_at: a.created_at,
  }
}

// ── Options ───────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, 'default' | 'green' | 'red' | 'amber'> = {
  Pendente: 'amber', Concluída: 'green', Cancelada: 'red', Agendada: 'default', Reagendada: 'default',
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

const NEXT_STATUS: Record<string, string> = {
  Pendente: 'Concluída', Concluída: 'Cancelada', Cancelada: 'Pendente',
  Agendada: 'Pendente',  Reagendada: 'Pendente',
}

function todayStr() { return new Date().toISOString().slice(0, 10) }
function isOverdue(a: UnifiedActivity) {
  if (['Concluída', 'Cancelada'].includes(a.status)) return false
  return new Date(a.date) < new Date()
}

// ── Component ─────────────────────────────────────────────────────
interface Props {
  startupId: string
  activities: PortfolioActivity[]
  crmActivities: CrmActivity[]
}

export function PortfolioActivitiesSection({ startupId, activities: initialPortfolio, crmActivities }: Props) {
  const [portfolioItems, setPortfolioItems] = useState(initialPortfolio)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const [form, setForm] = useState({
    type: 'Reunião', date: todayStr(), time: '09:00',
    status: 'Pendente', notes: '', external_link: '',
  })

  // Merge and sort both sources
  const unified: UnifiedActivity[] = [
    ...portfolioItems.map(fromPortfolio),
    ...crmActivities.map(fromCrm),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date) return
    setLoading(true)

    const isoDate = `${form.date}T${form.time || '00:00'}:00`
    const res = await createPortfolioActivity(startupId, {
      type: form.type,
      date: isoDate,
      status: form.status as 'Pendente' | 'Concluída' | 'Cancelada',
      notes: form.notes || undefined,
      external_link: form.external_link || undefined,
    })

    if (!res.error && res.id) {
      const now = new Date().toISOString()
      setPortfolioItems((prev) => [{
        id: res.id!, startup_id: startupId, type: form.type,
        date: isoDate, status: form.status, notes: form.notes || null,
        external_link: form.external_link || null, responsible_id: null,
        created_at: now, updated_at: now,
      }, ...prev])
      setForm({ type: 'Reunião', date: todayStr(), time: '09:00', status: 'Pendente', notes: '', external_link: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  function handleCycleStatus(item: UnifiedActivity) {
    if (item.source === 'crm') return // read-only from this page
    const next = NEXT_STATUS[item.status] ?? 'Pendente'
    startTransition(async () => {
      await updatePortfolioActivity(item.id, { status: next as 'Pendente' | 'Concluída' | 'Cancelada' })
      setPortfolioItems((prev) => prev.map((a) => a.id === item.id ? { ...a, status: next } : a))
    })
  }

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
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" id="pact-type" options={TYPE_OPTIONS}
              value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
            <Select label="Status" id="pact-status" options={STATUS_OPTIONS}
              value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data *" id="pact-date" type="date" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            <Input label="Hora" id="pact-time" type="time" value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
          </div>
          <Textarea label="Descrição" id="pact-notes" rows={2} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <Input label="Link externo" id="pact-link" type="url" value={form.external_link}
            onChange={(e) => setForm((f) => ({ ...f, external_link: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      )}

      {unified.length === 0 && !showForm && (
        <p className="text-sm text-text-muted py-4 text-center">Nenhuma atividade registrada.</p>
      )}

      <div className="flex flex-col gap-2">
        {unified.map((act) => {
          const overdue = isOverdue(act)
          const isCrm = act.source === 'crm'
          return (
            <div
              key={`${act.source}-${act.id}`}
              className={[
                'flex gap-3 p-3 border',
                overdue ? 'border-signal-red/40 bg-signal-red/5' : 'border-border bg-surface-2',
              ].join(' ')}
            >
              <div className={[
                'w-1 shrink-0 rounded-sm self-stretch',
                isCrm ? 'bg-[#fbb33d]/60' : 'bg-border',
              ].join(' ')} />

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {act.title && (
                    <span className="text-xs font-semibold text-text-primary">{act.title}</span>
                  )}
                  <span className="font-label text-[11px] text-text-muted uppercase tracking-wide">{act.type}</span>
                  {isCrm && (
                    <span className="text-[9px] font-label font-bold uppercase tracking-wide bg-[#fbb33d]/15 text-[#b45309] border border-[#fbb33d]/30 px-1.5 py-0.5">
                      CRM
                    </span>
                  )}
                  {overdue && <Badge variant="red" className="text-[10px]">Atrasada</Badge>}
                  {/* Clickable status badge — cycles on click (portfolio only) */}
                  <button
                    onClick={() => handleCycleStatus(act)}
                    disabled={isCrm}
                    className={isCrm ? 'cursor-default' : 'transition-opacity hover:opacity-75'}
                    title={isCrm ? 'Edite o status na página da candidata no CRM' : 'Clique para alterar status'}
                  >
                    <Badge variant={STATUS_BADGE[act.status] ?? 'default'} className="text-[10px]">
                      {act.status}
                    </Badge>
                  </button>
                </div>

                <span className="text-xs text-text-muted">
                  {new Date(act.date).toLocaleString('pt-BR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>

                {act.notes && <p className="text-xs text-text-secondary mt-0.5">{act.notes}</p>}
                {act.external_link && (
                  <a href={act.external_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">
                    Link externo ↗
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
