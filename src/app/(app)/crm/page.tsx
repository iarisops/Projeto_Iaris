import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FunnelListClient } from '@/components/crm/FunnelListClient'

const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6.07 1.12a1.5 1.5 0 0 1 1.86 0l.9.75a.5.5 0 0 0 .38.1l1.16-.18a1.5 1.5 0 0 1 1.61 1.07l.32 1.13a.5.5 0 0 0 .27.32l1.06.47a1.5 1.5 0 0 1 .73 1.77l-.38 1.1a.5.5 0 0 0 0 .38l.38 1.1a1.5 1.5 0 0 1-.73 1.77l-1.06.47a.5.5 0 0 0-.27.32l-.32 1.13a1.5 1.5 0 0 1-1.61 1.07l-1.16-.18a.5.5 0 0 0-.38.1l-.9.75a1.5 1.5 0 0 1-1.86 0l-.9-.75a.5.5 0 0 0-.38-.1l-1.16.18a1.5 1.5 0 0 1-1.61-1.07l-.32-1.13a.5.5 0 0 0-.27-.32l-1.06-.47a1.5 1.5 0 0 1-.73-1.77l.38-1.1a.5.5 0 0 0 0-.38l-.38-1.1a1.5 1.5 0 0 1 .73-1.77l1.06-.47a.5.5 0 0 0 .27-.32l.32-1.13a1.5 1.5 0 0 1 1.61-1.07l1.16.18a.5.5 0 0 0 .38-.1l.9-.75Zm.56 1.14a.5.5 0 0 0-.62 0l-.9.75a1.5 1.5 0 0 1-1.13.3l-1.16-.18a.5.5 0 0 0-.54.36l-.32 1.13a1.5 1.5 0 0 1-.8.96l-1.06.47a.5.5 0 0 0-.24.59l.38 1.1a1.5 1.5 0 0 1 0 1.14l-.38 1.1a.5.5 0 0 0 .24.59l1.06.47a1.5 1.5 0 0 1 .8.96l.32 1.13a.5.5 0 0 0 .54.36l1.16-.18a1.5 1.5 0 0 1 1.13.3l.9.75a.5.5 0 0 0 .62 0l.9-.75a1.5 1.5 0 0 1 1.13-.3l1.16.18a.5.5 0 0 0 .54-.36l.32-1.13a1.5 1.5 0 0 1 .8-.96l1.06-.47a.5.5 0 0 0 .24-.59l-.38-1.1a1.5 1.5 0 0 1 0-1.14l.38-1.1a.5.5 0 0 0-.24-.59l-1.06-.47a1.5 1.5 0 0 1-.8-.96l-.32-1.13a.5.5 0 0 0-.54-.36l-1.16.18a1.5 1.5 0 0 1-1.13-.3l-.9-.75Z" fill="currentColor"/>
  </svg>
)

async function getFunnels() {
  const supabase = await createClient()
  const { data: funnels, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !funnels) return []

  const funnelsWithStats = await Promise.all(
    funnels.map(async (f) => {
      const { count: total } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)
      const { count: won } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)
        .eq('result', 'Ganha')
      const { count: lost } = await supabase
        .from('startup_candidates')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', f.id)
        .eq('result', 'Perdida')
      const totalNum = total ?? 0
      const wonNum   = won   ?? 0
      return {
        ...f,
        total_candidates: totalNum,
        won_candidates:   wonNum,
        lost_candidates:  lost ?? 0,
        conversion_rate:  totalNum > 0 ? Math.round((wonNum / totalNum) * 100) : 0,
      }
    })
  )
  return funnelsWithStats
}

export default async function CRMPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
  }

  const funnels = await getFunnels()

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f5f7fc] min-h-full">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-[#0d1226]">
            CRM de Originação
          </h1>
          <p className="text-sm text-[#8492b0] mt-1">
            Gerencie os funis de seleção do Investor Day
          </p>
        </div>
        {isAdmin && <FunnelListClient />}
      </div>

      {funnels.length === 0 && (
        <div className="bg-white border border-[#e2e8f4] p-12 text-center">
          <p className="text-[#8492b0] text-sm">Nenhum funil cadastrado ainda.</p>
          {isAdmin && (
            <p className="text-[#aab3c8] text-xs mt-1">
              Clique em "Novo funil" para começar.
            </p>
          )}
        </div>
      )}

      {/* Funnel cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {funnels.map((funnel) => {
          const isAtivo = funnel.status === 'Ativo'
          const statusDot = isAtivo ? 'bg-[#38a169]' : funnel.status === 'Encerrado' ? 'bg-[#fbb33d]' : 'bg-[#8492b0]'

          return (
            <div
              key={funnel.id}
              className="relative flex flex-col bg-white border border-[#e2e8f4] hover:border-[#009999]/50 hover:shadow-sm transition-all"
            >
              {/* Full-card cover link */}
              <Link
                href={`/crm/${funnel.id}`}
                className="absolute inset-0 z-0"
                aria-label={`Abrir funil ${funnel.name}`}
              />

              <div className="relative z-[1] flex flex-col gap-4 p-5 flex-1 pointer-events-none">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                      <span className="text-[10px] font-label text-[#8492b0] uppercase tracking-wide">
                        {funnel.status}
                      </span>
                    </div>
                    <h2 className="font-headline text-base font-semibold text-[#0d1226] leading-snug">
                      {funnel.name}
                    </h2>
                    {funnel.edition && (
                      <p className="text-xs text-[#8492b0] mt-0.5">{funnel.edition}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      href={`/crm/${funnel.id}/configuracoes`}
                      className="relative z-10 flex items-center justify-center w-7 h-7 text-[#8492b0] hover:text-[#009999] hover:bg-[#f0f7f7] transition-colors border border-[#e2e8f4] hover:border-[#009999]/30 shrink-0 pointer-events-auto"
                      title="Configurações"
                    >
                      <GearIcon />
                    </Link>
                  )}
                </div>

                {/* Description */}
                {funnel.description && (
                  <p className="text-xs text-[#6b7a99] line-clamp-2">{funnel.description}</p>
                )}

                {/* Stats */}
                <div className="mt-auto pt-4 border-t border-[#f0f2f8]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-headline font-bold text-[#0d1226]">
                        {funnel.total_candidates}
                      </p>
                      <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wide">
                        Total
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-headline font-bold text-[#38a169]">
                        {funnel.won_candidates}
                      </p>
                      <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wide">
                        Ganhas
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-headline font-bold text-[#009999]">
                        {funnel.conversion_rate}%
                      </p>
                      <p className="font-label text-[10px] text-[#8492b0] uppercase tracking-wide">
                        Conversão
                      </p>
                    </div>
                  </div>

                  {(funnel.start_date || funnel.end_date) && (
                    <p className="text-[10px] text-[#aab3c8] mt-3 text-center">
                      {funnel.start_date && new Date(funnel.start_date).toLocaleDateString('pt-BR')}
                      {funnel.start_date && funnel.end_date && ' – '}
                      {funnel.end_date && new Date(funnel.end_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
