'use client'

import type { Database } from '@/types/supabase'

export type CandidateRow = Database['public']['Tables']['startup_candidates']['Row'] & {
  owner_name?: string | null
}

type Result = 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'

const resultDot: Record<Result, string> = {
  'Em aberto':              'bg-[#009999]',
  'Ganha':                  'bg-[#38a169]',
  'Perdida':                'bg-[#e53e3e]',
  'Acompanhar futuramente': 'bg-[#fbb33d]',
}

const resultLabel: Record<Result, string> = {
  'Em aberto':              'Em aberto',
  'Ganha':                  'Ganha',
  'Perdida':                'Perdida',
  'Acompanhar futuramente': 'Acompanhar',
}

interface CandidateCardProps {
  candidate: CandidateRow
  href?: string
  onClick?: () => void
}

export function CandidateCard({ candidate, href, onClick }: CandidateCardProps) {
  const result = (candidate.result ?? 'Em aberto') as Result
  const dot   = resultDot[result]  ?? 'bg-gray-400'
  const label = resultLabel[result] ?? candidate.result

  const dateStr = candidate.last_update_at
    ? new Date(candidate.last_update_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null

  const content = (
    <div className="bg-white border border-[#e2e8f4] p-3.5 flex flex-col gap-2 hover:border-[#009999]/50 hover:bg-[#f8fcfc] transition-colors cursor-pointer">

      {/* Name */}
      <p className="font-headline text-sm font-semibold text-[#0d1226] leading-snug line-clamp-2">
        {candidate.name}
      </p>

      {/* Note */}
      {candidate.general_note && (
        <p className="text-xs text-[#6b7a99] line-clamp-2 leading-relaxed">
          {candidate.general_note}
        </p>
      )}

      {/* Vertical tag */}
      {candidate.vertical && (
        <span className="self-start text-[10px] font-label uppercase tracking-wide bg-[#eef8f8] text-[#007a7a] px-2 py-0.5 border border-[#009999]/20">
          {candidate.vertical}
        </span>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-[#f0f2f8]">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
          <span className="text-[10px] text-[#8492b0]">{label}</span>
        </div>
        {dateStr && (
          <span className="text-[10px] text-[#aab3c8]">{dateStr}</span>
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
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      {content}
    </div>
  )
}
