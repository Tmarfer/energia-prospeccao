/* global React, UI */
const { useState } = React;
const { Glossary, Badge, Callout } = window.UI;

/* ── 4.1 data ── */
const CONFORMIDADE_INTRO = [
  {
    kicker: "O que muda",
    title: "Obrigações automáticas",
    body: "Ao receber a outorga, o empreendedor assume obrigações declaratórias e procedimentais que persistem durante toda a implantação — independente do andamento da obra."
  },
  {
    kicker: "Quando vence",
    title: "Prazos fixos e contínuos",
    body: "Declarações mensais até o dia 15, pedidos de alteração antes do vencimento, protocolos formais em cada fase. A maioria dos prazos não pode ser recuperada retroativamente."
  },
  {
    kicker: "O risco",
    title: "Infração autônoma",
    body: "Descumprir obrigação declaratória é infração autônoma — sujeita a penalidade própria, mesmo que a obra esteja progredindo normalmente e sem qualquer atraso físico."
  }
];

/* ── Tab 1 data ── */
const DECL_ITEMS = [
  { title: "Licenciamento ambiental", desc: "LP, LI e LO — fase atual, data de obtenção e previsão da próxima etapa" },
  { title: "Status da conexão", desc: "CUST/CUSD assinado ou em negociação com o agente de transmissão/distribuição" },
  { title: "Avanço físico das obras", desc: "Percentual declarado pelo empreendedor — verificável a qualquer tempo por vistoria ANEEL" },
  { title: "Previsão de operação", desc: "Data atualizada de início de operação comercial conforme cronograma vigente" },
  { title: "Alterações relevantes", desc: "Qualquer mudança nas condições do projeto desde a última declaração mensal" }
];

/* ── Tab 2 data ── */
const ALTER_TYPES = [
  {
    num: "01", sev: "red",
    title: "Alteração de cronograma",
    desc: "Quando há previsão de atraso com motivo justificado — diferente do excludente de responsabilidade. Solicitar antes do vencimento.",
    alert: "Solicitar depois = confissão de atraso"
  },
  {
    num: "02", sev: "amber",
    title: "Características técnicas",
    desc: "Mudança de tecnologia, layout de aerogeradores, configuração de painéis solares ou rearranjo de unidades geradoras.",
    alert: "Aprovação prévia formal obrigatória"
  },
  {
    num: "03", sev: "amber",
    title: "Redução ou ampliação de potência",
    desc: "Qualquer desvio significativo da potência outorgada — para cima ou para baixo — exige aprovação antes de qualquer obra.",
    alert: "Aprovação antes de qualquer obra"
  },
  {
    num: "04", sev: "blue",
    title: "Transferência de titularidade",
    desc: "Quando a SPE muda de controlador ou a outorga é cedida. Alta demanda no mercado de M&A em renováveis. Exige análise técnica e financeira do novo titular.",
    alert: "Serviço de alta demanda em M&A"
  }
];

/* ── Tab 3 data ── */
const TESTE_ITEMS = [
  { title: "Requerimento formal", desc: "Protocolar junto à ANEEL o pedido de autorização de operação em teste antes do início" },
  { title: "Documentação técnica", desc: "Laudo de comissionamento das unidades geradoras — fabricante ou entidade credenciada" },
  { title: "Notificação ao agente", desc: "Comunicar o agente de transmissão que a conexão está energizada e a medição ativa" },
  { title: "Controle de prazo", desc: "Monitorar o prazo máximo — vencer sem protocolo do pedido de operação comercial = novo atraso formal" }
];

/* ── Tab 4 data ── */
const COMERCIAL_DOCS = [
  { title: "Laudo de comissionamento", desc: "Todas as unidades geradoras — fabricante ou entidade credenciada" },
  { title: "Confirmação de conexão", desc: "Conexão energizada com início de medição de produção ativa" },
  { title: "CUST/CUSD em vigor", desc: "Contrato de conexão vigente e medição ativa confirmada pelo agente" },
  { title: "Declaração do agente", desc: "Conexão dentro das especificações técnicas e em situação regular" },
  { title: "Relatório de ensaios", desc: "Testes de comissionamento de todas as unidades geradoras realizados" }
];

