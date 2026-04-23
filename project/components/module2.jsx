/* global React, UI */
const { useState, useMemo } = React;
const { Glossary, Callout } = window.UI;

const PENALTIES = [
  {
    key: "edital",
    color: "amber",
    title: "Editalícias",
    subtitle: "Do contrato do leilão",
    items: [
      { t: "Advertência" },
      { t: "Multa — até 10% do valor do investimento" },
      { t: "Execução da garantia contratual (fiança bancária / performance bond)" },
      { t: "Suspensão temporária de participação em licitações ANEEL" },
      { t: "Declaração de inidoneidade para contratar com a Administração Pública" },
      { t: "Cassação da outorga", max: true }
    ],
    detail: "As penalidades editalícias nascem do edital do leilão e do contrato de concessão/autorização. São penalidades contratuais — não apenas regulatórias. A multa pode chegar a 10% do valor total do investimento declarado no leilão. Para uma usina de R$ 400 milhões, isso é R$ 40 milhões. A execução da garantia é imediata — a ANEEL pode acionar a fiança bancária sem ação judicial. A cassação significa a perda total do projeto, com o ativo retornando a leilão."
  },
  {
    key: "admin",
    color: "red",
    title: "Administrativas",
    subtitle: "Poder de polícia da ANEEL",
    items: [
      { t: "Advertência" },
      { t: "Multa administrativa" },
      { t: "Embargo de obras" },
      { t: "Interdição de instalações" },
      { t: "Obrigação de fazer / obrigação de não fazer" },
      { t: "Suspensão de participação em licitações" },
      { t: "Revogação de autorização" },
      { t: "Caducidade da concessão", max: true }
    ],
    detail: "As penalidades administrativas derivam do poder de polícia regulatório da ANEEL. Não dependem de descumprimento contratual específico — podem ser aplicadas por qualquer infração às normas do setor. O embargo de obras é particularmente grave: cria um ciclo vicioso onde a interrupção forçada gera mais atraso, que gera mais penalidades. A caducidade da concessão equivale à cassação no regime de autorização — extinção unilateral do direito de gerar."
  },
  {
    key: "comm",
    color: "blue",
    title: "Comerciais",
    subtitle: "Mercado de energia — CCEE",
    items: [
      { t: "Exposição ao PLD (Preço de Liquidação das Diferenças)" },
      { t: "Recomposição de lastro de energia" },
      { t: "Indenizações contratuais às distribuidoras (via CCEE)", max: true }
    ],
    detail: "As penalidades comerciais são as menos compreendidas pelos empreendedores — e em alguns cenários, as mais caras. Quando uma usina atrasa e não entrega a energia contratada, ela fica exposta ao PLD no mercado spot. Em momentos de estresse hídrico, o PLD pode atingir R$ 1.000–2.000/MWh. Para uma usina de 100 MW operando 720h/mês, a exposição mensal pode chegar a dezenas de milhões de reais. A recomposição de lastro agrava ainda mais essa exposição."
  }
];

