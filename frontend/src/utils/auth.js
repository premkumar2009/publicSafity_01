const TOKEN_KEY = "publicSafetyToken";
const OFFICER_KEY = "publicSafetyOfficer";
const LOCATION_KEY = "publicSafetyLocation";
const NOTIFIED_ALERTS_KEY = "publicSafetyNotifiedAlerts";

export function saveAuth(authResponse) {
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(OFFICER_KEY, JSON.stringify(authResponse.officer));
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getOfficer() {
  const raw = localStorage.getItem(OFFICER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OFFICER_KEY);
}

export function savePublicLocation(location) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function getPublicLocation() {
  const raw = localStorage.getItem(LOCATION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getNotifiedAlertIds() {
  const raw = localStorage.getItem(NOTIFIED_ALERTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addNotifiedAlertId(alertId) {
  const ids = new Set(getNotifiedAlertIds());
  ids.add(alertId);
  localStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify([...ids]));
}
