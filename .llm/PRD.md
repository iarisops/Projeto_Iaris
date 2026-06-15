# IARIS Portfolio OS — PRD

**Versão:** 1.0  
**Status:** Draft  
**Última atualização:** 2026-06-14  
**Stack:** Next.js + Vercel · Supabase (Postgres, Auth, Storage) · Worker local com Ollama

---

## 1. Visão Geral do Produto

O **IARIS Portfolio OS** é o sistema operacional interno da IARIS Venture Builder para gerir a jornada completa das startups, desde a originação até o acompanhamento operacional no portfólio.

O MVP possui dois grandes módulos:

1. **CRM de Originação / Investor Day**
   - Gestão de startups candidatas.
   - Funis configuráveis por edição do Investor Day.
   - Avaliações, atividades, follow-ups e conversão para portfólio.

2. **Gestão Operacional do Portfólio**
   - Gestão das startups já incorporadas ao portfólio.
   - Página Operacional da Startup.
   - Assessment, OKRs, Métricas, Plano de Ação, Kanban, Rituais, Documentos e Resumo de Contexto por IA.

---

## 2. Problema

A IARIS ainda possui informações, históricos, documentos, tarefas, avaliações, rituais e processos espalhados em diferentes ferramentas, como planilhas, Drive, Notion, e-mails, WhatsApp, anotações e transcrições de reuniões.

Isso prejudica:

- Originação e avaliação de startups.
- Preservação de histórico por edição do Investor Day.
- Conversão de startups candidatas em startups do portfólio.
- Acompanhamento e aceleração das startups.
- Preparação para reuniões.
- Registro de evolução.
- Planejamento semanal.
- Report ao CEO e acionistas.
- Transferência de contexto para outras pessoas.

Problema central:

> A IARIS não possui um sistema operacional único para gerir a jornada completa das startups, da originação ao acompanhamento no portfólio.

---

## 3. Objetivo do MVP

Criar um sistema interno que permita:

- Gerenciar o funil atual do Investor Day.
- Importar dados da planilha atual do 4º Investor Day.
- Visualizar startups candidatas em Kanban.
- Separar etapa do funil de resultado/desfecho.
- Registrar avaliações e follow-ups.
- Converter startups candidatas em startups do portfólio.
- Criar e acompanhar startups do portfólio.
- Centralizar contexto, tarefas, documentos, rituais e indicadores.
- Gerar Resumo de Contexto por IA local sem custo variável por chamada.

---

## 4. Princípios de Produto

O sistema deve:

- Reduzir esforço operacional.
- Evitar preenchimento duplicado.
- Evitar burocracia.
- Priorizar atualização rápida durante a rotina real.
- Permitir filtros inteligentes por data.
- Manter dados estruturados para uso futuro com IA.
- Separar claramente CRM de Originação e Portfólio.
- Preservar histórico por edição de Investor Day.
- Permitir conversão explícita de candidata para startup do portfólio.
- Começar com IA local/open-source para evitar custo por token.
- Ser agnóstico de provedor de IA para troca futura.

---

## 5. Stack Recomendada

### 5.1 Frontend / App

- Vercel
- Next.js recomendado
- Interface web interna

### 5.2 Backend / Banco / Auth / Storage

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime, se necessário

### 5.3 IA Local

- Worker local separado
- Ollama
- Modelo local/open-source

Modelos locais a avaliar:

- Llama
- Qwen
- Mistral
- Gemma

### 5.4 Importante

Não executar modelo local diretamente:

- dentro da Vercel;
- dentro do Supabase Edge Functions.

A IA deve rodar em um worker separado, local ou em servidor barato.

---

# PARTE 1 — ARQUITETURA FUNCIONAL

## 6. Módulos do Sistema

### 6.1 CRM de Originação / Investor Day

Módulo para startups candidatas.

Inclui:

- Funis configuráveis.
- Etapas configuráveis.
- Startups candidatas.
- Kanban do funil.
- Resultado/desfecho.
- Avaliações.
- Formulários configuráveis.
- Atividades/follow-ups.
- WhatsApp Web.
- Métricas do funil.
- Conversão para Startup do Portfólio.

### 6.2 Gestão Operacional do Portfólio

Módulo para startups que já entraram na IARIS.

Inclui:

- Página Inicial.
- Perfil da Startup.
- Página Operacional da Startup.
- Tiers.
- Status de Jornada.
- Engajamento.
- Resumo de Contexto por IA.
- Objetivos e Indicadores.
- Assessment.
- OKRs.
- Métricas.
- Plano de Ação.
- Kanban.
- Rituais e Reuniões.
- Buildagem, Anexos e Evidências.
- Relacionamento e Atividades.
- Wiki de Metodologia.
- Logs e histórico técnico.

---

## 7. Relação entre CRM e Portfólio

Uma startup candidata **não** deve nascer automaticamente como startup do portfólio.

Ela só entra no portfólio quando o usuário executar a ação:

> Converter em Startup do Portfólio

Ao converter:

- Criar registro no módulo de Portfólio.
- Copiar dados relevantes da candidata.
- Preservar histórico do CRM.
- Marcar candidata como Ganha/Convertida.
- Criar vínculo entre `startup_candidate` e `portfolio_startup`.
- Permitir acesso ao histórico de origem a partir da startup do portfólio.

---

# PARTE 2 — CRM DE ORIGINAÇÃO / INVESTOR DAY

## 8. Conceito

O Investor Day é o evento final em que startups selecionadas apresentam seus pitches, mas a IARIS também usa o nome “Investor Day” para identificar cada batch/ciclo de originação.

