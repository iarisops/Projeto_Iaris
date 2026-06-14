'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createCandidate } from '@/lib/actions/candidates'
import type { CandidateRow } from '@/components/crm/CandidateCard'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']

interface NewCandidateModalProps {
  open: boolean
  onClose: () => void
  funnelId: string
  stages: Stage[]
  onCreated: (candidate: CandidateRow) => void
}

const PHASE_OPTIONS = [
  { value: '', label: '— sem fase —' },
  { value: 'Ideação', label: 'Ideação' },
  { value: 'Validação', label: 'Validação' },
  { value: 'Operação', label: 'Operação' },
  { value: 'Tração', label: 'Tração' },
  { value: 'Escala', label: 'Escala' },
]

export function NewCandidateModal({
  open,
  onClose,
  funnelId,
  stages,
  onCreated,
}: NewCandidateModalProps) {
  const defaultStageId = stages.find((s) => s.is_default)?.id ?? stages[0]?.id ?? ''
  const [form, setForm] = useState({
    name: '',
    site: '',
    whatsapp: '',
    email: '',
    vertical: '',
    phase: '',
    stage_id: defaultStageId,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name }))

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome obrigatório.'); return }
    setLoading(true)

    const res = await createCandidate({
      funnel_id: funnelId,
      name: form.name.trim(),
      site: form.site || undefined,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      vertical: form.vertical || undefined,
      phase: form.phase as Parameters<typeof createCandidate>[0]['phase'] || undefined,
      stage_id: form.stage_id || undefined,
    })

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      const newCandidate: CandidateRow = {
        id: res.id,
        funnel_id: funnelId,
        name: form.name.trim(),
        site: form.site || null,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        vertical: form.vertical || null,
        phase: form.phase || null,
        stage_id: form.stage_id || null,
        result: 'Em aberto',
        internal_owner_id: null,
        equity: null,
        score: null,
        captable: null,
        mrr: null,
        customers: null,
        team: null,
        what_seeks: null,
        general_note: null,
        reminder_note: null,
        history_evolution: null,
        pitch_deck_url: null,
        next_action: null,
        last_update_at: new Date().toISOString(),
        converted_portfolio_startup_id: null,
        import_note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
        owner_name: null,
      }
      setForm({ name: '', site: '', whatsapp: '', email: '', vertical: '', phase: '', stage_id: defaultStageId })
      onCreated(newCandidate)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova startup candidata" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome da startup *"
          id="nc-name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Site"
            id="nc-site"
            type="url"
            value={form.site}
            onChange={(e) => update('site', e.target.value)}
          />
          <Input
            label="WhatsApp"
            id="nc-whatsapp"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            placeholder="+5511999999999"
          />
        </div>
        <Input
          label="E-mail"
          id="nc-email"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Vertical"
            id="nc-vertical"
            value={form.vertical}
            onChange={(e) => update('vertical', e.target.value)}
          />
          <Select
            label="Fase"
            id="nc-phase"
            options={PHASE_OPTIONS}
            value={form.phase}
            onChange={(e) => update('phase', e.target.value)}
          />
        </div>
        {stages.length > 0 && (
          <Select
            label="Etapa inicial"
            id="nc-stage"
            options={stageOptions}
            value={form.stage_id}
            onChange={(e) => update('stage_id', e.target.value)}
          />
        )}

        {error && <p className="text-sm text-signal-red">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar candidata'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
