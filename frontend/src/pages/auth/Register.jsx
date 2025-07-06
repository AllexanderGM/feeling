import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema } from '@utils/formSchemas'
import { useGoogleLogin } from '@react-oauth/google'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'
import { User, Mail, Lock } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const { register, registerWithGoogle, loading } = useAuth()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [termsError, setTermsError] = useState('')

  const {
    control,
    handleSubmit,
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

  const handleTermsChange = accepted => {
    setTermsAccepted(accepted)
    if (accepted && termsError) setTermsError('')
  }

  const onSubmit = async formData => {
    if (!termsAccepted) {
      setTermsError('Debes aceptar los términos y condiciones')
      return
    }

    setTermsError('')

    const userData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    }

    const result = await register(userData)
    if (result.success) {
      navigate(APP_PATHS.AUTH.VERIFY_EMAIL, {
        state: {
          email: formData.email.toLowerCase().trim(),
          fromRegister: true,
          userType: 'local'
        },
        replace: true
      })
    }
  }

  const googleRegistration = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleAuthenticating(true)
      try {
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
        }
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: () => setIsGoogleAuthenticating(false),
    onNonOAuthError: () => setIsGoogleAuthenticating(false),
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    setIsGoogleAuthenticating(true)
    googleRegistration()
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
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                isDisabled={loading || isGoogleAuthenticating}
                startContent={<User className="text-gray-400 w-4 h-5" />}
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
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName?.message}
                isDisabled={loading || isGoogleAuthenticating}
                startContent={<User className="text-gray-400 w-4 h-5" />}
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
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              isDisabled={loading || isGoogleAuthenticating}
              startContent={<Mail className="text-gray-400 w-4 h-5" />}
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
              type="password"
              autoComplete="new-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              isDisabled={loading || isGoogleAuthenticating}
              startContent={<Lock className="text-gray-400 w-4 h-5" />}
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
              type="password"
              autoComplete="new-password"
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              isDisabled={loading || isGoogleAuthenticating}
              startContent={<Lock className="text-gray-400 w-4 h-5" />}
            />
          )}
        />

        <div className="pt-4">
          <label className="flex items-start cursor-pointer">
            <Checkbox
              color="primary"
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

export default Register
