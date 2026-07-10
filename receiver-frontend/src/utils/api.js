import { getAuthToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      try {
        message = await response.text();
      } catch {
        // ignore
      }
    }
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function signup(payload) {
  return request("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function fetchOfficerAlerts() {
  return request("/api/alerts/police");
}

export function createAlert(payload) {
  return request("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function updateAlert(id, payload) {
  return request(`/api/alerts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function deactivateAlert(id) {
  return request(`/api/alerts/${id}`, { method: "DELETE" });
}

export function fetchPublicAlerts(lat, lng) {
  return request(`/api/alerts/public?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
}

export function fetchPublicAlertById(id, lat, lng) {
  return request(`/api/alerts/public/${id}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
}

export function submitAlertProof(alertId, formData) {
  return request(`/api/public/alerts/${alertId}/proofs`, {
    method: "POST",
    body: formData
  });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/api/upload", {
    method: "POST",
    body: formData
  });
}
