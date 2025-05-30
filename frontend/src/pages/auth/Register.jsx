import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useGoogleLogin } from '@react-oauth/google'
import useError from '@hooks/useError'
import useAuth from '@hooks/useAuth'
import { validateEmail, validatePassword, validateName, validateLastName, validatePasswordMatch } from '@utils/validateInputs'
import { getErrorMessage, getFieldErrors } from '@utils/errorHelpers'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'

const FeelingRegister = () => {
  const navigate = useNavigate()
  const { handleError, showErrorModal } = useError()
  const { register, loading } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [errors, setErrors] = useState({})

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const nameError = validateName(formData.name)
    if (nameError) newErrors.name = nameError

    const lastNameError = validateLastName(formData.lastName)
    if (lastNameError) newErrors.lastName = lastNameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    const passwordMatchError = validatePasswordMatch(formData.password, formData.confirmPassword)
    if (passwordMatchError) newErrors.confirmPassword = passwordMatchError

    if (!termsAccepted) {
      newErrors.terms = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!validateForm()) return

    // Preparar datos para el registro
    const userData = {
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    }

    // Usar el servicio de autenticación
    const result = await register(userData)

    if (result.success) {
      // Redirigir al usuario a verificar su correo
      navigate('/verify-email', {
        state: {
          email: formData.email,
          fromRegister: true
        },
        replace: true
      })
    } else {
      const error = result.error
      const { errorInfo } = result

      // Manejar errores de campo específicos
      const fieldErrors = getFieldErrors(error)

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }

      // Mostrar modal de error para errores generales o del servidor
      if (Object.keys(fieldErrors).length === 0 || errorInfo.status >= 500) {
        const errorMessage = getErrorMessage(error)
        showErrorModal(errorMessage, 'Error de registro')
      }
    }
  }

  // Implementación del login con Google
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        setIsGoogleAuthenticating(true)

        // Obtener datos del usuario de Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        })

        if (!userInfoResponse.ok) {
          throw new Error('Error al obtener la información del usuario de Google')
        }

        const googleUserData = await userInfoResponse.json()

        // Separar nombre y apellido
        const fullName = googleUserData.name || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Preparar datos para el registro usando la misma ruta
        const userData = {
          name: firstName,
          lastName: lastName || 'Usuario', // Fallback si no hay apellido
          email: googleUserData.email,
          password: `google_${googleUserData.sub}_${Date.now()}`, // Contraseña temporal única
          fromGoogle: true,
          googleId: googleUserData.sub,
          profilePicture: googleUserData.picture
        }

        // Usar el mismo endpoint de registro
        const result = await register(userData)

        if (result.success) {
          // Para usuarios de Google, redirigir directamente a verificación
          // ya que Google ya verificó el email
          navigate('/verify-email', {
            state: {
              email: googleUserData.email,
              fromGoogle: true,
              autoVerified: true
            },
            replace: true
          })
        } else {
          handleError(result.error)
        }
      } catch (error) {
        console.error('Error en registro con Google:', error)
        handleError(new Error('No se pudo completar el registro con Google'))
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: () => {
      handleError(new Error('No se pudo completar la autenticación con Google'))
      setIsGoogleAuthenticating(false)
    },
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    if (!termsAccepted) {
      setErrors({
        ...errors,
        terms: 'Debes aceptar los términos y condiciones para registrarte con Google'
      })
      return
    }

    setIsGoogleAuthenticating(true)
    googleLogin()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20 pb-10">
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-36" />
      </figure>

      <Form className="flex flex-col w-full space-y-4" validationBehavior="aria" onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium text-white mb-2">Crear cuenta</h2>

        <div className="pt-6 space-y-6 w-full">
          <Button
            type="button"
            variant="flat"
            radius="full"
            color="primary"
            startContent={<img src={googleIcon} alt="Google" className="w-5 h-5" />}
            className="w-full py-2 mt-0 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            isLoading={isGoogleAuthenticating}
            isDisabled={isGoogleAuthenticating}
            onPress={handleGoogleSignIn}>
            {isGoogleAuthenticating ? 'Conectando...' : 'Continuar con Google'}
          </Button>

          <div className="py-4 px-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Al registrarte mediante Google, aceptas automáticamente nuestros{' '}
              <Link href="/terminos" className="text-gray-300 text-xs hover:underline">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="text-gray-300 text-xs hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500">o</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">Completa el formulario para registrarte</p>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            variant="underlined"
            isRequired
            label="Nombre"
            name="name"
            placeholder="Tu nombre"
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
          />

          <Input
            variant="underlined"
            isRequired
            label="Apellido"
            name="lastName"
            placeholder="Tu apellido"
            type="text"
            value={formData.lastName}
            onChange={e => handleInputChange('lastName', e.target.value)}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName}
          />
        </div>

        <Input
          variant="underlined"
          isRequired
          label="Correo electrónico"
          name="email"
          placeholder="usuario@correo.com"
          type="email"
          autoComplete="email"
          aria-label="Correo electrónico"
          value={formData.email}
          onChange={e => handleInputChange('email', e.target.value)}
          isInvalid={!!errors.email}
          errorMessage={errors.email}
        />

        <Input
          variant="underlined"
          isRequired
          label="Contraseña"
          name="password"
          placeholder="••••••••"
          type={isPasswordVisible ? 'text' : 'password'}
          autoComplete="new-password"
          aria-label="Contraseña"
          value={formData.password}
          onChange={e => handleInputChange('password', e.target.value)}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          endContent={
            <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={togglePasswordVisibility}>
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
          label="Confirma tu contraseña"
          name="confirmPassword"
          placeholder="••••••••"
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          autoComplete="new-password"
          aria-label="Confirma tu contraseña"
          value={formData.confirmPassword}
          onChange={e => handleInputChange('confirmPassword', e.target.value)}
          isInvalid={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
          endContent={
            <button
              aria-label="toggle password visibility"
              className="focus:outline-none"
              type="button"
              onClick={toggleConfirmPasswordVisibility}>
              {isConfirmPasswordVisible ? (
                <span className="material-symbols-outlined">visibility_off</span>
              ) : (
                <span className="material-symbols-outlined">visibility</span>
              )}
            </button>
          }
        />

        <div className="pt-4">
          <label className="flex items-start cursor-pointer">
            <Checkbox color="primary" name="terms" isSelected={termsAccepted} onValueChange={setTermsAccepted} isInvalid={!!errors.terms} />
            <span className="text-xs text-gray-500 ml-2">
              Acepto los{' '}
              <Link href="/terminos" className="text-gray-300 text-xs hover:underline">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="text-gray-300 text-xs hover:underline">
                Política de Privacidad
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
        </div>

        <div className="pt-6 space-y-6 w-full">
          <Button
            type="submit"
            radius="full"
            color="default"
            className="w-full py-3 font-semibold shadow-md transition-all hover:shadow-lg"
            isLoading={loading}
            isDisabled={loading || !termsAccepted}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="w-full text-center">
            <p className="text-sm text-gray-400 mb-2">¿Ya tienes una cuenta?</p>
            <Link href="/app/login" className="text-sm text-gray-300 hover:text-white transition-colors underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </Form>
    </main>
  )
}

export default FeelingRegister
