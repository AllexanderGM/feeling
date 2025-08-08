import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Users, Clock, UserX, ShieldAlert, UserCheck, UserMinus, Tags, BarChart3, Settings2, Heart } from 'lucide-react'
import { useAuth, useUser, useError } from '@hooks'
import { userService, userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'

// Importar componentes originales
import CreateUserForm from '@pages/user/management/components/CreateUserForm.jsx'
import EditUserForm from '@pages/user/management/components/EditUserForm.jsx'
import DeleteUserModal from '@pages/user/management/components/DeleteUserModal.jsx'
import UnifiedUserTable from '@pages/user/management/components/UnifiedUserTable.jsx'

// Importar las nuevas secciones
import UserAnalyticsSection from './components/UserAnalyticsSection.jsx'
import UserAttributesSection from './components/UserAttributesSection.jsx'
import UserInterestsSection from './components/UserInterestsSection.jsx'
import UserTagsSection from './components/UserTagsSection.jsx'

// Mapeo de tipos de usuario a columnas (mantenido del original)
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

const AdminUsersManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const { handleError, handleSuccess } = useError()
  const [selectedTab, setSelectedTab] = useState('users')
  const [selectedUserTab, setSelectedUserTab] = useState('active')
  const [selectedManagementTab, setSelectedManagementTab] = useState('attributes')

  // Estados para el manejo de usuarios (actualizando a la API real)
  const {
    // Estados de usuarios por estatus
    usersByStatus,
    usersPagination,

    // Métodos para obtener usuarios
    getUsersByStatus,

    // Funciones de administración
    approveUser,
    rejectUser,
    sendEmailToUser,
    loading
  } = useUser()

  // Estados para modales (manteniendo la estructura original)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Estado para los conteos de pestañas de usuarios
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    pending: 0,
    incomplete: 0,
    unverified: 0,
    nonApproved: 0,
    deactivated: 0
  })

  // Estado para los conteos de pestañas de gestión
  const [managementCounts, setManagementCounts] = useState({
    attributes: 0,
    interests: 0,
    tags: 0
  })

  // Estados para las tablas (manteniendo la estructura original)
  const [tableStates, setTableStates] = useState({
    active: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'name', direction: 'ascending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    },
    pending: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'name', direction: 'ascending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    },
    incomplete: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    },
    unverified: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    },
    nonApproved: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'createdAt', direction: 'descending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    },
    deactivated: {
      filterValue: '',
      debouncedFilter: '',
      visibleColumns: 'all',
      selectedKeys: new Set([]),
      sortDescriptor: { column: 'name', direction: 'ascending' },
      page: 1,
      rowsPerPage: DEFAULT_ROWS_PER_PAGE,
      loading: false
    }
  })

  // Función para cargar conteos de pestañas (actualizada con nueva API)
  const loadTabCounts = useCallback(async () => {
    try {
      const userMetrics = await userAnalyticsService.getUserMetrics()

      // Acceder a userTabsCount que es el objeto anidado
      const tabsCount = userMetrics?.userTabsCount || {}

      // Adaptar la respuesta a la estructura esperada por tabCounts
      const counts = {
        active: tabsCount.active || 0,
        pending: tabsCount.pending || 0,
        incomplete: tabsCount.incomplete || 0,
        unverified: tabsCount.unverified || 0,
        nonApproved: tabsCount.nonApproved || 0,
        deactivated: tabsCount.deactivated || 0
      }

      setTabCounts(counts)
    } catch (error) {
      Logger.error('Error loading user metrics:', error, { category: Logger.CATEGORIES.USER })
      handleError?.('Error al cargar conteos de pestañas')
    }
  }, [handleError])

  // Función para cargar conteos de gestión desde analytics
  const loadManagementCounts = useCallback(async () => {
    try {
      // Usar el endpoint de analytics que ya existe
      const [attributesStats, interestsStats, tagsStats] = await Promise.allSettled([
        userAnalyticsService.getAttributeStatistics(),
        userAnalyticsService.getInterestsStatistics(),
        userAnalyticsService.getTagsStatistics()
      ])

      const counts = {
        attributes: attributesStats.status === 'fulfilled' ? attributesStats.value?.totalAttributes || 0 : 0,
        interests: interestsStats.status === 'fulfilled' ? interestsStats.value?.totalInterests || 0 : 0,
        tags: tagsStats.status === 'fulfilled' ? tagsStats.value?.totalTags || 0 : 0
      }

      setManagementCounts(counts)
    } catch (error) {
      Logger.error('Error loading management counts:', error, { category: Logger.CATEGORIES.USER })
      handleError?.('Error al cargar conteos de gestión')
    }
  }, [handleError])

  // Mapeo de nombres de tabs frontend a backend
  const getBackendStatusName = useCallback(frontendStatus => {
    const statusMap = {
      active: 'active',
      pending: 'pending-approval',
      incomplete: 'incomplete-profiles',
      unverified: 'unverified',
      nonApproved: 'non-approved',
      deactivated: 'deactivated'
    }
    return statusMap[frontendStatus] || frontendStatus
  }, [])

  // Función helper para obtener datos de usuario por tipo (actualizada para nueva API)
  const getUsersData = useCallback(
    tableType => {
      const users = usersByStatus[tableType] || []
      const pagination = usersPagination[tableType] || null
      const fetchMethod = (page, size, search) => {
        const backendStatus = getBackendStatusName(tableType)
        return getUsersByStatus(backendStatus, tableType, page, size, search)
      }

      return { users, pagination, fetchMethod }
    },
    [usersByStatus, usersPagination, getUsersByStatus, getBackendStatusName]
  )

  // Función para actualizar estado de tabla (mantenida del original)
  const updateTableState = useCallback((tableType, updates) => {
    setTableStates(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        ...updates
      }
    }))
  }, [])

  // Cargar conteos al montar el componente
  useEffect(() => {
    loadTabCounts()
    loadManagementCounts()
  }, [loadTabCounts, loadManagementCounts])

  // Cargar datos cuando cambie la pestaña de usuarios seleccionada
  useEffect(() => {
    const userTabs = ['active', 'pending', 'incomplete', 'unverified', 'nonApproved', 'deactivated']
    if (selectedTab === 'users' && userTabs.includes(selectedUserTab)) {
      const state = tableStates[selectedUserTab]
      const backendStatus = getBackendStatusName(selectedUserTab)
      getUsersByStatus(
        backendStatus,
        selectedUserTab,
        (state?.page || 1) - 1,
        state?.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
        state?.filterValue || ''
      )
    }
  }, [selectedTab, selectedUserTab, getUsersByStatus, tableStates, getBackendStatusName])

  // Handlers para modales (mantenidos del original)
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(
    user => {
      setSelectedUser({
        id: user.id,
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role
      })
      setIsEditModalOpen(true)
    },
    [handleError]
  )

  const handleOpenDeleteModal = useCallback(
    user => {
      setSelectedUser({
        id: user.id,
        name: user.name || '',
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
        const backendStatus = getBackendStatusName(tableType)

        // Usar getUsersByStatus directamente
        getUsersByStatus(
          backendStatus,
          tableType,
          (state.page || 1) - 1,
          state.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
          state.debouncedFilter || ''
        ).catch(error => {
          Logger.error(`Error refreshing ${tableType} users:`, error, { category: Logger.CATEGORIES.USER })
        })
      })
    }

    refreshAllTables()

    // Refrescar conteos de pestañas
    loadTabCounts()
    loadManagementCounts()

    // Cerrar modales
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [tableStates, getUsersByStatus, getBackendStatusName, loadTabCounts, loadManagementCounts])

  // Función para manejar éxito en operaciones de gestión
  const handleManagementSuccess = useCallback(
    message => {
      handleSuccess?.(message)
      // Refrescar solo conteos de gestión
      loadManagementCounts()
    },
    [handleSuccess, loadManagementCounts]
  )

  // Funciones adicionales para gestión de usuarios
  const handleDeactivateUser = useCallback(
    async userId => {
      try {
        await userService.deactivateUser(userId)
        handleSuccess?.('Usuario desactivado exitosamente')
        // Refrescar las tablas
        handleOperationSuccess()
      } catch (error) {
        handleError?.('Error al desactivar usuario')
      }
    },
    [handleSuccess, handleError, handleOperationSuccess]
  )

  const handleReactivateUser = useCallback(
    async userId => {
      try {
        await userService.reactivateUser(userId)
        handleSuccess?.('Usuario reactivado exitosamente')
        // Refrescar las tablas
        handleOperationSuccess()
      } catch (error) {
        handleError?.('Error al reactivar usuario')
      }
    },
    [handleSuccess, handleError, handleOperationSuccess]
  )

  // Renderizar tabla de usuarios (mantenida del original)
  const renderUserTable = useCallback(
    userType => {
      const currentTableState = tableStates[userType]
      const { users: currentUsers, pagination: currentPagination } = getUsersData(userType)

      // Todas las columnas disponibles
      const allColumns = USER_TYPE_COLUMNS[userType] || []

      // Columnas dinámicas según el tipo de tabla
      const headerColumns = useMemo(() => {
        const visibleColumns = currentTableState?.visibleColumns

        if (visibleColumns === 'all') return allColumns
        return allColumns.filter(column => Array.from(visibleColumns || []).includes(column.uid))
      }, [allColumns, currentTableState?.visibleColumns])

      // Paginación dinámica según el tipo de tabla
      const pages = currentPagination?.totalPages || 1
      const totalItems = currentPagination?.totalElements || 0

      // Event handlers para esta tabla específica
      const onSearchChange = useCallback(
        value => {
          updateTableState(userType, {
            filterValue: value,
            page: 1
          })
        },
        [userType]
      )

      const onClear = useCallback(() => {
        updateTableState(userType, {
          filterValue: '',
          page: 1
        })
      }, [userType])

      const onRowsPerPageChange = useCallback(
        rowsPerPage => {
          updateTableState(userType, {
            rowsPerPage,
            page: 1
          })
        },
        [userType]
      )

      const onPageChange = useCallback(
        page => {
          updateTableState(userType, { page })
        },
        [userType]
      )

      const onPreviousPage = useCallback(() => {
        updateTableState(userType, {
          page: Math.max((currentTableState?.page || 1) - 1, 1)
        })
      }, [userType, currentTableState?.page])

      const onNextPage = useCallback(() => {
        const maxPage = currentPagination?.totalPages || 1
        updateTableState(userType, {
          page: Math.min((currentTableState?.page || 1) + 1, maxPage)
        })
      }, [userType, currentTableState?.page, currentPagination?.totalPages])

      // Función para obtener el placeholder de búsqueda según el tipo de tabla
      const getSearchPlaceholder = tableType => {
        const placeholders = {
          active: 'Buscar usuarios por nombre, email, rol, interés o ubicación...',
          pending: 'Buscar usuarios por nombre, email, interés...',
          incomplete: 'Buscar usuarios por nombre, email...',
          unverified: 'Buscar usuarios por nombre, email...',
          nonApproved: 'Buscar usuarios por nombre, email...',
          deactivated: 'Buscar usuarios por nombre, email, rol...'
        }
        return placeholders[tableType] || 'Buscar usuarios...'
      }

      // Top content para la tabla
      const topContent = (
        <GenericTableControls
          filterValue={currentTableState?.filterValue || ''}
          onClear={onClear}
          onSearchChange={onSearchChange}
          filterPlaceholder={getSearchPlaceholder(userType)}
          columns={allColumns}
          visibleColumns={currentTableState?.visibleColumns}
          setVisibleColumns={visibleColumns => updateTableState(userType, { visibleColumns })}
          onCreateItem={userType === 'active' ? handleOpenCreateModal : undefined}
          createButtonLabel='Crear Usuario'
          onRefresh={() => {
            const backendStatus = getBackendStatusName(userType)
            getUsersByStatus(
              backendStatus,
              userType,
              (currentTableState?.page || 1) - 1,
              currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE,
              currentTableState?.filterValue || ''
            )
          }}
          loading={currentTableState?.loading || loading}
          error={null}
          totalItems={totalItems}
          itemsLabel={`usuarios ${userType}`}
          rowsPerPage={currentTableState?.rowsPerPage || DEFAULT_ROWS_PER_PAGE}
          onRowsPerPageChange={onRowsPerPageChange}
          hideCreateButton={userType !== 'active'}
        />
      )

      // Bottom content para la tabla
      const bottomContent = (
        <TablePagination
          selectedKeys={currentTableState?.selectedKeys || new Set([])}
          filteredItemsLength={totalItems}
          page={currentTableState?.page || 1}
          pages={pages}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onPageChange={onPageChange}
        />
      )

      // Preparar renderizado de la tabla

      return (
        <div className='py-4'>
          <UnifiedUserTable
            userType={userType}
            users={currentUsers || []}
            headerColumns={headerColumns}
            sortDescriptor={currentTableState?.sortDescriptor}
            selectedKeys={currentTableState?.selectedKeys || new Set([])}
            onSortChange={sortDescriptor => updateTableState(userType, { sortDescriptor })}
            onSelectionChange={selectedKeys => updateTableState(userType, { selectedKeys })}
            topContent={topContent}
            bottomContent={bottomContent}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onApprove={userType === 'pending' || userType === 'nonApproved' ? approveUser : undefined}
            onReject={userType === 'pending' || userType === 'active' ? rejectUser : undefined}
            onSendEmail={sendEmailToUser}
            onDeactivate={userType !== 'deactivated' ? handleDeactivateUser : undefined}
            onActivate={userType === 'deactivated' ? handleReactivateUser : undefined}
            currentUser={currentUser}
            loading={currentTableState?.loading || loading}
            emptyContent={`No hay usuarios ${userType} para mostrar.`}
            disabledKeys={new Set(currentUsers?.filter(user => user.email === currentUser?.email).map(user => String(user.id)) || [])}
          />
        </div>
      )
    },
    [
      tableStates,
      getUsersData,
      updateTableState,
      handleOpenCreateModal,
      handleOpenEditModal,
      handleOpenDeleteModal,
      approveUser,
      rejectUser,
      sendEmailToUser,
      handleDeactivateUser,
      handleReactivateUser,
      loading,
      currentUser?.email
    ]
  )

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Administración de Usuarios | Feeling</title>
        <meta name='description' content='Panel de administración completo para gestión de usuarios, atributos, categorías y tags' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Administración de Usuarios</h1>
          <p className='text-gray-400'>Gestión completa del sistema de usuarios, atributos, categorías e intereses</p>
        </div>
      </div>

      {/* Secciones principales */}
      <div className='flex w-full flex-col'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label='Administración de usuarios'
          color='primary'
          variant='bordered'>
          {/* SECCIÓN 1: USUARIOS */}
          <Tab
            key='users'
            title={
              <div className='flex items-center space-x-2'>
                <Users className='w-4 h-4' />
                <span>Usuarios</span>
              </div>
            }>
            <div className='py-4'>
              <Tabs
                selectedKey={selectedUserTab || 'active'}
                onSelectionChange={setSelectedUserTab}
                aria-label='Gestión de usuarios'
                color='secondary'
                variant='underlined'>
                {/* Usuarios Activos */}
                <Tab
                  key='active'
                  title={
                    <div className='flex items-center space-x-2'>
                      <Users className='w-4 h-4' />
                      <span>Activos</span>
                      {tabCounts.active > 0 && <span className='text-xs text-success-600 font-medium'>{tabCounts.active}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'active' && renderUserTable('active')}
                </Tab>

                {/* Usuarios Pendientes */}
                <Tab
                  key='pending'
                  title={
                    <div className='flex items-center space-x-2'>
                      <Clock className='w-4 h-4' />
                      <span>Pendientes</span>
                      {tabCounts.pending > 0 && <span className='text-xs text-warning-600 font-medium'>{tabCounts.pending}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'pending' && renderUserTable('pending')}
                </Tab>

                {/* Usuarios Incompletos */}
                <Tab
                  key='incomplete'
                  title={
                    <div className='flex items-center space-x-2'>
                      <UserCheck className='w-4 h-4' />
                      <span>Incompletos</span>
                      {tabCounts.incomplete > 0 && <span className='text-xs text-primary-600 font-medium'>{tabCounts.incomplete}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'incomplete' && renderUserTable('incomplete')}
                </Tab>

                {/* Usuarios Sin Verificar */}
                <Tab
                  key='unverified'
                  title={
                    <div className='flex items-center space-x-2'>
                      <ShieldAlert className='w-4 h-4' />
                      <span>Sin Verificar</span>
                      {tabCounts.unverified > 0 && <span className='text-xs text-secondary-600 font-medium'>{tabCounts.unverified}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'unverified' && renderUserTable('unverified')}
                </Tab>

                {/* Usuarios No Aprobados */}
                <Tab
                  key='nonApproved'
                  title={
                    <div className='flex items-center space-x-2'>
                      <UserX className='w-4 h-4' />
                      <span>No Aprobados</span>
                      {tabCounts.nonApproved > 0 && <span className='text-xs text-danger-600 font-medium'>{tabCounts.nonApproved}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'nonApproved' && renderUserTable('nonApproved')}
                </Tab>

                {/* Usuarios Desactivados */}
                <Tab
                  key='deactivated'
                  title={
                    <div className='flex items-center space-x-2'>
                      <UserMinus className='w-4 h-4' />
                      <span>Desactivados</span>
                      {tabCounts.deactivated > 0 && <span className='text-xs text-default-600 font-medium'>{tabCounts.deactivated}</span>}
                    </div>
                  }>
                  {selectedUserTab === 'deactivated' && renderUserTable('deactivated')}
                </Tab>
              </Tabs>
            </div>
          </Tab>

          {/* SECCIÓN 2: GESTIÓN */}
          <Tab
            key='management'
            title={
              <div className='flex items-center space-x-2'>
                <Settings2 className='w-4 h-4' />
                <span>Gestión</span>
              </div>
            }>
            <div className='py-4'>
              <Tabs
                selectedKey={selectedManagementTab || 'attributes'}
                onSelectionChange={setSelectedManagementTab}
                aria-label='Gestión de datos'
                color='secondary'
                variant='underlined'>
                {/* Atributos */}
                <Tab
                  key='attributes'
                  title={
                    <div className='flex items-center space-x-2'>
                      <Settings2 className='w-4 h-4' />
                      <span>Atributos</span>
                      {managementCounts.attributes > 0 && (
                        <span className='text-xs text-default-600 font-medium'>{managementCounts.attributes}</span>
                      )}
                    </div>
                  }>
                  <div className='py-4'>
                    <UserAttributesSection onError={handleError} onSuccess={handleManagementSuccess} />
                  </div>
                </Tab>

                {/* Categorías de Interés */}
                <Tab
                  key='interests'
                  title={
                    <div className='flex items-center space-x-2'>
                      <Heart className='w-4 h-4' />
                      <span>Categorías</span>
                      {managementCounts.interests > 0 && (
                        <span className='text-xs text-danger-600 font-medium'>{managementCounts.interests}</span>
                      )}
                    </div>
                  }>
                  <div className='py-4'>
                    <UserInterestsSection onError={handleError} onSuccess={handleManagementSuccess} />
                  </div>
                </Tab>

                {/* Tags */}
                <Tab
                  key='tags'
                  title={
                    <div className='flex items-center space-x-2'>
                      <Tags className='w-4 h-4' />
                      <span>Tags</span>
                      {managementCounts.tags > 0 && <span className='text-xs text-secondary-600 font-medium'>{managementCounts.tags}</span>}
                    </div>
                  }>
                  <div className='py-4'>
                    <UserTagsSection onError={handleError} onSuccess={handleManagementSuccess} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Tab>

          {/* SECCIÓN 3: ANALÍTICAS */}
          <Tab
            key='analytics'
            title={
              <div className='flex items-center space-x-2'>
                <BarChart3 className='w-4 h-4' />
                <span>Analíticas</span>
              </div>
            }>
            <UserAnalyticsSection onError={handleError} onSuccess={handleSuccess} />
          </Tab>
        </Tabs>
      </div>

      {/* Modales (mantenidos del original) */}
      <CreateUserForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} />

      <EditUserForm isOpen={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} user={selectedUser} />

      <DeleteUserModal isOpen={isDeleteModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} user={selectedUser} />
    </div>
  )
})

AdminUsersManagement.displayName = 'AdminUsersManagement'

export default AdminUsersManagement
