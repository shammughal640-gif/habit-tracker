// src/services/authService.js
// ─────────────────────────────────────────────────────────────
// All API calls related to authentication live here.
// Components and context import from this file — never call
// axios/api directly from UI components.
// ─────────────────────────────────────────────────────────────

import api from "./api.js";

const authService = {
  /**
   * Register a new user.
   * @param {{ name, email, password, confirmPassword }} data
   * @returns {Promise<{ token, user }>}
   */
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Log in with email and password.
   * @param {{ email, password }} credentials
   * @returns {Promise<{ token, user }>}
   */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Fetch the currently authenticated user's profile.
   * Requires a valid JWT in the Authorization header (handled by interceptor).
   * @returns {Promise<{ user }>}
   */
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  /**
   * Log out by removing auth data from localStorage.
   * (Stateless JWT — no server call needed.)
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
