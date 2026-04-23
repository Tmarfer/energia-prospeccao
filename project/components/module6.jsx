/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ANEEL CKAN — RALIE Usina
const RALIE_RESOURCE_ID = "4a615df8-4c25-48fa-bbea-873a36a79518";
const CKAN_BASE = "https://dadosabertos.aneel.gov.br/api/3/action/datastore_search";

// JSONP helper (CORS-safe fallback for ANEEL CKAN)
function jsonp(url, params) {
  return new Promise((resolve, reject) => {
    const cbName = "__ckan_cb_" + Math.random().toString(36).slice(2);
    const qs = new URLSearchParams({ ...params, callback: cbName }).toString();
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[cbName];
      script.remove();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout ao consultar a API da ANEEL (30s)"));
    }, 30000);
    window[cbName] = (data) => {
      clearTimeout(timer);
      cleanup();
      resolve(data);
    };
    script.src = url + "?" + qs;
    script.onerror = () => {
      clearTimeout(timer);
      cleanup();
      reject(new Error("Falha de rede ao consultar a ANEEL"));
    };
    document.head.appendChild(script);
  });
}

async function ckanQuery({ q = "", limit = 100, offset = 0, filters = null }) {
  const params = { resource_id: RALIE_RESOURCE_ID, limit, offset };
  if (q) params.q = q;
  if (filters) params.filters = JSON.stringify(filters);
  return jsonp(CKAN_BASE, params);
}

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const TIPOS = [
  { v: "EOL", label: "Eólica" },
  { v: "UFV", label: "Solar fotovoltaica" },
  { v: "PCH", label: "PCH" },
  { v: "CGH", label: "CGH" },
  { v: "UHE", label: "UHE" },
  { v: "UTE", label: "Térmica" },
  { v: "UTN", label: "Nuclear" }
];
const SITUACOES_OBRA = ["Não Iniciada", "Em Andamento", "Paralisada", "Concluída"];
const VIABILIDADES = ["Alta", "Média", "Baixa"];

// Score a lead 0-100 based on urgency signals
function scoreLead(row) {
  let s = 0;
  const obra = (row.DscSituacaoObra || "").toLowerCase();
  const viab = (row.DscViabilidade || "").toLowerCase();
  const cron = (row.DscSituacaoCronograma || "").toLowerCase();
  const li = (row.DscSituacaoLI || "").toLowerCase();
  const cust = (row.DscSitCust || "").toLowerCase();

  if (obra.includes("paralis")) s += 40;
  else if (obra.includes("andament")) s += 15;
  else if (obra.includes("não iniciad") || obra.includes("nao iniciad")) s += 20;

  if (viab.includes("baix")) s += 30;
  else if (viab.includes("méd") || viab.includes("med")) s += 18;

  if (cron.includes("atras")) s += 15;

  if (li && !li.includes("vigent") && !li.includes("emitid")) s += 8;
  if (cust && !cust.includes("assin") && !cust.includes("vigent")) s += 7;

  return Math.min(100, s);
}

function leadTier(score) {
  if (score >= 60) return { label: "Quente", color: "red" };
  if (score >= 35) return { label: "Morno", color: "amber" };
  if (score >= 15) return { label: "Prospecção", color: "blue" };
  return { label: "Monitorar", color: "neutral" };
}

function fmtPot(kw) {
  const n = parseFloat(String(kw).replace(",", "."));
  if (!isFinite(n)) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + " MW";
  return n.toFixed(0) + " kW";
}

function fmtDate(d) {
  if (!d) return "—";
  // Try ISO or dd/mm/yyyy
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, day] = s.slice(0, 10).split("-");
    return `${day}/${m}/${y}`;
  }
  return s;
}

