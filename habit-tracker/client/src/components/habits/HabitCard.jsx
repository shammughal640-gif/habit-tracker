// client/src/components/habits/HabitCard.jsx
// ─────────────────────────────────────────────────────────────
// Displays a single habit with its details.
// Provides Edit and Delete action buttons.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { CATEGORIES } from "./HabitForm.jsx";

const HabitCard = ({ habit, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the category label and icon
  const categoryInfo = CATEGORIES.find((c) => c.value === habit.category) || {
    label: "Other",
    icon: "✨",
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${habit.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await onDelete(habit._id);
    } catch {
      setIsDeleting(false);
    }
  };

  // Format the date nicely
  const createdDate = new Date(habit.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="habit-card" style={{ borderTopColor: habit.color }}>
      {/* ── Header ── */}
      <div className="habit-card__header">
        <div className="habit-card__icon" style={{ backgroundColor: `${habit.color}20` }}>
          <span>{habit.icon}</span>
        </div>
        <div className="habit-card__meta">
          <span
            className="habit-card__category"
            style={{ color: habit.color, backgroundColor: `${habit.color}15` }}
          >
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          <span className="habit-card__frequency">{habit.frequency}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="habit-card__body">
        <h3 className="habit-card__title">{habit.title}</h3>
        {habit.description && (
          <p className="habit-card__description">{habit.description}</p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="habit-card__footer">
        <span className="habit-card__date">Since {createdDate}</span>
        <div className="habit-card__actions">
          <button
            className="action-btn action-btn--edit"
            onClick={() => onEdit(habit)}
            title="Edit habit"
          >
            ✏️
          </button>
          <button
            className="action-btn action-btn--delete"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete habit"
          >
            {isDeleting ? "…" : "🗑️"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
