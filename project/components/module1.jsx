/* global React, UI */
const { useState, useEffect } = React;
const { Glossary, Callout, ckanSQL } = window.UI;

// ── Market block (Dimensão do mercado, moved from module0) ──
const _RALIE_RES = "4a615df8-4c25-48fa-bbea-873a36a79518";
const _CAPEX_MW  = 5.5; // R$ milhões/MW
const _RALIE_REF = { usinas: 2742, mw: 118839, data: "Abr/2026" };

function _fmtBilhoes(b) {
  return b >= 100
    ? b.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : b.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function _fmtData(s) {
  if (!s) return "—";
  const d = String(s).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) { const [y, m, dd] = d.split("-"); return `${dd}/${m}/${y}`; }
  return d;
}

const GEN_TYPES = [
  {
    sigla: "CGH",
    nome: "Central Geradora Hidrelétrica",
    fonte: "Hídrica",
    color: "blue",
    limite: "≤ 5 MW instalado",
    regime: "Registro simplificado — sem autorização formal",
    obs: "Menor porte hidrelétrico. Dispensada de concessão, permissão ou autorização (Lei 9.074/1995, art. 8º) — apenas comunicação ao poder concedente. Empreendimentos familiares e cooperativas."
  },
  {
    sigla: "PCH",
    nome: "Pequena Central Hidrelétrica",
    fonte: "Hídrica",
    color: "blue",
    limite: "> 5 MW até 30 MW · reservatório ≤ 13 km²",
    regime: "Autorização ANEEL",
    obs: "Segmento mais ativo no interior do Brasil. Prazo médio de implantação: 3–5 anos. Principal foco da nossa carteira."
  },
  {
    sigla: "UHE",
    nome: "Usina Hidrelétrica de Energia",
    fonte: "Hídrica",
    color: "indigo",
    limite: "> 30 MW instalado",
    regime: "Autorização (≤ 50 MW) · Concessão via leilão (> 50 MW)",
    obs: "Dois regimes distintos: projetos de 30–50 MW obtêm autorização; acima de 50 MW exigem concessão federal por licitação. EIA/RIMA obrigatório. Obras de 5 a 10+ anos. Ex.: Belo Monte, Santo Antônio."
  },
  {
    sigla: "EOL",
    nome: "Central Geradora Eólica",
    fonte: "Eólica (vento)",
    color: "green",
    limite: "Projetos típicos: 50 – 300 MW",
    regime: "Autorização",
    obs: "Principal fonte em novos leilões de energia. Concentrada no Nordeste; Rio Grande do Sul e Santa Catarina em expansão."
  },
  {
    sigla: "UFV",
    nome: "Usina Fotovoltaica",
    fonte: "Solar fotovoltaica",
    color: "amber",
    limite: "Utility-scale tipicamente ≥ 1 MW",
    regime: "Autorização",
    obs: "Crescimento exponencial na última década. Projetos de 5 a 500+ MW. Centro-Oeste e Nordeste lideram em geração."
  },
  {
    sigla: "UTE",
    nome: "Usina Termelétrica",
    fonte: "Gás, biomassa, carvão, óleo",
    color: "neutral",
    limite: "Sem limite regulatório de porte",
    regime: "Autorização ou Concessão",
    obs: "Inclui biomassa (cana-de-açúcar, eucalipto) e gás natural. Despacho por ordem de mérito no sistema interligado."
  },
  {
    sigla: "UTN",
    nome: "Usina Termonuclear",
    fonte: "Nuclear (urânio enriquecido)",
    color: "neutral",
    limite: "Grande porte — Angra 1: 657 MW · Angra 2: 1.350 MW",
    regime: "Concessão especial — CNEN + ANEEL",
    obs: "Regulação específica da CNEN. Angra 3 (1.405 MW) em implantação desde 2010. Raros projetos novos no mundo."
  }
];

