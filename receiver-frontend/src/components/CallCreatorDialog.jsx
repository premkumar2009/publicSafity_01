export default function CallCreatorDialog({ alert, onClose }) {
  if (!alert) {
    return null;
  }

  return (
    <div className="call-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="call-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="eyebrow">Calling in progress</span>
        <h2 id="call-modal-title">{alert.officerName}</h2>
        <p className="call-modal-subtitle">Ringing the alert creator now.</p>

        <div className="call-modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
          <a className="call-button large-call-button" href={`tel:${alert.policePhone}`}>
            📞 Call now
          </a>
        </div>
      </div>
    </div>
  );
}
