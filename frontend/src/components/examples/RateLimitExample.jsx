import React, { useState } from 'react'
import { Button } from '@heroui/react'
import { Logger } from '@utils/logger'

import api from '../../services/utils/api'

/**
 * Componente de ejemplo para demostrar el manejo de rate limiting
 * Este componente se puede usar temporalmente para probar la funcionalidad
 *
 * USO:
 * 1. Importar este componente en cualquier página
 * 2. Hacer múltiples requests rápidos
 * 3. Observar cómo aparece el modal de rate limiting
 */
const RateLimitExample = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [responseCount, setResponseCount] = useState(0)

  const makeRequest = async () => {
    try {
      setIsLoading(true)

      // Hacer una petición que podría activar rate limiting
      // Cambia esta URL por cualquier endpoint real de tu API
      await api.get('/info/system-info')

      setResponseCount(prev => prev + 1)
      Logger.info('Petición exitosa', Logger.CATEGORIES.API, { endpoint: '/info/system-info' })
    } catch (error) {
      Logger.error('Error en petición', Logger.CATEGORIES.API, { endpoint: '/info/system-info', error: error.message })

      // El modal de rate limiting se mostrará automáticamente
      // gracias al interceptor que configuramos
    } finally {
      setIsLoading(false)
    }
  }

  const makeMultipleRequests = async () => {
    Logger.info('Haciendo múltiples peticiones rápidas...', Logger.CATEGORIES.API)
    // Hacer 10 peticiones rápidas para activar rate limiting
    for (let i = 0; i < 10; i++) {
      makeRequest()
      // Pequeña demora entre requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <div className='rate-limit-example p-6 bg-white rounded-lg shadow-md max-w-md'>
      <h3 className='text-lg font-semibold mb-4'>🧪 Prueba de Rate Limiting</h3>

      <div className='space-y-4'>
        <div className='text-sm text-gray-600'>
          <p>
            Peticiones completadas: <strong>{responseCount}</strong>
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <Button className='w-full' color='primary' isLoading={isLoading} variant='solid' onPress={makeRequest}>
            Hacer 1 petición
          </Button>

          <Button className='w-full' color='warning' isLoading={isLoading} variant='solid' onPress={makeMultipleRequests}>
            Hacer 10 peticiones rápidas (activar rate limit)
          </Button>
        </div>

        <div className='text-xs text-gray-500 p-3 bg-gray-50 rounded'>
          <p>
            <strong>Qué esperar:</strong>
          </p>
          <ul className='list-disc list-inside mt-1 space-y-1'>
            <li>Al hacer múltiples peticiones, el servidor responderá con error 429</li>
            <li>Aparecerá automáticamente un modal con countdown</li>
            <li>El modal mostrará el tiempo de espera</li>
            <li>No aparecerán toasts de error duplicados</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RateLimitExample
