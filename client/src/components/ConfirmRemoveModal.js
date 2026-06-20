import React, { useEffect } from "react";
import "./ConfirmRemoveModal.css";

export default function ConfirmRemoveModal({ patient, onCancel, onConfirm, loading }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-card" role="alertdialog" aria-modal="true" aria-label="Confirm removal">
        {/* Icon */}
        <div className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--color-warning)" strokeWidth="1.5" />
            <path d="M14 9v6M14 18h.01" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="confirm-body">
          <h3 className="confirm-title">Remove from queue?</h3>
          <p className="confirm-message">
            Are you sure you want to remove{" "}
            <strong>Token {patient.token} – {patient.name}</strong>?
            {patient.status === "active" && (
              <span className="confirm-active-note"> This patient is currently in consultation — the next patient will be called automatically.</span>
            )}
          </p>
        </div>

        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="confirm-btn-remove" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="confirm-spinner" /> : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5v7.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {loading ? "Removing…" : "Confirm Removal"}
          </button>
        </div>
      </div>
    </div>
  );
}
