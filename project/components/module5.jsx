/* global React, UI */
const { useState } = React;
const { Glossary, Badge, Callout, Icon } = window.UI;

const STEPS = [
  {
    num: 1, title: "Acesso ao portal ou download da base CSV",
    desc: "Acessar portalrelatorios.aneel.gov.br/Ralie ou baixar o arquivo CSV mensal no portal de dados abertos da ANEEL. O CSV contém histórico desde junho de 2021 e tem campos estruturados para análise em planilha."
  },
  {
    num: 2, title: "Filtro por situação de cronograma",
    desc: "Filtrar empreendimentos com cronograma atrasado. Esse filtro elimina imediatamente todos os projetos no prazo e concentra a análise em quem tem problema ativo."
  },
  {
    num: 3, title: "Filtro por região e tipo de geração",
    desc: "Aplicar filtro geográfico (estado ou região) e de fonte (eólica, solar, PCH) conforme a estratégia de captação do mês."
  },
  {
    num: 4, title: "Identificação de pioramentos",
    desc: "Comparar o arquivo do mês atual com o do mês anterior. Empreendimentos que pioraram de classificação (de Média para Baixa, de 'em andamento' para 'paralisada') são os leads com urgência crescente — o melhor momento de abordagem."
  },
  {
    num: 5, title: "Qualificação da ficha do empreendimento",
    desc: "Para cada lead identificado, acessar o detalhamento no portal: nome e CNPJ do empreendedor, CEG, tipo e potência, data de operação comprometida vs. atual, status de licença ambiental, status de CUST/CUSD, viabilidade classificada."
  },
  {
    num: 6, title: "Abordagem estruturada",
    desc: "A abordagem usa os dados do RALIE como gatilho de credibilidade: \"Identificamos no RALIE de [mês] que seu empreendimento [nome] está com [situação específica]. Isso representa exposição estimada de R$ X. Nossa assessoria atua preventivamente nessa fase.\" O cliente percebe que você já conhece o projeto antes de ele te procurar."
  }
];

