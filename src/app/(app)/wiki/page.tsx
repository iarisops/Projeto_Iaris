export const metadata = { title: 'Wiki de Metodologia — IARIS Portfolio OS' }

const TIERS = [
  {
    label: 'Tier 0',
    name: 'Onboarding',
    color: 'bg-[#eceef7] text-[#4d5b7c] border-[#e2e8f4]',
    description: 'Startup recém-chegada, em entendimento e diagnóstico inicial.',
    detail: 'A startup acabou de entrar no portfólio. O foco é conhecer profundamente o negócio, fazer o diagnóstico inicial, alinhar expectativas e estruturar a relação com a IARIS.',
  },
  {
    label: 'Tier 1',
    name: 'Observação e Estruturante',
    color: 'bg-[#eef8f8] text-[#007a7a] border-[#009999]/30',
    description: 'Precisa fortalecer execução, foco, clareza estratégica ou fundamentos.',
    detail: 'A startup tem potencial, mas ainda apresenta lacunas em fundamentos. Pode ser falta de clareza de ICP, dificuldade de execução, problemas de foco ou ausência de processos mínimos. O trabalho da IARIS é estruturante.',
  },
  {
    label: 'Tier 2',
    name: 'Desenvolvimento',
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
    description: 'Em construção de ICP/PMF, validação comercial e primeiros sinais de tração.',
    detail: 'A startup está em fase ativa de construção: buscando o ICP, validando o PMF, fechando os primeiros pagantes e estruturando processos comerciais. Já tem clareza de direção, mas ainda está provando o modelo.',
  },
  {
    label: 'Tier 3',
    name: 'Aceleração',
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
    description: 'Alta execução, tração comprovada e potencial de escalar.',
    detail: 'A startup demonstrou tração real, tem processos rodando e está preparada para acelerar. O trabalho da IARIS é ajudar a escalar o que já funciona e preparar para próximos rounds ou expansão.',
  },
]

const JOURNEY_STATUSES = [
  {
    value: 'Em Onboarding',
    color: 'bg-[#eceef7] text-[#4d5b7c] border-[#e2e8f4]',
    description: 'Startup recém-chegada, em processo de integração e diagnóstico inicial com a IARIS.',
    detail: 'Momento de entendimento mútuo. A IARIS está conhecendo o negócio, os founders e os desafios. A startup está aprendendo como funciona a parceria.',
  },
  {
    value: 'Tese em revisão',
    color: 'bg-[#f5f0ff] text-[#6d28d9] border-[#7c3aed]/25',
    description: 'A startup está revisando ou ajustando sua tese central: problema, solução, cliente ou modelo.',
    detail: 'Situação comum em estágios iniciais. Pode ser um pivot parcial, ajuste de ICP ou reformulação do modelo de receita. Exige atenção especial da IARIS para validar a nova direção.',
  },
  {
    value: 'Buscando 1º piloto',
    color: 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c]/30',
    description: 'Em busca ativa do primeiro cliente ou projeto piloto para validar a solução.',
    detail: 'A tese está definida, mas ainda não há validação real de mercado. O objetivo central é fechar o primeiro piloto que permita testar hipóteses com um cliente real.',
  },
  {
    value: 'Piloto em validação',
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
    description: 'Piloto em andamento — coletando dados e aprendizados para confirmar hipóteses.',
    detail: 'A startup tem um cliente de referência ativo. O foco é extrair aprendizados, medir resultados e decidir se o modelo é replicável. É um momento de cautela e rigor analítico.',
  },
  {
    value: 'Primeiros pagantes',
    color: 'bg-[#ecfdf5] text-[#065f46] border-[#059669]/25',
    description: 'Primeiros contratos pagos fechados. Foco em entender o ciclo de venda e replicar.',
    detail: 'Marco importante: a startup provou que alguém paga pelo produto. Agora o trabalho é entender o que funcionou, padronizar o processo de venda e começar a replicar.',
  },
  {
    value: 'Tração inicial',
    color: 'bg-[#eef8f8] text-[#007a7a] border-[#009999]/30',
    description: 'Padrão nascente de crescimento. Clientes chegam com alguma consistência.',
    detail: 'Há um sinal de demanda recorrente, mas o motor ainda não é previsível. O MRR cresce, mas a cadência de aquisição ainda depende muito de esforço manual e relacionamento.',
  },
  {
    value: 'Motor de crescimento em construção',
    color: 'bg-[#eff6ff] text-[#1d4ed8] border-[#3b82f6]/30',
    description: 'Estruturando processos, time e canais para crescer de forma mais previsível.',
    detail: 'A startup sabe o que funciona e está profissionalizando. Contratando time, estruturando playbook de vendas, definindo canais e criando processos repetíveis. É uma fase de muito investimento e organização.',
  },
  {
    value: 'Motor de crescimento em evolução contínua',
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
    description: 'Motor existente e funcionando. Trabalho é refinar, otimizar e acelerar.',
    detail: 'O motor de crescimento existe e gera resultados consistentes. O trabalho agora é otimizar CAC, melhorar LTV, reduzir churn e preparar para escalar sem quebrar os processos.',
  },
  {
    value: 'Pronta para aceleração/escala',
    color: 'bg-[#f0fdf4] text-[#166534] border-[#22c55e]/40',
    description: 'Fundamentos sólidos, tração comprovada e preparada para escalar.',
    detail: 'A startup tem produto, mercado e modelo validados. Está pronta para injetar capital ou energia e crescer de forma acelerada, seja via expansão geográfica, novos segmentos ou contratação intensiva.',
  },
  {
    value: 'Em captação',
    color: 'bg-[#fdf4ff] text-[#7e22ce] border-[#a855f7]/30',
    description: 'Em processo ativo de captação de investimento (seed, série A, etc.).',
    detail: 'A startup está em roadshow ou em negociação com investidores. Exige suporte específico da IARIS: preparação de materiais, introductions, revisão de termos e manutenção da operação em paralelo.',
  },
]

