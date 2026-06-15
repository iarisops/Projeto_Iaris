'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { CandidateCard, type CandidateRow } from '@/components/crm/CandidateCard'
import { StageManager } from '@/components/crm/StageManager'
import { PanelEvaluationFormConfig } from '@/components/crm/PanelEvaluationFormConfig'
import { NewCandidateModal } from '@/components/crm/NewCandidateModal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']
type PanelForm = Database['public']['Tables']['panel_evaluation_forms']['Row']

type Tab = 'kanban' | 'lista' | 'config'

const RESULT_OPTIONS = [
  { value: '', label: 'Todos os resultados' },
  { value: 'Em aberto', label: 'Em aberto' },
  { value: 'Ganha', label: 'Ganha' },
  { value: 'Perdida', label: 'Perdida' },
  { value: 'Acompanhar futuramente', label: 'Acompanhar futuramente' },
]

interface FunnelPageClientProps {
  funnelId: string
  funnelName: string
  funnelStatus: string
  stages: Stage[]
  candidates: CandidateRow[]
  panelForms: PanelForm[]
}

export function FunnelPageClient({
  funnelId,
  funnelName: _funnelName,
  funnelStatus: _funnelStatus,
  stages,
  candidates: initialCandidates,
  panelForms,
}: FunnelPageClientProps) {
  const [tab, setTab] = useState<Tab>('kanban')
  const [candidates, setCandidates] = useState(initialCandidates)
  const [showNewCandidate, setShowNewCandidate] = useState(false)

  // List filters
  const [filterStage, setFilterStage] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [filterVertical, setFilterVertical] = useState('')
  const [filterPhase, setFilterPhase] = useState('')

  const activeStages = stages.filter((s) => !s.is_archived).sort((a, b) => a.position - b.position)

  const stageOptions = [
    { value: '', label: 'Todas as etapas' },
    ...activeStages.map((s) => ({ value: s.id, label: s.name })),
  ]

  const verticals = [...new Set(candidates.map((c) => c.vertical).filter(Boolean))] as string[]
  const verticalOptions = [
    { value: '', label: 'Todos os verticais' },
    ...verticals.map((v) => ({ value: v, label: v })),
  ]

  const phases = [...new Set(candidates.map((c) => c.phase).filter(Boolean))] as string[]
  const phaseOptions = [
    { value: '', label: 'Todas as fases' },
    ...phases.map((p) => ({ value: p, label: p })),
  ]

  const filteredCandidates = candidates.filter((c) => {
    if (filterStage && c.stage_id !== filterStage) return false
    if (filterResult && c.result !== filterResult) return false
    if (filterVertical && c.vertical !== filterVertical) return false
    if (filterPhase && c.phase !== filterPhase) return false
    return true
  })

  function handleNewCandidate(candidate: CandidateRow) {
    setCandidates((prev) => [candidate, ...prev])
    setShowNewCandidate(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kanban', label: 'Kanban' },
    { id: 'lista', label: 'Lista' },
    { id: 'config', label: 'Configurações' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Tab nav */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-5 py-3 font-label text-xs uppercase tracking-wider border-b-2 transition-colors',
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pr-2">
          <Button size="sm" onClick={() => setShowNewCandidate(true)}>
            + Nova candidata
          </Button>
        </div>
      </div>

      {/* Kanban */}
      {tab === 'kanban' && (
        <KanbanBoard
          stages={stages}
          candidates={candidates}
          funnelId={funnelId}
        />
      )}

      {/* Lista */}
      {tab === 'lista' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Select
              options={stageOptions}
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-48"
            />
            <Select
              options={RESULT_OPTIONS}
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-48"
            />
            {verticals.length > 0 && (
              <Select
                options={verticalOptions}
                value={filterVertical}
                onChange={(e) => setFilterVertical(e.target.value)}
                className="w-40"
              />
            )}
            {phases.length > 0 && (
              <Select
                options={phaseOptions}
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className="w-40"
              />
            )}
            {(filterStage || filterResult || filterVertical || filterPhase) && (
              <button
                onClick={() => { setFilterStage(''); setFilterResult(''); setFilterVertical(''); setFilterPhase('') }}
                className="text-xs text-text-muted hover:text-text-secondary"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <p className="text-xs text-text-muted">
            {filteredCandidates.length} candidata{filteredCandidates.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredCandidates.map((c) => {
              const stageName = stages.find((s) => s.id === c.stage_id)?.name
              return (
                <div key={c.id} className="relative">
                  {stageName && (
                    <p className="text-[10px] text-text-muted font-label uppercase tracking-wide mb-1">
                      {stageName}
                    </p>
                  )}
                  <CandidateCard
                    candidate={c}
                    href={`/crm/${funnelId}/candidatas/${c.id}`}
                  />
                </div>
              )
            })}

            {filteredCandidates.length === 0 && (
              <div className="col-span-full py-8 text-center text-text-muted text-sm">
                Nenhuma candidata encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configurações */}
      {tab === 'config' && (
        <div className="flex flex-col gap-8 max-w-2xl">
          <StageManager funnelId={funnelId} stages={stages} />
          <PanelEvaluationFormConfig funnelId={funnelId} forms={panelForms} />
        </div>
      )}

      <NewCandidateModal
        open={showNewCandidate}
        onClose={() => setShowNewCandidate(false)}
        funnelId={funnelId}
        stages={activeStages}
        onCreated={handleNewCandidate}
      />
    </div>
  )
}