const CUSTOS = [
  {
    tipo: "UFV",
    capex_min: 3.0, capex_max: 5.5,
    prazo: "12–24 meses",
    nota: "Menor CAPEX do setor atualmente. Módulos fotovoltaicos, inversores e estrutura metálica. Curva de queda de custo contínua desde 2010. Fonte: EPE — Caderno de Custos PDE 2034 (set. 2024)."
  },
  {
    tipo: "EOL",
    capex_min: 4.4, capex_max: 7.0,
    prazo: "18–30 meses",
    nota: "Turbinas, torres e fundações representam ~70% do custo. Logística de transporte de pás (até 60 m) é o principal desafio no Nordeste. Fonte: EPE PDE 2034 + ABEEólica Boletim Anual 2025."
  },
  {
    tipo: "PCH",
    capex_min: 5.0, capex_max: 11.0,
    prazo: "24–48 meses",
    nota: "CAPEX varia muito conforme topografia e disponibilidade hídrica. Custo operacional muito baixo após construção. Faixa de viabilidade econômica típica: R$ 5–6 mi/MW. Fonte: ABRAPCH + EPE PDE 2034."
  },
  {
    tipo: "UHE",
    capex_min: 4.0, capex_max: 9.0,
    prazo: "48–96+ meses",
    nota: "Economias de escala em grandes projetos. Obras civis pesadas (barragem, turbinas, casa de força) e eventualmente relocação de população. Valores altamente variáveis por projeto. Fonte: EPE."
  },
  {
    tipo: "CGH",
    capex_min: 7.0, capex_max: 16.0,
    prazo: "12–24 meses",
    nota: "Alto custo relativo pela escala muito pequena. Obras civis (barragem e casa de força) dominam o CAPEX mesmo em 1–2 MW. Faixa baseada em projetos reais brasileiros 2020–2024."
  }
];

function capexBar(min, max) {
  const maxVal = 18;
  const wMin = Math.round((min / maxVal) * 100);
  const wMax = Math.round((max / maxVal) * 100);
  return { wMin, wMax };
}

