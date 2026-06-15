# Worker ↔ Ollama Contract

**Date**: 2026-06-14 | **Plan**: [plan.md](../plan.md)

Interface abstraída em `worker/providers/ollama.js`.
Trocar o provider (OpenAI, Anthropic, OpenRouter) = reescrever apenas este arquivo.

---

## Interface do provider

```javascript
// worker/providers/ollama.js

/**
 * @param {string} prompt - Prompt completo montado pelo worker
 * @returns {Promise<string>} - Texto gerado pelo modelo
 * @throws {Error} - Em caso de falha na API ou timeout
 */
async function fetchCompletion(prompt) { ... }

module.exports = { fetchCompletion };
```

---

## Chamada HTTP ao Ollama

**Endpoint**: `POST http://localhost:11434/api/generate`

**Request**:
```json
{
  "model": "qwen2.5:14b",
  "prompt": "<prompt completo>",
  "stream": false,
  "options": {
    "temperature": 0.3,
    "num_predict": 2048
  }
}
```

**Response** (Ollama API):
```json
{
  "model": "qwen2.5:14b",
  "response": "<texto gerado>",
  "done": true,
  "total_duration": 12345678,
  "eval_count": 512
}
```

O worker extrai `response.response` como o conteúdo gerado.

---

## Tratamento de erros

| Situação | Ação do worker |
|----------|----------------|
| Ollama offline (ECONNREFUSED) | Lançar Error("Ollama offline") → job → 'Erro' |
| Timeout (> 120s) | AbortController → Error("Timeout Ollama") → job → 'Erro' |
| response.done = false | Error("Geração incompleta") → job → 'Erro' |
| response.response vazio | Error("Resposta vazia do modelo") → job → 'Erro' |

---

## Como trocar o provider no futuro

Para usar OpenAI em vez de Ollama, criar `worker/providers/openai.js` com a mesma
assinatura `fetchCompletion(prompt): Promise<string>` e alterar o require em
`worker/index.js`:

```javascript
// Antes
const { fetchCompletion } = require('./providers/ollama');

// Depois (troca de provider — zero mudanças no código de produto)
const { fetchCompletion } = require('./providers/openai');
```

Nenhuma mudança em Supabase, Next.js, UI ou histórico de contexto.
