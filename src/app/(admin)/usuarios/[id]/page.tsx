import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import UserActions from './UserActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (currentProfile?.role !== 'admin') redirect('/')

  const { data: target } = await supabase
    .from('users')
    .select('id, name, role, must_change_password, created_at')
    .eq('id', id)
    .single()

  if (!target) notFound()

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <Link
          href="/usuarios"
          className="font-label text-xs text-text-muted uppercase tracking-wide hover:text-primary transition-colors"
        >
          ← Usuários
        </Link>
      </div>

      <h1 className="font-headline text-2xl font-semibold text-text-primary mb-1">
        {target.name}
      </h1>
      <div className="flex items-center gap-2 mb-6">
        <Badge variant={target.role === 'admin' ? 'teal' : 'default'}>{target.role}</Badge>
        {target.must_change_password && (
          <Badge variant="amber">Aguardando primeiro acesso</Badge>
        )}
      </div>

      <UserActions targetId={target.id} targetName={target.name} isSelf={currentUser.id === target.id} />
    </div>
  )
}
