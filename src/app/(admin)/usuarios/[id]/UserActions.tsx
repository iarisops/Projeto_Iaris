'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { deactivateUser, resetUserPassword } from '@/lib/actions/auth'

interface Props {
  targetId: string
  targetName: string
  isSelf: boolean
}

export default function UserActions({ targetId, targetName, isSelf }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleReset() {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await resetUserPassword(targetId)
      if (result.error) setError(result.error)
      else { setMessage('E-mail de redefinição de senha enviado.'); router.refresh() }
    })
  }

  function handleDeactivate() {
    if (!confirm(`Desativar conta de ${targetName}?`)) return
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await deactivateUser(targetId)
      if (result.error) setError(result.error)
      else { setMessage('Conta desativada.'); router.refresh() }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {message && <p className="text-sm text-signal-green">{message}</p>}
      {error && <p className="text-sm text-signal-red">{error}</p>}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleReset}
        disabled={isPending}
      >
        Reenviar convite / resetar senha
      </Button>

      {!isSelf && (
        <Button
          variant="danger"
          size="sm"
          onClick={handleDeactivate}
          disabled={isPending}
        >
          Desativar conta
        </Button>
      )}
    </div>
  )
}
