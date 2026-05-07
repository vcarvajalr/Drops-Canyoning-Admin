import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Shell from './components/Shell'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ReservationsPage from './pages/ReservationsPage'
import TripsPage from './pages/TripsPage'
import UsersPage from './pages/UsersPage'

function RoleProtectedUsersPage() {
  const { user } = useAuth()
  if (!['admin', 'manager'].includes(user?.role)) {
    return <Navigate to="/" replace />
  }
  return <UsersPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="users" element={<RoleProtectedUsersPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
