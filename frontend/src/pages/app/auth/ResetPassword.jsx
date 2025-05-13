import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })

    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validate()) return

    try {
      setStatus('submitting')
      await resetPassword(token, formData.password)
      setStatus('success')
      setMessage('Tu contraseña ha sido restablecida con éxito. Puedes iniciar sesión con tu nueva contraseña.')

      // Redireccionar al login después de 3 segundos
      setTimeout(() => {
        navigate('/app/login', {
          state: { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
        })
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'No se pudo restablecer tu contraseña. El enlace puede haber expirado.')
    }
  }

  // Si no hay token, redirigir a la página de recuperación
  if (!token) {
    navigate('/app/forgot-password')
    return null
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 min-h-screen p-6">
      <figure className="text-center">
        <img src={logo} alt="Logo Feeling" className="w-40" />
      </figure>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-medium text-white mb-4">Restablecer contraseña</h2>

        {status === 'success' ? (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="animate-pulse text-gray-400 text-sm">Redirigiendo al inicio de sesión...</div>
          </div>
        ) : (
          <>
            {status === 'error' && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">{message}</div>}

            <p className="text-gray-400 mb-6">Crea una nueva contraseña segura para tu cuenta.</p>

            <Form onSubmit={handleSubmit} validationBehavior="aria">
              <Input
                variant="underlined"
                isRequired
                label="Nueva contraseña"
                name="password"
                placeholder="••••••••"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                aria-label="Nueva contraseña"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                className="mb-4"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? (
                      <span className="material-symbols-outlined">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined">visibility</span>
                    )}
                  </button>
                }
              />

              <Input
                variant="underlined"
                isRequired
                label="Confirma tu nueva contraseña"
                name="confirmPassword"
                placeholder="••••••••"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                aria-label="Confirma tu nueva contraseña"
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                className="mb-6"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    {isConfirmPasswordVisible ? (
                      <span className="material-symbols-outlined">visibility_off</span>
                    ) : (
                      <span className="material-symbols-outlined">visibility</span>
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                radius="full"
                color="default"
                className="w-full py-3 mt-4"
                isLoading={status === 'submitting'}
                isDisabled={status === 'submitting'}>
                {status === 'submitting' ? 'Actualizando...' : 'Restablecer contraseña'}
              </Button>
            </Form>
          </>
        )}
      </div>
    </main>
  )
}

export default ResetPassword
