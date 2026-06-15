#!/usr/bin/env ts-node
/**
 * scripts/import-investor-day-4.ts
 *
 * Importação completa do 4º Investor Day IARIS Ventures.
 * Uso: npx ts-node --skip-project scripts/import-investor-day-4.ts
 *
 * ─── MAPEAMENTO DE COLUNAS ────────────────────────────────────────────────
 *
 * Aba "Startups":
 *   Col 1  Startup (hyperlink)          → startup_candidates.name
 *   Col 2  Observação p/ lembrete       → startup_candidates.reminder_note
 *   Col 3  Evolução / Histórico         → startup_candidates.history_evolution
 *   Col 4  Status                       → stage_id + result  (regra abaixo)
 *   Col 5  Site (hyperlink)             → startup_candidates.site
 *   Col 6  Equity                       → startup_candidates.equity
 *   Col 7  Vertical                     → startup_candidates.vertical
 *   Col 8  Fase  (MVP → null)           → startup_candidates.phase
 *   Col 9  Nota  (rich text → null)     → startup_candidates.score
 *   Col 10 Captable                     → startup_candidates.captable
 *   Col 11 MRR                          → startup_candidates.mrr
 *   Col 12 Clientes                     → startup_candidates.customers
 *   Col 13 Time                         → startup_candidates.team
 *   Col 14 O que busca?                 → startup_candidates.what_seeks
 *   Col 15 Observação geral             → startup_candidates.general_note
 *   Col 16 Apresentação (hyperlink)     → startup_candidates.pitch_deck_url
 *
 * Regra de status (planilha mistura etapa e resultado numa coluna):
 *   'Contrato'         → stage: 'Contrato/MoU enviado', result: 'Em aberto'
 *   '2a Reunião'       → stage: '2ª Reunião',           result: 'Em aberto'
 *   'Startup avaliando'→ stage: 'Startup avaliando',    result: 'Em aberto'
 *   'Avaliação'        → stage: 'Avaliação',            result: 'Em aberto'
 *   'Recusa'           → result: 'Perdida'  (stage = null; importNote = status original)
 *   <outros>           → result: 'Em aberto', importNote = status original
 *
 * Aba "Framework IARIS — Avaliação Qua":
 *   Col 1      Startup                  → match com startup_candidates.name
 *   Cols 2–11  Critérios (emoji)        → qualitative_assessments.criteria_signals
 *                🟢 = 'verde', 🟡 = 'amarelo', 🔴 = 'vermelho'
 *   Col 12     Resultado final          → qualitative_assessments.recommendation (geralmente vazio)
 *
 * Aba "Base_Respostas":
 *   Col 1      Startup name             → match (plaintext, sem equity)
 *   Cols 2–19  Critérios do formulário  → panel_evaluations.criteria_scores (JSONB)
 *   Col 20     Nota final               → panel_evaluations.final_score
 *   Col 21     Aprovado (Sim/Não)       → panel_evaluations.approved
 *   Col 22     Comentários              → panel_evaluations.general_comments
 *
 * Aba "Respostas ao formulário" (1:1 com Base_Respostas):
 *   Col 1      Timestamp                → panel_evaluations.evaluation_date
 *   Col 2      "StartupName - X%"       → nome após split em " - "
 *   Col 3      Avaliador                → panel_evaluations.evaluator_name
 *   Col 22     Nota final               → (redundante; usamos Base_Respostas col 20)
 *   Col 23     Aprovado                 → (redundante; usamos Base_Respostas col 21)
 *   Col 24     Comentários              → (redundante; usamos Base_Respostas col 22)
 *
 * Aba "Contato, quando aplicável":
 *   Col 2      Startup (hyperlink)      → match com startup_candidates.name
 *   Col 3      E-mails (separados por vírgula) → startup_candidates.email (primeiro)
 */

import * as fs from 'fs'
import * as path from 'path'
import * as ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'

// ─── .env.local ──────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local não encontrado. Execute na raiz do projeto.')
  }
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) process.env[key] = val
  }
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const FUNNEL_NAME = '4º Investor Day IARIS Ventures'
const FUNNEL_EDITION = '2024-S2'
const PANEL_FORM_NAME = '4º Investor Day — Formulário de Banca'
const EXCEL_PATH = 'data/imports/crm/investor-day-4/4o Investor Day IARIS Ventures - Startups.xlsx'

