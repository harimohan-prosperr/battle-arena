import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Layout      from './components/Layout'
import LoginPage   from './pages/LoginPage'
import Dashboard   from './pages/Dashboard'
import Battles     from './pages/Battles'
import Leaderboard from './pages/Leaderboard'
import Profile     from './pages/Profile'
import AdminPage   from './pages/AdminPage'
import ChangePassword from './ChangePassword'
function RequireAuth({ children }) {
  const { session, profile } = useAuth()

  if (session === undefined) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <span style={{ color: '#555', fontSize: 13 }}>
          Loading…
        </span>
      </div>
    )
  }

  // Force password change
  if (
    session &&
    profile?.must_change_password &&
    window.location.pathname !== '/change-password'
  ) {
    return <Navigate to="/change-password" replace />
  }

  return session ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const { profile } = useAuth()
  if (!profile) return null
  return profile?.roles?.includes('ADMIN')  ? children
  : <Navigate to="/" replace />}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index            element={<Dashboard />} />
        <Route path="battles"  element={<Battles />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profile"  element={<Profile />} />
        <Route path="admin"    element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/change-password" element={<ChangePassword />} />

      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
