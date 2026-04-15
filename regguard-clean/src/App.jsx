import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./index.css";

const sourceCatalog = [
  {
    id: "rbi",
    name: "RBI",
    jurisdiction: "India",
    status: "Connected",
    lastUpdated: "2 mins ago",
    description: "Reserve Bank circulars and AML/KYC guidance.",
    officialUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
  },
  {
    id: "sebi",
    name: "SEBI",
    jurisdiction: "India",
    status: "Connected",
    lastUpdated: "7 mins ago",
    description: "Capital market compliance and reporting directives.",
    officialUrl: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0",
  },
  {
    id: "gdpr",
    name: "EU GDPR",
    jurisdiction: "European Union",
    status: "Demo Mode",
    lastUpdated: "14 mins ago",
    description: "Data privacy and consent obligations for regulated flows.",
    officialUrl: "https://gdpr.eu/",
  },
];

const ruleTemplates = {
  RBI: [
    {
      code: "RBI-AML-01",
      title: "KYC required for high-value transfer",
      severity: "High",
      logic: "Flag transaction above INR 500,000 when KYC is incomplete.",
    },
    {
      code: "RBI-AML-02",
      title: "Watchlist geography review",
      severity: "High",
      logic: "Escalate transfers routed to high-risk jurisdictions.",
    },
    {
      code: "RBI-AML-03",
      title: "Rapid split transfer pattern",
      severity: "Medium",
      logic: "Detect repeated near-threshold transfers inside short windows.",
    },
  ],
  SEBI: [
    {
      code: "SEBI-MKT-01",
      title: "Large market-linked fund movement review",
      severity: "Medium",
      logic: "Check unusual value movement tied to brokerage-linked accounts.",
    },
    {
      code: "SEBI-MKT-02",
      title: "Multi-account fund funnel",
      severity: "High",
      logic: "Review many-to-one beneficiary patterns across trading entities.",
    },
  ],
  "EU GDPR": [
    {
      code: "GDPR-DATA-01",
      title: "Consent validation for cross-border data-linked payment",
      severity: "Medium",
      logic: "Review if transaction metadata implies protected data transfer without consent trace.",
    },
    {
      code: "GDPR-DATA-02",
      title: "Data minimization alert",
      severity: "Low",
      logic: "Flag workflows storing more personal data than required for compliance review.",
    },
  ],
};

const initialTransactions = [
  {
    id: "TXN-9001",
    time: "21:00:04",
    sender: "ACC-1182",
    receiver: "ACC-4421",
    amount: 980000,
    country: "IN",
    kyc: "Pending",
    channel: "Wire",
    risk: 91,
    status: "Flagged",
    reason: "High-value transfer with incomplete KYC",
  },
  {
    id: "TXN-9002",
    time: "21:00:09",
    sender: "ACC-2108",
    receiver: "ACC-9014",
    amount: 187500,
    country: "AE",
    kyc: "Verified",
    channel: "SWIFT",
    risk: 62,
    status: "Review",
    reason: "Cross-border transfer to monitored geography",
  },
  {
    id: "TXN-9003",
    time: "21:00:12",
    sender: "ACC-5510",
    receiver: "ACC-1021",
    amount: 48000,
    country: "IN",
    kyc: "Verified",
    channel: "UPI",
    risk: 18,
    status: "Clear",
    reason: "Normal transaction behavior",
  },
  {
    id: "TXN-9004",
    time: "21:00:18",
    sender: "ACC-4902",
    receiver: "ACC-8830",
    amount: 492000,
    country: "SG",
    kyc: "Pending",
    channel: "Card",
    risk: 57,
    status: "Review",
    reason: "Near-threshold structuring pattern",
  },
];

const initialCases = [
  {
    caseId: "CASE-3001",
    txnId: "TXN-9001",
    rule: "RBI-AML-01",
    severity: "High",
    analyst: "Open",
    action: "Pending analyst review",
    time: "21:00:05",
  },
  {
    caseId: "CASE-3002",
    txnId: "TXN-9002",
    rule: "RBI-AML-02",
    severity: "Medium",
    analyst: "Open",
    action: "Pending analyst review",
    time: "21:00:10",
  },
  {
    caseId: "CASE-3003",
    txnId: "TXN-9004",
    rule: "RBI-AML-03",
    severity: "Medium",
    analyst: "Open",
    action: "Pending analyst review",
    time: "21:00:18",
  },
];

const accountPool = [
  "ACC-1182",
  "ACC-4421",
  "ACC-2108",
  "ACC-9014",
  "ACC-5510",
  "ACC-1021",
  "ACC-4902",
  "ACC-8830",
  "ACC-7301",
  "ACC-6612",
  "ACC-8014",
  "ACC-2209",
];

