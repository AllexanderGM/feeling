import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import { Spinner } from '@heroui/react'
import { APP_PATHS } from '@constants/paths.js'

const RequireAuth = ({ children, requiredRole = null, requireVerification = true, requireCompleteProfile = false }) => {
  const { user, loading, isAuthenticated, isInitialized } = useAuth()
  const location = useLocation()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    // Reset redirect state cuando cambian las dependencias
    setShouldRedirect(false)
    setRedirectPath(null)

    // Solo evaluar cuando esté inicializado
    if (!isInitialized) return

    // Usuario no autenticado
    if (!isAuthenticated || !user) {
      setRedirectPath(APP_PATHS.AUTH.LOGIN)
      setShouldRedirect(true)
      return
    }

    // ADMIN bypass: Los administradores pueden acceder a todo sin restricciones
    const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN'

    if (!isAdmin) {
      // Verificar email si es requerido (solo para no-admin)
      if (requireVerification && !user.verified) {
        setRedirectPath(APP_PATHS.AUTH.VERIFY_EMAIL)
        setShouldRedirect(true)
        return
      }

      // Verificar perfil completo si es requerido (solo para no-admin)
      if (requireCompleteProfile && !user.profileComplete) {
        setRedirectPath(APP_PATHS.USER.COMPLETE_PROFILE)
        setShouldRedirect(true)
        return
      }
    }

    // Verificar rol si es requerido
    if (requiredRole) {
      const hasRequiredRole = checkUserRole(user, requiredRole)
      if (!hasRequiredRole) {
        setRedirectPath(APP_PATHS.ROOT)
        setShouldRedirect(true)
        return
      }
    }

    setShouldRedirect(false)
    setRedirectPath(null)
  }, [isAuthenticated, user, isInitialized, requireVerification, requireCompleteProfile, requiredRole])

  // Mostrar spinner mientras se inicializa
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
  if (shouldRedirect && redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  // Renderizar hijos
  return children
}

// Función para verificar el rol del usuario
const checkUserRole = (user, requiredRole) => {
  if (!user || !user.role) return false

  const userRole = user.role.toUpperCase()
  const required = requiredRole.toUpperCase()

  if (userRole === required) return true
  if (required === 'CLIENT' && userRole === 'ADMIN') return true

  return false
}

// Wrapper para rutas que solo requieren autenticación
export const RequireAuthOnly = ({ children }) => {
  return (
    <RequireAuth requireVerification={false} requireCompleteProfile={false}>
      {children}
    </RequireAuth>
  )
}

// Wrapper para rutas que requieren usuario verificado
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
    <RequireAuth requireVerification={false} requireCompleteProfile={false} requiredRole="admin">
      {children}
    </RequireAuth>
  )
}

// Componente para redireccionar usuarios ya autenticados
export const RedirectIfAuthenticated = ({ children, redirectTo = APP_PATHS.ROOT }) => {
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

// Componente para redireccionar si el perfil ya está completo
export const RedirectIfProfileComplete = ({ children, redirectTo = APP_PATHS.ROOT }) => {
  const { user, loading, isAuthenticated, isInitialized } = useAuth()

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  // No redirigir a admins, pueden acceder sin restricciones
  const isAdmin = user?.role && user.role.toUpperCase() === 'ADMIN'

  if (isAuthenticated && user && user.profileComplete && user.verified && !isAdmin) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default RequireAuth
