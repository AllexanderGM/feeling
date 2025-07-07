import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input, Button } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import { resetPasswordSchema } from '@utils/formSchemas'
import { APP_PATHS } from '@constants/paths.js'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword, loading } = useAuth()

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [status, setStatus] = useState('idle') // idle, success

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  })

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  const onSubmit = async ({ password, confirmPassword }) => {
    console.log('📝 Datos del formulario:', { token, password, confirmPassword })
    const result = await resetPassword(token, password, confirmPassword) // Notificaciones automáticas
    if (result.success) {
      setStatus('success')
      setTimeout(() => {
        navigate(APP_PATHS.AUTH.LOGIN, {
          state: { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
        })
      }, 3000)
    }
  }

  // Si no hay token, redirigir
  if (!token) {
    navigate(APP_PATHS.AUTH.FORGOT_PASSWORD)
    return null
  }

  return (
    <LiteContainer>
      <figure className="text-center">
        <img src={logo} alt="Logo Feeling" className="w-40" />
      </figure>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-medium text-white mb-4">Restablecer contraseña</h2>

        {status === 'success' ? (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">
              <CheckCircle className="text-6xl" />
            </div>
            <p className="text-gray-300 mb-6">
              Tu contraseña ha sido restablecida con éxito. Puedes iniciar sesión con tu nueva contraseña.
            </p>
            <div className="animate-pulse text-gray-400 text-sm">Redirigiendo al inicio de sesión...</div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">Crea una nueva contraseña segura para tu cuenta.</p>

            <Form onSubmit={handleSubmit(onSubmit)} validationBehavior="aria">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    variant="underlined"
                    isRequired
                    label="Nueva contraseña"
                    placeholder="••••••••"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    isInvalid={!!errors.password}
                    errorMessage={errors.password?.message}
                    isDisabled={loading}
                    className="mb-4"
                    endContent={
                      <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none">
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
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
                    label="Confirma tu nueva contraseña"
                    placeholder="••••••••"
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword?.message}
                    isDisabled={loading}
                    className="mb-6"
                    endContent={
                      <button type="button" onClick={toggleConfirmPasswordVisibility} className="focus:outline-none">
                        {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                )}
              />

              <Button
                type="submit"
                radius="full"
                color="default"
                className="w-full py-3 mt-4"
                isLoading={loading}
                isDisabled={loading || !isValid}>
                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
              </Button>
            </Form>
          </>
        )}
      </div>
    </LiteContainer>
  )
}

export default ResetPassword
