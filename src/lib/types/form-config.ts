export type FormFieldType =
  | 'text'
  | 'url'
  | 'phone'
  | 'email'
  | 'number'
  | 'currency'
  | 'textarea'
  | 'select_enum'
  | 'multi_select'
  | 'file_upload'

export const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text:         'Texto',
  url:          'URL',
  phone:        'Telefone',
  email:        'E-mail',
  number:       'Número',
  currency:     'Moeda (R$)',
  textarea:     'Texto longo',
  select_enum:  'Seleção única',
  multi_select: 'Seleção múltipla',
  file_upload:  'Arquivo',
}

export const CUSTOM_FIELD_TYPES: FormFieldType[] = [
  'text', 'textarea', 'number', 'currency', 'url', 'email', 'phone',
  'select_enum', 'multi_select', 'file_upload',
]

export interface FormFieldConfig {
  key: string
  label: string
  type: FormFieldType
  required: boolean
  enabled: boolean
  archived: boolean
  position: number
  is_system: boolean
  is_contact_field?: boolean
  description?: string
  placeholder?: string
  options?: string[]
}

export interface FunnelFormConfig {
  fields: FormFieldConfig[]
}
