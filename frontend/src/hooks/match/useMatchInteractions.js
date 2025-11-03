import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { matchInteractionService, matchSuggestionService } from '@services'
import { useError, useConfetti } from '@hooks'
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
  const mergedOptions = useMemo(() => ({ onNoAttemptsAvailable: null, ...options }), [options])

  // Obtener funciones del contexto global de matches
  const { showPremiumModal } = useMatch()

  // Hook de confeti para efectos visuales
  const { fireHeartsConfetti } = useConfetti()

  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const setLoadingSafe = useCallback(value => {
    if (isMountedRef.current) {
      setLoading(value)
    }
  }, [])

  const withLoading = useCallback(
    async operation => {
      setLoadingSafe(true)

      try {
        return await operation()
      } finally {
        setLoadingSafe(false)
      }
    },
    [setLoadingSafe]
  )

  // ===============================
  // UTILIDADES
  // ===============================

  /**
   * Detecta si el error es por falta de intentos
   */
  const isNoAttemptsError = useCallback(error => {
    // Primero verificar si es USER_NOT_APPROVED (no debe tratarse como error de intentos)
    // El backend envía el código en el campo 'error', no 'code'
    const errorCode = error?.response?.data?.error || error?.response?.data?.code || error?.code

    if (errorCode === 'USER_NOT_APPROVED') {
      return false
    }

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

    // También puede ser un 429 (Too Many Requests)
    // NOTA: Ya no verificamos 403 aquí porque puede ser USER_NOT_APPROVED
    const isLimitError = errorStatus === 429

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
        const response = await withLoading(async () => await matchInteractionService.sendMatch(targetUserId))

        fireHeartsConfetti()

        return response
      } catch (error) {
        if (isNoAttemptsError(error)) {
          Logger.warn(Logger.CATEGORIES.UI, 'enviar match', 'Intentos de match agotados')

          if (mergedOptions.onNoAttemptsAvailable) {
            mergedOptions.onNoAttemptsAvailable(error)
          } else {
            showPremiumModal()
          }
        } else {
          handleError(error, { customMessage: 'Error al enviar match' })
        }

        throw error
      }
    },
    [handleError, isNoAttemptsError, mergedOptions, showPremiumModal, fireHeartsConfetti, withLoading]
  )

  /**
   * Accept a received match
   */
  const acceptMatch = useCallback(
    async matchId => {
      try {
        const response = await withLoading(async () => await matchInteractionService.acceptMatch(matchId))

        fireHeartsConfetti()

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al aceptar match' })
        throw error
      }
    },
    [handleError, fireHeartsConfetti, withLoading]
  )

  /**
   * Reject a received match
   */
  const rejectMatch = useCallback(
    async matchId => {
      try {
        return await withLoading(async () => await matchInteractionService.rejectMatch(matchId))
      } catch (error) {
        handleError(error, { customMessage: 'Error al rechazar match' })
        throw error
      }
    },
    [handleError, withLoading]
  )

  /**
   * Withdraw a sent match request
   */
  const withdrawMatch = useCallback(
    async matchId => {
      try {
        return await withLoading(async () => await matchInteractionService.withdrawMatch(matchId))
      } catch (error) {
        handleError(error, { customMessage: 'Error al retirar el match' })
        throw error
      }
    },
    [handleError, withLoading]
  )

  /**
   * Dismiss a suggestion ("X" action)
   */
  const dismissSuggestion = useCallback(
    async targetUserId => {
      try {
        return await withLoading(async () => await matchSuggestionService.dismissSuggestion(targetUserId))
      } catch (error) {
        handleError(error, { customMessage: 'Error al descartar sugerencia' })
        throw error
      }
    },
    [handleError, withLoading]
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
        handleError(error, { customMessage: 'Error al obtener detalle de match' })
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
        handleError(error, { customMessage: 'Error al obtener información de contacto' })
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
    withdrawMatch,
    dismissSuggestion,

    // Queries
    getMatchById,
    getMatchContact
  }
}

export default useMatchInteractions
