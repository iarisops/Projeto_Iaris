'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface NavLinkProps {
  href: string
  exact?: boolean
  children: ReactNode
}

export default function NavLink({ href, exact, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={[
        'block px-3 py-2 text-sm font-body transition-colors',
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2 border-l-2 border-transparent',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
