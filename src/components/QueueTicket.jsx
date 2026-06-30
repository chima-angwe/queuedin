import React from "react";

/**
 * QueueTicket — reusable row for displaying a single ticket.
 * Used in both PublicQueue and AdminDashboard.
 *
 * Props:
 *   name        — string (first name for public, full name for admin)
 *   position    — number (0-based)
 *   status      — "waiting" | "in-progress" | "done"
 *   isAdmin     — bool (shows Done button if true)
 *   onDone      — fn() called when Done is tapped (admin only)
 *   loading     — bool (disables Done button while request in flight)
 */
export default function QueueTicket({
  name,
  position,
  status,
  isAdmin = false,
  onDone,
  loading = false,
}) {
  const isServing = status === "in-progress";

  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300
        ${isServing
          ? "bg-charcoal-700 border border-gold-400/40"
          : "bg-charcoal-800 border border-charcoal-600/50"
        }
      `}
    >
      {/* Position badge */}
      <div
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium shrink-0
          ${isServing
            ? "bg-gold-400/20 text-gold-300"
            : "bg-charcoal-700 text-charcoal-500/80"
          }
        `}
      >
        {isServing ? "✂" : position + 1}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-cream font-medium truncate text-base leading-tight">
          {name}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isServing ? "text-gold-400" : "text-charcoal-500"
          }`}
        >
          {isServing ? "Being served now" : `Position ${position + 1}`}
        </p>
      </div>

      {/* Admin: Done button */}
      {isAdmin && isServing && (
        <button
          onClick={onDone}
          disabled={loading}
          className={`
            shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${loading
              ? "bg-charcoal-600 text-charcoal-500 cursor-not-allowed"
              : "bg-gold-400 text-charcoal-950 active:scale-95 hover:bg-gold-300"
            }
          `}
        >
          {loading ? "..." : "Done"}
        </button>
      )}
    </div>
  );
}