function ModuleRalie() {
  return (
    <div className="main-inner">
      <div className="module-kicker">Módulo 5</div>
      <h2 className="module-title">RALIE — Como captamos clientes</h2>
      <p className="module-lead">
        Uma inteligência de prospecção sistemática — não networking. Dados públicos da ANEEL, atualizados todo mês, transformados em pipeline qualificado.
      </p>

      <h3 className="section-title"><span className="num">5.1</span>O que é o RALIE</h3>
      <p>
        O <Glossary term="RALIE">RALIE</Glossary> é o painel público da ANEEL que lista todos os empreendimentos de geração em implantação no Brasil — atualizado até o dia 15 de cada mês.
      </p>

      <div className="ralie-features">
        <div className="ralie-feat">
          <div className="ico"><Icon name="globe" size={16} /></div>
          <h6>Público e gratuito</h6>
          <p>Acesso aberto em portalrelatorios.aneel.gov.br/Ralie</p>
        </div>
        <div className="ralie-feat">
          <div className="ico"><Icon name="calendar" size={16} /></div>
          <h6>Atualizado mensalmente</h6>
          <p>Dados frescos sobre cada empreendimento todo mês</p>
        </div>
        <div className="ralie-feat">
          <div className="ico"><Icon name="download" size={16} /></div>
          <h6>Exportável</h6>
          <p>Base completa em CSV via portal de dados abertos</p>
        </div>
        <div className="ralie-feat">
          <div className="ico"><Icon name="shield" size={16} /></div>
          <h6>Auditável</h6>
          <p>Mesmo dado que a ANEEL usa para fiscalizar</p>
        </div>
      </div>

      <h3 className="section-title"><span className="num">5.2</span>Os dois indicadores-chave de qualificação</h3>

      <div className="qual-grid">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 22px 8px" }}>
            <Badge color="blue">Indicador 1</Badge>
            <h4 style={{ margin: "8px 0 4px", fontSize: 16, color: "var(--text-dark)" }}>Situação da Obra</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Status físico do projeto</p>
          </div>
          <table className="data-table" style={{ border: "none", borderTop: "1px solid var(--border)", borderRadius: 0 }}>
            <thead>
              <tr><th>Classificação</th><th>Perfil de lead</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Não iniciada</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Obras não começaram</div></td><td>Prospecção preventiva</td></tr>
              <tr><td><strong>Em andamento</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Obras em curso</div></td><td>Avaliar cronograma</td></tr>
              <tr className="critical"><td><strong>Paralisada</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Obras paradas</div></td><td><strong>Lead urgente — abordagem imediata</strong></td></tr>
              <tr><td><strong>Concluída</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Aguardando operação</div></td><td>Eventual apoio operacional</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 22px 8px" }}>
            <Badge color="indigo">Indicador 2</Badge>
            <h4 style={{ margin: "8px 0 4px", fontSize: 16, color: "var(--text-dark)" }}>Viabilidade da Implantação</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Julgamento prospectivo da ANEEL</p>
          </div>
          <table className="data-table" style={{ border: "none", borderTop: "1px solid var(--border)", borderRadius: 0 }}>
            <thead>
              <tr><th>Classificação</th><th>Estratégia de abordagem</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Alta</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>LI vigente + obras em andamento</div></td><td>Conformidade preventiva</td></tr>
              <tr className="hot"><td><strong>Média</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Obras paradas ou sem LI</div></td><td>Risco crescente — prevenção</td></tr>
              <tr className="critical"><td><strong>Baixa</strong><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Suspensão de licença, revogação</div></td><td><strong>Urgência — já em consequência</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <Callout>
        <strong>Nota técnica.</strong> A viabilidade é um julgamento prospectivo da ANEEL — ela indica a expectativa de o projeto ser concluído, independentemente da situação do cronograma. Um projeto pode estar "em andamento" e com viabilidade "Baixa" — o que significa que a ANEEL já não acredita na conclusão mesmo com obras acontecendo.
      </Callout>

      <h3 className="section-title"><span className="num">5.3</span>Roteiro de prospecção mensal</h3>
      <div className="steps-list">
        {STEPS.map(s => (
          <div className="step" key={s.num}>
            <div className="step-num">{s.num}</div>
            <div>
              <h5>{s.title}</h5>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title"><span className="num">5.4</span>Campos relevantes na ficha de uma usina</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>Campo</th>
            <th style={{ width: "38%" }}>O que indica</th>
            <th>O que você procura</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Nome do empreendedor</strong></td><td>Seu lead direto</td><td>CNPJ, grupo controlador, outros projetos</td></tr>
          <tr><td><strong><Glossary term="CEG">CEG</Glossary></strong></td><td>Código único do projeto</td><td>Necessário para qualquer protocolo na ANEEL</td></tr>
          <tr><td><strong>Data de operação comprometida</strong></td><td>Prazo original</td><td>Comparar com data atual = magnitude do atraso</td></tr>
          <tr className="hot"><td><strong>Situação da obra</strong></td><td>Status físico</td><td><strong>Paralisada = urgência máxima</strong></td></tr>
          <tr className="hot"><td><strong>Viabilidade</strong></td><td>Julgamento da ANEEL</td><td><strong>Baixa = lead quente</strong></td></tr>
          <tr><td><strong>Status da <Glossary term="LI">LI</Glossary></strong></td><td>Licença de instalação</td><td>Ausente perto do prazo = risco iminente</td></tr>
          <tr><td><strong><Glossary term="CUST">CUST</Glossary>/<Glossary term="CUSD">CUSD</Glossary></strong></td><td>Contrato de conexão</td><td>Não assinado perto do prazo = risco iminente</td></tr>
        </tbody>
      </table>
    </div>
  );
}

window.ModuleRalie = ModuleRalie;
