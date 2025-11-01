import { memo, useCallback, useMemo } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, User, Button } from '@heroui/react'
import { Eye } from 'lucide-react'
import { formatJavaDateForDisplay } from '@utils/dateUtils.js'
import { MATCH_STATUS_COLORS, MATCH_STATUS_LABELS } from '@constants/tableConstants.js'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'

const MatchAdminTable = memo(
  ({
    matches = [],
    headerColumns = [],
    loading = false,
    sortDescriptor = {},
    setSortDescriptor,
    topContent,
    bottomContent,
    tableType = 'all',
    visibleColumns: _visibleColumns,
    selectedKeys,
    setSelectedKeys
  }) => {
    const navigate = useNavigate()

    // Renderizar celdas según el tipo de columna
    const renderCell = useCallback(
      (match, columnKey) => {
        const cellValue = match[columnKey]

        switch (columnKey) {
          case 'id':
            return <span className='text-sm text-gray-300'>#{match.id}</span>

          case 'initiatorUser':
            return (
              <User
                avatarProps={{
                  src: match.initiatorUser?.profilePicture,
                  size: 'sm',
                  isBordered: true,
                  color: 'primary'
                }}
                classNames={{
                  name: 'text-sm font-medium text-gray-200',
                  description: 'text-xs text-gray-400'
                }}
                description={match.initiatorUser?.email}
                name={match.initiatorUser?.fullName || 'Usuario'}
              />
            )

          case 'targetUser':
            return (
              <User
                avatarProps={{
                  src: match.targetUser?.profilePicture,
                  size: 'sm',
                  isBordered: true,
                  color: 'secondary'
                }}
                classNames={{
                  name: 'text-sm font-medium text-gray-200',
                  description: 'text-xs text-gray-400'
                }}
                description={match.targetUser?.email}
                name={match.targetUser?.fullName || 'Usuario'}
              />
            )

          case 'status':
            return (
              <Chip color={MATCH_STATUS_COLORS[match.status] || 'default'} size='sm' variant='flat'>
                {MATCH_STATUS_LABELS[match.status] || match.status}
              </Chip>
            )

          case 'createdAt':
            return <span className='text-sm text-gray-300'>{match.createdAt ? formatJavaDateForDisplay(match.createdAt) : '-'}</span>

          case 'updatedAt':
            return <span className='text-sm text-gray-300'>{match.updatedAt ? formatJavaDateForDisplay(match.updatedAt) : '-'}</span>

          case 'acceptedAt':
            return <span className='text-sm text-gray-300'>{match.acceptedAt ? formatJavaDateForDisplay(match.acceptedAt) : '-'}</span>

          case 'rejectedAt':
            return <span className='text-sm text-gray-300'>{match.rejectedAt ? formatJavaDateForDisplay(match.rejectedAt) : '-'}</span>

          case 'elapsed':
            return <span className='text-sm text-gray-300'>{calculateElapsedTime(match.createdAt)}</span>

          case 'actions':
            return (
              <div className='flex items-center gap-2'>
                <Button
                  isIconOnly
                  color='primary'
                  size='sm'
                  variant='flat'
                  onPress={() => navigate(`${APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', match.initiatorUser?.id)}`)}>
                  <Eye size={16} />
                </Button>
              </div>
            )

          default:
            return <span className='text-sm text-gray-300'>{cellValue || '-'}</span>
        }
      },
      [navigate]
    )

    // Calcular tiempo transcurrido desde la creación
    const calculateElapsedTime = useCallback(createdAt => {
      if (!createdAt) return '-'

      const now = new Date()
      const created = new Date(createdAt)
      const diffMs = now - created
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) return `${diffDays}d`
      if (diffHours > 0) return `${diffHours}h`
      if (diffMins > 0) return `${diffMins}m`

      return 'Ahora'
    }, [])

    // Mensaje cuando no hay datos
    const emptyContent = useMemo(() => {
      if (loading) return 'Cargando matches...'

      switch (tableType) {
        case 'all':
          return 'No hay matches registrados'
        case 'pending':
          return 'No hay matches pendientes'
        case 'accepted':
          return 'No hay matches aceptados'
        case 'rejected':
          return 'No hay matches rechazados'
        default:
          return 'No hay matches disponibles'
      }
    }, [loading, tableType])

    return (
      <Table
        aria-label={`Tabla de matches ${tableType}`}
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={{
          wrapper: 'bg-gray-800/40 border border-gray-700/50 backdrop-blur-sm',
          th: 'bg-gray-700/50 text-gray-200 font-semibold',
          td: 'text-gray-300'
        }}
        selectedKeys={selectedKeys}
        selectionMode='none'
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}>
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={emptyContent} isLoading={loading} items={matches} loadingContent='Cargando...'>
          {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>
    )
  }
)

MatchAdminTable.displayName = 'MatchAdminTable'

export default MatchAdminTable
