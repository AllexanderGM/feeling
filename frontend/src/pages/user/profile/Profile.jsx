import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Chip,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Avatar
} from '@heroui/react'
import {
  ArrowLeft,
  MapPin,
  Heart,
  X,
  Bookmark,
  Clock,
  CheckCircle2,
  Eye,
  Star,
  Users,
  Tag,
  Mail,
  Shield,
  Menu,
  Briefcase
} from 'lucide-react'
import { useUser, useMatchInteractions, useMatchFavorites, useLocation, useUserAttributes, useUserTags } from '@hooks'
import { useState, useEffect, useCallback, useMemo } from 'react'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import {
  getUserName,
  getUserLastName,
  getUserAge,
  getUserProfession,
  getUserCountry,
  getUserCity,
  getUserDepartment,
  getUserLocality,
  getUserDescription,
  getUserImages,
  getUserGender,
  getUserLastActive,
  getUserVerified,
  getUserTags,
  getUserAgePreferenceMin,
  getUserAgePreferenceMax
} from '@schemas'
import StepBasicInfo from '@pages/user/complete/components/StepBasicInfo.jsx'
import StepCharacteristics from '@pages/user/complete/components/StepCharacteristics.jsx'

// Función auxiliar para formatear última actividad
const formatLastActive = lastActiveDate => {
  if (!lastActiveDate) return { text: null, color: 'gray' }

  const lastActive = Array.isArray(lastActiveDate)
    ? new Date(
        lastActiveDate[0],
        lastActiveDate[1] - 1,
        lastActiveDate[2],
        lastActiveDate[3] || 0,
        lastActiveDate[4] || 0,
        lastActiveDate[5] || 0,
        lastActiveDate[6] || 0
      )
    : new Date(lastActiveDate)

  const now = new Date()
  const diffInMs = now - lastActive
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 5) return { text: 'Activo ahora', color: 'green' }
  if (diffInMinutes < 60) return { text: `Activo hace ${diffInMinutes} min`, color: 'blue' }
  if (diffInHours < 24) return { text: `Activo hace ${diffInHours} h`, color: 'yellow' }
  if (diffInDays === 1) return { text: 'Activo ayer', color: 'orange' }
  if (diffInDays < 7) return { text: `Activo hace ${diffInDays} días`, color: 'red' }

  return { text: null, color: 'gray' }
}

// Función auxiliar para formatear ubicación completa
const formatLocation = (city, department, locality) => {
  const parts = []

  if (locality) parts.push(locality)
  if (city && city !== locality) parts.push(city)
  if (department && department !== city) parts.push(department)

  return parts.length > 0 ? parts.join(', ') : null
}

