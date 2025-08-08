import { useState, useMemo } from 'react'
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import {
  Heart,
  HeartOff,
  MessageCircle,
  MapPin,
  Calendar,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Star,
  Sparkles,
  Flame,
  Users,
  Grid3X3,
  List,
  Clock,
  Trash2,
  Send
} from 'lucide-react'
import { Logger } from '@utils/logger.js'

// Hooks
import { useAuth, useUserInterests } from '@hooks'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import UserCard from '@components/ui/UserCard.jsx'

const Favorites = () => {
  const { user, loading: authLoading } = useAuth()
  const { getInterestByEnum, loading: interestLoading } = useUserInterests()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure()

  // Datos simulados de favoritos
  const favoritesData = useMemo(
    () => [
      {
        id: 1,
        name: 'Sofia García',
        age: 28,
        distance: 3,
        location: 'Bogotá',
        category: 'ESSENCE',
        image: '/api/placeholder/150/150',
        compatibility: 95,
        dateAdded: new Date('2024-01-10T14:30:00Z'),
        isOnline: true,
        hasMessage: false,
        commonInterests: ['Música', 'Viajes', 'Fotografía'],
        description: 'Amante de la música y los viajes. Siempre buscando nuevas aventuras y experiencias auténticas.',
        photos: ['/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150']
      },
      {
        id: 2,
        name: 'Ana María López',
        age: 26,
        distance: 8,
        location: 'Cali',
        category: 'ROUSE',
        image: '/api/placeholder/150/150',
        compatibility: 92,
        dateAdded: new Date('2024-01-08T18:45:00Z'),
        isOnline: false,
        hasMessage: true,
        commonInterests: ['Arte', 'Naturaleza', 'Yoga'],
        description: 'Artista y yogui. Encuentro inspiración en la naturaleza y en las pequeñas cosas de la vida.',
        photos: ['/api/placeholder/150/150', '/api/placeholder/150/150']
      },
      {
        id: 3,
        name: 'Isabella Castro',
        age: 27,
        distance: 4,
        location: 'Medellín',
        category: 'ROUSE',
        image: '/api/placeholder/150/150',
        compatibility: 89,
        dateAdded: new Date('2024-01-05T12:20:00Z'),
        isOnline: true,
        hasMessage: false,
        commonInterests: ['Fotografía', 'Café', 'Literatura'],
        description: 'Fotógrafa freelance y amante del buen café. Siempre con un libro en la mano.',
        photos: ['/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150']
      },
      {
        id: 4,
        name: 'Valentina Torres',
        age: 29,
        distance: 2,
        location: 'Bogotá',
        category: 'ESSENCE',
        image: '/api/placeholder/150/150',
        compatibility: 94,
        dateAdded: new Date('2024-01-02T09:15:00Z'),
        isOnline: false,
        hasMessage: true,
        commonInterests: ['Cocina', 'Danza', 'Viajes'],
        description: 'Chef profesional y bailarina en tiempo libre. La vida es para disfrutarla al máximo.',
        photos: ['/api/placeholder/150/150', '/api/placeholder/150/150']
      },
      {
        id: 5,
        name: 'Camila Restrepo',
        age: 25,
        distance: 6,
        location: 'Medellín',
        category: 'SPIRIT',
        image: '/api/placeholder/150/150',
        compatibility: 87,
        dateAdded: new Date('2023-12-28T16:40:00Z'),
        isOnline: true,
        hasMessage: false,
        commonInterests: ['Fe', 'Voluntariado', 'Lectura'],
        description: 'Enfermera de vocación. Creo en el poder de ayudar a otros y en la importancia de la fe.',
        photos: ['/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150']
      }
    ],
    []
  )

  // Filtrar y ordenar favoritos
  const filteredFavorites = useMemo(() => {
    let filtered = favoritesData

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        fav =>
          fav.name.toLowerCase().includes(searchLower) ||
          fav.location.toLowerCase().includes(searchLower) ||
          fav.commonInterests.some(interest => interest.toLowerCase().includes(searchLower))
      )
    }

    // Filtro por categoría
    if (filterCategory !== 'all') {
      filtered = filtered.filter(fav => fav.category === filterCategory.toUpperCase())
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'age':
          aValue = a.age
          bValue = b.age
          break
        case 'distance':
          aValue = a.distance
          bValue = b.distance
          break
        case 'compatibility':
          aValue = a.compatibility
          bValue = b.compatibility
          break
        case 'dateAdded':
        default:
          aValue = new Date(a.dateAdded)
          bValue = new Date(b.dateAdded)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [favoritesData, searchTerm, filterCategory, sortBy, sortOrder])

  // Obtener icono de categoría
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-4 h-4 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-4 h-4 text-red-400' />
      case 'SPIRIT':
        return <Star className='w-4 h-4 text-purple-400' />
      default:
        return <Heart className='w-4 h-4 text-gray-400' />
    }
  }

  const getTimeAgo = date => {
    const now = new Date()
    const diffInDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} sem`
    return `Hace ${Math.floor(diffInDays / 30)} meses`
  }

  const handleRemoveFromFavorites = profileId => {
    Logger.info(Logger.CATEGORIES.USER, 'remove_favorite', 'Eliminar de favoritos', { profileId })
  }

  const handleViewProfile = profile => {
    setSelectedProfile(profile)
    onProfileOpen()
  }

  const handleSendMessage = profile => {
    Logger.info(Logger.CATEGORIES.USER, 'send_message', 'Enviar mensaje a usuario', {
      profileName: profile.name,
      profileId: profile.id
    })
  }

  const sortOptions = [
    { value: 'dateAdded', label: 'Fecha agregado' },
    { value: 'name', label: 'Nombre' },
    { value: 'age', label: 'Edad' },
    { value: 'distance', label: 'Distancia' },
    { value: 'compatibility', label: 'Compatibilidad' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'essence', label: 'Essence' },
    { value: 'rouse', label: 'Rouse' },
    { value: 'spirit', label: 'Spirit' }
  ]

  const isLoading = authLoading || interestLoading

  if (isLoading) return <LoadData>Cargando favoritos...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de favoritos'>
      {/* Header de favoritos */}
      <div className='w-full bg-gradient-to-br from-pink-900/20 via-red-800/10 to-purple-900/20 backdrop-blur-sm rounded-xl border border-pink-700/50 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-4'>
          {/* Información principal */}
          <div className='text-center sm:text-left'>
            <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
              <div className='w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center'>
                <Heart className='w-5 h-5 text-pink-400' />
              </div>
              <div>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>Mis Favoritos</h1>
                <p className='text-sm text-gray-400'>Perfiles que has guardado</p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='flex items-center gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-pink-400'>{favoritesData.length}</div>
              <div className='text-xs text-gray-400'>Total</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-400'>{favoritesData.filter(f => f.isOnline).length}</div>
              <div className='text-xs text-gray-400'>En línea</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-400'>{favoritesData.filter(f => f.hasMessage).length}</div>
              <div className='text-xs text-gray-400'>Con mensajes</div>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className='mt-4 flex flex-col sm:flex-row gap-3'>
          <div className='flex-1'>
            <Input
              placeholder='Buscar en favoritos...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              startContent={<Search className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 backdrop-blur-sm border-gray-600'
              }}
            />
          </div>

          <div className='flex items-center gap-2'>
            {/* Filtro por categoría */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='bordered'
                  startContent={<Filter className='w-4 h-4' />}
                  className='border-gray-600 text-gray-300 hover:bg-gray-700/30'>
                  Categoría
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filterCategory]}
                onSelectionChange={keys => setFilterCategory(Array.from(keys)[0])}
                selectionMode='single'
                classNames={{
                  base: 'bg-gray-800 border-gray-600'
                }}>
                {categoryOptions.map(option => (
                  <DropdownItem key={option.value} className='text-gray-200 hover:bg-gray-700'>
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Ordenamiento */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='bordered'
                  startContent={sortOrder === 'asc' ? <SortAsc className='w-4 h-4' /> : <SortDesc className='w-4 h-4' />}
                  className='border-gray-600 text-gray-300 hover:bg-gray-700/30'>
                  Ordenar
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                classNames={{
                  base: 'bg-gray-800 border-gray-600'
                }}>
                {sortOptions.map(option => (
                  <DropdownItem key={option.value} className='text-gray-200 hover:bg-gray-700' onPress={() => setSortBy(option.value)}>
                    {option.label}
                  </DropdownItem>
                ))}
                <DropdownItem className='border-t border-gray-600 mt-2 pt-2'>
                  <Button
                    size='sm'
                    variant='light'
                    className='w-full justify-start text-gray-300'
                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  </Button>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* Cambiar vista */}
            <div className='flex items-center rounded-lg border border-gray-600 overflow-hidden'>
              <Button
                isIconOnly
                size='sm'
                variant={viewMode === 'grid' ? 'solid' : 'light'}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                className={viewMode === 'grid' ? '' : 'text-gray-400'}
                onPress={() => setViewMode('grid')}>
                <Grid3X3 className='w-4 h-4' />
              </Button>
              <Button
                isIconOnly
                size='sm'
                variant={viewMode === 'list' ? 'solid' : 'light'}
                color={viewMode === 'list' ? 'primary' : 'default'}
                className={viewMode === 'list' ? '' : 'text-gray-400'}
                onPress={() => setViewMode('list')}>
                <List className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de favoritos */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          {filteredFavorites.length === 0 ? (
            <div className='text-center py-12'>
              {searchTerm || filterCategory !== 'all' ? (
                <>
                  <Search className='w-12 h-12 text-gray-500 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-400 mb-2'>No se encontraron favoritos</h3>
                  <p className='text-gray-500 mb-4'>Intenta ajustar los filtros o términos de búsqueda</p>
                  <Button
                    variant='bordered'
                    className='border-gray-600 text-gray-300'
                    onPress={() => {
                      setSearchTerm('')
                      setFilterCategory('all')
                    }}>
                    Limpiar filtros
                  </Button>
                </>
              ) : (
                <>
                  <Heart className='w-12 h-12 text-gray-500 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-400 mb-2'>¡Aún no tienes favoritos!</h3>
                  <p className='text-gray-500 mb-4'>Guarda perfiles que te interesen para encontrarlos fácilmente aquí</p>
                  <Button
                    color='primary'
                    startContent={<Users className='w-4 h-4' />}
                    className='bg-gradient-to-r from-primary-500 to-purple-500'>
                    Explorar Perfiles
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Vista Grid */}
              {viewMode === 'grid' && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {filteredFavorites.map(favorite => (
                    <UserCard
                      key={favorite.id}
                      user={{
                        ...favorite,
                        interests: favorite.commonInterests,
                        lastActivity: favorite.dateAdded
                      }}
                      variant='default'
                      onViewProfile={handleViewProfile}
                      onMessage={handleSendMessage}
                      onToggleFavorite={handleRemoveFromFavorites}
                      isFavorite={true}
                      showCompatibility={true}
                      showDistance={true}
                      showLastActivity={true}
                    />
                  ))}
                </div>
              )}

              {/* Vista Lista */}
              {viewMode === 'list' && (
                <div className='space-y-3'>
                  {filteredFavorites.map(favorite => (
                    <UserCard
                      key={favorite.id}
                      user={{
                        ...favorite,
                        interests: favorite.commonInterests,
                        lastActivity: favorite.dateAdded
                      }}
                      variant='compact'
                      onViewProfile={handleViewProfile}
                      onMessage={handleSendMessage}
                      onToggleFavorite={handleRemoveFromFavorites}
                      isFavorite={true}
                      showCompatibility={true}
                      showDistance={true}
                      showLastActivity={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal de perfil detallado */}
      <Modal
        isOpen={isProfileOpen}
        onOpenChange={onProfileOpenChange}
        size='3xl'
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {selectedProfile && (
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <Avatar src={selectedProfile.image} alt={selectedProfile.name} className='w-16 h-16' />
                      {selectedProfile.isOnline && (
                        <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-gray-900 rounded-full' />
                      )}
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-200'>{selectedProfile.name}</h3>
                      <p className='text-gray-400'>
                        {selectedProfile.age} años • {selectedProfile.location}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <Chip color='danger' variant='flat' size='sm'>
                          {selectedProfile.compatibility}% match
                        </Chip>
                        <Chip color={selectedProfile.isOnline ? 'success' : 'default'} variant='flat' size='sm'>
                          {selectedProfile.isOnline ? 'En línea' : 'Desconectado'}
                        </Chip>
                      </div>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className='py-6'>
                {selectedProfile && (
                  <div className='space-y-6'>
                    {/* Descripción */}
                    <div>
                      <h4 className='font-semibold text-gray-200 mb-2'>Acerca de {selectedProfile.name}</h4>
                      <p className='text-gray-300 text-sm'>{selectedProfile.description}</p>
                    </div>

                    {/* Información */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <h4 className='font-semibold text-gray-200 mb-2'>Información</h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-300'>
                              {selectedProfile.location} ({selectedProfile.distance} km)
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-300'>{selectedProfile.age} años</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            {getCategoryIcon(selectedProfile.category)}
                            <span className='text-gray-300'>Categoría {selectedProfile.category}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='w-4 h-4 text-gray-400' />
                            <span className='text-gray-300'>Agregado {getTimeAgo(selectedProfile.dateAdded)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className='font-semibold text-gray-200 mb-2'>Galería</h4>
                        <div className='grid grid-cols-2 gap-2'>
                          {selectedProfile.photos.slice(0, 4).map((photo, index) => (
                            <div key={index} className='aspect-square rounded-lg overflow-hidden'>
                              <img
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                className='w-full h-full object-cover hover:scale-105 transition-transform'
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Intereses comunes */}
                    <div>
                      <h4 className='font-semibold text-gray-200 mb-3'>Intereses en común</h4>
                      <div className='flex flex-wrap gap-2'>
                        {selectedProfile.commonInterests.map((interest, index) => (
                          <Chip key={index} size='sm' variant='flat' color='primary' className='bg-primary-500/20 text-primary-300'>
                            {interest}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color='danger'
                  variant='flat'
                  startContent={<Trash2 className='w-4 h-4' />}
                  onPress={() => {
                    handleRemoveFromFavorites(selectedProfile.id)
                    onClose()
                  }}>
                  Eliminar de Favoritos
                </Button>
                <Button
                  color='primary'
                  startContent={<Send className='w-4 h-4' />}
                  onPress={() => {
                    handleSendMessage(selectedProfile)
                    onClose()
                  }}>
                  Enviar Mensaje
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Tips */}
      <Card className='w-full bg-gradient-to-br from-purple-900/20 via-pink-800/10 to-red-900/20 border-purple-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-2'>
              <Heart className='w-5 h-5 text-pink-400' />
              <h3 className='text-lg font-semibold text-pink-300'>Consejos para tus favoritos</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='bg-pink-500/10 border border-pink-500/20 rounded-lg p-3'>
                <MessageCircle className='w-4 h-4 text-pink-400 mx-auto mb-2' />
                <p className='text-pink-200 text-xs'>Envía mensajes regulares a tus perfiles favoritos para mantener la conexión</p>
              </div>
              <div className='bg-purple-500/10 border border-purple-500/20 rounded-lg p-3'>
                <Eye className='w-4 h-4 text-purple-400 mx-auto mb-2' />
                <p className='text-purple-200 text-xs'>Revisa regularmente si han actualizado sus perfiles o agregado nuevas fotos</p>
              </div>
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3'>
                <Heart className='w-4 h-4 text-red-400 mx-auto mb-2' />
                <p className='text-red-200 text-xs'>Organiza tus favoritos por categorías para encontrar mejor compatibilidad</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Favorites