Cada edição deve ter:

- Funil próprio.
- Histórico próprio.
- Métricas próprias.
- Startups candidatas próprias.
- Avaliações próprias.

Exemplo:

- 4º Investor Day IARIS Ventures.
- 5º Investor Day IARIS Ventures.

---

## 9. Entidades do CRM

### 9.1 Funil

Representa uma edição do Investor Day ou outro processo de originação.

Campos sugeridos:

```txt
id
name
description
edition
start_date
end_date
status
created_at
updated_at
```

Status do funil:

```txt
Ativo
Encerrado
Arquivado
```

Primeiro funil do MVP:

```txt
4º Investor Day IARIS Ventures
```

A aba `Agenda-PitchDay` da planilha atual deve ser ignorada.

---

### 9.2 Etapa do Funil

Campos sugeridos:

```txt
id
funnel_id
name
position
is_default
is_final
is_archived
created_at
updated_at
```

Etapas iniciais sugeridas:

```txt
Avaliação
1ª Reunião
2ª Reunião
Contrato/MoU enviado
Startup avaliando
Investor Day
Pós-Investor Day
Entrada no Portfólio
```

Observação:

`Contrato/MoU enviado` significa que foi enviado o Contrato de Opção de Compra / MoU para a startup avaliar, analisar e negociar com a IARIS.

Isso não significa aprovação para o Investor Day nem entrada no portfólio.

---

### 9.3 Resultado / Desfecho

Separar etapa do funil de resultado/desfecho.

Resultados possíveis:

```txt
Em aberto
Ganha
Perdida
Acompanhar futuramente
```

Regras:

- Uma startup pode ser ganha ou perdida em qualquer etapa.
- Resultado não deve ser confundido com etapa.
- Startup com resultado `Ganha` pode ser convertida em startup do portfólio.

---

### 9.4 Startup Candidata

Campos sugeridos:

```txt
id
funnel_id
stage_id
result
internal_owner_id
name
reminder_note
history_evolution
site
whatsapp
email
equity
vertical
phase
score
captable
mrr
customers
team
what_seeks
general_note
pitch_deck_url
last_update_at
next_action
created_at
updated_at
converted_portfolio_startup_id
```

---

## 10. Importação da Planilha Atual

A primeira carga de dados deve importar a planilha do 4º Investor Day.

### 10.1 Abas consideradas

Considerar:

```txt
Startups
Framework IARIS — Avaliação Qualitativa
Legenda - Avaliação
Respostas ao formulário
Base_Respostas
Análise qualitativa
Contato, quando aplicável
```

Ignorar:

```txt
Agenda-PitchDay
```

### 10.2 Mapeamento da aba Startups

```txt
Startup -> name
Observação para lembrete -> reminder_note
Evolução -> history_evolution
Status -> stage_id ou result, conforme regra
Site -> site
Equity -> equity
Vertical -> vertical
Fase -> phase
Nota -> score
Captable -> captable
MRR -> mrr
Clientes -> customers
Time -> team
O que busca? -> what_seeks
Observação -> general_note
Apresentação -> pitch_deck_url
```

### 10.3 Regra para Status legado

A planilha mistura etapa e resultado em uma única coluna `Status`.

Regras de importação:

```txt
Contrato -> etapa: Contrato/MoU enviado; resultado: Em aberto
Startup avaliando -> etapa: Startup avaliando; resultado: Em aberto
2a Reunião -> etapa: 2ª Reunião; resultado: Em aberto
Avaliação -> etapa: Avaliação; resultado: Em aberto
Recusa -> resultado: Perdida
```

Para `Recusa`, se não for possível identificar a etapa, preservar o status original em observação de importação.

---

## 11. Visualizações do CRM

### 11.1 Lista de Funis

Mostrar:

```txt
nome do funil
status
quantidade de startups
quantidade por etapa
quantidade ganhas
quantidade perdidas
taxa de conversão
data de início
data de encerramento
```

### 11.2 Kanban do Funil

Cada coluna representa uma etapa.

Cada card representa uma Startup Candidata.

Card deve mostrar:

```txt
nome da startup
vertical
fase
nota
resultado/desfecho
último update
próxima ação
responsável interno
```

Ações:

- Mover card entre etapas.
- Abrir página da startup candidata.
- Alterar resultado.
- Registrar atividade.

### 11.3 Lista/Tabela do Funil

Além do Kanban, criar tabela para filtros e comparação.

Filtros:

```txt
etapa
resultado
vertical
fase
nota
responsável
com próxima ação
sem próxima ação
data de atualização
```

---

## 12. Página da Startup Candidata

### 12.1 Blocos

A página deve conter:

1. Cabeçalho.
2. Dados básicos.
3. Etapa e resultado.
4. Contatos.
5. Histórico/evolução.
6. Avaliação qualitativa IARIS.
7. Avaliações da banca/formulário.
8. Documentos e links.
9. Atividades/follow-ups.
10. Ações rápidas.

### 12.2 Cabeçalho

Mostrar:

```txt
nome da startup
funil
etapa atual
resultado/desfecho
vertical
fase
nota
responsável
último update
próxima ação
```

### 12.3 Ações rápidas

Ações:

- Editar dados.
- Mover etapa.
- Alterar resultado.
- Registrar atividade.
- Abrir WhatsApp Web.
- Acessar apresentação/link.
- Criar/editar avaliação.
- Converter em Startup do Portfólio.

---

## 13. WhatsApp no CRM

