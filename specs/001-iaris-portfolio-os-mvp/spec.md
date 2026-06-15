# Feature Specification: IARIS Portfolio OS — MVP Completo

**Feature Branch**: `001-iaris-portfolio-os-mvp`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Focar no MVP completo e funcional definido"

## User Scenarios & Testing *(mandatory)*

<!--
  User stories ordered by delivery priority. Each story is independently testable
  and delivers standalone value. All stories combined constitute the complete MVP.
-->

### User Story 1 — Gestão do Funil de Originação / Investor Day (Priority: P1)

Um membro da equipe IARIS precisa gerenciar o funil de startups candidatas de uma edição
do Investor Day — visualizando candidatas em Kanban por etapa, registrando resultado/desfecho
separado da etapa, criando avaliações qualitativas e de banca, e registrando atividades e
follow-ups — para que o processo de originação seja centralizado e auditável, substituindo
planilhas e anotações dispersas.

**Why this priority**: Ponto de entrada do produto; sem o CRM funcionando, não há dados
para o portfólio. O funil do 4º Investor Day já tem dados reais que precisam ser usados.

**Independent Test**: O tester cria um funil, configura etapas, cadastra uma startup
candidata, move entre etapas no Kanban, altera resultado para "Perdida" sem mudar a etapa,
registra uma atividade e abre WhatsApp Web — tudo sem sair do sistema.

**Acceptance Scenarios**:

1. **Given** um funil existe com etapas configuradas, **When** o usuário abre o Kanban,
   **Then** cada etapa aparece como coluna e cada candidata como card mostrando nome,
   vertical, fase, nota, resultado e próxima ação.
2. **Given** uma candidata está na etapa "Avaliação", **When** o usuário altera o resultado
   para "Perdida", **Then** o resultado é atualizado e a etapa permanece "Avaliação" — os
   dois campos são independentes.
3. **Given** uma candidata tem WhatsApp cadastrado, **When** o usuário aciona "Enviar
   mensagem", **Then** o WhatsApp Web abre com o número correto sem enviar nada
   automaticamente.
4. **Given** o usuário cria uma avaliação qualitativa IARIS com sinais e recomendação,
   **When** salva, **Then** o resultado consolidado aparece na página da candidata.
5. **Given** existem múltiplas avaliações de banca para uma candidata, **When** o usuário
   acessa a página da candidata, **Then** nota média, percentual de aprovação e principais
   comentários são exibidos de forma consolidada, com opção de expandir para avaliações
   individuais.

---

### User Story 2 — Importação da Planilha do 4º Investor Day (Priority: P2)

Um membro da equipe IARIS precisa importar todos os dados da planilha existente do
4º Investor Day para o sistema — mapeando candidatas, avaliações qualitativas, avaliações
de banca e contatos — para que o sistema comece com dados reais sem entrada manual.

**Why this priority**: Sem a importação, o time precisaria recriar os dados manualmente.
É bloqueante para validar o produto com contexto real.

**Independent Test**: O tester dispara a importação da planilha do 4º Investor Day e
verifica que todas as candidatas aparecem no funil correto com etapas e resultados mapeados
conforme as regras de status legado, e as avaliações associadas estão visíveis.

**Acceptance Scenarios**:

1. **Given** a planilha é importada, **When** o status legado é "Contrato", **Then** a
   candidata recebe etapa "Contrato/MoU enviado" e resultado "Em aberto".
2. **Given** a planilha é importada, **When** o status legado é "Recusa", **Then** a
   candidata recebe resultado "Perdida" e o status original é preservado em nota de
   importação quando a etapa não puder ser determinada.
3. **Given** a importação é executada, **When** o processo conclui, **Then** as abas
   Startups, Avaliação Qualitativa, Respostas ao formulário, Base_Respostas, Análise
   qualitativa e Contato estão representadas; a aba "Agenda-PitchDay" é ignorada.
4. **Given** a importação encontra uma startup duplicada (mesmo nome no mesmo funil),
   **When** o processo é executado, **Then** o sistema alerta sobre duplicata e não cria
   registros duplicados.

---

