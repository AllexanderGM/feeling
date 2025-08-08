import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks'
import LoadData from '@components/layout/LoadData'
import { APP_PATHS } from '@constants/paths.js'

// Utilidades de autenticación locales
const checkUserRole = (user, requiredRole) => {
  if (!user?.status?.role) return false

  const userRole = user.status.role.toUpperCase()
  const required = requiredRole.toUpperCase()

  if (userRole === required) return true
  if (required === 'CLIENT' && userRole === 'ADMIN') return true

  return false
}

const isUserAdmin = user => {
  return user?.status?.role?.toUpperCase() === 'ADMIN'
}

/**
 * COMPONENTE PRINCIPAL DE AUTENTICACIÓN
 *
 * Este es el componente base que maneja toda la lógica de protección de rutas.
 * Evalúa si un usuario puede acceder a una ruta específica basándose en:
 * - Estado de autenticación
 * - Verificación de email
 * - Completitud del perfil
 * - Rol del usuario
 *
 * @param {ReactNode} children - Componentes hijos a renderizar si se cumple la autenticación
 * @param {boolean} requireVerification - Si requiere email verificado (default: true)
 * @param {boolean} requireCompleteProfile - Si requiere perfil completo (default: false)
 * @param {string|null} requiredRole - Rol requerido para acceder (null = cualquier rol autenticado)
 */
const RequireAuth = ({ children, requireVerification = true, requireCompleteProfile = false, requiredRole = null }) => {
  const { user, isAuthenticated, isInitialized } = useAuth()
  const isAdmin = user?.status?.role?.toUpperCase() === 'ADMIN'
  const location = useLocation()

  if (!isInitialized) return <LoadData>Verificando autenticación...</LoadData>

  // 1. VERIFICAR AUTENTICACIÓN BÁSICA
  if (!isAuthenticated || !user) {
    return <Navigate to={APP_PATHS.AUTH.LOGIN} state={{ from: location }} replace />
  }

  // 2. VERIFICAR ROL ESPECÍFICO
  if (requiredRole && !checkUserRole(user, requiredRole)) {
    return <Navigate to={APP_PATHS.ROOT} state={{ from: location }} replace />
  }

  // 3. REDIRIGIR ADMIN AL PANEL DE ADMIN
  if (isAdmin && location.pathname !== APP_PATHS.ADMIN.ROOT && !location.pathname.startsWith('/admin')) {
    return <Navigate to={APP_PATHS.ADMIN.ROOT} state={{ from: location }} replace />
  }

  // 4. VERIFICACIONES PARA USUARIOS NO-ADMIN
  if (!isAdmin) {
    // Verificar email si se requiere
    if (requireVerification && !user.status?.verified) {
      return <Navigate to={APP_PATHS.AUTH.VERIFY_EMAIL} state={{ from: location }} replace />
    }

    // Verificar perfil completo si se requiere
    if (requireCompleteProfile && !user.status?.profileComplete) {
      return <Navigate to={APP_PATHS.USER.COMPLETE_PROFILE} state={{ from: location }} replace />
    }
  }

  // 5. TODAS LAS VERIFICACIONES PASARON
  return children
}

// =============================================================================
// COMPONENTES WRAPPER PARA CASOS DE USO ESPECÍFICOS
// =============================================================================

/**
 * WRAPPER: Solo requiere autenticación
 *
 * Para rutas que solo necesitan que el usuario esté logueado,
 * sin importar verificación de email o perfil completo.
 *
 * Casos de uso:
 * - Dashboard básico
 * - Páginas de configuración inicial
 * - Rutas de transición
 */
export const RequireAuthOnly = ({ children }) => {
  return (
    <RequireAuth requireVerification={false} requireCompleteProfile={false}>
      {children}
    </RequireAuth>
  )
}

