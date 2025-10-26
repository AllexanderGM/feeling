import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { MessageCircle, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { useError, useComplaints } from '@hooks'
import { Logger } from '@utils/logger.js'
import GenericTableControls from '@components/ui/table/GenericTableControls.jsx'
import TablePagination from '@components/ui/table/TablePagination.jsx'
import { COMPLAINT_TYPE_COLUMNS, DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import { ComplaintStatsCards } from './components/ComplaintStatsCards.jsx'
import { UpdateComplaintStatusModal } from './components/UpdateComplaintStatusModal.jsx'
import { UnifiedComplaintTable } from '../components/UnifiedComplaintTable.jsx'
import { ComplaintChatModal } from '../components/ComplaintChatModal.jsx'

const ComplaintManagement = memo(() => {
  const { showError, showSuccess } = useError()
  const {
    // Estados principales
    loading,
    allComplaints,
    allComplaintsPagination,
    pendingComplaints,
    pendingComplaintsPagination,
    urgentComplaints,
    overdueComplaints,
    resolvedComplaints,
    resolvedComplaintsPagination,
    complaintStats,

    // Funciones principales
    getAllComplaints,
    getPendingComplaints,
    getUrgentComplaints,
    getOverdueComplaints,
    fetchResolvedComplaints,
    getComplaintStats,
    updateComplaintStatus,
    deleteComplaint,
    sendMessage
  } = useComplaints()

  // Estados locales
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  // Estados para cada tipo de tabla (siguiendo el patrón de UserManagement)
  const [tableStates, setTableStates] = useState({
    all: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.all?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    pending: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.pending?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    urgent: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.urgent?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    overdue: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.overdue?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    resolved: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.resolved?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'resolvedAt', direction: 'descending' },
      page: 1,
      loading: false
    }
  })

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

  // Función helper para obtener datos de queja por tipo
  const getComplaintsData = useCallback(
    tableType => {
      switch (tableType) {
        case 'all':
          return { complaints: allComplaints, pagination: allComplaintsPagination, fetchMethod: getAllComplaints }
        case 'pending':
          return { complaints: pendingComplaints, pagination: pendingComplaintsPagination, fetchMethod: getPendingComplaints }
        case 'urgent':
          return {
            complaints: urgentComplaints,
            pagination: { totalPages: 1, totalElements: urgentComplaints?.length || 0 },
            fetchMethod: getUrgentComplaints
          }
        case 'overdue':
          return {
            complaints: overdueComplaints,
            pagination: { totalPages: 1, totalElements: overdueComplaints?.length || 0 },
            fetchMethod: getOverdueComplaints
          }
        case 'resolved':
          return { complaints: resolvedComplaints, pagination: resolvedComplaintsPagination, fetchMethod: fetchResolvedComplaints }
        default:
          return { complaints: [], pagination: { totalPages: 0, totalElements: 0 }, fetchMethod: null }
      }
    },
    [
      allComplaints,
      allComplaintsPagination,
      getAllComplaints,
      pendingComplaints,
      pendingComplaintsPagination,
      getPendingComplaints,
      urgentComplaints,
      getUrgentComplaints,
      overdueComplaints,
      getOverdueComplaints,
      resolvedComplaints,
      resolvedComplaintsPagination,
      fetchResolvedComplaints
    ]
  )

  // ========================================
  // EFFECTS
  // ========================================

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    getComplaintStats()
  }, [])

  // Debounce para búsqueda de todas las tablas
  useEffect(() => {
    const timers = []

    Object.keys(tableStates).forEach(tableType => {
      const timer = setTimeout(() => {
        setTableStates(prev => ({
          ...prev,
          [tableType]: {
            ...prev[tableType],
            debouncedFilter: prev[tableType].filterValue
          }
        }))
      }, 500)

      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [
    tableStates.all?.filterValue,
    tableStates.pending?.filterValue,
    tableStates.urgent?.filterValue,
    tableStates.overdue?.filterValue,
    tableStates.resolved?.filterValue
  ])

  // Cargar datos cuando cambien los parámetros de cada tabla
  useEffect(() => {
    const currentTable = tableStates[selectedTab]

    if (!currentTable) return

    const loadData = async () => {
      updateTableState(selectedTab, { loading: true })

      try {
        if (selectedTab === 'all') {
          await getAllComplaints(currentTable.page - 1, currentTable.rowsPerPage, currentTable.debouncedFilter)
        } else if (selectedTab === 'pending') {
          await getPendingComplaints(currentTable.page - 1, currentTable.rowsPerPage)
        } else if (selectedTab === 'urgent') {
          await getUrgentComplaints()
        } else if (selectedTab === 'overdue') {
          await getOverdueComplaints()
        } else if (selectedTab === 'resolved') {
          await fetchResolvedComplaints(currentTable.page - 1, currentTable.rowsPerPage)
        }
      } catch (error) {
        Logger.error(`ComplaintManagement: Error cargando quejas ${selectedTab}:`, error, { category: Logger.CATEGORIES.SERVICE })
      } finally {
        updateTableState(selectedTab, { loading: false })
      }
    }

    loadData()
  }, [
    selectedTab,
    tableStates[selectedTab]?.page,
    tableStates[selectedTab]?.rowsPerPage,
    tableStates[selectedTab]?.debouncedFilter,
    getAllComplaints,
    getPendingComplaints,
    getUrgentComplaints,
    getOverdueComplaints,
    fetchResolvedComplaints
  ])

  // ========================================
  // CONFIGURACIONES DINÁMICAS POR TABLA
  // ========================================

  // Obtener configuración actual de la tabla seleccionada
  const currentTableState = tableStates[selectedTab]
  const { complaints: currentComplaints, pagination: currentPagination } = getComplaintsData(selectedTab)

  // Todas las columnas disponibles (para el dropdown de selección)
  const allColumns = useMemo(() => {
    return COMPLAINT_TYPE_COLUMNS[selectedTab] || []
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
    if (!currentComplaints?.length) return []

    const sortDescriptor = currentTableState?.sortDescriptor

    if (!sortDescriptor) return currentComplaints

    return [...currentComplaints].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [currentComplaints, currentTableState?.sortDescriptor])

  // ========================================
  // EVENT HANDLERS GENÉRICOS
  // ========================================

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
  // EVENT HANDLERS ESPECÍFICOS
  // ========================================

  const handleRefresh = useCallback(async () => {
    const currentTable = tableStates[selectedTab]

    if (!currentTable) return

    try {
      if (selectedTab === 'all') {
        await getAllComplaints(currentTable.page - 1, currentTable.rowsPerPage, currentTable.debouncedFilter)
      } else if (selectedTab === 'pending') {
        await getPendingComplaints(currentTable.page - 1, currentTable.rowsPerPage)
      } else if (selectedTab === 'urgent') {
        await getUrgentComplaints()
      } else if (selectedTab === 'overdue') {
        await getOverdueComplaints()
      } else if (selectedTab === 'resolved') {
        await fetchResolvedComplaints(currentTable.page - 1, currentTable.rowsPerPage)
      }
      await getComplaintStats()
    } catch (error) {
      Logger.error(`Error refreshing ${selectedTab} complaints:`, error, { category: Logger.CATEGORIES.SERVICE })
    }
  }, [
    selectedTab,
    tableStates,
    getAllComplaints,
    getPendingComplaints,
    getUrgentComplaints,
    getOverdueComplaints,
    fetchResolvedComplaints,
    getComplaintStats
  ])

  // Handlers para acciones de tabla
  const handleViewComplaint = useCallback(complaint => {
    setSelectedComplaint(complaint)
    setIsChatModalOpen(true)
  }, [])

  const handleOpenChat = useCallback(complaint => {
    setSelectedComplaint(complaint)
    setIsChatModalOpen(true)
  }, [])

  const handleEditComplaint = useCallback(complaint => {
    setSelectedComplaint(complaint)
    setIsUpdateModalOpen(true)
  }, [])

  const handleDeleteComplaint = useCallback(
    async complaint => {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta queja?')) {
        try {
          await deleteComplaint(complaint.id)
          showSuccess('Queja eliminada correctamente')
          handleRefresh()
        } catch (error) {
          showError('Error al eliminar la queja: ' + error.message)
        }
      }
    },
    [deleteComplaint, showSuccess, showError, handleRefresh]
  )

  // Handlers para modales
  const handleSendMessage = useCallback(
    async (complaintId, message) => {
      try {
        await sendMessage(complaintId, message)
        handleRefresh()
      } catch (error) {
        showError('Error al enviar mensaje: ' + error.message)
        throw error
      }
    },
    [sendMessage, handleRefresh, showError]
  )

  const handleUpdateStatus = useCallback(
    async (complaintId, updateData) => {
      try {
        await updateComplaintStatus(complaintId, updateData)
        showSuccess('Estado de queja actualizado correctamente')
        setIsUpdateModalOpen(false)
        setSelectedComplaint(null)
        handleRefresh()
      } catch (error) {
        showError('Error al actualizar estado: ' + error.message)
        throw error
      }
    },
    [updateComplaintStatus, showSuccess, showError, handleRefresh]
  )

  // ========================================
  // CONTENIDO DINÁMICO DE TABLA
  // ========================================

  // Función para obtener el placeholder de búsqueda según el tipo de tabla
  const getSearchPlaceholder = useCallback(tableType => {
    const placeholders = {
      all: 'Buscar quejas por usuario, asunto, mensaje o tipo...',
      pending: 'Buscar quejas pendientes por usuario, asunto...',
      urgent: 'Buscar quejas urgentes por usuario, asunto...',
      overdue: 'Buscar quejas vencidas por usuario, asunto...',
      resolved: 'Buscar quejas resueltas por usuario, asunto...'
    }

    return placeholders[tableType] || 'Buscar quejas...'
  }, [])

  // Top content dinámico para la tabla actual
  const topContent = useMemo(() => {
    return (
      <GenericTableControls
        columns={allColumns}
        error={null}
        filterPlaceholder={getSearchPlaceholder(selectedTab)}
        filterValue={currentTableState?.filterValue || ''}
        hideCreateButton={true}
        itemsLabel={`quejas ${selectedTab}`}
        loading={currentTableState?.loading || loading}
        rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
        setVisibleColumns={onColumnsChange}
        totalItems={totalItems}
        visibleColumns={currentTableState?.visibleColumns}
        onClear={onClear}
        onRefresh={handleRefresh}
        onRowsPerPageChange={onRowsPerPageChange}
        onSearchChange={onSearchChange}
      />
    )
  }, [
    selectedTab,
    currentTableState?.filterValue,
    currentTableState?.visibleColumns,
    currentTableState?.rowsPerPage,
    currentTableState?.loading,
    totalItems,
    loading,
    allColumns,
    onClear,
    onSearchChange,
    onColumnsChange,
    onRowsPerPageChange,
    handleRefresh
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

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Gestión de Quejas y Reclamos - Admin</title>
        <meta content='Panel de administración para gestionar quejas y reclamos' name='description' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Gestión de Soporte</h1>
          <p className='text-gray-400'>Administra quejas, reclamos y solicitudes de soporte</p>
        </div>
      </div>

      {/* Estadísticas */}
      <ComplaintStatsCards loading={loading} stats={complaintStats} />

      {/* Tabs de diferentes tipos de quejas */}
      <div className='flex w-full flex-col'>
        <Tabs
          aria-label='Gestión de quejas'
          color='primary'
          selectedKey={selectedTab}
          variant='bordered'
          onSelectionChange={setSelectedTab}>
          {/* Todas las quejas */}
          <Tab
            key='all'
            title={
              <div className='flex items-center gap-2'>
                <MessageCircle size={16} />
                <span>Todas</span>
                {complaintStats?.totalComplaints > 0 && (
                  <div className='bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {complaintStats.totalComplaints}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedComplaintTable
                bottomContent={bottomContent}
                complaints={sortedItems}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                showActions={true}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='all'
                topContent={topContent}
                viewType='all'
                visibleColumns={currentTableState?.visibleColumns}
                onDelete={handleDeleteComplaint}
                onEdit={handleEditComplaint}
                onOpenChat={handleOpenChat}
                onView={handleViewComplaint}
              />
            </div>
          </Tab>

          {/* Quejas pendientes */}
          <Tab
            key='pending'
            title={
              <div className='flex items-center gap-2'>
                <Clock size={16} />
                <span>Pendientes</span>
                {complaintStats?.openComplaints > 0 && (
                  <div className='bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {complaintStats.openComplaints}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedComplaintTable
                bottomContent={bottomContent}
                complaints={sortedItems}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                showActions={true}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='pending'
                topContent={topContent}
                viewType='pending'
                visibleColumns={currentTableState?.visibleColumns}
                onDelete={handleDeleteComplaint}
                onEdit={handleEditComplaint}
                onOpenChat={handleOpenChat}
                onView={handleViewComplaint}
              />
            </div>
          </Tab>

          {/* Quejas urgentes */}
          <Tab
            key='urgent'
            title={
              <div className='flex items-center gap-2'>
                <Zap size={16} />
                <span>Urgentes</span>
                {complaintStats?.urgentComplaints > 0 && (
                  <div className='bg-danger-100 text-danger-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {complaintStats.urgentComplaints}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedComplaintTable
                bottomContent={bottomContent}
                complaints={sortedItems}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                showActions={true}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='urgent'
                topContent={topContent}
                viewType='urgent'
                visibleColumns={currentTableState?.visibleColumns}
                onDelete={handleDeleteComplaint}
                onEdit={handleEditComplaint}
                onOpenChat={handleOpenChat}
                onView={handleViewComplaint}
              />
            </div>
          </Tab>

          {/* Quejas vencidas */}
          <Tab
            key='overdue'
            title={
              <div className='flex items-center gap-2'>
                <AlertTriangle size={16} />
                <span>Vencidas</span>
                {complaintStats?.overdueComplaints > 0 && (
                  <div className='bg-danger-100 text-danger-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {complaintStats.overdueComplaints}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedComplaintTable
                bottomContent={bottomContent}
                complaints={sortedItems}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                showActions={true}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='overdue'
                topContent={topContent}
                viewType='overdue'
                visibleColumns={currentTableState?.visibleColumns}
                onDelete={handleDeleteComplaint}
                onEdit={handleEditComplaint}
                onOpenChat={handleOpenChat}
                onView={handleViewComplaint}
              />
            </div>
          </Tab>

          {/* Quejas resueltas */}
          <Tab
            key='resolved'
            title={
              <div className='flex items-center gap-2'>
                <CheckCircle size={16} />
                <span>Resueltas</span>
                {complaintStats?.resolvedComplaints > 0 && (
                  <div className='bg-success-100 text-success-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {complaintStats.resolvedComplaints}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedComplaintTable
                bottomContent={bottomContent}
                complaints={sortedItems}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                showActions={false} // Las quejas resueltas no necesitan edición o eliminación
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='resolved'
                topContent={topContent}
                viewType='resolved'
                visibleColumns={currentTableState?.visibleColumns}
                onOpenChat={handleOpenChat}
                onView={handleViewComplaint}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Modales */}
      <ComplaintChatModal
        complaint={selectedComplaint}
        isAdmin={true}
        isOpen={isChatModalOpen}
        loading={loading}
        onClose={() => {
          setIsChatModalOpen(false)
          setSelectedComplaint(null)
        }}
        onSendMessage={handleSendMessage}
        onUpdateStatus={handleUpdateStatus}
      />

      <UpdateComplaintStatusModal
        complaint={selectedComplaint}
        isOpen={isUpdateModalOpen}
        loading={loading}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedComplaint(null)
        }}
        onUpdate={handleUpdateStatus}
      />
    </div>
  )
})

ComplaintManagement.displayName = 'ComplaintManagement'

export default ComplaintManagement
