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
  Select,
  SelectItem,
  Textarea,
  Switch
} from '@heroui/react'
import { Settings2, Plus, Edit3, Trash2 } from 'lucide-react'
import { userAttributesService, userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'
import AdminDataTable from './AdminDataTable.jsx'

/**
 * Sección de gestión de atributos de usuario
 */
const UserAttributesSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedAttribute, setSelectedAttribute] = useState(null)
  const [attributeStats, setAttributeStats] = useState({})

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

  // Cargar datos iniciales
  useEffect(() => {
    loadAttributes()
    loadAttributeStats()
  }, [pagination.page, pagination.size, typeFilter])

  // Cargar atributos
  const loadAttributes = useCallback(async () => {
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

      // Filtrar por búsqueda si hay término
      let filteredAttributes = Array.isArray(response) ? response : []
      if (searchValue) {
        filteredAttributes = filteredAttributes.filter(
          attr =>
            attr.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            attr.displayName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            attr.description?.toLowerCase().includes(searchValue.toLowerCase())
        )
      }

      // Simular paginación para mantener consistencia
      const startIndex = pagination.page * pagination.size
      const endIndex = startIndex + pagination.size
      const paginatedData = filteredAttributes.slice(startIndex, endIndex)

      setAttributes(paginatedData)
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(filteredAttributes.length / pagination.size),
        totalElements: filteredAttributes.length
      }))
    } catch (error) {
      Logger.error('Error loading attributes:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar atributos')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, typeFilter, searchValue, onError])

  // Cargar estadísticas
  const loadAttributeStats = useCallback(async () => {
    try {
      const stats = await userAnalyticsService.getAttributeStatistics()
      setAttributeStats(stats)
    } catch (error) {
      Logger.error('Error loading attribute stats:', error, { category: Logger.CATEGORIES.USER })
    }
  }, [])

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
            <Chip size='sm' variant='flat' color='secondary'>
              {attributeTypes.find(type => type.key === attribute.attributeType)?.label || attribute.attributeType}
            </Chip>
          )

        case 'isActive':
          return (
            <Chip size='sm' color={attribute.isActive ? 'success' : 'default'} variant='flat'>
              {attribute.isActive ? 'Activo' : 'Inactivo'}
            </Chip>
          )

        case 'isRequired':
          return (
            <Chip size='sm' color={attribute.isRequired ? 'warning' : 'default'} variant='dot'>
              {attribute.isRequired ? 'Requerido' : 'Opcional'}
            </Chip>
          )

        case 'displayOrder':
          return <span className='text-sm'>{attribute.displayOrder || 0}</span>

        case 'usageCount':
          return <span className='text-sm'>{attribute.usageCount || 0}</span>

        default:
          return attribute[columnKey]?.toString() || '-'
      }
    },
    [attributeTypes]
  )

  // Renderizar acciones
  const renderActions = useCallback(
    attribute => (
      <div className='flex items-center gap-2'>
        <Button isIconOnly size='sm' variant='light' onPress={() => handleEditAttribute(attribute)}>
          <Edit3 className='h-4 w-4' />
        </Button>
        <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleDeleteAttribute(attribute)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    []
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
      loadAttributeStats()
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
      loadAttributeStats()
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
      loadAttributeStats()
    } catch (error) {
      Logger.error('Error deleting attribute:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al eliminar atributo')
    }
  }, [selectedAttribute, onSuccess, onError, onDeleteClose, loadAttributes, loadAttributeStats])

  // Filtros
  const filters = useMemo(
    () => [
      {
        label: attributeTypes.find(type => type.key === typeFilter)?.label || 'Tipo',
        options: [{ key: 'all', label: 'Todos' }, ...attributeTypes],
        onAction: key => setTypeFilter(key)
      }
    ],
    [typeFilter, attributeTypes]
  )

  return (
    <div className='flex flex-col gap-6'>
      {/* Main Table */}
      <AdminDataTable
        title='Gestión de Atributos'
        description='Administra los atributos de perfil disponibles para los usuarios'
        data={attributes}
        columns={columns}
        loading={loading}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={loadAttributes}
        onCreate={handleCreateAttribute}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={size => setPagination(prev => ({ ...prev, size, page: 0 }))}
        renderCell={renderCell}
        renderActions={renderActions}
        enableSearch={true}
        enableFilters={true}
        filters={filters}
        searchPlaceholder='Buscar atributos...'
        emptyMessage='No se encontraron atributos'
      />

      {/* Create Attribute Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Crear Nuevo Atributo</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <Select
                label='Tipo de Atributo'
                placeholder='Selecciona el tipo'
                selectedKeys={attributeForm.attributeType ? [attributeForm.attributeType] : []}
                onSelectionChange={keys => setAttributeForm(prev => ({ ...prev, attributeType: Array.from(keys)[0] }))}
                isRequired>
                {attributeTypes.map(type => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Nombre técnico'
                  placeholder='ej: height, weight'
                  value={attributeForm.name}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, name: value }))}
                  isRequired
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
                placeholder='Describe el propósito del atributo'
                value={attributeForm.description}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, description: value }))}
                minRows={2}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  type='number'
                  label='Orden de visualización'
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
            <Button color='primary' onPress={handleCreateSubmit} isDisabled={!attributeForm.attributeType || !attributeForm.name}>
              Crear Atributo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Attribute Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Editar Atributo</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Nombre técnico'
                  value={attributeForm.name}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, name: value }))}
                  isRequired
                />
                <Input
                  label='Nombre mostrado'
                  value={attributeForm.displayName}
                  onValueChange={value => setAttributeForm(prev => ({ ...prev, displayName: value }))}
                />
              </div>

              <Textarea
                label='Descripción'
                value={attributeForm.description}
                onValueChange={value => setAttributeForm(prev => ({ ...prev, description: value }))}
                minRows={2}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  type='number'
                  label='Orden de visualización'
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
            <Button color='primary' onPress={handleEditSubmit} isDisabled={!attributeForm.name}>
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
