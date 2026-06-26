// src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────
// User registration form.
//
// Fields: Name, Email, Password, Confirm Password
// Features:
//   • Client-side validation before the API call
//   • Real-time error clearing as the user types
//   • Loading state with disabled inputs during submission
//   • Redirects to /dashboard on success
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ── Form State ───────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── Brand Header ── */}
        <div className="auth-header">
          <div className="auth-logo">✅</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start building better habits today</p>
        </div>

        {/* ── Global API Error ── */}
        {apiError && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            {apiError}
          </div>
        )}

        {/* ── Form ── */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className={`form-group ${errors.name ? "has-error" : ""}`}>
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              placeholder="Ali Hassan"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={isLoading}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`form-group ${errors.password ? "has-error" : ""}`}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div
            className={`form-group ${errors.confirmPassword ? "has-error" : ""}`}
          >
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`btn btn-primary btn-full ${isLoading ? "btn-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
