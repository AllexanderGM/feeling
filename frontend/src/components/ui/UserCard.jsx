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
import {
  Heart,
  HeartOff,
  MessageCircle,
  MapPin,
  Calendar,
  Eye,
  Star,
  Sparkles,
  Flame,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react'
import { Logger } from '@utils/logger.js'

const UserCard = ({
  user,
  onLike,
  onMessage,
  onViewProfile,
  onToggleFavorite,
  isFavorite = false,
  showCompatibility = true,
  showDistance = true,
  showLastActivity = false,
  variant = 'default' // 'default', 'compact', 'discovery'
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure()

  Logger.debug('Usuario cargado en UserCard', Logger.CATEGORIES.UI, { userId: user?.id, userName: user?.name })

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

  const nextPhoto = () => {
    if (user.profile?.images && user.profile.images.length > 1) {
      setCurrentPhotoIndex(prev => (prev + 1) % user.profile.images.length)
    }
  }

  const prevPhoto = () => {
    if (user.profile?.images && user.profile.images.length > 1) {
      setCurrentPhotoIndex(prev => (prev - 1 + user.profile.images.length) % user.profile.images.length)
    }
  }

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user)
    } else {
      onProfileOpen()
    }
  }

  const images = user.profile?.images || [user.profile?.mainImage]
  const hasMultipleimages = images.length > 1

  // Variante Discovery (estilo Tinder)
  if (variant === 'discovery') {
    return (
      <>
        <Card className='w-full max-w-sm mx-auto bg-gray-800 border-gray-600/30 overflow-hidden'>
          <CardBody className='p-0'>
            {/* Galería de imágenes */}
            <div className='relative aspect-[3/4] group'>
              <img
                src={images[currentPhotoIndex]}
                alt={`${user.profile?.name} - Foto ${currentPhotoIndex + 1}`}
                className='w-full h-full object-cover'
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
                    onClick={prevPhoto}
                    className='absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'>
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'>
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </>
              )}

              {/* Overlay superior */}
              <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
                <div className='flex items-center gap-2'>
                  {user.isOnline && (
                    <Chip size='sm' color='success' variant='flat'>
                      En línea
                    </Chip>
                  )}
                  {showCompatibility && user.compatibility && (
                    <Chip size='sm' color='danger' variant='flat'>
                      {user.compatibility}% match
                    </Chip>
                  )}
                </div>

                {onToggleFavorite && (
                  <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    className={`${isFavorite ? 'text-pink-400 bg-pink-400/20' : 'text-gray-400 bg-gray-800/50'}`}
                    onPress={() => onToggleFavorite(user.id)}>
                    {isFavorite ? <Heart className='w-4 h-4 fill-current' /> : <HeartOff className='w-4 h-4' />}
                  </Button>
                )}
              </div>

              {/* Información sobre la imagen */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                <div className='flex items-end justify-between'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='text-xl font-bold text-white'>{user.profile?.name}</h3>
                      {getCategoryIcon(user.profile?.categoryInterest)}
                    </div>
                    <p className='text-white/80 text-sm'>{user.profile?.age} años</p>
                    {showDistance && (
                      <div className='flex items-center gap-1 text-white/60 text-xs'>
                        <MapPin className='w-3 h-3' />
                        <span>
                          {user.profile?.city} • {user.distance} km
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    size='sm'
                    variant='flat'
                    className='bg-white/20 backdrop-blur-sm text-white'
                    startContent={<Eye className='w-3 h-3' />}
                    onPress={handleViewProfile}>
                    Ver más
                  </Button>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className='p-4 space-y-3'>
              {user.occupation && (
                <div>
                  <h4 className='font-medium text-gray-200 mb-1'>{user.occupation}</h4>
                  {user.education && <p className='text-sm text-gray-400'>{user.education}</p>}
                </div>
              )}

              {user.profile?.description && <p className='text-sm text-gray-300 line-clamp-2'>{user.profile?.description}</p>}

              {user.interests && user.interests.length > 0 && (
                <div>
                  <p className='text-xs text-gray-400 mb-2'>Intereses:</p>
                  <div className='flex flex-wrap gap-1'>
                    {user.interests.slice(0, 4).map((interest, index) => (
                      <Chip key={index} size='sm' variant='flat' color='primary' className='text-xs bg-primary-500/20 text-primary-300'>
                        {interest}
                      </Chip>
                    ))}
                    {user.interests.length > 4 && (
                      <Chip size='sm' variant='flat' className='text-xs bg-gray-500/20 text-gray-300'>
                        +{user.interests.length - 4}
                      </Chip>
                    )}
                  </div>
                </div>
              )}

              {showLastActivity && user.lastActivity && (
                <div className='flex items-center gap-2 text-xs text-gray-400'>
                  <Clock className='w-3 h-3' />
                  <span>{getTimeAgo(user.lastActivity)}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Modal de perfil si no se maneja externamente */}
        {!onViewProfile && (
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
                  <ModalHeader>
                    <div className='flex items-center gap-3'>
                      <Avatar src={user.profile?.mainImage} alt={user.profile?.name} className='w-12 h-12' />
                      <div>
                        <h3 className='text-lg font-bold text-gray-200'>{user.profile?.name}</h3>
                        <p className='text-gray-400'>
                          {user.profile?.age} años • {user.profile?.city}
                        </p>
                      </div>
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <div className='space-y-4'>
                      {user.profile?.description && (
                        <div>
                          <h4 className='font-semibold text-gray-200 mb-2'>Acerca de {user.profile?.name}</h4>
                          <p className='text-gray-300 text-sm'>{user.profile?.description}</p>
                        </div>
                      )}

                      {user.interests && user.interests.length > 0 && (
                        <div>
                          <h4 className='font-semibold text-gray-200 mb-2'>Intereses</h4>
                          <div className='flex flex-wrap gap-2'>
                            {user.interests.map((interest, index) => (
                              <Chip key={index} size='sm' variant='flat' color='primary'>
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

  // Variante Compact (para listas)
  if (variant === 'compact') {
    return (
      <Card className='bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-4'>
            {/* Galería compacta */}
            <div className='relative shrink-0'>
              <div className='relative w-16 h-16 rounded-lg overflow-hidden group'>
                <img src={images[currentPhotoIndex]} alt={user.profile?.name} className='w-full h-full object-cover' />
                {hasMultipleimages && (
                  <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-1'>
                    <button onClick={prevPhoto} className='text-white'>
                      <ChevronLeft className='w-3 h-3' />
                    </button>
                    <button onClick={nextPhoto} className='text-white'>
                      <ChevronRight className='w-3 h-3' />
                    </button>
                  </div>
                )}
              </div>
              {user.isOnline && <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full' />}
            </div>

            {/* Información */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold text-gray-200'>{user.profile?.name}</h3>
                  {getCategoryIcon(user.profile?.categoryInterest)}
                  <span className='text-sm text-gray-400'>{user.profile?.age} años</span>
                </div>
                {showCompatibility && user.compatibility && (
                  <Chip size='sm' color='danger' variant='flat'>
                    {user.compatibility}%
                  </Chip>
                )}
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  {showDistance && (
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      <MapPin className='w-3 h-3' />
                      <span>
                        {user.profile?.city} • {user.distance} km
                      </span>
                    </div>
                  )}
                  {showLastActivity && user.lastActivity && (
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      <Clock className='w-3 h-3' />
                      <span>{getTimeAgo(user.lastActivity)}</span>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-2 shrink-0'>
                  <Button
                    size='sm'
                    variant='bordered'
                    className='border-gray-600 text-gray-300 hover:bg-gray-700/30'
                    startContent={<Eye className='w-3 h-3' />}
                    onPress={handleViewProfile}>
                    Ver
                  </Button>
                  {onMessage && (
                    <Button size='sm' color='primary' startContent={<MessageCircle className='w-3 h-3' />} onPress={() => onMessage(user)}>
                      Mensaje
                    </Button>
                  )}
                  {onToggleFavorite && (
                    <Button
                      size='sm'
                      color={isFavorite ? 'danger' : 'default'}
                      variant='flat'
                      isIconOnly
                      onPress={() => onToggleFavorite(user.id)}>
                      {isFavorite ? <Heart className='w-3 h-3 fill-current' /> : <HeartOff className='w-3 h-3' />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Variante Default (para grids)
  return (
    <Card className='bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200'>
      <CardBody className='p-4'>
        {/* Header del perfil */}
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className='relative group'>
              <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                <img src={images[currentPhotoIndex]} alt={user.profile?.name} className='w-full h-full object-cover' />
                {hasMultipleimages && (
                  <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-1'>
                    <button onClick={prevPhoto} className='text-white'>
                      <ChevronLeft className='w-2 h-2' />
                    </button>
                    <button onClick={nextPhoto} className='text-white'>
                      <ChevronRight className='w-2 h-2' />
                    </button>
                  </div>
                )}
              </div>
              {user.isOnline && <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full' />}
            </div>
            <div>
              <h3 className='font-semibold text-gray-200'>{user.profile?.name}</h3>
              <p className='text-sm text-gray-400'>{user.profile?.age} años</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            {getCategoryIcon(user.profile?.categoryInterest)}
            {showCompatibility && user.compatibility && (
              <Chip size='sm' color='danger' variant='flat' className='text-xs'>
                {user.compatibility}%
              </Chip>
            )}
          </div>
        </div>

        {/* Información básica */}
        <div className='space-y-2 mb-3'>
          {showDistance && (
            <div className='flex items-center gap-2 text-sm text-gray-400'>
              <MapPin className='w-3 h-3' />
              <span>
                {user.profile?.city} • {user.distance} km
              </span>
            </div>
          )}
          {user.occupation && <p className='text-sm text-gray-400'>{user.occupation}</p>}
          {showLastActivity && user.lastActivity && (
            <div className='flex items-center gap-2 text-sm text-gray-400'>
              <Clock className='w-3 h-3' />
              <span>{getTimeAgo(user.lastActivity)}</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        {user.profile?.description && <p className='text-sm text-gray-300 mb-3 line-clamp-2'>{user.profile?.description}</p>}

        {/* Intereses */}
        {user.interests && user.interests.length > 0 && (
          <div className='mb-4'>
            <div className='flex flex-wrap gap-1'>
              {user.interests.slice(0, 3).map((interest, index) => (
                <Chip key={index} size='sm' variant='flat' color='primary' className='text-xs bg-primary-500/20 text-primary-300'>
                  {interest}
                </Chip>
              ))}
              {user.interests.length > 3 && (
                <Chip size='sm' variant='flat' className='text-xs bg-gray-500/20 text-gray-300'>
                  +{user.interests.length - 3}
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='bordered'
            className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/30'
            startContent={<Eye className='w-3 h-3' />}
            onPress={handleViewProfile}>
            Ver
          </Button>
          {onMessage && (
            <Button
              size='sm'
              color='primary'
              className='flex-1'
              startContent={<MessageCircle className='w-3 h-3' />}
              onPress={() => onMessage(user)}>
              Mensaje
            </Button>
          )}
          {onToggleFavorite && (
            <Button size='sm' color={isFavorite ? 'danger' : 'default'} variant='flat' isIconOnly onPress={() => onToggleFavorite(user.id)}>
              {isFavorite ? <Heart className='w-3 h-3 fill-current' /> : <HeartOff className='w-3 h-3' />}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default UserCard
