// client/src/context/HabitContext.jsx
// ─────────────────────────────────────────────────────────────
// Global state for habits using React Context + useReducer.
//
// Provides:
//   habits         — array of habit objects
//   loading        — true while fetching
//   error          — error message string or null
//   fetchHabits()  — load habits (with optional filters)
//   addHabit()     — create and prepend to state
//   editHabit()    — update in state
//   removeHabit()  — delete from state
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useReducer, useCallback } from "react";
import habitService from "../services/habitService.js";

const HabitContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────────
const initialState = {
  habits: [],
  loading: false,
  error: null,
};

const habitReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };

    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SET_HABITS":
      return { ...state, habits: action.payload, loading: false, error: null };

    case "ADD_HABIT":
      return {
        ...state,
        habits: [action.payload, ...state.habits], // Prepend newest
        loading: false,
      };

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h._id === action.payload._id ? action.payload : h
        ),
        loading: false,
      };

    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.filter((h) => h._id !== action.payload),
        loading: false,
      };

    default:
      return state;
  }
};

// ── Provider ──────────────────────────────────────────────────
export const HabitProvider = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);

  // Fetch all habits (with optional filters)
  const fetchHabits = useCallback(async (filters = {}) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await habitService.getHabits(filters);
      dispatch({ type: "SET_HABITS", payload: data.habits });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error.response?.data?.message || "Failed to fetch habits.",
      });
    }
  }, []);

  // Create a new habit
  const addHabit = async (habitData) => {
    const data = await habitService.createHabit(habitData);
    dispatch({ type: "ADD_HABIT", payload: data.habit });
    return data;
  };

  // Update an existing habit
  const editHabit = async (id, habitData) => {
    const data = await habitService.updateHabit(id, habitData);
    dispatch({ type: "UPDATE_HABIT", payload: data.habit });
    return data;
  };

  // Delete a habit
  const removeHabit = async (id) => {
    await habitService.deleteHabit(id);
    dispatch({ type: "DELETE_HABIT", payload: id });
  };

  return (
    <HabitContext.Provider
      value={{
        habits: state.habits,
        loading: state.loading,
        error: state.error,
        fetchHabits,
        addHabit,
        editHabit,
        removeHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

// ── Custom Hook ───────────────────────────────────────────────
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error("useHabits must be used within a <HabitProvider>");
  return context;
};

export default HabitContext;
