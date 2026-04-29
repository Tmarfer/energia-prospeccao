/* global React, UI */
const { useState, useEffect } = React;
const { Icon } = window.UI;

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

function EnergyFlowDiagram() {
  return (
    <div className="esis-wrap">
      <div className="esis-header">
        <span className="esis-kicker">Sistema Elétrico Nacional — fluxo da energia</span>
      </div>

      <div className="esis-flow">
        {/* ── NODE 1: GERAÇÃO ── */}
        <div className="esis-node esis-node-gen">
          <div className="esis-node-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Sun */}
              <circle cx="20" cy="24" r="8" fill="rgba(217,119,87,0.85)"/>
              {[0,45,90,135,180,225,270,315].map(a => {
                const r = a * Math.PI / 180;
                return <line key={a} x1={20 + 11*Math.cos(r)} y1={24 + 11*Math.sin(r)}
                              x2={20 + 15*Math.cos(r)} y2={24 + 15*Math.sin(r)}
                              stroke="rgba(217,119,87,0.9)" strokeWidth="2" strokeLinecap="round"/>;
              })}
              {/* Wind turbine */}
              <line x1="46" y1="42" x2="46" y2="58" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <circle cx="46" cy="37" r="2" fill="rgba(255,255,255,0.6)"/>
              <line x1="46" y1="37" x2="37" y2="31" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <line x1="46" y1="37" x2="55" y2="31" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <line x1="46" y1="37" x2="46" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              {/* Hydro drop */}
              <path d="M 8 52 C 8 46 16 44 16 52 C 16 56 12 58 12 58 C 12 58 8 56 8 52 Z" fill="rgba(100,180,255,0.65)"/>
            </svg>
          </div>
          <div className="esis-node-label">GERAÇÃO</div>
          <div className="esis-node-sub">Solar · Eólica · Hídrica</div>
          <div className="esis-node-badge">★ Nossa atuação</div>
        </div>

        {/* ── CABLE 1 ── */}
        <div className="esis-cable">
          <div className="esis-cable-label">Alta tensão</div>
          <div className="esis-cable-track">
            <span className="esis-particle esis-pc-copper" style={{animationDelay:"0s"}}/>
            <span className="esis-particle esis-pc-copper" style={{animationDelay:"0.5s"}}/>
            <span className="esis-particle esis-pc-copper" style={{animationDelay:"1.0s"}}/>
          </div>
        </div>

        {/* ── NODE 2: TRANSMISSÃO ── */}
        <div className="esis-node esis-node-trans">
          <div className="esis-node-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="32" y1="6" x2="20" y2="52" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
              <line x1="32" y1="6" x2="44" y2="52" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
              <line x1="24" y1="24" x2="40" y2="24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <line x1="22" y1="38" x2="42" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M 6 20 Q 32 26 58 20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
              <path d="M 6 25 Q 32 31 58 25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="esis-node-label">TRANSMISSÃO</div>
          <div className="esis-node-sub">345–765 kV · Torres</div>
        </div>

        {/* ── CABLE 2 ── */}
        <div className="esis-cable">
          <div className="esis-cable-label">Média tensão</div>
          <div className="esis-cable-track">
            <span className="esis-particle esis-pc-blue" style={{animationDelay:"0.2s"}}/>
            <span className="esis-particle esis-pc-blue" style={{animationDelay:"0.7s"}}/>
            <span className="esis-particle esis-pc-blue" style={{animationDelay:"1.2s"}}/>
          </div>
        </div>

        {/* ── NODE 3: DISTRIBUIÇÃO ── */}
        <div className="esis-node esis-node-dist">
          <div className="esis-node-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="32" y1="8" x2="32" y2="30" stroke="rgba(100,180,255,0.65)" strokeWidth="2"/>
              <line x1="32" y1="20" x2="16" y2="36" stroke="rgba(100,180,255,0.55)" strokeWidth="1.5"/>
              <line x1="32" y1="20" x2="48" y2="36" stroke="rgba(100,180,255,0.55)" strokeWidth="1.5"/>
              <line x1="16" y1="36" x2="8"  y2="52" stroke="rgba(100,180,255,0.45)" strokeWidth="1.2"/>
              <line x1="16" y1="36" x2="24" y2="52" stroke="rgba(100,180,255,0.45)" strokeWidth="1.2"/>
              <line x1="48" y1="36" x2="40" y2="52" stroke="rgba(100,180,255,0.45)" strokeWidth="1.2"/>
              <line x1="48" y1="36" x2="56" y2="52" stroke="rgba(100,180,255,0.45)" strokeWidth="1.2"/>
              <rect x="5"  y="52" width="7" height="7" rx="1" fill="rgba(100,180,255,0.28)"/>
              <rect x="21" y="52" width="7" height="7" rx="1" fill="rgba(100,180,255,0.28)"/>
              <rect x="37" y="52" width="7" height="7" rx="1" fill="rgba(100,180,255,0.28)"/>
              <rect x="53" y="52" width="7" height="7" rx="1" fill="rgba(100,180,255,0.28)"/>
            </svg>
          </div>
          <div className="esis-node-label">DISTRIBUIÇÃO</div>
          <div className="esis-node-sub">13,8 kV · Redes locais</div>
        </div>

        {/* ── CABLE 3 ── */}
        <div className="esis-cable">
          <div className="esis-cable-label">Baixa tensão</div>
          <div className="esis-cable-track">
            <span className="esis-particle esis-pc-green" style={{animationDelay:"0.1s"}}/>
            <span className="esis-particle esis-pc-green" style={{animationDelay:"0.6s"}}/>
          </div>
        </div>

        {/* ── NODE 4: COMERCIALIZAÇÃO ── */}
        <div className="esis-node esis-node-com">
          <div className="esis-node-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6"  y="22" width="20" height="36" rx="2" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.2"/>
              <rect x="28" y="30" width="16" height="28" rx="2" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2"/>
              <rect x="46" y="36" width="12" height="22" rx="1.5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
              {[26,32,38,44].map(y => [9,16].map(x =>
                <rect key={x+"-"+y} x={x} y={y} width="4" height="4" rx="0.5" fill="rgba(255,230,120,0.38)"/>
              ))}
              {[34,40].map(y => [31,37].map(x =>
                <rect key={x+"-"+y} x={x} y={y} width="3.5" height="3.5" rx="0.5" fill="rgba(255,230,120,0.32)"/>
              ))}
            </svg>
          </div>
          <div className="esis-node-label">COMERCIALIZAÇÃO</div>
          <div className="esis-node-sub">Mercado livre · Consumidores</div>
        </div>
      </div>

      {/* ── Lei 15.269/2025 callout ── */}
      <div className="esis-law-block">
        <div className="esis-law-left">
          <div className="esis-law-badge">Lei 15.269/2025</div>
          <div className="esis-law-title">Maior reforma regulatória do setor elétrico</div>
          <div className="esis-law-note">Impacto direto na demanda por assessoria especializada em geração — nossa área de atuação.</div>
        </div>
        <div className="esis-law-items">
          <div className="esis-law-item"><span className="esis-law-year">2027</span><span>Abertura do mercado livre para industriais e comerciais (baixa tensão)</span></div>
          <div className="esis-law-item"><span className="esis-law-year">2028</span><span>Abertura para consumidores residenciais e rurais</span></div>
          <div className="esis-law-item"><span className="esis-law-icon">✕</span><span>Fim dos descontos TUST/TUSD para novos contratos de migração a partir de 2026</span></div>
          <div className="esis-law-item"><span className="esis-law-icon">🛡</span><span>Criação do Supridor de Última Instância (SUI) para garantia de fornecimento</span></div>
        </div>
      </div>
    </div>
  );
}

function ModuleHome({ goTo }) {
  const [openPhase, setOpenPhase] = useState(null);
  const [openPillar, setOpenPillar] = useState(null);
  const [openRalie, setOpenRalie] = useState(null);

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

      <EnergyFlowDiagram />

      {/* ── Ciclo de vida ── */}
      <div className="cycle-section-highlight">
      <h3 className="section-title cycle-section-title">
        <span className="num">▶</span>Ciclo de vida de um empreendimento de geração elétrica
      </h3>

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

      </div>{/* end cycle-section-highlight */}

      {/* ── 3 Pilares ── */}
      <div className="home-divider" />
      <h3 className="section-title" style={{ textAlign: "center", borderBottom: "none", paddingBottom: 0 }}>
        Os 3 pilares de serviço
      </h3>

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
