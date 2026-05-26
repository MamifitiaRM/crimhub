import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import MissionDetail from "./pages/MissionDetail";
import CreateMission from "./pages/CreateMission";
import Criminals from "./pages/Criminals";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--card-bg, #1e1e2c)",
                color: "var(--text, #f0ede8)",
                border: "3px solid #0d0d0d",
                fontFamily: "'Nunito', sans-serif",
                fontSize: "14px",
                fontWeight: 800,
                boxShadow: "4px 4px 0 #0d0d0d",
                borderRadius: "10px",
              },
              success: { iconTheme: { primary: "#06D6A0", secondary: "#0d0d0d" } },
              error:   { iconTheme: { primary: "#FF2D55", secondary: "#0d0d0d" } },
            }}
          />
          <Routes>
            {/* Guest only */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected */}
            <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/missions"       element={<ProtectedRoute><Missions /></ProtectedRoute>} />
            <Route path="/missions/:id"   element={<ProtectedRoute><MissionDetail /></ProtectedRoute>} />
            <Route path="/create-mission" element={<ProtectedRoute><CreateMission /></ProtectedRoute>} />
            <Route path="/criminals"      element={<ProtectedRoute><Criminals /></ProtectedRoute>} />
            <Route path="/criminals/:id"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard"    element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

            {/* Redirect */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
