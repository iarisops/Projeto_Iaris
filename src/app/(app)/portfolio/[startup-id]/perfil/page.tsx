import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { ProfileEditor } from '@/components/portfolio/ProfileEditor'

interface Props {
  params: Promise<{ 'startup-id': string }>
}

export default async function PerfilPage({ params }: Props) {
  const { 'startup-id': startupId } = await params
  const supabase = await createClient()

  const [{ data: startup }, { data: sourceCandidate }] = await Promise.all([
    supabase.from('portfolio_startups').select('*').eq('id', startupId).single(),
    // Defer source candidate fetch — will be null if no source
    supabase.from('startup_candidates').select('id, name, funnel_id').eq('converted_portfolio_startup_id', startupId).maybeSingle(),
  ])

  if (!startup) notFound()

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
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
          <div className="flex items-center gap-2 shrink-0">
            {startup.tier != null && startup.tier > 0 && (
              <Badge variant={(['muted', 'teal', 'amber', 'green'] as const)[startup.tier]}>
                Tier {startup.tier}
              </Badge>
            )}
            {startup.stage && <Badge variant="default">{startup.stage}</Badge>}
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-4 mt-3 border-t border-border pt-3">
          <div className="text-xs font-label text-primary border-b border-primary pb-0.5 uppercase tracking-wide">
            Perfil
          </div>
          <a
            href={`/portfolio/${startupId}/operacional`}
            className="text-xs font-label text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide"
          >
            Página Operacional
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-0 max-w-3xl">
        <ProfileEditor startup={startup} />

        {/* Origem no CRM */}
        {sourceCandidate && (
          <section className="bg-surface-2 border border-border p-4 flex flex-col gap-2 mt-6">
            <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Origem no CRM
            </h2>
            <p className="text-sm text-text-primary">
              Startup convertida a partir da candidatura{' '}
              <span className="font-semibold">{sourceCandidate.name}</span>.
            </p>
            <a
              href={`/crm/${sourceCandidate.funnel_id}/candidatas/${sourceCandidate.id}`}
              className="text-xs text-primary hover:underline self-start"
            >
              Ver candidatura original →
            </a>
          </section>
        )}

        {/* Entry date */}
        {startup.entry_date && (
          <p className="text-xs text-text-muted mt-4">
            Data de entrada no portfólio:{' '}
            {new Date(startup.entry_date).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  )
}
