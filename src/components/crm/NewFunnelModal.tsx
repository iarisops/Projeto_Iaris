'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { createFunnel } from '@/lib/actions/funnels'

interface NewFunnelModalProps {
  open: boolean
  onClose: () => void
}

export function NewFunnelModal({ open, onClose }: NewFunnelModalProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    edition: '',
    description: '',
    start_date: '',
    end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nome obrigatório.')
      return
    }
    setLoading(true)
    const res = await createFunnel({
      name: form.name.trim(),
      edition: form.edition || undefined,
      description: form.description || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    })
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      onClose()
      router.push(`/crm/${res.id}`)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo funil de originação" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome"
          id="fn-name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Ex: 5º Investor Day IARIS Ventures"
          required
        />
        <Input
          label="Edição"
          id="fn-edition"
          value={form.edition}
          onChange={(e) => update('edition', e.target.value)}
          placeholder="Ex: 2026-S1"
        />
        <Textarea
          label="Descrição"
          id="fn-desc"
          rows={2}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Início"
            id="fn-start"
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
          />
          <Input
            label="Fim"
            id="fn-end"
            type="date"
            value={form.end_date}
            onChange={(e) => update('end_date', e.target.value)}
          />
        </div>

        <p className="text-xs text-text-muted">
          As 8 etapas padrão do funil serão criadas automaticamente.
        </p>

        {error && <p className="text-sm text-signal-red">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar funil'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
