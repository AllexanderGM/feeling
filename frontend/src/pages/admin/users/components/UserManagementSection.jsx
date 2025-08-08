import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Avatar,
  Link
} from '@heroui/react'
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Mail,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  UserPlus,
  Clock,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react'
import { userService, userAnalyticsService } from '@services'
import AdminDataTable from './AdminDataTable.jsx'
import { formatDateForDisplay } from '@utils/dateUtils.js'
import { Logger } from '@utils/logger.js'

/**
 * Sección de gestión de usuarios con todas las operaciones CRUD
 */
const UserManagementSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userStats, setUserStats] = useState({})

  // Estados para modales
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEmailOpen, onOpen: onEmailOpen, onClose: onEmailClose } = useDisclosure()

  // Estados para formularios
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' })

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { name: 'USUARIO', uid: 'user', sortable: true },
      { name: 'ESTADO', uid: 'status', sortable: true },
      { name: 'CATEGORÍA', uid: 'categoryInterest', sortable: true },
      { name: 'UBICACIÓN', uid: 'location', sortable: true },
      { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
      { name: 'ROL', uid: 'role', sortable: true },
      { name: 'ACCIONES', uid: 'actions' }
    ],
    []
  )

  // Opciones de estado
  const statusOptions = useMemo(
    () => [
      { key: 'all', label: 'Todos' },
      { key: 'active', label: 'Activos' },
      { key: 'pending-approval', label: 'Pendientes' },
      { key: 'unverified', label: 'No verificados' },
      { key: 'non-approved', label: 'No aprobados' },
      { key: 'deactivated', label: 'Desactivados' },
      { key: 'incomplete-profiles', label: 'Perfiles incompletos' }
    ],
    []
  )

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers()
    loadUserStats()
  }, [pagination.page, pagination.size, statusFilter])

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      let response
      if (statusFilter === 'all') {
        response = await userService.getAllUsers(pagination.page, pagination.size, searchValue)
      } else {
        response = await userService.getUsersByStatus(statusFilter, pagination.page, pagination.size)
      }

      setUsers(response.content || [])
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0
      }))
    } catch (error) {
      Logger.error('Error loading users:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, statusFilter, searchValue, onError])

  // Cargar estadísticas
  const loadUserStats = useCallback(async () => {
    try {
      const stats = await userAnalyticsService.getUserMetrics()
      setUserStats(stats)
    } catch (error) {
      Logger.error('Error loading user stats:', error, { category: Logger.CATEGORIES.USER })
    }
  }, [])

  // Renderizar celda
  const renderCell = useCallback((user, columnKey) => {
    switch (columnKey) {
      case 'user':
        return (
          <div className='flex items-center gap-3'>
            <Avatar src={user.profileImage?.url} name={user.displayName || user.firstName} size='sm' />
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{user.displayName || `${user.firstName} ${user.lastName}`.trim()}</span>
              <span className='text-xs text-default-500'>{user.email}</span>
            </div>
          </div>
        )

      case 'status':
        const statusColors = {
          ACTIVE: 'success',
          PENDING_APPROVAL: 'warning',
          UNVERIFIED: 'secondary',
          NON_APPROVED: 'danger',
          DEACTIVATED: 'default',
          INCOMPLETE_PROFILE: 'primary'
        }

        const statusLabels = {
          ACTIVE: 'Activo',
          PENDING_APPROVAL: 'Pendiente',
          UNVERIFIED: 'No verificado',
          NON_APPROVED: 'No aprobado',
          DEACTIVATED: 'Desactivado',
          INCOMPLETE_PROFILE: 'Incompleto'
        }

        return (
          <Chip color={statusColors[user.accountStatus] || 'default'} size='sm' variant='flat'>
            {statusLabels[user.accountStatus] || user.accountStatus}
          </Chip>
        )

      case 'categoryInterest':
        return (
          <Chip size='sm' variant='dot' color='secondary'>
            {user.categoryInterest || 'No definida'}
          </Chip>
        )

      case 'location':
        return (
          <div className='flex items-center gap-1'>
            <MapPin className='w-3 h-3 text-default-400' />
            <span className='text-sm'>{user.city || user.country || 'No especificada'}</span>
          </div>
        )

      case 'createdAt':
        return <span className='text-sm text-default-600'>{formatDateForDisplay(user.createdAt)}</span>

      case 'role':
        return (
          <Chip
            color={user.roles?.includes('ADMIN') ? 'danger' : 'default'}
            size='sm'
            variant='flat'
            startContent={user.roles?.includes('ADMIN') ? <Shield className='w-3 h-3' /> : null}>
            {user.roles?.includes('ADMIN') ? 'Admin' : 'Usuario'}
          </Chip>
        )

      default:
        return user[columnKey]?.toString() || '-'
    }
  }, [])

  // Renderizar acciones específicas por estado como botones individuales
  const renderActions = useCallback(user => {
    Logger.debug(
      'renderActions called for user',
      { userId: user.id, email: user.email, accountStatus: user.accountStatus, roles: user.roles },
      { category: Logger.CATEGORIES.UI }
    )

    const getActionsForStatus = status => {
      Logger.debug('Getting actions for status', { status }, { category: Logger.CATEGORIES.UI })
      switch (status) {
        case 'ACTIVE':
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'disapprove',
              label: 'Desaprobar perfil',
              icon: UserX,
              action: () => handleRejectUser(user),
              color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
            },
            {
              key: 'deactivate',
              label: 'Desactivar perfil',
              icon: UserX,
              action: () => handleDeactivateUser(user),
              color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            },
            {
              key: 'delete',
              label: 'Eliminar definitivamente',
              icon: Trash2,
              action: () => handleDeleteUser(user),
              color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
            }
          ]
        case 'PENDING_APPROVAL':
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'approve',
              label: 'Aprobar perfil',
              icon: UserCheck,
              action: () => handleApproveUser(user),
              color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
            },
            {
              key: 'disapprove',
              label: 'Desaprobar perfil',
              icon: UserX,
              action: () => handleRejectUser(user),
              color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
            }
          ]
        case 'INCOMPLETE_PROFILE':
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'deactivate',
              label: 'Desactivar cuenta',
              icon: UserX,
              action: () => handleDeactivateUser(user),
              color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            },
            {
              key: 'delete',
              label: 'Eliminar cuenta',
              icon: Trash2,
              action: () => handleDeleteUser(user),
              color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
            }
          ]
        case 'UNVERIFIED':
          return [
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'deactivate',
              label: 'Desactivar cuenta',
              icon: UserX,
              action: () => handleDeactivateUser(user),
              color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            },
            {
              key: 'delete',
              label: 'Eliminar cuenta',
              icon: Trash2,
              action: () => handleDeleteUser(user),
              color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
            }
          ]
        case 'NON_APPROVED':
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'approve',
              label: 'Aprobar cuenta',
              icon: UserCheck,
              action: () => handleApproveUser(user),
              color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
            },
            {
              key: 'deactivate',
              label: 'Desactivar cuenta',
              icon: UserX,
              action: () => handleDeactivateUser(user),
              color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            },
            {
              key: 'delete',
              label: 'Eliminar definitivamente',
              icon: Trash2,
              action: () => handleDeleteUser(user),
              color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
            }
          ]
        case 'DEACTIVATED':
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            },
            {
              key: 'activate',
              label: 'Activar cuenta',
              icon: UserCheck,
              action: () => handleReactivateUser(user),
              color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
            },
            {
              key: 'delete',
              label: 'Eliminar definitivamente',
              icon: Trash2,
              action: () => handleDeleteUser(user),
              color: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
            }
          ]
        default:
          return [
            {
              key: 'view',
              label: 'Ver perfil',
              icon: Eye,
              action: () => handleViewUser(user),
              color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
            },
            {
              key: 'email',
              label: 'Enviar correo electrónico',
              icon: Mail,
              action: () => handleSendEmail(user),
              color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
            }
          ]
      }
    }

    const actions = getActionsForStatus(user.accountStatus)
    Logger.debug('Actions determined for user', { userActions: actions.map(a => a.label) }, { category: Logger.CATEGORIES.UI })

    const isAdmin = user.roles?.includes('ADMIN')
    Logger.debug('User admin status check', { isAdmin }, { category: Logger.CATEGORIES.USER })

    return (
      <div className='flex items-center justify-center gap-2'>
        {actions.map(actionItem => {
          const IconComponent = actionItem.icon
          const isDisabled = isAdmin && ['delete', 'deactivate', 'disapprove'].includes(actionItem.key)
          const disabledTitle = isAdmin
            ? actionItem.key === 'delete'
              ? 'No tienes permisos para eliminar administradores'
              : ['deactivate', 'disapprove'].includes(actionItem.key)
                ? 'No tienes permisos para editar administradores'
                : actionItem.label
            : actionItem.label

          return (
            <Button
              key={actionItem.key}
              type='button'
              isIconOnly
              size='sm'
              variant='flat'
              title={isDisabled ? disabledTitle : actionItem.label}
              onPress={isDisabled ? undefined : actionItem.action}
              isDisabled={isDisabled}
              className={
                isDisabled
                  ? 'opacity-disabled pointer-events-none px-0 !gap-0 transition-transform-colors-opacity motion-reduce:transition-none min-w-8 w-8 h-8 data-[hover=true]:opacity-hover bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20'
                  : `px-0 !gap-0 transition-transform-colors-opacity motion-reduce:transition-none min-w-8 w-8 h-8 data-[hover=true]:opacity-hover ${actionItem.color}`
              }>
              <IconComponent className='w-4 h-4' />
            </Button>
          )
        })}
      </div>
    )
  }, [])

  // Handlers para acciones
  const handleViewUser = useCallback(
    user => {
      setSelectedUser(user)
      onViewOpen()
    },
    [onViewOpen]
  )

  const handleEditUser = useCallback(
    user => {
      setSelectedUser(user)
      onEditOpen()
    },
    [onEditOpen]
  )

  const handleDeleteUser = useCallback(
    user => {
      setSelectedUser(user)
      onDeleteOpen()
    },
    [onDeleteOpen]
  )

  const handleSendEmail = useCallback(
    user => {
      setSelectedUser(user)
      setEmailForm({ subject: '', message: '' })
      onEmailOpen()
    },
    [onEmailOpen]
  )

  const handleApproveUser = useCallback(
    async user => {
      try {
        await userService.approveUser(user.id)
        onSuccess?.('Usuario aprobado exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al aprobar usuario')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const handleRejectUser = useCallback(
    async user => {
      try {
        await userService.rejectUser(user.id)
        onSuccess?.('Usuario rechazado exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al rechazar usuario')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const handleDeactivateUser = useCallback(
    async user => {
      try {
        await userService.deactivateUser(user.id)
        onSuccess?.('Usuario desactivado exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al desactivar usuario')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const handleReactivateUser = useCallback(
    async user => {
      try {
        await userService.reactivateUser(user.id)
        onSuccess?.('Usuario reactivado exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al reactivar usuario')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const handleMakeAdmin = useCallback(
    async user => {
      try {
        await userService.assignAdmin(user.id)
        onSuccess?.('Rol de administrador asignado exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al asignar rol de administrador')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const handleRemoveAdmin = useCallback(
    async user => {
      try {
        await userService.revokeAdmin(user.id)
        onSuccess?.('Rol de administrador removido exitosamente')
        loadUsers()
      } catch (error) {
        onError?.('Error al remover rol de administrador')
      }
    },
    [onSuccess, onError, loadUsers]
  )

  const confirmDelete = useCallback(async () => {
    if (!selectedUser) return

    try {
      await userService.deleteUser(selectedUser.id)
      onSuccess?.('Usuario eliminado exitosamente')
      loadUsers()
      onDeleteClose()
    } catch (error) {
      onError?.('Error al eliminar usuario')
    }
  }, [selectedUser, onSuccess, onError, loadUsers, onDeleteClose])

  const handleSendEmailSubmit = useCallback(async () => {
    if (!selectedUser || !emailForm.subject || !emailForm.message) return

    try {
      await userService.sendEmail(selectedUser.id, emailForm)
      onSuccess?.('Email enviado exitosamente')
      onEmailClose()
    } catch (error) {
      onError?.('Error al enviar email')
    }
  }, [selectedUser, emailForm, onSuccess, onError, onEmailClose])

  // Filtros
  const filters = useMemo(
    () => [
      {
        label: statusOptions.find(opt => opt.key === statusFilter)?.label || 'Estado',
        options: statusOptions,
        onAction: key => setStatusFilter(key)
      }
    ],
    [statusFilter, statusOptions]
  )

  return (
    <div className='flex flex-col gap-6'>
      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <div className='p-3 bg-success-100 rounded-lg'>
              <Users className='h-6 w-6 text-success-600' />
            </div>
            <div>
              <p className='text-sm text-default-600'>Usuarios activos</p>
              <p className='text-2xl font-bold'>{userStats.activeUsers || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <div className='p-3 bg-warning-100 rounded-lg'>
              <Clock className='h-6 w-6 text-warning-600' />
            </div>
            <div>
              <p className='text-sm text-default-600'>Pendientes</p>
              <p className='text-2xl font-bold'>{userStats.pendingUsers || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <div className='p-3 bg-primary-100 rounded-lg'>
              <UserPlus className='h-6 w-6 text-primary-600' />
            </div>
            <div>
              <p className='text-sm text-default-600'>Incompletos</p>
              <p className='text-2xl font-bold'>{userStats.incompleteUsers || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='flex flex-row items-center gap-4'>
            <div className='p-3 bg-default-100 rounded-lg'>
              <UserX className='h-6 w-6 text-default-600' />
            </div>
            <div>
              <p className='text-sm text-default-600'>Desactivados</p>
              <p className='text-2xl font-bold'>{userStats.deactivatedUsers || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Table */}
      <AdminDataTable
        title='Gestión de Usuarios'
        description='Lista completa de usuarios del sistema con opciones de administración'
        data={users}
        columns={columns}
        loading={loading}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={loadUsers}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={size => setPagination(prev => ({ ...prev, size, page: 0 }))}
        renderCell={renderCell}
        renderActions={renderActions}
        enableSelection={true}
        enableSearch={true}
        enableFilters={true}
        filters={filters}
        searchPlaceholder='Buscar por nombre, email...'
        emptyMessage='No se encontraron usuarios'
      />

      {/* View User Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size='2xl' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader>Detalles del Usuario</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                  <Avatar src={selectedUser.profileImage?.url} name={selectedUser.displayName} size='lg' />
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`.trim()}
                    </h3>
                    <p className='text-default-600'>{selectedUser.email}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Estado</p>
                    <p className='text-sm text-default-600'>{selectedUser.accountStatus}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Categoría</p>
                    <p className='text-sm text-default-600'>{selectedUser.categoryInterest || 'No definida'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Teléfono</p>
                    <p className='text-sm text-default-600'>{selectedUser.phoneNumber || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Fecha de registro</p>
                    <p className='text-sm text-default-600'>{formatDateForDisplay(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onViewClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.displayName || selectedUser?.email}</strong>?
            </p>
            <p className='text-sm text-danger'>Esta acción no se puede deshacer.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onDeleteClose}>
              Cancelar
            </Button>
            <Button color='danger' onPress={confirmDelete}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Send Email Modal */}
      <Modal isOpen={isEmailOpen} onClose={onEmailClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Enviar Email a {selectedUser?.displayName || selectedUser?.email}</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Input
                label='Asunto'
                placeholder='Ingresa el asunto del email'
                value={emailForm.subject}
                onValueChange={value => setEmailForm(prev => ({ ...prev, subject: value }))}
              />
              <Textarea
                label='Mensaje'
                placeholder='Escribe tu mensaje aquí...'
                value={emailForm.message}
                onValueChange={value => setEmailForm(prev => ({ ...prev, message: value }))}
                minRows={6}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onEmailClose}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleSendEmailSubmit} isDisabled={!emailForm.subject || !emailForm.message}>
              Enviar Email
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default UserManagementSection
