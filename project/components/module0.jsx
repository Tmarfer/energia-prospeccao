/* global React, UI */
const { useState, useEffect } = React;
const { Icon } = window.UI;

// ── Market stats via ANEEL CKAN ──
const RALIE_RES_ID = "4a615df8-4c25-48fa-bbea-873a36a79518";
const CKAN_URL = "https://dadosabertos.aneel.gov.br/api/3/action/datastore_search";

function ckanFetch(params) {
  return new Promise((resolve, reject) => {
    const cb = "__mkt_cb_" + Math.random().toString(36).slice(2);
    const qs = new URLSearchParams({ ...params, callback: cb }).toString();
    const s = document.createElement("script");
    const t = setTimeout(() => { delete window[cb]; s.remove(); reject(new Error("timeout")); }, 25000);
    window[cb] = d => { clearTimeout(t); delete window[cb]; s.remove(); resolve(d); };
    s.onerror = () => { clearTimeout(t); delete window[cb]; s.remove(); reject(new Error("network")); };
    s.src = CKAN_URL + "?" + qs;
    document.head.appendChild(s);
  });
}

function scoreRow(r) {
  let s = 0;
  const obra = (r.DscSituacaoObra || "").toLowerCase();
  const viab = (r.DscViabilidade || "").toLowerCase();
  const cron = (r.DscSituacaoCronograma || "").toLowerCase();
  if (obra.includes("paralis")) s += 40;
  else if (obra.includes("andament")) s += 15;
  else if (obra.includes("não iniciad") || obra.includes("nao iniciad")) s += 20;
  if (viab.includes("baix")) s += 30;
  else if (viab.includes("méd") || viab.includes("med")) s += 18;
  if (cron.includes("atras")) s += 15;
  return Math.min(100, s);
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
      try {
        const countRes = await ckanFetch({ resource_id: RALIE_RES_ID, limit: 1 });
        const total = countRes?.result?.total || 0;

        const sampleLimit = Math.min(total, 1000);
        const sampleRes = await ckanFetch({ resource_id: RALIE_RES_ID, limit: sampleLimit });
        const records = sampleRes?.result?.records || [];

        let hot = 0, warm = 0, totalMW = 0;
        const seen = new Set();
        for (const r of records) {
          const key = r.CodCEG || r.IdeNucleoCEG || r._id;
          if (seen.has(key)) continue;
          seen.add(key);
          const score = scoreRow(r);
          if (score >= 60) hot++;
          else if (score >= 35) warm++;
          const kw = parseFloat(String(r.MdaPotenciaOutorgadaKw || "").replace(",", "."));
          if (isFinite(kw)) totalMW += kw / 1000;
        }

        const sampleSize = seen.size;
        const factor = sampleSize > 0 ? total / sampleSize : 1;
        setMktStats({
          total,
          hotLeads: Math.round(hot * factor),
          warmLeads: Math.round(warm * factor),
          totalMW: Math.round(totalMW * factor),
        });
      } catch {
        setMktStats(null);
      } finally {
        setMktLoading(false);
      }
    })();
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
          <span className="mkt-opp-kicker">Universo de atuação · ANEEL / RALIE ao vivo</span>
          <h3 className="mkt-opp-title">O mercado de implantação de usinas no Brasil</h3>
          <p className="mkt-opp-lead">
            Todos os empreendimentos ativos de geração elétrica em fase de implantação — monitorados pela ANEEL e atualizados mensalmente. Cada projeto é uma outorga com obrigações regulatórias ativas.
          </p>
        </div>
        <div className="mkt-opp-metrics">
          {mktLoading ? (
            <div className="mkt-opp-loading">Consultando base ANEEL…</div>
          ) : mktStats ? (
            <>
              <div className="mkt-metric mkt-metric-total">
                <div className="mkt-m-value">{mktStats.total.toLocaleString("pt-BR")}</div>
                <div className="mkt-m-label">projetos em implantação</div>
                <div className="mkt-m-sub">universo total · base RALIE/ANEEL</div>
              </div>
              <div className="mkt-metric mkt-metric-hot">
                <div className="mkt-m-value">{(mktStats.hotLeads + mktStats.warmLeads).toLocaleString("pt-BR")}</div>
                <div className="mkt-m-label">leads quentes + mornos</div>
                <div className="mkt-m-sub">risco regulatório ativo ou iminente</div>
              </div>
              <div className="mkt-metric mkt-metric-mw">
                <div className="mkt-m-value">{mktStats.totalMW.toLocaleString("pt-BR")} MW</div>
                <div className="mkt-m-label">potência em implantação</div>
                <div className="mkt-m-sub">capacidade outorgada em construção</div>
              </div>
            </>
          ) : (
            <div className="mkt-opp-loading mkt-opp-offline">Dados offline — abra o Painel de Leads para consultar ao vivo</div>
          )}
        </div>
        <div className="mkt-opp-cta-line">
          <span className="mkt-opp-arrow">→</span>
          <span>Cada lead quente ou morno representa um empreendedor com risco regulatório ativo e demanda latente por assessoria especializada.</span>
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
