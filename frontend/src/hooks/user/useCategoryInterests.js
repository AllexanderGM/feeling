import { useState, useEffect } from 'react'
import { getUserInterests } from '@services'
import { Logger } from '@utils/logger.js'

/**
 * Hook para gestión de categorías de interés
 * Nota: Ya no incluye lógica de aprobación según las nuevas especificaciones
 */
export const useCategoryInterests = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Usar el nuevo servicio de user interests
        const result = await getUserInterests()

        if (result && Array.isArray(result)) {
          setCategories(result)
        } else {
          throw new Error('Error obteniendo categorías de interés')
        }
      } catch (err) {
        Logger.error(Logger.CATEGORIES.USER, 'Error loading category interests', err)
        setError(err.message)
        // Fallback a datos locales en caso de error
        setCategories(getCategoryFallbackData())
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Datos de respaldo simplificados (sin lógica de aprobación)
  const getCategoryFallbackData = () => [
    {
      id: 1,
      categoryInterestEnum: 'ESSENCE',
      name: 'Essence',
      description: 'Conexiones auténticas para relaciones heterosexuales',
      icon: '💝',
      fullDescription: 'Essence es el espacio ideal para personas que buscan relaciones heterosexuales auténticas y significativas.',
      targetAudience: 'Personas heterosexuales que buscan relaciones auténticas.',
      features: [
        'Conexiones basadas en compatibilidad real',
        'Algoritmos diseñados para relaciones heterosexuales',
        'Comunidad enfocada en relaciones serias'
      ],
      isActive: true,
      displayOrder: 1
    },
    {
      id: 2,
      categoryInterestEnum: 'ROUSE',
      name: 'Rouse',
      description: 'Espacio inclusivo para la comunidad LGBTI+',
      icon: '🏳️‍🌈',
      fullDescription: 'Rouse es un espacio seguro e inclusivo diseñado especialmente para la comunidad LGBTI+.',
      targetAudience: 'Miembros de la comunidad LGBTI+ que buscan conexiones auténticas.',
      features: ['Ambiente 100% inclusivo y respetuoso', 'Opciones de identidad de género flexibles', 'Comunidad diversa y acogedora'],
      isActive: true,
      displayOrder: 2
    },
    {
      id: 3,
      categoryInterestEnum: 'SPIRIT',
      name: 'Spirit',
      description: 'Comunidad cristiana con valores compartidos',
      icon: '✝️',
      fullDescription: 'Spirit es una comunidad para personas cristianas que desean conectar con otros que comparten su fe.',
      targetAudience: 'Personas cristianas que buscan relaciones donde la fe sea prioritaria.',
      features: ['Comunidad centrada en valores cristianos', 'Conexiones basadas en fe compartida', 'Ambiente respetuoso y familiar'],
      isActive: true,
      displayOrder: 3
    }
  ]

  // Formatear categorías para uso en Select
  const formatCategoryOptions = () => {
    return categories.map(category => ({
      key: category.categoryInterestEnum || category.name?.toUpperCase(),
      label: category.name,
      value: category.id,
      shortDescription: category.description,
      icon: category.icon,
      fullDescription: category.fullDescription,
      targetAudience: category.targetAudience,
      features: category.features || []
    }))
  }

  // Buscar categoría por enum
  const getCategoryByEnum = categoryEnum => {
    return categories.find(cat => cat.categoryInterestEnum === categoryEnum || cat.name?.toUpperCase() === categoryEnum)
  }

  // Buscar categoría por ID
  const getCategoryById = categoryId => {
    return categories.find(cat => cat.id === categoryId)
  }

  // Recargar categorías
  const reloadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getUserInterests()

      if (result && Array.isArray(result)) {
        setCategories(result)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    categoryOptions: formatCategoryOptions(),
    loading,
    error,
    getCategoryByEnum,
    getCategoryById,
    reloadCategories
  }
}

/**
 * Hook para administración de categorías de interés
 * Nota: Sin lógica de aprobación, solo operaciones CRUD básicas
 */
export const useCategoryInterestsAdmin = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getUserInterests()

      if (result && Array.isArray(result)) {
        setCategories(result)
      } else {
        throw new Error('Error obteniendo categorías')
      }
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting all categories', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Método simplificado de actualización (sin aprobación)
  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true)
      // Nota: Implementar cuando el backend UserInterestController tenga el endpoint PUT
      Logger.debug(Logger.CATEGORIES.USER, 'Updating category', { id, categoryData })
      throw new Error('Funcionalidad de actualización de categorías no disponible aún')
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error updating category', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Método simplificado para crear categoría (sin aprobación)
  const createCategory = async categoryData => {
    try {
      setLoading(true)
      // Nota: Implementar cuando el backend UserInterestController tenga el endpoint POST
      Logger.debug(Logger.CATEGORIES.USER, 'Creating category', { categoryData })
      throw new Error('Funcionalidad de creación de categorías no disponible aún')
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error creating category', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Método para eliminar categoría (sin aprobación)
  const deleteCategory = async id => {
    try {
      setLoading(true)
      // Nota: Implementar cuando el backend UserInterestController tenga el endpoint DELETE
      Logger.debug(Logger.CATEGORIES.USER, 'Deleting category', { id })
      throw new Error('Funcionalidad de eliminación de categorías no disponible aún')
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error deleting category', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    fetchAllCategories,
    updateCategory,
    createCategory,
    deleteCategory
  }
}

export default useCategoryInterests
