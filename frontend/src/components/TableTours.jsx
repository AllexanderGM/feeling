import { useCallback, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip } from '@heroui/react'
import { normalizeWords } from '@utils/normalizeWords.js'
import { deleteTour } from '@services/tourService.js'

import { Eye, Trash2, Edit, Search, ChevronDown, Plus } from 'lucide-react'
import CrearTourForm from './CrearTourForm.jsx'
import EditarTourForm from './EditarTourForm.jsx'
import TableControls from './TableControls.jsx'
import DeleteTourModal from './DeleteTourModal.jsx'
import TablePagination from './ui/TablePagination.jsx'

export const INITIAL_VISIBLE_COLUMNS = [
  { name: 'NOMBRE', uid: 'nombre' },
  { name: 'DESTINO', uid: 'destino' },
  { name: 'CATEGORÍA', uid: 'categoria' },
  { name: 'PRECIO', uid: 'precio' },
  { name: 'ACCIONES', uid: 'actions' }
]
export const columns = [...INITIAL_VISIBLE_COLUMNS]

// Mapa de estilos para las categorías
const categoryStyleMap = {
  Playa: 'bg-sky-100 text-sky-700',
  Vacaciones: 'bg-emerald-100 text-emerald-700',
  Aventura: 'bg-amber-100 text-amber-700',
  Ecoturismo: 'bg-lime-100 text-lime-700',
  Lujo: 'bg-purple-100 text-purple-700',
  Ciudad: 'bg-rose-100 text-rose-700',
  Montaña: 'bg-teal-100 text-teal-700',
  Crucero: 'bg-indigo-100 text-indigo-700',
  Adrenalina: 'bg-orange-100 text-orange-700'
}

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}