/* ── Sub-components ── */
function ObrigItem({ n, title, desc }) {
  return (
    <div className="obrig-item">
      <div className="oi-num">{n}</div>
      <div className="oi-body">
        <div className="oi-title">{title}</div>
        <div className="oi-desc">{desc}</div>
      </div>
    </div>
  );
}

function TabRisk({ color, head, children }) {
  return (
    <div className={`tab-risk-box trb-${color}`}>
      <div className="trb-head">{head}</div>
      <div className="trb-body">{children}</div>
    </div>
  );
}

/* ── Tabs ── */
const TABS = [
  {
    id: "decl",
    label: "Declarações periódicas (mensais)",
    render: () => (
      <div className="tab-body">
        <div className="tab-headline">
          <span className="th-badge">Todo mês · até o dia 15</span>
          <p>Todo empreendimento em implantação deve alimentar o <Glossary term="RAPEEL">RAPEEL</Glossary> com dados atualizados. Esses dados constroem o <Glossary term="RALIE">RALIE</Glossary> público da ANEEL — <strong>o que o mercado vê do seu projeto é o que você declarou.</strong></p>
        </div>

        <div className="tab-sec-title">O que precisa ser declarado</div>
        <div className="obrig-list">
          {DECL_ITEMS.map((item, i) => (
            <ObrigItem key={i} n={i + 1} title={item.title} desc={item.desc} />
          ))}
        </div>

        <div className="tab-boxes">
          <TabRisk color="red" head="⚠ Risco de não conformidade">
            Declaração não prestada, inconsistente ou falsa é <strong>infração autônoma</strong>, independente do andamento da obra. A ANEEL cruza dados declarados com IBAMA e agentes de transmissão e identifica inconsistências automaticamente.
          </TabRisk>
          <TabRisk color="green" head="✓ O que o serviço entrega">
            Declarações <strong>tempestivas, consistentes e defensáveis</strong> — não apenas preenchidas. Uma declaração que cria inconsistência com registros anteriores pode ser mais prejudicial do que a ausência de declaração.
          </TabRisk>
        </div>
      </div>
    )
  },
  {
    id: "alter",
    label: "Alterações de outorga",
    render: () => (
      <div className="tab-body">
        <div className="tab-headline">
          <span className="th-badge th-badge-red">Aprovação prévia — nunca posterior</span>
          <p>Qualquer modificação nas condições originais da <Glossary term="Outorga">outorga</Glossary> requer aprovação formal da ANEEL <strong>antes</strong> de ser implementada — não depois.</p>
        </div>

        <div className="tab-sec-title">Principais tipos de alteração</div>
        <div className="alter-grid">
          {ALTER_TYPES.map(a => (
            <div key={a.num} className="alter-card">
              <div className="ac-num">{a.num}</div>
              <div className="ac-body">
                <div className="ac-title">{a.title}</div>
                <div className="ac-desc">{a.desc}</div>
                <div className={`ac-alert ac-${a.sev}`}>{a.alert}</div>
              </div>
            </div>
          ))}
        </div>

        <TabRisk color="red" head="⚠ Risco de implementar sem aprovação">
          Operar em situação irregular configura infração administrativa autônoma — com penalidade própria, <strong>sobreposta</strong> a qualquer outra situação já existente no projeto.
        </TabRisk>
      </div>
    )
  },
  {
    id: "teste",
    label: "Operação em teste",
    render: () => (
      <div className="tab-body">
        <div className="tab-headline">
          <span className="th-badge th-badge-amber">A fase mais negligenciada</span>
          <p>Período entre a <strong>conclusão física</strong> da usina e a <strong>autorização formal</strong> de operação comercial. Tem obrigações próprias e prazo máximo regulamentar.</p>
        </div>

        <div className="tab-sec-title">Obrigações nessa fase</div>
        <div className="obrig-list">
          {TESTE_ITEMS.map((item, i) => (
            <ObrigItem key={i} n={i + 1} title={item.title} desc={item.desc} />
          ))}
        </div>

        <TabRisk color="amber" head="⚠ O empreendedor muitas vezes não percebe">
          A usina está gerando e o cliente está satisfeito. A percepção é de que "está tudo bem." Mas regulatoriamente o projeto ainda está em implantação — <strong>sujeito a multa por atraso na obtenção da Portaria de operação comercial.</strong>
        </TabRisk>
      </div>
    )
  },
  {
    id: "comercial",
    label: "Operação comercial",
    render: () => (
      <div className="tab-body">
        <div className="tab-headline">
          <span className="th-badge th-badge-green">A Portaria no Diário Oficial</span>
          <p>A entrada em operação comercial é formalizada pela ANEEL por Portaria publicada no Diário Oficial da União — esse é o marco que encerra formalmente a fase de implantação.</p>
        </div>

        <div className="tab-sec-title">Documentação necessária para obter a Portaria</div>
        <div className="obrig-list">
          {COMERCIAL_DOCS.map((doc, i) => (
            <ObrigItem key={i} n={i + 1} title={doc.title} desc={doc.desc} />
          ))}
        </div>

        <TabRisk color="red" head="⚠ Ponto crítico">
          Qualquer documento faltando <strong>atrasa a emissão da Portaria.</strong> Enquanto ela não é emitida, o empreendimento está tecnicamente em atraso — mesmo que a usina esteja gerando energia. A preparação antecipada do dossiê documental é parte do serviço.
        </TabRisk>
      </div>
    )
  }
];

