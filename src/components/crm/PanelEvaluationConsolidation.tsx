'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Database } from '@/types/supabase'

type PanelEvaluation = Database['public']['Tables']['panel_evaluations']['Row']

interface PanelEvaluationConsolidationProps {
  evaluations: PanelEvaluation[]
}

export function PanelEvaluationConsolidation({ evaluations }: PanelEvaluationConsolidationProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (evaluations.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4 text-center">
        Nenhuma avaliação de banca registrada.
      </p>
    )
  }

  const scores = evaluations.map((e) => e.final_score).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const approvedCount = evaluations.filter((e) => e.approved === true).length
  const approvalRate = evaluations.length > 0 ? (approvedCount / evaluations.length) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-border p-3 text-center">
          <p className="text-xs text-text-muted uppercase font-label tracking-wide">Nota média</p>
          <p className="text-2xl font-headline text-primary mt-1">
            {avgScore != null ? avgScore.toFixed(1) : '—'}
          </p>
        </div>
        <div className="bg-surface-2 border border-border p-3 text-center">
          <p className="text-xs text-text-muted uppercase font-label tracking-wide">% Aprovação</p>
          <p className="text-2xl font-headline text-signal-green mt-1">
            {approvalRate.toFixed(0)}%
          </p>
        </div>
        <div className="bg-surface-2 border border-border p-3 text-center">
          <p className="text-xs text-text-muted uppercase font-label tracking-wide">Avaliadores</p>
          <p className="text-2xl font-headline text-text-primary mt-1">{evaluations.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {evaluations.map((ev) => (
          <div key={ev.id} className="border border-border bg-surface-2">
            <button
              type="button"
              onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-primary font-medium">
                  {ev.evaluator_name ?? 'Avaliador desconhecido'}
                </span>
                {ev.evaluator_email && (
                  <span className="text-xs text-text-muted">{ev.evaluator_email}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {ev.approved !== null && (
                  <Badge variant={ev.approved ? 'green' : 'red'}>
                    {ev.approved ? 'Aprovado' : 'Reprovado'}
                  </Badge>
                )}
                {ev.final_score != null && (
                  <span className="text-sm font-label text-primary font-semibold">
                    {ev.final_score.toFixed(1)}
                  </span>
                )}
                <span className="text-text-muted text-xs">{expanded === ev.id ? '▲' : '▼'}</span>
              </div>
            </button>

            {expanded === ev.id && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border">
                {ev.evaluation_date && (
                  <p className="text-xs text-text-muted mt-3">
                    Data: {new Date(ev.evaluation_date).toLocaleDateString('pt-BR')}
                  </p>
                )}

                {ev.criteria_scores && Object.keys(ev.criteria_scores as object).length > 0 && (
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-label tracking-wide mb-2">
                      Notas por critério
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(ev.criteria_scores as Record<string, number>).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                          <span className="text-text-secondary">{key}</span>
                          <span className="font-label text-text-primary">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ev.general_comments && (
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-label tracking-wide mb-1">
                      Comentários
                    </p>
                    <p className="text-sm text-text-primary">{ev.general_comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
