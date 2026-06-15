# Tasks: IARIS Portfolio OS — MVP Completo

**Input**: Design documents from `specs/001-iaris-portfolio-os-mvp/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Tests**: Não solicitados — sem tarefas de teste automatizado. Validação via quickstart.md.

**Organization**: Tarefas agrupadas por user story para entrega e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: User story correspondente ([US1]–[US5])
- Todos os caminhos são relativos à raiz do repositório

---

## Phase 1: Setup (Infraestrutura Inicial)

**Purpose**: Scaffolding do projeto Next.js, dependências e configuração base.

- [x] T001 Inicializar projeto Next.js 14 com TypeScript em `./` via `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"` — scaffoldado via temp dir (Next.js 16.2.9 / React 19 / Tailwind 4)
- [x] T002 Instalar dependências: `@supabase/supabase-js @supabase/ssr @hello-pangea/dnd next-mdx-remote zod date-fns exceljs ts-node @types/node`
- [x] T003 [P] Configurar tokens do design system IARIS em `src/app/globals.css` — adaptado para Tailwind 4 CSS-first `@theme {}` (sem tailwind.config.ts); inclui bg-grid pattern 30px e classes de elevation tonal
- [x] T004 [P] Configurar fontes Hanken Grotesk, Plus Jakarta Sans e Geist em `src/app/layout.tsx` via `next/font/google`
- [x] T005 [P] Criar clientes Supabase: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (SSR com cookies), `src/lib/supabase/admin.ts` (service role — server-only)
- [x] T006 Criar utilitário de quarter em `src/lib/utils/quarter.ts` com `currentQuarter()`, `quarterLabel(date: Date)`, `quarterRange(label: string)` — formato `"Q2-2026"`, calendário Q1=Jan-Mar … Q4=Out-Dez
- [x] T007 [P] Criar utilitário WhatsApp em `src/lib/utils/whatsapp.ts` com `buildWhatsAppUrl(phone: string): string`
- [x] T007a [P] Criar `src/app/api/health/route.ts` retornando `{ status: 'ok', timestamp: new Date().toISOString() }` — usado pelo worker para verificar conectividade da API antes de iniciar o polling loop

**Checkpoint**: Projeto Next.js rodando em `http://localhost:3000`, Supabase conectado.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Banco de dados, autenticação, layout e design system — MUST complete antes de qualquer user story.

**⚠️ CRÍTICO**: Nenhuma user story pode ser iniciada sem esta fase completa.

### Banco de Dados

- [x] T008 Criar migration `supabase/migrations/0001_initial_schema.sql` com todas as 18 tabelas definidas em `data-model.md` (users, funnels, funnel_stages, startup_candidates, qualitative_assessments, panel_evaluation_forms, panel_evaluations, crm_activities, portfolio_startups, operational_assessments, assessment_items, assessment_criteria, okrs, metrics, action_plans, kanban_tasks, rituals, documents, portfolio_activities, ai_jobs, context_versions) com todos os campos, constraints e índices
- [x] T009 Criar migration `supabase/migrations/0002_seed_criteria.sql` com INSERT de todos os 38 critérios do framework IARIS extraídos da planilha `data/imports/assessment/Assessment-Evolucao-Startups-Iaris-v2 (1).xlsm` aba `Criterios-v2` (6 categorias: Estratégia, Produto, Distribuição, Mercado, Operação, Founder)
- [x] T010 Criar migration `supabase/migrations/0003_rls_and_triggers.sql` com: (a) RLS habilitado em todas as tabelas com política de acesso a usuários autenticados; (b) trigger `update_startup_last_update` que atualiza `portfolio_startups.last_update_at` ao INSERT/UPDATE em assessment_items, okrs, metrics, action_plans, kanban_tasks, rituals, documents, portfolio_activities, context_versions
- [x] T011 Rodar `npx supabase db reset` e gerar `src/types/supabase.ts` via `npx supabase gen types typescript --local > src/types/supabase.ts`

### Autenticação

