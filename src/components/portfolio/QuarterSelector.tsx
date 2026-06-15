'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { quarterLabel } from '@/lib/utils/quarter'

interface QuarterSelectorProps {
  current: string
  quarters: string[]
}

export function QuarterSelector({ current, quarters }: QuarterSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate(q: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('quarter', q)
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentIdx = quarters.indexOf(current)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => currentIdx < quarters.length - 1 && navigate(quarters[currentIdx + 1])}
        disabled={currentIdx >= quarters.length - 1}
        className="px-2 py-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors text-sm"
        aria-label="Quarter anterior"
      >
        ‹
      </button>

      <select
        value={current}
        onChange={(e) => navigate(e.target.value)}
        className="bg-surface-2 border border-border text-text-primary text-sm px-3 py-1.5 focus:outline-none focus:border-primary font-label"
      >
        {quarters.map((q) => (
          <option key={q} value={q}>{quarterLabel(q)}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => currentIdx > 0 && navigate(quarters[currentIdx - 1])}
        disabled={currentIdx <= 0}
        className="px-2 py-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors text-sm"
        aria-label="Próximo quarter"
      >
        ›
      </button>
    </div>
  )
}
