'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { CandidateCard, type CandidateRow } from '@/components/crm/CandidateCard'
import { moveStage } from '@/lib/actions/candidates'
import type { Database } from '@/types/supabase'

type Stage = Database['public']['Tables']['funnel_stages']['Row']

interface KanbanBoardProps {
  stages: Stage[]
  candidates: CandidateRow[]
  funnelId: string
}

export function KanbanBoard({ stages, candidates: initialCandidates, funnelId }: KanbanBoardProps) {
  const [candidates, setCandidates] = useState(initialCandidates)

  const activeStages = stages
    .filter((s) => !s.is_archived)
    .sort((a, b) => a.position - b.position)

  const byStage = useCallback(() => {
    const map: Record<string, CandidateRow[]> = {}
    for (const stage of activeStages) {
      map[stage.id] = candidates.filter((c) => c.stage_id === stage.id)
    }
    // Unassigned candidates
    map['__none__'] = candidates.filter((c) => !c.stage_id)
    return map
  }, [candidates, activeStages])

  async function onDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStageId = destination.droppableId === '__none__' ? null : destination.droppableId

    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, stage_id: newStageId } : c))
    )

    if (newStageId) {
      await moveStage(draggableId, newStageId)
    }
  }

  const stageMap = byStage()
  const columnsToShow = [...activeStages]

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {columnsToShow.map((stage) => {
          const cards = stageMap[stage.id] ?? []
          return (
            <div key={stage.id} className="flex-shrink-0 w-64 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 py-2 border-b border-border">
                <span className="font-label text-xs text-text-secondary uppercase tracking-wider truncate">
                  {stage.name}
                </span>
                <span className="text-xs text-text-muted ml-2 shrink-0">{cards.length}</span>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={[
                      'flex-1 flex flex-col gap-2 p-1 min-h-[200px] transition-colors',
                      snapshot.isDraggingOver ? 'bg-primary/5' : '',
                    ].join(' ')}
                  >
                    {cards.map((candidate, index) => (
                      <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                        {(drag, dragSnapshot) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className={dragSnapshot.isDragging ? 'opacity-80 rotate-1' : ''}
                          >
                            <CandidateCard
                              candidate={candidate}
                              href={`/crm/${funnelId}/candidatas/${candidate.id}`}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