No MVP, o botão `Enviar mensagem` deve:

- Abrir WhatsApp Web.
- Usar o número cadastrado.
- Não enviar mensagem automaticamente.
- Não registrar histórico automaticamente.
- Não exigir WhatsApp API.

Se não houver número cadastrado:

```txt
Exibir mensagem: "Adicione um WhatsApp para enviar mensagem."
```

Preparar estrutura para futuro:

- Templates.
- Mensagens sugeridas por IA.
- Agentes de follow-up.
- Histórico automático.
- Integração com WhatsApp.
- Integração com e-mail.

---

## 14. Avaliações do CRM

### 14.1 Tipos de avaliação

1. Avaliação qualitativa IARIS.
2. Avaliação da banca/formulário.

### 14.2 Avaliação qualitativa IARIS

Critérios atuais:

```txt
Founder / Time
Clareza do problema
Produto
Distribuição / GTM
Tração
Mercado
Diferencial
Modelo de negócio
Investimento
Governança / Organização
```

Sinais:

```txt
verde
amarelo
vermelho
```

Recomendações possíveis:

```txt
Investor Day
Potencial
Não avançar
```

### 14.3 Avaliação da banca/formulário

O sistema deve:

- Importar avaliações existentes.
- Permitir editar avaliações importadas.
- Criar novas avaliações manualmente.
- Configurar formulário por funil.
- Permitir duplicar/adaptar formulário para próximos Investor Days.

Campos identificados:

```txt
startup avaliada
equity
avaliador
data/hora
nota final de 0 a 10
aprovação para Investor Day
comentários gerais
atratividade
identificação da dor, problema e solução
escalabilidade do modelo de negócio
tamanho de mercado
evidências de demanda
inovação
tecnologia proprietária
desenvolvimento tecnológico
segurança/regulamentação
sustentabilidade financeira
canais e fluxos de receita
experiência dos founders
dedicação dos founders
vantagem competitiva
posicionamento frente a concorrentes
captable
necessidade de apoio da IARIS
```

### 14.4 Consolidação da avaliação

Na página da startup candidata, mostrar:

```txt
número de avaliações recebidas
nota média
percentual de aprovação
principais comentários
principais pontos fortes
principais riscos
grau médio de atratividade
recomendação consolidada
```

Permitir expandir para ver avaliações individuais.

---

## 15. Atividades e Follow-ups do CRM

Campos sugeridos:

```txt
id
startup_candidate_id
type
date
responsible_id
status
note
external_link
created_at
updated_at
```

Exemplos:

- Enviar follow-up.
- Registrar reunião.
- Registrar WhatsApp.
- Registrar e-mail.
- Agendar próxima conversa.
- Cobrar retorno sobre MoU.
- Registrar negociação de termos.
- Registrar retorno de avaliador.

Status:

```txt
Pendente
Agendada
Concluída
Reagendada
Cancelada
```

Atraso deve ser calculado automaticamente com base na data.

---

## 16. Métricas do Funil

Cada funil deve ter métricas próprias.

Métricas iniciais:

```txt
total de startups no funil
startups por etapa
startups ganhas
startups perdidas
startups para acompanhar futuramente
taxa de conversão geral
taxa de conversão por etapa
média de nota
ranking por nota
percentual de aprovação da banca
distribuição por vertical
distribuição por fase
quantidade de startups com MoU enviado
quantidade convertida em portfólio
```

---

## 17. Conversão para Startup do Portfólio

A página da Startup Candidata deve ter a ação:

```txt
Converter em Startup do Portfólio
```

Ao executar:

- Criar Perfil da Startup no módulo de Portfólio.
- Copiar dados relevantes.
- Preservar histórico do CRM.
- Marcar Startup Candidata como Ganha/Convertida.
- Criar vínculo entre candidatura e startup do portfólio.
- Permitir consultar histórico do CRM depois da conversão.

Dados sugeridos para migração:

```txt
nome
site
vertical/segmento
fase
descrição/observações
e-mail
WhatsApp/telefone
captable
MRR
clientes
time
o que busca
apresentação/link
documentos relevantes
histórico de avaliação
observações importantes
```

---

# PARTE 3 — PORTFÓLIO

## 18. Página Inicial

A Página Inicial deve mostrar:

1. Lista básica de startups.
2. Minhas Atividades.
3. Minhas Tarefas.

### 18.1 Lista de Startups

Campos mínimos:

```txt
logo
nome da startup
```

Ação:

- Acessar Página Operacional da Startup em um clique.

### 18.2 Minhas Atividades

Mostrar atividades do usuário logado.

Filtros:

```txt
data
status
startup
tipo de atividade
```

### 18.3 Minhas Tarefas

Mostrar tarefas do usuário logado.

Filtros:

```txt
data de criação
data de entrega
etapa/status
startup
tarefas atrasadas
tarefas concluídas
próximas entregas
```

---

## 19. Perfil da Startup

### 19.1 Objetivo

O Perfil da Startup contém dados estruturais e cadastrais.

A Página Operacional contém acompanhamento e rotina de trabalho.

### 19.2 Configuração do formulário

Permitir configurar:

- Campos existentes.
- Campos obrigatórios.
- Campos opcionais.
- Campos preenchidos pela startup via formulário.
- Campos preenchidos internamente.
- Ordem.
- Textos de apoio.

### 19.3 Identificação básica

```txt
nome da startup
logo
site
LinkedIn da startup
data de entrada na IARIS
```

### 19.4 Descrição do negócio

