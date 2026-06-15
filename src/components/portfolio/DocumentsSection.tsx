'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { addDocument } from '@/lib/actions/documents'

interface Document {
  id: string
  name: string
  type: string | null
  url: string | null
  created_at: string
}

interface DocumentsSectionProps {
  startupId: string
  documents: Document[]
}

const TYPE_OPTIONS = [
  { value: 'Pitch deck', label: 'Pitch deck' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Contrato', label: 'Contrato' },
  { value: 'Relatório', label: 'Relatório' },
  { value: 'Evidência', label: 'Evidência' },
  { value: 'Outro', label: 'Outro' },
]

const TYPE_ICON: Record<string, string> = {
  'Pitch deck': '📊',
  'Financeiro': '💰',
  'Contrato': '📋',
  'Relatório': '📄',
  'Evidência': '🔍',
  'Outro': '📎',
}

export function DocumentsSection({ startupId, documents: initialDocs }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState(initialDocs)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'Outro', url: '' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    const res = await addDocument(startupId, {
      name: form.name,
      type: form.type,
      url: form.url || undefined,
    })
    setSaving(false)
    if (res.error) { setError(res.error); return }
    if (res.id) {
      setDocuments((prev) => [...prev, {
        id: res.id!,
        name: form.name,
        type: form.type,
        url: form.url || null,
        created_at: new Date().toISOString(),
      }])
      setForm({ name: '', type: 'Outro', url: '' })
      setShowForm(false)
    }
  }

  const byType: Record<string, Document[]> = {}
  for (const doc of documents) {
    const key = doc.type ?? 'Outro'
    if (!byType[key]) byType[key] = []
    byType[key].push(doc)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">Documentos</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>+ Adicionar Link</Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
          <Input label="Nome" id="doc-name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Select label="Tipo" id="doc-type" options={TYPE_OPTIONS} value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
          <Input label="URL" id="doc-url" type="url" placeholder="https://…" value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Adicionando…' : 'Adicionar'}</Button>
          </div>
        </form>
      )}

      {documents.length === 0 && !showForm && (
        <p className="text-sm text-text-muted text-center py-6">Nenhum documento adicionado.</p>
      )}

      {Object.entries(byType).map(([type, docs]) => (
        <div key={type} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 border-b border-border/40 pb-1">
            <span className="text-sm">{TYPE_ICON[type] ?? '📎'}</span>
            <span className="text-xs text-text-muted uppercase font-label tracking-wide">{type}</span>
          </div>
          {docs.map((doc) => (
            <div key={doc.id} className="bg-surface-2 border border-border p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block">
                    {doc.name}
                  </a>
                ) : (
                  <p className="text-sm text-text-primary truncate">{doc.name}</p>
                )}
              </div>
              <span className="text-[10px] text-text-muted shrink-0">
                {new Date(doc.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
