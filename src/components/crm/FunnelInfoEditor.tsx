'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { updateFunnel } from '@/lib/actions/funnels'

interface FunnelData {
  id: string
  name: string
  description: string | null
  edition: string | null
  start_date: string | null
  end_date: string | null
  status: string
}

interface Props {
  funnel: FunnelData
}

const STATUS_OPTIONS = [
  { value: 'Ativo',     label: 'Ativo' },
  { value: 'Encerrado', label: 'Encerrado' },
  { value: 'Arquivado', label: 'Arquivado' },
]

export function FunnelInfoEditor({ funnel }: Props) {
  const [form, setForm] = useState({
    name:        funnel.name,
    description: funnel.description ?? '',
    edition:     funnel.edition ?? '',
    start_date:  funnel.start_date ?? '',
    end_date:    funnel.end_date ?? '',
    status:      funnel.status,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
    setError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome obrigatório.'); return }
    setSaving(true)
    const res = await updateFunnel(funnel.id, {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      edition:     form.edition.trim() || undefined,
      start_date:  form.start_date || undefined,
      end_date:    form.end_date || undefined,
      status:      form.status as 'Ativo' | 'Encerrado' | 'Arquivado',
    })
    setSaving(false)
    if (res.error) {
      setError(res.error)
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-sm font-semibold text-text-primary">
            Informações do funil
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Dados gerais exibidos na listagem e no cabeçalho do funil.
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : saved ? 'Salvo ✓' : 'Salvar'}
        </Button>
      </div>

      {error && <p className="text-xs text-signal-red">{error}</p>}

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Nome *"
            id="fi-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-label text-xs text-text-muted uppercase tracking-wide block mb-1">
            Descrição
          </label>
          <textarea
            id="fi-description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="w-full bg-surface border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Descrição opcional do funil"
          />
        </div>

        <Input
          label="Edição"
          id="fi-edition"
          value={form.edition}
          onChange={(e) => set('edition', e.target.value)}
          placeholder="Ex: 4ª Edição"
        />

        <Select
          label="Status"
          id="fi-status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        />

        <Input
          label="Data de início"
          id="fi-start"
          type="date"
          value={form.start_date}
          onChange={(e) => set('start_date', e.target.value)}
        />

        <Input
          label="Data de encerramento"
          id="fi-end"
          type="date"
          value={form.end_date}
          onChange={(e) => set('end_date', e.target.value)}
        />
      </form>
    </div>
  )
}