### User Story 3 — Conversão de Candidata em Startup do Portfólio (Priority: P3)

Um membro da equipe IARIS precisa converter uma startup candidata com resultado "Ganha"
em uma startup do portfólio — criando o perfil no módulo de portfólio com dados migrados
e preservando o vínculo com o histórico do CRM — para que haja um registro auditável da
transição sem perda de contexto.

**Why this priority**: É a ponte entre os dois módulos principais. Sem essa ação explícita,
não há como popular o portfólio.

**Independent Test**: O tester abre uma candidata com resultado "Ganha", executa "Converter
em Startup do Portfólio", e verifica que (a) a startup aparece no módulo de portfólio com
dados migrados, (b) a candidata fica marcada como "Convertida" com link para o portfólio,
e (c) é possível acessar o histórico do CRM a partir da startup do portfólio.

**Acceptance Scenarios**:

1. **Given** uma candidata tem resultado "Ganha", **When** o usuário executa "Converter em
   Startup do Portfólio", **Then** um perfil é criado no portfólio com nome, site, vertical,
   fase, contatos, captable e outros dados relevantes migrados da candidatura.
2. **Given** a conversão foi executada, **When** o usuário acessa a candidata original no
   CRM, **Then** ela está marcada como "Convertida" com link direto para a startup do
   portfólio.
3. **Given** uma candidata já foi convertida, **When** o usuário tenta converter novamente,
   **Then** o sistema bloqueia a ação e exibe aviso informando que a candidata já foi
   convertida.
4. **Given** uma candidata tem resultado diferente de "Ganha", **When** o usuário acessa
   a ação "Converter em Startup do Portfólio", **Then** a ação está desabilitada ou
   inacessível.

---

### User Story 4 — Acompanhamento Operacional do Portfólio (Priority: P4)

Um membro da equipe IARIS precisa acompanhar cada startup do portfólio através de uma
Página Operacional centralizada — com Assessment trimestral, OKRs, métricas, plano de
ação, Kanban de tarefas, rituais/reuniões, documentos e atividades, todos filtráveis por
quarter — para que possa preparar reuniões, registrar evoluções e reportar progresso sem
buscar em múltiplas ferramentas.

**Why this priority**: Coração do produto; a maioria dos usuários passará mais tempo na
Página Operacional do que em qualquer outra área.

**Independent Test**: O tester acessa a Página Operacional de uma startup do portfólio,
cria um Assessment, adiciona um OKR, atualiza uma métrica, cria tarefa no Kanban, move a
tarefa entre fases e registra uma atividade — tudo dentro do quarter atual.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a Página Operacional, **When** a página carrega, **Then**
   exibe Tier, Status de Jornada, Engajamento, último update automático e o quarter atual
   como filtro padrão.
2. **Given** um OKR é criado para o quarter atual, **When** salvo, **Then** aparece em
   Objetivos e Indicadores com status "Em andamento" e quarter correto.
3. **Given** o usuário move uma tarefa de "A fazer" para "Em andamento" no Kanban,
   **When** a movimentação ocorre, **Then** o status da tarefa reflete apenas a fase do
   Kanban (sem campo de status separado) e o último update automático da startup é
   atualizado.
4. **Given** o usuário muda o filtro para um quarter anterior, **When** aplicado, **Then**
   Assessment, OKRs, Métricas, Plano de Ação, Kanban, Rituais e Atividades exibem apenas
   dados do período selecionado.
5. **Given** uma tarefa foi criada na Página Operacional de uma startup, **When** o usuário
   acessa "Meu Kanban" na página inicial, **Then** a tarefa aparece com startup vinculada e
   responsável padrão sendo o usuário logado.

---

### User Story 5 — Resumo de Contexto por IA Local (Priority: P5)

Um membro da equipe IARIS precisa gerar um Resumo de Contexto atualizado para qualquer
startup do portfólio usando IA local sem custo por geração — consolidando histórico,
avanços, desafios, métricas e próximos pontos de atenção — para que possa se preparar
para reuniões em segundos sem depender de memória individual ou busca manual.

