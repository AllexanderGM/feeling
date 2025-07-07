import { useState } from 'react'
import { Form, Input, Button, Link } from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CheckCircle } from 'lucide-react'
import useAuth from '@hooks/useAuth'
import { forgotPasswordSchema } from '@utils/formSchemas'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'
import { APP_PATHS } from '@constants/paths.js'

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuth()
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

  const onSubmit = async ({ email }) => {
    const result = await forgotPassword(email)
    if (result.success) {
      setStatus('success')
    }
  }

  return (
    <LiteContainer>
      <figure className="text-center pb-8">
        <img src={logo} alt="Logo Feeling" className="w-52" />
      </figure>

      <div className="flex flex-col w-full space-y-6 max-w-md">
        <h2 className="text-xl font-medium text-white mb-6">Recuperar contraseña</h2>

        {status === 'success' ? (
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-6">
              <CheckCircle className="text-8xl drop-shadow-lg" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-4 drop-shadow-md">¡Correo enviado!</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Te hemos enviado un correo con instrucciones para restablecer tu contraseña.
            </p>
            <Button
              as={Link}
              href={APP_PATHS.AUTH.LOGIN}
              variant="bordered"
              color="default"
              radius="full"
              className="w-full mt-4 transition-colors">
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <Form className="flex flex-col w-full space-y-6" validationBehavior="aria" onSubmit={handleSubmit(onSubmit)}>
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

              <div className="pt-6 space-y-6 w-full">
                <Button
                  type="submit"
                  radius="full"
                  color="default"
                  className="w-full py-3 transition-colors"
                  isLoading={loading}
                  isDisabled={loading || !isValid}>
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>

                <div className="w-full text-center text-xs text-gray-500 mt-6">
                  ¿Recordaste tu contraseña?
                  <Link href={APP_PATHS.AUTH.LOGIN} className="text-gray-300 hover:text-white transition-colors underline ml-2">
                    Inicia sesión aquí
                  </Link>
                </div>
              </div>
            </Form>
          </>
        )}
      </div>
    </LiteContainer>
  )
}

export default ForgotPassword
