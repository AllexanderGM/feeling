import { useState, useCallback } from 'react'
import { api } from '@services'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api({
        method,
        url,
        data,
        ...config
      })

      return {
        success: true,
        data: response.data,
        status: response.status
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error en la solicitud'
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage,
        status: err.response?.status
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((url, config) => request('GET', url, null, config), [request])
  const post = useCallback((url, data, config) => request('POST', url, data, config), [request])
  const put = useCallback((url, data, config) => request('PUT', url, data, config), [request])
  const patch = useCallback((url, data, config) => request('PATCH', url, data, config), [request])
  const del = useCallback((url, config) => request('DELETE', url, null, config), [request])

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError: () => setError(null)
  }
}

export default useApi
