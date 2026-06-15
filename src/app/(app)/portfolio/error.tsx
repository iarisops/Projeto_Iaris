'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PortfolioError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <p className="font-label text-xs uppercase tracking-wide text-text-muted">Portfólio — Erro</p>
      <h2 className="font-headline text-xl font-bold text-text-primary">Falha ao carregar startup</h2>
      <p className="text-sm text-text-muted max-w-sm">
        Não foi possível carregar os dados operacionais desta startup. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary text-white text-sm font-label uppercase tracking-wide hover:bg-primary/90 transition-colors"
      >
        Recarregar
      </button>
    </div>
  )
}
