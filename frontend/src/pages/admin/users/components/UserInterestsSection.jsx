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
  Switch,
  Image
} from '@heroui/react'
import { Heart, Plus, Edit3, Trash2, Eye } from 'lucide-react'
import { userInterestsService, userAnalyticsService } from '@services'
import { Logger } from '@utils/logger.js'
import AdminDataTable from './AdminDataTable.jsx'

/**
 * Sección de gestión de categorías de interés
 * Nota: Sin lógica de aprobación según las nuevas especificaciones
 */
const UserInterestsSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })
  const [searchValue, setSearchValue] = useState('')
  const [selectedInterest, setSelectedInterest] = useState(null)
  const [interestStats, setInterestStats] = useState({})

  // Estados para modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()

  // Estados para formularios
  const [interestForm, setInterestForm] = useState({
    name: '',
    description: '',
    icon: '',
    fullDescription: '',
    targetAudience: '',
    features: [],
    isActive: true,
    displayOrder: 1,
    backgroundColor: '#f0f0f0',
    textColor: '#000000'
  })

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { name: 'CATEGORÍA', uid: 'category', sortable: true },
      { name: 'ESTADO', uid: 'isActive', sortable: true },
      { name: 'ORDEN', uid: 'displayOrder', sortable: true },
      { name: 'USUARIOS', uid: 'userCount', sortable: true },
      { name: 'POPULARIDAD', uid: 'popularity', sortable: true },
      { name: 'ACCIONES', uid: 'actions' }
    ],
    []
  )

  // Cargar datos iniciales
  useEffect(() => {
    loadInterests()
    loadInterestStats()
  }, [pagination.page, pagination.size])

  // Cargar categorías de interés
  const loadInterests = useCallback(async () => {
    setLoading(true)
    try {
      const response = await userInterestsService.getAllInterests()

      // Filtrar por búsqueda si hay término
      let filteredInterests = Array.isArray(response) ? response : []
      if (searchValue) {
        filteredInterests = filteredInterests.filter(
          interest =>
            interest.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            interest.description?.toLowerCase().includes(searchValue.toLowerCase())
        )
      }

      // Simular paginación para mantener consistencia
      const startIndex = pagination.page * pagination.size
      const endIndex = startIndex + pagination.size
      const paginatedData = filteredInterests.slice(startIndex, endIndex)

      setInterests(paginatedData)
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(filteredInterests.length / pagination.size),
        totalElements: filteredInterests.length
      }))
    } catch (error) {
      Logger.error('Error loading interests:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar categorías de interés')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, searchValue, onError])

  // Cargar estadísticas
  const loadInterestStats = useCallback(async () => {
    try {
      const stats = await userAnalyticsService.getInterestsStatistics()
      setInterestStats(stats)
    } catch (error) {
      Logger.error('Error loading interest stats:', error, { category: Logger.CATEGORIES.USER })
    }
  }, [])

  // Renderizar celda
  const renderCell = useCallback((interest, columnKey) => {
    switch (columnKey) {
      case 'category':
        return (
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-default-100'>
              {interest.icon ? <span className='text-lg'>{interest.icon}</span> : <Heart className='w-5 h-5 text-default-500' />}
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{interest.name}</span>
              <span className='text-xs text-default-500 line-clamp-1'>{interest.description}</span>
            </div>
          </div>
        )

      case 'isActive':
        return (
          <Chip size='sm' color={interest.isActive ? 'success' : 'default'} variant='flat'>
            {interest.isActive ? 'Activa' : 'Inactiva'}
          </Chip>
        )

      case 'displayOrder':
        return <span className='text-sm'>{interest.displayOrder || 0}</span>

      case 'userCount':
        return <span className='text-sm'>{interest.userCount || 0}</span>

      case 'popularity':
        const popularity = Math.min(((interest.userCount || 0) / 100) * 100, 100)
        return <span className='text-sm'>{popularity.toFixed(1)}%</span>

      default:
        return interest[columnKey]?.toString() || '-'
    }
  }, [])

  // Renderizar acciones
  const renderActions = useCallback(
    interest => (
      <div className='flex items-center gap-2'>
        <Button isIconOnly size='sm' variant='light' onPress={() => handleViewInterest(interest)}>
          <Eye className='h-4 w-4' />
        </Button>
        <Button isIconOnly size='sm' variant='light' onPress={() => handleEditInterest(interest)}>
          <Edit3 className='h-4 w-4' />
        </Button>
        <Button isIconOnly size='sm' variant='light' color='danger' onPress={() => handleDeleteInterest(interest)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    []
  )

  // Handlers para acciones
  const handleCreateInterest = useCallback(() => {
    setInterestForm({
      name: '',
      description: '',
      icon: '',
      fullDescription: '',
      targetAudience: '',
      features: [],
      isActive: true,
      displayOrder: 1,
      backgroundColor: '#f0f0f0',
      textColor: '#000000'
    })
    onCreateOpen()
  }, [onCreateOpen])

  const handleViewInterest = useCallback(
    interest => {
      setSelectedInterest(interest)
      onViewOpen()
    },
    [onViewOpen]
  )

  const handleEditInterest = useCallback(
    interest => {
      setSelectedInterest(interest)
      setInterestForm({
        name: interest.name || '',
        description: interest.description || '',
        icon: interest.icon || '',
        fullDescription: interest.fullDescription || '',
        targetAudience: interest.targetAudience || '',
        features: interest.features || [],
        isActive: interest.isActive !== false,
        displayOrder: interest.displayOrder || 1,
        backgroundColor: interest.backgroundColor || '#f0f0f0',
        textColor: interest.textColor || '#000000'
      })
      onEditOpen()
    },
    [onEditOpen]
  )

  const handleDeleteInterest = useCallback(
    interest => {
      setSelectedInterest(interest)
      onDeleteOpen()
    },
    [onDeleteOpen]
  )

  const handleCreateSubmit = useCallback(async () => {
    if (!interestForm.name || !interestForm.description) {
      onError?.('Por favor completa los campos requeridos')
      return
    }

    try {
      await userInterestsService.createInterest({
        name: interestForm.name,
        description: interestForm.description,
        icon: interestForm.icon,
        fullDescription: interestForm.fullDescription,
        targetAudience: interestForm.targetAudience,
        features: interestForm.features,
        isActive: interestForm.isActive,
        displayOrder: interestForm.displayOrder,
        backgroundColor: interestForm.backgroundColor,
        textColor: interestForm.textColor
      })

      onSuccess?.('Categoría de interés creada exitosamente')
      onCreateClose()
      loadInterests()
      loadInterestStats()
    } catch (error) {
      Logger.error('Error creating interest:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al crear categoría de interés')
    }
  }, [interestForm, onSuccess, onError, onCreateClose, loadInterests, loadInterestStats])

  const handleEditSubmit = useCallback(async () => {
    if (!selectedInterest || !interestForm.name) return

    try {
      await userInterestsService.updateInterest(selectedInterest.id, {
        name: interestForm.name,
        description: interestForm.description,
        icon: interestForm.icon,
        fullDescription: interestForm.fullDescription,
        targetAudience: interestForm.targetAudience,
        features: interestForm.features,
        isActive: interestForm.isActive,
        displayOrder: interestForm.displayOrder,
        backgroundColor: interestForm.backgroundColor,
        textColor: interestForm.textColor
      })

      onSuccess?.('Categoría de interés actualizada exitosamente')
      onEditClose()
      loadInterests()
      loadInterestStats()
    } catch (error) {
      Logger.error('Error updating interest:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al actualizar categoría de interés')
    }
  }, [selectedInterest, interestForm, onSuccess, onError, onEditClose, loadInterests, loadInterestStats])

  const confirmDelete = useCallback(async () => {
    if (!selectedInterest) return

    try {
      await userInterestsService.deleteInterest(selectedInterest.id)
      onSuccess?.('Categoría de interés eliminada exitosamente')
      onDeleteClose()
      loadInterests()
      loadInterestStats()
    } catch (error) {
      Logger.error('Error deleting interest:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al eliminar categoría de interés')
    }
  }, [selectedInterest, onSuccess, onError, onDeleteClose, loadInterests, loadInterestStats])

  return (
    <div className='flex flex-col gap-6'>
      {/* Main Table */}
      <AdminDataTable
        title='Gestión de Categorías de Interés'
        description='Administra las categorías de interés disponibles para los usuarios'
        data={interests}
        columns={columns}
        loading={loading}
        pagination={pagination}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRefresh={loadInterests}
        onCreate={handleCreateInterest}
        onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={size => setPagination(prev => ({ ...prev, size, page: 0 }))}
        renderCell={renderCell}
        renderActions={renderActions}
        enableSearch={true}
        searchPlaceholder='Buscar categorías...'
        emptyMessage='No se encontraron categorías de interés'
      />

      {/* View Interest Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size='2xl'>
        <ModalContent>
          <ModalHeader>Detalles de la Categoría</ModalHeader>
          <ModalBody>
            {selectedInterest && (
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center justify-center w-16 h-16 rounded-lg bg-default-100'>
                    {selectedInterest.icon ? (
                      <span className='text-2xl'>{selectedInterest.icon}</span>
                    ) : (
                      <Heart className='w-8 h-8 text-default-500' />
                    )}
                  </div>
                  <div>
                    <h3 className='text-xl font-bold'>{selectedInterest.name}</h3>
                    <p className='text-default-600'>{selectedInterest.description}</p>
                  </div>
                </div>

                {selectedInterest.fullDescription && (
                  <div>
                    <h4 className='font-semibold mb-2'>Descripción completa</h4>
                    <p className='text-sm text-default-600'>{selectedInterest.fullDescription}</p>
                  </div>
                )}

                {selectedInterest.targetAudience && (
                  <div>
                    <h4 className='font-semibold mb-2'>Audiencia objetivo</h4>
                    <p className='text-sm text-default-600'>{selectedInterest.targetAudience}</p>
                  </div>
                )}

                {selectedInterest.features && selectedInterest.features.length > 0 && (
                  <div>
                    <h4 className='font-semibold mb-2'>Características</h4>
                    <ul className='list-disc list-inside space-y-1'>
                      {selectedInterest.features.map((feature, index) => (
                        <li key={index} className='text-sm text-default-600'>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Estado</p>
                    <p className='text-sm text-default-600'>{selectedInterest.isActive ? 'Activa' : 'Inactiva'}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-default-700'>Orden</p>
                    <p className='text-sm text-default-600'>{selectedInterest.displayOrder}</p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onViewClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Interest Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size='3xl' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader>Crear Nueva Categoría de Interés</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Nombre'
                  placeholder='ej: Essence, Rouse, Spirit'
                  value={interestForm.name}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, name: value }))}
                  isRequired
                />
                <Input
                  label='Icono'
                  placeholder='ej: 💝, 🏳️‍🌈, ✝️'
                  value={interestForm.icon}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, icon: value }))}
                />
              </div>

              <Textarea
                label='Descripción breve'
                placeholder='Descripción corta para mostrar en tarjetas'
                value={interestForm.description}
                onValueChange={value => setInterestForm(prev => ({ ...prev, description: value }))}
                isRequired
                minRows={2}
              />

              <Textarea
                label='Descripción completa'
                placeholder='Descripción detallada para la página de categoría'
                value={interestForm.fullDescription}
                onValueChange={value => setInterestForm(prev => ({ ...prev, fullDescription: value }))}
                minRows={3}
              />

              <Input
                label='Audiencia objetivo'
                placeholder='ej: Personas heterosexuales que buscan relaciones auténticas'
                value={interestForm.targetAudience}
                onValueChange={value => setInterestForm(prev => ({ ...prev, targetAudience: value }))}
              />

              <Textarea
                label='Características (una por línea)'
                placeholder='Conexiones basadas en compatibilidad real&#10;Algoritmos diseñados para relaciones heterosexuales&#10;Comunidad enfocada en relaciones serias'
                value={interestForm.features.join('\n')}
                onValueChange={value => setInterestForm(prev => ({ ...prev, features: value.split('\n').filter(f => f.trim()) }))}
                minRows={3}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  type='number'
                  label='Orden de visualización'
                  value={interestForm.displayOrder.toString()}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, displayOrder: parseInt(value) || 1 }))}
                />
                <div className='flex items-center gap-4'>
                  <Switch
                    isSelected={interestForm.isActive}
                    onValueChange={value => setInterestForm(prev => ({ ...prev, isActive: value }))}>
                    Activa
                  </Switch>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onCreateClose}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleCreateSubmit} isDisabled={!interestForm.name || !interestForm.description}>
              Crear Categoría
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Interest Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='3xl' scrollBehavior='inside'>
        <ModalContent>
          <ModalHeader>Editar Categoría de Interés</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Nombre'
                  value={interestForm.name}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, name: value }))}
                  isRequired
                />
                <Input
                  label='Icono'
                  value={interestForm.icon}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, icon: value }))}
                />
              </div>

              <Textarea
                label='Descripción breve'
                value={interestForm.description}
                onValueChange={value => setInterestForm(prev => ({ ...prev, description: value }))}
                isRequired
                minRows={2}
              />

              <Textarea
                label='Descripción completa'
                value={interestForm.fullDescription}
                onValueChange={value => setInterestForm(prev => ({ ...prev, fullDescription: value }))}
                minRows={3}
              />

              <Input
                label='Audiencia objetivo'
                value={interestForm.targetAudience}
                onValueChange={value => setInterestForm(prev => ({ ...prev, targetAudience: value }))}
              />

              <Textarea
                label='Características (una por línea)'
                value={interestForm.features.join('\n')}
                onValueChange={value => setInterestForm(prev => ({ ...prev, features: value.split('\n').filter(f => f.trim()) }))}
                minRows={3}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  type='number'
                  label='Orden de visualización'
                  value={interestForm.displayOrder.toString()}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, displayOrder: parseInt(value) || 1 }))}
                />
                <div className='flex items-center gap-4'>
                  <Switch
                    isSelected={interestForm.isActive}
                    onValueChange={value => setInterestForm(prev => ({ ...prev, isActive: value }))}>
                    Activa
                  </Switch>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onEditClose}>
              Cancelar
            </Button>
            <Button color='primary' onPress={handleEditSubmit} isDisabled={!interestForm.name}>
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
              ¿Estás seguro de que deseas eliminar la categoría <strong>{selectedInterest?.name}</strong>?
            </p>
            <p className='text-sm text-danger'>Esta acción afectará a todos los usuarios que tengan esta categoría asignada.</p>
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

export default UserInterestsSection
