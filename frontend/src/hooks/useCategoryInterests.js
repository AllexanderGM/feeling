import { useState, useEffect } from 'react'
import { API_URL } from '@config/config'

export const useCategoryInterests = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/category-interests`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error obteniendo categorías de interés:', err)
        setError(err.message)

        // Fallback a datos locales en caso de error - estructura simplificada
        setCategories(getCategoryFallbackData())
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Datos de respaldo con estructura simplificada para el fallback
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

  // Formatear categorías para uso en Select - ahora directamente desde el backend
  const formatCategoryOptions = () => {
    return categories.map(category => ({
      key: category.categoryInterestEnum,
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
    return categories.find(cat => cat.categoryInterestEnum === categoryEnum)
  }

  // Buscar categoría por ID
  const getCategoryById = categoryId => {
    return categories.find(cat => cat.id === categoryId)
  }

  return {
    categories,
    categoryOptions: formatCategoryOptions(),
    loading,
    error,
    getCategoryByEnum,
    getCategoryById
  }
}

// Hook adicional para administración (opcional)
export const useCategoryInterestsAdmin = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/category-interests/all`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error obteniendo todas las categorías:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/category-interests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const updatedCategory = await response.json()

      // Actualizar lista local
      setCategories(prev => prev.map(cat => (cat.id === id ? updatedCategory : cat)))

      return updatedCategory
    } catch (err) {
      console.error('Error actualizando categoría:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryStatus = async id => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/category-interests/${id}/toggle-status`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const updatedCategory = await response.json()

      // Actualizar lista local
      setCategories(prev => prev.map(cat => (cat.id === id ? updatedCategory : cat)))

      return updatedCategory
    } catch (err) {
      console.error('Error cambiando estado de categoría:', err)
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
    toggleCategoryStatus
  }
}