// Detect attempt to use Drawer
function ModuleRaliePanel() {
  const [filters, setFilters] = useState({
    uf: "",
    tipo: "",
    situacao: "Paralisada",
    viabilidade: "",
    q: ""
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(100);
  const [selected, setSelected] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {};
      if (filters.uf) apiFilters.SigUFPrincipal = filters.uf;
      if (filters.tipo) apiFilters.SigTipoGeracao = filters.tipo;
      if (filters.situacao) apiFilters.DscSituacaoObra = filters.situacao;
      if (filters.viabilidade) apiFilters.DscViabilidade = filters.viabilidade;

      const res = await ckanQuery({
        q: filters.q || "",
        limit,
        filters: Object.keys(apiFilters).length ? apiFilters : null
      });
      if (!res || !res.success) throw new Error("Resposta inválida da API");
      const records = (res.result && res.result.records) || [];
      // Dedup por CEG (último RALIE)
      const byCeg = new Map();
      for (const r of records) {
        const key = r.CodCEG || r.IdeNucleoCEG || r._id;
        const prev = byCeg.get(key);
        if (!prev || String(r.DatRalie || "") > String(prev.DatRalie || "")) {
          byCeg.set(key, r);
        }
      }
      const unique = Array.from(byCeg.values())
        .map(r => ({ ...r, __score: scoreLead(r) }))
        .sort((a, b) => b.__score - a.__score);
      setRows(unique);
      setTotal(res.result.total || records.length);
      setLastFetched(new Date());
    } catch (e) {
      setError(e.message || String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on first render
  useEffect(() => { runSearch(); /* eslint-disable-next-line */ }, []);

  const stats = useMemo(() => {
    const hot = rows.filter(r => r.__score >= 60).length;
    const warm = rows.filter(r => r.__score >= 35 && r.__score < 60).length;
    const pros = rows.filter(r => r.__score < 35).length;
    const totalMW = rows.reduce((a, r) => {
      const n = parseFloat(String(r.MdaPotenciaOutorgadaKw || "").replace(",", "."));
      return a + (isFinite(n) ? n / 1000 : 0);
    }, 0);
    return { hot, warm, pros, totalMW };
  }, [rows]);

  const setF = (k, v) => setFilters(s => ({ ...s, [k]: v }));

  const exportCSV = () => {
    if (!rows.length) return;
    const cols = ["__score", "CodCEG", "NomEmpreendimento", "SigTipoGeracao", "SigUFPrincipal", "MdaPotenciaOutorgadaKw", "DscSituacaoObra", "DscViabilidade", "DscSituacaoCronograma", "DscSituacaoLI", "DscSitCust", "DatRalie"];
    const header = ["Score", "CEG", "Empreendimento", "Tipo", "UF", "Potência (kW)", "Situação Obra", "Viabilidade", "Cronograma", "LI", "CUST", "Data RALIE"];
    const csv = [header.join(";"), ...rows.map(r => cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-ralie-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-inner panel-wide">
      <div className="module-kicker">Módulo 6</div>
      <h2 className="module-title">Painel de Leads — RALIE / ANEEL</h2>
      <p className="module-lead">
        Consulta ao vivo à API pública da ANEEL (CKAN DataStore). Filtre empreendimentos em implantação e identifique clientes prováveis por criticidade do risco regulatório.
      </p>

      <div className="panel-filters">
        <div className="f">
          <label>UF</label>
          <select value={filters.uf} onChange={e => setF("uf", e.target.value)}>
            <option value="">Todas</option>
            {UFS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="f">
          <label>Tipo de geração</label>
          <select value={filters.tipo} onChange={e => setF("tipo", e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
        </div>
        <div className="f">
          <label>Situação da obra</label>
          <select value={filters.situacao} onChange={e => setF("situacao", e.target.value)}>
            <option value="">Todas</option>
            {SITUACOES_OBRA.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="f">
          <label>Viabilidade</label>
          <select value={filters.viabilidade} onChange={e => setF("viabilidade", e.target.value)}>
            <option value="">Todas</option>
            {VIABILIDADES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="f grow">
          <label>Busca livre (nome, empresa, CEG)</label>
          <input type="text" placeholder="ex: Ventos do Sul, CNPJ, CEG…" value={filters.q} onChange={e => setF("q", e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} />
        </div>
        <div className="f">
          <label>Limite</label>
          <select value={limit} onChange={e => setLimit(+e.target.value)}>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>
        <div className="f f-actions">
          <button className="btn-primary" onClick={runSearch} disabled={loading}>
            {loading ? "Consultando…" : "Consultar ANEEL"}
          </button>
          <button className="btn-ghost" onClick={exportCSV} disabled={!rows.length}>Exportar CSV</button>
        </div>
      </div>

      {error && (
        <div className="panel-error">
          <strong>Não foi possível consultar a API:</strong> {error}
          <div style={{ marginTop: 6, fontSize: 12, opacity: .8 }}>
            Verifique a conexão ou acesse diretamente em <a href="https://dadosabertos.aneel.gov.br" target="_blank" rel="noreferrer">dadosabertos.aneel.gov.br</a>.
          </div>
        </div>
      )}

      <div className="panel-stats">
        <div className="stat"><div className="v">{rows.length}</div><div className="l">Resultados</div></div>
        <div className="stat hot"><div className="v">{stats.hot}</div><div className="l">Leads quentes</div></div>
        <div className="stat warm"><div className="v">{stats.warm}</div><div className="l">Leads mornos</div></div>
        <div className="stat"><div className="v">{stats.totalMW.toFixed(0)} MW</div><div className="l">Potência agregada</div></div>
        <div className="stat meta">
          <div className="v">{lastFetched ? lastFetched.toLocaleTimeString("pt-BR") : "—"}</div>
          <div className="l">Última consulta · {total.toLocaleString("pt-BR")} registros no RALIE</div>
        </div>
      </div>

      <div className="panel-main">
        <div className="panel-list">
          <div className="list-head">
            <div className="c-score">Score</div>
            <div className="c-name">Empreendimento</div>
            <div className="c-type">Tipo · UF</div>
            <div className="c-pot">Potência</div>
            <div className="c-situ">Situação</div>
            <div className="c-viab">Viabilidade</div>
          </div>
          <div className="list-body">
            {loading && <div className="list-empty">Consultando a API da ANEEL…</div>}
            {!loading && !rows.length && !error && <div className="list-empty">Nenhum resultado. Ajuste os filtros e consulte novamente.</div>}
            {!loading && rows.map((r, i) => {
              const tier = leadTier(r.__score);
              const isSel = selected && (selected.CodCEG || selected._id) === (r.CodCEG || r._id);
              return (
                <div
                  key={(r.CodCEG || r._id) + "-" + i}
                  className={`list-row ${isSel ? "sel" : ""}`}
                  onClick={() => setSelected(r)}
                >
                  <div className="c-score">
                    <div className={`score-chip tier-${tier.color}`}>
                      <span className="n">{r.__score}</span>
                      <span className="t">{tier.label}</span>
                    </div>
                  </div>
                  <div className="c-name">
                    <div className="nm">{r.NomEmpreendimento || "—"}</div>
                    <div className="ceg">CEG {r.CodCEG || "—"}</div>
                  </div>
                  <div className="c-type">
                    <span className="badge neutral">{r.SigTipoGeracao || "—"}</span>
                    <span className="uf">{r.SigUFPrincipal || "—"}</span>
                  </div>
                  <div className="c-pot">{fmtPot(r.MdaPotenciaOutorgadaKw)}</div>
                  <div className="c-situ">
                    <div>{r.DscSituacaoObra || "—"}</div>
                    <div className="sub">{r.DscSituacaoCronograma || ""}</div>
                  </div>
                  <div className="c-viab">
                    <span className={`viab-pill v-${(r.DscViabilidade || "").toLowerCase().replace(/[éê]/g,"e")}`}>{r.DscViabilidade || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="panel-detail">
          {!selected && (
            <div className="detail-empty">
              <div className="ico">◐</div>
              <h4>Selecione um empreendimento</h4>
              <p>Clique em uma linha da lista para ver a ficha completa do lead — dados de licenciamento, conexão e pontos de abordagem comercial.</p>
            </div>
          )}
          {selected && (
            <LeadDetail row={selected} onClose={() => setSelected(null)} />
          )}
        </aside>
      </div>

      <div className="panel-foot">
        Fonte: <a href="https://dadosabertos.aneel.gov.br/dataset/ralie-relatorio-de-acompanhamento-da-expansao-da-oferta-de-geracao-de-energia-eletrica" target="_blank" rel="noreferrer">ANEEL · Dados Abertos · RALIE</a> — consulta via API CKAN. Score próprio baseado em situação da obra, viabilidade, cronograma e pendências de LI/CUST.
      </div>
    </div>
  );
}

function LeadDetail({ row, onClose }) {
  const tier = leadTier(row.__score);
  const signals = [];
  if ((row.DscSituacaoObra || "").toLowerCase().includes("paralis")) signals.push({ txt: "Obras paralisadas — embargo ou falha de execução", sev: "red" });
  if ((row.DscViabilidade || "").toLowerCase().includes("baix")) signals.push({ txt: "Viabilidade Baixa — ANEEL não acredita na conclusão", sev: "red" });
  if ((row.DscSituacaoCronograma || "").toLowerCase().includes("atras")) signals.push({ txt: "Cronograma em atraso — risco de penalidade ativa", sev: "amber" });
  const li = (row.DscSituacaoLI || "").toLowerCase();
  if (li && !li.includes("vigent") && !li.includes("emitid")) signals.push({ txt: `LI: ${row.DscSituacaoLI} — pendência ambiental`, sev: "amber" });
  const cust = (row.DscSitCust || "").toLowerCase();
  if (cust && !cust.includes("assin") && !cust.includes("vigent")) signals.push({ txt: `CUST: ${row.DscSitCust} — pendência de conexão`, sev: "amber" });
  if (!signals.length) signals.push({ txt: "Nenhum risco crítico flagrado — monitoramento preventivo", sev: "blue" });

  return (
    <div className="detail-card">
      <button className="close" onClick={onClose}>×</button>
      <div className={`detail-tier tier-${tier.color}`}>
        <span className="score">{row.__score}</span>
        <span>Lead {tier.label}</span>
      </div>
      <h3>{row.NomEmpreendimento || "—"}</h3>
      <div className="detail-meta">
        <span className="badge neutral">{row.SigTipoGeracao || "—"}</span>
        <span className="badge neutral">{row.SigUFPrincipal || "—"}</span>
        <span className="badge neutral">{fmtPot(row.MdaPotenciaOutorgadaKw)}</span>
      </div>

      <div className="detail-section">
        <div className="sec-title">Sinais de risco</div>
        <ul className="signals">
          {signals.map((s, i) => <li key={i} className={`sig s-${s.sev}`}>{s.txt}</li>)}
        </ul>
      </div>

      <div className="detail-section">
        <div className="sec-title">Identificação</div>
        <div className="kv"><span>CEG</span><b>{row.CodCEG || "—"}</b></div>
        <div className="kv"><span>Núcleo CEG</span><b>{row.IdeNucleoCEG || "—"}</b></div>
        <div className="kv"><span>Origem</span><b>{row.DscOrigemCombustivel || "—"}</b></div>
        <div className="kv"><span>Regime</span><b>{row.DscPropriRegimePariticipacao || "—"}</b></div>
        <div className="kv"><span>Complexo</span><b>{row.NomComplexo || "—"}</b></div>
      </div>

      <div className="detail-section">
        <div className="sec-title">Situação regulatória</div>
        <div className="kv"><span>Obra</span><b>{row.DscSituacaoObra || "—"}</b></div>
        <div className="kv"><span>Cronograma</span><b>{row.DscSituacaoCronograma || "—"}</b></div>
        <div className="kv"><span>Viabilidade</span><b>{row.DscViabilidade || "—"}</b></div>
        <div className="kv"><span>Justificativa</span><b style={{fontSize:12,fontWeight:400}}>{row.DscJustificativaPrevisao || "—"}</b></div>
      </div>

      <div className="detail-section">
        <div className="sec-title">Licenciamento ambiental</div>
        <div className="kv"><span>LP</span><b>{row.DscSituacaoLP || "—"} · val. {fmtDate(row.DatValidadeLP)}</b></div>
        <div className="kv"><span>LI</span><b>{row.DscSituacaoLI || "—"} · val. {fmtDate(row.DatValidadeLI)}</b></div>
        <div className="kv"><span>LO</span><b>{row.DscSituacaoLO || "—"} · prev. {fmtDate(row.DatPrevistaEmissaoLO)}</b></div>
      </div>

      <div className="detail-section">
        <div className="sec-title">Conexão</div>
        <div className="kv"><span>Tipo</span><b>{row.DscTipoConexao || "—"}</b></div>
        <div className="kv"><span>Concessionária</span><b>{row.NomEmpresaConexao || "—"}</b></div>
        <div className="kv"><span>CNPJ conexão</span><b>{row.NumCnpjEmpresaConexao || "—"}</b></div>
        <div className="kv"><span>CUST</span><b>{row.DscSitCust || "—"} · assin. {fmtDate(row.DatAssinaturaCust)}</b></div>
        <div className="kv"><span>CUSD</span><b>{row.DscSituacaoCusd || "—"} · assin. {fmtDate(row.DatAssinaturaCusd)}</b></div>
      </div>

      <div className="detail-section">
        <div className="sec-title">Outorga</div>
        <div className="kv"><span>Tipo</span><b>{row.DscTipoOutorga || "—"}</b></div>
        <div className="kv"><span>Ato</span><b>{row.DscAtoOutorga || "—"} {row.DscNumeroAto || ""}</b></div>
        <div className="kv"><span>Emissão</span><b>{fmtDate(row.DatEmissaoAto)}</b></div>
        <div className="kv"><span>Data RALIE</span><b>{fmtDate(row.DatRalie)}</b></div>
      </div>
    </div>
  );
}

window.ModuleRaliePanel = ModuleRaliePanel;