```txt
descrição curta
segmento
subsegmento/vertical
problema que resolve
solução oferecida
ICP/cliente-alvo
modelo de negócio
modelo de receita
```

### 19.5 Estágio da startup

Opções:

```txt
Ideação
Validação
Operação
Tração
Escala
```

### 19.6 Founders e contatos

```txt
founders
founder principal/ponto focal
e-mail
WhatsApp/telefone
LinkedIn dos founders
dedicação dos founders
```

### 19.7 Investimento e Cap Table

```txt
rodada atual
valor buscado
valuation/instrumento
cap table resumido
participação da IARIS
uso pretendido dos recursos
```

### 19.8 Links e documentos

```txt
contrato/MoU
documentos principais
links úteis
```

---

## 20. Página Operacional da Startup

### 20.1 Objetivo

Página central para acompanhamento da startup no portfólio.

Deve permitir consultar e atualizar informações durante a rotina real da IARIS.

### 20.2 Cabeçalho

Campos:

```txt
logo
nome da startup
acesso ao Perfil da Startup
Tier
Status de Jornada
Engajamento
último update automático
última reunião
próxima reunião
```

### 20.3 Último update

Gerado automaticamente a partir de alterações relevantes.

Eventos relevantes:

```txt
alteração de Tier
alteração de Status de Jornada
alteração de Engajamento
novo Assessment criado/editado
OKR criado/editado
métrica atualizada
Plano de Ação atualizado
tarefa criada/editada/arquivada/concluída/movida
documento/anexo/evidência adicionado/atualizado
reunião/transcrição/nota adicionada
atividade criada/concluída/reagendada/cancelada
Resumo de Contexto atualizado
alteração relevante no Perfil da Startup
```

### 20.4 Filtro geral por período

Default:

```txt
quarter atual
```

Filtros:

```txt
quarter atual
quarters anteriores
mês
semana
período personalizado
```

O filtro deve impactar:

```txt
Assessment
OKRs
Métricas
Plano de Ação
Kanban
Rituais e Reuniões
Buildagem, Anexos e Evidências
Relacionamento e Atividades
Resumo de Contexto, quando aplicável
```

### 20.5 Ordem dos blocos

1. Cabeçalho.
2. Resumo de Contexto.
3. Objetivos e Indicadores.
4. Kanban.
5. Rituais e Reuniões.
6. Buildagem, Anexos e Evidências.
7. Relacionamento e Atividades.

Dentro de Objetivos e Indicadores:

1. Assessment.
2. OKRs.
3. Métricas.
4. Plano de Ação.

Lógica:

```txt
Assessment trimestral -> OKRs -> Métricas -> Plano de Ação -> Kanban
```

---

## 21. Tiers

Opções:

```txt
Tier 0 — Onboarding
Tier 1 — Observação e Estruturante
Tier 2 — Desenvolvimento
Tier 3 — Aceleração
```

Definições:

```txt
Tier 0 — Startup recém-chegada, em entendimento e diagnóstico inicial.
Tier 1 — Precisa fortalecer execução, foco, clareza estratégica ou fundamentos.
Tier 2 — Em construção de ICP/PMF, validação comercial e primeiros sinais de tração.
Tier 3 — Alta execução, tração comprovada e potencial de escalar.
```

A Wiki deve explicar uso, exemplos e aderência com Status de Jornada.

---

## 22. Status de Jornada

Opções:

```txt
Em Onboarding
Tese em revisão
Buscando 1º piloto
Piloto em validação
Primeiros pagantes
Tração inicial
Motor de crescimento em construção
Motor de crescimento em evolução contínua
Pronta para aceleração/escala
Em captação
```

---

## 23. Engajamento

Opções:

```txt
Alto
Médio
Baixo
Crítico
```

Definições:

```txt
Alto — participa, traz dados, executa combinados e usa bem a IARIS.
Médio — participa de forma irregular e precisa de cobrança leve.
Baixo — responde pouco, participa pouco ou não atualiza dados.
Crítico — praticamente ausente ou sem prioridade na relação.
```

---

## 24. Objetivos e Indicadores

A área conecta:

```txt
Assessment
OKRs
Métricas
Plano de Ação
```

---

## 25. Assessment

### 25.1 Regras

- Criado e editado no MVP.
- Sempre vinculado a um quarter.
- Quarter atual sugerido por padrão.
- Permitir alterar quarter.
- Deve aparecer resumido na Página Operacional.
- Deve permitir expansão.

### 25.2 Configuração

Permitir configurar:

```txt
campos do formulário
se campo é via formulário ou interno
opções de resposta
obrigatoriedade
ordem dos campos
textos de apoio
critérios/sinais utilizados
```

---

## 26. OKRs

Campos:

```txt
objetivo
resultados-chave
quarter
dono/área
status
evolução
observação
```

Status:

```txt
Em andamento
Em atenção
Travado
Concluído
Cancelado
Não alcançado
```

Regra:

- Ao criar OKR no quarter, status padrão = `Em andamento`.

---

## 27. Métricas

Métricas padrão:

```txt
MRR
Clientes ativos
Novos clientes
Leads qualificados
Taxa de conversão
Churn Rate
CAC
LTV
LTV/CAC Ratio
Burn Rate
Runway
```

Regras:

- Atualização manual.
- Pode ser atualizada a qualquer momento.
- Deve permitir consolidação mensal manual nos rituais.

Visão principal:

```txt
métrica
valor atual
valor anterior
variação percentual
evolução/retração
período de referência
observação
```

Visão expandida:

```txt
gráfico histórico
evolução por período
insights
comentários
```

