'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { updateCandidate } from '@/lib/actions/candidates'
import { uploadCRMAttachment } from '@/lib/actions/storage'
import type { FormFieldConfig } from '@/lib/types/form-config'

const SYSTEM_FIELD_KEYS = new Set([
  'name', 'site', 'vertical', 'phase', 'score', 'mrr', 'customers',
  'team', 'equity', 'captable', 'what_seeks', 'general_note', 'reminder_note',
  'history_evolution', 'pitch_deck_url', 'next_action',
])

type SystemData = {
  name: string | null
  site: string | null
  vertical: string | null
  phase: string | null
  score: number | null
  mrr: number | null
  customers: string | null
  team: string | null
  equity: string | null
  captable: string | null
  what_seeks: string | null
  general_note: string | null
  reminder_note: string | null
  history_evolution: string | null
  pitch_deck_url: string | null
  next_action: string | null
}

interface Props {
  candidateId: string
  funnelId: string
  fields: FormFieldConfig[]
  systemData: SystemData
  extraFields: Record<string, string>
}

function getInitialValue(key: string, sys: SystemData, extra: Record<string, string>): string {
  if (SYSTEM_FIELD_KEYS.has(key)) {
    const val = (sys as Record<string, unknown>)[key]
    if (val == null) return ''
    return String(val)
  }
  return extra[key] ?? ''
}

