import { useEffect, useRef, useState } from "react";
import AlertCard from "../components/AlertCard";
import { fetchPublicAlerts } from "../utils/api";
import { addNotifiedAlertId, getNotifiedAlertIds, getPublicLocation, savePublicLocation } from "../utils/auth";

export default function PublicAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(getPublicLocation());
  const [statusMessage, setStatusMessage] = useState("Enable location to receive alerts near you.");
  const [notificationPermission, setNotificationPermission] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (location) {
      loadAlerts(location.latitude, location.longitude);
      intervalRef.current = setInterval(() => {
        loadAlerts(location.latitude, location.longitude);
      }, 15000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      alert("Notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  function enableLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("Your browser does not support geolocation.");
      return;
    }
    setStatusMessage("Fetching your current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        };
        savePublicLocation(nextLocation);
        setLocation(nextLocation);
        setStatusMessage("Location enabled. Nearby police alerts will appear here.");
      },
      () => setStatusMessage("Location access denied. Public alerts work only inside the selected radius."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function loadAlerts(lat, lng) {
    try {
      const data = await fetchPublicAlerts(lat, lng);
      setAlerts(data);
      notifyForNewAlerts(data);
      setStatusMessage(data.length ? "Nearby police alerts found." : "No active nearby police alerts right now.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  function notifyForNewAlerts(alertItems) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }
    const notified = new Set(getNotifiedAlertIds());
    alertItems.forEach((alert) => {
      if (notified.has(alert.id)) {
        return;
      }
      const notification = new Notification(alert.title, {
        body: `${alert.type} near ${alert.locationName}`,
        icon: alert.imageUrl || "/placeholder.svg",
        image: alert.imageUrl || undefined,
        tag: `public-alert-${alert.id}`
      });
      notification.onclick = () => {
        window.open(`/public/${alert.id}`, "_blank");
      };
      addNotifiedAlertId(alert.id);
    });
  }

  return (
    <div className="page public-page">
      <header className="public-header">
        <div>
          <span className="eyebrow">Citizen access</span>
          <h1>Nearby Public Safety Alerts</h1>
          <p>No login required. We use only your browser location to match active nearby alerts.</p>
        </div>
        <div className="header-button-group">
          <button type="button" className="secondary-button" onClick={enableLocation}>Enable location</button>
          <button type="button" className="secondary-button" onClick={enableNotifications}>Enable notifications</button>
        </div>
      </header>

      <section className="panel status-panel">
        <div className="status-grid">
          <div>
            <strong>Location</strong>
            <p>{location ? `${location.latitude}, ${location.longitude}` : "Not enabled"}</p>
          </div>
          <div>
            <strong>Notifications</strong>
            <p>{notificationPermission}</p>
          </div>
          <div>
            <strong>Status</strong>
            <p>{statusMessage}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Live public feed</span>
            <h2>Alerts inside your area</h2>
          </div>
        </div>

        {!location ? (
          <p className="empty-state">Turn on location to receive alerts created for your nearby area.</p>
        ) : alerts.length === 0 ? (
          <p className="empty-state">No nearby alerts at the moment.</p>
        ) : (
          <div className="alert-list">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
