import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { useError } from '@hooks/useError.js'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Users, Clock } from 'lucide-react'
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
import useUserStats from '@hooks/useUserStats.js'
import useUserFiltering from '@hooks/useUserFiltering.js'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { USER_COLUMNS } from '@constants/tableConstants.js'

import CreateUserForm from './components/CreateUserForm.jsx'
import EditUserForm from './components/EditUserForm.jsx'
import DeleteUserModal from './components/DeleteUserModal.jsx'
import UserStatsCards from './components/UserStatsCards.jsx'
import UnifiedUserTable from './components/UnifiedUserTable.jsx'

const UsersManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const { users, usersPagination, loading, refreshUsers, getUserByEmail, fetchUsers } = useUser()
  const { handleError, handleSuccess } = useError()
  
  // Estados para usuarios pendientes
  const [pendingUsers, setPendingUsers] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  
  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('active')

  // Table states for active users
  const [filterValue, setFilterValue] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(USER_COLUMNS.filter(col => col.uid !== 'id').map(col => col.uid)))
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)

  // Table states for pending users
  const [pendingFilterValue, setPendingFilterValue] = useState('')
  const [pendingDebouncedFilter, setPendingDebouncedFilter] = useState('')
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10)
  const [pendingPage, setPendingPage] = useState(1)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // ========================================
  // EFFECTS
  // ========================================

  // Debounce for search - active users
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterValue])

  // Debounce for search - pending users
  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingDebouncedFilter(pendingFilterValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [pendingFilterValue])

  // Load users when parameters change
  useEffect(() => {
    fetchUsers(page - 1, rowsPerPage, debouncedFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedFilter])

  // ========================================
  // COLUMNS AND FILTERS CONFIGURATION
  // ========================================

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return USER_COLUMNS
    return USER_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = useUserFiltering(users, currentUser)

  // Use backend pagination
  const pages = usersPagination.totalPages || 1
  const totalItems = usersPagination.totalElements || 0

  // Items already come filtered from backend, only apply local permissions filter
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredItems])

  // Filtered and paginated pending users
  const filteredPendingUsers = useMemo(() => {
    if (!pendingDebouncedFilter) return pendingUsers
    return pendingUsers.filter(user => 
      user.name?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      user.email?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      user.country?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      user.city?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase()) ||
      user.categoryInterest?.toLowerCase().includes(pendingDebouncedFilter.toLowerCase())
    )
  }, [pendingUsers, pendingDebouncedFilter])

  // Pagination for pending users
  const pendingPages = Math.ceil(filteredPendingUsers.length / pendingRowsPerPage)
  const paginatedPendingUsers = useMemo(() => {
    const start = (pendingPage - 1) * pendingRowsPerPage
    return filteredPendingUsers.slice(start, start + pendingRowsPerPage)
  }, [filteredPendingUsers, pendingPage, pendingRowsPerPage])

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
        console.error('Error getting complete user data:', error)
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
        console.error('Error: Incomplete user data', user)
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
    console.log('Operation successful, updating user list')
    refreshUsers(page - 1, rowsPerPage, debouncedFilter)
    fetchPendingUsers() // Actualizar usuarios pendientes también
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [refreshUsers, page, rowsPerPage, debouncedFilter])

  // Función para actualizar usuarios activos
  const handleRefreshActiveUsers = useCallback(() => {
    console.log('Refreshing active users...')
    refreshUsers(page - 1, rowsPerPage, debouncedFilter)
  }, [refreshUsers, page, rowsPerPage, debouncedFilter])

  // Funciones para usuarios pendientes
  const fetchPendingUsers = useCallback(async () => {
    setLoadingPending(true)
    try {
      // Simulación de datos pendientes - reemplazar con llamada real al backend
      const mockPendingUsers = [
        {
          id: 1001,
          name: 'Ana',
          lastName: 'García',
          email: 'ana.garcia@example.com',
          birthDate: '1995-06-15',
          country: 'Colombia',
          city: 'Bogotá',
          phone: '3001234567',
          profileCompleteness: 85,
          categoryInterest: 'ROSE',
          matchesAvailable: 12,
          verified: true,
          role: 'CLIENT',
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Amante de la naturaleza y los deportes al aire libre',
          mainImage: null
        },
        {
          id: 1002,
          name: 'Carlos',
          lastName: 'Rodriguez',
          email: 'carlos.rodriguez@example.com',
          birthDate: '1991-03-22',
          country: 'Colombia',
          city: 'Medellín',
          phone: '3109876543',
          profileCompleteness: 70,
          categoryInterest: 'ESSENCE',
          matchesAvailable: 8,
          verified: false,
          role: 'CLIENT',
          registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          description: 'Profesional en tecnología, busco conexiones auténticas',
          mainImage: null
        },
        {
          id: 1003,
          name: 'María',
          lastName: 'López',
          email: 'maria.lopez@example.com',
          birthDate: '1997-09-10',
          country: 'Colombia',
          city: 'Cali',
          phone: '3201357924',
          profileCompleteness: 95,
          categoryInterest: 'ROUSE',
          matchesAvailable: 15,
          verified: true,
          role: 'CLIENT',
          registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Artista y creativa, me encanta viajar y conocer nuevas culturas',
          mainImage: null
        }
      ]
      setPendingUsers(mockPendingUsers)
    } catch (error) {
      handleError('Error al cargar usuarios pendientes')
    } finally {
      setLoadingPending(false)
    }
  }, [handleError])

  const handleApproveUser = useCallback(async (userId) => {
    try {
      // Simulación - reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      handleSuccess('Usuario aprobado correctamente')
    } catch (error) {
      handleError('Error al aprobar usuario')
    }
  }, [handleSuccess, handleError])

  const handleRejectUser = useCallback(async (userId) => {
    try {
      // Simulación - reemplazar con llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPendingUsers(prev => prev.filter(user => user.id !== userId))
      handleSuccess('Usuario rechazado correctamente')
    } catch (error) {
      handleError('Error al rechazar usuario')
    }
  }, [handleSuccess, handleError])

  // Función para actualizar usuarios pendientes
  const handleRefreshPendingUsers = useCallback(() => {
    console.log('Refreshing pending users...')
    fetchPendingUsers()
  }, [fetchPendingUsers])

  // Cargar usuarios pendientes al inicio
  useEffect(() => {
    fetchPendingUsers()
  }, [fetchPendingUsers])

  // ========================================
  // TABLE HANDLERS
  // ========================================

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
    setPage(1) // Reset to first page when searching
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  // Pending users handlers
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

  // Function to determine if a row can be selected
  const isRowSelectable = useCallback(item => item.email !== currentUser?.email, [currentUser?.email])

  // ========================================
  // TABLE CONTENT
  // ========================================

  const topContent = useMemo(
    () => (
      <GenericTableControls
        filterValue={filterValue}
        onClear={onClear}
        onSearchChange={onSearchChange}
        filterPlaceholder="Buscar por nombre, email, rol, interés o ubicación..."
        columns={USER_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        onCreateItem={handleOpenCreateModal}
        createButtonLabel="Crear Usuario"
        onRefresh={handleRefreshActiveUsers}
        loading={loading}
        error={null}
        totalItems={totalItems}
        itemsLabel="usuarios"
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    ),
    [filterValue, onClear, onSearchChange, visibleColumns, handleOpenCreateModal, handleRefreshActiveUsers, loading, rowsPerPage, onRowsPerPageChange, totalItems]
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

  // Pending users table content
  const pendingTopContent = useMemo(
    () => (
      <GenericTableControls
        filterValue={pendingFilterValue}
        onClear={onPendingClear}
        onSearchChange={onPendingSearchChange}
        filterPlaceholder="Buscar usuarios pendientes..."
        columns={USER_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        loading={loadingPending}
        error={null}
        totalItems={filteredPendingUsers.length}
        itemsLabel="usuarios pendientes"
        rowsPerPage={pendingRowsPerPage}
        onRowsPerPageChange={onPendingRowsPerPageChange}
        hideCreateButton={true}
        onRefresh={handleRefreshPendingUsers}
      />
    ),
    [
      pendingFilterValue,
      onPendingClear,
      onPendingSearchChange,
      visibleColumns,
      loadingPending,
      filteredPendingUsers.length,
      pendingRowsPerPage,
      onPendingRowsPerPageChange,
      handleRefreshPendingUsers
    ]
  )

  const pendingBottomContent = useMemo(
    () => (
      <TablePagination
        selectedKeys={new Set([])}
        filteredItemsLength={filteredPendingUsers.length}
        page={pendingPage}
        pages={pendingPages}
        onPreviousPage={onPendingPreviousPage}
        onNextPage={onPendingNextPage}
        onPageChange={setPendingPage}
      />
    ),
    [filteredPendingUsers.length, pendingPage, pendingPages, onPendingPreviousPage, onPendingNextPage]
  )

  // ========================================
  // STATISTICS
  // ========================================

  const userStats = useUserStats(users)

  // Calculate disabled keys (users that cannot be selected)
  const disabledKeys = useMemo(() => {
    const disabled = filteredItems.filter(user => !isRowSelectable(user)).map(user => String(user.id))
    if (disabled.length > 0) {
      console.log('🚫 Disabled keys for selection:', disabled)
    }
    return new Set(disabled)
  }, [filteredItems, isRowSelectable])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Helmet>
        <title>Gestión de Usuarios | Admin</title>
        <meta name="description" content="Panel de administración para gestionar usuarios del sistema" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administra los usuarios del sistema</p>
        </div>
      </div>

      {/* Pestañas para usuarios activos y pendientes */}
      <div className="flex w-full flex-col">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label="Gestión de usuarios"
          color="primary"
          variant="bordered"
        >
          <Tab
            key="active"
            title={
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Usuarios Activos</span>
                {users.length > 0 && (
                  <div className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs font-medium">
                    {totalItems}
                  </div>
                )}
              </div>
            }
          >
            <div className="py-4">
              <UnifiedUserTable
                users={sortedItems}
                loading={loading}
                tableType="active"
                currentUser={currentUser}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                disabledKeys={disabledKeys}
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
                {pendingUsers.length > 0 && (
                  <div className="bg-warning-100 text-warning-600 px-2 py-1 rounded-full text-xs font-medium">
                    {pendingUsers.length}
                  </div>
                )}
              </div>
            }
          >
            <div className="py-4">
              <UnifiedUserTable
                users={paginatedPendingUsers}
                loading={loadingPending}
                tableType="pending"
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
                visibleColumns={visibleColumns}
                topContent={pendingTopContent}
                bottomContent={pendingBottomContent}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Estadísticas */}
      <UserStatsCards userStats={userStats} />

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

UsersManagement.displayName = 'UsersManagement'

export default UsersManagement
