/* global React, UI */
const { useState, useEffect } = React;
const { Icon, ckanSQL } = window.UI;

// ── Market stats via ANEEL CKAN ──
const RALIE_RES_ID = "4a615df8-4c25-48fa-bbea-873a36a79518";

// CAPEX médio ponderado para renováveis no Brasil (R$ milhões/MW instalado, ref. 2025)
// Solar utility-scale: ~R$ 4,5M/MW · Eólica: ~R$ 7,0M/MW · PCH: ~R$ 6,0M/MW → média ~R$ 5,5M/MW
const CAPEX_POR_MW = 5.5; // R$ milhões

// Referência hardcoded do painel "Tendência de Expansão" RALIE/ANEEL (Abr/2026)
// Usado como fallback se o endpoint SQL não estiver disponível
const RALIE_REF = { usinas: 2742, mw: 118839, data: "Abr/2026" };

function fmtBilhoes(bilhoes) {
  return bilhoes >= 100
    ? bilhoes.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : bilhoes.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function fmtData(s) {
  if (!s) return "—";
  const d = String(s).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, dd] = d.split("-");
    return `${dd}/${m}/${y}`;
  }
  return d;
}

/* ── Ciclo de vida ── */
const CYCLE_PHASES = [
  {
    id: 1, label: "Leilão / Outorga", zone: "neutral", inZone: false,
    title: "O ponto de partida",
    explanation: "O empreendedor vence o leilão da ANEEL e recebe a outorga — ato jurídico que autoriza a construção e operação de uma usina geradora. Pode ser uma Concessão (grandes hidrelétricas), uma Autorização (renováveis em geral) ou uma Permissão.\n\nJunto com o direito de gerar, vêm obrigações de prazo, declaratórias e técnicas. O cronograma comprometido é uma obrigação contratual — seu descumprimento é infração automática, independentemente das razões do atraso.",
    risk: null
  },
  {
    id: 2, label: "Pré-obra", sub: "Licenças, projetos", zone: "green", inZone: true,
    title: "Fase das licenças e contratos",
    explanation: "Fase de obtenção de licenças ambientais (LP e LI), negociação do contrato de conexão (CUST/CUSD) com o agente de transmissão/distribuição e início das declarações mensais obrigatórias no RAPEEL.\n\nQualquer atraso nessa fase contamina o cronograma comprometido. O empreendedor muitas vezes subestima o tempo dos órgãos ambientais e descobre tarde demais que a Licença de Instalação não veio no prazo previsto.",
    risk: "Licença de Instalação não obtida no prazo · CUST/CUSD não assinado · Declarações mensais omissas"
  },
  {
    id: 3, label: "Obras / Implantação", zone: "green", inZone: true,
    title: "Fase de execução — maior volume de obrigações",
    explanation: "Fase de execução das obras civis e de montagem eletromecânica. O empreendedor deve declarar mensalmente no RAPEEL o percentual de avanço físico e manter consistência com os registros fotográficos enviados à ANEEL.\n\nO cronograma comprometido é monitorado pela SFG (Superintendência de Fiscalização dos Serviços de Geração) mensalmente no RALIE. Uma declaração inconsistente com o avanço real pode ser mais prejudicial do que a ausência de declaração.",
    risk: "Atraso físico não comunicado · Declaração inconsistente com o avanço real · Não solicitação de excludente de responsabilidade em tempo"
  },
  {
    id: 4, label: "Operação", sub: "Teste → Comercial", zone: "amber", inZone: true,
    title: "A fase mais negligenciada",
    explanation: "A usina está fisicamente pronta mas ainda não tem autorização de operação comercial. Requer protocolo formal de requerimento de teste junto à ANEEL e apresentação da documentação técnica de comissionamento.\n\nHá prazo máximo para a operação em teste — se vencer sem protocolo do pedido de operação comercial, configura-se novo atraso formal. A percepção do empreendedor é de que \"está tudo bem\" porque a usina está gerando, mas regulatoriamente o empreendimento ainda está em implantação.",
    risk: "Perda do prazo de teste sem protocolar pedido de operação comercial · Documentação de comissionamento incompleta"
  },
  {
    id: 5, label: "Operação Plena", zone: "neutral", inZone: false,
    title: "Encerramento formal da implantação",
    explanation: "A ANEEL emite a Portaria de operação comercial via Diário Oficial — esse é o marco que encerra formalmente a fase de implantação. A partir daí, o empreendimento deixa de estar sujeito às obrigações de implantação.\n\nAté esse ponto, qualquer documento faltante atrasa a emissão da Portaria — e enquanto ela não é emitida, o empreendimento está tecnicamente em atraso mesmo que a usina esteja gerando energia.",
    risk: null
  }
];

