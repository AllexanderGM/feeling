/**
 * Utilidades para manejo de datos de usuario
 */

/**
 * Extrae el userId de diferentes estructuras de datos de usuario
 * ACTUALIZADO: El ID ahora está en user.id según la estructura del backend
 * Mantiene compatibilidad con estructuras antiguas por retrocompatibilidad
 * @param {Object} user - Objeto de usuario que puede tener diferentes estructuras
 * @returns {string|null} - El ID del usuario o null si no se encuentra
 */
export const getUserId = user => {
  return user?.user?.id || user?.user?.user?.id || user?.id || user?.profile?.id || user?.status?.id || null
}

/**
 * Extrae el nombre del usuario de diferentes estructuras
 * Soporta tanto la estructura anidada (user.user.user.name) como la plana (user.user.name)
 * @param {Object} user - Objeto de usuario
 * @param {string} fallback - Nombre por defecto si no se encuentra
 * @returns {string} - El nombre del usuario
 */
export const getUserName = (user, fallback = 'este usuario') => {
  return user?.user?.user?.name || user?.user?.name || user?.name || user?.profile?.name || fallback
}

/**
 * Extrae el email del usuario de diferentes estructuras
 * @param {Object} user - Objeto de usuario
 * @returns {string|null} - El email del usuario o null
 */
export const getUserEmail = user => {
  return user?.user?.user?.email || user?.user?.email || user?.email || user?.profile?.email || null
}

/**
 * Obtiene identificadores básicos del usuario (id, nombre, email)
 * @param {Object} user - Objeto de usuario
 * @returns {Object} - Objeto con id, name y email
 */
export const getUserIdentifiers = user => {
  return {
    id: getUserId(user),
    name: getUserName(user),
    email: getUserEmail(user)
  }
}