- [x] T012 Implementar middleware de autenticação em `src/middleware.ts` com: proteção de todas as rotas `(app)` e `(admin)`, redirect para `/login` se sessão ausente, redirect para `/primeiro-acesso` se `users.must_change_password = true`
- [x] T013 Implementar Server Actions de auth em `src/lib/actions/auth.ts`: `login()`, `logout()`, `changePasswordFirstAccess()`, `inviteUser()` (admin only), `deactivateUser()` (admin only), `resetUserPassword()` (admin only)
- [x] T014 Construir página de login em `src/app/(auth)/login/page.tsx` com form e-mail/senha, error states, sem registro público
- [x] T015 Construir página de primeiro acesso em `src/app/(auth)/primeiro-acesso/page.tsx` com form de nova senha, validação de confirmação, redirect para `/` ao concluir

### Layout & Componentes UI Base

- [x] T016 Construir primitivos do design system em `src/components/ui/`: `Button.tsx` (variantes: primary teal 0px radius, secondary, ghost, danger), `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Select.tsx`, `Modal.tsx`, `Skeleton.tsx`
- [x] T017 Construir layout principal em `src/app/(app)/layout.tsx` com: barra de navegação lateral/superior com links "CRM" e "Portfólio", logo IARIS em `/assets/`, menu de usuário com logout, background Deep Navy `#000033` com grid 30px
- [x] T018 Construir página de gerenciamento de usuários em `src/app/(admin)/usuarios/page.tsx` com lista de usuários, botão "Convidar usuário" (admin only), opções de desativar e resetar senha
- [x] T018a [P] Construir página de detalhe do usuário em `src/app/(admin)/usuarios/[id]/page.tsx` com: formulário de edição de nome e role, botão de desativar conta, botão de reenviar convite/reset de senha — acesso restrito a `role = 'admin'`

**Checkpoint**: Login funciona, rotas protegidas, layout visível, banco com schema completo.

---

## Phase 3: User Story 1 — Gestão do Funil de Originação (Priority: P1) 🎯 MVP

**Goal**: CRM de originação completo — funis, etapas, candidatas no Kanban, avaliações e follow-ups.

**Independent Test**: Criar funil, cadastrar candidata, mover no Kanban, alterar resultado independente da etapa, criar avaliação IARIS, abrir WhatsApp Web. Ver quickstart.md Cenário 2 e 3.

### Server Actions

- [x] T019 [US1] Implementar Server Actions de funis em `src/lib/actions/funnels.ts`: `createFunnel()`, `updateFunnel()`, `archiveFunnel()`, `createStage()`, `reorderStages()`, `archiveStage()` — ao criar funil, inserir automaticamente as 8 etapas padrão
- [x] T019a [US1] Implementar Server Actions de templates de formulário de avaliação de banca em `src/lib/actions/funnels.ts` (adicionar às existentes): `createPanelEvaluationForm(funnelId, { name, criteria })`, `updatePanelEvaluationForm(id, data)`, `duplicatePanelEvaluationForm(id, targetFunnelId)` — template define quais critérios/perguntas a banca avalia; duplicação copia todos os critérios para nova edição do Investor Day; conforme contrato em `contracts/server-actions.md`
- [x] T020 [US1] Implementar Server Actions de candidatas (parte 1) em `src/lib/actions/candidates.ts`: `createCandidate()`, `updateCandidate()`, `moveStage()`, `setResult()`, `createActivity()`, `updateActivity()`, `saveQualitativeAssessment()` (UPSERT), `savePanelEvaluation()`, `updatePanelEvaluation()`

### Funis e Kanban

