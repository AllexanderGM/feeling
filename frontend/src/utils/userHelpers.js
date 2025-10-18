/**
 * Utilidades para manejo de datos de usuario
 */

/**
 * Extrae el userId de diferentes estructuras de datos de usuario
 * Soporta tanto la estructura anidada (user.user.status.id) como la plana (user.status.id)
 * @param {Object} user - Objeto de usuario que puede tener diferentes estructuras
 * @returns {string|null} - El ID del usuario o null si no se encuentra
 */
export const getUserId = user => {
  return user?.user?.status?.id || user?.status?.id || user?.id || user?.profile?.id || null
}

/**
 * Extrae el nombre del usuario de diferentes estructuras
 * Soporta tanto la estructura anidada (user.user.profile.name) como la plana (user.profile.name)
 * @param {Object} user - Objeto de usuario
 * @param {string} fallback - Nombre por defecto si no se encuentra
 * @returns {string} - El nombre del usuario
 */
export const getUserName = (user, fallback = 'este usuario') => {
  return user?.user?.profile?.name || user?.profile?.name || user?.name || fallback
}

/**
 * Extrae el email del usuario de diferentes estructuras
 * @param {Object} user - Objeto de usuario
 * @returns {string|null} - El email del usuario o null
 */
export const getUserEmail = user => {
  return user?.user?.profile?.email || user?.profile?.email || user?.email || null
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
