import { useCallback, useState, useEffect, memo } from 'react'
import { Tabs, Tab, Chip, Avatar } from '@heroui/react'
import { Users, Clock, UserX, ShieldAlert, UserCheck, UserMinus, UserIcon } from 'lucide-react'
import { useAuth, useUser, useUserAnalytics, useError } from '@hooks'
import { Logger } from '@utils/logger.js'
import { DEFAULT_ROWS_PER_PAGE } from '@constants/tableConstants.js'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate, calculateAgeFromJavaDate } from '@utils/dateUtils.js'

import GenericDataTable from '@components/common/GenericDataTable.jsx'
import GenericTableActions from '@components/common/GenericTableActions.jsx'
import useTableActions from '@hooks/table/useTableActions.js'

// Importar componentes de gestión de usuarios (modales)
import CreateUserForm from '../user/management/components/CreateUserForm.jsx'
import EditUserForm from '../user/management/components/EditUserForm.jsx'
import DeleteUserModal from '../user/management/components/DeleteUserModal.jsx'
import AdminUserModals from './components/AdminUserModals.jsx'

// Mapeo de tipos de usuario a columnas (igual que el original)
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

const UserTableTest = memo(() => {
  const { user: currentUser } = useAuth()
  const { overview, getUserOverview } = useUserAnalytics()
  const { handleError, handleSuccess } = useError()
  const [selectedUserTab, setSelectedUserTab] = useState('active')

  // Obtener acciones predefinidas del hook
  const { viewAction, editAction, emailAction, approveAction, rejectAction, activateAction, deactivateAction, deleteAction } =
    useTableActions()

  // Estados para el manejo de usuarios
  const {
    usersByStatus,
    usersPagination,
    getUsersByStatus,
    approveUser,
    rejectUser,
    sendEmailToUser,
    deactivateUserAccount,
    reactivateUserAccount,
    loading
  } = useUser()

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Estados para modales de administración
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [selectedAdminUser, setSelectedAdminUser] = useState(null)

  // Estados para las tablas (simplificado para la demo)
  const [searchQueries, setSearchQueries] = useState({
    active: '',
    pending: '',
    incomplete: '',
    unverified: '',
    nonApproved: '',
    deactivated: ''
  })

  // Estados de página local para evitar conflictos
  const [currentPages, setCurrentPages] = useState({
    active: 1,
    pending: 1,
    incomplete: 1,
    unverified: 1,
    nonApproved: 1,
    deactivated: 1
  })

  // Estado de loading por tabla
  const [tableLoading, setTableLoading] = useState({
    active: false,
    pending: false,
    incomplete: false,
    unverified: false,
    nonApproved: false,
    deactivated: false
  })

  // Cargar overview y primera tab al montar el componente
  useEffect(() => {
    getUserOverview()
    getUsersByStatus('active', 'active', 0, DEFAULT_ROWS_PER_PAGE, '')
  }, [])

  // Cargar datos cuando cambie la pestaña de usuarios seleccionada (lazy loading)
  useEffect(() => {
    const userTabs = ['active', 'pending', 'incomplete', 'unverified', 'nonApproved', 'deactivated']
    if (userTabs.includes(selectedUserTab)) {
      const currentUsers = usersByStatus[selectedUserTab]
      if (!currentUsers || currentUsers.length === 0) {
        const backendStatus = getBackendStatusName(selectedUserTab)
        getUsersByStatus(backendStatus, selectedUserTab, 0, DEFAULT_ROWS_PER_PAGE, '')
      }
    }
  }, [selectedUserTab, getUsersByStatus, usersByStatus])

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

  // Función helper para obtener datos de usuario por tipo
  const getUsersData = useCallback(
    tableType => {
      const users = usersByStatus[tableType] || []
      const pagination = usersPagination[tableType] || null
      return { users, pagination }
    },
    [usersByStatus, usersPagination]
  )

  // Handlers para modales
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleOpenEditModal = useCallback(user => {
    setSelectedUser({
      id: user.id,
      name: user.profile?.name || '',
      lastName: user.profile?.lastName || '',
      email: user.profile?.email,
      role: user.status?.role
    })
    setIsEditModalOpen(true)
  }, [])

  const handleOpenDeleteModal = useCallback(user => {
    setSelectedUser({
      id: user.id,
      name: user.profile?.name || '',
      lastName: user.profile?.lastName || '',
      role: user.status?.role
    })
    setIsDeleteModalOpen(true)
  }, [])

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }, [])

  const handleCloseAdminModals = useCallback(() => {
    setIsViewModalOpen(false)
    setIsEmailModalOpen(false)
    setIsRejectModalOpen(false)
    setIsDeactivateModalOpen(false)
    setSelectedAdminUser(null)
  }, [])

  // Handlers para modales de administración
  const handleOpenViewModal = useCallback(user => {
    setSelectedAdminUser(user)
    setIsViewModalOpen(true)
  }, [])

  const handleOpenEmailModal = useCallback(user => {
    setSelectedAdminUser(user)
    setIsEmailModalOpen(true)
  }, [])

  const handleOpenRejectModal = useCallback(user => {
    setSelectedAdminUser(user)
    setIsRejectModalOpen(true)
  }, [])

  const handleOpenDeactivateModal = useCallback(user => {
    setSelectedAdminUser(user)
    setIsDeactivateModalOpen(true)
  }, [])

  const handleOperationSuccess = useCallback(() => {
    Logger.info('Operation successful, updating user lists', { category: Logger.CATEGORIES.USER })

    // Refrescar las listas de usuarios
    const refreshAllTables = () => {
      Object.keys(searchQueries).forEach(tableType => {
        const backendStatus = getBackendStatusName(tableType)
        getUsersByStatus(backendStatus, tableType, 0, DEFAULT_ROWS_PER_PAGE, searchQueries[tableType] || '')
      })
    }

    refreshAllTables()
    getUserOverview()
    handleCloseModals()
    handleCloseAdminModals()
  }, [searchQueries, getUsersByStatus, getBackendStatusName, getUserOverview, handleCloseModals, handleCloseAdminModals])

  // Funciones adicionales para gestión de usuarios
  const handleDeactivateUser = useCallback(
    async userId => {
      try {
        await deactivateUserAccount(userId, 'Desactivado por administrador')
        handleSuccess?.('Usuario desactivado exitosamente')
        handleOperationSuccess()
      } catch (error) {
        handleError?.('Error al desactivar usuario')
      }
    },
    [deactivateUserAccount, handleSuccess, handleError, handleOperationSuccess]
  )

  const handleReactivateUser = useCallback(
    async userId => {
      try {
        await reactivateUserAccount(userId)
        handleSuccess?.('Usuario reactivado exitosamente')
        handleOperationSuccess()
      } catch (error) {
        handleError?.('Error al reactivar usuario')
      }
    },
    [reactivateUserAccount, handleSuccess, handleError, handleOperationSuccess]
  )

  // Helper function para calcular edad (como en el original)
  const calculateAge = birthDate => {
    if (!birthDate) return 'N/A'
    try {
      return calculateAgeFromJavaDate(birthDate)
    } catch (error) {
      return 'N/A'
    }
  }

  // Función de renderizado de celdas - copiada exactamente de UnifiedUserTable.jsx y adaptada para estructura anidada
  const renderCell = useCallback(
    (user, columnKey) => {
      const cellValue = user[columnKey]

      switch (columnKey) {
        case 'user':
        case 'name':
          const hasImage =
            user.profile?.mainImage ||
            user.profile?.image ||
            (user.profile?.images && user.profile.images[0]) ||
            user.auth?.externalAvatarUrl
          const isCurrentUser = user.profile?.email === currentUser?.email

          return (
            <div className='flex items-center gap-3'>
              {hasImage ? (
                <Avatar
                  radius='lg'
                  src={hasImage}
                  alt={`${user.profile?.name || 'Usuario'}`}
                  className='w-10 h-10'
                  onError={() => {
                    // Imagen de placeholder fallará silenciosamente
                  }}
                />
              ) : (
                <Avatar radius='lg' className='w-10 h-10 bg-default-100' icon={<UserIcon className='w-6 h-6 text-default-500' />} />
              )}
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-semibold text-foreground'>
                    {`${user.profile?.name || 'Usuario'} ${user.profile?.lastName || ''}`.trim()}
                  </p>
                  {isCurrentUser && (
                    <Chip size='sm' color='primary' variant='flat'>
                      Tú
                    </Chip>
                  )}
                </div>
                <p className='text-xs text-default-500'>{user.profile?.email}</p>
              </div>
            </div>
          )
        case 'age':
          const age = calculateAge(user.profile?.dateOfBirth || user.profile?.birthDate)
          return (
            <div className='flex flex-col items-center'>
              <span className='text-sm font-semibold text-foreground'>{age !== 'N/A' ? `${age}` : 'N/A'}</span>
              <p className='text-xs text-default-500'>años</p>
            </div>
          )
        case 'location':
          return (
            <div className='flex flex-col'>
              <p className='text-bold text-sm'>{user.profile?.country || 'No especificado'}</p>
              <p className='text-bold text-sm text-default-400'>{user.profile?.city || ''}</p>
              {user.profile?.locality && <p className='text-sm text-default-400'>{user.profile.locality}</p>}
            </div>
          )
        case 'categoryInterest':
          return (
            <Chip className='capitalize' color={USER_INTEREST_COLORS[user.profile?.categoryInterest] || 'default'} size='sm' variant='flat'>
              {user.profile?.categoryInterest || 'No especificado'}
            </Chip>
          )
        case 'matches':
          return (
            <div className='flex flex-col items-center'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-primary-500'></div>
                <span className='text-sm font-semibold text-foreground'>
                  {user.metrics?.matchesAvailable !== undefined ? user.metrics.matchesAvailable : 'N/A'}
                </span>
              </div>
              <p className='text-xs text-default-500'>disponibles</p>
            </div>
          )
        case 'profileCompleteness':
          const completeness = user.metrics?.profileCompleteness || 0
          const getColor = percentage => {
            if (percentage >= 80) return 'success'
            if (percentage >= 60) return 'warning'
            if (percentage >= 40) return 'primary'
            return 'danger'
          }

          return (
            <div className='flex flex-col items-center gap-1'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-2 bg-default-200 rounded-full overflow-hidden'>
                  <div
                    className={`h-full transition-all duration-300 ${
                      completeness >= 80
                        ? 'bg-success-500'
                        : completeness >= 60
                          ? 'bg-warning-500'
                          : completeness >= 40
                            ? 'bg-primary-500'
                            : 'bg-danger-500'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className='text-xs font-semibold text-foreground'>{completeness}%</span>
              </div>
              <Chip size='sm' variant='flat' color={getColor(completeness)} className='text-xs'>
                {completeness >= 80 ? 'Completo' : completeness >= 60 ? 'Bueno' : completeness >= 40 ? 'Regular' : 'Incompleto'}
              </Chip>
            </div>
          )
        case 'verified':
          return (
            <Chip className='capitalize' color={user.status?.verified ? 'success' : 'warning'} size='sm' variant='flat'>
              {user.status?.verified ? 'Verificado' : 'Pendiente'}
            </Chip>
          )
        case 'profileComplete':
          return (
            <Chip className='capitalize' color={user.status?.profileComplete ? 'success' : 'warning'} size='sm' variant='flat'>
              {user.status?.profileComplete ? 'Completo' : 'Incompleto'}
            </Chip>
          )
        case 'role':
          return (
            <Chip className='capitalize' color={USER_ROLE_COLORS[user.status?.role] || 'default'} size='sm' variant='flat'>
              {user.status?.role?.toLowerCase() || 'client'}
            </Chip>
          )
        case 'authProvider':
          const authProviderColors = {
            LOCAL: 'secondary',
            GOOGLE: 'success',
            FACEBOOK: 'primary'
          }
          const authProviderLabels = {
            LOCAL: 'Local',
            GOOGLE: 'Google',
            FACEBOOK: 'Facebook'
          }
          return (
            <Chip className='capitalize' color={authProviderColors[user.auth?.userAuthProvider] || 'default'} size='sm' variant='flat'>
              {authProviderLabels[user.auth?.userAuthProvider] || user.auth?.userAuthProvider || 'Local'}
            </Chip>
          )
        case 'createdAt':
          const createdDate = user.status?.createdAt || user.status?.registeredAt
          const formattedDate = formatJavaDateForDisplay(createdDate)
          const daysSince = daysSinceJavaDate(createdDate)
          return (
            <div className='flex flex-col'>
              <p className='text-sm font-semibold text-foreground'>{formattedDate}</p>
              <p className='text-xs text-default-500'>{daysSince !== null ? `${daysSince} días` : ''}</p>
            </div>
          )
        case 'phone':
          return (
            <div className='flex flex-col'>
              <p className='text-sm font-semibold text-foreground'>
                {user.profile?.phone ? `${user.profile.phoneCode || ''} ${user.profile.phone}`.trim() : 'No especificado'}
              </p>
            </div>
          )
        case 'actions':
          // ÚNICO CAMBIO: Usar GenericTableActions en lugar de botones inline
          return (
            <GenericTableActions
              actions={getActionsForUserType(selectedUserTab, user)}
              item={user}
              loading={loading}
              size='sm'
              tableId={`user-table-${selectedUserTab}`}
            />
          )
        default:
          return cellValue || 'N/A'
      }
    },
    [selectedUserTab, loading, calculateAge, currentUser]
  )

  // Función para obtener acciones según el tipo de usuario (usando acciones predefinidas)
  const getActionsForUserType = useCallback(
    (userType, user) => {
      const isCurrentUser = user.profile?.email === currentUser?.email

      if (isCurrentUser) {
        return [
          {
            key: 'current-user',
            label: 'Tu cuenta',
            tooltip: 'Esta es tu cuenta actual',
            isDisabled: () => true,
            onClick: () => {},
            className: 'text-gray-400'
          }
        ]
      }

      // Acciones base para todos los usuarios
      const baseActions = [
        viewAction({
          tooltip: 'Ver perfil completo',
          onClick: item => handleOpenViewModal(item)
        }),
        editAction({
          tooltip: 'Editar usuario',
          onClick: item => handleOpenEditModal(item)
        }),
        emailAction({
          tooltip: 'Enviar correo al usuario',
          onClick: item => handleOpenEmailModal(item)
        })
      ]

      switch (userType) {
        case 'active':
          return [
            ...baseActions,
            rejectAction({
              tooltip: 'Desaprobar usuario',
              onClick: item => handleOpenRejectModal(item)
            }),
            deactivateAction({
              tooltip: 'Desactivar usuario',
              onClick: item => handleOpenDeactivateModal(item)
            })
          ]

        case 'pending':
          return [
            ...baseActions,
            approveAction({
              tooltip: 'Aprobar usuario',
              onClick: async item => {
                await approveUser(item.id)
                handleSuccess('Usuario aprobado exitosamente')
                handleOperationSuccess()
              }
            }),
            rejectAction({
              tooltip: 'Rechazar usuario',
              onClick: item => handleOpenRejectModal(item)
            })
          ]

        case 'incomplete':
          return [
            ...baseActions,
            deactivateAction({
              tooltip: 'Desactivar usuario',
              onClick: item => handleOpenDeactivateModal(item)
            }),
            deleteAction({
              tooltip: 'Eliminar usuario',
              onClick: item => handleOpenDeleteModal(item)
            })
          ]

        case 'unverified':
          return [
            ...baseActions,
            deactivateAction({
              tooltip: 'Desactivar usuario',
              onClick: item => handleOpenDeactivateModal(item)
            }),
            deleteAction({
              tooltip: 'Eliminar usuario',
              onClick: item => handleOpenDeleteModal(item)
            })
          ]

        case 'nonApproved':
          return [
            ...baseActions,
            approveAction({
              onClick: async item => {
                await approveUser(item.id)
                handleSuccess('Usuario aprobado exitosamente')
                handleOperationSuccess()
              }
            }),
            deactivateAction({
              tooltip: 'Desactivar usuario',
              onClick: item => handleOpenDeactivateModal(item)
            }),
            deleteAction({
              tooltip: 'Eliminar usuario',
              onClick: item => handleOpenDeleteModal(item)
            })
          ]

        case 'deactivated':
          return [
            ...baseActions,
            activateAction({
              tooltip: 'Reactivar usuario',
              onClick: item => handleReactivateUser(item.id)
            }),
            deleteAction({
              onClick: item => handleOpenDeleteModal(item)
            })
          ]

        default:
          return baseActions
      }
    },
    [
      currentUser,
      viewAction,
      editAction,
      emailAction,
      approveAction,
      rejectAction,
      activateAction,
      deactivateAction,
      deleteAction,
      handleOpenViewModal,
      handleOpenEditModal,
      handleOpenEmailModal,
      handleOpenRejectModal,
      handleOpenDeactivateModal,
      handleOpenDeleteModal,
      approveUser,
      handleReactivateUser,
      handleSuccess,
      handleOperationSuccess
    ]
  )

  // Función para obtener placeholder de búsqueda específico
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

  // Handlers simplificados para la tabla genérica
  const handleSearch = useCallback(
    searchQuery => {
      setSearchQueries(prev => ({
        ...prev,
        [selectedUserTab]: searchQuery
      }))

      // Resetear página a 1 cuando se busca
      setCurrentPages(prev => ({
        ...prev,
        [selectedUserTab]: 1
      }))

      setTableLoading(prev => ({
        ...prev,
        [selectedUserTab]: true
      }))

      const backendStatus = getBackendStatusName(selectedUserTab)
      getUsersByStatus(backendStatus, selectedUserTab, 0, DEFAULT_ROWS_PER_PAGE, searchQuery).finally(() => {
        setTableLoading(prev => ({
          ...prev,
          [selectedUserTab]: false
        }))
      })
    },
    [selectedUserTab, getBackendStatusName, getUsersByStatus]
  )

  const handleRefresh = useCallback(() => {
    setTableLoading(prev => ({
      ...prev,
      [selectedUserTab]: true
    }))

    const backendStatus = getBackendStatusName(selectedUserTab)
    const currentPage = currentPages[selectedUserTab] || 1
    getUsersByStatus(backendStatus, selectedUserTab, currentPage - 1, DEFAULT_ROWS_PER_PAGE, searchQueries[selectedUserTab] || '').finally(
      () => {
        setTableLoading(prev => ({
          ...prev,
          [selectedUserTab]: false
        }))
      }
    )
  }, [selectedUserTab, getBackendStatusName, getUsersByStatus, searchQueries, currentPages])

  const handlePageChange = useCallback(
    page => {
      // Actualizar estado local inmediatamente
      setCurrentPages(prev => ({
        ...prev,
        [selectedUserTab]: page
      }))

      setTableLoading(prev => ({
        ...prev,
        [selectedUserTab]: true
      }))

      const backendStatus = getBackendStatusName(selectedUserTab)
      getUsersByStatus(backendStatus, selectedUserTab, page - 1, DEFAULT_ROWS_PER_PAGE, searchQueries[selectedUserTab] || '').finally(
        () => {
          setTableLoading(prev => ({
            ...prev,
            [selectedUserTab]: false
          }))
        }
      )
    },
    [selectedUserTab, getBackendStatusName, getUsersByStatus, searchQueries]
  )

  const handleRowsPerPageChange = useCallback(
    size => {
      // Resetear página a 1 cuando cambia el tamaño
      setCurrentPages(prev => ({
        ...prev,
        [selectedUserTab]: 1
      }))

      setTableLoading(prev => ({
        ...prev,
        [selectedUserTab]: true
      }))

      const backendStatus = getBackendStatusName(selectedUserTab)
      getUsersByStatus(backendStatus, selectedUserTab, 0, size, searchQueries[selectedUserTab] || '').finally(() => {
        setTableLoading(prev => ({
          ...prev,
          [selectedUserTab]: false
        }))
      })
    },
    [selectedUserTab, getBackendStatusName, getUsersByStatus, searchQueries]
  )

  // Renderizar tabla de usuarios usando GenericDataTable
  const renderUserTable = useCallback(
    userType => {
      const { users: currentUsers, pagination: currentPagination } = getUsersData(userType)
      console.log(currentUsers)

      const allColumns = USER_TYPE_COLUMNS[userType] || []

      // Crear paginación local con la página actual del estado local
      const localPagination = currentPagination
        ? {
            ...currentPagination,
            page: currentPages[userType] || 1
          }
        : null

      return (
        <GenericDataTable
          data={currentUsers || []}
          columns={allColumns}
          pagination={localPagination}
          loading={tableLoading[userType] || loading}
          loadingMessage='Cargando usuarios...'
          emptyMessage={`No hay usuarios ${userType} para mostrar.`}
          renderCell={renderCell}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onCreate={userType === 'active' ? handleOpenCreateModal : undefined}
          createButtonLabel='Crear Usuario'
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          searchPlaceholder={getSearchPlaceholder(userType)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          showColumnSelector={true}
          showRowsPerPage={true}
          showCreateButton={userType === 'active'}
          showRefreshButton={true}
          showSearch={true}
          showPagination={true}
          enableSelection={false}
          getItemKey={item => `user-${item.id}`}
          tableId={`user-table-${userType}`}
        />
      )
    },
    [
      getUsersData,
      loading,
      renderCell,
      handleSearch,
      handleRefresh,
      handleOpenCreateModal,
      handlePageChange,
      handleRowsPerPageChange,
      getSearchPlaceholder,
      currentPages,
      tableLoading
    ]
  )

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-200'>Prueba de Tabla Genérica - Usuarios</h1>
        <p className='text-gray-400'>Demostración de GenericDataTable usando datos reales con GenericTableActions</p>
      </div>

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
                {overview.active > 0 && <span className='text-xs text-success-600 font-medium'>{overview.active}</span>}
              </div>
            }>
            {selectedUserTab === 'active' && <div className='py-4'>{renderUserTable('active')}</div>}
          </Tab>

          {/* Usuarios Pendientes */}
          <Tab
            key='pending'
            title={
              <div className='flex items-center space-x-2'>
                <Clock className='w-4 h-4' />
                <span>Pendientes</span>
                {overview?.pending > 0 && <span className='text-xs text-warning-600 font-medium'>{overview.pending}</span>}
              </div>
            }>
            {selectedUserTab === 'pending' && <div className='py-4'>{renderUserTable('pending')}</div>}
          </Tab>

          {/* Usuarios Incompletos */}
          <Tab
            key='incomplete'
            title={
              <div className='flex items-center space-x-2'>
                <UserCheck className='w-4 h-4' />
                <span>Incompletos</span>
                {overview.incomplete > 0 && <span className='text-xs text-primary-600 font-medium'>{overview.incomplete}</span>}
              </div>
            }>
            {selectedUserTab === 'incomplete' && <div className='py-4'>{renderUserTable('incomplete')}</div>}
          </Tab>

          {/* Usuarios Sin Verificar */}
          <Tab
            key='unverified'
            title={
              <div className='flex items-center space-x-2'>
                <ShieldAlert className='w-4 h-4' />
                <span>Sin Verificar</span>
                {overview.unverified > 0 && <span className='text-xs text-secondary-600 font-medium'>{overview.unverified}</span>}
              </div>
            }>
            {selectedUserTab === 'unverified' && <div className='py-4'>{renderUserTable('unverified')}</div>}
          </Tab>

          {/* Usuarios No Aprobados */}
          <Tab
            key='nonApproved'
            title={
              <div className='flex items-center space-x-2'>
                <UserX className='w-4 h-4' />
                <span>No Aprobados</span>
                {overview.rejected > 0 && <span className='text-xs text-danger-600 font-medium'>{overview.rejected}</span>}
              </div>
            }>
            {selectedUserTab === 'nonApproved' && <div className='py-4'>{renderUserTable('nonApproved')}</div>}
          </Tab>

          {/* Usuarios Desactivados */}
          <Tab
            key='deactivated'
            title={
              <div className='flex items-center space-x-2'>
                <UserMinus className='w-4 h-4' />
                <span>Desactivados</span>
                {overview.deactivated > 0 && <span className='text-xs text-danger-600 font-medium'>{overview.deactivated}</span>}
              </div>
            }>
            {selectedUserTab === 'deactivated' && <div className='py-4'>{renderUserTable('deactivated')}</div>}
          </Tab>
        </Tabs>
      </div>

      {/* Modales de gestión de usuarios */}
      {isCreateModalOpen && <CreateUserForm isOpen={isCreateModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} />}

      {isEditModalOpen && selectedUser && (
        <EditUserForm isOpen={isEditModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} user={selectedUser} />
      )}

      {isDeleteModalOpen && selectedUser && (
        <DeleteUserModal isOpen={isDeleteModalOpen} onClose={handleCloseModals} onSuccess={handleOperationSuccess} user={selectedUser} />
      )}

      {/* Modales de administración */}
      <AdminUserModals
        isViewModalOpen={isViewModalOpen}
        isEmailModalOpen={isEmailModalOpen}
        isRejectModalOpen={isRejectModalOpen}
        isDeactivateModalOpen={isDeactivateModalOpen}
        onCloseModals={handleCloseAdminModals}
        selectedUser={selectedAdminUser}
        onSendEmail={async (userId, emailData) => {
          await sendEmailToUser(userId, emailData)
          handleSuccess('Correo enviado exitosamente')
          handleOperationSuccess()
        }}
        onRejectUser={async (userId, reason) => {
          await rejectUser(userId, reason)
          handleSuccess('Usuario desaprobado exitosamente')
          handleOperationSuccess()
        }}
        onDeactivateUser={async (userId, reason) => {
          await deactivateUserAccount(userId, reason)
          handleSuccess('Usuario desactivado exitosamente')
          handleOperationSuccess()
        }}
        loading={loading}
      />
    </div>
  )
})

UserTableTest.displayName = 'UserTableTest'

export default UserTableTest
