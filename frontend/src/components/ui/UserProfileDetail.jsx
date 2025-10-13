import { useState } from 'react'
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import {
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Bookmark,
  Star,
  Sparkles,
  Flame,
  Briefcase,
  GraduationCap,
  Clock,
  Shield
} from 'lucide-react'

const UserProfileDetail = ({ user, isOpen, onOpenChange, onLike, onPass, onSuperLike, isMobile = false }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Early return si no hay usuario
  if (!user || !isOpen) {
    return null
  }

  // Función auxiliar para obtener datos del usuario
  const getUserData = () => {
    if (user?.name && !user?.profile?.name) {
      return {
        name: user.name,
        age: user.age,
        city: user.city,
        description: user.description,
        categoryInterest: user.categoryInterest,
        mainImage: user.mainImage || user.image,
        images: user.images || [user.mainImage || user.image].filter(Boolean),
        tags: user.tags || [],
        church: user.church,
        phone: user.phone,
        email: user.email,
        job: user.job,
        education: user.education,
        relationshipGoal: user.relationshipGoal,
        lastActivity: user.lastActivity
      }
    }

    return {
      name: user.profile?.name,
      age: user.profile?.age,
      city: user.profile?.city,
      description: user.profile?.description,
      categoryInterest: user.profile?.categoryInterest,
      mainImage: user.profile?.mainImage || user.profile?.image,
      images: user.profile?.images || [user.profile?.mainImage || user.profile?.image].filter(Boolean),
      tags: user.profile?.tags || [],
      church: user.profile?.church,
      phone: user.profile?.phone,
      email: user.profile?.email,
      job: user.profile?.job,
      education: user.profile?.education,
      relationshipGoal: user.profile?.relationshipGoal,
      lastActivity: user.profile?.lastActivity
    }
  }

  const userData = getUserData()
  const images = userData.images || [userData.mainImage].filter(Boolean)
  const hasMultipleImages = images.length > 1

  // Obtener icono de categoría
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-5 h-5 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-5 h-5 text-red-400' />
      case 'SPIRIT':
        return <Star className='w-5 h-5 text-purple-400' />
      default:
        return <Heart className='w-5 h-5 text-gray-400' />
    }
  }

  const nextPhoto = () => {
    if (hasMultipleImages) {
      setCurrentPhotoIndex(prev => (prev + 1) % images.length)
    }
  }

  const prevPhoto = () => {
    if (hasMultipleImages) {
      setCurrentPhotoIndex(prev => (prev - 1 + images.length) % images.length)
    }
  }

  const getTimeAgo = date => {
    if (!date) return null
    const now = new Date()
    const diffInDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`

    return `Hace ${Math.floor(diffInDays / 30)} meses`
  }

  // Contenido principal del perfil
  const ProfileContent = () => (
    <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-8 h-full'}`}>
      {/* Galería de fotos */}
      <div className={`${isMobile ? '' : 'flex flex-col'}`}>
        <div className='relative h-96 md:h-full md:max-h-[600px] group bg-gray-800 rounded-2xl overflow-hidden'>
          <img
            alt={`${userData.name} - Foto ${currentPhotoIndex + 1}`}
            className='w-full h-full object-cover'
            src={images[currentPhotoIndex]}
          />

          {/* Indicadores de fotos */}
          {hasMultipleImages && (
            <div className='absolute top-4 left-4 right-4 flex gap-1'>
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}

          {/* Controles de navegación */}
          {hasMultipleImages && (
            <>
              <button
                className='absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={prevPhoto}>
                <ChevronLeft className='w-5 h-5' />
              </button>
              <button
                className='absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={nextPhoto}>
                <ChevronRight className='w-5 h-5' />
              </button>
            </>
          )}

          {/* Info básica sobre la imagen */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6'>
            <div className='flex items-end justify-between'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h2 className='text-2xl font-bold text-white drop-shadow-md'>{userData.name}</h2>
                  {getCategoryIcon(userData.categoryInterest)}
                </div>
                <p className='text-white/90 text-lg drop-shadow-sm'>{userData.age} años</p>
                {userData.city && (
                  <div className='flex items-center gap-2 text-white/80 text-sm drop-shadow-sm mt-1'>
                    <MapPin className='w-4 h-4' />
                    <span>{userData.city}</span>
                  </div>
                )}
              </div>
              {user.status?.verified && (
                <div className='flex items-center gap-2 bg-black/40 rounded-full px-3 py-1'>
                  <Shield className='w-4 h-4 text-primary-400' />
                  <span className='text-white text-sm'>Verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className={`${isMobile ? '' : 'flex flex-col overflow-y-auto'} space-y-6`}>
        {/* Descripción */}
        {userData.description && userData.description !== 'TEMPORAL_DESCRIPTION' && (
          <div>
            <h3 className='text-lg font-semibold text-gray-200 mb-3'>Acerca de {userData.name}</h3>
            <p className='text-gray-300 leading-relaxed'>{userData.description}</p>
          </div>
        )}

        {/* Compatibilidad y estado */}
        <div className='flex flex-wrap gap-3'>
          {user.compatibility && (
            <Chip className='font-semibold' color='danger' size='lg' variant='flat'>
              {user.compatibility}% compatibilidad
            </Chip>
          )}
          {user.isOnline && (
            <Chip color='success' size='lg' variant='flat'>
              En línea ahora
            </Chip>
          )}
          {userData.lastActivity && (
            <Chip color='default' size='lg' startContent={<Clock className='w-4 h-4' />} variant='flat'>
              Activo {getTimeAgo(userData.lastActivity)}
            </Chip>
          )}
        </div>

        {/* Intereses */}
        {userData.tags && userData.tags.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold text-gray-200 mb-3'>Intereses</h3>
            <div className='flex flex-wrap gap-2'>
              {userData.tags.map((tag, index) => (
                <Chip key={index} className='text-gray-300 border-gray-600 bg-gray-800/30' size='md' variant='bordered'>
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Información personal */}
        <div>
          <h3 className='text-lg font-semibold text-gray-200 mb-3'>Información</h3>
          <div className='space-y-3'>
            {userData.job && (
              <div className='flex items-center gap-3 text-gray-300'>
                <Briefcase className='w-5 h-5 text-gray-500' />
                <span>{userData.job}</span>
              </div>
            )}
            {userData.education && (
              <div className='flex items-center gap-3 text-gray-300'>
                <GraduationCap className='w-5 h-5 text-gray-500' />
                <span>{userData.education}</span>
              </div>
            )}
            {userData.church && (
              <div className='flex items-center gap-3 text-gray-300'>
                <Heart className='w-5 h-5 text-gray-500' />
                <span>{userData.church}</span>
              </div>
            )}
            {userData.relationshipGoal && (
              <div className='flex items-center gap-3 text-gray-300'>
                <Star className='w-5 h-5 text-gray-500' />
                <span>Busca: {userData.relationshipGoal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Controles de acción */}
        {(onLike || onPass || onSuperLike) && (
          <div className='flex items-center justify-center gap-4 pt-4 border-t border-gray-700'>
            {onPass && (
              <Button
                isIconOnly
                className='bg-gray-700 hover:bg-gray-600 transition-all duration-200 w-14 h-14'
                color='default'
                size='lg'
                variant='solid'
                onPress={() => onPass(user)}>
                <X className='w-6 h-6' />
              </Button>
            )}

            {onSuperLike && (
              <Button
                isIconOnly
                className='bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transition-all duration-200 w-14 h-14'
                size='lg'
                variant='solid'
                onPress={() => onSuperLike(user)}>
                <Bookmark className='w-6 h-6 text-white' />
              </Button>
            )}

            {onLike && (
              <Button
                isIconOnly
                className='bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 transition-all duration-200 w-14 h-14'
                color='danger'
                size='lg'
                variant='solid'
                onPress={() => onLike(user)}>
                <Heart className='w-6 h-6 text-white' />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Si es móvil, mostrar modal
  if (isMobile) {
    return (
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50 top-4 right-4 z-50'
        }}
        isOpen={isOpen}
        size='full'
        onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className='flex justify-between items-center'>
            <span className='text-gray-200'>Perfil de {userData.name}</span>
          </ModalHeader>
          <ModalBody className='px-6 py-0'>
            <ProfileContent />
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  // Si es desktop, mostrar contenido directo
  return isOpen ? <ProfileContent /> : null
}

export default UserProfileDetail
