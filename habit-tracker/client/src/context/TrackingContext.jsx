// client/src/context/TrackingContext.jsx
// ─────────────────────────────────────────────────────────────
// Global state for today's habit tracking status.
//
// Provides:
//   habits         — all habits with completedToday flag
//   stats          — { total, completed, pending, date }
//   loading        — true while fetching
//   error          — error string or null
//   fetchToday()   — load today's status
//   markDone()     — mark a habit complete
//   markUndone()   — undo a habit completion
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useReducer, useCallback } from "react";
import trackingService from "../services/trackingService.js";

const TrackingContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────────
const initialState = {
  habits:  [],
  stats:   { total: 0, completed: 0, pending: 0, date: "" },
  loading: false,
  error:   null,
};

const trackingReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };

    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SET_TODAY":
      return {
        ...state,
        loading: false,
        habits: action.payload.habits,
        stats: {
          total:     action.payload.total,
          completed: action.payload.completed,
          pending:   action.payload.pending,
          date:      action.payload.date,
        },
      };

    // Toggle completedToday flag on a single habit in the list
    case "TOGGLE_HABIT": {
      const { habitId, completed } = action.payload;
      const updatedHabits = state.habits.map((h) =>
        h._id === habitId ? { ...h, completedToday: completed } : h
      );
      const completedCount = updatedHabits.filter((h) => h.completedToday).length;
      return {
        ...state,
        habits: updatedHabits,
        stats: {
          ...state.stats,
          completed: completedCount,
          pending:   updatedHabits.length - completedCount,
        },
      };
    }

    default:
      return state;
  }
};

// ── Provider ──────────────────────────────────────────────────
export const TrackingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(trackingReducer, initialState);

  const fetchToday = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await trackingService.getTodayStatus();
      dispatch({ type: "SET_TODAY", payload: data });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to load today's habits.",
      });
    }
  }, []);

  const markDone = async (habitId, note = "") => {
    await trackingService.markComplete(habitId, note);
    dispatch({ type: "TOGGLE_HABIT", payload: { habitId, completed: true } });
  };

  const markUndone = async (habitId) => {
    await trackingService.unmarkComplete(habitId);
    dispatch({ type: "TOGGLE_HABIT", payload: { habitId, completed: false } });
  };

  return (
    <TrackingContext.Provider
      value={{
        habits:     state.habits,
        stats:      state.stats,
        loading:    state.loading,
        error:      state.error,
        fetchToday,
        markDone,
        markUndone,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

// ── Custom Hook ───────────────────────────────────────────────
export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) throw new Error("useTracking must be used within a <TrackingProvider>");
  return context;
};

export default TrackingContext;