/**
 * WRAPPER: Requiere usuario verificado
 *
 * Para rutas que necesitan que el usuario haya verificado su email.
 * NUEVA LÓGICA: Si el usuario está verificado pero no tiene perfil completo,
 * será redirigido automáticamente a Complete Profile.
 *
 * Casos de uso:
 * - Funciones básicas de la aplicación que requieren perfil completo
 * - Páginas principales de la app
 * - Acceso a funcionalidades que necesitan datos del usuario
 */
export const RequireVerifiedUser = ({ children }) => {
  return (
    <RequireAuth requireVerification={true} requireCompleteProfile={true}>
      {children}
    </RequireAuth>
  )
}

/**
 * WRAPPER: Requiere perfil completo
 *
 * Para rutas que necesitan que el usuario tenga su perfil
 * completamente configurado y email verificado.
 * Ya NO requiere aprobación del administrador.
 *
 * Casos de uso:
 * - Funciones principales de la aplicación
 * - Páginas de interacción social
 * - Servicios que requieren datos completos del usuario
 */
export const RequireCompleteProfile = ({ children }) => {
  return (
    <RequireAuth requireVerification={true} requireCompleteProfile={true}>
      {children}
    </RequireAuth>
  )
}

/**
 * WRAPPER: Requiere rol de administrador
 *
 * Para rutas exclusivas de administradores.
 * Los admins tienen bypass automático para verificación y perfil.
 *
 * Casos de uso:
 * - Panel de administración
 * - Gestión de usuarios
 * - Configuraciones del sistema
 * - Estadísticas y reportes
 */
export const RequireAdmin = ({ children }) => {
  return (
    <RequireAuth requireVerification={false} requireCompleteProfile={false} requiredRole='admin'>
      {children}
    </RequireAuth>
  )
}

// =============================================================================
// COMPONENTES DE REDIRECCIÓN
// =============================================================================

/**
 * REDIRECCIÓN: Si ya está autenticado
 *
 * Redirige a usuarios ya autenticados lejos de páginas públicas.
 * Útil para páginas de login/registro donde un usuario autenticado
 * no debería estar.
 *
 * Casos de uso:
 * - Página de login
 * - Página de registro
 * - Página de recuperación de contraseña
 * - Landing pages para usuarios no autenticados
 *
 * @param {string} redirectTo - Ruta a la que redirigir (default: home)
 */
export const RedirectIfAuthenticated = ({ children, redirectTo = APP_PATHS.ROOT }) => {
  const { isAuthenticated, loading, isInitialized } = useAuth()

  // Mostrar carga mientras se inicializa
  if (loading || !isInitialized) {
    return <LoadData>Verificando autenticación...</LoadData>
  }

  // Si está autenticado, redirigir
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Si no está autenticado, mostrar contenido
  return children
}

/**
 * REDIRECCIÓN: Si el perfil ya está completo
 *
 * Redirige a usuarios con perfil completo lejos de páginas
 * de completar perfil. Los administradores no son redirigidos
 * ya que pueden acceder a estas páginas para testing/soporte.
 *
 * Casos de uso:
 * - Página de completar perfil
 * - Wizard de configuración inicial
 * - Páginas de onboarding
 *
 * @param {string} redirectTo - Ruta a la que redirigir (default: home)
 */
export const RedirectIfProfileComplete = ({ children, redirectTo = APP_PATHS.ROOT }) => {
  const { user, isAuthenticated, isInitialized } = useAuth()

  // Mostrar carga mientras se inicializa
  if (!isInitialized) {
    return <LoadData>Verificando perfil...</LoadData>
  }

  // No redirigir a admins (pueden acceder para soporte/testing)
  const isAdmin = isUserAdmin(user)

  // Si está autenticado, tiene perfil completo, está verificado y no es admin, redirigir
  if (isAuthenticated && user && user.status.profileComplete && user.status.verified && !isAdmin) {
    return <Navigate to={redirectTo} replace />
  }

  // En cualquier otro caso, mostrar contenido
  return children
}

export default RequireAuth
