import { memo } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Avatar, Button, Tooltip, Spinner } from '@heroui/react'
import { Eye, Edit, Trash2, Check, X, MapPin, Calendar, DollarSign } from 'lucide-react'
import { EVENT_STATUS_COLORS, EVENT_CATEGORY_COLORS } from '@constants/tableConstants.js'
import { Logger } from '@utils/logger.js'

const UnifiedEventTable = memo(
  ({
    events = [],
    loading = false,
    tableType = 'active', // 'active' | 'pending'
    currentUser = null,
    onEdit = () => {},
    onDelete = () => {},
    onApprove = () => {},
    onReject = () => {},
    selectedKeys = new Set(),
    setSelectedKeys = () => {},
    disabledKeys = new Set(),
    sortDescriptor = { column: 'name', direction: 'ascending' },
    setSortDescriptor = () => {},
    topContent = null,
    bottomContent = null,
    visibleColumns = new Set()
  }) => {
    // ========================================
    // CELL RENDERERS
    // ========================================

    const renderCell = (event, columnKey) => {
      const cellValue = event[columnKey]

      switch (columnKey) {
        case 'id':
          return (
            <div className='flex flex-col'>
              <p className='text-sm font-medium text-default-600'>#{event.id}</p>
            </div>
          )

        case 'name':
          return (
            <div className='flex items-center gap-3'>
              <Avatar
                src={event.images?.[0] || 'https://via.placeholder.com/40x40?text=E'}
                alt={event.name}
                size='sm'
                className='flex-shrink-0'
              />
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-default-800'>{event.name}</p>
                <p className='text-xs text-default-500 max-w-xs truncate'>{event.description}</p>
              </div>
            </div>
          )

        case 'destination':
          return (
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-default-400' />
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-default-800'>{event.destination?.city || 'N/A'}</p>
                <p className='text-xs text-default-500'>{event.destination?.country || 'N/A'}</p>
              </div>
            </div>
          )

        case 'price':
          return (
            <div className='flex items-center gap-2'>
              <DollarSign className='w-4 h-4 text-default-400' />
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-default-800'>${(event.adultPrice || 0).toLocaleString()}</p>
                {event.childPrice && <p className='text-xs text-default-500'>Niños: ${event.childPrice.toLocaleString()}</p>}
              </div>
            </div>
          )

        case 'tags':
          return (
            <div className='flex flex-wrap gap-1 max-w-xs'>
              {event.tags?.slice(0, 2).map((tag, index) => (
                <Chip key={index} size='sm' variant='flat' color={EVENT_CATEGORY_COLORS[tag] || 'default'} className='text-xs'>
                  {tag}
                </Chip>
              ))}
              {event.tags?.length > 2 && (
                <Chip size='sm' variant='flat' color='default' className='text-xs'>
                  +{event.tags.length - 2}
                </Chip>
              )}
            </div>
          )

        case 'availability':
          return (
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-default-400' />
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-default-800'>{event.availability?.[0]?.availableSlots || 0} plazas</p>
                <p className='text-xs text-default-500'>{event.availability?.[0]?.availableDate || 'Sin fecha'}</p>
              </div>
            </div>
          )

        case 'status':
          return (
            <Chip size='sm' variant='flat' color={EVENT_STATUS_COLORS[event.status] || 'default'}>
              {event.status || 'PENDIENTE'}
            </Chip>
          )

        case 'createdAt':
          const date = event.createdAt ? new Date(event.createdAt) : null
          return (
            <div className='flex flex-col'>
              <p className='text-sm text-default-800'>{date ? date.toLocaleDateString() : 'N/A'}</p>
              <p className='text-xs text-default-500'>{date ? date.toLocaleTimeString() : ''}</p>
            </div>
          )

        case 'actions':
          if (tableType === 'pending') {
            return (
              <div className='flex items-center gap-2'>
                <Tooltip content='Aprobar evento'>
                  <Button isIconOnly size='sm' variant='flat' color='success' onPress={() => onApprove(event.id)}>
                    <Check className='w-4 h-4' />
                  </Button>
                </Tooltip>
                <Tooltip content='Rechazar evento'>
                  <Button isIconOnly size='sm' variant='flat' color='danger' onPress={() => onReject(event.id)}>
                    <X className='w-4 h-4' />
                  </Button>
                </Tooltip>
              </div>
            )
          }

          return (
            <div className='flex items-center gap-2'>
              <Tooltip content='Ver detalles'>
                <Button
                  isIconOnly
                  size='sm'
                  variant='flat'
                  color='primary'
                  onPress={() => {
                    // TODO: Implementar vista de detalles
                    Logger.debug(Logger.CATEGORIES.UI, 'view_event_details', 'Ver detalles del evento', { eventId: event.id })
                  }}>
                  <Eye className='w-4 h-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Editar evento'>
                <Button isIconOnly size='sm' variant='flat' color='warning' onPress={() => onEdit(event)}>
                  <Edit className='w-4 h-4' />
                </Button>
              </Tooltip>
              <Tooltip content='Eliminar evento'>
                <Button isIconOnly size='sm' variant='flat' color='danger' onPress={() => onDelete(event)}>
                  <Trash2 className='w-4 h-4' />
                </Button>
              </Tooltip>
            </div>
          )

        default:
          return cellValue
      }
    }

    // ========================================
    // COLUMN HEADERS
    // ========================================

    const columns = [
      { name: 'ID', uid: 'id', sortable: true },
      { name: 'NOMBRE', uid: 'name', sortable: true },
      { name: 'DESTINO', uid: 'destination', sortable: true },
      { name: 'PRECIO', uid: 'price', sortable: true },
      { name: 'ETIQUETAS', uid: 'tags', sortable: false },
      { name: 'DISPONIBILIDAD', uid: 'availability', sortable: false },
      { name: 'ESTADO', uid: 'status', sortable: true },
      { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
      { name: 'ACCIONES', uid: 'actions', sortable: false }
    ]

    const visibleColumnsArray = Array.from(visibleColumns)
    const headerColumns = visibleColumns === 'all' ? columns : columns.filter(column => visibleColumnsArray.includes(column.uid))

    // ========================================
    // LOADING STATE
    // ========================================

    const loadingState = loading || events.length === 0 ? 'loading' : 'idle'

    // ========================================
    // RENDER
    // ========================================

    return (
      <Table
        aria-label={`Tabla de eventos ${tableType === 'pending' ? 'pendientes' : 'activos'}`}
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={{
          wrapper: 'max-h-[600px]',
          table: 'min-h-[400px]'
        }}
        selectedKeys={selectedKeys}
        selectionMode={tableType === 'active' ? 'multiple' : 'none'}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        disabledKeys={disabledKeys}>
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={events}
          loadingContent={<Spinner />}
          loadingState={loadingState}
          emptyContent={tableType === 'pending' ? 'No hay eventos pendientes de aprobación' : 'No se encontraron eventos'}>
          {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>
    )
  }
)

UnifiedEventTable.displayName = 'UnifiedEventTable'

export default UnifiedEventTable
