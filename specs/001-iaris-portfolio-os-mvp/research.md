# Research: IARIS Portfolio OS — MVP Completo

**Phase**: 0 | **Date**: 2026-06-14 | **Plan**: [plan.md](plan.md)

Todas as decisões técnicas relevantes para o planejamento, com rationale e alternativas
consideradas. Nenhum item "NEEDS CLARIFICATION" permanece após a fase de clarificação.

---

## 1. Next.js App Router — Server Actions para mutações

**Decision**: Todas as mutações (criar, editar, deletar) usam **Server Actions** do Next.js
14 App Router. Sem API routes para uso interno do frontend.

**Rationale**: Server Actions executam no servidor (sem round-trip separado), suportam
revalidação de cache nativa (`revalidatePath`/`revalidateTag`), e eliminam a necessidade
de endpoints REST intermediários. A validação Zod roda no servidor antes de qualquer
acesso ao banco.

**Alternatives considered**:
- API Routes (Route Handlers): mais verboso, requer fetch explícito no cliente, sem
  integração nativa com revalidação de cache do App Router.
- tRPC: adiciona complexidade de setup sem ganho justificado para equipe pequena interna.

---

## 2. Supabase Auth + SSR — autenticação no App Router

**Decision**: `@supabase/ssr` com cookies para gerenciar sessão entre Server Components,
Client Components e Server Actions. Três clientes: `browser` (componentes cliente),
`server` (Server Components/Actions com cookies), `admin` (service role — exclusivo do
servidor, nunca exposto ao browser).

**Rationale**: `@supabase/ssr` é a abordagem oficial do Supabase para Next.js App Router.
Mantém a sessão JWT em cookies HTTPOnly, compatível com middleware de proteção de rotas.

**Session policy**: JWT com `jwtExpiresIn = 7d` (Supabase Auth padrão ajustado). Sem MFA.

**First access**: Ao criar usuário via Admin API (`supabase.auth.admin.inviteUserByEmail`),
o usuário recebe e-mail de convite. O flag `must_change_password` na tabela `users` força
redirect para `/primeiro-acesso` até a troca ser concluída (Server Action chama
`supabase.auth.updateUser({ password })`).

**Alternatives considered**:
- NextAuth.js: suporte ao Supabase é indireto, requer adapter customizado.
- Supabase Auth com `@supabase/auth-helpers-nextjs` (deprecado): substituído pelo `@supabase/ssr`.

---

## 3. Kanban drag-and-drop

**Decision**: `@hello-pangea/dnd` (fork mantido de react-beautiful-dnd).

**Rationale**: API familiar, bem documentada, sem breaking changes em relação ao
react-beautiful-dnd. `dnd-kit` tem curva maior para o padrão de colunas verticais
com scroll horizontal. Ambos suportam touch — relevante se o time usar tablets.

**Alternatives considered**:
- `dnd-kit`: mais flexível, porém API mais verbosa para Kanban padrão.
- HTML5 Drag and Drop nativo: sem feedback visual de placeholder, difícil de implementar
  com a experiência esperada.

---

## 4. Importação do 4º Investor Day (.xlsm)

**Decision**: Script CLI TypeScript (`scripts/import-investor-day-4.ts`) usando `exceljs`.
Executado uma única vez com `npx ts-node scripts/import-investor-day-4.ts`.

**Rationale**: O arquivo em `/data/imports/crm/investor-day-4/` é um `.xlsm` (Excel com
macros). `exceljs` lê `.xlsm` nativamente sem depender de COM objects ou Office instalado.
Script produz log de execução (total importado, alertas de duplicata, erros de mapeamento).

**Alternatives considered**:
- `xlsx` (SheetJS): lê `.xlsm`, mas a versão community não suporta escrita de estilos
  (irrelevante aqui) e tem licença comercial restrita para alguns usos.
- Seed SQL direto: requer conversão manual para SQL, perda da lógica de mapeamento de
  status legado.

---

## 5. Wiki de Metodologia — MDX estático

**Decision**: Arquivos `.mdx` em `src/content/metodologia/` renderizados via
`next-mdx-remote` no App Router.

**Rationale**: Conteúdo muda raramente; versionado via git; sem CMS necessário no MVP.
`next-mdx-remote` permite MDX em Server Components com componentes customizados (tabelas,
callouts do design system).

**Alternatives considered**:
- `@next/mdx`: requer configuração no `next.config.js`, menos flexível para conteúdo
  fora do diretório `app/`.
