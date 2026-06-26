// controllers/authController.js
// ─────────────────────────────────────────────────────────────
// Handles all authentication business logic.
//
// Controllers receive validated requests from routes and
// return structured JSON responses.  No Express-specific
// logic should leak below this layer (that belongs in routes).
//
// Exported functions:
//   registerUser  →  POST /api/auth/register
//   loginUser     →  POST /api/auth/login
//   getUserProfile→  GET  /api/auth/profile  (protected)
// ─────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Helper ────────────────────────────────────────────────────
// Generates a signed JWT containing the user's MongoDB _id.
// The secret and expiry are read from environment variables.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Helper ────────────────────────────────────────────────────
// Returns a clean user object without sensitive fields.
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // ── Duplicate email check ─────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── Create user (password hashed by the pre-save hook) ─
    const user = await User.create({ name, email, password });

    // ── Generate token & respond ──────────────────────────
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ── Find user (explicitly select password for comparison) ─
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    // ── Generic error message prevents user enumeration ───
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Password verification ─────────────────────────────
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Generate token & respond ──────────────────────────
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private (requires valid JWT via `protect` middleware)
// ─────────────────────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the `protect` middleware
    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};