---

## 28. Plano de Ação

Campos:

```txt
OKR
dono
iniciativas
status
observação
```

Função:

```txt
Plano de Ação = quais iniciativas precisam acontecer para o OKR avançar.
Kanban = quais tarefas operacionais estão sendo executadas.
```

---

## 29. Kanban do Portfólio

### 29.1 Etapas padrão

```txt
Backlog
A fazer
Em andamento
Aguardando/Bloqueado
Em revisão
Concluído
```

### 29.2 Tarefa

Campos visíveis:

```txt
título
descrição
fase/status do Kanban
responsável
prazo/data de entrega
comentários
anexo/link relacionado
```

Campos automáticos:

```txt
startup vinculada
data de criação
última atualização
criado por
atualizado por
histórico de movimentação
data de conclusão, quando aplicável
```

### 29.3 Status da tarefa

A tarefa não deve ter status separado.

Status = fase do Kanban.

O estado `Pendente` é considerado padrão quando a tarefa estiver em:

```txt
Backlog
A fazer
```

Não deve exigir preenchimento manual.

### 29.4 Ações mínimas

- Criar tarefa.
- Editar tarefa.
- Arquivar tarefa.
- Movimentar tarefa entre fases/status.

### 29.5 Filtros

```txt
data de criação
data de entrega
última atualização
fase/status
responsável
startup
atrasadas
concluídas
arquivadas
período personalizado
```

### 29.6 Meu Kanban

Visão consolidada de todas as tarefas do usuário logado.

Deve permitir:

```txt
visualizar tarefas de todas as startups
visualizar tarefas internas da IARIS
filtrar por startup
filtrar por fase/status
filtrar por data
acessar tarefa original
atualizar tarefa quando permitido
```

### 29.7 Feature Kanban

Área própria de Kanban deve permitir:

```txt
visualizar Kanban de qualquer startup
alternar entre Kanbans de startups
alternar para Kanban interno da IARIS
acessar Meu Kanban
atualizar tarefas
aplicar filtros
```

---

## 30. Rituais e Reuniões

Esta área reúne:

```txt
Focus Month
Sprint Planning
reuniões semanais
reuniões avulsas
notas
transcrições
links para Granola
registros relevantes
```

Focus Month e Sprint Planning não são features próprias no MVP.

### Granola

- Granola é a ferramenta atual de transcrição e notas.
- Reuniões estão organizadas em pastas por startup.
- Preferir integração/conexão com Granola.
- Se não for viável, permitir link manual para notas/transcrições.

Decisões não são entidade própria.

Elas devem ficar nas notas/transcrições e gerar alterações práticas nas áreas corretas quando necessário.

---

## 31. Buildagem, Anexos e Evidências

Organizar:

```txt
documentos de buildagem
anexos relevantes
evidências
materiais de trabalho
entregáveis
reports
links úteis
arquivos de apoio
```

Regra:

- Se uma tarefa gerar entregável, permitir associar link/documento à tarefa.

---

## 32. Relacionamento e Atividades do Portfólio

Atividade = interação, agenda, comunicação ou follow-up.

Campos:

```txt
tipo de atividade
canal
data
status
responsável
participantes
startup vinculada
observação
link externo, quando aplicável
```

Status:

```txt
Pendente
Agendada
Concluída
Reagendada
Cancelada
```

Regras:

- Responsável padrão = usuário logado.
- Startup padrão = startup da página atual.
- Atraso calculado automaticamente pela data.
- MVP não envia e-mail ou WhatsApp.
- MVP permite registro, agendamento, link externo e observação.

---

## 33. Wiki de Metodologia

A Wiki deve conter:

```txt
metodologia do Assessment
explicação dos Tiers
explicação dos Status de Jornada
explicação dos níveis de Engajamento
relação entre Tier e Status de Jornada
tabelas de aderência entre Tier e Status
exemplos práticos de classificação
critérios orientativos
explicação da lógica Assessment -> OKRs -> Métricas -> Plano de Ação -> Kanban
metodologia de avaliação do CRM Investor Day
explicação dos critérios de avaliação de startups candidatas
explicação de recomendações como Investor Day, Potencial e Não avançar
```

Acessos rápidos:

```txt
campo Tier
campo Status de Jornada
campo Engajamento
área de Assessment
área de Objetivos e Indicadores
módulo de CRM
área de Avaliações do CRM
menu principal
área de ajuda
```

---

# PARTE 4 — IA LOCAL E RESUMO DE CONTEXTO

## 34. Objetivo do Resumo de Contexto

O Resumo de Contexto deve permitir que o usuário entenda rapidamente o momento da startup.

Deve apoiar:

```txt
preparação para reuniões
transferência de contexto
entendimento do histórico
visão de avanços e desafios
leitura operacional do momento atual
```

## 35. Estrutura esperada do resumo

O resumo deve trazer:

```txt
contexto histórico resumido
avanços relevantes
desafios persistentes
objetivos atuais
leitura das métricas
foco do mês
overview das sprints
avanços relevantes de buildagem, anexos e evidências
resumo rápido de relacionamento, se houver dificuldade
contato ou interação mais recente
próximos pontos de atenção
```

## 36. Estratégia de IA no MVP

No MVP, a IA deve:

- Usar modelo local/open-source.
- Evitar APIs pagas.
- Não gerar custo variável por token.
- Ser acionada manualmente por botão.
- Usar lógica incremental.
- Ser agnóstica de provedor.

## 37. Arquitetura recomendada

### Vercel

Responsável por:

```txt
hospedar aplicação web
exibir interface
permitir botão Atualizar Contexto
criar solicitação de geração
consultar status do processamento
```

Não deve hospedar modelo local.

### Supabase

Responsável por:

```txt
dados estruturados
auth
storage
logs
jobs de IA
histórico de versões
status do job
resultado gerado
```

### Worker local com Ollama

Responsável por:

```txt
rodar em máquina local da IARIS, do desenvolvedor ou servidor barato
consultar jobs pendentes no Supabase
buscar dados necessários
chamar modelo local via Ollama
salvar novo contexto no Supabase
atualizar status do job
```

## 38. Fluxo de Atualizar Contexto

Quando usuário clicar em `Atualizar Contexto`:

1. Criar job no Supabase.
2. Job recebe status `Pendente`.
3. Worker local identifica job pendente.
4. Worker busca:
   - último contexto salvo;
   - atualizações depois do último contexto;
   - dados relevantes da startup;
   - tarefas;
   - métricas;
   - rituais;
   - reuniões;
   - documentos;
   - atividades recentes.
5. Worker envia dados ao modelo local.
6. Modelo gera nova versão estruturada.
7. Worker salva nova versão no Supabase.
8. Job vira `Concluído`.
9. Interface exibe novo contexto.

## 39. Status do job de IA

```txt
Pendente
Processando
Concluído
Erro
Cancelado
```

## 40. Campos do job de IA

```txt
id
startup_id
requested_by_user_id
status
created_at
processing_started_at
completed_at
last_context_version_id
updates_period_start
updates_period_end
error_message
model_used
prompt_version
```

## 41. Versões do Resumo de Contexto

Campos:

```txt
id
startup_id
content
generated_at
requested_by_user_id
model_used
prompt_version
was_manually_edited
last_edited_at
edited_by_user_id
```

## 42. Worker offline

Se o worker estiver offline:

- Job permanece `Pendente`.
- Interface informa que está aguardando processamento.
- Solicitação não pode ser perdida.
- Worker processa pendências quando voltar.

Mensagens possíveis:

```txt
Contexto enviado para geração.
Gerando novo contexto.
Novo contexto gerado com sucesso.
Não foi possível gerar o contexto. Tente novamente.
Aguardando processamento pelo worker de IA.
```

## 43. Troca futura de provedor

Sistema deve permitir futura troca para:

```txt
OpenAI
Anthropic
Gemini
OpenRouter
Hugging Face
outro provedor compatível
```

A troca deve afetar apenas a camada de serviço de IA, sem alterar:

```txt
interface
estrutura de dados
histórico de contexto
lógica do produto
```

---

# PARTE 5 — REGRAS TRANSVERSAIS

## 44. Logs e registros temporais

Todo registro relevante deve salvar:

```txt
data de criação
data da última atualização
usuário criador
usuário responsável pela última atualização
startup vinculada, quando aplicável
startup candidata vinculada, quando aplicável
funil vinculado, quando aplicável
tipo de registro
data de referência, quando aplicável
```

Itens com registro temporal:

```txt
funis
etapas
startups candidatas
avaliações
atividades/follow-ups
alterações de resultado/desfecho
conversões para portfólio
startups do portfólio
alterações de Perfil
Tier
Status de Jornada
Engajamento
Assessments
OKRs
métricas
consolidações mensais
Planos de Ação
tarefas
movimentações no Kanban
atividades
rituais/reuniões
notas/transcrições
documentos/anexos/evidências
Resumos de Contexto
jobs de IA
```

## 45. Filtros por data

Filtros importantes:

```txt
data de criação
data de entrega
data de atualização
data de conclusão
data da atividade
período personalizado
mês
quarter
edição/funil
```

## 46. Quarter atual

Sempre que fizer sentido, default = quarter atual.

Aplica-se a:

```txt
Página Operacional
Assessment
OKRs
Métricas
Plano de Ação
Kanban
Resumo de Contexto
```

---

# PARTE 6 — FORA DO ESCOPO DO MVP

Não entra no MVP:

```txt
acesso de startups
acesso de acionistas
acesso de mentores
acesso externo de avaliadores
acesso externo de investidores
envio real de WhatsApp pelo sistema
envio real de e-mail pelo sistema
integração com WhatsApp API
integração com Gmail/Outlook
integrações complexas com Drive
histórico automático de mensagens
automações de follow-up
agentes autônomos
reports automáticos avançados
permissionamento complexo por stakeholder
área externa para startups preencherem dados
área externa para avaliadores preencherem notas
importação automática de métricas
área de importação de planilhas para métricas do portfólio
analytics avançado
comparação sofisticada entre edições
workflows automáticos de aprovação
configuração avançada de etapas de Kanban
feature própria para Focus Month
feature própria para Sprint Planning
contratação obrigatória de API paga de IA
chamadas automáticas recorrentes para IA paga
execução do modelo local diretamente dentro da Vercel
execução do modelo local diretamente dentro do Supabase Edge Functions
análise completa de todos os documentos da startup a cada atualização de contexto
```

---

# PARTE 7 — CRITÉRIOS DE SUCESSO

O MVP será bem-sucedido se:

