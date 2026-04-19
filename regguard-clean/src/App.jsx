import { useEffect, useMemo, useState } from "react";
import "./index.css";

function App() {
  const [page, setPage] = useState("landing");
  const [workspaceTab, setWorkspaceTab] = useState("live");
  const [message, setMessage] = useState("");
  const [liveRunning, setLiveRunning] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  const [signUpForm, setSignUpForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });

  const [onboardingForm, setOnboardingForm] = useState({
    clientName: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    jurisdiction: "",
  });

  const [transactions, setTransactions] = useState([]);

  function clearMessage() {
    setMessage("");
  }

  function handleSignInChange(e) {
    clearMessage();
    const { name, value } = e.target;
    setSignInForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSignUpChange(e) {
    clearMessage();
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleOnboardingChange(e) {
    clearMessage();
    const { name, value } = e.target;
    setOnboardingForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSignInSubmit(e) {
    e.preventDefault();

    if (!signInForm.email || !signInForm.password) {
      setMessage("Please enter email and password.");
      return;
    }

    if (!signInForm.email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (signInForm.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setMessage("Signed in successfully.");
    setTimeout(() => {
      setMessage("");
      setWorkspaceTab("live");
      setPage("workspace");
    }, 700);
  }

  function handleSignUpSubmit(e) {
    e.preventDefault();

    if (
      !signUpForm.fullName ||
      !signUpForm.companyName ||
      !signUpForm.email ||
      !signUpForm.password
    ) {
      setMessage("Please fill all sign up fields.");
      return;
    }

    if (!signUpForm.email.includes("@")) {
      setMessage("Enter a valid work email.");
      return;
    }

    if (signUpForm.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setMessage("Account created successfully.");
    setTimeout(() => {
      setMessage("");
      setPage("onboarding");
    }, 700);
  }

  function handleOnboardingSubmit(e) {
    e.preventDefault();

    if (
      !onboardingForm.clientName ||
      !onboardingForm.industry ||
      !onboardingForm.contactName ||
      !onboardingForm.contactEmail ||
      !onboardingForm.jurisdiction
    ) {
      setMessage("Please fill all onboarding details.");
      return;
    }

    if (!onboardingForm.contactEmail.includes("@")) {
      setMessage("Enter a valid contact email.");
      return;
    }

    setMessage("Client onboarding saved successfully.");

    setTimeout(() => {
      setMessage("");
      setWorkspaceTab("live");
      setPage("workspace");
    }, 900);
  }

  function generateFakeTransaction() {
    const countries = ["IN", "US", "SG", "AE", "FR", "CA", "GB"];
    const riskyCountries = ["AE", "US"];
    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];
    const amountValue = (Math.random() * 9000 + 500).toFixed(2);
    const missingKyc = Math.random() > 0.7;
    const geoRisk = riskyCountries.includes(randomCountry);
    const amlRisk = missingKyc && Number(amountValue) > 5000;
    const isRed = amlRisk || geoRisk;

    const now = new Date();
    const time = now.toLocaleTimeString("en-GB");

    return {
      time,
      txId: `LIVE-${Date.now()}-${Math.floor(Math.random() * 900)}`,
      amount: `$${Number(amountValue).toLocaleString()}`,
      country: randomCountry,
      kyc: missingKyc ? "✖" : "✔",
      risk: isRed ? "red" : "green",
      score: amlRisk ? "78.4%" : geoRisk ? "41.6%" : "0.3%",
      rule: amlRisk ? "AML-BASE-002" : geoRisk ? "RISK-GEO-014" : "—",
      action: isRed ? "pending" : "approved",
      reviewed: false,
    };
  }

  useEffect(() => {
    if (!liveRunning) return;

    const interval = setInterval(() => {
      const nextTx = generateFakeTransaction();
      setTransactions((prev) => [nextTx, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, [liveRunning]);

  const flaggedTransactions = useMemo(
    () => transactions.filter((tx) => tx.risk === "red"),
    [transactions]
  );

  useEffect(() => {
    if (flaggedTransactions.length === 0) {
      setSelectedCaseId(null);
      return;
    }

    const stillExists = flaggedTransactions.some(
      (tx) => tx.txId === selectedCaseId
    );
    if (!stillExists) {
      setSelectedCaseId(flaggedTransactions[0].txId);
    }
  }, [flaggedTransactions, selectedCaseId]);

  const selectedAlert =
    flaggedTransactions.find((tx) => tx.txId === selectedCaseId) ||
    flaggedTransactions[0] ||
    null;

  function handleCaseAction(txId, nextAction) {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.txId !== txId) return tx;

        if (nextAction === "approved") {
          return {
            ...tx,
            action: "approved",
            risk: "green",
            score: "0.0%",
            rule: "—",
            reviewed: true,
          };
        }

        if (nextAction === "dismissed") {
          return {
            ...tx,
            action: "dismissed",
            risk: "green",
            score: "0.0%",
            rule: "—",
            reviewed: true,
          };
        }

        if (nextAction === "escalated") {
          return {
            ...tx,
            action: "escalated",
            reviewed: true,
          };
        }

        return tx;
      })
    );
  }

  function clearLiveFeed() {
    setTransactions([]);
    setSelectedCaseId(null);
    setLiveRunning(false);
  }

  const totalScreened = transactions.length;
  const highRiskCount = transactions.filter((tx) => tx.risk === "red").length;
  const mediumRiskCount = transactions.filter(
    (tx) => tx.action === "escalated"
  ).length;
  const cleanCount = transactions.filter((tx) => tx.risk === "green").length;

  function renderActionBadge(action) {
    const labelMap = {
      approved: "Approved",
      pending: "Pending",
      escalated: "Escalated",
      dismissed: "Dismissed",
    };

    return (
      <span className={`action-badge ${action || "pending"}`}>
        {labelMap[action] || action}
      </span>
    );
  }

  function renderWorkspaceContent() {
    if (workspaceTab === "live") {
      return (
        <div className="content-area">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>🔴 Live Transaction Monitor</h3>
                <p>
                  Real-time AI screening —{" "}
                  {liveRunning ? "new transaction every 3 seconds" : "feed paused"}
                </p>
              </div>

              <div className="topbar-actions">
                <button
                  className={`btn ${liveRunning ? "btn-danger" : "btn-success"}`}
                  onClick={() => setLiveRunning((prev) => !prev)}
                >
                  {liveRunning ? "■ Stop Live Feed" : "● Start Live Feed"}
                </button>

                <button className="btn btn-muted" onClick={clearLiveFeed}>
                  Clear
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Tx ID</th>
                    <th>Amount</th>
                    <th>Country</th>
                    <th>KYC</th>
                    <th>Risk</th>
                    <th>Score</th>
                    <th>Rule</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="9">
                        No live transactions yet. Press Start Live Feed.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr
                        key={tx.txId}
                        className={tx.risk === "red" ? "selected-row" : ""}
                      >
                        <td className="mono">{tx.time}</td>
                        <td className="mono">{tx.txId}</td>
                        <td>
                          <strong>{tx.amount}</strong>
                        </td>
                        <td>{tx.country}</td>
                        <td>{tx.kyc}</td>
                        <td>
                          <span className={`risk-badge ${tx.risk}`}>
                            {tx.risk === "green" ? "🟢 GREEN" : "🔴 RED"}
                          </span>
                        </td>
                        <td>{tx.score}</td>
                        <td>{tx.rule}</td>
                        <td>{renderActionBadge(tx.action)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (workspaceTab === "regulations") {
      return (
        <div className="content-area reg-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>📚 Regulation Sources</h3>
                <p>Official and prototype sources connected to the workspace</p>
              </div>
            </div>

            <div className="source-list">
              <div className="source-item">
                <div className="source-topline">
                  <h4>RBI Notifications</h4>
                  <span className="source-badge live">Live</span>
                </div>
                <small>India banking and AML updates</small>
              </div>

              <div className="source-item">
                <div className="source-topline">
                  <h4>SEBI Circulars</h4>
                  <span className="source-badge prototype">Prototype</span>
                </div>
                <small>Securities and market compliance updates</small>
              </div>

              <div className="source-item">
                <div className="source-topline">
                  <h4>GDPR Controls</h4>
                  <span className="source-badge neutral">Queued</span>
                </div>
                <small>Cross-border data and privacy controls</small>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>🧠 Extracted Rule Set</h3>
                <p>Structured rules prepared for transaction screening</p>
              </div>
            </div>

            <div className="rule-list">
              <div className="rule-card">
                <div className="rule-meta">
                  <h4>AML-BASE-002</h4>
                  <span className="mini-severity high">High</span>
                </div>
                <p>Flag transaction if KYC is missing and amount exceeds threshold.</p>
              </div>

              <div className="rule-card">
                <div className="rule-meta">
                  <h4>RISK-GEO-014</h4>
                  <span className="mini-severity medium">Medium</span>
                </div>
                <p>
                  Increase risk score for cross-border transfers involving flagged regions.
                </p>
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (workspaceTab === "transactions") {
      return (
        <div className="content-area">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>💸 Transactions</h3>
                <p>All screened transactions with compliance results</p>
              </div>
            </div>

            <div className="table-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Amount</th>
                    <th>Country</th>
                    <th>KYC</th>
                    <th>Risk</th>
                    <th>Rule Triggered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7">No transactions available yet.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.txId}>
                        <td className="mono">{tx.txId}</td>
                        <td>{tx.amount}</td>
                        <td>{tx.country}</td>
                        <td>{tx.kyc}</td>
                        <td>
                          <span className={`risk-badge ${tx.risk}`}>
                            {tx.risk === "green" ? "🟢 Green" : "🔴 Red"}
                          </span>
                        </td>
                        <td>{tx.rule}</td>
                        <td>{renderActionBadge(tx.action)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (workspaceTab === "investigate") {
      return (
        <div className="content-area investigation-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>🕵️ Investigation Queue</h3>
                <p>Priority cases requiring analyst review</p>
              </div>
            </div>

            <div className="queue-list">
              {flaggedTransactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.txId}
                  className={`queue-item ${
                    selectedAlert?.txId === tx.txId ? "active" : ""
                  }`}
                  onClick={() => setSelectedCaseId(tx.txId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedCaseId(tx.txId);
                    }
                  }}
                >
                  <div className="queue-top">
                    <span className="mono">CASE-{tx.txId.slice(-6)}</span>
                    <span className="mini-severity high">
                      {tx.action === "escalated" ? "Escalated" : "High"}
                    </span>
                  </div>

                  <strong>
                    {tx.rule === "AML-BASE-002"
                      ? "Missing KYC with high-value transfer"
                      : "Cross-border routing pattern"}
                  </strong>

                  <p>Transaction {tx.txId} triggered {tx.rule}.</p>
                </div>
              ))}

              {flaggedTransactions.length === 0 && (
                <div className="empty-box">
                  <h4>No investigations right now</h4>
                  <p>Start the live feed and wait for a red-risk transaction.</p>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>🔎 Case Details</h3>
                <p>Explainable review for the selected alert</p>
              </div>
            </div>

            {selectedAlert ? (
              <>
                <div className="detail-grid">
                  <div className="detail-box">
                    <span>Transaction</span>
                    <strong>{selectedAlert.txId}</strong>
                  </div>

                  <div className="detail-box">
                    <span>Risk score</span>
                    <strong>{selectedAlert.score}</strong>
                  </div>

                  <div className="detail-box">
                    <span>Triggered rule</span>
                    <strong>{selectedAlert.rule}</strong>
                  </div>
                </div>

                <div className="explain-card">
                  <h4>Why this was flagged</h4>
                  <p>
                    {selectedAlert.rule === "AML-BASE-002"
                      ? "The transaction exceeded the risk threshold while KYC status was incomplete, so the system escalated it for analyst review."
                      : "The transfer touched a geography with elevated compliance sensitivity, so the system increased the risk score for manual validation."}
                  </p>
                </div>

                <div className="decision-row">
                  <button
                    className="btn btn-success"
                    onClick={() => handleCaseAction(selectedAlert.txId, "approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-warning"
                    onClick={() => handleCaseAction(selectedAlert.txId, "escalated")}
                  >
                    Escalate
                  </button>

                  <button
                    className="btn btn-muted"
                    onClick={() => handleCaseAction(selectedAlert.txId, "dismissed")}
                  >
                    Dismiss
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-box">
                <h4>No case selected</h4>
                <p>Alert details will appear here once a risky transaction is found.</p>
              </div>
            )}
          </section>
        </div>
      );
    }

    if (workspaceTab === "audit") {
      return (
        <div className="content-area">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h3>📋 Audit Report</h3>
                <p>Chronological record of alerts, reviews, and actions</p>
              </div>
            </div>

            <div className="table-wrap">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Reference</th>
                    <th>Severity</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5">No audit entries yet.</td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((tx) => (
                      <tr key={`audit-${tx.txId}`}>
                        <td className="mono">{tx.time}</td>
                        <td>
                          {tx.action === "approved" && tx.reviewed
                            ? "Analyst approved flagged transaction"
                            : tx.action === "dismissed"
                            ? "Analyst dismissed flagged transaction"
                            : tx.action === "escalated"
                            ? "Case escalated for further review"
                            : tx.risk === "red"
                            ? "Transaction flagged for review"
                            : "Transaction auto-approved"}
                        </td>
                        <td className="mono">{tx.txId}</td>
                        <td>
                          {tx.action === "escalated" ? (
                            <span className="mini-severity medium">Medium</span>
                          ) : tx.risk === "red" ? (
                            <span className="mini-severity high">High</span>
                          ) : (
                            <span className="action-badge neutral">Info</span>
                          )}
                        </td>
                        <td>{renderActionBadge(tx.action)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="app-root">
      {page === "landing" && (
        <div className="page-shell">
          <header className="topbar">
            <div className="brand">
              <div className="brand-mark">RG</div>
              <div>
                <h1>RegGuard AI</h1>
                <p>Compliance workspace for modern teams</p>
              </div>
            </div>

            <div className="topbar-actions">
              <button className="nav-btn" onClick={() => setPage("signin")}>
                Sign in
              </button>
              <button className="primary-btn" onClick={() => setPage("signup")}>
                Get started
              </button>
            </div>
          </header>

          <main className="landing-hero">
            <section className="hero-left">
              <span className="hero-chip">🛡️ Automated compliance operations</span>
              <h2>
                Clean compliance workflows for onboarding, monitoring, and audit readiness.
              </h2>
              <p>
                RegGuard AI helps teams onboard clients, manage compliance actions,
                and move from manual review into a more structured and reliable
                workflow.
              </p>

              <div className="hero-actions">
                <button className="primary-btn" onClick={() => setPage("signup")}>
                  Create workspace
                </button>
                <button className="secondary-btn" onClick={() => setPage("signin")}>
                  Open sign in
                </button>
              </div>
            </section>
          </main>
        </div>
      )}

      {page === "signin" && (
        <div className="auth-shell">
          <section className="auth-panel auth-copy">
            <button className="back-link" onClick={() => setPage("landing")}>
              ← Back to landing
            </button>
            <h2>Welcome back</h2>
            <p>Continue into your compliance workspace.</p>
          </section>

          <section className="auth-panel auth-form-panel">
            <form className="auth-form" onSubmit={handleSignInSubmit}>
              <div className="form-head">
                <h3>Sign in</h3>
              </div>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={signInForm.email}
                  onChange={handleSignInChange}
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={signInForm.password}
                  onChange={handleSignInChange}
                />
              </label>

              <button type="submit" className="primary-btn full-width">
                Sign in
              </button>

              {message && <div className="form-message">{message}</div>}
            </form>
          </section>
        </div>
      )}

      {page === "signup" && (
        <div className="auth-shell">
          <section className="auth-panel auth-copy">
            <button className="back-link" onClick={() => setPage("landing")}>
              ← Back to landing
            </button>
            <h2>Create account</h2>
            <p>Set up your workspace and continue to client onboarding.</p>
          </section>

          <section className="auth-panel auth-form-panel">
            <form className="auth-form" onSubmit={handleSignUpSubmit}>
              <div className="form-head">
                <h3>Create account</h3>
              </div>

              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Harini P"
                  value={signUpForm.fullName}
                  onChange={handleSignUpChange}
                />
              </label>

              <label className="field">
                <span>Company name</span>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Acme Finserv"
                  value={signUpForm.companyName}
                  onChange={handleSignUpChange}
                />
              </label>

              <label className="field">
                <span>Work email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={signUpForm.email}
                  onChange={handleSignUpChange}
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={signUpForm.password}
                  onChange={handleSignUpChange}
                />
              </label>

              <button type="submit" className="primary-btn full-width">
                Create account
              </button>

              {message && <div className="form-message">{message}</div>}
            </form>
          </section>
        </div>
      )}

      {page === "onboarding" && (
        <div className="page-shell">
          <main className="onboarding-wrap">
            <section className="onboarding-panel">
              <div className="form-head">
                <span className="hero-chip">🧾 Client setup</span>
                <h3>Onboard a new client workspace</h3>
              </div>

              <form className="onboarding-form" onSubmit={handleOnboardingSubmit}>
                <div className="form-grid">
                  <label className="field">
                    <span>Client company name</span>
                    <input
                      type="text"
                      name="clientName"
                      placeholder="Acme Finserv"
                      value={onboardingForm.clientName}
                      onChange={handleOnboardingChange}
                    />
                  </label>

                  <label className="field">
                    <span>Industry</span>
                    <input
                      type="text"
                      name="industry"
                      placeholder="Financial services"
                      value={onboardingForm.industry}
                      onChange={handleOnboardingChange}
                    />
                  </label>

                  <label className="field">
                    <span>Primary contact name</span>
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Rahul Mehta"
                      value={onboardingForm.contactName}
                      onChange={handleOnboardingChange}
                    />
                  </label>

                  <label className="field">
                    <span>Primary contact email</span>
                    <input
                      type="email"
                      name="contactEmail"
                      placeholder="rahul@company.com"
                      value={onboardingForm.contactEmail}
                      onChange={handleOnboardingChange}
                    />
                  </label>

                  <label className="field field-span-2">
                    <span>Jurisdiction</span>
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="India / EU / Global"
                      value={onboardingForm.jurisdiction}
                      onChange={handleOnboardingChange}
                    />
                  </label>
                </div>

                <button type="submit" className="primary-btn full-width">
                  Save onboarding details
                </button>

                {message && <div className="form-message">{message}</div>}
              </form>
            </section>
          </main>
        </div>
      )}

      {page === "workspace" && (
        <div className="app-shell">
          <header className="topbar">
            <div className="brand">
              <div className="brand-mark">RG</div>
              <div>
                <h1>RegGuard AI</h1>
                <p>Monitoring, investigations, and audit workspace</p>
              </div>
            </div>

            <div className="topbar-actions">
              <button className="btn btn-muted" onClick={() => setPage("onboarding")}>
                + Add Client
              </button>
              <button
                className="btn btn-dark"
                onClick={() => {
                  setLiveRunning(false);
                  setTransactions([]);
                  setSelectedCaseId(null);
                  setPage("landing");
                }}
              >
                Exit
              </button>
            </div>
          </header>

          <div className="tabs-row">
            <button
              className={`tab-btn ${workspaceTab === "regulations" ? "active" : ""}`}
              onClick={() => setWorkspaceTab("regulations")}
            >
              📚 Regulations
            </button>
            <button
              className={`tab-btn ${workspaceTab === "live" ? "active" : ""}`}
              onClick={() => setWorkspaceTab("live")}
            >
              🔴 Live Feed
            </button>
            <button
              className={`tab-btn ${workspaceTab === "transactions" ? "active" : ""}`}
              onClick={() => setWorkspaceTab("transactions")}
            >
              💸 Transactions
            </button>
            <button
              className={`tab-btn ${workspaceTab === "investigate" ? "active" : ""}`}
              onClick={() => setWorkspaceTab("investigate")}
            >
              🕵️ Investigate
            </button>
            <button
              className={`tab-btn ${workspaceTab === "audit" ? "active" : ""}`}
              onClick={() => setWorkspaceTab("audit")}
            >
              📋 Audit Report
            </button>
          </div>

          <section className="stats-row">
            <div className="metric-card">
              <span>Total screened</span>
              <strong>{totalScreened}</strong>
            </div>
            <div className="metric-card high">
              <span>High risk</span>
              <strong>{highRiskCount}</strong>
            </div>
            <div className="metric-card medium">
              <span>Medium risk</span>
              <strong>{mediumRiskCount}</strong>
            </div>
            <div className="metric-card clean">
              <span>Clean</span>
              <strong>{cleanCount}</strong>
            </div>
          </section>

          {renderWorkspaceContent()}
        </div>
      )}
    </div>
  );
}

export default App;