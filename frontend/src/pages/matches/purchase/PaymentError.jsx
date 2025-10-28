import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, Button } from '@heroui/react'
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft, HelpCircle, MessageCircle } from 'lucide-react'
import { APP_PATHS } from '@constants/paths'
import LiteContainer from '@components/layout/LiteContainer.jsx'

const PaymentError = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get transaction and plan data from navigation state
  const transaction = location.state?.transaction
  const plan = location.state?.plan
  const customError = location.state?.error // Custom error message from backend

  const handleRetryPayment = () => {
    if (plan) {
      navigate(APP_PATHS.USER.PURCHASE_CHECKOUT, { state: { plan } })
    } else {
      navigate(APP_PATHS.USER.PURCHASE_PLANS)
    }
  }

  const handleGoToPlans = () => {
    navigate(APP_PATHS.USER.PURCHASE_PLANS)
  }

  const handleContactSupport = () => {
    navigate(APP_PATHS.USER.SUPPORT)
  }

  const handleGoBack = () => {
    navigate(APP_PATHS.USER.MY_MATCHES)
  }

  // Determine error type and message
  const getErrorInfo = () => {
    // If there's a custom error from backend, prioritize it
    if (customError) {
      return {
        title: 'Error al Procesar la Compra',
        message: customError,
        type: 'backend_error'
      }
    }

    if (!transaction) {
      return {
        title: 'Transacción Cancelada',
        message: 'Has cancelado el proceso de pago',
        type: 'cancelled'
      }
    }

    if (transaction.status === 'DECLINED') {
      return {
        title: 'Pago Rechazado',
        message: 'Tu pago fue rechazado por el banco o entidad financiera',
        type: 'declined'
      }
    }

    return {
      title: 'Error en el Pago',
      message: 'Ocurrió un error al procesar tu pago',
      type: 'error'
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <>
      <Helmet>
        <title>Error en el Pago - Feeling</title>
        <meta content='Hubo un problema al procesar tu pago' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de error de pago' className='gap-6 max-w-3xl'>
        {/* Error Animation */}
        <div className='text-center space-y-6'>
          <div className='relative inline-block'>
            <div className='absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse' />
            <div className='relative w-24 h-24 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/50'>
              <XCircle className='w-14 h-14 text-red-400' />
            </div>
          </div>

          <div className='space-y-3'>
            <h1 className='text-4xl font-bold text-gray-100'>{errorInfo.title}</h1>
            <p className='text-lg text-gray-300'>{errorInfo.message}</p>
            <p className='text-sm text-gray-400'>No te preocupes, no se realizó ningún cargo a tu cuenta</p>
          </div>
        </div>

        {/* Error Details */}
        {transaction && (
          <Card className='bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 border-red-500/30'>
            <CardBody className='p-6'>
              <div className='flex items-start gap-3 mb-6'>
                <div className='w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center'>
                  <AlertTriangle className='w-5 h-5 text-red-400' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-100'>Detalles del Error</h2>
                  <p className='text-sm text-gray-400'>Información sobre el problema</p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='bg-gray-800/40 rounded-lg p-4 space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>ID de transacción:</span>
                    <span className='text-gray-300 font-mono'>{transaction.id || 'N/A'}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Estado:</span>
                    <span className='text-red-400 font-medium'>{transaction.status || 'ERROR'}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-400'>Fecha:</span>
                    <span className='text-gray-300'>{new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                  </div>
                  {transaction.errorMessage && (
                    <div className='flex flex-col gap-1 text-sm pt-2 border-t border-gray-700'>
                      <span className='text-gray-400'>Mensaje de error:</span>
                      <span className='text-orange-300 text-xs'>{transaction.errorMessage}</span>
                    </div>
                  )}
                </div>

                {plan && (
                  <div className='bg-gray-700/30 rounded-lg p-4'>
                    <div className='text-sm text-gray-400 mb-1'>Plan que intentabas comprar:</div>
                    <div className='text-base font-semibold text-gray-100'>{plan.name}</div>
                    <div className='text-xl font-bold text-gray-300 mt-1'>
                      {plan.price.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Button
            className='w-full'
            color='primary'
            size='lg'
            startContent={<RefreshCw className='w-4 h-4' />}
            variant='solid'
            onPress={handleRetryPayment}>
            Reintentar Pago
          </Button>

          <Button
            className='w-full'
            color='secondary'
            size='lg'
            startContent={<ArrowLeft className='w-4 h-4' />}
            variant='bordered'
            onPress={handleGoToPlans}>
            Ver Otros Planes
          </Button>
        </div>

        {/* Common Reasons */}
        <Card className='bg-gray-800/40 border-gray-700/50'>
          <CardBody className='p-6'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center'>
                <HelpCircle className='w-5 h-5 text-yellow-400' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-100'>Razones Comunes del Error</h2>
                <p className='text-sm text-gray-400'>Por qué puede fallar un pago</p>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='bg-gray-700/30 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-200 mb-2'>Fondos Insuficientes</h3>
                <p className='text-xs text-gray-400'>
                  Verifica que tu tarjeta o cuenta tenga fondos suficientes para completar la transacción.
                </p>
              </div>

              <div className='bg-gray-700/30 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-200 mb-2'>Datos Incorrectos</h3>
                <p className='text-xs text-gray-400'>
                  Asegúrate de ingresar correctamente el número de tarjeta, fecha de vencimiento y código de seguridad.
                </p>
              </div>

              <div className='bg-gray-700/30 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-200 mb-2'>Límites de la Tarjeta</h3>
                <p className='text-xs text-gray-400'>
                  Tu tarjeta puede tener límites diarios o mensuales. Contacta a tu banco para verificar.
                </p>
              </div>

              <div className='bg-gray-700/30 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-200 mb-2'>Restricciones del Banco</h3>
                <p className='text-xs text-gray-400'>
                  Algunos bancos bloquean transacciones en línea por seguridad. Contacta a tu banco para autorizar el pago.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Help Section */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Card className='bg-blue-500/5 border-blue-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                  <MessageCircle className='w-5 h-5 text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-sm font-semibold text-blue-400 mb-1'>¿Necesitas Ayuda?</h3>
                  <p className='text-xs text-blue-300/80 mb-3'>Nuestro equipo de soporte está aquí para ayudarte</p>
                  <Button color='primary' size='sm' variant='flat' onPress={handleContactSupport}>
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-purple-500/5 border-purple-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                  <HelpCircle className='w-5 h-5 text-purple-400' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-sm font-semibold text-purple-400 mb-1'>Otros Métodos de Pago</h3>
                  <p className='text-xs text-purple-300/80 mb-3'>Intenta con otra tarjeta o método de pago</p>
                  <Button color='secondary' size='sm' variant='flat' onPress={handleRetryPayment}>
                    Intentar de Nuevo
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tips */}
        <Card className='bg-yellow-500/5 border-yellow-500/20'>
          <CardBody className='p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <AlertTriangle className='w-4 h-4 text-yellow-400' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-yellow-400 mb-2'>Consejos para tu Próximo Intento</h3>
                <ul className='text-xs text-yellow-300/80 space-y-1 list-disc list-inside'>
                  <li>Verifica que todos los datos de tu tarjeta sean correctos</li>
                  <li>Asegúrate de tener fondos suficientes en tu cuenta</li>
                  <li>Intenta con un método de pago diferente si el problema persiste</li>
                  <li>Contacta a tu banco si sospechas que están bloqueando la transacción</li>
                  <li>Si el error continúa, nuestro equipo de soporte puede ayudarte</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Back Button */}
        <div className='text-center'>
          <Button color='default' size='sm' variant='light' onPress={handleGoBack}>
            <ArrowLeft className='w-4 h-4' />
            Volver a Matches
          </Button>
        </div>
      </LiteContainer>
    </>
  )
}

export default PaymentError
