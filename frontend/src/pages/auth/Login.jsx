import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, Lock } from 'lucide-react'
import { useAuth, useOAuth } from '@hooks/auth'
import { loginSchema, extractLoginData } from '@schemas'
import { Logger } from '@utils/logger.js'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const { loginWithGoogle, loading: oauthLoading } = useOAuth()

  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)

  // Verificar si Google OAuth está disponible
  const isGoogleAvailable = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  const fromPath = location.state?.from?.pathname || APP_PATHS.ROOT
  const successMessage = location.state?.message

  // Combinar estados de loading
  const isLoading = loading || oauthLoading

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange'
  })

  const onSubmit = async formData => {
    const data = extractLoginData(formData)
    const result = await login(data.email, data.password)

    if (result.success) navigate(fromPath, { replace: true })
  }

  // Siempre llamar useGoogleLogin, pero manejar el error graciosamente
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleAuthenticating(true)
      try {
        const result = await loginWithGoogle(tokenResponse)

        if (result.success) navigate(fromPath, { replace: true })
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: error => {
      Logger.error('Google login error:', error, { category: Logger.CATEGORIES.AUTH })
      setIsGoogleAuthenticating(false)
    },
    onNonOAuthError: error => {
      Logger.error('Google non-OAuth error:', error, { category: Logger.CATEGORIES.AUTH })
      setIsGoogleAuthenticating(false)
    },
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    if (googleLogin && isGoogleAvailable) {
      setIsGoogleAuthenticating(true)
      googleLogin()
    } else {
      Logger.warn('Google OAuth no está configurado', { category: Logger.CATEGORIES.AUTH })
    }
  }

  return (
    <LiteContainer ariaLabel='Página de inicio de sesión'>
      <figure className='text-center pb-8'>
        <img alt='Logo Feeling' className='w-52' src={logo} />
      </figure>

      {successMessage && (
        <div className='bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-4 max-w-md w-full text-center'>
          {successMessage}
        </div>
      )}

      <Form className='flex flex-col w-full space-y-6' validationBehavior='aria' onSubmit={handleSubmit(onSubmit)}>
        <h2 className='text-xl font-medium text-white mb-6'>Acceder</h2>

        <Controller
          control={control}
          name='email'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              autoComplete='email'
              errorMessage={errors.email?.message}
              isDisabled={isLoading || isGoogleAuthenticating}
              isInvalid={!!errors.email}
              label='Correo electrónico'
              placeholder='usuario@correo.com'
              startContent={<Mail className='text-gray-400 w-4 h-5' />}
              type='email'
              variant='underlined'
            />
          )}
        />

        <Controller
          control={control}
          name='password'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              autoComplete='current-password'
              errorMessage={errors.password?.message}
              isDisabled={isLoading || isGoogleAuthenticating}
              isInvalid={!!errors.password}
              label='Contraseña'
              placeholder='••••••••'
              startContent={<Lock className='text-gray-400 w-4 h-5' />}
              type='password'
              variant='underlined'
            />
          )}
        />

        <div className='flex items-center justify-between w-full pt-2'>
          <label className='flex items-center cursor-pointer' htmlFor='rememberMe'>
            <Checkbox
              color='primary'
              id='rememberMe'
              isDisabled={isLoading || isGoogleAuthenticating}
              isSelected={rememberMe}
              onValueChange={setRememberMe}
            />
            <span className='text-xs text-gray-500 ml-2'>Recordar sesión</span>
          </label>

          <Link className='text-xs text-gray-500 hover:text-gray-200 transition-colors' href={APP_PATHS.AUTH.FORGOT_PASSWORD}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className='pt-6 space-y-6 w-full'>
          <Button
            className='w-full py-3 transition-colors'
            color='default'
            isDisabled={isLoading || isGoogleAuthenticating || !isValid}
            isLoading={loading}
            radius='full'
            type='submit'>
            {loading ? 'Iniciando sesión...' : 'Acceder'}
          </Button>

          {isGoogleAvailable && (
            <>
              <div className='relative flex items-center py-2'>
                <div className='flex-grow border-t border-gray-700' />
                <span className='flex-shrink mx-4 text-xs text-gray-500'>o</span>
                <div className='flex-grow border-t border-gray-700' />
              </div>

              <Button
                className='w-full py-2 mt-0 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors'
                color='primary'
                isDisabled={isGoogleAuthenticating || isLoading}
                isLoading={isGoogleAuthenticating}
                radius='full'
                startContent={<img alt='Google' className='w-5 h-5' src={googleIcon} />}
                type='button'
                variant='flat'
                onPress={handleGoogleSignIn}>
                {isGoogleAuthenticating ? 'Conectando...' : 'Continuar con Google'}
              </Button>
            </>
          )}
        </div>

        <div className='w-full text-center text-xs text-gray-500 mt-6'>
          ¿No tienes una cuenta?
          <Button
            as={Link}
            className='w-full mt-4 transition-colors'
            color='default'
            href={APP_PATHS.AUTH.REGISTER}
            radius='full'
            variant='bordered'>
            Regístrate
          </Button>
        </div>
      </Form>
    </LiteContainer>
  )
}

export default Login
