import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'

const RequireAuth = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar rol si es necesario
  if (requiredRole) {
    const hasRequiredRole = checkUserRole(user, requiredRole)
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }

  // Si todo está bien, renderizar los hijos
  return children
}

// Función para verificar el rol del usuario
const checkUserRole = (user, requiredRole) => {
  if (!user || !user.roles) return false

  // Manejo de diferentes estructuras de roles
  if (Array.isArray(user.roles)) {
    return user.roles.includes(requiredRole)
  }

  if (typeof user.roles === 'string') {
    return user.roles === requiredRole
  }

  if (typeof user.roles === 'object') {
    return user.roles[requiredRole] === true
  }

  return false
}

export default RequireAuth
