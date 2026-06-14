'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { NewFunnelModal } from '@/components/crm/NewFunnelModal'

export function FunnelListClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Novo funil</Button>
      <NewFunnelModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
