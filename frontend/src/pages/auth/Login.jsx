import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useGoogleLogin } from '@react-oauth/google'
import useError from '@hooks/useError'
import useAuth from '@hooks/useAuth'
import { validateEmail, validatePassword } from '@utils/validateInputs'
import { getErrorMessage, getFieldErrors } from '@utils/errorUtils'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'

const FeelingLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showErrorModal } = useError()
  const { login, loginWithGoogle, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [errors, setErrors] = useState({})
  const fromPath = location.state?.from?.pathname || '/'

  // Si viene mensaje del estado (ej: desde verificación exitosa)
  const successMessage = location.state?.message

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleEmailChange = event => {
    setEmail(event.target.value)
    if (errors.email) setErrors({ ...errors, email: null })
  }

  const handlePasswordChange = event => {
    setPassword(event.target.value)
    if (errors.password) setErrors({ ...errors, password: null })
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      })
      return
    }

    const result = await login(email, password)
    console.log('Login result:', result)

    if (result.success) {
      console.log('Login route:', fromPath)
      navigate(fromPath, { replace: true })
    } else {
      const error = result.error
      const { errorInfo } = result

      const fieldErrors = getFieldErrors(error)

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }

      if (Object.keys(fieldErrors).length === 0 || errorInfo.status >= 500) {
        const errorMessage = getErrorMessage(error)
        showErrorModal(errorMessage, 'Error de inicio de sesión')
      }
    }
  }

  // Implementación del login con Google
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        setIsGoogleAuthenticating(true)

        // Usar el método específico de login con Google
        const result = await loginWithGoogle(tokenResponse)

        if (result.success) {
          navigate(fromPath, { replace: true })
        } else {
          // Si hay error, verificar si es porque la cuenta no existe
          if (result.error?.response?.status === 404 || result.error?.message?.toLowerCase().includes('no encontrado')) {
            // Sugerir registro
            showErrorModal('No encontramos una cuenta con este email de Google. ¿Quieres registrarte?', 'Cuenta no encontrada')
          } else {
            const errorMessage = getErrorMessage(result.error)
            showErrorModal(errorMessage, 'Error de inicio de sesión')
          }
        }
      } catch (error) {
        console.error('Error en login con Google:', error)
        showErrorModal('No se pudo completar el inicio de sesión con Google', 'Error de autenticación')
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: () => {
      showErrorModal('No se pudo completar la autenticación con Google', 'Error de autenticación')
      setIsGoogleAuthenticating(false)
    },
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    setIsGoogleAuthenticating(true)
    googleLogin()
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20">
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-52" />
      </figure>

      {/* Mensaje de éxito si viene de verificación */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-4 max-w-md w-full text-center">
          {successMessage}
        </div>
      )}

      <Form className="flex flex-col w-full space-y-6" validationBehavior="aria" onSubmit={handleSubmit}>
        <h2 className="text-xl font-medium text-white mb-6">Acceder</h2>

        <Input
          variant="underlined"
          isRequired
          label="Correo electrónico"
          name="email"
          placeholder="usuario@correo.com"
          type="email"
          autoComplete="email"
          aria-label="Email"
          value={email}
          onChange={handleEmailChange}
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          isDisabled={loading || isGoogleAuthenticating}
        />

        <Input
          variant="underlined"
          isRequired
          label="Contraseña"
          name="password"
          placeholder="••••••••"
          type={isVisible ? 'text' : 'password'}
          autoComplete="current-password"
          aria-label="Contraseña"
          value={password}
          onChange={handlePasswordChange}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          isDisabled={loading || isGoogleAuthenticating}
          endContent={
            <button
              aria-label="toggle password visibility"
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
              disabled={loading || isGoogleAuthenticating}>
              {isVisible ? (
                <span className="material-symbols-outlined">visibility_off</span>
              ) : (
                <span className="material-symbols-outlined">visibility</span>
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between w-full pt-2">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              label="Recordar sesión"
              color="primary"
              name="remember"
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              isDisabled={loading || isGoogleAuthenticating}
            />
            <span className="text-xs text-gray-500 ml-2">Recordar sesión</span>
          </label>

          <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-200 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="pt-6 space-y-6 w-full">
          <Button
            type="submit"
            radius="full"
            color="default"
            className="w-full py-3 transition-colors"
            isLoading={loading}
            isDisabled={loading || isGoogleAuthenticating}>
            {loading ? 'Iniciando sesión...' : 'Acceder'}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500">o</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <Button
            type="button"
            variant="flat"
            radius="full"
            color="primary"
            startContent={<img src={googleIcon} alt="Google" className="w-5 h-5" />}
            className="w-full py-2 mt-0 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            isLoading={isGoogleAuthenticating}
            isDisabled={isGoogleAuthenticating || loading}
            onPress={handleGoogleSignIn}>
            {isGoogleAuthenticating ? 'Conectando...' : 'Continuar con Google'}
          </Button>
        </div>

        <div className="w-full text-center text-xs text-gray-500 mt-6">
          ¿No tienes una cuenta?
          <Button as={Link} href="/register" variant="bordered" color="default" radius="full" className="w-full mt-4 transition-colors">
            Regístrate
          </Button>
        </div>
      </Form>
    </main>
  )
}

export default FeelingLogin
