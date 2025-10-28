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
  const purchase = location.state?.purchase

  const matchPlan = purchase?.matchPlan || plan
  const transactionSummary = transaction || (purchase ? { id: purchase.transactionId, paymentMethod: purchase.paymentMethod } : null)
  const paymentReference = purchase?.paymentReference
  const remainingAttempts = purchase?.userMatchPlan?.remainingAttempts

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
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

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
    navigate(APP_PATHS.USER.MY_MATCHES)
  }

  const handleGoHome = () => {
    navigate(APP_PATHS.USER.PROFILE)
  }

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    Logger.info(Logger.CATEGORIES.UI, 'download_receipt', 'Downloading receipt for transaction', {
      transactionId: transactionSummary?.id,
      reference: paymentReference
    })
  }

  return (
    <>
      <Helmet>
        <title>¡Pago Exitoso! - Feeling</title>
        <meta content='Tu pago se ha procesado correctamente' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de confirmación de pago exitoso' className='gap-6 max-w-3xl'>
        {/* Success Header - Estilo consistente */}
        <div className='text-center space-y-4 py-4'>
          <div className='relative inline-block'>
            <div className='w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/40'>
              <CheckCircle className='w-10 h-10 text-green-400' />
            </div>
          </div>

          <div className='space-y-3'>
            <h1 className='text-3xl font-bold text-gray-100'>¡Pago Exitoso!</h1>
            <p className='text-base text-gray-300'>Tu compra se ha procesado correctamente</p>
            {remainingAttempts != null && (
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full'>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                <p className='text-sm text-green-300 font-medium'>{remainingAttempts} intentos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details - Estilo consistente */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
          <CardBody className='p-4 sm:p-6'>
            {/* Header con icono */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0'>
                <Package className='w-5 h-5 text-green-400' />
              </div>
              <div>
                <h2 className='text-base sm:text-lg font-semibold text-gray-200'>Detalles de la Compra</h2>
                <p className='text-sm text-gray-400'>Información de tu transacción</p>
              </div>
            </div>

            {/* Plan info */}
            <div className='bg-gray-800/40 rounded-lg p-4 space-y-3 mb-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-400'>Plan adquirido:</span>
                <span className='text-base font-semibold text-gray-100'>{matchPlan?.name || 'Plan de Match'}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-400'>Intentos de match:</span>
                <span className='text-base font-semibold text-green-400'>
                  +{matchPlan?.attempts || 0} {matchPlan?.attempts === 1 ? 'intento' : 'intentos'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-400'>Monto pagado:</span>
                <span className='text-xl font-bold text-green-400'>
                  {(matchPlan?.price || 0).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </span>
              </div>
            </div>

            {/* Transaction info */}
            {transactionSummary && (
              <div className='bg-gray-700/30 rounded-lg p-4 space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-400'>ID de transacción:</span>
                  <span className='text-gray-300 font-mono'>{transactionSummary.id || 'N/A'}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-400'>Fecha:</span>
                  <span className='text-gray-300'>
                    {purchase?.userMatchPlan?.purchaseDate
                      ? new Date(purchase.userMatchPlan.purchaseDate).toLocaleString('es-CO', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      : new Date().toLocaleDateString('es-CO', { dateStyle: 'medium' })}
                  </span>
                </div>
                {paymentReference && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Referencia:</span>
                    <span className='text-gray-300 font-mono truncate'>{paymentReference}</span>
                  </div>
                )}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-400'>Método de pago:</span>
                  <span className='text-gray-300'>
                    {(() => {
                      const paymentMethod = transactionSummary.paymentMethod || purchase?.paymentMethod

                      if (!paymentMethod) return 'No informado'
                      if (typeof paymentMethod === 'string') return paymentMethod

                      return paymentMethod.type || paymentMethod.paymentMethodType || 'Método de pago'
                    })()}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Action Buttons - Estilo consistente */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Button
            className='w-full font-semibold'
            color='primary'
            endContent={<ArrowRight className='w-4 h-4' />}
            size='lg'
            variant='solid'
            onPress={handleGoToMatches}>
            Ir a Matches
          </Button>

          <Button
            className='w-full font-semibold'
            color='default'
            size='lg'
            startContent={<Home className='w-4 h-4' />}
            variant='bordered'
            onPress={handleGoHome}>
            Ir al Inicio
          </Button>
        </div>

        {/* Additional Actions - Compactos */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-3 text-sm'>
          <button className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors' onClick={handleDownloadReceipt}>
            <Download className='w-4 h-4' />
            <span>Descargar recibo</span>
          </button>
          <div className='hidden sm:block w-px h-4 bg-gray-700' />
          <div className='flex items-center gap-2 text-gray-400'>
            <Mail className='w-4 h-4' />
            <span>Confirmación enviada por email</span>
          </div>
        </div>

        {/* Info Card - Estilo consistente */}
        <Card className='bg-blue-500/5 border-blue-500/20'>
          <CardBody className='p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <CheckCircle className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-blue-400 mb-1'>¿Qué sigue ahora?</h3>
                <p className='text-xs text-blue-300/80 leading-relaxed'>
                  Tus intentos de match ya están disponibles en tu cuenta. Ve a la sección de Matches y empieza a conectar con personas
                  increíbles. ¡Buena suerte!
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
      </LiteContainer>
    </>
  )
}

export default PaymentSuccess
