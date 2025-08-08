import { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Spinner,
  Divider,
  Tooltip,
  Card,
  CardBody
} from '@heroui/react'
import { Tags, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Eye, Hash } from 'lucide-react'
import { useError } from '@hooks'
import { tagService } from '@services'
import { Logger } from '@utils/logger.js'

const UserTagModal = ({ isOpen, onOpenChange, user, onTagStatusUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [userTags, setUserTags] = useState([])
  const { handleSuccess, handleError } = useError()

  // Cargar tags del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      loadUserTags()
    }
  }, [isOpen, user])

  const loadUserTags = useCallback(async () => {
    if (!user?.tags || user.tags.length === 0) {
      setUserTags([])
      return
    }

    setLoading(true)
    try {
      // Si el usuario tiene tags en su objeto, los usamos
      // En caso contrario, podríamos hacer una llamada a la API
      setUserTags(user.tags || [])
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'load_user_tags', 'Error loading user tags', { error, userId: user?.id })
      handleError('Error al cargar tags del usuario')
      setUserTags([])
    } finally {
      setLoading(false)
    }
  }, [user, handleError])

  const handleApproveTag = useCallback(
    async (tagId, tagName) => {
      try {
        await tagService.approveTag(tagId)
        handleSuccess(`Tag "${tagName}" aprobado correctamente`)

        // Actualizar el estado local
        setUserTags(prev => prev.map(tag => (tag.id === tagId ? { ...tag, approved: true, rejectionReason: null } : tag)))

        // Notificar al componente padre si existe la función
        if (onTagStatusUpdate) {
          onTagStatusUpdate(tagId, 'approved')
        }
      } catch (error) {
        handleError('Error al aprobar tag')
      }
    },
    [handleSuccess, handleError, onTagStatusUpdate]
  )

  const handleRejectTag = useCallback(
    async (tagId, tagName) => {
      try {
        const reason = 'Tag no apropiado para la plataforma'
        await tagService.rejectTag(tagId, reason)
        handleSuccess(`Tag "${tagName}" rechazado correctamente`)

        // Actualizar el estado local
        setUserTags(prev => prev.map(tag => (tag.id === tagId ? { ...tag, approved: false, rejectionReason: reason } : tag)))

        // Notificar al componente padre si existe la función
        if (onTagStatusUpdate) {
          onTagStatusUpdate(tagId, 'rejected')
        }
      } catch (error) {
        handleError('Error al rechazar tag')
      }
    },
    [handleSuccess, handleError, onTagStatusUpdate]
  )

  const getTagStatusChip = useCallback(tag => {
    if (tag.rejectionReason) {
      return (
        <Chip color='danger' variant='flat' size='sm' startContent={<XCircle className='w-3 h-3' />}>
          Rechazado
        </Chip>
      )
    }
    if (tag.approved) {
      return (
        <Chip color='success' variant='flat' size='sm' startContent={<CheckCircle className='w-3 h-3' />}>
          Aprobado
        </Chip>
      )
    }
    return (
      <Chip color='warning' variant='flat' size='sm' startContent={<Clock className='w-3 h-3' />}>
        Pendiente
      </Chip>
    )
  }, [])

  const getTagActions = useCallback(
    tag => {
      // Si el tag ya está aprobado o rechazado, no mostrar acciones
      if (tag.approved || tag.rejectionReason) {
        return null
      }

      return (
        <div className='flex gap-1 mt-2'>
          <Tooltip content='Aprobar tag'>
            <Button
              isIconOnly
              size='sm'
              color='success'
              variant='flat'
              onPress={() => handleApproveTag(tag.id, tag.name)}
              className='min-w-8 h-8'>
              <ThumbsUp className='w-3 h-3' />
            </Button>
          </Tooltip>

          <Tooltip content='Rechazar tag'>
            <Button
              isIconOnly
              size='sm'
              color='danger'
              variant='flat'
              onPress={() => handleRejectTag(tag.id, tag.name)}
              className='min-w-8 h-8'>
              <ThumbsDown className='w-3 h-3' />
            </Button>
          </Tooltip>
        </div>
      )
    },
    [handleApproveTag, handleRejectTag]
  )

  // Separar tags por estado
  const approvedTags = userTags.filter(tag => tag.approved)
  const pendingTags = userTags.filter(tag => !tag.approved && !tag.rejectionReason)
  const rejectedTags = userTags.filter(tag => tag.rejectionReason)

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='2xl' scrollBehavior='inside'>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Tags className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Tags de Usuario</h3>
                <p className='text-sm text-default-500'>{user ? `${user.name} ${user.lastName} (${user.email})` : 'Usuario'}</p>
              </div>
            </ModalHeader>

            <ModalBody className='space-y-4'>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Spinner size='lg' color='primary' />
                </div>
              ) : userTags.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Hash className='w-8 h-8 text-gray-400' />
                  </div>
                  <p className='text-default-500'>Este usuario no tiene tags asignados</p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {/* Tags Pendientes */}
                  {pendingTags.length > 0 && (
                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <Clock className='w-4 h-4 text-orange-400' />
                        <h4 className='font-medium text-orange-400'>Tags Pendientes ({pendingTags.length})</h4>
                      </div>

                      <div className='grid gap-3'>
                        {pendingTags.map(tag => (
                          <Card key={tag.id} className='bg-orange-500/5 border border-orange-500/20'>
                            <CardBody className='p-4'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-2'>
                                    <span className='font-medium'>#{tag.name}</span>
                                    {getTagStatusChip(tag)}
                                  </div>

                                  <div className='text-sm text-default-500 space-y-1'>
                                    <p>Creado: {new Date(tag.createdAt).toLocaleDateString('es-ES')}</p>
                                    <p>Uso: {tag.usageCount || 0} veces</p>
                                  </div>
                                </div>

                                <div className='ml-4'>{getTagActions(tag)}</div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Aprobados */}
                  {approvedTags.length > 0 && (
                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <CheckCircle className='w-4 h-4 text-green-400' />
                        <h4 className='font-medium text-green-400'>Tags Aprobados ({approvedTags.length})</h4>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        {approvedTags.map(tag => (
                          <Chip key={tag.id} color='success' variant='flat' startContent={<Hash className='w-3 h-3' />}>
                            {tag.name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Rechazados */}
                  {rejectedTags.length > 0 && (
                    <div>
                      <div className='flex items-center gap-2 mb-3'>
                        <XCircle className='w-4 h-4 text-red-400' />
                        <h4 className='font-medium text-red-400'>Tags Rechazados ({rejectedTags.length})</h4>
                      </div>

                      <div className='grid gap-3'>
                        {rejectedTags.map(tag => (
                          <Card key={tag.id} className='bg-red-500/5 border border-red-500/20'>
                            <CardBody className='p-4'>
                              <div className='flex items-center gap-2 mb-2'>
                                <span className='font-medium'>#{tag.name}</span>
                                {getTagStatusChip(tag)}
                              </div>

                              {tag.rejectionReason && <p className='text-sm text-red-400 mt-2'>Razón: {tag.rejectionReason}</p>}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Separadores solo si hay múltiples secciones */}
                  {((pendingTags.length > 0 && (approvedTags.length > 0 || rejectedTags.length > 0)) ||
                    (approvedTags.length > 0 && rejectedTags.length > 0)) && <Divider />}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color='primary' onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default UserTagModal
