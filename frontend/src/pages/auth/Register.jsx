import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Form, Input, Button, Checkbox } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema } from '@schemas'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth, useOAuth } from '@hooks'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const { registerWithGoogle, loading: oauthLoading } = useOAuth()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  // Combinar estados de loading
  const isLoading = loading || oauthLoading

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

    const result = await register(formData)

    if (result.success) {
      navigate(APP_PATHS.AUTH.VERIFY_EMAIL, {
        state: {
          email: formData.email,
          fromRegister: true,
          userType: 'local'
        },
        replace: true
      })
    } else if (result.status === 422) {
      // Usuario ya existe pero email no verificado - redirigir a verify-email
      navigate(APP_PATHS.AUTH.VERIFY_EMAIL, {
        state: {
          email: formData.email,
          fromRegister: false,
          userType: 'local',
          autoResend: true, // Flag para indicar que debe reenviar automáticamente
          message:
            result.error?.message || 'Tu cuenta existe pero el correo electrónico aún no ha sido verificado. Revisa tu bandeja de entrada.'
        },
        replace: true
      })
    }
  }

  const googleRegistration = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleAuthenticating(true)
      try {
        const result = await registerWithGoogle(tokenResponse.access_token, tokenResponse.token_type || 'Bearer', tokenResponse.scope || '')

        if (result.success) navigate(APP_PATHS.USER.COMPLETE_PROFILE, { replace: true })
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: () => setIsGoogleAuthenticating(false),
    onNonOAuthError: () => {
      setIsGoogleAuthenticating(false)
    },
    flow: 'implicit'
  })

  const handleGoogleSignIn = () => {
    setIsGoogleAuthenticating(true)
    googleRegistration()
  }

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  return (
    <LiteContainer ariaLabel='Página de registro'>
      <figure className='text-center pb-8'>
        <img alt='Logo Feeling' className='w-36' src={logo} />
      </figure>

      <Form className='flex flex-col w-full space-y-4' validationBehavior='aria' onSubmit={handleSubmit(onSubmit)}>
        <h2 className='text-xl font-medium text-white text-center w-full'>Crear cuenta</h2>

        <div className='pt-6 space-y-6 w-full'>
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
            {isGoogleAuthenticating ? 'Registrando con Google...' : 'Registrarse con Google'}
          </Button>

          <div className='py-4 px-2 bg-gray-800/30 rounded-lg border border-gray-700/50'>
            <p className='text-xs text-gray-400 text-center leading-relaxed'>
              Al registrarte mediante Google, aceptas automáticamente nuestros{' '}
              <RouterLink className='text-gray-300 text-xs hover:underline' to='/terminos'>
                Términos y Condiciones
              </RouterLink>{' '}
              y la{' '}
              <RouterLink className='text-gray-300 text-xs hover:underline' to='/privacidad'>
                Política de Privacidad
              </RouterLink>
              .
            </p>
          </div>

          <div className='relative flex items-center py-2'>
            <div className='flex-grow border-t border-gray-700' />
            <span className='flex-shrink mx-4 text-xs text-gray-500'>o</span>
            <div className='flex-grow border-t border-gray-700' />
          </div>
        </div>

        <p className='text-sm text-gray-400 mb-4'>Completa el formulario para registrarte</p>

        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='name'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                errorMessage={errors.name?.message}
                isDisabled={isLoading || isGoogleAuthenticating}
                isInvalid={!!errors.name}
                label='Nombre(s)'
                placeholder='Tu(s) nombre(s)'
                startContent={<User className='text-gray-400 w-4 h-5' />}
                type='text'
                variant='underlined'
              />
            )}
          />

          <Controller
            control={control}
            name='lastName'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                errorMessage={errors.lastName?.message}
                isDisabled={isLoading || isGoogleAuthenticating}
                isInvalid={!!errors.lastName}
                label='Apellido(s)'
                placeholder='Tu(s) apellido(s)'
                startContent={<User className='text-gray-400 w-4 h-5' />}
                type='text'
                variant='underlined'
              />
            )}
          />
        </div>

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
              autoComplete='new-password'
              endContent={
                <button className='focus:outline-none' type='button' onClick={togglePasswordVisibility}>
                  {isPasswordVisible ? <EyeOff className='text-gray-400 w-4 h-5' /> : <Eye className='text-gray-400 w-4 h-5' />}
                </button>
              }
              errorMessage={errors.password?.message}
              isDisabled={isLoading || isGoogleAuthenticating}
              isInvalid={!!errors.password}
              label='Contraseña'
              placeholder='••••••••'
              startContent={<Lock className='text-gray-400 w-4 h-5' />}
              type={isPasswordVisible ? 'text' : 'password'}
              variant='underlined'
            />
          )}
        />

        <Controller
          control={control}
          name='confirmPassword'
          render={({ field }) => (
            <Input
              {...field}
              isRequired
              autoComplete='new-password'
              endContent={
                <button className='focus:outline-none' type='button' onClick={toggleConfirmPasswordVisibility}>
                  {isConfirmPasswordVisible ? <EyeOff className='text-gray-400 w-4 h-5' /> : <Eye className='text-gray-400 w-4 h-5' />}
                </button>
              }
              errorMessage={errors.confirmPassword?.message}
              isDisabled={isLoading || isGoogleAuthenticating}
              isInvalid={!!errors.confirmPassword}
              label='Confirma tu contraseña'
              placeholder='••••••••'
              startContent={<Lock className='text-gray-400 w-4 h-5' />}
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              variant='underlined'
            />
          )}
        />

        <div className='pt-4'>
          <label className='flex items-start cursor-pointer'>
            <Checkbox
              color='primary'
              isDisabled={isLoading || isGoogleAuthenticating}
              isInvalid={!!termsError}
              isSelected={termsAccepted}
              onValueChange={handleTermsChange}
            />
            <span className='text-xs text-gray-500 ml-2'>
              Acepto los{' '}
              <RouterLink className='text-gray-300 text-xs hover:underline' to='/terminos'>
                Términos y Condiciones
              </RouterLink>{' '}
              y la{' '}
              <RouterLink className='text-gray-300 text-xs hover:underline' to='/privacidad'>
                Política de Privacidad
              </RouterLink>
            </span>
          </label>
          {termsError && <p className='text-red-500 text-xs mt-1'>{termsError}</p>}
        </div>

        <div className='pt-6 space-y-6 w-full'>
          <Button
            className='w-full py-3 font-semibold shadow-md transition-all hover:shadow-lg'
            color='default'
            isDisabled={isLoading || !termsAccepted || isGoogleAuthenticating || !isValid}
            isLoading={loading}
            radius='full'
            type='submit'>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <div className='border-t border-gray-700 my-4' />

          <div className='w-full text-center'>
            <p className='text-sm text-gray-400 mb-2'>¿Ya tienes una cuenta?</p>
            <RouterLink className='text-sm text-gray-300 hover:text-white transition-colors underline' to={APP_PATHS.AUTH.LOGIN}>
              Inicia sesión aquí
            </RouterLink>
          </div>
        </div>
      </Form>
    </LiteContainer>
  )
}

export default Register
