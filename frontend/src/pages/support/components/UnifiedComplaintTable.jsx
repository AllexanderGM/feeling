import { useCallback, useMemo, memo } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Button, User } from '@heroui/react'
import { Eye, MessageSquare, Edit, Trash2, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { TablePagination } from '@components/ui/TablePagination.jsx'
import { COMPLAINT_STATUS_COLORS, COMPLAINT_PRIORITY_COLORS, COMPLAINT_TYPES } from '@constants/tableConstants.js'

const UnifiedComplaintTable = memo(
  ({
    complaints = [],
    columns = [],
    loading = false,
    totalPages = 0,
    currentPage = 0,
    onPageChange,
    onSort,
    sortDescriptor,
    onView,
    onEdit,
    onDelete,
    onOpenChat,
    viewType = 'all',
    showActions = true
  }) => {
    // Formatear fecha relativa
    const formatRelativeTime = useCallback(date => {
      if (!date) return 'N/A'
      try {
        const now = new Date()
        const then = new Date(date)
        const diffMs = now - then
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'ahora mismo'
        if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
        if (diffDays < 30) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`

        const diffMonths = Math.floor(diffDays / 30)
        if (diffMonths < 12) return `hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`

        const diffYears = Math.floor(diffDays / 365)
        return `hace ${diffYears} año${diffYears > 1 ? 's' : ''}`
      } catch {
        return 'Fecha inválida'
      }
    }, [])

    // Formatear tiempo de resolución
    const formatResolutionTime = useCallback((createdAt, resolvedAt) => {
      if (!createdAt || !resolvedAt) return 'N/A'
      try {
        const created = new Date(createdAt)
        const resolved = new Date(resolvedAt)
        const diffMs = resolved - created
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (days > 0) {
          return `${days}d ${hours % 24}h`
        }
        return `${hours}h`
      } catch {
        return 'N/A'
      }
    }, [])

    // Renderizar celda
    const renderCell = useCallback(
      (complaint, columnKey) => {
        const cellValue = complaint[columnKey]

        switch (columnKey) {
          case 'id':
            return (
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-foreground'>#{complaint.id}</p>
              </div>
            )

          case 'user':
            return (
              <div className='flex items-center gap-3'>
                <User
                  name={complaint.user?.name || 'Usuario desconocido'}
                  description={complaint.user?.email || 'Sin email'}
                  avatarProps={{
                    src: complaint.user?.profileImage,
                    size: 'sm'
                  }}
                  classNames={{
                    name: 'text-sm font-semibold text-foreground',
                    description: 'text-xs text-default-500'
                  }}
                />
              </div>
            )

          case 'subject':
            return (
              <div className='flex flex-col max-w-xs'>
                <p className='text-sm font-semibold text-foreground capitalize truncate'>{complaint.subject}</p>
                <p className='text-xs text-default-500 truncate'>{complaint.message?.substring(0, 50)}...</p>
              </div>
            )

          case 'complaintType':
            const typeColors = {
              GENERAL: 'default',
              TECHNICAL_ISSUE: 'danger',
              ACCOUNT_ISSUE: 'warning',
              PAYMENT_ISSUE: 'primary',
              USER_REPORT: 'danger',
              EVENT_ISSUE: 'secondary',
              BOOKING_ISSUE: 'warning',
              PRIVACY_CONCERN: 'danger',
              FEATURE_REQUEST: 'success',
              BUG_REPORT: 'danger',
              ABUSE_REPORT: 'danger',
              REFUND_REQUEST: 'warning'
            }
            return (
              <Chip className='capitalize' color={typeColors[complaint.complaintType] || 'default'} size='sm' variant='flat'>
                {COMPLAINT_TYPES[complaint.complaintType] || complaint.complaintType}
              </Chip>
            )

          case 'priority':
            return (
              <Chip className='capitalize' color={COMPLAINT_PRIORITY_COLORS[complaint.priority]} size='sm' variant='flat'>
                {complaint.priority?.toLowerCase()}
              </Chip>
            )

          case 'status':
            return (
              <Chip
                className='capitalize'
                color={COMPLAINT_STATUS_COLORS[complaint.status]}
                size='sm'
                variant='flat'
                startContent={
                  complaint.status === 'ESCALATED' ? (
                    <AlertTriangle size={12} />
                  ) : complaint.status === 'RESOLVED' ? (
                    <CheckCircle size={12} />
                  ) : complaint.status === 'IN_PROGRESS' ? (
                    <Clock size={12} />
                  ) : null
                }>
                {complaint.status?.replace('_', ' ').toLowerCase()}
              </Chip>
            )

          case 'createdAt':
          case 'updatedAt':
            return (
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-foreground'>{new Date(cellValue).toLocaleDateString()}</p>
                <p className='text-xs text-default-500'>{new Date(cellValue).toLocaleTimeString()}</p>
              </div>
            )

          case 'elapsed':
            return (
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-foreground'>{formatRelativeTime(complaint.createdAt)}</p>
              </div>
            )

          case 'overdue':
            const overdueTime = formatRelativeTime(complaint.createdAt)
            return (
              <div className='flex flex-col'>
                <Chip color='danger' size='sm' variant='flat' startContent={<AlertTriangle size={12} />}>
                  {overdueTime}
                </Chip>
              </div>
            )

          case 'resolvedBy':
            return complaint.resolvedBy ? (
              <div className='flex items-center gap-3'>
                <User
                  name={complaint.resolvedBy.name}
                  description={complaint.resolvedBy.email}
                  avatarProps={{
                    src: complaint.resolvedBy.profileImage,
                    size: 'sm'
                  }}
                  classNames={{
                    name: 'text-sm font-semibold text-foreground',
                    description: 'text-xs text-default-500'
                  }}
                />
              </div>
            ) : (
              <span className='text-sm text-default-500'>N/A</span>
            )

          case 'resolvedAt':
            return cellValue ? (
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-foreground'>{new Date(cellValue).toLocaleDateString()}</p>
                <p className='text-xs text-default-500'>{new Date(cellValue).toLocaleTimeString()}</p>
              </div>
            ) : (
              <span className='text-sm text-default-500'>N/A</span>
            )

          case 'resolutionTime':
            return (
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-foreground'>{formatResolutionTime(complaint.createdAt, complaint.resolvedAt)}</p>
              </div>
            )

          case 'actions':
            return showActions ? (
              <div className='relative flex items-center gap-1'>
                <Tooltip content='Ver detalles'>
                  <Button isIconOnly size='sm' variant='light' onPress={() => onView?.(complaint)}>
                    <Eye className='text-lg text-default-400' />
                  </Button>
                </Tooltip>

                <Tooltip content='Abrir chat'>
                  <Button isIconOnly size='sm' variant='light' onPress={() => onOpenChat?.(complaint)}>
                    <MessageSquare className='text-lg text-primary' />
                  </Button>
                </Tooltip>

                {(complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS') && (
                  <Tooltip content='Editar estado'>
                    <Button isIconOnly size='sm' variant='light' onPress={() => onEdit?.(complaint)}>
                      <Edit className='text-lg text-warning' />
                    </Button>
                  </Tooltip>
                )}

                <Tooltip color='danger' content='Eliminar'>
                  <Button isIconOnly size='sm' variant='light' onPress={() => onDelete?.(complaint)}>
                    <Trash2 className='text-lg text-danger' />
                  </Button>
                </Tooltip>
              </div>
            ) : null

          default:
            return <span className='text-sm text-foreground'>{cellValue || 'N/A'}</span>
        }
      },
      [formatRelativeTime, formatResolutionTime, onView, onEdit, onDelete, onOpenChat, showActions]
    )

    // Mensaje vacío personalizado
    const emptyContent = useMemo(() => {
      const messages = {
        all: 'No se encontraron quejas',
        pending: 'No hay quejas pendientes',
        urgent: 'No hay quejas urgentes',
        overdue: 'No hay quejas vencidas',
        resolved: 'No hay quejas resueltas',
        my: 'No tienes quejas registradas'
      }
      return messages[viewType] || 'No hay datos disponibles'
    }, [viewType])

    return (
      <div className='w-full'>
        <Table
          aria-label='Tabla de quejas y reclamos'
          className='min-h-[400px]'
          removeWrapper={false}
          isHeaderSticky={true}
          color='primary'
          selectionMode='none'
          sortDescriptor={sortDescriptor}
          onSortChange={onSort}
          classNames={{
            wrapper: 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50',
            th: 'bg-gray-700/50 border-b border-gray-600/50'
          }}>
          <TableHeader columns={columns}>
            {column => (
              <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.sortable}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={complaints}
            loadingContent='Cargando quejas...'
            emptyContent={emptyContent}
            loadingState={loading ? 'loading' : 'idle'}>
            {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className='flex justify-center mt-4'>
            <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    )
  }
)

UnifiedComplaintTable.displayName = 'UnifiedComplaintTable'

export { UnifiedComplaintTable }