function ModuleMercado({ goTo }) {
  const [mktStats, setMktStats] = useState(null);
  const [mktLoading, setMktLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sql = [
        `SELECT count(*) AS n,`,
        `       sum(cast("MdaPotenciaOutorgadaKw" AS float))/1000 AS mw,`,
        `       max("DatRalie") AS dt`,
        `FROM "${_RALIE_RES}"`,
        `WHERE "DscSituacaoObra" != 'Conclu\u00edda'`,
        `  AND "DatRalie" = (SELECT max("DatRalie") FROM "${_RALIE_RES}")`
      ].join(" ");
      try {
        const res = await ckanSQL(sql);
        if (res?.success && res.result?.records?.[0]) {
          const r = res.result.records[0];
          const usinas = Math.round(parseFloat(r.n || 0));
          const mw     = Math.round(parseFloat(r.mw || 0));
          setMktStats({ usinas, mw, capexBilhoes: (mw * _CAPEX_MW) / 1000, dataConsulta: _fmtData(r.dt), isFallback: false });
          return;
        }
      } catch { /* fallback */ }
      const mw = _RALIE_REF.mw;
      setMktStats({ usinas: _RALIE_REF.usinas, mw, capexBilhoes: (mw * _CAPEX_MW) / 1000, dataConsulta: _RALIE_REF.data, isFallback: true });
    })().finally(() => setMktLoading(false));
  }, []);

  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 1</div>
      <h2 className="module-title">O Mercado</h2>
      <p className="module-lead">
        Contexto regulatório e dimensão do mercado que criam a demanda pela nossa atuação — quem são os empreendedores, o que constroem e o que está em jogo.
      </p>

      {/* ── Dimensão do mercado · ANEEL/RALIE ao vivo ── */}
      <div className="mkt-opportunity-block" style={{ marginTop: "var(--space-8)" }}>
        <div className="mkt-opp-header">
          <span className="mkt-opp-kicker">Dimensão do mercado · ANEEL / RALIE ao vivo</span>
          <h3 className="mkt-opp-title">O tamanho da oportunidade em geração de energia</h3>
          <p className="mkt-opp-lead">
            Painel <strong>Tendência de Expansão</strong> do RALIE/ANEEL — projetos de geração elétrica em implantação no Brasil. Potencial total do mercado que pode demandar assessoria regulatória especializada.
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
                  R$ {_fmtBilhoes(mktStats.capexBilhoes)}
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
              {mktStats.isFallback ? `Referência ${mktStats.dataConsulta} (dados offline).` : `Consulta realizada em ${mktStats.dataConsulta}.`}{" "}
              Estimativa de investimento baseada em CAPEX médio ponderado de R$ 5,5 M/MW (solar ~R$ 4,5M · eólica ~R$ 7,0M · PCH ~R$ 6,0M, ref. 2025).{" "}
              Fonte: <a href="https://dadosabertos.aneel.gov.br/dataset/ralie-relatorio-de-acompanhamento-da-expansao-da-oferta-de-geracao-de-energia-eletrica" target="_blank" rel="noreferrer">dadosabertos.aneel.gov.br</a>.
            </div>
          </>
        ) : (
          <div className="mkt-opp-loading mkt-opp-offline">
            Dados offline — abra o <button className="mkt-opp-link" onClick={() => goTo && goTo(6)}>Painel de Leads</button> para consultar ao vivo.
          </div>
        )}
        <div className="mkt-opp-cta-line">
          <span className="mkt-opp-arrow">→</span>
          <span>Todo projeto neste universo tem obrigações regulatórias ativas com a ANEEL — e a maioria não conta com assessoria especializada.</span>
          {goTo && <button className="mkt-opp-link" onClick={() => goTo(6)}>Ver Painel de Leads →</button>}
        </div>
      </div>

      {/* 1.1 — Outorga */}
      <h3 className="section-title"><span className="num">1.1</span>O que é uma <Glossary term="Outorga">outorga</Glossary> e por que ela cria obrigações</h3>
      <div className="concept-grid">
        <div className="concept-box">
          <div className="kicker">O que é</div>
          <h4>A origem do direito</h4>
          <p>A <Glossary term="Outorga">outorga</Glossary> é o ato jurídico pelo qual a ANEEL autoriza uma empresa a construir e operar uma usina geradora. Pode ser uma Concessão (grandes hidrelétricas), uma Autorização (renováveis em geral) ou uma Permissão.</p>
        </div>
        <div className="concept-box">
          <div className="kicker">O que ela exige</div>
          <h4>Obrigações automáticas</h4>
          <p>Junto com o direito de gerar, vêm obrigações de prazo, declaratórias e técnicas. O cronograma comprometido é uma obrigação contratual — seu descumprimento é infração automática, independentemente do motivo.</p>
        </div>
        <div className="concept-box">
          <div className="kicker">O que está em jogo</div>
          <h4>A exposição do empreendedor</h4>
          <p>Multa de até 10% do investimento. Execução da garantia bancária. Cassação da outorga. Exposição ao mercado spot. Tudo isso pode decorrer do mesmo atraso não gerenciado.</p>
        </div>
      </div>

      {/* 1.2 — Dimensão do mercado */}
      <h3 className="section-title"><span className="num">1.2</span>Dimensão do mercado (<Glossary term="RALIE">RALIE</Glossary>)</h3>
      <Callout>
        A ANEEL publica mensalmente o <Glossary term="RALIE">RALIE</Glossary> — relatório com todos os empreendimentos em implantação no Brasil. São centenas de projetos em diferentes estágios, muitos com atrasos e riscos ativos. <strong>Cada um desses projetos é um cliente potencial.</strong>
      </Callout>

      {/* Types grid */}
      <h4 className="subsec-title">Tipos de empreendimento de geração no RALIE</h4>
      <p className="subsec-lead">Cada sigla corresponde a um regime regulatório e porte de projeto distintos. Os limites de potência abaixo são os critérios oficiais da ANEEL para classificação.</p>
      <div className="gen-grid">
        {GEN_TYPES.map(t => (
          <div key={t.sigla} className={`gen-card gc-${t.color}`}>
            <div className="gc-sigla">{t.sigla}</div>
            <div className="gc-body">
              <div className="gc-nome">{t.nome}</div>
              <div className="gc-fonte">{t.fonte}</div>
              <div className="gc-tags">
                <span className="gc-tag-limit">{t.limite}</span>
                <span className="gc-tag-regime">{t.regime}</span>
              </div>
              <div className="gc-obs">{t.obs}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="source-note">
        <strong>Fontes:</strong>{" "}
        <a href="https://www.planalto.gov.br/ccivil_03/leis/l9074cons.htm" target="_blank" rel="noreferrer">Lei nº 9.074/1995, art. 8º (CGH)</a>
        {" · "}
        <a href="https://www2.aneel.gov.br/cedoc/ren2020875.html" target="_blank" rel="noreferrer">ANEEL — Resolução Normativa nº 875/2020 (PCH/UHE)</a>
        {" · "}
        <a href="https://www.gov.br/aneel/pt-br/assuntos/noticias/aneel-aperfeicoa-requisitos-e-procedimentos-para-outorgas-de-pch-e-de-uhe-ate-50mw" target="_blank" rel="noreferrer">ANEEL — RN nº 1.079/2023 (UHE até 50 MW)</a>
      </div>

      {/* Cost table */}
      <h4 className="subsec-title" style={{ marginTop: 36 }}>Custo estimado de implantação por fonte — CAPEX</h4>
      <p className="subsec-lead">
        Referência de mercado 2024–2025 em R$ milhões por MW instalado. Valores indicativos — variam conforme localização, topografia, porte e condições de financiamento. Nuclear (UTN) e térmica (UTE) omitidos por custo altamente dependente de combustível e escala.
      </p>
      <table className="data-table capex-table">
        <thead>
          <tr>
            <th style={{ width: "7%" }}>Tipo</th>
            <th style={{ width: "20%" }}>CAPEX por MW</th>
            <th style={{ width: "26%" }}>Escala visual</th>
            <th style={{ width: "14%" }}>Prazo típico</th>
            <th>Composição e notas</th>
          </tr>
        </thead>
        <tbody>
          {CUSTOS.map(c => {
            const { wMin, wMax } = capexBar(c.capex_min, c.capex_max);
            const tipo = GEN_TYPES.find(t => t.sigla === c.tipo);
            return (
              <tr key={c.tipo}>
                <td>
                  <span className={`capex-sigla cs-${tipo ? tipo.color : "neutral"}`}>{c.tipo}</span>
                </td>
                <td>
                  <strong className="capex-val">R$ {c.capex_min.toFixed(1).replace(".", ",")} – {c.capex_max.toFixed(1).replace(".", ",")} mi</strong>
                </td>
                <td>
                  <div className="capex-bar-wrap">
                    <div className="capex-bar-track">
                      <div
                        className={`capex-bar-fill cbf-${tipo ? tipo.color : "neutral"}`}
                        style={{ marginLeft: wMin + "%", width: (wMax - wMin) + "%" }}
                      />
                    </div>
                    <div className="capex-bar-labels">
                      <span>0</span><span>R$ 18 mi/MW</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.prazo}</td>
                <td style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{c.nota}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="source-note">
        <strong>Fontes:</strong>{" "}
        <a href="https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-804/topico-709/" target="_blank" rel="noreferrer">EPE — Caderno de Custos de Geração e Transmissão · PDE 2034 (set. 2024)</a>
        {" · "}
        <a href="https://abeeolica.org.br/" target="_blank" rel="noreferrer">ABEEólica — Boletim Anual 2025</a>
        {" · "}
        <a href="https://abrapch.org.br/" target="_blank" rel="noreferrer">ABRAPCH — Associação Brasileira de PCHs</a>
        {" · "}
        Levantamento de projetos reais (CGH, 2020–2024)
      </div>
    </div>
  );
}

window.ModuleMercado = ModuleMercado;
