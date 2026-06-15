'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { convertToPortfolio } from '@/lib/actions/candidates'

interface Props {
  candidateId: string
  candidateName: string
  previewData: {
    site?: string | null
    vertical?: string | null
    phase?: string | null
    captable?: string | null
    general_note?: string | null
  }
}

export function ConvertToPortfolioDialog({ candidateId, candidateName, previewData }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConvert() {
    setLoading(true)
    setError(null)
    const res = await convertToPortfolio(candidateId)
    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else if (res.portfolioStartupId) {
      router.push(`/portfolio/${res.portfolioStartupId}/perfil`)
    }
  }

  const migrated = [
    { label: 'Nome', value: candidateName },
    { label: 'Site', value: previewData.site },
    { label: 'Vertical', value: previewData.vertical },
    { label: 'Fase', value: previewData.phase },
    { label: 'Captable', value: previewData.captable },
    { label: 'Descrição', value: previewData.general_note },
  ].filter((f) => f.value)

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setError(null) }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-navy text-sm font-label uppercase tracking-wider hover:bg-primary/90 transition-colors"
      >
        Converter em Portfólio
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => { if (!loading) setOpen(false) }}
          />

          {/* Dialog */}
          <div className="relative bg-surface border border-border w-full max-w-md flex flex-col gap-0 shadow-2xl">
            <div className="px-5 pt-5 pb-4 border-b border-border">
              <h2 className="font-headline text-base font-bold text-text-primary">
                Converter em Startup de Portfólio
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Cria um registro em Portfólio com os dados abaixo migrados. A candidata original é preservada.
              </p>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="text-xs text-text-secondary uppercase font-label tracking-wide">
                Dados que serão migrados
              </p>
              <div className="flex flex-col divide-y divide-border">
                {migrated.map((f) => (
                  <div key={f.label} className="flex justify-between gap-3 py-1.5 text-sm">
                    <span className="text-text-muted shrink-0">{f.label}</span>
                    <span className="text-text-primary text-right truncate">{f.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-muted mt-1">
                Fundadores, métricas e demais dados podem ser completados na Página de Perfil.
              </p>

              {error && (
                <p className="text-xs text-signal-red bg-signal-red/5 border border-signal-red/20 px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="px-5 pb-5 flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConvert}
                disabled={loading}
              >
                {loading ? 'Convertendo…' : 'Confirmar conversão'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
