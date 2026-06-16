'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { updatePortfolioProfile } from '@/lib/actions/portfolio'
import type { Database } from '@/types/supabase'

type Startup = Database['public']['Tables']['portfolio_startups']['Row']

interface Founder {
  name: string
  role?: string
  email?: string
  whatsapp?: string
  linkedin?: string
  dedication?: string
}

function SectionHeader({
  id,
  title,
  editing,
  onToggle,
}: {
  id: string
  title: string
  editing: string | null
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-headline text-sm font-semibold text-text-secondary uppercase tracking-wider">
        {title}
      </h2>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="text-xs text-primary hover:underline"
      >
        {editing === id ? 'Cancelar' : 'Editar'}
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-text-muted uppercase font-label tracking-wide">{label}</p>
      <p className="text-sm text-text-primary whitespace-pre-wrap">{value}</p>
    </div>
  )
}

const STAGE_OPTIONS = [
  { value: '', label: '— sem fase —' },
  { value: 'Ideação', label: 'Ideação' },
  { value: 'Validação', label: 'Validação' },
  { value: 'Operação', label: 'Operação' },
  { value: 'Tração', label: 'Tração' },
  { value: 'Escala', label: 'Escala' },
]

interface ProfileEditorProps {
  startup: Startup
}

export function ProfileEditor({ startup }: ProfileEditorProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Local state mirrors startup fields
  const [fields, setFields] = useState({
    name: startup.name ?? '',
    site: startup.site ?? '',
    linkedin: startup.linkedin ?? '',
    short_description: startup.short_description ?? '',
    segment: startup.segment ?? '',
    vertical: startup.vertical ?? '',
    problem: startup.problem ?? '',
    solution: startup.solution ?? '',
    icp: startup.icp ?? '',
    business_model: startup.business_model ?? '',
    revenue_model: startup.revenue_model ?? '',
    stage: startup.stage ?? '',
    funding_round: startup.funding_round ?? '',
    funding_target: startup.funding_target?.toString() ?? '',
    valuation_instrument: startup.valuation_instrument ?? '',
    captable_summary: startup.captable_summary ?? '',
    iaris_stake: startup.iaris_stake?.toString() ?? '',
    funding_use: startup.funding_use ?? '',
  })

  const [founders, setFounders] = useState<Founder[]>(
    Array.isArray(startup.founders) ? (startup.founders as unknown as Founder[]) : []
  )

  function setField(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function save(section: string, payload: Record<string, unknown>) {
    setSaving(true)
    setError(null)
    const res = await updatePortfolioProfile(startup.id, payload as Parameters<typeof updatePortfolioProfile>[1])
    setSaving(false)
    if (res.error) {
      setError(res.error)
    } else {
      setEditing(null)
    }
  }

  function toggleEditing(id: string) {
    setEditing(editing === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="text-xs text-signal-red bg-signal-red/5 border border-signal-red/20 px-3 py-2">
          {error}
        </p>
      )}

      {/* Identificação básica */}
      <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
        <SectionHeader id="basic" title="Identificação básica" editing={editing} onToggle={toggleEditing} />
        {editing === 'basic' ? (
          <div className="flex flex-col gap-3">
            <Input label="Nome" id="name" value={fields.name} onChange={(e) => setField('name', e.target.value)} />
            <Input label="Site" id="site" value={fields.site} onChange={(e) => setField('site', e.target.value)} />
            <Input label="LinkedIn" id="linkedin" value={fields.linkedin} onChange={(e) => setField('linkedin', e.target.value)} />
            <Input label="Vertical" id="vertical" value={fields.vertical} onChange={(e) => setField('vertical', e.target.value)} />
            <Input label="Segmento" id="segment" value={fields.segment} onChange={(e) => setField('segment', e.target.value)} />
            <Select label="Fase" id="stage" options={STAGE_OPTIONS} value={fields.stage}
              onChange={(e) => setField('stage', e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => save('basic', {
                name: fields.name || undefined,
                site: fields.site || undefined,
                linkedin: fields.linkedin || undefined,
                vertical: fields.vertical || undefined,
                segment: fields.segment || undefined,
                stage: (fields.stage as Parameters<typeof updatePortfolioProfile>[1]['stage']) || undefined,
              })} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Site" value={fields.site} />
            <Field label="LinkedIn" value={fields.linkedin} />
            <Field label="Vertical" value={fields.vertical} />
            <Field label="Segmento" value={fields.segment} />
            <Field label="Fase" value={fields.stage} />
          </div>
        )}
      </section>

      {/* Descrição do negócio */}
      <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
        <SectionHeader id="business" title="Descrição do negócio" editing={editing} onToggle={toggleEditing} />
        {editing === 'business' ? (
          <div className="flex flex-col gap-3">
            <Textarea label="Descrição curta" id="short_desc" rows={2}
              value={fields.short_description} onChange={(e) => setField('short_description', e.target.value)} />
            <Textarea label="Problema" id="problem" rows={2}
              value={fields.problem} onChange={(e) => setField('problem', e.target.value)} />
            <Textarea label="Solução" id="solution" rows={2}
              value={fields.solution} onChange={(e) => setField('solution', e.target.value)} />
            <Textarea label="ICP" id="icp" rows={2}
              value={fields.icp} onChange={(e) => setField('icp', e.target.value)} />
            <Textarea label="Modelo de negócio" id="biz_model" rows={2}
              value={fields.business_model} onChange={(e) => setField('business_model', e.target.value)} />
            <Textarea label="Modelo de receita" id="rev_model" rows={2}
              value={fields.revenue_model} onChange={(e) => setField('revenue_model', e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => save('business', {
                short_description: fields.short_description || undefined,
                problem: fields.problem || undefined,
                solution: fields.solution || undefined,
                icp: fields.icp || undefined,
                business_model: fields.business_model || undefined,
                revenue_model: fields.revenue_model || undefined,
              })} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label="Descrição" value={fields.short_description} />
            <Field label="Problema" value={fields.problem} />
            <Field label="Solução" value={fields.solution} />
            <Field label="ICP" value={fields.icp} />
            <Field label="Modelo de negócio" value={fields.business_model} />
            <Field label="Modelo de receita" value={fields.revenue_model} />
            {!fields.short_description && !fields.problem && !fields.solution && (
              <p className="text-sm text-text-muted">Nenhuma descrição cadastrada.</p>
            )}
          </div>
        )}
      </section>

      {/* Investimento */}
      <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
        <SectionHeader id="investment" title="Investimento & Cap Table" editing={editing} onToggle={toggleEditing} />
        {editing === 'investment' ? (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Rodada" id="funding_round" value={fields.funding_round}
              onChange={(e) => setField('funding_round', e.target.value)} />
            <Input label="Alvo (R$)" id="funding_target" type="number" value={fields.funding_target}
              onChange={(e) => setField('funding_target', e.target.value)} />
            <Input label="Instrumento" id="val_instrument" value={fields.valuation_instrument}
              onChange={(e) => setField('valuation_instrument', e.target.value)} />
            <Input label="Stake IARIS (%)" id="iaris_stake" type="number" value={fields.iaris_stake}
              onChange={(e) => setField('iaris_stake', e.target.value)} />
            <div className="col-span-2">
              <Textarea label="Captable (resumo)" id="captable" rows={2}
                value={fields.captable_summary} onChange={(e) => setField('captable_summary', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Textarea label="Uso do capital" id="funding_use" rows={2}
                value={fields.funding_use} onChange={(e) => setField('funding_use', e.target.value)} />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button size="sm" onClick={() => save('investment', {
                funding_round: fields.funding_round || undefined,
                funding_target: fields.funding_target ? Number(fields.funding_target) : undefined,
                valuation_instrument: fields.valuation_instrument || undefined,
                iaris_stake: fields.iaris_stake ? Number(fields.iaris_stake) : undefined,
                captable_summary: fields.captable_summary || undefined,
                funding_use: fields.funding_use || undefined,
              })} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rodada" value={fields.funding_round} />
            {fields.funding_target && (
              <div>
                <p className="text-xs text-text-muted uppercase font-label tracking-wide">Alvo</p>
                <p className="text-sm text-text-primary">
                  R$ {Number(fields.funding_target).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            <Field label="Instrumento" value={fields.valuation_instrument} />
            {fields.iaris_stake && (
              <div>
                <p className="text-xs text-text-muted uppercase font-label tracking-wide">Stake IARIS</p>
                <p className="text-sm text-text-primary">{fields.iaris_stake}%</p>
              </div>
            )}
            <Field label="Captable" value={fields.captable_summary} />
            <Field label="Uso do capital" value={fields.funding_use} />
            {!fields.funding_round && !fields.captable_summary && (
              <p className="text-sm text-text-muted col-span-2">Nenhum dado de investimento.</p>
            )}
          </div>
        )}
      </section>

      {/* Founders */}
      <section className="bg-surface-2 border border-border p-4 flex flex-col gap-3">
        <SectionHeader id="founders" title="Founders & Contatos" editing={editing} onToggle={toggleEditing} />
        {editing === 'founders' ? (
          <div className="flex flex-col gap-4">
            {founders.map((f, i) => (
              <div key={i} className="border border-border p-3 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Nome" id={`f-name-${i}`} value={f.name}
                    onChange={(e) => setFounders((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  <Input label="Cargo" id={`f-role-${i}`} value={f.role ?? ''}
                    onChange={(e) => setFounders((prev) => prev.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} />
                  <Input label="E-mail" id={`f-email-${i}`} value={f.email ?? ''}
                    onChange={(e) => setFounders((prev) => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                  <Input label="WhatsApp" id={`f-wa-${i}`} value={f.whatsapp ?? ''}
                    onChange={(e) => setFounders((prev) => prev.map((x, j) => j === i ? { ...x, whatsapp: e.target.value } : x))} />
                </div>
                <button
                  type="button"
                  onClick={() => setFounders((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs text-signal-red hover:underline self-end"
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFounders((prev) => [...prev, { name: '' }])}
              className="text-xs text-primary hover:underline self-start"
            >
              + Adicionar founder
            </button>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => save('founders', { founders })} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar founders'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {founders.length === 0 && (
              <p className="text-sm text-text-muted">Nenhum founder cadastrado.</p>
            )}
            {founders.map((f, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-text-primary">{f.name}</p>
                {f.role && <p className="text-xs text-text-muted">{f.role}</p>}
                <div className="flex gap-3 text-xs mt-0.5">
                  {f.email && (
                    <a href={`mailto:${f.email}`} className="text-primary hover:underline">{f.email}</a>
                  )}
                  {f.whatsapp && <span className="text-text-muted">{f.whatsapp}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