- [x] T021 [US1] Construir página de lista de funis em `src/app/(app)/crm/page.tsx` com cards de funil mostrando nome, status, totais por etapa, taxa de conversão, botão "Novo funil"
- [x] T022 [US1] Construir componente `KanbanBoard` em `src/components/crm/KanbanBoard.tsx` usando `@hello-pangea/dnd`: colunas por etapa, scroll horizontal, drag-and-drop chama `moveStage()` Server Action
- [x] T023 [US1] Construir componente `CandidateCard` em `src/components/crm/CandidateCard.tsx` mostrando: nome, vertical, fase, nota, badge de resultado (cor por tipo), próxima ação, responsável
- [x] T024 [US1] Construir página do funil em `src/app/(app)/crm/[funnel-id]/page.tsx` com: tabs "Kanban" / "Lista", cabeçalho do funil com status e ações, filtros na view de lista (etapa, resultado, vertical, fase, responsável)
- [x] T025 [P] [US1] Construir componente `StageManager` em `src/components/crm/StageManager.tsx` para criar/reordenar/arquivar etapas do funil (drag-and-drop de posição)
- [x] T025a [P] [US1] Construir componente `PanelEvaluationFormConfig` em `src/components/crm/PanelEvaluationFormConfig.tsx` com: lista de critérios do formulário de banca do funil (label, tipo, peso/nota máxima), adicionar/editar/remover critério, botão "Duplicar para nova edição" (chama `duplicatePanelEvaluationForm()`), exibido em aba "Configurações" na página do funil

### Página da Startup Candidata

- [x] T026 [US1] Construir página da startup candidata em `src/app/(app)/crm/[funnel-id]/candidatas/[id]/page.tsx` com: cabeçalho (nome, funil, etapa, resultado, vertical, fase, nota, responsável, último update, próxima ação), 9 blocos (dados básicos, etapa/resultado, contatos, histórico, avaliação qualitativa, avaliações de banca, documentos, atividades, ações rápidas)
- [x] T027 [P] [US1] Construir componente `QualitativeAssessmentForm` em `src/components/crm/QualitativeAssessmentForm.tsx` com 10 critérios CRM (Founder/Time, Clareza do problema, Produto, Distribuição/GTM, Tração, Mercado, Diferencial, Modelo de negócio, Investimento, Governança), sinais verde/amarelo/vermelho, campo recomendação — ⚠️ usa **3 sinais CRM** (verde/amarelo/vermelho), NÃO os 4 sinais emoji do AssessmentItem do portfólio (T052)
- [x] T028 [P] [US1] Construir componente `PanelEvaluationConsolidation` em `src/components/crm/PanelEvaluationConsolidation.tsx` mostrando: nota média, % aprovação, comentários principais, expansão para avaliações individuais
- [x] T029 [P] [US1] Construir componente `ActivityTimeline` em `src/components/crm/ActivityTimeline.tsx` com lista de atividades, badge de status, indicador visual de atraso (date < now() AND status não concluído/cancelado), formulário inline de nova atividade
- [x] T030 [P] [US1] Implementar ação "Enviar mensagem" WhatsApp na página da candidata: abre `https://wa.me/{phone}` em nova aba via `buildWhatsAppUrl()`, exibe aviso se WhatsApp não cadastrado

### Métricas do Funil

- [x] T031 [P] [US1] Construir página de métricas do funil em `src/app/(app)/crm/[funnel-id]/metricas/page.tsx` com: total no funil, por etapa, ganhas, perdidas, taxa de conversão, nota média, distribuição por vertical/fase, startups com MoU enviado, convertidas para portfólio

**Checkpoint**: US1 totalmente funcional — funil com Kanban, candidata com avaliações e atividades, WhatsApp Web, métricas.

---

## Phase 4: User Story 2 — Importação da Planilha do 4º Investor Day (Priority: P2)

**Goal**: Script CLI que importa todos os dados do 4º Investor Day de `data/imports/crm/investor-day-4/`.

**Independent Test**: `npx ts-node scripts/import-investor-day-4.ts` — log mostra total importado, alertas de duplicata, nenhuma entrada duplicada no banco. Ver quickstart.md Cenário 3 (passos 7-10).

