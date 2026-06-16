'use client'

import { useState } from 'react'
import { updateActivity } from '@/lib/actions/candidates'
import { updatePortfolioActivity } from '@/lib/actions/activities'

export interface UnifiedActivity {
  source: 'portfolio' | 'crm'
  id: string
  type: string
  date: string
  status: string
  title: string | null
  context: string | null   // startup or candidate name
  href: string
}

const CRM_STATUS_OPTIONS      = ['Pendente', 'Concluída', 'Cancelada']
const PORTFOLIO_STATUS_OPTIONS = ['Pendente', 'Agendada', 'Reagendada', 'Concluída', 'Cancelada']

const DONE_STATUSES = new Set(['Concluída', 'Cancelada'])

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function CalendarIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

export function HomeActivityList({ activities: initial }: { activities: UnifiedActivity[] }) {
  const [activities, setActivities] = useState(initial)
  const [updating, setUpdating]     = useState<Set<string>>(new Set())

  async function handleStatusChange(act: UnifiedActivity, newStatus: string) {
    setUpdating((prev) => new Set(prev).add(act.id))

    if (act.source === 'crm') {
      await updateActivity(act.id, { status: newStatus as 'Pendente' | 'Concluída' | 'Cancelada' })
    } else {
      await updatePortfolioActivity(act.id, {
        status: newStatus as 'Pendente' | 'Agendada' | 'Reagendada' | 'Concluída' | 'Cancelada',
      })
    }

    if (DONE_STATUSES.has(newStatus)) {
      // Remove from list — activity is no longer "pending"
      setActivities((prev) => prev.filter((a) => a.id !== act.id))
    } else {
      setActivities((prev) => prev.map((a) => a.id === act.id ? { ...a, status: newStatus } : a))
    }

    setUpdating((prev) => { const s = new Set(prev); s.delete(act.id); return s })
  }

  if (activities.length === 0) {
    return (
      <div className="border border-border bg-surface px-4 py-8 text-center">
        <p className="text-sm text-text-muted">Nenhuma atividade pendente.</p>
      </div>
    )
  }

  return (
    <div className="border border-border bg-surface divide-y divide-border">
      {activities.map((act) => {
        const overdue    = new Date(act.date) < new Date()
        const isUpdating = updating.has(act.id)
        const options    = act.source === 'crm' ? CRM_STATUS_OPTIONS : PORTFOLIO_STATUS_OPTIONS

        return (
          <div
            key={`${act.source}-${act.id}`}
            className={['flex items-start gap-3 px-4 py-3 transition-opacity', isUpdating ? 'opacity-50' : ''].join(' ')}
          >
            {/* Status circle */}
            <div className={[
              'w-[18px] h-[18px] rounded-full shrink-0 border-2 flex items-center justify-center mt-0.5',
              act.status === 'Agendada'  ? 'border-primary' : 'border-border',
            ].join(' ')} />

            {/* Content — clickable area navigates to the activity */}
            <a href={act.href} className="flex-1 min-w-0 group">
              <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors leading-snug truncate">
                {act.title ?? act.type}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={[
                  'flex items-center gap-1 text-[11px] font-label',
                  overdue ? 'text-signal-red font-semibold' : 'text-text-muted',
                ].join(' ')}>
                  <CalendarIcon />
                  {fmtDate(act.date)}
                </span>

                {/* Type badge */}
                <span className="text-[9px] font-label font-medium uppercase tracking-wide text-text-muted bg-surface-2 border border-border px-1.5 py-0.5">
                  {act.type}
                </span>

                {/* CRM badge */}
                {act.source === 'crm' && (
                  <span className="text-[9px] font-label font-bold uppercase tracking-wide bg-[#fbb33d]/15 text-[#b45309] border border-[#fbb33d]/30 px-1.5 py-0.5">
                    CRM
                  </span>
                )}

                {/* Startup / candidate name badge */}
                {act.context && (
                  <span className="text-[9px] font-label font-medium text-primary bg-[#eef8f8] border border-[#009999]/30 px-1.5 py-0.5 max-w-[100px] truncate">
                    {act.context}
                  </span>
                )}
              </div>
            </a>

            {/* Status select */}
            <div className="shrink-0 self-center">
              <select
                value={act.status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(act, e.target.value)}
                className={[
                  'text-[11px] font-label text-text-secondary bg-surface border border-border px-2 py-1',
                  'focus:outline-none focus:border-primary hover:border-primary/50 transition-colors',
                  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                ].join(' ')}
              >
                {options.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )
      })}
    </div>
  )
}
