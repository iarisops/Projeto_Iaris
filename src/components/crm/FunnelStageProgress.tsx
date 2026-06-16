'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moveStage, setResult } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']
type Result = 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'

interface Props {
  candidateId: string
  stages: Stage[]
  currentStageId: string | null
  currentResult: string
}

const RESULT_OPTIONS: Result[] = ['Em aberto', 'Ganha', 'Perdida', 'Acompanhar futuramente']

const resultConfig: Record<string, { dot: string; text: string }> = {
  'Em aberto':              { dot: 'bg-[#009999]',     text: 'text-[#009999]' },
  'Ganha':                  { dot: 'bg-signal-green',  text: 'text-signal-green' },
  'Perdida':                { dot: 'bg-signal-red',    text: 'text-signal-red' },
  'Acompanhar futuramente': { dot: 'bg-accent',        text: 'text-accent' },
}

export function FunnelStageProgress({ candidateId, stages, currentStageId, currentResult }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeStageId, setActiveStageId] = useState(currentStageId)
  const [result, setResultState] = useState(currentResult)
  const [showResultEditor, setShowResultEditor] = useState(false)

  const activeStages = stages
    .filter((s) => !s.is_archived)
    .sort((a, b) => a.position - b.position)

  const currentPos = activeStages.findIndex((s) => s.id === activeStageId)

  function handleStageClick(stageId: string) {
    if (stageId === activeStageId || isPending) return
    setActiveStageId(stageId)
    startTransition(async () => {
      await moveStage(candidateId, stageId)
      router.refresh()
    })
  }

  function handleResultChange(newResult: Result) {
    setResultState(newResult)
    setShowResultEditor(false)
    startTransition(async () => {
      await setResult(candidateId, newResult)
    })
  }

  const resCfg = resultConfig[result] ?? { dot: 'bg-border', text: 'text-text-muted' }

  return (
    <section className="bg-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-headline text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Fase do Funil
        </h2>
        <div className="flex items-center gap-3">
          {isPending && (
            <span className="text-[10px] text-text-muted font-label">salvando…</span>
          )}
          <button
            onClick={() => setShowResultEditor((v) => !v)}
            className="flex items-center gap-1.5 group"
            title="Alterar resultado"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${resCfg.dot}`} />
            <span className={`text-xs font-label font-medium ${resCfg.text}`}>{result}</span>
            <span className="text-[10px] text-text-muted group-hover:text-text-secondary transition-colors">▾</span>
          </button>
        </div>
      </div>

      {/* Stage stepper */}
      <div className="px-4 py-5 overflow-x-auto">
        <div className="flex items-start min-w-max">
          {activeStages.map((stage, index) => {
            const pos = index
            const isPast = currentPos >= 0 && pos < currentPos
            const isCurrent = stage.id === activeStageId

            return (
              <div key={stage.id} className="flex items-start">
                <button
                  onClick={() => handleStageClick(stage.id)}
                  disabled={isPending}
                  className="flex flex-col items-center gap-2 group disabled:cursor-not-allowed"
                  title={stage.name}
                >
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                    isPast
                      ? 'bg-signal-green border-2 border-signal-green text-white'
                      : isCurrent
                      ? 'bg-primary border-2 border-primary text-white'
                      : 'bg-surface border-2 border-border text-text-muted group-hover:border-primary/60 group-hover:text-primary/60',
                  ].join(' ')}>
                    {isPast ? '✓' : null}
                  </div>
                  <span className={[
                    'text-[9px] font-label uppercase tracking-wide text-center leading-tight w-16',
                    isCurrent
                      ? 'text-primary font-semibold'
                      : isPast
                      ? 'text-signal-green'
                      : 'text-text-muted',
                  ].join(' ')}>
                    {stage.name}
                  </span>
                </button>

                {index < activeStages.length - 1 && (
                  <div className={[
                    'h-0.5 w-6 mt-3.5 shrink-0 mx-0.5',
                    isPast ? 'bg-signal-green/50' : isCurrent ? 'bg-primary/30' : 'bg-border',
                  ].join(' ')} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Result editor (expandable) */}
      {showResultEditor && (
        <div className="border-t border-border px-4 py-4">
          <p className="text-[10px] font-label text-text-muted uppercase tracking-wider mb-2">
            Alterar resultado
          </p>
          <div className="flex flex-wrap gap-2">
            {RESULT_OPTIONS.map((opt) => {
              const cfg = resultConfig[opt]
              const isActive = result === opt
              return (
                <button
                  key={opt}
                  onClick={() => handleResultChange(opt)}
                  disabled={isPending}
                  className={[
                    'flex items-center gap-2 px-3 py-1.5 border text-xs font-label transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface hover:border-primary/40 text-text-secondary',
                  ].join(' ')}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
