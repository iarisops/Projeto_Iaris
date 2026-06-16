'use client'

import { useState, useRef } from 'react'
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
  {
    value: 0,
    label: 'Tier 0',
    name: 'Onboarding',
    description: 'Startup recém-chegada, em entendimento e diagnóstico inicial.',
    variant: 'muted' as const,
    color: 'bg-[#eceef7] text-[#4d5b7c] border-[#e2e8f4]',
  },
  {
    value: 1,
    label: 'Tier 1',
    name: 'Observação e Estruturante',
    description: 'Precisa fortalecer execução, foco, clareza estratégica ou fundamentos.',
    variant: 'teal' as const,
    color: 'bg-[#eef8f8] text-[#007a7a] border-[#009999]/30',
  },
  {
    value: 2,
    label: 'Tier 2',
    name: 'Desenvolvimento',
    description: 'Em construção de ICP/PMF, validação comercial e primeiros sinais de tração.',
    variant: 'amber' as const,
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
  },
  {
    value: 3,
    label: 'Tier 3',
    name: 'Aceleração',
    description: 'Alta execução, tração comprovada e potencial de escalar.',
    variant: 'green' as const,
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
  },
]

const JOURNEY_CONFIG = [
  {
    value: 'Em Onboarding',
    description: 'Startup recém-chegada, em processo de integração e diagnóstico inicial com a IARIS.',
    color: 'bg-[#eceef7] text-[#4d5b7c] border-[#e2e8f4]',
  },
  {
    value: 'Tese em revisão',
    description: 'A startup está revisando ou ajustando sua tese central: problema, solução, cliente ou modelo.',
    color: 'bg-[#f5f0ff] text-[#6d28d9] border-[#7c3aed]/25',
  },
  {
    value: 'Buscando 1º piloto',
    description: 'Em busca ativa do primeiro cliente ou projeto piloto para validar a solução.',
    color: 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c]/30',
  },
  {
    value: 'Piloto em validação',
    description: 'Piloto em andamento — coletando dados e aprendizados para confirmar hipóteses.',
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
  },
  {
    value: 'Primeiros pagantes',
    description: 'Primeiros contratos pagos fechados. Foco em entender o ciclo de venda e replicar.',
    color: 'bg-[#ecfdf5] text-[#065f46] border-[#059669]/25',
  },
  {
    value: 'Tração inicial',
    description: 'Padrão nascente de crescimento. Clientes chegam com alguma consistência.',
    color: 'bg-[#eef8f8] text-[#007a7a] border-[#009999]/30',
  },
  {
    value: 'Motor de crescimento em construção',
    description: 'Estruturando processos, time e canais para crescer de forma mais previsível.',
    color: 'bg-[#eff6ff] text-[#1d4ed8] border-[#3b82f6]/30',
  },
  {
    value: 'Motor de crescimento em evolução contínua',
    description: 'Motor existente e funcionando. Trabalho é refinar, otimizar e acelerar.',
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
  },
  {
    value: 'Pronta para aceleração/escala',
    description: 'Fundamentos sólidos, tração comprovada e preparada para escalar.',
    color: 'bg-[#f0fdf4] text-[#166534] border-[#22c55e]/40',
  },
  {
    value: 'Em captação',
    description: 'Em processo ativo de captação de investimento (seed, série A, etc.).',
    color: 'bg-[#fdf4ff] text-[#7e22ce] border-[#a855f7]/30',
  },
]

