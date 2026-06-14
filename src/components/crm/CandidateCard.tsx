'use client'

import { Badge } from '@/components/ui/Badge'
import type { Database } from '@/types/supabase'

export type CandidateRow = Database['public']['Tables']['startup_candidates']['Row'] & {
  owner_name?: string | null
}

type Result = 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'

const resultBadgeVariant: Record<Result, 'default' | 'green' | 'red' | 'amber'> = {
  'Em aberto': 'default',
  'Ganha': 'green',
  'Perdida': 'red',
  'Acompanhar futuramente': 'amber',
}

const resultLabel: Record<Result, string> = {
  'Em aberto': 'Em aberto',
  'Ganha': 'Ganha',
  'Perdida': 'Perdida',
  'Acompanhar futuramente': 'Acompanhar',
}

interface CandidateCardProps {
  candidate: CandidateRow
  href?: string
  onClick?: () => void
}

export function CandidateCard({ candidate, href, onClick }: CandidateCardProps) {
  const result = candidate.result as Result
  const badgeVariant = resultBadgeVariant[result] ?? 'default'
  const label = resultLabel[result] ?? candidate.result

  const content = (
    <div className="bg-surface-2 border border-border p-3 gap-2 flex flex-col hover:border-primary/60 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <span className="font-label text-sm text-text-primary font-medium leading-snug line-clamp-2">
          {candidate.name}
        </span>
        <Badge variant={badgeVariant} className="shrink-0 text-[10px]">
          {label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {candidate.vertical && (
          <span className="text-xs text-text-secondary">{candidate.vertical}</span>
        )}
        {candidate.phase && (
          <span className="text-xs text-text-muted">· {candidate.phase}</span>
        )}
      </div>

      {candidate.next_action && (
        <p className="text-xs text-text-muted line-clamp-1">
          {candidate.next_action}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        {candidate.owner_name ? (
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            {candidate.owner_name}
          </span>
        ) : (
          <span />
        )}
        {candidate.score != null && (
          <span className="text-xs font-label text-primary font-semibold">
            {candidate.score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}>
      {content}
    </div>
  )
}
