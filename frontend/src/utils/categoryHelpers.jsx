import { Flame, Heart, Sparkles, Star } from 'lucide-react'

/**
 * Obtiene el ícono correspondiente a una categoría de interés
 * @param {string} categoryKey - Clave de la categoría (ESSENCE, ROUSE, SPIRIT)
 * @param {string} className - Clases CSS para el ícono (default: 'w-4 h-4')
 * @returns {JSX.Element} Componente de ícono con color correspondiente
 */
export const getCategoryIcon = (categoryKey, className = 'w-4 h-4') => {
  const baseClass = className

  switch (categoryKey?.toUpperCase()) {
    case 'ESSENCE':
      return <Sparkles className={`${baseClass} text-blue-400`} />
    case 'ROUSE':
      return <Flame className={`${baseClass} text-red-400`} />
    case 'SPIRIT':
      return <Star className={`${baseClass} text-purple-400`} />
    default:
      return <Heart className={`${baseClass} text-gray-400`} />
  }
}

/**
 * Obtiene el color asociado a una categoría de interés
 * @param {string} categoryKey - Clave de la categoría
 * @returns {string} Nombre del color (para usar en clases de Tailwind o HeroUI)
 */
export const getCategoryColor = categoryKey => {
  switch (categoryKey?.toUpperCase()) {
    case 'ESSENCE':
      return 'blue'
    case 'ROUSE':
      return 'red'
    case 'SPIRIT':
      return 'purple'
    default:
      return 'gray'
  }
}

/**
 * Obtiene el nombre legible de una categoría
 * @param {string} categoryKey - Clave de la categoría
 * @returns {string} Nombre formateado de la categoría
 */
export const getCategoryName = categoryKey => {
  switch (categoryKey?.toUpperCase()) {
    case 'ESSENCE':
      return 'Essence'
    case 'ROUSE':
      return 'Rouse'
    case 'SPIRIT':
      return 'Spirit'
    default:
      return 'Desconocido'
  }
}
