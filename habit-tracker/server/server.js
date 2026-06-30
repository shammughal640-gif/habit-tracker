// server/server.js  ← UPDATED for Module 3
// Added: trackingRoutes mounted at /api/tracking

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

import express    from "express";
import cors       from "cors";
import connectDB  from "./config/db.js";
import authRoutes     from "./routes/authRoutes.js";
import habitRoutes    from "./routes/habitRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js"; // ← NEW

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/habits",   habitRoutes);
app.use("/api/tracking", trackingRoutes); // ← NEW

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Habit Tracker API is running 🚀" });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});
