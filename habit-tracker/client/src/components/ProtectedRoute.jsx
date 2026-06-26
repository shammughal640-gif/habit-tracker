// src/components/ProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────
// A route wrapper that redirects unauthenticated users to /login.
//
// Usage in App.jsx:
//   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
//
// • While auth state is loading (token verification), shows a
//   full-screen spinner to prevent a flash of the login page.
// • Once loaded, either renders children or redirects.
// ─────────────────────────────────────────────────────────────

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Still verifying the stored JWT — don't render yet
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Verifying session…</p>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving intended destination
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
