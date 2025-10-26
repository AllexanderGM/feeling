import { useState, useCallback, useMemo, memo } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Pagination,
  Spinner
} from '@heroui/react'
import { Search, RefreshCw, Plus, ChevronDown } from 'lucide-react'
import { Logger } from '@utils/logger.js'

/**
 * GenericDataTable - Tabla genérica y parametrizable para cualquier tipo de datos
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Array de datos a mostrar
 * @param {Array} props.columns - Definición de columnas: [{ name: string, uid: string, sortable?: boolean }]
 * @param {Object} props.pagination - Información de paginación: { page, totalPages, totalElements, size }
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.loadingMessage - Mensaje personalizado de carga
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {Function} props.renderCell - Función para renderizar celdas: (item, columnKey) => ReactNode
 * @param {Function} props.onSearch - Función de búsqueda: (searchValue) => void
 * @param {Function} props.onRefresh - Función de recarga: () => void
 * @param {Function} props.onCreate - Función de creación opcional: () => void
 * @param {string} props.createButtonLabel - Etiqueta del botón de crear
 * @param {Function} props.onPageChange - Función cambio de página: (page) => void
 * @param {Function} props.onRowsPerPageChange - Función cambio filas por página: (size) => void
 * @param {Function} props.onSort - Función de ordenación: (sortDescriptor) => void
 * @param {Object} props.sortDescriptor - Descriptor de ordenación actual: { column, direction }
 * @param {string} props.searchPlaceholder - Placeholder del buscador
 * @param {Array} props.rowsPerPageOptions - Opciones de filas por página [10, 25, 50, 100]
 * @param {boolean} props.showColumnSelector - Mostrar selector de columnas
 * @param {boolean} props.showRowsPerPage - Mostrar selector de filas por página
 * @param {boolean} props.showCreateButton - Mostrar botón de crear
 * @param {boolean} props.showRefreshButton - Mostrar botón de refrescar
 * @param {boolean} props.showSearch - Mostrar buscador
 * @param {boolean} props.showPagination - Mostrar paginación
 * @param {boolean} props.enableSelection - Habilitar selección de filas
 * @param {Function} props.getItemKey - Función para obtener key única: (item, index) => string
 * @param {Object} props.tableProps - Props adicionales para el Table
 * @param {Object} props.topActions - Acciones adicionales en la parte superior
 * @param {string} props.tableId - ID único para la tabla (para logs)
 */
