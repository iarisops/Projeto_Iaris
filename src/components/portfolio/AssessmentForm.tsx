'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { createAssessment, upsertAssessmentItem } from '@/lib/actions/assessments'

const CATEGORIES = ['Estratégia', 'Produto', 'Distribuição', 'Mercado', 'Operação', 'Founder'] as const
type Category = typeof CATEGORIES[number]

// ⚠️ Portfólio usa 4 sinais EMOJI — diferentes dos sinais CRM (verde/amarelo/vermelho)
const SIGNALS = ['🔴', '🟠', '🟡', '🟢'] as const
type Signal = typeof SIGNALS[number]

const SIGNAL_STYLE: Record<string, string> = {
  '🔴': 'bg-signal-red/20 border-signal-red text-signal-red',
  '🟠': 'bg-signal-orange/20 border-signal-orange text-signal-orange',
  '🟡': 'bg-signal-yellow/20 border-signal-yellow text-signal-yellow',
  '🟢': 'bg-signal-green/20 border-signal-green text-signal-green',
}

interface AssessmentItem {
  id: string
  category: string
  signal: string
  observed_evidence: string | null
  risk_interpretation: string | null
  next_focus: string | null
  responsible: string | null
  deadline: string | null
}

interface Criterion {
  category: string
  criterion: string
  what_to_observe: string | null
  green_description: string | null
  yellow_description: string | null
  orange_description: string | null
  red_description: string | null
}

interface AssessmentFormProps {
  startupId: string
  quarter: string
  assessmentId: string | null
  items: AssessmentItem[]
  criteria: Criterion[]
}

interface CategoryState {
  signal: Signal | ''
  observed_evidence: string
  risk_interpretation: string
  next_focus: string
  responsible: string
  deadline: string
  expanded: boolean
}