export function CandidateInfoEditor({ candidateId, funnelId, fields, systemData, extraFields }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<Record<string, FileList | null>>({})
  const [error, setError] = useState<string | null>(null)

  function handleOpen() {
    const init: Record<string, string> = {}
    for (const f of fields) {
      init[f.key] = getInitialValue(f.key, systemData, extraFields)
    }
    setValues(init)
    setPendingFiles({})
    setError(null)
    setEditOpen(true)
  }

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function setFiles(key: string, files: FileList | null) {
    setPendingFiles((prev) => ({ ...prev, [key]: files }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!values['name']?.trim()) { setError('Nome é obrigatório.'); return }
    setError(null)
    startTransition(async () => {
      // Upload pending files first, then save
      const finalValues = { ...values }

      for (const field of fields) {
        if (field.type !== 'file_upload') continue
        const fileList = pendingFiles[field.key]
        if (!fileList || fileList.length === 0) continue

        const newUrls: string[] = []
        for (let i = 0; i < fileList.length; i++) {
          const fd = new FormData()
          fd.append('file', fileList[i])
          const { url, error: upErr } = await uploadCRMAttachment(fd, funnelId)
          if (upErr) { setError(`Erro no upload: ${upErr}`); return }
          if (url) newUrls.push(url)
        }

        const existing = finalValues[field.key] ? finalValues[field.key].split(',').filter(Boolean) : []
        finalValues[field.key] = [...existing, ...newUrls].join(',')
      }

      const systemUpdate: Record<string, unknown> = {}
      const updatedExtra: Record<string, string> = { ...extraFields }

      for (const f of fields) {
        const val = finalValues[f.key] ?? ''
        if (SYSTEM_FIELD_KEYS.has(f.key)) {
          if (f.key === 'score' || f.key === 'mrr') {
            systemUpdate[f.key] = val ? Number(val) : undefined
          } else {
            systemUpdate[f.key] = val || undefined
          }
        } else {
          if (val) {
            updatedExtra[f.key] = val
          } else {
            delete updatedExtra[f.key]
          }
        }
      }

      const res = await updateCandidate(candidateId, {
        ...(systemUpdate as Parameters<typeof updateCandidate>[1]),
        extra_fields: Object.keys(updatedExtra).length > 0 ? updatedExtra : undefined,
      })
      if (res?.error) { setError(res.error); return }
      setEditOpen(false)
      router.refresh()
    })
  }

  return (
    <section className="bg-surface border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-headline text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Informações da Startup
        </h2>
        <button
          onClick={handleOpen}
          className="text-[11px] font-label text-text-muted hover:text-primary transition-colors uppercase tracking-wide"
        >
          ✎ Editar
        </button>
      </div>

      <div className="px-4 py-4">
        <InfoDisplay fields={fields} systemData={systemData} extraFields={extraFields} />
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Informações da Startup" size="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={values[field.key] ?? ''}
              onChange={(val) => set(field.key, val)}
              onFileChange={(files) => setFiles(field.key, files)}
              pendingFileCount={(pendingFiles[field.key]?.length) ?? 0}
            />
          ))}
          {error && <p className="text-xs text-signal-red">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

// ── FieldInput ───────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  onFileChange,
  pendingFileCount,
}: {
  field: FormFieldConfig
  value: string
  onChange: (val: string) => void
  onFileChange: (files: FileList | null) => void
  pendingFileCount: number
}) {
  const id = `si-${field.key}`
  const label = field.required ? `${field.label} *` : field.label

  if (field.type === 'textarea') {
    return (
      <Textarea
        label={label}
        id={id}
        rows={3}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'select_enum') {
    const opts = [
      { value: '', label: `— ${field.label} —` },
      ...(field.options ?? []).map((o) => ({ value: o, label: o })),
    ]
    return (
      <Select
        label={label}
        id={id}
        options={opts}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (field.type === 'multi_select') {
    const opts = field.options ?? []
    const selected = value ? value.split(',').filter(Boolean) : []
    return (
      <div className="flex flex-col gap-1.5">
        <label className="font-label text-xs text-text-muted uppercase tracking-wide">{label}</label>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked ? [...selected, opt] : selected.filter((s) => s !== opt)
                  onChange(next.join(','))
                }}
                className="accent-primary"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    )
  }

  // URL field — supports multiple links stored as newline-separated
  if (field.type === 'url') {
    return <MultiLinkInput label={label} value={value} onChange={onChange} />
  }

  // File upload — show existing + allow adding new
  if (field.type === 'file_upload') {
    return (
      <AttachmentsInput
        label={label}
        id={id}
        value={value}
        onFileChange={onFileChange}
        pendingFileCount={pendingFileCount}
      />
    )
  }

  const inputType =
    field.type === 'email'                                   ? 'email'
    : field.type === 'number' || field.type === 'currency'   ? 'number'
    : field.type === 'phone'                                  ? 'tel'
    : 'text'

  return (
    <Input
      label={label}
      id={id}
      type={inputType}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      step={field.type === 'number' ? '0.1' : field.type === 'currency' ? '0.01' : undefined}
      min={field.type === 'number' || field.type === 'currency' ? '0' : undefined}
      max={field.key === 'score' ? '10' : undefined}
    />
  )
}

// ── MultiLinkInput ───────────────────────────────────────────────

function MultiLinkInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) {
  const [draft, setDraft] = useState('')
  const links = value ? value.split('\n').filter(Boolean) : []

  function addLink() {
    const trimmed = draft.trim()
    if (!trimmed) return
    const next = [...links, trimmed]
    onChange(next.join('\n'))
    setDraft('')
  }

  function removeLink(idx: number) {
    const next = links.filter((_, i) => i !== idx)
    onChange(next.join('\n'))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-label text-xs text-text-muted uppercase tracking-wide">{label}</label>

      {links.length > 0 && (
        <div className="flex flex-col gap-1">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-surface-2 border border-border px-2 py-1.5">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate flex-1"
              >
                {link}
              </a>
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="text-[10px] text-text-muted hover:text-signal-red transition-colors shrink-0"
                title="Remover link"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
          placeholder="https://..."
          className="flex-1 bg-surface border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={!draft.trim()}
          className="text-[11px] font-label font-semibold text-primary hover:text-primary/80 uppercase tracking-wide disabled:opacity-40 transition-colors shrink-0 px-2"
        >
          + Adicionar
        </button>
      </div>
    </div>
  )
}

// ── AttachmentsInput ─────────────────────────────────────────────

function AttachmentsInput({
  label,
  id,
  value,
  onFileChange,
  pendingFileCount,
}: {
  label: string
  id: string
  value: string
  onFileChange: (files: FileList | null) => void
  pendingFileCount: number
}) {
  const urls = value ? value.split(',').filter(Boolean) : []

  function fileName(url: string) {
    try {
      const parts = new URL(url).pathname.split('/')
      return decodeURIComponent(parts[parts.length - 1] || url)
    } catch {
      return url
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-label text-xs text-text-muted uppercase tracking-wide">{label}</label>

      {urls.length > 0 && (
        <div className="flex flex-col gap-1">
          {urls.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline truncate bg-surface-2 border border-border px-2 py-1.5 block"
            >
              {fileName(url)}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <input
          id={id}
          type="file"
          multiple
          onChange={(e) => onFileChange(e.target.files)}
          className="block w-full text-sm text-text-secondary
            file:mr-3 file:px-3 file:py-1.5 file:border file:border-border
            file:bg-surface file:text-xs file:text-text-muted file:cursor-pointer
            hover:file:bg-surface-2 file:transition-colors cursor-pointer"
        />
        {pendingFileCount > 0 && (
          <p className="text-xs text-primary">
            {pendingFileCount} arquivo{pendingFileCount !== 1 ? 's' : ''} selecionado{pendingFileCount !== 1 ? 's' : ''} para envio
          </p>
        )}
      </div>
    </div>
  )
}

// ── InfoDisplay ──────────────────────────────────────────────────

function InfoDisplay({
  fields,
  systemData,
  extraFields,
}: {
  fields: FormFieldConfig[]
  systemData: SystemData
  extraFields: Record<string, string>
}) {
  const rows: { label: string; value: string; type: FormFieldConfig['type'] }[] = []

  for (const f of fields) {
    if (f.key === 'name') continue

    const raw = SYSTEM_FIELD_KEYS.has(f.key)
      ? (systemData as Record<string, unknown>)[f.key]
      : extraFields[f.key]

    if (raw == null || raw === '' || raw === undefined) continue

    let display = String(raw)
    if (f.type === 'currency' || f.key === 'mrr') {
      display = `R$ ${Number(raw).toLocaleString('pt-BR')}`
    } else if (f.key === 'score') {
      display = Number(raw).toFixed(1)
    }

    rows.push({ label: f.label, value: display, type: f.type })
  }

  if (rows.length === 0) {
    return <p className="text-xs text-text-muted">Nenhuma informação cadastrada.</p>
  }

  return (
    <div className="flex flex-col gap-3 text-xs">
      {rows.map(({ label, value, type }) => (
        <div key={label}>
          <p className="text-[10px] font-label text-text-muted uppercase tracking-wide mb-0.5">{label}</p>
          {type === 'url' ? (
            // Multi-link: newline-separated
            <div className="flex flex-col gap-0.5">
              {value.split('\n').filter(Boolean).map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                  {link}
                </a>
              ))}
            </div>
          ) : type === 'file_upload' ? (
            // Attachments: comma-separated
            <div className="flex flex-col gap-0.5">
              {value.split(',').filter(Boolean).map((url, i) => {
                let name = url
                try {
                  const parts = new URL(url).pathname.split('/')
                  name = decodeURIComponent(parts[parts.length - 1] || url)
                } catch { /* noop */ }
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                    {name}
                  </a>
                )
              })}
            </div>
          ) : (
            <p className="text-text-secondary whitespace-pre-wrap">{value}</p>
          )}
        </div>
      ))}
    </div>
  )
}
