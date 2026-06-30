import React, { useState, useEffect, useCallback } from "react";
import { verifyPin, getAdminQueue, callNext, markDone } from "../api/ticketApi";
import QueueTicket from "../components/QueueTicket";

const POLL_INTERVAL = 6000;

// ─── PIN Gate screen ──────────────────────────────────────────────────────────
function PinGate({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyPin(pin);
      onSuccess(pin);
    } catch {
      setError("Incorrect PIN. Try again.");
      setPin("");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-[0.2em] text-charcoal-500 uppercase mb-1">
            QueuedIn
          </p>
          <h1 className="text-3xl font-light text-cream">
            Barber access
          </h1>
          <p className="text-charcoal-500 text-sm mt-2">
            Enter your admin PIN to continue
          </p>
        </div>

        {/* PIN input — large, thumb-friendly */}
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="• • • •"
          autoFocus
          className="
            w-full bg-charcoal-800 border border-charcoal-600/50 rounded-2xl
            px-5 py-5 text-cream text-2xl text-center tracking-[0.4em]
            placeholder-charcoal-600
            focus:outline-none focus:border-gold-400/60
            transition-all duration-200
          "
        />

        {error && (
          <p className="mt-3 text-sm text-red-400 text-center animate-fade-in">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`
            mt-4 w-full py-5 rounded-2xl text-base font-medium tracking-wide
            transition-all duration-200 active:scale-[0.98]
            ${loading
              ? "bg-charcoal-700 text-charcoal-500 cursor-not-allowed"
              : "bg-gold-400 text-charcoal-950 hover:bg-gold-300"
            }
          `}
        >
          {loading ? "Verifying..." : "Unlock"}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard screen ─────────────────────────────────────────────────────────
function Dashboard({ pin, onLock }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchQueue = useCallback(async () => {
    try {
      const q = await getAdminQueue(pin);
      setQueue(q);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load queue.");
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await callNext(pin);
      await fetchQueue();
    } catch (err) {
      setActionError(err.message || "Could not call next.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDone = async (id) => {
    setActionLoading(true);
    setActionError("");
    try {
      await markDone(id, pin);
      await fetchQueue();
    } catch (err) {
      setActionError(err.message || "Could not mark as done.");
    } finally {
      setActionLoading(false);
    }
  };

  const inProgress = queue.find((t) => t.status === "in-progress");
  const waiting = queue.filter((t) => t.status === "waiting");

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col px-6 pt-14 pb-10 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] text-charcoal-500 uppercase mb-1">
            QueuedIn
          </p>
          <h1 className="text-2xl font-light text-cream">Dashboard</h1>
        </div>

        <button
          onClick={onLock}
          className="text-xs text-charcoal-500 hover:text-cream transition-colors px-3 py-1.5 rounded-lg border border-charcoal-600/40"
        >
          Lock
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-600/30">
          <p className="text-xs text-charcoal-500 mb-1">Waiting</p>
          <p className="text-2xl font-light text-cream">{waiting.length}</p>
        </div>
        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-600/30">
          <p className="text-xs text-charcoal-500 mb-1">In chair</p>
          <p className="text-2xl font-light text-cream">
            {inProgress ? (
              <span className="gold-shimmer">1</span>
            ) : (
              "0"
            )}
          </p>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-950/40 border border-red-900/40 rounded-xl">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {/* Call Next button */}
      {!inProgress && (
        <button
          onClick={handleCallNext}
          disabled={actionLoading || waiting.length === 0}
          className={`
            w-full py-5 rounded-2xl text-base font-medium tracking-wide mb-6
            transition-all duration-200 active:scale-[0.98]
            ${actionLoading || waiting.length === 0
              ? "bg-charcoal-700 text-charcoal-500 cursor-not-allowed"
              : "bg-gold-400 text-charcoal-950 hover:bg-gold-300"
            }
          `}
        >
          {actionLoading
            ? "Loading..."
            : waiting.length === 0
            ? "Queue is empty"
            : "Call next"}
        </button>
      )}

      {/* Queue list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-charcoal-800 rounded-2xl p-6 text-center border border-red-900/30">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchQueue} className="mt-3 text-sm text-gold-400">
            Retry
          </button>
        </div>
      ) : queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center mb-4 text-2xl">
            ✂
          </div>
          <p className="text-cream font-medium mb-1">All clear</p>
          <p className="text-charcoal-500 text-sm">No one in the queue right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-slide-up">
          {/* Section label */}
          {inProgress && (
            <p className="text-xs font-medium tracking-widest uppercase text-gold-400/80 px-1">
              In chair
            </p>
          )}
          {queue.map((ticket) => (
            <QueueTicket
              key={ticket.id}
              name={ticket.name}
              position={ticket.position}
              status={ticket.status}
              isAdmin={true}
              loading={actionLoading}
              onDone={() => handleMarkDone(ticket.id)}
            />
          ))}
          {waiting.length > 0 && (
            <p className="text-xs font-medium tracking-widest uppercase text-charcoal-500 px-1 mt-2">
              Waiting · {waiting.length}
            </p>
          )}
        </div>
      )}

      {/* Live indicator */}
      <div className="mt-auto pt-8 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
        <span className="text-xs text-charcoal-600">Live · updates every 6s</span>
      </div>
    </div>
  );
}

// ─── AdminDashboard — composes PIN gate + dashboard ───────────────────────────
export default function AdminDashboard() {
  const [pin, setPin] = useState(null);

  if (!pin) {
    return <PinGate onSuccess={(p) => setPin(p)} />;
  }

  return <Dashboard pin={pin} onLock={() => setPin(null)} />;
}