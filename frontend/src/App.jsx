import "./styles.css";

const metrics = [
  { label: "Active Rules", value: "128", change: "+12 today" },
  { label: "Live Transactions", value: "4,392", change: "Streaming now" },
  { label: "Flagged Alerts", value: "36", change: "9 high risk" },
  { label: "Audit Reports", value: "12", change: "Auto-generated" },
];

const alerts = [
  {
    id: "AL-2041",
    severity: "High",
    title: "Large transfer without complete KYC",
    detail: "INR 9,80,000 sent from ACC-1182 to ACC-4421.",
  },
  {
    id: "AL-2042",
    severity: "Medium",
    title: "Rapid repeated transfers detected",
    detail: "7 linked transactions in 14 minutes across 3 accounts.",
  },
  {
    id: "AL-2043",
    severity: "High",
    title: "Cross-border transfer to watchlisted region",
    detail: "Beneficiary jurisdiction triggered compliance review.",
  },
];

const sources = [
  { name: "RBI", status: "Connected" },
  { name: "SEBI", status: "Connected" },
  { name: "EU GDPR", status: "Demo Mode" },
];

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">RG</div>
            <div>
              <h1>RegGuard AI</h1>
              <p>Compliance Intelligence</p>
            </div>
          </div>

          <nav className="nav">
            <a className="nav-item active" href="#">
              Overview
            </a>
            <a className="nav-item" href="#">
              Regulations
            </a>
            <a className="nav-item" href="#">
              Live Monitor
            </a>
            <a className="nav-item" href="#">
              Investigations
            </a>
            <a className="nav-item" href="#">
              Audit Reports
            </a>
          </nav>
        </div>

        <div className="sidebar-card">
          <p className="small-label">System Status</p>
          <h3>Live monitoring active</h3>
          <span className="status-pill">All services healthy</span>
        </div>
      </aside>

      <main className="main-content">
        <section className="hero-card">
          <div>
            <p className="eyebrow">AUTOMATED REGULATORY SURVEILLANCE</p>
            <h2>Real-time compliance monitoring for financial risk teams.</h2>
            <p className="hero-copy">
              Auto-ingest rules, stream transactions, detect suspicious activity,
              and generate audit-ready reports from one unified dashboard.
            </p>

            <div className="hero-actions">
              <button className="primary-btn">Start Live Feed</button>
              <button className="secondary-btn">View Audit Trail</button>
            </div>
          </div>

          <div className="hero-panel">
            <p className="small-label">Detection Engine</p>
            <div className="engine-item">
              <span>Rule-based screening</span>
              <strong>Online</strong>
            </div>
            <div className="engine-item">
              <span>Streaming pipeline</span>
              <strong>Active</strong>
            </div>
            <div className="engine-item">
              <span>Graph risk prototype</span>
              <strong>Ready</strong>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          {metrics.map((item) => (
            <div className="metric-card" key={item.label}>
              <p className="small-label">{item.label}</p>
              <h3>{item.value}</h3>
              <span>{item.change}</span>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="small-label">LIVE ALERTS</p>
                <h3>Priority queue</h3>
              </div>
              <button className="ghost-btn">Refresh</button>
            </div>

            <div className="alert-list">
              {alerts.map((alert) => (
                <div className="alert-card" key={alert.id}>
                  <div className="alert-top">
                    <span className={`severity ${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    <span className="alert-id">{alert.id}</span>
                  </div>
                  <h4>{alert.title}</h4>
                  <p>{alert.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="small-label">REGULATION SOURCES</p>
                <h3>Connected feeds</h3>
              </div>
              <button className="ghost-btn">Sync now</button>
            </div>

            <div className="source-list">
              {sources.map((source) => (
                <div className="source-row" key={source.name}>
                  <div>
                    <h4>{source.name}</h4>
                    <p>Official regulatory source</p>
                  </div>
                  <span className="status-pill">{source.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;