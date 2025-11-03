import { useCallback, useMemo, useState, useEffect, useRef, memo } from 'react'
import { useEvents, useError } from '@hooks'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Logger } from '@utils/logger.js'
import { Clock, Edit, Pause, X, CheckCircle } from 'lucide-react'
import GenericTableControls from '@components/ui/table/GenericTableControls.jsx'
import TablePagination from '@components/ui/table/TablePagination.jsx'
import { EVENT_TYPE_COLUMNS, DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import EventStatsCards from './components/EventStatsCards.jsx'
import UnifiedEventTable from './components/UnifiedEventTable.jsx'
import CreateEventForm from './components/CreateEventForm.jsx'
import EditEventForm from './components/EditEventForm.jsx'
import DeleteEventModal from './components/DeleteEventModal.jsx'
import ConfirmActionModal from './components/ConfirmActionModal.jsx'

const STATUS_TAB_DEFINITIONS = [
  {
    key: 'PUBLICADO',
    label: 'Publicados',
    icon: CheckCircle,
    badgeClassName: 'bg-success-100 text-success-600'
  },
  {
    key: 'EN_EDICION',
    label: 'En Edición',
    icon: Edit,
    badgeClassName: 'bg-warning-100 text-warning-600'
  },
  {
    key: 'PAUSADO',
    label: 'Pausados',
    icon: Pause,
    badgeClassName: 'bg-orange-100 text-orange-600'
  },
  {
    key: 'CANCELADO',
    label: 'Cancelados',
    icon: X,
    badgeClassName: 'bg-red-100 text-red-600'
  },
  {
    key: 'TERMINADO',
    label: 'Terminados',
    icon: Clock,
    badgeClassName: 'bg-gray-100 text-gray-600'
  }
]

const EventManagement = memo(() => {
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
    publishEvent,
    pauseEvent,
    cancelEvent,
    activateEvent,
    backToEdition,
    forceDeleteEvent,

    // Estadísticas
    eventStats,
    fetchEventStats,

    // Estados generales
    loading,
    submitting
  } = useEvents()
  const { handleError, handleSuccess } = useError()

  const createVisibleColumnSet = tableType => {
    const columns = EVENT_TYPE_COLUMNS[tableType] || EVENT_TYPE_COLUMNS.all

    return new Set(columns.filter(column => column.uid !== 'id').map(column => column.uid))
  }

  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('PUBLICADO')

  // Estado para los conteos de pestañas
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    PUBLICADO: 0,
    EN_EDICION: 0,
    PAUSADO: 0,
    CANCELADO: 0,
    TERMINADO: 0
  })

  const statusTabs = useMemo(
    () =>
      STATUS_TAB_DEFINITIONS.map(definition => ({
        ...definition,
        count: tabCounts[definition.key] ?? 0
      })),
    [tabCounts]
  )

  // Estados para cada tipo de tabla
  const [tableStates, setTableStates] = useState({
    all: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('all'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    PUBLICADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('PUBLICADO'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    EN_EDICION: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('EN_EDICION'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    PAUSADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('PAUSADO'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    CANCELADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('CANCELADO'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    TERMINADO: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: createVisibleColumnSet('TERMINADO'),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    }
  })

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    action: null,
    eventData: null
  })

  // Track last fetched params per tab to avoid refetch loops
  const lastFetchParamsRef = useRef({})

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

  const currentTableState = tableStates[selectedTab]
  const currentPage = currentTableState?.page ?? 1
  const currentRowsPerPage = currentTableState?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE
  const currentFilter = currentTableState?.debouncedFilter ?? ''
  const currentLoading = Boolean(currentTableState?.loading)
  const hasCurrentTable = Boolean(currentTableState)

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchEventStats()
  }, [fetchEventStats])

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
    if (!hasCurrentTable) return
    if (currentLoading) return

    const paramsKey = {
      page: currentPage,
      rowsPerPage: currentRowsPerPage,
      filter: currentFilter
    }
    const lastParams = lastFetchParamsRef.current[selectedTab]

    if (
      lastParams &&
      lastParams.page === paramsKey.page &&
      lastParams.rowsPerPage === paramsKey.rowsPerPage &&
      lastParams.filter === paramsKey.filter
    ) {
      return
    }

    let fetchMethod = null

    if (selectedTab === 'all') {
      fetchMethod = fetchAllEvents
    } else if (['PUBLICADO', 'EN_EDICION', 'PAUSADO', 'CANCELADO', 'TERMINADO'].includes(selectedTab)) {
      fetchMethod = (page, size, searchTerm) => fetchEventsByStatus(selectedTab, page, size, searchTerm)
    }

    if (fetchMethod) {
      lastFetchParamsRef.current[selectedTab] = paramsKey
      updateTableState(selectedTab, { loading: true })

      fetchMethod(currentPage - 1, currentRowsPerPage, currentFilter)
        .catch(error => {
          Logger.error(`EventManagement: Error cargando eventos ${selectedTab}:`, error, { category: Logger.CATEGORIES.SERVICE })
          lastFetchParamsRef.current[selectedTab] = undefined
        })
        .finally(() => {
          updateTableState(selectedTab, { loading: false })
        })
    }
  }, [
    currentFilter,
    currentLoading,
    currentPage,
    currentRowsPerPage,
    hasCurrentTable,
    fetchAllEvents,
    fetchEventsByStatus,
    selectedTab,
    updateTableState
  ])

  // ========================================
  // CONFIGURACIONES DINÁMICAS POR TABLA
  // ========================================

  // Obtener configuración actual de la tabla seleccionada
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

  const handleOpenConfirmModal = useCallback(
    (action, event) => {
      if (!event || !event.id) {
        Logger.error('Incomplete event data for lifecycle action', { action, event }, { category: Logger.CATEGORIES.UI })
        handleError('No se pudo preparar la acción para este evento.')

        return
      }

      setConfirmModalState({
        isOpen: true,
        action,
        eventData: event
      })
    },
    [handleError]
  )

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalState({
      isOpen: false,
      action: null,
      eventData: null
    })
  }, [])

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
    setConfirmModalState({ isOpen: false, action: null, eventData: null })
    setSelectedEvent(null)
  }, [tableStates, getEventsData, fetchEventStats, setConfirmModalState])

  const handleConfirmAction = useCallback(async () => {
    const { action, eventData } = confirmModalState || {}

    if (!action || !eventData) {
      setConfirmModalState({
        isOpen: false,
        action: null,
        eventData: null
      })

      return
    }

    const actionConfig = {
      publish: {
        service: publishEvent,
        successMessage: 'Evento publicado exitosamente.',
        errorMessage: 'Error al publicar el evento.'
      },
      pause: {
        service: pauseEvent,
        successMessage: 'Evento pausado correctamente.',
        errorMessage: 'Error al pausar el evento.'
      },
      cancel: {
        service: cancelEvent,
        successMessage: 'Evento cancelado correctamente.',
        errorMessage: 'Error al cancelar el evento.'
      },
      activate: {
        service: activateEvent,
        successMessage: 'Evento activado y enviado a edición.',
        errorMessage: 'Error al activar el evento.'
      },
      back_to_edition: {
        service: backToEdition,
        successMessage: 'Evento movido a edición correctamente.',
        errorMessage: 'Error al mover el evento a edición.'
      }
    }

    const config = actionConfig[action]

    if (!config?.service) {
      Logger.warn('Unsupported lifecycle action requested', { action }, { category: Logger.CATEGORIES.UI })
      handleError('Acción no soportada para este evento.')
      setConfirmModalState({
        isOpen: false,
        action: null,
        eventData: null
      })

      return
    }

    try {
      const result = await config.service(eventData, { showNotifications: false })

      if (result?.success === false) {
        handleError(result.message || config.errorMessage)

        return
      }

      handleSuccess(config.successMessage)
      handleOperationSuccess()
    } catch (error) {
      Logger.error('Error executing lifecycle action', error, {
        category: Logger.CATEGORIES.SERVICE,
        context: { action, eventId: eventData.id }
      })
      handleError(config.errorMessage)
    } finally {
      setConfirmModalState({
        isOpen: false,
        action: null,
        eventData: null
      })
    }
  }, [
    activateEvent,
    backToEdition,
    cancelEvent,
    confirmModalState,
    handleError,
    handleOperationSuccess,
    handleSuccess,
    pauseEvent,
    publishEvent
  ])

  const handleCreateEvent = useCallback(
    async ({ eventData, media, action = 'draft' }) => {
      try {
        const result = await createEvent(eventData, { media, showNotifications: false })

        if (result?.success === false) {
          handleError(result.message || 'Error al crear el evento')

          return
        }

        let createdEvent = result.data

        if (action === 'publish' && createdEvent) {
          const publishResult = await publishEvent(createdEvent, { showNotifications: false })

          if (publishResult?.success === false) {
            handleError(publishResult.message || 'El evento se creó, pero no se pudo publicar.')
            handleOperationSuccess()

            return
          }

          createdEvent = publishResult.data || createdEvent
          handleSuccess('Evento creado y publicado exitosamente')
        } else {
          handleSuccess('Evento creado como borrador')
        }

        handleOperationSuccess()
      } catch (error) {
        Logger.error('Error creating event', error, { category: Logger.CATEGORIES.SERVICE })
        handleError('Error al crear el evento')
      }
    },
    [createEvent, publishEvent, handleError, handleOperationSuccess, handleSuccess]
  )

  const handleUpdateEvent = useCallback(
    async ({ eventId, eventData, media, action = 'save', currentStatus }) => {
      try {
        const result = await updateEvent(eventId, eventData, { media, showNotifications: false })

        if (result?.success === false) {
          handleError(result.message || 'Error al actualizar el evento')

          return
        }

        let updatedEvent = result.data
        let successMessage = 'Evento actualizado exitosamente'

        const baseEvent = updatedEvent || { id: eventId, status: currentStatus }

        if (action === 'publish' && baseEvent?.id) {
          let lifecycleEvent = baseEvent
          const initialStatus = lifecycleEvent.status || currentStatus

          if (initialStatus === 'CANCELADO') {
            const activateResult = await activateEvent(lifecycleEvent, { showNotifications: false })

            if (activateResult?.success === false) {
              handleError(activateResult.message || 'No se pudo reactivar el evento antes de publicarlo.')

              return
            }

            lifecycleEvent = activateResult.data || lifecycleEvent
          }

          const publishResult = await publishEvent(lifecycleEvent, { showNotifications: false })

          if (publishResult?.success === false) {
            handleError(publishResult.message || 'No se pudo publicar el evento.')

            return
          }

          updatedEvent = publishResult.data || lifecycleEvent
          successMessage = 'Evento actualizado y publicado exitosamente'
        } else if (action === 'draft' && baseEvent?.id) {
          let lifecycleEvent = baseEvent
          let statusForDraft = lifecycleEvent.status || currentStatus

          if (statusForDraft === 'PUBLICADO') {
            const pauseResult = await pauseEvent(lifecycleEvent, { showNotifications: false })

            if (pauseResult?.success === false) {
              handleError(pauseResult.message || 'No se pudo pausar el evento antes de enviarlo a edición.')

              return
            }

            lifecycleEvent = pauseResult.data || lifecycleEvent
            statusForDraft = lifecycleEvent.status || statusForDraft
          }

          if (statusForDraft === 'PAUSADO') {
            const backResult = await backToEdition(lifecycleEvent, { showNotifications: false })

            if (backResult?.success === false) {
              handleError(backResult.message || 'No se pudo mover el evento a edición.')

              return
            }

            lifecycleEvent = backResult.data || lifecycleEvent
          } else if (statusForDraft === 'CANCELADO') {
            const activateResult = await activateEvent(lifecycleEvent, { showNotifications: false })

            if (activateResult?.success === false) {
              handleError(activateResult.message || 'No se pudo reactivar el evento.')

              return
            }

            lifecycleEvent = activateResult.data || lifecycleEvent
          }

          updatedEvent = lifecycleEvent
          successMessage = 'Evento guardado como borrador'
        }

        handleSuccess(successMessage)
        handleOperationSuccess()
      } catch (error) {
        Logger.error('Error updating event', error, { category: Logger.CATEGORIES.SERVICE })
        handleError('Error al actualizar el evento')
      }
    },
    [activateEvent, backToEdition, pauseEvent, publishEvent, handleError, handleOperationSuccess, handleSuccess, updateEvent]
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
      } catch {
        handleError('Error al eliminar el evento')
      }
    },
    [deleteEvent, forceDeleteEvent, handleSuccess, handleError, handleOperationSuccess]
  )

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setConfirmModalState({ isOpen: false, action: null, eventData: null })
    setSelectedEvent(null)
  }, [])

  const tableActionHandlers = useMemo(
    () => ({
      onActivate: event => handleOpenConfirmModal('activate', event),
      onBackToEdition: event => handleOpenConfirmModal('back_to_edition', event),
      onCancel: event => handleOpenConfirmModal('cancel', event),
      onPause: event => handleOpenConfirmModal('pause', event),
      onPublish: event => handleOpenConfirmModal('publish', event),
      onDelete: handleOpenDeleteModal,
      onEdit: handleOpenEditModal
    }),
    [handleOpenConfirmModal, handleOpenDeleteModal, handleOpenEditModal]
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
        columns={allColumns}
        createButtonLabel='Crear Evento'
        error={null}
        filterPlaceholder={getSearchPlaceholder(selectedTab)}
        filterValue={currentTableState?.filterValue || ''}
        itemsLabel={`eventos ${selectedTab}`}
        loading={currentTableState?.loading || loading}
        rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
        setVisibleColumns={onColumnsChange}
        totalItems={totalItems}
        visibleColumns={currentTableState?.visibleColumns}
        onClear={onClear}
        onCreateItem={handleOpenCreateModal}
        onRefresh={() =>
          refreshMethod?.(
            (currentTableState?.page || 1) - 1,
            currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
            currentTableState?.debouncedFilter || ''
          )
        }
        onRowsPerPageChange={onRowsPerPageChange}
        onSearchChange={onSearchChange}
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
        filteredItemsLength={totalItems}
        page={currentTableState?.page || 1}
        pages={pages}
        selectedKeys={currentTableState?.selectedKeys || new Set([])}
        onNextPage={onNextPage}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
      />
    ),
    [currentTableState, totalItems, pages, onPreviousPage, onNextPage, onPageChange]
  )

  const sharedTableProps = useMemo(
    () => ({
      bottomContent,
      headerColumns,
      loading: currentTableState?.loading || loading || submitting,
      setSortDescriptor: onSortChange,
      sortDescriptor: currentTableState?.sortDescriptor,
      topContent,
      ...tableActionHandlers
    }),
    [bottomContent, headerColumns, currentTableState, loading, submitting, onSortChange, topContent, tableActionHandlers]
  )

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Gestión de Eventos | Admin</title>
        <meta content='Panel de administración para gestionar eventos del sistema' name='description' />
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

      {/* Pestañas para los tipos de eventos */}
      <div className='flex w-full flex-col'>
        <Tabs
          aria-label='Gestión de eventos'
          color='primary'
          selectedKey={selectedTab}
          variant='bordered'
          onSelectionChange={setSelectedTab}>
          {statusTabs.map(({ key, label, icon: Icon, badgeClassName, count }) => (
            <Tab
              key={key}
              title={
                <div className='flex items-center space-x-2'>
                  <Icon className='w-4 h-4' />
                  <span>{label}</span>
                  {count > 0 ? <div className={`${badgeClassName} px-2 py-1 rounded-full text-xs font-medium`}>{count}</div> : null}
                </div>
              }>
              <div className='py-4'>
                <UnifiedEventTable {...sharedTableProps} events={sortedItems} tableType={key} />
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>

      {/* Modales para CRUD de eventos */}
      <CreateEventForm
        isOpen={isCreateModalOpen}
        loading={loading || submitting}
        onClose={handleCloseModals}
        onSubmit={handleCreateEvent}
      />

      <EditEventForm
        eventData={selectedEvent}
        isOpen={isEditModalOpen}
        loading={loading || submitting}
        onClose={handleCloseModals}
        onSubmit={handleUpdateEvent}
      />

      <DeleteEventModal
        eventData={selectedEvent}
        isOpen={isDeleteModalOpen}
        loading={loading || submitting}
        onClose={handleCloseModals}
        onConfirm={handleDeleteEvent}
      />

      <ConfirmActionModal
        actionType={confirmModalState.action || 'publish'}
        eventData={confirmModalState.eventData}
        isOpen={confirmModalState.isOpen}
        loading={submitting}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
})

EventManagement.displayName = 'EventManagement'

export default EventManagement
