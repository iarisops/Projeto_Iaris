'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { saveQualitativeAssessment } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Assessment = Database['public']['Tables']['qualitative_assessments']['Row']

// ⚠️ CRM usa 3 sinais (verde/amarelo/vermelho), não os 4 emoji do portfólio (T052)
const CRM_CRITERIA = [
  'Founder / Time',
  'Clareza do problema',
  'Produto',
  'Distribuição / GTM',
  'Tração',
  'Mercado',
  'Diferencial',
  'Modelo de negócio',
  'Investimento',
  'Governança / Organização',
]

type Signal = 'verde' | 'amarelo' | 'vermelho' | ''

const signalStyle: Record<string, string> = {
  verde: 'bg-signal-green/20 border-signal-green text-signal-green',
  amarelo: 'bg-signal-yellow/20 border-signal-yellow text-signal-yellow',
  vermelho: 'bg-signal-red/20 border-signal-red text-signal-red',
  '': 'bg-surface-2 border-border text-text-muted',
}

const RECOMMENDATION_OPTIONS = [
  { value: '', label: '— sem recomendação —' },
  { value: 'Investor Day', label: 'Investor Day' },
  { value: 'Potencial', label: 'Potencial' },
  { value: 'Não avançar', label: 'Não avançar' },
]

interface QualitativeAssessmentFormProps {
  candidateId: string
  initial?: Assessment | null
}

export function QualitativeAssessmentForm({ candidateId, initial }: QualitativeAssessmentFormProps) {
  const initialSignals = (initial?.criteria_signals as Record<string, string>) ?? {}

  const [signals, setSignals] = useState<Record<string, Signal>>(
    Object.fromEntries(CRM_CRITERIA.map((c) => [c, (initialSignals[c] as Signal) ?? '']))
  )
  const [recommendation, setRecommendation] = useState(initial?.recommendation ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function cycleSignal(criterion: string) {
    const order: Signal[] = ['', 'verde', 'amarelo', 'vermelho']
    const current = signals[criterion]
    const next = order[(order.indexOf(current) + 1) % order.length]
    setSignals((s) => ({ ...s, [criterion]: next }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const cleanSignals: Record<string, string> = {}
    for (const [k, v] of Object.entries(signals)) {
      if (v) cleanSignals[k] = v
    }

    const res = await saveQualitativeAssessment(candidateId, {
      recommendation: (recommendation || undefined) as 'Investor Day' | 'Potencial' | 'Não avançar' | undefined,
      criteria_signals: cleanSignals,
      notes: notes || undefined,
    })

    setSaving(false)
    if (res.error) {
      setError(res.error)
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-muted">
        Clique no sinal de cada critério para alternar: sem sinal → verde → amarelo → vermelho.
      </p>

      <div className="flex flex-col gap-2">
        {CRM_CRITERIA.map((criterion) => {
          const signal = signals[criterion]
          return (
            <div
              key={criterion}
              className="flex items-center justify-between gap-3 py-2 border-b border-border"
            >
              <span className="text-sm text-text-primary">{criterion}</span>
              <button
                type="button"
                onClick={() => cycleSignal(criterion)}
                className={[
                  'px-3 py-1 border text-xs font-label uppercase tracking-wide transition-colors min-w-[90px]',
                  signalStyle[signal],
                ].join(' ')}
              >
                {signal || '—'}
              </button>
            </div>
          )
        })}
      </div>

      <Select
        label="Recomendação"
        id="qa-recommendation"
        options={RECOMMENDATION_OPTIONS}
        value={recommendation}
        onChange={(e) => { setRecommendation(e.target.value); setSaved(false) }}
      />

      <Textarea
        label="Notas gerais"
        id="qa-notes"
        rows={3}
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
      />

      {error && <p className="text-xs text-signal-red">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar avaliação'}
        </Button>
        {saved && <span className="text-xs text-signal-green">Salvo ✓</span>}
      </div>
    </div>
  )
}