const GenericDataTable = memo(
  ({
    // Datos y estructura
    data = [],
    columns = [],
    pagination = null,
    loading = false,
    loadingMessage = 'Cargando datos...',
    emptyMessage = 'No hay datos para mostrar',

    // Funciones de renderizado
    renderCell,

    // Funciones de interacción
    onSearch,
    onRefresh,
    onCreate,
    onPageChange,
    onRowsPerPageChange,
    onSort,

    // Configuración de búsqueda y creación
    searchPlaceholder = 'Buscar...',
    createButtonLabel = 'Crear nuevo',

    // Configuración de paginación
    rowsPerPageOptions = [5, 10, 25, 50, 100],

    // Estados y configuración
    sortDescriptor = { column: null, direction: 'ascending' },

    // Controles de visibilidad
    showColumnSelector = true,
    showRowsPerPage = true,
    showCreateButton = true,
    showRefreshButton = true,
    showSearch = true,
    showPagination = true,
    enableSelection = false,

    // Funciones de utilidad
    getItemKey = (item, index) => item.id || item.key || `item-${index}`,

    // Props adicionales
    tableProps = {},
    topActions = null,
    tableId = 'generic-table'
  }) => {
    // Estados locales
    const [searchValue, setSearchValue] = useState('')
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.uid)))
    const [selectedKeys, setSelectedKeys] = useState(new Set([]))

    // Debounce para búsqueda
    const [searchTimeout, setSearchTimeout] = useState(null)

    // Funciones de utilidad
    const logTableAction = useCallback(
      (action, details = {}) => {
        Logger.info(`Table ${tableId}: ${action}`, {
          tableId,
          action,
          ...details,
          category: Logger.CATEGORIES.UI
        })
      },
      [tableId]
    )

    // Manejo de búsqueda con debounce
    const handleSearchChange = useCallback(
      value => {
        setSearchValue(value)

        // Limpiar timeout anterior
        if (searchTimeout) {
          clearTimeout(searchTimeout)
        }

        // Crear nuevo timeout
        const newTimeout = setTimeout(() => {
          logTableAction('search', { query: value })
          onSearch?.(value)
        }, 300)

        setSearchTimeout(newTimeout)
      },
      [onSearch, searchTimeout, logTableAction]
    )

    const handleSearchClear = useCallback(() => {
      setSearchValue('')
      logTableAction('search_clear')
      onSearch?.('')
    }, [onSearch, logTableAction])

    // Manejo de selección de columnas
    const handleColumnVisibilityChange = useCallback(
      keys => {
        const newVisibleColumns = new Set(keys)

        setVisibleColumns(newVisibleColumns)
        logTableAction('column_visibility_change', {
          visibleCount: newVisibleColumns.size,
          totalCount: columns.length
        })
      },
      [columns.length, logTableAction]
    )

    // Manejo de selección de filas
    const handleSelectionChange = useCallback(
      keys => {
        setSelectedKeys(keys)
        logTableAction('selection_change', { selectedCount: keys.size })
      },
      [logTableAction]
    )

    // Manejo de acciones
    const handleRefresh = useCallback(() => {
      logTableAction('refresh')
      onRefresh?.()
    }, [onRefresh, logTableAction])

    const handleCreate = useCallback(() => {
      logTableAction('create_new')
      onCreate?.()
    }, [onCreate, logTableAction])

    const handlePageChange = useCallback(
      page => {
        logTableAction('page_change', { page })
        onPageChange?.(page)
      },
      [onPageChange, logTableAction]
    )

    const handleRowsPerPageChange = useCallback(
      size => {
        logTableAction('rows_per_page_change', { size })
        onRowsPerPageChange?.(size)
      },
      [onRowsPerPageChange, logTableAction]
    )

    const handleSort = useCallback(
      descriptor => {
        logTableAction('sort_change', descriptor)
        onSort?.(descriptor)
      },
      [onSort, logTableAction]
    )

    // Columnas visibles filtradas
    const visibleColumnsArray = useMemo(() => {
      return columns.filter(column => visibleColumns.has(column.uid))
    }, [columns, visibleColumns])

    // Datos con keys garantizadas
    const dataWithKeys = useMemo(() => {
      if (!data || data.length === 0) return []

      return data.map((item, index) => ({
        ...item,
        _tableKey: getItemKey(item, index)
      }))
    }, [data, getItemKey])

    // Cálculo de estadísticas
    const stats = useMemo(() => {
      const totalItems = pagination?.totalElements || data.length
      const currentPage = pagination?.page || 1
      const pageSize = pagination?.size || data.length
      const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems)
      const endItem = Math.min(currentPage * pageSize, totalItems)

      return {
        totalItems,
        currentPage,
        pageSize,
        startItem,
        endItem,
        selectedCount: selectedKeys.size
      }
    }, [pagination, data.length, selectedKeys.size])

    // Contenido superior de la tabla
    const topContent = useMemo(
      () => (
        <div className='flex flex-col gap-4'>
          {/* Fila principal de controles */}
          <div className='flex justify-between gap-3 items-end'>
            {/* Lado izquierdo: Búsqueda */}
            {showSearch && (
              <Input
                isClearable
                className='w-full sm:max-w-[44%]'
                classNames={{
                  inputWrapper: [
                    'data-[focus=true]:after:bg-[#E86C6E]',
                    'after:transition-all after:duration-200 after:ease-in-out',
                    'after:bg-[#E86C6E]'
                  ]
                }}
                placeholder={searchPlaceholder}
                startContent={<Search />}
                value={searchValue}
                variant='underlined'
                onClear={handleSearchClear}
                onValueChange={handleSearchChange}
              />
            )}

            {/* Lado derecho: Controles */}
            <div className='flex gap-3'>
              {/* Acciones adicionales del usuario */}
              {topActions}

              {/* Selector de columnas */}
              {showColumnSelector && columns.length > 0 && (
                <Dropdown>
                  <DropdownTrigger className='hidden sm:flex'>
                    <Button endContent={<ChevronDown className='text-small' />} variant='flat'>
                      Columnas
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label='Table Columns'
                    closeOnSelect={false}
                    selectedKeys={visibleColumns}
                    selectionMode='multiple'
                    shouldCloseOnItemClick={false}
                    onSelectionChange={handleColumnVisibilityChange}>
                    {columns.map(column => (
                      <DropdownItem key={column.uid} className='capitalize'>
                        {column.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}

              {/* Botón de refrescar */}
              {showRefreshButton && (
                <Button isIconOnly className='min-w-10' color='default' isLoading={loading} variant='flat' onPress={handleRefresh}>
                  <RefreshCw className='w-4 h-4' />
                </Button>
              )}

              {/* Botón de crear */}
              {showCreateButton && onCreate && (
                <Button color='primary' endContent={<Plus />} onPress={handleCreate}>
                  {createButtonLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Fila de información y configuración */}
          <div className='flex justify-between items-center'>
            {/* Información de elementos */}
            <span className='text-default-400 text-small'>{loading ? 'Cargando...' : `${stats.totalItems} elementos en total`}</span>

            {/* Selector de filas por página - manteniendo el estilo bonito del dropdown */}
            {showRowsPerPage && pagination && (
              <div className='flex items-center gap-2'>
                <span className='text-default-400 text-small'>Filas por página:</span>
                <Dropdown>
                  <DropdownTrigger>
                    <Button className='min-w-16' endContent={<ChevronDown className='w-3 h-3' />} size='sm' variant='flat'>
                      {stats.pageSize}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label='Filas por página' onAction={key => handleRowsPerPageChange(Number(key))}>
                    {rowsPerPageOptions.map(size => (
                      <DropdownItem key={size}>{size}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      ),
      [
        showSearch,
        searchValue,
        searchPlaceholder,
        handleSearchClear,
        handleSearchChange,
        topActions,
        showColumnSelector,
        columns,
        visibleColumns,
        handleColumnVisibilityChange,
        showRefreshButton,
        handleRefresh,
        loading,
        showCreateButton,
        onCreate,
        createButtonLabel,
        handleCreate,
        stats,
        showRowsPerPage,
        pagination,
        rowsPerPageOptions,
        handleRowsPerPageChange
      ]
    )

    // Contenido inferior de la tabla (paginación) -
    const bottomContent = useMemo(() => {
      if (!showPagination || !pagination || pagination.totalPages <= 1) {
        return null
      }

      const handlePreviousPage = () => {
        if (pagination.page > 1) {
          handlePageChange(pagination.page - 1)
        }
      }

      const handleNextPage = () => {
        if (pagination.page < pagination.totalPages) {
          handlePageChange(pagination.page + 1)
        }
      }

      return (
        <div className='py-2 px-2 flex justify-between items-center'>
          {/* Información de selección */}
          <span className='w-[30%] text-small text-default-400'>
            {enableSelection
              ? selectedKeys === 'all'
                ? 'Todos los elementos seleccionados'
                : `${stats.selectedCount} de ${stats.totalItems} seleccionados`
              : `${stats.startItem}-${stats.endItem} de ${stats.totalItems}`}
          </span>

          {/* Paginación central */}
          <Pagination
            isCompact
            showControls
            showShadow
            color='primary'
            initialPage={1}
            page={pagination.page}
            total={pagination.totalPages}
            onChange={handlePageChange}
          />

          {/* Botones Previous/Next manuales */}
          <div className='hidden sm:flex w-[30%] justify-end gap-2'>
            <Button isDisabled={pagination.totalPages === 1 || pagination.page === 1} size='sm' variant='flat' onPress={handlePreviousPage}>
              Anterior
            </Button>
            <Button
              isDisabled={pagination.totalPages === 1 || pagination.page === pagination.totalPages}
              size='sm'
              variant='flat'
              onPress={handleNextPage}>
              Siguiente
            </Button>
          </div>
        </div>
      )
    }, [showPagination, pagination, handlePageChange, enableSelection, selectedKeys, stats])

    // Contenido vacío personalizado
    const emptyContent = useMemo(() => {
      if (loading) {
        return (
          <div className='flex flex-col items-center justify-center py-12'>
            <Spinner color='primary' size='lg' />
            <p className='text-default-500 mt-4'>{loadingMessage}</p>
          </div>
        )
      }

      return (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4'>
            <Search className='w-8 h-8 text-default-400' />
          </div>
          <p className='text-lg font-medium text-default-600'>Sin resultados</p>
          <p className='text-default-400 text-center max-w-md'>{emptyMessage}</p>
        </div>
      )
    }, [loading, loadingMessage, emptyMessage])

    // Validaciones
    if (!renderCell) {
      Logger.error('GenericDataTable: renderCell function is required', { tableId })

      return <div className='p-4 text-center text-red-500'>Error: función renderCell es requerida</div>
    }

    if (!columns || columns.length === 0) {
      Logger.error('GenericDataTable: columns array is required', { tableId })

      return <div className='p-4 text-center text-red-500'>Error: definición de columnas es requerida</div>
    }

    return (
      <div className='w-full space-y-4'>
        <Table
          isHeaderSticky
          aria-label={`Tabla de datos ${tableId}`}
          bottomContent={bottomContent}
          bottomContentPlacement='outside'
          classNames={{
            wrapper: 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50',
            th: 'bg-gray-700/50 border-b border-gray-600/50',
            td: 'border-b border-gray-700/30',
            tbody: '[&>tr:hover]:bg-gray-700/20',
            ...tableProps.classNames
          }}
          selectedKeys={enableSelection ? selectedKeys : undefined}
          selectionMode={enableSelection ? 'multiple' : 'none'}
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement='outside'
          onSelectionChange={enableSelection ? handleSelectionChange : undefined}
          onSortChange={onSort ? handleSort : undefined}
          {...tableProps}>
          <TableHeader columns={visibleColumnsArray}>
            {column => (
              <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.sortable && onSort}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={emptyContent}
            items={dataWithKeys}
            loadingContent={<Spinner label={loadingMessage} />}
            loadingState={loading ? 'loading' : 'idle'}>
            {item => <TableRow key={item._tableKey}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
          </TableBody>
        </Table>
      </div>
    )
  }
)

GenericDataTable.displayName = 'GenericDataTable'

export default GenericDataTable
