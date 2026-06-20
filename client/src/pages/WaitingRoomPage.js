import React, { useEffect, useRef } from "react";
import { useQueue } from "../hooks/useQueue";
import { useTheme } from "../context/ThemeContext";
import "./WaitingRoomPage.css";

function Clock() {
  const [time, setTime] = React.useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="wr-clock">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

export default function WaitingRoomPage() {
  const {
    activePatient,
    waitingPatients,
    avgConsultationTime,
    lastConsultationDuration,
    connected,
    loading,
    currentToken,
  } = useQueue();

  const { theme, toggle } = useTheme();
  const prevTokenRef = useRef(null);
  const [flash, setFlash] = React.useState(false);

  useEffect(() => {
    if (
      currentToken !== null &&
      prevTokenRef.current !== null &&
      currentToken !== prevTokenRef.current
    ) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1000);
    }
    prevTokenRef.current = currentToken;
  }, [currentToken]);

  const upcomingTokens = waitingPatients.slice(0, 6);
  const isDark = theme === "dark";

  return (
    <div className={`wr-root ${isDark ? "wr-dark" : "wr-light"}`}>
      {/* Top bar */}
      <div className="wr-topbar">
        <div className="wr-brand">
          <div className="wr-logo">
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="currentColor" fillOpacity="0.15" />
              <path d="M18 9v18M9 18h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="wr-brand-name">Queue Cure</span>
        </div>

        <Clock />

        <div className="wr-topbar-right">
          <div className="wr-conn-status">
            <span className={`wr-dot ${connected ? "wr-dot--on" : "wr-dot--off"}`} />
            <span>{connected ? "Live" : "Connecting…"}</span>
          </div>
          <button className="wr-theme-btn" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
            {isDark ? (
              /* Sun icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              /* Moon icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="wr-loading">
          <div className="wr-spinner" />
        </div>
      ) : (
        <div className="wr-body">
          {/* Now Serving – hero */}
          <div className={`wr-hero ${flash ? "wr-hero--flash" : ""}`}>
            <p className="wr-eyebrow">
              <span className="wr-eyebrow-dot" />
              Now Serving
            </p>
            {activePatient ? (
              <>
                <div className="wr-token-number">{activePatient.token}</div>
                <div className="wr-patient-name">{activePatient.name}</div>
                {activePatient.purpose && (
                  <div className="wr-patient-purpose">{activePatient.purpose}</div>
                )}
              </>
            ) : (
              <div className="wr-no-token">
                <span className="wr-token-number wr-token-number--empty">—</span>
                <p className="wr-no-token-sub">Waiting to begin</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="wr-divider" />

          {/* Bottom */}
          <div className="wr-bottom">
            {/* Upcoming tokens */}
            <div className="wr-upcoming">
              <p className="wr-section-label">Upcoming Tokens</p>
              {upcomingTokens.length > 0 ? (
                <div className="wr-tokens-row">
                  {upcomingTokens.map((p) => (
                    <div key={p.token} className="wr-token-chip">
                      <span className="wr-chip-num">{p.token}</span>
                      <span className="wr-chip-name">{p.name.split(" ")[0]}</span>
                    </div>
                  ))}
                  {waitingPatients.length > 6 && (
                    <div className="wr-token-chip wr-token-chip--more">
                      <span className="wr-chip-num">+{waitingPatients.length - 6}</span>
                      <span className="wr-chip-name">more</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="wr-empty-upcoming">No patients waiting</p>
              )}
            </div>

            {/* Wait info */}
            <div className="wr-wait-info">
              <div className="wr-wait-item">
                <p className="wr-wait-label">Avg Consultation</p>
                <p className="wr-wait-value">{avgConsultationTime} <span className="wr-wait-unit">min</span></p>
              </div>
              {waitingPatients.length > 0 && (
                <>
                  <div className="wr-wait-divider" />
                  <div className="wr-wait-item">
                    <p className="wr-wait-label">Approx. Wait — Next Patient</p>
                    <p className="wr-wait-value">~{avgConsultationTime} <span className="wr-wait-unit">min</span></p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Consultation Insights – secondary info card */}
          <div className="wr-insights">
            <p className="wr-insights-title">Consultation Insights</p>
            <div className="wr-insights-grid">
              <div className="wr-insights-item">
                <span className="wr-insights-label">Average Consultation Time</span>
                <span className="wr-insights-value">{avgConsultationTime} min</span>
              </div>
              <div className="wr-insights-item">
                <span className="wr-insights-label">Last Consultation Duration</span>
                <span className="wr-insights-value">
                  {lastConsultationDuration !== null ? `${lastConsultationDuration} min` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="wr-footer">
        Please be seated. You will be called by your token number.
      </div>
    </div>
  );
}
