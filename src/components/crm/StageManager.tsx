'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createStage, reorderStages, archiveStageWithRedirect, deleteStageWithRedirect } from '@/lib/actions/funnels'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']

type PendingAction = {
  stageId: string
  stageName: string
  action: 'archive' | 'delete'
}

interface StageManagerProps {
  funnelId: string
  stages: Stage[]
}

export function StageManager({ funnelId, stages: initialStages }: StageManagerProps) {
  const [stages, setStages] = useState(
    [...initialStages].filter((s) => !s.is_archived).sort((a, b) => a.position - b.position)
  )
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect dialog state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [targetStageId, setTargetStageId] = useState<string>('__none__')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const from = result.source.index
    const to = result.destination.index
    if (from === to) return

    const reordered = [...stages]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const withPositions = reordered.map((s, i) => ({ ...s, position: i + 1 }))
    setStages(withPositions)
    await reorderStages(funnelId, withPositions.map((s) => ({ id: s.id, position: s.position })))
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    const maxPos = stages.length > 0 ? Math.max(...stages.map((s) => s.position)) : 0
    const res = await createStage(funnelId, { name: newName.trim(), position: maxPos + 1 })
    setCreating(false)
    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      setStages((prev) => [
        ...prev,
        {
          id: res.id!,
          funnel_id: funnelId,
          name: newName.trim(),
          position: maxPos + 1,
          is_default: false,
          is_final: false,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      setNewName('')
      setShowNew(false)
    }
  }

  function openDialog(stage: Stage, action: 'archive' | 'delete') {
    setPendingAction({ stageId: stage.id, stageName: stage.name, action })
    setTargetStageId('__none__')
    setActionError(null)
  }

  async function confirmAction() {
    if (!pendingAction) return
    setActionLoading(true)
    setActionError(null)

    const target = targetStageId === '__none__' ? null : targetStageId
    const fn = pendingAction.action === 'archive' ? archiveStageWithRedirect : deleteStageWithRedirect
    const res = await fn(pendingAction.stageId, target)

    setActionLoading(false)
    if (res.error) {
      setActionError(res.error)
    } else {
      setStages((prev) => prev.filter((s) => s.id !== pendingAction.stageId))
      setPendingAction(null)
    }
  }

  // Options for target stage (exclude the stage being acted upon)
  const targetOptions = [
    { value: '__none__', label: '— Sem etapa (desconectar candidatas) —' },
    ...stages
      .filter((s) => pendingAction && s.id !== pendingAction.stageId)
      .map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Etapas do funil
        </h3>
        <Button size="sm" variant="secondary" onClick={() => setShowNew((v) => !v)}>
          + Nova etapa
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stages">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-1">
              {stages.map((stage, index) => (
                <Draggable key={stage.id} draggableId={stage.id} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={[
                        'flex items-center gap-3 px-3 py-2 border border-border bg-surface-2',
                        snapshot.isDragging ? 'opacity-80 border-primary' : '',
                      ].join(' ')}
                    >
                      <div
                        {...drag.dragHandleProps}
                        className="text-text-muted cursor-grab active:cursor-grabbing text-sm select-none"
                        title="Arrastar para reordenar"
                      >
                        ⠿
                      </div>
                      <span className="flex-1 text-sm text-text-primary">{stage.name}</span>
                      {stage.is_default && (
                        <span className="text-[10px] text-text-muted uppercase font-label">padrão</span>
                      )}
                      {stage.is_final && (
                        <span className="text-[10px] text-primary uppercase font-label">final</span>
                      )}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openDialog(stage, 'archive')}
                          className="text-text-muted hover:text-signal-amber transition-colors text-xs font-label uppercase tracking-wide"
                        >
                          Arquivar
                        </button>
                        <button
                          type="button"
                          onClick={() => openDialog(stage, 'delete')}
                          className="text-text-muted hover:text-signal-red transition-colors text-xs font-label uppercase tracking-wide"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showNew && (
        <div className="flex gap-2 items-end">
          <Input
            label="Nome da nova etapa"
            id="stage-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          />
          <Button size="sm" onClick={handleCreate} disabled={creating}>
            {creating ? 'Criando…' : 'Criar'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>×</Button>
        </div>
      )}

      {error && <p className="text-xs text-signal-red">{error}</p>}

      {/* Archive / Delete dialog */}
      <Modal
        open={pendingAction !== null}
        onClose={() => { setPendingAction(null); setActionError(null) }}
        title={pendingAction?.action === 'archive' ? `Arquivar etapa "${pendingAction?.stageName}"?` : `Excluir etapa "${pendingAction?.stageName}"?`}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            {pendingAction?.action === 'archive'
              ? 'A etapa será arquivada e não aparecerá mais no Kanban. '
              : 'A etapa será permanentemente excluída. '}
            Escolha para qual etapa as startups candidatas vinculadas devem ser movidas:
          </p>

          <Select
            label="Mover candidatas para"
            id="target-stage"
            options={targetOptions}
            value={targetStageId}
            onChange={(e) => setTargetStageId(e.target.value)}
          />

          {actionError && <p className="text-xs text-signal-red">{actionError}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setPendingAction(null); setActionError(null) }}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              disabled={actionLoading}
              className={pendingAction?.action === 'delete' ? 'bg-signal-red hover:bg-signal-red/90 border-signal-red' : ''}
            >
              {actionLoading
                ? 'Processando…'
                : pendingAction?.action === 'archive'
                ? 'Arquivar etapa'
                : 'Excluir etapa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
