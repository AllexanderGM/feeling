import { useState, useCallback, useEffect, memo } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Button,
  Chip,
  Avatar,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { Users, Check, X, Mail, UserIcon, Download, Filter } from 'lucide-react'
import GenericDataTable from '@components/common/GenericDataTable.jsx'
import GenericTableActions from '@components/common/GenericTableActions.jsx'
import { useError, useTableActions } from '@hooks'
import { formatJavaDateForDisplay } from '@utils/dateUtils.js'
import { USER_ROLE_COLORS } from '@constants/tableConstants.js'
import { Logger } from '@utils/logger'

// Datos de ejemplo para demostrar la tabla
const generateExampleData = (count = 50) => {
  const names = ['Ana', 'Carlos', 'María', 'Juan', 'Sofia', 'Diego', 'Elena', 'Roberto', 'Lucia', 'Miguel']
  const lastNames = ['García', 'Rodriguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores']
  const roles = ['CLIENT', 'ADMIN', 'MODERATOR']
  const statuses = ['ACTIVE', 'PENDING', 'INACTIVE', 'BANNED']
  const countries = ['Colombia', 'México', 'España', 'Argentina', 'Chile']

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: names[Math.floor(Math.random() * names.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    age: Math.floor(Math.random() * 50) + 18,
    verified: Math.random() > 0.3,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: Math.random() > 0.5 ? `https://i.pravatar.cc/100?img=${index + 1}` : null,
    score: Math.floor(Math.random() * 100),
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

// Definición de columnas para la tabla
const tableColumns = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'EDAD', uid: 'age', sortable: true },
  { name: 'ROL', uid: 'role', sortable: true },
  { name: 'ESTADO', uid: 'status', sortable: true },
  { name: 'PAÍS', uid: 'country', sortable: true },
  { name: 'VERIFICADO', uid: 'verified', sortable: true },
  { name: 'PUNTUACIÓN', uid: 'score', sortable: true },
  { name: 'REGISTRO', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

const GenericTableExample = memo(() => {
  const { handleError, handleSuccess } = useError()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Estados de la tabla
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState({ column: 'name', direction: 'ascending' })

  // Paginación simulada
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 5,
    totalElements: 50
  })

  // Simular usuario actual para permisos
  const currentUser = {
    id: 1,
    email: 'admin@example.com',
    role: 'ADMIN'
  }

  // Inicializar datos
  useEffect(() => {
    const exampleData = generateExampleData(50)

    setData(exampleData)
    setFilteredData(exampleData.slice(0, 10))
  }, [])

  // Función de renderizado de celdas
  const renderCell = useCallback(
    (item, columnKey) => {
      const cellValue = item[columnKey]

      switch (columnKey) {
        case 'user':
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='w-10 h-10' icon={<UserIcon className='w-6 h-6 text-default-500' />} radius='lg' src={item.avatar} />
              <div className='flex flex-col'>
                <p className='text-sm font-semibold text-foreground'>{`${item.name} ${item.lastName}`}</p>
                <p className='text-xs text-default-500'>{item.email}</p>
              </div>
            </div>
          )

        case 'age':
          return (
            <div className='flex flex-col items-center'>
              <span className='text-sm font-semibold'>{item.age}</span>
              <span className='text-xs text-default-500'>años</span>
            </div>
          )

        case 'role':
          return (
            <Chip className='capitalize' color={USER_ROLE_COLORS[item.role] || 'default'} size='sm' variant='flat'>
              {item.role?.toLowerCase()}
            </Chip>
          )

        case 'status':
          const statusColors = {
            ACTIVE: 'success',
            PENDING: 'warning',
            INACTIVE: 'default',
            BANNED: 'danger'
          }

          return (
            <Chip className='capitalize' color={statusColors[item.status] || 'default'} size='sm' variant='flat'>
              {item.status?.toLowerCase()}
            </Chip>
          )

        case 'country':
          return <p className='text-sm'>{item.country}</p>

        case 'verified':
          return (
            <Chip color={item.verified ? 'success' : 'danger'} size='sm' variant='flat'>
              {item.verified ? 'Sí' : 'No'}
            </Chip>
          )

        case 'score':
          return (
            <div className='flex flex-col items-center gap-1'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-2 bg-default-200 rounded-full overflow-hidden'>
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.score >= 80
                        ? 'bg-success-500'
                        : item.score >= 60
                          ? 'bg-warning-500'
                          : item.score >= 40
                            ? 'bg-primary-500'
                            : 'bg-danger-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className='text-xs font-semibold'>{item.score}</span>
              </div>
            </div>
          )

        case 'createdAt':
          const formattedDate = formatJavaDateForDisplay(item.createdAt)

          return (
            <div className='flex flex-col'>
              <p className='text-sm font-semibold'>{formattedDate}</p>
            </div>
          )

        case 'actions':
          return (
            <GenericTableActions
              actions={tableActions}
              item={item}
              loading={loading}
              tableId='example-table'
              onActionExecute={handleActionExecute}
            />
          )

        default:
          return cellValue || 'N/A'
      }
    },
    [loading]
  )

  // Crear acciones usando el hook helper
  const { viewAction, editAction, deleteAction, approveAction, rejectAction } = useTableActions()

  // Definir acciones de la tabla
  const tableActions = [
    viewAction({
      onClick: handleView,
      tooltip: {
        content: 'Ver detalles del usuario',
        className: 'bg-blue-900/95 border border-blue-400/50 backdrop-blur-sm',
        contentClassName: 'text-blue-100 font-medium'
      }
    }),
    editAction({
      onClick: handleEdit,
      tooltip: {
        content: 'Editar usuario',
        className: 'bg-orange-900/95 border border-orange-400/50 backdrop-blur-sm',
        contentClassName: 'text-orange-100 font-medium'
      },
      isVisible: item => item.role !== 'ADMIN' || currentUser.role === 'ADMIN',
      isDisabled: item => item.email === currentUser?.email
    }),
    {
      key: 'email',
      label: 'Email',
      icon: Mail,
      tooltip: {
        content: 'Enviar correo electrónico',
        className: 'bg-purple-900/95 border border-purple-400/50 backdrop-blur-sm',
        contentClassName: 'text-purple-100 font-medium'
      },
      onClick: handleSendEmail,
      isVisible: item => item.verified,
      className: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
    },
    approveAction({
      onClick: handleApprove,
      tooltip: {
        content: 'Aprobar usuario',
        className: 'bg-green-900/95 border border-green-400/50 backdrop-blur-sm',
        contentClassName: 'text-green-100 font-semibold'
      },
      isVisible: item => item.status === 'PENDING'
    }),
    rejectAction({
      onClick: handleReject,
      tooltip: {
        content: 'Rechazar usuario',
        className: 'bg-orange-900/95 border border-orange-400/50 backdrop-blur-sm',
        contentClassName: 'text-orange-100 font-semibold'
      },
      isVisible: item => item.status === 'PENDING'
    }),
    deleteAction({
      onClick: handleDelete,
      tooltip: {
        content: 'Eliminar usuario',
        className: 'bg-red-900/95 border border-red-400/50 backdrop-blur-sm shadow-lg',
        contentClassName: 'text-red-100 font-bold text-sm'
      },
      isVisible: item => item.status !== 'ACTIVE',
      isDisabled: item => item.email === currentUser?.email
    })
  ]

  // Funciones de manejo de acciones
  function handleView(item) {
    setSelectedItem(item)
    onOpen()
  }

  function handleEdit(item) {
    handleSuccess(`Editando usuario: ${item.name} ${item.lastName}`)
  }

  function handleDelete(item) {
    if (confirm(`¿Estás seguro de eliminar a ${item.name} ${item.lastName}?`)) {
      setData(prev => prev.filter(u => u.id !== item.id))
      setFilteredData(prev => prev.filter(u => u.id !== item.id))
      handleSuccess(`Usuario ${item.name} ${item.lastName} eliminado`)
    }
  }

  function handleSendEmail(item) {
    handleSuccess(`Correo enviado a ${item.email}`)
  }

  function handleApprove(item) {
    setData(prev => prev.map(u => (u.id === item.id ? { ...u, status: 'ACTIVE' } : u)))
    setFilteredData(prev => prev.map(u => (u.id === item.id ? { ...u, status: 'ACTIVE' } : u)))
    handleSuccess(`Usuario ${item.name} ${item.lastName} aprobado`)
  }

  function handleReject(item) {
    setData(prev => prev.map(u => (u.id === item.id ? { ...u, status: 'BANNED' } : u)))
    setFilteredData(prev => prev.map(u => (u.id === item.id ? { ...u, status: 'BANNED' } : u)))
    handleError(`Usuario ${item.name} ${item.lastName} rechazado`)
  }

  // Callback para tracking de acciones
  const handleActionExecute = useCallback((actionKey, item, status, error) => {
    Logger.info('Action executed:', { actionKey, item: item.id, status, error }, { category: Logger.CATEGORIES.USER })
  }, [])

  // Simular búsqueda
  const handleSearch = useCallback(
    query => {
      setSearchQuery(query)
      setLoading(true)

      setTimeout(() => {
        const filtered = data.filter(
          item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.lastName.toLowerCase().includes(query.toLowerCase()) ||
            item.email.toLowerCase().includes(query.toLowerCase()) ||
            item.country.toLowerCase().includes(query.toLowerCase())
        )

        const startIndex = (pagination.page - 1) * pagination.size
        const endIndex = startIndex + pagination.size

        setFilteredData(filtered.slice(startIndex, endIndex))

        setPagination(prev => ({
          ...prev,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / prev.size)
        }))

        setLoading(false)
      }, 500)
    },
    [data, pagination.page, pagination.size]
  )

  // Simular refresh
  const handleRefresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      handleSearch(searchQuery)
    }, 1000)
  }, [searchQuery, handleSearch])

  // Simular creación
  const handleCreate = useCallback(() => {
    handleSuccess('Función de crear usuario - aquí iría el modal de creación')
  }, [handleSuccess])

  // Simular cambio de página
  const handlePageChange = useCallback(
    page => {
      setPagination(prev => ({ ...prev, page }))
      setLoading(true)

      setTimeout(() => {
        // Filtrar datos según búsqueda actual
        const filtered = data.filter(
          item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.country.toLowerCase().includes(searchQuery.toLowerCase())
        )

        // Aplicar paginación a los datos filtrados
        const startIndex = (page - 1) * pagination.size
        const endIndex = startIndex + pagination.size

        setFilteredData(filtered.slice(startIndex, endIndex))
        setLoading(false)
      }, 300)
    },
    [data, pagination.size, searchQuery]
  )

  // Simular cambio de filas por página
  const handleRowsPerPageChange = useCallback(
    size => {
      // Filtrar datos según búsqueda actual
      const filtered = data.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.country.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setPagination(prev => ({
        ...prev,
        size,
        page: 1,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size)
      }))

      // Aplicar paginación con el nuevo tamaño
      setLoading(true)
      setTimeout(() => {
        setFilteredData(filtered.slice(0, size))
        setLoading(false)
      }, 300)
    },
    [data, searchQuery]
  )

  // Simular ordenación
  const handleSort = useCallback(
    descriptor => {
      setSortDescriptor(descriptor)
      setLoading(true)

      setTimeout(() => {
        const sorted = [...filteredData].sort((a, b) => {
          const first = a[descriptor.column]
          const second = b[descriptor.column]
          const cmp = first < second ? -1 : first > second ? 1 : 0

          return descriptor.direction === 'descending' ? -cmp : cmp
        })

        setFilteredData(sorted)
        setLoading(false)
      }, 300)
    },
    [filteredData]
  )

  // Acciones adicionales en el top
  const topActions = (
    <div className='flex items-center gap-2'>
      <Button size='sm' startContent={<Download className='w-4 h-4' />} variant='flat'>
        Exportar
      </Button>
      <Button size='sm' startContent={<Filter className='w-4 h-4' />} variant='flat'>
        Filtros
      </Button>
    </div>
  )

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Ejemplo de Tabla Genérica | Feeling</title>
        <meta content='Demostración del componente GenericDataTable' name='description' />
      </Helmet>

      {/* Header */}
      <Card>
        <CardBody>
          <div className='flex flex-col gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-200'>Ejemplo de Tabla Genérica</h1>
              <p className='text-gray-400'>Demostración completa del componente GenericDataTable con todas sus funcionalidades</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center'>
                  <Users className='w-5 h-5 text-primary-400' />
                </div>
                <div>
                  <p className='text-sm text-default-500'>Total Usuarios</p>
                  <p className='font-semibold'>{pagination.totalElements}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-success-500/20 rounded-full flex items-center justify-center'>
                  <Check className='w-5 h-5 text-success-400' />
                </div>
                <div>
                  <p className='text-sm text-default-500'>Activos</p>
                  <p className='font-semibold'>{data.filter(u => u.status === 'ACTIVE').length}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-warning-500/20 rounded-full flex items-center justify-center'>
                  <X className='w-5 h-5 text-warning-400' />
                </div>
                <div>
                  <p className='text-sm text-default-500'>Pendientes</p>
                  <p className='font-semibold'>{data.filter(u => u.status === 'PENDING').length}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-danger-500/20 rounded-full flex items-center justify-center'>
                  <X className='w-5 h-5 text-danger-400' />
                </div>
                <div>
                  <p className='text-sm text-default-500'>Bloqueados</p>
                  <p className='font-semibold'>{data.filter(u => u.status === 'BANNED').length}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla Genérica */}
      <GenericDataTable
        columns={tableColumns}
        createButtonLabel='Crear Usuario'
        data={filteredData}
        emptyMessage='No se encontraron usuarios que coincidan con los criterios de búsqueda'
        enableSelection={false}
        getItemKey={item => `user-${item.id}`}
        loading={loading}
        loadingMessage='Cargando usuarios de ejemplo...'
        pagination={pagination}
        renderCell={renderCell}
        rowsPerPageOptions={[5, 10, 25, 50]}
        searchPlaceholder='Buscar por nombre, email o país...'
        showColumnSelector={true}
        showCreateButton={true}
        showPagination={true}
        showRefreshButton={true}
        showRowsPerPage={true}
        showSearch={true}
        sortDescriptor={sortDescriptor}
        tableId='example-users-table'
        topActions={topActions}
        onCreate={handleCreate}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        onSort={handleSort}
      />

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} scrollBehavior='inside' size='2xl' onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-xl font-semibold'>Detalles del Usuario</h3>
                {selectedItem && (
                  <p className='text-sm text-default-500'>
                    {selectedItem.name} {selectedItem.lastName}
                  </p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedItem && (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='w-16 h-16' icon={<UserIcon className='w-8 h-8' />} src={selectedItem.avatar} />
                      <div>
                        <h4 className='text-lg font-semibold'>
                          {selectedItem.name} {selectedItem.lastName}
                        </h4>
                        <p className='text-default-500'>{selectedItem.email}</p>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm font-medium text-default-600'>Edad</p>
                        <p className='text-lg'>{selectedItem.age} años</p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-default-600'>País</p>
                        <p className='text-lg'>{selectedItem.country}</p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-default-600'>Rol</p>
                        <Chip color={USER_ROLE_COLORS[selectedItem.role]} variant='flat'>
                          {selectedItem.role}
                        </Chip>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-default-600'>Estado</p>
                        <Chip
                          color={selectedItem.status === 'ACTIVE' ? 'success' : selectedItem.status === 'PENDING' ? 'warning' : 'danger'}
                          variant='flat'>
                          {selectedItem.status}
                        </Chip>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-default-600'>Verificado</p>
                        <Chip color={selectedItem.verified ? 'success' : 'danger'} variant='flat'>
                          {selectedItem.verified ? 'Sí' : 'No'}
                        </Chip>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-default-600'>Puntuación</p>
                        <p className='text-lg'>{selectedItem.score}/100</p>
                      </div>
                    </div>

                    <div>
                      <p className='text-sm font-medium text-default-600 mb-2'>Fecha de Registro</p>
                      <p>{formatJavaDateForDisplay(selectedItem.createdAt)}</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cerrar
                </Button>
                <Button color='primary' onPress={onClose}>
                  Entendido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
})

GenericTableExample.displayName = 'GenericTableExample'

export default GenericTableExample
