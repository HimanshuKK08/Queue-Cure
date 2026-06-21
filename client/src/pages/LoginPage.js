import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function LoginPage() {
  const [hospitalId, setHospitalId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // console.log("LOGIN PAGE URL =", SERVER_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hospitalId.trim() || !pin.trim()) {
      setError("Please enter your Hospital ID and PIN.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: hospitalId.trim(), pin: pin.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.hospitalId);
        navigate("/reception");
      } else {
        setError("Invalid Hospital ID or PIN. Please try again.");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="var(--color-primary)" />
              <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="login-title">Queue Cure</h1>
          <p className="login-subtitle">Reception Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="hospitalId">Hospital ID</label>
            <input
              id="hospitalId"
              type="text"
              className="field-input"
              placeholder="e.g. CITYCLINIC01"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value.toUpperCase())}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="pin">Reception PIN</label>
            <input
              id="pin"
              type="password"
              className="field-input"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="current-password"
              inputMode="numeric"
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              "Sign In to Reception"
            )}
          </button>
        </form>

        <p className="login-hint">
          Patient waiting room?{" "}
          <a href="/waiting-room" className="login-link">Open display →</a>
        </p>
      </div>

      {/* Background decoration */}
      <div className="login-bg-circle login-bg-circle--1" />
      <div className="login-bg-circle login-bg-circle--2" />
    </div>
  );
}
