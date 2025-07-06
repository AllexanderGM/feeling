/**
 * Capitaliza la primera letra de una cadena de texto
 * @param {string} str - La cadena a capitalizar
 * @returns {string} - La cadena con la primera letra en mayúscula
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitaliza cada palabra en una cadena de texto
 * @param {string} str - La cadena a capitalizar
 * @returns {string} - La cadena con cada palabra capitalizada
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

export default capitalize