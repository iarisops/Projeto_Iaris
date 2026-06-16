# Quickstart — Guia de Validação: IARIS Portfolio OS

**Phase**: 1 | **Date**: 2026-06-14 | **Plan**: [plan.md](plan.md)

Cenários de validação end-to-end para confirmar que o MVP funciona. Executar na ordem —
cada cenário depende do estado gerado pelo anterior.

---

## Pré-requisitos

```bash
# 1. Supabase local rodando
npx supabase start

# 2. Migrations aplicadas
npx supabase db reset

# 3. Tipos gerados
npx supabase gen types typescript --local > src/types/supabase.ts

# 4. Dev server
npm run dev   # http://localhost:3000

# 5. Ollama rodando (apenas para cenário 5)
ollama pull qwen2.5:14b
ollama serve

# 6. Worker (apenas para cenário 5)
node worker/index.js
```

---

## Cenário 1 — Autenticação e provisionamento de usuário

**Objetivo**: Verificar que o fluxo admin → convite → primeiro acesso funciona.

**Passos**:
1. Acessar `http://localhost:3000` sem estar logado → deve redirecionar para `/login`
2. Fazer login com o usuário admin (criado via Supabase Studio na migration seed)
3. Ir para `/usuarios` → clicar em "Convidar usuário"
4. Preencher e-mail e nome de um usuário de teste → submeter
5. O novo usuário deve aparecer na lista com status "Convite enviado"
6. Verificar e-mail de convite (Supabase Studio > Auth > Emails em dev local)
7. Abrir link do convite → deve exibir página `/primeiro-acesso`
8. Definir nova senha → deve redirecionar para dashboard

**Resultado esperado**:
- Rotas protegidas inacessíveis sem autenticação
- Novo usuário logado consegue acessar o sistema normalmente
- `users.must_change_password = false` após trocar a senha

---

## Cenário 2 — CRM: funil, etapas e Kanban

**Objetivo**: Verificar gestão completa do funil e independência etapa/resultado.

**Passos**:
1. Acessar `/crm` → clicar em "Novo funil"
2. Criar "5º Investor Day" com datas e status "Ativo"
3. O funil deve aparecer com as 8 etapas padrão já criadas
4. Abrir o funil → visualizar Kanban com colunas por etapa (vazio)
5. Clicar em "Nova candidata" → preencher nome "Startup Teste", vertical "SaaS B2B",
   nota 7.5, resultado "Em aberto"
6. Card deve aparecer na coluna da etapa padrão
7. Arrastar o card para a coluna "2ª Reunião"
8. Clicar no card → alterar resultado para "Perdida" sem mudar etapa
9. Card permanece na coluna "2ª Reunião" com badge "Perdida"
10. Acessar página da candidata → "Enviar mensagem" sem WhatsApp cadastrado
    → exibe aviso "Adicione um WhatsApp para enviar mensagem."
11. Adicionar WhatsApp → clicar "Enviar mensagem" → abre WhatsApp Web com o número

**Resultado esperado**:
- `stage_id` e `result` são independentes no banco (verificar via Supabase Studio)
- Kanban reflete posição correta após drag

---

## Cenário 3 — CRM: avaliações e importação

**Objetivo**: Verificar avaliação qualitativa IARIS, avaliação de banca e importação.

**Passos**:
1. Na página da "Startup Teste" → abrir "Avaliação Qualitativa IARIS"
2. Preencher sinais por critério (ex: Produto=verde, Founder=amarelo) e recomendação
   "Investor Day" → salvar
3. Avaliação deve aparecer consolidada na página da candidata
4. Criar formulário de banca para o funil → adicionar 3 critérios
5. Adicionar avaliação de banca manualmente → nota 8.5, aprovação=true, comentário
6. A consolidação deve mostrar nota média, percentual de aprovação e comentários
7. Rodar importação do 4º Investor Day:
   ```bash
   npx ts-node scripts/import-investor-day-4.ts
   ```
