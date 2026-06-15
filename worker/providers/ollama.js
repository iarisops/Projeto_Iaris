const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b'

async function fetchCompletion(prompt) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120_000)

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Ollama HTTP ${response.status}: ${body}`)
    }

    const data = await response.json()
    return { text: data.response, model: OLLAMA_MODEL }
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = { fetchCompletion, OLLAMA_MODEL }
