import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useGoogleLogin } from '@react-oauth/google'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'
import googleIcon from '@assets/icon/google-icon.svg'
import { APP_PATHS } from '@constants/paths.js'
import { loginSchema } from '@utils/formSchemas'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, loading } = useAuth()

  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false)

  const fromPath = location.state?.from?.pathname || APP_PATHS.ROOT
  const successMessage = location.state?.message

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange'
  })

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password) // Notificaciones automáticas
    if (result.success) {
      navigate(fromPath, { replace: true })
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleAuthenticating(true)
      try {
        const result = await loginWithGoogle(tokenResponse) // Notificaciones automáticas
        if (result.success) {
          navigate(fromPath, { replace: true })
        }
      } finally {
        setIsGoogleAuthenticating(false)
      }
    },
    onError: () => setIsGoogleAuthenticating(false),
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

      {successMessage && (
        <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-4 max-w-md w-full text-center">
          {successMessage}
        </div>
      )}

      <Form className="flex flex-col w-full space-y-6" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-medium text-white mb-6">Acceder</h2>

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
              autoComplete="current-password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              isDisabled={loading || isGoogleAuthenticating}
            />
          )}
        />

        <div className="flex items-center justify-between w-full pt-2">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              color="primary"
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              isDisabled={loading || isGoogleAuthenticating}
            />
            <span className="text-xs text-gray-500 ml-2">Recordar sesión</span>
          </label>

          <Link href={APP_PATHS.AUTH.FORGOT_PASSWORD} className="text-xs text-gray-500 hover:text-gray-200 transition-colors">
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
            isDisabled={loading || isGoogleAuthenticating || !isValid}>
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
          <Button
            as={Link}
            href={APP_PATHS.AUTH.REGISTER}
            variant="bordered"
            color="default"
            radius="full"
            className="w-full mt-4 transition-colors">
            Regístrate
          </Button>
        </div>
      </Form>
    </main>
  )
}

export default Login
