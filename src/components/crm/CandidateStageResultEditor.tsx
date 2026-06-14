'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { moveStage, setResult } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']
type Result = 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'

interface CandidateStageResultEditorProps {
  candidateId: string
  currentStageId: string | null
  currentResult: string
  stages: Stage[]
}

const RESULT_OPTIONS = [
  { value: 'Em aberto', label: 'Em aberto' },
  { value: 'Ganha', label: 'Ganha' },
  { value: 'Perdida', label: 'Perdida' },
  { value: 'Acompanhar futuramente', label: 'Acompanhar futuramente' },
]

const resultColor: Record<string, string> = {
  'Em aberto': 'text-text-secondary',
  'Ganha': 'text-signal-green',
  'Perdida': 'text-signal-red',
  'Acompanhar futuramente': 'text-accent',
}

export function CandidateStageResultEditor({
  candidateId,
  currentStageId,
  currentResult,
  stages,
}: CandidateStageResultEditorProps) {
  const activeStages = stages.filter((s) => !s.is_archived).sort((a, b) => a.position - b.position)
  const stageOptions = [
    { value: '', label: '— sem etapa —' },
    ...activeStages.map((s) => ({ value: s.id, label: s.name })),
  ]

  const [stageId, setStageId] = useState(currentStageId ?? '')
  const [result, setResultState] = useState(currentResult)
  const [savingStage, setSavingStage] = useState(false)
  const [savingResult, setSavingResult] = useState(false)

  async function handleStageChange(newStageId: string) {
    setStageId(newStageId)
    if (!newStageId) return
    setSavingStage(true)
    await moveStage(candidateId, newStageId)
    setSavingStage(false)
  }

  async function handleResultChange(newResult: string) {
    setResultState(newResult)
    setSavingResult(true)
    await setResult(candidateId, newResult as Result)
    setSavingResult(false)
  }

  const currentStageName = activeStages.find((s) => s.id === stageId)?.name

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="font-label text-xs text-text-secondary uppercase tracking-wide">
          Etapa {savingStage && <span className="text-text-muted">(salvando…)</span>}
        </label>
        <Select
          options={stageOptions}
          value={stageId}
          onChange={(e) => handleStageChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label text-xs text-text-secondary uppercase tracking-wide">
          Resultado {savingResult && <span className="text-text-muted">(salvando…)</span>}
        </label>
        <Select
          options={RESULT_OPTIONS}
          value={result}
          onChange={(e) => handleResultChange(e.target.value)}
        />
        <p className={['text-xs font-semibold mt-1', resultColor[result]].join(' ')}>
          {result}
        </p>
      </div>

      <p className="text-xs text-text-muted bg-surface-2 border border-border p-2">
        Etapa e resultado são <strong>independentes</strong>. Um startup pode ter resultado
        "Ganha" ou "Perdida" em qualquer etapa do funil.
      </p>
    </div>
  )
}
