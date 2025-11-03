import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useDisclosure } from '@heroui/react'
import { useMatchInteractions, useMatchFavorites, useDiscoveryCards } from '@hooks'
import { useMatch } from '@contexts/MatchContext'
import UserCard from '@components/ui/userSuggestionCards/components/UserCard.jsx'
import MatchConfirmModal from '@components/ui/userSuggestionCards/components/MatchConfirmModal.jsx'
import DismissConfirmModal from '@components/ui/userSuggestionCards/components/DismissConfirmModal.jsx'
import FavoriteSuccessModal from '@components/ui/userSuggestionCards/components/FavoriteSuccessModal.jsx'
import EmptyState from '@pages/home/components/EmptyState.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Logger } from '@utils/logger.js'

const extractSuggestionUser = suggestion => suggestion?.user?.user ?? suggestion?.user ?? null

const getSuggestionUserId = suggestion => extractSuggestionUser(suggestion)?.id ?? null

const getSuggestionUserName = suggestion => extractSuggestionUser(suggestion)?.name ?? 'Usuario'

const getSuggestionUserImage = suggestion => {
  const user = extractSuggestionUser(suggestion)
  const images = user?.images ?? []

  return images.find(Boolean) ?? null
}

/**
 * UserSuggestionCards - Contenedor principal que maneja el stack de cards y el estado vacío
 * Gestiona: sugerencias, navegación, estado vacío, animaciones, modales e interacciones
 *
 * @param {Array} suggestions - Array de sugerencias del backend
 * @param {Object} suggestionsPagination - Info de paginación
 * @param {Function} fetchUserSuggestions - Función para cargar más sugerencias
 */
