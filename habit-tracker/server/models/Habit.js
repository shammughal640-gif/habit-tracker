// server/models/Habit.js
// ─────────────────────────────────────────────────────────────
// Mongoose schema for a Habit document.
//
// Each habit belongs to one user (via ObjectId ref).
// Fields cover title, description, frequency, category,
// a display color, and an active/archived flag.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast lookup by user
    },

    // ── Core Fields ────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Habit title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // ── Scheduling ─────────────────────────────────────────
    frequency: {
      type: String,
      enum: {
        values: ["daily", "weekly", "monthly"],
        message: "Frequency must be daily, weekly, or monthly",
      },
      default: "daily",
    },

    // ── Category ───────────────────────────────────────────
    category: {
      type: String,
      enum: {
        values: [
          "health",
          "fitness",
          "work",
          "learning",
          "mindfulness",
          "nutrition",
          "social",
          "finance",
          "other",
        ],
        message: "Invalid category",
      },
      default: "other",
    },

    // ── Display ────────────────────────────────────────────
    // Hex color used to visually distinguish habits in the UI
    color: {
      type: String,
      default: "#6c63ff",
      match: [/^#([A-Fa-f0-9]{6})$/, "Color must be a valid hex code (e.g. #6c63ff)"],
    },

    // Emoji icon for quick visual identification
    icon: {
      type: String,
      default: "✅",
      maxlength: [10, "Icon cannot exceed 10 characters"],
    },

    // ── Status ─────────────────────────────────────────────
    // false = archived; filtered out of the default list view
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Compound index ────────────────────────────────────────────
// Speeds up the common query: "all active habits for this user"
habitSchema.index({ user: 1, isActive: 1 });

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;
