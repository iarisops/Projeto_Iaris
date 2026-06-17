import type { ReactNode } from 'react'
import BoardTabs from './BoardTabs'

export default function MeuKanbanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Section heading */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">Kanban</h1>
        <p className="text-sm text-text-muted mt-1">
          Visualize e gerencie tarefas em todos os boards que você tem acesso.
        </p>
      </div>

      {/* Board selector */}
      <BoardTabs />

      {/* Page content */}
      {children}
    </div>
  )
}
