import { useState } from 'react'
import { Form, Input, Button, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CheckCircle, Mail } from 'lucide-react'
import { usePassword } from '@hooks'
import { forgotPasswordSchema } from '@schemas'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import { APP_PATHS } from '@constants/paths.js'

const ForgotPassword = () => {
  const { forgotPassword, loading } = usePassword()
  const [status, setStatus] = useState('idle')

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange'
  })

  const onSubmit = async formData => {
    const result = await forgotPassword(formData.email)

    if (result.success) setStatus('success')
  }

  return (
    <LiteContainer ariaLabel='Página de recuperación de contraseña'>
      <figure className='text-center pb-8'>
        <img alt='Logo Feeling' className='w-52' src={logo} />
      </figure>

      {status === 'success' ? (
        <div className='flex flex-col items-center text-center space-y-6 w-full max-w-md'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400'>
            <CheckCircle className='h-12 w-12' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-xl font-medium text-white'>¡Correo enviado!</h3>
            <p className='text-sm text-gray-400 leading-relaxed'>
              Revisa tu bandeja de entrada y sigue las instrucciones para crear una nueva contraseña.
            </p>
          </div>
          <Button as={Link} className='w-full mt-4' color='default' href={APP_PATHS.AUTH.LOGIN} radius='full' variant='bordered'>
            Volver al inicio de sesión
          </Button>
        </div>
      ) : (
        <Form className='flex flex-col w-full space-y-6' validationBehavior='aria' onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-xl font-medium text-white mb-6'>Recuperar contraseña</h2>

          <p className='text-sm text-gray-400 -mt-2'>Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.</p>

          <Controller
            control={control}
            name='email'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                autoComplete='email'
                errorMessage={errors.email?.message}
                isDisabled={loading}
                isInvalid={!!errors.email}
                label='Correo electrónico'
                placeholder='usuario@correo.com'
                startContent={<Mail className='text-gray-400 w-4 h-5' />}
                type='email'
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
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </div>

          <div className='w-full text-center text-xs text-gray-500 mt-6'>
            ¿Recordaste tu contraseña?
            <Button
              as={Link}
              className='w-full mt-4 transition-colors'
              color='default'
              href={APP_PATHS.AUTH.LOGIN}
              radius='full'
              variant='bordered'>
              Inicia sesión
            </Button>
          </div>
        </Form>
      )}
    </LiteContainer>
  )
}

export default ForgotPassword
