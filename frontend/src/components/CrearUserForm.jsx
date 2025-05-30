import { useState, useCallback } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react'
import { createUser } from '@services/userService'

import { USER_ROLES, USER_FORM_VALIDATIONS, DEFAULT_USER_FORM_DATA } from '../constants/tableConstants.js'

const DEFAULT_BIRTHDATE = '1986-03-21'
const MAX_BIRTHDATE = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]

const CrearUserForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    ...DEFAULT_USER_FORM_DATA,
    dateOfBirth: DEFAULT_BIRTHDATE,
    role: USER_ROLES.CLIENT
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    // Validar campos requeridos
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (!formData.document.trim()) newErrors.document = 'El documento es requerido'
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!USER_FORM_VALIDATIONS.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar teléfono (9 dígitos)
    if (!USER_FORM_VALIDATIONS.PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos'
    }

    // Validar fecha de nacimiento
    const birthDate = new Date(formData.dateOfBirth)
    const maxDate = new Date(MAX_BIRTHDATE)
    if (birthDate > maxDate) {
      newErrors.dateOfBirth = 'Debe ser mayor de 18 años'
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'Por favor ingresa una contraseña'
    } else if (formData.password.length < USER_FORM_VALIDATIONS.PASSWORD_MIN_LENGTH) {
      newErrors.password = `La contraseña debe tener al menos ${USER_FORM_VALIDATIONS.PASSWORD_MIN_LENGTH} caracteres`
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirma la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Limpiar error del campo cuando el usuario empieza a escribir
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }))
      }
    },
    [errors]
  )

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      // Excluir confirmPassword del envío
      const { ...userData } = formData
      await createUser(userData)
      onSuccess?.()
      onClose()
    } catch (error) {
      setApiError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      ...DEFAULT_USER_FORM_DATA,
      dateOfBirth: DEFAULT_BIRTHDATE,
      role: USER_ROLES.CLIENT
    })
    setErrors({})
    setApiError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      classNames={{
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-800'
      }}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Crear Nuevo Usuario</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos básicos */}
              <Input
                type="text"
                label="Nombre *"
                placeholder="Ingrese el nombre"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                color={errors.name ? 'danger' : 'default'}
                errorMessage={errors.name}
                className="w-full"
              />

              <Input
                type="text"
                label="Apellido *"
                placeholder="Ingrese el apellido"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                color={errors.lastName ? 'danger' : 'default'}
                errorMessage={errors.lastName}
                className="w-full"
              />

              <Input
                type="text"
                label="Documento *"
                placeholder="Ingrese el documento"
                value={formData.document}
                onChange={e => handleInputChange('document', e.target.value)}
                color={errors.document ? 'danger' : 'default'}
                errorMessage={errors.document}
                className="w-full"
              />

              <Input
                type="tel"
                label="Teléfono *"
                placeholder="Ingrese el teléfono (9 dígitos)"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                color={errors.phone ? 'danger' : 'default'}
                errorMessage={errors.phone}
                className="w-full"
              />

              <Input
                type="date"
                label="Fecha de Nacimiento *"
                value={formData.dateOfBirth}
                onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                color={errors.dateOfBirth ? 'danger' : 'default'}
                errorMessage={errors.dateOfBirth}
                className="w-full"
                max={MAX_BIRTHDATE}
              />

              <Input
                type="email"
                label="Email *"
                placeholder="Ingrese el email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                color={errors.email ? 'danger' : 'default'}
                errorMessage={errors.email}
                className="w-full"
              />

              {/* URL de imagen */}
              <Input
                type="url"
                label="URL de Imagen"
                placeholder="https://..."
                value={formData.image}
                onChange={e => handleInputChange('image', e.target.value)}
                className="w-full col-span-2"
              />

              {/* Contraseñas */}
              <Input
                type="password"
                label="Contraseña *"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                color={errors.password ? 'danger' : 'default'}
                errorMessage={errors.password}
                className="w-full"
              />

              <Input
                type="password"
                label="Confirmar Contraseña *"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                color={errors.confirmPassword ? 'danger' : 'default'}
                errorMessage={errors.confirmPassword}
                className="w-full"
              />
            </div>

            {apiError && <div className="mt-4 text-danger text-sm">{apiError}</div>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" disabled={isLoading} isLoading={isLoading}>
              Crear Usuario
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CrearUserForm