const DEFAULT_STAGES = [
  { name: 'Avaliação',              position: 1, is_default: true,  is_final: false },
  { name: '1ª Reunião',             position: 2, is_default: false, is_final: false },
  { name: '2ª Reunião',             position: 3, is_default: false, is_final: false },
  { name: 'Contrato/MoU enviado',   position: 4, is_default: false, is_final: false },
  { name: 'Startup avaliando',      position: 5, is_default: false, is_final: false },
  { name: 'Investor Day',           position: 6, is_default: false, is_final: false },
  { name: 'Pós-Investor Day',       position: 7, is_default: false, is_final: false },
  { name: 'Entrada no Portfólio',   position: 8, is_default: false, is_final: true  },
]

const VALID_PHASES = new Set(['Ideação', 'Validação', 'Operação', 'Tração', 'Escala'])

// Mesma ordem que QualitativeAssessmentForm.tsx
const CRM_CRITERIA = [
  'Founder / Time',
  'Clareza do problema',
  'Produto',
  'Distribuição / GTM',
  'Tração',
  'Mercado',
  'Diferencial',
  'Modelo de negócio',
  'Investimento',
  'Governança / Organização',
]

// ─── Helpers de célula ExcelJS ────────────────────────────────────────────────

function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return String(v)
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'object') {
    const obj = v as unknown as Record<string, unknown>
    if ('richText' in obj) {
      return (obj.richText as Array<{ text: string }>).map((r) => r.text).join('').trim()
    }
    if ('text' in obj) return String(obj.text).trim()
    if ('hyperlink' in obj) return String(obj.hyperlink).trim()
  }
  return String(v).trim()
}

function cellUrl(cell: ExcelJS.Cell): string | null {
  const v = cell.value
  if (!v) return null
  if (typeof v === 'string') return v.trim() || null
  if (v instanceof Date) return null
  if (typeof v === 'object') {
    const obj = v as unknown as Record<string, unknown>
    if (obj.hyperlink) return String(obj.hyperlink).trim() || null
    if (obj.text)      return String(obj.text).trim() || null
  }
  return null
}

function cellNumber(cell: ExcelJS.Cell): number | null {
  const v = cell.value
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return isNaN(v) ? null : v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'))
    return isNaN(n) ? null : n
  }
  return null
}

function cellDate(cell: ExcelJS.Cell): string | null {
  const v = cell.value
  if (!v) return null
  if (v instanceof Date) return v.toISOString().split('T')[0]
  if (typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
  }
  return null
}

// ─── Normalização de nome (para matching entre abas) ──────────────────────────

function normName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // remove diacritics
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Mapeamento de status ─────────────────────────────────────────────────────

function mapStatus(status: string): {
  stageKey: string | null
  result: 'Em aberto' | 'Ganha' | 'Perdida' | 'Acompanhar futuramente'
  importNote: string | null
} {
  switch (status.trim()) {
    case 'Contrato':          return { stageKey: 'Contrato/MoU enviado', result: 'Em aberto', importNote: null }
    case 'Startup avaliando': return { stageKey: 'Startup avaliando',    result: 'Em aberto', importNote: null }
    case '2a Reunião':        return { stageKey: '2ª Reunião',           result: 'Em aberto', importNote: null }
    case 'Avaliação':         return { stageKey: 'Avaliação',            result: 'Em aberto', importNote: null }
    case 'Recusa':            return { stageKey: null,                   result: 'Perdida',   importNote: `Status original: ${status}` }
    default:
      return {
        stageKey: null,
        result: 'Em aberto',
        importNote: status ? `Status original não mapeado: ${status}` : null,
      }
  }
}

// ─── Mapeamento de emoji → sinal CRM ─────────────────────────────────────────

