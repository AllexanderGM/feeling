import { useEffect, useRef } from 'react'
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
  const hasReloadedUser = useRef(false)

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
    // Reload user data to get updated attempts count (only once)
    const reloadUserData = async () => {
      if (purchaseConfirmed && !hasReloadedUser.current) {
        hasReloadedUser.current = true
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
    navigate(APP_PATHS.ROOT)
  }

  const handleGoToPlans = () => {
    navigate(APP_PATHS.USER.PURCHASE_PLANS)
  }

  const handleDownloadReceipt = () => {
    Logger.info(Logger.CATEGORIES.UI, 'download_receipt', 'Downloading receipt for transaction', {
      transactionId: transactionSummary?.id,
      reference: paymentReference
    })

    // Crear HTML del recibo
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Compra - Feeling</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: white;
            color: #1a1a1a;
          }

          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 2px solid #e5e5e5;
            border-radius: 12px;
          }

          .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 2px solid #22c55e;
            margin-bottom: 30px;
          }

          .logo {
            font-size: 32px;
            font-weight: bold;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
          }

          .receipt-title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 5px;
          }

          .receipt-subtitle {
            font-size: 14px;
            color: #666;
          }

          .success-badge {
            display: inline-block;
            background: #dcfce7;
            color: #16a34a;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 15px 0;
          }

          .section {
            margin-bottom: 25px;
          }

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e5e5;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f5f5f5;
          }

          .info-label {
            color: #666;
            font-size: 14px;
          }

          .info-value {
            color: #1a1a1a;
            font-size: 14px;
            font-weight: 500;
            text-align: right;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #e5e5e5;
            margin-top: 10px;
          }

          .total-label {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
          }

          .total-value {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #666;
            font-size: 12px;
          }

          .footer p {
            margin: 5px 0;
          }

          @media print {
            body {
              padding: 0;
            }

            .receipt-container {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">Feeling</div>
            <h1 class="receipt-title">Recibo de Compra</h1>
            <p class="receipt-subtitle">Transacción exitosa</p>
            <div class="success-badge">✓ Pago Confirmado</div>
          </div>

          <div class="section">
            <h2 class="section-title">Detalles del Plan</h2>
            <div class="info-row">
              <span class="info-label">Plan adquirido:</span>
              <span class="info-value">${matchPlan?.name || 'Plan de Match'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Descripción:</span>
              <span class="info-value">${matchPlan?.description || '-'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Intentos de match incluidos:</span>
              <span class="info-value">+${matchPlan?.attempts || 0} ${matchPlan?.attempts === 1 ? 'intento' : 'intentos'}</span>
            </div>
            ${
              remainingAttempts != null
                ? `
            <div class="info-row">
              <span class="info-label">Intentos disponibles tras la compra:</span>
              <span class="info-value">${remainingAttempts} ${remainingAttempts === 1 ? 'intento' : 'intentos'}</span>
            </div>
            `
                : ''
            }
          </div>

          <div class="section">
            <h2 class="section-title">Información de la Transacción</h2>
            ${
              transactionSummary?.id
                ? `
            <div class="info-row">
              <span class="info-label">ID de transacción:</span>
              <span class="info-value">${transactionSummary.id}</span>
            </div>
            `
                : ''
            }
            ${
              paymentReference
                ? `
            <div class="info-row">
              <span class="info-label">Referencia de pago:</span>
              <span class="info-value">${paymentReference}</span>
            </div>
            `
                : ''
            }
            <div class="info-row">
              <span class="info-label">Fecha de compra:</span>
              <span class="info-value">${
                purchase?.userMatchPlan?.purchaseDate
                  ? new Date(purchase.userMatchPlan.purchaseDate).toLocaleString('es-CO', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })
                  : new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
              }</span>
            </div>
            <div class="info-row">
              <span class="info-label">Método de pago:</span>
              <span class="info-value">${(() => {
                const paymentMethod = transactionSummary?.paymentMethod || purchase?.paymentMethod

                if (!paymentMethod) return 'No informado'
                if (typeof paymentMethod === 'string') return paymentMethod

                return paymentMethod.type || paymentMethod.paymentMethodType || 'Método de pago'
              })()}</span>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Resumen de Pago</h2>
            <div class="total-row">
              <span class="total-label">Total Pagado:</span>
              <span class="total-value">${(matchPlan?.price || 0).toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Feeling - Plataforma de Conexiones Auténticas</strong></p>
            <p>Este es un comprobante electrónico de tu transacción</p>
            <p>Para cualquier consulta, contacta con nuestro equipo de soporte</p>
            <p style="margin-top: 15px; color: #999;">Generado el ${new Date().toLocaleString('es-CO', {
              dateStyle: 'long',
              timeStyle: 'short'
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Crear una nueva ventana con el recibo
    const printWindow = window.open('', '_blank')

    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()

      // Esperar a que se cargue el contenido y luego imprimir
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
    } else {
      // Si no se puede abrir la ventana, crear un blob y descargarlo
      const blob = new Blob([receiptHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `recibo-feeling-${transactionSummary?.id || 'compra'}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <>
      <Helmet>
        <title>¡Pago Exitoso! - Feeling</title>
        <meta content='Tu pago se ha procesado correctamente' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de confirmación de pago exitoso' className='gap-6 max-w-4xl !pt-0 !min-h-0 py-8'>
        {/* Header */}
        <div className='space-y-4 w-full'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-100'>¡Pago Exitoso!</h1>
              <p className='text-sm text-gray-400'>Tu compra se ha procesado correctamente</p>
            </div>
          </div>
          {remainingAttempts != null && (
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full'>
              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
              <p className='text-sm text-green-300 font-medium'>{remainingAttempts} intentos disponibles</p>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <Card className='bg-gray-800/40 border-gray-700/50 w-full'>
          <CardBody className='p-6'>
            {/* Header con icono */}
            <div className='flex items-start gap-3 mb-4'>
              <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center'>
                <Package className='w-5 h-5 text-green-400' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-100'>Detalles de la Compra</h2>
                <p className='text-sm text-gray-400'>Información de tu transacción</p>
              </div>
            </div>

            {/* Plan info */}
            <div className='bg-gray-700/30 rounded-lg p-4 space-y-3 mb-4'>
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

            {/* Additional Actions */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3 text-sm'>
              <button
                className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors'
                onClick={handleDownloadReceipt}>
                <Download className='w-4 h-4' />
                <span>Descargar recibo</span>
              </button>
              <div className='hidden sm:block w-px h-4 bg-gray-700' />
              <div className='flex items-center gap-2 text-gray-400'>
                <Mail className='w-4 h-4' />
                <span>Confirmación enviada por email</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Card className='bg-gray-800/40 border-gray-700/50 w-full'>
          <CardBody className='p-6 grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <Button className='w-full' color='primary' size='md' startContent={<Home className='w-4 h-4' />} onPress={handleGoHome}>
              Ir a Inicio
            </Button>

            <Button
              className='w-full'
              endContent={<ArrowRight className='w-4 h-4' />}
              size='md'
              variant='bordered'
              onPress={handleGoToMatches}>
              Ir a Matches
            </Button>

            <Button
              className='w-full'
              size='md'
              startContent={<Package className='w-4 h-4' />}
              variant='bordered'
              onPress={handleGoToPlans}>
              Ver Planes
            </Button>
          </CardBody>
        </Card>

        {/* Info Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Card className='bg-blue-500/5 border-blue-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <CheckCircle className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-blue-400 mb-1'>¿Qué sigue ahora?</h3>
                  <p className='text-xs text-gray-400'>
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
                <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Package className='w-5 h-5 text-purple-400' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-purple-400 mb-1'>Validez del Plan</h3>
                  <p className='text-xs text-gray-400'>
                    Tus intentos son válidos por 30 días desde la fecha de compra. Puedes usarlos cuando quieras durante este período.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </LiteContainer>
    </>
  )
}

export default PaymentSuccess
