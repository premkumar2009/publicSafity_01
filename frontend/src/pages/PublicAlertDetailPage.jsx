import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPublicAlertById } from "../utils/api";
import { getPublicLocation } from "../utils/auth";

export default function PublicAlertDetailPage() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [message, setMessage] = useState("Loading alert details...");

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
        <img src={alert.imageUrl || "/placeholder.svg"} alt={alert.title} className="detail-image" />
        <span className="alert-badge badge-detail">{alert.type}</span>
        <h1>{alert.title}</h1>
        <p className="detail-text">{alert.description}</p>

        <div className="detail-grid">
          <div><strong>Location</strong><span>{alert.locationName}</span></div>
          <div><strong>Notification radius</strong><span>{alert.radiusKm} km</span></div>
          <div><strong>Distance from you</strong><span>{alert.distanceKm?.toFixed(2)} km</span></div>
          <div><strong>Posted by</strong><span>{alert.officerName} ({alert.officerBadgeNumber})</span></div>
        </div>

        <div className="alert-actions detail-actions">
          <a className="call-button large-call-button" href={`tel:${alert.policePhone}`}>📞 Call police</a>
          <Link className="secondary-button" to="/public">Back to nearby alerts</Link>
        </div>
      </article>
    </div>
  );
}
