import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'teal' | 'amber' | 'red' | 'green' | 'orange' | 'yellow' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClass: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-text-secondary border border-border',
  teal:    'bg-primary/20 text-primary border border-primary/40',
  amber:   'bg-accent/20 text-accent border border-accent/40',
  red:     'bg-signal-red/20 text-signal-red border border-signal-red/40',
  green:   'bg-signal-green/20 text-signal-green border border-signal-green/40',
  orange:  'bg-signal-orange/20 text-signal-orange border border-signal-orange/40',
  yellow:  'bg-signal-yellow/20 text-signal-yellow border border-signal-yellow/40',
  muted:   'bg-transparent text-text-muted border border-border-subtle',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        'inline-flex items-center px-2 py-0.5',
        'font-label text-xs uppercase tracking-wide',
        variantClass[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
