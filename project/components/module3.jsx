/* global React, UI */
const { useState } = React;
const { Glossary, Callout, Icon } = window.UI;

const CAUSES = [
  {
    icon: "cloud",
    color: "amber",
    title: "Causas climáticas extremas",
    desc: "Eventos meteorológicos comprovadamente atípicos em relação à série histórica da região. Requer dados de órgãos oficiais (INMET) demonstrando desvio estatístico significativo do padrão climático. Seca extrema, enchentes atípicas, chuvas muito acima da média com impacto comprovado na obra."
  },
  {
    icon: "building",
    color: "green",
    title: "Atos do Poder Público",
    desc: "A causa mais frequente na prática. Inclui: demora do IBAMA ou órgãos estaduais/municipais na emissão de licenças ambientais; embargos ambientais; decisões judiciais paralisando obras; desapropriações lentas; interdições de acesso. Requer prova da mora do Poder Público e do nexo causal com o atraso específico."
  },
  {
    icon: "alert",
    color: "red",
    title: "Situações de emergência",
    desc: "Pandemias (COVID-19 gerou enorme volume processual na ANEEL em 2020–2021), epidemias regionais, desastres naturais, crises na cadeia de suprimentos com comprovação documental robusta."
  },
  {
    icon: "globe",
    color: "blue",
    title: "Outros motivos reconhecidos",
    desc: "A ANEEL tem interpretação relativamente ampla, mas exige demonstração rigorosa. Greve de transportadores, crises de insumos, eventos geopolíticos com impacto direto e comprovável no empreendimento específico."
  }
];

/* Flow steps — cores alinhadas ao fluxo_excludente_responsabilidade.svg */
const FLOW = [
  {
    num: 1, color: "neutral",
    title: "Identificação do evento excludente",
    detail: "Avaliar qual categoria de evento excludente se aplica ao caso e se há nexo de causalidade plausível. Etapa crítica: muitos empreendedores só percebem que tinham direito ao excludente depois que a penalidade já foi aplicada."
  },
  {
    num: 2, color: "amber",
    title: "Coleta e organização da documentação comprobatória",
    detail: "Laudos meteorológicos do INMET, ofícios enviados ao órgão ambiental, protocolos de licença, registros fotográficos de obra, decisões judiciais, correspondências com agentes de transmissão, contratos de fornecimento de equipamentos. A documentação constrói o caso — sem ela, não há argumento."
  },
  {
    num: 3, color: "green",
    title: "Construção do nexo causal (peça técnica central)",
    detail: "A peça técnica central do requerimento. Deve demonstrar, para cada dia/mês de atraso alegado, qual evento específico impediu o avanço e em que medida. É a peça que diferencia um pedido deferido de um indeferido — e onde está o valor do escritório."
  },
  {
    num: 4, color: "green",
    title: "Protocolo do requerimento na ANEEL (SFG + SCG)",
    detail: "O requerimento deve ser tempestivo: protocolado antes ou logo após o evento, nunca após a consolidação da penalidade. A ANEEL é significativamente mais receptiva a pedidos preventivos. Composição: identificação do empreendimento (CEG, nome, tipo, potência), descrição do evento, cronograma comprometido vs. impactado, documentação, nexo causal, pedido expresso de isenção e postergação."
  },
  {
    num: 5, color: "blue",
    title: "Análise ANEEL — SFG e SCG",
    detail: "Tramita pela SFG (análise técnica do cronograma) e pela SCG (análise jurídico-regulatória). Ambas têm competência delegada para decidir. Prazo de análise variável — tipicamente 30 a 90 dias dependendo da complexidade."
  }
];

const FLOW_STEP6 = {
  num: 6, color: "indigo",
  title: "Recurso à Diretoria da ANEEL (se indeferido)",
  detail: "Se indeferido, cabe recurso à Diretoria da ANEEL, que é a última instância administrativa. A Diretoria decide em sessão pública e pode reformar a decisão das superintendências. É a instância onde há maior espaço para argumentação técnica e jurídica aprofundada."
};

/* Consequências do deferimento — extra box */
const DEFERIMENTO_EFEITOS = [
  "Isenção de penalidade administrativa (multa, embargo)",
  "Isenção de penalidade editalícia (multa contratual, execução de garantia)",
  "Isenção de recomposição de lastro de energia",
  "Postergação formal do cronograma e do prazo da outorga"
];

function FlowStep({ step, isOpen, onToggle }) {
  return (
    <div
      className={`flow-step-v2 fsv-${step.color}${isOpen ? " fsv-open" : ""}`}
      onClick={onToggle}
    >
      <div className={`fsv-num fsv-num-${step.color}`}>{step.num}</div>
      <div className="fsv-content">
        <div className="fsv-title">{step.title}</div>
        {isOpen && <div className="fsv-detail">{step.detail}</div>}
      </div>
      <div className="fsv-chevron">{isOpen ? "↑" : "↓"}</div>
    </div>
  );
}

