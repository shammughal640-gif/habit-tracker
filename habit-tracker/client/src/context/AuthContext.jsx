// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global authentication state manager using React Context API.
//
// Provides to the entire app:
//   • user         — the authenticated user object (or null)
//   • token        — the JWT string (or null)
//   • loading      — true while verifying the stored token on mount
//   • login()      — call with credentials; stores token + user
//   • register()   — call with form data; stores token + user
//   • logout()     — clears auth state and redirects to /login
//
// Usage:
//   const { user, login, logout } = useAuth();
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useReducer } from "react";
import authService from "../services/authService.js";

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────────
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true, // Start true to verify the stored token before rendering
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "AUTH_LOGOUT":
      return { user: null, token: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: if a token exists in localStorage, verify it by fetching
  // the user profile from the server. This keeps the UI consistent after
  // a page refresh.
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const data = await authService.getProfile();
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: data.user, token },
        });
      } catch {
        // Token is invalid or expired — clean up
        authService.logout();
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    verifyToken();
  }, []);

  // ── Actions ─────────────────────────────────────────────────

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    dispatch({ type: "AUTH_SUCCESS", payload: data });
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    dispatch({ type: "AUTH_SUCCESS", payload: data });
    return data;
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: "AUTH_LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        loading: state.loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ───────────────────────────────────────────────
// Wraps useContext with a guard so components fail fast if used
// outside of <AuthProvider>.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
};

export default AuthContext;
