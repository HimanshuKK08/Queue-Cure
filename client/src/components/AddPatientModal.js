import React, { useState, useEffect, useRef } from "react";
import "./AddPatientModal.css";

const VISIT_PURPOSES = [
  "General Consultation",
  "Follow-up Visit",
  "Prescription Renewal",
  "Reports Review",
  "Vaccination",
  "Routine Check-up",
  "Other",
];

export default function AddPatientModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Patient name is required.");
      nameRef.current?.focus();
      return;
    }
    if (weight && (isNaN(Number(weight)) || Number(weight) <= 0)) {
      setError("Please enter a valid weight in kg.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await onSubmit({
        name: name.trim(),
        age,
        phone,
        purpose: purpose || null,
        weight: weight || null,
      });
      if (result?.success) {
        setSuccess(result.patient);
        setTimeout(() => onClose(), 1400);
      } else {
        setError(result?.message || "Something went wrong.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess(null);
    setName("");
    setAge("");
    setPhone("");
    setPurpose("");
    setWeight("");
    setError("");
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Add patient">
        <div className="modal-header">
          <h2 className="modal-title">Register Patient</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="modal-success">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="var(--color-success-light)" />
                <path d="M10 16.5l4.5 4.5 7.5-9" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="success-text">
              <p className="success-title">{success.name} added to queue</p>
              <p className="success-token">Token #{success.token}</p>
              {success.purpose && (
                <p className="success-purpose">{success.purpose}</p>
              )}
            </div>
            <button className="btn-secondary" onClick={handleAddAnother}>
              Add another patient
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {/* Name – required */}
              <div className="field-group">
                <label className="field-label" htmlFor="modal-name">
                  Patient Name <span className="required">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="modal-name"
                  type="text"
                  className="field-input"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Age + Phone */}
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="modal-age">Age</label>
                  <input
                    id="modal-age"
                    type="number"
                    className="field-input"
                    placeholder="e.g. 34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="0"
                    max="150"
                    inputMode="numeric"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="modal-phone">Phone</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    className="field-input"
                    placeholder="Optional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                  />
                </div>
              </div>

              {/* Purpose of Visit */}
              <div className="field-group">
                <label className="field-label" htmlFor="modal-purpose">Purpose of Visit</label>
                <div className="select-wrapper">
                  <select
                    id="modal-purpose"
                    className="field-input field-select"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    <option value="">Select purpose (optional)</option>
                    {VISIT_PURPOSES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <span className="select-chevron">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Weight */}
              <div className="field-group">
                <label className="field-label" htmlFor="modal-weight">Weight</label>
                <div className="input-with-unit">
                  <input
                    id="modal-weight"
                    type="number"
                    className="field-input field-input--unit"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="0.1"
                    max="500"
                    step="0.1"
                    inputMode="decimal"
                  />
                  <span className="input-unit">kg</span>
                </div>
              </div>

              {error && (
                <div className="modal-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7.5 4.5v3M7.5 10h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : null}
                {loading ? "Adding…" : "Add to Queue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
