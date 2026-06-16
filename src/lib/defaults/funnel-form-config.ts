import type { FunnelFormConfig, FormFieldConfig } from '@/lib/types/form-config'

export const DEFAULT_FORM_CONFIG: FunnelFormConfig = {
  fields: [
    // Locked name field
    { key: 'name',              label: 'Nome da startup',                 type: 'text',        required: true,  enabled: true, archived: false, position: 0,  is_system: true },
    // System fields
    { key: 'general_note',      label: 'Observação sobre a Oportunidade', type: 'textarea',    required: false, enabled: true, archived: false, position: 1,  is_system: true },
    { key: 'history_evolution', label: 'Histórico de Evolução',           type: 'textarea',    required: false, enabled: true, archived: false, position: 2,  is_system: true },
    { key: 'site',              label: 'Site',                            type: 'url',         required: false, enabled: true, archived: false, position: 3,  is_system: true },
    { key: 'vertical',          label: 'Vertical / Segmento',             type: 'select_enum', required: false, enabled: true, archived: false, position: 4,  is_system: true, options: [] },
    // Custom base fields
    { key: 'cf_estagio',        label: 'Estágio da Startup',              type: 'select_enum', required: false, enabled: true, archived: false, position: 5,  is_system: false, options: [] },
    { key: 'cf_link_docs',      label: 'Link para Documentos',            type: 'url',         required: false, enabled: true, archived: false, position: 6,  is_system: false },
    { key: 'cf_anexos',         label: 'Anexos',                          type: 'file_upload', required: false, enabled: true, archived: false, position: 7,  is_system: false },
    { key: 'cf_observacoes',    label: 'Observações',                     type: 'textarea',    required: false, enabled: true, archived: false, position: 8,  is_system: false },
    // Contact fields — linked to contacts table on submit
    { key: 'cf_contact_name',   label: 'Nome do Contato Principal',       type: 'text',        required: false, enabled: true, archived: false, position: 9,  is_system: false, is_contact_field: true },
    { key: 'whatsapp',          label: 'WhatsApp',                        type: 'phone',       required: false, enabled: true, archived: false, position: 10, is_system: true,  is_contact_field: true, placeholder: '+5511999999999' },
    { key: 'email',             label: 'E-mail',                          type: 'email',       required: false, enabled: true, archived: false, position: 11, is_system: true,  is_contact_field: true },
    // Funnel stage selector — options come from the funnel's stages, not from this config
    { key: 'stage_id',          label: 'Fase',                            type: 'select_enum', required: false, enabled: true, archived: false, position: 12, is_system: true },
  ],
}

export function resolveFormConfig(raw: unknown): FunnelFormConfig {
  if (
    raw &&
    typeof raw === 'object' &&
    'fields' in raw &&
    Array.isArray((raw as { fields: unknown }).fields) &&
    (raw as { fields: unknown[] }).fields.length > 0
  ) {
    // Backfill missing fields added after the config was first saved
    const saved = raw as FunnelFormConfig
    const savedKeys = new Set(saved.fields.map((f) => f.key))
    const maxPos = saved.fields.reduce((m, f) => Math.max(m, f.position), 0)
    const missing: FormFieldConfig[] = DEFAULT_FORM_CONFIG.fields
      .filter((f) => !savedKeys.has(f.key))
      .map((f, i) => ({ ...f, enabled: false, archived: false, position: maxPos + i + 1 }))
    return { fields: [...saved.fields, ...missing] }
  }
  return DEFAULT_FORM_CONFIG
}
