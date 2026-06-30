// server/models/HabitLog.js
// ─────────────────────────────────────────────────────────────
// Stores one record every time a user marks a habit as complete.
//
// Key design decisions:
//   • `completedDate` stores ONLY the date (YYYY-MM-DD string)
//     so we can easily query "all logs for today" without
//     worrying about time zones or hours.
//   • A compound unique index on (habit + user + completedDate)
//     prevents duplicate completions for the same habit on the
//     same day.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Date ───────────────────────────────────────────────
    // Stored as "YYYY-MM-DD" string for simple daily queries
    // e.g. "2024-01-15"
    completedDate: {
      type: String,
      required: true,
    },

    // ── Optional note ──────────────────────────────────────
    note: {
      type: String,
      trim: true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true, // createdAt = exact time of completion
  }
);

// ── Unique constraint ─────────────────────────────────────────
// One completion per habit per user per day — no duplicates
habitLogSchema.index(
  { habit: 1, user: 1, completedDate: 1 },
  { unique: true }
);

// ── Index for fast history queries ────────────────────────────
habitLogSchema.index({ habit: 1, user: 1, completedDate: -1 });

const HabitLog = mongoose.model("HabitLog", habitLogSchema);
export default HabitLog;
