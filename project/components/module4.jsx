/* global React, UI */
const { useState } = React;
const { Glossary, Badge, Callout } = window.UI;

const TABS = [
  {
    id: "decl",
    label: "Declarações periódicas (mensais)",
    render: () => (
      <div>
        <h4>Todo mês, até o dia 15</h4>
        <p>
          Todo empreendimento em implantação é obrigado a alimentar o sistema <Glossary term="RAPEEL">RAPEEL</Glossary> com dados atualizados até o dia 15 de cada mês. Esses dados alimentam diretamente o <Glossary term="RALIE">RALIE</Glossary> público da ANEEL.
        </p>

        <div className="mini-section">
          <div className="lbl">O que precisa ser declarado</div>
          <ul>
            <li>Status do licenciamento ambiental (<Glossary term="LP">LP</Glossary>, <Glossary term="LI">LI</Glossary>, <Glossary term="LO">LO</Glossary>) — fase atual e data de obtenção/previsão</li>
            <li>Status da conexão — <Glossary term="CUST">CUST</Glossary>/<Glossary term="CUSD">CUSD</Glossary> assinado ou em negociação</li>
            <li>Percentual de avanço físico das obras — declarado pelo empreendedor, verificável por vistoria</li>
            <li>Previsão atualizada de início de operação comercial</li>
            <li>Qualquer alteração relevante nas condições do projeto</li>
          </ul>
        </div>

        <div className="mini-section">
          <div className="lbl">Risco de não conformidade</div>
          <p style={{ margin: 0 }}>
            Declaração não prestada, inconsistente ou falsa é <strong>infração autônoma</strong>, independente do andamento da obra. A ANEEL cruza os dados declarados com sistemas de outros órgãos (IBAMA, agentes de transmissão) e pode identificar inconsistências automaticamente.
          </p>
        </div>

        <div className="mini-section">
          <div className="lbl">Valor do serviço</div>
          <p style={{ margin: 0 }}>
            Garantir que as declarações sejam tempestivas, consistentes e defensáveis — não apenas preenchidas. <em>Uma declaração que cria inconsistência com registros anteriores pode ser mais prejudicial que a ausência de declaração.</em>
          </p>
        </div>
      </div>
    )
  },
  {
    id: "alter",
    label: "Alterações de outorga",
    render: () => (
      <div>
        <h4>Aprovação prévia, nunca posterior</h4>
        <p>
          Qualquer modificação nas condições originais da <Glossary term="Outorga">outorga</Glossary> requer aprovação formal da ANEEL <strong>antes</strong> de ser implementada — não depois.
        </p>

        <div className="mini-section">
          <div className="lbl">Principais tipos de alteração</div>
          <ul>
            <li><strong>Alteração de cronograma:</strong> quando há previsão de atraso com motivo justificado (distinto do excludente). Deve ser solicitada antes do vencimento do prazo, não após. Solicitar depois é confissão de atraso.</li>
            <li><strong>Alteração de características técnicas:</strong> mudança de tecnologia, layout de aerogeradores, configuração de painéis solares, rearranjo de unidades geradoras.</li>
            <li><strong>Redução ou ampliação de potência:</strong> qualquer desvio significativo da potência outorgada requer aprovação prévia.</li>
            <li><strong>Transferência de titularidade:</strong> quando a <Glossary term="SPE">SPE</Glossary> que detém a outorga muda de controlador ou quando a outorga é cedida. Serviço de alta demanda dado o mercado ativo de M&A em renováveis. Requer análise da capacidade técnica e financeira do novo titular.</li>
          </ul>
        </div>

        <div className="mini-section">
          <div className="lbl">Risco</div>
          <p style={{ margin: 0 }}>
            Implementar alteração sem aprovação prévia da ANEEL é operar em situação irregular — o que pode caracterizar infração administrativa autônoma, com penalidade própria, sobreposta a qualquer outra situação do projeto.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "teste",
    label: "Operação em teste",
    render: () => (
      <div>
        <h4>A fase mais negligenciada</h4>
        <p>
          Período entre a conclusão física da usina e a autorização formal de operação comercial. Tem obrigações próprias e prazo máximo regulamentar.
        </p>

        <div className="mini-section">
          <div className="lbl">Obrigações nessa fase</div>
          <ul>
            <li>Protocolo formal do requerimento de autorização de operação em teste junto à ANEEL</li>
            <li>Apresentação da documentação técnica de comissionamento das unidades geradoras</li>
            <li>Notificação ao agente de transmissão de que a conexão está energizada</li>
            <li>Monitoramento do prazo máximo da fase de teste — se vencer sem protocolo do pedido de operação comercial, configura novo atraso formal</li>
          </ul>
        </div>

        <div className="mini-section">
          <div className="lbl">Atenção específica</div>
          <p style={{ margin: 0 }}>
            A operação em teste é a fase mais negligenciada pelos empreendedores. A usina está gerando, o cliente está satisfeito, e a percepção é de que "está tudo bem." Mas regulatoriamente, o empreendimento ainda está em implantação e sujeito às obrigações de cronograma — <strong>incluindo multa por atraso na obtenção da Portaria de operação comercial</strong>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "comercial",
    label: "Operação comercial",
    render: () => (
      <div>
        <h4>A Portaria do Diário Oficial</h4>
        <p>
          A entrada em operação comercial é formalizada pela ANEEL por meio de uma Portaria publicada no Diário Oficial da União. Esse é o marco que encerra a fase de implantação regulatória.
        </p>

        <div className="mini-section">
          <div className="lbl">Documentação necessária</div>
          <ul>
            <li>Laudo de comissionamento de todas as unidades geradoras (emitido pelo fabricante e/ou entidade credenciada)</li>
            <li>Confirmação de conexão energizada com início de medição de produção</li>
            <li>Confirmação de que o <Glossary term="CUST">CUST</Glossary>/<Glossary term="CUSD">CUSD</Glossary> está em vigor e a medição está ativa</li>
            <li>Declaração do agente de transmissão de que a conexão está regular</li>
            <li>Relatório de ensaios de comissionamento</li>
          </ul>
        </div>

        <div className="mini-section">
          <div className="lbl">Ponto crítico</div>
          <p style={{ margin: 0 }}>
            Qualquer documento faltando atrasa a emissão da Portaria. <strong>Enquanto a Portaria não é emitida, o empreendimento está tecnicamente em atraso</strong> — mesmo que a usina esteja gerando energia. A preparação antecipada desse dossiê documental é parte do serviço.
          </p>
        </div>
      </div>
    )
  }
];

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
      <p>
        Quando uma empresa recebe uma <Glossary term="Outorga">outorga</Glossary>, ela não apenas ganha o direito de construir — ela assume um conjunto de obrigações declaratórias e procedimentais que persistem durante toda a implantação. Essas obrigações têm prazos, formatos e destinatários específicos. <strong>Descumpri-las, mesmo que a obra vá bem, é infração autônoma sujeita a penalidade.</strong>
      </p>

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

      <h3 className="section-title"><span className="num">4.3</span>O RAPEEL e sua relação com o RALIE</h3>
      <Callout>
        O <Glossary term="RAPEEL">RAPEEL</Glossary> (sistema declaratório) e o <Glossary term="RALIE">RALIE</Glossary> (painel público) são duas faces do mesmo dado. O empreendedor declara no RAPEEL. A ANEEL consolida e publica no RALIE. <strong>O que o mercado vê no RALIE — situação de obra, viabilidade, atraso — é o que o empreendedor declarou (ou deixou de declarar) no RAPEEL.</strong> Gerenciar bem o RAPEEL é controlar a narrativa pública do seu projeto perante a ANEEL e o mercado.
      </Callout>

      <h3 className="section-title"><span className="num">4.4</span>Modelo de engajamento</h3>
      <div className="engagement-grid">
        <div className="eng-card">
          <Badge color="green">Recorrente</Badge>
          <h5>Retainer mensal</h5>
          <p>Contrato de acompanhamento contínuo. Cobre as declarações mensais, o monitoramento de prazos, e o alerta proativo de qualquer risco emergente. Previsível para o escritório e para o cliente.</p>
        </div>
        <div className="eng-card">
          <Badge color="blue">Pontual</Badge>
          <h5>Projetos específicos</h5>
          <p>Para alterações de outorga pontuais, pedidos de excludente, defesa em processos de penalidade ou transferência de titularidade. Escopo e honorários definidos por projeto.</p>
        </div>
        <div className="eng-card">
          <Badge color="indigo">Escala</Badge>
          <h5>Portfólio múltiplo</h5>
          <p>Para clientes com vários empreendimentos simultâneos (fundos, grupos energéticos com 5–15 projetos). O serviço escala como gestão de portfólio regulatório, com visão consolidada de todos os projetos e seus riscos.</p>
        </div>
      </div>
    </div>
  );
}

window.ModuleConformidade = ModuleConformidade;
