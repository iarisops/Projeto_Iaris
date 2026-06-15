'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createCandidate } from '@/lib/actions/candidates'
import { uploadCRMAttachment } from '@/lib/actions/storage'
import { DEFAULT_FORM_CONFIG, resolveFormConfig } from '@/lib/defaults/funnel-form-config'
import type { CandidateRow } from '@/components/crm/CandidateCard'
import type { Database } from '@/types/supabase'
import type { FunnelFormConfig, FormFieldConfig } from '@/lib/types/form-config'

type Stage = Database['public']['Tables']['funnel_stages']['Row']

interface NewCandidateModalProps {
  open: boolean
  onClose: () => void
  funnelId: string
  stages: Stage[]
  onCreated: (candidate: CandidateRow) => void
  formConfig?: FunnelFormConfig | null
}

// Keys that map directly to startup_candidates columns (not stored in extra_fields)
const SYSTEM_FIELD_KEYS = new Set([
  'name', 'stage_id', 'site', 'whatsapp', 'email', 'vertical', 'phase',
  'score', 'mrr', 'customers', 'team', 'equity', 'captable',
  'what_seeks', 'general_note', 'reminder_note', 'history_evolution',
  'pitch_deck_url', 'next_action',
])

type FieldValues = Record<string, string>

function FieldInput({
  field,
  value,
  onChange,
  stageOptions,
  onFileChange,
}: {
  field: FormFieldConfig
  value: string
  onChange: (val: string) => void
  stageOptions: { value: string; label: string }[]
  onFileChange: (key: string, files: FileList | null) => void
}) {
  const id = `nc-${field.key}`
  const labelText = field.required ? `${field.label} *` : field.label

  // Funnel stage selector — uses live stages, not field.options
  if (field.key === 'stage_id') {
    const opts = [
      { value: '', label: '— Selecione a fase —' },
      ...stageOptions,
    ]
    return (
      <Select
        label={labelText}
        id={id}
        options={opts}
        value={value}
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
        label={labelText}
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
        <label className="font-label text-xs text-text-muted uppercase tracking-wide">
          {labelText}
        </label>
        {opts.length === 0 ? (
          <p className="text-xs text-text-muted italic">
            Nenhuma opção configurada. Configure nas configurações do funil.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {opts.map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, opt]
                      : selected.filter((s) => s !== opt)
                    onChange(next.join(','))
                  }}
                  className="accent-primary"
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (field.type === 'file_upload') {
    const fileCount = value ? value.split(',').filter(Boolean).length : 0
    return (
      <div className="flex flex-col gap-1.5">
        <label className="font-label text-xs text-text-muted uppercase tracking-wide">
          {labelText}
        </label>
        <input
          id={id}
          type="file"
          multiple
          onChange={(e) => onFileChange(field.key, e.target.files)}
          className="block w-full text-sm text-text-secondary
            file:mr-3 file:px-3 file:py-1.5 file:border file:border-border
            file:bg-surface file:text-xs file:text-text-muted file:cursor-pointer
            hover:file:bg-surface-2 file:transition-colors cursor-pointer"
        />
        {fileCount > 0 && (
          <p className="text-xs text-primary">
            {fileCount} arquivo{fileCount !== 1 ? 's' : ''} enviado{fileCount !== 1 ? 's' : ''}
          </p>
        )}
        {field.description && (
          <p className="text-xs text-text-muted">{field.description}</p>
        )}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="font-label text-xs text-text-muted uppercase tracking-wide">
          {labelText}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className="bg-surface border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>
    )
  }

  const inputType =
    field.type === 'email'    ? 'email'
    : field.type === 'url'    ? 'url'
    : field.type === 'number' || field.type === 'currency' ? 'number'
    : field.type === 'phone'  ? 'tel'
    : 'text'

  return (
    <Input
      label={labelText}
      id={id}
      type={inputType}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      step={field.type === 'number' ? '0.1' : field.type === 'currency' ? '0.01' : undefined}
      min={field.type === 'number' ? '0' : undefined}
      max={field.key === 'score' ? '10' : undefined}
    />
  )
}

export function NewCandidateModal({
  open,
  onClose,
  funnelId,
  stages,
  onCreated,
  formConfig,
}: NewCandidateModalProps) {
  const config = resolveFormConfig(formConfig ?? DEFAULT_FORM_CONFIG)
  const activeFields = config.fields
    .filter((f) => f.enabled && !f.archived)
    .sort((a, b) => a.position - b.position)

  const contactFields = activeFields.filter((f) => f.is_contact_field)
  const regularFields = activeFields.filter((f) => !f.is_contact_field)

  const defaultStageId = stages.find((s) => s.is_default)?.id ?? stages[0]?.id ?? ''
  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name }))

  const [formKey, setFormKey] = useState(0)
  const [values, setValues] = useState<FieldValues>(() => {
    const init: FieldValues = {}
    activeFields.forEach((f) => {
      init[f.key] = f.key === 'stage_id' ? defaultStageId : ''
    })
    if (init['stage_id'] === undefined) init['stage_id'] = defaultStageId
    return init
  })
  const [pendingFiles, setPendingFiles] = useState<Record<string, FileList | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    setError(null)
  }

  function setFiles(key: string, files: FileList | null) {
    setPendingFiles((v) => ({ ...v, [key]: files }))
    setError(null)
  }

  function validate(): string | null {
    for (const f of activeFields) {
      if (f.required && f.type !== 'file_upload' && !values[f.key]?.trim()) {
        return `"${f.label}" é obrigatório.`
      }
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validErr = validate()
    if (validErr) { setError(validErr); return }
    setLoading(true)

    // Upload files first, collect URLs into extraFields
    const extraFields: Record<string, string> = {}

    for (const field of activeFields) {
      if (field.type === 'file_upload') {
        const fileList = pendingFiles[field.key]
        if (fileList && fileList.length > 0) {
          const urls: string[] = []
          for (let i = 0; i < fileList.length; i++) {
            const fd = new FormData()
            fd.append('file', fileList[i])
            const { url, error: upErr } = await uploadCRMAttachment(fd, funnelId)
            if (upErr) { setError(`Erro no upload: ${upErr}`); setLoading(false); return }
            if (url) urls.push(url)
          }
          if (urls.length > 0) extraFields[field.key] = urls.join(',')
        }
        continue
      }
      // Collect non-system, non-contact-name custom fields
      if (!SYSTEM_FIELD_KEYS.has(field.key) && field.key !== 'cf_contact_name' && values[field.key]) {
        extraFields[field.key] = values[field.key]
      }
    }

    const scoreRaw = values['score']
    const mrrRaw   = values['mrr']

    const res = await createCandidate({
      funnel_id:         funnelId,
      stage_id:          values['stage_id'] || undefined,
      name:              values['name']?.trim() ?? '',
      site:              values['site'] || undefined,
      whatsapp:          values['whatsapp'] || undefined,
      email:             values['email'] || undefined,
      vertical:          values['vertical'] || undefined,
      score:             scoreRaw ? parseFloat(scoreRaw) : undefined,
      mrr:               mrrRaw ? parseFloat(mrrRaw) : undefined,
      customers:         values['customers'] || undefined,
      team:              values['team'] || undefined,
      equity:            values['equity'] || undefined,
      captable:          values['captable'] || undefined,
      what_seeks:        values['what_seeks'] || undefined,
      general_note:      values['general_note'] || undefined,
      pitch_deck_url:    values['pitch_deck_url'] || undefined,
      next_action:       values['next_action'] || undefined,
      reminder_note:     values['reminder_note'] || undefined,
      history_evolution: values['history_evolution'] || undefined,
      contact_name:      values['cf_contact_name'] || undefined,
      extra_fields:      Object.keys(extraFields).length > 0 ? extraFields : undefined,
    })

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else if (res.id) {
      const newCandidate: CandidateRow = {
        id:                              res.id,
        funnel_id:                       funnelId,
        name:                            values['name']?.trim() ?? '',
        site:                            values['site'] || null,
        whatsapp:                        values['whatsapp'] || null,
        email:                           values['email'] || null,
        vertical:                        values['vertical'] || null,
        phase:                           null,
        stage_id:                        values['stage_id'] || null,
        result:                          'Em aberto',
        internal_owner_id:               null,
        equity:                          values['equity'] || null,
        score:                           scoreRaw ? parseFloat(scoreRaw) : null,
        captable:                        values['captable'] || null,
        mrr:                             mrrRaw ? parseFloat(mrrRaw) : null,
        customers:                       values['customers'] || null,
        team:                            values['team'] || null,
        what_seeks:                      values['what_seeks'] || null,
        general_note:                    values['general_note'] || null,
        reminder_note:                   values['reminder_note'] || null,
        history_evolution:               values['history_evolution'] || null,
        pitch_deck_url:                  values['pitch_deck_url'] || null,
        next_action:                     values['next_action'] || null,
        extra_fields:                    Object.keys(extraFields).length > 0 ? extraFields : null,
        primary_contact_id:              null,
        last_update_at:                  new Date().toISOString(),
        converted_portfolio_startup_id:  null,
        import_note:                     null,
        created_at:                      new Date().toISOString(),
        updated_at:                      new Date().toISOString(),
        created_by:                      null,
        updated_by:                      null,
        owner_name:                      null,
      }
      // Reset form
      const reset: FieldValues = {}
      activeFields.forEach((f) => {
        reset[f.key] = f.key === 'stage_id' ? defaultStageId : ''
      })
      if (reset['stage_id'] === undefined) reset['stage_id'] = defaultStageId
      setValues(reset)
      setPendingFiles({})
      setFormKey((k) => k + 1)
      onCreated(newCandidate)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova startup candidata" size="md">
      <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Regular fields (includes stage_id as "Fase") */}
        {regularFields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            value={values[field.key] ?? ''}
            onChange={(val) => set(field.key, val)}
            stageOptions={stageOptions}
            onFileChange={setFiles}
          />
        ))}

        {/* Contact section */}
        {contactFields.length > 0 && (
          <div className="flex flex-col gap-3 border border-border/60 p-3 bg-surface-2">
            <p className="font-label text-[10px] text-text-muted uppercase tracking-wider">
              Contato Principal
            </p>
            {contactFields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                onChange={(val) => set(field.key, val)}
                stageOptions={stageOptions}
                onFileChange={setFiles}
              />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-signal-red">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Criar candidata'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
