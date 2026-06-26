// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Axios instance shared across all service files.
//
// • Sets the base URL so individual service calls don't repeat it.
// • Request interceptor attaches the JWT token (if present in
//   localStorage) to every outgoing request automatically.
// • Response interceptor handles 401s globally (e.g. redirect to login).
// ─────────────────────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Vite proxy forwards this to http://localhost:5000/api
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────
// Attach the Bearer token from localStorage before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Handle 401 Unauthorized globally (expired / invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
