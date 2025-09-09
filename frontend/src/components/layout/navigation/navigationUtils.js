/**
 * Utilidades compartidas para componentes de navegación
 */

// Verificar si alguna ruta relacionada con el perfil/usuario está activa
export const isProfileActive = (location, isAdmin, APP_PATHS) => {
  const userRelatedPaths = isAdmin
    ? [APP_PATHS.ADMIN.PROFILE, APP_PATHS.ADMIN.SETTINGS_PROFILE, APP_PATHS.GENERAL.HELP]
    : [APP_PATHS.USER.PROFILE, APP_PATHS.USER.SETTINGS, APP_PATHS.USER.NOTIFICATIONS, APP_PATHS.GENERAL.HELP]

  return userRelatedPaths.some(path => location.pathname === path || location.pathname.startsWith(path))
}

// Verificar si una ruta está activa
export const isActive = (location, path, APP_PATHS) => {
  if (path === APP_PATHS.ROOT || path === APP_PATHS.ADMIN.ROOT) {
    return location.pathname === path
  }
  return location.pathname.startsWith(path)
}

// Estilos compartidos para la navegación
export const getNavigationStyles = () => ({
  container: 'bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10',
  button: 'transition-all duration-300 ease-in-out',
  activeButton: 'transform scale-105',
  inactiveButton: 'hover:scale-102',
  badge: 'animate-pulse'
})
