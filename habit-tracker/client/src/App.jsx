// client/src/App.jsx  ← UPDATED for Module 2
// ─────────────────────────────────────────────────────────────
// Added: HabitProvider wrapping the app, /habits protected route
// ─────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { HabitProvider } from "./context/HabitContext.jsx";  // ← NEW
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HabitsPage from "./pages/HabitsPage.jsx";             // ← NEW
import "./styles/global.css";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HabitProvider>  {/* ← Wraps all routes so habits state is global */}
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public routes */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <HabitsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </HabitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
