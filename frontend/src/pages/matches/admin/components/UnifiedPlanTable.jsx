import { useMemo } from 'react'
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Chip, Tooltip, Button, Skeleton } from '@heroui/react'
import { Edit2, Trash2, Package, DollarSign } from 'lucide-react'
import { MATCH_PLAN_COLUMNS } from '@constants/tableConstants.js'

const UnifiedPlanTable = ({ plans, loading, sortDescriptor, onSortChange, visibleColumns, onEdit, onDelete }) => {
  const renderCell = (plan, columnKey) => {
    const cellValue = plan[columnKey]

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
              <Package className='w-4 h-4 text-blue-400' />
            </div>
            <div>
              <p className='font-medium text-gray-100'>{plan.name}</p>
            </div>
          </div>
        )

      case 'description':
        return (
          <div className='max-w-xs'>
            <p className='text-sm text-gray-300 line-clamp-2'>{cellValue || 'Sin descripción'}</p>
          </div>
        )

      case 'attempts':
        return (
          <Chip className='font-medium' color='primary' size='sm' variant='flat'>
            {cellValue || 0} {(cellValue || 0) === 1 ? 'intento' : 'intentos'}
          </Chip>
        )

      case 'price':
        return (
          <div className='flex items-center gap-2'>
            <DollarSign className='w-4 h-4 text-green-400' />
            <span className='font-medium text-green-400'>
              {(cellValue || 0).toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </span>
          </div>
        )

      case 'sortOrder':
        return (
          <div className='text-center'>
            <Chip className='font-medium' color='secondary' size='sm' variant='flat'>
              #{cellValue || 0}
            </Chip>
          </div>
        )

      case 'isActive':
        return (
          <Chip color={cellValue ? 'success' : 'default'} size='sm' variant='flat'>
            {cellValue ? 'Activo' : 'Inactivo'}
          </Chip>
        )

      case 'actions':
        return (
          <div className='flex items-center justify-center gap-2'>
            <Tooltip content='Editar plan'>
              <Button
                isIconOnly
                className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                size='sm'
                title='Editar plan'
                variant='flat'
                onPress={() => onEdit(plan)}>
                <Edit2 className='w-4 h-4' />
              </Button>
            </Tooltip>
            <Tooltip color='danger' content='Eliminar plan'>
              <Button
                isIconOnly
                className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                size='sm'
                title='Eliminar plan'
                variant='flat'
                onPress={() => onDelete(plan)}>
                <Trash2 className='w-4 h-4' />
              </Button>
            </Tooltip>
          </div>
        )

      default:
        return cellValue
    }
  }

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return MATCH_PLAN_COLUMNS

    return MATCH_PLAN_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const loadingState = loading || plans.length === 0

  return (
    <Table
      isHeaderSticky
      aria-label='Tabla de planes de match'
      classNames={{
        wrapper: 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50',
        th: 'bg-gray-700/50 border-b border-gray-600/50',
        td: 'border-b border-gray-700/30',
        tbody: '[&>tr:hover]:bg-gray-700/20'
      }}
      color='primary'
      selectionMode='none'
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}>
      <TableHeader columns={headerColumns}>
        {column => (
          <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={
          <div className='text-center py-8'>
            <Package className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>No hay planes de match</h3>
            <p className='text-sm text-gray-500'>Crea tu primer plan de match para empezar</p>
          </div>
        }
        items={plans}
        loadingContent={<Skeleton className='w-full h-8 rounded-lg bg-gray-700/50' />}
        loadingState={loadingState ? 'loading' : 'idle'}>
        {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
      </TableBody>
    </Table>
  )
}

export default UnifiedPlanTable
