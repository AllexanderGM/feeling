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
  Switch
} from '@heroui/react'
import { Heart } from 'lucide-react'
import { userInterestsService } from '@services'
import { Logger } from '@utils/logger.js'
import GenericDataTable from '@components/common/GenericDataTable.jsx'
import GenericTableActions from '@components/common/GenericTableActions.jsx'
import useTableActions from '@hooks/table/useTableActions.js'

/**
 * Sección de gestión de categorías de interés
 * Nota: Sin lógica de aprobación según las nuevas especificaciones
 */
const UserInterestsSection = ({ onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalElements: 0
  })
  const [selectedInterest, setSelectedInterest] = useState(null)
  // const [interestStats, setInterestStats] = useState({})

  // Obtener acciones predefinidas del hook
  const { viewAction, editAction, deleteAction } = useTableActions()

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
    // loadInterestStats()
  }, [])

  // Cargar categorías de interés
  const loadInterests = useCallback(async () => {
    setLoading(true)
    try {
      const response = await userInterestsService.getAllInterests()
      const filteredInterests = Array.isArray(response) ? response : []

      setInterests(filteredInterests)
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(filteredInterests.length / 10),
        totalElements: filteredInterests.length
      }))
    } catch (error) {
      Logger.error('Error loading interests:', error, { category: Logger.CATEGORIES.USER })
      onError?.('Error al cargar categorías de interés')
    } finally {
      setLoading(false)
    }
  }, [onError])

  // Cargar estadísticas
  // const loadInterestStats = useCallback(async () => {
  //   try {
  //     const stats = await userAnalyticsService.getInterestsStatistics()
  //
  //     setInterestStats(stats)
  //   } catch (error) {
  //     Logger.error('Error loading interest stats:', error, { category: Logger.CATEGORIES.USER })
  //   }
  // }, [])

  // Renderizar celda
  const renderCell = useCallback(
    (interest, columnKey) => {
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
            <Chip color={interest.isActive ? 'success' : 'default'} size='sm' variant='flat'>
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

        case 'actions':
          return (
            <GenericTableActions
              actions={[
                viewAction({
                  tooltip: 'Ver detalles',
                  onClick: item => handleViewInterest(item)
                }),
                editAction({
                  tooltip: 'Editar categoría',
                  onClick: item => handleEditInterest(item)
                }),
                deleteAction({
                  tooltip: 'Eliminar categoría',
                  onClick: item => handleDeleteInterest(item)
                })
              ]}
              item={interest}
              loading={loading}
              size='sm'
              tableId={`interests-table`}
            />
          )

        default:
          return interest[columnKey]?.toString() || '-'
      }
    },
    [viewAction, editAction, deleteAction, loading]
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
  }, [interestForm, onSuccess, onError, onCreateClose, loadInterests])

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
  }, [selectedInterest, interestForm, onSuccess, onError, onEditClose, loadInterests])

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
  }, [selectedInterest, onSuccess, onError, onDeleteClose, loadInterests])

  // Función de búsqueda
  const handleSearch = useCallback(
    searchQuery => {
      const filteredInterests = interests.filter(
        interest =>
          interest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interest.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setInterests(filteredInterests)
    },
    [interests]
  )
  // Función de refresh
  const handleRefresh = useCallback(() => {
    loadInterests()
    // loadInterestStats()
  }, [loadInterests])

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
      {/* Main Table */}
      <GenericDataTable
        columns={columns}
        createButtonLabel='Crear Categoría'
        data={interests}
        emptyMessage='No se encontraron categorías de interés'
        enableSelection={false}
        getItemKey={item => `interest-${item.id}`}
        loading={loading}
        loadingMessage='Cargando categorías...'
        pagination={pagination}
        renderCell={renderCell}
        rowsPerPageOptions={[10, 20, 30, 50]}
        searchPlaceholder='Buscar categorías por nombre o descripción...'
        showColumnSelector={true}
        showCreateButton={true}
        showPagination={true}
        showRefreshButton={true}
        showRowsPerPage={true}
        showSearch={true}
        tableId={`interests-table`}
        onCreate={handleCreateInterest}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
      />

      {/* View Interest Modal */}
      <Modal isOpen={isViewOpen} size='2xl' onClose={onViewClose}>
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
      <Modal isOpen={isCreateOpen} scrollBehavior='inside' size='3xl' onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>Crear Nueva Categoría de Interés</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  isRequired
                  label='Nombre'
                  placeholder='ej: Essence, Rouse, Spirit'
                  value={interestForm.name}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, name: value }))}
                />
                <Input
                  label='Icono'
                  placeholder='ej: 💝, 🏳️‍🌈, ✝️'
                  value={interestForm.icon}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, icon: value }))}
                />
              </div>

              <Textarea
                isRequired
                label='Descripción breve'
                minRows={2}
                placeholder='Descripción corta para mostrar en tarjetas'
                value={interestForm.description}
                onValueChange={value => setInterestForm(prev => ({ ...prev, description: value }))}
              />

              <Textarea
                label='Descripción completa'
                minRows={3}
                placeholder='Descripción detallada para la página de categoría'
                value={interestForm.fullDescription}
                onValueChange={value => setInterestForm(prev => ({ ...prev, fullDescription: value }))}
              />

              <Input
                label='Audiencia objetivo'
                placeholder='ej: Personas heterosexuales que buscan relaciones auténticas'
                value={interestForm.targetAudience}
                onValueChange={value => setInterestForm(prev => ({ ...prev, targetAudience: value }))}
              />

              <Textarea
                label='Características (una por línea)'
                minRows={3}
                placeholder='Conexiones basadas en compatibilidad real&#10;Algoritmos diseñados para relaciones heterosexuales&#10;Comunidad enfocada en relaciones serias'
                value={interestForm.features.join('\n')}
                onValueChange={value => setInterestForm(prev => ({ ...prev, features: value.split('\n').filter(f => f.trim()) }))}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Orden de visualización'
                  type='number'
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
            <Button color='primary' isDisabled={!interestForm.name || !interestForm.description} onPress={handleCreateSubmit}>
              Crear Categoría
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Interest Modal */}
      <Modal isOpen={isEditOpen} scrollBehavior='inside' size='3xl' onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Editar Categoría de Interés</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Input
                  isRequired
                  label='Nombre'
                  value={interestForm.name}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, name: value }))}
                />
                <Input
                  label='Icono'
                  value={interestForm.icon}
                  onValueChange={value => setInterestForm(prev => ({ ...prev, icon: value }))}
                />
              </div>

              <Textarea
                isRequired
                label='Descripción breve'
                minRows={2}
                value={interestForm.description}
                onValueChange={value => setInterestForm(prev => ({ ...prev, description: value }))}
              />

              <Textarea
                label='Descripción completa'
                minRows={3}
                value={interestForm.fullDescription}
                onValueChange={value => setInterestForm(prev => ({ ...prev, fullDescription: value }))}
              />

              <Input
                label='Audiencia objetivo'
                value={interestForm.targetAudience}
                onValueChange={value => setInterestForm(prev => ({ ...prev, targetAudience: value }))}
              />

              <Textarea
                label='Características (una por línea)'
                minRows={3}
                value={interestForm.features.join('\n')}
                onValueChange={value => setInterestForm(prev => ({ ...prev, features: value.split('\n').filter(f => f.trim()) }))}
              />

              <div className='grid grid-cols-2 gap-4'>
                <Input
                  label='Orden de visualización'
                  type='number'
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
            <Button color='primary' isDisabled={!interestForm.name} onPress={handleEditSubmit}>
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
