import { useState, useCallback, useMemo, memo } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  User
} from '@heroui/react'
import { Check, X, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, MapPin, Users, DollarSign, Tag } from 'lucide-react'
import { useError } from '@hooks'
import { EVENT_CATEGORY_COLORS, EVENT_STATUS_COLORS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate } from '@utils/dateUtils.js'

const UnifiedEventTable = memo(
  ({
    events,
    loading,
    tableType = 'active', // 'active', 'upcoming', 'all'
    // Props para operaciones
    onEdit,
    onDelete,
    onToggleStatus,
    onView,
    selectedKeys,
    setSelectedKeys,
    disabledKeys,
    sortDescriptor,
    setSortDescriptor,
    topContent,
    bottomContent,
    visibleColumns,
    headerColumns
  }) => {
    const { handleError, handleSuccess } = useError()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const handleViewDetails = useCallback(
      event => {
        setSelectedEvent(event)
        onOpen()
      },
      [onOpen]
    )

    const handleToggleStatus = useCallback(
      async event => {
        setActionLoading(true)
        try {
          await onToggleStatus?.(event.id)
          handleSuccess(`Estado del evento "${event.title}" cambiado correctamente`)
        } catch (error) {
          handleError('Error al cambiar el estado del evento')
        } finally {
          setActionLoading(false)
        }
      },
      [onToggleStatus, handleSuccess, handleError]
    )

    const renderCell = useCallback(
      (event, columnKey) => {
        const cellValue = event[columnKey]

        switch (columnKey) {
          case 'event':
            const hasImage = event.mainImageUrl || event.imageUrl || (event.images && event.images[0])

            return (
              <div className='flex items-center gap-3'>
                {hasImage ? (
                  <Avatar
                    radius='lg'
                    src={hasImage}
                    alt={`${event.title || 'Evento'}`}
                    className='w-12 h-12'
                    onError={() => {
                      // Imagen de placeholder fallará silenciosamente
                    }}
                  />
                ) : (
                  <Avatar radius='lg' className='w-12 h-12 bg-default-100' icon={<Calendar className='w-6 h-6 text-default-500' />} />
                )}
                <div className='flex flex-col'>
                  <p className='text-sm font-semibold text-foreground'>{event.title || event.name || 'Sin título'}</p>
                  <p className='text-xs text-default-500 line-clamp-1'>
                    {event.description ? event.description.substring(0, 50) + '...' : 'Sin descripción'}
                  </p>
                </div>
              </div>
            )

          case 'creator':
            return (
              <div className='flex flex-col'>
                <User
                  name={event.creatorName || 'Usuario desconocido'}
                  description={event.creatorEmail || ''}
                  avatarProps={{
                    src: event.creatorImage,
                    size: 'sm'
                  }}
                  classNames={{
                    name: 'text-sm font-medium',
                    description: 'text-xs text-default-500'
                  }}
                />
              </div>
            )

          case 'destination':
            return (
              <div className='flex flex-col'>
                <div className='flex items-center gap-1 mb-1'>
                  <MapPin className='w-3 h-3 text-primary-400' />
                  <p className='text-sm font-semibold text-foreground'>{event.destination?.city || event.city || 'No especificado'}</p>
                </div>
                <p className='text-xs text-default-500'>{event.destination?.country || event.country || ''}</p>
              </div>
            )

          case 'category':
            return (
              <Chip className='capitalize' color={EVENT_CATEGORY_COLORS[event.category] || 'default'} size='sm' variant='flat'>
                {event.category ? event.category.toLowerCase() : 'Sin categoría'}
              </Chip>
            )

          case 'price':
            const adultPrice = event.adultPrice || event.price || 0
            const childPrice = event.childPrice || 0

            return (
              <div className='flex flex-col'>
                <div className='flex items-center gap-1 mb-1'>
                  <DollarSign className='w-3 h-3 text-success-400' />
                  <span className='text-sm font-semibold text-foreground'>${adultPrice.toLocaleString()}</span>
                </div>
                {childPrice > 0 && <p className='text-xs text-default-500'>Niños: ${childPrice.toLocaleString()}</p>}
              </div>
            )

          case 'registrations':
            const totalRegistrations = event.totalRegistrations || 0
            const completedRegistrations = event.completedRegistrations || 0
            const maxCapacity = event.maxCapacity || event.capacity || 100

            return (
              <div className='flex flex-col items-center'>
                <div className='flex items-center gap-2 mb-1'>
                  <Users className='w-3 h-3 text-blue-400' />
                  <span className='text-sm font-semibold text-foreground'>
                    {completedRegistrations}/{maxCapacity}
                  </span>
                </div>
                <div className='w-full bg-default-200 rounded-full h-1.5'>
                  <div
                    className='bg-blue-500 h-1.5 rounded-full transition-all duration-300'
                    style={{ width: `${Math.min((completedRegistrations / maxCapacity) * 100, 100)}%` }}
                  />
                </div>
                <p className='text-xs text-default-500 mt-1'>{totalRegistrations} total</p>
              </div>
            )

          case 'isActive':
            return (
              <Chip className='capitalize' color={event.isActive ? 'success' : 'danger'} size='sm' variant='flat'>
                {event.isActive ? 'Activo' : 'Inactivo'}
              </Chip>
            )

          case 'startDate':
            const startDate = event.startDate || event.eventDate || event.date
            const formattedDate = formatJavaDateForDisplay(startDate)
            const daysSince = daysSinceJavaDate(startDate)

            return (
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-foreground'>{formattedDate || 'No especificada'}</p>
                {daysSince !== null && (
                  <p className='text-xs text-default-500'>{daysSince >= 0 ? `En ${daysSince} días` : `Hace ${Math.abs(daysSince)} días`}</p>
                )}
              </div>
            )

          case 'createdAt':
            const createdDate = event.createdAt || event.registeredAt
            const formattedCreatedDate = formatJavaDateForDisplay(createdDate)
            const daysSinceCreated = daysSinceJavaDate(createdDate)

            return (
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-foreground'>{formattedCreatedDate}</p>
                <p className='text-xs text-default-500'>{daysSinceCreated !== null ? `${daysSinceCreated} días` : ''}</p>
              </div>
            )

          case 'tags':
            const tags = event.tags || []
            if (!tags.length) {
              return <span className='text-xs text-default-400'>Sin etiquetas</span>
            }

            return (
              <div className='flex flex-wrap gap-1'>
                {tags.slice(0, 2).map((tag, index) => (
                  <Chip key={index} size='sm' variant='flat' color='secondary'>
                    {tag}
                  </Chip>
                ))}
                {tags.length > 2 && <span className='text-xs text-default-400'>+{tags.length - 2}</span>}
              </div>
            )

          case 'actions':
            return (
              <div className='flex items-center justify-center gap-2'>
                {/* Ver detalles */}
                <Tooltip content='Ver detalles'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                    onPress={() => handleViewDetails(event)}
                    isDisabled={loading || actionLoading}
                    title='Ver detalles'>
                    <Eye className='w-4 h-4' />
                  </Button>
                </Tooltip>

                {/* Editar evento */}
                <Tooltip content='Editar evento'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    className='bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20'
                    onPress={() => onEdit?.(event)}
                    isDisabled={loading || actionLoading}
                    title='Editar evento'>
                    <Edit className='w-4 h-4' />
                  </Button>
                </Tooltip>

                {/* Cambiar estado */}
                <Tooltip content={event.isActive ? 'Desactivar evento' : 'Activar evento'}>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    className={`${event.isActive ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'}`}
                    onPress={() => handleToggleStatus(event)}
                    isDisabled={loading || actionLoading}
                    title={event.isActive ? 'Desactivar evento' : 'Activar evento'}>
                    {event.isActive ? <ToggleLeft className='w-4 h-4' /> : <ToggleRight className='w-4 h-4' />}
                  </Button>
                </Tooltip>

                {/* Eliminar evento */}
                <Tooltip content='Eliminar evento' color='danger'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                    onPress={() => onDelete?.(event)}
                    isDisabled={loading || actionLoading}
                    title='Eliminar evento'>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </Tooltip>
              </div>
            )

          default:
            return cellValue || 'N/A'
        }
      },
      [handleViewDetails, handleToggleStatus, loading, actionLoading, onEdit, onDelete]
    )

    const displayColumns = headerColumns || []

    // Función para generar key única para cada evento
    const getEventKey = (event, index) => {
      if (!event) return `event-empty-${index}`
      return event.id || event.eventId || `event-${index}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Crear array de eventos con keys garantizadas
    const eventsWithKeys = useMemo(() => {
      if (!events) return []
      return events.map((event, index) => ({
        ...event,
        _key: getEventKey(event, index)
      }))
    }, [events])

    // Crear contenido vacío cuando no hay eventos
    const emptyContent =
      !eventsWithKeys || eventsWithKeys.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12'>
          <Calendar className='w-16 h-16 text-blue-400 mb-4' />
          <p className='text-lg font-medium text-gray-200'>
            {tableType === 'upcoming' ? '¡No hay eventos próximos!' : tableType === 'all' ? 'No hay eventos' : 'No hay eventos activos'}
          </p>
          <p className='text-sm text-gray-400'>
            {tableType === 'upcoming'
              ? 'No hay eventos programados próximamente'
              : tableType === 'all'
                ? 'No se encontraron eventos en el sistema'
                : 'No hay eventos activos en este momento'}
          </p>
        </div>
      ) : null

    return (
      <>
        <Table
          aria-label={`Tabla de eventos ${tableType === 'upcoming' ? 'próximos' : tableType === 'all' ? 'todos' : 'activos'}`}
          className='min-h-[400px]'
          removeWrapper={false}
          isHeaderSticky={true}
          color='primary'
          bottomContent={bottomContent}
          bottomContentPlacement='outside'
          selectionMode='none'
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement='outside'
          onSortChange={setSortDescriptor}
          classNames={{
            wrapper: 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50',
            th: 'bg-gray-700/50 border-b border-gray-600/50',
            td: 'border-b border-gray-700/30',
            tbody: '[&>tr:hover]:bg-gray-700/20'
          }}>
          <TableHeader columns={displayColumns}>
            {column => (
              <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.uid !== 'actions'}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={eventsWithKeys}
            loadingContent={`Cargando eventos ${tableType === 'upcoming' ? 'próximos' : tableType === 'all' ? 'todos' : 'activos'}...`}
            emptyContent={
              emptyContent || `No hay eventos ${tableType === 'upcoming' ? 'próximos' : tableType === 'all' ? 'en el sistema' : 'activos'}`
            }
            loadingState={loading ? 'loading' : 'idle'}>
            {item => <TableRow key={item._key}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
          </TableBody>
        </Table>

        {/* Modal de detalles del evento */}
        <Modal isOpen={isOpen} onClose={onClose} size='4xl' scrollBehavior='inside'>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <h3 className='text-xl font-semibold'>Detalles del Evento</h3>
              <p className='text-sm text-gray-500'>Información completa del evento</p>
            </ModalHeader>
            <ModalBody className='pb-6'>
              {selectedEvent && (
                <div className='space-y-6'>
                  {/* Header con imagen y datos básicos */}
                  <Card className='bg-gray-800 border-gray-700'>
                    <CardBody className='flex flex-row items-center gap-6 p-6'>
                      <div className='flex flex-col items-center gap-3'>
                        <Avatar
                          src={selectedEvent.mainImageUrl || selectedEvent.imageUrl}
                          className='w-20 h-20'
                          icon={<Calendar className='w-10 h-10 text-default-500' />}
                        />
                        <Chip size='sm' color={selectedEvent.isActive ? 'success' : 'danger'} variant='flat'>
                          {selectedEvent.isActive ? 'Activo' : 'Inactivo'}
                        </Chip>
                      </div>
                      <div className='flex-1'>
                        <h4 className='text-xl font-semibold text-white mb-2'>{selectedEvent.title || selectedEvent.name}</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Destino</p>
                            <p className='text-sm text-gray-200'>
                              {selectedEvent.destination?.city || selectedEvent.city},{' '}
                              {selectedEvent.destination?.country || selectedEvent.country}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Categoría</p>
                            <p className='text-sm text-gray-200'>{selectedEvent.category || 'No especificada'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Precio Adulto</p>
                            <p className='text-sm text-gray-200'>
                              ${(selectedEvent.adultPrice || selectedEvent.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Precio Niño</p>
                            <p className='text-sm text-gray-200'>${(selectedEvent.childPrice || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Descripción */}
                  <Card className='bg-gray-800 border-gray-700'>
                    <CardHeader>
                      <h5 className='text-lg font-semibold text-white'>Descripción</h5>
                    </CardHeader>
                    <CardBody className='pt-0'>
                      <div className='bg-gray-900 p-4 rounded-lg'>
                        <p className='text-sm text-gray-200 whitespace-pre-wrap'>
                          {selectedEvent.description || 'Sin descripción disponible'}
                        </p>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Registraciones y estadísticas */}
                  <Card className='bg-gray-800 border-gray-700'>
                    <CardHeader>
                      <h5 className='text-lg font-semibold text-white'>Estadísticas</h5>
                    </CardHeader>
                    <CardBody className='pt-0'>
                      <div className='grid grid-cols-3 gap-4'>
                        <div>
                          <p className='text-xs font-medium text-gray-400 uppercase'>Total Registraciones</p>
                          <p className='text-lg font-semibold text-white'>{selectedEvent.totalRegistrations || 0}</p>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-400 uppercase'>Completadas</p>
                          <p className='text-lg font-semibold text-white'>{selectedEvent.completedRegistrations || 0}</p>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-400 uppercase'>Capacidad Máxima</p>
                          <p className='text-lg font-semibold text-white'>
                            {selectedEvent.maxCapacity || selectedEvent.capacity || 'Ilimitada'}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Etiquetas */}
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Etiquetas</h5>
                      </CardHeader>
                      <CardBody className='pt-0'>
                        <div className='flex flex-wrap gap-2'>
                          {selectedEvent.tags.map((tag, index) => (
                            <Chip key={index} size='sm' variant='flat' color='primary'>
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)

UnifiedEventTable.displayName = 'UnifiedEventTable'

export default UnifiedEventTable
