'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { CandidateCard, type CandidateRow } from '@/components/crm/CandidateCard'
import { NewCandidateModal } from '@/components/crm/NewCandidateModal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { Database } from '@/types/supabase'
import type { FunnelFormConfig } from '@/lib/types/form-config'
import { resolveFormConfig } from '@/lib/defaults/funnel-form-config'

type Stage = Database['public']['Tables']['funnel_stages']['Row']
type Tab   = 'kanban' | 'lista'

const RESULT_OPTIONS = [
  { value: '',                       label: 'Todos os resultados' },
  { value: 'Em aberto',              label: 'Em aberto' },
  { value: 'Ganha',                  label: 'Ganha' },
  { value: 'Perdida',                label: 'Perdida' },
  { value: 'Acompanhar futuramente', label: 'Acompanhar futuramente' },
]

const GearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.07 1.12a1.5 1.5 0 0 1 1.86 0l.9.75a.5.5 0 0 0 .38.1l1.16-.18a1.5 1.5 0 0 1 1.61 1.07l.32 1.13a.5.5 0 0 0 .27.32l1.06.47a1.5 1.5 0 0 1 .73 1.77l-.38 1.1a.5.5 0 0 0 0 .38l.38 1.1a1.5 1.5 0 0 1-.73 1.77l-1.06.47a.5.5 0 0 0-.27.32l-.32 1.13a1.5 1.5 0 0 1-1.61 1.07l-1.16-.18a.5.5 0 0 0-.38.1l-.9.75a1.5 1.5 0 0 1-1.86 0l-.9-.75a.5.5 0 0 0-.38-.1l-1.16.18a1.5 1.5 0 0 1-1.61-1.07l-.32-1.13a.5.5 0 0 0-.27-.32l-1.06-.47a1.5 1.5 0 0 1-.73-1.77l.38-1.1a.5.5 0 0 0 0-.38l-.38-1.1a1.5 1.5 0 0 1 .73-1.77l1.06-.47a.5.5 0 0 0 .27-.32l.32-1.13a1.5 1.5 0 0 1 1.61-1.07l1.16.18a.5.5 0 0 0 .38-.1l.9-.75Zm.56 1.14a.5.5 0 0 0-.62 0l-.9.75a1.5 1.5 0 0 1-1.13.3l-1.16-.18a.5.5 0 0 0-.54.36l-.32 1.13a1.5 1.5 0 0 1-.8.96l-1.06.47a.5.5 0 0 0-.24.59l.38 1.1a1.5 1.5 0 0 1 0 1.14l-.38 1.1a.5.5 0 0 0 .24.59l1.06.47a1.5 1.5 0 0 1 .8.96l.32 1.13a.5.5 0 0 0 .54.36l1.16-.18a1.5 1.5 0 0 1 1.13.3l.9.75a.5.5 0 0 0 .62 0l.9-.75a1.5 1.5 0 0 1 1.13-.3l1.16.18a.5.5 0 0 0 .54-.36l.32-1.13a1.5 1.5 0 0 1 .8-.96l1.06-.47a.5.5 0 0 0 .24-.59l-.38-1.1a1.5 1.5 0 0 1 0-1.14l.38-1.1a.5.5 0 0 0-.24-.59l-1.06-.47a1.5 1.5 0 0 1-.8-.96l-.32-1.13a.5.5 0 0 0-.54-.36l-1.16.18a1.5 1.5 0 0 1-1.13-.3l-.9-.75Z" fill="currentColor"/>
  </svg>
)

function DonutChart({ pct, size = 90 }: { pct: number; size?: number }) {
  const sw = 9
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const cx = size / 2
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f4" strokeWidth={sw} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke="#009999" strokeWidth={sw}
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-headline font-bold text-[#0d1226]">{pct}%</span>
      </div>
    </div>
  )
}

interface FunnelPageClientProps {
  funnelId: string
  funnelName: string
  funnelStatus: string
  stages: Stage[]
  candidates: CandidateRow[]
  rawFormConfig: unknown
}

