import { memo, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { AlertTriangle, CheckCircle, Pause, X, RotateCcw, Trash2, Play } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Modal de confirmación para acciones sobre eventos
 * Muestra mensajes y estilos apropiados según el tipo de acción
 */
const ConfirmActionModal = memo(({ isOpen, onClose, onConfirm, actionType, eventData, loading = false }) => {
  /**
   * Configuración de cada tipo de acción
   */
  const actionConfigs = useMemo(
    () => ({
      publish: {
        title: 'Publicar Evento',
        icon: <CheckCircle className='w-6 h-6 text-green-400' />,
        message: `¿Estás seguro de que deseas publicar el evento "${eventData?.title}"?`,
        description: 'El evento estará visible para todos los usuarios y podrán registrarse.',
        confirmText: 'Publicar',
        confirmColor: 'success',
        isDangerous: false
      },
      pause: {
        title: 'Pausar Evento',
        icon: <Pause className='w-6 h-6 text-orange-400' />,
        message: `¿Deseas pausar el evento "${eventData?.title}"?`,
        description: 'El evento dejará de aceptar nuevas inscripciones temporalmente. Podrás reactivarlo después.',
        confirmText: 'Pausar',
        confirmColor: 'warning',
        isDangerous: false
      },
      cancel: {
        title: 'Cancelar Evento',
        icon: <X className='w-6 h-6 text-red-400' />,
        message: `¿Estás seguro de que deseas cancelar el evento "${eventData?.title}"?`,
        description: 'Esta acción marcará el evento como cancelado. Los usuarios registrados deberán ser notificados.',
        confirmText: 'Cancelar Evento',
        confirmColor: 'danger',
        isDangerous: true
      },
      activate: {
        title: 'Activar Evento',
        icon: <RotateCcw className='w-6 h-6 text-green-400' />,
        message: `¿Deseas reactivar el evento "${eventData?.title}"?`,
        description: 'El evento volverá al estado "En Edición". Podrás editarlo y publicarlo nuevamente.',
        confirmText: 'Activar',
        confirmColor: 'success',
        isDangerous: false
      },
      delete: {
        title: 'Eliminar Evento',
        icon: <Trash2 className='w-6 h-6 text-red-400' />,
        message: `¿Estás seguro de que deseas eliminar permanentemente el evento "${eventData?.title}"?`,
        description: 'Esta acción no se puede deshacer. Se eliminará toda la información asociada al evento.',
        confirmText: 'Eliminar Permanentemente',
        confirmColor: 'danger',
        isDangerous: true
      },
      resume: {
        title: 'Reanudar Evento',
        icon: <Play className='w-6 h-6 text-green-400' />,
        message: `¿Deseas reanudar el evento "${eventData?.title}"?`,
        description: 'El evento volverá a estar visible y podrá aceptar nuevas inscripciones.',
        confirmText: 'Reanudar',
        confirmColor: 'success',
        isDangerous: false
      }
    }),
    [eventData?.title]
  )

  const config = actionConfigs[actionType] || actionConfigs.publish

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      backdrop='blur'
      classNames={{
        backdrop: 'bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20'
      }}
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
      isOpen={isOpen}
      placement='center'
      size='2xl'
      onClose={onClose}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                {config.icon}
                <h3 className='text-xl font-semibold'>{config.title}</h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className='space-y-4'>
                {/* Mensaje principal */}
                <p className='text-base font-medium text-foreground'>{config.message}</p>

                {/* Descripción */}
                <p className='text-sm text-default-500'>{config.description}</p>

                {/* Advertencia para acciones peligrosas */}
                {config.isDangerous && (
                  <div className='bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4'>
                    <div className='flex items-start gap-3'>
                      <AlertTriangle className='w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5' />
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-danger-700 dark:text-danger-400'>¡Atención!</p>
                        <p className='text-sm text-danger-600 dark:text-danger-500'>
                          {actionType === 'delete'
                            ? 'Una vez eliminado, no podrás recuperar este evento ni su información.'
                            : 'Esta acción puede afectar a los usuarios que ya están registrados en el evento.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información del evento */}
                {eventData && (
                  <div className='bg-default-100 dark:bg-default-50/5 rounded-lg p-4 space-y-2'>
                    <p className='text-xs font-medium text-default-500 uppercase'>Información del Evento</p>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <p className='text-xs text-default-500'>Estado actual</p>
                        <p className='text-sm font-medium text-foreground'>{eventData.status || 'N/A'}</p>
                      </div>
                      {eventData.eventDate && (
                        <div>
                          <p className='text-xs text-default-500'>Fecha del evento</p>
                          <p className='text-sm font-medium text-foreground'>
                            {new Date(eventData.eventDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                      {eventData.currentAttendees !== undefined && (
                        <div>
                          <p className='text-xs text-default-500'>Asistentes confirmados</p>
                          <p className='text-sm font-medium text-foreground'>
                            {eventData.currentAttendees || 0} / {eventData.maxCapacity || 0}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' isDisabled={loading} variant='light' onPress={onClose}>
                Cancelar
              </Button>
              <Button color={config.confirmColor} isLoading={loading} onPress={handleConfirm}>
                {config.confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
})

ConfirmActionModal.displayName = 'ConfirmActionModal'

ConfirmActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['publish', 'pause', 'cancel', 'activate', 'delete', 'resume']).isRequired,
  eventData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    status: PropTypes.string,
    eventDate: PropTypes.string,
    currentAttendees: PropTypes.number,
    maxCapacity: PropTypes.number
  }),
  loading: PropTypes.bool
}

export default ConfirmActionModal
