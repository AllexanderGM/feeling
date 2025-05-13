import { useState } from 'react'

const useForm = (initialState = {}, validators = {}) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (field, value) => {
    setValues({
      ...values,
      [field]: value
    })

    // Si hay un validador para este campo, ejecutarlo
    if (validators[field]) {
      const error = validators[field](value, values)
      setErrors({
        ...errors,
        [field]: error
      })
    } else if (errors[field]) {
      // Si no hay validador pero había un error, limpiarlo
      setErrors({
        ...errors,
        [field]: null
      })
    }

    // Marcar el campo como tocado
    if (!touched[field]) {
      setTouched({
        ...touched,
        [field]: true
      })
    }
  }

  const handleBlur = field => {
    if (!touched[field]) {
      setTouched({
        ...touched,
        [field]: true
      })

      // Validar al perder el foco
      if (validators[field]) {
        const error = validators[field](values[field], values)
        setErrors({
          ...errors,
          [field]: error
        })
      }
    }
  }

  const validateAll = () => {
    const newErrors = {}
    let isValid = true

    // Validar todos los campos
    Object.keys(validators).forEach(field => {
      const error = validators[field](values[field], values)
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)

    // Marcar todos los campos como tocados
    const allTouched = {}
    Object.keys(values).forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)

    return isValid
  }

  const reset = () => {
    setValues(initialState)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  }
}

export default useForm
