import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Pagination,
  Select,
  SelectItem
} from '@heroui/react'
import { Tags, CheckCircle, Clock, Search, RefreshCw, Eye, ThumbsUp, ThumbsDown, Filter, TrendingUp, Hash } from 'lucide-react'
import { useError } from '@hooks'
import { userTagsService } from '@services'
import { Logger } from '@utils/logger.js'

const TagAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [tagStats, setTagStats] = useState({
    totalTags: 0,
    approvedTags: 0,
    pendingTags: 0,
    approvalRate: 0
  })

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Estados para modales
  const [selectedTag, setSelectedTag] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedTags, setSelectedTags] = useState(new Set())

  const { handleSuccess, handleError } = useError()

  // Modales
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onOpenChange: onViewModalOpenChange } = useDisclosure()

  const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onOpenChange: onRejectModalOpenChange } = useDisclosure()

  // Cargar datos iniciales
  useEffect(() => {
    loadTagsData()
  }, [])

  const loadTagsData = useCallback(async () => {
    setLoading(true)
    try {
      const pendingTagsResponse = await userTagsService.getPendingApprovalTags(0, 100)
      const pendingTags = pendingTagsResponse?.data?.content || pendingTagsResponse?.data || []

      setTags(pendingTags)
      setTagStats({
        totalTags: pendingTags.length,
        approvedTags: 0,
        pendingTags: pendingTags.length,
        approvalRate: 0
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'load_tags_data', 'Error al cargar datos de tags admin', { error })
      handleError('Error al cargar datos de tags')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadTagsData()
      handleSuccess('Datos de tags actualizados')
    } catch {
      handleError('Error al actualizar datos')
    } finally {
      setRefreshing(false)
    }
  }, [loadTagsData, handleSuccess, handleError])

  // Filtrar tags según los criterios
  const filteredAndPaginatedTags = useMemo(() => {
    // Verificar que tags sea un array antes de usar métodos de array
    if (!Array.isArray(tags)) {
      setFilteredTags([])

      return []
    }

    let filtered = tags

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        tag => tag.name?.toLowerCase().includes(searchTerm.toLowerCase()) || tag.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tag => {
        if (statusFilter === 'pending') return !tag.approved
        if (statusFilter === 'approved') return tag.approved
        if (statusFilter === 'rejected') return tag.rejectionReason

        return true
      })
    }

    setFilteredTags(filtered)

    // Paginación
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return filtered.slice(startIndex, endIndex)
  }, [tags, searchTerm, statusFilter, currentPage, itemsPerPage])

  const totalPages = Math.ceil((Array.isArray(filteredTags) ? filteredTags.length : 0) / itemsPerPage)

  // Funciones para gestión de tags
  const handleApproveTag = useCallback(
    async tagId => {
      try {
        await userTagsService.approveTag(tagId)
        handleSuccess('Tag aprobado correctamente')
        loadTagsData()
      } catch {
        handleError('Error al aprobar tag')
      }
    },
    [handleSuccess, handleError, loadTagsData]
  )

  const handleRejectTag = useCallback(async () => {
    if (!selectedTag || !rejectionReason.trim()) return

    try {
      await userTagsService.rejectTag(selectedTag.id)
      handleSuccess('Tag rechazado correctamente')
      setRejectionReason('')
      setSelectedTag(null)
      onRejectModalOpenChange(false)
      loadTagsData()
    } catch {
      handleError('Error al rechazar tag')
    }
  }, [selectedTag, rejectionReason, handleSuccess, handleError, loadTagsData, onRejectModalOpenChange])

  const handleBatchApprove = useCallback(async () => {
    if (selectedTags.size === 0) return

    try {
      const tagIds = Array.from(selectedTags).map(Number)

      await userTagsService.approveTagsBatch(tagIds)
      handleSuccess(`${tagIds.length} tags aprobados correctamente`)
      setSelectedTags(new Set())
      loadTagsData()
    } catch {
      handleError('Error al aprobar tags en lote')
    }
  }, [selectedTags, handleSuccess, handleError, loadTagsData])

  const openRejectModal = useCallback(
    tag => {
      setSelectedTag(tag)
      setRejectionReason('')
      onRejectModalOpen()
    },
    [onRejectModalOpen]
  )

  const openViewModal = useCallback(
    tag => {
      setSelectedTag(tag)
      onViewModalOpen()
    },
    [onViewModalOpen]
  )

  const getStatusChip = useCallback(tag => {
    if (tag.rejectionReason) {
      return (
        <Chip color='danger' size='sm' variant='flat'>
          Rechazado
        </Chip>
      )
    }
    if (tag.approved) {
      return (
        <Chip color='success' size='sm' variant='flat'>
          Aprobado
        </Chip>
      )
    }

    return (
      <Chip color='warning' size='sm' variant='flat'>
        Pendiente
      </Chip>
    )
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spinner color='primary' size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-foreground mb-1'>Gestión de Tags</h2>
          <p className='text-sm text-default-500'>Administra y modera los tags del sistema</p>
        </div>
        <Button
          isIconOnly
          aria-label='Actualizar datos de tags'
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          color='primary'
          isLoading={refreshing}
          variant='flat'
          onPress={handleRefresh}>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Estadísticas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Hash className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{tagStats.totalTags}</p>
                <p className='text-xs text-default-500'>Total Tags</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                <CheckCircle className='w-4 h-4 text-green-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{tagStats.approvedTags}</p>
                <p className='text-xs text-default-500'>Aprobados</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <Clock className='w-4 h-4 text-orange-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{tagStats.pendingTags}</p>
                <p className='text-xs text-default-500'>Pendientes</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <TrendingUp className='w-4 h-4 text-purple-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{tagStats.approvalRate}%</p>
                <p className='text-xs text-default-500'>Tasa Aprobación</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Controles */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardBody className='p-4'>
          <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 flex-1'>
              <Input
                aria-label='Buscar tags'
                className='max-w-xs'
                placeholder='Buscar tags...'
                startContent={<Search className='w-4 h-4 text-default-400' />}
                value={searchTerm}
                onValueChange={setSearchTerm}
              />

              <Select
                aria-label='Filtrar tags por estado'
                className='max-w-xs'
                placeholder='Filtrar por estado'
                selectedKeys={[statusFilter]}
                startContent={<Filter className='w-4 h-4 text-default-400' />}
                onSelectionChange={keys => setStatusFilter(Array.from(keys)[0] || 'all')}>
                <SelectItem key='all'>Todos</SelectItem>
                <SelectItem key='pending'>Pendientes</SelectItem>
                <SelectItem key='approved'>Aprobados</SelectItem>
                <SelectItem key='rejected'>Rechazados</SelectItem>
              </Select>
            </div>

            {selectedTags.size > 0 && (
              <Button color='success' startContent={<ThumbsUp className='w-4 h-4' />} variant='flat' onPress={handleBatchApprove}>
                Aprobar Seleccionados ({selectedTags.size})
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Tabla de Tags */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardBody className='p-0'>
          <Table
            aria-label='Tabla de gestión de tags del sistema'
            selectedKeys={selectedTags}
            selectionMode='multiple'
            onSelectionChange={setSelectedTags}>
            <TableHeader>
              <TableColumn>TAG</TableColumn>
              <TableColumn>CREADO POR</TableColumn>
              <TableColumn>FECHA CREACIÓN</TableColumn>
              <TableColumn>USO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody emptyContent='No hay tags para mostrar'>
              {filteredAndPaginatedTags.map(tag => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center'>
                        <Tags className='w-3 h-3 text-blue-400' />
                      </div>
                      <span className='font-medium'>{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tag.createdBy}</TableCell>
                  <TableCell>{new Date(tag.createdAt).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <span className='text-sm text-default-500'>{tag.usageCount || 0} usos</span>
                  </TableCell>
                  <TableCell>{getStatusChip(tag)}</TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Tooltip content='Ver detalles'>
                        <Button isIconOnly aria-label='Ver detalles del tag' size='sm' variant='flat' onPress={() => openViewModal(tag)}>
                          <Eye className='w-4 h-4' />
                        </Button>
                      </Tooltip>

                      {!tag.approved && !tag.rejectionReason && (
                        <>
                          <Tooltip content='Aprobar'>
                            <Button
                              isIconOnly
                              aria-label='Aprobar tag'
                              color='success'
                              size='sm'
                              variant='flat'
                              onPress={() => handleApproveTag(tag.id)}>
                              <ThumbsUp className='w-4 h-4' />
                            </Button>
                          </Tooltip>

                          <Tooltip content='Rechazar'>
                            <Button
                              isIconOnly
                              aria-label='Rechazar tag'
                              color='danger'
                              size='sm'
                              variant='flat'
                              onPress={() => openRejectModal(tag)}>
                              <ThumbsDown className='w-4 h-4' />
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className='flex justify-center'>
          <Pagination showControls page={currentPage} total={totalPages} onChange={setCurrentPage} />
        </div>
      )}

      {/* Modal Ver Detalles */}
      <Modal isOpen={isViewModalOpen} onOpenChange={onViewModalOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Detalles del Tag</ModalHeader>
              <ModalBody>
                {selectedTag && (
                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm font-medium text-default-500'>Nombre</p>
                      <p className='text-lg font-semibold'>#{selectedTag.name}</p>
                    </div>

                    <div>
                      <p className='text-sm font-medium text-default-500'>Creado por</p>
                      <p>{selectedTag.createdBy}</p>
                    </div>

                    <div>
                      <p className='text-sm font-medium text-default-500'>Fecha de creación</p>
                      <p>{new Date(selectedTag.createdAt).toLocaleString('es-ES')}</p>
                    </div>

                    <div>
                      <p className='text-sm font-medium text-default-500'>Uso</p>
                      <p>{selectedTag.usageCount || 0} veces usado</p>
                    </div>

                    <div>
                      <p className='text-sm font-medium text-default-500'>Estado</p>
                      {getStatusChip(selectedTag)}
                    </div>

                    {selectedTag.rejectionReason && (
                      <div>
                        <p className='text-sm font-medium text-default-500'>Razón de rechazo</p>
                        <p className='text-sm text-danger'>{selectedTag.rejectionReason}</p>
                      </div>
                    )}
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

      {/* Modal Rechazar Tag */}
      <Modal isOpen={isRejectModalOpen} onOpenChange={onRejectModalOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Rechazar Tag</ModalHeader>
              <ModalBody>
                {selectedTag && (
                  <div className='space-y-4'>
                    <p>
                      ¿Estás seguro de que quieres rechazar el tag <strong>#{selectedTag.name}</strong>?
                    </p>

                    <Textarea
                      isRequired
                      label='Razón del rechazo'
                      minRows={3}
                      placeholder='Explica por qué este tag no es apropiado...'
                      value={rejectionReason}
                      onValueChange={setRejectionReason}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='flat' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='danger' isDisabled={!rejectionReason.trim()} onPress={handleRejectTag}>
                  Rechazar Tag
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default TagAnalytics
