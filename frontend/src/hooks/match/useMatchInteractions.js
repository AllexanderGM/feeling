import { useState, useCallback } from 'react'
import { matchInteractionService, matchSuggestionService } from '@services'
import { useError } from '@hooks'
import { useMatch } from '@contexts/MatchContext'
import { Logger } from '@utils/logger.js'

/**
 * Hook para manejar interacciones de matches
 * Corresponde a: MatchInteractionController
 * - Enviar matches
 * - Aceptar/Rechazar matches
 * - Obtener contacto y detalles
 * - Manejo de modal premium cuando no hay intentos (usa MatchContext)
 */
export const useMatchInteractions = (options = {}) => {
  const [loading, setLoading] = useState(false)
  const { handleError } = useError()
  const { onNoAttemptsAvailable } = options

  // Obtener funciones del contexto global de matches
  const { showPremiumModal } = useMatch()

  // ===============================
  // UTILIDADES
  // ===============================

  /**
   * Detecta si el error es por falta de intentos
   */
  const isNoAttemptsError = useCallback(error => {
    // Verificar mensaje del backend
    const errorMessage = error?.response?.data?.message || error?.message || ''
    const errorStatus = error?.response?.status

    // Patrones comunes de error de intentos
    const noAttemptsPatterns = [
      'no tienes intentos',
      'sin intentos',
      'intentos agotados',
      'no attempts',
      'attempts exhausted',
      'insufficient attempts'
    ]

    const hasNoAttemptsMessage = noAttemptsPatterns.some(pattern => errorMessage.toLowerCase().includes(pattern))

    // También puede ser un 403 (Forbidden) o 429 (Too Many Requests)
    const isLimitError = errorStatus === 403 || errorStatus === 429

    return hasNoAttemptsMessage || isLimitError
  }, [])

  // ===============================
  // ACCIONES DE MATCH
  // ===============================

  /**
   * Send a match request to another user
   */
  const sendMatch = useCallback(
    async targetUserId => {
      try {
        setLoading(true)
        const response = await matchInteractionService.sendMatch(targetUserId)

        return response
      } catch (error) {
        // Detectar error de intentos agotados
        if (isNoAttemptsError(error)) {
          Logger.warn(Logger.CATEGORIES.UI, 'enviar match', 'Intentos de match agotados')

          // Llamar callback personalizado si existe, sino abrir modal premium del contexto
          if (onNoAttemptsAvailable) {
            onNoAttemptsAvailable(error)
          } else {
            // Mostrar modal premium global
            showPremiumModal()
          }
        } else {
          // Error general
          handleError('Error al enviar match', error)
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, isNoAttemptsError, onNoAttemptsAvailable, showPremiumModal]
  )

  /**
   * Accept a received match
   */
  const acceptMatch = useCallback(
    async matchId => {
      try {
        setLoading(true)
        const response = await matchInteractionService.acceptMatch(matchId)

        return response
      } catch (error) {
        handleError('Error al aceptar match', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Reject a received match
   */
  const rejectMatch = useCallback(
    async matchId => {
      try {
        setLoading(true)
        const response = await matchInteractionService.rejectMatch(matchId)

        return response
      } catch (error) {
        handleError('Error al rechazar match', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  /**
   * Dismiss a suggestion ("X" action)
   */
  const dismissSuggestion = useCallback(
    async targetUserId => {
      try {
        setLoading(true)
        const response = await matchSuggestionService.dismissSuggestion(targetUserId)

        return response
      } catch (error) {
        handleError('Error al descartar sugerencia', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // ===============================
  // OBTENER INFORMACIÓN
  // ===============================

  /**
   * Get match details by ID
   */
  const getMatchById = useCallback(
    async matchId => {
      try {
        const response = await matchInteractionService.getMatchById(matchId)

        return response
      } catch (error) {
        handleError('Error al obtener detalle de match', error)
        throw error
      }
    },
    [handleError]
  )

  /**
   * Get contact information for a matched user
   */
  const getMatchContact = useCallback(
    async matchId => {
      try {
        const response = await matchInteractionService.getMatchContact(matchId)

        return response
      } catch (error) {
        handleError('Error al obtener información de contacto', error)
        throw error
      }
    },
    [handleError]
  )

  return {
    // State
    loading,

    // Actions
    sendMatch,
    acceptMatch,
    rejectMatch,
    dismissSuggestion,

    // Queries
    getMatchById,
    getMatchContact
  }
}

export default useMatchInteractions
