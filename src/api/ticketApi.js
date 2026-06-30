const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = (pin) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${pin}`,
});

const jsonHeaders = {
  "Content-Type": "application/json",
};

// ─── Public endpoints ─────────────────────────────────────────────────────────

/** POST /api/tickets — customer joins the queue */
export const joinQueue = async (name) => {
  const res = await fetch(`${BASE}/api/tickets`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to join queue");
  return data.ticket;
};

/** GET /api/tickets — public live queue (first names + positions) */
export const getPublicQueue = async () => {
  const res = await fetch(`${BASE}/api/tickets`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch queue");
  return data.queue;
};

/** GET /api/tickets/:id — one customer's live position */
export const getTicketStatus = async (id) => {
  const res = await fetch(`${BASE}/api/tickets/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ticket not found");
  return data.ticket;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /api/auth/verify — validate admin PIN before loading dashboard */
export const verifyPin = async (pin) => {
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ pin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid PIN");
  return data;
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/** GET /api/tickets/admin — full queue with full names */
export const getAdminQueue = async (pin) => {
  const res = await fetch(`${BASE}/api/tickets/admin`, {
    headers: authHeaders(pin),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch admin queue");
  return data.queue;
};

/** PATCH /api/tickets/call-next — pull next waiting ticket to in-progress */
export const callNext = async (pin) => {
  const res = await fetch(`${BASE}/api/tickets/call-next`, {
    method: "PATCH",
    headers: authHeaders(pin),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to call next");
  return data;
};

/** PATCH /api/tickets/:id/done — mark a ticket done */
export const markDone = async (id, pin) => {
  const res = await fetch(`${BASE}/api/tickets/${id}/done`, {
    method: "PATCH",
    headers: authHeaders(pin),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark done");
  return data;
};