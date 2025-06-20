import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import { Spinner } from '@heroui/react'

const RequireAuth = ({ children, requiredRole = null, requireVerification = true, requireCompleteProfile = false }) => {
  const { user, loading, isAuthenticated, isInitialized } = useAuth()
  const location = useLocation()
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    // Solo determinar redirección cuando la autenticación esté inicializada
    if (!isInitialized) return

    if (!isAuthenticated || !user) {
      setRedirectPath('/login')
      return
    }

    // Usuario autenticado, verificar otros requisitos
    if (requireVerification && user && !user.verified) {
      setRedirectPath('/verify-email')
      return
    }

    if (requireCompleteProfile && user && !user.profileComplete) {
      setRedirectPath('/complete-profile')
      return
    }

    // Verificar rol si es necesario
    if (requiredRole && user) {
      const hasRequiredRole = checkUserRole(user, requiredRole)
      if (!hasRequiredRole) {
        setRedirectPath('/')
        return
      }
    }

    // Todo está bien, limpiar redirección
    setRedirectPath(null)
  }, [isAuthenticated, user, isInitialized, requireVerification, requireCompleteProfile, requiredRole])

  // Mostrar spinner mientras se inicializa o se está cargando
  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-400 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Redirigir si es necesario
  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  // Todo bien, renderizar los hijos
  return children
}

// Función para verificar el rol del usuario
const checkUserRole = (user, requiredRole) => {
  if (!user || !user.role) return false

  // Normalizar roles a mayúsculas
  const userRole = user.role.toUpperCase()
  const required = requiredRole.toUpperCase()

  // Verificación directa
  if (userRole === required) return true

  // Los ADMIN pueden acceder a rutas de CLIENT
  if (required === 'CLIENT' && userRole === 'ADMIN') return true

  return false
}

// Wrapper para rutas que requieren usuario verificado pero sin perfil completo
export const RequireVerifiedUser = ({ children }) => {
  return (
    <RequireAuth requireVerification={true} requireCompleteProfile={false}>
      {children}
    </RequireAuth>
  )
}

// Wrapper para rutas que requieren perfil completo
export const RequireCompleteProfile = ({ children }) => {
  return (
    <RequireAuth requireVerification={true} requireCompleteProfile={true}>
      {children}
    </RequireAuth>
  )
}

// Wrapper para rutas de administrador
export const RequireAdmin = ({ children }) => {
  return (
    <RequireAuth requireVerification={true} requireCompleteProfile={true} requiredRole="admin">
      {children}
    </RequireAuth>
  )
}

// Componente para redireccionar usuarios ya autenticados
export const RedirectIfAuthenticated = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading, isInitialized } = useAuth()

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default RequireAuth