- Usuário conseguir gerenciar o funil atual do Investor Day.
- Dados da planilha atual forem importados.
- Startups candidatas aparecerem em Kanban.
- Etapa e resultado forem separados.
- Usuário conseguir marcar startups como ganhas, perdidas ou acompanhar futuramente.
- Usuário conseguir visualizar e editar avaliações.
- Usuário conseguir configurar formulários para próximos funis.
- WhatsApp Web abrir a partir da candidata.
- Usuário conseguir converter candidata em startup do portfólio.
- Usuário conseguir acessar contexto de qualquer startup do portfólio.
- Usuário conseguir preparar reunião sem buscar em múltiplos lugares.
- Usuário conseguir visualizar Assessment, OKRs, Métricas, Plano de Ação e Kanban em fluxo lógico.
- Usuário conseguir atualizar tarefas durante ou logo após reuniões.
- Usuário conseguir criar, editar, arquivar e movimentar tarefas.
- Usuário conseguir acessar documentos, evidências e registros relevantes.
- Usuário conseguir visualizar tarefas em Meu Kanban.
- Usuário conseguir visualizar atividades na Página Inicial.
- Usuário conseguir atualizar Resumo de Contexto com IA local sem custo por chamada.
- Sistema conseguir processar jobs de IA de forma assíncrona.
- Sistema reduzir dependência de memória, mensagens soltas, pastas desorganizadas e anotações dispersas.
- Sistema preservar histórico por funil, edição de Investor Day e startup.

---

# PARTE 8 — CRITÉRIOS DE ACEITE

## 47. CRM de Originação / Investor Day

### 47.1 Funis

Aceito se:

- criar funil;
- editar funil;
- configurar etapas;
- visualizar funis ativos, encerrados e arquivados;
- manter histórico por funil.

### 47.2 Kanban do funil

Aceito se:

- exibir etapas como colunas;
- exibir candidatas como cards;
- permitir mover candidatas entre etapas;
- exibir dados essenciais no card;
- preservar resultado separado da etapa.

### 47.3 Startup Candidata

Aceito se:

- visualizar dados básicos;
- editar dados;
- alterar etapa;
- alterar resultado;
- registrar atividade;
- abrir WhatsApp Web;
- visualizar avaliações;
- visualizar documentos e links;
- converter em Startup do Portfólio.

### 47.4 Avaliações

Aceito se:

- importar avaliações existentes;
- visualizar avaliação consolidada;
- visualizar avaliações individuais;
- editar avaliação;
- criar avaliação manual;
- configurar formulário para próximos funis.

### 47.5 Conversão para Portfólio

Aceito se:

- criar startup no módulo de Portfólio;
- copiar dados relevantes;
- preservar vínculo com candidata;
- marcar candidatura como ganha/convertida;
- permitir consultar histórico do CRM após conversão.

---

## 48. Portfólio

### 48.1 Página Inicial

Aceito se:

- exibir lista básica de startups;
- permitir acesso à Página Operacional;
- exibir atividades do usuário logado;
- exibir tarefas do usuário logado;
- permitir filtros básicos.

### 48.2 Perfil da Startup

Aceito se:

- cadastrar e editar campos definidos;
- separar blocos de informação;
- configurar campos obrigatórios/opcionais;
- definir preenchimento via formulário ou interno.

### 48.3 Página Operacional

Aceito se:

- exibir cabeçalho;
- exibir Tier, Status de Jornada e Engajamento;
- exibir último update automático;
- abrir no quarter atual por padrão;
- permitir alteração de período;
- exibir Resumo de Contexto;
- exibir Objetivos e Indicadores;
- exibir Kanban;
- exibir Rituais e Reuniões;
- exibir Buildagem, Anexos e Evidências;
- exibir Relacionamento e Atividades.

### 48.4 Assessment

Aceito se:

- criar;
- editar;
- vincular a quarter;
- sugerir quarter atual;
- expandir na Página Operacional;
- possuir link para Wiki/metodologia;
- possuir configuração de formulário.

### 48.5 OKRs

Aceito se:

- criar e editar;
- conter objetivo, resultados-chave, quarter, dono/área, status, evolução e observação;
- status padrão = Em andamento;
- permitir status definidos;
- exibir em Objetivos e Indicadores.

### 48.6 Métricas

Aceito se:

- exibir métricas padrão;
- permitir atualização manual;
- permitir consolidação mensal manual;
- mostrar valor atual, anterior e variação;
- permitir expansão para gráfico e insights.

### 48.7 Plano de Ação

Aceito se:

- vincular aos OKRs;
- conter OKR, dono, iniciativas, status e observação;
- não substituir Kanban;
- funcionar como camada gerencial entre OKR e execução.

### 48.8 Kanban

Aceito se:

- cada startup tiver Kanban próprio;
- criar tarefa;
- editar tarefa;
- arquivar tarefa;
- movimentar tarefa entre fases;
- usar fases como status;
- não exigir preenchimento duplicado;
- permitir filtros;
- disponibilizar Meu Kanban;
- alternar entre Kanbans.

### 48.9 Rituais e Reuniões

Aceito se:

- registrar ou linkar reuniões;
- registrar ou linkar notas;
- registrar ou linkar transcrições;
- associar com startup correta;
- considerar Granola como prioridade;
- não exigir entidade própria de decisão.

### 48.10 Buildagem, Anexos e Evidências

Aceito se:

- organizar documentos e links;
- associar entregáveis à startup;
- vincular links a tarefas;
- permitir consulta por startup e período.

### 48.11 Relacionamento e Atividades

Aceito se:

- criar atividades;
- editar atividades;
- registrar canal, data, responsável, participantes, observação e link externo;
- preencher responsável com usuário logado;
- preencher startup automaticamente quando criada dentro da Página da Startup;
- permitir status de atividade;
- não exigir envio real de e-mail ou WhatsApp.

---

