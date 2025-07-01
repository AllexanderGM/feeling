import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input, Button, Link } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'
import { forgotPasswordSchema } from '@utils/formSchemas'
import { APP_PATHS } from '@constants/paths.js'

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuth()
  const [status, setStatus] = useState('idle') // idle, success

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange'
  })

  const onSubmit = async ({ email }) => {
    const result = await forgotPassword(email)
    if (result.success) {
      setStatus('success')
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 min-h-screen p-6">
      <figure className="text-center">
        <img src={logo} alt="Logo Feeling" className="w-40" />
      </figure>

      <div className="p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-medium text-white mb-4">Recuperar contraseña</h2>

        {status === 'success' ? (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <p className="text-gray-300 mb-6">Te hemos enviado un correo con instrucciones para restablecer tu contraseña.</p>
            <Link
              href={APP_PATHS.AUTH.LOGIN}
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <Form onSubmit={handleSubmit(onSubmit)} validationBehavior="aria">
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
                    className="mb-6"
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
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <div className="mt-6 text-center">
                <Link href={APP_PATHS.AUTH.LOGIN} className="text-gray-400 hover:text-gray-300 text-sm">
                  Volver al inicio de sesión
                </Link>
              </div>
            </Form>
          </>
        )}
      </div>
    </main>
  )
}

export default ForgotPassword
