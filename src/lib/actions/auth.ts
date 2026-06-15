'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Login ───────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('must_change_password')
    .eq('id', data.user.id)
    .single()

  if (profile?.must_change_password) {
    redirect('/primeiro-acesso')
  }

  redirect('/')
}

// ─── Logout ──────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Change Password (first access) ──────────────────────────

const ChangePasswordSchema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem.',
    path: ['confirm'],
  })

export async function changePasswordFirstAccess(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const parsed = ChangePasswordSchema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Senha inválida.'
    return { error: msg }
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  await supabase
    .from('users')
    .update({ must_change_password: false })
    .eq('id', user.id)

  redirect('/')
}

// ─── Invite User (admin only) ─────────────────────────────────

const InviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'member']),
})

export async function inviteUser(
  data: z.infer<typeof InviteUserSchema>
): Promise<{ userId?: string; error?: string }> {
  const parsed = InviteUserSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Permissão negada.' }
  }

  const admin = createAdminClient()
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { data: { name: parsed.data.name } }
  )

  if (inviteError || !invited.user) {
    return { error: inviteError?.message ?? 'Erro ao convidar usuário.' }
  }

  const { error: insertError } = await admin
    .from('users')
    .insert({
      id: invited.user.id,
      name: parsed.data.name,
      role: parsed.data.role,
      must_change_password: true,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { userId: invited.user.id }
}

// ─── Deactivate User (admin only) ────────────────────────────

export async function deactivateUser(
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Permissão negada.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '87600h', // 10 years
  })

  if (error) return { error: error.message }
  return {}
}

// ─── Reset User Password (admin only) ────────────────────────

export async function resetUserPassword(
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Permissão negada.' }
  }

  const admin = createAdminClient()
  const { data: userData } = await admin.auth.admin.getUserById(userId)
  if (!userData.user?.email) return { error: 'Usuário não encontrado.' }

  const { error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: userData.user.email,
  })

  // Also mark must_change_password = true so user is forced to set a new password
  await admin
    .from('users')
    .update({ must_change_password: true })
    .eq('id', userId)

  if (error) return { error: error.message }
  return {}
}
