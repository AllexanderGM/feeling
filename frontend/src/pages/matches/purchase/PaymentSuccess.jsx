import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button } from '@heroui/react'
import { CheckCircle, Package, ArrowRight, Download, Mail, Home } from 'lucide-react'
import { APP_PATHS } from '@constants/paths'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import confetti from 'canvas-confetti'
import { useUser } from '@hooks'
import { Logger } from '@utils/logger.js'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCurrentUser } = useUser()

  // Get transaction and plan data from navigation state
  const transaction = location.state?.transaction
  const plan = location.state?.plan
  const purchaseConfirmed = location.state?.purchaseConfirmed

  useEffect(() => {
    // Reload user data to get updated attempts count
    const reloadUserData = async () => {
      if (purchaseConfirmed) {
        try {
          await getCurrentUser(false) // Reload user data silently
          Logger.info(Logger.CATEGORIES.SERVICE, 'reload_user_data', 'User data reloaded after purchase')
        } catch (error) {
          Logger.error(Logger.CATEGORIES.SERVICE, 'reload_user_data', 'Error reloading user data', { error })
        }
      }
    }

    reloadUserData()

    // Trigger confetti animation on successful payment
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)

        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [purchaseConfirmed, getCurrentUser])

  const handleGoToMatches = () => {
    navigate(APP_PATHS.USER.MATCHES)
  }

  const handleGoHome = () => {
    navigate(APP_PATHS.USER.PROFILE)
  }

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    Logger.info(Logger.CATEGORIES.UI, 'download_receipt', 'Downloading receipt for transaction', { transactionId: transaction?.id })
  }

  return (
    <>
      <Helmet>
        <title>¡Pago Exitoso! - Feeling</title>
        <meta content='Tu pago se ha procesado correctamente' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de confirmación de pago exitoso' className='gap-6 max-w-3xl'>
        {/* Success Animation */}
        <div className='text-center space-y-6'>
          <div className='relative inline-block'>
            <div className='absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse' />
            <div className='relative w-24 h-24 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/50'>
              <CheckCircle className='w-14 h-14 text-green-400' />
            </div>
          </div>

          <div className='space-y-3'>
            <h1 className='text-4xl font-bold text-gray-100'>¡Pago Exitoso!</h1>
            <p className='text-lg text-gray-300'>Tu compra se ha procesado correctamente</p>
            <p className='text-sm text-gray-400'>Ahora puedes empezar a usar tus nuevos intentos de match</p>
          </div>
        </div>

        {/* Transaction Details */}
        <Card className='bg-gradient-to-br from-green-900/20 via-emerald-900/20 to-teal-900/20 border-green-500/30'>
          <CardBody className='p-6'>
            <div className='flex items-start gap-3 mb-6'>
              <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center'>
                <Package className='w-5 h-5 text-green-400' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-100'>Detalles de la Compra</h2>
                <p className='text-sm text-gray-400'>Información de tu transacción</p>
              </div>
            </div>

            <div className='space-y-4'>
              {/* Plan Details */}
              <div className='bg-gray-800/40 rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>Plan adquirido:</span>
                  <span className='text-base font-semibold text-gray-100'>{plan?.name || 'Plan de Match'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>Intentos de match:</span>
                  <span className='text-base font-semibold text-green-400'>
                    +{plan?.attempts || 0} {plan?.attempts === 1 ? 'intento' : 'intentos'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>Monto pagado:</span>
                  <span className='text-xl font-bold text-green-400'>
                    {(plan?.price || 0).toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
              </div>

              {/* Transaction Info */}
              {transaction && (
                <div className='bg-gray-700/30 rounded-lg p-4 space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>ID de transacción:</span>
                    <span className='text-gray-300 font-mono'>{transaction.id || 'N/A'}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Fecha:</span>
                    <span className='text-gray-300'>{new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Método de pago:</span>
                    <span className='text-gray-300'>{transaction.paymentMethod || 'Tarjeta'}</span>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Button
            className='w-full'
            color='primary'
            endContent={<ArrowRight className='w-4 h-4' />}
            size='lg'
            variant='solid'
            onPress={handleGoToMatches}>
            Ir a Matches
          </Button>

          <Button className='w-full' color='secondary' size='lg' variant='bordered' onPress={handleGoHome}>
            <Home className='w-4 h-4' />
            Ir al Inicio
          </Button>
        </div>

        {/* Additional Actions */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Card className='bg-gray-800/40 border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer'>
            <CardBody className='p-4' onClick={handleDownloadReceipt}>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                  <Download className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-gray-100'>Descargar Recibo</h3>
                  <p className='text-xs text-gray-400'>PDF de tu compra</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-gray-800/40 border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                  <Mail className='w-5 h-5 text-purple-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-gray-100'>Confirmación Enviada</h3>
                  <p className='text-xs text-gray-400'>Revisa tu correo electrónico</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Info Cards */}
        <div className='space-y-4'>
          <Card className='bg-blue-500/5 border-blue-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <CheckCircle className='w-4 h-4 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-blue-400 mb-1'>¿Qué sigue ahora?</h3>
                  <p className='text-xs text-blue-300/80'>
                    Tus intentos de match ya están disponibles en tu cuenta. Ve a la sección de Matches y empieza a conectar con personas
                    increíbles. ¡Buena suerte!
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-green-500/5 border-green-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Mail className='w-4 h-4 text-green-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-green-400 mb-1'>Confirmación por Email</h3>
                  <p className='text-xs text-green-300/80'>
                    Hemos enviado un email de confirmación con los detalles de tu compra y tu recibo digital. Si no lo encuentras, revisa tu
                    carpeta de spam.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-purple-500/5 border-purple-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Package className='w-4 h-4 text-purple-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-purple-400 mb-1'>Validez del Plan</h3>
                  <p className='text-xs text-purple-300/80'>
                    Tus intentos son válidos por 30 días desde la fecha de compra. Puedes usarlos cuando quieras durante este período.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Thank You Message */}
        <Card className='bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-purple-500/30'>
          <CardBody className='p-6 text-center'>
            <h2 className='text-xl font-bold text-gray-100 mb-2'>¡Gracias por tu confianza!</h2>
            <p className='text-gray-300'>
              En Feeling estamos comprometidos en ayudarte a encontrar conexiones significativas. Si tienes alguna pregunta o necesitas
              ayuda, no dudes en contactarnos.
            </p>
          </CardBody>
        </Card>
      </LiteContainer>
    </>
  )
}

export default PaymentSuccess