/* ── 3 Pilares ── */
const PILLARS = [
  {
    id: 1, title: "Apoio regulatório", category: "Jurídico-regulatório", color: "green",
    items: [
      "Representação judicial e administrativa",
      "Consultoria de conformidade",
      "Atuação junto à ANEEL",
      "Defesa em penalidades",
      "Suporte em excludente de responsabilidade"
    ],
    explanation: "Atuamos como escritório de referência em todos os procedimentos junto à ANEEL. Representação em processos administrativos, defesa em autos de infração, pedidos de excludente de responsabilidade, alterações de outorga e transferências de titularidade.\n\nCada interação com a agência é preparada estrategicamente — documentação, fundamentação jurídica e timing são determinantes para o resultado. A maioria dos empreendedores não tem assessoria especializada no momento em que mais precisaria."
  },
  {
    id: 2, title: "Gestão de conformidade", category: "Técnico-operacional", color: "blue",
    items: [
      "Emissão e transferência de outorgas",
      "Relatórios mensais à ANEEL (RAPEEL)",
      "Alteração de cronograma",
      "Liberação para operação comercial"
    ],
    explanation: "Gerenciamos todas as obrigações declaratórias e procedimentais do empreendimento — declarações mensais no RAPEEL (todo mês, até o dia 15), pedidos de alteração de cronograma, protocolos de operação em teste e em operação comercial.\n\nPrevisibilidade e controle regulatório durante toda a fase de implantação. O serviço é a base do relacionamento contínuo com o cliente — retainer mensal com visão consolidada de todos os prazos e obrigações ativas."
  },
  {
    id: 3, title: "Assessoria estratégica", category: "Estratégico-financeiro", color: "indigo",
    items: [
      "Apoio a financiadores",
      "Incentivos fiscais (SUDENE/SUDAM)",
      "Benefícios regulatórios",
      "Due diligence em M&A de projetos"
    ],
    explanation: "Assessoramos empreendedores e financiadores em operações de M&A regulatório, due diligence de portfólios de projetos, incentivos fiscais (SUDENE, SUDAM e regimes especiais) e benefícios regulatórios aplicáveis à fase de implantação.\n\nO mercado de renováveis no Brasil tem volume crescente de M&A — fundos e grupos energéticos compram e vendem projetos em implantação. Cada transação exige due diligence regulatória específica sobre o estado das outorgas."
  }
];

