import React, { useState } from 'react'
import { Card, CardBody, Button, Chip, Spinner } from '@heroui/react'
import { Heart, MapPin, Eye, ChevronLeft, ChevronRight, X, Bookmark, Clock, CheckCircle2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths.js'

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

const UserCard = ({
  user,
  onLike,
  onPass,
  onToggleFavorite,
  isFavorite = false,
  showDistance = true,
  showMatchControls = false,
  matchLoading = false
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(false)

  // Extraer datos usando estructura anidada con fallbacks (API: user.user.user / user.user.status)
  // Soporta ambas estructuras: anidada (user.user.user) y plana (user.user)
  const profile = user?.user?.user || user?.user
  const status = user?.user?.status || user?.status
  const compatibility = user?.compatibility
  const hasPendingMatch = user?.hasPendingMatch
  const hasAcceptedMatch = user?.hasAcceptedMatch

  // Datos del perfil
  const name = profile?.name
  const lastName = profile?.lastName
  const age = profile?.age
  const profession = profile?.profession
  const city = profile?.city
  const department = profile?.department
  const locality = profile?.locality
  const description = profile?.description
  const images = profile?.images || []
  const gender = profile?.gender

  // Datos del perfil y status
  const userId = profile?.id
  const lastActive = status?.lastActive

  // Datos de compatibilidad
  const compatibilityPercentage = compatibility?.totalPercentage

  const nextPhoto = () => {
    if (images && images.length > 1) {
      setImageLoading(true)
      setCurrentPhotoIndex(prev => (prev + 1) % images.length)
    }
  }

  const prevPhoto = () => {
    if (images && images.length > 1) {
      setImageLoading(true)
      setCurrentPhotoIndex(prev => (prev - 1 + images.length) % images.length)
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
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

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(userId)
    }
  }

  const hasMultipleimages = images.length > 1
  const colorClasses = {
    green: 'bg-green-500/70 border border-green-400/50 text-green-100',
    blue: 'bg-blue-500/70 border border-blue-400/50 text-blue-100',
    yellow: 'bg-yellow-500/70 border border-yellow-400/50 text-yellow-100',
    orange: 'bg-orange-500/70 border border-orange-400/50 text-orange-100',
    red: 'bg-red-500/70 border border-red-400/50 text-red-100',
    gray: 'bg-gray-500/70 border border-gray-400/50 text-gray-100'
  }
  const { text: lastActiveText, color } = formatLastActive(lastActive)

  const fullLocation = formatLocation(city, department, locality)
  // Limitar descripción a 120 caracteres
  const truncatedDescription = description && description.length > 35 ? `${description.substring(0, 35)}...` : description

  return (
    <Card className='w-full mx-auto bg-gray-900 border-none overflow-hidden shadow-2xl rounded-2xl'>
      <CardBody className='p-0'>
        {/* Galería de imágenes */}
        <div className='relative h-[calc(100vh-280px)] max-h-[520px] min-h-[400px] group overflow-hidden shadow-2xl rounded-2xl'>
          <img
            alt={`${name} - Foto ${currentPhotoIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            src={images[currentPhotoIndex]}
            onLoad={handleImageLoad}
          />

          {/* Spinner de carga */}
          {imageLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
              <Spinner color='primary' size='lg' />
            </div>
          )}

          {/* Indicadores de fotos */}
          {hasMultipleimages && (
            <div className='absolute top-2 left-3 right-3 flex gap-1.5 z-10'>
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-0.5 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`}
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

          {/* Overlay superior - Simplificado para mobile */}
          <div className='absolute top-5 left-3 right-3 flex justify-between items-start z-10'>
            {/* Badge de categoría y estado de match */}
            <div className='flex flex-col gap-1 items-start'>
              {/* Última actividad */}
              {lastActiveText && (
                <Chip
                  className={`relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 rounded-full backdrop-blur-md text-[11px] h-6 font-medium ${colorClasses[color]}`}
                  size='sm'
                  startContent={<Clock className='w-3 h-3' />}>
                  {lastActiveText || 'Sin actividad reciente'}
                </Chip>
              )}
              {/* Indicadores de estado de match */}
              {hasAcceptedMatch && (
                <Chip
                  className='bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-md border-green-300/40 text-white text-[10px] h-auto py-0.5'
                  size='sm'
                  startContent={<CheckCircle2 className='w-2.5 h-2.5' />}
                  variant='bordered'>
                  Match aceptado
                </Chip>
              )}
              {hasPendingMatch && !hasAcceptedMatch && (
                <Chip
                  className='bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md border-yellow-300/40 text-white text-[10px] h-auto py-0.5'
                  size='sm'
                  startContent={<Mail className='w-2.5 h-2.5' />}
                  variant='bordered'>
                  Match pendiente
                </Chip>
              )}
            </div>

            <div className='flex-1' />

            <div className='flex flex-col gap-1 items-end'>
              {/* Compatibilidad con detalles */}
              {compatibilityPercentage && (
                <Chip
                  className={`${
                    compatibilityPercentage >= 80
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 ring-1 ring-secondary-500/30'
                      : compatibilityPercentage >= 60
                        ? 'bg-gradient-to-r from-primary-500 to-purple-500'
                        : 'bg-gray-600'
                  } text-white font-bold text-xs h-6`}
                  size='sm'>
                  {compatibilityPercentage}% Compatible
                </Chip>
              )}
            </div>
          </div>

          {/* Información sobre la imagen - Optimizada para mobile con mejor uso del espacio */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent pt-10 pb-2 px-3'>
            <div className='space-y-2'>
              {/* Header con nombre */}
              <div className='flex items-center gap-1.5 mb-1'>
                <h3 className='text-2xl font-bold text-white drop-shadow-lg truncate'>
                  {lastName ? `${name} ${lastName[0]}.` : name}, {age}
                </h3>
              </div>

              {/* Descripción breve con límite de caracteres */}
              {truncatedDescription && <p className='text-white/85 text-sm leading-relaxed drop-shadow-sm'>{truncatedDescription}</p>}

              {/* Información de profesión y género */}
              <div className='flex flex-wrap gap-1.5'>
                {profession && (
                  <Chip
                    className='bg-purple-500/30 border border-purple-400/50 text-purple-100 backdrop-blur-md text-[11px] h-6 font-medium'
                    size='sm'
                    variant='bordered'>
                    {profession}
                  </Chip>
                )}
                {gender && (
                  <Chip
                    className='bg-indigo-500/30 border border-indigo-400/50 text-indigo-100 backdrop-blur-md text-[11px] h-6 font-medium'
                    size='sm'
                    variant='bordered'>
                    {gender}
                  </Chip>
                )}
              </div>

              {/* Ubicación y botón de ver perfil */}
              <div className='flex items-center justify-between gap-3 mb-1'>
                {showDistance && fullLocation ? (
                  <div className='flex items-center gap-1 text-white/90 text-sm drop-shadow-sm flex-1 min-w-0'>
                    <MapPin className='w-3.5 h-3.5 flex-shrink-0' />
                    <span className='truncate'>{fullLocation}</span>
                  </div>
                ) : (
                  <div className='flex-1' />
                )}
                <Button
                  as={Link}
                  size='sm'
                  startContent={<Eye className='w-3.5 h-3.5' />}
                  to={userId ? APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', userId) : '#'}
                  variant='solid'>
                  Ver perfil
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional - Eliminada para mobile first */}
        {/* Se puede ver el detalle completo al hacer clic en el botón de ver perfil */}

        {/* Controles de match - 3 botones optimizados para mobile */}
        {showMatchControls && (
          <div className='px-4 py-3 bg-gray-900 space-y-2'>
            <div className='flex items-center justify-center gap-4'>
              {/* Botón Pasar - Izquierda */}
              <Button
                isIconOnly
                className='bg-white/10 hover:bg-red-500/20 active:bg-red-500/30 border-2 border-white/20 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-200'
                radius='full'
                variant='flat'
                onPress={handlePass}>
                <X className='w-5 h-5' strokeWidth={2.5} />
              </Button>

              {/* Botón Match - Centro (más grande) */}
              <Button
                isIconOnly
                className='bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 active:scale-95 transition-all duration-200 shadow-xl shadow-pink-500/40 border-2 border-white/20'
                isLoading={matchLoading}
                radius='full'
                size='lg'
                variant='solid'
                onPress={handleLike}>
                {!matchLoading && <Heart className='w-6 h-6 text-white fill-current' />}
              </Button>

              {/* Botón Favorito - Derecha */}
              {onToggleFavorite && (
                <Button
                  isIconOnly
                  className={`${
                    isFavorite
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40 border-2 border-blue-300/40'
                      : 'bg-white/10 border-2 border-white/20 hover:border-blue-500/60 hover:bg-blue-500/20'
                  } text-blue-300 hover:text-blue-200 active:scale-95 transition-all duration-200`}
                  radius='full'
                  variant='flat'
                  onPress={handleToggleFavorite}>
                  <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2.5} />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default React.memo(UserCard)
