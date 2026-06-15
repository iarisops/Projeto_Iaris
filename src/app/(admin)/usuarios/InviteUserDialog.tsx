'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { inviteUser } from '@/lib/actions/auth'

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await inviteUser({
        email: form.get('email') as string,
        name: form.get('name') as string,
        role: form.get('role') as 'admin' | 'member',
      })
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        Convidar usuário
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Convidar usuário" size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="name" label="Nome" id="invite-name" required />
          <Input name="email" type="email" label="E-mail" id="invite-email" required />
          <Select
            name="role"
            label="Papel"
            id="invite-role"
            options={[
              { value: 'member', label: 'Membro' },
              { value: 'admin', label: 'Admin' },
            ]}
            defaultValue="member"
          />
          {error && <p className="text-sm text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Enviando…' : 'Convidar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
