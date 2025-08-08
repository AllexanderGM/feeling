import { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip } from '@heroui/react'
import { useAuth } from '@context/AuthContext.jsx'
import { getAllUsers, getUserByEmail } from '@services'
import { Logger } from '@utils/logger.js'

import GenericTableControls from './ui/GenericTableControls.jsx'
import TableActionCell from './ui/TableActionCell.jsx'
import TablePagination from './ui/TablePagination.jsx'
import CrearUserForm from '../pages/user/management/components/CrearUserForm.js'
import EditarUserForm from '../pages/user/management/components/EditarUserForm.js'
import DeleteUserModal from '../pages/user/management/components/DeleteUserModal.jsx'
import { USER_ROLES, USER_ROLE_COLORS, USER_COLUMNS } from '../constants/tableConstants.js'

const TableUsers = () => {
  const [users, setUsers] = useState([])
  const { user: currentUser } = useAuth()

  const [filterValue, setFilterValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(USER_COLUMNS.map(col => col.uid)))
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return USER_COLUMNS
    return USER_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  const filteredItems = useMemo(() => {
    let filteredUsers = users.filter(user => {
      // El usuario actual nunca debe verse a sí mismo
      if (user.email === currentUser?.email) return false

      // Si es superadmin, ve a todos excepto a sí mismo
      if (currentUser?.isSuperAdmin) return true

      // Si es admin regular: Solo ve a clientes regulares
      if (currentUser?.isAdmin) {
        return user.role !== USER_ROLES.ADMIN && user.email !== 'admin@admin.com'
      }

      return false
    })

    // Luego aplicamos el filtro de búsqueda si existe
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        user =>
          (`${user.name} ${user.lastName}`.toLowerCase() || '').includes(filterValue.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(filterValue.toLowerCase()) ||
          (user.role?.toLowerCase() || '').includes(filterValue.toLowerCase())
      )
    }

    return filteredUsers
  }, [users, filterValue, hasSearchFilter, currentUser])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column] || ''
      const second = b[sortDescriptor.column] || ''
      const cmp = first < second ? -1 : first > second ? 1 : 0
      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      Logger.error('Error al cargar usuarios', Logger.CATEGORIES.SERVICE, { error: error.message, stack: error.stack })
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(async user => {
    try {
      // Obtener datos completos del usuario
      const fullUserData = await getUserByEmail(user.email)
      Logger.debug('Datos completos del usuario obtenidos', Logger.CATEGORIES.SERVICE, {
        userId: fullUserData.id,
        email: fullUserData.email
      })

      // Mapear los datos recibidos al formato esperado por el formulario
      const mappedUserData = {
        id: fullUserData.id,
        image: fullUserData.image || '',
        name: fullUserData.name || '',
        lastName: fullUserData.lastName || '',
        document: user.document || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        email: fullUserData.email,
        password: '',
        confirmPassword: '',
        address: user.address || '',
        city: user.city || '',
        role: fullUserData.role
      }

      Logger.debug('Datos del usuario mapeados para edición', Logger.CATEGORIES.UI, { userId: mappedUserData.id })
      setSelectedUser(mappedUserData)
      setIsEditModalOpen(true)
    } catch (error) {
      Logger.error('Error al obtener datos completos del usuario', Logger.CATEGORIES.SERVICE, {
        userEmail: user?.email,
        error: error.message
      })
      // Fallback a datos básicos si falla la llamada
      setSelectedUser(user)
      setIsEditModalOpen(true)
    }
  }, [])

  const handleOpenDeleteModal = useCallback(user => {
    // Asegurarnos de que tenemos la información correcta del usuario
    if (!user || !user.email) {
      Logger.error('Datos de usuario incompletos para eliminación', Logger.CATEGORIES.USER, { user })
      return
    }

    Logger.info('Abriendo modal de eliminación de usuario', Logger.CATEGORIES.UI, { userEmail: user.email, userId: user.id })
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
    Logger.info('Operación de usuario exitosa, actualizando lista', Logger.CATEGORIES.USER)
    fetchUsers()
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [fetchUsers])

  const renderCell = useCallback(
    (user, columnKey) => {
      const cellValue = user[columnKey]

      switch (columnKey) {
        case 'name':
          return (
            <User
              avatarProps={{
                radius: 'lg',
                src: user.image || 'https://i.pravatar.cc/150',
                alt: `${user.username} || Usuario`
              }}
              name={`${user.username}` || 'Usuario'}
            />
          )
        case 'role':
          return (
            <Chip className='capitalize' color={USER_ROLE_COLORS[user.role] || 'default'} size='sm' variant='flat'>
              {user.role?.toLowerCase() || 'user'}
            </Chip>
          )
        case 'actions': {
          const canEdit = currentUser?.isSuperAdmin || user.role !== USER_ROLES.ADMIN
          const canDelete = currentUser?.isSuperAdmin || (user.role !== USER_ROLES.ADMIN && user.email !== currentUser?.email)

          return (
            <TableActionCell
              item={user}
              onEdit={canEdit ? () => handleOpenEditModal(user) : null}
              onDelete={canDelete ? () => handleOpenDeleteModal(user) : null}
              editTooltip={!canEdit ? 'No tienes permisos para editar administradores' : 'Editar'}
              deleteTooltip={!canDelete ? 'No puedes eliminar este usuario' : 'Eliminar'}
            />
          )
        }
        default:
          return cellValue || ''
      }
    },
    [currentUser, handleOpenEditModal, handleOpenDeleteModal]
  )

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
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  const topContent = useMemo(
    () => (
      <GenericTableControls
        filterValue={filterValue}
        onClear={onClear}
        onSearchChange={onSearchChange}
        filterPlaceholder='Buscar por nombre o email...'
        columns={USER_COLUMNS}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        onCreateItem={handleOpenCreateModal}
        createButtonLabel='Crear Usuario'
        loading={loading}
        error={error}
        totalItems={users.length}
        itemsLabel='usuarios'
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    ),
    [
      filterValue,
      onClear,
      onSearchChange,
      visibleColumns,
      handleOpenCreateModal,
      loading,
      error,
      users.length,
      rowsPerPage,
      onRowsPerPageChange
    ]
  )

  const bottomContent = useMemo(
    () => (
      <TablePagination
        selectedKeys={selectedKeys}
        filteredItemsLength={filteredItems.length}
        page={page}
        pages={pages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageChange={setPage}
      />
    ),
    [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage]
  )

  return (
    <>
      <Table
        isHeaderSticky
        aria-label='Tabla de Usuarios'
        className='w-full max-w-6xl mt-6'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        selectedKeys={selectedKeys}
        selectionMode='multiple'
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
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
          emptyContent={loading ? 'Cargando...' : error ? 'Error al cargar usuarios' : 'No se encontraron usuarios'}
          loadingContent={<div>Cargando usuarios...</div>}
          loadingState={loading ? 'loading' : 'idle'}>
          {item => <TableRow key={item.id}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
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
    </>
  )
}

export default TableUsers
