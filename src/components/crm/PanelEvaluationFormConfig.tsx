'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  createPanelEvaluationForm,
  duplicatePanelEvaluationForm,
} from '@/lib/actions/funnels'
import type { Database } from '@/types/supabase'

type PanelForm = Database['public']['Tables']['panel_evaluation_forms']['Row']

interface Criterion {
  label: string
  type: 'numeric' | 'boolean' | 'text'
  max_score?: number
}

interface PanelEvaluationFormConfigProps {
  funnelId: string
  forms: PanelForm[]
}

const TYPE_OPTIONS = [
  { value: 'numeric', label: 'Numérico' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'text', label: 'Texto' },
]

function CriterionRow({
  criterion,
  index: _index,
  onChange,
  onRemove,
}: {
  criterion: Criterion
  index: number
  onChange: (c: Criterion) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <Input
          placeholder="Label do critério"
          value={criterion.label}
          onChange={(e) => onChange({ ...criterion, label: e.target.value })}
        />
      </div>
      <div className="w-32">
        <Select
          options={TYPE_OPTIONS}
          value={criterion.type}
          onChange={(e) =>
            onChange({ ...criterion, type: e.target.value as Criterion['type'] })
          }
        />
      </div>
      {criterion.type === 'numeric' && (
        <div className="w-20">
          <Input
            type="number"
            placeholder="Max"
            value={criterion.max_score ?? ''}
            onChange={(e) =>
              onChange({ ...criterion, max_score: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="text-text-muted hover:text-signal-red transition-colors text-lg mt-1"
        title="Remover"
      >
        ×
      </button>
    </div>
  )
}

export function PanelEvaluationFormConfig({ funnelId, forms: initialForms }: PanelEvaluationFormConfigProps) {
  const [forms, setForms] = useState(initialForms)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(
    initialForms[0]?.id ?? null
  )
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateTarget, setDuplicateTarget] = useState('')
  const [duplicating, setDuplicating] = useState(false)

  const selectedForm = forms.find((f) => f.id === selectedFormId)

  function addCriterion() {
    setCriteria((prev) => [...prev, { label: '', type: 'numeric', max_score: 10 }])
  }

  function updateCriterion(index: number, updated: Criterion) {
    setCriteria((prev) => prev.map((c, i) => (i === index ? updated : c)))
  }

  function removeCriterion(index: number) {
    setCriteria((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)

    const res = await createPanelEvaluationForm(funnelId, {
      name: newName.trim(),
      criteria: criteria.filter((c) => c.label.trim()),
    })

    setSaving(false)
    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      const newForm: PanelForm = {
        id: res.id,
        funnel_id: funnelId,
        name: newName.trim(),
        criteria: criteria as unknown as Database['public']['Tables']['panel_evaluation_forms']['Row']['criteria'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      }
      setForms((prev) => [...prev, newForm])
      setSelectedFormId(res.id)
      setShowNew(false)
      setNewName('')
      setCriteria([])
    }
  }

  async function handleDuplicate() {
    if (!selectedFormId || !duplicateTarget.trim()) return
    setDuplicating(true)
    const res = await duplicatePanelEvaluationForm(selectedFormId, duplicateTarget.trim())
    setDuplicating(false)
    if (res.error) {
      setError(res.error)
    } else {
      alert(`Formulário duplicado com ID: ${res.id}`)
      setDuplicateTarget('')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Formulários de Banca
        </h3>
        <Button size="sm" variant="secondary" onClick={() => setShowNew((v) => !v)}>
          + Novo formulário
        </Button>
      </div>

      {forms.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {forms.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFormId(f.id)}
              className={[
                'px-3 py-1 text-xs font-label border transition-colors',
                selectedFormId === f.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-text-muted hover:border-primary/50',
              ].join(' ')}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {selectedForm && (
        <div className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <p className="font-label text-sm text-text-primary">{selectedForm.name}</p>

          {Array.isArray(selectedForm.criteria) && selectedForm.criteria.length > 0 && (
            <div className="flex flex-col gap-1">
              {(selectedForm.criteria as unknown as Criterion[]).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-text-secondary">{c.label}</span>
                  <span className="text-text-muted">{c.type}{c.max_score != null ? ` / ${c.max_score}` : ''}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-2 flex-wrap">
            <Input
              placeholder="ID do funil destino"
              value={duplicateTarget}
              onChange={(e) => setDuplicateTarget(e.target.value)}
              className="flex-1 min-w-40"
            />
            <Button size="sm" variant="secondary" onClick={handleDuplicate} disabled={duplicating}>
              {duplicating ? 'Duplicando…' : 'Duplicar para nova edição'}
            </Button>
          </div>
        </div>
      )}

      {showNew && (
        <div className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input
            label="Nome do formulário"
            id="pef-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary uppercase font-label tracking-wide">Critérios</p>
              <button
                type="button"
                onClick={addCriterion}
                className="text-xs text-primary hover:underline"
              >
                + Adicionar critério
              </button>
            </div>

            {criteria.map((c, i) => (
              <CriterionRow
                key={i}
                criterion={c}
                index={i}
                onChange={(updated) => updateCriterion(i, updated)}
                onRemove={() => removeCriterion(i)}
              />
            ))}
          </div>

          {error && <p className="text-xs text-signal-red">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNew(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando…' : 'Criar formulário'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
