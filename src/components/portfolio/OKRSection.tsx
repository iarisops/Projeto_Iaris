'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { createOKR, updateOKR } from '@/lib/actions/okrs'

interface KeyResult { text: string; progress: number; notes?: string }

interface OKR {
  id: string
  objective: string
  status: string
  progress: number
  notes: string | null
  key_results: KeyResult[] | null
}

interface OKRSectionProps {
  startupId: string
  quarter: string
  okrs: OKR[]
}

const STATUS_OPTIONS = [
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Em atenção', label: 'Em atenção' },
  { value: 'Travado', label: 'Travado' },
  { value: 'Concluído', label: 'Concluído' },
  { value: 'Cancelado', label: 'Cancelado' },
  { value: 'Não alcançado', label: 'Não alcançado' },
]

const STATUS_VARIANT: Record<string, 'teal' | 'amber' | 'red' | 'green' | 'muted'> = {
  'Em andamento': 'teal',
  'Em atenção': 'amber',
  'Travado': 'red',
  'Concluído': 'green',
  'Cancelado': 'muted',
  'Não alcançado': 'muted',
}

export function OKRSection({ startupId, quarter, okrs: initialOKRs }: OKRSectionProps) {
  const [okrs, setOKRs] = useState(initialOKRs)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    objective: '', status: 'Em andamento', notes: '', keyResults: [''],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.objective.trim()) return
    setSaving(true)
    setError(null)
    const krs = form.keyResults
      .filter((k) => k.trim())
      .map((text) => ({ text, progress: 0 }))

    const res = await createOKR(startupId, {
      objective: form.objective,
      status: form.status as 'Em andamento' | 'Em atenção' | 'Travado' | 'Concluído' | 'Cancelado' | 'Não alcançado',
      notes: form.notes || undefined,
      quarter,
      key_results: krs.length ? krs : undefined,
    })
    setSaving(false)
    if (res.error) { setError(res.error); return }
    if (res.id) {
      setOKRs((prev) => [...prev, {
        id: res.id!,
        objective: form.objective,
        status: form.status,
        progress: 0,
        notes: form.notes || null,
        key_results: krs,
      }])
      setForm({ objective: '', status: 'Em andamento', notes: '', keyResults: [''] })
      setShowForm(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setOKRs((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    await updateOKR(id, { status: status as 'Em andamento' | 'Em atenção' | 'Travado' | 'Concluído' | 'Cancelado' | 'Não alcançado' })
    setEditingId(null)
  }

  async function handleProgressChange(id: string, progress: number) {
    setOKRs((prev) => prev.map((o) => (o.id === id ? { ...o, progress } : o)))
    await updateOKR(id, { progress })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">OKRs</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          + Novo OKR
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input
            label="Objetivo"
            id="okr-objective"
            value={form.objective}
            onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            required
          />
          <Select
            label="Status"
            id="okr-status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <span className="font-label text-xs text-text-secondary uppercase tracking-wide">Key Results</span>
            {form.keyResults.map((kr, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 bg-surface-2 border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder={`KR ${i + 1}`}
                  value={kr}
                  onChange={(e) => {
                    const krs = [...form.keyResults]
                    krs[i] = e.target.value
                    setForm((f) => ({ ...f, keyResults: krs }))
                  }}
                />
                {form.keyResults.length > 1 && (
                  <button type="button" className="text-text-muted hover:text-signal-red px-2"
                    onClick={() => setForm((f) => ({ ...f, keyResults: f.keyResults.filter((_, j) => j !== i) }))}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="text-xs text-primary hover:underline text-left"
              onClick={() => setForm((f) => ({ ...f, keyResults: [...f.keyResults, ''] }))}>
              + Adicionar KR
            </button>
          </div>
          <Textarea
            label="Notas"
            id="okr-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Criando…' : 'Criar OKR'}</Button>
          </div>
        </form>
      )}

      {okrs.length === 0 && !showForm && (
        <p className="text-sm text-text-muted text-center py-6">Nenhum OKR para {quarter}.</p>
      )}

      {okrs.map((okr) => {
        const expanded = expandedId === okr.id
        const variant = STATUS_VARIANT[okr.status] ?? 'muted'
        return (
          <div key={okr.id} className="bg-surface-2 border border-border">
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-start gap-2 justify-between">
                <p className="text-sm text-text-primary font-medium flex-1">{okr.objective}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === okr.id ? (
                    <select
                      autoFocus
                      value={okr.status}
                      onBlur={() => setEditingId(null)}
                      onChange={(e) => handleStatusChange(okr.id, e.target.value)}
                      className="bg-surface border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  ) : (
                    <button type="button" onClick={() => setEditingId(okr.id)}>
                      <Badge variant={variant}>{okr.status}</Badge>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(okr.progress, 100)}%` }}
                  />
                </div>
                <input
                  type="number"
                  min="0" max="100"
                  value={okr.progress}
                  onChange={(e) => handleProgressChange(okr.id, Number(e.target.value))}
                  className="w-14 bg-transparent border-b border-border text-xs text-text-muted text-right focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted">%</span>
              </div>

              {okr.key_results && okr.key_results.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-text-muted hover:text-primary text-left"
                  onClick={() => setExpandedId(expanded ? null : okr.id)}
                >
                  {expanded ? '▲' : '▼'} {okr.key_results.length} Key Result{okr.key_results.length !== 1 ? 's' : ''}
                </button>
              )}

              {expanded && okr.key_results && (
                <div className="flex flex-col gap-1 pl-3 border-l border-border mt-1">
                  {okr.key_results.map((kr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary flex-1">{kr.text}</span>
                      <span className="text-xs text-text-muted">{kr.progress}%</span>
                    </div>
                  ))}
                </div>
              )}

              {okr.notes && (
                <p className="text-xs text-text-muted border-t border-border/40 pt-2 mt-1">{okr.notes}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
