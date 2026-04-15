import React from "react";

export default function InvestigationPanel({ alert }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h2>Investigation View</h2>
      </div>
      {!alert ? (
        <p>Select an alert to inspect explanation and network context.</p>
      ) : (
        <>
          <div className="investigation-box">
            <p>
              <strong>Severity:</strong> {alert.severity}
            </p>
            <p>
              <strong>Score:</strong> {alert.score}
            </p>
            <p>
              <strong>Reason:</strong> {alert.reason}
            </p>
            <p>
              <strong>Breached:</strong> {alert.breached_rule_codes}
            </p>
          </div>
          <div className="graph-placeholder">
            <div className="node">Sender</div>
            <div className="edge" />
            <div className="node danger">Receiver</div>
            <div className="edge" />
            <div className="node">Beneficiary</div>
          </div>
        </>
      )}
    </div>
  );
}
