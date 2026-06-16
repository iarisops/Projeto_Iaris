import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FunnelInfoEditor } from '@/components/crm/FunnelInfoEditor'
import { FormConfigEditor } from '@/components/crm/FormConfigEditor'
import { StageManager } from '@/components/crm/StageManager'
import { PanelEvaluationFormConfig } from '@/components/crm/PanelEvaluationFormConfig'
import { resolveFormConfig } from '@/lib/defaults/funnel-form-config'

interface Props {
  params: Promise<{ 'funnel-id': string }>
}

export default async function FunnelConfigPage({ params }: Props) {
  const { 'funnel-id': funnelId } = await params
  const supabase = await createClient()

  // Admin guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') notFound()

  const [{ data: funnel }, { data: stages }, { data: panelForms }] = await Promise.all([
    supabase.from('funnels').select('*').eq('id', funnelId).single(),
    supabase.from('funnel_stages').select('*').eq('funnel_id', funnelId).order('position', { ascending: true }),
    supabase.from('panel_evaluation_forms').select('*').eq('funnel_id', funnelId).order('created_at', { ascending: false }),
  ])

  if (!funnel) notFound()

  const formConfig = resolveFormConfig((funnel as Record<string, unknown>)['form_config'] ?? null)

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1 text-xs text-text-muted">
          <Link href="/crm" className="hover:text-primary transition-colors">CRM</Link>
          <span>›</span>
          <Link href={`/crm/${funnelId}`} className="hover:text-primary transition-colors">{funnel.name}</Link>
          <span>›</span>
          <span className="text-text-secondary">Configurações</span>
        </div>
        <h1 className="font-headline text-xl font-bold text-text-primary">
          Configurações — {funnel.name}
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Edite as informações do funil, o formulário de cadastro, as etapas e os formulários de banca.
        </p>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-10 max-w-3xl">

        {/* Section: Informações do funil */}
        <section>
          <FunnelInfoEditor funnel={{
            id:          funnel.id,
            name:        funnel.name,
            description: funnel.description,
            edition:     funnel.edition,
            start_date:  funnel.start_date,
            end_date:    funnel.end_date,
            status:      funnel.status,
          }} />
        </section>

        <div className="border-t border-border" />

        {/* Section: Formulário de cadastro */}
        <section>
          <FormConfigEditor funnelId={funnelId} initialConfig={formConfig} />
        </section>

        <div className="border-t border-border" />

        {/* Section: Etapas */}
        <section>
          <StageManager funnelId={funnelId} stages={stages ?? []} />
        </section>

        <div className="border-t border-border" />

        {/* Section: Formulários de banca */}
        <section>
          <PanelEvaluationFormConfig funnelId={funnelId} forms={panelForms ?? []} />
        </section>
      </div>
    </div>
  )
}