- [x] T032 [US2] Inspecionar o arquivo `.xlsm` de candidatos em `data/imports/crm/investor-day-4/` via `exceljs` e mapear todas as abas consideradas (Startups, Framework IARIS — Avaliação Qualitativa, Legenda - Avaliação, Respostas ao formulário, Base_Respostas, Análise qualitativa, Contato) — documentar mapeamento de colunas no topo do script
- [x] T033 [US2] Criar script `scripts/import-investor-day-4.ts` com: (a) criação do funil "4º Investor Day IARIS Ventures" se não existir com as 8 etapas padrão; (b) importação de candidatas da aba `Startups` com mapeamento de colunas do PRD §10.2; (c) regra de status legado: Contrato→etapa "Contrato/MoU enviado"+resultado "Em aberto", "Startup avaliando"→etapa "Startup avaliando"+resultado "Em aberto", "2a Reunião"→etapa "2ª Reunião"+resultado "Em aberto", "Avaliação"→etapa "Avaliação"+resultado "Em aberto", "Recusa"→resultado "Perdida"+preservar status original em `import_note`
- [x] T034 [US2] Adicionar ao script de importação: (a) detecção de duplicatas por nome dentro do mesmo funil — alertar e pular sem criar; (b) importação de avaliações qualitativas da aba `Framework IARIS — Avaliação Qualitativa`; (c) importação de avaliações de banca das abas `Respostas ao formulário` e `Base_Respostas`; (d) importação de contatos da aba `Contato, quando aplicável`
- [x] T035 [US2] Adicionar ao script: log estruturado ao final com: total de candidatas importadas, total de avaliações, duplicatas ignoradas (lista de nomes), erros de mapeamento, duração da execução

**Checkpoint**: Script roda sem erros, dados do 4º Investor Day visíveis no CRM com etapas e resultados corretos.

---

## Phase 5: User Story 3 — Conversão de Candidata em Startup do Portfólio (Priority: P3)

**Goal**: Ação explícita que cria startup no portfólio a partir de candidata "Ganha", preservando vínculo histórico.

**Independent Test**: Abrir candidata com resultado "Ganha", executar conversão, verificar startup no portfólio com dados migrados e link bidirecional CRM↔Portfólio. Ver quickstart.md Cenário 4 (passos 1-5).

- [x] T036 [US3] Implementar Server Action `convertToPortfolio()` em `src/lib/actions/candidates.ts` (parte 2): validar `result === 'Ganha'` e `converted_portfolio_startup_id IS NULL`, INSERT em `portfolio_startups` com campos migrados (nome, site, vertical, fase, fundadores via contatos, captable, mrr, clientes, time, what_seeks, pitch_deck_url, general_note), UPDATE `startup_candidates.converted_portfolio_startup_id`, retornar `portfolioStartupId`
- [x] T037 [US3] Construir dialog de confirmação de conversão `ConvertToPortfolioDialog` em `src/components/crm/ConvertToPortfolioDialog.tsx` com: lista de dados que serão migrados, botão "Converter" e cancelar, estado de loading
- [x] T038 [US3] Na página da candidata: exibir botão "Converter em Startup do Portfólio" habilitado apenas quando `result === 'Ganha'` e não convertida; exibir badge "Convertida" + link direto para `portfolio/[id]/operacional` quando já convertida; bloquear nova conversão com aviso

**Checkpoint**: Candidata convertida aparece no portfólio, candidata mostra "Convertida" + link, double-conversion bloqueada.

---

## Phase 6: User Story 4 — Acompanhamento Operacional do Portfólio (Priority: P4)

**Goal**: Dashboard do portfólio e Página Operacional completa com todos os blocos, filtro por quarter.

**Independent Test**: Acessar dashboard, abrir startup do portfólio, criar Assessment (6 categorias com rubrica), OKR, métrica, tarefa no Kanban, mover tarefa, registrar atividade — tudo no quarter atual. Mudar quarter → blocos exibem dados corretos. Ver quickstart.md Cenário 4 (passos 6-13).

### Server Actions

