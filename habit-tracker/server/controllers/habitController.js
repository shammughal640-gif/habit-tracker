// server/controllers/habitController.js
// ─────────────────────────────────────────────────────────────
// All business logic for Habit CRUD operations.
//
// Every route is protected — req.user is guaranteed to be set
// by the `protect` middleware before any function here runs.
//
// Exported functions:
//   createHabit   →  POST   /api/habits
//   getHabits     →  GET    /api/habits
//   getHabitById  →  GET    /api/habits/:id
//   updateHabit   →  PUT    /api/habits/:id
//   deleteHabit   →  DELETE /api/habits/:id
// ─────────────────────────────────────────────────────────────

import Habit from "../models/Habit.js";

// ─────────────────────────────────────────────────────────────
// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
// ─────────────────────────────────────────────────────────────
export const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, category, color, icon } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Habit title is required.",
      });
    }

    // ── Create ────────────────────────────────────────────
    // Attach the authenticated user's ID automatically
    const habit = await Habit.create({
      user: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      frequency: frequency || "daily",
      category: category || "other",
      color: color || "#6c63ff",
      icon: icon || "✅",
    });

    res.status(201).json({
      success: true,
      message: "Habit created successfully.",
      habit,
    });
  } catch (error) {
    console.error("Create Habit Error:", error);

    // Mongoose validation error — send readable messages
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating habit.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all habits for the logged-in user
// @route   GET /api/habits
// @access  Private
//
// Query params (all optional):
//   ?category=health      filter by category
//   ?frequency=daily      filter by frequency
//   ?isActive=true/false  include archived habits
// ─────────────────────────────────────────────────────────────
export const getHabits = async (req, res) => {
  try {
    const { category, frequency, isActive } = req.query;

    // ── Build filter ──────────────────────────────────────
    const filter = { user: req.user._id };

    // By default show only active habits unless explicitly asked for archived
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    } else {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (frequency) filter.frequency = frequency;

    // ── Query ─────────────────────────────────────────────
    const habits = await Habit.find(filter).sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    console.error("Get Habits Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching habits.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single habit by ID
// @route   GET /api/habits/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found.",
      });
    }

    // ── Ownership check ───────────────────────────────────
    // Prevent users from accessing each other's habits
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this habit.",
      });
    }

    res.status(200).json({ success: true, habit });
  } catch (error) {
    console.error("Get Habit By ID Error:", error);

    // Invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid habit ID." });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching habit.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found.",
      });
    }

    // ── Ownership check ───────────────────────────────────
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this habit.",
      });
    }

    // ── Allowed fields to update ──────────────────────────
    // Only pick fields explicitly allowed — never let the client
    // overwrite `user` or internal fields
    const allowedFields = [
      "title",
      "description",
      "frequency",
      "category",
      "color",
      "icon",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        habit[field] = req.body[field];
      }
    });

    const updatedHabit = await habit.save(); // Triggers Mongoose validation

    res.status(200).json({
      success: true,
      message: "Habit updated successfully.",
      habit: updatedHabit,
    });
  } catch (error) {
    console.error("Update Habit Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid habit ID." });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating habit.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found.",
      });
    }

    // ── Ownership check ───────────────────────────────────
    if (habit.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this habit.",
      });
    }

    await habit.deleteOne();

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Habit Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid habit ID." });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting habit.",
    });
  }
};