const ENGAGEMENT_CONFIG = [
  {
    value: 'Alto',
    description: 'Participa, traz dados, executa combinados e usa bem a IARIS.',
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
  },
  {
    value: 'Médio',
    description: 'Participa de forma irregular e precisa de cobrança leve.',
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
  },
  {
    value: 'Baixo',
    description: 'Responde pouco, participa pouco ou não atualiza dados.',
    color: 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c]/30',
  },
  {
    value: 'Crítico',
    description: 'Praticamente ausente ou sem prioridade na relação.',
    color: 'bg-[#fef2f2] text-[#b91c1c] border-[#dc2626]/30',
  },
]

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className="w-3.5 h-3.5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function HelpTooltip({ children, wikiHref }: { children: React.ReactNode; wikiHref: string }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  function hide() {
    timer.current = setTimeout(() => setOpen(false), 180)
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => setOpen((p) => !p)}
        className="w-3.5 h-3.5 rounded-full border border-text-muted/50 text-text-muted flex items-center justify-center text-[9px] font-bold leading-none hover:border-primary hover:text-primary transition-colors"
        aria-label="Ajuda"
      >
        ?
      </button>
      {open && (
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute top-full right-0 mt-2 z-50 w-72 bg-[#0d1226] text-white shadow-xl"
        >
          <div className="p-3 text-[11px] leading-relaxed space-y-1.5">
            {children}
            <a
              href={wikiHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-1.5 border-t border-white/10 text-[#009999] hover:underline font-semibold"
            >
              Ver na Wiki →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/* Chip compacto para modo visualização — largura fixa, texto quebra livremente */
function ViewChip({
  color, label, sub, description, className = '',
}: {
  color: string
  label: string
  sub?: string
  description?: string
  className?: string
}) {
  return (
    <div className={`border px-2.5 py-2 ${color} ${className}`}>
      <p className="text-[11px] font-headline font-bold leading-tight">{label}</p>
      {sub && (
        <p className="text-[10px] font-semibold opacity-80 leading-tight mt-0.5">{sub}</p>
      )}
      {description && (
        <p className="text-[10px] opacity-70 leading-snug mt-1">{description}</p>
      )}
    </div>
  )
}

/* Card completo para modo edição */
function EditCard({ color, title, subtitle, description }: {
  color: string; title: string; subtitle?: string; description: string
}) {
  return (
    <div className={`border px-2.5 py-2 ${color}`}>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-[11px] font-headline font-bold leading-tight">{title}</span>
        {subtitle && <span className="text-[10px] font-semibold opacity-80 leading-tight">— {subtitle}</span>}
      </div>
      <p className="text-[10px] opacity-75 leading-snug mt-0.5">{description}</p>
    </div>
  )
}

function EmptyChip({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`border border-dashed border-border px-2.5 py-2 ${className}`}>
      <p className="text-[10px] text-text-muted italic">Não definido</p>
      <p className="text-[10px] text-text-muted/60 leading-tight mt-0.5">{label}</p>
    </div>
  )
}

export function OperationalHeader({ startup, lastRitual, nextRitual }: OperationalHeaderProps) {
  const [isEditing,  setIsEditing]  = useState(false)
  const [tier,       setTier]       = useState<number | null>(startup.tier ?? null)
  const [journey,    setJourney]    = useState(startup.journey_status ?? '')
  const [engagement, setEngagement] = useState(startup.engagement ?? '')
  const [saving,     setSaving]     = useState(false)

  const orig = useRef({
    tier:       startup.tier ?? null,
    journey:    startup.journey_status ?? '',
    engagement: startup.engagement ?? '',
  })

  const initial           = startup.name.slice(0, 2).toUpperCase()
  const selectedTier       = TIER_CONFIG.find((t) => t.value === tier) ?? null
  const selectedJourney    = JOURNEY_CONFIG.find((j) => j.value === journey) ?? null
  const selectedEngagement = ENGAGEMENT_CONFIG.find((e) => e.value === engagement) ?? null

  function enterEdit() {
    orig.current = { tier, journey, engagement }
    setIsEditing(true)
  }

  function cancelEdit() {
    setTier(orig.current.tier)
    setJourney(orig.current.journey)
    setEngagement(orig.current.engagement)
    setIsEditing(false)
  }

  async function saveEdit() {
    setSaving(true)
    await updateTierStatus(startup.id, {
      tier:           tier ?? undefined,
      journey_status: journey  || undefined,
      engagement:     engagement || undefined,
    })
    setSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="bg-surface border-b border-border px-6 py-4">

      {/* ── Main row: logo · name · status chips · edit button ── */}
      <div className="flex items-start gap-4">

        {/* Logo + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
            <a href={`/portfolio/${startup.id}/perfil`} className="text-xs text-primary hover:underline">
              Perfil →
            </a>
          </div>
        </div>

        {/* Status columns — fixed widths so layout never shifts */}
        <div className="flex items-stretch gap-3 shrink-0">

          {/* ── TIER — w-44 ── */}
          <div className="w-44 flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Tier</span>
              <HelpTooltip wikiHref="/wiki#tiers">
                <p className="font-semibold text-white/90 mb-1">Tiers de Acompanhamento</p>
                {TIER_CONFIG.map((t) => (
                  <p key={t.value}>
                    <span className="font-semibold text-white/80">{t.label} — {t.name}:</span>{' '}
                    <span className="text-white/60">{t.description}</span>
                  </p>
                ))}
              </HelpTooltip>
            </div>

            {isEditing ? (
              <>
                <div className="flex gap-1 flex-wrap">
                  {TIER_CONFIG.map((t) => (
                    <button key={t.value} type="button" onClick={() => setTier(t.value)} className="focus:outline-none">
                      <Badge
                        variant={t.value === tier ? t.variant : 'muted'}
                        className={t.value === tier ? 'cursor-default' : 'cursor-pointer opacity-40 hover:opacity-70'}
                      >
                        {t.label}
                      </Badge>
                    </button>
                  ))}
                </div>
                {selectedTier
                  ? <EditCard color={selectedTier.color} title={selectedTier.label} subtitle={selectedTier.name} description={selectedTier.description} />
                  : <div className="border border-dashed border-border px-2.5 py-2 text-[10px] text-text-muted italic">Nenhum selecionado</div>
                }
              </>
            ) : (
              selectedTier
                ? <ViewChip
                    color={selectedTier.color}
                    label={selectedTier.label}
                    sub={selectedTier.name}
                    description={selectedTier.description}
                    className="min-h-[96px]"
                  />
                : <EmptyChip label="Tier" className="min-h-[96px]" />
            )}
          </div>

          {/* ── STATUS DA JORNADA — w-56 ── */}
          <div className="w-56 flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Status da Jornada</span>
              <HelpTooltip wikiHref="/wiki#jornada">
                <p className="font-semibold text-white/90 mb-1">Status de Jornada</p>
                <p className="text-white/60">Representa o momento atual da startup na sua trajetória.</p>
                <ul className="mt-1.5 space-y-0.5">
                  {JOURNEY_CONFIG.map((j) => (
                    <li key={j.value} className="text-white/70">· {j.value}</li>
                  ))}
                </ul>
              </HelpTooltip>
            </div>

            {isEditing ? (
              <>
                <select
                  value={journey}
                  onChange={(e) => setJourney(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text-primary text-xs px-2 py-1 focus:outline-none focus:border-primary"
                >
                  <option value="">— Selecionar —</option>
                  {JOURNEY_CONFIG.map((j) => <option key={j.value} value={j.value}>{j.value}</option>)}
                </select>
                {selectedJourney
                  ? <EditCard color={selectedJourney.color} title={selectedJourney.value} description={selectedJourney.description} />
                  : <div className="border border-dashed border-border px-2.5 py-2 text-[10px] text-text-muted italic">Nenhum selecionado</div>
                }
              </>
            ) : (
              selectedJourney
                ? <ViewChip
                    color={selectedJourney.color}
                    label={selectedJourney.value}
                    description={selectedJourney.description}
                    className="min-h-[96px]"
                  />
                : <EmptyChip label="Status da Jornada" className="min-h-[96px]" />
            )}
          </div>

          {/* ── ENGAJAMENTO — w-36 ── */}
          <div className="w-36 flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted uppercase font-label tracking-wide">Engajamento</span>
              <HelpTooltip wikiHref="/wiki#engajamento">
                <p className="font-semibold text-white/90 mb-1">Nível de Engajamento</p>
                {ENGAGEMENT_CONFIG.map((e) => (
                  <p key={e.value}>
                    <span className="font-semibold text-white/80">{e.value}:</span>{' '}
                    <span className="text-white/60">{e.description}</span>
                  </p>
                ))}
              </HelpTooltip>
            </div>

            {isEditing ? (
              <>
                <div className="flex gap-1 flex-wrap">
                  {ENGAGEMENT_CONFIG.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => setEngagement(e.value)}
                      className={[
                        'text-[10px] font-label font-semibold px-1.5 py-0.5 border transition-colors focus:outline-none',
                        engagement === e.value
                          ? e.color
                          : 'bg-surface-2 text-text-muted border-border opacity-50 hover:opacity-80',
                      ].join(' ')}
                    >
                      {e.value}
                    </button>
                  ))}
                </div>
                {selectedEngagement
                  ? <EditCard color={selectedEngagement.color} title={selectedEngagement.value} description={selectedEngagement.description} />
                  : <div className="border border-dashed border-border px-2.5 py-2 text-[10px] text-text-muted italic">Nenhum selecionado</div>
                }
              </>
            ) : (
              selectedEngagement
                ? <ViewChip
                    color={selectedEngagement.color}
                    label={selectedEngagement.value}
                    description={selectedEngagement.description}
                    className="min-h-[96px]"
                  />
                : <EmptyChip label="Engajamento" className="min-h-[96px]" />
            )}
          </div>

        </div>{/* end status columns */}

        {/* Edit / Save / Cancel */}
        <div className="shrink-0 self-start pt-0.5">
          {!isEditing ? (
            <button
              type="button"
              onClick={enterEdit}
              className="flex items-center gap-1.5 text-xs font-label text-text-muted hover:text-primary border border-border hover:border-primary/50 px-2.5 py-1.5 transition-colors"
            >
              <PencilIcon />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="text-xs font-label text-text-muted hover:text-text-primary border border-border px-2.5 py-1.5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="text-xs font-label font-semibold bg-primary text-white px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

      </div>{/* end main row */}

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
