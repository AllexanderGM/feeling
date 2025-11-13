import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Form, Input, Button, Checkbox } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, Lock } from 'lucide-react'
import { useAuth, useOAuth, usePassword } from '@hooks'
import { loginSchema } from '@schemas'
import { Logger } from '@utils/logger.js'
import LiteContainer from '@components/layout/LiteContainer'
import EventAccountHelpModal from '@components/auth/EventAccountHelpModal.jsx'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'
import { parseAccountIssue } from '@utils/accountIssue.js'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const { loginWithGoogle, loading: oauthLoading } = useOAuth()
  const { forgotPassword, loading: passwordLoading } = usePassword()

  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [eventAccountInfo, setEventAccountInfo] = useState(null)
  const [eventAccountStatus, setEventAccountStatus] = useState('idle')

  // Verificar si Google OAuth está disponible
  const isGoogleAvailable = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

  const fromPath = location.state?.from?.pathname || APP_PATHS.ROOT
  const successMessage = location.state?.message

  // Combinar estados de loading
  const isLoading = loading || oauthLoading

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange'
  })

  const watchedEmail = watch('email')

  const handleSendPasswordLink = useCallback(async () => {
    if (passwordLoading) return

    const targetEmail = (eventAccountInfo?.email || watchedEmail || '').trim().toLowerCase()

    if (!targetEmail) {
      setEventAccountStatus('missing-email')

      return
    }

    setEventAccountStatus('sending')
    const response = await forgotPassword(targetEmail, true)

    if (response?.success) {
      setEventAccountStatus('sent')
      setEventAccountInfo(prev => (prev ? { ...prev, email: targetEmail } : prev))
    } else {
      setEventAccountStatus('error')
      setAuthError(response?.message || 'No pudimos enviar el enlace. Intenta nuevamente.')
    }
  }, [eventAccountInfo?.email, forgotPassword, passwordLoading, watchedEmail])

  const closeEventAccountModal = useCallback(() => {
    setEventAccountInfo(null)
    setEventAccountStatus('idle')
  }, [])

  useEffect(() => {
    if (
      eventAccountStatus === 'missing-email' &&
      ((eventAccountInfo?.email && eventAccountInfo.email.trim() !== '') || (watchedEmail && watchedEmail.trim() !== ''))
    ) {
      setEventAccountStatus('idle')
    }
  }, [eventAccountStatus, eventAccountInfo?.email, watchedEmail])

  const onSubmit = async formData => {
    setAuthError(null)
    setEventAccountInfo(null)
    setEventAccountStatus('idle')

    const normalizedEmail = formData.email.trim().toLowerCase()

    setValue('email', normalizedEmail)

    const result = await login(normalizedEmail, formData.password, false)

    if (result.success) {
      navigate(fromPath, { replace: true })

      return
    }

    const fallbackMessage =
      result.status === 401 ? 'Correo o contraseña incorrectos. Intenta nuevamente.' : 'No pudimos iniciar sesión. Verifica tus datos.'

    const accountIssue = parseAccountIssue(result, normalizedEmail)

    if (accountIssue) {
      setEventAccountInfo(accountIssue)
      setEventAccountStatus('idle')

      return
    }

    setAuthError(result.message || fallbackMessage)
  }

  // Siempre llamar useGoogleLogin, pero manejar el error graciosamente
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleAuthenticating(true)
      try {
        const result = await loginWithGoogle(
          tokenResponse.access_token,
          tokenResponse.token_type || 'Bearer',
          tokenResponse.scope || '',
          false
        )

        if (result.success) {
          navigate(fromPath, { replace: true })
        } else {
          const issue = parseAccountIssue(result, watchedEmail?.trim().toLowerCase() || null)

          if (issue) {
            setEventAccountInfo(issue)
            setEventAccountStatus('idle')
          } else {
            setAuthError(result.message || 'No pudimos iniciar sesión con Google. Intenta nuevamente.')
          }
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.AUTH, 'google_login', error)
        setAuthError('No pudimos iniciar sesión con Google. Intenta nuevamente.')
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: error => {
      Logger.error('Google login error:', error, { category: Logger.CATEGORIES.AUTH })
      setIsGoogleAuthenticating(false)
    },
    onNonOAuthError: () => {
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

      {authError && (
        <div className='bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded mb-4 max-w-md w-full text-sm'>
          {authError}
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

          <RouterLink className='text-xs text-gray-500 hover:text-gray-200 transition-colors' to={APP_PATHS.AUTH.FORGOT_PASSWORD}>
            ¿Olvidaste tu contraseña?
          </RouterLink>
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
            as={RouterLink}
            className='w-full mt-4 transition-colors'
            color='default'
            radius='full'
            to={APP_PATHS.AUTH.REGISTER}
            variant='bordered'>
            Regístrate
          </Button>
        </div>
      </Form>

      <EventAccountHelpModal
        accountType={eventAccountInfo?.type}
        backendMessage={eventAccountInfo?.message}
        email={eventAccountInfo?.email || watchedEmail?.trim().toLowerCase() || null}
        isOpen={Boolean(eventAccountInfo)}
        isSending={passwordLoading && eventAccountStatus === 'sending'}
        status={eventAccountStatus}
        onClose={closeEventAccountModal}
        onSendLink={handleSendPasswordLink}
      />
    </LiteContainer>
  )
}

export default Login
