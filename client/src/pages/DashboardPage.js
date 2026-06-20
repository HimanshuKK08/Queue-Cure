import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useQueue } from "../hooks/useQueue";
import AddPatientModal from "../components/AddPatientModal";
import ConfirmRemoveModal from "../components/ConfirmRemoveModal";
import "./DashboardPage.css";

function ConnectionDot({ connected }) {
  return (
    <span className={`conn-dot ${connected ? "conn-dot--on" : "conn-dot--off"}`}
      title={connected ? "Live" : "Reconnecting…"}>
      <span className={`conn-dot-inner ${connected ? "conn-dot-inner--on" : ""}`} />
    </span>
  );
}

function TokenBadge({ n, size = "sm" }) {
  return <span className={`token-badge token-badge--${size}`}>#{n}</span>;
}

function StatusChip({ status }) {
  const map = {
    waiting: { label: "Waiting", cls: "chip-waiting" },
    active: { label: "In Consultation", cls: "chip-active" },
    completed: { label: "Done", cls: "chip-done" },
  };
  const { label, cls } = map[status] || {};
  return <span className={`status-chip ${cls}`}>{label}</span>;
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5v7.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V3.5"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const { auth, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const {
    queue,
    waitingPatients,
    activePatient,
    completedPatients,
    avgConsultationTime,
    lastConsultationDuration,
    connected,
    loading,
    addPatient,
    callNext,
    resetQueue,
    removePatient,
  } = useQueue();

  const [showModal, setShowModal] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); // patient object to remove
  const [removeLoading, setRemoveLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/reception/login");
  };

  const handleCallNext = async () => {
    if (callLoading) return;
    setCallLoading(true);
    try {
      await callNext();
    } finally {
      setTimeout(() => setCallLoading(false), 800);
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    await resetQueue();
    setResetConfirm(false);
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget || removeLoading) return;
    setRemoveLoading(true);
    try {
      await removePatient(removeTarget.token);
      setRemoveTarget(null);
    } finally {
      setRemoveLoading(false);
    }
  };

  const hasQueue = queue.length > 0;
  const hasWaiting = waitingPatients.length > 0;
  const hasNextToCall = hasWaiting || activePatient;

  return (
    <div className="dash-root">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-brand">
          <div className="dash-logo">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="var(--color-primary)" />
              <path d="M18 9v18M9 18h18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="dash-brand-name">Queue Cure</span>
          <ConnectionDot connected={connected} />
        </div>

        <div className="dash-header-meta">
          <span className="dash-hospital-id">{auth?.hospitalId}</span>
        </div>

        <div className="dash-header-actions">
          <button className="icon-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="dash-main">
        {loading ? (
          <div className="dash-loading">
            <div className="dash-spinner" />
            <p>Loading queue…</p>
          </div>
        ) : (
          <div className="dash-grid">
            {/* Left column */}
            <div className="dash-col-left">
              {/* Now Serving card */}
              <div className="card now-serving-card">
                <div className="card-eyebrow">
                  <span className="eyebrow-dot eyebrow-dot--active" />
                  Now Serving
                </div>
                {activePatient ? (
                  <div className="now-serving-content">
                    <div className="now-serving-token">
                      Token {activePatient.token}
                    </div>
                    <div className="now-serving-name">{activePatient.name}</div>
                    <div className="now-serving-details">
                      {activePatient.age && <span>{activePatient.age} yrs</span>}
                      {activePatient.phone && <span>{activePatient.phone}</span>}
                      {activePatient.purpose && (
                        <span className="now-serving-purpose">{activePatient.purpose}</span>
                      )}
                      {activePatient.weight && (
                        <span>{activePatient.weight} kg</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="now-serving-empty">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="12" fill="var(--color-surface-subtle)" />
                      <path d="M20 12v8M20 24h.01" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <p>No active consultation</p>
                    <p className="empty-sub">Add a patient or call next to begin</p>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value">{waitingPatients.length}</div>
                  <div className="stat-label">Waiting</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{completedPatients.length}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {avgConsultationTime}
                    <span className="stat-unit">m</span>
                  </div>
                  <div className="stat-label">Avg Time</div>
                </div>
              </div>

              {/* Actions */}
              <div className="action-row">
                <button
                  className="btn-call-next"
                  onClick={handleCallNext}
                  disabled={callLoading || !hasNextToCall}
                >
                  {callLoading ? (
                    <>
                      <span className="btn-spinner btn-spinner--dark" /> Calling…
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Call Next Patient
                    </>
                  )}
                </button>

                <button className="btn-add-patient" onClick={() => setShowModal(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Add Patient
                </button>
              </div>

              {/* Waiting time estimate */}
              {waitingPatients.length > 0 && (
                <div className="wait-estimate-card">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="2" />
                    <path d="M12 7v5l3 3" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>
                    Est. wait for next:{" "}
                    <strong>{avgConsultationTime} min</strong>
                    {waitingPatients.length > 1 && (
                      <> · Up to <strong>{avgConsultationTime * waitingPatients.length} min</strong> for last</>
                    )}
                  </span>
                </div>
              )}

              {/* Today's Queue Statistics */}
              <div className="insights-card">
                <div className="insights-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3v18h18M7 16l4-5 3 3 5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Today's Queue Statistics
                </div>
                <div className="insights-rows">
                  <div className="insights-row">
                    <span className="insights-label">Completed Consultations</span>
                    <span className="insights-value">{completedPatients.length}</span>
                  </div>
                  <div className="insights-row">
                    <span className="insights-label">Average Consultation Time</span>
                    <span className="insights-value">{avgConsultationTime} min</span>
                  </div>
                  <div className="insights-row">
                    <span className="insights-label">Last Consultation Duration</span>
                    <span className="insights-value">
                      {lastConsultationDuration !== null
                        ? `${lastConsultationDuration} min`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column – Queue List */}
            <div className="dash-col-right">
              <div className="card queue-card">
                <div className="queue-card-header">
                  <h2 className="queue-card-title">Patient Queue</h2>
                  <div className="queue-card-actions">
                    <a href="/waiting-room" target="_blank" rel="noopener noreferrer" className="link-btn" title="Open patient display">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Patient Display
                    </a>
                    {hasQueue && (
                      <button
                        className={`reset-btn ${resetConfirm ? "reset-btn--confirm" : ""}`}
                        onClick={handleReset}
                      >
                        {resetConfirm ? "Confirm Reset?" : "Reset Day"}
                      </button>
                    )}
                  </div>
                </div>

                {!hasQueue ? (
                  <div className="queue-empty">
                    <div className="queue-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="14" fill="var(--color-primary-light)" />
                        <path d="M16 24h16M16 17h16M16 31h10" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="queue-empty-title">Queue is empty</p>
                    <p className="queue-empty-sub">Add a patient to get started</p>
                    <button className="btn-primary-sm" onClick={() => setShowModal(true)}>
                      Add First Patient
                    </button>
                  </div>
                ) : (
                  <div className="queue-list">
                    {/* Active patient */}
                    {activePatient && (
                      <div className="queue-item queue-item--active">
                        <div className="qi-left">
                          <TokenBadge n={activePatient.token} size="md" />
                          <div className="qi-info">
                            <span className="qi-name">{activePatient.name}</span>
                            <span className="qi-meta">
                              {[
                                activePatient.age && `${activePatient.age} yrs`,
                                activePatient.phone,
                                activePatient.purpose,
                                activePatient.weight && `${activePatient.weight} kg`,
                              ].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                        </div>
                        <div className="qi-right">
                          <StatusChip status="active" />
                          <button
                            className="qi-delete-btn"
                            onClick={() => setRemoveTarget(activePatient)}
                            title="Remove patient"
                            aria-label={`Remove ${activePatient.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Waiting patients */}
                    {waitingPatients.map((p, i) => (
                      <div key={p.token} className="queue-item queue-item--waiting">
                        <div className="qi-left">
                          <TokenBadge n={p.token} size="md" />
                          <div className="qi-info">
                            <span className="qi-name">{p.name}</span>
                            <span className="qi-meta">
                              {[
                                p.age && `${p.age} yrs`,
                                p.phone,
                                p.purpose,
                                p.weight && `${p.weight} kg`,
                              ].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                        </div>
                        <div className="qi-right">
                          <span className="qi-wait-est">
                            ~{avgConsultationTime * (i + (activePatient ? 1 : 0))} min
                          </span>
                          <StatusChip status="waiting" />
                          <button
                            className="qi-delete-btn"
                            onClick={() => setRemoveTarget(p)}
                            title="Remove patient"
                            aria-label={`Remove ${p.name}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Completed (collapsed) */}
                    {completedPatients.length > 0 && (
                      <details className="completed-section">
                        <summary className="completed-summary">
                          {completedPatients.length} completed today
                        </summary>
                        <div className="completed-list">
                          {completedPatients.map((p) => (
                            <div key={p.token} className="queue-item queue-item--done">
                              <div className="qi-left">
                                <TokenBadge n={p.token} />
                                <div className="qi-info">
                                  <span className="qi-name qi-name--done">{p.name}</span>
                                  {p.purpose && (
                                    <span className="qi-meta">{p.purpose}</span>
                                  )}
                                </div>
                              </div>
                              <StatusChip status="completed" />
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onSubmit={addPatient}
        />
      )}

      {removeTarget && (
        <ConfirmRemoveModal
          patient={removeTarget}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
          loading={removeLoading}
        />
      )}
    </div>
  );
}
