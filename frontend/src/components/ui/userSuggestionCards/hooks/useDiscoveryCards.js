import { useState, useMemo, useCallback } from 'react'

/**
 * Hook para manejar la navegación y estado de cards en Discovery
 * Maneja: removedCards, navegación, paginación automática
 */
export const useDiscoveryCards = (suggestions, suggestionsPagination, fetchUserSuggestions) => {
  const [removedCards, setRemovedCards] = useState(new Set())

  // Filtrar sugerencias removidas localmente
  const availableCards = useMemo(() => {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return []
    }

    return suggestions.filter(suggestion => {
      const userId = suggestion?.user?.user?.id ?? suggestion?.user?.id

      return !userId || !removedCards.has(userId) ? true : false
    })
  }, [suggestions, removedCards])

  // Obtener la card actual (solo mostramos una a la vez)
  const currentCard = availableCards[0]

  // Navegar a la siguiente card
  const nextCard = useCallback(() => {
    if (currentCard) {
      const userId = currentCard.user?.user?.id || currentCard.user?.id

      setRemovedCards(prev => {
        const next = new Set(prev)

        if (userId) {
          next.add(userId)
        }

        return next
      })

      // Si quedan pocas cartas, cargar más sugerencias
      if (availableCards.length <= 5 && suggestionsPagination.hasNext) {
        const nextPage = (suggestionsPagination.page ?? 0) + 1
        const pageSize = suggestionsPagination.size || 10

        fetchUserSuggestions(nextPage, pageSize)
      }
    }
  }, [currentCard, availableCards.length, suggestionsPagination, fetchUserSuggestions])

  // Resetear el stack de cards
  const resetStack = useCallback(() => {
    setRemovedCards(new Set())
    fetchUserSuggestions(0, 10)
  }, [fetchUserSuggestions])

  return {
    availableCards, // Array completo de cards disponibles
    currentCard, // Card actual (la primera del array)
    removedCards,
    nextCard,
    resetStack
  }
}

export default useDiscoveryCards
