'use client'

import { useState, useMemo } from 'react'

export interface TableActivity {
  id: string
  source: 'crm' | 'portfolio'
  type: string
  title: string | null
  date: string
  status: string
  responsible_id: string | null
  responsible_name: string | null
  context_name: string | null
  href: string
}

interface Props {
  activities: TableActivity[]
  users: { id: string; name: string }[]
  defaultResponsavel?: string
  defaultStatus?: string
}

const PAGE_SIZE = 25

// ── Status badge ──────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Pendente:   'bg-[#fffbeb] text-[#b45309] border-[#fbb33d]/40',
  Concluída:  'bg-[#f0fdf4] text-[#15803d] border-[#86efac]/40',
  Cancelada:  'bg-[#fff1f2] text-[#be123c] border-[#fda4af]/40',
  Agendada:   'bg-[#eef8f8] text-[#007a7a] border-[#009999]/30',
  Reagendada: 'bg-surface-2 text-text-muted border-border',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-surface-2 text-text-muted border-border'
  return (
    <span className={`inline-flex items-center text-[10px] font-label font-semibold uppercase tracking-wide border px-2 py-0.5 ${cls}`}>
      {status}
    </span>
  )
}

// ── Type badge ────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-label uppercase tracking-wide bg-surface-2 border border-border text-text-muted px-2 py-0.5">
      {type}
    </span>
  )
}

// ── Source badge ──────────────────────────────────────────────────
function SourceBadge({ source }: { source: 'crm' | 'portfolio' }) {
  return source === 'crm' ? (
    <span className="inline-flex items-center text-[10px] font-label font-bold uppercase tracking-wide bg-[#fbb33d]/15 text-[#b45309] border border-[#fbb33d]/30 px-2 py-0.5">
      CRM
    </span>
  ) : (
    <span className="inline-flex items-center text-[10px] font-label font-bold uppercase tracking-wide bg-[#eef8f8] text-[#007a7a] border border-[#009999]/30 px-2 py-0.5">
      Portfólio
    </span>
  )
}

// ── Sort icon ─────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: string; sortDir: 'asc' | 'desc' }) {
  if (col !== sortCol) {
    return <span className="ml-1 text-text-muted opacity-40">⇅</span>
  }
  return <span className="ml-1 text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

// ── Date helpers ──────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Main component ────────────────────────────────────────────────
type SortKey = 'date' | 'title' | 'type' | 'responsible_name' | 'context_name' | 'source' | 'status'