- [x] T039 [US4] Implementar Server Actions de portfólio em `src/lib/actions/portfolio.ts`: `updatePortfolioProfile()`, `updateTierStatus()`, `uploadLogo()`
- [x] T039a [P] [US4] Implementar Server Actions de planos de ação em `src/lib/actions/action-plans.ts`: `createActionPlan(startupId, { okr_id, initiatives, owner, status, notes, quarter })`, `updateActionPlan(id, data)`, `deleteActionPlan(id)` — quarter obrigatório; quando `okr_id` presente, derivar quarter do OKR; dispara `last_update_at` na startup; conforme contrato em `contracts/server-actions.md`
- [x] T040 [P] [US4] Implementar Server Actions de assessments em `src/lib/actions/assessments.ts`: `createAssessment()`, `upsertAssessmentItem()` (UPSERT por assessment_id+category)
- [x] T041 [P] [US4] Implementar Server Actions de OKRs em `src/lib/actions/okrs.ts`: `createOKR()` (status padrão "Em andamento", quarter padrão = currentQuarter()), `updateOKR()`
- [x] T042 [P] [US4] Implementar Server Actions de métricas em `src/lib/actions/metrics.ts`: `upsertMetric()` (UPSERT por startup_id+quarter+type)
- [x] T043 [P] [US4] Implementar Server Actions de kanban em `src/lib/actions/kanban.ts`: `createTask()` (phase="Backlog", responsible=user logado), `updateTask()`, `moveTask()` (UPDATE phase)
- [x] T044 [P] [US4] Implementar Server Actions de rituais em `src/lib/actions/rituals.ts`: `createRitual()`, `updateRitual()`
- [x] T045 [P] [US4] Implementar Server Actions de documentos em `src/lib/actions/documents.ts`: `addDocument()`, `uploadDocument()` (bucket "documents")
- [x] T046 [P] [US4] Implementar Server Actions de atividades em `src/lib/actions/activities.ts`: `createPortfolioActivity()` (startup padrão = startup da página, responsible padrão = user logado), `updatePortfolioActivity()`

### Dashboard e Meu Kanban

- [x] T047 [US4] Construir dashboard do portfólio em `src/app/(app)/page.tsx` com: lista de startups (logo + nome, clique abre Página Operacional), "Minhas Atividades" (atividades do user logado com filtros), "Minhas Tarefas" (tarefas do user logado com filtros)
- [x] T048 [P] [US4] Construir página "Meu Kanban" em `src/app/(app)/meu-kanban/page.tsx` com: todas as tarefas do user logado de todas as startups, colunas por fase do Kanban, filtros por startup / fase / data de entrega / atrasadas, link direto para tarefa original na página da startup

### Perfil e Página Operacional

- [x] T049 [US4] Construir página de perfil da startup em `src/app/(app)/portfolio/[startup-id]/perfil/page.tsx` com seções: identificação básica, descrição do negócio, estágio, founders e contatos, investimento e cap table, links e documentos (upload via Supabase Storage); seção "Origem no CRM" exibida quando startup tem origem em candidatura — link para `crm/[funnel-id]/candidatas/[id]` via consulta `SELECT * FROM startup_candidates WHERE converted_portfolio_startup_id = ?` (satisfaz US3 Independent Test item (c): acesso bidirecional CRM↔Portfólio)
- [x] T050 [US4] Construir estrutura da Página Operacional em `src/app/(app)/portfolio/[startup-id]/operacional/page.tsx` com: seletor de quarter (padrão = currentQuarter()), passagem do quarter selecionado para todos os blocos via searchParams ou contexto
- [x] T051 [US4] Construir componente `OperationalHeader` em `src/components/portfolio/OperationalHeader.tsx` com: logo, nome da startup, link para perfil, editores inline de Tier (0-3), Status de Jornada e Engajamento, último update automático, última e próxima reunião (de rituals)

### Blocos da Página Operacional