const UserSuggestionCards = ({ suggestions = [], suggestionsPagination, fetchUserSuggestions }) => {
  const { availableCards, currentCard, removedCards, nextCard, resetStack } = useDiscoveryCards(
    suggestions,
    suggestionsPagination,
    fetchUserSuggestions
  )

  const actionTimeoutRef = useRef(null)

  const [exitDirection, setExitDirection] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [favoriteUserData, setFavoriteUserData] = useState(null) // { name, image }
  const [localFavorites, setLocalFavorites] = useState(new Map())

  const { showPremiumModal } = useMatch()

  const handleNoAttemptsAvailable = useCallback(() => {
    if (pendingAction) {
      showPremiumModal(pendingAction.userName, pendingAction.userImage)
    }
  }, [pendingAction, showPremiumModal])

  const {
    sendMatch,
    dismissSuggestion,
    loading: matchLoading
  } = useMatchInteractions({
    onNoAttemptsAvailable: handleNoAttemptsAvailable
  })
  const { toggleFavorite } = useMatchFavorites()

  const { isOpen: isMatchModalOpen, onOpen: onMatchModalOpen, onOpenChange: onMatchModalOpenChange } = useDisclosure()
  const { isOpen: isDismissModalOpen, onOpen: onDismissModalOpen, onOpenChange: onDismissModalOpenChange } = useDisclosure()
  const {
    isOpen: isFavoriteSuccessModalOpen,
    onOpen: onFavoriteSuccessModalOpen,
    onOpenChange: onFavoriteSuccessModalOpenChange
  } = useDisclosure()

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current)
        actionTimeoutRef.current = null
      }
    }
  }, [])

  const visibleCards = useMemo(() => availableCards.slice(0, 3), [availableCards])

  const currentCardMeta = useMemo(() => {
    if (!currentCard) return null

    const userId = getSuggestionUserId(currentCard)
    const userName = getSuggestionUserName(currentCard)
    const userImage = getSuggestionUserImage(currentCard)
    const serverFavorite = currentCard?.favorite ?? false
    const optimisticFavorite = userId ? localFavorites.get(userId) : undefined

    return {
      userId,
      userName,
      userImage,
      favorite: serverFavorite,
      optimisticFavorite,
      finalFavorite: optimisticFavorite ?? serverFavorite
    }
  }, [currentCard, localFavorites])

  const handleAction = useCallback((action, callback) => {
    if (!callback) return

    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current)
    }

    setExitDirection(action)
    actionTimeoutRef.current = setTimeout(() => {
      callback()
      setExitDirection(null)
      actionTimeoutRef.current = null
    }, 300)
  }, [])

  // Handler para dismiss - abre modal de confirmación
  // Si isContinue = true, solo avanza sin rechazar
  const handleDismiss = useCallback(
    (_unused, isContinue = false) => {
      if (!currentCardMeta) return

      // Si es "continuar" (match pendiente/aceptado), solo avanzar sin rechazar
      if (isContinue) {
        handleAction('skip', nextCard)

        return
      }

      const { userId, userName, userImage } = currentCardMeta

      if (!userId) {
        Logger.warn(Logger.CATEGORIES.UI, 'descartar sugerencia', 'No se pudo obtener el ID del usuario')

        return
      }

      setPendingAction({ type: 'dismiss', userId, userName, userImage })
      onDismissModalOpen()
    },
    [currentCardMeta, handleAction, nextCard, onDismissModalOpen]
  )

  // Confirmar dismiss
  const confirmDismiss = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'dismiss') return

    handleAction('dismiss', () => {
      nextCard()

      dismissSuggestion(pendingAction.userId).catch(error => {
        Logger.error(Logger.CATEGORIES.UI, 'descartar sugerencia', error, { context: { targetUserId: pendingAction.userId } })
      })
    })

    setPendingAction(null)
  }, [dismissSuggestion, handleAction, nextCard, pendingAction])

  // Handler para match - abre modal de confirmación
  const handleMatch = useCallback(() => {
    if (!currentCardMeta || matchLoading) return

    const { userId, userName, userImage } = currentCardMeta

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'enviar match', 'No se pudo obtener el ID del usuario')

      return
    }

    setPendingAction({ type: 'match', userId, userName, userImage })
    onMatchModalOpen()
  }, [currentCardMeta, matchLoading, onMatchModalOpen])

  // Confirmar match
  const confirmMatch = useCallback(() => {
    if (!pendingAction || pendingAction.type !== 'match') return

    handleAction('match', async () => {
      try {
        await sendMatch(pendingAction.userId)
        nextCard()
      } catch (error) {
        Logger.error(Logger.CATEGORIES.UI, 'enviar match', error)
      }
    })

    setPendingAction(null)
  }, [handleAction, nextCard, pendingAction, sendMatch])

  // Handler para favorito con optimistic UI y modal de éxito
  const handleFavorite = useCallback(async () => {
    if (!currentCardMeta) return

    const { userId, userName, userImage, finalFavorite } = currentCardMeta

    if (!userId) {
      Logger.warn(Logger.CATEGORIES.UI, 'toggle favorito', 'No se pudo obtener el ID del usuario')

      return
    }

    const newStatus = !finalFavorite

    setLocalFavorites(prev => {
      const next = new Map(prev)

      return next.set(userId, newStatus)
    })

    try {
      await toggleFavorite(userId, { isFavorite: finalFavorite })

      if (newStatus) {
        setFavoriteUserData({ name: userName, image: userImage })
        onFavoriteSuccessModalOpen()
      }
    } catch (error) {
      setLocalFavorites(prev => {
        const next = new Map(prev)

        return next.set(userId, finalFavorite)
      })

      Logger.error(Logger.CATEGORIES.UI, 'Error al toggle favorito', error)
    }
  }, [currentCardMeta, toggleFavorite, onFavoriteSuccessModalOpen])

  // Handler para continuar explorando después de agregar favorito
  const handleContinueAfterFavorite = useCallback(() => {
    handleAction('skip', nextCard)
  }, [handleAction, nextCard])

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
      <div className='relative w-full max-w-md mx-auto h-[calc(100vh-180px)] h-[calc(100dvh-180px)] max-h-[650px]'>
        <AnimatePresence initial={false}>
          {visibleCards.map((cardData, index) => {
            const cardUserId = getSuggestionUserId(cardData)
            const cardKey = cardUserId ?? `card-${index}`
            const optimisticFavorite = cardUserId ? localFavorites.get(cardUserId) : undefined
            const isFavorite = optimisticFavorite ?? cardData.favorite ?? false

            const isTopCard = index === 0
            const zIndex = visibleCards.length - index
            const scale = 1 - index * 0.05
            const yOffset = index * 10
            const opacity = 1 - index * 0.3

            return (
              <motion.div
                key={cardKey}
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
