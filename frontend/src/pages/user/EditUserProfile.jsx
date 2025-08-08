import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'

import { useAuth } from '../../context/AuthContext.jsx'
import { getUserByEmail, updateUser } from '../../services/user/userService.js'
import { Logger } from '@utils/logger.js'

// Funciones auxiliares
const generateRandomDocument = () => Math.floor(10000000 + Math.random() * 90000000).toString()
const generateRandomPhone = () => Math.floor(100000000 + Math.random() * 900000000).toString()
const DEFAULT_BIRTHDATE = '2000-03-21'
const MAX_BIRTHDATE = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]

const formatDate = date => {
  if (!date) return DEFAULT_BIRTHDATE
  if (typeof date === 'string') {
    // Si ya es una fecha en formato YYYY-MM-DD, la devolvemos tal cual
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date
    // Si es una fecha en otro formato, la convertimos
    const d = new Date(date)
    return d instanceof Date && !isNaN(d) ? d.toISOString().split('T')[0] : DEFAULT_BIRTHDATE
  }
  // Si es un objeto Date, lo convertimos a string
  return date instanceof Date ? date.toISOString().split('T')[0] : DEFAULT_BIRTHDATE
}

const EditUserProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    document: '',
    phone: '',
    dateOfBirth: DEFAULT_BIRTHDATE,
    password: '',
    confirmPassword: '',
    image: ''
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.email) {
          const userData = await getUserByEmail(user.email)
          setFormData({
            name: userData.name || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            document: userData.document || generateRandomDocument(),
            phone: userData.phone || generateRandomPhone(),
            dateOfBirth: formatDate(userData.dateOfBirth),
            password: '',
            confirmPassword: '',
            image: userData.image || ''
          })
        }
      } catch (error) {
        Logger.error('Error al cargar datos del usuario:', error, { category: Logger.CATEGORIES.USER })
        setError('Error al cargar los datos del usuario')
      }
    }

    fetchUserData()
  }, [user])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (error) {
      setError(null)
    }
  }

  const validateForm = () => {
    // Validar campos requeridos
    if (!formData.name.trim()) return 'El nombre es requerido'
    if (!formData.lastName.trim()) return 'El apellido es requerido'
    if (!formData.document) return 'El documento es requerido'
    if (!formData.phone) return 'El teléfono es requerido'
    if (!formData.password) return 'La contraseña es requerida'
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden'

    // Validar teléfono (9 dígitos)
    if (!/^\d{9}$/.test(formData.phone)) {
      return 'El teléfono debe tener 9 dígitos'
    }

    // Validar fecha de nacimiento (mayor de 18 años)
    const birthDate = new Date(formData.dateOfBirth)
    const maxDate = new Date(MAX_BIRTHDATE)
    if (birthDate > maxDate) {
      return 'Debe ser mayor de 18 años'
    }

    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const updatedUserData = {
        ...formData,
        id: user.id
      }

      await updateUser(user.email, updatedUserData)
      setUser(prev => ({ ...prev, ...updatedUserData }))
      setSuccess(true)

      setTimeout(() => {
        navigate('/profile-user')
      }, 1500)
    } catch (error) {
      Logger.error('Error al actualizar perfil:', error, { category: Logger.CATEGORIES.USER })
      setError(error.message || 'Ha ocurrido un error al actualizar tu perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center w-full min-h-screen bg-gray-100'>
      <Card className='max-w-xl w-full p-6'>
        <CardHeader className='flex flex-col'>
          <h1 className='text-2xl font-bold'>Editar Perfil</h1>
          <p className='text-gray-500 text-center'>Actualiza tu información personal</p>
        </CardHeader>

        <CardBody>
          {error && <div className='bg-red-100 text-red-700 p-3 rounded-md w-full mb-4'>{error}</div>}

          {success && (
            <div className='bg-green-100 text-green-700 p-3 rounded-md w-full mb-4'>
              ¡Perfil actualizado correctamente! Redireccionando...
            </div>
          )}

          <Form className='flex flex-col items-center w-full' onSubmit={handleSubmit}>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-5'>
                <Input
                  label='Nombre'
                  labelPlacement='outside'
                  name='name'
                  placeholder='Tu nombre'
                  value={formData.name}
                  onValueChange={value => handleChange('name', value)}
                  isDisabled={isLoading || success}
                />

                <Input
                  label='Apellido'
                  labelPlacement='outside'
                  name='lastName'
                  placeholder='Tu apellido'
                  value={formData.lastName}
                  onValueChange={value => handleChange('lastName', value)}
                  isDisabled={isLoading || success}
                />
              </div>

              <Input
                label='Correo electrónico'
                labelPlacement='outside'
                name='email'
                placeholder='correo@ejemplo.com'
                type='email'
                value={formData.email}
                isReadOnly
                description='El correo electrónico no se puede modificar'
                isDisabled={true}
                className='py-4'
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  label='Documento'
                  labelPlacement='outside'
                  name='document'
                  placeholder='Tu documento'
                  value={formData.document}
                  onValueChange={value => handleChange('document', value)}
                  isDisabled={isLoading || success}
                />

                <Input
                  label='Teléfono'
                  labelPlacement='outside'
                  name='phone'
                  placeholder='Tu teléfono (9 dígitos)'
                  value={formData.phone}
                  onValueChange={value => handleChange('phone', value)}
                  isDisabled={isLoading || success}
                />
              </div>

              <Input
                label='Fecha de Nacimiento'
                labelPlacement='outside'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onValueChange={value => handleChange('dateOfBirth', value)}
                isDisabled={isLoading || success}
                max={MAX_BIRTHDATE}
                description='Debes ser mayor de 18 años'
                className='py-4'
              />

              <Input
                label='URL de Imagen'
                labelPlacement='outside'
                name='image'
                placeholder='URL de tu imagen de perfil'
                value={formData.image}
                onValueChange={value => handleChange('image', value)}
                isDisabled={isLoading || success}
                className='py-4'
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  type='password'
                  label='Contraseña'
                  labelPlacement='outside'
                  name='password'
                  placeholder='Tu contraseña'
                  value={formData.password}
                  onValueChange={value => handleChange('password', value)}
                  isDisabled={isLoading || success}
                />

                <Input
                  type='password'
                  label='Confirmar Contraseña'
                  labelPlacement='outside'
                  name='confirmPassword'
                  placeholder='Confirma tu contraseña'
                  value={formData.confirmPassword}
                  onValueChange={value => handleChange('confirmPassword', value)}
                  isDisabled={isLoading || success}
                />
              </div>
            </div>

            <Divider className='my-4' />

            <div className='flex gap-4 justify-end'>
              <Button type='button' variant='bordered' onPress={() => navigate('/profile-user')} isDisabled={isLoading || success}>
                Cancelar
              </Button>
              <Button type='submit' color='primary' className='bg-[#E86C6E]' isLoading={isLoading} isDisabled={success}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}

export default EditUserProfile
