/* global React, ReactDOM, UI, MODULES */
const { useState, useEffect } = React;
const { Icon } = window.UI;

const NAV_ICONS = {
  0: "home",
  1: "chart",
  2: "alert",
  3: "shield",
  4: "clipboard",
  5: "radar",
  6: "filter"
};

function App() {
  const [active, setActive] = useState(() => {
    const saved = parseInt(localStorage.getItem("presModule") || "0", 10);
    return Number.isFinite(saved) ? saved : 0;
  });

  useEffect(() => {
    localStorage.setItem("presModule", String(active));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);

  const current = window.MODULES.find(m => m.id === active);

  const renderModule = () => {
    switch (active) {
      case 0: return <window.ModuleHome goTo={setActive} />;
      case 1: return <window.ModuleMercado goTo={setActive} />;
      case 2: return <window.ModulePenalidades />;
      case 3: return <window.ModuleExcludente />;
      case 4: return <window.ModuleConformidade />;
      case 5: return <window.ModuleRalie />;
      case 6: return <window.ModuleRaliePanel />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-brand">
          <div className="title">Assessoria em Geração de Energia Elétrica</div>
          <div className="subtitle">Edson Araújo Advogados · Thiago Fernandes Advogado</div>
        </div>
        <div className="header-divider" />
        <div className="header-module">{current.label}</div>
        <div className="header-right">Apresentação institucional · 2026</div>
      </header>

      <div className="body">
        <nav className="sidebar" data-screen-label="Sidebar">
          <div className="sidebar-section">Módulos</div>
          {window.MODULES.map(m => (
            <div
              key={m.id}
              className={`nav-item ${active === m.id ? "active" : ""}`}
              onClick={() => setActive(m.id)}
            >
              <span className="num">{String(m.id).padStart(2, "0")}</span>
              <span className="ico"><Icon name={NAV_ICONS[m.id]} size={16} /></span>
              <span>{m.short}</span>
            </div>
          ))}
        </nav>

        <main className="main" data-screen-label={`0${active} ${current.short}`}>
          {renderModule()}
        </main>
      </div>

      <footer className="footer">
        <div className="firms">Edson Araújo Advogados · Thiago Fernandes Advogado</div>
        <div>Material de uso interno — Apresentação ao parceiro comercial · Abril 2026</div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
