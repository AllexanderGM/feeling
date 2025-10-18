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
  Select,
  SelectItem,
  Textarea,
  Switch
} from '@heroui/react'
import { userAttributesService, userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'
import { useTableActions } from '@hooks'
import GenericDataTable from '@components/common/GenericDataTable.jsx'
import GenericTableActions from '@components/common/GenericTableActions.jsx'

/**
 * Sección de gestión de atributos de usuario
 */
const UserAttributesSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalElements: 0
  })
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedAttribute, setSelectedAttribute] = useState(null)
  // const [attributeStats, setAttributeStats] = useState({})

  // Obtener acciones predefinidas del hook
  const { editAction, deleteAction } = useTableActions()

  // Estados para modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  // Estados para formularios
  const [attributeForm, setAttributeForm] = useState({
    attributeType: '',
    name: '',
    displayName: '',
    description: '',
    isRequired: false,
    isActive: true,
    displayOrder: 1,
    validationPattern: '',
    defaultValue: ''
  })

  // Tipos de atributos disponibles
  const attributeTypes = useMemo(
    () => [
      { key: 'PERSONAL', label: 'Personal' },
      { key: 'PHYSICAL', label: 'Físico' },
      { key: 'LIFESTYLE', label: 'Estilo de vida' },
      { key: 'INTERESTS', label: 'Intereses' },
      { key: 'PREFERENCES', label: 'Preferencias' },
      { key: 'SOCIAL', label: 'Social' },
      { key: 'PROFESSIONAL', label: 'Profesional' },
      { key: 'OTHER', label: 'Otro' }
    ],
    []
  )

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { name: 'ATRIBUTO', uid: 'attribute', sortable: true },
      { name: 'TIPO', uid: 'attributeType', sortable: true },
      { name: 'ESTADO', uid: 'isActive', sortable: true },
      { name: 'REQUERIDO', uid: 'isRequired', sortable: true },
      { name: 'ORDEN', uid: 'displayOrder', sortable: true },
      { name: 'USOS', uid: 'usageCount', sortable: true },
      { name: 'ACCIONES', uid: 'actions' }
    ],
    []
  )

  // Estados para prevenir llamadas concurrentes
  const [loadingStates, setLoadingStates] = useState({
    attributes: false,
    stats: false
  })

  // Cache de datos para evitar recargas innecesarias
  const [dataCache, setDataCache] = useState({
    statsLoaded: false,
    lastLoadTime: null
  })

  // Cargar datos iniciales (optimizado)
  useEffect(() => {
    loadAttributes()
  }, [typeFilter])

  // Cargar stats solo una vez al montar
  useEffect(() => {
    if (!dataCache.statsLoaded && !loadingStates.stats) {
      loadAttributeStats()
    }
  }, [])

  // Cargar atributos
  const loadAttributes = useCallback(async () => {
    if (loadingStates.attributes) {
      Logger.info('loadAttributes already in progress, skipping', { category: Logger.CATEGORIES.USER })

      return
    }

    setLoadingStates(prev => ({ ...prev, attributes: true }))
    setLoading(true)
    try {
      let response

      if (typeFilter === 'all') {
        response = await userAttributesService.getAllAttributesGrouped()
        // Convertir el objeto agrupado a array plano
        const allAttributes = Object.values(response).flat()

        response = allAttributes
      } else {
        response = await userAttributesService.getAttributesByType(typeFilter)
      }

      const filteredAttributes = Array.isArray(response) ? response : []

      setAttributes(filteredAttributes)
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(filteredAttributes.length / 10),
        totalElements: filteredAttributes.length
      }))
    } catch (error) {
      Logger.error('Error loading attributes:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar atributos')
    } finally {
      setLoading(false)
      setLoadingStates(prev => ({ ...prev, attributes: false }))
    }
  }, [typeFilter, onError, loadingStates.attributes])

  // Cargar estadísticas
  const loadAttributeStats = useCallback(
    async (forceRefresh = false) => {
      // Verificar cache y prevenir llamadas innecesarias
      if (!forceRefresh && dataCache.statsLoaded) {
        Logger.info('AttributeStats already loaded from cache, skipping', { category: Logger.CATEGORIES.USER })

        return
      }

      if (loadingStates.stats) {
        Logger.info('loadAttributeStats already in progress, skipping', { category: Logger.CATEGORIES.USER })

        return
      }

      setLoadingStates(prev => ({ ...prev, stats: true }))
      try {
        await userAnalyticsService.getAttributeStatistics()

        // setAttributeStats(stats)
        setDataCache(prev => ({
          ...prev,
          statsLoaded: true,
          lastLoadTime: Date.now()
        }))
      } catch (error) {
        Logger.error('Error loading attribute stats:', error, { category: Logger.CATEGORIES.USER })
      } finally {
        setLoadingStates(prev => ({ ...prev, stats: false }))
      }
    },
    [loadingStates.stats, dataCache.statsLoaded]
  )

  // Renderizar celda
  const renderCell = useCallback(
    (attribute, columnKey) => {
      switch (columnKey) {
        case 'attribute':
          return (
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{attribute.displayName || attribute.name}</span>
              <span className='text-xs text-default-500'>{attribute.name}</span>
              {attribute.description && <span className='text-xs text-default-400 mt-1 line-clamp-2'>{attribute.description}</span>}
            </div>
          )

        case 'attributeType':
          return (
            <Chip color='secondary' size='sm' variant='flat'>
              {attributeTypes.find(type => type.key === attribute.attributeType)?.label || attribute.attributeType}
            </Chip>
          )

        case 'isActive':
          return (
            <Chip color={attribute.isActive ? 'success' : 'default'} size='sm' variant='flat'>
              {attribute.isActive ? 'Activo' : 'Inactivo'}
            </Chip>
          )

        case 'isRequired':
          return (
            <Chip color={attribute.isRequired ? 'warning' : 'default'} size='sm' variant='dot'>
              {attribute.isRequired ? 'Requerido' : 'Opcional'}
            </Chip>
          )

        case 'displayOrder':
          return <span className='text-sm'>{attribute.displayOrder || 0}</span>

        case 'usageCount':
          return <span className='text-sm'>{attribute.usageCount || 0}</span>

        case 'actions':
          return (
            <GenericTableActions
              actions={[
                editAction({
                  tooltip: 'Editar atributo',
                  onClick: item => handleEditAttribute(item)
                }),
                deleteAction({
                  tooltip: 'Eliminar atributo',
                  onClick: item => handleDeleteAttribute(item)
                })
              ]}
              item={attribute}
              loading={loading}
              size='sm'
              tableId={`attributes-table`}
            />
          )

        default:
          return attribute[columnKey]?.toString() || '-'
      }
    },
    [attributeTypes, editAction, deleteAction, loading]
  )

  // Handlers para acciones
  const handleCreateAttribute = useCallback(() => {
    setAttributeForm({
      attributeType: '',
      name: '',
      displayName: '',
      description: '',
      isRequired: false,
      isActive: true,
      displayOrder: 1,
      validationPattern: '',
      defaultValue: ''
    })
    onCreateOpen()
  }, [onCreateOpen])

  const handleEditAttribute = useCallback(
    attribute => {
      setSelectedAttribute(attribute)
      setAttributeForm({
        attributeType: attribute.attributeType || '',
        name: attribute.name || '',
        displayName: attribute.displayName || '',
        description: attribute.description || '',
        isRequired: attribute.isRequired || false,
        isActive: attribute.isActive !== false,
        displayOrder: attribute.displayOrder || 1,
        validationPattern: attribute.validationPattern || '',
        defaultValue: attribute.defaultValue || ''
      })
      onEditOpen()
    },
    [onEditOpen]
  )

  const handleDeleteAttribute = useCallback(
    attribute => {
      setSelectedAttribute(attribute)
      onDeleteOpen()
    },
    [onDeleteOpen]
  )

  const handleCreateSubmit = useCallback(async () => {
    if (!attributeForm.attributeType || !attributeForm.name) {
      onError?.('Por favor completa los campos requeridos')

      return
    }

    try {
      await userAttributesService.createAttribute(attributeForm.attributeType, {
        name: attributeForm.name,
        displayName: attributeForm.displayName || attributeForm.name,
        description: attributeForm.description,
        isRequired: attributeForm.isRequired,
        isActive: attributeForm.isActive,
        displayOrder: attributeForm.displayOrder,
        validationPattern: attributeForm.validationPattern,
        defaultValue: attributeForm.defaultValue
      })

      onSuccess?.('Atributo creado exitosamente')
      onCreateClose()
      loadAttributes()
      loadAttributeStats(true)
    } catch (error) {
      Logger.error('Error creating attribute:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al crear atributo')
    }
  }, [attributeForm, onSuccess, onError, onCreateClose, loadAttributes, loadAttributeStats])

  const handleEditSubmit = useCallback(async () => {
    if (!selectedAttribute || !attributeForm.name) return

    try {
      await userAttributesService.updateAttribute(selectedAttribute.id, {
        name: attributeForm.name,
        displayName: attributeForm.displayName || attributeForm.name,
        description: attributeForm.description,
        isRequired: attributeForm.isRequired,
        isActive: attributeForm.isActive,
        displayOrder: attributeForm.displayOrder,
        validationPattern: attributeForm.validationPattern,
        defaultValue: attributeForm.defaultValue
      })

      onSuccess?.('Atributo actualizado exitosamente')
      onEditClose()
      loadAttributes()
      loadAttributeStats(true)
    } catch (error) {
      Logger.error('Error updating attribute:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al actualizar atributo')
    }
  }, [selectedAttribute, attributeForm, onSuccess, onError, onEditClose, loadAttributes, loadAttributeStats])

  const confirmDelete = useCallback(async () => {
    if (!selectedAttribute) return

    try {
      await userAttributesService.deleteAttribute(selectedAttribute.id)
      onSuccess?.('Atributo eliminado exitosamente')
      onDeleteClose()
      loadAttributes()
      loadAttributeStats(true)
    } catch (error) {
      Logger.error('Error deleting attribute:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al eliminar atributo')
    }
  }, [selectedAttribute, onSuccess, onError, onDeleteClose, loadAttributes, loadAttributeStats])

  // Función de búsqueda
  const handleSearch = useCallback(
    searchQuery => {
      const filteredAttributes = attributes.filter(
        attr =>
          attr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attr.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setAttributes(filteredAttributes)
    },
    [attributes]
  )
  // Función de refresh
  const handleRefresh = useCallback(() => {
    loadAttributes()
  }, [loadAttributes])

  // Función de cambio de página
  const handlePageChange = useCallback(page => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  // Función de cambio de filas por página
  const handleRowsPerPageChange = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      {/* Filtro de tipo */}
      <div className='flex items-center gap-4'>
        <Select
          className='w-48'
          label='Tipo de Atributo'
          placeholder='Filtrar por tipo'
          selectedKeys={typeFilter ? [typeFilter] : []}
          onSelectionChange={keys => setTypeFilter(Array.from(keys)[0] || 'all')}>
          <SelectItem key='all'>Todos</SelectItem>
          {attributeTypes.map(type => (
            <SelectItem key={type.key}>{type.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Main Table */}
      <GenericDataTable
        columns={columns}
        createButtonLabel='Crear Atributo'
        data={attributes}
        emptyMessage='No se encontraron atributos'
        enableSelection={false}
        getItemKey={item => `attribute-${item.id}`}
        loading={loading}
        loadingMessage='Cargando atributos...'
        pagination={pagination}
        renderCell={renderCell}
        rowsPerPageOptions={[10, 20, 30, 50]}
        searchPlaceholder='Buscar atributos por nombre, tipo o descripción...'
        showColumnSelector={true}
        showCreateButton={true}
        showPagination={true}
        showRefreshButton={true}
        showRowsPerPage={true}
        showSearch={true}
        tableId={`attributes-table`}
        onCreate={handleCreateAttribute}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
      />

      {/* Create Attribute Modal */}
      <Modal isOpen={isCreateOpen} size='2xl' onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>Crear Nuevo Atributo</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Select
                isRequired
                label='Tipo de Atributo'
                placeholder='Selecciona el tipo'
                selectedKeys={attributeForm.attributeType ? [attributeForm.attributeType] : []}
                onSelectionChange={keys => setAttributeForm(prev => ({ ...prev, attributeType: Array.from(keys)[0] }))}>
                {attributeTypes.map(type => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  isRequired
                  label='Nombre técnico'
                  placeholder='ej: height, weight'
                  value={attributeForm.name}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, name: value }))}
                />
                <Input
                  label='Nombre mostrado'
                  placeholder='ej: Altura, Peso'
                  value={attributeForm.displayName}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, displayName: value }))}
                />
              </div>

              <Textarea
                label='Descripción'
                minRows={2}
                placeholder='Describe el propósito del atributo'
                value={attributeForm.description}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, description: value }))}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Orden de visualización'
                  type='number'
                  value={attributeForm.displayOrder.toString()}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, displayOrder: parseInt(value) || 1 }))}
                />
                <Input
                  label='Valor por defecto'
                  placeholder='Valor inicial (opcional)'
                  value={attributeForm.defaultValue}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, defaultValue: value }))}
                />
              </div>

              <Input
                label='Patrón de validación'
                placeholder='Regex para validación (opcional)'
                value={attributeForm.validationPattern}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, validationPattern: value }))}
              />

              <div className='flex gap-6'>
                <Switch
                  isSelected={attributeForm.isRequired}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, isRequired: value }))}>
                  Campo requerido
                </Switch>
                <Switch
                  isSelected={attributeForm.isActive}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, isActive: value }))}>
                  Activo
                </Switch>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onCreateClose}>
              Cancelar
            </Button>
            <Button color='primary' isDisabled={!attributeForm.attributeType || !attributeForm.name} onPress={handleCreateSubmit}>
              Crear Atributo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Attribute Modal */}
      <Modal isOpen={isEditOpen} size='2xl' onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Editar Atributo</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  isRequired
                  label='Nombre técnico'
                  value={attributeForm.name}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, name: value }))}
                />
                <Input
                  label='Nombre mostrado'
                  value={attributeForm.displayName}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, displayName: value }))}
                />
              </div>

              <Textarea
                label='Descripción'
                minRows={2}
                value={attributeForm.description}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, description: value }))}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Orden de visualización'
                  type='number'
                  value={attributeForm.displayOrder.toString()}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, displayOrder: parseInt(value) || 1 }))}
                />
                <Input
                  label='Valor por defecto'
                  value={attributeForm.defaultValue}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, defaultValue: value }))}
                />
              </div>

              <Input
                label='Patrón de validación'
                value={attributeForm.validationPattern}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, validationPattern: value }))}
              />

              <div className='flex gap-6'>
                <Switch
                  isSelected={attributeForm.isRequired}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, isRequired: value }))}>
                  Campo requerido
                </Switch>
                <Switch
                  isSelected={attributeForm.isActive}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, isActive: value }))}>
                  Activo
                </Switch>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onEditClose}>
              Cancelar
            </Button>
            <Button color='primary' isDisabled={!attributeForm.name} onPress={handleEditSubmit}>
              Actualizar
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
              ¿Estás seguro de que deseas eliminar el atributo <strong>{selectedAttribute?.displayName || selectedAttribute?.name}</strong>?
            </p>
            <p className='text-sm text-danger'>Esta acción eliminará el atributo de todos los perfiles de usuario.</p>
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

export default UserAttributesSection
