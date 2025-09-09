import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip, Progress } from '@heroui/react'
import { Clock, AlertTriangle, CheckCircle, Lightbulb, RefreshCw, Shield } from 'lucide-react'

const RateLimitModal = ({ isOpen, onClose, error = {} }) => {
  const [countdown, setCountdown] = useState(0)
  const [isActive, setIsActive] = useState(false)

  // Validar que error sea un objeto válido
  const safeError = error || {}
  const errorMessage = safeError.message || ''
  const errorCode = safeError.code || ''
  const errorTimestamp = safeError.timestamp || null

  // Extraer tiempo de espera del mensaje o usar default de 60 segundos
  const extractWaitTime = message => {
    if (!message) return 60

    // Buscar patrones como "1 minuto", "30 segundos", etc.
    const minuteMatch = message.match(/(\d+)\s*minuto/i)
    if (minuteMatch) return parseInt(minuteMatch[1]) * 60

    const secondMatch = message.match(/(\d+)\s*segundo/i)
    if (secondMatch) return parseInt(secondMatch[1])

    // Default: 60 segundos
    return 60
  }

  useEffect(() => {
    if (isOpen && errorCode === '429') {
      const waitTime = extractWaitTime(errorMessage)
      setCountdown(waitTime)
      setIsActive(true)
    }
  }, [isOpen, errorCode, errorMessage])

  useEffect(() => {
    let interval = null

    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => {
          if (countdown <= 1) {
            setIsActive(false)
            return 0
          }
          return countdown - 1
        })
      }, 1000)
    } else if (countdown === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, countdown])

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds} segundos`
  }

  const handleClose = () => {
    setIsActive(false)
    setCountdown(0)
    onClose()
  }

  const canRetry = countdown === 0 && !isActive

  const progressValue = countdown > 0 ? ((extractWaitTime(errorMessage) - countdown) / extractWaitTime(errorMessage)) * 100 : 100

  return (
    <Modal
      isOpen={isOpen}
      onClose={canRetry ? handleClose : undefined}
      size='2xl'
      backdrop='blur'
      hideCloseButton={countdown > 0}
      classNames={{
        backdrop: 'bg-black/80',
        base: 'border border-gray-700/50 bg-gray-900/95 backdrop-blur-sm',
        header: 'border-b border-gray-700/50',
        body: 'py-6',
        footer: 'border-t border-gray-700/50'
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        }
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-3 px-6 py-4'>
          <div className='flex items-center justify-center gap-3'>
            <div className='w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center'>
              <AlertTriangle className='w-6 h-6 text-orange-400' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-semibold text-gray-200'>Límite de peticiones excedido</h3>
              <p className='text-sm text-gray-400 mt-1'>Protección contra uso excesivo</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='px-6 space-y-6'>
          {/* Mensaje principal */}
          <Card className='bg-gray-800/40 border-gray-700/50'>
            <CardBody className='p-4'>
              <p className='text-gray-300 text-center leading-relaxed'>
                {errorMessage || 'Has realizado demasiadas peticiones en poco tiempo. Por favor, espera un momento antes de continuar.'}
              </p>
            </CardBody>
          </Card>

          {/* Sección de countdown */}
          {countdown > 0 && (
            <Card className='bg-orange-500/10 border-orange-500/30'>
              <CardBody className='p-6 text-center space-y-4'>
                <div className='flex items-center justify-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center'>
                    <Clock className='w-5 h-5 text-orange-400' />
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-orange-300'>Tiempo de espera</h4>
                    <p className='text-sm text-orange-200'>Podrás intentar de nuevo en:</p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-orange-300 mb-2'>{formatTime(countdown)}</div>
                    <Progress
                      value={progressValue}
                      color='warning'
                      className='max-w-md mx-auto'
                      classNames={{
                        base: 'bg-orange-500/20',
                        indicator: 'bg-gradient-to-r from-orange-400 to-yellow-400'
                      }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sección de éxito cuando puede reintentar */}
          {canRetry && (
            <Card className='bg-green-500/10 border-green-500/30'>
              <CardBody className='p-4 text-center space-y-3'>
                <div className='flex items-center justify-center gap-3'>
                  <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                    <CheckCircle className='w-5 h-5 text-green-400' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-green-300'>¡Listo para continuar!</h4>
                    <p className='text-sm text-green-200'>Ya puedes intentar de nuevo</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Consejos para evitar el error */}
          <Card className='bg-blue-500/10 border-blue-500/30'>
            <CardBody className='p-4 space-y-3'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <Lightbulb className='w-4 h-4 text-blue-400' />
                </div>
                <h4 className='font-semibold text-blue-300'>Consejos para evitar este error</h4>
              </div>

              <ul className='space-y-2 text-sm text-blue-200'>
                <li className='flex items-center gap-2'>
                  <div className='w-1 h-1 bg-blue-400 rounded-full'></div>
                  Espera unos segundos entre cada acción
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1 h-1 bg-blue-400 rounded-full'></div>
                  Evita hacer clic múltiples veces en los botones
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1 h-1 bg-blue-400 rounded-full'></div>
                  Refresca la página si experimentas problemas
                </li>
                <li className='flex items-center gap-2'>
                  <div className='w-1 h-1 bg-blue-400 rounded-full'></div>
                  Esta protección ayuda a mantener la estabilidad del servicio
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Información adicional de seguridad */}
          <div className='bg-gray-800/20 border border-gray-700/30 rounded-lg p-3'>
            <div className='flex items-center justify-center gap-2 text-xs text-gray-400'>
              <Shield className='w-3 h-3' />
              <span>Sistema de protección activo</span>
              <span>•</span>
              <span>Previene sobrecarga del servidor</span>
              <span>•</span>
              <span>Garantiza mejor experiencia para todos</span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className='px-6 py-4'>
          <div className='w-full space-y-3'>
            <Button
              color={canRetry ? 'success' : 'warning'}
              variant={canRetry ? 'solid' : 'bordered'}
              size='lg'
              className={`w-full font-semibold ${
                canRetry ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-orange-500/50 text-orange-300 bg-orange-500/10'
              }`}
              onClick={handleClose}
              isDisabled={!canRetry && countdown > 0}
              startContent={canRetry ? <RefreshCw className='w-4 h-4' /> : <Clock className='w-4 h-4' />}>
              {canRetry ? 'Entendido, intentar de nuevo' : `Esperar ${formatTime(countdown)}`}
            </Button>

            {errorTimestamp && (
              <div className='text-center'>
                <Chip size='sm' variant='flat' className='bg-gray-700/50 text-gray-400 text-xs'>
                  Error registrado:{' '}
                  {new Date(errorTimestamp).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Chip>
              </div>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default RateLimitModal
