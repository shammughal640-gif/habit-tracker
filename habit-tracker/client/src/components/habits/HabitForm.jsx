// client/src/components/habits/HabitForm.jsx
// ─────────────────────────────────────────────────────────────
// Reusable form for both creating and editing a habit.
// When `initialData` is passed → edit mode.
// When empty              → create mode.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

// ── Constants ─────────────────────────────────────────────────
export const CATEGORIES = [
  { value: "health",      label: "Health",      icon: "❤️" },
  { value: "fitness",     label: "Fitness",     icon: "💪" },
  { value: "work",        label: "Work",        icon: "💼" },
  { value: "learning",    label: "Learning",    icon: "📚" },
  { value: "mindfulness", label: "Mindfulness", icon: "🧘" },
  { value: "nutrition",   label: "Nutrition",   icon: "🥗" },
  { value: "social",      label: "Social",      icon: "👥" },
  { value: "finance",     label: "Finance",     icon: "💰" },
  { value: "other",       label: "Other",       icon: "✨" },
];

export const FREQUENCIES = [
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const PRESET_COLORS = [
  "#6c63ff", "#f87171", "#34d399", "#fbbf24",
  "#60a5fa", "#f472b6", "#a78bfa", "#2dd4bf",
];

const PRESET_ICONS = ["✅", "💪", "📚", "🧘", "💧", "🏃", "🎯", "⭐", "🔥", "💡"];

// ── Component ─────────────────────────────────────────────────
const HabitForm = ({ initialData = null, onSubmit, onCancel, isLoading }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    title:       initialData?.title       || "",
    description: initialData?.description || "",
    frequency:   initialData?.frequency   || "daily",
    category:    initialData?.category    || "other",
    color:       initialData?.color       || "#6c63ff",
    icon:        initialData?.icon        || "✅",
  });

  const [errors, setErrors] = useState({});

  // ── Handlers ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    else if (formData.title.trim().length < 2) newErrors.title = "Title must be at least 2 characters.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <form className="habit-form" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div className={`form-group ${errors.title ? "has-error" : ""}`}>
        <label className="form-label">Title *</label>
        <input
          type="text"
          name="title"
          className="form-input"
          placeholder="e.g. Morning Run"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="form-input form-textarea"
          placeholder="Optional details about this habit..."
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Frequency + Category side by side */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select
            name="frequency"
            className="form-input form-select"
            value={formData.frequency}
            onChange={handleChange}
            disabled={isLoading}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-input form-select"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Icon Picker */}
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div className="icon-picker">
          {PRESET_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`icon-btn ${formData.icon === emoji ? "icon-btn--active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, icon: emoji }))}
              disabled={isLoading}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div className="form-group">
        <label className="form-label">Color</label>
        <div className="color-picker">
          {PRESET_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              className={`color-btn ${formData.color === hex ? "color-btn--active" : ""}`}
              style={{ backgroundColor: hex }}
              onClick={() => setFormData((prev) => ({ ...prev, color: hex }))}
              disabled={isLoading}
              aria-label={hex}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? "btn-loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <><span className="btn-spinner" /> {isEdit ? "Saving…" : "Creating…"}</>
          ) : (
            isEdit ? "Save Changes" : "Create Habit"
          )}
        </button>
      </div>
    </form>
  );
};

export default HabitForm;
