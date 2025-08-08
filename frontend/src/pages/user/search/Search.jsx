import { useState, useMemo, useEffect } from 'react'
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Chip,
  Input,
  Slider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import {
  Search as SearchIcon,
  Heart,
  HeartOff,
  X,
  MessageCircle,
  MapPin,
  Calendar,
  Filter,
  Shuffle,
  Star,
  Sparkles,
  Flame,
  Eye,
  Settings,
  Zap,
  Users,
  Globe,
  Target,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react'

// Hooks
import { useAuth, useUserInterests } from '@hooks'
import { Logger } from '@utils/logger.js'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import UserCard from '@components/ui/UserCard.jsx'

const Search = () => {
  const { user, loading: authLoading } = useAuth()
  const { getInterestByEnum, loading: interestLoading } = useUserInterests()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [ageRange, setAgeRange] = useState([18, 50])
  const [maxDistance, setMaxDistance] = useState(50)
  const [selectedCategories, setSelectedCategories] = useState(['all'])
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [viewMode, setViewMode] = useState('discovery') // 'discovery' o 'search'
  const [favorites, setFavorites] = useState(new Set())
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure()
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onOpenChange: onFiltersOpenChange } = useDisclosure()

  // Datos simulados de perfiles
  const profilesData = useMemo(
    () => [
      {
        id: 1,
        name: 'Sofia García',
        age: 28,
        distance: 3,
        location: 'Bogotá',
        category: 'ESSENCE',
        image: '/api/placeholder/300/400',
        compatibility: 95,
        isOnline: true,
        interests: ['Música', 'Viajes', 'Fotografía', 'Arte', 'Naturaleza'],
        description:
          'Amante de la música y los viajes. Siempre buscando nuevas aventuras y experiencias auténticas. Me encanta conectar con personas genuinas.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Diseñadora Gráfica',
        education: 'Universidad Nacional'
      },
      {
        id: 2,
        name: 'Carlos Rodríguez',
        age: 32,
        distance: 5,
        location: 'Medellín',
        category: 'SPIRIT',
        image: '/api/placeholder/300/400',
        compatibility: 89,
        isOnline: false,
        interests: ['Fe', 'Familia', 'Lectura', 'Voluntariado', 'Música'],
        description: 'Ingeniero de sistemas con valores sólidos. Creo en la importancia de la familia y la fe en nuestras vidas.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Ingeniero de Sistemas',
        education: 'Universidad EAFIT'
      },
      {
        id: 3,
        name: 'Ana María López',
        age: 26,
        distance: 8,
        location: 'Cali',
        category: 'ROUSE',
        image: '/api/placeholder/300/400',
        compatibility: 92,
        isOnline: true,
        interests: ['Arte', 'Naturaleza', 'Yoga', 'Meditación', 'Cocina'],
        description: 'Artista y yogui. Encuentro inspiración en la naturaleza y en las pequeñas cosas de la vida.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400', '/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Artista Visual',
        education: 'Instituto de Artes'
      },
      {
        id: 4,
        name: 'Miguel Ángel Ruiz',
        age: 35,
        distance: 6,
        location: 'Barranquilla',
        category: 'SPIRIT',
        image: '/api/placeholder/300/400',
        compatibility: 87,
        isOnline: true,
        interests: ['Fe', 'Deportes', 'Lectura', 'Familia', 'Cocina'],
        description: 'Médico especialista que encuentra equilibrio entre el trabajo y la vida personal. Valoro las relaciones auténticas.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Médico Especialista',
        education: 'Universidad del Norte'
      },
      {
        id: 5,
        name: 'Isabella Castro',
        age: 27,
        distance: 4,
        location: 'Cartagena',
        category: 'ROUSE',
        image: '/api/placeholder/300/400',
        compatibility: 94,
        isOnline: false,
        interests: ['Fotografía', 'Café', 'Literatura', 'Viajes', 'Arte'],
        description: 'Fotógrafa freelance y amante del buen café. Siempre con un libro en la mano y explorando nuevos lugares.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Fotógrafa Freelance',
        education: 'Universidad Pontificia Bolivariana'
      },
      {
        id: 6,
        name: 'Valentina Torres',
        age: 29,
        distance: 2,
        location: 'Manizales',
        category: 'ESSENCE',
        image: '/api/placeholder/300/400',
        compatibility: 91,
        isOnline: true,
        interests: ['Cocina', 'Danza', 'Viajes', 'Música', 'Fotografía'],
        description: 'Chef profesional y bailarina en tiempo libre. La vida es para disfrutarla al máximo con las personas correctas.',
        photos: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
        occupation: 'Chef Profesional',
        education: 'Instituto Culinario'
      }
    ],
    []
  )

  // Filtrar perfiles
  const filteredProfiles = useMemo(() => {
    let filtered = profilesData

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        profile =>
          profile.name.toLowerCase().includes(searchLower) ||
          profile.location.toLowerCase().includes(searchLower) ||
          profile.occupation.toLowerCase().includes(searchLower) ||
          profile.interests.some(interest => interest.toLowerCase().includes(searchLower))
      )
    }

    // Filtro por edad
    filtered = filtered.filter(profile => profile.age >= ageRange[0] && profile.age <= ageRange[1])

    // Filtro por distancia
    filtered = filtered.filter(profile => profile.distance <= maxDistance)

    // Filtro por categoría
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(profile => selectedCategories.includes(profile.category.toLowerCase()))
    }

    // Filtro por estado online
    if (onlineOnly) {
      filtered = filtered.filter(profile => profile.isOnline)
    }

    return filtered
  }, [profilesData, searchTerm, ageRange, maxDistance, selectedCategories, onlineOnly])

  // Perfil actual para modo discovery
  const currentProfile = filteredProfiles[currentProfileIndex]

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

  const handleLike = profileId => {
    Logger.info('Like a perfil', { profileId }, { category: Logger.CATEGORIES.UI })
    setIsAnimating(true)
    setTimeout(() => {
      nextProfile()
      setIsAnimating(false)
    }, 300)
  }

  const handlePass = profileId => {
    Logger.info('Pasar perfil', { profileId }, { category: Logger.CATEGORIES.UI })
    setIsAnimating(true)
    setTimeout(() => {
      nextProfile()
      setIsAnimating(false)
    }, 300)
  }

  const handleSuperLike = profileId => {
    Logger.info('Super like a perfil', { profileId }, { category: Logger.CATEGORIES.UI })
    setIsAnimating(true)
    setTimeout(() => {
      nextProfile()
      setIsAnimating(false)
    }, 300)
  }

  const toggleFavorite = profileId => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(profileId)) {
      newFavorites.delete(profileId)
    } else {
      newFavorites.add(profileId)
    }
    setFavorites(newFavorites)
  }

  const nextProfile = () => {
    if (currentProfileIndex < filteredProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1)
    } else {
      setCurrentProfileIndex(0) // Volver al inicio
    }
  }

  const handleViewProfile = profile => {
    setSelectedProfile(profile)
    onProfileOpen()
  }

  const handleSendMessage = profile => {
    Logger.info('Enviar mensaje a usuario', { userName: profile.name }, { category: Logger.CATEGORIES.UI })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setAgeRange([18, 50])
    setMaxDistance(50)
    setSelectedCategories(['all'])
    setOnlineOnly(false)
    setCurrentProfileIndex(0)
  }

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'essence', label: 'Essence' },
    { value: 'rouse', label: 'Rouse' },
    { value: 'spirit', label: 'Spirit' }
  ]

  const isLoading = authLoading || interestLoading

  if (isLoading) return <LoadData>Cargando búsqueda...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de búsqueda de usuarios'>
      {/* Header de búsqueda */}
      <div className='w-full bg-gradient-to-br from-blue-900/20 via-purple-800/10 to-pink-900/20 backdrop-blur-sm rounded-xl border border-blue-700/50 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-4'>
          {/* Información principal */}
          <div className='text-center sm:text-left'>
            <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
              <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <SearchIcon className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>Descubrir Personas</h1>
                <p className='text-sm text-gray-400'>Encuentra tu match perfecto</p>
              </div>
            </div>
          </div>

          {/* Estadísticas y modo */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-400'>{filteredProfiles.length}</div>
                <div className='text-xs text-gray-400'>Perfiles</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-400'>{filteredProfiles.filter(p => p.isOnline).length}</div>
                <div className='text-xs text-gray-400'>En línea</div>
              </div>
            </div>

            {/* Cambiar modo */}
            <div className='flex items-center rounded-lg border border-gray-600 overflow-hidden'>
              <Button
                size='sm'
                variant={viewMode === 'discovery' ? 'solid' : 'light'}
                color={viewMode === 'discovery' ? 'primary' : 'default'}
                className={viewMode === 'discovery' ? '' : 'text-gray-400'}
                onPress={() => setViewMode('discovery')}
                startContent={<Target className='w-4 h-4' />}>
                Discovery
              </Button>
              <Button
                size='sm'
                variant={viewMode === 'search' ? 'solid' : 'light'}
                color={viewMode === 'search' ? 'primary' : 'default'}
                className={viewMode === 'search' ? '' : 'text-gray-400'}
                onPress={() => setViewMode('search')}
                startContent={<SearchIcon className='w-4 h-4' />}>
                Búsqueda
              </Button>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className='mt-4 flex flex-col sm:flex-row gap-3'>
          {viewMode === 'search' && (
            <div className='flex-1'>
              <Input
                placeholder='Buscar por nombre, ubicación o intereses...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                startContent={<SearchIcon className='w-4 h-4 text-gray-400' />}
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-800/50 backdrop-blur-sm border-gray-600'
                }}
              />
            </div>
          )}

          <div className='flex items-center gap-2'>
            <Button
              variant='bordered'
              startContent={<Filter className='w-4 h-4' />}
              className='border-gray-600 text-gray-300 hover:bg-gray-700/30'
              onPress={onFiltersOpen}>
              Filtros
            </Button>

            {viewMode === 'discovery' && (
              <Button
                variant='bordered'
                startContent={<Shuffle className='w-4 h-4' />}
                className='border-gray-600 text-gray-300 hover:bg-gray-700/30'
                onPress={() => {
                  setCurrentProfileIndex(Math.floor(Math.random() * filteredProfiles.length))
                }}>
                Aleatorio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          {filteredProfiles.length === 0 ? (
            <div className='text-center py-12'>
              <Users className='w-12 h-12 text-gray-500 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-400 mb-2'>No se encontraron perfiles</h3>
              <p className='text-gray-500 mb-4'>Intenta ajustar los filtros para encontrar más personas</p>
              <Button variant='bordered' className='border-gray-600 text-gray-300' onPress={resetFilters}>
                Resetear filtros
              </Button>
            </div>
          ) : (
            <>
              {/* Modo Discovery */}
              {viewMode === 'discovery' && currentProfile && (
                <div className='max-w-md mx-auto'>
                  <div className={`transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                    <UserCard
                      user={currentProfile}
                      variant='discovery'
                      onViewProfile={handleViewProfile}
                      onMessage={handleSendMessage}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(currentProfile.id)}
                      showCompatibility={true}
                      showDistance={true}
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className='flex justify-center items-center gap-4 mt-6'>
                    <Button
                      isIconOnly
                      size='lg'
                      color='danger'
                      variant='flat'
                      className='w-14 h-14 text-red-400 hover:text-red-300'
                      onPress={() => handlePass(currentProfile.id)}
                      isDisabled={isAnimating}>
                      <X className='w-6 h-6' />
                    </Button>

                    <Button
                      isIconOnly
                      size='lg'
                      color='warning'
                      variant='flat'
                      className='w-16 h-16 text-yellow-400 hover:text-yellow-300'
                      onPress={() => handleSuperLike(currentProfile.id)}
                      isDisabled={isAnimating}>
                      <Star className='w-7 h-7' />
                    </Button>

                    <Button
                      isIconOnly
                      size='lg'
                      color='success'
                      variant='flat'
                      className='w-14 h-14 text-green-400 hover:text-green-300'
                      onPress={() => handleLike(currentProfile.id)}
                      isDisabled={isAnimating}>
                      <Heart className='w-6 h-6' />
                    </Button>
                  </div>

                  {/* Indicador de progreso */}
                  <div className='text-center mt-4'>
                    <p className='text-xs text-gray-400'>
                      {currentProfileIndex + 1} de {filteredProfiles.length} perfiles
                    </p>
                    <div className='w-full bg-gray-700 rounded-full h-1 mt-2'>
                      <div
                        className='bg-primary-500 h-1 rounded-full transition-all duration-300'
                        style={{ width: `${((currentProfileIndex + 1) / filteredProfiles.length) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modo Búsqueda */}
              {viewMode === 'search' && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {filteredProfiles.map(profile => (
                    <UserCard
                      key={profile.id}
                      user={profile}
                      variant='default'
                      onViewProfile={handleViewProfile}
                      onMessage={handleSendMessage}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(profile.id)}
                      showCompatibility={true}
                      showDistance={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal de filtros */}
      <Modal
        isOpen={isFiltersOpen}
        onOpenChange={onFiltersOpenChange}
        size='2xl'
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
                <div className='flex items-center gap-2'>
                  <Settings className='w-5 h-5 text-primary-400' />
                  <h3 className='text-xl font-bold text-gray-200'>Filtros de Búsqueda</h3>
                </div>
              </ModalHeader>
              <ModalBody className='py-6'>
                <div className='space-y-6'>
                  {/* Rango de edad */}
                  <div>
                    <h4 className='font-semibold text-gray-200 mb-3'>Rango de Edad</h4>
                    <Slider
                      size='sm'
                      step={1}
                      minValue={18}
                      maxValue={65}
                      value={ageRange}
                      onChange={setAgeRange}
                      className='max-w-md'
                      label={`${ageRange[0]} - ${ageRange[1]} años`}
                      color='primary'
                    />
                  </div>

                  {/* Distancia máxima */}
                  <div>
                    <h4 className='font-semibold text-gray-200 mb-3'>Distancia Máxima</h4>
                    <Slider
                      size='sm'
                      step={5}
                      minValue={5}
                      maxValue={100}
                      value={maxDistance}
                      onChange={setMaxDistance}
                      className='max-w-md'
                      label={`${maxDistance} km`}
                      color='primary'
                    />
                  </div>

                  {/* Categorías */}
                  <div>
                    <h4 className='font-semibold text-gray-200 mb-3'>Categorías</h4>
                    <div className='flex flex-wrap gap-2'>
                      {categoryOptions.map(option => (
                        <Chip
                          key={option.value}
                          variant={selectedCategories.includes(option.value) ? 'solid' : 'bordered'}
                          color={selectedCategories.includes(option.value) ? 'primary' : 'default'}
                          className={`cursor-pointer ${
                            selectedCategories.includes(option.value) ? '' : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'
                          }`}
                          onClick={() => {
                            if (option.value === 'all') {
                              setSelectedCategories(['all'])
                            } else {
                              const newCategories = selectedCategories.filter(cat => cat !== 'all')
                              if (selectedCategories.includes(option.value)) {
                                const filtered = newCategories.filter(cat => cat !== option.value)
                                setSelectedCategories(filtered.length === 0 ? ['all'] : filtered)
                              } else {
                                setSelectedCategories([...newCategories, option.value])
                              }
                            }
                          }}>
                          {selectedCategories.includes(option.value) && <Check className='w-3 h-3 mr-1' />}
                          {option.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Solo usuarios en línea */}
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold text-gray-200'>Solo usuarios en línea</h4>
                      <p className='text-sm text-gray-400'>Mostrar únicamente personas conectadas</p>
                    </div>
                    <Switch isSelected={onlineOnly} onValueChange={setOnlineOnly} color='primary' />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={resetFilters} startContent={<RefreshCw className='w-4 h-4' />}>
                  Resetear
                </Button>
                <Button color='primary' onPress={onClose} startContent={<Check className='w-4 h-4' />}>
                  Aplicar Filtros
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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

                    {/* Información profesional */}
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
                        </div>
                      </div>

                      <div>
                        <h4 className='font-semibold text-gray-200 mb-2'>Profesional</h4>
                        <div className='space-y-1 text-sm'>
                          <p className='text-gray-300'>{selectedProfile.occupation}</p>
                          <p className='text-gray-400'>{selectedProfile.education}</p>
                        </div>
                      </div>
                    </div>

                    {/* Galería de fotos */}
                    <div>
                      <h4 className='font-semibold text-gray-200 mb-3'>Fotos</h4>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                        {selectedProfile.photos.map((photo, index) => (
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

                    {/* Intereses */}
                    <div>
                      <h4 className='font-semibold text-gray-200 mb-3'>Intereses</h4>
                      <div className='flex flex-wrap gap-2'>
                        {selectedProfile.interests.map((interest, index) => (
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
                  variant='flat'
                  color={favorites.has(selectedProfile?.id) ? 'danger' : 'default'}
                  startContent={
                    favorites.has(selectedProfile?.id) ? <Heart className='w-4 h-4 fill-current' /> : <HeartOff className='w-4 h-4' />
                  }
                  onPress={() => {
                    toggleFavorite(selectedProfile.id)
                  }}>
                  {favorites.has(selectedProfile?.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                </Button>
                <Button
                  color='primary'
                  startContent={<MessageCircle className='w-4 h-4' />}
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
      <Card className='w-full bg-gradient-to-br from-green-900/20 via-blue-800/10 to-purple-900/20 border-green-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-2'>
              <Zap className='w-5 h-5 text-green-400' />
              <h3 className='text-lg font-semibold text-green-300'>Consejos para encontrar matches</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
                <Target className='w-4 h-4 text-green-400 mx-auto mb-2' />
                <p className='text-green-200 text-xs'>Usa el modo Discovery para una experiencia más natural y divertida</p>
              </div>
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'>
                <SearchIcon className='w-4 h-4 text-blue-400 mx-auto mb-2' />
                <p className='text-blue-200 text-xs'>Utiliza filtros específicos para encontrar personas con intereses similares</p>
              </div>
              <div className='bg-purple-500/10 border border-purple-500/20 rounded-lg p-3'>
                <Heart className='w-4 h-4 text-purple-400 mx-auto mb-2' />
                <p className='text-purple-200 text-xs'>
                  Lee los perfiles completos antes de decidir - la compatibilidad es más que una foto
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Search
