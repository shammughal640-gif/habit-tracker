// client/src/pages/TrackingPage.jsx
// ─────────────────────────────────────────────────────────────
// Today's Habit Tracking page.
//
// Features:
//   • Progress summary bar at the top
//   • Filter: All / Pending / Done tabs
//   • List of TodayCards — mark complete / undo
//   • Empty state when no habits exist
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTracking } from "../context/TrackingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import StatsBar  from "../components/tracking/StatsBar.jsx";
import TodayCard from "../components/tracking/TodayCard.jsx";
import "../styles/tracking.css";

const FILTERS = ["all", "pending", "done"];

const TrackingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { habits, stats, loading, error, fetchToday, markDone, markUndone } =
    useTracking();

  const [activeFilter, setActiveFilter] = useState("all");

  // Load today's status on mount
  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  // Apply filter
  const filteredHabits = habits.filter((h) => {
    if (activeFilter === "pending") return !h.completedToday;
    if (activeFilter === "done")    return  h.completedToday;
    return true;
  });

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="tracking-page">
      {/* ── Navbar ── */}
      <nav className="habits-nav">
        <div className="habits-nav__brand">
          <span className="habits-nav__logo">✅</span>
          <span className="habits-nav__title">Habit Tracker</span>
        </div>
        <div className="habits-nav__user">
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/habits")}>
            ← Habits
          </button>
          <span className="habits-nav__name">👋 {user?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="tracking-main">
        {loading ? (
          <div className="habits-loading">
            <div className="spinner" />
            <p>Loading today&apos;s habits…</p>
          </div>
        ) : error ? (
          <div className="habits-error">
            <p>⚠️ {error}</p>
            <button className="btn btn-outline btn-sm" onClick={fetchToday}>
              Try again
            </button>
          </div>
        ) : habits.length === 0 ? (
          /* No habits at all */
          <div className="habits-empty">
            <div className="habits-empty__icon">📋</div>
            <h2 className="habits-empty__title">No habits to track</h2>
            <p className="habits-empty__subtitle">
              Create some habits first, then come back here to track them daily.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/habits")}>
              Go to Habits
            </button>
          </div>
        ) : (
          <>
            {/* ── Progress Summary ── */}
            <StatsBar stats={stats} />

            {/* ── Filter Tabs ── */}
            <div className="tracking-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`tracking-tab ${activeFilter === f ? "tracking-tab--active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f === "all"     && `All (${habits.length})`}
                  {f === "pending" && `Pending (${stats.pending})`}
                  {f === "done"    && `Done (${stats.completed})`}
                </button>
              ))}
            </div>

            {/* ── Habit List ── */}
            {filteredHabits.length === 0 ? (
              <div className="tracking-empty">
                {activeFilter === "done"
                  ? "No habits completed yet — keep going! 💪"
                  : "All habits are done for today! 🎉"}
              </div>
            ) : (
              <div className="tracking-list">
                {filteredHabits.map((habit) => (
                  <TodayCard
                    key={habit._id}
                    habit={habit}
                    onMarkDone={markDone}
                    onMarkUndone={markUndone}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TrackingPage;
