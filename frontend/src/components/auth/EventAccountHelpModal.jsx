import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { Link as RouterLink } from 'react-router-dom'
import { AlertTriangle, Mail, KeyRound, Sparkles } from 'lucide-react'
import { APP_PATHS } from '@constants/paths.js'

const TITLES = {
  event: 'Completa tu registro',
  guest: 'Cuenta de invitado detectada',
  default: 'Necesitas activar tu cuenta'
}

const DESCRIPTIONS = {
  event: 'Registraste tu correo al participar en un evento. Antes de iniciar sesión, debemos crear una contraseña para tu cuenta.',
  guest: 'Este correo se registró como invitado. Para usar todas las funciones de Feeling, activa tu cuenta creando una contraseña.',
  default: 'Antes de continuar, activa tu cuenta creando o restableciendo una contraseña.'
}

const EventAccountHelpModal = ({
  isOpen,
  onClose,
  email = null,
  accountType = 'event',
  backendMessage = null,
  status = 'idle',
  onSendLink = null,
  isSending = false
}) => {
  const type = accountType || 'default'
  const title = TITLES[type] || TITLES.default
  const description = DESCRIPTIONS[type] || DESCRIPTIONS.default

  const sent = status === 'sent'
  const sendError = status === 'error'
  const missingEmail = status === 'missing-email' || (!email && !!onSendLink)

  return (
    <Modal
      backdrop='blur'
      classNames={{
        base: 'bg-gray-900 border border-gray-800',
        header: 'border-b border-gray-800',
        footer: 'border-t border-gray-800'
      }}
      isOpen={isOpen}
      placement='center'
      size='md'
      onClose={onClose}>
      <ModalContent>
        {close => (
          <>
            <ModalHeader className='flex items-start gap-3'>
              <div className='mt-1'>
                <AlertTriangle className='w-5 h-5 text-amber-400' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-100'>{title}</h2>
                <p className='text-sm text-gray-400'>{description}</p>
              </div>
            </ModalHeader>

            <ModalBody className='space-y-4 text-sm text-gray-300'>
              {backendMessage && (
                <div className='bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-100'>{backendMessage}</div>
              )}

              {email ? (
                <Chip
                  className='w-fit bg-amber-500/15 border border-amber-400/30 text-amber-200 uppercase tracking-wide text-[10px]'
                  startContent={<Mail className='w-3 h-3 text-amber-300' />}>
                  {email}
                </Chip>
              ) : (
                <p className='text-xs text-amber-200/90'>
                  Usa el correo con el que participaste en eventos o realizaste la compra como invitado para activar tu cuenta.
                </p>
              )}

              <div className='space-y-2'>
                <p className='font-medium text-gray-200 flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 text-amber-300' />
                  Pasos recomendados
                </p>
                <ul className='list-disc list-inside space-y-1 text-xs text-gray-400'>
                  {email ? (
                    <li>
                      {'Haz clic en '}
                      <span className='text-gray-200 font-medium'>“Enviar enlace para crear contraseña”</span>
                      {' y revisa tu correo.'}
                    </li>
                  ) : (
                    <li>Ingresa tu correo en la página de “Olvidé mi contraseña” para recibir el enlace de activación.</li>
                  )}
                  <li>Abre el link del correo y crea tu nueva contraseña segura.</li>
                  <li>Inicia sesión con tu correo y la contraseña recién creada.</li>
                </ul>
              </div>

              <div className='bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 text-xs text-gray-400 space-y-1'>
                <p className='flex items-center gap-2'>
                  <KeyRound className='w-3.5 h-3.5 text-amber-300' />
                  También puedes usar la opción “¿Olvidaste tu contraseña?” cuando vayas a iniciar sesión.
                </p>
              </div>

              {missingEmail && (
                <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-200'>
                  No pudimos detectar un correo. Asegúrate de ingresar el correo correcto antes de solicitar el enlace.
                </div>
              )}

              {sent && (
                <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-green-200'>
                  Enlace enviado. Revisa la bandeja de entrada y la carpeta de spam. Puedes solicitar otro enlace si lo necesitas.
                </div>
              )}

              {sendError && (
                <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-200'>
                  No pudimos enviar el enlace en este momento. Intenta nuevamente en unos segundos.
                </div>
              )}
            </ModalBody>

            <ModalFooter className='flex flex-col sm:flex-row gap-2'>
              <Button
                as={RouterLink}
                className='w-full sm:w-auto'
                color='default'
                to={APP_PATHS.AUTH.FORGOT_PASSWORD}
                variant='flat'
                onPress={close}>
                Ir a “Olvidé mi contraseña”
              </Button>

              {onSendLink && (
                <Button
                  className='w-full sm:w-auto'
                  color='warning'
                  isDisabled={missingEmail || isSending}
                  isLoading={isSending}
                  onPress={onSendLink}>
                  {sent ? 'Reenviar enlace' : 'Enviar enlace para crear contraseña'}
                </Button>
              )}

              <Button className='w-full sm:w-auto' color='primary' variant='solid' onPress={close}>
                Entendido
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default EventAccountHelpModal