**Why this priority**: Diferencial estratégico do produto. Depende das fases anteriores —
dados precisam existir para que o resumo seja útil.

**Independent Test**: O tester clica em "Atualizar Contexto" em uma startup do portfólio
com dados cadastrados, aguarda o processamento pelo worker local, e verifica que o novo
resumo aparece com as seções esperadas (histórico, avanços, desafios, métricas, próximos
pontos de atenção).

**Acceptance Scenarios**:

1. **Given** o usuário clica em "Atualizar Contexto", **When** o botão é acionado, **Then**
   uma solicitação é criada com status "Pendente" e o sistema exibe "Contexto enviado para
   geração".
2. **Given** o worker local está online e há job pendente, **When** o worker processa o job,
   **Then** novo Resumo de Contexto é gerado e salvo, o job muda para "Concluído" e a
   interface exibe o novo resumo.
3. **Given** o worker local está offline, **When** o usuário solicita geração, **Then** o
   job persiste com status "Pendente" e a interface exibe "Aguardando processamento pelo
   worker de IA" — a solicitação não é perdida.
4. **Given** um resumo foi gerado, **When** o usuário edita manualmente o conteúdo e salva,
   **Then** a edição é persistida com flag `was_manually_edited` verdadeiro, preservando
   versões anteriores.
5. **Given** múltiplas versões do resumo existem, **When** o usuário acessa o histórico de
   versões, **Then** cada versão exibe data de geração, modelo utilizado e versão do prompt.

---

### Edge Cases

- O que acontece se uma candidata com resultado diferente de "Ganha" recebe a ação de
  conversão? → O sistema DEVE bloquear e exibir aviso.
- O que acontece se uma métrica não tem valor anterior? → Exibir valor atual sem variação
  percentual; não bloquear a exibição.
- O que acontece se dois usuários editam a mesma candidata simultaneamente? → No MVP,
  last-write-wins; conflito complexo é fora de escopo.
- O que acontece se a importação da planilha encontra candidata duplicada? → Sistema alerta
  e não cria duplicata.
- O que acontece se o worker encontra job sem dados suficientes para gerar resumo? → Job
  muda para status "Erro" com mensagem descritiva; usuário pode tentar novamente.
- O que acontece se o usuário tenta gerar contexto para uma startup sem dados? → Sistema
  DEVE informar que não há dados suficientes antes de criar o job.

---

## Clarifications

### Session 2026-06-14

- Q: Como usuários são provisionados no sistema? → A: Híbrido — painel admin in-app cria o usuário e dispara convite por e-mail; usuário obrigatoriamente troca a senha no primeiro acesso.
- Q: Qual o mecanismo de importação da planilha do 4º Investor Day? → A: Script CLI Node.js executado uma única vez pelo dev — sem UI de importação na aplicação.
- Q: Qual a estrutura do OperationalAssessment trimestral? → A: Framework IARIS fixo com 4 sinais (🔴🟠🟡🟢) e 6 categorias (Estratégia, Produto, Distribuição, Mercado, Operação, Founder); cada categoria recebe sinal + texto livre (evidência observada, interpretação do risco, próximo foco, responsável, prazo); critérios detalhados por categoria servem como rubrica de referência para quem avalia; framework NÃO é configurável pelo usuário.
- Q: Política de sessão e MFA no MVP? → A: Sem MFA; sessão expira após inatividade (configurável via Supabase Auth — padrão 7 dias).
- Q: Como o conteúdo da Wiki de Metodologia é gerenciado? → A: Hardcoded no repositório (arquivos MDX/HTML) — dev atualiza; sem CMS ou interface de edição no MVP.

---

## Requirements *(mandatory)*

### Functional Requirements

**Base e Autenticação**

- **FR-001**: O sistema DEVE permitir que usuários autorizados façam login com e-mail e
  senha, e DEVE proteger todas as rotas contra acesso não autenticado. Sem MFA no MVP.
  Sessão DEVE expirar após período de inatividade (padrão: 7 dias, configurável via
  Supabase Auth).
- **FR-001a**: O sistema DEVE disponibilizar painel de gerenciamento de usuários (criar,
  desativar, redefinir senha) acessível apenas a usuários com papel `Administrador`.
