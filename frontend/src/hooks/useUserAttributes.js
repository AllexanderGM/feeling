import { useState, useEffect, useMemo } from 'react'
import { getUserAttributes, getUserAttributesByType, createUserAttribute } from '@services/userAttributesService'
import useAsyncOperation from '@hooks/useAsyncOperation'

export default function useUserAttributes() {
  const [attributes, setAttributes] = useState({})
  const [tempAttributes, setTempAttributes] = useState({
    EYE_COLOR: [],
    HAIR_COLOR: []
  })
  const [error, setError] = useState(null)

  // Hook centralizado para operaciones asíncronas - con configuración estable
  const asyncOptions = useMemo(
    () => ({
      showNotifications: false,
      autoHandleAuth: true
    }),
    []
  )

  const { loading, withLoading } = useAsyncOperation(asyncOptions)

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setError(null)
        const data = await getUserAttributes()
        setAttributes(data || {})
      } catch (err) {
        console.error('Error loading user attributes:', err)
        setError(err)
        setAttributes({})
      }
    }

    fetchAttributes()
  }, []) // Solo ejecutar una vez al montar

  // Función para crear un nuevo atributo con mejor manejo de errores
  const createAttribute = async (attributeType, attributeData) => {
    // Validaciones básicas en el frontend
    if (!attributeData.name || !attributeData.name.trim()) {
      throw new Error('El nombre del atributo es requerido')
    }

    if (attributeData.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres')
    }

    if (attributeData.name.trim().length > 100) {
      throw new Error('El nombre no puede superar los 100 caracteres')
    }

    const result = await withLoading(async () => {
      // Crear el atributo en el backend
      const newAttribute = await createUserAttribute(attributeType, {
        name: attributeData.name.trim(),
        detail: attributeData.detail ? attributeData.detail.trim() : null
      })

      return newAttribute
    }, 'crear atributo')

    if (result.success) {
      // Agregar temporalmente a la UI con flag de pendiente
      const tempAttribute = {
        ...result.data,
        isPending: true,
        active: false // Backend lo marca como false por defecto
      }

      setTempAttributes(prev => ({
        ...prev,
        [attributeType]: [...prev[attributeType], tempAttribute]
      }))

      return tempAttribute
    } else {
      // Mejorar el mensaje de error para el usuario
      let userFriendlyMessage = result.message

      if (result.message?.includes('fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.'
      } else if (result.message?.includes('400')) {
        userFriendlyMessage = 'Los datos enviados no son válidos. Verifica el nombre y el color.'
      } else if (result.message?.includes('409') || result.message?.includes('duplicado')) {
        userFriendlyMessage = 'Ya existe un atributo con ese nombre. Intenta con un nombre diferente.'
      } else if (result.message?.includes('500')) {
        userFriendlyMessage = 'Error del servidor. Intenta nuevamente en unos momentos.'
      }

      throw new Error(userFriendlyMessage)
    }
  }

  // Función para remover un atributo temporal (si es necesario)
  const removeTempAttribute = (attributeType, attributeId) => {
    setTempAttributes(prev => ({
      ...prev,
      [attributeType]: prev[attributeType].filter(attr => attr.id !== attributeId)
    }))
  }

  // Helper para obtener opciones formateadas para Select incluyendo temporales
  const getSelectOptions = attributeType => {
    const typeAttributes = attributes[attributeType] || []
    const tempTypeAttributes = tempAttributes[attributeType] || []

    // Combinar atributos oficiales con temporales
    const allAttributes = [...typeAttributes, ...tempTypeAttributes]

    return allAttributes.map(attr => ({
      key: attr.id.toString(),
      label: attr.name,
      value: attr.code,
      detail: attr.detail,
      id: attr.id,
      isPending: attr.isPending || false
    }))
  }

  // Helper para buscar un atributo por ID (incluye temporales)
  const getAttributeById = attributeId => {
    // Buscar en atributos oficiales
    for (const attributeType in attributes) {
      const found = attributes[attributeType].find(attr => attr.id === parseInt(attributeId))
      if (found) return found
    }

    // Buscar en atributos temporales
    for (const attributeType in tempAttributes) {
      const found = tempAttributes[attributeType].find(attr => attr.id === parseInt(attributeId))
      if (found) return found
    }

    return null
  }

  // Helper para buscar un atributo por código
  const getAttributeByCode = (attributeType, code) => {
    const typeAttributes = attributes[attributeType] || []
    const tempTypeAttributes = tempAttributes[attributeType] || []
    const allAttributes = [...typeAttributes, ...tempTypeAttributes]

    return allAttributes.find(attr => attr.code === code) || null
  }

  // Helper para buscar atributos por tipo (incluye temporales)
  const getAttributesByType = attributeType => {
    const typeAttributes = attributes[attributeType] || []
    const tempTypeAttributes = tempAttributes[attributeType] || []
    return [...typeAttributes, ...tempTypeAttributes]
  }

  // Helper para validar si un valor existe en una colección
  const isValidAttributeId = (attributeType, id) => {
    const typeAttributes = attributes[attributeType] || []
    const tempTypeAttributes = tempAttributes[attributeType] || []
    const allAttributes = [...typeAttributes, ...tempTypeAttributes]

    return allAttributes.some(attr => attr.id === parseInt(id))
  }

  // Helper para determinar si un detail es color o icono
  const isColor = detail => {
    return detail && detail.startsWith('#')
  }

  // Helper para obtener información del detail (sin JSX)
  const getDetailInfo = detail => {
    if (!detail) return null

    return {
      isColor: isColor(detail),
      value: detail,
      type: isColor(detail) ? 'color' : 'icon'
    }
  }

  return {
    attributes,
    tempAttributes,
    loading,
    error,

    // Funciones para crear/manejar atributos temporales
    createAttribute,
    removeTempAttribute,

    // Helpers existentes (actualizados para incluir temporales)
    getSelectOptions,
    getAttributeById,
    getAttributeByCode,
    getAttributesByType,
    isValidAttributeId,
    isColor,
    getDetailInfo,

    // Accesos directos a tipos comunes (actualizados para incluir temporales)
    genderOptions: getSelectOptions('GENDER'),
    eyeColorOptions: getSelectOptions('EYE_COLOR'),
    hairColorOptions: getSelectOptions('HAIR_COLOR'),
    bodyTypeOptions: getSelectOptions('BODY_TYPE'),
    religionOptions: getSelectOptions('RELIGION'),
    maritalStatusOptions: getSelectOptions('MARITAL_STATUS'),
    educationLevelOptions: getSelectOptions('EDUCATION_LEVEL'),
    relationshipTypeOptions: getSelectOptions('RELATIONSHIP_TYPE'),
    sexualRoleOptions: getSelectOptions('SEXUAL_ROLE')
  }
}

export const useAttributesByType = attributeType => {
  const [attributes, setAttributes] = useState([])
  const { loading, withLoading, error } = useAsyncOperation()

  useEffect(() => {
    if (!attributeType) return

    const fetchAttributes = async () => {
      const result = await withLoading(async () => {
        const data = await getUserAttributesByType(attributeType)
        return data
      }, `obtener atributos de tipo ${attributeType}`)

      if (result.success) {
        setAttributes(result.data)
      } else {
        setAttributes([])
      }
    }

    fetchAttributes()
  }, [attributeType, withLoading])

  const getSelectOptions = () => {
    return attributes.map(attr => ({
      key: attr.id.toString(),
      label: attr.name,
      value: attr.code,
      detail: attr.detail,
      id: attr.id
    }))
  }

  return {
    attributes,
    loading,
    error,
    getSelectOptions
  }
}