## 49. IA Local e Resumo de Contexto

Aceito se:

- criar job de geração;
- processar job usando worker local;
- usar modelo local/open-source sem custo por token;
- salvar contexto no Supabase;
- manter histórico de versões;
- permitir edição posterior;
- lidar com worker offline;
- permitir troca futura de provedor;
- não depender de API paga no MVP;
- registrar modelo utilizado;
- registrar versão do prompt;
- registrar status do processamento;
- exibir mensagens claras ao usuário.

---

# PARTE 9 — RISCOS

## 50. Riscos

### 50.1 Excesso de complexidade

O sistema não pode virar burocracia.

Mitigação:

- campos mínimos;
- fluxo simples;
- atualização rápida;
- priorização do MVP.

### 50.2 Duplicidade

Regra:

```txt
tarefa = execução
atividade = interação, agenda ou follow-up
decisão = registro natural em reunião/transcrição
```

### 50.3 Mistura entre CRM e Portfólio

Candidata não é startup do portfólio.

Mitigação:

- conversão apenas por ação explícita.

### 50.4 IA sobre base desorganizada

Mitigação:

- dados estruturados;
- registros temporais;
- vínculos claros;
- lógica incremental.

### 50.5 Integrações

Mitigação:

- Granola como prioridade;
- links manuais como alternativa;
- WhatsApp/e-mail preparados para futuro, sem integração obrigatória no MVP.

### 50.6 IA local

Riscos:

- menor qualidade;
- maior tempo de processamento;
- worker offline;
- necessidade de configuração técnica;
- limitação de máquina.

Mitigação:

- botão manual;
- jobs persistidos;
- reprocessamento;
- edição manual;
- arquitetura preparada para API paga futura.

---

# PARTE 10 — EVOLUÇÕES FUTURAS

Possíveis evoluções:

```txt
acesso para startups
visão executiva para acionistas
acesso de mentores
acesso externo para avaliadores
acesso externo para investidores
permissões por tipo de documento
integração com Drive
integração com Granola
integração com Gmail
integração com WhatsApp
WhatsApp API
templates de mensagem
mensagens sugeridas por IA
agentes de follow-up
histórico automático de contato
agentes de IA para contexto pré-reunião
reports automáticos
geração automática de follow-ups
recomendação de próximos passos
comparação entre startups
dashboard executivo do portfólio
dashboard executivo de originação
configuração de metodologias e rituais
feature própria para Focus Month
feature própria para Sprint Planning
formulário externo para avaliadores
formulário externo para startups
automações por etapa
alertas de follow-up
scoring automático
comparação entre edições do Investor Day
recomendações de avanço com IA
geração automática de resumo da startup candidata
análise automática de pitch deck
troca de modelo local por API paga
camada de provedores de IA configurável
controle de custo por chamada
logs de uso de IA
modelos especializados por tipo de tarefa
```

---

# PARTE 11 — INSTRUÇÕES PARA O AGENTE DE DESENVOLVIMENTO

## 51. Prioridade de implementação sugerida

### Fase 1 — Base do sistema

1. Configurar projeto.
2. Configurar Supabase.
3. Criar autenticação.
4. Criar estrutura base de usuários.
5. Criar layout principal.
6. Criar navegação entre módulos.

### Fase 2 — CRM de Originação

1. Criar entidades de funil, etapas e candidatas.
2. Criar Kanban do funil.
3. Criar página da Startup Candidata.
4. Criar resultado/desfecho.
5. Criar atividades/follow-ups.
6. Criar botão WhatsApp Web.
7. Criar importação inicial da planilha.
8. Criar avaliações.
9. Criar conversão para Portfólio.

### Fase 3 — Portfólio

1. Criar Perfil da Startup.
2. Criar Página Operacional.
3. Criar Tiers, Status de Jornada e Engajamento.
4. Criar Objetivos e Indicadores.
5. Criar Assessment.
6. Criar OKRs.
7. Criar Métricas.
8. Criar Plano de Ação.
9. Criar Kanban do Portfólio.
10. Criar Rituais e Reuniões.
11. Criar Buildagem, Anexos e Evidências.
12. Criar Relacionamento e Atividades.

### Fase 4 — IA Local

1. Criar tabelas de jobs de IA.
2. Criar tabelas de versões de contexto.
3. Criar botão Atualizar Contexto.
4. Criar worker local com Ollama.
5. Processar jobs pendentes.
6. Salvar contexto gerado.
7. Exibir histórico de versões.
8. Permitir edição posterior.

---

## 52. Regras para desenvolvimento

- Priorizar MVP funcional.
- Evitar automações prematuras.
- Não criar integrações pagas no MVP.
- Não implementar acesso externo no MVP.
- Garantir separação entre CRM e Portfólio.
- Garantir logs e datas em registros relevantes.
- Criar estrutura preparada para evolução futura.
- Sempre que houver dúvida, preferir solução simples e extensível.
- Não duplicar conceitos: tarefa, atividade e decisão têm papéis diferentes.
- Não tratar startup candidata como startup do portfólio antes da conversão.

---

## 53. Conclusão

O IARIS Portfolio OS deve começar como um sistema interno, enxuto e operacional.

O MVP deve cobrir:

1. Originação / Investor Day.
2. Gestão operacional do Portfólio.
3. Resumo de Contexto com IA local sem custo por chamada.

O sistema será bem-sucedido se reduzir a dependência de planilhas, documentos soltos, mensagens dispersas e memória individual, criando uma base operacional confiável para gerir startups desde a originação até a aceleração no portfólio.
