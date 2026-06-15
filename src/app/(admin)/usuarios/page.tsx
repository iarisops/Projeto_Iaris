import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import InviteUserDialog from './InviteUserDialog'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: users } = await supabase
    .from('users')
    .select('id, name, role, must_change_password, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-semibold text-text-primary">Usuários</h1>
        <InviteUserDialog />
      </div>

      <div className="bg-surface border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 font-label text-xs text-text-muted uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-label text-xs text-text-muted uppercase tracking-wide">Papel</th>
              <th className="text-left px-4 py-3 font-label text-xs text-text-muted uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 text-text-primary font-medium">{u.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'admin' ? 'teal' : 'default'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.must_change_password && (
                    <Badge variant="amber">Aguardando primeiro acesso</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/usuarios/${u.id}`}
                    className="text-xs text-text-muted hover:text-primary transition-colors font-label uppercase tracking-wide"
                  >
                    Gerenciar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
