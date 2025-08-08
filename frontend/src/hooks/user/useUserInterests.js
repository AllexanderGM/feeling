import { useState, useEffect } from 'react'
import { getUserInterests, getUserInterestById, createUserInterest, updateUserInterest, deleteUserInterest } from '@services'
import { Logger } from '@utils/logger.js'

export const useUserInterests = () => {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadInterests = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getUserInterests()
        if (result.success && result.data) {
          setInterests(result.data)
        } else {
          // Usar datos de respaldo si el backend no está disponible
          setInterests(getInterestsFallbackData())
        }
      } catch (err) {
        Logger.error(Logger.CATEGORIES.USER, 'Error loading user interests', err)
        setError(err.message)
        setInterests(getInterestsFallbackData())
      } finally {
        setLoading(false)
      }
    }

    loadInterests()
  }, [])

  // Datos de respaldo con estructura simplificada para el fallback
  const getInterestsFallbackData = () => [
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

  // Formatear intereses para uso en Select - ahora directamente desde el backend
  const formatInterestOptions = () => {
    return interests.map(interest => ({
      key: interest.categoryInterestEnum,
      label: interest.name,
      value: interest.id,
      shortDescription: interest.description,
      icon: interest.icon,
      fullDescription: interest.fullDescription,
      targetAudience: interest.targetAudience,
      features: interest.features || []
    }))
  }

  // Buscar interés por enum
  const getInterestByEnum = interestEnum => {
    return interests.find(interest => interest.categoryInterestEnum === interestEnum)
  }

  // Buscar interés por ID
  const getInterestById = interestId => {
    return interests.find(interest => interest.id === interestId)
  }

  return {
    interests,
    interestOptions: formatInterestOptions(),
    loading,
    error,
    getInterestByEnum,
    getInterestById
  }
}

// Hook adicional para administración
export const useUserInterestsAdmin = () => {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllInterests = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getUserInterests()

      if (result.success && result.data) {
        setInterests(result.data)
      } else {
        throw new Error(result.message || 'Error obteniendo intereses')
      }
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting all interests', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createInterest = async interestData => {
    try {
      setLoading(true)
      const result = await createUserInterest(interestData)

      if (result.success && result.data) {
        setInterests(prev => [...prev, result.data])
        return result.data
      } else {
        throw new Error(result.message || 'Error creando interés')
      }
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error creating interest', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateInterest = async (id, interestData) => {
    try {
      setLoading(true)
      const result = await updateUserInterest(id, interestData)

      if (result.success && result.data) {
        setInterests(prev => prev.map(interest => (interest.id === id ? result.data : interest)))
        return result.data
      } else {
        throw new Error(result.message || 'Error actualizando interés')
      }
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error updating interest', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteInterest = async id => {
    try {
      setLoading(true)
      const result = await deleteUserInterest(id)

      if (result.success) {
        setInterests(prev => prev.filter(interest => interest.id !== id))
        return true
      } else {
        throw new Error(result.message || 'Error eliminando interés')
      }
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error deleting interest', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    interests,
    loading,
    error,
    fetchAllInterests,
    createInterest,
    updateInterest,
    deleteInterest
  }
}

export default useUserInterests