export function FunnelPageClient({
  funnelId,
  funnelName: _funnelName,
  funnelStatus: _funnelStatus,
  stages,
  candidates: initialCandidates,
  rawFormConfig,
}: FunnelPageClientProps) {
  const formConfig: FunnelFormConfig = resolveFormConfig(rawFormConfig)
  const [tab, setTab]           = useState<Tab>('kanban')
  const [candidates, setCandidates] = useState(initialCandidates)
  const [showNewCandidate, setShowNewCandidate] = useState(false)

  const [filterStage,    setFilterStage]    = useState('')
  const [filterResult,   setFilterResult]   = useState('')
  const [filterVertical, setFilterVertical] = useState('')
  const [filterPhase,    setFilterPhase]    = useState('')

  const activeStages = stages
    .filter((s) => !s.is_archived)
    .sort((a, b) => a.position - b.position)

  // Dashboard stats
  const total      = candidates.length
  const emAberto   = candidates.filter((c) => c.result === 'Em aberto').length
  const ganhas     = candidates.filter((c) => c.result === 'Ganha').length
  const perdidas   = candidates.filter((c) => c.result === 'Perdida').length
  const pipelinePct = total > 0 ? Math.round((emAberto / total) * 100) : 0

  const byStage = activeStages.map((stage) => ({
    stage,
    count: candidates.filter((c) => c.stage_id === stage.id).length,
  }))
  const maxCount = Math.max(...byStage.map((s) => s.count), 1)

  // List filter options
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
    if (filterStage    && c.stage_id  !== filterStage)    return false
    if (filterResult   && c.result    !== filterResult)   return false
    if (filterVertical && c.vertical  !== filterVertical) return false
    if (filterPhase    && c.phase     !== filterPhase)    return false
    return true
  })

  function handleNewCandidate(candidate: CandidateRow) {
    setCandidates((prev) => [candidate, ...prev])
    setShowNewCandidate(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kanban', label: 'Kanban' },
    { id: 'lista',  label: 'Lista'  },
  ]

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Dashboard strip ── */}
      <div className="shrink-0 grid grid-cols-[1fr_auto_auto] border border-[#e2e8f4] bg-white mb-5">

        {/* Left: stage bar chart */}
        <div className="p-4 border-r border-[#e2e8f4]">
          <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wider mb-3">
            Candidatas por etapa
          </p>
          <div className="flex flex-col gap-1.5">
            {byStage.map(({ stage, count }) => (
              <div key={stage.id} className="flex items-center gap-2">
                <span className="text-[10px] text-[#4d5b7c] w-36 truncate shrink-0">
                  {stage.name}
                </span>
                <div className="flex-1 h-1.5 bg-[#e2e8f4] min-w-[60px]">
                  <div
                    className="h-full bg-[#009999] transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-label text-[#0d1226] w-4 text-right shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: donut */}
        <div className="px-8 py-4 flex flex-col items-center justify-center gap-2 border-r border-[#e2e8f4]">
          <DonutChart pct={pipelinePct} />
          <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wider">
            Em pipeline
          </p>
        </div>

        {/* Right: stat tiles */}
        <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-4 content-center">
          {([
            { label: 'Total',     value: total,    color: '#0d1226' },
            { label: 'Em aberto', value: emAberto, color: '#009999' },
            { label: 'Ganhas',    value: ganhas,   color: '#38a169' },
            { label: 'Perdidas',  value: perdidas, color: '#e53e3e' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="flex flex-col">
              <span className="text-2xl font-headline font-bold leading-none" style={{ color }}>
                {value}
              </span>
              <span className="font-label text-[10px] text-[#8492b0] uppercase tracking-wide mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between border-b border-[#e2e8f4] shrink-0">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-5 py-3 font-label text-xs uppercase tracking-wider border-b-2 transition-colors',
                tab === t.id
                  ? 'border-[#009999] text-[#009999]'
                  : 'border-transparent text-[#8492b0] hover:text-[#4d5b7c]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Link
            href={`/crm/${funnelId}/configuracoes`}
            className="flex items-center justify-center w-8 h-8 text-[#8492b0] hover:text-[#009999] hover:bg-[#f0f7f7] transition-colors border border-transparent hover:border-[#e2e8f4]"
            title="Configurações do funil"
          >
            <GearIcon />
          </Link>
          <Button size="sm" onClick={() => setShowNewCandidate(true)}>
            + Nova candidata
          </Button>
        </div>
      </div>

      {/* ── Kanban ── */}
      {tab === 'kanban' && (
        <div className="flex-1 min-h-0 pt-4">
          <KanbanBoard
            stages={stages}
            candidates={candidates}
            funnelId={funnelId}
          />
        </div>
      )}

      {/* ── Lista ── */}
      {tab === 'lista' && (
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
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
                  onClick={() => {
                    setFilterStage('')
                    setFilterResult('')
                    setFilterVertical('')
                    setFilterPhase('')
                  }}
                  className="text-xs text-[#8492b0] hover:text-[#4d5b7c]"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <p className="text-xs text-[#8492b0]">
              {filteredCandidates.length} candidata{filteredCandidates.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCandidates.map((c) => {
                const stageName = stages.find((s) => s.id === c.stage_id)?.name
                return (
                  <div key={c.id} className="relative">
                    {stageName && (
                      <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wide mb-1">
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
                <div className="col-span-full py-12 text-center text-[#8492b0] text-sm">
                  Nenhuma candidata encontrada com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NewCandidateModal
        open={showNewCandidate}
        onClose={() => setShowNewCandidate(false)}
        funnelId={funnelId}
        stages={activeStages}
        onCreated={handleNewCandidate}
        formConfig={formConfig}
      />
    </div>
  )
}
