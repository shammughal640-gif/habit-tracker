// client/src/pages/HabitsPage.jsx
// ─────────────────────────────────────────────────────────────
// Main Habit Management page.
//
// Features:
//   • Lists all habits in a responsive card grid
//   • Filter by category and frequency
//   • Create new habit via modal
//   • Edit / Delete inline
//   • Empty state with call-to-action
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHabits } from "../context/HabitContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import HabitCard from "../components/habits/HabitCard.jsx";
import HabitModal from "../components/habits/HabitModal.jsx";
import { CATEGORIES, FREQUENCIES } from "../components/habits/HabitForm.jsx";
import "../styles/habits.css";

const HabitsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { habits, loading, error, fetchHabits, addHabit, editHabit, removeHabit } =
    useHabits();

  // ── Modal State ───────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingHabit, setEditingHabit] = useState(null); // null = create mode
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState("");

  // ── Filter State ──────────────────────────────────────────
  const [filterCategory,  setFilterCategory]  = useState("all");
  const [filterFrequency, setFilterFrequency] = useState("all");

  // ── Load habits on mount ──────────────────────────────────
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // ── Derived: filtered habits ──────────────────────────────
  const filteredHabits = habits.filter((h) => {
    const matchCat  = filterCategory  === "all" || h.category  === filterCategory;
    const matchFreq = filterFrequency === "all" || h.frequency === filterFrequency;
    return matchCat && matchFreq;
  });

  // ── Handlers ─────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingHabit(null);
    setFormError("");
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingHabit) {
        await editHabit(editingHabit._id, formData);
      } else {
        await addHabit(formData);
      }
      closeModal();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await removeHabit(id);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="habits-page">
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

      <main className="habits-main">
        {/* ── Page Header ── */}
        <div className="habits-header">
          <div>
            <h1 className="habits-title">My Habits</h1>
            <p className="habits-subtitle">
              {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + New Habit
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="habits-filters">
          {/* Category filter */}
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>

          {/* Frequency filter */}
          <select
            className="filter-select"
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
          >
            <option value="all">All Frequencies</option>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Reset filters */}
          {(filterCategory !== "all" || filterFrequency !== "all") && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setFilterCategory("all"); setFilterFrequency("all"); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="habits-loading">
            <div className="spinner" />
            <p>Loading your habits…</p>
          </div>
        ) : error ? (
          <div className="habits-error">
            <p>⚠️ {error}</p>
            <button className="btn btn-outline btn-sm" onClick={() => fetchHabits()}>
              Try again
            </button>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="habits-empty">
            <div className="habits-empty__icon">🎯</div>
            <h2 className="habits-empty__title">
              {habits.length === 0 ? "No habits yet" : "No habits match your filters"}
            </h2>
            <p className="habits-empty__subtitle">
              {habits.length === 0
                ? "Create your first habit and start building a better routine."
                : "Try adjusting your filters or create a new habit."}
            </p>
            {habits.length === 0 && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                + Create First Habit
              </button>
            )}
          </div>
        ) : (
          <div className="habits-grid">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingHabit}
        isLoading={isSubmitting}
      />

      {/* Show form-level API errors inside the modal via a toast */}
      {formError && (
        <div className="toast toast-error">⚠️ {formError}</div>
      )}
    </div>
  );
};

export default HabitsPage;
