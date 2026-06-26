// models/User.js
// ─────────────────────────────────────────────────────────────
// Mongoose schema for the User document.
//
// Responsibilities:
//   • Define the shape and validation rules for a user record.
//   • Hash the password BEFORE saving (pre-save hook) — never store plain text.
//   • Expose a helper method to safely compare plain-text passwords at login.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,        // Enforces unique index in MongoDB
      lowercase: true,     // Always store emails in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return the password field in queries by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// ── Pre-save Hook ─────────────────────────────────────────────
// Runs automatically before every .save() call.
// Skips hashing if the password field has not been modified (e.g. profile updates).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 12; // Higher = more secure but slower; 12 is a solid balance
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ── Instance Method ───────────────────────────────────────────
// Compares a plain-text candidate password against the stored hash.
// Usage: const isMatch = await user.comparePassword(candidatePwd);
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
