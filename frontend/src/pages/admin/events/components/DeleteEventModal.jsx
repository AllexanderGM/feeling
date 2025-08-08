import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip, Switch } from '@heroui/react'
import { Trash2, AlertTriangle, Calendar, MapPin, Users, DollarSign } from 'lucide-react'

const DeleteEventModal = ({ isOpen, onClose, onConfirm, loading, eventData }) => {
  const [forceDelete, setForceDelete] = useState(false)

  const handleClose = () => {
    setForceDelete(false)
    onClose()
  }

  const handleConfirm = () => {
    onConfirm(eventData.id, forceDelete)
  }

  if (!eventData) return null

  const hasRegistrations = eventData.totalRegistrations > 0 || eventData.completedRegistrations > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement='center'
      size='2xl'
      classNames={{
        base: 'bg-gray-800 border border-red-700/50',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center'>
              <Trash2 className='w-5 h-5 text-red-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-red-400'>Eliminar Evento</h2>
              <p className='text-sm text-gray-400 font-normal'>Esta acción no se puede deshacer</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          <div className='space-y-4'>
            {/* Advertencia principal */}
            <Card className='bg-red-900/20 border-red-700/50'>
              <CardBody className='flex flex-row items-center gap-4'>
                <AlertTriangle className='w-8 h-8 text-red-400 flex-shrink-0' />
                <div>
                  <h3 className='font-semibold text-red-300 mb-1'>¿Estás seguro de que quieres eliminar este evento?</h3>
                  <p className='text-sm text-red-200/80'>Esta acción eliminará permanentemente el evento y toda su información asociada.</p>
                </div>
              </CardBody>
            </Card>

            {/* Información del evento */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody>
                <h3 className='text-lg font-medium text-gray-200 mb-4'>Información del Evento</h3>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-400'>Título:</span>
                    <span className='text-sm font-medium text-gray-200'>{eventData.title || eventData.name}</span>
                  </div>

                  {eventData.category && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>Categoría:</span>
                      <Chip size='sm' variant='flat' color='primary'>
                        {eventData.category}
                      </Chip>
                    </div>
                  )}

                  {(eventData.destination?.city || eventData.city) && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>Destino:</span>
                      <span className='text-sm text-gray-200 flex items-center gap-1'>
                        <MapPin className='w-3 h-3' />
                        {eventData.destination?.city || eventData.city}
                      </span>
                    </div>
                  )}

                  {eventData.price && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>Precio:</span>
                      <span className='text-sm text-gray-200 flex items-center gap-1'>
                        <DollarSign className='w-3 h-3' />${eventData.price.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {eventData.maxCapacity && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>Capacidad:</span>
                      <span className='text-sm text-gray-200 flex items-center gap-1'>
                        <Users className='w-3 h-3' />
                        {eventData.maxCapacity} personas
                      </span>
                    </div>
                  )}

                  {(eventData.startDate || eventData.eventDate) && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-400'>Fecha:</span>
                      <span className='text-sm text-gray-200 flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {new Date(eventData.startDate || eventData.eventDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Advertencia sobre registraciones */}
            {hasRegistrations && (
              <Card className='bg-orange-900/20 border-orange-700/50'>
                <CardBody>
                  <div className='flex items-start gap-3'>
                    <AlertTriangle className='w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <h4 className='font-semibold text-orange-300 mb-2'>Evento con Registraciones</h4>
                      <p className='text-sm text-orange-200/80 mb-3'>
                        Este evento tiene {eventData.totalRegistrations || 0} registraciones
                        {eventData.completedRegistrations > 0 && ` (${eventData.completedRegistrations} completadas)`}. Eliminar el evento
                        afectará a los usuarios registrados.
                      </p>

                      <div className='flex items-center justify-between p-3 bg-orange-800/20 rounded-lg border border-orange-700/30'>
                        <div>
                          <p className='font-medium text-orange-200'>Eliminación Forzada</p>
                          <p className='text-xs text-orange-300/80'>Eliminar aunque tenga registraciones</p>
                        </div>
                        <Switch isSelected={forceDelete} onValueChange={setForceDelete} color='warning' size='sm' />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Información adicional */}
            <div className='text-xs text-gray-500 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30'>
              <p className='mb-1'>
                <strong>Nota:</strong> La eliminación del evento es irreversible.
              </p>
              <p>
                {hasRegistrations
                  ? 'Se recomienda contactar a los usuarios registrados antes de proceder.'
                  : 'Como no hay registraciones, la eliminación será segura.'}
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant='bordered' onPress={handleClose} className='border-gray-600 text-gray-300' disabled={loading}>
            Cancelar
          </Button>
          <Button
            color='danger'
            onPress={handleConfirm}
            isLoading={loading}
            isDisabled={hasRegistrations && !forceDelete}
            startContent={!loading && <Trash2 className='w-4 h-4' />}>
            {hasRegistrations && forceDelete ? 'Forzar Eliminación' : 'Eliminar Evento'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteEventModal
