import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ requiredRole = 'user' }) => {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && !hasRole('admin')) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
