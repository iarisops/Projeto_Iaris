'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { updateFunnelFormConfig } from '@/lib/actions/funnels'
import {
  type FormFieldConfig,
  type FunnelFormConfig,
  type FormFieldType,
  FIELD_TYPE_LABELS,
  CUSTOM_FIELD_TYPES,
} from '@/lib/types/form-config'

// ─── Type options ─────────────────────────────────────────────

const TYPE_OPTIONS = CUSTOM_FIELD_TYPES.map((t) => ({
  value: t,
  label: FIELD_TYPE_LABELS[t],
}))

const ALL_TYPE_OPTIONS = Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => ({
  value: v,
  label: l,
}))

// ─── Options List Editor ──────────────────────────────────────

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (opts: string[]) => void
}) {
  const [newOpt, setNewOpt] = useState('')

  function add() {
    const trimmed = newOpt.trim()
    if (!trimmed || options.includes(trimmed)) return
    onChange([...options, trimmed])
    setNewOpt('')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <input
          value={newOpt}
          onChange={(e) => setNewOpt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Nova opção…"
          className="flex-1 bg-background border border-border px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={add}
          className="px-2 py-1 bg-surface border border-border text-xs text-text-muted hover:text-primary hover:border-primary transition-colors"
        >
          + Add
        </button>
      </div>
      {options.length === 0 && (
        <p className="text-[10px] text-text-muted italic">Nenhuma opção ainda. Adicione acima.</p>
      )}
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <span
            key={opt}
            className="flex items-center gap-1 bg-surface border border-border px-2 py-0.5 text-xs text-text-secondary"
          >
            {opt}
            <button
              onClick={() => onChange(options.filter((o) => o !== opt))}
              className="text-text-muted hover:text-signal-red transition-colors leading-none"
              title="Remover opção"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Add Field Modal ──────────────────────────────────────────

function AddFieldModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (field: FormFieldConfig) => void
}) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState<FormFieldType>('text')
  const [description, setDescription] = useState('')
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const isSelectType = type === 'select_enum' || type === 'multi_select'

  function handleAdd() {
    if (!label.trim()) { setError('Nome do campo obrigatório.'); return }
    const key = `cf_${Date.now()}`
    onAdd({
      key,
      label: label.trim(),
      type,
      required,
      enabled: true,
      archived: false,
      position: 9999,
      is_system: false,
      description: description.trim() || undefined,
      options: isSelectType ? options : undefined,
    })
    setLabel('')
    setType('text')
    setDescription('')
    setRequired(false)
    setOptions([])
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar campo personalizado" size="sm">
      <div className="flex flex-col gap-4">
        <Input
          label="Nome do campo *"
          id="af-label"
          value={label}
          onChange={(e) => { setLabel(e.target.value); setError(null) }}
          placeholder="Ex: Número de funcionários"
        />
        <Select
          label="Tipo"
          id="af-type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => { setType(e.target.value as FormFieldType); setOptions([]) }}
        />
        {isSelectType && (
          <div>
            <label className="font-label text-[10px] text-text-muted uppercase tracking-wide block mb-2">
              Opções de seleção
            </label>
            <OptionsEditor options={options} onChange={setOptions} />
          </div>
        )}
        <Input
          label="Descrição (texto de ajuda, opcional)"
          id="af-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instrução que aparece abaixo do campo"
        />
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="accent-primary"
          />
          Obrigatório
        </label>
        {error && <p className="text-xs text-signal-red">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd}>Adicionar</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Field Row ────────────────────────────────────────────────

function FieldRow({
  field,
  dragHandleProps,
  onChange,
  onArchive,
  onDelete,
}: {
  field: FormFieldConfig
  dragHandleProps?: object
  onChange: (updates: Partial<FormFieldConfig>) => void
  onArchive: () => void
  onDelete?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isName = field.key === 'name'

  return (
    <div className={[
      'border transition-colors',
      field.enabled ? 'bg-surface-2 border-border' : 'bg-background border-border/50',
    ].join(' ')}>
      {/* Primary row */}
      <div className="grid items-center gap-2 px-3 py-2"
        style={{ gridTemplateColumns: '20px 1fr 110px 64px 80px 80px auto' }}>

        {/* Drag handle */}
        <div
          {...(isName ? {} : dragHandleProps)}
          className={isName ? 'text-border text-sm select-none' : 'text-text-muted cursor-grab active:cursor-grabbing text-sm select-none'}
          title={isName ? 'Campo fixo' : 'Arrastar para reordenar'}
        >
          {isName ? '⊘' : '⠿'}
        </div>

        {/* Label */}
        <div className="min-w-0">
          <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            disabled={isName}
            className="bg-transparent text-sm text-text-primary border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors w-full"
            title="Clique para editar o nome"
          />
          <span className="font-label text-[10px] text-text-muted">{field.key}</span>
        </div>

        {/* Type */}
        {field.is_system ? (
          <span className="font-label text-[10px] text-text-muted uppercase tracking-wide truncate px-1">
            {field.key === 'stage_id' ? 'Etapas do Funil' : FIELD_TYPE_LABELS[field.type]}
          </span>
        ) : (
          <select
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FormFieldType })}
            className="bg-surface border border-border text-xs text-text-secondary px-1 py-1 focus:outline-none focus:border-primary w-full"
          >
            {ALL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        {/* Expand */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-text-muted hover:text-text-secondary text-xs text-center"
          title={expanded ? 'Recolher' : 'Editar descrição'}
        >
          {expanded ? '▲' : '▼'}
        </button>

        {/* Active toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => !isName && onChange({ enabled: !field.enabled })}
            disabled={isName}
            title={isName ? 'Sempre ativo' : 'Ativar / desativar no formulário'}
            className={[
              'w-9 h-5 rounded-full transition-colors relative',
              field.enabled ? 'bg-primary' : 'bg-surface-3',
              isName ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className={['absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', field.enabled ? 'translate-x-4' : 'translate-x-0.5'].join(' ')} />
          </button>
        </div>

        {/* Required toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => field.enabled && !isName && onChange({ required: !field.required })}
            disabled={!field.enabled || isName}
            title={isName ? 'Sempre obrigatório' : !field.enabled ? 'Ative o campo primeiro' : 'Obrigatório'}
            className={[
              'w-9 h-5 rounded-full transition-colors relative',
              field.required ? 'bg-accent' : 'bg-surface-3',
              (!field.enabled || isName) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className={['absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', field.required ? 'translate-x-4' : 'translate-x-0.5'].join(' ')} />
          </button>
        </div>

        {/* Actions */}
        {!isName && (
          <div className="flex items-center gap-2">
            <button
              onClick={onArchive}
              className="font-label text-[10px] text-text-muted hover:text-signal-amber uppercase tracking-wide transition-colors"
              title="Arquivar campo"
            >
              Arquivar
            </button>
            {!field.is_system && onDelete && (
              <button
                onClick={onDelete}
                className="font-label text-[10px] text-text-muted hover:text-signal-red uppercase tracking-wide transition-colors"
                title="Excluir campo"
              >
                Excluir
              </button>
            )}
          </div>
        )}
        {isName && <span />}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-10 pb-3 flex flex-col gap-3 border-t border-border/50">
          <div className="pt-2">
            <label className="font-label text-[10px] text-text-muted uppercase tracking-wide block mb-1">
              Texto de ajuda (aparece abaixo do campo)
            </label>
            <input
              value={field.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value || undefined })}
              placeholder="Ex: Informe o site principal da startup"
              className="w-full bg-background border border-border px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {field.type !== 'select_enum' && field.type !== 'multi_select' && field.type !== 'textarea' && (
            <div>
              <label className="font-label text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                Placeholder
              </label>
              <input
                value={field.placeholder ?? ''}
                onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
                placeholder="Texto exibido quando o campo está vazio"
                className="w-full bg-background border border-border px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {(field.type === 'select_enum' || field.type === 'multi_select') && field.key !== 'stage_id' && (
            <div>
              <label className="font-label text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                Opções de seleção
              </label>
              <OptionsEditor
                options={field.options ?? []}
                onChange={(opts) => onChange({ options: opts })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

interface Props {
  funnelId: string
  initialConfig: FunnelFormConfig
}

export function FormConfigEditor({ funnelId, initialConfig }: Props) {
  const normalized = [...initialConfig.fields].sort((a, b) => a.position - b.position)
  const [fields, setFields] = useState<FormFieldConfig[]>(normalized)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Separate locked name field from draggable ones
  const nameField = fields.find((f) => f.key === 'name')
  const activeFields = fields.filter((f) => f.key !== 'name' && !f.archived).sort((a, b) => a.position - b.position)
  const archivedFields = fields.filter((f) => f.archived)

  function updateField(key: string, updates: Partial<FormFieldConfig>) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...updates } : f)))
    setSaved(false)
  }

  function archiveField(key: string) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, archived: true, enabled: false } : f)))
    setSaved(false)
  }

  function restoreField(key: string) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, archived: false, enabled: true } : f)))
    setSaved(false)
  }

  function deleteField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key))
    setDeleteTarget(null)
    setSaved(false)
  }

  function addField(field: FormFieldConfig) {
    const maxPos = fields.reduce((m, f) => Math.max(m, f.position), 0)
    setFields((prev) => [...prev, { ...field, position: maxPos + 1 }])
    setSaved(false)
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const from = result.source.index
    const to = result.destination.index
    if (from === to) return

    const reordered = [...activeFields]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)

    // Name stays at 0; active fields start at position 1
    const updated = reordered.map((f, i) => ({ ...f, position: i + 1 }))
    setFields((prev) => {
      const map = new Map(updated.map((f) => [f.key, f]))
      return prev.map((f) => map.get(f.key) ?? f)
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const allFields = fields.map((f, _i) => f)
    const config: FunnelFormConfig = { fields: allFields }
    const res = await updateFunnelFormConfig(funnelId, config)
    setSaving(false)
    if (res.error) {
      setSaveError(res.error)
    } else {
      setSaved(true)
    }
  }

  const enabledCount = fields.filter((f) => f.enabled && !f.archived).length

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-sm font-semibold text-text-primary">
            Formulário de cadastro de startups
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {enabledCount} campo{enabledCount !== 1 ? 's' : ''} ativo{enabledCount !== 1 ? 's' : ''} · arraste ⠿ para reordenar
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : saved ? 'Salvo ✓' : 'Salvar'}
        </Button>
      </div>

      {saveError && <p className="text-xs text-signal-red">{saveError}</p>}

      {/* Column headers */}
      <div className="grid gap-2 px-3 py-1"
        style={{ gridTemplateColumns: '20px 1fr 110px 64px 80px 80px auto' }}>
        <span />
        <span className="font-label text-[10px] text-text-muted uppercase tracking-wider">Campo</span>
        <span className="font-label text-[10px] text-text-muted uppercase tracking-wider">Tipo</span>
        <span className="font-label text-[10px] text-text-muted uppercase tracking-wider">↕</span>
        <span className="font-label text-[10px] text-text-muted uppercase tracking-wider text-center">Ativo</span>
        <span className="font-label text-[10px] text-text-muted uppercase tracking-wider text-center">Obrig.</span>
        <span />
      </div>

      {/* Locked name field */}
      {nameField && (
        <FieldRow
          field={nameField}
          onChange={(u) => updateField('name', u)}
          onArchive={() => {}}
        />
      )}

      {/* Draggable fields */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-fields">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-1">
              {activeFields.map((field, index) => (
                <Draggable key={field.key} draggableId={field.key} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={snapshot.isDragging ? 'opacity-80 ring-1 ring-primary' : ''}
                    >
                      <FieldRow
                        field={field}
                        dragHandleProps={drag.dragHandleProps ?? {}}
                        onChange={(u) => updateField(field.key, u)}
                        onArchive={() => archiveField(field.key)}
                        onDelete={!field.is_system ? () => setDeleteTarget(field.key) : undefined}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add field button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-3 py-2 border border-dashed border-border text-text-muted hover:text-primary hover:border-primary transition-colors text-sm"
      >
        <span className="text-lg leading-none">+</span>
        <span>Adicionar campo personalizado</span>
      </button>

      {/* Archived section */}
      {archivedFields.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-label text-[10px] text-text-muted uppercase tracking-wider">
            Arquivados ({archivedFields.length})
          </p>
          {archivedFields.map((field) => (
            <div key={field.key}
              className="flex items-center gap-3 px-3 py-2 border border-border/40 bg-background opacity-60">
              <span className="flex-1 text-xs text-text-muted">{field.label}</span>
              <span className="font-label text-[10px] text-text-muted uppercase">{FIELD_TYPE_LABELS[field.type]}</span>
              <button
                onClick={() => restoreField(field.key)}
                className="font-label text-[10px] text-primary hover:underline uppercase tracking-wide"
              >
                Restaurar
              </button>
              {!field.is_system && (
                <button
                  onClick={() => setDeleteTarget(field.key)}
                  className="font-label text-[10px] text-text-muted hover:text-signal-red uppercase tracking-wide transition-colors"
                >
                  Excluir
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-text-muted font-label border-t border-border pt-3">
        <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />Ativo = aparece no formulário</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-accent mr-1" />Obrigatório = bloqueia envio se vazio</span>
        <span>⊘ = campo fixo (não pode ser movido)</span>
      </div>

      {/* Add field modal */}
      <AddFieldModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addField}
      />

      {/* Delete confirm modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Excluir campo?"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Esta ação é permanente e removerá o campo da configuração do formulário.
            Dados já cadastrados neste campo em startups existentes não serão apagados.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              onClick={() => deleteTarget && deleteField(deleteTarget)}
              className="bg-signal-red hover:bg-signal-red/90 border-signal-red"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
