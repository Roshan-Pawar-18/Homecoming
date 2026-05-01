import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

import LandingPage      from "./pages/LandingPage"
import LoginPage        from "./pages/LoginPage"
import FeedPage         from "./pages/FeedPage"
import ProfilePage      from "./pages/ProfilePage"
import MessagesPage     from "./pages/MessagesPage"
import OpportunitiesPage from "./pages/OpportunitiesPage"
import AdminPage        from "./pages/AdminPage"
import SettingsPage     from "./pages/SettingsPage"

// Redirect to login if not logged in
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// Redirect to feed if not admin
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === "admin" ? children : <Navigate to="/feed" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — must be logged in */}
      <Route path="/feed"          element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/profile/:id"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/messages"      element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* Catch all — redirect home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
