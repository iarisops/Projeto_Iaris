'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { updateTierStatus } from '@/lib/actions/portfolio'

interface OperationalHeaderProps {
  startup: {
    id: string
    name: string
    logo_url: string | null
    tier: number | null
    journey_status: string | null
    engagement: string | null
    last_update_at: string | null
  }
  lastRitual: { date: string; type: string } | null
  nextRitual: { date: string; type: string } | null
}

const TIER_CONFIG = [
  { value: 0, label: 'Sem tier', variant: 'muted' as const },
  { value: 1, label: 'Tier 1', variant: 'teal' as const },
  { value: 2, label: 'Tier 2', variant: 'amber' as const },
  { value: 3, label: 'Tier 3', variant: 'green' as const },
]

const JOURNEY_OPTIONS = ['Exploração', 'Estruturação', 'Aceleração', 'Maturidade']
const ENGAGEMENT_OPTIONS = ['Alto', 'Médio', 'Baixo']

export function OperationalHeader({ startup, lastRitual, nextRitual }: OperationalHeaderProps) {
  const [tier, setTier] = useState(startup.tier ?? 0)
  const [journey, setJourney] = useState(startup.journey_status ?? '')
  const [engagement, setEngagement] = useState(startup.engagement ?? '')
  const [saving, setSaving] = useState(false)

  const initial = startup.name.slice(0, 2).toUpperCase()

  async function handleTier(newTier: number) {
    if (saving) return
    setSaving(true)
    setTier(newTier)
    await updateTierStatus(startup.id, { tier: newTier })
    setSaving(false)
  }

  async function handleJourney(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setJourney(val)
    await updateTierStatus(startup.id, { journey_status: val })
  }

  async function handleEngagement(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setEngagement(val)
    await updateTierStatus(startup.id, { engagement: val })
  }

  return (
    <div className="bg-surface border-b border-border px-6 py-4">
      <div className="flex items-start gap-4 flex-wrap">
        {/* Logo + nome */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0 bg-surface-2 border border-border flex items-center justify-center overflow-hidden">
            {startup.logo_url ? (
              <Image src={startup.logo_url} alt={startup.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline text-sm font-bold text-primary">{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-headline text-xl font-bold text-text-primary leading-tight truncate">
              {startup.name}
            </h1>
            <a
              href={`/portfolio/${startup.id}/perfil`}
              className="text-xs text-primary hover:underline"
            >
              Perfil →
            </a>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4 flex-wrap ml-auto">
          {/* Tier */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Tier</span>
            <div className="flex gap-1">
              {TIER_CONFIG.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTier(t.value)}
                  disabled={saving}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={t.value === tier ? t.variant : 'muted'}
                    className={t.value === tier ? 'cursor-default' : 'cursor-pointer opacity-40 hover:opacity-70'}
                  >
                    {t.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Journey status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Jornada</span>
            <select
              value={journey}
              onChange={handleJourney}
              className="bg-surface-2 border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="">—</option>
              {JOURNEY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Engagement */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Engajamento</span>
            <select
              value={engagement}
              onChange={handleEngagement}
              className="bg-surface-2 border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="">—</option>
              {ENGAGEMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex gap-6 mt-3 text-xs text-text-muted flex-wrap">
        {startup.last_update_at && (
          <span>
            Último update:{' '}
            <span className="text-text-secondary">
              {new Date(startup.last_update_at).toLocaleDateString('pt-BR')}
            </span>
          </span>
        )}
        {lastRitual && (
          <span>
            Última reunião:{' '}
            <span className="text-text-secondary">
              {new Date(lastRitual.date).toLocaleDateString('pt-BR')} — {lastRitual.type}
            </span>
          </span>
        )}
        {nextRitual && (
          <span>
            Próxima reunião:{' '}
            <span className="text-primary">
              {new Date(nextRitual.date).toLocaleDateString('pt-BR')} — {nextRitual.type}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
