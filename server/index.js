const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
    "https://queue-cure-self.vercel.app",
    "http://queue-cure-self.vercel.app"
    ],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ── In-memory State ──────────────────────────────────────────────────────────
const CREDENTIALS = {
  hospitalId: "CITYCLINIC01",
  pin: "1234",
};

let state = {
  queue: [],          // { token, name, age, phone, purpose, weight, status, addedAt, startedAt }
  currentToken: null, // token number of active patient
  nextTokenNumber: 1,
  avgConsultationTime: 10, // minutes, default
  lastConsultationDuration: null, // minutes, null until first completion
  completedCount: 0,
  totalDuration: 0,   // minutes
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getQueueSnapshot() {
  return {
    queue: state.queue,
    currentToken: state.currentToken,
    avgConsultationTime: state.avgConsultationTime,
    lastConsultationDuration: state.lastConsultationDuration,
    completedCount: state.completedCount,
  };
}

function broadcastUpdate(event, data) {
  io.emit(event, data);
}

// ── REST Endpoints ───────────────────────────────────────────────────────────

// Auth
app.post("/api/auth/login", (req, res) => {
  const { hospitalId, pin } = req.body;
  if (
    hospitalId === CREDENTIALS.hospitalId &&
    String(pin) === CREDENTIALS.pin
  ) {
    return res.json({ success: true, hospitalId });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Get current queue state
app.get("/api/queue", (req, res) => {
  res.json(getQueueSnapshot());
});

// Add patient
app.post("/api/queue/add", (req, res) => {
  const { name, age, phone, purpose, weight } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Patient name is required" });
  }

  const token = state.nextTokenNumber++;
  const patient = {
    token,
    name: name.trim(),
    age: age || null,
    phone: phone || null,
    purpose: purpose || null,
    weight: weight ? Number(weight) : null,
    status: "waiting",
    addedAt: Date.now(),
    startedAt: null,
  };

  state.queue.push(patient);

  // If no active patient, make this one active
  if (state.currentToken === null) {
    patient.status = "active";
    patient.startedAt = Date.now();
    state.currentToken = token;
  }

  broadcastUpdate("queue-updated", getQueueSnapshot());
  broadcastUpdate("patient-added", { patient });

  return res.json({ success: true, patient, queue: state.queue });
});

// Call next patient
app.post("/api/queue/next", (req, res) => {
  const activeIndex = state.queue.findIndex((p) => p.status === "active");

  if (activeIndex !== -1) {
    const active = state.queue[activeIndex];
    const endTime = Date.now();

    // Calculate consultation duration
    if (active.startedAt) {
      const durationMs = endTime - active.startedAt;
      const durationMin = Math.round((durationMs / 60000) * 10) / 10;

      // Last Consultation Duration — transparency metric only,
      // does not feed into wait-time estimation logic.
      state.lastConsultationDuration = durationMin;

      state.totalDuration += durationMin;
      state.completedCount += 1;
      state.avgConsultationTime =
        Math.round((state.totalDuration / state.completedCount) * 10) / 10;
    }

    // Mark current as completed
    state.queue[activeIndex].status = "completed";
    state.currentToken = null;
  }

  // Find next waiting patient
  const nextPatient = state.queue.find((p) => p.status === "waiting");
  if (nextPatient) {
    nextPatient.status = "active";
    nextPatient.startedAt = Date.now();
    state.currentToken = nextPatient.token;
    broadcastUpdate("token-called", { token: nextPatient.token });
  }

  broadcastUpdate("queue-updated", getQueueSnapshot());
  broadcastUpdate("average-time-updated", {
    avgConsultationTime: state.avgConsultationTime,
    lastConsultationDuration: state.lastConsultationDuration,
  });

  return res.json({ success: true, ...getQueueSnapshot() });
});

// Remove patient from queue
app.delete("/api/queue/remove/:token", (req, res) => {
  const tokenNum = parseInt(req.params.token, 10);
  const index = state.queue.findIndex((p) => p.token === tokenNum);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  const patient = state.queue[index];

  // If removing the active patient, clear currentToken and promote next waiting
  if (patient.status === "active") {
    state.queue.splice(index, 1);
    state.currentToken = null;
    const nextPatient = state.queue.find((p) => p.status === "waiting");
    if (nextPatient) {
      nextPatient.status = "active";
      nextPatient.startedAt = Date.now();
      state.currentToken = nextPatient.token;
      broadcastUpdate("token-called", { token: nextPatient.token });
    }
  } else {
    state.queue.splice(index, 1);
  }

  broadcastUpdate("queue-updated", getQueueSnapshot());
  broadcastUpdate("patient-removed", { token: tokenNum });

  return res.json({ success: true, token: tokenNum, ...getQueueSnapshot() });
});

// Reset queue (for new day)
app.post("/api/queue/reset", (req, res) => {
  state = {
    queue: [],
    currentToken: null,
    nextTokenNumber: 1,
    avgConsultationTime: 10,
    lastConsultationDuration: null,
    completedCount: 0,
    totalDuration: 0,
  };
  broadcastUpdate("queue-updated", getQueueSnapshot());
  return res.json({ success: true, message: "Queue reset" });
});

// ── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  // Send current state to newly connected client
  socket.emit("queue-updated", getQueueSnapshot());

  socket.on("disconnect", () => {});
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Queue Cure server running on port ${PORT}`);
  console.log(`Hospital ID: ${CREDENTIALS.hospitalId} | PIN: ${CREDENTIALS.pin}`);
});
