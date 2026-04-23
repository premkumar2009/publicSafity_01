import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertCard from "../components/AlertCard";
import ProofReviewPanel from "../components/ProofReviewPanel";
import { createAlert, deactivateAlert, fetchAlertProofs, fetchOfficerAlerts, updateAlert, updateAlertProofStatus, uploadImage } from "../utils/api";
import { clearAuth, getOfficer } from "../utils/auth";

const initialForm = {
  type: "Missing Person",
  title: "",
  description: "",
  locationName: "",
  latitude: "",
  longitude: "",
  radiusKm: "2",
  policePhone: "",
  imageFileName: ""
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editId = params.id ? Number(params.id) : null;
  const officer = useMemo(() => getOfficer(), []);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ ...initialForm, policePhone: officer?.phone || "" });
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProofAlert, setSelectedProofAlert] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [proofsError, setProofsError] = useState("");
  const proofPanelRef = useRef(null);

  const editingAlert = useMemo(() => alerts.find((alert) => alert.id === editId) || null, [alerts, editId]);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (!editingAlert) {
      setForm({ ...initialForm, policePhone: officer?.phone || "" });
      setPreviewImage("");
      return;
    }
    setForm({
      type: editingAlert.type,
      title: editingAlert.title,
      description: editingAlert.description,
      locationName: editingAlert.locationName,
      latitude: String(editingAlert.latitude),
      longitude: String(editingAlert.longitude),
      radiusKm: String(editingAlert.radiusKm),
      policePhone: editingAlert.policePhone,
      imageFileName: editingAlert.imageFileName || ""
    });
    setPreviewImage(editingAlert.imageUrl || "");
  }, [editingAlert, officer?.phone]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const data = await fetchOfficerAlerts();
      setAlerts(data);
    } catch (error) {
      if (error.message.toLowerCase().includes("unauthorized")) {
        clearAuth();
        navigate("/");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadProofs(alertId) {
    setProofsLoading(true);
    setProofsError("");
    try {
      const data = await fetchAlertProofs(alertId);
      setProofs(data);
    } catch (error) {
      setProofsError(error.message);
      setProofs([]);
    } finally {
      setProofsLoading(false);
    }
  }

  async function handleViewProofs(alert) {
    setSelectedProofAlert(alert);
    await loadProofs(alert.id);

    window.requestAnimationFrame(() => {
      proofPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleProofStatusChange(proofId, status) {
    if (!selectedProofAlert) {
      return;
    }
    try {
      await updateAlertProofStatus(selectedProofAlert.id, proofId, status);
      await loadProofs(selectedProofAlert.id);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      let imageFileName = form.imageFileName;
      if (selectedFile) {
        const uploadResponse = await uploadImage(selectedFile);
        imageFileName = uploadResponse.fileName;
      }

      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusKm: Number(form.radiusKm),
        policePhone: form.policePhone.replace(/\D/g, ""),
        imageFileName
      };

      if (editId) {
        await updateAlert(editId, payload);
        alert("Alert updated successfully.");
      } else {
        await createAlert(payload);
        alert("Alert created successfully.");
      }

      setSelectedFile(null);
      await loadAlerts();
      navigate("/dashboard");
      setForm({ ...initialForm, policePhone: officer?.phone || "" });
      setPreviewImage("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearAuth();
    navigate("/");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
      },
      () => alert("Unable to fetch current location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleDeactivate(id) {
    const confirmed = window.confirm("Deactivate this alert?");
    if (!confirmed) return;
    try {
      await deactivateAlert(id);
      await loadAlerts();
      if (editId === id) {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Logged in as police officer</span>
          <h1>Welcome, {officer?.name}</h1>
          <p>Badge: {officer?.badgeNumber} · Contact: {officer?.phone}</p>
        </div>
        <div className="dashboard-header-actions">
          <a className="secondary-button" href="/public">Open public view</a>
          <button type="button" className="ghost-button" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <section className="panel form-panel">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Police alert console</span>
              <h2>{editId ? "Edit alert" : "Create new alert"}</h2>
            </div>
            {editId && (
              <button type="button" className="secondary-button" onClick={() => navigate("/dashboard")}>New alert</button>
            )}
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Alert type</span>
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option>Missing Person</option>
                <option>Crime Alert</option>
                <option>Suspicious Activity</option>
                <option>Women Safety</option>
                <option>Disaster</option>
                <option>Traffic Alert</option>
                <option>Vehicle Missing</option>
              </select>
            </label>

            <label>
              <span>Alert title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>

            <label className="full-width">
              <span>Description</span>
              <textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </label>

            <label>
              <span>Location name</span>
              <input value={form.locationName} onChange={(event) => setForm({ ...form, locationName: event.target.value })} required />
            </label>

            <div className="inline-fields full-width">
              <label>
                <span>Latitude</span>
                <input value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} required />
              </label>
              <label>
                <span>Longitude</span>
                <input value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} required />
              </label>
              <button type="button" className="secondary-button location-button" onClick={useMyLocation}>Use my current location</button>
            </div>

            <label>
              <span>Notification radius (km)</span>
              <input type="number" min="0.1" step="0.1" value={form.radiusKm} onChange={(event) => setForm({ ...form, radiusKm: event.target.value })} required />
            </label>

            <label>
              <span>Police contact number</span>
              <input inputMode="numeric" maxLength={15} value={form.policePhone} onChange={(event) => setForm({ ...form, policePhone: event.target.value.replace(/\D/g, "") })} required />
            </label>

            <label className="full-width">
              <span>Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (file) {
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
            </label>

            {(previewImage || form.imageFileName) && (
              <div className="full-width image-preview-box">
                <img src={previewImage || `/api/uploads/images/${form.imageFileName}`} alt="Alert preview" className="preview-image" />
              </div>
            )}

            <button type="submit" className="primary-button full-width" disabled={saving}>
              {saving ? "Saving alert..." : editId ? "Update alert" : "Create alert"}
            </button>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Manage your alerts</span>
              <h2>Created alerts</h2>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="empty-state">No alerts created yet.</p>
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  showManageActions
                  onEdit={() => navigate(`/dashboard/${alert.id}`)}
                  onDeactivate={() => handleDeactivate(alert.id)}
                  onViewProofs={() => handleViewProofs(alert)}
                />
              ))}
            </div>
          )}

          <div ref={proofPanelRef}>
            <ProofReviewPanel
              alert={selectedProofAlert}
              proofs={proofs}
              loading={proofsLoading}
              error={proofsError}
              onRefresh={() => selectedProofAlert && loadProofs(selectedProofAlert.id)}
              onStatusChange={handleProofStatusChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