function fmtBRL(n) {
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(2)} bi`;
  if (n >= 1) return `R$ ${n.toFixed(1)} mi`;
  return `R$ ${(n * 1000).toFixed(0)} mil`;
}

function Calculator() {
  const [inv, setInv] = useState(400);
  const [meses, setMeses] = useState(6);

  const calc = useMemo(() => {
    const multa = inv * 0.10;
    const garantia = inv * 0.05;
    const mw = inv / 4;
    const pld = mw * 720 * 200 * meses / 1_000_000;
    const total = multa + garantia + pld;
    return { multa, garantia, pld, total };
  }, [inv, meses]);

  return (
    <div className="calculator">
      <div className="calc-inputs">
        <div className="slider-row">
          <label>Valor do investimento do projeto</label>
          <div className="value-display">R$ {inv.toLocaleString("pt-BR")} milhões</div>
          <input type="range" min="10" max="2000" step="10" value={inv} onChange={e => setInv(+e.target.value)} />
          <div className="slider-meta"><span>R$ 10 mi</span><span>R$ 2 bi</span></div>
        </div>
        <div className="slider-row">
          <label>Meses de atraso</label>
          <div className="value-display">{meses} {meses === 1 ? "mês" : "meses"}</div>
          <input type="range" min="1" max="36" step="1" value={meses} onChange={e => setMeses(+e.target.value)} />
          <div className="slider-meta"><span>1 mês</span><span>36 meses</span></div>
        </div>
      </div>
      <div className="calc-outputs">
        <div className="out-row">
          <span>Multa máxima editalícia <small style={{ color: "#6C757D" }}>(10% do investimento)</small></span>
          <span className="val">{fmtBRL(calc.multa)}</span>
        </div>
        <div className="out-row">
          <span>Execução de garantia estimada <small style={{ color: "#6C757D" }}>(5%)</small></span>
          <span className="val">{fmtBRL(calc.garantia)}</span>
        </div>
        <div className="out-row">
          <span>Exposição estimada ao <Glossary term="PLD">PLD</Glossary></span>
          <span className="val">{fmtBRL(calc.pld)}</span>
        </div>
        <div className="out-row total">
          <span>Total de exposição estimada</span>
          <span className="val">{fmtBRL(calc.total)}</span>
        </div>
        <div className="foot">
          Estimativa baseada em PLD médio histórico de R$ 200/MWh e potência proporcional ao investimento. Valores reais dependem das condições específicas do projeto e do mercado à época.
        </div>
      </div>
    </div>
  );
}

function PenaltyCard({ p, expanded, onToggle }) {
  return (
    <div
      className={`pen-card pen-${p.color}${expanded ? " pen-expanded" : ""}`}
      onClick={onToggle}
      style={{ cursor: "pointer" }}
    >
      <div className="pen-head">
        <p className="pen-head-title">{p.title}</p>
        <p className="pen-head-sub">{p.subtitle}</p>
      </div>
      <div className="pen-body">
        <ul className="pen-list">
          {p.items.map((it, i) => (
            <li key={i} className={it.max ? "pen-item-max" : ""}>{it.t}</li>
          ))}
        </ul>
        {expanded && (
          <div className="pen-detail-text">{p.detail}</div>
        )}
      </div>
    </div>
  );
}

function ModulePenalidades() {
  const [expanded, setExpanded] = useState({});

  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 2</div>
      <h2 className="module-title">Penalidades</h2>
      <p className="module-lead">
        O cliente tem risco financeiro real e concreto. Esse risco é o argumento de venda — e ele é multiplicativo, não linear.
      </p>

      <h3 className="section-title"><span className="num">2.1</span>As três camadas de penalidade</h3>
      <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 16, marginTop: -6 }}>
        Clique em cada camada para ver o detalhamento técnico.
      </p>

      <div className="pen-grid">
        {PENALTIES.map(p => (
          <PenaltyCard
            key={p.key}
            p={p}
            expanded={!!expanded[p.key]}
            onToggle={() => setExpanded(s => ({ ...s, [p.key]: !s[p.key] }))}
          />
        ))}
      </div>

      <div className="pen-accumulation">
        <p>
          <strong>As três camadas se acumulam:</strong> um mesmo atraso pode gerar multa contratual de 10% + penalidade administrativa + exposição total ao PLD ao mesmo tempo. O risco não é linear — é multiplicativo.
        </p>
      </div>

      <h3 className="section-title"><span className="num">2.2</span>Calculadora de exposição</h3>
      <p>
        Ajuste os parâmetros para estimar a ordem de grandeza da exposição financeira de um projeto típico.
      </p>
      <Calculator />

      <Callout>
        Esta estimativa ilustra a ordem de grandeza do risco. <strong>O serviço de assessoria regulatória custa uma fração desse valor</strong> — e atua preventivamente, antes que as penalidades se consolidem.
      </Callout>
    </div>
  );
}

window.ModulePenalidades = ModulePenalidades;
