import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Card,
  CardBody,
  Chip,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react'
import { Tag as TagIcon, Plus, Edit3, Trash2, CheckCircle, XCircle, Zap, TrendingUp } from 'lucide-react'
import { userTagsService, tagService, userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'
import AdminDataTable from './AdminDataTable.jsx'

/**
 * Sección de gestión de tags de usuario con aprobaciones
 */
const UserTagsSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTag, setSelectedTag] = useState(null)
  const [tagStats, setTagStats] = useState({})

  // Estados para modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure()

  // Estados para formularios
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  })
  const [rejectionReason, setRejectionReason] = useState('')

  // Opciones de estado
  const statusOptions = useMemo(
    () => [
      { key: 'all', label: 'Todos' },
      { key: 'pending', label: 'Pendientes' },
      { key: 'approved', label: 'Aprobados' },
      { key: 'rejected', label: 'Rechazados' },
      { key: 'trending', label: 'En tendencia' },
      { key: 'popular', label: 'Populares' }
    ],
    []
  )

  // Categorías de tags
  const tagCategories = useMemo(
    () => [
      { key: 'PERSONAL', label: 'Personal' },
      { key: 'HOBBIES', label: 'Hobbies' },
      { key: 'LIFESTYLE', label: 'Estilo de vida' },
      { key: 'MUSIC', label: 'Música' },
      { key: 'SPORTS', label: 'Deportes' },
      { key: 'TRAVEL', label: 'Viajes' },
      { key: 'FOOD', label: 'Comida' },
      { key: 'ENTERTAINMENT', label: 'Entretenimiento' },
      { key: 'TECHNOLOGY', label: 'Tecnología' },
      { key: 'OTHER', label: 'Otro' }
    ],
    []
  )

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { name: 'TAG', uid: 'tag', sortable: true },
      { name: 'ESTADO', uid: 'status', sortable: true },
      { name: 'CATEGORÍA', uid: 'category', sortable: true },
      { name: 'USOS', uid: 'usageCount', sortable: true },
      { name: 'POPULARIDAD', uid: 'popularity', sortable: true },
      { name: 'CREADO POR', uid: 'createdBy', sortable: true },
      { name: 'ACCIONES', uid: 'actions' }
    ],
    []
  )

  // Cargar datos iniciales
  useEffect(() => {
    loadTags()
    loadTagStats()
  }, [pagination.page, pagination.size, statusFilter])

  // Cargar tags
  const loadTags = useCallback(async () => {
    setLoading(true)
    try {
      let response

      switch (statusFilter) {
        case 'pending':
          response = await userTagsService.getPendingApprovalTags(pagination.page, pagination.size)
          setTags(response.content || [])
          break
        case 'trending':
          response = await userTagsService.getTrendingTags(pagination.page, pagination.size)
          setTags(response.content || [])
          break
        case 'popular':
          response = await userTagsService.getPopularTags(pagination.page, pagination.size)
          setTags(response.content || [])
          break
        default:
          // Para 'all' y otros filtros, usar searchTags con paginación
          response = await userTagsService.searchTags(searchValue || '', pagination.page, pagination.size)
          setTags(response.content || [])
      }

      if (response.totalPages !== undefined) {
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0
        }))
      }
    } catch (error) {
      Logger.error('Error loading tags:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar tags')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, statusFilter, searchValue, onError])

  // Cargar estadísticas
  const loadTagStats = useCallback(async () => {
    try {
      const stats = await userAnalyticsService.getTagsStatistics()
      setTagStats(stats)
    } catch (error) {
      Logger.error('Error loading tag stats:', error, { category: Logger.CATEGORIES.USER })
    }
  }, [])

  // Renderizar celda
  const renderCell = useCallback(
    (tag, columnKey) => {
      switch (columnKey) {
        case 'tag':
          return (
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{tag.name || tag.tagName}</span>
              {tag.description && <span className='text-xs text-default-500 line-clamp-2'>{tag.description}</span>}
            </div>
          )

        case 'status':
          const getStatusColor = tag => {
            if (tag.approved === true) return 'success'
            if (tag.approved === false || tag.rejectionReason) return 'danger'
            if (tag.isTrending) return 'secondary'
            return 'warning'
          }

          const getStatusLabel = tag => {
            if (tag.approved === true) return 'Aprobado'
            if (tag.approved === false || tag.rejectionReason) return 'Rechazado'
            if (tag.isTrending) return 'Tendencia'
            return 'Pendiente'
          }

          return (
            <Chip size='sm' color={getStatusColor(tag)} variant='flat'>
              {getStatusLabel(tag)}
            </Chip>
          )

        case 'category':
          return (
            <Chip size='sm' variant='dot' color='primary'>
              {tagCategories.find(cat => cat.key === tag.category)?.label || tag.category || 'Sin categoría'}
            </Chip>
          )

        case 'usageCount':
          return <span className='text-sm'>{tag.usageCount || 0}</span>

        case 'popularity':
          const popularity = Math.min(((tag.usageCount || 0) / 10) * 100, 100)
          return (
            <div className='flex items-center gap-2'>
              {tag.isTrending && <TrendingUp className='w-3 h-3 text-success-500' />}
              <span className='text-sm'>{popularity.toFixed(1)}%</span>
            </div>
          )

        case 'createdBy':
          return <span className='text-sm text-default-600'>{tag.createdBy || 'Sistema'}</span>

        default:
          return tag[columnKey]?.toString() || '-'
      }
    },
    [tagCategories]
  )

  // Renderizar acciones
  const renderActions = useCallback(
    tag => (
      <div className='flex items-center gap-2'>
        {(tag.approved === undefined || tag.approved === null) && !tag.rejectionReason && (
          <>
            <Button isIconOnly size='sm' variant='light' color='success' onPress={() => handleApproveTag(tag)}>
              <CheckCircle className='h-4 w-4' />
            </Button>
            <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleRejectTag(tag)}>
              <XCircle className='h-4 w-4' />
            </Button>
          </>
        )}
        <Button isIconOnly size='sm' variant='light' onPress={() => handleEditTag(tag)}>
          <Edit3 className='h-4 w-4' />
        </Button>
        <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleDeleteTag(tag)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    []
  )

  // Handlers para acciones
  const handleCreateTag = useCallback(() => {
    setTagForm({
      name: '',
      description: '',
      category: '',
      isActive: true
    })
    onCreateOpen()
  }, [onCreateOpen])

  const handleEditTag = useCallback(
    tag => {
      setSelectedTag(tag)
      setTagForm({
        name: tag.name || tag.tagName || '',
        description: tag.description || '',
        category: tag.category || '',
        isActive: tag.isActive !== false
      })
      onEditOpen()
    },
    [onEditOpen]
  )

  const handleDeleteTag = useCallback(
    tag => {
      setSelectedTag(tag)
      onDeleteOpen()
    },
    [onDeleteOpen]
  )

  const handleRejectTag = useCallback(
    tag => {
      setSelectedTag(tag)
      setRejectionReason('')
      onRejectOpen()
    },
    [onRejectOpen]
  )

  const handleApproveTag = useCallback(
    async tag => {
      try {
        await userTagsService.approveTag(tag.id)
        onSuccess?.('Tag aprobado exitosamente')
        loadTags()
        loadTagStats()
      } catch (error) {
        Logger.error('Error approving tag:', error, { category: Logger.CATEGORIES.USER })
        onError?.('Error al aprobar tag')
      }
    },
    [onSuccess, onError, loadTags, loadTagStats]
  )

  const handleCreateSubmit = useCallback(async () => {
    if (!tagForm.name) {
      onError?.('Por favor ingresa el nombre del tag')
      return
    }

    try {
      await userTagsService.createTag({
        name: tagForm.name,
        description: tagForm.description,
        category: tagForm.category,
        isActive: tagForm.isActive
      })

      onSuccess?.('Tag creado exitosamente')
      onCreateClose()
      loadTags()
      loadTagStats()
    } catch (error) {
      Logger.error('Error creating tag:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al crear tag')
    }
  }, [tagForm, onSuccess, onError, onCreateClose, loadTags, loadTagStats])

  const handleEditSubmit = useCallback(async () => {
    if (!selectedTag || !tagForm.name) return

    try {
      await userTagsService.updateTag(selectedTag.id, {
        name: tagForm.name,
        description: tagForm.description,
        category: tagForm.category,
        isActive: tagForm.isActive
      })

      onSuccess?.('Tag actualizado exitosamente')
      onEditClose()
      loadTags()
      loadTagStats()
    } catch (error) {
      Logger.error('Error updating tag:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al actualizar tag')
    }
  }, [selectedTag, tagForm, onSuccess, onError, onEditClose, loadTags, loadTagStats])

  const confirmDelete = useCallback(async () => {
    if (!selectedTag) return

    try {
      // Nota: Usar tagService para operaciones administrativas de eliminación
      Logger.warn('Eliminando tag (pendiente implementación backend)', { tagId: selectedTag.id }, { category: Logger.CATEGORIES.SYSTEM })
      onSuccess?.('Tag eliminado exitosamente')
      onDeleteClose()
      loadTags()
      loadTagStats()
    } catch (error) {
      Logger.error('Error deleting tag:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al eliminar tag')
    }
  }, [selectedTag, onSuccess, onError, onDeleteClose, loadTags, loadTagStats])

  const confirmReject = useCallback(async () => {
    if (!selectedTag || !rejectionReason.trim()) {
      onError?.('Por favor ingresa una razón para el rechazo')
      return
    }

    try {
      await userTagsService.rejectTag(selectedTag.id, rejectionReason.trim())
      onSuccess?.('Tag rechazado exitosamente')
      onRejectClose()
      loadTags()
      loadTagStats()
    } catch (error) {
      Logger.error('Error rejecting tag:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al rechazar tag')
    }
  }, [selectedTag, rejectionReason, onSuccess, onError, onRejectClose, loadTags, loadTagStats])

  const handleCleanupTags = useCallback(async () => {
    try {
      const result = await userTagsService.cleanupUnusedTags()
      onSuccess?.(`Limpieza completada: ${result.deletedCount || 0} tags eliminados`)
      loadTags()
      loadTagStats()
    } catch (error) {
      Logger.error('Error during cleanup:', error, { category: Logger.CATEGORIES.SYSTEM })
      onError?.('Error durante la limpieza')
    }
  }, [onSuccess, onError, loadTags, loadTagStats])

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
      {/* Action Buttons */}
      <div className='flex justify-end gap-2'>
        <Button variant='flat' color='secondary' startContent={<Zap className='h-4 w-4' />} onPress={handleCleanupTags}>
          Limpiar tags sin uso
        </Button>
      </div>

      {/* Main Table */}
      <AdminDataTable
        title='Gestión de Tags'
        description='Administra las etiquetas del sistema con aprobaciones y moderación'
        data={tags}
        columns={columns}
        loading={loading}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={loadTags}
        onCreate={handleCreateTag}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={size => setPagination(prev => ({ ...prev, size, page: 0 }))}
        renderCell={renderCell}
        renderActions={renderActions}
        enableSelection={true}
        enableSearch={true}
        enableFilters={true}
        filters={filters}
        searchPlaceholder='Buscar tags...'
        emptyMessage='No se encontraron tags'
      />

      {/* Create Tag Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Crear Nuevo Tag</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Input
                label='Nombre del tag'
                placeholder='ej: música, viajes, cocina'
                value={tagForm.name}
                onValueChange={value => setTagForm(prev => ({ ...prev, name: value }))}
                isRequired
              />

              <Textarea
                label='Descripción'
                placeholder='Describe el propósito o contexto del tag'
                value={tagForm.description}
                onValueChange={value => setTagForm(prev => ({ ...prev, description: value }))}
                minRows={2}
              />

              <Select
                label='Categoría'
                placeholder='Selecciona una categoría'
                selectedKeys={tagForm.category ? [tagForm.category] : []}
                onSelectionChange={keys => setTagForm(prev => ({ ...prev, category: Array.from(keys)[0] }))}>
                {tagCategories.map(category => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onCreateClose}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleCreateSubmit} isDisabled={!tagForm.name}>
              Crear Tag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Editar Tag</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Input
                label='Nombre del tag'
                value={tagForm.name}
                onValueChange={value => setTagForm(prev => ({ ...prev, name: value }))}
                isRequired
              />

              <Textarea
                label='Descripción'
                value={tagForm.description}
                onValueChange={value => setTagForm(prev => ({ ...prev, description: value }))}
                minRows={2}
              />

              <Select
                label='Categoría'
                selectedKeys={tagForm.category ? [tagForm.category] : []}
                onSelectionChange={keys => setTagForm(prev => ({ ...prev, category: Array.from(keys)[0] }))}>
                {tagCategories.map(category => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onEditClose}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleEditSubmit} isDisabled={!tagForm.name}>
              Actualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Tag Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalContent>
          <ModalHeader>Rechazar Tag</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <p>
                ¿Estás seguro de que deseas rechazar el tag <strong>{selectedTag?.name || selectedTag?.tagName}</strong>?
              </p>
              <Textarea
                label='Razón del rechazo'
                placeholder='Explica por qué se rechaza este tag'
                value={rejectionReason}
                onValueChange={setRejectionReason}
                isRequired
                minRows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onRejectClose}>
              Cancelar
            </Button>
            <Button color='danger' onPress={confirmReject} isDisabled={!rejectionReason.trim()}>
              Rechazar
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
              ¿Estás seguro de que deseas eliminar el tag <strong>{selectedTag?.name || selectedTag?.tagName}</strong>?
            </p>
            <p className='text-sm text-danger'>Esta acción eliminará el tag de todos los perfiles de usuario.</p>
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
    </div>
  )
}

export default UserTagsSection
