import React from "react";

export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1>Compliance Monitoring Console</h1>
        <p>Automated regulations + real-time transaction screening</p>
      </div>
      <div className="status-pill">Live</div>
    </header>
  );
}
