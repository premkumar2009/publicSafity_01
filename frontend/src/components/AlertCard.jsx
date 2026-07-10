import { Link } from "react-router-dom";

function formatDistance(distanceKm) {
  if (distanceKm == null) return null;
  return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m away` : `${distanceKm.toFixed(2)} km away`;
}

export default function AlertCard({ alert, showManageActions = false, onEdit, onDeactivate, onViewProofs }) {
  return (
    <article className="alert-card">
      <img
        src={alert.imageUrl || "/placeholder.svg"}
        alt={alert.title}
        className="alert-image"
      />
      <div className="alert-content">
        <span className={`alert-badge badge-${alert.type.toLowerCase().replace(/\s+/g, "-")}`}>
          {alert.type}
        </span>
        <h3>{alert.title}</h3>
        <p>{alert.description}</p>
        <div className="alert-meta">
          <span>📍 {alert.locationName}</span>
          <span>📡 Radius: {alert.radiusKm} km</span>
          {alert.distanceKm != null && <span>🧭 {formatDistance(alert.distanceKm)}</span>}
          <span>👮 {alert.officerName} ({alert.officerBadgeNumber})</span>
        </div>
        <div className="alert-actions">
          <Link className="secondary-button" to={`/public/${alert.id}`}>View details</Link>
          <a className="call-button" href={`tel:${alert.policePhone}`}>📞 Call police</a>
          {showManageActions && (
            <>
              <button type="button" className="secondary-button" onClick={onViewProofs}>View proofs</button>
              <button type="button" className="ghost-button" onClick={onEdit}>Edit</button>
              {alert.status === "ACTIVE" && (
                <button type="button" className="danger-button" onClick={onDeactivate}>Deactivate</button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