- [x] T052 [US4] Construir componente `AssessmentForm` em `src/components/portfolio/AssessmentForm.tsx` com: um painel por categoria (Estratégia, Produto, Distribuição, Mercado, Operação, Founder), selector de sinal (🔴🟠🟡🟢), campos observed_evidence / risk_interpretation / next_focus / responsible / deadline, sidebar colapsável com rubricas de critérios (dados de `assessment_criteria`), UPSERT ao salvar
- [x] T053 [P] [US4] Construir componente `OKRSection` em `src/components/portfolio/OKRSection.tsx` com: lista de OKRs do quarter, formulário de criação (objetivo + key results + dono + status "Em andamento"), edição inline de status e progresso
- [x] T054 [P] [US4] Construir componente `MetricsSection` em `src/components/portfolio/MetricsSection.tsx` com: grid das 11 métricas padrão, valor atual e anterior, variação percentual com cor (verde/vermelho), campo de edição inline por métrica
- [x] T055 [P] [US4] Construir componente `ActionPlanSection` em `src/components/portfolio/ActionPlanSection.tsx` com: planos vinculados a OKRs do quarter, iniciativas com dono e status, formulário de adição — chama `createActionPlan()` / `updateActionPlan()` de `src/lib/actions/action-plans.ts` (T039a)
- [x] T056 [P] [US4] Construir componente `PortfolioKanban` em `src/components/portfolio/PortfolioKanban.tsx` com: Kanban do portfólio filtrado por quarter, 6 colunas (Backlog → Concluído), drag-and-drop chama `moveTask()`, `phase` = status (sem campo separado), formulário de nova tarefa
- [x] T057 [P] [US4] Construir componente `RitualsSection` em `src/components/portfolio/RitualsSection.tsx` com: lista de rituais/reuniões do quarter, campos tipo / data / participantes / notas / link externo (Granola), formulário de adição, datas exibidas em ordem cronológica
- [x] T058 [P] [US4] Construir componente `DocumentsSection` em `src/components/portfolio/DocumentsSection.tsx` com: lista de documentos filtrada por quarter, upload de arquivos para bucket "documents" (URL assinada 1h), adição de links externos, vínculo opcional com tarefa do Kanban
- [x] T059 [P] [US4] Construir componente `PortfolioActivitiesSection` em `src/components/portfolio/PortfolioActivitiesSection.tsx` com: lista de atividades filtrada por quarter, indicador de atraso, formulário inline de nova atividade (responsible padrão = user logado)

**Checkpoint**: US4 completamente funcional — dashboard, perfil, Página Operacional com todos os 8 blocos, filtro de quarter, Meu Kanban.

---

## Phase 7: User Story 5 — Resumo de Contexto por IA Local (Priority: P5)

**Goal**: Geração assíncrona de Resumo de Contexto via Ollama, com histórico de versões e edição manual.

**Independent Test**: Clicar "Atualizar Contexto" → job criado → worker processa → resumo aparece. Worker offline → job persiste. Editar manualmente → versão anterior preservada. Ver quickstart.md Cenário 5.

### UI — Bloco de Contexto

- [ ] T060 [US5] Implementar Server Action `requestContextUpdate()` em `src/lib/actions/ai-jobs.ts`: validar que startup tem dados suficientes (ao menos 1 entre okrs/metrics/portfolio_activities/operational_assessments no quarter atual), INSERT ai_jobs com status "Pendente", retornar jobId
- [ ] T061 [US5] Implementar Server Action `saveContextEdit()` em `src/lib/actions/ai-jobs.ts`: INSERT nova context_versions com `was_manually_edited = true`, preservar versão anterior
- [ ] T062 [US5] Construir componente `ContextSection` em `src/components/portfolio/ContextSection.tsx` com: exibição da última versão do contexto, botão "Atualizar Contexto" (chama `requestContextUpdate()`), status do job ("Pendente"/"Processando"/"Concluído"/"Erro"/"Aguardando worker"), editor de texto para edição manual, botão "Salvar edição", polling de status a cada 10s quando job ativo via `useEffect` + `router.refresh()`
- [ ] T063 [P] [US5] Construir componente `ContextHistory` em `src/components/portfolio/ContextHistory.tsx` com: lista de versões (data, modelo, versão do prompt, flag de edição manual), expansão para ver conteúdo de versão anterior, seleção de versão para exibir

### Worker IA

