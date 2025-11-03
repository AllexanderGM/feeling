import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, Chip } from '@heroui/react'
import { CalendarCheck, CalendarDays, Users } from 'lucide-react'

const ExistingReservationModal = memo(
  ({ isOpen, eventTitle, eventDate, eventTime, attendeesInfo, onClose, onViewEvent, onManageReservations, isGuest = false }) => {
    const subtitle = useMemo(() => {
      if (isGuest) {
        return 'Ya existe una reserva activa para este evento desde este dispositivo o correo.'
      }

      return 'Ya tienes una reserva activa para este evento. Puedes gestionar tus inscripciones desde tu panel.'
    }, [isGuest])

    return (
      <Modal
        classNames={{
          backdrop: 'bg-gray-900/60 backdrop-blur-md',
          base: 'bg-gray-900 border border-gray-800',
          header: 'border-b border-gray-800',
          footer: 'border-t border-gray-800',
          body: 'py-6'
        }}
        isOpen={isOpen}
        placement='center'
        size='md'
        onClose={onClose}>
        <ModalContent>
          {close => (
            <>
              <ModalHeader className='flex flex-col items-center gap-4 pt-6'>
                <div className='relative'>
                  <Avatar
                    className='w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                    icon={<CalendarCheck className='w-8 h-8 text-white' />}
                  />
                  <div className='absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gray-900 border-3 border-gray-900 flex items-center justify-center shadow-xl shadow-emerald-500/30'>
                    <CalendarDays className='w-5 h-5 text-emerald-400' />
                  </div>
                </div>

                <div className='text-center space-y-1'>
                  <h2 className='text-xl font-bold text-white'>Reserva ya registrada</h2>
                  <p className='text-sm text-gray-400'>{subtitle}</p>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className='bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 space-y-4'>
                  <div className='space-y-1'>
                    <p className='text-xs uppercase text-gray-500 tracking-wide'>Evento</p>
                    <p className='text-base font-semibold text-white'>{eventTitle || 'Evento sin título'}</p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='flex items-center gap-2'>
                      <CalendarDays className='w-4 h-4 text-emerald-400 flex-shrink-0' />
                      <div>
                        <p className='text-xs text-gray-500 uppercase'>Fecha</p>
                        <p className='text-sm text-gray-200'>{eventDate || 'Por definir'}</p>
                        {eventTime && <p className='text-xs text-gray-400'>{eventTime}</p>}
                      </div>
                    </div>

                    {attendeesInfo && (
                      <div className='flex items-center gap-2'>
                        <Users className='w-4 h-4 text-cyan-400 flex-shrink-0' />
                        <div>
                          <p className='text-xs text-gray-500 uppercase'>Reserva</p>
                          <p className='text-sm text-gray-200'>{attendeesInfo}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Chip className='bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' radius='md' size='sm' variant='flat'>
                    Para hacer cambios ingresa al detalle del evento o gestiona tu reserva.
                  </Chip>
                </div>
              </ModalBody>

              <ModalFooter className='flex flex-col sm:flex-row gap-3 justify-center pb-6'>
                <Button
                  className='sm:flex-1'
                  color='default'
                  variant='flat'
                  onPress={() => {
                    close()
                    onClose?.()
                  }}>
                  Entendido
                </Button>

                {typeof onManageReservations === 'function' && (
                  <Button
                    className='sm:flex-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500'
                    color='primary'
                    variant='shadow'
                    onPress={() => {
                      close()
                      onManageReservations()
                    }}>
                    Ver mis reservas
                  </Button>
                )}

                <Button
                  className='sm:flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500'
                  color='success'
                  variant='shadow'
                  onPress={() => {
                    close()
                    onViewEvent?.()
                  }}>
                  Ir al evento
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
  }
)

ExistingReservationModal.displayName = 'ExistingReservationModal'

ExistingReservationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  eventTitle: PropTypes.string,
  eventDate: PropTypes.string,
  eventTime: PropTypes.string,
  attendeesInfo: PropTypes.string,
  onClose: PropTypes.func,
  onViewEvent: PropTypes.func,
  onManageReservations: PropTypes.func,
  isGuest: PropTypes.bool
}

export default ExistingReservationModal
