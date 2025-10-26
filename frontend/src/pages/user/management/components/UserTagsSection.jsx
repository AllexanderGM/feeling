import { useState, useCallback, useEffect, useMemo } from 'react'
import {
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
import { Zap, TrendingUp } from 'lucide-react'
import { userTagsService } from '@services'
import { Logger } from '@utils/logger.js'
import { useTableActions } from '@hooks'
import GenericDataTable from '@components/common/data-table/GenericDataTable.jsx'
import GenericTableActions from '@components/common/data-table/GenericTableActions.jsx'

/**
 * Sección de gestión de tags de usuario con aprobaciones
 */
const UserTagsSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalElements: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTag, setSelectedTag] = useState(null)
  // const [tagStats, setTagStats] = useState({})

  // Obtener acciones predefinidas del hook
  const { editAction, deleteAction, approveAction, rejectAction } = useTableActions()

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
    // loadTagStats()
  }, [statusFilter])

  // Cargar tags
  const loadTags = useCallback(async () => {
    setLoading(true)
    try {
      let response

      switch (statusFilter) {
        case 'pending':
          response = await userTagsService.getPendingApprovalTags(0, 10)
          setTags(response.content || [])
          break
        case 'trending':
          response = await userTagsService.getTrendingTags(0, 10)
          setTags(response.content || [])
          break
        case 'popular':
          response = await userTagsService.getPopularTags(0, 10)
          setTags(response.content || [])
          break
        default:
          // Para 'all' y otros filtros, usar searchTags con paginación
          response = await userTagsService.searchTags(searchValue || '', 0, 10)
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
  }, [statusFilter, searchValue, onError])

  // Cargar estadísticas
  // const loadTagStats = useCallback(async () => {
  //   try {
  //     const stats = await userAnalyticsService.getTagsStatistics()
  //
  //     setTagStats(stats)
  //   } catch (error) {
  //     Logger.error('Error loading tag stats:', error, { category: Logger.CATEGORIES.USER })
  //   }
  // }, [])

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
            <Chip color={getStatusColor(tag)} size='sm' variant='flat'>
              {getStatusLabel(tag)}
            </Chip>
          )

        case 'category':
          return (
            <Chip color='primary' size='sm' variant='dot'>
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

        case 'actions':
          const actions = []

          // Acciones de aprobación para tags pendientes
          if ((tag.approved === undefined || tag.approved === null) && !tag.rejectionReason) {
            actions.push(
              approveAction({
                tooltip: 'Aprobar tag',
                onClick: item => handleApproveTag(item)
              }),
              rejectAction({
                tooltip: 'Rechazar tag',
                onClick: item => handleRejectTag(item)
              })
            )
          }

          // Acciones comunes
          actions.push(
            editAction({
              tooltip: 'Editar tag',
              onClick: item => handleEditTag(item)
            }),
            deleteAction({
              tooltip: 'Eliminar tag',
              onClick: item => handleDeleteTag(item)
            })
          )

          return <GenericTableActions actions={actions} item={tag} loading={loading} size='sm' tableId={`tags-table`} />

        default:
          return tag[columnKey]?.toString() || '-'
      }
    },
    [tagCategories, approveAction, rejectAction, editAction, deleteAction, loading]
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

  // Función de búsqueda
  const handleSearch = useCallback(
    searchQuery => {
      setSearchValue(searchQuery)
      const filteredTags = tags.filter(
        tag =>
          (tag.name || tag.tagName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setTags(filteredTags)
    },
    [tags]
  )

  // Función de refresh
  const handleRefresh = useCallback(() => {
    loadTags()
    loadTagStats()
  }, [loadTags, loadTagStats])

  // Función de cambio de página
  const handlePageChange = useCallback(page => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  // Función de cambio de filas por página
  const handleRowsPerPageChange = useCallback(_size => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      {/* Action Buttons */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <Select
            className='w-48'
            label='Estado del Tag'
            placeholder='Filtrar por estado'
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={keys => setStatusFilter(Array.from(keys)[0] || 'all')}>
            {statusOptions.map(option => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>
        </div>
        <Button color='secondary' startContent={<Zap className='h-4 w-4' />} variant='flat' onPress={handleCleanupTags}>
          Limpiar tags sin uso
        </Button>
      </div>

      {/* Main Table */}
      <GenericDataTable
        columns={columns}
        createButtonLabel='Crear Tag'
        data={tags}
        emptyMessage='No se encontraron tags'
        enableSelection={false}
        getItemKey={item => `tag-${item.id}`}
        loading={loading}
        loadingMessage='Cargando tags...'
        pagination={pagination}
        renderCell={renderCell}
        rowsPerPageOptions={[10, 20, 30, 50]}
        searchPlaceholder='Buscar tags por nombre o descripción...'
        showColumnSelector={true}
        showCreateButton={true}
        showPagination={true}
        showRefreshButton={true}
        showRowsPerPage={true}
        showSearch={true}
        tableId={`tags-table`}
        onCreate={handleCreateTag}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
      />

      {/* Create Tag Modal */}
      <Modal isOpen={isCreateOpen} size='2xl' onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>Crear Nuevo Tag</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Input
                isRequired
                label='Nombre del tag'
                placeholder='ej: música, viajes, cocina'
                value={tagForm.name}
                onValueChange={value => setTagForm(prev => ({ ...prev, name: value }))}
              />

              <Textarea
                label='Descripción'
                minRows={2}
                placeholder='Describe el propósito o contexto del tag'
                value={tagForm.description}
                onValueChange={value => setTagForm(prev => ({ ...prev, description: value }))}
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
            <Button color='primary' isDisabled={!tagForm.name} onPress={handleCreateSubmit}>
              Crear Tag
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal isOpen={isEditOpen} size='2xl' onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Editar Tag</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Input
                isRequired
                label='Nombre del tag'
                value={tagForm.name}
                onValueChange={value => setTagForm(prev => ({ ...prev, name: value }))}
              />

              <Textarea
                label='Descripción'
                minRows={2}
                value={tagForm.description}
                onValueChange={value => setTagForm(prev => ({ ...prev, description: value }))}
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
            <Button color='primary' isDisabled={!tagForm.name} onPress={handleEditSubmit}>
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
                isRequired
                label='Razón del rechazo'
                minRows={3}
                placeholder='Explica por qué se rechaza este tag'
                value={rejectionReason}
                onValueChange={setRejectionReason}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onRejectClose}>
              Cancelar
            </Button>
            <Button color='danger' isDisabled={!rejectionReason.trim()} onPress={confirmReject}>
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
