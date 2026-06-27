// server/routes/habitRoutes.js
// ─────────────────────────────────────────────────────────────
// All habit endpoints are protected — every request must carry
// a valid JWT (enforced by the `protect` middleware).
//
//   POST   /api/habits          → createHabit
//   GET    /api/habits          → getHabits
//   GET    /api/habits/:id      → getHabitById
//   PUT    /api/habits/:id      → updateHabit
//   DELETE /api/habits/:id      → deleteHabit
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from "../controllers/habitController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

// Apply `protect` to ALL routes in this file
router.use(protect);

router.route("/").get(getHabits).post(createHabit);

router.route("/:id").get(getHabitById).put(updateHabit).delete(deleteHabit);

export default router;
