import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
import useUserStats from '@hooks/useUserStats.js'
import useUserFiltering from '@hooks/useUserFiltering.js'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { USER_COLUMNS } from '@constants/tableConstants.js'

import CrearUserForm from './components/CrearUserForm.jsx'
import EditarUserForm from './components/EditarUserForm.jsx'
import DeleteUserModal from './components/DeleteUserModal.jsx'
import UserTableCell from './components/UserTableCell.jsx'
import UserStatsCards from './components/UserStatsCards.jsx'

const UsersManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const { users, usersPagination, loading, refreshUsers, getUserByEmail, fetchUsers } = useUser()

  // Estados de la tabla
  const [filterValue, setFilterValue] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(USER_COLUMNS.map(col => col.uid)))
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // ========================================
  // EFECTOS
  // ========================================

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [filterValue])

  // Cargar usuarios cuando cambian los parámetros
  useEffect(() => {
    console.log('🔄 UsersManagement: Fetching users...', { page, rowsPerPage, debouncedFilter })
    fetchUsers(page - 1, rowsPerPage, debouncedFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedFilter])

  // Debug: Log users state changes
  useEffect(() => {
    console.log('👥 UsersManagement: Users state changed:', {
      usersCount: users?.length || 0,
      users: users,
      loading: loading
    })

    // Debug: Check image data for first few users
    if (users && users.length > 0) {
      console.log(
        '🖼️ Image data sample from first 3 users:',
        users.slice(0, 3).map(u => ({
          id: u.id,
          name: u.name,
          mainImage: u.mainImage,
          image: u.image,
          images: u.images,
          externalAvatarUrl: u.externalAvatarUrl,
          hasImages: u.images?.length > 0
        }))
      )
    }

    // Make users data available for debugging
    if (typeof window !== 'undefined') {
      window.__USERS_DEBUG_DATA = users
    }
  }, [users, loading])

  // ========================================
  // CONFIGURACIÓN DE COLUMNAS Y FILTROS
  // ========================================

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return USER_COLUMNS
    return USER_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = useUserFiltering(users, currentUser)

  // Usar paginación del backend
  const pages = usersPagination.totalPages || 1
  const totalItems = usersPagination.totalElements || 0

  // Los items ya vienen filtrados del backend, solo aplicamos filtro de permisos local
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, filteredItems])

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(
    async user => {
      try {
        // Obtener datos completos del usuario
        const fullUserData = await getUserByEmail(user.email)

        // Mapear los datos recibidos al formato esperado por el formulario
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
        console.error('Error al obtener datos completos del usuario:', error)
        // Fallback a datos básicos si falla la llamada
        setSelectedUser(user)
        setIsEditModalOpen(true)
      }
    },
    [getUserByEmail]
  )

  const handleOpenDeleteModal = useCallback(user => {
    if (!user || !user.email) {
      console.error('Error: Datos de usuario incompletos', user)
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
  }, [])

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleSuccess = useCallback(() => {
    console.log('Operación exitosa, actualizando lista de usuarios')
    refreshUsers(page - 1, rowsPerPage, debouncedFilter)
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [refreshUsers, page, rowsPerPage, debouncedFilter])

  // ========================================
  // RENDERIZADO DE CELDAS
  // ========================================

  const renderCell = useCallback(
    (user, columnKey) => (
      <UserTableCell
        user={user}
        columnKey={columnKey}
        currentUser={currentUser}
        onEdit={() => handleOpenEditModal(user)}
        onDelete={() => handleOpenDeleteModal(user)}
      />
    ),
    [currentUser, handleOpenEditModal, handleOpenDeleteModal]
  )

  // ========================================
  // MANEJADORES DE PAGINACIÓN Y BÚSQUEDA
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
    setPage(1) // Reset a la primera página cuando se busca
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  // Función para determinar si una fila se puede seleccionar
  const isRowSelectable = useCallback(
    item => {
      // El usuario actual no se puede seleccionar
      const canSelect = item.email !== currentUser?.email
      if (!canSelect) {
        console.log(`🚫 User ${item.email} (ID: ${item.id}) is NOT selectable (current user)`)
      }
      return canSelect
    },
    [currentUser?.email]
  )

  // ========================================
  // CONTENIDO DE LA TABLA
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
        loading={loading}
        error={null}
        totalItems={totalItems}
        itemsLabel="usuarios"
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    ),
    [filterValue, onClear, onSearchChange, visibleColumns, handleOpenCreateModal, loading, rowsPerPage, onRowsPerPageChange, totalItems]
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

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const userStats = useUserStats(users)

  // Calcular las claves deshabilitadas (usuarios que no se pueden seleccionar)
  const disabledKeys = useMemo(() => {
    const disabled = filteredItems.filter(user => !isRowSelectable(user)).map(user => String(user.id))
    console.log('🚫 Disabled keys for selection:', disabled)
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

        {/* Estadísticas */}
        <UserStatsCards userStats={userStats} />
      </div>

      {/* Tabla de usuarios */}
      <Table
        isHeaderSticky
        aria-label="Tabla de Usuarios"
        className="w-full"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectedKeys={selectedKeys}
        disabledKeys={disabledKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}>
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'} allowsSorting={column.uid !== 'actions'}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          emptyContent={loading ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
          loadingContent={<div>Cargando usuarios...</div>}
          loadingState={loading ? 'loading' : 'idle'}>
          {item => <TableRow key={String(item.id)}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>

      {/* Modales */}
      <CrearUserForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} />

      {selectedUser && (
        <EditarUserForm isOpen={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} userData={selectedUser} />
      )}

      {selectedUser && (
        <DeleteUserModal isOpen={isDeleteModalOpen} onClose={handleCloseModals} onSuccess={handleSuccess} userData={selectedUser} />
      )}
    </div>
  )
})

UsersManagement.displayName = 'UsersManagement'

export default UsersManagement