function ModuleExcludente() {
  const [openStep, setOpenStep] = useState(3);

  const toggle = (n) => setOpenStep(openStep === n ? null : n);

  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 3</div>
      <h2 className="module-title">Excludente de Responsabilidade</h2>
      <p className="module-lead">
        O serviço de maior valor agregado e menor conhecimento do mercado. O instituto regulatório que suspende todas as consequências de um atraso — quando bem construído.
      </p>

      <h3 className="section-title"><span className="num">3.1</span>O que é</h3>
      <div className="two-col">
        <div className="card">
          <div className="module-kicker" style={{ marginBottom: 8 }}>Definição</div>
          <p style={{ margin: 0 }}>
            O excludente de responsabilidade é o instituto regulatório que permite ao empreendedor demonstrar que o atraso no cronograma ocorreu por causa de um fator externo, imprevisível e irresistível — alheio ao seu controle. Quando reconhecido pela ANEEL, <strong>suspende todas as consequências do atraso</strong>.
          </p>
        </div>
        <div className="card">
          <div className="module-kicker" style={{ marginBottom: 8 }}>O que ele suspende</div>
          <ul className="benefits-list">
            {DEFERIMENTO_EFEITOS.map((ef, i) => (
              <li key={i}><span className="check"><Icon name="check" size={11} /></span> {ef}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="section-title"><span className="num">3.2</span>As causas excludentes</h3>
      <div className="cause-grid-v2">
        {CAUSES.map((c, i) => (
          <div className={`cause-card-v2 cc-${c.color}`} key={i}>
            <div className="cause-head">
              <div className={`cause-ico-v2 cci-${c.color}`}><Icon name={c.icon} size={18} /></div>
              <h5>{c.title}</h5>
            </div>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title"><span className="num">3.3</span>O nexo causal — o diferencial técnico</h3>
      <div className="diff-callout">
        <div className="kicker">O ponto que diferencia</div>
        <h4>Não basta provar que o evento ocorreu. É preciso provar que aquele evento causou aquele atraso, naquela magnitude, naquele empreendimento específico.</h4>
        <p>Um pedido fraco descreve o evento. Um pedido forte reconstrói, dia a dia, como o evento impediu o avanço físico — e em que proporção exata.</p>
      </div>

      <div className="example-box">
        <strong>Exemplo prático.</strong> Usina eólica no Piauí com atraso de 8 meses. O empreendedor alega que o IBAMA demorou a emitir a <Glossary term="LI">Licença de Instalação</Glossary>. Para o nexo causal ser robusto, é necessário demonstrar: (1) data de protocolo do pedido da LI; (2) data de emissão da LI; (3) que durante esse intervalo a obra estava especificamente impedida por falta dessa licença — não por outros fatores; (4) que a demora do IBAMA foi superior ao prazo legal, configurando mora. Se o atraso total é de 8 meses mas a demora da LI explica 3 meses, o excludente cobre apenas esses 3 meses. <strong>O excludente é proporcional ao impacto comprovado.</strong>
      </div>

      <h3 className="section-title"><span className="num">3.4</span>O fluxo processual</h3>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 16, marginTop: -6 }}>
        Clique em cada etapa para ver o detalhamento técnico.
      </p>

      <div className="flow-v2">
        {FLOW.map((s, idx) => (
          <React.Fragment key={s.num}>
            <FlowStep step={s} isOpen={openStep === s.num} onToggle={() => toggle(s.num)} />
            {idx < FLOW.length - 1 && <div className="flow-arrow-v2">↓</div>}
          </React.Fragment>
        ))}

        {/* Análise — bifurcação */}
        <div className="flow-arrow-v2">↓</div>
        <div className="flow-branch-v2">
          <div className="fbv fbv-ok">
            <div className="fbv-label">✓ Deferido</div>
            <div className="fbv-desc">Isenção de penalidade administrativa + editalícia + lastro · Postergação formal do cronograma</div>
          </div>
          <div className="fbv fbv-no">
            <div className="fbv-label">✗ Indeferido</div>
            <div className="fbv-desc">Cabe recurso à Diretoria da ANEEL — última instância administrativa</div>
          </div>
        </div>

        <div className="flow-arrow-v2">↓ (se indeferido)</div>
        <FlowStep step={FLOW_STEP6} isOpen={openStep === 6} onToggle={() => toggle(6)} />
      </div>

      <Callout>
        <strong>Timing é crítico.</strong> A ANEEL é significativamente mais receptiva a pedidos preventivos — protocolados antes ou logo após o evento, nunca após a consolidação da penalidade. O excludente retroativo tem taxa de deferimento muito inferior ao preventivo.
      </Callout>
    </div>
  );
}

window.ModuleExcludente = ModuleExcludente;
