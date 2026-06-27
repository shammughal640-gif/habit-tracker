// client/src/services/habitService.js
// ─────────────────────────────────────────────────────────────
// All API calls related to Habit CRUD operations.
// ─────────────────────────────────────────────────────────────

import api from "./api.js";

const habitService = {
  /**
   * Create a new habit.
   * @param {{ title, description, frequency, category, color, icon }} data
   */
  createHabit: async (data) => {
    const response = await api.post("/habits", data);
    return response.data;
  },

  /**
   * Get all habits for the logged-in user.
   * @param {{ category?, frequency?, isActive? }} filters
   */
  getHabits: async (filters = {}) => {
    const response = await api.get("/habits", { params: filters });
    return response.data;
  },

  /**
   * Get a single habit by ID.
   * @param {string} id
   */
  getHabitById: async (id) => {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },

  /**
   * Update a habit.
   * @param {string} id
   * @param {object} data  — only include fields to update
   */
  updateHabit: async (id, data) => {
    const response = await api.put(`/habits/${id}`, data);
    return response.data;
  },

  /**
   * Delete a habit permanently.
   * @param {string} id
   */
  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
};

export default habitService;
