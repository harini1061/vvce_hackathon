import React from "react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">RegGuard AI</div>
      <nav>
        <button className="nav-item active">Overview</button>
        <button className="nav-item">Regulations</button>
        <button className="nav-item">Live Monitor</button>
        <button className="nav-item">Investigations</button>
        <button className="nav-item">Audit Reports</button>
      </nav>
    </aside>
  );
}
