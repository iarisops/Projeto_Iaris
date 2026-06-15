import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-label text-xs text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={[
          'bg-surface-2 border text-text-primary px-3 py-2 text-sm',
          'focus:outline-none focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-signal-red' : 'border-border',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-signal-red">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-label text-xs text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={id}
        {...props}
        className={[
          'bg-surface-2 border text-text-primary px-3 py-2 text-sm resize-y',
          'focus:outline-none focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-signal-red' : 'border-border',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-signal-red">{error}</p>}
    </div>
  )
}
