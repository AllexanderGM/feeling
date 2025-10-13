import { useEffect } from 'react'

import { registerRateLimitCallback } from '../../services/utils/api'
import { useRateLimit } from '../../contexts/RateLimitContext'

/**
 * Hook para registrar automáticamente el callback de rate limiting
 * con el interceptor de axios. Se debe usar en el componente principal
 * de la aplicación.
 */
export const useRateLimitInterceptor = () => {
  const { showRateLimitModal } = useRateLimit()

  useEffect(() => {
    // Registrar el callback para mostrar el modal cuando ocurra un error 429
    registerRateLimitCallback(showRateLimitModal)

    // Limpiar al desmontar (opcional)
    return () => {
      registerRateLimitCallback(null)
    }
  }, [showRateLimitModal])
}

export default useRateLimitInterceptor
