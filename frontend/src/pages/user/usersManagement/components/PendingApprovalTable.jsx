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
import { USER_INTEREST_COLORS, USER_ROLE_COLORS } from '@constants/tableConstants.js'

const PendingApprovalTable = memo(({ pendingUsers, onApprove, onReject, loading }) => {
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
        const hasImage = user.mainImage || user.image || (user.images && user.images[0])
        return (
          <div className="flex items-center gap-3">
            {hasImage ? (
              <Avatar
                radius="lg"
                src={hasImage}
                alt={`${user.name || 'Usuario'}`}
                className="w-10 h-10"
              />
            ) : (
              <Avatar 
                radius="lg" 
                className="w-10 h-10 bg-default-100" 
                icon={<UserIcon className="w-6 h-6 text-default-500" />} 
              />
            )}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {`${user.name || 'Usuario'} ${user.lastName || ''}`.trim()}
              </p>
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
            <p className="text-sm font-medium">{user.country || 'No especificado'}</p>
            <p className="text-xs text-default-500">{user.city || ''}</p>
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
      case 'role':
        return (
          <Chip className="capitalize" color={USER_ROLE_COLORS[user.role] || 'default'} size="sm" variant="flat">
            {user.role?.toLowerCase() || 'client'}
          </Chip>
        )
      case 'actions':
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
      default:
        return cellValue || 'N/A'
    }
  }, [calculateAge, handleViewDetails, handleApprove, handleReject, loading, actionLoading])

  const columns = [
    { name: 'ID', uid: 'id' },
    { name: 'NOMBRE', uid: 'name' },
    { name: 'EDAD', uid: 'age' },
    { name: 'INTERÉS', uid: 'categoryInterest' },
    { name: 'UBICACIÓN', uid: 'location' },
    { name: 'MATCHES', uid: 'matches' },
    { name: 'COMPLETITUD', uid: 'profileCompleteness' },
    { name: 'VERIFICADO', uid: 'verified' },
    { name: 'ROL', uid: 'role' },
    { name: 'ACCIONES', uid: 'actions' }
  ]

  if (!pendingUsers || pendingUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Check className="w-16 h-16 text-green-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">¡Todo al día!</p>
        <p className="text-sm text-gray-400">No hay usuarios pendientes de aprobación</p>
      </div>
    )
  }

  return (
    <>
      <Table 
        aria-label="Tabla de usuarios pendientes de aprobación"
        className="min-h-[400px]"
        removeWrapper
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={pendingUsers}
          loadingContent="Cargando usuarios pendientes..."
          emptyContent="No hay usuarios pendientes de aprobación"
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

      {/* Modal de detalles */}
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
                    <p className="text-sm font-medium text-gray-300">Edad</p>
                    <p className="text-sm text-gray-400">
                      {calculateAge(selectedUser.birthDate || selectedUser.dateOfBirth)} años
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Ubicación</p>
                    <p className="text-sm text-gray-400">
                      {selectedUser.city}, {selectedUser.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Teléfono</p>
                    <p className="text-sm text-gray-400">{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Completitud</p>
                    <p className="text-sm text-gray-400">{selectedUser.profileCompleteness || 0}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Descripción</p>
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
    </>
  )
})

PendingApprovalTable.displayName = 'PendingApprovalTable'

export default PendingApprovalTable