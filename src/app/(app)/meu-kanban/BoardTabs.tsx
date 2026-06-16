'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Meu Kanban', href: '/meu-kanban', exact: true },
  { label: 'IARIS', href: '/meu-kanban/iaris', exact: false },
] as const

export default function BoardTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-0 border-b border-border">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
