// src/pages/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────
// Temporary dashboard page for Module 1.
// This is a protected page — only reachable after login.
// Will be replaced with the full Dashboard in Module 7.
// ─────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/dashboard.css";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="dashboard-icon">🎯</div>
        <h1 className="dashboard-title">You&apos;re in!</h1>
        <p className="dashboard-welcome">
          Welcome, <strong>{user?.name}</strong>
        </p>
        <p className="dashboard-email">{user?.email}</p>

        <div className="dashboard-info">
          <p>Module 1 — Authentication is complete ✅</p>
          <p>More modules coming in the next sprints.</p>
        </div>

        <button className="btn btn-outline btn-full" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
