import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAdminMatches } from '@hooks/match'
import { Logger } from '@utils/logger.js'
import GenericTableControls from '@components/ui/table/GenericTableControls.jsx'
import TablePagination from '@components/ui/table/TablePagination.jsx'
import { MATCH_ADMIN_TYPE_COLUMNS, DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import MatchAdminTable from './components/MatchAdminTable.jsx'
import MatchStatsCards from './components/MatchStatsCards.jsx'

const MatchManagement = memo(() => {
  const {
    // Estados principales
    loading,
    allMatches,
    allMatchesPagination,
    pendingMatches,
    pendingMatchesPagination,
    acceptedMatches,
    acceptedMatchesPagination,
    rejectedMatches,
    rejectedMatchesPagination,
    matchSummary,

    // Funciones principales
    getAllMatches,
    getPendingMatches,
    getAcceptedMatches,
    getRejectedMatches,
    fetchMatchSummary
  } = useAdminMatches()

  // Estados locales
  const [selectedTab, setSelectedTab] = useState('all')

  // Estados para cada tipo de tabla
  const [tableStates, setTableStates] = useState({
    all: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(MATCH_ADMIN_TYPE_COLUMNS.all?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    pending: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(MATCH_ADMIN_TYPE_COLUMNS.pending?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    accepted: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(MATCH_ADMIN_TYPE_COLUMNS.accepted?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      loading: false
    },
    rejected: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(MATCH_ADMIN_TYPE_COLUMNS.rejected?.filter(col => col.uid !== 'id').map(col => col.uid) || []),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
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

  // Función helper para obtener datos de matches por tipo
  const getMatchesData = useCallback(
    tableType => {
      switch (tableType) {
        case 'all':
          return { matches: allMatches, pagination: allMatchesPagination, fetchMethod: getAllMatches }
        case 'pending':
          return {
            matches: pendingMatches,
            pagination: pendingMatchesPagination,
            fetchMethod: getPendingMatches
          }
        case 'accepted':
          return {
            matches: acceptedMatches,
            pagination: acceptedMatchesPagination,
            fetchMethod: getAcceptedMatches
          }
        case 'rejected':
          return {
            matches: rejectedMatches,
            pagination: rejectedMatchesPagination,
            fetchMethod: getRejectedMatches
          }
        default:
          return { matches: [], pagination: { totalPages: 0, totalElements: 0 }, fetchMethod: null }
      }
    },
    [
      allMatches,
      allMatchesPagination,
      getAllMatches,
      pendingMatches,
      pendingMatchesPagination,
      getPendingMatches,
      acceptedMatches,
      acceptedMatchesPagination,
      getAcceptedMatches,
      rejectedMatches,
      rejectedMatchesPagination,
      getRejectedMatches
    ]
  )

  // ========================================
  // EFFECTS
  // ========================================

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchMatchSummary()
  }, [])

  // Cargar datos cuando cambien los parámetros de cada tabla
  useEffect(() => {
    const currentTable = tableStates[selectedTab]

    if (!currentTable) return

    const loadData = async () => {
      updateTableState(selectedTab, { loading: true })

      try {
        if (selectedTab === 'all') {
          await getAllMatches(currentTable.page - 1, currentTable.rowsPerPage)
        } else if (selectedTab === 'pending') {
          await getPendingMatches(currentTable.page - 1, currentTable.rowsPerPage)
        } else if (selectedTab === 'accepted') {
          await getAcceptedMatches(currentTable.page - 1, currentTable.rowsPerPage)
        } else if (selectedTab === 'rejected') {
          await getRejectedMatches(currentTable.page - 1, currentTable.rowsPerPage)
        }
      } catch (error) {
        Logger.error(`MatchManagement: Error cargando matches ${selectedTab}:`, error, {
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
  const { matches: currentMatches, pagination: currentPagination } = getMatchesData(selectedTab)

  // Todas las columnas disponibles
  const allColumns = useMemo(() => {
    return MATCH_ADMIN_TYPE_COLUMNS[selectedTab] || []
  }, [selectedTab])

  // Columnas visibles filtradas
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
    if (!currentMatches?.length) return []

    const sortDescriptor = currentTableState?.sortDescriptor

    if (!sortDescriptor) return currentMatches

    return [...currentMatches].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [currentMatches, currentTableState?.sortDescriptor])

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
      if (selectedTab === 'all') {
        await getAllMatches(currentTable.page - 1, currentTable.rowsPerPage)
      } else if (selectedTab === 'pending') {
        await getPendingMatches(currentTable.page - 1, currentTable.rowsPerPage)
      } else if (selectedTab === 'accepted') {
        await getAcceptedMatches(currentTable.page - 1, currentTable.rowsPerPage)
      } else if (selectedTab === 'rejected') {
        await getRejectedMatches(currentTable.page - 1, currentTable.rowsPerPage)
      }
      await fetchMatchSummary()
    } catch (error) {
      Logger.error(`Error refreshing ${selectedTab} matches:`, error, {
        category: Logger.CATEGORIES.SERVICE
      })
    }
  }, [selectedTab, tableStates, getAllMatches, getPendingMatches, getAcceptedMatches, getRejectedMatches, fetchMatchSummary])

  // ========================================
  // CONTENIDO DINÁMICO DE TABLA
  // ========================================

  // Top content dinámico para la tabla actual
  const topContent = useMemo(() => {
    return (
      <GenericTableControls
        columns={allColumns}
        error={null}
        filterPlaceholder='Buscar matches...'
        filterValue=''
        hideCreateButton={true}
        hideSearch={true}
        itemsLabel={`matches ${selectedTab}`}
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
        <title>Gestión de Matches - Admin</title>
        <meta content='Panel de administración para gestionar matches de usuarios' name='description' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Gestión de Matches</h1>
          <p className='text-gray-400'>Monitorea y administra las conexiones entre usuarios</p>
        </div>
      </div>

      {/* Estadísticas */}
      <MatchStatsCards loading={loading} stats={matchSummary} />

      {/* Tabs de diferentes tipos de matches */}
      <div className='flex w-full flex-col'>
        <Tabs
          aria-label='Gestión de matches'
          color='primary'
          selectedKey={selectedTab}
          variant='bordered'
          onSelectionChange={setSelectedTab}>
          {/* Todos los matches */}
          <Tab
            key='all'
            title={
              <div className='flex items-center gap-2'>
                <Users size={16} />
                <span>Todos</span>
                {matchSummary?.totalMatches > 0 && (
                  <div className='bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {matchSummary.totalMatches}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <MatchAdminTable
                bottomContent={bottomContent}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                matches={sortedItems}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='all'
                topContent={topContent}
                visibleColumns={currentTableState?.visibleColumns}
              />
            </div>
          </Tab>

          {/* Matches pendientes */}
          <Tab
            key='pending'
            title={
              <div className='flex items-center gap-2'>
                <Clock size={16} />
                <span>Pendientes</span>
                {matchSummary?.pendingMatches > 0 && (
                  <div className='bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {matchSummary.pendingMatches}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <MatchAdminTable
                bottomContent={bottomContent}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                matches={sortedItems}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='pending'
                topContent={topContent}
                visibleColumns={currentTableState?.visibleColumns}
              />
            </div>
          </Tab>

          {/* Matches aceptados */}
          <Tab
            key='accepted'
            title={
              <div className='flex items-center gap-2'>
                <CheckCircle size={16} />
                <span>Aceptados</span>
                {matchSummary?.acceptedMatches > 0 && (
                  <div className='bg-success-100 text-success-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {matchSummary.acceptedMatches}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <MatchAdminTable
                bottomContent={bottomContent}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                matches={sortedItems}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='accepted'
                topContent={topContent}
                visibleColumns={currentTableState?.visibleColumns}
              />
            </div>
          </Tab>

          {/* Matches rechazados */}
          <Tab
            key='rejected'
            title={
              <div className='flex items-center gap-2'>
                <XCircle size={16} />
                <span>Rechazados</span>
                {matchSummary?.rejectedMatches > 0 && (
                  <div className='bg-danger-100 text-danger-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {matchSummary.rejectedMatches}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <MatchAdminTable
                bottomContent={bottomContent}
                headerColumns={headerColumns}
                loading={currentTableState?.loading || loading}
                matches={sortedItems}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                setSortDescriptor={onSortChange}
                sortDescriptor={currentTableState?.sortDescriptor}
                tableType='rejected'
                topContent={topContent}
                visibleColumns={currentTableState?.visibleColumns}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
})

MatchManagement.displayName = 'MatchManagement'

export default MatchManagement
