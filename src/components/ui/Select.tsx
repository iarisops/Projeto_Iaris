import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, id, placeholder, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-label text-xs text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={[
          'bg-surface-2 border text-text-primary px-3 py-2 text-sm',
          'focus:outline-none focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-signal-red' : 'border-border',
          className,
        ].join(' ')}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-signal-red">{error}</p>}
    </div>
  )
}
