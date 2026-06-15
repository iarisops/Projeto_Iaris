# Worker ↔ Supabase Contract

**Date**: 2026-06-14 | **Plan**: [plan.md](../plan.md)

O worker (`worker/index.js`) conecta ao Supabase diretamente com `SUPABASE_SERVICE_ROLE_KEY`.
Nunca chama as Server Actions do Next.js.

---

## Variáveis de ambiente do worker

```env
SUPABASE_URL=https://hcikthwtnillmmnvwtez.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
POLL_INTERVAL_MS=15000   # polling a cada 15s
STUCK_JOB_TIMEOUT_MIN=10 # jobs 'Processando' há mais de N min → resetar para 'Pendente'
```

---

## Ciclo de vida de um job

### 1. Inicialização do worker

```sql
-- Resetar jobs travados (Processando há > STUCK_JOB_TIMEOUT_MIN)
UPDATE ai_jobs
SET status = 'Pendente', started_at = NULL, error_message = 'Reset por reinício do worker'
WHERE status = 'Processando'
  AND started_at < now() - interval '10 minutes';
```

### 2. Polling — buscar próximo job

```sql
SELECT id, startup_id, requester_id, prompt_version
FROM ai_jobs
WHERE status = 'Pendente'
ORDER BY created_at ASC
LIMIT 1;
```

### 3. Marcar como Processando (antes de qualquer chamada Ollama)

```sql
UPDATE ai_jobs
SET status = 'Processando', started_at = now()
WHERE id = :jobId AND status = 'Pendente';
-- Verificar rowsAffected = 1 para evitar processamento duplo
```

### 4. Buscar contexto da startup

```sql
SELECT
  ps.*,
  (SELECT json_agg(o) FROM okrs o WHERE o.startup_id = ps.id
   AND o.quarter = :currentQuarter) AS okrs,
  (SELECT json_agg(m) FROM metrics m WHERE m.startup_id = ps.id
   AND m.quarter = :currentQuarter) AS metrics,
  (SELECT json_agg(a) FROM portfolio_activities a WHERE a.startup_id = ps.id
   ORDER BY a.date DESC LIMIT 10) AS recent_activities,
  (SELECT json_agg(oa) FROM operational_assessments oa
   LEFT JOIN assessment_items ai ON ai.assessment_id = oa.id
   WHERE oa.startup_id = ps.id
   ORDER BY oa.created_at DESC LIMIT 2) AS recent_assessments
FROM portfolio_startups ps
WHERE ps.id = :startupId;
```

### 5. Chamar Ollama (ver [ollama-contract.md](ollama-contract.md))

### 6a. Sucesso — inserir versão e fechar job

```sql
INSERT INTO context_versions
  (startup_id, ai_job_id, content, model, prompt_version)
VALUES
  (:startupId, :jobId, :generatedContent, :model, :promptVersion);

UPDATE ai_jobs
SET status = 'Concluído', completed_at = now()
WHERE id = :jobId;

-- Disparar last_update_at (via trigger Postgres já configurado)
```

### 6b. Erro — registrar e fechar job

```sql
UPDATE ai_jobs
SET status = 'Erro',
    completed_at = now(),
    error_message = :errorMessage
WHERE id = :jobId;
```

---

## Validação de dados suficientes (pré-job)

O worker verifica antes de chamar Ollama:
- `portfolio_startups` tem `name` e pelo menos um de: `short_description`, `problem`, `solution`
- Pelo menos um registro entre: `okrs`, `metrics`, `portfolio_activities`, `operational_assessments`

Se não houver dados suficientes → marcar job como `'Erro'` com mensagem
`"Dados insuficientes para gerar contexto"`.

---

## Estrutura do prompt (v1)

```
Você é um assistente da IARIS Venture Builder preparando um resumo de contexto
para uma reunião com a startup {name}.

## Perfil
{short_description}
Segmento: {segment} | Fase: {stage} | Tier: {tier}

## Assessment recente
{assessment_items por categoria com sinal e observação}

## OKRs do quarter {quarter}
{lista de objetivos e key results com status}

## Métricas
{MRR, Clientes ativos, Churn etc. com variação}

## Atividades recentes (últimas 10)
{data, tipo, status, notas}

## Gere um Resumo de Contexto com as seções:
1. Histórico e Jornada
2. Avanços recentes
3. Desafios e riscos
4. Métricas-chave
5. Próximos pontos de atenção
```

`prompt_version = "v1"` — incrementar ao alterar a estrutura do prompt.
