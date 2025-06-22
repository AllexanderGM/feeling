import { useState, useEffect } from 'react'
import { getUserAttributes, getUserAttributesByType } from '@services/userAttributesService'

export const useUserAttributes = () => {
  const [attributes, setAttributes] = useState({})
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

  // Datos de respaldo con estructura coherente al backend
  const getAttributesFallback = () => ({
    GENDER: [
      { id: 1, code: 'MALE', name: 'Masculino', attributeType: 'GENDER', displayOrder: 1, active: true },
      { id: 2, code: 'FEMALE', name: 'Femenino', attributeType: 'GENDER', displayOrder: 2, active: true },
      { id: 3, code: 'NON_BINARY', name: 'No binario', attributeType: 'GENDER', displayOrder: 3, active: true },
      { id: 4, code: 'OTHER', name: 'Otro', attributeType: 'GENDER', displayOrder: 4, active: true },
      { id: 5, code: 'PREFER_NOT_TO_SAY', name: 'Prefiero no decir', attributeType: 'GENDER', displayOrder: 5, active: true }
    ],
    EYE_COLOR: [
      { id: 12, code: 'BROWN', name: 'Marrones', attributeType: 'EYE_COLOR', displayOrder: 1, active: true },
      { id: 13, code: 'BLUE', name: 'Azules', attributeType: 'EYE_COLOR', displayOrder: 2, active: true },
      { id: 14, code: 'GREEN', name: 'Verdes', attributeType: 'EYE_COLOR', displayOrder: 3, active: true },
      { id: 15, code: 'HAZEL', name: 'Avellana', attributeType: 'EYE_COLOR', displayOrder: 4, active: true },
      { id: 16, code: 'GRAY', name: 'Grises', attributeType: 'EYE_COLOR', displayOrder: 5, active: true },
      { id: 17, code: 'BLACK', name: 'Negros', attributeType: 'EYE_COLOR', displayOrder: 6, active: true }
    ],
    HAIR_COLOR: [
      { id: 18, code: 'BLACK', name: 'Negro', attributeType: 'HAIR_COLOR', displayOrder: 1, active: true },
      { id: 19, code: 'BROWN', name: 'Castaño', attributeType: 'HAIR_COLOR', displayOrder: 2, active: true },
      { id: 20, code: 'BLONDE', name: 'Rubio', attributeType: 'HAIR_COLOR', displayOrder: 3, active: true },
      { id: 21, code: 'RED', name: 'Pelirrojo', attributeType: 'HAIR_COLOR', displayOrder: 4, active: true },
      { id: 22, code: 'GRAY', name: 'Canoso', attributeType: 'HAIR_COLOR', displayOrder: 5, active: true },
      { id: 23, code: 'WHITE', name: 'Blanco', attributeType: 'HAIR_COLOR', displayOrder: 6, active: true },
      { id: 24, code: 'OTHER', name: 'Otro', attributeType: 'HAIR_COLOR', displayOrder: 7, active: true }
    ],
    BODY_TYPE: [
      { id: 25, code: 'SLIM', name: 'Delgado/a', attributeType: 'BODY_TYPE', displayOrder: 1, active: true },
      { id: 26, code: 'ATHLETIC', name: 'Atlético/a', attributeType: 'BODY_TYPE', displayOrder: 2, active: true },
      { id: 27, code: 'AVERAGE', name: 'Promedio', attributeType: 'BODY_TYPE', displayOrder: 3, active: true },
      { id: 28, code: 'CURVY', name: 'Con curvas', attributeType: 'BODY_TYPE', displayOrder: 4, active: true },
      { id: 29, code: 'PLUS_SIZE', name: 'Talla grande', attributeType: 'BODY_TYPE', displayOrder: 5, active: true }
    ],
    RELIGION: [
      { id: 38, code: 'CHRISTIAN', name: 'Cristiano/a', attributeType: 'RELIGION', displayOrder: 1, active: true },
      { id: 39, code: 'CATHOLIC', name: 'Católico/a', attributeType: 'RELIGION', displayOrder: 2, active: true },
      { id: 40, code: 'PROTESTANT', name: 'Protestante', attributeType: 'RELIGION', displayOrder: 3, active: true },
      { id: 44, code: 'JEWISH', name: 'Judío/a', attributeType: 'RELIGION', displayOrder: 7, active: true },
      { id: 45, code: 'MUSLIM', name: 'Musulmán/a', attributeType: 'RELIGION', displayOrder: 8, active: true },
      { id: 46, code: 'BUDDHIST', name: 'Budista', attributeType: 'RELIGION', displayOrder: 9, active: true },
      { id: 47, code: 'HINDU', name: 'Hindú', attributeType: 'RELIGION', displayOrder: 10, active: true },
      { id: 48, code: 'SPIRITUAL', name: 'Espiritual', attributeType: 'RELIGION', displayOrder: 11, active: true },
      { id: 49, code: 'AGNOSTIC', name: 'Agnóstico/a', attributeType: 'RELIGION', displayOrder: 12, active: true },
      { id: 50, code: 'ATHEIST', name: 'Ateo/a', attributeType: 'RELIGION', displayOrder: 13, active: true },
      { id: 51, code: 'OTHER', name: 'Otra', attributeType: 'RELIGION', displayOrder: 14, active: true },
      { id: 52, code: 'PREFER_NOT_TO_SAY', name: 'Prefiero no decir', attributeType: 'RELIGION', displayOrder: 15, active: true }
    ],
    MARITAL_STATUS: [
      { id: 6, code: 'SINGLE', name: 'Soltero/a', attributeType: 'MARITAL_STATUS', displayOrder: 1, active: true },
      { id: 7, code: 'MARRIED', name: 'Casado/a', attributeType: 'MARITAL_STATUS', displayOrder: 2, active: true },
      { id: 8, code: 'DIVORCED', name: 'Divorciado/a', attributeType: 'MARITAL_STATUS', displayOrder: 3, active: true },
      { id: 9, code: 'WIDOWED', name: 'Viudo/a', attributeType: 'MARITAL_STATUS', displayOrder: 4, active: true },
      { id: 10, code: 'SEPARATED', name: 'Separado/a', attributeType: 'MARITAL_STATUS', displayOrder: 5, active: true },
      { id: 11, code: 'IN_RELATIONSHIP', name: 'En una relación', attributeType: 'MARITAL_STATUS', displayOrder: 6, active: true }
    ],
    EDUCATION_LEVEL: [
      { id: 30, code: 'PRIMARY', name: 'Primaria', attributeType: 'EDUCATION_LEVEL', displayOrder: 1, active: true },
      { id: 31, code: 'SECONDARY', name: 'Secundaria', attributeType: 'EDUCATION_LEVEL', displayOrder: 2, active: true },
      { id: 32, code: 'HIGH_SCHOOL', name: 'Bachillerato', attributeType: 'EDUCATION_LEVEL', displayOrder: 3, active: true },
      { id: 33, code: 'TECHNICIAN', name: 'Técnico o Tecnólogo', attributeType: 'EDUCATION_LEVEL', displayOrder: 4, active: true },
      { id: 34, code: 'VOCATIONAL', name: 'Profesional', attributeType: 'EDUCATION_LEVEL', displayOrder: 5, active: true },
      { id: 35, code: 'MASTER', name: 'Maestría', attributeType: 'EDUCATION_LEVEL', displayOrder: 6, active: true },
      { id: 36, code: 'DOCTORATE', name: 'Doctorado', attributeType: 'EDUCATION_LEVEL', displayOrder: 7, active: true },
      { id: 37, code: 'OTHER', name: 'Otro nivel educativo', attributeType: 'EDUCATION_LEVEL', displayOrder: 8, active: true }
    ],
    RELATIONSHIP_TYPE: [
      { id: 57, code: 'MONOGAMOUS', name: 'Monógamo', attributeType: 'RELATIONSHIP_TYPE', displayOrder: 1, active: true },
      { id: 58, code: 'OPEN', name: 'Abierta', attributeType: 'RELATIONSHIP_TYPE', displayOrder: 2, active: true },
      { id: 59, code: 'POLYAMOROUS', name: 'Poliamorosa', attributeType: 'RELATIONSHIP_TYPE', displayOrder: 3, active: true },
      { id: 60, code: 'CASUAL', name: 'Casual', attributeType: 'RELATIONSHIP_TYPE', displayOrder: 4, active: true },
      {
        id: 61,
        code: 'FRIENDS_WITH_BENEFITS',
        name: 'Amigos con beneficios',
        attributeType: 'RELATIONSHIP_TYPE',
        displayOrder: 5,
        active: true
      },
      { id: 62, code: 'EXPLORING', name: 'Explorando', attributeType: 'RELATIONSHIP_TYPE', displayOrder: 6, active: true }
    ],
    SEXUAL_ROLE: [
      { id: 53, code: 'TOP', name: 'Activo', attributeType: 'SEXUAL_ROLE', displayOrder: 1, active: true },
      { id: 54, code: 'BOTTOM', name: 'Pasivo', attributeType: 'SEXUAL_ROLE', displayOrder: 2, active: true },
      { id: 55, code: 'VERSATILE', name: 'Versátil', attributeType: 'SEXUAL_ROLE', displayOrder: 3, active: true },
      { id: 56, code: 'SIDE', name: 'Side', attributeType: 'SEXUAL_ROLE', displayOrder: 4, active: true }
    ]
  })

  // Helper para obtener opciones formateadas para Select
  const getSelectOptions = attributeType => {
    const typeAttributes = attributes[attributeType] || []
    return typeAttributes.map(attr => ({
      key: attr.id.toString(),
      label: attr.name,
      value: attr.code, // Usamos code para acceder a los mapeos
      id: attr.id
    }))
  }

  // Helper para buscar un atributo por ID
  const getAttributeById = attributeId => {
    for (const attributeType in attributes) {
      const found = attributes[attributeType].find(attr => attr.id === parseInt(attributeId))
      if (found) return found
    }
    return null
  }

  // Helper para buscar un atributo por código
  const getAttributeByCode = (attributeType, code) => {
    const typeAttributes = attributes[attributeType] || []
    return typeAttributes.find(attr => attr.code === code) || null
  }

  // Helper para buscar atributos por tipo
  const getAttributesByType = attributeType => {
    return attributes[attributeType] || []
  }

  // Helper para validar si un valor existe en una colección
  const isValidAttributeId = (attributeType, id) => {
    const typeAttributes = attributes[attributeType] || []
    return typeAttributes.some(attr => attr.id === parseInt(id))
  }

  return {
    attributes,
    loading,
    error,
    getSelectOptions,
    getAttributeById,
    getAttributeByCode,
    getAttributesByType,
    isValidAttributeId,
    // Accesos directos a tipos comunes
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
