import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input, Button } from '@heroui/react'
import { usePassword } from '@hooks'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import { resetPasswordSchema } from '@schemas'
import { APP_PATHS } from '@constants/paths.js'
import { CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'

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
    const result = await resetPassword(token, formData.password, formData.confirmPassword)

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
      <figure className='text-center pb-8'>
        <img alt='Logo Feeling' className='w-52' src={logo} />
      </figure>

      {status === 'success' ? (
        <div className='flex flex-col items-center text-center space-y-6 w-full max-w-md'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400'>
            <CheckCircle className='h-12 w-12' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-xl font-medium text-white'>¡Contraseña restablecida!</h3>
            <p className='text-sm text-gray-400 leading-relaxed'>
              Tu contraseña ha sido actualizada con éxito. Puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
          <div className='animate-pulse text-gray-400 text-sm mt-4'>Redirigiendo al inicio de sesión...</div>
        </div>
      ) : (
        <Form className='flex flex-col w-full space-y-6' validationBehavior='aria' onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-xl font-medium text-white mb-6'>Restablecer contraseña</h2>

          <p className='text-sm text-gray-400 -mt-2'>Crea una nueva contraseña segura para tu cuenta.</p>

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
                isDisabled={loading}
                isInvalid={!!errors.password}
                label='Nueva contraseña'
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
                isDisabled={loading}
                isInvalid={!!errors.confirmPassword}
                label='Confirma tu nueva contraseña'
                placeholder='••••••••'
                startContent={<Lock className='text-gray-400 w-4 h-5' />}
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                variant='underlined'
              />
            )}
          />

          <div className='pt-6 space-y-6 w-full'>
            <Button
              className='w-full py-3 transition-colors'
              color='default'
              isDisabled={loading || !isValid}
              isLoading={loading}
              radius='full'
              type='submit'>
              {loading ? 'Actualizando...' : 'Restablecer contraseña'}
            </Button>
          </div>
        </Form>
      )}
    </LiteContainer>
  )
}

export default ResetPassword
