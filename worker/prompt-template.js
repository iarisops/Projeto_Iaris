const PROMPT_VERSION = 'v1'

function signalLabel(signal) {
  const labels = { Verde: '🟢', Amarelo: '🟡', Laranja: '🟠', Vermelho: '🔴' }
  return labels[signal] ?? signal
}

function buildPrompt(ctx) {
  const { startup, quarter, okrs, metrics, activities, assessments } = ctx

  const profileLines = [
    startup.short_description ?? startup.problem ?? '',
    [startup.segment && `Segmento: ${startup.segment}`, startup.stage && `Fase: ${startup.stage}`, startup.tier != null && `Tier: ${startup.tier}`]
      .filter(Boolean)
      .join(' | '),
  ].filter(Boolean).join('\n')

  const assessmentLines = assessments.flatMap((a) =>
    (a.items ?? []).map((item) =>
      `${signalLabel(item.signal)} [${item.category}] ${item.observed_evidence ?? ''} — ${item.risk_interpretation ?? ''}`
    )
  ).join('\n') || '(sem assessments)'

  const okrLines = okrs.map((o) => {
    const krs = Array.isArray(o.key_results)
      ? o.key_results.map((kr) => `  • ${typeof kr === 'object' ? JSON.stringify(kr) : kr}`).join('\n')
      : ''
    return `▸ ${o.objective} [${o.status ?? '—'}${o.progress != null ? ` ${o.progress}%` : ''}]\n${krs}`
  }).join('\n') || '(sem OKRs)'

  const metricLines = metrics.map((m) =>
    `${m.type}: ${m.current_value ?? '—'}${m.previous_value != null ? ` (anterior: ${m.previous_value})` : ''}${m.period ? ` · ${m.period}` : ''}${m.notes ? ` — ${m.notes}` : ''}`
  ).join('\n') || '(sem métricas)'

  const activityLines = activities.map((a) =>
    `${a.date} [${a.type}${a.status ? ' · ' + a.status : ''}] ${a.notes ?? ''}`
  ).join('\n') || '(sem atividades)'

  return `Você é um assistente da IARIS Venture Builder preparando um resumo de contexto para uma reunião com a startup ${startup.name}.

## Perfil
${profileLines}

## Assessment recente
${assessmentLines}

## OKRs do quarter ${quarter}
${okrLines}

## Métricas
${metricLines}

## Atividades recentes (últimas 10)
${activityLines}

## Gere um Resumo de Contexto com as seções:
1. Histórico e Jornada
2. Avanços recentes
3. Desafios e riscos
4. Métricas-chave
5. Próximos pontos de atenção

Seja objetivo, direto e útil para uma reunião de acompanhamento. Use português.`
}

module.exports = { buildPrompt, PROMPT_VERSION }