- **FR-001b**: Ao criar um usuário, o sistema DEVE disparar e-mail de convite com link
  de primeiro acesso; o usuário DEVE ser forçado a trocar a senha antes de prosseguir.
- **FR-002**: O sistema DEVE exibir navegação principal entre CRM de Originação e Gestão
  de Portfólio, acessível de qualquer tela.
- **FR-003**: O sistema DEVE registrar o usuário logado como responsável padrão em
  atividades e tarefas criadas sem responsável explícito.

**CRM de Originação / Investor Day**

- **FR-004**: O sistema DEVE permitir criar, editar e arquivar funis (edições do Investor
  Day) com nome, descrição, edição, status (Ativo/Encerrado/Arquivado) e datas de início
  e fim.
- **FR-005**: O sistema DEVE permitir configurar etapas por funil (nome, posição,
  flags: padrão, final, arquivada).
- **FR-006**: O sistema DEVE permitir cadastrar e editar startups candidatas com todos os
  campos definidos (nome, site, vertical, fase, nota, captable, MRR, clientes, time, o que
  busca, WhatsApp, e-mail, notas, links, responsável interno, próxima ação).
- **FR-007**: O sistema DEVE exibir o Kanban do funil com colunas por etapa e cards por
  candidata, mostrando nome, vertical, fase, nota, resultado e próxima ação.
- **FR-008**: O sistema DEVE permitir mover candidatas entre etapas via Kanban.
- **FR-009**: O sistema DEVE manter resultado/desfecho (Em aberto / Ganha / Perdida /
  Acompanhar futuramente) como campo INDEPENDENTE da etapa em startups candidatas.
- **FR-010**: O sistema DEVE permitir registrar, editar e listar atividades/follow-ups por
  startup candidata, com tipo, data, responsável, status e nota.
- **FR-011**: O sistema DEVE calcular atraso de atividades automaticamente pela data.
- **FR-012**: O sistema DEVE abrir WhatsApp Web com número cadastrado da candidata ao
  acionar "Enviar mensagem", sem enviar automaticamente; DEVE exibir aviso quando não
  há número cadastrado.
- **FR-013**: O sistema DEVE permitir criar e editar avaliação qualitativa IARIS por
  candidata, com sinais (verde/amarelo/vermelho) por critério e recomendação (Investor Day
  / Potencial / Não avançar).
- **FR-014**: O sistema DEVE permitir importar e editar avaliações de banca/formulário e
  exibir consolidação (nota média, aprovação, comentários principais) na página da candidata,
  com expansão para avaliações individuais.
- **FR-015**: O sistema DEVE permitir configurar formulário de avaliação de banca por funil,
  possibilitando duplicação para edições futuras.
- **FR-016**: O sistema DEVE exibir métricas por funil (total, por etapa, taxa de conversão,
  nota média, distribuição por vertical e fase, startups com MoU enviado, conversões para
  portfólio).
- **FR-017**: A importação dos dados do 4º Investor Day DEVE ser realizada via script CLI
  Node.js executado uma única vez pelo dev (sem UI de importação na aplicação), lendo os
  arquivos em `/data/imports/crm/investor-day-4/`, aplicando as regras de mapeamento e
  status legado do PRD §10, ignorando a aba "Agenda-PitchDay" e alertando sobre duplicatas
  sem criá-las. O script DEVE registrar log da execução (total importado, alertas, erros).
- **FR-018**: O sistema DEVE permitir converter startup candidata com resultado "Ganha" em
  startup do portfólio via ação explícita "Converter em Startup do Portfólio", impedindo
  conversão duplicada e bloqueando a ação para candidatas com resultado diferente de "Ganha".

**Gestão Operacional do Portfólio**

- **FR-019**: O sistema DEVE exibir página inicial com lista de startups do portfólio com
  logo e nome, atividades do usuário logado e suas tarefas, com filtros por startup, status
  e data.
- **FR-020**: O sistema DEVE permitir cadastrar e editar o Perfil da Startup (identificação,
  descrição do negócio, estágio, founders, investimento, cap table, links e documentos).
