import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spinner, Chip, Card, CardBody, Avatar } from '@heroui/react'
import { ArrowLeft, MapPin, Heart, X, Bookmark, Clock, CheckCircle2, Mail, Eye, Star, Users, Briefcase, Menu, Shield, Camera, Brain, Target, Sparkles } from 'lucide-react'
import { useUser, useMatchInteractions, useMatchFavorites } from '@hooks'
import { useState, useEffect, useCallback } from 'react'
import LightGallery from 'lightgallery/react'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import { Logger } from '@utils/logger.js'

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

  // Hooks
  const { getUserProfileById } = useUser()
  const { sendMatch, dismissSuggestion, loading: matchLoading } = useMatchInteractions()
  const { toggleFavorite, checkIfFavorite, loading: favoriteLoading } = useMatchFavorites()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  // Obtener el usuario por ID
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          setLoading(true)
          const result = await getUserProfileById(userId, 'public', false)

          if (result?.success && result?.data) {
            setUserData(result.data)
            const favoriteStatus = await checkIfFavorite(userId)

            setIsFavorite(favoriteStatus)
          }
        } catch (error) {
          Logger.error(Logger.CATEGORIES.USER, 'fetch_user_profile', 'Error al obtener perfil de usuario', { error, userId })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUser()
  }, [userId, getUserProfileById, checkIfFavorite])

  const handleBack = () => {
    navigate(-1)
  }

  // Handlers para acciones de match
  const handleLike = useCallback(async () => {
    try {
      await sendMatch(userId)
      handleBack()
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'send_match', 'Error al enviar match', { error, userId })
    }
  }, [userId, sendMatch])

  const handlePass = useCallback(async () => {
    try {
      await dismissSuggestion(userId)
      handleBack()
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'dismiss_suggestion', 'Error al descartar sugerencia', { error, userId })
    }
  }, [userId, dismissSuggestion])

  const handleToggleFavorite = useCallback(async () => {
    try {
      const newFavoriteStatus = await toggleFavorite(userId)

      setIsFavorite(newFavoriteStatus)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.USER, 'toggle_favorite', 'Error al cambiar favorito', { error, userId })
    }
  }, [userId, toggleFavorite])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-950'>
        <Spinner color='primary' size='lg' />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-300 px-4'>
        <h2 className='text-2xl font-bold mb-4'>Usuario no encontrado</h2>
        <Button color='primary' onPress={handleBack}>
          Volver
        </Button>
      </div>
    )
  }

  // Extraer datos
  const profile = userData?.user?.profile || userData?.profile
  const status = userData?.user?.status || userData?.status
  const compatibility = userData?.compatibility
  const hasPendingMatch = userData?.hasPendingMatch
  const hasAcceptedMatch = userData?.hasAcceptedMatch

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

  // Datos de status
  const lastActive = status?.lastActive

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
            {profile?.isVerified && (
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

            {/* Galería interactiva con LightGallery */}
            {images.length > 0 ? (
              <LightGallery elementClassNames='grid grid-cols-2 gap-2' plugins={[lgThumbnail, lgZoom]} speed={500}>
                {images.map((image, index) => (
                  <a
                    key={index}
                    className='relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-gray-800 block'
                    data-src={image}
                    href={image}>
                    <img alt={`${name} - Foto ${index + 1}`} className='w-full h-full object-cover' src={image} />
                    {/* Overlay hover */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center'>
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white text-sm font-medium'>
                        <Eye className='w-4 h-4' />
                        <span>Ver</span>
                      </div>
                    </div>
                  </a>
                ))}
              </LightGallery>
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
    </div>
  )
}

export default UserDetail
