// client/src/components/tracking/StatsBar.jsx
// ─────────────────────────────────────────────────────────────
// Displays a summary progress bar for today's habits.
// Shows total, completed, and pending counts with a visual bar.
// ─────────────────────────────────────────────────────────────

const StatsBar = ({ stats }) => {
  const { total, completed, pending, date } = stats;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Friendly date display: "Today — Monday, Jan 15"
  const friendlyDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month:   "short",
        day:     "numeric",
      })
    : "";

  // Pick an emoji based on progress
  const getMoodEmoji = () => {
    if (percentage === 100) return "🎉";
    if (percentage >= 75)   return "🔥";
    if (percentage >= 50)   return "💪";
    if (percentage >= 25)   return "👍";
    return "🌅";
  };

  return (
    <div className="stats-bar">
      {/* ── Header ── */}
      <div className="stats-bar__header">
        <div>
          <h2 className="stats-bar__title">
            {getMoodEmoji()}  Today&apos;s Progress
          </h2>
          <p className="stats-bar__date">{friendlyDate}</p>
        </div>
        <div className="stats-bar__percentage">{percentage}%</div>
      </div>

      {/* ── Progress bar ── */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* ── Counts ── */}
      <div className="stats-bar__counts">
        <div className="stat-pill stat-pill--total">
          <span>{total}</span> Total
        </div>
        <div className="stat-pill stat-pill--done">
          <span>{completed}</span> Done
        </div>
        <div className="stat-pill stat-pill--pending">
          <span>{pending}</span> Pending
        </div>
      </div>

      {/* ── Completion message ── */}
      {percentage === 100 && total > 0 && (
        <div className="stats-bar__congrats">
          🎉 Amazing! You completed all your habits for today!
        </div>
      )}
    </div>
  );
};

export default StatsBar;
