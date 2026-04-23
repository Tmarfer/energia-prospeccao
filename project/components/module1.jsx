/* global React, UI */
const { useState } = React;
const { Glossary, Callout } = window.UI;

/* Alinhado ao ciclo de vida do mapa_coaching_geracao.svg */
const PHASES = [
  {
    id: 1, label: "Leilão / Outorga", zone: "neutral",
    desc: "O empreendedor vence o leilão da ANEEL e recebe a outorga (autorização, concessão ou permissão). Junto com a outorga vem um cronograma comprometido com datas de marco e de início de operação comercial. A partir daqui, o relógio das obrigações começa a correr.",
    risk: "Nenhum risco imediato, mas a ausência de expertise regulatória desde o início cria vulnerabilidades futuras."
  },
  {
    id: 2, label: "Pré-obra", zone: "green",
    desc: "Fase de obtenção de licenças ambientais (LP e LI), negociação do contrato de conexão (CUST/CUSD) com o agente de transmissão/distribuição, e início das declarações mensais obrigatórias no RAPEEL. Qualquer atraso nessa fase contamina o cronograma comprometido.",
    risk: "Licença Ambiental de Instalação não obtida no prazo. CUST/CUSD não assinado. Declarações mensais omissas."
  },
  {
    id: 3, label: "Obras / Implantação", zone: "green",
    desc: "Fase de execução das obras civis e de montagem eletromecânica. O empreendedor deve declarar mensalmente o percentual de avanço físico e manter consistência com os registros fotográficos enviados à ANEEL. Cronograma comprometido é monitorado pela SFG mensalmente no RALIE.",
    risk: "Atraso físico não comunicado. Declaração inconsistente com o avanço real. Não solicitação de excludente de responsabilidade em tempo."
  },
  {
    id: 4, label: "Operação em Teste", zone: "amber",
    desc: "A usina está fisicamente pronta mas ainda não tem autorização de operação comercial. Requer protocolo formal de requerimento de teste junto à ANEEL. Prazo máximo de operação em teste — se vencer sem protocolo do pedido de operação comercial, configura-se novo atraso.",
    risk: "Perda do prazo de operação em teste sem protocolar requerimento de operação comercial. Documentação de comissionamento incompleta."
  },
  {
    id: 5, label: "Operação Comercial", zone: "neutral",
    desc: "A ANEEL emite a Portaria de operação comercial via Diário Oficial. Encerra formalmente a fase de implantação. A partir daí, o empreendimento deixa de estar sujeito às obrigações de implantação — mas pode ainda ter pendências contratuais com a CCEE.",
    risk: "Pendências contratuais residuais com a CCEE podem persistir."
  }
];

function ModuleMercado() {
  const [active, setActive] = useState(3);
  const current = PHASES.find(p => p.id === active);

  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 1</div>
      <h2 className="module-title">O Mercado</h2>
      <p className="module-lead">
        Mostrar a dimensão e a estrutura do mercado antes de falar dos serviços — o contexto regulatório que cria a demanda pela nossa atuação.
      </p>

      <h3 className="section-title"><span className="num">1.1</span>O ciclo de vida de um empreendimento de geração</h3>
      <p>
        A jornada de um empreendimento de geração é marcada por fases com obrigações distintas. Clique em cada fase para detalhamento.
      </p>

      {/* Timeline v2 — cores alinhadas ao SVG */}
      <div className="timeline-v2">
        {PHASES.map(p => (
          <div
            key={p.id}
            className={`phase-v2 pv-${p.zone}${active === p.id ? " pv-active" : ""}`}
            onClick={() => setActive(p.id)}
          >
            <div className="pv-dot">{p.id}</div>
            <div className="pv-label">{p.label}</div>
          </div>
        ))}
      </div>
      <div className="zone-bracket-v2">
        ◀ Fases 2, 3 e 4 — Zona de atuação do escritório ▶
      </div>

      {current && (
        <div className={`phase-detail-v2 pd-${current.zone}`}>
          <h4>Fase {current.id} — {current.label}</h4>
          <p style={{ margin: 0 }}>{current.desc}</p>
          <div className="risk-v2">
            <strong>Risco:</strong> {current.risk}
          </div>
        </div>
      )}

      <h3 className="section-title"><span className="num">1.2</span>O que é uma <Glossary term="Outorga">outorga</Glossary> e por que ela cria obrigações</h3>
      <div className="concept-grid">
        <div className="concept-box">
          <div className="kicker">O que é</div>
          <h4>A origem do direito</h4>
          <p>A <Glossary term="Outorga">outorga</Glossary> é o ato jurídico pelo qual a ANEEL autoriza uma empresa a construir e operar uma usina geradora. Pode ser uma Concessão (grandes hidrelétricas), uma Autorização (renováveis em geral) ou uma Permissão.</p>
        </div>
        <div className="concept-box">
          <div className="kicker">O que ela exige</div>
          <h4>Obrigações automáticas</h4>
          <p>Junto com o direito de gerar, vêm obrigações de prazo, declaratórias e técnicas. O cronograma comprometido é uma obrigação contratual — seu descumprimento é infração automática.</p>
        </div>
        <div className="concept-box">
          <div className="kicker">O que está em jogo</div>
          <h4>A exposição do empreendedor</h4>
          <p>Multa de até 10% do investimento. Execução da garantia bancária. Cassação da outorga. Exposição ao mercado spot. Tudo isso pode decorrer do mesmo atraso não gerenciado.</p>
        </div>
      </div>

      <h3 className="section-title"><span className="num">1.3</span>Dimensão do mercado (<Glossary term="RALIE">RALIE</Glossary>)</h3>
      <Callout>
        A ANEEL publica mensalmente o <Glossary term="RALIE">RALIE</Glossary> — relatório com todos os empreendimentos em implantação no Brasil. São centenas de projetos em diferentes estágios, muitos deles com atrasos e riscos ativos. <strong>Cada um desses projetos é um cliente potencial.</strong>
      </Callout>

      <div className="segment-grid">
        <div className="segment-card">
          <div className="src">Fonte</div>
          <h5>Eólica</h5>
          <div className="attr"><strong>Característica:</strong> Concentrada no Nordeste, projetos de 50–300 MW</div>
          <div className="attr"><strong>Perfil do cliente:</strong> Desenvolvedores, fundos de infraestrutura</div>
        </div>
        <div className="segment-card">
          <div className="src">Fonte</div>
          <h5>Solar fotovoltaica</h5>
          <div className="attr"><strong>Característica:</strong> Disseminada, projetos de 5–200+ MW</div>
          <div className="attr"><strong>Perfil do cliente:</strong> <Glossary term="SPE">SPEs</Glossary>, grupos energéticos, investidores estrangeiros</div>
        </div>
        <div className="segment-card">
          <div className="src">Fonte</div>
          <h5>PCH / CGH</h5>
          <div className="attr"><strong>Característica:</strong> Projetos menores, Brasil todo</div>
          <div className="attr"><strong>Perfil do cliente:</strong> Grupos regionais, prefeituras, cooperativas</div>
        </div>
      </div>
    </div>
  );
}

window.ModuleMercado = ModuleMercado;