/* ── RALIE boxes ── */
const RALIE_BOXES = [
  {
    id: 1, color: "amber",
    title: "Portal RALIE (ANEEL)",
    desc: "Lista TODOS os empreendimentos em implantação no Brasil, por fonte e região",
    detail: "O RALIE — Relatório de Acompanhamento da Expansão da Oferta de Geração — é o painel público da ANEEL atualizado todo dia 15 de cada mês. Contém dados sobre todos os empreendimentos em implantação: situação de obra (não iniciada, em andamento, paralisada, concluída), viabilidade da implantação (Alta, Média, Baixa), cronograma comprometido vs. atual, status de licenças ambientais (LP, LI, LO) e status de conexão (CUST/CUSD). É a principal ferramenta de inteligência comercial do escritório."
  },
  {
    id: 2, color: "orange",
    title: "Leads qualificados",
    desc: "Obras iniciadas ou outorgas recentes = empresas que precisam dos serviços",
    detail: "Filtramos o RALIE por: Situação de obra \"Paralisada\" (urgência máxima — obras paradas), Viabilidade \"Baixa\" (ANEEL não acredita na conclusão do projeto) e Cronograma \"Atrasado\" (penalidade ativa ou iminente). A abordagem usa dados específicos: \"Identificamos no RALIE que seu empreendimento X está com Y — exposição estimada de R$ Z. Atuamos preventivamente nessa fase.\" O cliente percebe que o escritório já conhece o projeto antes do primeiro contato."
  }
];

