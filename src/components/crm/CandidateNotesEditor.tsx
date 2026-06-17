'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { createActivity } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['crm_activities']['Row']

interface Props {
  candidateId: string
  notes: Activity[]
}

export function CandidateNotesEditor({ candidateId, notes: initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createActivity({
        startup_candidate_id: candidateId,
        type: 'Nota',
        date: new Date().toISOString(),
        status: 'Concluída',
        note: text.trim(),
      })
      if (res.error) { setError(res.error); return }
      if (res.id) {
        setNotes((prev) => [{
          id: res.id!,
          startup_candidate_id: candidateId,
          type: 'Nota',
          title: null,
          date: new Date().toISOString(),
          status: 'Concluída',
          note: text.trim(),
          external_link: null,
          responsible_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          updated_by: null,
          archived_at: null,
          archived_by: null,
        }, ...prev])
      }
      setText('')
      setShowForm(false)
    })
  }

  const sorted = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="px-4 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-label text-text-muted uppercase tracking-wider">
          Notas
        </span>
        <button
          onClick={() => { setShowForm((v) => !v); setError(null) }}
          className="text-[11px] font-label font-semibold text-primary hover:text-primary/80 uppercase tracking-wide transition-colors"
        >
          + Nova nota
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 bg-surface-2 border border-border p-3">
          <Textarea
            label="Nota"
            id="note-text"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setText('') }}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !text.trim()}>
              {isPending ? 'Salvando…' : 'Salvar nota'}
            </Button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <p className="text-xs text-text-muted">
          Nenhuma nota registrada.{' '}
          <button onClick={() => setShowForm(true)} className="text-primary hover:underline">
            Adicionar →
          </button>
        </p>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((note) => (
          <div key={note.id} className="flex gap-3 p-2.5 border border-border bg-surface-2">
            <div className="w-0.5 shrink-0 bg-border self-stretch rounded-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary whitespace-pre-wrap">{note.note}</p>
              <p className="text-[10px] text-text-muted mt-1.5 font-label">
                {new Date(note.date).toLocaleString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
