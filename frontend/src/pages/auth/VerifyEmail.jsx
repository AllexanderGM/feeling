import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import { useNotification } from '@hooks/useNotification'
import { validateEmail, validateVerificationCode } from '@utils/validateInputs'
import { getErrorMessage } from '@utils/errorHelpers'
import logo from '@assets/logo/logo-grey-dark.svg'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showError, showSuccess, showInfo } = useNotification()
  const { verifyEmailCode, resendVerificationCode } = useAuth()

  // Estado del componente
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  // Datos del formulario
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  // Estado para reenvío de código
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(120) // 2 minutos = 120 segundos

  // Información del estado (viene de navegación)
  const stateData = location.state || {}
  const { email: stateEmail, fromRegister, fromGoogle, autoVerified, message: stateMessage, userType = 'local' } = stateData

  // Inicializar componente
  useEffect(() => {
    // Si viene email del estado, establecerlo
    if (stateEmail) {
      setEmail(stateEmail)
    }

    // Si es usuario de Google y ya está verificado
    if (fromGoogle && autoVerified) {
      setStatus('success')
      setMessage(stateMessage || 'Tu cuenta de Google ha sido verificada exitosamente.')

      // Solo mostrar toast para Google - eliminar mensaje interno
      showSuccess('¡Tu cuenta de Google ha sido verificada exitosamente!')

      // Redirigir automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        navigate('/complete-profile', { replace: true })
      }, 3000)

      return () => clearTimeout(timer)
    }

    // Si viene de registro, SOLO mostrar el mensaje interno, NO toast
    if (fromRegister && stateEmail) {
      setMessage('Se ha enviado un código de verificación a tu correo electrónico.')
      // NO mostrar toast aquí - solo el mensaje visual
      startResendCountdown()
    }
  }, [stateEmail, fromRegister, fromGoogle, autoVerified, stateMessage, navigate, showSuccess])

  // Función para iniciar el countdown de reenvío
  const startResendCountdown = () => {
    setCanResend(false)
    setResendCountdown(120)

    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }

  // Formatear tiempo del countdown
  const formatCountdown = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    const codeError = validateVerificationCode(verificationCode)
    if (codeError) newErrors.code = codeError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Limpiar errores cuando el usuario escribe
  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value)
    } else if (field === 'code') {
      setVerificationCode(value)
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  // Enviar código de verificación
  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setStatus('submitting')
      setErrors({})

      // Usar el método del contexto de autenticación para verificar
      const result = await verifyEmailCode(email.toLowerCase().trim(), verificationCode)

      if (result.success) {
        setStatus('success')
        setMessage('¡Tu email ha sido verificado correctamente!')

        // Solo toast para verificación exitosa
        showSuccess('¡Tu email ha sido verificado correctamente!')

        // Redirigir después de 2 segundos
        setTimeout(() => {
          if (userType === 'google') {
            navigate('/complete-profile', { replace: true })
          } else {
            navigate('/login', {
              state: {
                message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
                email: email
              },
              replace: true
            })
          }
        }, 2000)
      } else {
        throw result.error || new Error('Error al verificar el código')
      }
    } catch (error) {
      console.error('Error en verificación:', error)
      setStatus('error')

      const errorMessage = getErrorMessage(error)
      setMessage(errorMessage)

      // Solo toast para errores
      showError(errorMessage, 'Error de verificación')

      // Si el código es inválido, limpiar el campo
      if (errorMessage.toLowerCase().includes('código')) {
        setVerificationCode('')
        setErrors({ code: 'Código inválido. Inténtalo de nuevo.' })
      }
    }
  }

  // Reenviar código de verificación
  const handleResendCode = async () => {
    if (!email) {
      setErrors({ email: 'Debes ingresar un email para reenviar el código' })
      return
    }

    const emailError = validateEmail(email)
    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    try {
      setResendLoading(true)
      setErrors({})

      // Usar el método del contexto para reenviar código
      const result = await resendVerificationCode(email.toLowerCase().trim())

      if (result.success) {
        // Actualizar mensaje interno Y mostrar toast
        setMessage('Se ha enviado un nuevo código de verificación a tu correo electrónico.')
        showSuccess('Código reenviado exitosamente')
        startResendCountdown()
      } else {
        throw result.error || new Error('Error al reenviar el código')
      }
    } catch (error) {
      console.error('Error al reenviar código:', error)
      const errorMessage = getErrorMessage(error)
      showError(errorMessage, 'Error al reenviar código')
    } finally {
      setResendLoading(false)
    }
  }

  // Si es usuario de Google verificado automáticamente
  if (fromGoogle && autoVerified && status === 'success') {
    return (
      <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20">
        <figure className="text-center pb-8">
          <img src={logo} alt="Logo Feeling" className="w-52" />
        </figure>

        <div className="flex flex-col w-full space-y-6 max-w-md">
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-6">
              <span className="material-symbols-outlined text-8xl drop-shadow-lg">check_circle</span>
            </div>
            <h2 className="text-2xl font-medium text-white mb-4 drop-shadow-md">¡Bienvenido a Feeling!</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400 mb-4">Redirigiendo para completar tu perfil...</p>

            {/* Barra de progreso animada */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20 pb-10">
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-52" />
      </figure>

      {status === 'success' ? (
        // Estado de éxito
        <div className="flex flex-col w-full space-y-6 max-w-md">
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-6">
              <span className="material-symbols-outlined text-8xl drop-shadow-lg">check_circle</span>
            </div>
            <h2 className="text-2xl font-medium text-white mb-4 drop-shadow-md">¡Verificación Exitosa!</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400 mb-4">Redirigiendo...</p>

            {/* Barra de progreso animada */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        // Formulario de verificación
        <Form className="flex flex-col w-full space-y-6" validationBehavior="aria" onSubmit={handleSubmit}>
          <h2 className="text-xl font-medium text-white mb-2">Verificar Email</h2>

          {/* Mensajes de estado - SOLO mostrar cuando NO sea de registro inicial */}
          {status === 'error' && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm w-full">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">error</span>
                {message}
              </div>
            </div>
          )}

          {/* Solo mostrar mensaje informativo si no es error y tiene mensaje */}
          {message && status !== 'error' && status !== 'success' && (
            <div className="bg-blue-900/30 border border-blue-800/50 text-blue-300 px-4 py-3 rounded-lg backdrop-blur-sm w-full">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">info</span>
                {message}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            {stateEmail
              ? 'Revisa tu bandeja de entrada y carpeta de spam. Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.'
              : 'Ingresa tu email y el código de verificación que recibiste.'}
          </p>

          {/* Campo de email - solo mostrar si no viene del estado */}
          {!stateEmail && (
            <Input
              variant="underlined"
              isRequired
              label="Correo electrónico"
              name="email"
              placeholder="usuario@correo.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => handleInputChange('email', e.target.value)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              className="mb-4 w-full"
              isDisabled={status === 'submitting'}
            />
          )}

          {/* Mostrar email si viene del estado */}
          {stateEmail && (
            <div className="mb-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 w-full">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-400">email</span>
                <div>
                  <p className="text-xs text-gray-400">Código enviado a:</p>
                  <p className="text-white font-medium">{stateEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Campo de código de verificación */}
          <Input
            variant="underlined"
            isRequired
            label="Código de verificación"
            name="code"
            placeholder="123456"
            type="text"
            maxLength={6}
            value={verificationCode}
            onChange={e => handleInputChange('code', e.target.value.replace(/\D/g, ''))}
            isInvalid={!!errors.code}
            errorMessage={errors.code}
            className="mb-6"
            isDisabled={status === 'submitting'}
            description="Código de 6 dígitos numéricos"
            startContent={<span className="material-symbols-outlined text-gray-400 text-sm">verified_user</span>}
          />

          {/* Botón de verificar */}
          <Button
            type="submit"
            radius="full"
            color="default"
            className="w-full py-3 mt-4 font-semibold shadow-md transition-all hover:shadow-lg"
            isLoading={status === 'submitting'}
            isDisabled={status === 'submitting'}>
            {status === 'submitting' ? 'Verificando...' : 'Verificar Código'}
          </Button>

          {/* Sección de reenvío de código */}
          <div className="space-y-4 w-full">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-500">¿No recibiste el código?</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="text-center">
              {canResend ? (
                <Button
                  variant="flat"
                  color="primary"
                  radius="full"
                  className="transition-all duration-300 hover:scale-105"
                  onPress={handleResendCode}
                  isLoading={resendLoading}
                  isDisabled={resendLoading}
                  startContent={!resendLoading && <span className="material-symbols-outlined">refresh</span>}>
                  {resendLoading ? 'Enviando...' : 'Reenviar código'}
                </Button>
              ) : (
                <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">Podrás solicitar un nuevo código en:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary-400">schedule</span>
                    <span className="font-mono text-lg text-primary-400 font-semibold">{formatCountdown(resendCountdown)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enlaces adicionales */}
          <div className="pt-6 border-t border-gray-700 space-y-4 w-full">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-3">¿Problemas con la verificación?</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-gray-300 underline transition-colors">
                  Volver al inicio de sesión
                </button>
                <span className="hidden sm:inline text-gray-600">•</span>
                <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-gray-300 underline transition-colors">
                  Crear nueva cuenta
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-800/20 backdrop-blur-sm p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-400 text-sm mt-0.5">lightbulb</span>
                <div className="text-xs text-gray-400 leading-relaxed">
                  <p className="font-medium text-gray-300 mb-1">Consejos para la verificación:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Revisa tu carpeta de spam o correo no deseado</li>
                    <li>• El código expira en 30 minutos</li>
                    <li>• Asegúrate de tener conexión a internet estable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </main>
  )
}

export default VerifyEmail
