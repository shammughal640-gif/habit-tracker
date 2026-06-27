// client/src/pages/DashboardPage.jsx  ← UPDATED for Module 2
// ─────────────────────────────────────────────────────────────
// Temporary dashboard acting as a module navigation hub.
// Will be replaced with the full analytics dashboard in Module 7.
// ─────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/dashboard.css";

const modules = [
  { label: "Habits",        path: "/habits",     icon: "✅", status: "active",  desc: "Manage your habits"         },
  { label: "Habit Tracking",path: "/tracking",   icon: "📊", status: "coming",  desc: "Track daily completions"    },
  { label: "Streaks",       path: "/streaks",    icon: "🔥", status: "coming",  desc: "View your streaks"          },
  { label: "To-Do",         path: "/todos",      icon: "📝", status: "coming",  desc: "Manage your tasks"          },
  { label: "Scheduler",     path: "/schedule",   icon: "📅", status: "coming",  desc: "Schedule tasks"             },
  { label: "Analytics",     path: "/analytics",  icon: "📈", status: "coming",  desc: "Reports & insights"         },
  { label: "Notifications", path: "/notifs",     icon: "🔔", status: "coming",  desc: "Manage notifications"       },
  { label: "Settings",      path: "/settings",   icon: "⚙️",  status: "coming",  desc: "Account settings"           },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      {/* ── Navbar ── */}
      <nav className="habits-nav">
        <div className="habits-nav__brand">
          <span className="habits-nav__logo">✅</span>
          <span className="habits-nav__title">Habit Tracker</span>
        </div>
        <div className="habits-nav__user">
          <span className="habits-nav__name">👋 {user?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-welcome-block">
          <h1 className="dashboard-hero-title">
            Welcome back, <span>{user?.name}</span> 👋
          </h1>
          <p className="dashboard-hero-sub">
            Here's your hub — more modules unlock as we build sprint by sprint.
          </p>
        </div>

        {/* ── Module Cards Grid ── */}
        <div className="module-grid">
          {modules.map((mod) => (
            <button
              key={mod.path}
              className={`module-card ${mod.status === "coming" ? "module-card--disabled" : ""}`}
              onClick={() => mod.status === "active" && navigate(mod.path)}
              disabled={mod.status === "coming"}
            >
              <span className="module-card__icon">{mod.icon}</span>
              <span className="module-card__label">{mod.label}</span>
              <span className="module-card__desc">{mod.desc}</span>
              {mod.status === "coming" && (
                <span className="module-card__badge">Coming soon</span>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
