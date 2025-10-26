import { useState } from 'react'
import { useDisclosure } from '@heroui/react'
import { useMatchInteractions, useMatchFavorites, useDiscoveryCards } from '@hooks'
import UserCard from '@components/ui/userSuggestionCards/components/UserCard.jsx'
import MatchConfirmModal from '@components/ui/userSuggestionCards/components/MatchConfirmModal.jsx'
import DismissConfirmModal from '@components/ui/userSuggestionCards/components/DismissConfirmModal.jsx'
import FavoriteSuccessModal from '@components/ui/userSuggestionCards/components/FavoriteSuccessModal.jsx'
import EmptyState from '@pages/home/components/EmptyState.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Logger } from '@utils/logger.js'
// No necesitamos imports de @schemas aquí porque trabajamos con estructura de sugerencias específica

/**
 * UserSuggestionCards - Contenedor principal que maneja el stack de cards y el estado vacío
 * Gestiona: sugerencias, navegación, estado vacío, animaciones, modales e interacciones
 *
 * @param {Array} suggestions - Array de sugerencias del backend
 * @param {Object} suggestionsPagination - Info de paginación
 * @param {Function} fetchUserSuggestions - Función para cargar más sugerencias
 */
const UserSuggestionCards = ({ suggestions = [], suggestionsPagination, fetchUserSuggestions }) => {
  // Hook de navegación y gestión de cards
  const { availableCards, currentCard, removedCards, nextCard, resetStack } = useDiscoveryCards(
    suggestions,
    suggestionsPagination,
    fetchUserSuggestions
  )
  // Hooks para interacciones con matches y favoritos
  const { sendMatch, dismissSuggestion, loading: matchLoading } = useMatchInteractions()
  const { toggleFavorite } = useMatchFavorites()
  const [exitDirection, setExitDirection] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [favoriteUserData, setFavoriteUserData] = useState(null) // { name, image }
  // Estado local para favoritos (optimistic UI)
  const [localFavorites, setLocalFavorites] = useState(new Map())

  // Modales de confirmación
  const { isOpen: isMatchModalOpen, onOpen: onMatchModalOpen, onOpenChange: onMatchModalOpenChange } = useDisclosure()
  const { isOpen: isDismissModalOpen, onOpen: onDismissModalOpen, onOpenChange: onDismissModalOpenChange } = useDisclosure()
  const {
    isOpen: isFavoriteSuccessModalOpen,
    onOpen: onFavoriteSuccessModalOpen,
    onOpenChange: onFavoriteSuccessModalOpenChange
  } = useDisclosure()

  // Obtener las primeras 3 cards para el efecto de apilamiento
  const visibleCards = availableCards.slice(0, 3)

  // Manejar las acciones con animación
  const handleAction = (action, callback) => {
    if (!callback) return

    setExitDirection(action)
    setTimeout(() => {
      callback()
      setExitDirection(null)
    }, 300)
  }

  // Función auxiliar para obtener el ID del usuario de la estructura de sugerencias
  const getSuggestionUserId = cardData => {
    // Estructura de sugerencias: cardData.user.user.id
    return cardData?.user?.user?.id || null
  }

  // Función auxiliar para obtener el nombre del usuario de la estructura de sugerencias
  const getSuggestionUserName = cardData => {
    // Estructura de sugerencias: cardData.user.user.name
    return cardData?.user?.user?.name || 'Usuario'
  }

  // Función auxiliar para obtener la imagen principal del usuario de la estructura de sugerencias
  const getSuggestionUserImage = cardData => {
    // Estructura de sugerencias: cardData.user.user.images
    const images = cardData?.user?.user?.images || []

    return images[0] || null
  }

  // Handler para dismiss - abre modal de confirmación
  const handleDismiss = () => {
    if (!currentCard) return

    const userId = getSuggestionUserId(currentCard)
    const userName = getSuggestionUserName(currentCard)
    const userImage = getSuggestionUserImage(currentCard)

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'descartar sugerencia', 'No se pudo obtener el ID del usuario')

      return
    }

    setPendingAction({ type: 'dismiss', userId, userName, userImage })
    onDismissModalOpen()
  }

  // Confirmar dismiss
  const confirmDismiss = async () => {
    if (!pendingAction || pendingAction.type !== 'dismiss') return

    handleAction('dismiss', () => {
      // Avanzar a la siguiente card inmediatamente
      nextCard()

      // Enviar dismiss al backend (sin bloquear UI)
      dismissSuggestion(pendingAction.userId).catch(error => {
        Logger.error(Logger.CATEGORIES.UI, 'descartar sugerencia', error, { context: { targetUserId: pendingAction.userId } })
      })
    })

    setPendingAction(null)
  }

  // Handler para match - abre modal de confirmación
  const handleMatch = () => {
    if (!currentCard || matchLoading) return

    const userId = getSuggestionUserId(currentCard)
    const userName = getSuggestionUserName(currentCard)
    const userImage = getSuggestionUserImage(currentCard)

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'enviar match', 'No se pudo obtener el ID del usuario')

      return
    }

    setPendingAction({ type: 'match', userId, userName, userImage })
    onMatchModalOpen()
  }

  // Confirmar match
  const confirmMatch = async () => {
    if (!pendingAction || pendingAction.type !== 'match') return

    handleAction('match', async () => {
      try {
        // Enviar match al backend
        await sendMatch(pendingAction.userId)

        // Avanzar a la siguiente card después del match exitoso
        nextCard()
      } catch (error) {
        Logger.error(Logger.CATEGORIES.UI, 'enviar match', error)
      }
    })

    setPendingAction(null)
  }

  // Handler para favorito con optimistic UI y modal de éxito
  const handleFavorite = async () => {
    if (!currentCard) return

    const userId = getSuggestionUserId(currentCard)
    const userName = getSuggestionUserName(currentCard)
    const userImage = getSuggestionUserImage(currentCard)

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'toggle favorito', 'No se pudo obtener el ID del usuario')

      return
    }

    // Actualizar estado local inmediatamente (optimistic UI)
    const currentStatus = localFavorites.get(userId) ?? currentCard.favorite ?? false
    const newStatus = !currentStatus

    setLocalFavorites(prev => new Map(prev).set(userId, newStatus))

    try {
      await toggleFavorite(userId)

      // Solo mostrar modal si se AGREGÓ a favoritos (newStatus = true)
      if (newStatus) {
        setFavoriteUserData({ name: userName, image: userImage })
        onFavoriteSuccessModalOpen()
      }
    } catch (error) {
      // Si falla, revertir el estado local
      setLocalFavorites(prev => new Map(prev).set(userId, currentStatus))
      Logger.error(Logger.CATEGORIES.UI, 'Error al toggle favorito', error)
    }
  }

  // Handler para continuar explorando después de agregar favorito
  const handleContinueAfterFavorite = () => {
    handleAction('skip', nextCard)
  }

  // Variantes de animación para la card principal
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: direction => ({
      x: direction === 'dismiss' ? -400 : direction === 'match' ? 400 : 0,
      opacity: 0,
      rotate: direction === 'dismiss' ? -20 : direction === 'match' ? 20 : 0,
      transition: { duration: 0.4, ease: 'easeInOut' }
    })
  }

  // Mostrar EmptyState si no hay cards disponibles
  if (!visibleCards.length) {
    return <EmptyState removedCards={removedCards} onResetStack={resetStack} />
  }

  return (
    <>
      <div className='relative w-full max-w-md mx-auto h-[calc(100vh-180px)] max-h-[650px]'>
        <AnimatePresence initial={false}>
          {visibleCards.map((cardData, index) => {
            const cardUserId = getSuggestionUserId(cardData)
            // Usar estado local primero, luego el valor del servidor (nueva estructura)
            const isFavorite = localFavorites.get(cardUserId) ?? cardData.favorite ?? false

            const isTopCard = index === 0
            const zIndex = visibleCards.length - index
            const scale = 1 - index * 0.05
            const yOffset = index * 10
            const opacity = 1 - index * 0.3

            return (
              <motion.div
                key={cardUserId}
                animate={
                  isTopCard
                    ? 'animate'
                    : {
                        scale,
                        y: yOffset,
                        opacity,
                        zIndex
                      }
                }
                className='absolute inset-0 w-full'
                custom={exitDirection}
                exit={isTopCard ? 'exit' : undefined}
                initial={isTopCard ? 'initial' : { scale, y: yOffset, opacity }}
                style={{
                  zIndex,
                  pointerEvents: isTopCard ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
                variants={cardVariants}>
                <UserCard
                  compatibility={cardData.compatibility}
                  hasAcceptedMatch={cardData.hasAcceptedMatch}
                  hasPendingMatch={cardData.hasPendingMatch}
                  isFavorite={isFavorite}
                  matchLoading={matchLoading && isTopCard}
                  showMatchControls={isTopCard}
                  user={cardData.user}
                  onLike={isTopCard ? handleMatch : undefined}
                  onPass={isTopCard ? handleDismiss : undefined}
                  onToggleFavorite={isTopCard ? handleFavorite : undefined}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Modales de Confirmación */}
      <MatchConfirmModal
        isOpen={isMatchModalOpen}
        userImage={pendingAction?.userImage}
        userName={pendingAction?.userName}
        onConfirm={confirmMatch}
        onOpenChange={onMatchModalOpenChange}
      />

      <DismissConfirmModal
        isOpen={isDismissModalOpen}
        userImage={pendingAction?.userImage}
        userName={pendingAction?.userName}
        onConfirm={confirmDismiss}
        onOpenChange={onDismissModalOpenChange}
      />

      <FavoriteSuccessModal
        isOpen={isFavoriteSuccessModalOpen}
        userImage={favoriteUserData?.image}
        userName={favoriteUserData?.name}
        onContinue={handleContinueAfterFavorite}
        onOpenChange={onFavoriteSuccessModalOpenChange}
      />
    </>
  )
}

export default UserSuggestionCards
