// middleware/authMiddleware.js
// ─────────────────────────────────────────────────────────────
// Protects private routes by verifying the JWT sent in the
// Authorization header (Bearer token pattern).
//
// Usage: add `protect` as a middleware on any route that
//        requires an authenticated user.
//
//   router.get("/profile", protect, getUserProfile);
// ─────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // ── 1. Extract the token from the Authorization header ────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1]; // "Bearer <token>" → "<token>"
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // ── 2. Verify & decode the token ──────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 3. Attach the authenticated user to the request ───
    // We re-query the DB to get a fresh user object (in case the account
    // was deleted or deactivated after the token was issued).
    // The password field is excluded via `select("-password")`.
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    next(); // ✅ Token is valid — continue to the route handler
  } catch (error) {
    // Handle specific JWT errors with clear messages
    let message = "Invalid token. Please log in again.";
    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    }

    return res.status(401).json({ success: false, message });
  }
};

export default protect;