export function AssessmentForm({
  startupId, quarter, assessmentId: initialAssessmentId, items, criteria,
}: AssessmentFormProps) {
  const [activeAssessmentId, setActiveAssessmentId] = useState(initialAssessmentId)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [saving, setSaving] = useState<Category | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Initialize state from existing items
  const [categoryState, setCategoryState] = useState<Record<string, CategoryState>>(() => {
    const init: Record<string, CategoryState> = {}
    for (const cat of CATEGORIES) {
      const existing = items.find((i) => i.category === cat)
      init[cat] = {
        signal: (existing?.signal as Signal) ?? '',
        observed_evidence: existing?.observed_evidence ?? '',
        risk_interpretation: existing?.risk_interpretation ?? '',
        next_focus: existing?.next_focus ?? '',
        responsible: existing?.responsible ?? '',
        deadline: existing?.deadline ?? '',
        expanded: !!existing,
      }
    }
    return init
  })

  function updateField(cat: string, field: keyof CategoryState, value: string | boolean) {
    setCategoryState((prev) => ({ ...prev, [cat]: { ...prev[cat], [field]: value } }))
    setSaved((s) => { const n = new Set(s); n.delete(cat); return n })
  }

  async function handleSave(cat: Category) {
    const state = categoryState[cat]
    if (!state.signal) { setError('Selecione um sinal antes de salvar.'); return }
    setSaving(cat)
    setError(null)

    let assessId = activeAssessmentId
    if (!assessId) {
      const res = await createAssessment(startupId, quarter)
      if (res.error || !res.id) { setSaving(null); setError(res.error ?? 'Erro ao criar assessment.'); return }
      setActiveAssessmentId(res.id)
      assessId = res.id
    }

    const res = await upsertAssessmentItem(assessId, {
      category: cat,
      signal: state.signal as Signal,
      observed_evidence: state.observed_evidence || undefined,
      risk_interpretation: state.risk_interpretation || undefined,
      next_focus: state.next_focus || undefined,
      responsible: state.responsible || undefined,
      deadline: state.deadline || undefined,
    })

    setSaving(null)
    if (res.error) { setError(res.error) }
    else { setSaved((s) => new Set(s).add(cat)) }
  }

  const activeCriteria = activeCategory
    ? criteria.filter((c) => c.category === activeCategory)
    : []

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3">
        {error && (
          <p className="text-xs text-signal-red bg-signal-red/5 border border-signal-red/20 px-3 py-2">
            {error}
          </p>
        )}

        {CATEGORIES.map((cat) => {
          const state = categoryState[cat]
          const isActive = activeCategory === cat
          const isSaved = saved.has(cat)

          return (
            <div
              key={cat}
              className={[
                'bg-surface-2 border',
                isActive ? 'border-primary/50' : 'border-border',
              ].join(' ')}
            >
              {/* Category header */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => {
                  setActiveCategory(isActive ? null : cat)
                  setShowSidebar(false)
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-headline text-sm font-semibold text-text-primary">{cat}</span>
                  {state.signal && (
                    <span className="text-base">{state.signal}</span>
                  )}
                  {isSaved && <span className="text-xs text-signal-green">✓</span>}
                </div>
                <span className="text-text-muted text-xs">{isActive ? '▲' : '▼'}</span>
              </button>

              {isActive && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border">
                  {/* Signal selector */}
                  <div className="flex gap-2 pt-3">
                    {SIGNALS.map((sig) => (
                      <button
                        key={sig}
                        type="button"
                        onClick={() => updateField(cat, 'signal', sig)}
                        className={[
                          'flex-1 py-2 border text-lg transition-all',
                          state.signal === sig
                            ? SIGNAL_STYLE[sig]
                            : 'border-border text-text-muted hover:border-border-subtle',
                        ].join(' ')}
                      >
                        {sig}
                      </button>
                    ))}
                  </div>

                  {/* Fields */}
                  <button
                    type="button"
                    className="text-xs text-text-muted hover:text-primary text-left"
                    onClick={() => updateField(cat, 'expanded', !state.expanded)}
                  >
                    {state.expanded ? '▲ Recolher campos' : '▼ Expandir campos'}
                  </button>

                  {state.expanded && (
                    <div className="flex flex-col gap-3">
                      <Textarea
                        label="Evidência observada"
                        id={`${cat}-evidence`}
                        rows={2}
                        value={state.observed_evidence}
                        onChange={(e) => updateField(cat, 'observed_evidence', e.target.value)}
                      />
                      <Textarea
                        label="Interpretação do risco"
                        id={`${cat}-risk`}
                        rows={2}
                        value={state.risk_interpretation}
                        onChange={(e) => updateField(cat, 'risk_interpretation', e.target.value)}
                      />
                      <Textarea
                        label="Próximo foco"
                        id={`${cat}-focus`}
                        rows={2}
                        value={state.next_focus}
                        onChange={(e) => updateField(cat, 'next_focus', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Responsável"
                          id={`${cat}-responsible`}
                          value={state.responsible}
                          onChange={(e) => updateField(cat, 'responsible', e.target.value)}
                        />
                        <Input
                          label="Prazo"
                          id={`${cat}-deadline`}
                          type="date"
                          value={state.deadline}
                          onChange={(e) => updateField(cat, 'deadline', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 justify-end">
                    {activeCriteria.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-text-muted hover:text-primary"
                        onClick={() => setShowSidebar((v) => !v)}
                      >
                        {showSidebar ? 'Fechar rubricas' : 'Ver rubricas'}
                      </button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSave(cat)}
                      disabled={saving === cat || !state.signal}
                    >
                      {saving === cat ? 'Salvando…' : 'Salvar'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sidebar — rubricas */}
      {showSidebar && activeCategory && activeCriteria.length > 0 && (
        <div className="w-72 shrink-0 bg-surface-2 border border-border p-4 flex flex-col gap-4 self-start sticky top-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="font-label text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Rubricas — {activeCategory}
            </p>
            <button type="button" className="text-text-muted hover:text-primary" onClick={() => setShowSidebar(false)}>×</button>
          </div>
          {activeCriteria.map((c) => (
            <div key={c.criterion} className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-text-primary">{c.criterion}</p>
              {c.what_to_observe && (
                <p className="text-xs text-text-muted">{c.what_to_observe}</p>
              )}
              <div className="flex flex-col gap-0.5 mt-1">
                {c.green_description && (
                  <p className="text-[10px] text-signal-green">🟢 {c.green_description}</p>
                )}
                {c.yellow_description && (
                  <p className="text-[10px] text-signal-yellow">🟡 {c.yellow_description}</p>
                )}
                {c.orange_description && (
                  <p className="text-[10px] text-signal-orange">🟠 {c.orange_description}</p>
                )}
                {c.red_description && (
                  <p className="text-[10px] text-signal-red">🔴 {c.red_description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
