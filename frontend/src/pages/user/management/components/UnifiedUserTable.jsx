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
  CardHeader,
  Tooltip
} from '@heroui/react'
import { Check, X, Eye, UserIcon, UserX, Clock, AlertCircle, Mail, Trash2, Tags } from 'lucide-react'
import { useError } from '@hooks'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS, USER_COLUMNS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate, calculateAgeFromJavaDate } from '@utils/dateUtils.js'
import { Logger } from '@utils/logger.js'

// Helper function to calculate age
const calculateAge = birthDate => {
  if (!birthDate) return 'N/A'
  try {
    return calculateAgeFromJavaDate(birthDate)
  } catch (error) {
    return 'N/A'
  }
}
import TableActionCell from '@components/ui/TableActionCell.jsx'
import UserTagModal from './UserTagModal.jsx'

const UnifiedUserTable = memo(
  ({
    users,
    loading,
    tableType = 'active', // 'active', 'pending', or 'incomplete'
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
    // Props for incomplete users table
    onSendEmail,
    onDeactivate,
    onActivate,
    onView,
    onBlock,
    visibleColumns,
    headerColumns
  }) => {
    // Initialize component state

    const { handleError, handleSuccess } = useError()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onClose: onTagModalClose } = useDisclosure()
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedUserForTags, setSelectedUserForTags] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const handleViewDetails = useCallback(
      user => {
        setSelectedUser(user)
        onOpen()
      },
      [onOpen]
    )

    const handleViewTags = useCallback(
      user => {
        setSelectedUserForTags(user)
        onTagModalOpen()
      },
      [onTagModalOpen]
    )

    const handleTagStatusUpdate = useCallback(
      async (tagId, status) => {
        setActionLoading(true)
        try {
          if (status === 'approved') {
            const response = await fetch(`/api/tags/${tagId}/approve`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            })
            if (response.ok) {
              handleSuccess('Tag aprobado correctamente')
              // Actualizar el usuario seleccionado si es necesario
              if (selectedUser && selectedUser.tags) {
                setSelectedUser(prev => ({
                  ...prev,
                  tags: prev.tags.map(tag =>
                    typeof tag === 'object' && tag.id === tagId ? { ...tag, approved: true, rejectionReason: null } : tag
                  )
                }))
              }
            } else {
              handleError('Error al aprobar tag')
            }
          } else if (status === 'rejected') {
            const reason = 'Tag no apropiado para la plataforma'
            const response = await fetch(`/api/tags/${tagId}/reject?reason=${encodeURIComponent(reason)}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            })
            if (response.ok) {
              handleSuccess('Tag rechazado correctamente')
              // Actualizar el usuario seleccionado si es necesario
              if (selectedUser && selectedUser.tags) {
                setSelectedUser(prev => ({
                  ...prev,
                  tags: prev.tags.map(tag =>
                    typeof tag === 'object' && tag.id === tagId ? { ...tag, approved: false, rejectionReason: reason } : tag
                  )
                }))
              }
            } else {
              handleError('Error al rechazar tag')
            }
          }
        } catch (error) {
          Logger.error(Logger.CATEGORIES.SERVICE, 'update_tag_status', 'Error updating tag status', { error })
          handleError('Error al actualizar el estado del tag')
        } finally {
          setActionLoading(false)
        }
      },
      [selectedUser, handleSuccess, handleError]
    )

    const handleApprove = useCallback(
      async user => {
        setActionLoading(true)
        try {
          await onApprove(user.id)
          handleSuccess(`Usuario ${user.name} ${user.lastName} aprobado correctamente`)
        } catch (error) {
          handleError('Error al aprobar el usuario')
        } finally {
          setActionLoading(false)
        }
      },
      [onApprove, handleSuccess, handleError]
    )

    const handleReject = useCallback(
      async user => {
        setActionLoading(true)
        try {
          await onReject(user.id)
          handleSuccess(`Usuario ${user.name} ${user.lastName} rechazado correctamente`)
        } catch (error) {
          handleError('Error al rechazar el usuario')
        } finally {
          setActionLoading(false)
        }
      },
      [onReject, handleSuccess, handleError]
    )

    const renderCell = useCallback(
      (user, columnKey) => {
        const cellValue = user[columnKey]

        switch (columnKey) {
          case 'user':
          case 'name':
            const hasImage = user.mainImage || user.image || (user.images && user.images[0]) || user.externalAvatarUrl
            const isCurrentUser = tableType === 'active' && user.email === currentUser?.email

            return (
              <div className='flex items-center gap-3'>
                {hasImage ? (
                  <Avatar
                    radius='lg'
                    src={hasImage}
                    alt={`${user.name || 'Usuario'}`}
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
                    <p className='text-sm font-semibold text-foreground'>{`${user.name || 'Usuario'} ${user.lastName || ''}`.trim()}</p>
                    {isCurrentUser && (
                      <Chip size='sm' color='primary' variant='flat'>
                        Tú
                      </Chip>
                    )}
                  </div>
                  <p className='text-xs text-default-500'>{user.email}</p>
                </div>
              </div>
            )
          case 'age':
            const age = calculateAge(user.birthDate || user.dateOfBirth)
            return (
              <div className='flex flex-col items-center'>
                <span className='text-sm font-semibold text-foreground'>{age !== 'N/A' ? `${age}` : 'N/A'}</span>
                <p className='text-xs text-default-500'>años</p>
              </div>
            )
          case 'location':
            return (
              <div className='flex flex-col'>
                <p className='text-bold text-sm'>{user.country || 'No especificado'}</p>
                <p className='text-bold text-sm text-default-400'>{user.city || ''}</p>
                {user.locality && <p className='text-sm text-default-400'>{user.locality}</p>}
              </div>
            )
          case 'categoryInterest':
            return (
              <Chip className='capitalize' color={USER_INTEREST_COLORS[user.categoryInterest] || 'default'} size='sm' variant='flat'>
                {user.categoryInterest || 'No especificado'}
              </Chip>
            )
          case 'matches':
            return (
              <div className='flex flex-col items-center'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-primary-500'></div>
                  <span className='text-sm font-semibold text-foreground'>
                    {user.matchesAvailable !== undefined ? user.matchesAvailable : 'N/A'}
                  </span>
                </div>
                <p className='text-xs text-default-500'>disponibles</p>
              </div>
            )
          case 'profileCompleteness':
            const completeness = user.profileCompleteness || 0
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
              <Chip className='capitalize' color={user.verified ? 'success' : 'warning'} size='sm' variant='flat'>
                {user.verified ? 'Verificado' : 'Pendiente'}
              </Chip>
            )
          case 'profileComplete':
            return (
              <Chip className='capitalize' color={user.profileComplete ? 'success' : 'warning'} size='sm' variant='flat'>
                {user.profileComplete ? 'Completo' : 'Incompleto'}
              </Chip>
            )
          case 'role':
            return (
              <Chip className='capitalize' color={USER_ROLE_COLORS[user.role] || 'default'} size='sm' variant='flat'>
                {user.role?.toLowerCase() || 'client'}
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
              <Chip className='capitalize' color={authProviderColors[user.userAuthProvider] || 'default'} size='sm' variant='flat'>
                {authProviderLabels[user.userAuthProvider] || user.userAuthProvider || 'Local'}
              </Chip>
            )
          case 'createdAt':
            const createdDate = user.createdAt || user.registeredAt
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
                  {user.phone ? `${user.phoneCode || ''} ${user.phone}`.trim() : 'No especificado'}
                </p>
              </div>
            )
          case 'actions':
            if (tableType === 'pending') {
              return (
                <div className='flex items-center justify-center gap-2'>
                  <Tooltip content='Visualizar perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      onPress={() => handleViewDetails(user)}
                      isDisabled={loading || actionLoading}
                      title='Visualizar perfil'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Enviar correo'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Aprobar perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                      onPress={() => handleApprove(user)}
                      isDisabled={loading || actionLoading}
                      title='Aprobar perfil'>
                      <Check className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Desaprobar perfil' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      onPress={() => handleReject(user)}
                      isDisabled={loading || actionLoading}
                      title='Desaprobar perfil'>
                      <X className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            } else if (tableType === 'incomplete') {
              return (
                <div className='flex items-center justify-center gap-2'>
                  <Tooltip content='Ver perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      onPress={() => handleViewDetails(user)}
                      isDisabled={loading || actionLoading}
                      title='Ver perfil'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Enviar correo'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  {onDeactivate && (
                    <Tooltip content='Desactivar cuenta'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        className='bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
                        onPress={() => onDeactivate(user.id)}
                        isDisabled={loading || actionLoading}
                        title='Desactivar cuenta'>
                        <UserX className='w-4 h-4' />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content='Eliminar cuenta' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      onPress={() => onDelete?.(user)}
                      isDisabled={loading || actionLoading}
                      title='Eliminar cuenta'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            } else if (tableType === 'unverified') {
              return (
                <div className='flex items-center justify-center gap-2'>
                  <Tooltip content='Enviar correo electrónico'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo electrónico'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  {onDeactivate && (
                    <Tooltip content='Desactivar cuenta'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        className='bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
                        onPress={() => onDeactivate(user.id)}
                        isDisabled={loading || actionLoading}
                        title='Desactivar cuenta'>
                        <UserX className='w-4 h-4' />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content='Eliminar cuenta' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      onPress={() => onDelete?.(user)}
                      isDisabled={loading || actionLoading}
                      title='Eliminar cuenta'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            } else if (tableType === 'nonApproved') {
              return (
                <div className='flex items-center justify-center gap-2'>
                  <Tooltip content='Ver perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      onPress={() => handleViewDetails(user)}
                      isDisabled={loading || actionLoading}
                      title='Ver perfil'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Enviar correo'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Aprobar cuenta'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                      onPress={() => handleApprove(user)}
                      isDisabled={loading || actionLoading}
                      title='Aprobar cuenta'>
                      <Check className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  {onDeactivate && (
                    <Tooltip content='Desactivar cuenta'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        className='bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
                        onPress={() => onDeactivate(user.id)}
                        isDisabled={loading || actionLoading}
                        title='Desactivar cuenta'>
                        <UserX className='w-4 h-4' />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content='Eliminar definitivamente' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      onPress={() => onDelete?.(user)}
                      isDisabled={loading || actionLoading}
                      title='Eliminar definitivamente'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            } else if (tableType === 'deactivated') {
              return (
                <div className='flex items-center justify-center gap-2'>
                  <Tooltip content='Ver perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      onPress={() => handleViewDetails(user)}
                      isDisabled={loading || actionLoading}
                      title='Ver perfil'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  <Tooltip content='Enviar correo electrónico'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo electrónico'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                  {onActivate && (
                    <Tooltip content='Activar cuenta'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        className='bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                        onPress={() => onActivate(user.id)}
                        isDisabled={loading || actionLoading}
                        title='Activar cuenta'>
                        <Check className='w-4 h-4' />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content='Eliminar definitivamente' color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      onPress={() => onDelete?.(user)}
                      isDisabled={loading || actionLoading}
                      title='Eliminar definitivamente'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            } else {
              // Active users actions
              const isCurrentUser = user.email === currentUser?.email
              const currentUserRole = currentUser?.role || currentUser?.status?.role
              const canEdit = !isCurrentUser && currentUserRole === 'ADMIN' && user.role !== 'ADMIN'
              const canDelete = !isCurrentUser && currentUserRole === 'ADMIN' && user.role !== 'ADMIN'
              const canDeactivate = !isCurrentUser && currentUserRole === 'ADMIN' && user.role !== 'ADMIN'

              // Si es el usuario actual, mostrar texto informativo
              if (isCurrentUser) {
                return (
                  <div className='flex items-center justify-center px-3 py-2'>
                    <span className='text-xs text-gray-400 font-medium'>Tu cuenta</span>
                  </div>
                )
              }

              return (
                <div className='flex items-center justify-center gap-2'>
                  {/* Visualizar perfil */}
                  <Tooltip content='Visualizar perfil'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      onPress={() => onView?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Visualizar perfil'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </Tooltip>

                  {/* Enviar correo */}
                  <Tooltip content='Enviar correo'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      onPress={() => onSendEmail?.(user.id)}
                      isDisabled={loading || actionLoading}
                      title='Enviar correo'>
                      <Mail className='w-4 h-4' />
                    </Button>
                  </Tooltip>

                  {/* Desaprobar perfil */}
                  <Tooltip content={!canEdit ? 'No tienes permisos para desaprobar administradores' : 'Desaprobar perfil'}>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      onPress={() => onReject?.(user)}
                      isDisabled={loading || actionLoading || !canEdit}
                      title={!canEdit ? 'No tienes permisos para desaprobar administradores' : 'Desaprobar perfil'}>
                      <X className='w-4 h-4' />
                    </Button>
                  </Tooltip>

                  {/* Desactivar perfil */}
                  {canDeactivate && (
                    <Tooltip content='Desactivar perfil'>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        className='bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                        onPress={() => onDeactivate?.(user.id)}
                        isDisabled={loading || actionLoading}
                        title='Desactivar perfil'>
                        <UserX className='w-4 h-4' />
                      </Button>
                    </Tooltip>
                  )}

                  {/* Eliminar definitivamente */}
                  <Tooltip
                    content={!canDelete ? 'No tienes permisos para eliminar administradores' : 'Eliminar definitivamente'}
                    color='danger'>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='flat'
                      className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                      onPress={() => onDelete?.(user)}
                      isDisabled={loading || actionLoading || !canDelete}
                      title={!canDelete ? 'No tienes permisos para eliminar administradores' : 'Eliminar definitivamente'}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </Tooltip>
                </div>
              )
            }
          default:
            return cellValue || 'N/A'
        }
      },
      [
        tableType,
        currentUser,
        handleViewDetails,
        handleApprove,
        handleReject,
        loading,
        actionLoading,
        onEdit,
        onDelete,
        onSendEmail,
        onDeactivate,
        onActivate,
        onView,
        onBlock
      ]
    )

    const displayColumns = headerColumns || []

    // Función para generar key única para cada usuario
    const getUserKey = (user, index) => {
      if (!user) return `user-empty-${index}`
      return user.id || user.userId || user.email || user.username || `user-${index}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Crear array de usuarios con keys garantizadas
    const usersWithKeys = useMemo(() => {
      if (!users || users.length === 0) return []

      return users.map((user, index) => ({
        ...user,
        _key: getUserKey(user, index)
      }))
    }, [users])

    // Crear contenido vacío cuando no hay usuarios, pero manteniendo los controles
    const emptyContent =
      !usersWithKeys || usersWithKeys.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12'>
          <Check className='w-16 h-16 text-green-400 mb-4' />
          <p className='text-lg font-medium text-gray-200'>
            {tableType === 'pending' ? '¡Todo al día!' : tableType === 'incomplete' ? '¡Perfiles completos!' : 'No hay usuarios'}
          </p>
          <p className='text-sm text-gray-400'>
            {tableType === 'pending'
              ? 'No hay usuarios pendientes de aprobación'
              : tableType === 'incomplete'
                ? 'No hay usuarios con perfiles incompletos'
                : 'No se encontraron usuarios activos'}
          </p>
        </div>
      ) : null

    // Preparar renderizado de la tabla

    return (
      <>
        <Table
          aria-label={`Tabla de usuarios ${tableType === 'pending' ? 'pendientes' : tableType === 'incomplete' ? 'incompletos' : 'activos'}`}
          className='min-h-[400px]'
          removeWrapper={false}
          isHeaderSticky={true}
          color='primary'
          bottomContent={bottomContent}
          bottomContentPlacement='outside'
          selectionMode='none'
          sortDescriptor={tableType === 'active' ? sortDescriptor : undefined}
          topContent={topContent}
          topContentPlacement='outside'
          onSortChange={tableType === 'active' ? setSortDescriptor : undefined}
          classNames={{
            wrapper: 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50',
            th: 'bg-gray-700/50 border-b border-gray-600/50',
            td: 'border-b border-gray-700/30',
            tbody: '[&>tr:hover]:bg-gray-700/20'
          }}>
          <TableHeader columns={displayColumns}>
            {column => (
              <TableColumn
                key={column.uid}
                align={column.uid === 'actions' ? 'center' : 'start'}
                allowsSorting={tableType === 'active' && column.uid !== 'actions'}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={usersWithKeys}
            loadingContent={`Cargando usuarios ${tableType === 'pending' ? 'pendientes' : tableType === 'incomplete' ? 'incompletos' : 'activos'}...`}
            emptyContent={
              emptyContent ||
              `No hay usuarios ${tableType === 'pending' ? 'pendientes de aprobación' : tableType === 'incomplete' ? 'con perfiles incompletos' : 'activos'}`
            }
            loadingState={loading ? 'loading' : 'idle'}>
            {item => <TableRow key={item._key}>{columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
          </TableBody>
        </Table>

        {/* Modal de detalles para usuarios pendientes, incompletos y no aprobados */}
        {(tableType === 'pending' || tableType === 'incomplete' || tableType === 'nonApproved') && (
          <Modal isOpen={isOpen} onClose={onClose} size='4xl' scrollBehavior='inside'>
            <ModalContent>
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-xl font-semibold'>
                  {tableType === 'pending'
                    ? 'Revisión de Usuario Pendiente'
                    : tableType === 'nonApproved'
                      ? 'Revisión de Usuario No Aprobado'
                      : 'Revisión de Usuario Incompleto'}
                </h3>
                <p className='text-sm text-gray-500'>
                  {tableType === 'nonApproved'
                    ? 'Usuario previamente rechazado - información para nueva decisión de aprobación'
                    : 'Información completa para decisión de aprobación'}
                </p>
              </ModalHeader>
              <ModalBody className='pb-6'>
                {selectedUser && (
                  <div className='space-y-6'>
                    {/* Header con foto y datos básicos */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardBody className='flex flex-row items-center gap-6 p-6'>
                        <div className='flex flex-col items-center gap-3'>
                          <Avatar
                            src={selectedUser.mainImage || selectedUser.image}
                            className='w-20 h-20'
                            icon={<UserIcon className='w-10 h-10 text-default-500' />}
                          />
                          <Chip size='sm' color={tableType === 'nonApproved' ? 'danger' : 'warning'} variant='flat'>
                            {tableType === 'pending'
                              ? 'Pendiente de aprobación'
                              : tableType === 'nonApproved'
                                ? 'No aprobado'
                                : 'Perfil incompleto'}
                          </Chip>
                        </div>
                        <div className='flex-1'>
                          <h4 className='text-xl font-semibold text-white mb-2'>
                            {selectedUser.name} {selectedUser.lastName}
                          </h4>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Email</p>
                              <p className='text-sm text-gray-200'>{selectedUser.email}</p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Documento</p>
                              <p className='text-sm text-gray-200'>{selectedUser.document || 'No especificado'}</p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Teléfono</p>
                              <p className='text-sm text-gray-200'>
                                {selectedUser.phoneCode} {selectedUser.phone || 'No especificado'}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Fecha de Nacimiento</p>
                              <p className='text-sm text-gray-200'>
                                {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'No especificado'}(
                                {calculateAge(selectedUser.birthDate || selectedUser.dateOfBirth)} años)
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Ubicación y Demografía */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Ubicación y Demografía</h5>
                      </CardHeader>
                      <CardBody className='pt-0'>
                        <div className='grid grid-cols-3 gap-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>País</p>
                            <p className='text-sm text-gray-200'>{selectedUser.country || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Ciudad</p>
                            <p className='text-sm text-gray-200'>{selectedUser.city || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Departamento</p>
                            <p className='text-sm text-gray-200'>{selectedUser.department || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Localidad</p>
                            <p className='text-sm text-gray-200'>{selectedUser.locality || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Género</p>
                            <p className='text-sm text-gray-200'>{selectedUser.gender || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Categoría de Interés</p>
                            <Chip size='sm' color={USER_INTEREST_COLORS[selectedUser.categoryInterest] || 'default'} variant='flat'>
                              {selectedUser.categoryInterest || 'No especificado'}
                            </Chip>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Características Físicas */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Características Físicas</h5>
                      </CardHeader>
                      <CardBody className='pt-0'>
                        <div className='grid grid-cols-4 gap-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Altura</p>
                            <p className='text-sm text-gray-200'>{selectedUser.height ? `${selectedUser.height} cm` : 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Color de Ojos</p>
                            <p className='text-sm text-gray-200'>{selectedUser.eyeColor || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Color de Cabello</p>
                            <p className='text-sm text-gray-200'>{selectedUser.hairColor || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Tipo de Cuerpo</p>
                            <p className='text-sm text-gray-200'>{selectedUser.bodyType || 'No especificado'}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Información Demográfica Completa */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Información Demográfica</h5>
                      </CardHeader>
                      <CardBody className='pt-0'>
                        <div className='grid grid-cols-3 gap-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Religión</p>
                            <p className='text-sm text-gray-200'>{selectedUser.religion || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Nivel Educativo</p>
                            <p className='text-sm text-gray-200'>{selectedUser.educationLevel || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Profesión</p>
                            <p className='text-sm text-gray-200'>{selectedUser.profession || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Estado Civil</p>
                            <p className='text-sm text-gray-200'>{selectedUser.maritalStatus || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Dirección</p>
                            <p className='text-sm text-gray-200'>{selectedUser.address || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Código Postal</p>
                            <p className='text-sm text-gray-200'>{selectedUser.postalCode || 'No especificado'}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Descripción */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Perfil Personal</h5>
                      </CardHeader>
                      <CardBody className='pt-0 space-y-4'>
                        <div>
                          <p className='text-xs font-medium text-gray-400 uppercase mb-2'>Descripción</p>
                          <div className='bg-gray-900 p-4 rounded-lg'>
                            <p className='text-sm text-gray-200 whitespace-pre-wrap'>{selectedUser.description || 'Sin descripción'}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Gestión de Tags */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader className='flex flex-row items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                            <Tags className='w-4 h-4 text-purple-400' />
                          </div>
                          <h5 className='text-lg font-semibold text-white'>Gestión de Tags</h5>
                        </div>
                        {selectedUser.tags && selectedUser.tags.length > 0 && (
                          <Chip size='sm' variant='flat' color='default'>
                            {selectedUser.tags.length} tags
                          </Chip>
                        )}
                      </CardHeader>
                      <CardBody className='pt-0'>
                        {!selectedUser.tags || selectedUser.tags.length === 0 ? (
                          <div className='text-center py-8'>
                            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                              <Tags className='w-8 h-8 text-gray-400' />
                            </div>
                            <p className='text-default-500'>Este usuario no tiene tags asignados</p>
                          </div>
                        ) : (
                          <div className='space-y-6'>
                            {/* Tags Pendientes */}
                            {(() => {
                              const pendingTags = selectedUser.tags.filter(
                                tag => typeof tag === 'object' && !tag.approved && !tag.rejectionReason
                              )
                              return (
                                pendingTags.length > 0 && (
                                  <div>
                                    <div className='flex items-center gap-2 mb-3'>
                                      <Clock className='w-4 h-4 text-orange-400' />
                                      <h6 className='font-medium text-orange-400'>Tags Pendientes ({pendingTags.length})</h6>
                                    </div>

                                    <div className='grid gap-3'>
                                      {pendingTags.map((tag, index) => (
                                        <Card key={index} className='bg-orange-500/5 border border-orange-500/20'>
                                          <CardBody className='p-4'>
                                            <div className='flex items-start justify-between'>
                                              <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                  <span className='font-medium'>#{typeof tag === 'string' ? tag : tag.name}</span>
                                                  <Chip
                                                    color='warning'
                                                    variant='flat'
                                                    size='sm'
                                                    startContent={<Clock className='w-3 h-3' />}>
                                                    Pendiente
                                                  </Chip>
                                                </div>

                                                {typeof tag === 'object' && (
                                                  <div className='text-sm text-default-500 space-y-1'>
                                                    <p>Creado: {new Date(tag.createdAt).toLocaleDateString('es-ES')}</p>
                                                    <p>Uso: {tag.usageCount || 0} veces</p>
                                                  </div>
                                                )}
                                              </div>

                                              <div className='ml-4 flex gap-1'>
                                                <Tooltip content='Aprobar tag'>
                                                  <Button
                                                    isIconOnly
                                                    size='sm'
                                                    color='success'
                                                    variant='flat'
                                                    onPress={() => {
                                                      if (typeof tag === 'object' && tag.id) {
                                                        handleTagStatusUpdate(tag.id, 'approved')
                                                      }
                                                    }}
                                                    className='min-w-8 h-8'
                                                    aria-label='Aprobar tag'>
                                                    <Check className='w-3 h-3' />
                                                  </Button>
                                                </Tooltip>

                                                <Tooltip content='Rechazar tag'>
                                                  <Button
                                                    isIconOnly
                                                    size='sm'
                                                    color='danger'
                                                    variant='flat'
                                                    onPress={() => {
                                                      if (typeof tag === 'object' && tag.id) {
                                                        handleTagStatusUpdate(tag.id, 'rejected')
                                                      }
                                                    }}
                                                    className='min-w-8 h-8'
                                                    aria-label='Rechazar tag'>
                                                    <X className='w-3 h-3' />
                                                  </Button>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          </CardBody>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )
                            })()}

                            {/* Tags Aprobados */}
                            {(() => {
                              const approvedTags = selectedUser.tags.filter(
                                tag => typeof tag === 'string' || (typeof tag === 'object' && tag.approved)
                              )
                              return (
                                approvedTags.length > 0 && (
                                  <div>
                                    <div className='flex items-center gap-2 mb-3'>
                                      <Check className='w-4 h-4 text-green-400' />
                                      <h6 className='font-medium text-green-400'>Tags Aprobados ({approvedTags.length})</h6>
                                    </div>

                                    <div className='flex flex-wrap gap-2'>
                                      {approvedTags.map((tag, index) => (
                                        <Chip key={index} color='success' variant='flat' startContent={<Tags className='w-3 h-3' />}>
                                          {typeof tag === 'string' ? tag : tag.name}
                                        </Chip>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )
                            })()}

                            {/* Tags Rechazados */}
                            {(() => {
                              const rejectedTags = selectedUser.tags.filter(tag => typeof tag === 'object' && tag.rejectionReason)
                              return (
                                rejectedTags.length > 0 && (
                                  <div>
                                    <div className='flex items-center gap-2 mb-3'>
                                      <X className='w-4 h-4 text-red-400' />
                                      <h6 className='font-medium text-red-400'>Tags Rechazados ({rejectedTags.length})</h6>
                                    </div>

                                    <div className='grid gap-3'>
                                      {rejectedTags.map((tag, index) => (
                                        <Card key={index} className='bg-red-500/5 border border-red-500/20'>
                                          <CardBody className='p-4'>
                                            <div className='flex items-center gap-2 mb-2'>
                                              <span className='font-medium'>#{tag.name}</span>
                                              <Chip color='danger' variant='flat' size='sm' startContent={<X className='w-3 h-3' />}>
                                                Rechazado
                                              </Chip>
                                            </div>

                                            {tag.rejectionReason && (
                                              <p className='text-sm text-red-400 mt-2'>Razón: {tag.rejectionReason}</p>
                                            )}
                                          </CardBody>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )
                            })()}
                          </div>
                        )}
                      </CardBody>
                    </Card>

                    {/* Configuración de Privacidad y Notificaciones */}
                    <div className='grid grid-cols-2 gap-4'>
                      <Card className='bg-gray-800 border-gray-700'>
                        <CardHeader>
                          <h5 className='text-lg font-semibold text-white'>Configuración de Privacidad</h5>
                        </CardHeader>
                        <CardBody className='pt-0'>
                          <div className='space-y-3'>
                            <div className='grid grid-cols-2 gap-3'>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Cuenta Pública</p>
                                <Chip size='sm' color={selectedUser.publicAccount ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.publicAccount ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Visible en Búsqueda</p>
                                <Chip size='sm' color={selectedUser.showMeInSearch ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.showMeInSearch ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Mostrar Edad</p>
                                <Chip size='sm' color={selectedUser.showAge ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.showAge ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Mostrar Ubicación</p>
                                <Chip size='sm' color={selectedUser.showLocation ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.showLocation ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Mostrar Teléfono</p>
                                <Chip size='sm' color={selectedUser.showPhone ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.showPhone ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Ubicación Pública</p>
                                <Chip size='sm' color={selectedUser.locationPublic ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.locationPublic ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <Card className='bg-gray-800 border-gray-700'>
                        <CardHeader>
                          <h5 className='text-lg font-semibold text-white'>Configuración de Notificaciones</h5>
                        </CardHeader>
                        <CardBody className='pt-0'>
                          <div className='space-y-3'>
                            <div className='grid grid-cols-2 gap-3'>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Email</p>
                                <Chip size='sm' color={selectedUser.notificationsEmailEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsEmailEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Teléfono</p>
                                <Chip size='sm' color={selectedUser.notificationsPhoneEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsPhoneEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Matches</p>
                                <Chip size='sm' color={selectedUser.notificationsMatchesEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsMatchesEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Eventos</p>
                                <Chip size='sm' color={selectedUser.notificationsEventsEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsEventsEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Login</p>
                                <Chip size='sm' color={selectedUser.notificationsLoginEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsLoginEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Pagos</p>
                                <Chip size='sm' color={selectedUser.notificationsPaymentsEnabled ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.notificationsPaymentsEnabled ? 'Activado' : 'Desactivado'}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Métricas Completas y Estado */}
                    <div className='grid grid-cols-2 gap-4'>
                      <Card className='bg-gray-800 border-gray-700'>
                        <CardHeader>
                          <h5 className='text-lg font-semibold text-white'>Métricas de Usuario</h5>
                        </CardHeader>
                        <CardBody className='pt-0'>
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Vistas del Perfil</p>
                                <p className='text-lg font-semibold text-white'>{selectedUser.profileViews || 0}</p>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Likes Recibidos</p>
                                <p className='text-lg font-semibold text-white'>{selectedUser.likesReceived || 0}</p>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Matches Totales</p>
                                <p className='text-lg font-semibold text-white'>{selectedUser.matchesCount || 0}</p>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Matches Disponibles</p>
                                <p className='text-lg font-semibold text-white'>{selectedUser.matchesAvailable || 0}</p>
                              </div>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase mb-2'>Score de Popularidad</p>
                              <div className='flex items-center gap-2'>
                                <div className='flex-1 bg-gray-700 rounded-full h-2'>
                                  <div
                                    className='h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300'
                                    style={{ width: `${Math.min((selectedUser.popularityScore || 0) * 10, 100)}%` }}
                                  />
                                </div>
                                <span className='text-sm font-semibold text-white'>{(selectedUser.popularityScore || 0).toFixed(1)}</span>
                              </div>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase mb-2'>Completitud del Perfil</p>
                              <div className='flex items-center gap-2'>
                                <div className='flex-1 bg-gray-700 rounded-full h-2'>
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      (selectedUser.profileCompleteness || 0) >= 80
                                        ? 'bg-green-500'
                                        : (selectedUser.profileCompleteness || 0) >= 60
                                          ? 'bg-yellow-500'
                                          : (selectedUser.profileCompleteness || 0) >= 40
                                            ? 'bg-blue-500'
                                            : 'bg-red-500'
                                    }`}
                                    style={{ width: `${selectedUser.profileCompleteness || 0}%` }}
                                  />
                                </div>
                                <span className='text-sm font-semibold text-white'>{selectedUser.profileCompleteness || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <Card className='bg-gray-800 border-gray-700'>
                        <CardHeader>
                          <h5 className='text-lg font-semibold text-white'>Estado de la Cuenta</h5>
                        </CardHeader>
                        <CardBody className='pt-0'>
                          <div className='space-y-3'>
                            <div className='grid grid-cols-2 gap-3'>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Estado del Perfil</p>
                                <Chip size='sm' color={selectedUser.profileComplete ? 'success' : 'warning'} variant='flat'>
                                  {selectedUser.profileComplete ? 'Completo' : 'Incompleto'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Verificado</p>
                                <Chip size='sm' color={selectedUser.verified ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.verified ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Cuenta Activa</p>
                                <Chip size='sm' color={selectedUser.active ? 'success' : 'danger'} variant='flat'>
                                  {selectedUser.active ? 'Activa' : 'Inactiva'}
                                </Chip>
                              </div>
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Cuenta Desactivada</p>
                                <Chip size='sm' color={selectedUser.accountDeactivated ? 'danger' : 'success'} variant='flat'>
                                  {selectedUser.accountDeactivated ? 'Sí' : 'No'}
                                </Chip>
                              </div>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Fecha de Registro</p>
                              <p className='text-sm text-gray-200'>
                                {formatJavaDateForDisplay(selectedUser.createdAt || selectedUser.registeredAt)}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-gray-400 uppercase'>Días desde registro</p>
                              <p className='text-sm text-gray-200'>
                                {(() => {
                                  const days = daysSinceJavaDate(selectedUser.createdAt || selectedUser.registeredAt)
                                  return days !== null ? `${days} días` : 'No disponible'
                                })()}
                              </p>
                            </div>
                            {selectedUser.accountDeactivated && selectedUser.deactivationDate && (
                              <div>
                                <p className='text-xs font-medium text-gray-400 uppercase'>Fecha de Desactivación</p>
                                <p className='text-sm text-red-300'>{new Date(selectedUser.deactivationDate).toLocaleDateString()}</p>
                                {selectedUser.deactivationReason && (
                                  <p className='text-xs text-red-400 mt-1'>Razón: {selectedUser.deactivationReason}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Información de Autenticación */}
                    <Card className='bg-gray-800 border-gray-700'>
                      <CardHeader>
                        <h5 className='text-lg font-semibold text-white'>Información de Autenticación</h5>
                      </CardHeader>
                      <CardBody className='pt-0'>
                        <div className='grid grid-cols-3 gap-4'>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Método de Registro</p>
                            <Chip size='sm' variant='flat' color={selectedUser.userAuthProvider === 'LOCAL' ? 'secondary' : 'primary'}>
                              {selectedUser.userAuthProvider || 'LOCAL'}
                            </Chip>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>ID Externo</p>
                            <p className='text-sm text-gray-200'>
                              {selectedUser.externalId ? `${selectedUser.externalId.substring(0, 20)}...` : 'No disponible'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Avatar Externo</p>
                            <Chip size='sm' variant='flat' color={selectedUser.externalAvatarUrl ? 'success' : 'default'}>
                              {selectedUser.externalAvatarUrl ? 'Sí' : 'No'}
                            </Chip>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Última Sincronización</p>
                            <p className='text-sm text-gray-200'>
                              {selectedUser.lastExternalSync
                                ? new Date(selectedUser.lastExternalSync).toLocaleDateString()
                                : 'No disponible'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Rol en Sistema</p>
                            <Chip size='sm' variant='flat' color={selectedUser.role === 'ADMIN' ? 'danger' : 'primary'}>
                              {selectedUser.role || 'CLIENT'}
                            </Chip>
                          </div>
                          <div>
                            <p className='text-xs font-medium text-gray-400 uppercase'>Código de Teléfono</p>
                            <p className='text-sm text-gray-200'>{selectedUser.phoneCode || 'No especificado'}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Galería de Imágenes */}
                    {selectedUser.images && selectedUser.images.length > 0 && (
                      <Card className='bg-gray-800 border-gray-700'>
                        <CardHeader>
                          <h5 className='text-lg font-semibold text-white'>Imágenes del Perfil ({selectedUser.images.length})</h5>
                        </CardHeader>
                        <CardBody className='pt-0'>
                          <div className='grid grid-cols-4 gap-3'>
                            {selectedUser.images.slice(0, 8).map((image, index) => (
                              <div key={index} className='aspect-square'>
                                <img
                                  src={image}
                                  alt={`Imagen ${index + 1}`}
                                  className='w-full h-full object-cover rounded-lg'
                                  onError={e => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {selectedUser.images.length > 8 && (
                            <p className='text-xs text-gray-400 mt-2'>+{selectedUser.images.length - 8} imágenes más</p>
                          )}
                        </CardBody>
                      </Card>
                    )}

                    {/* Alerta de tiempo de espera */}
                    <div
                      className={`flex items-center gap-2 p-4 rounded-lg border ${
                        tableType === 'nonApproved' ? 'bg-red-900/20 border-red-700/30' : 'bg-yellow-900/20 border-yellow-700/30'
                      }`}>
                      <AlertCircle
                        className={`w-5 h-5 flex-shrink-0 ${tableType === 'nonApproved' ? 'text-red-400' : 'text-yellow-400'}`}
                      />
                      <div>
                        <p className={`text-sm font-medium ${tableType === 'nonApproved' ? 'text-red-300' : 'text-yellow-300'}`}>
                          {tableType === 'pending'
                            ? 'Usuario esperando aprobación'
                            : tableType === 'nonApproved'
                              ? 'Usuario previamente rechazado'
                              : 'Usuario con perfil incompleto'}
                        </p>
                        <p className={`text-xs ${tableType === 'nonApproved' ? 'text-red-200' : 'text-yellow-200'}`}>
                          {(() => {
                            const days = daysSinceJavaDate(selectedUser.registeredAt || selectedUser.createdAt)
                            return days !== null ? `Registrado hace ${days} días.` : 'Fecha de registro no disponible.'
                          })()}
                          {tableType === 'nonApproved'
                            ? 'Este usuario fue rechazado anteriormente. Puedes aprobarlo ahora si cumple los criterios.'
                            : 'Por favor, revisa la información y toma una decisión.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  className='bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                  variant='flat'
                  onPress={() => {
                    handleReject(selectedUser)
                    onClose()
                  }}
                  isDisabled={actionLoading}>
                  Rechazar
                </Button>
                <Button
                  className='bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                  onPress={() => {
                    handleApprove(selectedUser)
                    onClose()
                  }}
                  isDisabled={actionLoading}>
                  Aprobar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Modal de gestión de tags */}
        <UserTagModal
          isOpen={isTagModalOpen}
          onOpenChange={onTagModalClose}
          user={selectedUserForTags}
          onTagStatusUpdate={handleTagStatusUpdate}
        />
      </>
    )
  }
)

UnifiedUserTable.displayName = 'UnifiedUserTable'

export default UnifiedUserTable
