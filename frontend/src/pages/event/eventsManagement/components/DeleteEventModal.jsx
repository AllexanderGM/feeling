import { useState, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Avatar,
  Chip
} from '@heroui/react'
import { AlertTriangle, Calendar, MapPin, DollarSign } from 'lucide-react'
import useTour from '@hooks/useTour.js'
import { EVENT_STATUS_COLORS } from '@constants/tableConstants.js'

const DeleteEventModal = memo(({ isOpen, onClose, onSuccess, eventData }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { removeTour } = useTour()

  const handleDelete = async () => {
    if (!eventData?.id) {
      console.error('No event ID provided for deletion')
      return
    }

    setIsDeleting(true)
    try {
      const result = await removeTour(eventData.id)
      
      if (result.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!eventData) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        modal: "bg-background",
        header: "border-b border-divider",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-danger-100">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-danger-600">
                Eliminar Evento
              </h2>
              <p className="text-sm text-default-500 font-normal">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="gap-6">
          <div className="text-center">
            <p className="text-default-700 mb-4">
              ¿Estás seguro de que deseas eliminar este evento? 
              <br />
              <strong>Esta acción no se puede deshacer.</strong>
            </p>
          </div>

          {/* Información del evento */}
          <Card className="border border-danger-200 bg-danger-50">
            <CardBody className="p-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={eventData.images?.[0] || 'https://via.placeholder.com/60x60?text=E'}
                  alt={eventData.name}
                  size="lg"
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-default-800">
                      {eventData.name}
                    </h3>
                    <p className="text-sm text-default-600 line-clamp-2">
                      {eventData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Destino */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-default-400" />
                      <span className="text-sm text-default-700">
                        {eventData.destination?.city}, {eventData.destination?.country}
                      </span>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-default-400" />
                      <span className="text-sm text-default-700">
                        ${(eventData.adultPrice || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Disponibilidad */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-default-400" />
                      <span className="text-sm text-default-700">
                        {eventData.availability?.[0]?.availableSlots || 0} plazas
                      </span>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={EVENT_STATUS_COLORS[eventData.status] || 'default'}
                      >
                        {eventData.status || 'PENDIENTE'}
                      </Chip>
                    </div>
                  </div>

                  {/* Etiquetas */}
                  {eventData.tags && eventData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {eventData.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          size="sm"
                          variant="bordered"
                          className="text-xs"
                        >
                          {tag}
                        </Chip>
                      ))}
                      {eventData.tags.length > 3 && (
                        <Chip size="sm" variant="bordered" className="text-xs">
                          +{eventData.tags.length - 3}
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Advertencias */}
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <h4 className="font-semibold text-warning-800 mb-2">
              Consecuencias de eliminar este evento:
            </h4>
            <ul className="text-sm text-warning-700 space-y-1">
              <li>• Se perderán todos los datos del evento permanentemente</li>
              <li>• Las reservas asociadas quedarán sin evento</li>
              <li>• Los usuarios ya registrados serán notificados</li>
              <li>• No se podrá recuperar la información</li>
            </ul>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Evento'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

DeleteEventModal.displayName = 'DeleteEventModal'

export default DeleteEventModal