import { useEffect, useMemo, useRef, useState } from "react";
import { submitAlertProof } from "../utils/api";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const initialForm = {
  description: "",
  phoneNumber: "",
  reporterLocationText: "",
  reporterLatitude: "",
  reporterLongitude: ""
};

export default function ProofSubmissionDialog({ alert, onClose, onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraMessage, setCameraMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const actionsRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  function stopCameraStream() {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }

  function captureCurrentLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("Location access is unavailable. Enter it manually if needed.");
      return Promise.resolve(null);
    }

    setStatusMessage("Trying to capture your current location...");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLatitude = position.coords.latitude.toFixed(6);
          const nextLongitude = position.coords.longitude.toFixed(6);
          setForm((current) => ({
            ...current,
            reporterLatitude: nextLatitude,
            reporterLongitude: nextLongitude,
            reporterLocationText: current.reporterLocationText || "Current location"
          }));
          setStatusMessage("Location captured from your browser.");
          resolve({ latitude: nextLatitude, longitude: nextLongitude });
        },
        () => {
          setStatusMessage("Location could not be captured. Fill the form manually.");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  function validateImageFile(file) {
    if (!file.type.startsWith("image/")) {
      window.alert("Only image files are allowed.");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      window.alert("Image size must be 10 MB or less.");
      return false;
    }

    return true;
  }

  function setImageFile(file) {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!validateImageFile(file)) {
      return;
    }

    setSelectedFile(file);
    setCameraMessage("Photo attached.");
    setStatusMessage("Proof image ready.");
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("Camera access is unavailable in this browser.");
      return;
    }

    try {
      setCameraMessage("Starting camera preview...");
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });

      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      const latestLocation = await captureCurrentLocation();
      setCameraMessage(
        latestLocation
          ? `Camera is ready. Photo will include ${latestLocation.latitude}, ${latestLocation.longitude}.`
          : "Camera is ready. Location will stay manual unless permission is granted."
      );
    } catch (error) {
      setIsCameraActive(false);
      cameraStreamRef.current = null;
      setCameraMessage(
        error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError"
          ? "Camera permission was denied. Use gallery upload or try again."
          : "Camera could not be started on this device."
      );
    }
  }

  function triggerGalleryUpload() {
    galleryInputRef.current?.click();
  }

  function triggerCameraShortcutUpload() {
    cameraInputRef.current?.click();
  }

  function handleGalleryFileChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    event.target.value = "";
  }

  function handleCameraShortcutFileChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    event.target.value = "";
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraStreamRef.current) {
      setCameraMessage("Start the camera first to capture a photo.");
      return;
    }

    const latestLocation = (await captureCurrentLocation()) || {
      latitude: form.reporterLatitude,
      longitude: form.reporterLongitude
    };

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraMessage("Unable to capture the photo right now.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    if (latestLocation.latitude && latestLocation.longitude) {
      const overlayPadding = 18;
      const overlayHeight = 54;
      const stampText = `Location: ${latestLocation.latitude}, ${latestLocation.longitude}`;
      context.fillStyle = "rgba(15, 23, 42, 0.68)";
      context.fillRect(0, height - overlayHeight, width, overlayHeight);
      context.fillStyle = "#ffffff";
      context.font = "bold 28px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      context.textBaseline = "middle";
      context.fillText(stampText, overlayPadding, height - overlayHeight / 2);
    }

    const blob = await new Promise((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob), "image/jpeg", 0.92);
    });

    if (!blob) {
      setCameraMessage("Unable to capture the photo right now.");
      return;
    }

    const capturedFile = new File([blob], `proof-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    if (!validateImageFile(capturedFile)) {
      return;
    }

    setImageFile(capturedFile);
    stopCameraStream();
    setStatusMessage(
      latestLocation.latitude && latestLocation.longitude
        ? `Photo captured with live location ${latestLocation.latitude}, ${latestLocation.longitude}.`
        : "Photo captured and attached."
    );
    setCameraMessage("Photo captured and attached.");
  }

  function closeCamera() {
    stopCameraStream();
    setCameraMessage("Camera closed.");
  }

  useEffect(() => {
    if (!alert) {
      stopCameraStream();
      return undefined;
    }

    setForm(initialForm);
    setSelectedFile(null);
    setPreviewUrl("");
    setStatusMessage("Trying to capture your current location...");
    setCameraMessage("");
    setIsCameraActive(false);
    stopCameraStream();
    captureCurrentLocation();

    return () => stopCameraStream();
  }, [alert]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    window.requestAnimationFrame(() => {
      actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !cameraStreamRef.current) {
      return undefined;
    }

    videoRef.current.srcObject = cameraStreamRef.current;
    const playPromise = videoRef.current.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setCameraMessage("Camera preview could not start automatically."));
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraActive]);

  const hasGeolocation = useMemo(() => Boolean(form.reporterLatitude && form.reporterLongitude), [form.reporterLatitude, form.reporterLongitude]);

  if (!alert) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.description.trim()) {
      window.alert("Please describe what you saw.");
      return;
    }

    if (!selectedFile) {
      window.alert("Please attach a proof image.");
      return;
    }

    const normalizedPhoneNumber = form.phoneNumber.replace(/\D/g, "");
    if (normalizedPhoneNumber && normalizedPhoneNumber.length !== 10) {
      window.alert("Phone number must be exactly 10 digits when provided.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", form.description.trim());
      if (normalizedPhoneNumber) {
        formData.append("phoneNumber", normalizedPhoneNumber);
      }
      if (form.reporterLocationText.trim()) {
        formData.append("reporterLocationText", form.reporterLocationText.trim());
      }
      if (form.reporterLatitude !== "") {
        formData.append("reporterLatitude", form.reporterLatitude);
      }
      if (form.reporterLongitude !== "") {
        formData.append("reporterLongitude", form.reporterLongitude);
      }
      formData.append("proofImage", selectedFile);

      const response = await submitAlertProof(alert.id, formData);
      onSubmitted?.(response);
      stopCameraStream();
      onClose();
      window.alert("Proof submitted successfully.");
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    stopCameraStream();
    onClose();
  }

  return (
    <div className="proof-modal-backdrop" role="presentation" onClick={handleClose}>
      <div
        className="proof-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proof-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="eyebrow">Report with proof</span>
        <h2 id="proof-modal-title">{alert.title}</h2>
        <p className="proof-modal-subtitle">
          Share a photo and a short description so police can review this alert faster.
        </p>

        <form className="proof-form" onSubmit={handleSubmit}>
          <div className="proof-form-body">
            <div className="full-width proof-media-panel">
              <div className="proof-media-header">
                <span>Proof image</span>
                <p>Attach from your device or take a live photo.</p>
              </div>

              <div className="proof-media-actions">
                <button type="button" className="secondary-button" onClick={triggerGalleryUpload}>
                  Upload from gallery/files
                </button>
                <button type="button" className="secondary-button" onClick={triggerCameraShortcutUpload}>
                  Use camera shortcut
                </button>
                <button type="button" className="secondary-button" onClick={startCamera}>
                  Take photo
                </button>
              </div>

              <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" onChange={handleGalleryFileChange} />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleCameraShortcutFileChange}
              />
              <canvas ref={canvasRef} className="sr-only" />

              {isCameraActive && (
                <div className="camera-shell">
                  <video ref={videoRef} className="camera-preview" autoPlay playsInline muted />
                  <div className="camera-actions">
                    <button type="button" className="secondary-button" onClick={capturePhoto}>
                      Capture photo
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        stopCameraStream();
                        startCamera();
                      }}
                    >
                      Retake
                    </button>
                    <button type="button" className="ghost-button" onClick={closeCamera}>
                      Close camera
                    </button>
                  </div>
                </div>
              )}

              {cameraMessage && <p className="helper-message">{cameraMessage}</p>}

              {(previewUrl || selectedFile) && (
                <div className="proof-preview-box">
                  {previewUrl && <img src={previewUrl} alt="Selected proof preview" className="proof-preview-image" />}
                  {selectedFile && <p className="file-caption">Selected file: {selectedFile.name}</p>}
                </div>
              )}
            </div>

            <label className="full-width">
              <span>Description</span>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Explain what you saw"
                required
              />
            </label>

            <label>
              <span>Phone number</span>
              <input
                inputMode="tel"
                value={form.phoneNumber}
                onChange={(event) => setForm({ ...form, phoneNumber: event.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="Optional, 10 digits"
                maxLength={10}
                pattern="[0-9]{10}"
              />
            </label>

            <label>
              <span>Location text</span>
              <input
                value={form.reporterLocationText}
                onChange={(event) => setForm({ ...form, reporterLocationText: event.target.value })}
                placeholder="Area name or landmark"
              />
            </label>

            <div className="inline-fields full-width">
              <label>
                <span>Latitude</span>
                <input
                  value={form.reporterLatitude}
                  onChange={(event) => setForm({ ...form, reporterLatitude: event.target.value })}
                  placeholder="Auto-filled if available"
                />
              </label>
              <label>
                <span>Longitude</span>
                <input
                  value={form.reporterLongitude}
                  onChange={(event) => setForm({ ...form, reporterLongitude: event.target.value })}
                  placeholder="Auto-filled if available"
                />
              </label>
              <button type="button" className="secondary-button location-button" onClick={captureCurrentLocation}>
                Use current location
              </button>
            </div>

            <div className="full-width proof-status-line">
              <span>{statusMessage}</span>
              <span>{hasGeolocation ? "Location ready" : "Manual location entry available"}</span>
            </div>
          </div>

          <div ref={actionsRef} className="proof-modal-actions full-width">
            <button type="button" className="ghost-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit proof"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}