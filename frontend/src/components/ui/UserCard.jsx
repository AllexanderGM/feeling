import { useState } from 'react'
import {
  Card,
  CardBody,
  Button,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { Heart, HeartOff, MapPin, Eye, Star, Sparkles, Flame, ChevronLeft, ChevronRight, X, Bookmark } from 'lucide-react'
import { Logger } from '@utils/logger.js'

const UserCard = ({
  user,
  onLike,
  onPass,
  onSuperLike,
  onMessage,
  onViewProfile,
  onToggleFavorite,
  isFavorite = false,
  showCompatibility = true,
  showDistance = true,
  showMatchControls = false,
  variant = 'default' // 'default', 'compact', 'discovery'
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure()

  Logger.debug('Usuario cargado en UserCard', Logger.CATEGORIES.UI, {
    userId: user?.profile?.email || user?.email,
    userName: user?.profile?.name || user?.name
  })

  // Función auxiliar para obtener datos del usuario independientemente de la estructura
  const getUserData = () => {
    // Si el usuario tiene estructura mapeada (datos en root)
    if (user?.name && !user?.profile?.name) {
      return {
        name: user.name,
        age: user.age,
        city: user.city,
        description: user.description,
        categoryInterest: user.categoryInterest,
        mainImage: user.mainImage || user.image,
        images: user.images || [user.mainImage || user.image].filter(Boolean)
      }
    }

    // Si el usuario tiene estructura anidada (profile)
    return {
      name: user.profile?.name,
      age: user.profile?.age,
      city: user.profile?.city,
      description: user.profile?.description,
      categoryInterest: user.profile?.categoryInterest,
      mainImage: user.profile?.mainImage || user.profile?.image,
      images: user.profile?.images || [user.profile?.mainImage || user.profile?.image].filter(Boolean)
    }
  }

  const userData = getUserData()

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

  const nextPhoto = () => {
    if (userData.images && userData.images.length > 1) {
      setCurrentPhotoIndex(prev => (prev + 1) % userData.images.length)
    }
  }

  const prevPhoto = () => {
    if (userData.images && userData.images.length > 1) {
      setCurrentPhotoIndex(prev => (prev - 1 + userData.images.length) % userData.images.length)
    }
  }

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user)
    } else {
      onProfileOpen()
    }
  }

  // Handlers para acciones de match
  const handleLike = () => {
    if (onLike) {
      onLike(user)
    }
  }

  const handlePass = () => {
    if (onPass) {
      onPass(user)
    }
  }

  const handleSuperLike = () => {
    if (onSuperLike) {
      onSuperLike(user)
    }
  }

  const images = userData.images || [userData.mainImage].filter(Boolean)
  const hasMultipleimages = images.length > 1

  // Variante Discovery (estilo Tinder mejorado)
  if (variant === 'discovery') {
    return (
      <Card className='w-full max-w-sm mx-auto bg-gray-900 border-gray-700/50 overflow-hidden shadow-2xl'>
        <CardBody className='p-0'>
          {/* Galería de imágenes */}
          <div className='relative h-96 group'>
            <img
              alt={`${userData.name} - Foto ${currentPhotoIndex + 1}`}
              className='w-full h-full object-cover'
              src={images[currentPhotoIndex]}
            />

            {/* Indicadores de fotos */}
            {hasMultipleimages && (
              <div className='absolute top-2 left-2 right-2 flex gap-1'>
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            )}

            {/* Controles de navegación */}
            {hasMultipleimages && (
              <>
                <button
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={prevPhoto}>
                  <ChevronLeft className='w-4 h-4' />
                </button>
                <button
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={nextPhoto}>
                  <ChevronRight className='w-4 h-4' />
                </button>
              </>
            )}

            {/* Overlay superior */}
            <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
              <div className='flex items-center gap-2'>
                {user.isOnline && (
                  <Chip color='success' size='sm' variant='flat'>
                    En línea
                  </Chip>
                )}
                {showCompatibility && user.compatibility && (
                  <Chip color='danger' size='sm' variant='flat'>
                    {user.compatibility}% match
                  </Chip>
                )}
              </div>

              {onToggleFavorite && (
                <Button
                  isIconOnly
                  className={`${isFavorite ? 'text-pink-400 bg-pink-400/20' : 'text-gray-400 bg-gray-800/50'}`}
                  size='sm'
                  variant='flat'
                  onPress={() => onToggleFavorite(user.id)}>
                  {isFavorite ? <Heart className='w-4 h-4 fill-current' /> : <HeartOff className='w-4 h-4' />}
                </Button>
              )}
            </div>

            {/* Información sobre la imagen con degradado más oscuro */}
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4'>
              <div className='flex items-end justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='text-xl font-bold text-white drop-shadow-md'>{userData.name}</h3>
                    {getCategoryIcon(userData.categoryInterest)}
                  </div>
                  <p className='text-white/90 text-sm drop-shadow-sm'>{userData.age} años</p>
                  {showDistance && userData.city && (
                    <div className='flex items-center gap-1 text-white/80 text-xs drop-shadow-sm'>
                      <MapPin className='w-3 h-3' />
                      <span>
                        {userData.city}
                        {user.distance && ` • ${user.distance} km`}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className='bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white border-white/20'
                  size='sm'
                  startContent={<Eye className='w-3 h-3' />}
                  variant='flat'
                  onPress={handleViewProfile}>
                  Ver más
                </Button>
              </div>
            </div>
          </div>

          {/* Información adicional del usuario */}
          <div className='p-4 bg-gray-900'>
            {/* Descripción */}
            {userData.description && userData.description !== 'TEMPORAL_DESCRIPTION' && (
              <div className='mb-4'>
                <p className='text-gray-300 text-sm leading-relaxed'>{userData.description}</p>
              </div>
            )}

            {/* Tags de intereses */}
            {userData.tags && userData.tags.length > 0 && (
              <div className='mb-4'>
                <h4 className='text-gray-200 text-sm font-medium mb-2'>Intereses</h4>
                <div className='flex flex-wrap gap-2'>
                  {userData.tags.slice(0, 4).map((tag, index) => (
                    <Chip key={index} className='text-gray-300 border-gray-600 bg-gray-800/30' size='sm' variant='bordered'>
                      {tag}
                    </Chip>
                  ))}
                  {userData.tags.length > 4 && (
                    <Chip className='text-gray-400 border-gray-600' size='sm' variant='bordered'>
                      +{userData.tags.length - 4}
                    </Chip>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className='space-y-2 text-sm'>
              {user.status?.verified && (
                <div className='flex items-center gap-2 text-primary-400'>
                  <div className='w-2 h-2 bg-primary-500 rounded-full' />
                  <span>Perfil verificado</span>
                </div>
              )}

              {userData.church && (
                <div className='flex items-center gap-2 text-gray-400'>
                  <div className='w-2 h-2 bg-gray-500 rounded-full' />
                  <span>{userData.church}</span>
                </div>
              )}

              {userData.phone && (
                <div className='flex items-center gap-2 text-gray-400'>
                  <div className='w-2 h-2 bg-gray-500 rounded-full' />
                  <span>Contacto disponible</span>
                </div>
              )}
            </div>
          </div>

          {/* Controles de match integrados */}
          {showMatchControls && (
            <div className='p-4 pt-2 bg-gray-900'>
              <div className='flex items-center justify-center gap-4'>
                <Button
                  isIconOnly
                  className='bg-gray-700 hover:bg-gray-600 transition-all duration-200'
                  color='default'
                  size='md'
                  variant='solid'
                  onPress={handlePass}>
                  <X className='w-4 h-4' />
                </Button>

                <Button
                  isIconOnly
                  className='bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transition-all duration-200'
                  size='md'
                  variant='solid'
                  onPress={handleSuperLike}>
                  <Bookmark className='w-4 h-4 text-white' />
                </Button>

                <Button
                  isIconOnly
                  className='bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 transition-all duration-200'
                  color='danger'
                  size='md'
                  variant='solid'
                  onPress={handleLike}>
                  <Heart className='w-4 h-4 text-white' />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card className='w-full max-w-sm mx-auto bg-gray-800 border-gray-600/30 overflow-hidden'>
        <CardBody className='p-0'>{/* Content for other variants */}</CardBody>
      </Card>

      {/* Modal de perfil si no se maneja externamente */}
      {!onViewProfile && (
        <Modal
          classNames={{
            base: 'bg-gray-900/95 backdrop-blur-sm',
            header: 'border-b border-gray-700/50',
            footer: 'border-t border-gray-700/50',
            closeButton: 'hover:bg-gray-800/50'
          }}
          isOpen={isProfileOpen}
          size='3xl'
          onOpenChange={onProfileOpenChange}>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader>
                  <div className='flex items-center gap-3'>
                    <Avatar alt={userData.name} className='w-12 h-12' src={userData.mainImage} />
                    <div>
                      <h3 className='text-lg font-bold text-gray-200'>{userData.name}</h3>
                      <p className='text-gray-400'>
                        {userData.age} años • {userData.city}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className='space-y-4'>
                    {userData.description && (
                      <div>
                        <h4 className='font-semibold text-gray-200 mb-2'>Acerca de {userData.name}</h4>
                        <p className='text-gray-300 text-sm'>{userData.description}</p>
                      </div>
                    )}

                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <h4 className='font-semibold text-gray-200 mb-2'>Intereses</h4>
                        <div className='flex flex-wrap gap-2'>
                          {user.interests.map((interest, index) => (
                            <Chip key={index} color='primary' size='sm' variant='flat'>
                              {interest}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant='light' onPress={onClose}>
                    Cerrar
                  </Button>
                  {onMessage && (
                    <Button
                      color='primary'
                      onPress={() => {
                        onMessage(user)
                        onClose()
                      }}>
                      Enviar Mensaje
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default UserCard
