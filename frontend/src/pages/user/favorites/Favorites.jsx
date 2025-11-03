import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardBody, CardFooter, Button, Chip, Spinner, Pagination, useDisclosure } from '@heroui/react'
import { Heart, Bookmark, Eye, MapPin, UserX, RefreshCw, ChevronLeft, ChevronRight, X, CheckCircle2, Mail } from 'lucide-react'
import { useMatchFavorites, useMatchInteractions } from '@hooks'
import { useMatch } from '@contexts/MatchContext'
import { APP_PATHS } from '@constants/paths'
import { Logger } from '@utils/logger.js'
import {
  getUserId,
  getUserName,
  getUserLastName,
  getUserAge,
  getUserProfession,
  getUserCity,
  getUserDepartment,
  getUserImages,
  getUserGender
} from '@schemas'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import MatchConfirmModal from '@components/ui/userSuggestionCards/components/MatchConfirmModal.jsx'

import FavoriteRemoveModal from './components/FavoriteRemoveModal.jsx'

const Favorites = () => {
  const navigate = useNavigate()

  // Hook de favoritos
  const { favorites, fetchFavorites, removeFromFavorites, loading: hookLoading } = useMatchFavorites()

  // Estado para manejar errores de carga
  const [loadError, setLoadError] = useState(false)

  // Hook del contexto de match para manejar modal premium
  const { showPremiumModal } = useMatch()

  const [removingFavorite, setRemovingFavorite] = useState(null)
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    size: 6
  })
  // Estado para galería de fotos
  const [currentPhotoIndexes, setCurrentPhotoIndexes] = useState({})
  const [imageLoadingStates, setImageLoadingStates] = useState({})

  // Estados para modales
  const [pendingAction, setPendingAction] = useState(null)
  const { isOpen: isMatchModalOpen, onOpen: onMatchModalOpen, onOpenChange: onMatchModalOpenChange } = useDisclosure()
  const { isOpen: isRemoveModalOpen, onOpen: onRemoveModalOpen, onOpenChange: onRemoveModalOpenChange } = useDisclosure()

  // Callback personalizado cuando no hay intentos disponibles
  const handleNoAttemptsAvailable = useCallback(() => {
    if (pendingAction) {
      showPremiumModal(pendingAction.userName, pendingAction.userImage)
    }
  }, [pendingAction, showPremiumModal])

  // Hooks para interacciones con matches
  const { sendMatch, loading: matchLoading } = useMatchInteractions({
    onNoAttemptsAvailable: handleNoAttemptsAvailable
  })

  // Cargar favoritos
  const loadFavorites = useCallback(
    async (page = 0, size = 6) => {
      try {
        setLoadError(false)
        Logger.info(Logger.CATEGORIES.SERVICE, 'load_favorites', 'Cargando favoritos', { page, size })

        const response = await fetchFavorites(page, size)

        if (response) {
          const rawContent = response?.content ?? response
          const normalizedContent = Array.isArray(rawContent) ? rawContent : rawContent ? [rawContent] : []

          // Actualizar paginación - el backend retorna pageable.pageNumber
          const currentPage = response.pageable?.pageNumber ?? response.page ?? 0
          const pageSize = response.pageable?.pageSize ?? response.size ?? size

          setPagination({
            page: currentPage,
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            size: pageSize
          })

          Logger.info(Logger.CATEGORIES.SERVICE, 'load_favorites', `${normalizedContent.length || 0} favoritos cargados`)
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'load_favorites', 'Error al cargar favoritos', { error })
        setLoadError(true)
      }
    },
    [fetchFavorites]
  )

  // Cargar favoritos al montar
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Asegurar que los estados asociados a imágenes mantengan solo IDs vigentes
  useEffect(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      setCurrentPhotoIndexes({})
      setImageLoadingStates({})

      return
    }

    const validIds = new Set(
      favorites
        .map(item => {
          const user = item?.favoriteUser || item
          const userId = getUserId(user)

          return userId != null ? String(userId) : null
        })
        .filter(Boolean)
    )

    setCurrentPhotoIndexes(prev => {
      const next = {}

      for (const id of validIds) {
        if (Object.prototype.hasOwnProperty.call(prev, id)) {
          next[id] = prev[id]
        }
      }

      return Object.keys(next).length === Object.keys(prev).length ? prev : next
    })

    setImageLoadingStates(prev => {
      const next = {}

      for (const id of validIds) {
        if (Object.prototype.hasOwnProperty.call(prev, id)) {
          next[id] = prev[id]
        }
      }

      return Object.keys(next).length === Object.keys(prev).length ? prev : next
    })
  }, [favorites])

  // Early return para error de carga
  if (loadError) {
    return (
      <LoadDataError retryAction={() => loadFavorites(pagination.page, pagination.size)} retryButtonText='Reintentar cargar favoritos'>
        Error al cargar la lista de favoritos
      </LoadDataError>
    )
  }

  // Handler para abrir modal de confirmación de eliminación
  const handleOpenRemoveModal = favoriteData => {
    const user = favoriteData.favoriteUser || favoriteData
    const userId = getUserId(user)
    const userName = getUserName(user)
    const userImage = getUserImages(user)?.[0]

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'remove_favorite', 'No se pudo obtener el ID del usuario')

      return
    }

    setPendingAction({ type: 'remove', userId, userName, userImage })
    onRemoveModalOpen()
  }

  // Confirmar eliminación de favoritos
  const confirmRemoveFavorite = async () => {
    if (!pendingAction || pendingAction.type !== 'remove') return

    const { userId } = pendingAction

    try {
      setRemovingFavorite(userId)
      Logger.info(Logger.CATEGORIES.UI, 'remove_favorite', 'Removiendo de favoritos', { userId })

      await removeFromFavorites(userId)

      Logger.info(Logger.CATEGORIES.UI, 'remove_favorite', 'Usuario removido de favoritos exitosamente')

      // Calcular nueva paginación después de eliminar
      const newTotalElements = pagination.totalElements - 1
      const newTotalPages = Math.ceil(newTotalElements / pagination.size)

      // Si la página actual ya no existe después de eliminar, ir a la última página válida
      const currentPageIsValid = pagination.page < newTotalPages
      const newPage = currentPageIsValid ? pagination.page : Math.max(0, newTotalPages - 1)

      // Siempre recargar desde el servidor para asegurar datos actualizados
      await loadFavorites(newPage, pagination.size)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.UI, 'remove_favorite', 'Error al remover de favoritos', { error, userId })
    } finally {
      setRemovingFavorite(null)
      setPendingAction(null)
    }
  }

  // Ver perfil
  const handleViewProfile = favoriteData => {
    // Extraer usuario desde FavoriteResponseDTO
    const user = favoriteData.favoriteUser || favoriteData
    const userId = getUserId(user)

    if (userId) {
      navigate(APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', userId))
    }
  }

  // Formatear ubicación
  const formatLocation = (city, department) => {
    const parts = []

    if (city) parts.push(city)
    if (department && department !== city) parts.push(department)

    return parts.length > 0 ? parts.join(', ') : null
  }

  // Cambio de página
  const handlePageChange = page => {
    // Pagination component es 1-indexed, backend es 0-indexed
    loadFavorites(page - 1, pagination.size)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Navegación de fotos
  const nextPhoto = userId => {
    setImageLoadingStates(prev => ({ ...prev, [userId]: true }))
    setCurrentPhotoIndexes(prev => {
      const user = favorites.find(fav => getUserId(fav.favoriteUser || fav) === userId)
      const images = getUserImages(user?.favoriteUser || user)

      if (!images || images.length <= 1) return prev

      const current = prev[userId] || 0

      return { ...prev, [userId]: (current + 1) % images.length }
    })
  }

  const prevPhoto = userId => {
    setImageLoadingStates(prev => ({ ...prev, [userId]: true }))
    setCurrentPhotoIndexes(prev => {
      const user = favorites.find(fav => getUserId(fav.favoriteUser || fav) === userId)
      const images = getUserImages(user?.favoriteUser || user)

      if (!images || images.length <= 1) return prev

      const current = prev[userId] || 0

      return { ...prev, [userId]: (current - 1 + images.length) % images.length }
    })
  }

  // Handler para cuando la imagen termina de cargar
  const handleImageLoad = userId => {
    setImageLoadingStates(prev => ({ ...prev, [userId]: false }))
  }

  // Handler para match - abre modal de confirmación
  const handleMatch = favoriteData => {
    const user = favoriteData.favoriteUser || favoriteData
    const userId = getUserId(user)
    const userName = getUserName(user)
    const userImage = getUserImages(user)?.[0]

    if (!userId || matchLoading) {
      Logger.warn(Logger.CATEGORIES.UI, 'enviar match', 'No se pudo obtener el ID del usuario')

      return
    }

    setPendingAction({ type: 'match', userId, userName, userImage })
    onMatchModalOpen()
  }

  // Confirmar match
  const confirmMatch = async () => {
    if (!pendingAction || pendingAction.type !== 'match') return

    try {
      // Enviar match al backend
      await sendMatch(pendingAction.userId)
      Logger.info(Logger.CATEGORIES.UI, 'enviar match', 'Match enviado exitosamente')
    } catch (error) {
      Logger.error(Logger.CATEGORIES.UI, 'enviar match', error)
    } finally {
      setPendingAction(null)
    }
  }

  // Renderizar card de favorito
  const renderFavoriteCard = favoriteData => {
    // Extraer usuario desde FavoriteResponseDTO
    const user = favoriteData.favoriteUser || favoriteData

    const userId = getUserId(user)
    const name = getUserName(user)
    const lastName = getUserLastName(user)
    const age = getUserAge(user)
    const profession = getUserProfession(user)
    const city = getUserCity(user)
    const department = getUserDepartment(user)
    const images = getUserImages(user)
    const gender = getUserGender(user)

    // Estados de match desde FavoriteResponseDTO
    const hasPendingMatch = favoriteData.hasPendingMatch || false
    const hasAcceptedMatch = favoriteData.hasAcceptedMatch || false

    const fullName = `${name} ${lastName}`.trim()
    const displayName = lastName ? `${name} ${lastName[0]}.` : name
    const currentPhotoIndex = currentPhotoIndexes[userId] || 0
    const currentImage = images?.[currentPhotoIndex] || null
    const hasMultipleImages = images && images.length > 1
    const location = formatLocation(city, department)
    const isRemoving = removingFavorite === userId
    const imageLoading = imageLoadingStates[userId] || false

    return (
      <Card className='bg-gray-900 border-none overflow-hidden shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform duration-200'>
        <CardBody className='p-0'>
          {/* Galería de imágenes */}
          <div className='relative h-96 w-full overflow-hidden group'>
            {currentImage ? (
              <img
                alt={`${fullName} - Foto ${currentPhotoIndex + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                src={currentImage}
                onLoad={() => handleImageLoad(userId)}
              />
            ) : (
              <div className='w-full h-full bg-gray-800/60 flex items-center justify-center'>
                <div className='text-center space-y-2'>
                  <div className='w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center'>
                    <UserX className='w-8 h-8 text-gray-500' />
                  </div>
                  <p className='text-gray-500 text-sm'>Sin foto</p>
                </div>
              </div>
            )}

            {/* Spinner de carga */}
            {imageLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
                <Spinner color='primary' size='lg' />
              </div>
            )}

            {/* Indicadores de fotos */}
            {hasMultipleImages && (
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
            {hasMultipleImages && (
              <>
                <button
                  className='absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => prevPhoto(userId)}>
                  <ChevronLeft className='w-4 h-4' />
                </button>
                <button
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => nextPhoto(userId)}>
                  <ChevronRight className='w-4 h-4' />
                </button>
              </>
            )}

            {/* Overlay superior con badges */}
            <div className='absolute top-5 left-3 right-3 flex justify-between items-start z-10'>
              {/* Badges de estado de match - Izquierda */}
              <div className='flex flex-col gap-1 items-start'>
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

              {/* Badge de favorito - Derecha */}
              <Chip
                className='bg-gradient-to-br from-blue-500 to-cyan-500 backdrop-blur-md border-2 border-blue-300/40 shadow-lg shadow-blue-500/40'
                size='sm'
                startContent={<Bookmark className='w-3 h-3 fill-current' />}>
                Favorito
              </Chip>
            </div>

            {/* Overlay con info básica */}
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 pb-3 px-3'>
              <div className='space-y-2'>
                {/* Nombre y edad */}
                <h3 className='text-xl font-bold text-white drop-shadow-lg truncate'>
                  {displayName}, {age}
                </h3>

                {/* Profesión y género */}
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

                {/* Ubicación */}
                {location && (
                  <div className='flex items-center gap-1 text-white/90 text-sm drop-shadow-sm'>
                    <MapPin className='w-3.5 h-3.5 flex-shrink-0' />
                    <span className='truncate'>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter className='bg-gray-900 border-t border-gray-800 px-3 py-3'>
          <div className='flex items-center justify-center gap-3 w-full'>
            {/* Botón Quitar de Favoritos - Izquierda */}
            <Button
              isIconOnly
              className='bg-white/10 hover:bg-red-500/20 active:bg-red-500/30 border-2 border-white/20 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all duration-200'
              isDisabled={isRemoving}
              radius='full'
              size='sm'
              variant='flat'
              onPress={() => handleOpenRemoveModal(favoriteData)}>
              {isRemoving ? <Spinner color='danger' size='sm' /> : <X className='w-4 h-4' strokeWidth={2.5} />}
            </Button>

            {/* Botón Ver Perfil - Centro */}
            <Button
              className='flex-1 bg-primary/90 hover:bg-primary text-white'
              size='sm'
              startContent={<Eye className='w-4 h-4' />}
              onPress={() => handleViewProfile(favoriteData)}>
              Ver Perfil
            </Button>

            {/* Botón Match - Derecha */}
            <Button
              isIconOnly
              className={`${
                hasPendingMatch || hasAcceptedMatch
                  ? 'bg-gray-700 border-2 border-gray-600/50 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 active:scale-95 shadow-lg shadow-pink-500/40 border-2 border-white/20'
              } transition-all duration-200`}
              isDisabled={hasPendingMatch || hasAcceptedMatch}
              isLoading={matchLoading}
              radius='full'
              size='sm'
              variant='solid'
              onPress={() => handleMatch(favoriteData)}>
              {!matchLoading && <Heart className='w-4 h-4 text-white fill-current' />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mis Favoritos - Feeling</title>
        <meta content='Usuarios que has guardado en tus favoritos' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de favoritos' className='gap-6 !pt-0 !justify-start'>
        {/* Header */}
        <div className='flex flex-col gap-4 w-full'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center'>
                <Heart className='w-6 h-6 text-blue-400 fill-current' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-100'>Mis Favoritos</h1>
                <p className='text-gray-400'>Personas que has guardado para conectar después</p>
              </div>
            </div>

            {/* Contador y botón refrescar */}
            <div className='flex items-center gap-3'>
              <Chip color='primary' size='lg' variant='flat'>
                {pagination.totalElements || 0} {pagination.totalElements === 1 ? 'favorito' : 'favoritos'}
              </Chip>
              <Button
                isIconOnly
                isLoading={hookLoading}
                size='sm'
                variant='flat'
                onPress={() => loadFavorites(pagination.page, pagination.size)}>
                <RefreshCw className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {hookLoading && favorites.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 w-full'>
            <Spinner color='primary' size='lg' />
            <p className='text-gray-400 mt-4'>Cargando tus favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <Card className='bg-gray-800/40 border-gray-700/50 w-full'>
            <CardBody className='flex flex-col items-center justify-center py-16 gap-4'>
              <div className='w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center'>
                <UserX className='w-10 h-10 text-gray-500' />
              </div>
              <div className='text-center space-y-2'>
                <h3 className='text-lg font-semibold text-gray-300'>No tienes favoritos</h3>
                <p className='text-sm text-gray-400 max-w-md'>
                  Comienza a explorar perfiles y guarda a las personas que te interesen para conectar después
                </p>
              </div>
              <Button color='primary' startContent={<Heart className='w-4 h-4' />} onPress={() => navigate(APP_PATHS.HOME)}>
                Explorar Usuarios
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className='space-y-8 w-full'>
            {/* Grid de favoritos - 2 columnas en desktop, 1 en mobile */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              {favorites.map(favoriteData => {
                // Extraer usuario desde FavoriteResponseDTO para obtener el ID
                const user = favoriteData.favoriteUser || favoriteData
                const userId = getUserId(user)

                return <div key={userId != null ? String(userId) : Math.random()}>{renderFavoriteCard(favoriteData)}</div>
              })}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className='flex justify-center'>
                <Pagination
                  showControls
                  classNames={{
                    wrapper: 'gap-2',
                    item: 'w-9 h-9 text-sm bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50',
                    cursor: 'bg-gradient-to-br from-primary-500 to-purple-500 text-white font-semibold shadow-lg',
                    prev: 'bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50',
                    next: 'bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50'
                  }}
                  isDisabled={hookLoading}
                  page={pagination.page + 1}
                  total={pagination.totalPages}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </LiteContainer>

      {/* Modales de Confirmación */}
      <MatchConfirmModal
        isOpen={isMatchModalOpen}
        userImage={pendingAction?.userImage}
        userName={pendingAction?.userName}
        onConfirm={confirmMatch}
        onOpenChange={onMatchModalOpenChange}
      />

      <FavoriteRemoveModal
        isOpen={isRemoveModalOpen}
        userImage={pendingAction?.userImage}
        userName={pendingAction?.userName}
        onConfirm={confirmRemoveFavorite}
        onOpenChange={onRemoveModalOpenChange}
      />
    </>
  )
}

export default Favorites
