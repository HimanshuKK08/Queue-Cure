# Queue Cure 🏥

**Real-time clinic queue management system** for small and medium healthcare facilities.

Replaces paper token systems with a live digital queue — reducing patient uncertainty, streamlining reception workflows, and giving patients visibility into wait times.

---

## Quick Start

### Prerequisites
- Node.js 16+
- npm

### 1. Start the Backend Server

```bash
cd server
npm install
node index.js
```

Server starts at **http://localhost:3001**

### 2. Start the Frontend (dev mode)

```bash
cd client
npm install
npm start
```

App opens at **http://localhost:3000**

---

## Application Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/reception/login` | Receptionist login | No |
| `/reception` | Receptionist dashboard | ✅ Yes |
| `/waiting-room` | Patient display screen | No |

---

## Default Credentials

```
Hospital ID:  CITYCLINIC01
PIN:          1234
```

To change, edit `server/index.js` → `CREDENTIALS` object.

---

## Features

### Receptionist Dashboard
- **Now Serving** card with active patient name, token, and visit details (purpose, weight)
- **Queue overview** with all waiting/active/completed patients
- **Call Next** button — advances the queue, calculates consultation duration
- **Add Patient** form — name (required), age, phone, **purpose of visit** (dropdown), **weight in kg** (all optional)
- **Remove patient** — delete icon per queue row with a confirmation dialog; safely re-promotes the next patient if the active one is removed
- **Live stats** — waiting count, completed count, average consultation time
- **Today's Queue Statistics** card — completed consultations, average consultation time, and **last consultation duration**
- **Estimated wait times** per patient
- **Reset Day** button to clear queue for a new day
- **Theme toggle** (Light / Dark)
- **Connection status** indicator

### Patient Waiting Room Display
- Large token number display (optimized for TVs and monitors)
- Current patient name and purpose of visit
- Upcoming token list
- Average consultation time and estimated wait for next patient
- **Consultation Insights** card — average consultation time + last consultation duration, shown as a secondary, low-emphasis panel
- Full **Light and Dark theme support**, matching the reception dashboard, with no layout shift when switching
- Live clock
- Auto-updates via Socket.IO — no page refresh needed

### Real-Time Sync
All connected clients (reception dashboard + waiting room screens) update instantly via Socket.IO when:
- A patient is added
- A patient is removed
- The next patient is called
- The average consultation time or last consultation duration changes

### Wait-Time Strategy
- **Average Consultation Time** remains the metric used to estimate patient wait times (unchanged calculation: total duration ÷ completed consultations).
- **Last Consultation Duration** is a new, independent transparency metric — the duration of the most recently completed consultation. It updates every time "Call Next" is pressed, but it does **not** factor into wait-time estimates. It exists purely to give patients and staff a sense of the clinic's current pace versus its long-term average.

---

## Architecture

```
queue-cure/
├── server/          # Express + Socket.IO backend
│   └── index.js     # In-memory queue state, REST API, WebSocket
└── client/          # React frontend
    └── src/
        ├── pages/
        │   ├── LoginPage.js        # Receptionist auth
        │   ├── DashboardPage.js    # Reception UI
        │   └── WaitingRoomPage.js  # Patient display
        ├── components/
        │   └── AddPatientModal.js  # Add patient form
        ├── context/
        │   ├── AuthContext.js      # Session management
        │   └── ThemeContext.js     # Light/dark theme
        └── hooks/
            └── useQueue.js         # Socket.IO + REST state
```

### Data Flow

```
Receptionist clicks "Add Patient"
  → POST /api/queue/add
  → Server updates in-memory queue
  → Socket emits "queue-updated"
  → All clients (dashboard + waiting room) update instantly

Receptionist clicks "Call Next"
  → POST /api/queue/next
  → Server marks current patient completed
  → Calculates Last Consultation Duration (new metric)
  → Recalculates Average Consultation Time (unchanged logic)
  → Advances to next waiting patient
  → Socket emits "queue-updated" + "token-called" + "average-time-updated"
  → All clients update instantly

Receptionist clicks the delete icon on a queue row
  → Confirmation dialog appears
  → On confirm: DELETE /api/queue/remove/:token
  → Server removes patient; if they were active, the next waiting patient is promoted
  → Socket emits "queue-updated" + "patient-removed"
  → All clients update instantly
```

---

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, React Router, Socket.IO Client
- **State**: In-memory (no database required for MVP)
- **Auth**: Lightweight hospital ID + PIN (session-persisted)

---

## Future Scope

The in-memory architecture is designed to be swappable with a persistent store (MongoDB, PostgreSQL) without changing the API contracts. Planned extensions:

- Persistent database for multi-day history
- Multiple clinic/doctor support
- QR code patient check-in
- Doctor-facing dashboard
- Smarter ML-based wait time prediction
- Appointment scheduling integration