const TableTours = () => {
  const [lugares, setLugares] = useState([])
  const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [tourToDelete, setTourToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [filterValue, setFilterValue] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS.map(col => col.uid)))
  const [statusFilter, setStatusFilter] = useState('all')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'nombre',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)

  const hasSearchFilter = Boolean(filterValue)

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns

    return columns.filter(column => Array.from(visibleColumns).includes(column.uid))
  }, [visibleColumns])

  // Extraemos las categorías únicas de los tours para el filtro
  const statusOptions = useMemo(() => {
    const categoriesSet = new Set()

    lugares.forEach(tour => {
      if (Array.isArray(tour.tags)) {
        tour.tags.forEach(tag => {
          categoriesSet.add(tag)
        })
      } else if (tour.categoria) {
        categoriesSet.add(tour.categoria)
      }
    })

    return Array.from(categoriesSet).map(category => ({
      name: normalizeWords(category),
      uid: category
    }))
  }, [lugares])

  const filteredItems = useMemo(() => {
    let filteredTours = [...lugares]

    if (hasSearchFilter) {
      filteredTours = filteredTours.filter(tour => tour.nombre?.toLowerCase().includes(filterValue.toLowerCase()))
    }

    if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
      filteredTours = filteredTours.filter(tour => {
        // Si tour.tags es un array, verificamos si contiene alguno de los valores seleccionados
        if (Array.isArray(tour.tags)) {
          return tour.tags.some(tag => Array.from(statusFilter).includes(tag))
        }

        // Si categoria es una sola cadena (primer tag)
        return Array.from(statusFilter).includes(tour.categoria)
      })
    }

    return filteredTours
  }, [lugares, filterValue, statusFilter, hasSearchFilter, statusOptions.length])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column]
      const second = b[sortDescriptor.column]
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [sortDescriptor, items])

  const fetchLugares = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching tours from:', `${URL}/tours`)
      const response = await fetch(`${URL}/tours`)

      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status}`)
      }

      const data = await response.json()
      console.log('Tours recibidos:', data)

      // Procesar los datos según la estructura real del backend
      const processedData = Array.isArray(data)
        ? data.map(tour => ({
            idPaquete: tour.id,
            nombre: tour.name || 'Sin nombre',
            destino: tour.destination?.city?.name || tour.destination?.country || 'Sin destino',
            // Usamos el primer tag como categoría principal para mostrar en la tabla
            categoria: Array.isArray(tour.tags) && tour.tags.length > 0 ? tour.tags[0] : 'Sin categoría',
            precio: tour.adultPrice || 0,
            imagenes: Array.isArray(tour.images) ? tour.images : [],
            description: tour.description,
            childPrice: tour.childPrice,
            status: tour.status?.status,
            // Guardamos todos los tags originales para el filtrado
            tags: tour.tags,
            includes: tour.includes,
            destination: tour.destination,
            hotel: tour.hotel,
            availability: tour.availability
          }))
        : []

      setLugares(processedData)
    } catch (error) {
      console.error('Error fetching tours:', error)
      setError(error.message)

      // Si estamos en modo desarrollo y falla, intentar cargar datos de ejemplo
      if (import.meta.env.DEV) {
        try {
          const response = await fetch('/data/tours.json')
          if (response.ok) {
            const mockData = await response.json()
            const processedMockData = mockData.map(tour => ({
              idPaquete: tour.id,
              nombre: tour.name || 'Sin nombre',
              destino: tour.destination?.city?.name || tour.destination?.country || 'Sin destino',
              categoria: Array.isArray(tour.tags) && tour.tags.length > 0 ? tour.tags[0] : 'Sin categoría',
              precio: tour.adultPrice || 0,
              imagenes: Array.isArray(tour.images) ? tour.images : [],
              description: tour.description,
              childPrice: tour.childPrice,
              status: tour.status?.status,
              tags: tour.tags,
              includes: tour.includes,
              destination: tour.destination,
              hotel: tour.hotel,
              availability: tour.availability
            }))
            setLugares(processedMockData)
            setError('Usando datos de desarrollo (mock)')
          }
        } catch (mockError) {
          console.error('Error cargando datos de ejemplo:', mockError)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [URL])

  useEffect(() => {
    fetchLugares()
  }, [fetchLugares])

  // Funciones para manejar la edición
  const handleOpenEditModal = useCallback(tour => {
    setEditingTour(tour)
    setIsEditModalOpen(true)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setEditingTour(null)
  }, [])

  const handleTourUpdated = useCallback(
    updatedTour => {
      console.log('Tour actualizado:', updatedTour)
      fetchLugares() // Actualizamos la lista después de editar
    },
    [fetchLugares]
  )

  // 3. Función para abrir el modal de confirmación de eliminación
  const handleOpenDeleteModal = useCallback(tour => {
    setTourToDelete(tour)
    setIsDeleteModalOpen(true)
    setDeleteError(null)
  }, [])

  // 4. Función para cerrar el modal de confirmación
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setTourToDelete(null)
    setDeleteError(null)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!tourToDelete) return

    try {
      setDeleteLoading(true)
      setDeleteError(null)

      const success = await deleteTour(tourToDelete.idPaquete)

      if (success) {
        // Actualizar la lista después de eliminar
        fetchLugares()
        setIsDeleteModalOpen(false)
        setTourToDelete(null)
      } else {
        setDeleteError('No se pudo eliminar el tour. Intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error al eliminar tour:', error)
      setDeleteError(`Error: ${error.message || 'No se pudo eliminar el tour'}`)
    } finally {
      setDeleteLoading(false)
    }
  }, [tourToDelete, fetchLugares])

  const renderCell = useCallback(
    (lugar, columnKey) => {
      const cellValue = lugar[columnKey]

      switch (columnKey) {
        case 'nombre':
          return (
            <User
              avatarProps={{
                radius: 'lg',
                src: lugar.imagenes && lugar.imagenes.length > 0 ? lugar.imagenes[0] : 'https://via.placeholder.com/150'
              }}
              name={cellValue || 'Sin nombre'}
              description={
                lugar.description ? (lugar.description.length > 30 ? `${lugar.description.substring(0, 30)}...` : lugar.description) : ''
              }
            />
          )
        case 'categoria':
          if (!Array.isArray(lugar.tags) || lugar.tags.length === 0) {
            return (
              <Chip className="capitalize bg-gray-100 text-gray-700" size="sm" variant="flat">
                No definida
              </Chip>
            )
          }

          // Si hay solo una categoría, mostrarla
          if (lugar.tags.length === 1) {
            return (
              <Chip
                className={`capitalize ${categoryStyleMap[normalizeWords(lugar.tags[0])] || 'bg-gray-100 text-gray-700'}`}
                size="sm"
                variant="flat">
                {normalizeWords(lugar.tags[0])}
              </Chip>
            )
          }

          // Si hay múltiples categorías, mostrar la primera y un indicador
          return (
            <div className="flex items-center gap-1">
              <Chip
                className={`capitalize ${categoryStyleMap[normalizeWords(lugar.tags[0])] || 'bg-gray-100 text-gray-700'}`}
                size="sm"
                variant="flat">
                {normalizeWords(lugar.tags[0])}
              </Chip>
              <Tooltip
                content={
                  <div className="px-1 py-2">
                    <p className="font-bold text-small mb-2">Otras categorías:</p>
                    <div className="flex flex-col gap-2">
                      {lugar.tags.slice(1).map(tag => (
                        <Chip
                          key={tag}
                          className={`capitalize ${categoryStyleMap[normalizeWords(tag)] || 'bg-gray-100 text-gray-700'}`}
                          size="sm"
                          variant="flat">
                          {normalizeWords(tag)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                }>
                <Chip className="capitalize cursor-help bg-gray-100 text-gray-700" size="sm" variant="flat">
                  +{lugar.tags.length - 1}
                </Chip>
              </Tooltip>
            </div>
          )
        case 'precio':
          // Formateamos el precio con separadores de miles y 2 decimales
          return `${(cellValue || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        case 'destino':
          // Mostramos el destino con más detalle si está disponible
          if (lugar.destination) {
            const fullDestination = [lugar.destination.city?.name, lugar.destination.country].filter(Boolean).join(', ')
            return fullDestination || cellValue || 'Sin destino'
          }
          return cellValue || 'Sin destino'
        case 'actions':
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Tooltip content="Detalles">
                <Link to={`/tour/${lugar.idPaquete}`} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EyeIcon />
                </Link>
              </Tooltip>
              <Tooltip content="Editar">
                <span onClick={() => handleOpenEditModal(lugar)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Eliminar">
                <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleOpenDeleteModal(lugar)}>
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          )
        default:
          return cellValue || '-'
      }
    },
    [handleOpenEditModal]
  )

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1)
    }
  }, [page, pages])

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const onRowsPerPageChange = useCallback(newValue => {
    console.log('TableTours - Setting rows per page to:', newValue)
    setRowsPerPage(newValue)
    setPage(1)
  }, [])

  const onSearchChange = useCallback(value => {
    if (value) {
      setFilterValue(value)
      setPage(1)
    } else {
      setFilterValue('')
    }
  }, [])

  const onClear = useCallback(() => {
    setFilterValue('')
    setPage(1)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchLugares()
  }, [fetchLugares])

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  const handleTourCreated = useCallback(
    newTour => {
      console.log('Tour creado:', newTour)
      fetchLugares() // Actualizamos la lista después de crear
    },
    [fetchLugares]
  )

  const bottomContent = useMemo(() => {
    return (
      <TablePagination
        selectedKeys={selectedKeys}
        filteredItemsLength={filteredItems.length}
        page={page}
        pages={pages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageChange={setPage}
      />
    )
  }, [selectedKeys, filteredItems.length, page, pages, onPreviousPage, onNextPage])

  const topContent = useMemo(() => {
    return (
      <TableControls
        filterValue={filterValue}
        onClear={onClear}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        onCreateTour={handleOpenCreateModal}
        loading={loading}
        error={error}
        totalItems={lugares.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    )
  }, [
    filterValue,
    onClear,
    onSearchChange,
    statusFilter,
    setStatusFilter,
    statusOptions,
    visibleColumns,
    setVisibleColumns,
    handleOpenCreateModal,
    loading,
    error,
    lugares.length,
    rowsPerPage,
    onRowsPerPageChange
  ])

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Tours Table"
        className="w-full max-w-6xl mt-6"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}>
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={sortedItems}
          emptyContent={loading ? 'Cargando...' : error ? `Error: ${error}` : 'No se encontraron paquetes'}
          loadingContent={<div>Cargando tours...</div>}
          loadingState={loading ? 'loading' : 'idle'}>
          {item => (
            <TableRow key={item.idPaquete || item.id || Math.random().toString()}>
              {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal para crear nuevo tour */}
      <CrearTourForm isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSuccess={handleTourCreated} />

      {/* Modal para editar tour */}
      {editingTour && (
        <EditarTourForm isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSuccess={handleTourUpdated} tourData={editingTour} />
      )}
      <DeleteTourModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        tourData={tourToDelete}
        isLoading={deleteLoading}
        error={deleteError}
      />
    </>
  )
}

export default TableTours