- [ ] T063a [US5] Criar `worker/package.json` com dependências do processo separado: `@supabase/supabase-js`, `node-fetch`, `dotenv`; criar `worker/.env.example` documentando todas as variáveis obrigatórias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `POLL_INTERVAL_MS`, `STUCK_JOB_TIMEOUT_MIN` — o worker NUNCA compartilha variáveis de ambiente com o Next.js; `.env.example` vai no git, `.env` do worker vai no `.gitignore`
- [ ] T064 [US5] Criar `worker/providers/ollama.js` com: `async fetchCompletion(prompt): Promise<string>` — POST para `http://localhost:11434/api/generate` com `{ model, prompt, stream: false, options: { temperature: 0.3, num_predict: 2048 } }`, timeout de 120s via AbortController, tratamento de todos os erros definidos em `contracts/ollama-contract.md`
- [ ] T065 [US5] Criar `worker/context-builder.js` com: `async buildStartupContext(supabase, startupId, quarter): Promise<object>` — busca dados da startup (perfil, assessments recentes, OKRs do quarter, métricas, 10 atividades recentes) conforme SQL em `contracts/worker-contract.md`
- [ ] T066 [US5] Criar `worker/prompt-template.js` com: `buildPrompt(startupContext): string` — template v1 definido em `contracts/worker-contract.md` (5 seções: Histórico, Avanços, Desafios, Métricas, Próximos pontos), `PROMPT_VERSION = "v1"`
- [ ] T067 [US5] Criar `worker/index.js` com: (a) conexão Supabase via service role key; (b) recuperação de stuck jobs na inicialização (UPDATE status='Pendente' onde 'Processando' há > 10min); (c) polling loop com `setInterval(POLL_INTERVAL_MS)` seguindo ciclo de vida completo de `contracts/worker-contract.md` (SELECT → UPDATE Processando → buildContext → buildPrompt → fetchCompletion → INSERT context_versions → UPDATE Concluído/Erro); (d) logging estruturado de cada etapa

**Checkpoint**: US5 funcional — geração via Ollama, jobs persistentes, edição manual, histórico de versões.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Wiki, estados de erro/loading, conformidade com design system, validação final.

- [ ] T068 Criar arquivos MDX da Wiki de Metodologia em `src/content/metodologia/`: `index.mdx` (visão geral da metodologia IARIS), `assessment.mdx` (guia do framework de Assessment com os 38 critérios e rubricas)
- [ ] T069 [P] Construir páginas da Wiki em `src/app/(app)/metodologia/[...slug]/page.tsx` com `next-mdx-remote`, estilização com design system, tabelas de critérios renderizadas como componentes
- [ ] T070 [P] Adicionar Skeleton loaders para todas as páginas com dados assíncronos (`src/components/ui/Skeleton.tsx` já criado no T016 — aplicar em todas as rotas)
- [ ] T071 [P] Adicionar Error Boundaries e estados de erro (`src/app/(app)/error.tsx`, `src/app/(app)/crm/error.tsx`, `src/app/(app)/portfolio/error.tsx`) com mensagem amigável e botão de retry
- [ ] T072 Revisar conformidade de design system em todas as telas: (a) fundo Deep Navy `#000033` em todas as camadas base; (b) botões primários Teal `#009999` com 0px border-radius; (c) ausência de `box-shadow` — substituir por variações de `background-color` para profundidade; (d) grid de 30px como background pattern; (e) fontes Hanken Grotesk em headings, Plus Jakarta Sans em body
- [ ] T073 Rodar `npx tsc --noEmit` e corrigir todos os erros de tipo
- [ ] T074 [P] Rodar `npm run lint` e corrigir todos os warnings de lint
- [ ] T075 Executar os 5 cenários de validação do `specs/001-iaris-portfolio-os-mvp/quickstart.md` e documentar resultado de cada etapa

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente
- **Foundational (Phase 2)**: Depende de Phase 1 completa — **BLOQUEIA todas as user stories**
- **US1 (Phase 3)**: Depende de Phase 2 completa — MVP mínimo
- **US2 (Phase 4)**: Depende de Phase 2 completa; independente de US1 (script CLI não usa componentes do CRM, apenas acessa o banco)
- **US3 (Phase 5)**: Depende de US1 completa (candidatas existem) e Phase 2
- **US4 (Phase 6)**: Depende de Phase 2 completa; US3 fornece dados iniciais mas US4 pode ser **construída** em paralelo com US1 — startups podem ser criadas diretamente no portfólio para testes. **⚠️ Constituição (Fase 3 após Fase 2)**: US1 DEVE estar funcionalmente completa e validada antes do **deploy em produção** de US4; o portfólio pressupõe CRM operacional para o fluxo de originação → conversão.
- **US5 (Phase 7)**: Depende de US4 completa (portfólio com dados)
- **Polish (Phase 8)**: Depende de todas as fases anteriores

### User Story Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational) ── BLOQUEIA TUDO
        ├── US1 (Phase 3)  🎯 MVP
        │     └── US3 (Phase 5)
        ├── US2 (Phase 4)  [independente]
        └── US4 (Phase 6)
              └── US5 (Phase 7)
