import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicQueue } from "../api/ticketApi";
import QueueTicket from "../components/QueueTicket";

const POLL_INTERVAL = 6000;

export default function PublicQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchQueue = useCallback(async () => {
    try {
      const q = await getPublicQueue();
      setQueue(q);
      setError("");
    } catch (err) {
      setError("Could not load queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col px-6 pt-14 pb-10 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/")}
            className="text-xs font-medium tracking-[0.15em] text-charcoal-500 hover:text-charcoal-300 uppercase mb-2 inline-block transition-colors cursor-pointer"
          >
            ← QueuedIn
          </button>
          <h1 className="text-2xl font-light text-cream">Live queue</h1>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-800 border border-charcoal-600/40">
          <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
          <span className="text-xs text-charcoal-500">Live</span>
        </div>
      </div>

      {/* Queue count pill */}
      {!loading && !error && (
        <div className="mb-5">
          <span className="text-xs font-medium tracking-widest uppercase text-charcoal-500">
            {queue.length === 0
              ? "Queue is empty"
              : `${queue.length} ${queue.length === 1 ? "person" : "people"} in queue`}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-charcoal-800 rounded-2xl p-6 text-center border border-red-900/30">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchQueue}
            className="mt-3 text-sm text-gold-400 font-medium hover:text-gold-300 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center mb-4 text-2xl">
            ✂
          </div>
          <p className="text-cream font-medium mb-1">No one waiting</p>
          <p className="text-charcoal-500 text-sm">Walk right in — you're next!</p>
          <button
            onClick={() => navigate("/")}
            className="
              mt-8 px-6 py-3 bg-gold-400 text-charcoal-950 rounded-xl text-sm font-semibold
              shadow-[0_3px_12px_rgba(232,204,122,0.35)]
              hover:bg-gold-300 hover:shadow-[0_5px_18px_rgba(232,204,122,0.5)]
              active:scale-95 transition-all duration-150 cursor-pointer
            "
          >
            Join queue
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-slide-up">
          {queue.map((ticket) => (
            <QueueTicket
              key={ticket.id}
              name={ticket.firstName}
              position={ticket.position}
              status={ticket.status}
              isAdmin={false}
            />
          ))}
        </div>
      )}

      {/* Join CTA — narrower centered pill, shadow + lift so it's unmistakably a button */}
      {!loading && queue.length > 0 && (
        <button
          onClick={() => navigate("/")}
          className="
            mt-6 mx-auto px-10 py-3.5 bg-gold-400 text-charcoal-950 rounded-full text-sm font-semibold
            flex items-center justify-center
            shadow-[0_4px_16px_rgba(232,204,122,0.35)]
            hover:bg-gold-300 hover:shadow-[0_6px_22px_rgba(232,204,122,0.5)] hover:-translate-y-0.5
            active:translate-y-0 active:scale-[0.97] active:shadow-none
            transition-all duration-150 cursor-pointer
          "
        >
          Join queue
        </button>
      )}

      <p className="mt-auto pt-8 text-center text-xs text-charcoal-600">
        Updates every 6 seconds
      </p>
    </div>
  );
}