- CMS headless: over-engineering para MVP com equipe pequena e conteúdo estático.

---

## 6. Quarter — cálculo e representação

**Decision**: Quarter representado como string `"Q1-2026"`, `"Q2-2026"` etc.
Calendário: Q1=Jan-Mar, Q2=Abr-Jun, Q3=Jul-Set, Q4=Out-Dez.
Utilitário em `src/lib/utils/quarter.ts`: `currentQuarter()`, `quarterLabel(date)`,
`quarterRange(label)`.

**Rationale**: String legível evita ambiguidade de timezone. Facilita agrupamento SQL
(`WHERE quarter = 'Q2-2026'`). Confirmado na spec (Assumption: "Q1: jan-mar, Q2: abr-jun,
Q3: jul-set, Q4: out-dez").

---

## 7. Worker de IA — arquitetura de polling

**Decision**: Worker usa **polling com backoff exponencial** via `setInterval` + lógica de
retry. Conecta ao Supabase com `SUPABASE_SERVICE_ROLE_KEY` diretamente — sem passar pela
API do Next.js.

Fluxo:
1. SELECT de `ai_jobs` WHERE `status = 'Pendente'` ORDER BY `created_at` ASC LIMIT 1
2. UPDATE status para `'Processando'`, set `started_at = now()`
3. Buscar dados da startup (portfólio, OKRs, métricas, assessment, kanban)
4. Montar prompt e chamar `providers/ollama.js → fetchCompletion(prompt)`
5. INSERT em `context_versions`; UPDATE `ai_jobs` status para `'Concluído'`
6. Em caso de erro: UPDATE `ai_jobs` status para `'Erro'`, set `error_message`

**Offline resilience**: Jobs com `status = 'Pendente'` persistem. O worker retoma ao
reiniciar sem ação manual. Jobs com `status = 'Processando'` por mais de 10 min são
resetados para `'Pendente'` (stuck-job recovery no start do worker).

**Rationale**: Polling simples é mais robusto offline do que Supabase Realtime
(que requer conexão WebSocket ativa). Para volume baixo (dezenas de jobs), o overhead
é negligenciável.

---

## 8. Ollama — integração

**Decision**: HTTP REST API local em `http://localhost:11434/api/generate`.
Provider em `worker/providers/ollama.js` com interface `fetchCompletion(prompt: string): Promise<string>`.

**Modelo padrão**: `qwen2.5:14b` ou `llama3.1:8b` (configurável via env `OLLAMA_MODEL`).

**Alternatives considered**:
- Mistral / Gemma: comparáveis em qualidade para português, todos suportados pelo Ollama.
- OpenRouter / Anthropic: fora do escopo MVP (custo variável por token).

---

## 9. RLS (Row Level Security) — estratégia

**Decision**: RLS habilitado em todas as tabelas. Política base: usuário autenticado tem
acesso de leitura/escrita a todos os registros (ferramenta interna, sem isolamento por
usuário). Exceção: `users` — leitura pública para todos autenticados, escrita restrita
ao próprio registro ou a `role = 'admin'`.

**Rationale**: Sem multi-tenancy no MVP; todos os usuários internos acessam todos os
dados. RLS serve como camada de proteção contra acesso não autenticado, não como
isolamento entre usuários.

---

## 10. Supabase Storage — documentos e logos

**Decision**: Bucket `documents` (privado, acesso via URL assinada) para documentos de
startups. Bucket `logos` (público) para logos das startups do portfólio.

**Rationale**: Logos são imagens públicas referenciadas no frontend sem autenticação.
Documentos podem conter informações sensíveis — URL assinada com TTL de 1h.

---

## 11. Geração de tipos TypeScript do Supabase

**Decision**: Tipos gerados via `npx supabase gen types typescript --project-id <id>`
e salvos em `src/types/supabase.ts`. Regenerar após cada migration.

**Rationale**: Tipagem end-to-end das queries sem overhead de ORM. Integra nativamente
com o Supabase JS client.

---

## 12. Assessment criteria — dados de referência

**Decision**: Os 38 critérios do framework IARIS (planilha `Critério-v2`) são semeados
via migration SQL `0002_seed_criteria.sql`. Não editáveis pelo usuário.
Exibidos como rubrica de consulta durante o preenchimento do Assessment.

**Rationale**: São dados metodológicos estáveis (mudam raramente). Semeá-los no banco
permite consultá-los via query junto com os `assessment_items` sem hardcode no frontend.