- **FR-021**: O sistema DEVE exibir a Página Operacional com cabeçalho (Tier, Status de
  Jornada, Engajamento, último update automático, última e próxima reunião), filtro de
  período (padrão: quarter atual), e blocos na ordem: Resumo de Contexto → Objetivos e
  Indicadores (Assessment → OKRs → Métricas → Plano de Ação) → Kanban → Rituais →
  Documentos/Evidências → Atividades de Relacionamento.
- **FR-022**: O sistema DEVE atualizar "último update" da startup automaticamente ao
  detectar eventos relevantes (alteração de Tier/Status/Engajamento, novo Assessment,
  OKR criado/editado, métrica atualizada, tarefa movida, reunião adicionada, atividade
  criada, documento adicionado, Resumo de Contexto atualizado).
- **FR-023**: O sistema DEVE permitir criar, editar e vincular Assessments trimestrais a
  uma startup, com sugestão automática do quarter atual e opção de alterar. O Assessment
  segue o framework IARIS fixo: 6 categorias (Estratégia, Produto, Distribuição, Mercado,
  Operação, Founder), cada uma com sinal obrigatório (🔴 Vermelho / 🟠 Laranja /
  🟡 Amarelo / 🟢 Verde) e campos de texto livre (evidência observada, interpretação do
  risco, próximo foco, responsável, prazo). As rubricas por critério dentro de cada
  categoria são exibidas como guia durante o preenchimento. A estrutura é fixa — não
  configurável pelo usuário.
- **FR-024**: O sistema DEVE permitir criar, editar e acompanhar OKRs por startup e quarter,
  com objetivo, resultados-chave, dono, status, evolução e observação; status padrão ao
  criar = "Em andamento".
- **FR-025**: O sistema DEVE exibir e permitir atualização manual de métricas padrão (MRR,
  Clientes ativos, Novos clientes, Leads qualificados, Taxa de conversão, Churn Rate, CAC,
  LTV, LTV/CAC, Burn Rate, Runway) com valor atual, anterior, variação percentual e período.
- **FR-026**: O sistema DEVE permitir criar e gerenciar Plano de Ação vinculado a OKRs,
  com iniciativas, dono e status.
- **FR-027**: O sistema DEVE exibir Kanban por startup com fases padrão (Backlog / A fazer
  / Em andamento / Aguardando/Bloqueado / Em revisão / Concluído); status da tarefa DEVE
  ser a fase do Kanban — sem campo de status separado.
- **FR-028**: O sistema DEVE disponibilizar "Meu Kanban" consolidando todas as tarefas do
  usuário logado de todas as startups, com filtros por startup, fase, data de entrega e
  tarefas atrasadas, e acesso direto à tarefa original.
- **FR-029**: O sistema DEVE permitir registrar Rituais e Reuniões por startup com suporte
  a link externo (ex.: Granola) para notas e transcrições; decisões ficam nas notas, não
  em entidade separada.
- **FR-030**: O sistema DEVE permitir organizar Documentos, Anexos e Evidências por
  startup, com possibilidade de vincular link/documento a uma tarefa.
- **FR-031**: O sistema DEVE permitir criar, editar e listar Atividades de Relacionamento
  por startup do portfólio (tipo, canal, data, status, responsável, participantes, observação,
  link externo); responsável padrão = usuário logado; startup padrão = startup da página atual.

**IA Local e Resumo de Contexto**

- **FR-032**: O sistema DEVE permitir solicitar geração de Resumo de Contexto via botão
  "Atualizar Contexto", criando um job assíncrono no banco de dados com status "Pendente".
- **FR-033**: O sistema DEVE processar jobs de IA via worker local separado, utilizando
  modelo local/open-source via Ollama; o worker DEVE ser executado fora da plataforma
  de hospedagem da interface web.
- **FR-034**: O sistema DEVE persistir jobs de IA para que não sejam perdidos se o worker
  estiver offline; o worker DEVE processar pendências automaticamente ao reiniciar.
- **FR-035**: O sistema DEVE salvar cada versão gerada do Resumo de Contexto com data,
  modelo utilizado, versão do prompt e flag de edição manual.
