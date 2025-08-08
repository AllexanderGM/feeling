import { useCallback, useMemo, useState, useEffect, memo, useRef } from 'react'
import { useAuth, useEvents, useError } from '@hooks'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Logger } from '@utils/logger.js'
import { Calendar, Clock, TrendingUp, Edit, Pause, X, CheckCircle } from 'lucide-react'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { EVENT_TYPE_COLUMNS, DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import EventStatsCards from './components/EventStatsCards.jsx'
import UnifiedEventTable from './components/UnifiedEventTable.jsx'
import CreateEventForm from './components/CreateEventForm.jsx'
import EditEventForm from './components/EditEventForm.jsx'
import DeleteEventModal from './components/DeleteEventModal.jsx'

const EventManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const {
    // Todos los eventos
    allEvents,
    allEventsPagination,
    fetchAllEvents,
    refreshAllEvents,

    // Eventos por estado
    eventsByStatus,
    eventsByStatusPagination,
    fetchEventsByStatus,
    refreshEventsByStatus,

    // Operaciones
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    forceDeleteEvent,

    // Estadísticas
    eventStats,
    fetchEventStats,

    // Estados generales
    loading
  } = useEvents()
  const { handleError, handleSuccess } = useError()

  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('all')

  // Estado para los conteos de pestañas
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    PUBLICADO: 0,
    EN_EDICION: 0,
    PAUSADO: 0,
    CANCELADO: 0,
    TERMINADO: 0
  })

  // Estados para cada tipo de tabla
  const [tableStates, setTableStates] = useState({
    all: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    PUBLICADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'eventDate', direction: 'ascending' },
      page: 1,
      loading: false
    },
    EN_EDICION: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    PAUSADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'updatedAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    CANCELADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'updatedAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    TERMINADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(EVENT_TYPE_COLUMNS.all.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'eventDate', direction: 'descending' },
      page: 1,
      loading: false
    }
  })

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Ref to track if initial data load has been performed
  const hasInitialLoadRef = useRef(false)

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // Función helper para actualizar estado de una tabla específica
  const updateTableState = useCallback((tableType, updates) => {
    setTableStates(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        ...updates
      }
    }))
  }, [])

  // Función helper para obtener datos de evento por tipo
  const getEventsData = useCallback(
    tableType => {
      switch (tableType) {
        case 'all':
          return { events: allEvents, pagination: allEventsPagination, fetchMethod: fetchAllEvents }
        case 'PUBLICADO':
        case 'EN_EDICION':
        case 'PAUSADO':
        case 'CANCELADO':
        case 'TERMINADO':
          return {
            events: eventsByStatus[tableType] || [],
            pagination: eventsByStatusPagination[tableType] || { totalPages: 0, totalElements: 0 },
            fetchMethod: (page, size, searchTerm) => fetchEventsByStatus(tableType, page, size, searchTerm)
          }
        default:
          return { events: [], pagination: { totalPages: 0, totalElements: 0 }, fetchMethod: null }
      }
    },
    [allEvents, allEventsPagination, fetchAllEvents, eventsByStatus, eventsByStatusPagination, fetchEventsByStatus]
  )

  // ========================================
  // EFFECTS
  // ========================================

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchEventStats()
  }, [])

  // Actualizar conteos cuando cambien las paginaciones (solo cuando realmente cambien los valores)
  useEffect(() => {
    setTabCounts({
      all: allEventsPagination.totalElements || 0,
      PUBLICADO: eventsByStatusPagination.PUBLICADO?.totalElements || 0,
      EN_EDICION: eventsByStatusPagination.EN_EDICION?.totalElements || 0,
      PAUSADO: eventsByStatusPagination.PAUSADO?.totalElements || 0,
      CANCELADO: eventsByStatusPagination.CANCELADO?.totalElements || 0,
      TERMINADO: eventsByStatusPagination.TERMINADO?.totalElements || 0
    })
  }, [
    allEventsPagination.totalElements,
    eventsByStatusPagination.PUBLICADO?.totalElements,
    eventsByStatusPagination.EN_EDICION?.totalElements,
    eventsByStatusPagination.PAUSADO?.totalElements,
    eventsByStatusPagination.CANCELADO?.totalElements,
    eventsByStatusPagination.TERMINADO?.totalElements
  ])

  // Debounce para búsqueda de todas las tablas
  useEffect(() => {
    const timers = []

    Object.keys(tableStates).forEach(tableType => {
      const timer = setTimeout(() => {
        updateTableState(tableType, {
          debouncedFilter: tableStates[tableType].filterValue
        })
      }, 500)
      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [
    tableStates.all?.filterValue,
    tableStates.PUBLICADO?.filterValue,
    tableStates.EN_EDICION?.filterValue,
    tableStates.PAUSADO?.filterValue,
    tableStates.CANCELADO?.filterValue,
    tableStates.TERMINADO?.filterValue,
    updateTableState
  ])

  // Cargar datos cuando cambien los parámetros de cada tabla
  useEffect(() => {
    const currentTable = tableStates[selectedTab]

    if (!currentTable) return

    // Crear una clave única para este estado de parámetros
    const paramsKey = `${selectedTab}-${currentTable.page}-${currentTable.rowsPerPage}-${currentTable.debouncedFilter}`

    // Evitar llamadas repetitivas con los mismos parámetros
    if (currentTable.loading) return

    let fetchMethod = null

    // Determinar el método de fetch sin crear dependencias circulares
    if (selectedTab === 'all') {
      fetchMethod = fetchAllEvents
    } else if (['PUBLICADO', 'EN_EDICION', 'PAUSADO', 'CANCELADO', 'TERMINADO'].includes(selectedTab)) {
      fetchMethod = (page, size, searchTerm) => fetchEventsByStatus(selectedTab, page, size, searchTerm)
    }

    if (fetchMethod) {
      updateTableState(selectedTab, { loading: true })

      fetchMethod(currentTable.page - 1, currentTable.rowsPerPage, currentTable.debouncedFilter)
        .catch(error => {
          Logger.error(`EventManagement: Error cargando eventos ${selectedTab}:`, error, { category: Logger.CATEGORIES.SERVICE })
        })
        .finally(() => {
          updateTableState(selectedTab, { loading: false })
        })
    }
  }, [selectedTab, tableStates[selectedTab]?.page, tableStates[selectedTab]?.rowsPerPage, tableStates[selectedTab]?.debouncedFilter])

  // ========================================
  // CONFIGURACIONES DINÁMICAS POR TABLA
  // ========================================

  // Obtener configuración actual de la tabla seleccionada
  const currentTableState = tableStates[selectedTab]
  const { events: currentEvents, pagination: currentPagination } = getEventsData(selectedTab)

  // Todas las columnas disponibles (para el dropdown de selección)
  const allColumns = useMemo(() => {
    return EVENT_TYPE_COLUMNS[selectedTab] || []
  }, [selectedTab])

  // Columnas dinámicas según el tipo de tabla (columnas visibles filtradas)
  const headerColumns = useMemo(() => {
    const visibleColumns = currentTableState?.visibleColumns

    if (visibleColumns === 'all') return allColumns
    return allColumns.filter(column => Array.from(visibleColumns || []).includes(column.uid))
  }, [allColumns, currentTableState?.visibleColumns])

  // Paginación dinámica según el tipo de tabla
  const pages = currentPagination?.totalPages || 1
  const totalItems = currentPagination?.totalElements || 0

  // Ordenamiento local (el backend maneja filtrado y paginación)
  const sortedItems = useMemo(() => {
    if (!currentEvents?.length) return []

    const sortDescriptor = currentTableState?.sortDescriptor
    if (!sortDescriptor) return currentEvents

    return [...currentEvents].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [currentEvents, currentTableState?.sortDescriptor])

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(
    async event => {
      try {
        // Get complete event data
        const fullEventData = await getEventById(event.id)
        setSelectedEvent(fullEventData)
        setIsEditModalOpen(true)
      } catch (error) {
        Logger.error('Error getting complete event data:', error, { category: Logger.CATEGORIES.SERVICE })
        handleError('Error al cargar datos del evento. Usando información básica.')
        // Fallback to basic data if call fails
        setSelectedEvent(event)
        setIsEditModalOpen(true)
      }
    },
    [getEventById, handleError]
  )

  const handleOpenDeleteModal = useCallback(
    event => {
      if (!event || !event.id) {
        Logger.error('Incomplete event data for deletion', { event }, { category: Logger.CATEGORIES.UI })
        handleError('No se puede eliminar el evento: datos incompletos')
        return
      }

      setSelectedEvent(event)
      setIsDeleteModalOpen(true)
    },
    [handleError]
  )

  const handleOperationSuccess = useCallback(() => {
    Logger.info('Operation successful, updating event lists', { category: Logger.CATEGORIES.UI })

    // Refrescar todas las listas de eventos con sus respectivos estados
    const refreshAllTables = () => {
      Object.keys(tableStates).forEach(tableType => {
        const state = tableStates[tableType]
        const { fetchMethod } = getEventsData(tableType)

        if (fetchMethod) {
          fetchMethod((state.page || 1) - 1, state.rowsPerPage || DEFAULT_ROWS_PER_PAGE, state.debouncedFilter || '').catch(error => {
            Logger.error(`Error refreshing ${tableType} events:`, error, { category: Logger.CATEGORIES.SERVICE })
          })
        }
      })
    }

    refreshAllTables()

    // Refrescar estadísticas
    fetchEventStats()

    // Cerrar modales
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }, [tableStates, getEventsData, fetchEventStats])

  const handleCreateEvent = useCallback(
    async eventData => {
      try {
        await createEvent(eventData)
        handleSuccess('Evento creado exitosamente')
        handleOperationSuccess()
      } catch (error) {
        handleError('Error al crear el evento')
      }
    },
    [createEvent, handleSuccess, handleError, handleOperationSuccess]
  )

  const handleUpdateEvent = useCallback(
    async (eventId, eventData) => {
      try {
        await updateEvent(eventId, eventData)
        handleSuccess('Evento actualizado exitosamente')
        handleOperationSuccess()
      } catch (error) {
        handleError('Error al actualizar el evento')
      }
    },
    [updateEvent, handleSuccess, handleError, handleOperationSuccess]
  )

  const handleDeleteEvent = useCallback(
    async (eventId, forceDelete = false) => {
      try {
        if (forceDelete) {
          await forceDeleteEvent(eventId)
        } else {
          await deleteEvent(eventId)
        }
        handleSuccess('Evento eliminado exitosamente')
        handleOperationSuccess()
      } catch (error) {
        handleError('Error al eliminar el evento')
      }
    },
    [deleteEvent, forceDeleteEvent, handleSuccess, handleError, handleOperationSuccess]
  )

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }, [])

  const handleToggleEventStatus = useCallback(
    async eventId => {
      try {
        await toggleEventStatus(eventId)
        handleSuccess('Estado del evento cambiado correctamente')

        // Refrescar todas las listas
        const refreshAllTables = () => {
          Object.keys(tableStates).forEach(tableType => {
            const state = tableStates[tableType]
            const { fetchMethod } = getEventsData(tableType)

            if (fetchMethod) {
              fetchMethod((state.page || 1) - 1, state.rowsPerPage || DEFAULT_ROWS_PER_PAGE, state.debouncedFilter || '').catch(error => {
                Logger.error(`Error refreshing ${tableType} events:`, error, { category: Logger.CATEGORIES.SERVICE })
              })
            }
          })
        }

        refreshAllTables()
        fetchEventStats() // Actualizar estadísticas
      } catch (error) {
        handleError('Error al cambiar el estado del evento')
      }
    },
    [toggleEventStatus, handleSuccess, handleError, tableStates, getEventsData, fetchEventStats]
  )

  // ========================================
  // TABLE HANDLERS
  // ========================================

  // Handlers de paginación genéricos
  const onNextPage = useCallback(() => {
    const currentTable = tableStates[selectedTab]
    if (currentTable.page < pages) {
      updateTableState(selectedTab, { page: currentTable.page + 1 })
    }
  }, [selectedTab, tableStates, pages, updateTableState])

  const onPreviousPage = useCallback(() => {
    const currentTable = tableStates[selectedTab]
    if (currentTable.page > 1) {
      updateTableState(selectedTab, { page: currentTable.page - 1 })
    }
  }, [selectedTab, tableStates, updateTableState])

  const onPageChange = useCallback(
    newPage => {
      updateTableState(selectedTab, { page: newPage })
    },
    [selectedTab, updateTableState]
  )

  const onRowsPerPageChange = useCallback(
    newValue => {
      updateTableState(selectedTab, {
        rowsPerPage: newValue,
        page: 1
      })
    },
    [selectedTab, updateTableState]
  )

  const onSearchChange = useCallback(
    value => {
      updateTableState(selectedTab, {
        filterValue: value || '',
        page: 1
      })
    },
    [selectedTab, updateTableState]
  )

  const onClear = useCallback(() => {
    updateTableState(selectedTab, {
      filterValue: '',
      page: 1
    })
  }, [selectedTab, updateTableState])

  const onSortChange = useCallback(
    sortDescriptor => {
      updateTableState(selectedTab, { sortDescriptor })
    },
    [selectedTab, updateTableState]
  )

  const onSelectionChange = useCallback(
    selectedKeys => {
      updateTableState(selectedTab, { selectedKeys })
    },
    [selectedTab, updateTableState]
  )

  const onColumnsChange = useCallback(
    visibleColumns => {
      updateTableState(selectedTab, { visibleColumns })
    },
    [selectedTab, updateTableState]
  )

  // ========================================
  // CONTENIDO DINÁMICO DE TABLA
  // ========================================

  // Función para obtener el placeholder de búsqueda según el tipo de tabla
  const getSearchPlaceholder = useCallback(tableType => {
    const placeholders = {
      all: 'Buscar todos los eventos por nombre, destino, creador...',
      PUBLICADO: 'Buscar eventos publicados por nombre, destino...',
      EN_EDICION: 'Buscar eventos en edición por nombre, destino...',
      PAUSADO: 'Buscar eventos pausados por nombre, destino...',
      CANCELADO: 'Buscar eventos cancelados por nombre, destino...',
      TERMINADO: 'Buscar eventos terminados por nombre, destino...'
    }
    return placeholders[tableType] || 'Buscar eventos...'
  }, [])

  // Función para obtener el método de refresh según el tipo de tabla
  const getRefreshMethod = useCallback(
    tableType => {
      if (tableType === 'all') {
        return refreshAllEvents
      } else if (['PUBLICADO', 'EN_EDICION', 'PAUSADO', 'CANCELADO', 'TERMINADO'].includes(tableType)) {
        return (page, size, searchTerm) => refreshEventsByStatus(tableType, page, size, searchTerm)
      }
      return null
    },
    [refreshAllEvents, refreshEventsByStatus]
  )

  // Top content dinámico para la tabla actual
  const topContent = useMemo(() => {
    const refreshMethod = getRefreshMethod(selectedTab)

    return (
      <GenericTableControls
        filterValue={currentTableState?.filterValue || ''}
        onClear={onClear}
        onSearchChange={onSearchChange}
        filterPlaceholder={getSearchPlaceholder(selectedTab)}
        columns={allColumns}
        visibleColumns={currentTableState?.visibleColumns}
        setVisibleColumns={onColumnsChange}
        onCreateItem={handleOpenCreateModal}
        createButtonLabel='Crear Evento'
        onRefresh={() =>
          refreshMethod?.(
            (currentTableState?.page || 1) - 1,
            currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
            currentTableState?.debouncedFilter || ''
          )
        }
        loading={currentTableState?.loading || loading}
        error={null}
        totalItems={totalItems}
        itemsLabel={`eventos ${selectedTab}`}
        rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    )
  }, [
    selectedTab,
    currentTableState,
    totalItems,
    loading,
    onClear,
    onSearchChange,
    onColumnsChange,
    onRowsPerPageChange,
    getSearchPlaceholder,
    getRefreshMethod,
    handleOpenCreateModal
  ])

  // Bottom content dinámico para la tabla actual
  const bottomContent = useMemo(
    () => (
      <TablePagination
        selectedKeys={currentTableState?.selectedKeys || new Set([])}
        filteredItemsLength={totalItems}
        page={currentTableState?.page || 1}
        pages={pages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageChange={onPageChange}
      />
    ),
    [currentTableState, totalItems, pages, onPreviousPage, onNextPage, onPageChange]
  )

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Gestión de Eventos | Admin</title>
        <meta name='description' content='Panel de administración para gestionar eventos del sistema' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Gestión de Eventos</h1>
          <p className='text-gray-400'>Administra los eventos del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <EventStatsCards eventStats={eventStats} />

      {/* Pestañas para los 3 tipos de eventos */}
      <div className='flex w-full flex-col'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label='Gestión de eventos'
          color='primary'
          variant='bordered'>
          {/* Todos los Eventos */}
          <Tab
            key='all'
            title={
              <div className='flex items-center space-x-2'>
                <TrendingUp className='w-4 h-4' />
                <span>Todos</span>
                {tabCounts.all > 0 && (
                  <div className='bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.all}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='all'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Eventos Publicados */}
          <Tab
            key='PUBLICADO'
            title={
              <div className='flex items-center space-x-2'>
                <CheckCircle className='w-4 h-4' />
                <span>Publicados</span>
                {tabCounts.PUBLICADO > 0 && (
                  <div className='bg-success-100 text-success-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.PUBLICADO}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='PUBLICADO'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Eventos En Edición */}
          <Tab
            key='EN_EDICION'
            title={
              <div className='flex items-center space-x-2'>
                <Edit className='w-4 h-4' />
                <span>En Edición</span>
                {tabCounts.EN_EDICION > 0 && (
                  <div className='bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.EN_EDICION}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='EN_EDICION'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Eventos Pausados */}
          <Tab
            key='PAUSADO'
            title={
              <div className='flex items-center space-x-2'>
                <Pause className='w-4 h-4' />
                <span>Pausados</span>
                {tabCounts.PAUSADO > 0 && (
                  <div className='bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.PAUSADO}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='PAUSADO'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Eventos Cancelados */}
          <Tab
            key='CANCELADO'
            title={
              <div className='flex items-center space-x-2'>
                <X className='w-4 h-4' />
                <span>Cancelados</span>
                {tabCounts.CANCELADO > 0 && (
                  <div className='bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.CANCELADO}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='CANCELADO'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Eventos Terminados */}
          <Tab
            key='TERMINADO'
            title={
              <div className='flex items-center space-x-2'>
                <Clock className='w-4 h-4' />
                <span>Terminados</span>
                {tabCounts.TERMINADO > 0 && (
                  <div className='bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.TERMINADO}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedEventTable
                events={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='TERMINADO'
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onToggleStatus={handleToggleEventStatus}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Modales para CRUD de eventos */}
      <CreateEventForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSubmit={handleCreateEvent} loading={loading} />

      <EditEventForm
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleUpdateEvent}
        loading={loading}
        eventData={selectedEvent}
      />

      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteEvent}
        loading={loading}
        eventData={selectedEvent}
      />
    </div>
  )
})

EventManagement.displayName = 'EventManagement'

export default EventManagement
