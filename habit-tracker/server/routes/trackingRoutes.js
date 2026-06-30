// server/routes/trackingRoutes.js
// ─────────────────────────────────────────────────────────────
// All tracking endpoints are protected by JWT.
//
//   GET    /api/tracking/today              → getTodayStatus
//   POST   /api/tracking/:habitId/complete  → markComplete
//   DELETE /api/tracking/:habitId/complete  → unmarkComplete
//   GET    /api/tracking/:habitId/history   → getHistory
//
// IMPORTANT: /today must be defined BEFORE /:habitId routes
// otherwise Express matches "today" as a habitId param.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  markComplete,
  unmarkComplete,
  getTodayStatus,
  getHistory,
} from "../controllers/trackingController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

// Apply JWT protection to all routes
router.use(protect);

// Static route first — must come before /:habitId
router.get("/today", getTodayStatus);

// Dynamic routes
router.post("/:habitId/complete",   markComplete);
router.delete("/:habitId/complete", unmarkComplete);
router.get("/:habitId/history",     getHistory);

export default router;
