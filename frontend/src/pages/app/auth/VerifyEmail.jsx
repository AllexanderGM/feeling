import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import logo from '@assets/logo/logo-grey-dark.svg'

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const { token } = useParams()
  const { verifyEmail } = useAuth()

  useEffect(() => {
    const verify = async () => {
      try {
        if (!token) {
          setStatus('error')
          setMessage('Token de verificación no válido')
          return
        }

        await verifyEmail(token)
        setStatus('success')
        setMessage('¡Tu email ha sido verificado correctamente!')
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'No se pudo verificar tu email. El enlace puede haber expirado.')
      }
    }

    verify()
  }, [token, verifyEmail])

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 min-h-screen p-6">
      <figure className="text-center">
        <img src={logo} alt="Logo Feeling" className="w-40" />
      </figure>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-xl font-medium text-white mb-4">Verificación de Email</h2>

        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-300">Verificando tu correo electrónico...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              to="/app/login"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors">
              Iniciar sesión
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">
              <span className="material-symbols-outlined text-6xl">error</span>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              to="/app/login"
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors">
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </main>
  )
}

export default VerifyEmail
