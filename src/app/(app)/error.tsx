'use client'

import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <p className="font-label text-xs uppercase tracking-wide text-text-muted">Erro inesperado</p>
      <h2 className="font-headline text-xl font-bold text-text-primary">Algo deu errado</h2>
      <p className="text-sm text-text-muted max-w-sm">
        Ocorreu um erro ao carregar esta página. Tente novamente ou entre em contato com o suporte.
      </p>
      {error.digest && (
        <p className="font-label text-xs text-text-muted">Código: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary text-white text-sm font-label uppercase tracking-wide hover:bg-primary/90 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
