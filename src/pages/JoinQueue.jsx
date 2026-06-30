import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinQueue } from "../api/ticketApi";

export default function JoinQueue() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }
    if (trimmed.length > 50) {
      setError("Name must be 50 characters or fewer.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ticket = await joinQueue(trimmed);
      navigate(`/status/${ticket.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col px-6 pt-16 pb-10 animate-fade-in">

      {/* Logo / wordmark */}
      <div className="mb-12">
        <p className="text-xs font-medium tracking-[0.2em] text-charcoal-500 uppercase mb-1">
          Welcome to
        </p>
        <h1 className="text-4xl font-light text-cream tracking-tight">
          Queued<span className="gold-shimmer font-medium">In</span>
        </h1>
      </div>

      {/* Main card */}
      <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-600/40">
        <h2 className="text-lg font-medium text-cream mb-1">
          Join the queue
        </h2>
        <p className="text-sm text-charcoal-500 mb-6">
          Enter your name and we'll hold your spot.
        </p>

        <label className="block text-xs font-medium tracking-widest uppercase text-charcoal-500 mb-2">
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Marcus"
          maxLength={50}
          autoFocus
          className="
            w-full bg-charcoal-900 border border-charcoal-600/50 rounded-xl
            px-4 py-4 text-cream text-base placeholder-charcoal-600
            focus:outline-none focus:border-gold-400/60 focus:bg-charcoal-800
            transition-all duration-200
          "
        />

        {error && (
          <p className="mt-3 text-sm text-red-400 animate-fade-in">{error}</p>
        )}
      </div>

      {/* CTA button */}
      <button
        onClick={handleSubmit}
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
        {loading ? "Joining..." : "Join queue"}
      </button>

      {/* View full queue link */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/queue")}
          className="text-sm text-charcoal-500 hover:text-cream transition-colors duration-200"
        >
          View live queue →
        </button>
      </div>

      {/* Bottom hint */}
      <p className="mt-auto pt-10 text-center text-xs text-charcoal-600">
        Walk-ins only · No account needed
      </p>
    </div>
  );
}