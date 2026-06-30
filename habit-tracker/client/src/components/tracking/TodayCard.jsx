// client/src/components/tracking/TodayCard.jsx
// ─────────────────────────────────────────────────────────────
// Displays a habit in the Today's Tracking view.
// Shows a complete / undo button and completion state.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

const TodayCard = ({ habit, onMarkDone, onMarkUndone }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (habit.completedToday) {
        await onMarkUndone(habit._id);
      } else {
        await onMarkDone(habit._id);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`today-card ${habit.completedToday ? "today-card--done" : ""}`}
      style={{ borderLeftColor: habit.color }}
    >
      {/* ── Left: icon + info ── */}
      <div className="today-card__left">
        <div
          className="today-card__icon"
          style={{ backgroundColor: `${habit.color}20` }}
        >
          {habit.completedToday ? "✅" : habit.icon}
        </div>
        <div className="today-card__info">
          <h3 className="today-card__title">{habit.title}</h3>
          <div className="today-card__meta">
            <span
              className="today-card__category"
              style={{ color: habit.color }}
            >
              {habit.category}
            </span>
            <span className="today-card__dot">·</span>
            <span className="today-card__freq">{habit.frequency}</span>
          </div>
        </div>
      </div>

      {/* ── Right: toggle button ── */}
      <button
        className={`toggle-btn ${habit.completedToday ? "toggle-btn--done" : "toggle-btn--pending"}`}
        onClick={handleToggle}
        disabled={isToggling}
        title={habit.completedToday ? "Undo completion" : "Mark as complete"}
      >
        {isToggling ? (
          <span className="btn-spinner" style={{ borderTopColor: habit.completedToday ? "#fff" : habit.color }} />
        ) : habit.completedToday ? (
          "✓ Done"
        ) : (
          "Mark Done"
        )}
      </button>
    </div>
  );
};

export default TodayCard;
