import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input, Button } from '@heroui/react'
import { usePassword } from '@hooks'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import { resetPasswordSchema, extractResetPasswordData } from '@schemas'
import { APP_PATHS } from '@constants/paths.js'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword, loading } = usePassword()

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

  const onSubmit = async formData => {
    const data = extractResetPasswordData(formData)
    const result = await resetPassword(token, data.password, data.confirmPassword)

    if (result.success) {
      setStatus('success')
      setTimeout(() => {
        navigate(APP_PATHS.AUTH.LOGIN, {
          state: { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' }
        })
      }, 2000)
    }
  }

  // Si no hay token, redirigir
  if (!token) {
    navigate(APP_PATHS.AUTH.FORGOT_PASSWORD)

    return null
  }

  return (
    <LiteContainer ariaLabel='Página de restablecimiento de contraseña'>
      <figure className='text-center'>
        <img alt='Logo Feeling' className='w-40' src={logo} />
      </figure>

      <div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full'>
        <h2 className='text-xl font-medium text-white mb-4'>Restablecer contraseña</h2>

        {status === 'success' ? (
          <div className='text-center'>
            <div className='text-green-500 text-5xl mb-4'>
              <CheckCircle className='text-6xl' />
            </div>
            <p className='text-gray-300 mb-6'>
              Tu contraseña ha sido restablecida con éxito. Puedes iniciar sesión con tu nueva contraseña.
            </p>
            <div className='animate-pulse text-gray-400 text-sm'>Redirigiendo al inicio de sesión...</div>
          </div>
        ) : (
          <>
            <p className='text-gray-400 mb-6'>Crea una nueva contraseña segura para tu cuenta.</p>

            <Form validationBehavior='aria' onSubmit={handleSubmit(onSubmit)}>
              <Controller
                control={control}
                name='password'
                render={({ field }) => (
                  <Input
                    {...field}
                    isRequired
                    autoComplete='new-password'
                    className='mb-4'
                    endContent={
                      <button className='focus:outline-none' type='button' onClick={togglePasswordVisibility}>
                        {isPasswordVisible ? <EyeOff /> : <Eye />}
                      </button>
                    }
                    errorMessage={errors.password?.message}
                    isDisabled={loading}
                    isInvalid={!!errors.password}
                    label='Nueva contraseña'
                    placeholder='••••••••'
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
                    className='mb-6'
                    endContent={
                      <button className='focus:outline-none' type='button' onClick={toggleConfirmPasswordVisibility}>
                        {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                      </button>
                    }
                    errorMessage={errors.confirmPassword?.message}
                    isDisabled={loading}
                    isInvalid={!!errors.confirmPassword}
                    label='Confirma tu nueva contraseña'
                    placeholder='••••••••'
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    variant='underlined'
                  />
                )}
              />

              <Button
                className='w-full py-3 mt-4'
                color='default'
                isDisabled={loading || !isValid}
                isLoading={loading}
                radius='full'
                type='submit'>
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