function mapSignal(text: string): 'verde' | 'amarelo' | 'vermelho' | null {
  if (text.includes('🟢')) return 'verde'
  if (text.includes('🟡')) return 'amarelo'
  if (text.includes('🔴')) return 'vermelho'
  return null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now()
  loadEnv()

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos em .env.local')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient<any>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path.join(process.cwd(), EXCEL_PATH))
  console.log(`Arquivo lido: ${EXCEL_PATH}`)

  // ── Estatísticas ─────────────────────────────────────────────────────────────

  const stats = {
    candidatesImported:  0,
    candidatesSkipped:   [] as string[],
    candidateErrors:     [] as string[],
    assessmentsImported: 0,
    assessmentErrors:    [] as string[],
    panelEvsImported:    0,
    panelEvErrors:       [] as string[],
    contactsUpdated:     0,
    mappingErrors:       [] as string[],
  }

  // ── 1. Funil ──────────────────────────────────────────────────────────────────

  console.log('\n[1/5] Funil...')
  let funnelId: string
  const stageMap: Record<string, string> = {}  // nome da etapa → id

  const { data: existingFunnel } = await supabase
    .from('funnels')
    .select('id')
    .eq('name', FUNNEL_NAME)
    .maybeSingle()

  if (existingFunnel) {
    funnelId = existingFunnel.id
    console.log(`  Funil já existe: ${funnelId}`)
  } else {
    const { data: newFunnel, error: funnelErr } = await supabase
      .from('funnels')
      .insert({ name: FUNNEL_NAME, edition: FUNNEL_EDITION, status: 'Encerrado' })
      .select('id')
      .single()

    if (funnelErr || !newFunnel) throw new Error(`Erro ao criar funil: ${funnelErr?.message}`)
    funnelId = newFunnel.id
    console.log(`  Funil criado: ${funnelId}`)

    const { error: stagesErr } = await supabase
      .from('funnel_stages')
      .insert(DEFAULT_STAGES.map((s) => ({ funnel_id: funnelId, ...s })))
    if (stagesErr) throw new Error(`Erro ao criar etapas: ${stagesErr.message}`)
    console.log(`  8 etapas padrão criadas.`)
  }

  const { data: stages } = await supabase
    .from('funnel_stages')
    .select('id, name')
    .eq('funnel_id', funnelId)

  for (const s of stages ?? []) stageMap[s.name] = s.id
  console.log(`  Etapas: ${Object.keys(stageMap).join(' | ')}`)

  // ── 2. Candidatas (aba Startups) ──────────────────────────────────────────────

  console.log('\n[2/5] Candidatas...')

  // Mapa de candidatas já existentes no funil (para detecção de duplicata)
  const candidateIdMap: Record<string, string> = {}   // normName → id

  const { data: existing } = await supabase
    .from('startup_candidates')
    .select('id, name')
    .eq('funnel_id', funnelId)
  for (const c of existing ?? []) candidateIdMap[normName(c.name)] = c.id

  interface StartupRow {
    name: string
    reminder_note: string | null
    history_evolution: string | null
    status: string
    site: string | null
    equity: string | null
    vertical: string | null
    phase: string | null
    score: number | null
    captable: string | null
    mrr: number | null
    customers: string | null
    team: string | null
    what_seeks: string | null
    general_note: string | null
    pitch_deck_url: string | null
  }

  const startupRows: StartupRow[] = []
  const ws = wb.getWorksheet('Startups')!
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const name = cellText(row.getCell(1))
    if (!name) return
    startupRows.push({
      name,
      reminder_note:    cellText(row.getCell(2))  || null,
      history_evolution:cellText(row.getCell(3))  || null,
      status:           cellText(row.getCell(4)),
      site:             cellUrl(row.getCell(5)),
      equity:           cellText(row.getCell(6))  || null,
      vertical:         cellText(row.getCell(7))  || null,
      phase:            VALID_PHASES.has(cellText(row.getCell(8))) ? cellText(row.getCell(8)) : null,
      score:            cellNumber(row.getCell(9)),
      captable:         cellText(row.getCell(10)) || null,
      mrr:              cellNumber(row.getCell(11)),
      customers:        cellText(row.getCell(12)) || null,
      team:             cellText(row.getCell(13)) || null,
      what_seeks:       cellText(row.getCell(14)) || null,
      general_note:     cellText(row.getCell(15)) || null,
      pitch_deck_url:   cellUrl(row.getCell(16)) ?? (cellText(row.getCell(16)) || null),
    })
  })

  console.log(`  ${startupRows.length} linhas lidas da aba Startups.`)

  for (const row of startupRows) {
    const key = normName(row.name)

    if (candidateIdMap[key]) {
      stats.candidatesSkipped.push(row.name)
      console.log(`  SKIP (duplicata): ${row.name}`)
      continue
    }

    const { stageKey, result, importNote } = mapStatus(row.status)
    const stageId = stageKey ? (stageMap[stageKey] ?? null) : null

    if (stageKey && !stageId) {
      stats.mappingErrors.push(`Etapa não encontrada: "${stageKey}" para "${row.name}"`)
    }

    const { data: created, error } = await supabase
      .from('startup_candidates')
      .insert({
        funnel_id:         funnelId,
        stage_id:          stageId,
        result,
        name:              row.name,
        reminder_note:     row.reminder_note,
        history_evolution: row.history_evolution,
        site:              row.site,
        equity:            row.equity,
        vertical:          row.vertical,
        phase:             row.phase,
        score:             row.score,
        captable:          row.captable,
        mrr:               row.mrr,
        customers:         row.customers,
        team:              row.team,
        what_seeks:        row.what_seeks,
        general_note:      row.general_note,
        pitch_deck_url:    row.pitch_deck_url,
        import_note:       importNote,
      })
      .select('id')
      .single()

    if (error || !created) {
      stats.candidateErrors.push(`${row.name}: ${error?.message}`)
      console.log(`  ERROR: ${row.name} — ${error?.message}`)
    } else {
      candidateIdMap[key] = created.id
      stats.candidatesImported++
      const stagePart = stageKey ? ` (${stageKey})` : ''
      console.log(`  OK: ${row.name} → ${result}${stagePart}`)
    }
  }

  // ── 3. Avaliações qualitativas (aba Framework) ────────────────────────────────

  console.log('\n[3/5] Avaliações qualitativas...')

  interface AssessmentRow {
    startupName: string
    signals: (string | null)[]
    recommendation: 'Investor Day' | 'Potencial' | 'Não avançar' | null
  }

  const assessmentRows: AssessmentRow[] = []
  const fwSheet = wb.getWorksheet('Framework IARIS — Avaliação Qua')
  if (!fwSheet) {
    console.log('  WARN: Aba "Framework IARIS — Avaliação Qua" não encontrada — pulando.')
  } else {
    fwSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const name = cellText(row.getCell(1))
      if (!name) return

      const signals: (string | null)[] = []
      for (let c = 2; c <= 11; c++) signals.push(mapSignal(cellText(row.getCell(c))))

      const recRaw = cellText(row.getCell(12))
      let recommendation: AssessmentRow['recommendation'] = null
      if (/investor day/i.test(recRaw))       recommendation = 'Investor Day'
      else if (/potencial/i.test(recRaw))      recommendation = 'Potencial'
      else if (/n[aã]o avan[cç]ar/i.test(recRaw)) recommendation = 'Não avançar'

      assessmentRows.push({ startupName: name, signals, recommendation })
    })

    console.log(`  ${assessmentRows.length} linhas lidas.`)

    for (const row of assessmentRows) {
      const candidateId = candidateIdMap[normName(row.startupName)]
      if (!candidateId) {
        stats.assessmentErrors.push(`Candidata não encontrada: "${row.startupName}"`)
        console.log(`  SKIP (candidata não encontrada): ${row.startupName}`)
        continue
      }

      const criteriaSignals: Record<string, string> = {}
      for (let i = 0; i < CRM_CRITERIA.length; i++) {
        const sig = row.signals[i]
        if (sig) criteriaSignals[CRM_CRITERIA[i]] = sig
      }

      const { error } = await supabase
        .from('qualitative_assessments')
        .insert({
          startup_candidate_id: candidateId,
          recommendation:       row.recommendation,
          criteria_signals:     criteriaSignals,
        })

      if (error) {
        stats.assessmentErrors.push(`${row.startupName}: ${error.message}`)
        console.log(`  ERROR: ${row.startupName} — ${error.message}`)
      } else {
        stats.assessmentsImported++
        console.log(`  OK: ${row.startupName}`)
      }
    }
  }

  // ── 4. Avaliações de banca (Respostas + Base_Respostas) ───────────────────────

  console.log('\n[4/5] Avaliações de banca...')

  const brSheet = wb.getWorksheet('Base_Respostas')
  const rfSheet = wb.getWorksheet('Respostas ao formulário')

  if (!brSheet || !rfSheet) {
    console.log('  WARN: Abas de respostas não encontradas — pulando.')
  } else {
    // Ler cabeçalhos da Base_Respostas (cols 2–19 = critérios)
    const criteriaLabels: string[] = []   // índice 0 = col 2, índice 17 = col 19
    const brHeader = brSheet.getRow(1)
    for (let c = 2; c <= 19; c++) {
      criteriaLabels.push(cellText(brHeader.getCell(c)))
    }

    // Criar ou encontrar formulário de banca
    let formId: string | null = null

    const { data: existingForm } = await supabase
      .from('panel_evaluation_forms')
      .select('id')
      .eq('funnel_id', funnelId)
      .eq('name', PANEL_FORM_NAME)
      .maybeSingle()

    if (existingForm) {
      formId = existingForm.id
      console.log(`  Formulário já existe: ${formId}`)
    } else {
      const formCriteria = criteriaLabels.map((label) => ({
        label: label.trim(),
        type: 'text' as const,
      }))

      const { data: newForm, error: formErr } = await supabase
        .from('panel_evaluation_forms')
        .insert({ funnel_id: funnelId, name: PANEL_FORM_NAME, criteria: formCriteria })
        .select('id')
        .single()

      if (formErr || !newForm) {
        console.log(`  WARN: Erro ao criar formulário: ${formErr?.message}`)
      } else {
        formId = newForm.id
        console.log(`  Formulário criado: ${formId} (${criteriaLabels.length} critérios)`)
      }
    }

    // Coletar avaliações (Respostas e Base_Respostas são 1:1 por linha)
    interface PanelRow {
      startupNameRaw: string
      evaluatorName:  string | null
      evalDate:       string | null
      finalScore:     number | null
      approved:       boolean | null
      comments:       string | null
      criteriaScores: Record<string, string>
    }

    const panelRows: PanelRow[] = []

    rfSheet.eachRow((rfRow, rowNum) => {
      if (rowNum === 1) return
      const nameRaw = cellText(rfRow.getCell(2))
      if (!nameRaw) return

      const brRow = brSheet.getRow(rowNum)

      const criteriaScores: Record<string, string> = {}
      for (let c = 2; c <= 19; c++) {
        const label = criteriaLabels[c - 2]
        if (!label) continue
        const val = cellText(brRow.getCell(c))
        if (val) criteriaScores[label] = val
      }

      const approvedRaw = cellText(brRow.getCell(21)).toLowerCase()

      panelRows.push({
        startupNameRaw: nameRaw,
        evaluatorName:  cellText(rfRow.getCell(3)) || null,
        evalDate:       cellDate(rfRow.getCell(1)),
        finalScore:     cellNumber(brRow.getCell(20)),
        approved:       approvedRaw === 'sim' ? true : approvedRaw === 'não' || approvedRaw === 'nao' ? false : null,
        comments:       cellText(brRow.getCell(22)) || null,
        criteriaScores,
      })
    })

    console.log(`  ${panelRows.length} respostas lidas.`)

    for (const row of panelRows) {
      // "StartupName - X%" → pegar só o nome
      const startupName = row.startupNameRaw.includes(' - ')
        ? row.startupNameRaw.split(' - ')[0].trim()
        : row.startupNameRaw.trim()

      const candidateId = candidateIdMap[normName(startupName)]
      if (!candidateId) {
        stats.panelEvErrors.push(
          `Candidata não encontrada: "${startupName}" (raw: "${row.startupNameRaw}")`
        )
        console.log(`  SKIP (candidata não encontrada): ${startupName}`)
        continue
      }

      const { error } = await supabase
        .from('panel_evaluations')
        .insert({
          startup_candidate_id: candidateId,
          form_id:              formId,
          evaluator_name:       row.evaluatorName,
          evaluation_date:      row.evalDate,
          final_score:          row.finalScore,
          approved:             row.approved,
          general_comments:     row.comments,
          criteria_scores:      row.criteriaScores,
        })

      if (error) {
        stats.panelEvErrors.push(`${startupName} / ${row.evaluatorName}: ${error.message}`)
        console.log(`  ERROR: ${startupName} — ${error.message}`)
      } else {
        stats.panelEvsImported++
      }
    }
    console.log(`  ${stats.panelEvsImported} avaliações de banca importadas.`)
  }

  // ── 5. Contatos (aba Contato) ─────────────────────────────────────────────────

  console.log('\n[5/5] Contatos...')

  const ctSheet = wb.getWorksheet('Contato, quando aplicável')
    ?? wb.getWorksheet('Contato')

  if (!ctSheet) {
    console.log('  WARN: Aba de contatos não encontrada — pulando.')
  } else {
    interface ContactRow { startupName: string; emailsRaw: string }
    const contactRows: ContactRow[] = []

    ctSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const name   = cellText(row.getCell(2))
      const emails = cellText(row.getCell(3))
      if (!name || !emails) return
      contactRows.push({ startupName: name, emailsRaw: emails })
    })

    for (const row of contactRows) {
      const candidateId = candidateIdMap[normName(row.startupName)]
      if (!candidateId) {
        console.log(`  SKIP (candidata não encontrada): ${row.startupName}`)
        continue
      }

      // Pegar primeiro e-mail; remover formato "Nome <email>"
      const firstRaw = row.emailsRaw.split(',')[0].trim()
      const emailMatch = firstRaw.match(/<(.+?)>/)
      const email = emailMatch ? emailMatch[1].trim() : firstRaw

      const { error } = await supabase
        .from('startup_candidates')
        .update({ email })
        .eq('id', candidateId)

      if (error) {
        console.log(`  ERROR: ${row.startupName} — ${error.message}`)
      } else {
        stats.contactsUpdated++
        console.log(`  OK: ${row.startupName} → ${email}`)
      }
    }
  }

  // ── Sumário final ─────────────────────────────────────────────────────────────

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log('\n' + '═'.repeat(62))
  console.log(' RESUMO — Importação 4º Investor Day IARIS Ventures')
  console.log('═'.repeat(62))
  console.log(` Duração:                       ${duration}s`)
  console.log(` Candidatas importadas:         ${stats.candidatesImported}`)
  console.log(` Candidatas ignoradas (dup.):   ${stats.candidatesSkipped.length}`)
  if (stats.candidatesSkipped.length > 0) {
    stats.candidatesSkipped.forEach((n) => console.log(`   - ${n}`))
  }
  console.log(` Avaliações qualitativas:       ${stats.assessmentsImported}`)
  console.log(` Avaliações de banca:           ${stats.panelEvsImported}`)
  console.log(` Contatos atualizados:          ${stats.contactsUpdated}`)

  const totalErrors =
    stats.candidateErrors.length +
    stats.assessmentErrors.length +
    stats.panelEvErrors.length +
    stats.mappingErrors.length

  if (totalErrors === 0) {
    console.log('\n Nenhum erro detectado.')
  } else {
    if (stats.candidateErrors.length > 0) {
      console.log(`\n ERROS de candidatas (${stats.candidateErrors.length}):`)
      stats.candidateErrors.forEach((e) => console.log(`   ! ${e}`))
    }
    if (stats.assessmentErrors.length > 0) {
      console.log(`\n ERROS de avaliações qualitativas (${stats.assessmentErrors.length}):`)
      stats.assessmentErrors.forEach((e) => console.log(`   ! ${e}`))
    }
    if (stats.panelEvErrors.length > 0) {
      console.log(`\n ERROS de avaliações de banca (${stats.panelEvErrors.length}):`)
      stats.panelEvErrors.forEach((e) => console.log(`   ! ${e}`))
    }
    if (stats.mappingErrors.length > 0) {
      console.log(`\n ERROS de mapeamento (${stats.mappingErrors.length}):`)
      stats.mappingErrors.forEach((e) => console.log(`   ! ${e}`))
    }
  }
  console.log('═'.repeat(62))
}

main().catch((e: Error) => {
  console.error('\nERRO FATAL:', e.message)
  process.exit(1)
})