/* ── Main component ── */
function ModuleConformidade() {
  const [tab, setTab] = useState("decl");
  const active = TABS.find(t => t.id === tab);

  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 4</div>
      <h2 className="module-title">Gestão de Conformidade</h2>
      <p className="module-lead">
        O serviço recorrente — a base do relacionamento contínuo com o cliente. A previsibilidade e o volume de obrigações que o empreendedor precisa gerenciar.
      </p>

      <h3 className="section-title"><span className="num">4.1</span>O que é conformidade no universo ANEEL</h3>
      <div className="concept-grid">
        {CONFORMIDADE_INTRO.map((c, i) => (
          <div className="concept-box" key={i}>
            <div className="kicker">{c.kicker}</div>
            <h4>{c.title}</h4>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title"><span className="num">4.2</span>Os quatro blocos de obrigação</h3>
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content" key={tab}>
        {active.render()}
      </div>

      <h3 className="section-title"><span className="num">4.3</span>O <Glossary term="RAPEEL">RAPEEL</Glossary> e sua relação com o <Glossary term="RALIE">RALIE</Glossary></h3>
      <Callout>
        O RAPEEL (sistema declaratório) e o RALIE (painel público) são duas faces do mesmo dado. O empreendedor declara no RAPEEL. A ANEEL consolida e publica no RALIE. <strong>O que o mercado vê — situação de obra, viabilidade, atraso — é o que o empreendedor declarou (ou deixou de declarar).</strong> Gerenciar bem o RAPEEL é controlar a narrativa pública do seu projeto perante a ANEEL e o mercado.
      </Callout>

      <h3 className="section-title"><span className="num">4.4</span>Modelo de engajamento</h3>
      <div className="engagement-grid">
        <div className="eng-card">
          <Badge color="green">Recorrente</Badge>
          <h5>Retainer mensal</h5>
          <p>Acompanhamento contínuo: declarações mensais, monitoramento de prazos e alerta proativo de riscos emergentes. Previsível para o escritório e para o cliente.</p>
        </div>
        <div className="eng-card">
          <Badge color="blue">Pontual</Badge>
          <h5>Projetos específicos</h5>
          <p>Alterações de outorga, pedidos de excludente, defesa em processos de penalidade ou transferência de titularidade. Escopo e honorários definidos por projeto.</p>
        </div>
        <div className="eng-card">
          <Badge color="indigo">Escala</Badge>
          <h5>Portfólio múltiplo</h5>
          <p>Para clientes com vários projetos simultâneos (fundos, grupos com 5–15 projetos). Gestão de portfólio regulatório com visão consolidada de todos os riscos ativos.</p>
        </div>
      </div>
    </div>
  );
}

window.ModuleConformidade = ModuleConformidade;
