import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PoliceLogo from "../components/PoliceLogo";
import CallCreatorDialog from "../components/CallCreatorDialog";
import ProofSubmissionDialog from "../components/ProofSubmissionDialog";
import { fetchPublicAlertById } from "../utils/api";
import { getPublicLocation } from "../utils/auth";

export default function PublicAlertDetailPage() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [message, setMessage] = useState("Loading alert details...");
  const [selectedCallAlert, setSelectedCallAlert] = useState(null);
  const [selectedProofAlert, setSelectedProofAlert] = useState(null);

  useEffect(() => {
    const location = getPublicLocation();
    if (!location) {
      setMessage("Enable location from the public alerts page first.");
      return;
    }

    fetchPublicAlertById(id, location.latitude, location.longitude)
      .then((data) => {
        setAlert(data);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [id]);

  if (!alert) {
    return (
      <div className="page centered-page">
        <div className="panel detail-panel">
          <p className="empty-state">{message}</p>
          <Link className="secondary-button inline-link" to="/public">Back to alerts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page centered-page">
      <article className="panel detail-panel">
        <div className="brand-lockup hero-brand">
          <PoliceLogo className="brand-logo" />
          <div className="brand-copy">
            <span className="eyebrow">Andhra Pradesh Police</span>
            <h1>{alert.title}</h1>
          </div>
        </div>
        <img src={alert.imageUrl || "/placeholder.svg"} alt={alert.title} className="detail-image" />
        <span className="alert-badge badge-detail">{alert.type}</span>
        <p className="detail-text">{alert.description}</p>

        <div className="detail-grid">
          <div><strong>Location</strong><span>{alert.locationName}</span></div>
          <div><strong>Notification radius</strong><span>{alert.radiusKm} km</span></div>
          <div><strong>Distance from you</strong><span>{alert.distanceKm?.toFixed(2)} km</span></div>
          <div><strong>Posted by</strong><span>{alert.officerName} ({alert.officerBadgeNumber})</span></div>
        </div>

        <div className="alert-actions detail-actions">
          <button type="button" className="call-button large-call-button" onClick={() => setSelectedCallAlert(alert)}>
            📞 Call police
          </button>
          <button type="button" className="secondary-button" onClick={() => setSelectedProofAlert(alert)}>
            Submit proof
          </button>
          <Link className="secondary-button" to="/public">Back to nearby alerts</Link>
        </div>
      </article>

      <CallCreatorDialog alert={selectedCallAlert} onClose={() => setSelectedCallAlert(null)} />
      <ProofSubmissionDialog alert={selectedProofAlert} onClose={() => setSelectedProofAlert(null)} />
    </div>
  );
}
