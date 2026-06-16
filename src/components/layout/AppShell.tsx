import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'
import NavLink from '@/app/(app)/NavLink'

export default async function AppShell({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { name: string; role: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — keeps dark navy regardless of global light theme */}
      <aside className="dark-surface w-56 shrink-0 flex flex-col bg-surface border-r border-border">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <Link href="/">
            <Image
              src="/assets/Logo-IARIS-fundo escuro.png"
              alt="IARIS"
              width={110}
              height={32}
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          <NavLink href="/" exact>
            Home
          </NavLink>
          <NavLink href="/crm">
            CRM
          </NavLink>
          <NavLink href="/atividades">
            Atividades
          </NavLink>
          <NavLink href="/meu-kanban">
            Meu Kanban
          </NavLink>
          <NavLink href="/wiki">
            Wiki
          </NavLink>

          {profile?.role === 'admin' && (
            <>
              <div className="mt-4 mb-1 px-2">
                <span className="font-label text-xs text-text-muted uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <NavLink href="/usuarios">
                Usuários
              </NavLink>
            </>
          )}
        </nav>

        {/* User menu */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <span className="font-label text-xs text-primary">
                {profile?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">{profile?.name}</p>
              <p className="text-xs text-text-muted capitalize">{profile?.role}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left font-label text-xs text-text-muted uppercase tracking-wide hover:text-text-secondary transition-colors px-1 py-1"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
