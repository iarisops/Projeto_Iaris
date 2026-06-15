'use client'

import { useState } from 'react'

type ContextVersion = {
  id: string
  content: string
  model: string | null
  prompt_version: string | null
  was_manually_edited: boolean
  generated_at: string | null
  last_edited_at: string | null
}

interface Props {
  versions: ContextVersion[]
}

export function ContextHistory({ versions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (versions.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="font-label text-xs uppercase tracking-wide text-text-muted">Histórico de versões</h3>
      <div className="flex flex-col gap-1">
        {versions.map((v, i) => {
          const isExpanded = expandedId === v.id
          const date = v.was_manually_edited ? v.last_edited_at : v.generated_at
          return (
            <div key={v.id} className="border border-border">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-2 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : v.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-label text-text-muted shrink-0">
                    {i === 0 ? 'Atual' : `v${versions.length - i}`}
                  </span>
                  {v.was_manually_edited && (
                    <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent font-label shrink-0">
                      Manual
                    </span>
                  )}
                  <span className="text-xs text-text-primary truncate">
                    {date ? new Date(date).toLocaleString('pt-BR') : '—'}
                  </span>
                  {!v.was_manually_edited && v.model && (
                    <span className="text-xs text-text-muted truncate">{v.model}</span>
                  )}
                </div>
                <span className="text-text-muted text-xs ml-2 shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div className="px-3 py-3 border-t border-border bg-surface-2">
                  <pre className="text-xs text-text-primary whitespace-pre-wrap font-body leading-relaxed">
                    {v.content}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