const ENGAGEMENT_LEVELS = [
  {
    level: 'Alto',
    color: 'bg-[#edfdf4] text-[#15803d] border-[#16a34a]/30',
    description: 'Participa, traz dados, executa combinados e usa bem a IARIS.',
    detail: 'A startup se apresenta nos rituais, atualiza dados sem precisar de cobrança, executa o que foi combinado e aproveita o suporte oferecido. A relação é colaborativa e produtiva.',
  },
  {
    level: 'Médio',
    color: 'bg-[#fffbea] text-[#b45309] border-[#fbb33d]/40',
    description: 'Participa de forma irregular e precisa de cobrança leve.',
    detail: 'A startup participa, mas de forma inconsistente. Às vezes precisa de lembretes para atualizar dados ou aparecer nas reuniões. O engajamento existe, mas não é autônomo.',
  },
  {
    level: 'Baixo',
    color: 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c]/30',
    description: 'Responde pouco, participa pouco ou não atualiza dados.',
    detail: 'A startup tem dificuldade de manter o relacionamento ativo. Pode estar sobrecarregada, desinteressada ou com prioridades conflitantes. Requer atenção e abordagem proativa da IARIS.',
  },
  {
    level: 'Crítico',
    color: 'bg-[#fef2f2] text-[#b91c1c] border-[#dc2626]/30',
    description: 'Praticamente ausente ou sem prioridade na relação.',
    detail: 'A startup está essencialmente fora da relação com a IARIS. Não responde, não participa e não atualiza. Situação que exige decisão sobre o futuro da relação.',
  },
]

const ADERENCIA = [
  { tier: 'Tier 0', statuses: ['Em Onboarding'] },
  { tier: 'Tier 1', statuses: ['Tese em revisão', 'Buscando 1º piloto', 'Piloto em validação'] },
  { tier: 'Tier 2', statuses: ['Primeiros pagantes', 'Tração inicial'] },
  { tier: 'Tier 3', statuses: ['Motor de crescimento em construção', 'Motor de crescimento em evolução contínua', 'Pronta para aceleração/escala', 'Em captação'] },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 flex flex-col gap-4">
      <h2 className="font-headline text-lg font-bold text-text-primary border-b border-border pb-3">{title}</h2>
      {children}
    </section>
  )
}

function Card({ color, title, subtitle, description, detail }: {
  color: string; title: string; subtitle?: string; description: string; detail?: string
}) {
  return (
    <div className={`border p-4 flex flex-col gap-1.5 ${color}`}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-headline font-bold text-sm">{title}</span>
        {subtitle && <span className="text-xs font-semibold opacity-80">— {subtitle}</span>}
      </div>
      <p className="text-xs font-semibold opacity-90">{description}</p>
      {detail && <p className="text-xs opacity-70 leading-relaxed mt-0.5">{detail}</p>}
    </div>
  )
}

