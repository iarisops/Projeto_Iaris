// CRM candidate detail page — redesigned
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { resolveFormConfig } from '@/lib/defaults/funnel-form-config'
import { FunnelStageProgress } from '@/components/crm/FunnelStageProgress'
import { CompactEvaluationPanel } from '@/components/crm/CompactEvaluationPanel'
import { ContactsPanel } from '@/components/crm/ContactsPanel'
import { ActivityHistory } from '@/components/crm/ActivityHistory'
import { ConvertToPortfolioDialog } from '@/components/crm/ConvertToPortfolioDialog'
import { CandidateInfoEditor } from '@/components/crm/CandidateInfoEditor'

interface Props {
  params: Promise<{ 'funnel-id': string; id: string }>
}

const PHASE_LABEL: Record<string, string> = {
  Ideação: 'Ideação', Validação: 'Validação', Operação: 'Operação',
  Tração: 'Tração', Escala: 'Escala',
}

export default async function CandidataPage({ params }: Props) {
  const { 'funnel-id': funnelId, id: candidateId } = await params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const [
    { data: candidate },
    { data: funnel },
    { data: stages },
    { data: assessment },
    { data: activities },
    { data: contacts },
    { data: users },
    { data: currentUserProfile },
  ] = await Promise.all([
    supabase.from('startup_candidates').select('*').eq('id', candidateId).single(),
    supabase.from('funnels').select('id, name, form_config').eq('id', funnelId).single(),
    supabase.from('funnel_stages').select('*').eq('funnel_id', funnelId).order('position'),
    supabase.from('qualitative_assessments').select('*').eq('startup_candidate_id', candidateId).maybeSingle(),
    supabase.from('crm_activities').select('*').eq('startup_candidate_id', candidateId).order('date', { ascending: false }),
    supabase.from('contacts').select('*').eq('startup_candidate_id', candidateId).order('created_at'),
    supabase.from('users').select('id, name').order('name'),
    supabase.from('users').select('id, role').eq('id', authUser?.id ?? '').maybeSingle(),
  ])

  if (!candidate || !funnel) notFound()

  const formConfig = resolveFormConfig((funnel as Record<string, unknown>)['form_config'] ?? null)
  const infoFields = formConfig.fields.filter(
    (f) => f.enabled && !f.archived && !f.is_contact_field && f.key !== 'stage_id'
  )
  const extraFields = (candidate.extra_fields as Record<string, string> | null) ?? {}

  const currentStage = (stages ?? []).find((s) => s.id === candidate.stage_id)

  return (
    <div className="flex flex-col min-h-full bg-background">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-border bg-surface">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-label">
          <Link href="/crm" className="hover:text-primary transition-colors">CRM</Link>
          <span>›</span>
          <Link href={`/crm/${funnelId}`} className="hover:text-primary transition-colors">
            {funnel.name}
          </Link>
          <span>›</span>
          <span className="text-text-secondary">{candidate.name}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-headline text-2xl font-bold text-text-primary leading-tight">
            {candidate.name}
          </h1>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {candidate.converted_portfolio_startup_id && (
              <a
                href={`/portfolio/${candidate.converted_portfolio_startup_id}/operacional`}
                className="text-xs font-label uppercase tracking-wide px-2.5 py-1 border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                Ver no Portfólio →
              </a>
            )}
          </div>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {candidate.vertical && (
            <span className="text-[10px] font-label uppercase tracking-wide bg-[#eef8f8] text-[#007a7a] px-2 py-0.5 border border-[#009999]/20">
              {candidate.vertical}
            </span>
          )}
          {candidate.phase && (
            <span className="text-[10px] font-label uppercase tracking-wide bg-surface-2 text-text-muted px-2 py-0.5 border border-border">
              {PHASE_LABEL[candidate.phase] ?? candidate.phase}
            </span>
          )}
          {candidate.score != null && (
            <span className="text-[10px] font-label text-primary font-semibold">
              Nota {candidate.score.toFixed(1)}
            </span>
          )}
          {currentStage && (
            <span className="text-[10px] text-text-muted font-label">
              Etapa: <span className="text-text-secondary">{currentStage.name}</span>
            </span>
          )}
          {candidate.site && (
            <a
              href={candidate.site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline font-label"
            >
              {candidate.site.replace(/^https?:\/\//, '')} ↗
            </a>
          )}
          {candidate.last_update_at && (
            <span className="text-[10px] text-text-muted font-label ml-auto">
              Atualizado {new Date(candidate.last_update_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Left column — main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Fase do Funil */}
          <FunnelStageProgress
            candidateId={candidateId}
            stages={stages ?? []}
            currentStageId={candidate.stage_id}
            currentResult={candidate.result}
          />

          {/* Avaliação Qualitativa */}
          <CompactEvaluationPanel
            candidateId={candidateId}
            assessment={assessment}
          />

          {/* Histórico de Atividade e Relacionamento */}
          <section className="bg-surface border border-border">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-headline text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Histórico de Atividade e Relacionamento
              </h2>
            </div>
            <ActivityHistory
              candidateId={candidateId}
              funnelId={funnelId}
              items={activities ?? []}
              users={users ?? []}
              currentUserId={currentUserProfile?.id ?? ''}
              isAdmin={currentUserProfile?.role === 'admin'}
            />
          </section>

        </div>

        {/* Right column — sidebar */}
        <div className="flex flex-col gap-4">

          <ContactsPanel
            candidateId={candidateId}
            primaryContactId={candidate.primary_contact_id}
            contacts={contacts ?? []}
          />

          <CandidateInfoEditor
            candidateId={candidateId}
            funnelId={funnelId}
            fields={infoFields}
            systemData={{
              name:              candidate.name,
              site:              candidate.site,
              vertical:          candidate.vertical,
              phase:             candidate.phase,
              score:             candidate.score,
              mrr:               candidate.mrr,
              customers:         candidate.customers,
              team:              candidate.team,
              equity:            candidate.equity,
              captable:          candidate.captable,
              what_seeks:        candidate.what_seeks,
              general_note:      candidate.general_note,
              reminder_note:     candidate.reminder_note,
              history_evolution: candidate.history_evolution,
              pitch_deck_url:    candidate.pitch_deck_url,
              next_action:       candidate.next_action,
            }}
            extraFields={extraFields}
          />

          {(!candidate.converted_portfolio_startup_id && candidate.result === 'Ganha') && (
            <ConvertToPortfolioDialog
              candidateId={candidateId}
              candidateName={candidate.name}
              previewData={{
                site:         candidate.site,
                vertical:     candidate.vertical,
                phase:        candidate.phase,
                captable:     candidate.captable,
                general_note: candidate.general_note,
              }}
            />
          )}

          {candidate.import_note && (
            <section className="bg-surface border border-border p-3">
              <p className="text-[10px] font-label text-text-muted uppercase tracking-wide mb-1">
                Nota de importação
              </p>
              <p className="text-xs text-text-secondary">{candidate.import_note}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