const countries = ["IN", "AE", "SG", "UK", "DE", "HK"];
const channels = ["Wire", "SWIFT", "UPI", "Card", "NEFT"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function deriveRule(txn) {
  if (txn.status === "Flagged") return "RBI-AML-01";
  if (txn.reason.includes("Cross-border")) return "RBI-AML-02";
  return "RBI-AML-03";
}

function buildTransaction(index) {
  const sender = randomItem(accountPool);
  let receiver = randomItem(accountPool);
  while (receiver === sender) receiver = randomItem(accountPool);

  const amount = Math.floor(Math.random() * 900000) + 10000;
  const country = randomItem(countries);
  const kyc = Math.random() > 0.3 ? "Verified" : "Pending";
  const channel = randomItem(channels);

  const roll = Math.random();
  let risk = 0;
  let status = "Clear";
  let reason = "Normal transaction behavior";

  if (roll < 0.42) {
    risk = Math.floor(Math.random() * 25) + 10;
    status = "Clear";
    reason = "Normal transaction behavior";
  } else if (roll < 0.77) {
    risk = Math.floor(Math.random() * 20) + 45;
    status = "Review";
    reason =
      Math.random() > 0.5
        ? "Cross-border transfer to monitored geography"
        : "Near-threshold structuring pattern";
  } else {
    risk = Math.floor(Math.random() * 20) + 80;
    status = "Flagged";
    reason =
      Math.random() > 0.5
        ? "High-value transfer with incomplete KYC"
        : "Multi-account funnel risk suspected";
  }

  return {
    id: `TXN-${9100 + index}`,
    time: new Date().toLocaleTimeString("en-GB"),
    sender,
    receiver,
    amount,
    country,
    kyc,
    channel,
    risk,
    status,
    reason,
  };
}

function severityClass(value) {
  return value.toLowerCase();
}

function App() {
  const [activePage, setActivePage] = useState("overview");
  const [selectedSources, setSelectedSources] = useState(["RBI"]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cases, setCases] = useState(initialCases);

  const riskyTransactions = useMemo(
    () => transactions.filter((txn) => txn.status === "Review" || txn.status === "Flagged"),
    [transactions]
  );

  const [selectedTxnId, setSelectedTxnId] = useState(
    riskyTransactions[0]?.id || initialTransactions[0].id
  );

  useEffect(() => {
    if (!riskyTransactions.find((txn) => txn.id === selectedTxnId) && riskyTransactions.length > 0) {
      setSelectedTxnId(riskyTransactions[0].id);
    }
  }, [riskyTransactions, selectedTxnId]);

  const filteredRules = useMemo(() => {
    return selectedSources.flatMap((source) => ruleTemplates[source] || []);
  }, [selectedSources]);

  useEffect(() => {
    if (!isStreaming) return;

    const intervalId = setInterval(() => {
      const newTxn = buildTransaction(Math.floor(Math.random() * 900));

      setTransactions((prev) => [newTxn, ...prev].slice(0, 18));

      if (newTxn.status !== "Clear") {
        const derivedSeverity = newTxn.status === "Flagged" ? "High" : "Medium";

        setCases((prev) => {
          const alreadyExists = prev.some((item) => item.txnId === newTxn.id);
          if (alreadyExists) return prev;

          const nextCase = {
            caseId: `CASE-${3000 + prev.length + 1}`,
            txnId: newTxn.id,
            rule: deriveRule(newTxn),
            severity: derivedSeverity,
            analyst: "Open",
            action: "Pending analyst review",
            time: newTxn.time,
          };

          return [nextCase, ...prev].slice(0, 30);
        });
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isStreaming]);

  const selectedTxn =
    riskyTransactions.find((txn) => txn.id === selectedTxnId) || riskyTransactions[0] || null;

  const selectedCase = selectedTxn
    ? cases.find((item) => item.txnId === selectedTxn.id)
    : null;

  const kpi = useMemo(() => {
    const flagged = transactions.filter((txn) => txn.status === "Flagged").length;
    const review = transactions.filter((txn) => txn.status === "Review").length;
    const avgRisk = Math.round(
      transactions.reduce((sum, txn) => sum + txn.risk, 0) / transactions.length
    );

    return {
      rules: filteredRules.length,
      flagged,
      review,
      live: transactions.length,
      avgRisk,
      reports: cases.length,
      clear: transactions.filter((txn) => txn.status === "Clear").length,
    };
  }, [transactions, cases, filteredRules]);

  function toggleSource(source) {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== source);
      }
      return [...prev, source];
    });
  }

  function handleSyncRules() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  }

  function updateCaseAction(caseId, action) {
    setCases((prev) =>
      prev.map((item) =>
        item.caseId === caseId
          ? {
              ...item,
              analyst: "Analyst-1",
              action,
            }
          : item
      )
    );
  }

  function generateAuditPdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("RegGuard AI - Audit Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Selected Sources: ${selectedSources.join(", ")}`, 14, 38);
    doc.text(`Total Cases: ${cases.length}`, 14, 46);

    let y = 58;

    cases.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.caseId}`, 14, y);
      y += 7;
      doc.text(`Txn: ${item.txnId}`, 14, y);
      y += 7;
      doc.text(`Rule: ${item.rule} | Severity: ${item.severity}`, 14, y);
      y += 7;
      doc.text(`Analyst: ${item.analyst} | Action: ${item.action}`, 14, y);
      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("regguard-audit-report.pdf");
  }

  function renderOverview() {
    const topAlerts = riskyTransactions.slice(0, 3);

    return (
      <>
        <section className="hero-card">
          <div>
            <p className="eyebrow">AUTOMATED REGULATORY SURVEILLANCE</p>
            <h2>Real-time compliance monitoring for financial risk teams.</h2>
            <p className="hero-copy">
              Auto-ingest rules, stream transactions, detect suspicious activity,
              and generate audit-ready reports from one unified dashboard.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setActivePage("monitor")}>
                Open Live Monitor
              </button>
              <button className="secondary-btn" onClick={() => setActivePage("reports")}>
                View Audit Trail
              </button>
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
              <strong>{isStreaming ? "Active" : "Paused"}</strong>
            </div>
            <div className="engine-item">
              <span>Graph risk prototype</span>
              <strong>Ready</strong>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <p className="small-label">Active Rules</p>
            <h3>{kpi.rules}</h3>
            <span>Based on selected sources</span>
          </div>
          <div className="metric-card">
            <p className="small-label">Live Transactions</p>
            <h3>{kpi.live}</h3>
            <span>{isStreaming ? "Streaming now" : "Feed paused"}</span>
          </div>
          <div className="metric-card">
            <p className="small-label">Flagged / Review</p>
            <h3>
              {kpi.flagged} / {kpi.review}
            </h3>
            <span>{kpi.clear} currently safe</span>
          </div>
          <div className="metric-card">
            <p className="small-label">Audit Cases</p>
            <h3>{kpi.reports}</h3>
            <span>Risk cases generated</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="small-label">PRIORITY QUEUE</p>
                <h3>Top live alerts</h3>
              </div>
              <button className="ghost-btn" onClick={() => setActivePage("investigations")}>
                Investigate
              </button>
            </div>

            <div className="alert-list">
              {topAlerts.map((alert) => (
                <button
                  className="alert-card clickable-card"
                  key={alert.id}
                  onClick={() => {
                    setSelectedTxnId(alert.id);
                    setActivePage("investigations");
                  }}
                >
                  <div className="alert-top">
                    <span
                      className={`severity ${
                        alert.status === "Flagged" ? "high" : "medium"
                      }`}
                    >
                      {alert.status}
                    </span>
                    <span className="alert-id">{alert.id}</span>
                  </div>
                  <h4>{alert.reason}</h4>
                  <p>
                    {alert.sender} to {alert.receiver}, INR {formatAmount(alert.amount)},{" "}
                    {alert.country}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="small-label">CONNECTED SOURCES</p>
                <h3>Selected rule feeds</h3>
              </div>
              <button className="ghost-btn" onClick={() => setActivePage("regulations")}>
                Open Sources
              </button>
            </div>

            <div className="source-list">
              {sourceCatalog.map((source) => (
                <div className="source-row" key={source.id}>
                  <div>
                    <h4>{source.name}</h4>
                    <p>{source.description}</p>
                  </div>
                  <span className="status-pill">
                    {selectedSources.includes(source.name) ? "Selected" : source.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  function renderRegulations() {
    return (
      <section className="page-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">SOURCE CONNECTOR</p>
              <h3>Select one or multiple regulation sources</h3>
            </div>
            <button className="primary-btn" onClick={handleSyncRules}>
              {syncing ? "Syncing..." : "Sync Rules"}
            </button>
          </div>

          <div className="source-cards">
            {sourceCatalog.map((source) => (
              <div
                key={source.id}
                className={`source-tile ${
                  selectedSources.includes(source.name) ? "selected" : ""
                }`}
              >
                <div className="source-tile-top">
                  <h4>{source.name}</h4>
                  <span className="status-pill">{source.status}</span>
                </div>
                <p>{source.description}</p>
                <small>
                  {source.jurisdiction} · Updated {source.lastUpdated}
                </small>

                <div className="source-actions">
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.name)}
                      onChange={() => toggleSource(source.name)}
                    />
                    Use this source
                  </label>

                  <a
                    href={source.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    Open official source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">STRUCTURED RULES</p>
              <h3>Rules from selected sources</h3>
            </div>
          </div>

          <div className="rule-list">
            {filteredRules.map((rule) => (
              <div className="rule-card" key={rule.code}>
                <div className="alert-top">
                  <span className={`severity ${severityClass(rule.severity)}`}>
                    {rule.severity}
                  </span>
                  <span className="alert-id">{rule.code}</span>
                </div>
                <h4>{rule.title}</h4>
                <p>{rule.logic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderMonitor() {
    return (
      <section className="page-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">REAL-TIME TRANSACTION STREAM</p>
              <h3>Continuous compliance monitor</h3>
            </div>

            <div className="button-row">
              <button className="primary-btn" onClick={() => setIsStreaming(true)}>
                Start Feed
              </button>
              <button className="secondary-btn" onClick={() => setIsStreaming(false)}>
                Pause Feed
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>Flow</th>
                  <th>Amount</th>
                  <th>Country</th>
                  <th>KYC</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={txn.status !== "Clear" ? "row-alert" : ""}
                    onClick={() => {
                      if (txn.status === "Clear") return;
                      setSelectedTxnId(txn.id);
                      setActivePage("investigations");
                    }}
                  >
                    <td>{txn.id}</td>
                    <td>{txn.time}</td>
                    <td>
                      {txn.sender} → {txn.receiver}
                    </td>
                    <td>INR {formatAmount(txn.amount)}</td>
                    <td>{txn.country}</td>
                    <td>{txn.kyc}</td>
                    <td>{txn.risk}</td>
                    <td>
                      <span
                        className={`severity ${
                          txn.status === "Flagged"
                            ? "high"
                            : txn.status === "Review"
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">RISK MIX</p>
              <h3>Balanced stream distribution</h3>
            </div>
          </div>

          <div className="stack-list">
            <div className="mini-stat">
              <span>Safe transactions</span>
              <strong>{transactions.filter((t) => t.status === "Clear").length}</strong>
            </div>
            <div className="mini-stat">
              <span>Medium risk</span>
              <strong>{transactions.filter((t) => t.status === "Review").length}</strong>
            </div>
            <div className="mini-stat">
              <span>High risk</span>
              <strong>{transactions.filter((t) => t.status === "Flagged").length}</strong>
            </div>
            <div className="mini-stat">
              <span>Pipeline</span>
              <strong>{isStreaming ? "Running" : "Paused"}</strong>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderInvestigations() {
    if (!selectedTxn) {
      return (
        <section className="page-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="small-label">CASE INVESTIGATION</p>
                <h3>No risky transactions available</h3>
              </div>
            </div>
            <div className="rule-card">
              <p>Only medium-risk and high-risk transactions appear on this page.</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="investigation-layout">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">REVIEW QUEUE</p>
              <h3>Medium and high risk transactions</h3>
            </div>
            <span className="status-pill">{riskyTransactions.length} items</span>
          </div>

          <div className="review-list">
            {riskyTransactions.map((txn) => (
              <button
                key={txn.id}
                className={`alert-card clickable-card review-card ${
                  selectedTxnId === txn.id ? "selected-review" : ""
                }`}
                onClick={() => setSelectedTxnId(txn.id)}
              >
                <div className="alert-top">
                  <span
                    className={`severity ${
                      txn.status === "Flagged" ? "high" : "medium"
                    }`}
                  >
                    {txn.status}
                  </span>
                  <span className="alert-id">{txn.id}</span>
                </div>
                <h4>{txn.reason}</h4>
                <p>
                  {txn.sender} → {txn.receiver}
                </p>
                <p>
                  INR {formatAmount(txn.amount)} · {txn.country} · Risk {txn.risk}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="small-label">CASE DETAILS</p>
              <h3>{selectedTxn.id}</h3>
            </div>
            <span
              className={`severity ${
                selectedTxn.status === "Flagged" ? "high" : "medium"
              }`}
            >
              {selectedTxn.status}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-card">
              <span>Sender</span>
              <strong>{selectedTxn.sender}</strong>
            </div>
            <div className="detail-card">
              <span>Receiver</span>
              <strong>{selectedTxn.receiver}</strong>
            </div>
            <div className="detail-card">
              <span>Amount</span>
              <strong>INR {formatAmount(selectedTxn.amount)}</strong>
            </div>
            <div className="detail-card">
              <span>Channel</span>
              <strong>{selectedTxn.channel}</strong>
            </div>
            <div className="detail-card">
              <span>Country</span>
              <strong>{selectedTxn.country}</strong>
            </div>
            <div className="detail-card">
              <span>KYC</span>
              <strong>{selectedTxn.kyc}</strong>
            </div>
          </div>

          <div className="explain-box">
            <p className="small-label">WHY IT WAS FLAGGED</p>
            <h4>{selectedTxn.reason}</h4>
            <p>
              This transaction triggered compliance review because its value,
              geography, and customer profile combination raised the calculated risk
              score to {selectedTxn.risk}. The system applies structured compliance
              rules and then pushes risky transactions into the analyst workflow.
            </p>
          </div>

          <div className="graph-box">
            <p className="small-label">NETWORK RISK PROTOTYPE</p>
            <div className="graph-line">
              <span className="node strong">{selectedTxn.sender}</span>
              <span className="edge" />
              <span className="node active">{selectedTxn.receiver}</span>
              <span className="edge" />
              <span className="node">BENEFICIARY-X</span>
            </div>
            <div className="graph-line second">
              <span className="node">DEVICE-92</span>
              <span className="edge" />
              <span className="node">IP-TRACE</span>
              <span className="edge" />
              <span className="node warning">RISK CLUSTER</span>
            </div>
          </div>

          {selectedCase && (
            <div className="rule-card investigation-action-card">
              <div className="alert-top">
                <span className={`severity ${severityClass(selectedCase.severity)}`}>
                  {selectedCase.severity}
                </span>
                <span className="alert-id">{selectedCase.caseId}</span>
              </div>
              <h4>{selectedCase.rule}</h4>
              <p>
                Analyst: {selectedCase.analyst} · Current action: {selectedCase.action}
              </p>
              <div className="button-row">
                <button
                  className="ghost-btn"
                  onClick={() =>
                    updateCaseAction(selectedCase.caseId, "Escalated to compliance lead")
                  }
                >
                  Escalate
                </button>
                <button
                  className="ghost-btn"
                  onClick={() =>
                    updateCaseAction(selectedCase.caseId, "Marked as false positive")
                  }
                >
                  Reject
                </button>
                <button
                  className="primary-btn"
                  onClick={() =>
                    updateCaseAction(selectedCase.caseId, "Approved for SAR review")
                  }
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderReports() {
    return (
      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="small-label">AUDIT-READY CASE LOG</p>
            <h3>Reviewed compliance cases</h3>
          </div>
          <button className="primary-btn" onClick={generateAuditPdf}>
            Generate Report PDF
          </button>
        </div>

        <div className="table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Transaction</th>
                <th>Rule</th>
                <th>Severity</th>
                <th>Analyst</th>
                <th>Final Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.caseId}>
                  <td>{item.caseId}</td>
                  <td>{item.txnId}</td>
                  <td>{item.rule}</td>
                  <td>
                    <span className={`severity ${severityClass(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>{item.analyst}</td>
                  <td>{item.action}</td>
                  <td>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

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
            <button
              className={`nav-item ${activePage === "overview" ? "active" : ""}`}
              onClick={() => setActivePage("overview")}
            >
              Overview
            </button>
            <button
              className={`nav-item ${activePage === "regulations" ? "active" : ""}`}
              onClick={() => setActivePage("regulations")}
            >
              Regulations
            </button>
            <button
              className={`nav-item ${activePage === "monitor" ? "active" : ""}`}
              onClick={() => setActivePage("monitor")}
            >
              Live Monitor
            </button>
            <button
              className={`nav-item ${activePage === "investigations" ? "active" : ""}`}
              onClick={() => setActivePage("investigations")}
            >
              Investigations
            </button>
            <button
              className={`nav-item ${activePage === "reports" ? "active" : ""}`}
              onClick={() => setActivePage("reports")}
            >
              Audit Reports
            </button>
          </nav>
        </div>

        <div className="sidebar-card">
          <p className="small-label">System Status</p>
          <h3>Live monitoring active</h3>
          <span className="status-pill">
            {isStreaming ? "All services healthy" : "Pipeline paused"}
          </span>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "overview" && renderOverview()}
        {activePage === "regulations" && renderRegulations()}
        {activePage === "monitor" && renderMonitor()}
        {activePage === "investigations" && renderInvestigations()}
        {activePage === "reports" && renderReports()}
      </main>
    </div>
  );
}

export default App;