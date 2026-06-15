'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createRitual } from '@/lib/actions/rituals'

interface Ritual {
  id: string
  type: string
  date: string
  notes: string | null
  external_link: string | null
  participants: unknown
}

interface RitualsSectionProps {
  startupId: string
  rituals: Ritual[]
}

const TYPE_OPTIONS = [
  { value: 'Reunião mensal', label: 'Reunião mensal' },
  { value: 'Check-in quinzenal', label: 'Check-in quinzenal' },
  { value: 'Review trimestral', label: 'Review trimestral' },
  { value: 'Pitch / Demo', label: 'Pitch / Demo' },
  { value: 'Outro', label: 'Outro' },
]

export function RitualsSection({ startupId, rituals: initialRituals }: RitualsSectionProps) {
  const [rituals, setRituals] = useState(initialRituals)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'Reunião mensal', date: '', notes: '', external_link: '',
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date.trim()) return
    setSaving(true)
    setError(null)
    const res = await createRitual(startupId, {
      type: form.type,
      date: form.date,
      notes: form.notes || undefined,
      external_link: form.external_link || undefined,
    })
    setSaving(false)
    if (res.error) { setError(res.error); return }
    if (res.id) {
      setRituals((prev) => [{
        id: res.id!,
        type: form.type,
        date: form.date,
        notes: form.notes || null,
        external_link: form.external_link || null,
        participants: [],
      }, ...prev])
      setForm({ type: 'Reunião mensal', date: '', notes: '', external_link: '' })
      setShowForm(false)
    }
  }

  const sorted = [...rituals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Rituais</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>+ Novo Ritual</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Select label="Tipo" id="ritual-type" options={TYPE_OPTIONS} value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
          <Input label="Data e hora" id="ritual-date" type="datetime-local" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <Textarea label="Notas / Ata" id="ritual-notes" rows={3} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <Input label="Link externo (gravação, doc)" id="ritual-link" type="url" value={form.external_link}
            onChange={(e) => setForm((f) => ({ ...f, external_link: e.target.value }))} />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Criando…' : 'Criar'}</Button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-text-muted text-center py-6">Nenhum ritual registrado.</p>
      )}

      {sorted.map((ritual) => {
        const expanded = expandedId === ritual.id
        const date = new Date(ritual.date)
        const isPast = date <= new Date()
        return (
          <div key={ritual.id} className="bg-surface-2 border border-border">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => setExpandedId(expanded ? null : ritual.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-label text-[10px] text-text-muted uppercase tracking-wider shrink-0">
                  {ritual.type}
                </span>
                <span className={['text-xs font-medium', isPast ? 'text-text-muted' : 'text-primary'].join(' ')}>
                  {date.toLocaleDateString('pt-BR')}{' '}
                  {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className="text-text-muted text-xs ml-2">{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
              <div className="px-4 pb-4 border-t border-border flex flex-col gap-3 pt-3">
                {ritual.notes && (
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-label tracking-wide mb-1">Notas</p>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{ritual.notes}</p>
                  </div>
                )}
                {ritual.external_link && (
                  <a href={ritual.external_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline self-start">
                    Link externo ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
