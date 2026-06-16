'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createPortfolioStartup } from '@/lib/actions/portfolio'

const STAGE_OPTIONS = [
  { value: '',          label: '— Selecionar —' },
  { value: 'Ideação',   label: 'Ideação' },
  { value: 'Validação', label: 'Validação' },
  { value: 'Operação',  label: 'Operação' },
  { value: 'Tração',    label: 'Tração' },
  { value: 'Escala',    label: 'Escala' },
]

const VERTICAL_OPTIONS = [
  { value: '',           label: '— Selecionar —' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Jurídico',   label: 'Jurídico' },
  { value: 'Marketing',  label: 'Marketing' },
  { value: 'Tech',       label: 'Tech' },
]

export function AddStartupButton() {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    name:              '',
    site:              '',
    vertical:          '',
    stage:             '',
    short_description: '',
    entry_date:        '',
  })

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleOpen() { setOpen(true); setError(null) }
  function handleClose() { if (!loading) { setOpen(false); setForm({ name: '', site: '', vertical: '', stage: '', short_description: '', entry_date: '' }) } }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setLoading(true)
    setError(null)

    const res = await createPortfolioStartup({
      name:              form.name.trim(),
      site:              form.site  || undefined,
      vertical:          form.vertical || undefined,
      stage:             (form.stage as 'Ideação' | 'Validação' | 'Operação' | 'Tração' | 'Escala') || undefined,
      short_description: form.short_description || undefined,
      entry_date:        form.entry_date || undefined,
    })

    setLoading(false)
    if (res.error) { setError(res.error); return }
    router.push(`/portfolio/${res.id}/perfil`)
  }

  return (
    <>
      <Button size="sm" onClick={handleOpen}>
        + Nova Startup
      </Button>

      <Modal open={open} onClose={handleClose} title="Adicionar Startup ao Portfólio" size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome da Startup *"
            id="ns-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Site"
              id="ns-site"
              type="url"
              placeholder="https://"
              value={form.site}
              onChange={(e) => set('site', e.target.value)}
            />
            <Input
              label="Data de Entrada no Portfólio"
              id="ns-entry"
              type="date"
              value={form.entry_date}
              onChange={(e) => set('entry_date', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Vertical / Segmento"
              id="ns-vertical"
              options={VERTICAL_OPTIONS}
              value={form.vertical}
              onChange={(e) => set('vertical', e.target.value)}
            />
            <Select
              label="Estágio"
              id="ns-stage"
              options={STAGE_OPTIONS}
              value={form.stage}
              onChange={(e) => set('stage', e.target.value)}
            />
          </div>

          <Textarea
            label="Breve Descrição"
            id="ns-desc"
            rows={2}
            value={form.short_description}
            onChange={(e) => set('short_description', e.target.value)}
          />

          <p className="text-xs text-text-muted">
            Fundadores, captable, métricas e demais dados podem ser preenchidos na Página de Perfil após o cadastro.
          </p>

          {error && (
            <p className="text-xs text-signal-red bg-signal-red/5 border border-signal-red/20 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Criando…' : 'Criar e ir para Perfil'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
