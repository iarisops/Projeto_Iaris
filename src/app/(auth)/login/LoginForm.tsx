'use client'

import { useActionState } from 'react'
import { login } from '@/lib/actions/auth'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-label text-xs text-text-secondary uppercase tracking-wide">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="bg-surface-2 border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-label text-xs text-text-secondary uppercase tracking-wide">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {isPending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
