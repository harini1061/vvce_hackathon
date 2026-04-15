import React from "react";

export default function KpiCard({ title, value }) {
  return (
    <div className="card kpi-card">
      <span className="card-label">{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
