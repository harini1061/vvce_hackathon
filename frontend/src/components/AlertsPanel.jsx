import React from "react";

export default function AlertsPanel({ alerts, onSelect, onStatus }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h2>Alert Queue</h2>
      </div>
      <div className="alert-list">
        {alerts.map((a) => (
          <div key={a.id} className={`alert-item ${a.severity}`}>
            <div className="alert-body" onClick={() => onSelect(a)}>
              <strong>{a.severity.toUpperCase()}</strong>
              <p>{a.reason}</p>
              <span>Rules: {a.breached_rule_codes}</span>
            </div>
            <div className="alert-actions">
              <button onClick={() => onStatus(a.id, "approved")}>Approve</button>
              <button onClick={() => onStatus(a.id, "escalated")}>Escalate</button>
              <button onClick={() => onStatus(a.id, "dismissed")}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
