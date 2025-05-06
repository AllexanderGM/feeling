import { useState } from 'react'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import useError from '@hooks/useError'
import { validateEmail, validatePassword } from '@utils/validateInputs'
import logo from '@assets/logo/logo-grey-dark.svg'

const FeelingLogin = () => {
  const { handleError, showErrorModal, showErrorAlert } = useError()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleEmailChange = e => {
    setEmail(e.target.value)
    if (errors.email) setErrors({ ...errors, email: null })
  }

  const handlePasswordChange = e => {
    setPassword(e.target.value)
    if (errors.password) setErrors({ ...errors, password: null })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      })
      return
    }

    try {
      setIsLoading(true)

      // Simular una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simular diferentes escenarios de error basados en el email o contraseña

      // 1. Error de conexión
      if (email.includes('error')) {
        throw new Error('No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet.')
      }

      // 2. Error de credenciales inválidas
      if (password === '123456') {
        // Simular una respuesta de API con error
        const apiError = {
          response: {
            status: 401,
            data: {
              message: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.',
              code: 'AUTH_FAILED'
            }
          }
        }
        throw apiError
      }

      // 3. Error de cuenta bloqueada
      if (email.includes('bloqueado')) {
        // Simular una respuesta de API con error
        const apiError = {
          response: {
            status: 403,
            data: {
              message: 'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en 30 minutos.',
              code: 'ACCOUNT_LOCKED',
              details: {
                remainingTime: '30 minutos',
                attemptsCount: 5
              }
            }
          }
        }
        throw apiError
      }

      // 4. Error de mantenimiento
      if (email.includes('mantenim')) {
        // Simular una respuesta de API con error
        const apiError = {
          response: {
            status: 503,
            data: {
              message: 'El servicio está en mantenimiento. Por favor, intenta más tarde.',
              code: 'SERVICE_UNAVAILABLE',
              details: {
                estimatedTime: '2 horas',
                maintenanceType: 'Actualización de base de datos'
              }
            }
          }
        }
        throw apiError
      }

      // Si todo sale bien, redireccionar o mostrar mensaje de éxito
      console.log('Inicio de sesión exitoso')

      // Limpiar errores después de un envío exitoso
      setErrors({})

      // Aquí iría la redirección o lógica adicional después del login exitoso
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)

      // Usar el manejador global de errores
      handleError(error)

      // También podemos actualizar el estado local para mostrar errores en el formulario
      if (error.response && error.response.status === 401) {
        setErrors({
          password: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20">
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-52" />
      </figure>

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
          endContent={
            <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibility}>
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
            <Checkbox label="Recordar sesión" color="primary" name="remember" isSelected={rememberMe} onValueChange={setRememberMe} />
            <span className="text-xs text-gray-500 ml-2">Recordar sesión</span>
          </label>

          <Link href="/recuperar-contrasena" className="text-xs text-gray-500 hover:text-gray-200 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          radius="full"
          color="default"
          className="w-full py-3 transition-colors mt-6"
          isLoading={isLoading}
          isDisabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Acceder'}
        </Button>

        <div className="w-full text-center text-xs text-gray-500">
          ¿No tienes una cuenta?
          <Button as={Link} href="/app/register" variant="bordered" color="default" radius="full" className="w-full mt-4 transition-colors">
            Regístrate
          </Button>
        </div>
      </Form>
    </main>
  )
}

export default FeelingLogin
