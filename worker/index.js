require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const { fetchCompletion, OLLAMA_MODEL } = require('./providers/ollama')
const { buildStartupContext } = require('./context-builder')
const { buildPrompt, PROMPT_VERSION } = require('./prompt-template')

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '15000', 10)
const STUCK_JOB_TIMEOUT_MIN = parseInt(process.env.STUCK_JOB_TIMEOUT_MIN ?? '10', 10)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

function currentQuarter() {
  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${quarter}-${now.getFullYear()}`
}

async function resetStuckJobs() {
  const { error } = await supabase
    .from('ai_jobs')
    .update({ status: 'Pendente', started_at: null, error_message: 'Reset por reinício do worker' })
    .eq('status', 'Processando')
    .lt('started_at', new Date(Date.now() - STUCK_JOB_TIMEOUT_MIN * 60 * 1000).toISOString())

  if (error) console.error('[worker] Erro ao resetar jobs travados:', error.message)
}

async function processNextJob() {
  const { data: job } = await supabase
    .from('ai_jobs')
    .select('id, startup_id, requester_id, prompt_version')
    .eq('status', 'Pendente')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!job) return // nothing to do

  // Claim the job atomically
  const { data: claimed, error: claimError } = await supabase
    .from('ai_jobs')
    .update({ status: 'Processando', started_at: new Date().toISOString() })
    .eq('id', job.id)
    .eq('status', 'Pendente')
    .select('id')
    .single()

  if (claimError || !claimed) {
    console.log(`[worker] Job ${job.id} já foi pego por outro worker.`)
    return
  }

  console.log(`[worker] Processando job ${job.id} para startup ${job.startup_id}`)

  try {
    const quarter = currentQuarter()
    const ctx = await buildStartupContext(supabase, job.startup_id, quarter)
    const prompt = buildPrompt(ctx)
    const { text, model } = await fetchCompletion(prompt)

    const { error: insertError } = await supabase.from('context_versions').insert({
      startup_id: job.startup_id,
      ai_job_id: job.id,
      content: text,
      model,
      prompt_version: PROMPT_VERSION,
      generated_at: new Date().toISOString(),
    })

    if (insertError) throw new Error(insertError.message)

    await supabase
      .from('ai_jobs')
      .update({ status: 'Concluído', completed_at: new Date().toISOString(), model })
      .eq('id', job.id)

    console.log(`[worker] Job ${job.id} concluído.`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[worker] Erro no job ${job.id}:`, message)

    await supabase
      .from('ai_jobs')
      .update({ status: 'Erro', completed_at: new Date().toISOString(), error_message: message })
      .eq('id', job.id)
  }
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[worker] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios. Copie .env.example para .env.')
    process.exit(1)
  }

  console.log(`[worker] Iniciando. Poll a cada ${POLL_INTERVAL_MS}ms. Modelo: ${OLLAMA_MODEL}`)
  await resetStuckJobs()

  // Process immediately, then poll
  await processNextJob()
  setInterval(processNextJob, POLL_INTERVAL_MS)
}

main().catch((err) => {
  console.error('[worker] Erro fatal:', err)
  process.exit(1)
})
