import React, { useEffect, useMemo, useState } from "react";
import KpiCard from "../components/KpiCard.jsx";
import RegulationPanel from "../components/RegulationPanel.jsx";
import LiveFeed from "../components/LiveFeed.jsx";
import AlertsPanel from "../components/AlertsPanel.jsx";
import InvestigationPanel from "../components/InvestigationPanel.jsx";
import AuditReportPanel from "../components/AuditReportPanel.jsx";

function generateFakeTransaction(id) {
  const countries = ["IN", "AE", "SG", "IR", "GB"];
  const risk = ["low", "medium", "high"];
  const channels = ["NEFT", "RTGS", "SWIFT", "UPI"];

  return {
    id,
    sender_account: `ACC${1000 + Math.floor(Math.random() * 9000)}`,
    receiver_account: `ACC${1000 + Math.floor(Math.random() * 9000)}`,
    amount: Number((Math.random() * 140000 + 1000).toFixed(2)),
    country: countries[Math.floor(Math.random() * countries.length)],
    kyc_verified: Math.random() > 0.25,
    beneficiary_risk: risk[Math.floor(Math.random() * risk.length)],
    channel: channels[Math.floor(Math.random() * channels.length)],
  };
}

function evaluateTransaction(tx) {
  let score = 0;
  const breached = [];

  if (tx.amount > 50000 && !tx.kyc_verified) {
    score += 40;
    breached.push("AML-4.2");
  }
  if (["IR"].includes(tx.country)) {
    score += 30;
    breached.push("AML-7.1");
  }
  if (tx.beneficiary_risk === "high") {
    score += 20;
    breached.push("RISK-2.4");
  }

  let severity = "green";
  if (score >= 60) severity = "red";
  else if (score >= 30) severity = "amber";

  const reason =
    breached.length === 0
      ? "No material compliance issue detected."
      : `Rules breached: ${breached.join(", ")}.`;

  return { score, severity, reason, breached_rule_codes: breached.join(", ") || "NONE" };
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [rules] = useState([
    {
      id: 1,
      rule_code: "AML-4.2",
      title: "Large transfer without KYC",
      description: "Flag transactions above threshold when KYC is incomplete.",
    },
    {
      id: 2,
      rule_code: "AML-7.1",
      title: "High-risk geography exposure",
      description: "Flag transfers involving high-risk countries.",
    },
    {
      id: 3,
      rule_code: "RISK-2.4",
      title: "High-risk beneficiary",
      description: "Flag transactions sent to high-risk beneficiaries.",
    },
  ]);

  const [sources] = useState([
    { id: 1, name: "RBI", jurisdiction: "India" },
    { id: 2, name: "SEBI", jurisdiction: "India" },
    { id: 3, name: "EU GDPR", jurisdiction: "EU" },
  ]);

  const [preview, setPreview] = useState(
    "Select a regulation source to fetch a live summary."
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prevTxs) => {
        const id = prevTxs.length === 0 ? 1 : prevTxs[0].id + 1;
        const tx = generateFakeTransaction(id);
        const evalResult = evaluateTransaction(tx);

        const newAlert = {
          id,
          transaction_id: id,
          score: evalResult.score,
          severity: evalResult.severity,
          reason: evalResult.reason,
          breached_rule_codes: evalResult.breached_rule_codes,
          analyst_status: "open",
        };

        setAlerts((prev) => [newAlert, ...prev].slice(0, 25));
        return [tx, ...prev].slice(0, 25);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const kpis = useMemo(() => {
    const red = alerts.filter((a) => a.severity === "red").length;
    const amber = alerts.filter((a) => a.severity === "amber").length;
    return [
      { title: "Active Rules", value: rules.length },
      { title: "Live Transactions", value: transactions.length },
      { title: "Red Alerts", value: red },
      { title: "Amber Alerts", value: amber },
    ];
  }, [alerts, rules.length, transactions.length]);

  const handlePreview = (name) => {
    if (name === "RBI") {
      setPreview(
        "RBI notifications: recent circulars on AML, KYC, and transaction monitoring are ingested to keep screening thresholds aligned with regulatory expectations."
      );
    } else if (name === "SEBI") {
      setPreview(
        "SEBI circulars: securities market compliance guidelines feed into market-abuse and insider-trading checks for capital market transactions."
      );
    } else {
      setPreview(
        "EU GDPR: data protection obligations inform how customer and transaction data is stored, accessed, and logged for auditability."
      );
    }
  };

  const handleStatus = (alertId, status) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, analyst_status: status } : a))
    );
  };

  const auditReport = alerts.map((a) => ({
    alert_id: a.id,
    severity: a.severity,
    reason: a.reason,
    recommended_action:
      a.severity === "red"
        ? "Escalate to compliance officer"
        : a.severity === "amber"
        ? "Review within 24 hours"
        : "Archive",
  }));

  return (
    <main className="main-grid">
      <section className="kpi-row">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </section>

      <section className="grid-two">
        <RegulationPanel
          sources={sources}
          rules={rules}
          preview={preview}
          onPreview={handlePreview}
        />
        <LiveFeed transactions={transactions} />
      </section>

      <section className="grid-two">
        <AlertsPanel
          alerts={alerts}
          onSelect={setSelectedAlert}
          onStatus={handleStatus}
        />
        <InvestigationPanel alert={selectedAlert} />
      </section>

      <section>
        <AuditReportPanel report={auditReport} />
      </section>
    </main>
  );
}
