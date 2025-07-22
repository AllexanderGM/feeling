import { useState, useMemo, useEffect, useRef } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react'
import { Heart, RotateCcw, Settings, Users, Sparkles, Flame, Star } from 'lucide-react'

// Hooks
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests.js'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import UserCard from '@components/ui/UserCard.jsx'

const Home = () => {
  const { user, loading: authLoading } = useAuth()
  const { suggestions, suggestionsPagination, fetchUserSuggestions, loading: userLoading } = useUser()
  const { getCategoryByEnum, loading: categoryLoading } = useCategoryInterests()

  const [swipeDirection, setSwipeDirection] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onOpenChange: onFiltersOpenChange } = useDisclosure()
  const [removedCards, setRemovedCards] = useState(new Set())
  const hasInitializedRef = useRef(false)

  // Cargar sugerencias cuando el componente se monta
  useEffect(() => {
    if (user && !userLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      fetchUserSuggestions(0, 10) // Cargar más sugerencias inicialmente
    }
  }, [user, userLoading, fetchUserSuggestions])

  // Filtrar sugerencias basado en categoría y cards no removidas
  const availableCards = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return []
    
    let filtered = suggestions.filter(match => !removedCards.has(match.id))

    // Filtro por categoría
    if (filterCategory !== 'all') {
      filtered = filtered.filter(suggestion => {
        // Buscar la categoría en userCategoryInterests o algún campo similar
        const userCategory = suggestion.userCategoryInterests?.[0]?.categoryInterest?.name?.toLowerCase()
        return userCategory === filterCategory
      })
    }

    return filtered
  }, [suggestions, filterCategory, removedCards])

  // Obtener las próximas 3 cards para mostrar en stack
  const visibleCards = useMemo(() => {
    return availableCards.slice(0, 3) // Siempre tomar las primeras 3 disponibles
  }, [availableCards])

  // Obtener la card actual
  const currentCard = visibleCards[0]

  // Obtener icono de categoría
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className="w-4 h-4 text-blue-400" />
      case 'ROUSE':
        return <Flame className="w-4 h-4 text-red-400" />
      case 'SPIRIT':
        return <Star className="w-4 h-4 text-purple-400" />
      default:
        return <Heart className="w-4 h-4 text-gray-400" />
    }
  }

  // Funciones de manejo del stack
  const handleLike = () => {
    if (currentCard) {
      console.log('Like a:', currentCard.name)
      setSwipeDirection('right')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  const handlePass = () => {
    if (currentCard) {
      console.log('Pass a:', currentCard.name)
      setSwipeDirection('left')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  const handleSuperLike = () => {
    if (currentCard) {
      console.log('Super Like a:', currentCard.name)
      setSwipeDirection('up')
      setTimeout(() => {
        nextCard()
        setSwipeDirection(null)
      }, 300)
    }
  }

  const nextCard = () => {
    if (currentCard) {
      setRemovedCards(prev => new Set([...prev, currentCard.id]))
      
      // Si quedan pocas cartas (menos de 3), cargar más sugerencias
      if (availableCards.length <= 3 && suggestionsPagination.hasNext) {
        fetchUserSuggestions(suggestionsPagination.page + 1, 10)
      }
    }
  }

  const previousCard = () => {
    if (removedCards.size > 0) {
      // Obtener la última card removida
      const lastRemovedId = Array.from(removedCards).pop()
      if (lastRemovedId) {
        setRemovedCards(prev => {
          const newSet = new Set(prev)
          newSet.delete(lastRemovedId)
          return newSet
        })
      }
    }
  }

  const handleViewProfile = profile => {
    console.log('Ver perfil de:', profile.name)
  }

  const resetStack = () => {
    setRemovedCards(new Set())
    setSwipeDirection(null)
    // Recargar sugerencias desde el inicio
    fetchUserSuggestions(0, 10)
  }

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
  }, [currentCard])

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'essence', label: 'Essence' },
    { value: 'rouse', label: 'Rouse' },
    { value: 'spirit', label: 'Spirit' }
  ]

  const isLoading = authLoading || categoryLoading || userLoading

  if (isLoading) return <LoadData>Cargando sugerencias...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <div className="flex flex-col relative min-h-screen">
      {/* Área principal - Stack de cards */}
      <div className="flex-1 flex items-center justify-center pb-24 relative">
        {!currentCard ? (
          <div className="text-center max-w-sm mx-auto">
            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">¡No hay más perfiles!</h3>
            <p className="text-gray-500 mb-6">
              {removedCards.size > 0
                ? 'Has visto todos los perfiles disponibles. Vuelve más tarde para ver nuevas sugerencias.'
                : 'No hay perfiles que coincidan con tus filtros actuales.'}
            </p>
            <div className="space-y-3">
              {removedCards.size > 0 && (
                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<RotateCcw className="w-4 h-4" />}
                  onPress={resetStack}
                  className="w-full">
                  Ver de nuevo
                </Button>
              )}
              <Button
                variant="light"
                startContent={<Settings className="w-4 h-4" />}
                onPress={onFiltersOpen}
                className="w-full text-gray-400">
                Ajustar filtros
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-sm mx-auto">
            {/* Stack de cards con fondo opaco arreglado */}
            <div className="relative h-[600px]">
              {visibleCards.map((card, index) => (
                <div
                  key={card.id}
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
                      variant="discovery"
                      onViewProfile={handleViewProfile}
                      showCompatibility={true}
                      showDistance={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de filtros */}
      <Modal
        isOpen={isFiltersOpen}
        onOpenChange={onFiltersOpenChange}
        placement="bottom"
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>
                <h3 className="text-lg font-semibold text-gray-200">Filtros de búsqueda</h3>
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoría de interés</label>
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-200">
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="light" onPress={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button color="primary" onPress={onClose} className="flex-1">
                      Aplicar
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Home