8. Log deve mostrar total importado, alertas de duplicata e erros
9. Acessar funil "4º Investor Day" → candidatas importadas visíveis no Kanban
10. Verificar mapeamento de status: "Contrato" → etapa "Contrato/MoU enviado",
    resultado "Em aberto"; "Recusa" → resultado "Perdida"

---

## Cenário 4 — Conversão e Portfólio Operacional

**Objetivo**: Verificar conversão candidata → portfólio e a Página Operacional completa.

**Passos**:
1. Alterar resultado da "Startup Teste" para "Ganha"
2. Clicar em "Converter em Startup do Portfólio" → confirmar
3. Startup deve aparecer na lista do dashboard com logo placeholder e nome
4. A candidata original deve exibir "Convertida" com link para o portfólio
5. Tentar converter novamente → sistema bloqueia com aviso
6. Acessar Página Operacional da startup convertida:
   - Filtro de período deve estar no quarter atual
   - Cabeçalho mostra chips coloridos de Tier, Status da Jornada e Engajamento (vazio/tracejado se não definido)
   - Passar o mouse sobre o ícone `?` de cada campo abre tooltip com descrição e link "Ver na Wiki" (abre em nova aba)
   - Clicar em "Editar" ativa modo de edição: seletores aparecem para os 3 campos
   - Selecionar Tier 1 ("Observação e Estruturante"), Status "Em Onboarding", Engajamento "Alto" → clicar "Salvar"
   - Chips coloridos atualizam no cabeçalho; clicar "Cancelar" reverte sem salvar
7. Criar Assessment para o quarter atual → preencher 6 categorias com sinais e texto
8. Criar OKR "Atingir 10 clientes ativos" com 2 key results → status padrão "Em andamento"
9. Atualizar métrica MRR = R$ 8.500 com valor anterior = R$ 7.200
10. Criar tarefa no Kanban → mover de "Backlog" para "Em andamento"
    → verificar que o campo `phase` mudou (sem campo `status` separado)
11. `last_update_at` da startup deve atualizar automaticamente a cada evento
12. Acessar "Meu Kanban" no dashboard → tarefa aparece com startup vinculada
13. Mudar filtro de quarter para quarter anterior → todos os blocos exibem vazio

---

## Cenário 5 — Resumo de Contexto por IA

**Objetivo**: Verificar o fluxo end-to-end de geração de contexto via Ollama.

**Pré-condição**: Startup deve ter OKRs, métricas e atividades cadastrados (Cenário 4).

**Passos**:
1. Na Página Operacional → clicar em "Atualizar Contexto"
2. Interface exibe "Contexto enviado para geração" com status "Pendente"
3. `ai_jobs` deve ter novo registro com `status = 'Pendente'` (verificar Supabase Studio)
4. Worker processa o job → log mostra startup processada, modelo e tokens
5. Status na interface muda para "Novo contexto gerado com sucesso"
6. Resumo exibe seções: Histórico e Jornada, Avanços, Desafios, Métricas, Próximos pontos
7. Editar o resumo manualmente → salvar
   → novo `context_versions` com `was_manually_edited = true`
   → versão anterior preservada no histórico
8. Parar o worker; clicar "Atualizar Contexto" novamente
   → interface exibe "Aguardando processamento pelo worker de IA"
   → job persiste com `status = 'Pendente'`
9. Reiniciar worker → job é processado automaticamente

---

## Verificações de design system

Para qualquer tela implementada, confirmar:
- Fundo Deep Navy `#000033` na camada base
- Botões primários: Teal `#009999`, sem border-radius (0px)
- Fontes: `Hanken Grotesk` em headlines, `Plus Jakarta Sans` em corpo
- Sem sombras — profundidade via camadas tonais
- Grid de 30px visível como padrão de fundo

---

## Referências

- Esquema completo: [data-model.md](data-model.md)
- Server Actions: [contracts/server-actions.md](contracts/server-actions.md)
- Worker: [contracts/worker-contract.md](contracts/worker-contract.md)
- Spec: [spec.md](spec.md)
