import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Button, useDisclosure, Chip } from '@heroui/react'
import { RotateCcw, Users, Filter } from 'lucide-react'

// Hooks
import { useAuth, useUser, useUserInterests } from '@hooks'
import { Logger } from '@utils/logger.js'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import UserCard from '@components/ui/UserCard.jsx'
import UserProfileDetail from '@components/ui/UserProfileDetail.jsx'
import AdvancedFilters from './components/AdvancedFilters.jsx'
import Header from '@components/layout/Header.jsx'

const Home = () => {
  // ========== HOOKS ==========
  const { user, loading: authLoading } = useAuth()
  const { suggestions, suggestionsPagination, fetchUserSuggestions, loading: userLoading } = useUser()
  const { loading: interestLoading } = useUserInterests()

  // ========== STATE ==========
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [removedCards, setRemovedCards] = useState(new Set())
  const hasInitializedRef = useRef(false)

  // Estados de filtros
  const [appliedFilters, setAppliedFilters] = useState({
    categoryInterest: 'all',
    ageMin: 18,
    ageMax: 65,
    distance: 50,
    relationshipType: 'all',
    showOnlineOnly: false,
    showRecentActivity: false,
    showVerifiedOnly: false,
    showWithPhotosOnly: true,
    minCompatibility: 0,
    educationLevel: 'all',
    hasJob: 'all',
    smokingPreference: 'all',
    drinkingPreference: 'all',
    sortBy: 'compatibility'
  })

  // Modal de filtros avanzados
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onOpenChange: onFiltersOpenChange } = useDisclosure()

  // Estado para vista detallada del usuario
  const [selectedUser, setSelectedUser] = useState(null)
  const { isOpen: isProfileDetailOpen, onOpen: onProfileDetailOpen, onOpenChange: onProfileDetailOpenChange } = useDisclosure()

  // ========== COMPUTED VALUES ==========
  const isLoading = authLoading || interestLoading || userLoading

  // Filtrar y ordenar sugerencias basado en filtros aplicados
  const availableCards = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return []

    // Usar email como identificador único en lugar de id
    let filtered = suggestions.filter(user => !removedCards.has(user.profile?.email))

    // Aplicar filtros
    if (appliedFilters.categoryInterest !== 'all') {
      filtered = filtered.filter(user => {
        const userCategory = user.status?.categoryInterest || user.profile?.categoryInterest
        return userCategory?.toLowerCase() === appliedFilters.categoryInterest.toLowerCase()
      })
    }

    // Filtro por edad
    if (appliedFilters.ageMin || appliedFilters.ageMax) {
      filtered = filtered.filter(user => {
        const age = user.profile?.age || 0
        return age >= appliedFilters.ageMin && age <= appliedFilters.ageMax
      })
    }

    // Filtro por verificados
    if (appliedFilters.showVerifiedOnly) {
      filtered = filtered.filter(user => user.status?.verified)
    }

    // Filtro por fotos
    if (appliedFilters.showWithPhotosOnly) {
      filtered = filtered.filter(user => user.profile?.images && user.profile.images.length > 0)
    }

    // Ordenamiento
    switch (appliedFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const ageA = a.profile?.age || 0
          const ageB = b.profile?.age || 0
          return ageA - ageB // Más jóvenes primero
        })
        break
      default:
        filtered.sort(() => Math.random() - 0.5)
        break
    }

    return filtered
  }, [suggestions, appliedFilters, removedCards])

  // Obtener las próximas 3 cards para mostrar en stack
  const visibleCards = useMemo(() => {
    return availableCards.slice(0, 3)
  }, [availableCards])

  // Obtener la card actual
  const currentCard = visibleCards[0]

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (appliedFilters.categoryInterest !== 'all') count++
    if (appliedFilters.ageMin !== 18 || appliedFilters.ageMax !== 65) count++
    if (appliedFilters.distance !== 50) count++
    if (appliedFilters.relationshipType !== 'all') count++
    if (appliedFilters.showOnlineOnly) count++
    if (appliedFilters.showRecentActivity) count++
    if (appliedFilters.showVerifiedOnly) count++
    if (!appliedFilters.showWithPhotosOnly) count++
    if (appliedFilters.minCompatibility > 0) count++
    if (appliedFilters.educationLevel !== 'all') count++
    if (appliedFilters.hasJob !== 'all') count++
    if (appliedFilters.smokingPreference !== 'all') count++
    if (appliedFilters.drinkingPreference !== 'all') count++
    if (appliedFilters.sortBy !== 'compatibility') count++
    return count
  }, [appliedFilters])

  // ========== CARD NAVIGATION FUNCTIONS ==========
  const nextCard = () => {
    if (currentCard) {
      setRemovedCards(prev => new Set([...prev, currentCard.profile?.email]))

      // Si quedan pocas cartas, cargar más sugerencias
      if (availableCards.length <= 3 && suggestionsPagination.hasNext) {
        fetchUserSuggestions(suggestionsPagination.page + 1, 10)
      }
    }
  }

  const resetStack = () => {
    setRemovedCards(new Set())
    setSwipeDirection(null)
    fetchUserSuggestions(0, 10)
  }

  // ========== SWIPE ACTIONS ==========
  const handleLike = () => {
    if (currentCard) {
      Logger.info('Like action', { userName: currentCard.profile?.name }, { category: Logger.CATEGORIES.UI })
      setSwipeDirection('right')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  const handlePass = () => {
    if (currentCard) {
      Logger.info('Pass action', { userName: currentCard.profile?.name }, { category: Logger.CATEGORIES.UI })
      setSwipeDirection('left')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  const handleSuperLike = () => {
    if (currentCard) {
      Logger.info('Super Like action', { userName: currentCard.profile?.name }, { category: Logger.CATEGORIES.UI })
      setSwipeDirection('up')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  // ========== EFFECTS ==========
  // Cargar sugerencias cuando el componente se monta
  useEffect(() => {
    if (user && !userLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      fetchUserSuggestions(0, 10)
    }
  }, [user, userLoading, fetchUserSuggestions])

  // Escuchar eventos de match desde Nav
  useEffect(() => {
    const handleMatchAction = event => {
      const { action } = event.detail
      switch (action) {
        case 'pass':
          handlePass()
          break
        case 'like':
          handleLike()
          break
        case 'superlike':
          handleSuperLike()
          break
        default:
          break
      }
    }

    window.addEventListener('matchAction', handleMatchAction)
    return () => window.removeEventListener('matchAction', handleMatchAction)
  }, [handleLike, handlePass, handleSuperLike])

  // ========== EVENT HANDLERS ==========
  const handleViewProfile = profile => {
    Logger.info('Ver perfil de usuario', { userName: profile.profile?.name }, { category: Logger.CATEGORIES.UI })
    setSelectedUser(profile)
    onProfileDetailOpen()
  }

  const handleCloseProfileDetail = () => {
    onProfileDetailOpenChange()
    // Limpiar el usuario seleccionado después de la animación
    setTimeout(() => {
      setSelectedUser(null)
    }, 300)
  }

  // Handlers para acciones de match desde las cartas (reutilizan las funciones principales)
  const handleLikeUser = () => handleLike()
  const handlePassUser = () => handlePass()
  const handleSuperLikeUser = () => handleSuperLike()

  // Manejar aplicación de filtros
  const handleApplyFilters = useCallback(
    newFilters => {
      setAppliedFilters(newFilters)
      setRemovedCards(new Set())
      fetchUserSuggestions(0, 10)
      Logger.info('Filtros aplicados', newFilters, { category: Logger.CATEGORIES.UI })
    },
    [fetchUserSuggestions]
  )

  // ========== LOADING & ERROR STATES ==========
  if (isLoading) return <LoadData>Cargando sugerencias...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  // ========== RENDER ==========
  return (
    <div className='flex flex-col relative pt-0 md:pt-0'>
      {/* Mini Header flotante */}
      <Header onOpenFilters={onFiltersOpen} onRefresh={resetStack} activeFiltersCount={activeFiltersCount} user={user} />

      {/* Área principal */}
      <div className='flex-1 flex relative pt-20 md:pt-0'>
        {/* Vista principal (cards) - Desktop: izquierda, Mobile: completo */}
        <div
          className={`${selectedUser && isProfileDetailOpen ? 'md:w-1/2 md:pr-4' : 'w-full'} flex items-center justify-center transition-all duration-300`}>
          {!currentCard ? (
            <EmptyState
              removedCards={removedCards}
              activeFiltersCount={activeFiltersCount}
              onResetStack={resetStack}
              onOpenFilters={onFiltersOpen}
            />
          ) : (
            <CardStack
              visibleCards={visibleCards}
              swipeDirection={swipeDirection}
              onViewProfile={handleViewProfile}
              onLike={handleLikeUser}
              onPass={handlePassUser}
              onSuperLike={handleSuperLikeUser}
            />
          )}
        </div>

        {/* Vista detallada del usuario - Solo Desktop: derecha */}
        {selectedUser && isProfileDetailOpen && (
          <div className='hidden md:block md:w-1/2 md:pl-4'>
            <div className='h-full bg-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden'>
              <UserProfileDetail
                user={selectedUser}
                isOpen={true}
                onOpenChange={handleCloseProfileDetail}
                onLike={handleLikeUser}
                onPass={handlePassUser}
                onSuperLike={handleSuperLikeUser}
                isMobile={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Vista detallada del usuario - Solo Mobile: Modal */}
      {selectedUser && (
        <UserProfileDetail
          user={selectedUser}
          isOpen={isProfileDetailOpen}
          onOpenChange={handleCloseProfileDetail}
          onLike={handleLikeUser}
          onPass={handlePassUser}
          onSuperLike={handleSuperLikeUser}
          isMobile={true}
        />
      )}

      {/* Panel de filtros avanzados */}
      <AdvancedFilters
        isOpen={isFiltersOpen}
        onOpenChange={onFiltersOpenChange}
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </div>
  )
}

// ========== COMPONENTES AUXILIARES ==========
const EmptyState = ({ removedCards, activeFiltersCount, onResetStack, onOpenFilters }) => (
  <div className='text-center max-w-sm mx-auto'>
    <div className='w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6'>
      <Users className='w-12 h-12 text-gray-600' />
    </div>
    <h3 className='text-xl font-bold text-gray-300 mb-2'>¡No hay más perfiles!</h3>
    <p className='text-gray-500 mb-6'>
      {removedCards.size > 0
        ? 'Has visto todos los perfiles disponibles. Vuelve más tarde para ver nuevas sugerencias.'
        : 'No hay perfiles que coincidan con tus filtros actuales.'}
    </p>
    <div className='space-y-3'>
      {removedCards.size > 0 && (
        <Button
          color='primary'
          variant='bordered'
          startContent={<RotateCcw className='w-4 h-4' />}
          onPress={onResetStack}
          className='w-full'>
          Ver de nuevo
        </Button>
      )}
      <Button variant='light' startContent={<Filter className='w-4 h-4' />} onPress={onOpenFilters} className='w-full text-gray-400'>
        Filtros Avanzados
        {activeFiltersCount > 0 && (
          <Chip size='sm' color='primary' variant='flat' className='ml-2'>
            {activeFiltersCount}
          </Chip>
        )}
      </Button>
    </div>
  </div>
)

const CardStack = ({ visibleCards, swipeDirection, onViewProfile, onLike, onPass, onSuperLike }) => (
  <div className='relative w-full max-w-sm mx-auto'>
    <div className='relative h-[600px]'>
      {visibleCards.map((card, index) => (
        <div
          key={card.profile?.email || `card-${index}`}
          className={`absolute inset-0 transition-all duration-300 ${
            index === 0
              ? `z-30 ${
                  swipeDirection === 'left'
                    ? 'transform -translate-x-full rotate-12 opacity-0'
                    : swipeDirection === 'right'
                      ? 'transform translate-x-full rotate-12 opacity-0'
                      : swipeDirection === 'up'
                        ? 'transform -translate-y-full opacity-0'
                        : 'scale-100'
                }`
              : index === 1
                ? 'z-20 scale-95 transform translate-y-2 opacity-25'
                : 'z-10 scale-90 transform translate-y-4 opacity-10'
          }`}>
          <div className={index > 0 ? 'pointer-events-none' : ''}>
            <UserCard
              user={card}
              variant='discovery'
              onViewProfile={onViewProfile}
              onLike={onLike}
              onPass={onPass}
              onSuperLike={onSuperLike}
              showCompatibility={true}
              showDistance={true}
              showMatchControls={index === 0}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default Home
