// client/src/services/trackingService.js
// ─────────────────────────────────────────────────────────────
// All API calls related to habit tracking / completion.
// ─────────────────────────────────────────────────────────────

import api from "./api.js";

const trackingService = {
  /**
   * Get today's completion status for all habits.
   * @returns {Promise<{ habits, completed, pending, total, date }>}
   */
  getTodayStatus: async () => {
    const response = await api.get("/tracking/today");
    return response.data;
  },

  /**
   * Mark a habit as complete for today.
   * @param {string} habitId
   * @param {string} note  optional note
   */
  markComplete: async (habitId, note = "") => {
    const response = await api.post(`/tracking/${habitId}/complete`, { note });
    return response.data;
  },

  /**
   * Undo today's completion for a habit.
   * @param {string} habitId
   */
  unmarkComplete: async (habitId) => {
    const response = await api.delete(`/tracking/${habitId}/complete`);
    return response.data;
  },

  /**
   * Get completion history for a specific habit.
   * @param {string} habitId
   * @param {number} limit  max records (default 30)
   */
  getHistory: async (habitId, limit = 30) => {
    const response = await api.get(`/tracking/${habitId}/history`, {
      params: { limit },
    });
    return response.data;
  },
};

export default trackingService;
