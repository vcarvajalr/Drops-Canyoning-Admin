import { Navigate } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
