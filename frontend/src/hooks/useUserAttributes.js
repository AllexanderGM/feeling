import { useState, useEffect } from 'react'
import { getUserAttributes, getUserAttributesByType, createUserAttribute } from '@services/userAttributesService'

export const useUserAttributes = () => {
  const [attributes, setAttributes] = useState({})
  const [tempAttributes, setTempAttributes] = useState({
    EYE_COLOR: [],
    HAIR_COLOR: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserAttributes()
        setAttributes(data)
      } catch (err) {
        console.error('Error fetching user attributes:', err)
        setError(err.message)

        // Fallback en caso de error - estructura coherente con el backend
        setAttributes(getAttributesFallback())
      } finally {
        setLoading(false)
      }
    }

    fetchAttributes()
  }, [])

  // Función para crear un nuevo atributo con mejor manejo de errores
  const createAttribute = async (attributeType, attributeData) => {
    try {
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

      // Crear el atributo en el backend
      const newAttribute = await createUserAttribute(attributeType, {
        name: attributeData.name.trim(),
        detail: attributeData.detail ? attributeData.detail.trim() : null
      })

      // Agregar temporalmente a la UI con flag de pendiente
      const tempAttribute = {
        ...newAttribute,
        isPending: true,
        active: false // Backend lo marca como false por defecto
      }

      setTempAttributes(prev => ({
        ...prev,
        [attributeType]: [...prev[attributeType], tempAttribute]
      }))

      return tempAttribute
    } catch (error) {
      console.error('Error creating attribute:', error)

      // Mejorar el mensaje de error para el usuario
      let userFriendlyMessage = error.message

      if (error.message.includes('fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.'
      } else if (error.message.includes('400')) {
        userFriendlyMessage = 'Los datos enviados no son válidos. Verifica el nombre y el color.'
      } else if (error.message.includes('409') || error.message.includes('duplicado')) {
        userFriendlyMessage = 'Ya existe un atributo con ese nombre. Intenta con un nombre diferente.'
      } else if (error.message.includes('500')) {
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

  // Datos de respaldo con estructura coherente al backend (ACTUALIZADO CON DETAIL)
  const getAttributesFallback = () => ({
    GENDER: [
      { id: 1, code: 'MALE', name: 'Masculino', attributeType: 'GENDER', detail: 'man', displayOrder: 1, active: true },
      { id: 2, code: 'FEMALE', name: 'Femenino', attributeType: 'GENDER', detail: 'woman', displayOrder: 2, active: true },
      { id: 3, code: 'NON_BINARY', name: 'No binario', attributeType: 'GENDER', detail: 'transgender', displayOrder: 3, active: true },
      { id: 4, code: 'OTHER', name: 'Otro', attributeType: 'GENDER', detail: 'diversity_3', displayOrder: 4, active: true },
      {
        id: 5,
        code: 'PREFER_NOT_TO_SAY',
        name: 'Prefiero no decir',
        attributeType: 'GENDER',
        detail: 'visibility_off',
        displayOrder: 5,
        active: true
      }
    ],
    EYE_COLOR: [
      { id: 12, code: 'BROWN', name: 'Marrones', attributeType: 'EYE_COLOR', detail: '#8B4513', displayOrder: 1, active: true },
      { id: 13, code: 'BLUE', name: 'Azules', attributeType: 'EYE_COLOR', detail: '#4169E1', displayOrder: 2, active: true },
      { id: 14, code: 'GREEN', name: 'Verdes', attributeType: 'EYE_COLOR', detail: '#228B22', displayOrder: 3, active: true },
      { id: 15, code: 'HAZEL', name: 'Avellana', attributeType: 'EYE_COLOR', detail: '#A0826D', displayOrder: 4, active: true },
      { id: 16, code: 'GRAY', name: 'Grises', attributeType: 'EYE_COLOR', detail: '#808080', displayOrder: 5, active: true },
      { id: 17, code: 'BLACK', name: 'Negros', attributeType: 'EYE_COLOR', detail: '#000000', displayOrder: 6, active: true }
    ],
    HAIR_COLOR: [
      { id: 18, code: 'BLACK', name: 'Negro', attributeType: 'HAIR_COLOR', detail: '#000000', displayOrder: 1, active: true },
      { id: 19, code: 'BROWN', name: 'Castaño', attributeType: 'HAIR_COLOR', detail: '#964B00', displayOrder: 2, active: true },
      { id: 20, code: 'BLONDE', name: 'Rubio', attributeType: 'HAIR_COLOR', detail: '#F0E68C', displayOrder: 3, active: true },
      { id: 21, code: 'RED', name: 'Pelirrojo', attributeType: 'HAIR_COLOR', detail: '#B22222', displayOrder: 4, active: true },
      { id: 22, code: 'GRAY', name: 'Canoso', attributeType: 'HAIR_COLOR', detail: '#808080', displayOrder: 5, active: true },
      { id: 23, code: 'WHITE', name: 'Blanco', attributeType: 'HAIR_COLOR', detail: '#FFFFFF', displayOrder: 6, active: true },
      { id: 24, code: 'OTHER', name: 'Otro', attributeType: 'HAIR_COLOR', detail: 'palette', displayOrder: 7, active: true }
    ],
    BODY_TYPE: [
      { id: 25, code: 'SLIM', name: 'Delgado/a', attributeType: 'BODY_TYPE', detail: 'straighten', displayOrder: 1, active: true },
      { id: 26, code: 'ATHLETIC', name: 'Atlético/a', attributeType: 'BODY_TYPE', detail: 'fitness_center', displayOrder: 2, active: true },
      { id: 27, code: 'AVERAGE', name: 'Promedio', attributeType: 'BODY_TYPE', detail: 'person', displayOrder: 3, active: true },
      { id: 28, code: 'CURVY', name: 'Con curvas', attributeType: 'BODY_TYPE', detail: 'waving_hand', displayOrder: 4, active: true },
      {
        id: 29,
        code: 'PLUS_SIZE',
        name: 'Talla grande',
        attributeType: 'BODY_TYPE',
        detail: 'sentiment_satisfied',
        displayOrder: 5,
        active: true
      }
    ],
    RELIGION: [
      { id: 38, code: 'CHRISTIAN', name: 'Cristiano/a', attributeType: 'RELIGION', detail: 'church', displayOrder: 1, active: true },
      { id: 39, code: 'CATHOLIC', name: 'Católico/a', attributeType: 'RELIGION', detail: 'church', displayOrder: 2, active: true },
      { id: 40, code: 'PROTESTANT', name: 'Protestante', attributeType: 'RELIGION', detail: 'menu_book', displayOrder: 3, active: true },
      { id: 44, code: 'JEWISH', name: 'Judío/a', attributeType: 'RELIGION', detail: 'star_of_david', displayOrder: 7, active: true },
      { id: 45, code: 'MUSLIM', name: 'Musulmán/a', attributeType: 'RELIGION', detail: 'mosque', displayOrder: 8, active: true },
      { id: 46, code: 'BUDDHIST', name: 'Budista', attributeType: 'RELIGION', detail: 'self_improvement', displayOrder: 9, active: true },
      { id: 47, code: 'HINDU', name: 'Hindú', attributeType: 'RELIGION', detail: 'spa', displayOrder: 10, active: true },
      { id: 48, code: 'SPIRITUAL', name: 'Espiritual', attributeType: 'RELIGION', detail: 'auto_awesome', displayOrder: 11, active: true },
      { id: 49, code: 'AGNOSTIC', name: 'Agnóstico/a', attributeType: 'RELIGION', detail: 'help', displayOrder: 12, active: true },
      { id: 50, code: 'ATHEIST', name: 'Ateo/a', attributeType: 'RELIGION', detail: 'block', displayOrder: 13, active: true },
      { id: 51, code: 'OTHER', name: 'Otra', attributeType: 'RELIGION', detail: 'public', displayOrder: 14, active: true },
      {
        id: 52,
        code: 'PREFER_NOT_TO_SAY',
        name: 'Prefiero no decir',
        attributeType: 'RELIGION',
        detail: 'visibility_off',
        displayOrder: 15,
        active: true
      }
    ],
    MARITAL_STATUS: [
      { id: 6, code: 'SINGLE', name: 'Soltero/a', attributeType: 'MARITAL_STATUS', detail: null, displayOrder: 1, active: true },
      { id: 7, code: 'MARRIED', name: 'Casado/a', attributeType: 'MARITAL_STATUS', detail: null, displayOrder: 2, active: true },
      { id: 8, code: 'DIVORCED', name: 'Divorciado/a', attributeType: 'MARITAL_STATUS', detail: null, displayOrder: 3, active: true },
      { id: 9, code: 'WIDOWED', name: 'Viudo/a', attributeType: 'MARITAL_STATUS', detail: null, displayOrder: 4, active: true },
      { id: 10, code: 'SEPARATED', name: 'Separado/a', attributeType: 'MARITAL_STATUS', detail: null, displayOrder: 5, active: true },
      {
        id: 11,
        code: 'IN_RELATIONSHIP',
        name: 'En una relación',
        attributeType: 'MARITAL_STATUS',
        detail: null,
        displayOrder: 6,
        active: true
      }
    ],
    EDUCATION_LEVEL: [
      { id: 30, code: 'PRIMARY', name: 'Primaria', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 1, active: true },
      { id: 31, code: 'SECONDARY', name: 'Secundaria', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 2, active: true },
      { id: 32, code: 'HIGH_SCHOOL', name: 'Bachillerato', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 3, active: true },
      {
        id: 33,
        code: 'TECHNICIAN',
        name: 'Técnico o Tecnólogo',
        attributeType: 'EDUCATION_LEVEL',
        detail: null,
        displayOrder: 4,
        active: true
      },
      { id: 34, code: 'VOCATIONAL', name: 'Profesional', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 5, active: true },
      { id: 35, code: 'MASTER', name: 'Maestría', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 6, active: true },
      { id: 36, code: 'DOCTORATE', name: 'Doctorado', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 7, active: true },
      { id: 37, code: 'OTHER', name: 'Otro nivel educativo', attributeType: 'EDUCATION_LEVEL', detail: null, displayOrder: 8, active: true }
    ],
    RELATIONSHIP_TYPE: [
      {
        id: 57,
        code: 'MONOGAMOUS',
        name: 'Monógamo',
        attributeType: 'RELATIONSHIP_TYPE',
        detail: 'favorite',
        displayOrder: 1,
        active: true
      },
      { id: 58, code: 'OPEN', name: 'Abierta', attributeType: 'RELATIONSHIP_TYPE', detail: 'link', displayOrder: 2, active: true },
      {
        id: 59,
        code: 'POLYAMOROUS',
        name: 'Poliamorosa',
        attributeType: 'RELATIONSHIP_TYPE',
        detail: 'group',
        displayOrder: 3,
        active: true
      },
      {
        id: 60,
        code: 'CASUAL',
        name: 'Casual',
        attributeType: 'RELATIONSHIP_TYPE',
        detail: 'sentiment_satisfied',
        displayOrder: 4,
        active: true
      },
      {
        id: 61,
        code: 'FRIENDS_WITH_BENEFITS',
        name: 'Amigos con beneficios',
        attributeType: 'RELATIONSHIP_TYPE',
        detail: 'handshake',
        displayOrder: 5,
        active: true
      },
      { id: 62, code: 'EXPLORING', name: 'Explorando', attributeType: 'RELATIONSHIP_TYPE', detail: 'search', displayOrder: 6, active: true }
    ],
    SEXUAL_ROLE: [
      { id: 53, code: 'TOP', name: 'Activo', attributeType: 'SEXUAL_ROLE', detail: 'keyboard_arrow_up', displayOrder: 1, active: true },
      {
        id: 54,
        code: 'BOTTOM',
        name: 'Pasivo',
        attributeType: 'SEXUAL_ROLE',
        detail: 'keyboard_arrow_down',
        displayOrder: 2,
        active: true
      },
      { id: 55, code: 'VERSATILE', name: 'Versátil', attributeType: 'SEXUAL_ROLE', detail: 'swap_vert', displayOrder: 3, active: true },
      { id: 56, code: 'SIDE', name: 'Side', attributeType: 'SEXUAL_ROLE', detail: 'swap_horiz', displayOrder: 4, active: true }
    ]
  })

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!attributeType) return

    const fetchAttributes = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserAttributesByType(attributeType)
        setAttributes(data)
      } catch (err) {
        console.error(`Error fetching attributes for type ${attributeType}:`, err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAttributes()
  }, [attributeType])

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
