import { memo, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { AlertTriangle, CheckCircle, Pause, X, RotateCcw, Trash2, Play, Undo2, Calendar, MapPin, Users } from 'lucide-react'
import PropTypes from 'prop-types'
import { EVENT_STATUS_DISPLAY } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay } from '@utils/dateUtils.js'

/**
 * Modal de confirmación para acciones sobre eventos
 * Muestra mensajes y estilos consistentes con la tabla de usuarios
 */
const ConfirmActionModal = memo(({ isOpen, onClose, onConfirm, actionType, eventData, loading = false }) => {
  const actionConfigs = useMemo(
    () => ({
      publish: {
        title: 'Publicar evento',
        subtitle: 'El evento quedará visible para los usuarios',
        icon: CheckCircle,
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        message: `¿Confirmas que deseas publicar "${eventData?.title}"?`,
        description: 'El evento estará visible y permitirá nuevas inscripciones.',
        confirmText: 'Publicar',
        confirmColor: 'success',
        confirmIcon: CheckCircle,
        isDangerous: false
      },
      pause: {
        title: 'Pausar evento',
        subtitle: 'Detendrá temporalmente nuevas inscripciones',
        icon: Pause,
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-400',
        message: `¿Deseas pausar "${eventData?.title}"?`,
        description: 'Los usuarios no podrán registrarse mientras el evento esté pausado.',
        confirmText: 'Pausar',
        confirmColor: 'warning',
        confirmIcon: Pause,
        isDangerous: false
      },
      cancel: {
        title: 'Cancelar evento',
        subtitle: 'Comunica a los usuarios inscritos',
        icon: X,
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        message: `¿Confirmas que deseas cancelar "${eventData?.title}"?`,
        description: 'El evento dejará de estar disponible y los usuarios deberán ser notificados.',
        confirmText: 'Cancelar evento',
        confirmColor: 'danger',
        confirmIcon: X,
        isDangerous: true,
        dangerTitle: 'Acción irreversible',
        dangerMessage: 'Una vez cancelado, el evento no estará disponible para compra ni visualización hasta que lo reactives.'
      },
      activate: {
        title: 'Activar evento',
        subtitle: 'Regresa el evento al estado En Edición',
        icon: RotateCcw,
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        message: `¿Deseas reactivar "${eventData?.title}"?`,
        description: 'El evento quedará disponible para ajustes antes de publicarlo nuevamente.',
        confirmText: 'Activar',
        confirmColor: 'success',
        confirmIcon: RotateCcw,
        isDangerous: false
      },
      back_to_edition: {
        title: 'Mover a edición',
        subtitle: 'El evento dejará de ser visible públicamente',
        icon: Undo2,
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-400',
        message: `¿Deseas mover "${eventData?.title}" a edición?`,
        description: 'Podrás ajustar la información antes de volver a publicarlo.',
        confirmText: 'Mover a edición',
        confirmColor: 'warning',
        confirmIcon: Undo2,
        isDangerous: false
      },
      delete: {
        title: 'Eliminar evento',
        subtitle: 'Eliminará toda la información asociada',
        icon: Trash2,
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        message: `¿Confirmas que deseas eliminar "${eventData?.title}"?`,
        description: 'Esta acción no se puede deshacer y eliminará registros, estadísticas e inscripciones.',
        confirmText: 'Eliminar permanentemente',
        confirmColor: 'danger',
        confirmIcon: Trash2,
        isDangerous: true,
        dangerTitle: 'Acción irreversible',
        dangerMessage: 'Una vez eliminado, no podrás recuperar este evento ni sus datos relacionados.'
      },
      resume: {
        title: 'Reanudar evento',
        subtitle: 'Retoma la visibilidad pública',
        icon: Play,
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        message: `¿Deseas reanudar "${eventData?.title}"?`,
        description: 'El evento volverá a aceptar registros y a mostrarse en la plataforma.',
        confirmText: 'Reanudar',
        confirmColor: 'success',
        confirmIcon: Play,
        isDangerous: false
      }
    }),
    [eventData?.title]
  )

  const config = actionConfigs[actionType] || actionConfigs.publish

  const handleConfirm = () => {
    onConfirm?.()
  }

  const formattedDate = eventData?.eventDate ? formatJavaDateForDisplay(eventData.eventDate) : null
  const attendees = eventData?.currentAttendees ?? 0
  const capacity = eventData?.maxCapacity || eventData?.capacity || 'Sin límite'
  const statusMeta = eventData?.status ? EVENT_STATUS_DISPLAY[eventData.status] : null

  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-800 shadow-2xl',
        header: 'border-b border-gray-800',
        body: 'py-6',
        footer: 'border-t border-gray-800'
      }}
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
      isOpen={isOpen}
      placement='center'
      size='lg'
      onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
              <config.icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-200'>{config.title}</h3>
              <p className='text-sm text-gray-400'>{config.subtitle}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className='space-y-4'>
          <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2'>
            <p className='text-sm font-medium text-gray-200'>{config.message}</p>
            <p className='text-xs text-gray-400'>{config.description}</p>
          </div>

          {config.isDangerous && (
            <div className='bg-red-500/20 border border-red-500/40 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <AlertTriangle className='w-4 h-4 text-red-400' />
                <span className='text-sm font-medium text-red-300'>{config.dangerTitle || 'Advertencia'}</span>
              </div>
              <p className='text-xs text-red-200'>
                {config.dangerMessage || 'Esta acción puede afectar a los usuarios registrados. Asegúrate de comunicar los cambios.'}
              </p>
            </div>
          )}

          {eventData && (
            <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-sm font-semibold text-gray-200'>Resumen del evento</span>
                {statusMeta && (
                  <Chip color={statusMeta.color || 'default'} size='sm' variant='flat'>
                    {statusMeta.label || eventData.status}
                  </Chip>
                )}
              </div>

              {eventData.location && (
                <div className='flex items-center gap-2 text-xs text-gray-300'>
                  <MapPin className='w-3 h-3 text-primary-400' />
                  <span>{eventData.location}</span>
                </div>
              )}

              <div className='grid grid-cols-2 gap-3'>
                {formattedDate && (
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-blue-400' />
                    <div className='flex flex-col'>
                      <span className='text-[11px] text-gray-400 uppercase tracking-wide'>Fecha</span>
                      <span className='text-xs text-gray-200'>{formattedDate}</span>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-blue-300' />
                  <div className='flex flex-col'>
                    <span className='text-[11px] text-gray-400 uppercase tracking-wide'>Cupos</span>
                    <span className='text-xs text-gray-200'>
                      {attendees} / {capacity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='default' isDisabled={loading} variant='light' onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color={config.confirmColor}
            isLoading={loading}
            startContent={<config.confirmIcon className='w-4 h-4' />}
            onPress={handleConfirm}>
            {config.confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

ConfirmActionModal.displayName = 'ConfirmActionModal'

ConfirmActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['publish', 'pause', 'cancel', 'activate', 'back_to_edition', 'delete', 'resume']).isRequired,
  eventData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    status: PropTypes.string,
    eventDate: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    location: PropTypes.string,
    currentAttendees: PropTypes.number,
    maxCapacity: PropTypes.number,
    capacity: PropTypes.number
  }),
  loading: PropTypes.bool
}

export default ConfirmActionModal
