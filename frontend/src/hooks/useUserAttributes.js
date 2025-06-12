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
        const data = await getUserAttributes()
        setAttributes(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAttributes()
  }, [])

  // Helper para obtener opciones formateadas para Select
  const getSelectOptions = attributeType => {
    const typeAttributes = attributes[attributeType] || []
    return typeAttributes.map(attr => ({
      key: attr.id.toString(),
      label: attr.name,
      value: attr.id
    }))
  }

  return {
    attributes,
    loading,
    error,
    getSelectOptions,
    // Accesos directos a tipos comunes
    genderOptions: getSelectOptions('GENDER'),
    eyeColorOptions: getSelectOptions('EYE_COLOR'),
    hairColorOptions: getSelectOptions('HAIR_COLOR'),
    religionOptions: getSelectOptions('RELIGION'),
    maritalStatusOptions: getSelectOptions('MARITAL_STATUS'),
    bodyTypeOptions: getSelectOptions('BODY_TYPE')
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
        const data = await getUserAttributesByType(attributeType)
        setAttributes(data)
      } catch (err) {
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
      value: attr.id
    }))
  }

  return {
    attributes,
    loading,
    error,
    getSelectOptions
  }
}