export function AtividadesTable({ activities, users, defaultResponsavel = '', defaultStatus = '' }: Props) {
  // Filters
  const [search,            setSearch]            = useState('')
  const [filterResponsavel, setFilterResponsavel] = useState(defaultResponsavel)
  const [filterStatus,      setFilterStatus]      = useState(defaultStatus)
  const [filterOrigem,      setFilterOrigem]      = useState<'all' | 'crm' | 'portfolio'>('all')
  const [filterContexto,    setFilterContexto]    = useState('')
  const [filterDateFrom,    setFilterDateFrom]    = useState('')
  const [filterDateTo,      setFilterDateTo]      = useState('')

  // Sort
  const [sortCol, setSortCol] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)

  function handleSort(col: SortKey) {
    if (col === sortCol) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  // Derived filter options
  const allContexts = useMemo(() => {
    const names = new Set(activities.map((a) => a.context_name).filter(Boolean) as string[])
    return Array.from(names).sort()
  }, [activities])

  const allStatuses = useMemo(() => {
    const s = new Set(activities.map((a) => a.status))
    return Array.from(s).sort()
  }, [activities])

  // Apply filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return activities.filter((a) => {
      if (q && !(a.title ?? '').toLowerCase().includes(q) &&
              !a.type.toLowerCase().includes(q) &&
              !(a.context_name ?? '').toLowerCase().includes(q) &&
              !(a.responsible_name ?? '').toLowerCase().includes(q)) return false
      if (filterResponsavel && a.responsible_id !== filterResponsavel) return false
      if (filterStatus && a.status !== filterStatus) return false
      if (filterOrigem !== 'all' && a.source !== filterOrigem) return false
      if (filterContexto && a.context_name !== filterContexto) return false
      if (filterDateFrom && a.date < filterDateFrom) return false
      if (filterDateTo   && a.date > filterDateTo + 'T23:59:59') return false
      return true
    })
  }, [activities, search, filterResponsavel, filterStatus, filterOrigem, filterContexto, filterDateFrom, filterDateTo])

  // Apply sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = (a[sortCol] ?? '') as string
      let bv = (b[sortCol] ?? '') as string
      if (sortCol === 'date') { av = a.date; bv = b.date }
      const cmp = av.localeCompare(bv, 'pt-BR', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortCol, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const rows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function resetPage() { setPage(1) }

  const hasFilters = search || filterResponsavel || filterStatus || filterOrigem !== 'all' || filterContexto || filterDateFrom || filterDateTo

  function clearFilters() {
    setSearch(''); setFilterResponsavel(''); setFilterStatus('')
    setFilterOrigem('all'); setFilterContexto(''); setFilterDateFrom(''); setFilterDateTo('')
    setPage(1)
  }

  const headerCls = 'text-left text-[10px] font-label font-semibold uppercase tracking-wider text-text-muted px-3 py-2.5 whitespace-nowrap cursor-pointer hover:text-primary select-none border-b border-border'
  const cellCls   = 'px-3 py-2.5 text-sm text-text-secondary'

  return (
    <div className="flex flex-col gap-4">

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2">
        {/* Text search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            placeholder="Título, tipo, startup…"
            className="h-8 px-2.5 text-xs bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Responsável */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Responsável</label>
          <select value={filterResponsavel}
            onChange={(e) => { setFilterResponsavel(e.target.value); resetPage() }}
            className="h-8 px-2 text-xs bg-surface border border-border text-text-secondary focus:outline-none focus:border-primary">
            <option value="">Todos</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {/* Startup / Candidata */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Startup / Candidata</label>
          <select value={filterContexto}
            onChange={(e) => { setFilterContexto(e.target.value); resetPage() }}
            className="h-8 px-2 text-xs bg-surface border border-border text-text-secondary focus:outline-none focus:border-primary min-w-[160px]">
            <option value="">Todas</option>
            {allContexts.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Status</label>
          <select value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPage() }}
            className="h-8 px-2 text-xs bg-surface border border-border text-text-secondary focus:outline-none focus:border-primary">
            <option value="">Todos</option>
            {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Data de */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">De</label>
          <input type="date" value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); resetPage() }}
            className="h-8 px-2 text-xs bg-surface border border-border text-text-secondary focus:outline-none focus:border-primary" />
        </div>

        {/* Data até */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Até</label>
          <input type="date" value={filterDateTo}
            onChange={(e) => { setFilterDateTo(e.target.value); resetPage() }}
            className="h-8 px-2 text-xs bg-surface border border-border text-text-secondary focus:outline-none focus:border-primary" />
        </div>

        {/* Origem toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-label uppercase tracking-wide text-text-muted">Origem</label>
          <div className="flex h-8 border border-border">
            {(['all', 'crm', 'portfolio'] as const).map((o) => (
              <button key={o} onClick={() => { setFilterOrigem(o); resetPage() }}
                className={[
                  'px-3 text-[11px] font-label font-semibold uppercase tracking-wide transition-colors',
                  filterOrigem === o ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:bg-surface-2',
                ].join(' ')}>
                {o === 'all' ? 'Todos' : o === 'crm' ? 'CRM' : 'Portfólio'}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters}
            className="h-8 px-3 text-xs text-signal-red border border-signal-red/30 hover:bg-signal-red/5 transition-colors font-label self-end">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? 'atividade' : 'atividades'}
          {hasFilters && ` filtrada${filtered.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-2">
            <tr>
              <th className={headerCls} onClick={() => handleSort('date')}>
                Data <SortIcon col="date" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('title')}>
                Título / Descrição <SortIcon col="title" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('type')}>
                Tipo <SortIcon col="type" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('responsible_name')}>
                Responsável <SortIcon col="responsible_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('context_name')}>
                Startup / Candidata <SortIcon col="context_name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('source')}>
                Origem <SortIcon col="source" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className={headerCls} onClick={() => handleSort('status')}>
                Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-text-muted">
                  Nenhuma atividade encontrada.
                </td>
              </tr>
            ) : (
              rows.map((act, idx) => (
                <tr key={`${act.source}-${act.id}`}
                  className={[
                    'border-t border-border transition-colors hover:bg-[#eef8f8] cursor-pointer',
                    idx % 2 === 1 ? 'bg-surface-2/50' : 'bg-surface',
                  ].join(' ')}
                  onClick={() => window.location.href = act.href}>
                  <td className={`${cellCls} text-text-muted text-xs whitespace-nowrap`}>
                    {fmtDateShort(act.date)}
                  </td>
                  <td className={`${cellCls} max-w-[240px]`}>
                    <span className="line-clamp-2 text-text-primary text-xs leading-snug">
                      {act.title ?? <span className="text-text-muted italic">—</span>}
                    </span>
                  </td>
                  <td className={cellCls}>
                    <TypeBadge type={act.type} />
                  </td>
                  <td className={`${cellCls} text-xs whitespace-nowrap`}>
                    {act.responsible_name ?? <span className="text-text-muted">—</span>}
                  </td>
                  <td className={`${cellCls} text-xs whitespace-nowrap`}>
                    {act.context_name ?? <span className="text-text-muted">—</span>}
                  </td>
                  <td className={cellCls}>
                    <SourceBadge source={act.source} />
                  </td>
                  <td className={cellCls}>
                    <StatusBadge status={act.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-text-muted">
            Página {currentPage} de {totalPages} · {sorted.length} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-label border border-border text-text-muted hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // Show pages around current
              let p: number
              if (totalPages <= 7) p = i + 1
              else if (currentPage <= 4) p = i + 1
              else if (currentPage >= totalPages - 3) p = totalPages - 6 + i
              else p = currentPage - 3 + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={[
                    'w-8 py-1.5 text-xs font-label border transition-colors',
                    p === currentPage
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-muted hover:border-primary hover:text-primary',
                  ].join(' ')}>
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-label border border-border text-text-muted hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