const UserDetail = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { isOpen: isImageOpen, onOpen: onImageOpen, onOpenChange: onImageOpenChange } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
  const { isOpen: isCharacteristicsOpen, onOpen: onCharacteristicsOpen, onOpenChange: onCharacteristicsOpenChange } = useDisclosure()

  // Hooks
  const { getUserProfileById } = useUser()
  const { sendMatch, dismissSuggestion, loading: matchLoading } = useMatchInteractions()
  const { toggleFavorite, checkIfFavorite, loading: favoriteLoading } = useMatchFavorites()
  const userAttributes = useUserAttributes()
  const userTags = useUserTags()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  // Obtener el usuario por ID
  const fetchUser = useCallback(
    async ({ withLoader = true } = {}) => {
      if (!userId) return

      if (withLoader) setLoading(true)

      try {
        const result = await getUserProfileById(userId, 'public', false)

        if (result?.success && result?.data) {
          setUserData(result.data)
          const favoriteStatus = await checkIfFavorite(userId)

          setIsFavorite(favoriteStatus)
        }
      } finally {
        if (withLoader) setLoading(false)
      }
    },
    [userId, getUserProfileById, checkIfFavorite]
  )

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleBack = () => {
    navigate(-1)
  }

  // Handlers para acciones de match
  const handleLike = useCallback(async () => {
    await sendMatch(userId)
    handleBack()
  }, [userId, sendMatch, handleBack])

  const handlePass = useCallback(async () => {
    await dismissSuggestion(userId)
    handleBack()
  }, [userId, dismissSuggestion, handleBack])

  const handleToggleFavorite = useCallback(async () => {
    const newFavoriteStatus = await toggleFavorite(userId)

    setIsFavorite(newFavoriteStatus)
  }, [userId, toggleFavorite])

  const locationConfig = useMemo(
    () => ({
      defaultCountry: getUserCountry(userData) || 'Colombia',
      defaultCity: getUserCity(userData) || 'Bogotá',
      loadAll: true
    }),
    [userData]
  )

  const location = useLocation(locationConfig)

  const handleEditSuccess = useCallback(async () => {
    await fetchUser({ withLoader: false })
    onEditOpenChange()
  }, [fetchUser, onEditOpenChange])

  const characteristicsDataLoading = userAttributes?.loading || userTags?.loading

  const handleCharacteristicsSuccess = useCallback(async () => {
    await fetchUser({ withLoader: false })
    onCharacteristicsOpenChange()
  }, [fetchUser, onCharacteristicsOpenChange])

  // Funciones para la galería de imágenes
  const openImageModal = (image, index) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
    onImageOpen()
  }

  const navigateImage = direction => {
    if (!images || images.length === 0) return

    const newIndex =
      direction === 'next' ? (currentImageIndex + 1) % images.length : (currentImageIndex - 1 + images.length) % images.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  if (loading) return <LoadData />
  if (!userData) return <LoadDataError message='Usuario no encontrado' />

  // Extraer datos usando accessors centralizados
  const compatibility = userData?.compatibility
  const hasPendingMatch = userData?.hasPendingMatch
  const hasAcceptedMatch = userData?.hasAcceptedMatch

  // Datos del perfil usando accessors
  const name = getUserName(userData)
  const lastName = getUserLastName(userData)
  const age = getUserAge(userData)
  const profession = getUserProfession(userData)
  const city = getUserCity(userData)
  const department = getUserDepartment(userData)
  const locality = getUserLocality(userData)
  const description = getUserDescription(userData)
  const images = getUserImages(userData) || []
  const gender = getUserGender(userData)
  const isVerified = getUserVerified(userData)
  const tags = getUserTags(userData) || []
  const agePreferenceMin = getUserAgePreferenceMin(userData)
  const agePreferenceMax = getUserAgePreferenceMax(userData)

  // Datos de status
  const lastActive = getUserLastActive(userData)

  // Datos de compatibilidad
  const compatibilityPercentage = compatibility?.totalPercentage

  const { text: lastActiveText, color } = formatLastActive(lastActive)
  const fullLocation = formatLocation(city, department, locality)

  // Mock data para estadísticas (esto debería venir del backend)
  const profileViews = userData?.profileViews || 0
  const likesReceived = userData?.likesReceived || 0
  const totalMatches = userData?.totalMatches || 0

  // Generar username
  const usernameBase = profession || name || 'usuario'
  const username = `@${usernameBase.toLowerCase().replace(/\s+/g, '')}`

  return (
    <div className='min-h-screen bg-gray-950'>
      {/* Header con botón de regresar y menú */}
      <div className='sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
        <div className='max-w-2xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Button isIconOnly className='bg-transparent text-gray-300' radius='full' size='sm' variant='light' onPress={handleBack}>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-base font-medium text-gray-200'>{name || 'Perfil'}</h1>
          <Button isIconOnly className='bg-transparent text-gray-300' radius='full' size='sm' variant='light'>
            <Menu className='w-5 h-5' />
          </Button>
        </div>
      </div>

      {/* Contenido principal - Mobile First */}
      <div className='max-w-2xl mx-auto pb-24 bg-gray-950'>
        {/* Avatar y Header Section */}
        <div className='flex flex-col items-center pt-6 pb-4 px-4 bg-gradient-to-b from-gray-900/50 to-transparent'>
          {/* Avatar con borde animado */}
          <div className='relative mb-4'>
            <div className='absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 opacity-75 blur-md animate-pulse' />
            <Avatar isBordered alt={name} className='w-28 h-28 sm:w-32 sm:h-32 border-4 border-gray-900 relative z-10' src={images[0]} />
            {/* Badge de verificación si aplica */}
            {isVerified && (
              <div className='absolute bottom-1 right-1 z-20 bg-blue-500 rounded-full p-1.5 border-2 border-gray-900'>
                <CheckCircle2 className='w-4 h-4 text-white' />
              </div>
            )}
          </div>

          {/* Nombre y apellido */}
          <h2 className='text-2xl font-bold text-white text-center mb-1'>{lastName ? `${name} ${lastName}` : name}</h2>

          {/* Username estilo @ */}
          <p className='text-sm text-gray-400 mb-3'>{username}</p>

          {/* Badge de nivel/compatibilidad */}
          {compatibilityPercentage ? (
            <Chip
              className={`mb-4 ${
                compatibilityPercentage >= 80
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 ring-1 ring-pink-500/30'
                  : compatibilityPercentage >= 60
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500'
                    : 'bg-gray-600'
              } text-white font-bold`}
              size='sm'
              startContent={<Star className='w-3.5 h-3.5' />}>
              {compatibilityPercentage}% Compatible
            </Chip>
          ) : (
            <Chip
              className='mb-4 bg-gray-700/50 text-gray-200 font-semibold border border-gray-600/50'
              size='sm'
              startContent={<Shield className='w-3.5 h-3.5' />}
              variant='bordered'>
              Perfil Verificado
            </Chip>
          )}

          {/* Estadísticas estilo redes sociales */}
          <div className='grid grid-cols-3 gap-8 w-full max-w-sm mb-4'>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-white'>{profileViews}</div>
              <div className='text-xs text-gray-400'>Vistas</div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-white'>{likesReceived}</div>
              <div className='text-xs text-gray-400'>Likes</div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-white'>{totalMatches}</div>
              <div className='text-xs text-gray-400'>Matches</div>
            </div>
          </div>

          {/* Iconos de acciones principales */}
          <div className='flex items-center gap-3 mb-4'>
            <Button
              isIconOnly
              className='bg-gray-800/80 text-gray-300 backdrop-blur-sm border border-gray-700/50'
              radius='full'
              size='sm'
              variant='flat'>
              <Star className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              className='bg-gray-800/80 text-gray-300 backdrop-blur-sm border border-gray-700/50'
              radius='full'
              size='sm'
              variant='flat'
              onPress={handleToggleFavorite}>
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-blue-400' : ''}`} />
            </Button>
            <Button
              isIconOnly
              className='bg-gray-800/80 text-gray-300 backdrop-blur-sm border border-gray-700/50'
              radius='full'
              size='sm'
              variant='flat'>
              <Heart className='w-4 h-4' />
            </Button>
            <Button
              className='bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4'
              radius='full'
              size='sm'
              onPress={onEditOpen}>
              Editar perfil
            </Button>
            <Button
              className='font-semibold px-4'
              color='secondary'
              radius='full'
              size='sm'
              variant='solid'
              onPress={onCharacteristicsOpen}>
              Editar características
            </Button>
          </div>
        </div>

        {/* Sección de Bio */}
        <Card className='mx-4 mb-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Users className='w-4 h-4 text-purple-400' />
              </div>
              <h3 className='text-sm font-bold text-gray-200'>Bio</h3>
            </div>
            {description && description !== 'TEMPORAL_DESCRIPTION' ? (
              <p className='text-sm text-gray-300 leading-relaxed'>{description}</p>
            ) : (
              <p className='text-sm text-gray-500 italic'>Este usuario aún no ha agregado una descripción.</p>
            )}

            {/* Información adicional */}
            <div className='mt-4 pt-4 border-t border-gray-700/30 space-y-2'>
              {profession && (
                <div className='flex items-center gap-2 text-sm'>
                  <Briefcase className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>{profession}</span>
                </div>
              )}
              {fullLocation && (
                <div className='flex items-center gap-2 text-sm'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>{fullLocation}</span>
                </div>
              )}
              {lastActiveText && (
                <div className='flex items-center gap-2 text-sm'>
                  <Clock className='w-4 h-4 text-gray-400' />
                  <span className={`text-${color}-400`}>{lastActiveText}</span>
                </div>
              )}
              {age && (
                <div className='flex items-center gap-2 text-sm'>
                  <Users className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>
                    {age} años {gender && `• ${gender}`}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Sección de Intereses */}
        {tags.length > 0 && (
          <Card className='mx-4 mb-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
                  <Tag className='w-4 h-4 text-pink-400' />
                </div>
                <h3 className='text-sm font-bold text-gray-200'>Intereses</h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag, index) => (
                  <Chip key={index} className='bg-purple-500/20 text-purple-300 border border-purple-500/30' size='sm' variant='flat'>
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Sección de Preferencias de Búsqueda */}
        {(agePreferenceMin || agePreferenceMax) && (
          <Card className='mx-4 mb-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center'>
                  <Star className='w-4 h-4 text-indigo-400' />
                </div>
                <h3 className='text-sm font-bold text-gray-200'>Buscando</h3>
              </div>
              <div className='space-y-2'>
                {agePreferenceMin && agePreferenceMax && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Users className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-300'>
                      {agePreferenceMin} - {agePreferenceMax} años
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Indicadores de estado de match */}
        {(hasAcceptedMatch || hasPendingMatch) && (
          <div className='mx-4 mb-4'>
            {hasAcceptedMatch && (
              <Chip
                className='w-full bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-md border border-green-300/40 text-white justify-center font-medium'
                size='md'
                startContent={<CheckCircle2 className='w-4 h-4' />}
                variant='bordered'>
                Match aceptado
              </Chip>
            )}
            {hasPendingMatch && !hasAcceptedMatch && (
              <Chip
                className='w-full bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md border border-yellow-300/40 text-white justify-center font-medium'
                size='md'
                startContent={<Mail className='w-4 h-4' />}
                variant='bordered'>
                Match pendiente
              </Chip>
            )}
          </div>
        )}

        {/* Sección de Fotos con LightGallery */}
        <Card className='mx-4 mb-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
                  <Eye className='w-4 h-4 text-pink-400' />
                </div>
                <h3 className='text-sm font-bold text-gray-200'>Fotos</h3>
              </div>
              {images.length > 0 && (
                <span className='text-xs text-gray-400'>
                  {images.length} foto{images.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Galería de imágenes */}
            {images.length > 0 ? (
              <div className='grid grid-cols-2 gap-2'>
                {images.map((image, index) => (
                  <div
                    key={index}
                    className='relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-gray-800'
                    role='button'
                    tabIndex={0}
                    onClick={() => openImageModal(image, index)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openImageModal(image, index)
                      }
                    }}>
                    <img alt={`${name} - Foto ${index + 1}`} className='w-full h-full object-cover' src={image} />
                    {/* Overlay hover */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center'>
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white text-sm font-medium'>
                        <Eye className='w-4 h-4' />
                        <span>Ver</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500 text-sm'>
                <Eye className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No hay fotos disponibles</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Botones de acción - Fijos en la parte inferior */}
      <div className='fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-6 py-4 z-50'>
        <div className='flex items-center justify-center gap-4 max-w-md mx-auto'>
          {/* Botón Pasar */}
          <Button
            isIconOnly
            className='bg-white/10 hover:bg-red-500/20 active:bg-red-500/30 border-2 border-white/20 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-200'
            isDisabled={matchLoading}
            radius='full'
            size='lg'
            variant='flat'
            onPress={handlePass}>
            <X className='w-6 h-6' strokeWidth={2.5} />
          </Button>

          {/* Botón Match - Centro (más grande) */}
          <Button
            isIconOnly
            className='bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 active:scale-95 transition-all duration-200 shadow-xl shadow-pink-500/40 border-2 border-white/20'
            isLoading={matchLoading}
            radius='full'
            size='lg'
            style={{ width: '70px', height: '70px' }}
            variant='solid'
            onPress={handleLike}>
            {!matchLoading && <Heart className='w-8 h-8 text-white fill-current' />}
          </Button>

          {/* Botón Favorito */}
          <Button
            isIconOnly
            className={`${
              isFavorite
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40 border-2 border-blue-300/40'
                : 'bg-white/10 border-2 border-white/20 hover:border-blue-500/60 hover:bg-blue-500/20'
            } text-blue-300 hover:text-blue-200 active:scale-95 transition-all duration-200`}
            isDisabled={favoriteLoading}
            radius='full'
            size='lg'
            variant='flat'
            onPress={handleToggleFavorite}>
            <Bookmark className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-xl border border-gray-800/70',
          header: 'border-b border-gray-800/60',
          footer: 'border-t border-gray-800/60'
        }}
        isOpen={isEditOpen}
        scrollBehavior='inside'
        size='5xl'
        onOpenChange={onEditOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <div>
                  <h2 className='text-lg font-semibold text-gray-200'>Editar información básica</h2>
                  <p className='text-sm text-gray-400'>Actualiza los datos principales del perfil antes de continuar con otros pasos.</p>
                </div>
              </ModalHeader>
              <ModalBody className='py-6'>
                {!userData ? (
                  <div className='flex flex-col items-center justify-center py-12 gap-3'>
                    <Spinner color='primary' />
                    <p className='text-sm text-gray-400'>Cargando información del usuario...</p>
                  </div>
                ) : location.loading && !location.hasCountries ? (
                  <div className='flex flex-col items-center justify-center py-12 gap-3'>
                    <Spinner color='primary' />
                    <p className='text-sm text-gray-400'>Cargando datos geográficos...</p>
                  </div>
                ) : (
                  <StepBasicInfo
                    key={userData?.user?.id ?? userData?.id ?? 'step-basic-info'}
                    isFirstStep
                    isLastStep
                    locationData={{
                      formattedCountries: location.formattedCountries,
                      formattedCities: location.formattedCities,
                      formattedLocalities: location.formattedLocalities,
                      loadCitiesByCountry: location.loadCitiesByCountry,
                      loadLocalitiesByCity: location.loadLocalitiesByCity
                    }}
                    user={userData}
                    onStepComplete={handleEditSuccess}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onEditOpenChange}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-xl border border-gray-800/70',
          header: 'border-b border-gray-800/60',
          footer: 'border-t border-gray-800/60'
        }}
        isOpen={isCharacteristicsOpen}
        scrollBehavior='inside'
        size='5xl'
        onOpenChange={onCharacteristicsOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <div>
                  <h2 className='text-lg font-semibold text-gray-200'>Editar características</h2>
                  <p className='text-sm text-gray-400'>Actualiza tu descripción, intereses y detalles físicos.</p>
                </div>
              </ModalHeader>
              <ModalBody className='py-6'>
                {!userData ? (
                  <div className='flex flex-col items-center justify-center py-12 gap-3'>
                    <Spinner color='primary' />
                    <p className='text-sm text-gray-400'>Cargando información del usuario...</p>
                  </div>
                ) : characteristicsDataLoading ? (
                  <div className='flex flex-col items-center justify-center py-12 gap-3'>
                    <Spinner color='primary' />
                    <p className='text-sm text-gray-400'>Cargando atributos disponibles...</p>
                  </div>
                ) : (
                  <StepCharacteristics
                    key={`step-characteristics-${userData?.user?.id ?? userData?.id ?? 'profile'}`}
                    isFirstStep
                    isLastStep
                    user={userData}
                    userAttributes={userAttributes}
                    userTags={userTags}
                    onStepComplete={handleCharacteristicsSuccess}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onCharacteristicsOpenChange}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para visualizar imágenes */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}
        isOpen={isImageOpen}
        size='5xl'
        onOpenChange={onImageOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center justify-between w-full'>
              <h3 className='text-lg font-bold text-gray-200'>
                Foto {currentImageIndex + 1} de {images.length}
              </h3>
            </div>
          </ModalHeader>
          <ModalBody className='p-0'>
            <div className='relative'>
              {selectedImage && (
                <img
                  alt={`Foto ${currentImageIndex + 1} del perfil`}
                  className='w-full h-auto max-h-[70vh] object-contain'
                  src={selectedImage}
                />
              )}

              {/* Navegación */}
              {images.length > 1 && (
                <>
                  <Button
                    isIconOnly
                    className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70'
                    variant='flat'
                    onPress={() => navigateImage('prev')}>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path d='M15 19l-7-7 7-7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
                    </svg>
                  </Button>
                  <Button
                    isIconOnly
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70'
                    variant='flat'
                    onPress={() => navigateImage('next')}>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path d='M9 5l7 7-7 7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className='flex justify-between items-center w-full'>
              <div className='flex items-center gap-2'>
                {images.length > 1 && (
                  <div className='flex gap-1'>
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-primary-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <Button color='danger' variant='light' onPress={onImageOpenChange}>
                Cerrar
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default UserDetail
