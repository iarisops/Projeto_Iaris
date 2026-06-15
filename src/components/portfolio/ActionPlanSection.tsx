'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { createActionPlan, deleteActionPlan } from '@/lib/actions/action-plans'

interface Initiative { text: string; owner?: string; status?: string; notes?: string }

interface Plan {
  id: string
  title: string
  status: string | null
  notes: string | null
  okr_id: string | null
  initiatives: Initiative[] | null
}

interface ActionPlanSectionProps {
  startupId: string
  quarter: string
  okrs: { id: string; objective: string }[]
  plans: Plan[]
}

const STATUS_OPTIONS = [
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluído', label: 'Concluído' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const STATUS_VARIANT: Record<string, 'teal' | 'green' | 'muted'> = {
  'Em andamento': 'teal',
  'Concluído': 'green',
  'Cancelado': 'muted',
}

export function ActionPlanSection({ startupId, quarter, okrs, plans: initialPlans }: ActionPlanSectionProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', okr_id: '', status: 'Em andamento', notes: '' })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    const res = await createActionPlan(startupId, {
      title: form.title,
      okr_id: form.okr_id || undefined,
      status: form.status,
      notes: form.notes || undefined,
      quarter,
    })
    setSaving(false)
    if (res.error) { setError(res.error); return }
    if (res.id) {
      setPlans((prev) => [...prev, {
        id: res.id!,
        title: form.title,
        status: form.status,
        notes: form.notes || null,
        okr_id: form.okr_id || null,
        initiatives: null,
      }])
      setForm({ title: '', okr_id: '', status: 'Em andamento', notes: '' })
      setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este plano de ação?')) return
    await deleteActionPlan(id)
    setPlans((prev) => prev.filter((p) => p.id !== id))
  }

  // Group by OKR
  const byOkr: Record<string, Plan[]> = { __none__: [] }
  for (const okr of okrs) byOkr[okr.id] = []
  for (const plan of plans) {
    const key = plan.okr_id ?? '__none__'
    if (!byOkr[key]) byOkr[key] = []
    byOkr[key].push(plan)
  }

  function OkrLabel({ okrId }: { okrId: string }) {
    if (okrId === '__none__') return <span className="text-xs text-text-muted">Sem OKR vinculado</span>
    const okr = okrs.find((o) => o.id === okrId)
    return <span className="text-xs text-text-secondary">{okr?.objective ?? 'OKR'}</span>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Planos de Ação</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>+ Novo Plano</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input label="Título" id="plan-title" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Select label="OKR vinculado (opcional)" id="plan-okr"
            options={[{ value: '', label: '— nenhum —' }, ...okrs.map((o) => ({ value: o.id, label: o.objective }))]}
            value={form.okr_id}
            onChange={(e) => setForm((f) => ({ ...f, okr_id: e.target.value }))} />
          <Select label="Status" id="plan-status" options={STATUS_OPTIONS} value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          <Textarea label="Notas" id="plan-notes" rows={2} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Criando…' : 'Criar'}</Button>
          </div>
        </form>
      )}

      {plans.length === 0 && !showForm && (
        <p className="text-sm text-text-muted text-center py-6">Nenhum plano de ação para {quarter}.</p>
      )}

      {[...okrs.map((o) => o.id), '__none__'].map((okrId) => {
        const group = byOkr[okrId] ?? []
        if (group.length === 0) return null
        return (
          <div key={okrId} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1">
              <OkrLabel okrId={okrId} />
            </div>
            {group.map((plan) => (
              <div key={plan.id} className="bg-surface-2 border border-border p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-text-primary">{plan.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {plan.status && (
                      <Badge variant={STATUS_VARIANT[plan.status] ?? 'muted'}>{plan.status}</Badge>
                    )}
                    <button type="button" className="text-text-muted hover:text-signal-red text-xs"
                      onClick={() => handleDelete(plan.id)}>×</button>
                  </div>
                </div>
                {plan.initiatives && plan.initiatives.length > 0 && (
                  <div className="flex flex-col gap-1 pl-3 border-l border-border">
                    {plan.initiatives.map((init, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-text-secondary flex-1">{init.text}</span>
                        {init.owner && <span className="text-text-muted">{init.owner}</span>}
                        {init.status && <Badge variant="muted">{init.status}</Badge>}
                      </div>
                    ))}
                  </div>
                )}
                {plan.notes && <p className="text-xs text-text-muted">{plan.notes}</p>}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
