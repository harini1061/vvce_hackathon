import React from "react";

export default function RegulationPanel({ sources, rules, preview, onPreview }) {
  return (
    <div className="card panel">
      <div className="panel-head">
        <h2>Regulation Sources</h2>
      </div>

      <div className="source-list">
        {sources.map((s) => (
          <div key={s.id} className="source-item">
            <div>
              <strong>{s.name}</strong>
              <p>{s.jurisdiction}</p>
            </div>
            <button onClick={() => onPreview(s.name)}>Fetch</button>
          </div>
        ))}
      </div>

      <div className="preview-box">
        <h3>Fetched Summary</h3>
        <p>{preview}</p>
      </div>

      <div className="rules-box">
        <h3>Extracted Rules</h3>
        {rules.map((r) => (
          <div key={r.id} className="rule-item">
            <strong>{r.rule_code}</strong>
            <p>{r.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
