'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { QualitativeAssessmentForm } from './QualitativeAssessmentForm'
import type { Database } from '@/types/supabase'

type Assessment = Database['public']['Tables']['qualitative_assessments']['Row']

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

const SIGNAL_DOT: Record<string, string> = {
  verde:    'bg-signal-green',
  amarelo:  'bg-signal-yellow',
  vermelho: 'bg-signal-red',
  '':       'bg-border',
}

const SIGNAL_TOOLTIP: Record<string, string> = {
  verde:    'Verde',
  amarelo:  'Amarelo',
  vermelho: 'Vermelho',
  '':       'Não avaliado',
}

const REC_COLOR: Record<string, string> = {
  'Investor Day': 'text-signal-green',
  'Potencial':    'text-primary',
  'Não avançar':  'text-signal-red',
}

interface Props {
  candidateId: string
  assessment: Assessment | null
}

export function CompactEvaluationPanel({ candidateId, assessment: initial }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const signals = (initial?.criteria_signals as Record<string, string>) ?? {}
  const filledCount = CRM_CRITERIA.filter((c) => signals[c]).length

  return (
    <section className="bg-surface border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-headline text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Avaliação Qualitativa IARIS
          </h2>
          {filledCount > 0 && (
            <span className="text-[10px] text-text-muted font-label">
              {filledCount}/{CRM_CRITERIA.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="text-[11px] font-label text-text-muted hover:text-primary transition-colors uppercase tracking-wide"
        >
          ✎ Editar
        </button>
      </div>

      <div className="px-4 py-4">
        {filledCount === 0 ? (
          <div className="py-2 text-center">
            <p className="text-xs text-text-muted mb-1">Nenhum critério avaliado.</p>
            <button
              onClick={() => setEditOpen(true)}
              className="text-xs text-primary hover:underline"
            >
              Iniciar avaliação →
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {CRM_CRITERIA.map((criterion) => {
                const signal = signals[criterion] ?? ''
                return (
                  <div key={criterion} className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${SIGNAL_DOT[signal] ?? 'bg-border'}`}
                      title={SIGNAL_TOOLTIP[signal] ?? signal}
                    />
                    <span className="text-xs text-text-secondary truncate">{criterion}</span>
                  </div>
                )
              })}
            </div>

            {(initial?.recommendation || initial?.notes) && (
              <div className="mt-4 pt-3 border-t border-border flex flex-col gap-1">
                {initial.recommendation && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label text-text-muted uppercase tracking-wider">
                      Recomendação:
                    </span>
                    <span className={`text-xs font-semibold ${REC_COLOR[initial.recommendation] ?? 'text-text-primary'}`}>
                      {initial.recommendation}
                    </span>
                  </div>
                )}
                {initial.notes && (
                  <p className="text-xs text-text-muted italic line-clamp-2">{initial.notes}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Avaliação Qualitativa IARIS"
        size="md"
      >
        <QualitativeAssessmentForm
          candidateId={candidateId}
          initial={initial}
          onSaved={() => { setEditOpen(false); router.refresh() }}
        />
      </Modal>
    </section>
  )
}
