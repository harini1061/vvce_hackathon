const API_BASE = "http://127.0.0.1:8000";

export async function fetchSources() {
  const res = await fetch(`${API_BASE}/regulations/sources`);
  return res.json();
}

export async function fetchRules() {
  const res = await fetch(`${API_BASE}/regulations/rules`);
  return res.json();
}

export async function fetchSourcePreview(sourceName) {
  const res = await fetch(`${API_BASE}/regulations/fetch/${sourceName}`);
  return res.json();
}

export async function fetchAuditReport() {
  const res = await fetch(`${API_BASE}/reports/audit`);
  return res.json();
}

export async function updateAlertStatus(alertId, status) {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/status/${status}`, {
    method: "POST"
  });
  return res.json();
}
