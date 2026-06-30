import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketStatus } from "../api/ticketApi";

const POLL_INTERVAL = 6000; // 6 seconds per spec

export default function MyStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const t = await getTicketStatus(id);
      setTicket(t);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Could not load your status.");
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ── Derived UI state ──────────────────────────────────────────────────────
  const isDone = ticket?.status === "done";
  const isServing = ticket?.status === "in-progress";
  const isWaiting = ticket?.status === "waiting";

  const positionDisplay = () => {
    if (!ticket) return null;
    if (isDone) return null;
    if (isServing) return "You're up";
    if (ticket.position === 0) return "Next";
    return String(ticket.position);
  };

  const positionLabel = () => {
    if (!ticket) return "";
    if (isServing) return "The barber is ready for you";
    if (ticket.position === 0) return "You're next in line";
    return ticket.position === 1
      ? "1 person ahead of you"
      : `${ticket.position} people ahead of you`;
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col px-6 pt-14 pb-10 animate-fade-in">

      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => navigate("/")}
          className="text-xs font-medium tracking-[0.15em] text-charcoal-500 uppercase mb-4 inline-block"
        >
          ← QueuedIn
        </button>
        <h1 className="text-2xl font-light text-cream">
          Hey, {ticket?.firstName || "..."}
        </h1>
        <p className="text-sm text-charcoal-500 mt-1">Your live queue status</p>
      </div>

      {/* Main status card */}
      {error ? (
        <div className="bg-charcoal-800 rounded-3xl p-8 border border-red-900/40 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-4 text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : isDone ? (
        /* ── Done state ── */
        <div className="bg-charcoal-800 rounded-3xl p-8 border border-charcoal-600/40 text-center animate-slide-up">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-xl font-medium text-cream mb-2">All done!</h2>
          <p className="text-charcoal-500 text-sm">
            Thanks for visiting. See you next time.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 w-full py-4 bg-gold-400 text-charcoal-950 rounded-2xl font-medium text-sm active:scale-95 transition-transform"
          >
            Back to home
          </button>
        </div>
      ) : (
        /* ── Waiting / serving state ── */
        <div
          className={`
            rounded-3xl p-8 border text-center animate-slide-up
            ${isServing
              ? "bg-charcoal-700 border-gold-400/50"
              : "bg-charcoal-800 border-charcoal-600/40"
            }
          `}
        >
          {/* Big position number */}
          {ticket ? (
            <div
              className={`
                text-8xl font-light mb-2 leading-none
                ${isServing || ticket.position === 0
                  ? "gold-shimmer"
                  : "text-cream"
                }
              `}
            >
              {positionDisplay()}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          )}

          <p className="text-charcoal-500 text-sm mt-2 mb-8">
            {ticket ? positionLabel() : "Fetching your position..."}
          </p>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-900/60">
            <span
              className={`w-2 h-2 rounded-full live-dot ${
                isServing ? "bg-gold-400" : "bg-green-500"
              }`}
            />
            <span className="text-xs text-charcoal-500">
              {isServing ? "In progress" : "Live · updates every 6s"}
            </span>
          </div>
        </div>
      )}

      {/* Info strip */}
      {!isDone && ticket && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-600/30">
            <p className="text-xs text-charcoal-500 mb-1">Status</p>
            <p className="text-cream text-sm font-medium capitalize">
              {ticket.status === "in-progress" ? "Being served" : ticket.status}
            </p>
          </div>
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-600/30">
            <p className="text-xs text-charcoal-500 mb-1">Joined at</p>
            <p className="text-cream text-sm font-medium">
              {new Date(ticket.joined_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      {/* View full queue */}
      {isWaiting && (
        <button
          onClick={() => navigate("/queue")}
          className="mt-4 w-full py-4 rounded-2xl border border-charcoal-600/50 text-cream text-sm font-medium active:scale-95 transition-transform"
        >
          View full queue
        </button>
      )}

      {/* Last updated */}
      {lastUpdated && !isDone && (
        <p className="mt-auto pt-8 text-center text-xs text-charcoal-600">
          Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      )}
    </div>
  );
}