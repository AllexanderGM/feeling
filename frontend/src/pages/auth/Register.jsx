import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema } from '@utils/formSchemas'
import { useGoogleLogin } from '@react-oauth/google'
import useError from '@hooks/useError'
import useAuth from '@hooks/useAuth'
import { getErrorMessage, getFieldErrors } from '@utils/errorHelpers'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'

const FeelingRegister = () => {
  const navigate = useNavigate()
  const { showErrorModal } = useError()
  const { register, registerWithGoogle, loading } = useAuth()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [termsError, setTermsError] = useState('')

  // Configuración de React Hook Form
  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  })

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  // Limpiar errores del servidor cuando el usuario empiece a escribir
  const handleFieldChange = fieldName => {
    if (serverErrors[fieldName]) {
      setServerErrors(prev => ({ ...prev, [fieldName]: null }))
    }
    clearErrors(fieldName)
  }

  // Manejar cambios en términos y condiciones
  const handleTermsChange = accepted => {
    setTermsAccepted(accepted)
    if (accepted && termsError) {
      setTermsError('')
    }
  }

  const onSubmit = async formData => {
    // Validar términos y condiciones
    if (!termsAccepted) {
      setTermsError('Debes aceptar los términos y condiciones')
      return
    }

    // Limpiar errores del servidor antes de enviar
    setServerErrors({})
    setTermsError('')

    // Preparar datos para el registro
    const userData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    }

    // Usar el servicio de autenticación
    const result = await register(userData)

    if (result.success) {
      // Redirigir al usuario a verificar su correo con el email como parámetro
      navigate(APP_PATHS.AUTH.VERIFY_EMAIL, {
        state: {
          email: formData.email.toLowerCase().trim(),
          fromRegister: true,
          userType: 'local'
        },
        replace: true
      })
    } else {
      const error = result.error
      const { errorInfo } = result

      // Manejar errores de campo específicos
      const fieldErrors = getFieldErrors(error)

      if (Object.keys(fieldErrors).length > 0) {
        setServerErrors(fieldErrors)
      }

      // Mostrar modal de error para errores generales o del servidor
      if (Object.keys(fieldErrors).length === 0 || errorInfo.status >= 500) {
        const errorMessage = getErrorMessage(error)
        showErrorModal(errorMessage, 'Error de registro')
      }
    }
  }

  // Implementación del registro con Google (sin cambios)
  const googleRegistration = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        setIsGoogleAuthenticating(true)

        const result = await registerWithGoogle(tokenResponse)

        if (result.success) {
          navigate(APP_PATHS.USER.COMPLETE_PROFILE, {
            state: {
              email: result.data.email,
              fromGoogle: true,
              autoVerified: true,
              message: 'Tu cuenta de Google ha sido registrada exitosamente. Tu email ya está verificado.'
            },
            replace: true
          })
        } else {
          let errorMessage = 'No se pudo completar el registro con Google'

          if (result.error?.response?.data?.error) {
            errorMessage = result.error.response.data.error
          }

          showErrorModal(errorMessage, 'Error de registro con Google')
        }
      } catch (error) {
        console.error('Error en registro con Google:', error)
        showErrorModal('No se pudo completar el registro con Google. Inténtalo de nuevo.', 'Error de registro')
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: error => {
      console.error('Google OAuth Error:', error)
      showErrorModal('No se pudo completar la autenticación con Google', 'Error de autenticación')
      setIsGoogleAuthenticating(false)
    },
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    setIsGoogleAuthenticating(true)
    googleRegistration()
  }

  // Combinar errores de validación y del servidor
  const getFieldError = fieldName => {
    return errors[fieldName]?.message || serverErrors[fieldName]
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-evenly gap-10 h-full max-h-fit w-full max-w-3xl px-8 py-20 pb-10">
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-36" />
      </figure>

      <Form className="flex flex-col w-full space-y-4" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-medium text-white text-center w-full">Crear cuenta</h2>

        <div className="pt-6 space-y-6 w-full">
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
            {isGoogleAuthenticating ? 'Registrando con Google...' : 'Registrarse con Google'}
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
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Nombre(s)"
                placeholder="Tu(s) nombre(s)"
                type="text"
                isInvalid={!!getFieldError('name')}
                errorMessage={getFieldError('name')}
                isDisabled={loading || isGoogleAuthenticating}
                onChange={e => {
                  field.onChange(e)
                  handleFieldChange('name')
                }}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Apellido(s)"
                placeholder="Tu(s) apellido(s)"
                type="text"
                isInvalid={!!getFieldError('lastName')}
                errorMessage={getFieldError('lastName')}
                isDisabled={loading || isGoogleAuthenticating}
                onChange={e => {
                  field.onChange(e)
                  handleFieldChange('lastName')
                }}
              />
            )}
          />
        </div>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              isRequired
              label="Correo electrónico"
              placeholder="usuario@correo.com"
              type="email"
              autoComplete="email"
              aria-label="Correo electrónico"
              isInvalid={!!getFieldError('email')}
              errorMessage={getFieldError('email')}
              isDisabled={loading || isGoogleAuthenticating}
              onChange={e => {
                field.onChange(e)
                handleFieldChange('email')
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              isRequired
              label="Contraseña"
              placeholder="••••••••"
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              aria-label="Contraseña"
              isInvalid={!!getFieldError('password')}
              errorMessage={getFieldError('password')}
              isDisabled={loading || isGoogleAuthenticating}
              onChange={e => {
                field.onChange(e)
                handleFieldChange('password')
              }}
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading || isGoogleAuthenticating}>
                  {isPasswordVisible ? (
                    <span className="material-symbols-outlined">visibility_off</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility</span>
                  )}
                </button>
              }
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              isRequired
              label="Confirma tu contraseña"
              placeholder="••••••••"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              aria-label="Confirma tu contraseña"
              isInvalid={!!getFieldError('confirmPassword')}
              errorMessage={getFieldError('confirmPassword')}
              isDisabled={loading || isGoogleAuthenticating}
              onChange={e => {
                field.onChange(e)
                handleFieldChange('confirmPassword')
              }}
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading || isGoogleAuthenticating}>
                  {isConfirmPasswordVisible ? (
                    <span className="material-symbols-outlined">visibility_off</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility</span>
                  )}
                </button>
              }
            />
          )}
        />

        <div className="pt-4">
          <label className="flex items-start cursor-pointer">
            <Checkbox
              color="primary"
              name="terms"
              isSelected={termsAccepted}
              onValueChange={handleTermsChange}
              isInvalid={!!termsError}
              isDisabled={loading || isGoogleAuthenticating}
            />
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
          {termsError && <p className="text-red-500 text-xs mt-1">{termsError}</p>}
        </div>

        <div className="pt-6 space-y-6 w-full">
          <Button
            type="submit"
            radius="full"
            color="default"
            className="w-full py-3 font-semibold shadow-md transition-all hover:shadow-lg"
            isLoading={loading}
            isDisabled={loading || !termsAccepted || isGoogleAuthenticating || !isValid}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="w-full text-center">
            <p className="text-sm text-gray-400 mb-2">¿Ya tienes una cuenta?</p>
            <Link href={APP_PATHS.AUTH.LOGIN} className="text-sm text-gray-300 hover:text-white transition-colors underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </Form>
    </main>
  )
}

export default FeelingRegister
