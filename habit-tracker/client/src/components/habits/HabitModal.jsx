// client/src/components/habits/HabitModal.jsx
// ─────────────────────────────────────────────────────────────
// Modal overlay that wraps HabitForm for create / edit flows.
// Closes when clicking outside the modal card or pressing Escape.
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import HabitForm from "./HabitForm.jsx";

const HabitModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const isEdit = Boolean(initialData);

  // ── Close on Escape key ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isLoading, onClose]);

  // ── Prevent scroll on body when modal is open ─────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Close only when clicking the dark backdrop — not the modal card
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card">
        {/* ── Header ── */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? "✏️  Edit Habit" : "✅  New Habit"}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Form ── */}
        <HabitForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default HabitModal;