- **FR-036**: O sistema DEVE permitir edição manual do Resumo de Contexto, preservando
  versões anteriores no histórico.
- **FR-037**: O sistema DEVE exibir mensagens de status claras ao usuário para cada estado
  do job ("Contexto enviado para geração", "Gerando novo contexto", "Novo contexto gerado
  com sucesso", "Aguardando processamento pelo worker de IA", "Não foi possível gerar o
  contexto. Tente novamente.").
- **FR-038**: A integração com o modelo de IA DEVE ser abstraída em uma camada de serviço
  substituível, permitindo troca futura de provedor sem alterar produto, UI ou histórico de
  contexto.

**Transversal**

- **FR-039**: Todo registro relevante DEVE persistir `created_at`, `updated_at`, identificador
  do criador e do último editor; entidades com escopo temporal DEVEM registrar quarter ou
  data de referência.
- **FR-040**: O sistema DEVE aplicar filtro padrão pelo quarter atual em todas as visões com
  escopo temporal (Página Operacional, Assessment, OKRs, Métricas, Plano de Ação, Kanban,
  Resumo de Contexto).

---

### Key Entities

- **Funnel**: Edição do Investor Day. Campos: nome, descrição, edição, datas, status
  (Ativo/Encerrado/Arquivado).
- **FunnelStage**: Etapa de um funil. Campos: nome, posição, funil pai, flags
  (padrão, final, arquivada).
- **StartupCandidate**: Startup no processo de originação. Campos: funil, etapa, resultado
  (independente da etapa), responsável interno, dados de negócio (nome, site, vertical,
  fase, nota, captable, MRR, clientes, time, o que busca, notas, links), contatos (WhatsApp,
  e-mail), próxima ação, lembrete, histórico. Relacionamentos: avaliações, atividades,
  vínculo com PortfolioStartup após conversão.
- **QualitativeAssessment** (CRM): Avaliação IARIS por candidata. Campos: critérios com
  sinais (verde/amarelo/vermelho), recomendação (Investor Day / Potencial / Não avançar).
- **PanelEvaluation**: Avaliação de banca/formulário por candidata. Campos: avaliador, data,
  nota final, aprovação, comentários, critérios de avaliação configuráveis.
- **CRMActivity**: Atividade/follow-up no CRM. Campos: tipo, data, responsável, status
  (Pendente/Agendada/Concluída/Reagendada/Cancelada), nota, link externo.
- **PortfolioStartup**: Startup incorporada ao portfólio. Campos: perfil completo (nome, logo,
  site, founders, segmento, modelo de negócio, estágio, investimento, cap table, documentos),
  Tier (0–3), Status de Jornada, Engajamento, vínculo com StartupCandidate de origem.
- **OperationalAssessment**: Assessment trimestral da startup no portfólio. Campos:
  startup, quarter, responsável, created_at, updated_at, created_by, updated_by.
  Contém múltiplos **AssessmentItem** (um por categoria).
- **AssessmentItem**: Avaliação por categoria dentro de um Assessment. Campos: assessment,
  categoria (enum: `Estratégia` | `Produto` | `Distribuição` | `Mercado` | `Operação` |
  `Founder`), sinal (enum: `🔴` | `🟠` | `🟡` | `🟢`), evidência_observada (texto),
  interpretação_do_risco (texto), próximo_foco (texto), responsável, prazo.
  As rubricas de critérios por categoria (planilha `Critério-v2`) são dados de referência
  semeados no banco — não editáveis pelo usuário na interface.
- **OKR**: Objetivo com resultados-chave. Campos: objetivo, resultados-chave, quarter, dono,
  status (Em andamento/Em atenção/Travado/Concluído/Cancelado/Não alcançado), evolução,
  observação.
- **Metric**: Indicador quantitativo. Campos: tipo (MRR, CAC, LTV etc.), valor atual, valor
  anterior, período, observação.
- **ActionPlan**: Plano vinculado a OKR. Campos: OKR, dono, iniciativas, status, observação.
- **KanbanTask**: Tarefa operacional. Campos: título, descrição, fase do Kanban (= status),
  responsável, prazo, comentários, links, startup vinculada. Sem campo de status separado.
- **Ritual**: Registro de ritual/reunião. Campos: tipo, data, participantes, notas ou link
  externo (Granola), startup vinculada.
- **Document**: Documento, anexo ou evidência. Campos: nome, tipo, link/arquivo, startup,
  tarefa vinculada (opcional).
- **PortfolioActivity**: Atividade de relacionamento no portfólio. Campos: tipo, canal, data,
  status (Pendente/Agendada/Concluída/Reagendada/Cancelada), responsável, participantes,
  observação, link externo.
- **AIJob**: Solicitação assíncrona de geração. Campos: startup, solicitante, status
  (Pendente/Processando/Concluído/Erro/Cancelado), timestamps de criação/início/conclusão,
  modelo, versão do prompt, mensagem de erro.
- **ContextVersion**: Versão do Resumo de Contexto. Campos: startup, conteúdo gerado, data
  de geração, modelo, versão do prompt, flag de edição manual, data e autor da última edição.
- **User**: Usuário interno da IARIS. Campos: e-mail, nome, papel (`Administrador` | `Membro`),
  flag de primeiro acesso (`must_change_password`). Papel `Administrador` habilita acesso
  ao painel de gerenciamento de usuários; toda outra permissão é idêntica entre os papéis.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um membro da equipe localiza qualquer startup candidata do 4º Investor Day,
  visualiza etapa, resultado e avaliações sem abrir a planilha original.
- **SC-002**: Um membro da equipe prepara uma reunião com qualquer startup do portfólio
  (Assessment, OKRs, Métricas, Kanban e Resumo de Contexto) em menos de 2 minutos.
- **SC-003**: A conversão de candidata em startup do portfólio preserva 100% do vínculo
  histórico — candidatura acessível a partir do portfólio e vice-versa.
- **SC-004**: O Resumo de Contexto por IA é gerado sem custo variável por geração para a
  IARIS, utilizando exclusivamente modelo local/open-source no MVP.
- **SC-005**: Jobs de geração de contexto não são perdidos quando o worker estiver offline;
  são processados automaticamente quando o worker reconectar.
- **SC-006**: Todos os registros criados ou alterados no sistema preservam histórico de
  autoria e data, permitindo auditoria completa de qualquer alteração.
- **SC-007**: O time consegue operar o funil do Investor Day e o portfólio de startups no
  dia a dia sem depender de planilhas, Notion ou anotações dispersas como fonte primária.
- **SC-008**: O usuário visualiza todas as suas tarefas pendentes de todas as startups em
  um único "Meu Kanban", filtráveis por fase, startup e prazo.

---

## Assumptions

- O sistema é de uso exclusivamente interno pela equipe IARIS; não há acesso para
  startups, investidores, avaliadores externos ou mentores no MVP.
- Existem dois papéis no MVP — `Administrador` (provisiona e desativa usuários) e `Membro`
  (acesso operacional completo). Permissionamento granular por módulo ou startup é fora de escopo.
- O worker de IA local roda em uma máquina controlada pela IARIS (local ou servidor
  barato), fora da infraestrutura da plataforma de hospedagem da interface web.
- A planilha do 4º Investor Day está disponível no formato esperado conforme mapeamento
  do PRD §10.
- A integração com Granola para reuniões é via link manual (URL) no MVP; integração
  nativa é fora de escopo.
- O MVP não envia e-mails, WhatsApp ou qualquer comunicação automaticamente.
- Atualizações de métricas são manuais no MVP; importação automática é fora de escopo.
- O quarter segue calendário padrão (Q1: jan-mar, Q2: abr-jun, Q3: jul-set, Q4: out-dez).
- Focus Month e Sprint Planning não são features próprias no MVP; são registradas como
  Rituais e Reuniões.
- Conflitos de edição simultânea são resolvidos com last-write-wins no MVP.
- A Wiki de Metodologia é implementada como arquivos MDX/HTML hardcoded no repositório
  Next.js, sem CMS ou interface de edição. Atualizações requerem deploy do dev.
