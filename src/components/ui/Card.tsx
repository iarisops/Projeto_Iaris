import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2
}

const elevationClass = {
  0: 'bg-surface',
  1: 'bg-surface-2',
  2: 'bg-slate-blue/20',
} as const

export function Card({ elevation = 0, className = '', children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        elevationClass[elevation],
        'border border-border',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={['px-4 py-3 border-b border-border', className].join(' ')}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={['px-4 py-4', className].join(' ')}>
      {children}
    </div>
  )
}
