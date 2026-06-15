'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { requestContextUpdate, saveContextEdit } from '@/lib/actions/ai-jobs'

type ContextVersion = {
  id: string
  content: string
  model: string | null
  prompt_version: string | null
  was_manually_edited: boolean
  generated_at: string | null
  last_edited_at: string | null
}

type AiJob = {
  id: string
  status: string
  error_message: string | null
}

interface Props {
  startupId: string
  lastVersion: ContextVersion | null
  activeJob: AiJob | null
}

export function ContextSection({ startupId, lastVersion, activeJob }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  // Derive status from props — isPending covers the brief gap between action and server re-render
  const serverStatus = activeJob?.status ?? null
  const isActive = isPending || serverStatus === 'Pendente' || serverStatus === 'Processando'

  // Poll while a job is in flight
  useEffect(() => {
    if (!isActive || isPending) return
    const interval = setInterval(() => router.refresh(), 10_000)
    return () => clearInterval(interval)
  }, [isActive, isPending, router])

  function handleStartEditing() {
    setEditContent(lastVersion?.content ?? '')
    setEditing(true)
  }

  function handleCancelEditing() {
    setEditing(false)
    setEditContent('')
  }

  function handleRequestUpdate() {
    setActionError(null)
    startTransition(async () => {
      const result = await requestContextUpdate(startupId)
      if (result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleSaveEdit() {
    setActionError(null)
    startTransition(async () => {
      const result = await saveContextEdit(startupId, editContent)
      if (result.error) {
        setActionError(result.error)
      } else {
        setEditing(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-headline text-base font-semibold text-text-primary">Resumo de Contexto IA</h2>
        <div className="flex items-center gap-3">
          {serverStatus === 'Pendente' && (
            <span className="text-xs font-label text-accent animate-pulse">Aguardando worker…</span>
          )}
          {serverStatus === 'Processando' && (
            <span className="text-xs font-label text-accent animate-pulse">Gerando…</span>
          )}
          <button
            onClick={handleRequestUpdate}
            disabled={isPending || isActive}
            className="px-4 py-1.5 bg-primary text-white text-xs font-label uppercase tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Solicitando…' : 'Atualizar Contexto'}
          </button>
        </div>
      </div>

      {actionError && (
        <p className="text-xs text-red-400 px-1">{actionError}</p>
      )}

      {serverStatus === 'Erro' && activeJob?.error_message && (
        <div className="px-3 py-2 border border-red-800 bg-red-900/20 text-xs text-red-400">
          Erro na geração: {activeJob.error_message}
        </div>
      )}

      {lastVersion ? (
        editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={14}
              disabled={isPending}
              className="w-full bg-surface-2 border border-border text-text-primary text-sm p-3 font-body resize-y focus:outline-none focus:border-primary disabled:opacity-60"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isPending}
                className="px-4 py-1.5 bg-primary text-white text-xs font-label uppercase tracking-wide disabled:opacity-50"
              >
                {isPending ? 'Salvando…' : 'Salvar Edição'}
              </button>
              <button
                onClick={handleCancelEditing}
                disabled={isPending}
                className="px-4 py-1.5 border border-border text-text-muted text-xs font-label uppercase tracking-wide hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-surface-2 border border-border p-4 text-sm text-text-primary whitespace-pre-wrap font-body leading-relaxed">
              {lastVersion.content}
            </div>
            <div className="flex items-center justify-between mt-2 px-0.5">
              <p className="text-xs text-text-muted">
                {lastVersion.was_manually_edited
                  ? `Editado manualmente · ${lastVersion.last_edited_at ? new Date(lastVersion.last_edited_at).toLocaleString('pt-BR') : '—'}`
                  : `${lastVersion.model ?? '—'} · Prompt ${lastVersion.prompt_version ?? '—'} · ${lastVersion.generated_at ? new Date(lastVersion.generated_at).toLocaleString('pt-BR') : '—'}`}
              </p>
              <button
                onClick={handleStartEditing}
                className="text-xs text-text-muted hover:text-primary transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="bg-surface-2 border border-border p-8 text-center text-text-muted text-sm">
          {isActive
            ? 'Gerando resumo de contexto… atualiza em 10s.'
            : 'Nenhum contexto gerado ainda. Clique em “Atualizar Contexto” para gerar.'}
        </div>
      )}
    </div>
  )
}
