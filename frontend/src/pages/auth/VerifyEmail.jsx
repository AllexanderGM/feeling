import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useAuth from '@hooks/useAuth'
import { useNotification } from '@hooks/useNotification'
import { verifyEmailSchema } from '@utils/formSchemas'
import logo from '@assets/logo/logo-grey-dark.svg'
import { APP_PATHS } from '@constants/paths.js'
import { CheckCircle, Info, Mail, ShieldCheck, RefreshCw, Clock, Lightbulb } from 'lucide-react'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showInfo } = useNotification()
  const { verifyEmailCode, resendVerificationCode, loading } = useAuth()

  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(120)

  const stateData = location.state || {}
  const { email: stateEmail, fromRegister, fromGoogle, autoVerified, message: stateMessage, userType = 'local' } = stateData

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(verifyEmailSchema),
    defaultValues: {
      email: stateEmail || '',
      code: ''
    },
    mode: 'onChange'
  })

  useEffect(() => {
    if (stateEmail) setValue('email', stateEmail)

    if (fromGoogle && autoVerified) {
      setStatus('success')
      setMessage(stateMessage || 'Tu cuenta de Google ha sido verificada exitosamente.')

      const timer = setTimeout(() => {
        navigate(APP_PATHS.USER.COMPLETE_PROFILE, { replace: true })
      }, 3000)

      return () => clearTimeout(timer)
    }

    if (fromRegister && stateEmail) {
      setMessage('Se ha enviado un código de verificación a tu correo electrónico.')
      startResendCountdown()
    }
  }, [stateEmail, fromRegister, fromGoogle, autoVerified, stateMessage, navigate, setValue])

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

  const formatCountdown = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const onSubmit = async ({ email, code }) => {
    const result = await verifyEmailCode(email.toLowerCase().trim(), code)

    if (result.success) {
      setStatus('success')
      setMessage('¡Tu email ha sido verificado correctamente!')

      setTimeout(() => {
        if (userType === 'google') {
          navigate(APP_PATHS.USER.COMPLETE_PROFILE, { replace: true })
        } else {
          navigate(APP_PATHS.AUTH.LOGIN, {
            state: {
              message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
              email: email
            },
            replace: true
          })
        }
      }, 2000)
    } else {
      setValue('code', '')
    }
  }

  const handleResendCode = async () => {
    const email = getValues('email')
    if (!email) return

    setResendLoading(true)
    const result = await resendVerificationCode(email.toLowerCase().trim())

    if (result.success) {
      setMessage('Se ha enviado un nuevo código de verificación a tu correo electrónico.')
      showInfo('Código reenviado exitosamente')
      startResendCountdown()
    }

    setResendLoading(false)
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
              <CheckCircle className="text-8xl drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-4 drop-shadow-md">¡Bienvenido a Feeling!</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400 mb-4">Redirigiendo para completar tu perfil...</p>

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
        <div className="flex flex-col w-full space-y-6 max-w-md">
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-6">
              <CheckCircle className="text-8xl drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-4 drop-shadow-md">¡Verificación Exitosa!</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
            <p className="text-sm text-gray-400 mb-4">Redirigiendo...</p>

            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        <Form className="flex flex-col w-full space-y-6" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-medium text-white mb-2">Verificar Email</h2>

          {message && (
            <div className="bg-blue-900/30 border border-blue-800/50 text-blue-300 px-4 py-3 rounded-lg backdrop-blur-sm w-full">
              <div className="flex items-center gap-2">
                <Info className="text-blue-400" />
                {message}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            {stateEmail
              ? 'Revisa tu bandeja de entrada y carpeta de spam. Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.'
              : 'Ingresa tu email y el código de verificación que recibiste.'}
          </p>

          {!stateEmail && (
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
                  isDisabled={loading}
                />
              )}
            />
          )}

          {stateEmail && (
            <div className="mb-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 w-full">
              <div className="flex items-center gap-3">
                <Mail className="text-primary-400" />
                <div>
                  <p className="text-xs text-gray-400">Código enviado a:</p>
                  <p className="text-white font-medium">{stateEmail}</p>
                </div>
              </div>
            </div>
          )}

          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="underlined"
                isRequired
                label="Código de verificación"
                placeholder="123456"
                type="text"
                maxLength={6}
                isInvalid={!!errors.code}
                errorMessage={errors.code?.message}
                isDisabled={loading}
                description="Código de 6 dígitos numéricos"
                startContent={<ShieldCheck className="text-gray-400 text-sm" />}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '')
                  field.onChange(value)
                }}
              />
            )}
          />

          <Button
            type="submit"
            radius="full"
            color="default"
            className="w-full py-3 mt-4 font-semibold shadow-md transition-all hover:shadow-lg"
            isLoading={loading}
            isDisabled={loading || !isValid}>
            {loading ? 'Verificando...' : 'Verificar Código'}
          </Button>

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
                  startContent={!resendLoading && <RefreshCw />}>
                  {resendLoading ? 'Enviando...' : 'Reenviar código'}
                </Button>
              ) : (
                <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">Podrás solicitar un nuevo código en:</p>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="text-primary-400" />
                    <span className="font-mono text-lg text-primary-400 font-semibold">{formatCountdown(resendCountdown)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700 space-y-4 w-full">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-3">¿Problemas con la verificación?</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href={APP_PATHS.AUTH.LOGIN} className="text-gray-400 hover:text-gray-300 underline transition-colors">
                  Volver al inicio de sesión
                </Link>
                <span className="hidden sm:inline text-gray-600">•</span>
                <Link href={APP_PATHS.AUTH.REGISTER} className="text-gray-400 hover:text-gray-300 underline transition-colors">
                  Crear nueva cuenta
                </Link>
              </div>
            </div>

            <div className="bg-gray-800/20 backdrop-blur-sm p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-yellow-400 text-sm mt-0.5" />
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
