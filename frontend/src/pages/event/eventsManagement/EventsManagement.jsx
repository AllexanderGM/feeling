import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { useError } from '@hooks/useError.js'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, MapPin } from 'lucide-react'
import useAuth from '@hooks/useAuth.js'
import useTour from '@hooks/useTour.js'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { EVENT_COLUMNS } from '@constants/tableConstants.js'

import CreateEventForm from './components/CreateEventForm.jsx'
import EditEventForm from './components/EditEventForm.jsx'
import DeleteEventModal from './components/DeleteEventModal.jsx'
import EventStatsCards from './components/EventStatsCards.jsx'
import UnifiedEventTable from './components/UnifiedEventTable.jsx'

const EventsManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const { tours: events, loading, refreshTours: refreshEvents } = useTour()
  const { handleError, handleSuccess } = useError()
  
  // Estados para eventos pendientes
  const [pendingEvents, setPendingEvents] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  
  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('active')

  // Table states for active events
  const [filterValue, setFilterValue] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(EVENT_COLUMNS.filter(col => col.uid !== 'id').map(col => col.uid)))
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)

  // Table states for pending events
  const [pendingFilterValue, setPendingFilterValue] = useState('')
  const [pendingDebouncedFilter, setPendingDebouncedFilter] = useState('')
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10)
  const [pendingPage, setPendingPage] = useState(1)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // ========================================
  // EFFECTS
  // ========================================

  // Debounce for search - active events
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterValue])

  // Debounce for search - pending events
  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingDebouncedFilter(pendingFilterValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [pendingFilterValue])

  // Load events when parameters change
  useEffect(() => {
    refreshEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedFilter])

  // ========================================
  // COLUMNS AND FILTERS CONFIGURATION
  // ========================================

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return EVENT_COLUMNS
    return EVENT_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!debouncedFilter) return events || []
    
    return (events || []).filter(event => 
      event.name?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
      event.description?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
      event.destination?.city?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
      event.destination?.country?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
      event.tags?.some(tag => tag?.toLowerCase().includes(debouncedFilter.toLowerCase())) ||
      event.status?.toLowerCase().includes(debouncedFilter.toLowerCase())
    )
  }, [events, debouncedFilter])

  // Calculate pagination
  const totalItems = filteredEvents.length
  const pages = Math.ceil(totalItems / rowsPerPage)

  // Sort and paginate events
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredEvents])

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return sortedEvents.slice(start, start + rowsPerPage)
  }, [sortedEvents, page, rowsPerPage])

  // Filtered and paginated pending events
  const filteredPendingEvents = useMemo(() => {
    if (!pendingDebouncedFilter) return pendingEvents
    return pendingEvents.filter(event => 
      event.name?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      event.description?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      event.destination?.city?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      event.destination?.country?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase())
    )
  }, [pendingEvents, pendingDebouncedFilter])

  // Pagination for pending events
  const pendingPages = Math.ceil(filteredPendingEvents.length / pendingRowsPerPage)
  const paginatedPendingEvents = useMemo(() => {
    const start = (pendingPage - 1) * pendingRowsPerPage
    return filteredPendingEvents.slice(start, start + pendingRowsPerPage)
  }, [filteredPendingEvents, pendingPage, pendingRowsPerPage])

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(
    async event => {
      try {
        setSelectedEvent(event)
        setIsEditModalOpen(true)
      } catch (error) {
        console.error('Error getting complete event data:', error)
        handleError('Error al cargar datos del evento.')
      }
    },
    [handleError]
  )

  const handleOpenDeleteModal = useCallback(
    event => {
      if (!event || !event.id) {
        console.error('Error: Incomplete event data', event)
        handleError('No se puede eliminar el evento: datos incompletos')
        return
      }

      setSelectedEvent(event)
      setIsDeleteModalOpen(true)
    },
    [handleError]
  )

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }, [])

  const handleOperationSuccess = useCallback(() => {
    console.log('Operation successful, updating event list')
    refreshEvents()
    fetchPendingEvents()
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }, [refreshEvents])

  // Función para actualizar eventos activos
  const handleRefreshActiveEvents = useCallback(() => {
    console.log('Refreshing active events...')
    refreshEvents()
  }, [refreshEvents])

  // Funciones para eventos pendientes
  const fetchPendingEvents = useCallback(async () => {
    setLoadingPending(true)
    try {
      // Simulación de datos pendientes - reemplazar con llamada real al backend
      const mockPendingEvents = [
        {
          id: 1001,
          name: 'Tour Cartagena Premium',
          description: 'Descubre la ciudad amurallada con guía experto',
          destination: { city: 'Cartagena', country: 'Colombia' },
          adultPrice: 250000,
          childPrice: 180000,
          status: 'PENDIENTE',
          tags: ['CULTURAL', 'HISTORICO'],
          images: ['https://via.placeholder.com/300x200?text=Cartagena'],
          availability: [{ availableDate: '2025-02-15', availableSlots: 20 }],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 1002,
          name: 'Aventura en Los Andes',
          description: 'Trekking y deportes extremos en la cordillera',
          destination: { city: 'Bogotá', country: 'Colombia' },
          adultPrice: 400000,
          childPrice: 300000,
          status: 'PENDIENTE',
          tags: ['AVENTURA', 'DEPORTES'],
          images: ['https://via.placeholder.com/300x200?text=Andes'],
          availability: [{ availableDate: '2025-03-01', availableSlots: 15 }],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
      setPendingEvents(mockPendingEvents)
    } catch (error) {
      handleError('Error al cargar eventos pendientes')
    } finally {
      setLoadingPending(false)
    }
  }, [handleError])

  const handleApproveEvent = useCallback(async (eventId) => {
    try {
      // Simulación - reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPendingEvents(prev => prev.filter(event => event.id !== eventId))
      handleSuccess('Evento aprobado correctamente')
    } catch (error) {
      handleError('Error al aprobar evento')
    }
  }, [handleSuccess, handleError])

  const handleRejectEvent = useCallback(async (eventId) => {
    try {
      // Simulación - reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPendingEvents(prev => prev.filter(event => event.id !== eventId))
      handleSuccess('Evento rechazado correctamente')
    } catch (error) {
      handleError('Error al rechazar evento')
    }
  }, [handleSuccess, handleError])

  // Función para actualizar eventos pendientes
  const handleRefreshPendingEvents = useCallback(() => {
    console.log('Refreshing pending events...')
    fetchPendingEvents()
  }, [fetchPendingEvents])

  // Cargar eventos pendientes al inicio
  useEffect(() => {
    fetchPendingEvents()
  }, [fetchPendingEvents])

  // ========================================
  // PAGINATION AND SEARCH HANDLERS
  // ========================================

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1)
    }
  }, [page, pages])

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const onRowsPerPageChange = useCallback(newValue => {
    setRowsPerPage(newValue)
    setPage(1)
  }, [])

  const onSearchChange = useCallback(value => {
    setFilterValue(value || '')
    setPage(1)
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  // Pending events handlers
  const onPendingSearchChange = useCallback(value => {
    setPendingFilterValue(value || '')
    setPendingPage(1)
  }, [])

  const onPendingClear = useCallback(() => {
    setPendingFilterValue('')
    setPendingPage(1)
  }, [])

  const onPendingRowsPerPageChange = useCallback(newValue => {
    setPendingRowsPerPage(newValue)
    setPendingPage(1)
  }, [])

  const onPendingNextPage = useCallback(() => {
    if (pendingPage < pendingPages) {
      setPendingPage(pendingPage + 1)
    }
  }, [pendingPage, pendingPages])

  const onPendingPreviousPage = useCallback(() => {
    if (pendingPage > 1) {
      setPendingPage(pendingPage - 1)
    }
  }, [pendingPage])

  // ========================================
  // TABLE CONTENT
  // ========================================

  const topContent = useMemo(
    () => (
      <GenericTableControls
        filterValue={filterValue}
        onClear={onClear}
        onSearchChange={onSearchChange}
        filterPlaceholder="Buscar por nombre, destino, etiquetas o estado..."
        columns={EVENT_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        onCreateItem={handleOpenCreateModal}
        createButtonLabel="Crear Evento"
        onRefresh={handleRefreshActiveEvents}
        loading={loading}
        error={null}
        totalItems={totalItems}
        itemsLabel="eventos"
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    ),
    [filterValue, onClear, onSearchChange, visibleColumns, handleOpenCreateModal, handleRefreshActiveEvents, loading, rowsPerPage, onRowsPerPageChange, totalItems]
  )

  const bottomContent = useMemo(
    () => (
      <TablePagination
        selectedKeys={selectedKeys}
        filteredItemsLength={totalItems}
        page={page}
        pages={pages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageChange={setPage}
      />
    ),
    [selectedKeys, totalItems, page, pages, onPreviousPage, onNextPage]
  )

  // Pending events table content
  const pendingTopContent = useMemo(
    () => (
      <GenericTableControls
        filterValue={pendingFilterValue}
        onClear={onPendingClear}
        onSearchChange={onPendingSearchChange}
        filterPlaceholder="Buscar eventos pendientes..."
        columns={EVENT_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        loading={loadingPending}
        error={null}
        totalItems={filteredPendingEvents.length}
        itemsLabel="eventos pendientes"
        rowsPerPage={pendingRowsPerPage}
        onRowsPerPageChange={onPendingRowsPerPageChange}
        hideCreateButton={true}
        onRefresh={handleRefreshPendingEvents}
      />
    ),
    [
      pendingFilterValue,
      onPendingClear,
      onPendingSearchChange,
      visibleColumns,
      loadingPending,
      filteredPendingEvents.length,
      pendingRowsPerPage,
      onPendingRowsPerPageChange,
      handleRefreshPendingEvents
    ]
  )

  const pendingBottomContent = useMemo(
    () => (
      <TablePagination
        selectedKeys={new Set([])}
        filteredItemsLength={filteredPendingEvents.length}
        page={pendingPage}
        pages={pendingPages}
        onPreviousPage={onPendingPreviousPage}
        onNextPage={onPendingNextPage}
        onPageChange={setPendingPage}
      />
    ),
    [filteredPendingEvents.length, pendingPage, pendingPages, onPendingPreviousPage, onPendingNextPage]
  )

  // ========================================
  // STATISTICS
  // ========================================

  const eventStats = useMemo(() => {
    const totalEvents = events?.length || 0
    const totalPending = pendingEvents.length
    const totalRevenue = events?.reduce((sum, event) => sum + (event.adultPrice || 0), 0) || 0
    const popularDestinations = events?.reduce((acc, event) => {
      const city = event.destination?.city
      if (city) {
        acc[city] = (acc[city] || 0) + 1
      }
      return acc
    }, {}) || {}

    return {
      totalEvents,
      totalPending,
      totalRevenue,
      popularDestinations: Object.entries(popularDestinations)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }))
    }
  }, [events, pendingEvents])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Helmet>
        <title>Gestión de Eventos | Admin</title>
        <meta name="description" content="Panel de administración para gestionar eventos del sistema" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">Gestión de Eventos</h1>
          <p className="text-gray-400">Administra los eventos y tours del sistema</p>
        </div>
      </div>

      {/* Pestañas para eventos activos y pendientes */}
      <div className="flex w-full flex-col">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label="Gestión de eventos"
          color="primary"
          variant="bordered"
        >
          <Tab
            key="active"
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Eventos Activos</span>
                {events && events.length > 0 && (
                  <div className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium">
                    {totalItems}
                  </div>
                )}
              </div>
            }
          >
            <div className="py-4">
              <UnifiedEventTable
                events={paginatedEvents}
                loading={loading}
                tableType="active"
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                sortDescriptor={sortDescriptor}
                setSortDescriptor={setSortDescriptor}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={visibleColumns}
              />
            </div>
          </Tab>
          
          <Tab
            key="pending"
            title={
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Pendientes de Aprobación</span>
                {pendingEvents.length > 0 && (
                  <div className="bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingEvents.length}
                  </div>
                )}
              </div>
            }
          >
            <div className="py-4">
              <UnifiedEventTable
                events={paginatedPendingEvents}
                loading={loadingPending}
                tableType="pending"
                onApprove={handleApproveEvent}
                onReject={handleRejectEvent}
                visibleColumns={visibleColumns}
                topContent={pendingTopContent}
                bottomContent={pendingBottomContent}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Estadísticas */}
      <EventStatsCards eventStats={eventStats} />

      {/* Modales */}
      <CreateEventForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} />

      {selectedEvent && (
        <EditEventForm isOpen={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} eventData={selectedEvent} />
      )}

      {selectedEvent && (
        <DeleteEventModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleOperationSuccess}
          eventData={selectedEvent}
        />
      )}
    </div>
  )
})

EventsManagement.displayName = 'EventsManagement'

export default EventsManagement