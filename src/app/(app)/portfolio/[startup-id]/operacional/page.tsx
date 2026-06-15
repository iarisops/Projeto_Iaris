import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { currentQuarter, previousQuarter } from '@/lib/utils/quarter'
import { QuarterSelector } from '@/components/portfolio/QuarterSelector'
import { OperationalHeader } from '@/components/portfolio/OperationalHeader'
import { AssessmentForm } from '@/components/portfolio/AssessmentForm'
import { OKRSection } from '@/components/portfolio/OKRSection'
import { MetricsSection } from '@/components/portfolio/MetricsSection'
import { ActionPlanSection } from '@/components/portfolio/ActionPlanSection'
import { PortfolioKanban } from '@/components/portfolio/PortfolioKanban'
import { RitualsSection } from '@/components/portfolio/RitualsSection'
import { DocumentsSection } from '@/components/portfolio/DocumentsSection'
import { PortfolioActivitiesSection } from '@/components/portfolio/PortfolioActivitiesSection'
import { ContextSection } from '@/components/portfolio/ContextSection'
import { ContextHistory } from '@/components/portfolio/ContextHistory'

interface Props {
  params: Promise<{ 'startup-id': string }>
  searchParams: Promise<{ quarter?: string }>
}

function buildQuarterList(current: string): string[] {
  const quarters: string[] = []

  // 2 quarters ahead
  const [qPart, yearStr] = current.split('-')
  const year = parseInt(yearStr, 10)
  const num = parseInt(qPart.replace('Q', ''), 10)
  for (let i = 2; i >= 1; i--) {
    const nextNum = ((num - 1 + i) % 4) + 1
    const nextYear = year + Math.floor((num - 1 + i) / 4)
    quarters.push(`Q${nextNum}-${nextYear}`)
  }

  quarters.push(current)

  let q = current
  for (let i = 0; i < 4; i++) {
    q = previousQuarter(q)
    quarters.push(q)
  }

  return quarters
}

type AssessmentItem = {
  id: string
  category: string
  signal: string
  observed_evidence: string | null
  risk_interpretation: string | null
  next_focus: string | null
  responsible: string | null
  deadline: string | null
}

