import { useState } from 'react'
import { Form, Input, Button, Link } from '@heroui/react'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const { forgotPassword } = useAuth()

  const validate = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validate()) return

    try {
      setStatus('submitting')
      await forgotPassword(email)
      setStatus('success')
      setMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.')
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'No se pudo enviar el correo de recuperación. Inténtalo de nuevo más tarde.')
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
            <div className="text-green-500 textk-5xl mb-4">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              to="/app/login"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            {status === 'error' && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">{message}</div>}

            <p className="text-gray-400 mb-6">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <Form onSubmit={handleSubmit} validationBehavior="aria">
              <Input
                variant="underlined"
                isRequired
                label="Correo electrónico"
                name="email"
                placeholder="usuario@correo.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                className="mb-6"
              />

              <Button
                type="submit"
                radius="full"
                color="default"
                className="w-full py-3 mt-4"
                isLoading={status === 'submitting'}
                isDisabled={status === 'submitting'}>
                {status === 'submitting' ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <div className="mt-6 text-center">
                <Link href="/app/login" className="text-gray-400 hover:text-gray-300 text-sm">
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
