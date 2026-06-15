'use client'

import { useActionState } from 'react'
import { changePasswordFirstAccess } from '@/lib/actions/auth'

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordFirstAccess, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-label text-xs text-text-secondary uppercase tracking-wide">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="confirm" className="font-label text-xs text-text-secondary uppercase tracking-wide">
          Confirmar senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-signal-red">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 bg-primary text-white font-label text-sm uppercase tracking-wider px-4 py-2.5 disabled:opacity-50 hover:bg-vibrant-teal/90 transition-colors"
      >
        {isPending ? 'Salvando…' : 'Definir senha'}
      </button>
    </form>
  )
}
