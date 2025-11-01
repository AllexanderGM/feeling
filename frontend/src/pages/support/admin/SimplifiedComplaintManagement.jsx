import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { useError, useComplaints } from '@hooks'
import { Logger } from '@utils/logger.js'
import GenericTableControls from '@components/ui/table/GenericTableControls.jsx'
import TablePagination from '@components/ui/table/TablePagination.jsx'
import { COMPLAINT_TYPE_COLUMNS, DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import { UnifiedComplaintTable } from '../components/UnifiedComplaintTable.jsx'
import { ComplaintChatModal } from '../components/ComplaintChatModal.jsx'

import { ComplaintStatsCards } from './components/ComplaintStatsCards.jsx'
import { UpdateComplaintStatusModal } from './components/UpdateComplaintStatusModal.jsx'

/**
 * Versión simplificada del sistema de gestión de PQR
 * Muestra solo los tabs esenciales: pendientes, urgentes y resueltas
 */
const SimplifiedComplaintManagement = memo(() => {
  const { showError, showSuccess } = useError()
  const {
    // Estados principales
    loading,
    pendingComplaints,
    pendingComplaintsPagination,
    urgentComplaints,
    resolvedComplaints,
    resolvedComplaintsPagination,
    complaintStats,

    // Funciones principales
    getPendingComplaints,
    getUrgentComplaints,
    fetchResolvedComplaints,
    getComplaintStats,
    updateComplaintStatus,
    deleteComplaint,
    sendMessage
  } = useComplaints()

  // Estados locales
  const [selectedTab, setSelectedTab] = useState('pending')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  // Estados para cada tipo de tabla
  const [tableStates, setTableStates] = useState({
    pending: {
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.pending?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    urgent: {
      selectedKeys: new Set([]),
      visibleColumns: new Set(COMPLAINT_TYPE_COLUMNS.urgent?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    resolved: {
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
        case 'pending':
          return {
            complaints: pendingComplaints,
            pagination: pendingComplaintsPagination,
            fetchMethod: getPendingComplaints
          }
        case 'urgent':
          return {
            complaints: urgentComplaints,
            pagination: { totalPages: 1, totalElements: urgentComplaints?.length || 0 },
            fetchMethod: getUrgentComplaints
          }
        case 'resolved':
          return {
            complaints: resolvedComplaints,
            pagination: resolvedComplaintsPagination,
            fetchMethod: fetchResolvedComplaints
          }
        default:
          return { complaints: [], pagination: { totalPages: 0, totalElements: 0 }, fetchMethod: null }
      }
    },
    [
      pendingComplaints,
      pendingComplaintsPagination,
      getPendingComplaints,
      urgentComplaints,
      getUrgentComplaints,
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

  // Cargar datos cuando cambien los parámetros de cada tabla
  useEffect(() => {
    const currentTable = tableStates[selectedTab]

    if (!currentTable) return

    const loadData = async () => {
      updateTableState(selectedTab, { loading: true })

      try {
        if (selectedTab === 'pending') {
          await getPendingComplaints(currentTable.page - 1, currentTable.rowsPerPage)
        } else if (selectedTab === 'urgent') {
          await getUrgentComplaints()
        } else if (selectedTab === 'resolved') {
          await fetchResolvedComplaints(currentTable.page - 1, currentTable.rowsPerPage)
        }
      } catch (error) {
        Logger.error(`SimplifiedComplaintManagement: Error cargando quejas ${selectedTab}:`, error, {
          category: Logger.CATEGORIES.SERVICE
        })
      } finally {
        updateTableState(selectedTab, { loading: false })
      }
    }

    loadData()
  }, [selectedTab, tableStates[selectedTab]?.page, tableStates[selectedTab]?.rowsPerPage])

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

  // Ordenamiento local
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
      if (selectedTab === 'pending') {
        await getPendingComplaints(currentTable.page - 1, currentTable.rowsPerPage)
      } else if (selectedTab === 'urgent') {
        await getUrgentComplaints()
      } else if (selectedTab === 'resolved') {
        await fetchResolvedComplaints(currentTable.page - 1, currentTable.rowsPerPage)
      }
      await getComplaintStats()
    } catch (error) {
      Logger.error(`Error refreshing ${selectedTab} complaints:`, error, { category: Logger.CATEGORIES.SERVICE })
    }
  }, [selectedTab, tableStates, getPendingComplaints, getUrgentComplaints, fetchResolvedComplaints, getComplaintStats])

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

  // Top content dinámico para la tabla actual
  const topContent = useMemo(() => {
    return (
      <GenericTableControls
        columns={allColumns}
        error={null}
        filterPlaceholder='Buscar quejas...'
        filterValue=''
        hideCreateButton={true}
        hideSearch={true}
        itemsLabel={`quejas ${selectedTab}`}
        loading={currentTableState?.loading || loading}
        rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
        setVisibleColumns={onColumnsChange}
        totalItems={totalItems}
        visibleColumns={currentTableState?.visibleColumns}
        onRefresh={handleRefresh}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    )
  }, [
    selectedTab,
    currentTableState?.visibleColumns,
    currentTableState?.rowsPerPage,
    currentTableState?.loading,
    totalItems,
    loading,
    allColumns,
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
        <title>Gestión de PQR - Admin</title>
        <meta content='Panel de administración para gestionar quejas y reclamos' name='description' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Gestión de PQR</h1>
          <p className='text-gray-400'>Administra quejas, reclamos y solicitudes de soporte</p>
        </div>
      </div>

      {/* Estadísticas */}
      <ComplaintStatsCards loading={loading} stats={complaintStats} />

      {/* Tabs simplificados */}
      <div className='flex w-full flex-col'>
        <Tabs
          aria-label='Gestión de quejas'
          color='primary'
          selectedKey={selectedTab}
          variant='bordered'
          onSelectionChange={setSelectedTab}>
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
                <AlertTriangle size={16} />
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

SimplifiedComplaintManagement.displayName = 'SimplifiedComplaintManagement'

export default SimplifiedComplaintManagement
