async function buildStartupContext(supabase, startupId, quarter) {
  const [
    { data: startup },
    { data: okrs },
    { data: metrics },
    { data: activities },
    { data: assessments },
  ] = await Promise.all([
    supabase
      .from('portfolio_startups')
      .select('id, name, short_description, problem, solution, segment, stage, tier')
      .eq('id', startupId)
      .single(),
    supabase
      .from('okrs')
      .select('id, objective, status, progress, notes, key_results')
      .eq('startup_id', startupId)
      .eq('quarter', quarter),
    supabase
      .from('metrics')
      .select('id, type, current_value, previous_value, period, notes')
      .eq('startup_id', startupId)
      .eq('quarter', quarter),
    supabase
      .from('portfolio_activities')
      .select('id, type, date, status, notes')
      .eq('startup_id', startupId)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('operational_assessments')
      .select('id, created_at')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  if (!startup) throw new Error('Startup não encontrada.')

  const assessmentDetails = []
  for (const assessment of (assessments ?? [])) {
    const { data: items } = await supabase
      .from('assessment_items')
      .select('category, signal, observed_evidence, risk_interpretation, next_focus')
      .eq('assessment_id', assessment.id)
    assessmentDetails.push({ ...assessment, items: items ?? [] })
  }

  const totalRecords =
    (okrs?.length ?? 0) +
    (metrics?.length ?? 0) +
    (activities?.length ?? 0) +
    assessmentDetails.length

  if (totalRecords === 0) throw new Error('Dados insuficientes para gerar contexto.')

  return {
    startup,
    quarter,
    okrs: okrs ?? [],
    metrics: metrics ?? [],
    activities: activities ?? [],
    assessments: assessmentDetails,
  }
}

module.exports = { buildStartupContext }
