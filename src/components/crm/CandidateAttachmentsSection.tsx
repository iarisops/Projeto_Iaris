'use client'

import { useState, useRef } from 'react'
import { createActivity } from '@/lib/actions/candidates'
import { uploadCRMAttachment } from '@/lib/actions/storage'
import type { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['crm_activities']['Row']

interface Props {
  candidateId: string
  funnelId: string
  attachments: Activity[]
}

export function CandidateAttachmentsSection({ candidateId, funnelId, attachments: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fd = new FormData()
      fd.append('file', file)
      const { url, error: upErr } = await uploadCRMAttachment(fd, funnelId)
      if (upErr) { setError(upErr); continue }
      if (!url) continue

      const res = await createActivity({
        startup_candidate_id: candidateId,
        type: 'Anexo',
        date: new Date().toISOString(),
        status: 'Concluída',
        external_link: url,
        note: file.name,
      })

      if (!res.error && res.id) {
        setItems((prev) => [{
          id: res.id!,
          startup_candidate_id: candidateId,
          type: 'Anexo',
          title: null,
          date: new Date().toISOString(),
          status: 'Concluída',
          external_link: url,
          note: file.name,
          responsible_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          updated_by: null,
          archived_at: null,
          archived_by: null,
        }, ...prev])
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="px-4 py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-label text-text-muted uppercase tracking-wider">
          Anexos
        </span>
        <label className={[
          'text-[11px] font-label font-semibold uppercase tracking-wide transition-colors cursor-pointer',
          uploading ? 'text-text-muted' : 'text-primary hover:text-primary/80',
        ].join(' ')}>
          {uploading ? 'Enviando…' : '+ Enviar arquivo'}
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-xs text-signal-red mb-2">{error}</p>}

      {items.length === 0 && !uploading && (
        <p className="text-xs text-text-muted">
          Nenhum anexo.{' '}
          <label className="text-primary hover:underline cursor-pointer">
            Enviar arquivo →
            <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </label>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {[...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => {
          const name = item.note || (item.external_link?.split('/').pop() ?? 'Arquivo')
          const ext = name.split('.').pop()?.toUpperCase() ?? ''
          return (
            <a
              key={item.id}
              href={item.external_link ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 bg-surface-2 border border-border hover:border-primary/30 transition-colors group"
            >
              <span className="text-[9px] font-label font-bold text-text-muted bg-border px-1 py-0.5 shrink-0">
                {ext || 'ARQ'}
              </span>
              <span className="text-xs text-text-secondary group-hover:text-primary transition-colors truncate flex-1">
                {name}
              </span>
              <span className="text-[10px] text-text-muted font-label shrink-0">
                {new Date(item.date).toLocaleDateString('pt-BR')} ↗
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
