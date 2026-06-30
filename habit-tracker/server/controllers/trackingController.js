// server/controllers/trackingController.js
// ─────────────────────────────────────────────────────────────
// Handles habit completion tracking.
//
// Exported functions:
//   markComplete    → POST   /api/tracking/:habitId/complete
//   unmarkComplete  → DELETE /api/tracking/:habitId/complete
//   getTodayStatus  → GET    /api/tracking/today
//   getHistory      → GET    /api/tracking/:habitId/history
// ─────────────────────────────────────────────────────────────

import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";

// ── Helper ────────────────────────────────────────────────────
// Returns today's date as a "YYYY-MM-DD" string in local time.
// Used consistently across all functions so dates always match.
const getTodayString = () => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────────────────────
// @desc    Mark a habit as complete for today
// @route   POST /api/tracking/:habitId/complete
// @access  Private
// ─────────────────────────────────────────────────────────────
export const markComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { note = "" } = req.body;
    const today = getTodayString();

    // ── Verify habit exists and belongs to this user ───────
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found." });
    }
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // ── Create log (unique index prevents duplicates) ──────
    const log = await HabitLog.create({
      habit:         habitId,
      user:          req.user._id,
      completedDate: today,
      note:          note.trim(),
    });

    res.status(201).json({
      success: true,
      message: `"${habit.title}" marked as complete for today! 🎉`,
      log,
    });
  } catch (error) {
    // Duplicate key error = already marked complete today
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This habit is already marked as complete for today.",
      });
    }
    console.error("Mark Complete Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Unmark a habit (undo today's completion)
// @route   DELETE /api/tracking/:habitId/complete
// @access  Private
// ─────────────────────────────────────────────────────────────
export const unmarkComplete = async (req, res) => {
  try {
    const { habitId } = req.params;
    const today = getTodayString();

    // ── Verify ownership via the habit ────────────────────
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found." });
    }
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // ── Delete today's log ────────────────────────────────
    const result = await HabitLog.findOneAndDelete({
      habit:         habitId,
      user:          req.user._id,
      completedDate: today,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No completion found for today.",
      });
    }

    res.status(200).json({
      success: true,
      message: `"${habit.title}" unmarked for today.`,
    });
  } catch (error) {
    console.error("Unmark Complete Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get today's completion status for ALL user habits
// @route   GET /api/tracking/today
// @access  Private
//
// Returns an array of habit objects each with a `completedToday`
// boolean so the frontend knows which to show as done.
// ─────────────────────────────────────────────────────────────
export const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayString();

    // ── Fetch all active habits for this user ─────────────
    const habits = await Habit.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 });

    // ── Fetch today's logs for this user ──────────────────
    const todayLogs = await HabitLog.find({
      user:          req.user._id,
      completedDate: today,
    });

    // Build a Set of completed habit IDs for O(1) lookup
    const completedHabitIds = new Set(
      todayLogs.map((log) => log.habit.toString())
    );

    // ── Merge: add completedToday flag to each habit ──────
    const habitsWithStatus = habits.map((habit) => ({
      ...habit.toObject(),
      completedToday: completedHabitIds.has(habit._id.toString()),
    }));

    res.status(200).json({
      success: true,
      date:    today,
      total:   habits.length,
      completed: todayLogs.length,
      pending:   habits.length - todayLogs.length,
      habits:  habitsWithStatus,
    });
  } catch (error) {
    console.error("Today Status Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get completion history for a specific habit
// @route   GET /api/tracking/:habitId/history
// @access  Private
//
// Query params:
//   ?limit=30   (default 30, max 90)
// ─────────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const { habitId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 30, 90);

    // ── Verify ownership ──────────────────────────────────
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found." });
    }
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    // ── Fetch logs newest first ───────────────────────────
    const logs = await HabitLog.find({ habit: habitId, user: req.user._id })
      .sort({ completedDate: -1 })
      .limit(limit);

    // ── Build a sorted list of completed dates ────────────
    const completedDates = logs.map((l) => l.completedDate);

    res.status(200).json({
      success: true,
      habit: {
        _id:   habit._id,
        title: habit.title,
        icon:  habit.icon,
        color: habit.color,
      },
      totalCompletions: logs.length,
      completedDates,
      logs,
    });
  } catch (error) {
    console.error("History Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid habit ID." });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};
