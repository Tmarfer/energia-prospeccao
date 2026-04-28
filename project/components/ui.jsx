/* global React */
const { useState, useEffect, useRef } = React;

// ---------- Tooltip/Glossary ----------
function Glossary({ term, children }) {
  const [show, setShow] = useState(false);
  const def = window.GLOSSARY[term] || "";
  return (
    <span
      className="glossary"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children || term}
      {show && <span className="tooltip">{def}</span>}
    </span>
  );
}

// ---------- Icons ----------
function Icon({ name, size = 16 }) {
  const s = size;
  const stroke = "currentColor";
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/></svg>;
    case "chart":
      return <svg {...common}><path d="M4 20V9"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/></svg>;
    case "alert":
      return <svg {...common}><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".5"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "clipboard":
      return <svg {...common}><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>;
    case "radar":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "money":
      return <svg {...common}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>;
    case "layers":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>;
    case "gavel":
      return <svg {...common}><path d="m14 4 6 6-4 4-6-6z"/><path d="m10 8-6 6 4 4 6-6"/><path d="M4 22h10"/></svg>;
    case "doc":
      return <svg {...common}><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/></svg>;
    case "link":
      return <svg {...common}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>;
    case "filter":
      return <svg {...common}><path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z"/></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case "download":
      return <svg {...common}><path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/></svg>;
    case "check":
      return <svg {...common}><path d="m5 13 4 4L19 7"/></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "cloud":
      return <svg {...common}><path d="M7 18a4 4 0 0 1-1-7.8 6 6 0 0 1 11.5-1.5A4.5 4.5 0 0 1 18 18H7z"/></svg>;
    case "building":
      return <svg {...common}><rect x="4" y="3" width="16" height="18"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/></svg>;
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

// ---------- Badge ----------
function Badge({ children, color = "neutral" }) {
  return <span className={`badge ${color}`}>{children}</span>;
}

// ---------- Metric Card ----------
function MetricCard({ value, label, hover, accent }) {
  return (
    <div className="metric-card">
      <div className={`value ${accent ? "accent" : ""}`}>{value}</div>
      <div className="label">{label}</div>
      {hover && <div className="hover-note">{hover}</div>}
    </div>
  );
}

// ---------- Callout ----------
function Callout({ children }) {
  return <div className="callout">{children}</div>;
}

// ---------- ANEEL CKAN SQL helper (shared) ----------
// Usa o endpoint datastore_search_sql com JSONP para queries agregadas e filtros NOT IN
const _CKAN_SQL_URL = "https://dadosabertos.aneel.gov.br/api/3/action/datastore_search_sql";
function ckanSQL(sql, timeoutMs = 50000) {
  return new Promise((resolve, reject) => {
    const cb = "__csql_" + Math.random().toString(36).slice(2);
    const qs = new URLSearchParams({ sql, callback: cb }).toString();
    const s = document.createElement("script");
    const t = setTimeout(() => {
      delete window[cb]; s.remove();
      reject(new Error("ckan_sql_timeout"));
    }, timeoutMs);
    window[cb] = d => { clearTimeout(t); delete window[cb]; s.remove(); resolve(d); };
    s.onerror = () => { clearTimeout(t); delete window[cb]; s.remove(); reject(new Error("ckan_sql_network")); };
    s.src = _CKAN_SQL_URL + "?" + qs;
    document.head.appendChild(s);
  });
}

window.UI = { Glossary, Icon, Badge, MetricCard, Callout, ckanSQL };
