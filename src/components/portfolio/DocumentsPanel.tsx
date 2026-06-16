'use client'

import { useState, useRef, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { addDocumentLink, uploadPortfolioDocument, deleteDocument } from '@/lib/actions/portfolio'
import type { Database } from '@/types/supabase'

type Doc = Database['public']['Tables']['documents']['Row']

interface Props {
  startupId: string
  initialDocs: Doc[]
}

function Svg({ children, className = 'w-3.5 h-3.5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {children}
    </svg>
  )
}

function LinkIcon() {
  return <Svg><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></Svg>
}

function FileIcon() {
  return <Svg><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></Svg>
}

function TrashIcon() {
  return <Svg><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></Svg>
}

function ExternalIcon() {
  return <Svg><path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></Svg>
}

function DownloadIcon() {
  return <Svg><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></Svg>
}

function typeLabel(type: string | null) {
  if (!type || type === 'link') return null
  return type.toUpperCase()
}

export function DocumentsPanel({ startupId, initialDocs }: Props) {
  const [docs,        setDocs]        = useState<Doc[]>(initialDocs)
  const [addMode,     setAddMode]     = useState<'link' | 'file' | null>(null)
  const [linkName,    setLinkName]    = useState('')
  const [linkUrl,     setLinkUrl]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [confirmId,   setConfirmId]   = useState<string | null>(null)
  const [, startTransition]           = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await addDocumentLink(startupId, linkName, linkUrl)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setDocs((prev) => [{
      id: res.id!, startup_id: startupId, name: linkName.trim(),
      url: linkUrl.trim(), storage_path: null, type: 'link',
      kanban_task_id: null, created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), created_by: null, updated_by: null,
    }, ...prev])
    setLinkName('')
    setLinkUrl('')
    setAddMode(null)
  }

  async function handleUploadFile(file: File) {
    setUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadPortfolioDocument(startupId, fd)
    setUploading(false)
    if (res.error) { setError(res.error); return }
    const ext = file.name.split('.').pop() ?? 'bin'
    setDocs((prev) => [{
      id: res.id!, startup_id: startupId, name: file.name,
      url: res.url!, storage_path: null, type: ext,
      kanban_task_id: null, created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), created_by: null, updated_by: null,
    }, ...prev])
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteDocument(id)
      if (!res.error) setDocs((prev) => prev.filter((d) => d.id !== id))
      setConfirmId(null)
    })
  }

  return (
    <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Links & Documentos
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setAddMode(addMode === 'link' ? null : 'link'); setError(null) }}
            className={[
              'text-[11px] font-label font-semibold uppercase tracking-wide px-2 py-1 border transition-colors',
              addMode === 'link'
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-primary border-primary/30 hover:bg-primary/5',
            ].join(' ')}
          >
            + Link
          </button>
          <label className={[
            'text-[11px] font-label font-semibold uppercase tracking-wide px-2 py-1 border transition-colors cursor-pointer',
            uploading
              ? 'text-text-muted border-border cursor-not-allowed'
              : 'text-text-muted border-border hover:border-primary/40 hover:text-primary',
          ].join(' ')}>
            {uploading ? 'Enviando…' : '+ Arquivo'}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUploadFile(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {/* Inline link form */}
      {addMode === 'link' && (
        <form onSubmit={handleAddLink} className="bg-surface border border-border p-3 flex flex-col gap-2">
          <Input label="Nome do link *" id="doc-link-name" value={linkName}
            onChange={(e) => setLinkName(e.target.value)} required autoFocus />
          <Input label="URL *" id="doc-link-url" type="url" value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)} required />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAddMode(null); setError(null) }}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={saving || !linkName.trim() || !linkUrl.trim()}>
              {saving ? 'Salvando…' : 'Adicionar link'}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-xs text-signal-red">{error}</p>}

      {/* Document list */}
      {docs.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum documento ou link cadastrado.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {docs.map((doc) => {
            const isLink = doc.type === 'link'
            const label  = typeLabel(doc.type)
            return (
              <div key={doc.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border',
                  isLink
                    ? 'bg-[#eef8f8] border-[#009999]/50 text-[#007a7a]'
                    : 'bg-surface-2 border-border text-text-muted',
                ].join(' ')}>
                  {isLink ? <LinkIcon /> : <FileIcon />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-text-primary font-medium truncate">{doc.name}</span>
                    {label && (
                      <span className="text-[9px] font-label font-bold text-text-muted bg-border px-1 py-0.5 shrink-0">
                        {label}
                      </span>
                    )}
                  </div>
                  {doc.url && (
                    <p className="text-[11px] text-text-muted truncate">{doc.url}</p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {confirmId === doc.id ? (
                    <>
                      <span className="text-[11px] text-signal-red font-label">Confirmar?</span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-[11px] font-label font-semibold text-signal-red hover:underline"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[11px] font-label text-text-muted hover:text-text-primary"
                      >
                        Não
                      </button>
                    </>
                  ) : (
                    <>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={isLink ? 'Abrir link' : 'Baixar arquivo'}
                          className="text-text-muted hover:text-primary transition-colors"
                        >
                          {isLink ? <ExternalIcon /> : <DownloadIcon />}
                        </a>
                      )}
                      <button
                        onClick={() => setConfirmId(doc.id)}
                        title="Excluir"
                        className="text-text-muted hover:text-signal-red transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