export default function WikiPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <h1 className="font-headline text-xl font-bold text-text-primary">Wiki de Metodologia</h1>
        <p className="text-sm text-text-muted mt-1">
          Referência interna da metodologia IARIS para classificação e acompanhamento de startups do portfólio.
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-xs font-label font-semibold uppercase tracking-wide">
          {[
            { href: '#tiers',       label: 'Tiers' },
            { href: '#jornada',     label: 'Status de Jornada' },
            { href: '#engajamento', label: 'Engajamento' },
            { href: '#aderencia',   label: 'Aderência Tier × Jornada' },
            { href: '#logica',      label: 'Lógica Operacional' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="text-primary hover:underline">
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 max-w-3xl flex flex-col gap-12">

        {/* Tiers */}
        <Section id="tiers" title="Tiers de Acompanhamento">
          <p className="text-sm text-text-secondary leading-relaxed">
            Os Tiers classificam o momento e o tipo de suporte que cada startup do portfólio precisa.
            Não são uma escala de qualidade — uma startup em Tier 0 não é pior que uma em Tier 3.
            São estágios diferentes que demandam abordagens diferentes da IARIS.
          </p>
          <div className="flex flex-col gap-3">
            {TIERS.map((t) => (
              <Card key={t.label} color={t.color} title={t.label} subtitle={t.name}
                description={t.description} detail={t.detail} />
            ))}
          </div>
        </Section>

        {/* Status de Jornada */}
        <Section id="jornada" title="Status de Jornada">
          <p className="text-sm text-text-secondary leading-relaxed">
            O Status de Jornada representa o momento atual da startup na sua trajetória de crescimento.
            É mais granular que o Tier e foca no <strong>o que a startup está fazendo agora</strong>,
            enquanto o Tier foca em <strong>como a IARIS acompanha</strong>.
          </p>
          <div className="flex flex-col gap-3">
            {JOURNEY_STATUSES.map((j) => (
              <Card key={j.value} color={j.color} title={j.value}
                description={j.description} detail={j.detail} />
            ))}
          </div>
        </Section>

        {/* Engajamento */}
        <Section id="engajamento" title="Nível de Engajamento">
          <p className="text-sm text-text-secondary leading-relaxed">
            O Engajamento mede a qualidade da relação da startup com a IARIS — sua presença,
            responsividade e aproveitamento do suporte oferecido. É uma sinalização interna da
            saúde do relacionamento.
          </p>
          <div className="flex flex-col gap-3">
            {ENGAGEMENT_LEVELS.map((e) => (
              <Card key={e.level} color={e.color} title={e.level}
                description={e.description} detail={e.detail} />
            ))}
          </div>
        </Section>

        {/* Aderência Tier × Jornada */}
        <Section id="aderencia" title="Aderência — Tier × Status de Jornada">
          <p className="text-sm text-text-secondary leading-relaxed">
            Tier e Status de Jornada são campos independentes, mas tendem a ser coerentes entre si.
            A tabela abaixo mostra quais status de jornada são mais naturais para cada Tier.
            Divergências podem indicar necessidade de revisão da classificação.
          </p>
          <div className="flex flex-col gap-2">
            {ADERENCIA.map((row) => (
              <div key={row.tier} className="bg-surface border border-border p-3 flex items-start gap-4">
                <span className="text-xs font-label font-bold text-text-secondary w-14 shrink-0 pt-0.5">{row.tier}</span>
                <div className="flex flex-wrap gap-1.5">
                  {row.statuses.map((s) => {
                    const journey = JOURNEY_STATUSES.find((j) => j.value === s)
                    return (
                      <span
                        key={s}
                        className={`text-[11px] border px-2 py-0.5 font-label ${journey?.color ?? 'bg-surface-2 border-border text-text-secondary'}`}
                      >
                        {s}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Lógica Operacional */}
        <Section id="logica" title="Lógica Operacional — Assessment → OKRs → Métricas → Plano de Ação → Kanban">
          <p className="text-sm text-text-secondary leading-relaxed">
            A Página Operacional de cada startup segue uma lógica de cascata que conecta diagnóstico,
            objetivos, indicadores e execução:
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                step: '1. Assessment',
                desc: 'Diagnóstico trimestral por categoria (Estratégia, Produto, Distribuição, Mercado, Operação, Founder). Usa sinais de semáforo (🔴🟠🟡🟢) para identificar onde a startup está bem e onde precisa de atenção.',
              },
              {
                step: '2. OKRs',
                desc: 'Com base no diagnóstico, definem-se os objetivos do quarter e os resultados-chave mensuráveis. Os OKRs respondem: "Onde queremos chegar neste trimestre?"',
              },
              {
                step: '3. Métricas',
                desc: 'Indicadores quantitativos acompanhados ao longo do quarter: MRR, clientes ativos, churn, CAC, LTV, runway, entre outros. As métricas mostram se os OKRs estão sendo atingidos.',
              },
              {
                step: '4. Plano de Ação',
                desc: 'Iniciativas vinculadas aos OKRs. O Plano de Ação responde: "O que precisa acontecer para o OKR avançar?" É uma camada gerencial, não operacional.',
              },
              {
                step: '5. Kanban',
                desc: 'Tarefas operacionais em execução. O Kanban responde: "Quem está fazendo o quê agora?" Status da tarefa = fase do Kanban (não há campo de status separado).',
              },
            ].map((item) => (
              <div key={item.step} className="bg-surface border border-border p-3 flex flex-col gap-1">
                <span className="text-sm font-semibold text-text-primary">{item.step}</span>
                <span className="text-xs text-text-secondary leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
