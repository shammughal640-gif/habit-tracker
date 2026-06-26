// routes/authRoutes.js
// ─────────────────────────────────────────────────────────────
// Maps HTTP endpoints to the corresponding controller functions.
// Thin layer — no business logic lives here.
//
//   POST   /api/auth/register  → registerUser
//   POST   /api/auth/login     → loginUser
//   GET    /api/auth/profile   → getUserProfile  (protected)
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes — `protect` middleware verifies the JWT first
router.get("/profile", protect, getUserProfile);

export default router;
