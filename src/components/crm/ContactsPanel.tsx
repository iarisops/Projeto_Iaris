'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createContact, updateContact, deleteContact, setPrimaryContact } from '@/lib/actions/contacts'
import type { Database } from '@/types/supabase'

type ContactRow = Database['public']['Tables']['contacts']['Row']

interface Props {
  candidateId: string
  primaryContactId: string | null
  contacts: ContactRow[]
}

const EMPTY_FORM = { name: '', role: '', whatsapp: '', email: '', linkedin: '', isPrimary: false }

export function ContactsPanel({ candidateId, primaryContactId, contacts: initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ContactRow | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setAddOpen(true)
  }

  function openEdit(c: ContactRow) {
    setForm({
      name:      c.name,
      role:      c.role ?? '',
      whatsapp:  c.whatsapp ?? '',
      email:     c.email ?? '',
      linkedin:  c.linkedin ?? '',
      isPrimary: c.id === primaryContactId,
    })
    setFormError(null)
    setEditTarget(c)
  }

  function closeModals() {
    setAddOpen(false)
    setEditTarget(null)
    setFormError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Nome é obrigatório.'); return }
    setFormError(null)
    startTransition(async () => {
      const res = await createContact({
        startup_candidate_id: candidateId,
        name:     form.name,
        role:     form.role || undefined,
        whatsapp: form.whatsapp || undefined,
        email:    form.email || undefined,
        linkedin: form.linkedin || undefined,
      })
      if (res.error) { setFormError(res.error); return }
      if (form.isPrimary && res.id) {
        await setPrimaryContact(candidateId, res.id)
      }
      closeModals()
      router.refresh()
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget || !form.name.trim()) { setFormError('Nome é obrigatório.'); return }
    setFormError(null)
    startTransition(async () => {
      const res = await updateContact(editTarget.id, {
        name:     form.name,
        role:     form.role,
        whatsapp: form.whatsapp,
        email:    form.email,
        linkedin: form.linkedin,
      })
      if (res.error) { setFormError(res.error); return }
      if (form.isPrimary && editTarget.id !== primaryContactId) {
        await setPrimaryContact(candidateId, editTarget.id)
      } else if (!form.isPrimary && editTarget.id === primaryContactId) {
        await setPrimaryContact(candidateId, null)
      }
      closeModals()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este contato?')) return
    startTransition(async () => {
      await deleteContact(id)
      router.refresh()
    })
  }

  async function handleSetPrimary(contactId: string) {
    startTransition(async () => {
      await setPrimaryContact(candidateId, contactId)
      router.refresh()
    })
  }

  const primary = initial.find((c) => c.id === primaryContactId)
  const others  = initial.filter((c) => c.id !== primaryContactId)
  const ordered = primary ? [primary, ...others] : initial

  return (
    <section className="bg-surface border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-headline text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Contatos
        </h2>
        <button
          onClick={openAdd}
          className="text-[11px] font-label font-semibold text-primary hover:text-primary/80 uppercase tracking-wide transition-colors"
        >
          + Adicionar
        </button>
      </div>

      <div className="divide-y divide-border">
        {ordered.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-text-muted">Nenhum contato cadastrado.</p>
            <button onClick={openAdd} className="mt-1 text-xs text-primary hover:underline">
              Adicionar contato →
            </button>
          </div>
        ) : (
          ordered.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              isPrimary={c.id === primaryContactId}
              isPending={isPending}
              onEdit={() => openEdit(c)}
              onDelete={() => handleDelete(c.id)}
              onSetPrimary={() => handleSetPrimary(c.id)}
            />
          ))
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={closeModals} title="Novo contato" size="sm">
        <ContactForm
          form={form}
          setForm={setForm}
          error={formError}
          onSubmit={handleAdd}
          onCancel={closeModals}
          submitLabel="Criar contato"
          isPending={isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={closeModals} title="Editar contato" size="sm">
        <ContactForm
          form={form}
          setForm={setForm}
          error={formError}
          onSubmit={handleEdit}
          onCancel={closeModals}
          submitLabel="Salvar"
          isPending={isPending}
        />
      </Modal>
    </section>
  )
}

function ContactCard({
  contact, isPrimary, isPending, onEdit, onDelete, onSetPrimary,
}: {
  contact: ContactRow
  isPrimary: boolean
  isPending: boolean
  onEdit: () => void
  onDelete: () => void
  onSetPrimary: () => void
}) {
  const waUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-primary leading-snug">
              {contact.name}
            </span>
            {isPrimary && (
              <span className="text-[9px] font-label uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 shrink-0">
                Principal
              </span>
            )}
          </div>
          {contact.role && (
            <p className="text-xs text-text-muted">{contact.role}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="text-[10px] font-label text-text-muted hover:text-primary transition-colors"
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="text-[10px] font-label text-text-muted hover:text-signal-red transition-colors"
            title="Remover"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="text-xs text-primary hover:underline truncate"
          >
            {contact.email}
          </a>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            {contact.whatsapp} ↗
          </a>
        )}
        {contact.linkedin && (
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-primary transition-colors"
          >
            LinkedIn ↗
          </a>
        )}
      </div>

      {!isPrimary && (
        <button
          onClick={onSetPrimary}
          disabled={isPending}
          className="mt-2 text-[10px] font-label text-text-muted hover:text-primary transition-colors uppercase tracking-wide"
        >
          Definir como principal
        </button>
      )}
    </div>
  )
}

function ContactForm({
  form, setForm, error, onSubmit, onCancel, submitLabel, isPending,
}: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitLabel: string
  isPending: boolean
}) {
  const f = (field: keyof Omit<typeof EMPTY_FORM, 'isPrimary'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input label="Nome *" id="cf-name" value={form.name} onChange={f('name')} required />
      <Input label="Cargo / Função" id="cf-role" value={form.role} onChange={f('role')} />
      <Input label="WhatsApp" id="cf-wa" value={form.whatsapp} onChange={f('whatsapp')} placeholder="+55 11 99999-9999" />
      <Input label="E-mail" id="cf-email" type="email" value={form.email} onChange={f('email')} />
      <Input label="LinkedIn (URL)" id="cf-li" value={form.linkedin} onChange={f('linkedin')} />

      {/* Primary contact toggle */}
      <label className="flex items-center gap-3 cursor-pointer py-1">
        <div
          onClick={() => setForm((prev) => ({ ...prev, isPrimary: !prev.isPrimary }))}
          className={[
            'relative w-9 h-5 rounded-full transition-colors shrink-0',
            form.isPrimary ? 'bg-primary' : 'bg-border',
          ].join(' ')}
        >
          <span className={[
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
            form.isPrimary ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')} />
        </div>
        <span className="text-xs text-text-secondary">
          Contato principal
        </span>
      </label>

      {error && <p className="text-xs text-signal-red">{error}</p>}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Salvando…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
