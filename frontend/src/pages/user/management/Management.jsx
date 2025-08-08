import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Users, Clock, UserX, ShieldAlert, UserCheck, UserMinus, Tags } from 'lucide-react'
import { useAuth, useUser, useUserStats, useError } from '@hooks'
import { Logger } from '@utils/logger.js'

import userAnalyticsService from '@services'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

import CreateUserForm from './components/CreateUserForm.jsx'
import EditUserForm from './components/EditUserForm.jsx'
import DeleteUserModal from './components/DeleteUserModal.jsx'
import UserStatsCards from './components/UserStatsCards.jsx'
import UnifiedUserTable from './components/UnifiedUserTable.jsx'
import TagAnalytics from '@pages/admin/components/TagAnalytics.jsx'

// Mapeo de tipos de usuario a columnas
const USER_TYPE_COLUMNS = {
  active: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
    { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'ROL', uid: 'role', sortable: true },
    { name: 'MATCHES', uid: 'matches', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  pending: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
    { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
    { name: 'EDAD', uid: 'age', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'TELÉFONO', uid: 'phone', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  incomplete: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'FUENTE', uid: 'authProvider', sortable: true },
    { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  unverified: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'FUENTE', uid: 'authProvider', sortable: true },
    { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  nonApproved: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'FUENTE', uid: 'authProvider', sortable: true },
    { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
    { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  deactivated: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
    { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'ROL', uid: 'role', sortable: true },
    { name: 'MATCHES', uid: 'matches', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ]
}

const Management = memo(() => {
  const { user: currentUser } = useAuth()
  const {
    // Usuarios activos
    activeUsers,
    activeUsersPagination,
    fetchActiveUsers,
    refreshActiveUsers,

    // Usuarios pendientes
    pendingUsers,
    pendingUsersPagination,
    fetchPendingUsers,
    refreshPendingUsers,
    approveUser,
    rejectUser,

    // Usuarios incompletos
    incompleteUsers,
    incompleteUsersPagination,
    fetchIncompleteUsers,
    refreshIncompleteUsers,

    // Usuarios sin verificar
    unverifiedUsers,
    unverifiedUsersPagination,
    fetchUnverifiedUsers,
    refreshUnverifiedUsers,

    // Usuarios no aprobados
    nonApprovedUsers,
    nonApprovedUsersPagination,
    fetchNonApprovedUsers,
    refreshNonApprovedUsers,

    // Usuarios desactivados
    deactivatedUsers,
    deactivatedUsersPagination,
    fetchDeactivatedUsers,
    refreshDeactivatedUsers,

    // Acciones específicas
    viewUser,
    blockUser,
    unblockUser,
    deactivateUser,
    activateUser,
    sendEmailToUser,
    deleteUser,

    // Estados generales
    loading,
    getUserByEmail
  } = useUser()
  const { handleError, handleSuccess } = useError()

  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('active')

  // Estado para los conteos de pestañas
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    pending: 0,
    incomplete: 0,
    unverified: 0,
    nonApproved: 0,
    rejected: 0,
    deactivated: 0,
    total: 0
  })

  // Estados para cada tipo de tabla (usando un objeto para organizarlos mejor)
  const [tableStates, setTableStates] = useState({
    active: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.active.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    },
    pending: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.pending.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    },
    incomplete: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.incomplete.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    },
    unverified: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.unverified.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    },
    nonApproved: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.nonApproved.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    },
    deactivated: {
      filterValue: '',
      debouncedFilter: '',
      selectedKeys: new Set([]),
      visibleColumns: new Set(USER_TYPE_COLUMNS.deactivated.filter(col => col.uid !== 'id').map(col => col.uid)),
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      sortDescriptor: { column: 'user', direction: 'ascending' },
      page: 1,
      loading: false
    }
  })

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

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

  // Función para cargar conteos de pestañas
  const loadTabCounts = useCallback(async () => {
    try {
      const userMetrics = await userAnalyticsService.getUserMetrics()
      // Adaptar la respuesta a la estructura esperada por tabCounts
      const counts = {
        active: userMetrics?.activeUsers || 0,
        pending: userMetrics?.pendingUsers || 0,
        incomplete: userMetrics?.incompleteUsers || 0,
        unverified: userMetrics?.unverifiedUsers || 0,
        deactivated: userMetrics?.deactivatedUsers || 0
      }
      setTabCounts(counts)
    } catch (error) {
      Logger.error('Error loading user metrics:', error, { category: Logger.CATEGORIES.USER })
      handleError('Error al cargar conteos de pestañas')
    }
  }, [handleError])

  // Función helper para obtener datos de usuario por tipo
  const getUsersData = useCallback(
    tableType => {
      switch (tableType) {
        case 'active':
          return { users: activeUsers, pagination: activeUsersPagination, fetchMethod: fetchActiveUsers }
        case 'pending':
          return { users: pendingUsers, pagination: pendingUsersPagination, fetchMethod: fetchPendingUsers }
        case 'incomplete':
          return { users: incompleteUsers, pagination: incompleteUsersPagination, fetchMethod: fetchIncompleteUsers }
        case 'unverified':
          return { users: unverifiedUsers, pagination: unverifiedUsersPagination, fetchMethod: fetchUnverifiedUsers }
        case 'nonApproved':
          return { users: nonApprovedUsers, pagination: nonApprovedUsersPagination, fetchMethod: fetchNonApprovedUsers }
        case 'deactivated':
          return { users: deactivatedUsers, pagination: deactivatedUsersPagination, fetchMethod: fetchDeactivatedUsers }
        default:
          return { users: [], pagination: { totalPages: 0, totalElements: 0 }, fetchMethod: null }
      }
    },
    [
      activeUsers,
      activeUsersPagination,
      fetchActiveUsers,
      pendingUsers,
      pendingUsersPagination,
      fetchPendingUsers,
      incompleteUsers,
      incompleteUsersPagination,
      fetchIncompleteUsers,
      unverifiedUsers,
      unverifiedUsersPagination,
      fetchUnverifiedUsers,
      nonApprovedUsers,
      nonApprovedUsersPagination,
      fetchNonApprovedUsers,
      deactivatedUsers,
      deactivatedUsersPagination,
      fetchDeactivatedUsers
    ]
  )

  // ========================================
  // EFFECTS
  // ========================================

  // Cargar conteos de pestañas al montar el componente
  useEffect(() => {
    loadTabCounts()
  }, [loadTabCounts])

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
    tableStates.active?.filterValue,
    tableStates.pending?.filterValue,
    tableStates.incomplete?.filterValue,
    tableStates.unverified?.filterValue,
    tableStates.nonApproved?.filterValue,
    tableStates.deactivated?.filterValue,
    updateTableState
  ])

  // Cargar datos cuando cambien los parámetros de cada tabla
  useEffect(() => {
    const currentTable = tableStates[selectedTab]
    const { fetchMethod } = getUsersData(selectedTab)

    if (fetchMethod && currentTable) {
      updateTableState(selectedTab, { loading: true })

      fetchMethod(currentTable.page - 1, currentTable.rowsPerPage, currentTable.debouncedFilter)
        .catch(error => {
          Logger.error(`Management: Error cargando usuarios ${selectedTab}:`, error, { category: Logger.CATEGORIES.USER })
        })
        .finally(() => {
          updateTableState(selectedTab, { loading: false })
        })
    }
  }, [
    selectedTab,
    tableStates[selectedTab]?.page,
    tableStates[selectedTab]?.rowsPerPage,
    tableStates[selectedTab]?.debouncedFilter,
    fetchActiveUsers,
    fetchPendingUsers,
    fetchIncompleteUsers,
    fetchUnverifiedUsers,
    fetchNonApprovedUsers,
    fetchDeactivatedUsers,
    updateTableState
  ])

  // ========================================
  // CONFIGURACIONES DINÁMICAS POR TABLA
  // ========================================

  // Obtener configuración actual de la tabla seleccionada
  const currentTableState = tableStates[selectedTab]
  const { users: currentUsers, pagination: currentPagination } = getUsersData(selectedTab)

  // Todas las columnas disponibles (para el dropdown de selección)
  const allColumns = useMemo(() => {
    return USER_TYPE_COLUMNS[selectedTab] || []
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
    if (!currentUsers?.length) return []

    const sortDescriptor = currentTableState?.sortDescriptor
    if (!sortDescriptor) return currentUsers

    return [...currentUsers].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [currentUsers, currentTableState?.sortDescriptor])

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(
    async user => {
      try {
        // Get complete user data
        const fullUserData = await getUserByEmail(user.email)

        // Map received data to format expected by form
        const mappedUserData = {
          id: fullUserData.id,
          image: fullUserData.image || '',
          name: fullUserData.name || '',
          lastName: fullUserData.lastName || '',
          document: fullUserData.document || '',
          phone: fullUserData.phone || '',
          dateOfBirth: fullUserData.dateOfBirth || '',
          email: fullUserData.email,
          password: '',
          confirmPassword: '',
          address: fullUserData.address || '',
          city: fullUserData.city || '',
          role: fullUserData.role
        }

        setSelectedUser(mappedUserData)
        setIsEditModalOpen(true)
      } catch (error) {
        Logger.error('Error getting complete user data:', error, { category: Logger.CATEGORIES.USER })
        handleError('Error al cargar datos del usuario. Usando información básica.')
        // Fallback to basic data if call fails
        setSelectedUser(user)
        setIsEditModalOpen(true)
      }
    },
    [getUserByEmail, handleError]
  )

  const handleOpenDeleteModal = useCallback(
    user => {
      if (!user || !user.email) {
        Logger.error('Incomplete user data for deletion', { user }, { category: Logger.CATEGORIES.USER })
        handleError('No se puede eliminar el usuario: datos incompletos')
        return
      }

      setSelectedUser({
        id: user.id,
        email: user.email,
        name: user.name || user.username,
        lastName: user.lastName || '',
        role: user.role
      })
      setIsDeleteModalOpen(true)
    },
    [handleError]
  )

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleOperationSuccess = useCallback(() => {
    Logger.info('Operation successful, updating user lists', { category: Logger.CATEGORIES.USER })

    // Refrescar todas las listas de usuarios con sus respectivos estados
    const refreshAllTables = () => {
      Object.keys(tableStates).forEach(tableType => {
        const state = tableStates[tableType]
        const { fetchMethod } = getUsersData(tableType)

        if (fetchMethod) {
          fetchMethod((state.page || 1) - 1, state.rowsPerPage || DEFAULT_ROWS_PER_PAGE, state.debouncedFilter || '').catch(error => {
            Logger.error(`Error refreshing ${tableType} users:`, error, { category: Logger.CATEGORIES.USER })
          })
        }
      })
    }

    refreshAllTables()

    // Refrescar conteos de pestañas
    loadTabCounts()

    // Cerrar modales
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [tableStates, getUsersData, loadTabCounts])

  // Función para actualizar usuarios activos
  const handleRefreshActiveUsers = useCallback(() => {
    Logger.debug('Refreshing active users...', { category: Logger.CATEGORIES.USER })
    const activeState = tableStates.active
    refreshActiveUsers((activeState.page || 1) - 1, activeState.rowsPerPage || DEFAULT_ROWS_PER_PAGE, activeState.debouncedFilter || '')
  }, [refreshActiveUsers, tableStates.active])

  // Funciones para usuarios pendientes
  const handleApproveUser = useCallback(
    async userId => {
      try {
        const userToApprove = pendingUsers.find(user => user.id === userId)
        if (!userToApprove) {
          handleError('Usuario no encontrado')
          return
        }

        const result = await approveUser(userId)
        if (result.success) {
          handleSuccess(`Usuario ${userToApprove.name} ${userToApprove.lastName} aprobado correctamente`)
        }
      } catch (error) {
        handleError('Error al aprobar usuario')
      }
    },
    [pendingUsers, approveUser, handleSuccess, handleError]
  )

  const handleRejectUser = useCallback(
    async userId => {
      try {
        const userToReject = pendingUsers.find(user => user.id === userId)
        if (!userToReject) {
          handleError('Usuario no encontrado')
          return
        }

        const result = await rejectUser(userId)
        if (result.success) {
          handleSuccess(`Usuario ${userToReject.name} ${userToReject.lastName} rechazado correctamente`)
        }
      } catch (error) {
        handleError('Error al rechazar usuario')
      }
    },
    [pendingUsers, rejectUser, handleSuccess, handleError]
  )

  // Función para actualizar usuarios pendientes
  const handleRefreshPendingUsers = useCallback(() => {
    Logger.debug('Refreshing pending users...', { category: Logger.CATEGORIES.USER })
    const pendingState = tableStates.pending
    refreshPendingUsers((pendingState.page || 1) - 1, pendingState.rowsPerPage || DEFAULT_ROWS_PER_PAGE, pendingState.debouncedFilter || '')
  }, [refreshPendingUsers, tableStates.pending])

  // Función para actualizar usuarios incompletos
  const handleRefreshIncompleteUsers = useCallback(() => {
    Logger.debug('Refreshing incomplete users...', { category: Logger.CATEGORIES.USER })
    const incompleteState = tableStates.incomplete
    refreshIncompleteUsers(
      (incompleteState.page || 1) - 1,
      incompleteState.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
      incompleteState.debouncedFilter || ''
    )
  }, [refreshIncompleteUsers, tableStates.incomplete])

  // Funciones para usuarios incompletos
  const handleSendEmail = useCallback(
    async userId => {
      if (!sendEmailToUser) {
        handleError('Función de envio de correo no disponible')
        return
      }

      try {
        const userToEmail = incompleteUsers?.find(user => user.id === userId)
        if (!userToEmail) {
          handleError('Usuario no encontrado')
          return
        }

        const result = await sendEmailToUser(userId)
        if (result.success) {
          handleSuccess(`Correo enviado a ${userToEmail.name} ${userToEmail.lastName}`)
        }
      } catch (error) {
        handleError('Error al enviar correo')
      }
    },
    [incompleteUsers, sendEmailToUser, handleSuccess, handleError]
  )

  const handleDeleteIncompleteUser = useCallback(
    async userId => {
      try {
        const userToDelete = incompleteUsers?.find(user => user.id === userId)
        if (!userToDelete) {
          handleError('Usuario no encontrado')
          return
        }

        // Usar la misma función de eliminación que para usuarios activos
        handleOpenDeleteModal(userToDelete)
      } catch (error) {
        handleError('Error al preparar eliminación de usuario')
      }
    },
    [incompleteUsers, handleError, handleOpenDeleteModal]
  )

  // ========================================
  // HANDLERS GENÉRICOS PARA TODAS LAS TABLAS
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

  // Function to determine if a row can be selected
  const isRowSelectable = useCallback(item => item.email !== currentUser?.email, [currentUser?.email])

  // ========================================
  // CONTENIDO DINÁMICO DE TABLA
  // ========================================

  // Función para obtener el placeholder de búsqueda según el tipo de tabla
  const getSearchPlaceholder = useCallback(tableType => {
    const placeholders = {
      active: 'Buscar usuarios por nombre, email, rol, interés o ubicación...',
      pending: 'Buscar usuarios por nombre, email, interés...',
      incomplete: 'Buscar usuarios por nombre, email...',
      unverified: 'Buscar usuarios por nombre, email...',
      nonApproved: 'Buscar usuarios por nombre, email...',
      deactivated: 'Buscar usuarios por nombre, email, rol...'
    }
    return placeholders[tableType] || 'Buscar usuarios...'
  }, [])

  // Función para obtener el método de refresh según el tipo de tabla
  const getRefreshMethod = useCallback(
    tableType => {
      const methods = {
        active: refreshActiveUsers,
        pending: refreshPendingUsers,
        incomplete: refreshIncompleteUsers,
        unverified: refreshUnverifiedUsers,
        nonApproved: refreshNonApprovedUsers,
        deactivated: refreshDeactivatedUsers
      }
      return methods[tableType]
    },
    [
      refreshActiveUsers,
      refreshPendingUsers,
      refreshIncompleteUsers,
      refreshUnverifiedUsers,
      refreshNonApprovedUsers,
      refreshDeactivatedUsers
    ]
  )

  // Top content dinámico para la tabla actual
  const topContent = useMemo(() => {
    const refreshMethod = getRefreshMethod(selectedTab)
    const showCreateButton = selectedTab === 'active' // Solo mostrar crear en usuarios activos

    return (
      <GenericTableControls
        filterValue={currentTableState?.filterValue || ''}
        onClear={onClear}
        onSearchChange={onSearchChange}
        filterPlaceholder={getSearchPlaceholder(selectedTab)}
        columns={allColumns}
        visibleColumns={currentTableState?.visibleColumns}
        setVisibleColumns={onColumnsChange}
        onCreateItem={showCreateButton ? handleOpenCreateModal : undefined}
        createButtonLabel='Crear Usuario'
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
        itemsLabel={`usuarios ${selectedTab}`}
        rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
        onRowsPerPageChange={onRowsPerPageChange}
        hideCreateButton={!showCreateButton}
      />
    )
  }, [
    selectedTab,
    currentTableState,
    headerColumns,
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

  // ========================================
  // ESTADÍSTICAS Y CONFIGURACIONES FINALES
  // ========================================

  // Combinar todos los usuarios para estadísticas completas
  const allUsers = useMemo(() => {
    const combined = []

    // Agregar usuarios de todos los tipos
    if (activeUsers?.length) combined.push(...activeUsers.map(user => ({ ...user, userType: 'active' })))
    if (pendingUsers?.length) combined.push(...pendingUsers.map(user => ({ ...user, userType: 'pending' })))
    if (incompleteUsers?.length) combined.push(...incompleteUsers.map(user => ({ ...user, userType: 'incomplete' })))
    if (unverifiedUsers?.length) combined.push(...unverifiedUsers.map(user => ({ ...user, userType: 'unverified' })))
    if (nonApprovedUsers?.length) combined.push(...nonApprovedUsers.map(user => ({ ...user, userType: 'nonApproved' })))
    if (deactivatedUsers?.length) combined.push(...deactivatedUsers.map(user => ({ ...user, userType: 'deactivated' })))

    return combined
  }, [activeUsers, pendingUsers, incompleteUsers, unverifiedUsers, nonApprovedUsers, deactivatedUsers])

  const userStats = useUserStats(allUsers)

  // Calcular claves deshabilitadas (usuarios que no pueden ser seleccionados)
  const disabledKeys = useMemo(() => {
    const disabled = currentUsers?.filter(user => !isRowSelectable(user)).map(user => String(user.id)) || []
    return new Set(disabled)
  }, [currentUsers, isRowSelectable])

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Gestión de Usuarios | Admin</title>
        <meta name='description' content='Panel de administración para gestionar usuarios del sistema' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Gestión de Usuarios</h1>
          <p className='text-gray-400'>Administra los usuarios del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <UserStatsCards userStats={tabCounts} />

      {/* Pestañas para los 6 tipos de usuarios */}
      <div className='flex w-full flex-col'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label='Gestión de usuarios'
          color='primary'
          variant='bordered'>
          {/* Usuarios Activos */}
          <Tab
            key='active'
            title={
              <div className='flex items-center space-x-2'>
                <Users className='w-4 h-4' />
                <span>Activos</span>
                {tabCounts.active > 0 && (
                  <div className='bg-success-100 text-success-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.active}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='active'
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onView={viewUser}
                onBlock={blockUser}
                onSendEmail={sendEmailToUser}
                onDeactivate={deactivateUser}
                selectedKeys={currentTableState?.selectedKeys}
                setSelectedKeys={onSelectionChange}
                disabledKeys={disabledKeys}
                sortDescriptor={currentTableState?.sortDescriptor}
                setSortDescriptor={onSortChange}
                topContent={topContent}
                bottomContent={bottomContent}
                visibleColumns={currentTableState?.visibleColumns}
                headerColumns={headerColumns}
              />
            </div>
          </Tab>

          {/* Usuarios Pendientes */}
          <Tab
            key='pending'
            title={
              <div className='flex items-center space-x-2'>
                <Clock className='w-4 h-4' />
                <span>Pendientes</span>
                {tabCounts.pending > 0 && (
                  <div className='bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.pending}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='pending'
                onView={viewUser}
                onApprove={approveUser}
                onReject={rejectUser}
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

          {/* Usuarios Incompletos */}
          <Tab
            key='incomplete'
            title={
              <div className='flex items-center space-x-2'>
                <UserX className='w-4 h-4' />
                <span>Incompletos</span>
                {tabCounts.incomplete > 0 && (
                  <div className='bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full text-xs font-medium'>
                    {tabCounts.incomplete}
                  </div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='incomplete'
                onSendEmail={sendEmailToUser}
                onDeactivate={deactivateUser}
                onDelete={deleteUser}
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

          {/* Usuarios Sin Verificar */}
          <Tab
            key='unverified'
            title={
              <div className='flex items-center space-x-2'>
                <ShieldAlert className='w-4 h-4' />
                <span>Sin Verificar</span>
                {tabCounts.unverified > 0 && (
                  <div className='bg-danger-100 text-danger-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.unverified}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='unverified'
                onSendEmail={sendEmailToUser}
                onDeactivate={deactivateUser}
                onDelete={deleteUser}
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

          {/* Usuarios No Aprobados */}
          <Tab
            key='nonApproved'
            title={
              <div className='flex items-center space-x-2'>
                <UserMinus className='w-4 h-4' />
                <span>No Aprobados</span>
                {tabCounts.nonApproved > 0 && (
                  <div className='bg-default-100 text-default-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.nonApproved}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='nonApproved'
                onView={viewUser}
                onApprove={approveUser}
                onSendEmail={sendEmailToUser}
                onDeactivate={deactivateUser}
                onDelete={deleteUser}
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

          {/* Usuarios Desactivados */}
          <Tab
            key='deactivated'
            title={
              <div className='flex items-center space-x-2'>
                <UserCheck className='w-4 h-4' />
                <span>Desactivados</span>
                {tabCounts.deactivated > 0 && (
                  <div className='bg-danger-100 text-danger-600 px-2 py-1 rounded-full text-xs font-medium'>{tabCounts.deactivated}</div>
                )}
              </div>
            }>
            <div className='py-4'>
              <UnifiedUserTable
                users={sortedItems}
                loading={currentTableState?.loading || loading}
                tableType='deactivated'
                onSendEmail={sendEmailToUser}
                onActivate={activateUser}
                onDelete={deleteUser}
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

      {/* Separador */}
      <Divider className='my-8' />

      {/* Sección de Gestión de Tags */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
              <Tags className='w-4 h-4 text-purple-400' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>Gestión de Tags del Sistema</h2>
              <p className='text-sm text-default-500'>Administra y modera los tags creados por los usuarios</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className='pt-0'>
          <TagAnalytics />
        </CardBody>
      </Card>

      {/* Modales */}
      <CreateUserForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} />

      {selectedUser && (
        <EditUserForm isOpen={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} userData={selectedUser} />
      )}

      {selectedUser && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleOperationSuccess}
          userData={selectedUser}
        />
      )}
    </div>
  )
})

Management.displayName = 'Management'

export default Management
