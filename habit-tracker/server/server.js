// server.js
// ─────────────────────────────────────────────────────────────
// Application entry point.
//
// Responsibilities:
//   • Load environment variables (must be first)
//   • Connect to MongoDB
//   • Configure Express (JSON parsing, CORS, security headers)
//   • Mount API route groups
//   • Start the HTTP server
// ─────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });// Load .env variables into process.env
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────

// CORS — allow requests from the React dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json({ limit: "10kb" })); // Limit body size to prevent abuse

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Health Check ──────────────────────────────────────────────
// Quick endpoint to verify the server is running (useful in CI / deployment)
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Habit Tracker API is running 🚀",
    environment: process.env.NODE_ENV,
  });
});

// ── 404 Handler ───────────────────────────────────────────────
// Catch any routes that don't match the definitions above
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global Error Handler ──────────────────────────────────────
// Catches errors passed via next(error) from any route/middleware
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
  );
});
