import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }
  return new Date(value).toLocaleString();
}

export default function ProofReviewPanel({ alert, proofs, loading, error, onRefresh, onStatusChange }) {
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    setSelectedProof(null);
  }, [alert?.id]);

  const selectedProofImageUrl = useMemo(() => {
    if (!selectedProof) {
      return "";
    }
    return selectedProof.proofImageUrl || selectedProof.imageUrl || (selectedProof.proofImageFileName ? `/api/uploads/images/${selectedProof.proofImageFileName}` : "/placeholder.svg");
  }, [selectedProof]);

  if (!alert) {
    return null;
  }

  function openProof(proof, displayNumber) {
    setSelectedProof({ ...proof, displayNumber });
  }

  function closeProof() {
    setSelectedProof(null);
  }

  return (
    <section className="panel proof-review-panel">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Public proof submissions</span>
          <h2>{alert.title}</h2>
          <p className="proof-review-subtitle">{alert.locationName}</p>
        </div>
        <button type="button" className="secondary-button" onClick={onRefresh}>
          Refresh proofs
        </button>
      </div>

      {loading ? (
        <p className="empty-state">Loading proof submissions...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : proofs.length === 0 ? (
        <p className="empty-state">No proof submissions have been posted for this alert yet.</p>
      ) : (
        <div className="proof-list">
          {proofs.map((proof, index) => (
            <article
              key={proof.id}
              className="proof-card proof-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openProof(proof, index + 1)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openProof(proof, index + 1);
                }
              }}
            >
              <div className="proof-card-image-wrap">
                <img src={proof.proofImageUrl || "/placeholder.svg"} alt="Submitted proof" className="proof-card-image" />
              </div>
              <div className="proof-card-content">
                <div className="proof-card-header">
                  <h3>Proof #{index + 1}</h3>
                  <span className={`proof-status-badge proof-status-${proof.status.toLowerCase()}`}>
                    {proof.status}
                  </span>
                </div>

                <p>{proof.description}</p>

                <div className="proof-meta-grid">
                  <div><strong>Phone</strong><span>{proof.phoneNumber || "Not provided"}</span></div>
                  <div><strong>Location</strong><span>{proof.reporterLocationText || "Not provided"}</span></div>
                  <div><strong>Latitude</strong><span>{proof.reporterLatitude ?? "-"}</span></div>
                  <div><strong>Longitude</strong><span>{proof.reporterLongitude ?? "-"}</span></div>
                  <div><strong>Submitted</strong><span>{formatDate(proof.createdAt)}</span></div>
                  <div><strong>Updated</strong><span>{formatDate(proof.updatedAt)}</span></div>
                </div>

                <div className="proof-review-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStatusChange(proof.id, "REVIEWED");
                    }}
                  >
                    Mark reviewed
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStatusChange(proof.id, "USEFUL");
                    }}
                  >
                    Mark useful
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onStatusChange(proof.id, "REJECTED");
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedProof && (
        <div className="proof-detail-backdrop" role="presentation" onClick={closeProof}>
          <div
            className="proof-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="proof-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="proof-detail-header">
              <div>
                <span className="eyebrow">Proof details</span>
                <h3 id="proof-detail-title">Proof #{selectedProof.displayNumber}</h3>
                <p className="proof-review-subtitle">{alert.title}</p>
              </div>
              <button type="button" className="ghost-button" onClick={closeProof}>
                Close
              </button>
            </div>

            <div className="proof-detail-body">
              <div className="proof-detail-image-wrap">
                <img src={selectedProofImageUrl} alt="Submitted proof preview" className="proof-detail-image" />
              </div>

              <div className="proof-detail-grid">
                <div><strong>Status</strong><span>{selectedProof.status}</span></div>
                <div><strong>Phone</strong><span>{selectedProof.phoneNumber || "Not provided"}</span></div>
                <div><strong>Location</strong><span>{selectedProof.reporterLocationText || "Not provided"}</span></div>
                <div><strong>Latitude</strong><span>{selectedProof.reporterLatitude ?? "-"}</span></div>
                <div><strong>Longitude</strong><span>{selectedProof.reporterLongitude ?? "-"}</span></div>
                <div><strong>Submitted</strong><span>{formatDate(selectedProof.createdAt)}</span></div>
                <div><strong>Updated</strong><span>{formatDate(selectedProof.updatedAt)}</span></div>
                <div className="full-width"><strong>Description</strong><span>{selectedProof.description}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}