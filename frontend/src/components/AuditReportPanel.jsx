import React from "react";

export default function AuditReportPanel({ report }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h2>Audit Trail</h2>
      </div>
      <div className="audit-list">
        {report.map((item, idx) => (
          <div className="audit-item" key={idx}>
            <strong>Alert #{item.alert_id}</strong>
            <p>{item.reason}</p>
            <span>{item.recommended_action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