export default async function OperacionalPage({ params, searchParams }: Props) {
  const { 'startup-id': startupId } = await params
  const { quarter: quarterParam } = await searchParams
  const quarter = quarterParam ?? currentQuarter()

  const supabase = await createClient()

  const { data: startup } = await supabase
    .from('portfolio_startups')
    .select('id, name, logo_url, tier, stage, journey_status, engagement, last_update_at, short_description')
    .eq('id', startupId)
    .single()

  if (!startup) notFound()

  const [
    { data: assessmentRow },
    { data: okrs },
    { data: metrics },
    { data: actionPlans },
    { data: kanbanTasks },
    { data: rituals },
    { data: documents },
    { data: activities },
    { data: criteria },
    { data: contextVersions },
    { data: activeJobRow },
  ] = await Promise.all([
    supabase
      .from('operational_assessments')
      .select('id')
      .eq('startup_id', startupId)
      .eq('quarter', quarter)
      .maybeSingle(),
    supabase
      .from('okrs')
      .select('id, objective, status, progress, notes, key_results')
      .eq('startup_id', startupId)
      .eq('quarter', quarter)
      .order('created_at'),
    supabase
      .from('metrics')
      .select('id, type, current_value, previous_value, period, notes')
      .eq('startup_id', startupId)
      .eq('quarter', quarter),
    supabase
      .from('action_plans')
      .select('id, title, status, notes, okr_id, initiatives')
      .eq('startup_id', startupId)
      .eq('quarter', quarter)
      .order('created_at'),
    supabase
      .from('kanban_tasks')
      .select('id, title, description, phase, responsible_id, due_date, comments')
      .eq('startup_id', startupId)
      .eq('quarter', quarter)
      .order('created_at'),
    supabase
      .from('rituals')
      .select('id, type, date, notes, external_link, participants')
      .eq('startup_id', startupId)
      .order('date', { ascending: false })
      .limit(50),
    supabase
      .from('documents')
      .select('id, name, type, url, created_at')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false }),
    supabase
      .from('portfolio_activities')
      .select('id, startup_id, type, date, status, notes, external_link, responsible_id, created_at, updated_at')
      .eq('startup_id', startupId)
      .order('date', { ascending: false })
      .limit(100),
    supabase
      .from('assessment_criteria')
      .select('category, criterion, what_to_observe, green_description, yellow_description, orange_description, red_description'),
    supabase
      .from('context_versions')
      .select('id, content, model, prompt_version, was_manually_edited, generated_at, last_edited_at')
      .eq('startup_id', startupId)
      .order('generated_at', { ascending: false })
      .limit(10),
    supabase
      .from('ai_jobs')
      .select('id, status, error_message')
      .eq('startup_id', startupId)
      .in('status', ['Pendente', 'Processando'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Fetch assessment items sequentially (needs assessmentId)
  const assessmentId = assessmentRow?.id ?? null
  let resolvedItems: AssessmentItem[] = []
  if (assessmentId) {
    const { data: items } = await supabase
      .from('assessment_items')
      .select('id, category, signal, observed_evidence, risk_interpretation, next_focus, responsible, deadline')
      .eq('assessment_id', assessmentId)
    resolvedItems = (items ?? []) as AssessmentItem[]
  }

  const quarters = buildQuarterList(currentQuarter())

  const now = new Date()
  const ritualList = (rituals ?? [])
  const pastRituals = ritualList.filter((r) => new Date(r.date) <= now)
  const futureRituals = ritualList.filter((r) => new Date(r.date) > now)
  const lastRitual = pastRituals.length > 0 ? { date: pastRituals[0].date, type: pastRituals[0].type } : null
  const nextRitual = futureRituals.length > 0 ? { date: futureRituals[futureRituals.length - 1].date, type: futureRituals[futureRituals.length - 1].type } : null

  const okrList = (okrs ?? []).map((o) => ({ id: o.id, objective: o.objective }))

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0">
              {startup.logo_url ? (
                <Image src={startup.logo_url} alt={startup.name} width={48} height={48} className="w-full h-full object-contain" />
              ) : (
                <span className="font-headline text-xl font-bold text-primary">
                  {startup.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-headline text-xl font-bold text-text-primary">{startup.name}</h1>
              {startup.short_description && (
                <p className="text-sm text-text-muted mt-0.5 line-clamp-1">{startup.short_description}</p>
              )}
            </div>
          </div>
          <Suspense>
            <QuarterSelector current={quarter} quarters={quarters} />
          </Suspense>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-4 mt-3 border-t border-border pt-3">
          <a
            href={`/portfolio/${startupId}/perfil`}
            className="text-xs font-label text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide"
          >
            Perfil
          </a>
          <div className="text-xs font-label text-primary border-b border-primary pb-0.5 uppercase tracking-wide">
            Página Operacional
          </div>
        </div>
      </div>

      {/* Operational header (tier, jornada, engajamento) */}
      <div className="px-6 pt-4">
        <OperationalHeader
          startup={{
            id: startup.id,
            name: startup.name,
            logo_url: startup.logo_url,
            tier: startup.tier,
            journey_status: startup.journey_status,
            engagement: startup.engagement,
            last_update_at: startup.last_update_at,
          }}
          lastRitual={lastRitual}
          nextRitual={nextRitual}
        />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10 px-6 pb-12 pt-8 max-w-5xl">
        <section>
          <h2 className="font-headline text-base font-semibold text-text-primary mb-4">Assessment — {quarter}</h2>
          <AssessmentForm
            startupId={startupId}
            quarter={quarter}
            assessmentId={assessmentId}
            items={resolvedItems}
            criteria={(criteria ?? []) as Parameters<typeof AssessmentForm>[0]['criteria']}
          />
        </section>

        <section>
          <OKRSection
            startupId={startupId}
            quarter={quarter}
            okrs={(okrs ?? []) as Parameters<typeof OKRSection>[0]['okrs']}
          />
        </section>

        <section>
          <MetricsSection
            startupId={startupId}
            quarter={quarter}
            metrics={(metrics ?? []) as Parameters<typeof MetricsSection>[0]['metrics']}
          />
        </section>

        <section>
          <ActionPlanSection
            startupId={startupId}
            quarter={quarter}
            okrs={okrList}
            plans={(actionPlans ?? []) as Parameters<typeof ActionPlanSection>[0]['plans']}
          />
        </section>

        <section>
          <PortfolioKanban
            startupId={startupId}
            quarter={quarter}
            tasks={(kanbanTasks ?? []) as Parameters<typeof PortfolioKanban>[0]['tasks']}
          />
        </section>

        <section>
          <RitualsSection
            startupId={startupId}
            rituals={(rituals ?? []) as Parameters<typeof RitualsSection>[0]['rituals']}
          />
        </section>

        <section>
          <DocumentsSection
            startupId={startupId}
            documents={(documents ?? []) as Parameters<typeof DocumentsSection>[0]['documents']}
          />
        </section>

        <section>
          <PortfolioActivitiesSection
            startupId={startupId}
            activities={(activities ?? []) as Parameters<typeof PortfolioActivitiesSection>[0]['activities']}
          />
        </section>

        <section>
          <ContextSection
            startupId={startupId}
            lastVersion={(contextVersions ?? [])[0] ?? null}
            activeJob={activeJobRow ?? null}
          />
          <ContextHistory versions={contextVersions ?? []} />
        </section>
      </div>
    </div>
  )
}
