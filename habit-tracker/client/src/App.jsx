// client/src/App.jsx  ← UPDATED for Module 3
// Added: TrackingProvider, /tracking protected route

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }     from "./context/AuthContext.jsx";
import { HabitProvider }    from "./context/HabitContext.jsx";
import { TrackingProvider } from "./context/TrackingContext.jsx"; // ← NEW
import ProtectedRoute  from "./components/ProtectedRoute.jsx";
import LoginPage       from "./pages/LoginPage.jsx";
import RegisterPage    from "./pages/RegisterPage.jsx";
import DashboardPage   from "./pages/DashboardPage.jsx";
import HabitsPage      from "./pages/HabitsPage.jsx";
import TrackingPage    from "./pages/TrackingPage.jsx";            // ← NEW
import "./styles/global.css";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HabitProvider>
          <TrackingProvider>  {/* ← NEW */}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/habits"    element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
              <Route path="/tracking"  element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />  {/* ← NEW */}

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TrackingProvider>
        </HabitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
