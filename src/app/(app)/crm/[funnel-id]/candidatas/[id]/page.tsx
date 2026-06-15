import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { QualitativeAssessmentForm } from '@/components/crm/QualitativeAssessmentForm'
import { PanelEvaluationConsolidation } from '@/components/crm/PanelEvaluationConsolidation'
import { ActivityTimeline } from '@/components/crm/ActivityTimeline'
import { CandidateStageResultEditor } from '@/components/crm/CandidateStageResultEditor'
import { ConvertToPortfolioDialog } from '@/components/crm/ConvertToPortfolioDialog'
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp'

interface Props {
  params: Promise<{ 'funnel-id': string; id: string }>
}

const resultBadgeVariant = {
  'Em aberto': 'default',
  'Ganha': 'green',
  'Perdida': 'red',
  'Acompanhar futuramente': 'amber',
} as const

export default async function CandidataPage({ params }: Props) {
  const { 'funnel-id': funnelId, id: candidateId } = await params
  const supabase = await createClient()

  const [
    { data: candidate },
    { data: funnel },
    { data: stages },
    { data: assessment },
    { data: panelEvaluations },
    { data: activities },
  ] = await Promise.all([
    supabase.from('startup_candidates').select('*').eq('id', candidateId).single(),
    supabase.from('funnels').select('id, name').eq('id', funnelId).single(),
    supabase
      .from('funnel_stages')
      .select('*')
      .eq('funnel_id', funnelId)
      .order('position', { ascending: true }),
    supabase
      .from('qualitative_assessments')
      .select('*')
      .eq('startup_candidate_id', candidateId)
      .maybeSingle(),
    supabase
      .from('panel_evaluations')
      .select('*')
      .eq('startup_candidate_id', candidateId)
      .order('evaluation_date', { ascending: false }),
    supabase
      .from('crm_activities')
      .select('*')
      .eq('startup_candidate_id', candidateId)
      .order('date', { ascending: false }),
  ])

  if (!candidate || !funnel) notFound()

  const currentStage = (stages ?? []).find((s) => s.id === candidate.stage_id)
  const badgeVariant = (resultBadgeVariant[candidate.result as keyof typeof resultBadgeVariant]) ?? 'default'
  const whatsappUrl = candidate.whatsapp ? buildWhatsAppUrl(candidate.whatsapp) : null

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-text-muted">
              <Link href="/crm" className="hover:text-primary transition-colors">CRM</Link>
              <span>›</span>
              <Link href={`/crm/${funnelId}`} className="hover:text-primary transition-colors">{funnel.name}</Link>
              <span>›</span>
              <span className="text-text-secondary">{candidate.name}</span>
            </div>
            <h1 className="font-headline text-xl font-bold text-text-primary">{candidate.name}</h1>
          </div>
          <Badge variant={badgeVariant}>{candidate.result}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          {currentStage && <span>Etapa: <span className="text-text-secondary">{currentStage.name}</span></span>}
          {candidate.vertical && <span>Vertical: <span className="text-text-secondary">{candidate.vertical}</span></span>}
          {candidate.phase && <span>Fase: <span className="text-text-secondary">{candidate.phase}</span></span>}
          {candidate.score != null && <span>Nota: <span className="text-primary font-semibold">{candidate.score.toFixed(1)}</span></span>}
          {candidate.last_update_at && (
            <span>Atualizado: <span className="text-text-secondary">{new Date(candidate.last_update_at).toLocaleDateString('pt-BR')}</span></span>
          )}
        </div>

        {candidate.next_action && (
          <p className="mt-2 text-xs text-accent">
            Próxima ação: {candidate.next_action}
          </p>
        )}

        {candidate.converted_portfolio_startup_id && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="teal">Convertida em portfólio</Badge>
            <a
              href={`/portfolio/${candidate.converted_portfolio_startup_id}/operacional`}
              className="text-xs text-primary hover:underline"
            >
              Ver no portfólio →
            </a>
          </div>
        )}
      </div>

      {/* Body — two-column grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Dados básicos */}
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Dados básicos
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {candidate.site && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Site</p>
                  <a href={candidate.site} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block">{candidate.site}</a>
                </div>
              )}
              {candidate.vertical && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Vertical</p>
                  <p className="text-text-primary">{candidate.vertical}</p>
                </div>
              )}
              {candidate.phase && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Fase</p>
                  <p className="text-text-primary">{candidate.phase}</p>
                </div>
              )}
              {candidate.mrr != null && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">MRR</p>
                  <p className="text-text-primary">R$ {candidate.mrr.toLocaleString('pt-BR')}</p>
                </div>
              )}
              {candidate.customers && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Clientes</p>
                  <p className="text-text-primary">{candidate.customers}</p>
                </div>
              )}
              {candidate.team && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Time</p>
                  <p className="text-text-primary">{candidate.team}</p>
                </div>
              )}
              {candidate.equity && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Equity</p>
                  <p className="text-text-primary">{candidate.equity}</p>
                </div>
              )}
              {candidate.captable && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Captable</p>
                  <p className="text-text-primary">{candidate.captable}</p>
                </div>
              )}
              {candidate.what_seeks && (
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">O que busca</p>
                  <p className="text-text-primary">{candidate.what_seeks}</p>
                </div>
              )}
              {candidate.pitch_deck_url && (
                <div className="col-span-2">
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">Pitch Deck</p>
                  <a href={candidate.pitch_deck_url} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline">{candidate.pitch_deck_url}</a>
                </div>
              )}
            </div>
          </section>

          {/* Histórico / Notas */}
          {(candidate.general_note || candidate.history_evolution || candidate.reminder_note) && (
            <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
              <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Histórico & Notas
              </h2>
              {candidate.history_evolution && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide mb-1">Evolução histórica</p>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{candidate.history_evolution}</p>
                </div>
              )}
              {candidate.general_note && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide mb-1">Nota geral</p>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{candidate.general_note}</p>
                </div>
              )}
              {candidate.reminder_note && (
                <div className="bg-accent/10 border border-accent/30 p-3">
                  <p className="text-xs text-accent uppercase font-label tracking-wide mb-1">Lembrete</p>
                  <p className="text-sm text-text-primary">{candidate.reminder_note}</p>
                </div>
              )}
            </section>
          )}

          {/* Avaliação Qualitativa IARIS */}
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Avaliação Qualitativa IARIS
            </h2>
            <QualitativeAssessmentForm
              candidateId={candidateId}
              initial={assessment}
            />
          </section>

          {/* Avaliações de Banca */}
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Avaliações de Banca
            </h2>
            <PanelEvaluationConsolidation evaluations={panelEvaluations ?? []} />
          </section>

          {/* Atividades */}
          <section className="bg-surface-2 border border-border p-4">
            <ActivityTimeline
              candidateId={candidateId}
              activities={activities ?? []}
            />
          </section>
        </div>

        {/* Right column (1/3) */}
        <div className="flex flex-col gap-4">

          {/* Etapa & Resultado */}
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Etapa & Resultado
            </h2>
            <CandidateStageResultEditor
              candidateId={candidateId}
              currentStageId={candidate.stage_id}
              currentResult={candidate.result}
              stages={stages ?? []}
            />
          </section>

          {/* Contatos */}
          {(candidate.whatsapp || candidate.email) && (
            <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
              <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Contatos
              </h2>
              {candidate.email && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">E-mail</p>
                  <a href={`mailto:${candidate.email}`} className="text-sm text-primary hover:underline">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.whatsapp && (
                <div>
                  <p className="text-xs text-text-muted uppercase font-label tracking-wide">WhatsApp</p>
                  <p className="text-sm text-text-secondary">{candidate.whatsapp}</p>
                </div>
              )}
            </section>
          )}

          {/* Ações rápidas */}
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-2">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Ações rápidas
            </h2>

            {/* T030 — WhatsApp */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-signal-green/20 border border-signal-green/40 text-signal-green text-sm font-label uppercase tracking-wider hover:bg-signal-green/30 transition-colors"
              >
                WhatsApp ↗
              </a>
            ) : (
              <div className="text-xs text-text-muted text-center py-2 border border-border">
                WhatsApp não cadastrado
              </div>
            )}

            {/* US3 — Converter em Portfólio */}
            {!candidate.converted_portfolio_startup_id && candidate.result === 'Ganha' && (
              <ConvertToPortfolioDialog
                candidateId={candidateId}
                candidateName={candidate.name}
                previewData={{
                  site: candidate.site,
                  vertical: candidate.vertical,
                  phase: candidate.phase,
                  captable: candidate.captable,
                  general_note: candidate.general_note,
                }}
              />
            )}

            {candidate.converted_portfolio_startup_id && (
              <a
                href={`/portfolio/${candidate.converted_portfolio_startup_id}/operacional`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary text-sm font-label uppercase tracking-wider hover:bg-primary/20 transition-colors"
              >
                Ver no Portfólio →
              </a>
            )}
          </section>

          {/* Import note (if any) */}
          {candidate.import_note && (
            <section className="bg-surface-2 border border-border p-3">
              <p className="text-xs text-text-muted uppercase font-label tracking-wide mb-1">Nota de importação</p>
              <p className="text-xs text-text-secondary">{candidate.import_note}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