function ModuleHome({ goTo }) {
  const [openPhase, setOpenPhase] = useState(null);
  const [openPillar, setOpenPillar] = useState(null);
  const [openRalie, setOpenRalie] = useState(null);
  const [mktStats, setMktStats] = useState(null);
  const [mktLoading, setMktLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // SQL agregado: conta usinas únicas e soma MW na última publicação do RALIE,
      // excluindo projetos já concluídos (= Tendência de Expansão)
      const sql = [
        `SELECT count(*) AS n,`,
        `       sum(cast("MdaPotenciaOutorgadaKw" AS float))/1000 AS mw,`,
        `       max("DatRalie") AS dt`,
        `FROM "${RALIE_RES_ID}"`,
        `WHERE "DscSituacaoObra" != 'Conclu\u00edda'`,
        `  AND "DatRalie" = (SELECT max("DatRalie") FROM "${RALIE_RES_ID}")`
      ].join(" ");

      try {
        const res = await ckanSQL(sql);
        if (res?.success && res.result?.records?.[0]) {
          const r = res.result.records[0];
          const usinas = Math.round(parseFloat(r.n || 0));
          const mw     = Math.round(parseFloat(r.mw || 0));
          const capexBilhoes = (mw * CAPEX_POR_MW) / 1000;
          setMktStats({ usinas, mw, capexBilhoes, dataConsulta: fmtData(r.dt), isFallback: false });
          return;
        }
      } catch { /* cai no fallback abaixo */ }

      // Fallback: valores de referência do painel RALIE (Abr/2026)
      const mw = RALIE_REF.mw;
      setMktStats({
        usinas: RALIE_REF.usinas,
        mw,
        capexBilhoes: (mw * CAPEX_POR_MW) / 1000,
        dataConsulta: RALIE_REF.data,
        isFallback: true
      });
    })().finally(() => setMktLoading(false));
  }, []);

  const activePhase = CYCLE_PHASES.find(p => p.id === openPhase);

  return (
    <div className="main-inner">

      {/* ── Hero ── */}
      <div className="home-hero-v2">
        <div className="module-kicker">Apresentação institucional · 2026</div>
        <h1 className="home-title-v2">
          Assessoria regulatória especializada em geração de energia elétrica: da outorga à operação comercial.
        </h1>
        <p className="home-subtitle-v2">
          Atuamos ao lado de empreendedores que ganham leilões e implantam usinas — no momento em que as obrigações regulatórias com a ANEEL são mais críticas e menos compreendidas.
        </p>
        <div className="home-firms-v2">
          <strong>Edson Araújo Advogados</strong>
          <span className="sep">em parceria com</span>
          <strong>Thiago Fernandes Advogado</strong>
        </div>
      </div>

      {/* ── Dimensão do mercado ── */}
      <div className="mkt-opportunity-block">
        <div className="mkt-opp-header">
          <span className="mkt-opp-kicker">Dimensão do mercado · ANEEL / RALIE ao vivo</span>
          <h3 className="mkt-opp-title">O tamanho da oportunidade em geração de energia</h3>
          <p className="mkt-opp-lead">
            Capacidade geradora em fase de implantação no Brasil — cada megawatt outorgado representa um empreendimento com obrigações regulatórias ativas perante a ANEEL.
          </p>
        </div>

        {mktLoading ? (
          <div className="mkt-opp-loading">Consultando base RALIE/ANEEL…</div>
        ) : mktStats ? (
          <>
            <div className="mkt-opp-metrics mkt-opp-metrics-3">
              <div className="mkt-metric mkt-metric-primary">
                <div className="mkt-m-sup">estimativa de investimento em implantação</div>
                <div className="mkt-m-value">
                  R$ {fmtBilhoes(mktStats.capexBilhoes)}
                  <span className="mkt-m-unit"> bilhões</span>
                </div>
                <div className="mkt-m-label">em projetos ativos de geração elétrica</div>
              </div>
              <div className="mkt-metric mkt-metric-secondary">
                <div className="mkt-m-sup">potência outorgada em implantação</div>
                <div className="mkt-m-value mkt-m-value-sm">
                  {mktStats.mw.toLocaleString("pt-BR")}
                  <span className="mkt-m-unit"> MW</span>
                </div>
                <div className="mkt-m-label">capacidade a ser instalada (2026–2032+)</div>
              </div>
              <div className="mkt-metric mkt-metric-tertiary">
                <div className="mkt-m-sup">empreendimentos monitorados</div>
                <div className="mkt-m-value mkt-m-value-sm">
                  {mktStats.usinas.toLocaleString("pt-BR")}
                  <span className="mkt-m-unit"> usinas</span>
                </div>
                <div className="mkt-m-label">em expansão — potencial de atuação</div>
              </div>
            </div>
            <div className="mkt-opp-footnote">
              * Painel <strong>Tendência de Expansão</strong> — RALIE/ANEEL.{" "}
              {mktStats.isFallback ? `Referência ${mktStats.dataConsulta} (dados offline, consulte o painel ao vivo).` : `Consulta realizada em ${mktStats.dataConsulta}.`}{" "}
              Estimativa de investimento baseada em CAPEX médio ponderado de R$ 5,5 M/MW (solar ~R$ 4,5M · eólica ~R$ 7,0M · PCH ~R$ 6,0M, ref. 2025).{" "}
              Fonte: <a href="https://dadosabertos.aneel.gov.br/dataset/ralie-relatorio-de-acompanhamento-da-expansao-da-oferta-de-geracao-de-energia-eletrica" target="_blank" rel="noreferrer">dadosabertos.aneel.gov.br</a>.
            </div>
          </>
        ) : (
          <div className="mkt-opp-loading mkt-opp-offline">
            Dados offline — abra o <button className="mkt-opp-link" onClick={() => goTo(6)}>Painel de Leads</button> para consultar ao vivo.
          </div>
        )}

        <div className="mkt-opp-cta-line">
          <span className="mkt-opp-arrow">→</span>
          <span>Todo projeto neste universo tem obrigações regulatórias ativas com a ANEEL — e a maioria não conta com assessoria especializada.</span>
          <button className="mkt-opp-link" onClick={() => goTo(6)}>Ver Painel de Leads →</button>
        </div>
      </div>

      {/* ── Ciclo de vida ── */}
      <h3 className="section-title">
        <span className="num">▶</span>Ciclo de vida de um empreendimento de geração elétrica
      </h3>
      <p className="home-hint-text">Clique em cada fase para ver obrigações e riscos específicos.</p>

      <div className="cycle-timeline">
        {CYCLE_PHASES.map((phase, idx) => (
          <React.Fragment key={phase.id}>
            <div
              className={`cycle-phase cz-${phase.zone}${openPhase === phase.id ? " cy-open" : ""}`}
              onClick={() => setOpenPhase(openPhase === phase.id ? null : phase.id)}
            >
              <span className="cy-label">{phase.label}</span>
              {phase.sub && <span className="cy-sub">{phase.sub}</span>}
            </div>
            {idx < CYCLE_PHASES.length - 1 && <div className="cy-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="cy-bracket">
        <div className="cy-bracket-line" />
        <div className="cy-bracket-text">▶ Foco principal da vossa atuação</div>
      </div>

      {activePhase && (
        <div className={`cy-detail cy-detail-${activePhase.zone}`}>
          <div className="cy-detail-head">Fase {activePhase.id} — {activePhase.title}</div>
          {activePhase.explanation.split("\n\n").map((para, i) => (
            <p key={i} style={{ margin: i === 0 ? "8px 0 0" : "10px 0 0", fontSize: 14, lineHeight: 1.65 }}>{para}</p>
          ))}
          {activePhase.risk && (
            <div className="cy-risk">
              <strong>Riscos desta fase:</strong> {activePhase.risk}
            </div>
          )}
        </div>
      )}

      {/* ── 3 Pilares ── */}
      <div className="home-divider" />
      <h3 className="section-title" style={{ textAlign: "center", borderBottom: "none", paddingBottom: 0 }}>
        Os 3 pilares de serviço
      </h3>
      <p className="home-hint-text" style={{ textAlign: "center" }}>Clique em cada pilar para ver o escopo detalhado.</p>

      <div className="pillars-row">
        {PILLARS.map(p => (
          <div
            key={p.id}
            className={`pillar-card pc-${p.color}${openPillar === p.id ? " pc-open" : ""}`}
            onClick={() => setOpenPillar(openPillar === p.id ? null : p.id)}
          >
            <div className="pc-header">
              <span className="pc-num">{p.id}.</span>
              <span className="pc-title">{p.title}</span>
            </div>
            <ul className="pc-items">
              {p.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <div className="pc-category">{p.category}</div>
            {openPillar === p.id && (
              <div className="pc-detail">
                {p.explanation.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "10px 0 0", fontSize: 13.5, lineHeight: 1.65 }}>{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── RALIE ── */}
      <div className="home-divider" />
      <h3 className="section-title" style={{ textAlign: "center", borderBottom: "none", paddingBottom: 0 }}>
        Como captamos clientes: o RALIE / ANEEL
      </h3>
      <p className="home-hint-text" style={{ textAlign: "center" }}>Clique para ver como transformamos dados públicos em pipeline qualificado.</p>

      <div className="ralie-flow-row">
        {RALIE_BOXES.map((box, idx) => (
          <React.Fragment key={box.id}>
            <div
              className={`ralie-box rb-${box.color}${openRalie === box.id ? " rb-open" : ""}`}
              onClick={() => setOpenRalie(openRalie === box.id ? null : box.id)}
            >
              <div className="rb-title">{box.title}</div>
              <p className="rb-desc">{box.desc}</p>
              {openRalie === box.id && (
                <div className="rb-detail">{box.detail}</div>
              )}
            </div>
            {idx < RALIE_BOXES.length - 1 && (
              <div className="ralie-arrow-icon">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Alerta + CTA ── */}
      <div className="home-warning-bar">
        <span style={{ color: "#D69E2E" }}>⚠</span>
        {" "}A dor do cliente:{" "}
        <strong style={{ color: "#92400E" }}>multas de até 10% do investimento + cassação da outorga</strong>
      </div>
      <p className="home-hint-text" style={{ textAlign: "center", marginBottom: 24 }}>
        Clique em qualquer bloco para aprofundar o tema · Use a navegação lateral para explorar os módulos
      </p>

      <div className="home-cta-row">
        <button className="home-cta" onClick={() => goTo(1)}>
          Explorar os módulos <Icon name="arrow" size={14} />
        </button>
        <button className="home-cta home-cta-secondary" onClick={() => goTo(6)}>
          Abrir Painel de Leads <Icon name="filter" size={14} />
        </button>
      </div>

    </div>
  );
}

window.ModuleHome = ModuleHome;
