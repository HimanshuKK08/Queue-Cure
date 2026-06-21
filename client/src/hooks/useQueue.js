import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export function useQueue() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [queueState, setQueueState] = useState({
    queue: [],
    currentToken: null,
    avgConsultationTime: 10,
    lastConsultationDuration: null,
    completedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("queue-updated", (data) => {
      setQueueState(data);
      setLoading(false);
    });

    // Fetch initial state via REST too (in case socket is slow)
    fetch(`${SERVER_URL}/api/queue`)
      .then((r) => r.json())
      .then((data) => {
        setQueueState(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => socket.disconnect();
  }, []);

  const addPatient = useCallback(async (patientData) => {
    const res = await fetch(`${SERVER_URL}/api/queue/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
    return res.json();
  }, []);

  const callNext = useCallback(async () => {
    const res = await fetch(`${SERVER_URL}/api/queue/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }, []);

  const resetQueue = useCallback(async () => {
    const res = await fetch(`${SERVER_URL}/api/queue/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  }, []);

  const removePatient = useCallback(async (token) => {
    const res = await fetch(`${SERVER_URL}/api/queue/remove/${token}`, {
      method: "DELETE",
    });
    return res.json();
  }, []);

  // Derived state
  const waitingPatients = queueState.queue.filter((p) => p.status === "waiting");
  const activePatient = queueState.queue.find((p) => p.status === "active");
  const completedPatients = queueState.queue.filter((p) => p.status === "completed");

  return {
    ...queueState,
    waitingPatients,
    activePatient,
    completedPatients,
    connected,
    loading,
    addPatient,
    callNext,
    resetQueue,
    removePatient,
  };
}
