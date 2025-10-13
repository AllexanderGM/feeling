import { useState, useCallback, useMemo } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner
} from '@heroui/react'
import { Search, Plus, RefreshCw, Download, ChevronDown, Trash2, Edit3 } from 'lucide-react'
import TablePagination from '@components/ui/TablePagination.jsx'

/**
 * Componente de tabla reutilizable para administración
 * Soporta paginación, filtrado, ordenamiento y acciones batch
 */
const AdminDataTable = ({
  // Datos
  data = [],
  columns = [],
  loading = false,
  pagination = { page: 0, size: 20, totalPages: 0, totalElements: 0 },

  // Configuración
  title = 'Datos',
  description = '',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay datos disponibles',

  // Callbacks
  onRefresh,
  onPageChange,
  onPageSizeChange,
  onCreate,
  onEdit,
  onDelete,
  onBatchDelete,
  onExport,

  // Renderizado personalizado
  renderCell,
  renderActions,

  // Configuración avanzada
  enableSelection = false,
  enableBatchActions = false,
  enableSearch = true,
  enableFilters = false,
  enableExport = false,
  filters = [],

  // Estado
  searchValue = '',
  sortDescriptor = { column: null, direction: 'ascending' },
  selectedKeys = new Set([]),
  onSelectionChange,
  onSearchChange,
  onSortChange,

  // Estilos
  className = '',
  tableProps = {}
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Manejar refresco con loading
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh])

  // Renderizar celda por defecto
  const defaultRenderCell = useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey]

      switch (columnKey) {
        case 'actions':
          return (
            <div className='flex items-center justify-center gap-2'>
              {renderActions ? (
                renderActions(item)
              ) : (
                <>
                  {onEdit && (
                    <Button isIconOnly className='text-default-400' size='sm' variant='light' onPress={() => onEdit(item)}>
                      <Edit3 className='h-4 w-4' />
                    </Button>
                  )}
                  {onDelete && (
                    <Button isIconOnly className='text-danger' color='danger' size='sm' variant='light' onPress={() => onDelete(item)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </>
              )}
            </div>
          )
        default:
          if (renderCell) {
            return renderCell(item, columnKey)
          }

          return cellValue?.toString() || '-'
      }
    },
    [onEdit, onDelete, renderActions, renderCell]
  )

  // Acciones batch
  const batchActions = useMemo(() => {
    if (!enableBatchActions || selectedKeys === 'all' || selectedKeys.size === 0) {
      return []
    }

    const actions = []

    if (onBatchDelete) {
      actions.push({
        key: 'delete',
        label: `Eliminar ${selectedKeys.size} elementos`,
        color: 'danger',
        action: () => onBatchDelete(Array.from(selectedKeys))
      })
    }

    return actions
  }, [enableBatchActions, selectedKeys, onBatchDelete])

  return (
    <Card className={`w-full ${className}`}>
      {/* Header */}
      <CardHeader className='flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row gap-4 justify-between'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-semibold text-default-900'>{title}</h3>
            {description && <p className='text-sm text-default-600'>{description}</p>}
          </div>

          <div className='flex items-center gap-2'>
            {onRefresh && (
              <Button isIconOnly className='min-w-unit-10' isLoading={isRefreshing} variant='flat' onPress={handleRefresh}>
                <RefreshCw className='h-4 w-4' />
              </Button>
            )}

            {enableExport && onExport && (
              <Button startContent={<Download className='h-4 w-4' />} variant='flat' onPress={onExport}>
                Exportar
              </Button>
            )}

            {onCreate && (
              <Button color='primary' startContent={<Plus className='h-4 w-4' />} onPress={onCreate}>
                Crear
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          {enableSearch && onSearchChange && (
            <div className='flex-1'>
              <Input
                isClearable
                className='max-w-xs'
                placeholder={searchPlaceholder}
                startContent={<Search className='h-4 w-4 text-default-400' />}
                value={searchValue}
                onValueChange={onSearchChange}
              />
            </div>
          )}

          {enableFilters && filters.length > 0 && (
            <div className='flex gap-2'>
              {filters.map((filter, index) => (
                <Dropdown key={index}>
                  <DropdownTrigger>
                    <Button endContent={<ChevronDown className='h-4 w-4' />} variant='flat'>
                      {filter.label}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu onAction={filter.onAction}>
                    {filter.options.map(option => (
                      <DropdownItem key={option.key}>{option.label}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ))}
            </div>
          )}
        </div>

        {/* Batch Actions */}
        {batchActions.length > 0 && (
          <div className='flex items-center gap-2 p-3 bg-default-50 rounded-lg'>
            <span className='text-sm text-default-600'>{selectedKeys.size} elementos seleccionados</span>
            <div className='flex gap-2 ml-auto'>
              {batchActions.map(action => (
                <Button key={action.key} color={action.color} size='sm' onPress={action.action}>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Table */}
      <CardBody className='p-0'>
        <Table
          aria-label={title}
          classNames={{
            table: 'min-h-[300px]',
            wrapper: 'shadow-none'
          }}
          selectedKeys={selectedKeys}
          selectionMode={enableSelection ? 'multiple' : 'none'}
          sortDescriptor={sortDescriptor}
          onSelectionChange={onSelectionChange}
          onSortChange={onSortChange}
          {...tableProps}>
          <TableHeader columns={columns}>
            {column => (
              <TableColumn key={column.uid} allowsSorting={column.sortable} className={column.className}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={emptyMessage} isLoading={loading} items={data} loadingContent={<Spinner label='Cargando...' />}>
            {item => (
              <TableRow key={item.id || item.key}>{columnKey => <TableCell>{defaultRenderCell(item, columnKey)}</TableCell>}</TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.totalElements > 0 && (
          <div className='flex justify-center px-4 py-3 border-t border-divider'>
            <TablePagination
              currentPage={pagination.page + 1}
              itemsPerPage={pagination.size}
              totalItems={pagination.totalElements}
              totalPages={pagination.totalPages}
              onPageChange={page => onPageChange?.(page - 1)}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default AdminDataTable