```

### Parallel Opportunities Within Each Story

**US1 (Phase 3)** — após T019+T019a+T020:
- T021, T022, T025, T025a, T029, T030, T031 em paralelo (páginas e componentes independentes)

**US4 (Phase 6)** — após T039:
- T039a, T040–T046 em paralelo (Server Actions de domínios diferentes — arquivos separados)
- T047–T048 em paralelo (páginas independentes)
- T052–T059 em paralelo (componentes da Página Operacional)

**Polish (Phase 8)**:
- T069, T070, T071, T074 em paralelo

---

## Parallel Example: US4 — Server Actions

```bash
# Disparar todos os Server Actions de US4 simultaneamente (arquivos diferentes):
Task T039a: src/lib/actions/action-plans.ts
Task T040:  src/lib/actions/assessments.ts
Task T041:  src/lib/actions/okrs.ts
Task T042:  src/lib/actions/metrics.ts
Task T043:  src/lib/actions/kanban.ts
Task T044:  src/lib/actions/rituals.ts
Task T045:  src/lib/actions/documents.ts
Task T046:  src/lib/actions/activities.ts
```

## Parallel Example: US4 — Blocos da Página Operacional

```bash
# Após T050 (estrutura da página), disparar todos os blocos:
Task T053: src/components/portfolio/OKRSection.tsx
Task T054: src/components/portfolio/MetricsSection.tsx
Task T055: src/components/portfolio/ActionPlanSection.tsx
Task T056: src/components/portfolio/PortfolioKanban.tsx
Task T057: src/components/portfolio/RitualsSection.tsx
Task T058: src/components/portfolio/DocumentsSection.tsx
Task T059: src/components/portfolio/PortfolioActivitiesSection.tsx
```

---

## Implementation Strategy

### MVP Mínimo (US1 Only — Fases 1–3)

1. Completar Phase 1 (Setup)
2. Completar Phase 2 (Foundational) — **crítico, bloqueia tudo**
3. Completar Phase 3 (US1 — CRM)
4. **PARAR e VALIDAR**: Executar quickstart.md Cenários 1 e 2
5. Time já usa o sistema para gerenciar o funil do Investor Day

### Entrega Incremental

1. Setup + Foundational → banco + auth funcionando
2. US1 → CRM de candidatas com Kanban (**MVP funcional**)
3. US2 → Dados reais do 4º Investor Day importados
4. US3 → Conversão de candidatas para portfólio
5. US4 → Portfólio operacional completo
6. US5 → IA local gerando resumos de contexto
7. Polish → Design system, wiki, estados de erro

### Estratégia de Equipe (um dev)

Ordem sugerida: Phase 1 → Phase 2 → Phase 3 → Phase 4 (paralelo com Phase 3 na parte do script) → Phase 5 → Phase 6 → Phase 7 → Phase 8

---

## Notes

- **[P]** = arquivo diferente, sem dependência de task incompleta na mesma fase
- **[USx]** = rastreabilidade com user story da spec.md
- Commit após cada task ou grupo lógico (`git commit -m "T001 Initialize Next.js project"`)
- Rodar `npx supabase db reset` + regenerar tipos após qualquer mudança de migration
- `must_change_password` é verificado no middleware — nunca confiar apenas no frontend
- Worker deve rodar com `node worker/index.js` em processo separado, nunca dentro do Next.js
- `phase` do kanban_task É o status — nunca adicionar campo `status` separado (Constituição V)
- `QualitativeAssessment` (CRM, T027) usa 3 sinais; `AssessmentItem` (portfólio, T052) usa 4 sinais emoji — entidades distintas
- `panel_evaluation_forms` é o template/configuração por funil; `panel_evaluations` são as avaliações individuais dos membros da banca
- `action_plans` tem seu próprio arquivo de actions (`src/lib/actions/action-plans.ts`, T039a) — não está em `portfolio.ts`
- US4 pode ser desenvolvida antes de US1 estar completa, mas APENAS entra em produção depois de US1 validada (Constituição III: Fase 3 após Fase 2)
