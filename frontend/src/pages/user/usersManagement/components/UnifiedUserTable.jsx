import { useState, useCallback, useMemo, memo } from 'react'
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  CardHeader
} from '@heroui/react'
import { Check, X, Eye, UserIcon, Clock, AlertCircle } from 'lucide-react'
import { useError } from '@hooks/useError.js'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS, USER_COLUMNS } from '@constants/tableConstants.js'
import TableActionCell from '@components/ui/TableActionCell.jsx'

const UnifiedUserTable = memo(({ 
  users, 
  loading, 
  tableType = 'active', // 'active' or 'pending'
  // Props for active users table
  currentUser,
  onEdit,
  onDelete,
  selectedKeys,
  setSelectedKeys,
  disabledKeys,
  sortDescriptor,
  setSortDescriptor,
  topContent,
  bottomContent,
  // Props for pending users table
  onApprove,
  onReject,
  visibleColumns = new Set(USER_COLUMNS.map(col => col.uid))
}) => {
  const { handleError, handleSuccess } = useError()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user)
    onOpen()
  }, [onOpen])

  const handleApprove = useCallback(async (user) => {
    setActionLoading(true)
    try {
      await onApprove(user.id)
      handleSuccess(`Usuario ${user.name} ${user.lastName} aprobado correctamente`)
    } catch (error) {
      handleError('Error al aprobar el usuario')
    } finally {
      setActionLoading(false)
    }
  }, [onApprove, handleSuccess, handleError])

  const handleReject = useCallback(async (user) => {
    setActionLoading(true)
    try {
      await onReject(user.id)
      handleSuccess(`Usuario ${user.name} ${user.lastName} rechazado correctamente`)
    } catch (error) {
      handleError('Error al rechazar el usuario')
    } finally {
      setActionLoading(false)
    }
  }, [onReject, handleSuccess, handleError])

  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }, [])

  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey]

    switch (columnKey) {
      case 'name':
        const hasImage = user.mainImage || user.image || (user.images && user.images[0]) || user.externalAvatarUrl
        const isCurrentUser = tableType === 'active' && user.email === currentUser?.email

        return (
          <div className="flex items-center gap-3">
            {hasImage ? (
              <Avatar
                radius="lg"
                src={hasImage}
                alt={`${user.name || 'Usuario'}`}
                className="w-10 h-10"
                onError={e => {
                  console.warn('🖼️ Image failed to load for user:', user.id, 'URL:', e.target.src)
                }}
              />
            ) : (
              <Avatar 
                radius="lg" 
                className="w-10 h-10 bg-default-100" 
                icon={<UserIcon className="w-6 h-6 text-default-500" />} 
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {`${user.name || 'Usuario'} ${user.lastName || ''}`.trim()}
                </p>
                {isCurrentUser && (
                  <Chip size="sm" color="primary" variant="flat">
                    Tú
                  </Chip>
                )}
              </div>
              <p className="text-xs text-default-500">{user.email}</p>
            </div>
          </div>
        )
      case 'age':
        const age = calculateAge(user.birthDate || user.dateOfBirth)
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground">
              {age !== 'N/A' ? `${age}` : 'N/A'}
            </span>
            <p className="text-xs text-default-500">años</p>
          </div>
        )
      case 'location':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{user.country || 'No especificado'}</p>
            <p className="text-bold text-sm text-default-400">{user.city || ''}</p>
            {user.locality && <p className="text-sm text-default-400">{user.locality}</p>}
          </div>
        )
      case 'categoryInterest':
        return (
          <Chip className="capitalize" color={USER_INTEREST_COLORS[user.categoryInterest] || 'default'} size="sm" variant="flat">
            {user.categoryInterest || 'No especificado'}
          </Chip>
        )
      case 'matches':
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <span className="text-sm font-semibold text-foreground">
                {user.matchesAvailable !== undefined ? user.matchesAvailable : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-default-500">disponibles</p>
          </div>
        )
      case 'profileCompleteness':
        const completeness = user.profileCompleteness || 0
        const getColor = (percentage) => {
          if (percentage >= 80) return 'success'
          if (percentage >= 60) return 'warning'
          if (percentage >= 40) return 'primary'
          return 'danger'
        }

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-2 bg-default-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    completeness >= 80 ? 'bg-success-500' : 
                    completeness >= 60 ? 'bg-warning-500' : 
                    completeness >= 40 ? 'bg-primary-500' : 'bg-danger-500'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {completeness}%
              </span>
            </div>
            <Chip 
              size="sm" 
              variant="flat" 
              color={getColor(completeness)}
              className="text-xs"
            >
              {completeness >= 80 ? 'Completo' : 
               completeness >= 60 ? 'Bueno' : 
               completeness >= 40 ? 'Regular' : 'Incompleto'}
            </Chip>
          </div>
        )
      case 'verified':
        return (
          <Chip className="capitalize" color={user.verified ? 'success' : 'warning'} size="sm" variant="flat">
            {user.verified ? 'Verificado' : 'Pendiente'}
          </Chip>
        )
      case 'profileComplete':
        return (
          <Chip className="capitalize" color={user.profileComplete ? 'success' : 'warning'} size="sm" variant="flat">
            {user.profileComplete ? 'Completo' : 'Incompleto'}
          </Chip>
        )
      case 'role':
        return (
          <Chip className="capitalize" color={USER_ROLE_COLORS[user.role] || 'default'} size="sm" variant="flat">
            {user.role?.toLowerCase() || 'client'}
          </Chip>
        )
      case 'actions':
        if (tableType === 'pending') {
          return (
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="default"
                onPress={() => handleViewDetails(user)}
                isDisabled={loading || actionLoading}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="success"
                onPress={() => handleApprove(user)}
                isDisabled={loading || actionLoading}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => handleReject(user)}
                isDisabled={loading || actionLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        } else {
          // Active users actions
          const isCurrentUser = user.email === currentUser?.email
          const canEdit = !isCurrentUser && (currentUser?.role === 'ADMIN' && user.role !== 'ADMIN')
          const canDelete = false // Los administradores no pueden eliminar usuarios

          let editTooltip = 'Editar'
          let deleteTooltip = 'Eliminar'

          if (isCurrentUser) {
            editTooltip = 'No puedes editarte a ti mismo'
            deleteTooltip = 'No puedes eliminarte a ti mismo'
          } else if (!canEdit) {
            editTooltip = 'No tienes permisos para editar administradores'
          }
          
          if (!canDelete) {
            deleteTooltip = 'No tienes permisos para eliminar usuarios'
          }

          return (
            <TableActionCell
              item={user}
              onEdit={canEdit ? onEdit : null}
              onDelete={canDelete ? onDelete : null}
              editTooltip={editTooltip}
              deleteTooltip={deleteTooltip}
            />
          )
        }
      default:
        return cellValue || 'N/A'
    }
  }, [
    tableType, 
    currentUser, 
    calculateAge, 
    handleViewDetails, 
    handleApprove, 
    handleReject, 
    loading, 
    actionLoading,
    onEdit,
    onDelete
  ])

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return USER_COLUMNS
    return USER_COLUMNS.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <p className="text-lg font-medium text-gray-200">
          {tableType === 'pending' ? '¡Todo al día!' : 'No hay usuarios'}
        </p>
        <p className="text-sm text-gray-400">
          {tableType === 'pending' 
            ? 'No hay usuarios pendientes de aprobación' 
            : 'No se encontraron usuarios activos'
          }
        </p>
      </div>
    )
  }

  return (
    <>
      <Table 
        aria-label={`Tabla de usuarios ${tableType === 'pending' ? 'pendientes' : 'activos'}`}
        className="min-h-[400px]"
        removeWrapper={false}
        isHeaderSticky={true}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectedKeys={tableType === 'active' ? selectedKeys : undefined}
        disabledKeys={tableType === 'active' ? disabledKeys : undefined}
        selectionMode={tableType === 'active' ? 'multiple' : 'none'}
        sortDescriptor={tableType === 'active' ? sortDescriptor : undefined}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={tableType === 'active' ? setSelectedKeys : undefined}
        onSortChange={tableType === 'active' ? setSortDescriptor : undefined}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn 
              key={column.uid} 
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={tableType === 'active' && column.uid !== 'actions'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={users}
          loadingContent={`Cargando usuarios ${tableType === 'pending' ? 'pendientes' : 'activos'}...`}
          emptyContent={`No hay usuarios ${tableType === 'pending' ? 'pendientes de aprobación' : 'activos'}`}
          loadingState={loading ? 'loading' : 'idle'}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de detalles para usuarios pendientes */}
      {tableType === 'pending' && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Detalles del Usuario</h3>
              <p className="text-sm text-gray-500">Información completa para revisión</p>
            </ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={selectedUser.mainImage || selectedUser.image}
                      className="w-16 h-16"
                      icon={<UserIcon className="w-8 h-8 text-default-500" />}
                    />
                    <div>
                      <h4 className="text-lg font-semibold">
                        {selectedUser.name} {selectedUser.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      <Chip size="sm" color="warning" variant="flat">
                        Pendiente de aprobación
                      </Chip>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Edad</p>
                      <p className="text-sm text-gray-400">
                        {calculateAge(selectedUser.birthDate || selectedUser.dateOfBirth)} años
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Ubicación</p>
                      <p className="text-sm text-gray-400">
                        {selectedUser.city}, {selectedUser.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Teléfono</p>
                      <p className="text-sm text-gray-400">{selectedUser.phone || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Completitud</p>
                      <p className="text-sm text-gray-400">{selectedUser.profileCompleteness || 0}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-200 mb-2">Descripción</p>
                    <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
                      {selectedUser.description || 'Sin descripción'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-yellow-300">
                      Registrado hace {Math.floor((new Date() - new Date(selectedUser.registeredAt || selectedUser.createdAt)) / (1000 * 60 * 60 * 24))} días
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button 
                color="danger" 
                variant="flat" 
                onPress={() => {
                  handleReject(selectedUser)
                  onClose()
                }}
                isDisabled={actionLoading}
              >
                Rechazar
              </Button>
              <Button 
                color="success" 
                onPress={() => {
                  handleApprove(selectedUser)
                  onClose()
                }}
                isDisabled={actionLoading}
              >
                Aprobar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
})

UnifiedUserTable.displayName = 'UnifiedUserTable'

export default UnifiedUserTable