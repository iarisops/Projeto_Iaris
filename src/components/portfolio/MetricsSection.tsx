'use client'

import { useState } from 'react'
import { upsertMetric } from '@/lib/actions/metrics'

const METRIC_TYPES = [
  'MRR', 'Clientes ativos', 'Novos clientes', 'Leads qualificados',
  'Taxa de conversão', 'Churn Rate', 'CAC', 'LTV', 'LTV/CAC', 'Burn Rate', 'Runway',
] as const

type MetricType = typeof METRIC_TYPES[number]

// For these metrics, lower is better (green)
const LOWER_IS_BETTER = new Set<string>(['Churn Rate', 'CAC', 'Burn Rate'])

interface Metric {
  id: string
  type: string
  current_value: number | null
  previous_value: number | null
  period: string | null
  notes: string | null
}

interface MetricsSectionProps {
  startupId: string
  quarter: string
  metrics: Metric[]
}

function formatValue(val: number | null, type: string): string {
  if (val === null) return '—'
  if (type === 'MRR' || type === 'CAC' || type === 'LTV' || type === 'Burn Rate') {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  if (type === 'Taxa de conversão' || type === 'Churn Rate' || type === 'LTV/CAC') {
    return `${val.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
  }
  if (type === 'Runway') return `${val} meses`
  return val.toLocaleString('pt-BR')
}

function calcChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

export function MetricsSection({ startupId, quarter, metrics: initialMetrics }: MetricsSectionProps) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)

  function getMetric(type: string): Metric | undefined {
    return metrics.find((m) => m.type === type)
  }

  function startEdit(type: string) {
    const m = getMetric(type)
    setEditing(type)
    setEditVal(m?.current_value != null ? String(m.current_value) : '')
  }

  async function commitEdit(type: MetricType) {
    const val = parseFloat(editVal.replace(',', '.'))
    if (isNaN(val)) { setEditing(null); return }

    setSaving(true)
    const current = getMetric(type)
    await upsertMetric(startupId, quarter, {
      type,
      current_value: val,
      previous_value: current?.current_value ?? undefined,
    })
    setMetrics((prev) => {
      const exists = prev.find((m) => m.type === type)
      if (exists) {
        return prev.map((m) =>
          m.type === type ? { ...m, previous_value: m.current_value, current_value: val } : m
        )
      }
      return [...prev, { id: '', type, current_value: val, previous_value: null, period: null, notes: null }]
    })
    setSaving(false)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Métricas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METRIC_TYPES.map((type) => {
          const m = getMetric(type)
          const change = calcChange(m?.current_value ?? null, m?.previous_value ?? null)
          const lowerBetter = LOWER_IS_BETTER.has(type)
          const isPositive = change !== null && (lowerBetter ? change < 0 : change > 0)
          const isNegative = change !== null && (lowerBetter ? change > 0 : change < 0)
          const isEditing = editing === type

          return (
            <div key={type} className="bg-surface-2 border border-border p-3 flex flex-col gap-1">
              <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">{type}</span>

              {isEditing ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onBlur={() => commitEdit(type as MetricType)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(type as MetricType); if (e.key === 'Escape') setEditing(null) }}
                    className="flex-1 bg-transparent border-b border-primary text-text-primary text-lg font-semibold focus:outline-none"
                    disabled={saving}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="text-left"
                  title="Clique para editar"
                  onClick={() => startEdit(type)}
                >
                  <span className="text-lg font-semibold text-text-primary hover:text-primary transition-colors">
                    {formatValue(m?.current_value ?? null, type)}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {change !== null && (
                  <span className={[
                    'text-xs font-semibold',
                    isPositive ? 'text-signal-green' : isNegative ? 'text-signal-red' : 'text-text-muted',
                  ].join(' ')}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                )}
                {m?.previous_value != null && (
                  <span className="text-xs text-text-muted">
                    ant: {formatValue(m.previous_value, type)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
