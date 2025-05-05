import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@context/AuthContext.jsx'

const RequireAuth = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAuth
