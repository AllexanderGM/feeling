import { useState, useEffect, useCallback } from 'react'
import { getAllTours, getTourById, createTour, updateTour, deleteTour } from '@services/tourService.js'
import { useError } from '@hooks/useError.js'

const useTour = () => {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { handleError, handleSuccess } = useError()

  // Función para obtener todos los tours
  const fetchTours = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllTours()
      if (response.success) {
        setTours(response.data || [])
      } else {
        setError(response.error || 'Error al cargar tours')
        handleError('Error al cargar tours')
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar tours'
      setError(errorMessage)
      handleError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  // Función para refrescar tours
  const refreshTours = useCallback(() => {
    fetchTours()
  }, [fetchTours])

  // Función para obtener un tour por ID
  const getTour = useCallback(async (tourId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getTourById(tourId)
      if (response.success) {
        return response.data
      } else {
        const errorMessage = response.error || 'Error al cargar tour'
        setError(errorMessage)
        handleError(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar tour'
      setError(errorMessage)
      handleError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  // Función para crear un nuevo tour
  const addTour = useCallback(async (tourData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await createTour(tourData)
      if (response.error) {
        const errorMessage = response.message || 'Error al crear tour'
        setError(errorMessage)
        handleError(errorMessage)
        return { success: false, error: errorMessage }
      } else {
        handleSuccess('Tour creado exitosamente')
        await fetchTours() // Refrescar la lista
        return { success: true, data: response }
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear tour'
      setError(errorMessage)
      handleError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [handleError, handleSuccess, fetchTours])

  // Función para actualizar un tour
  const editTour = useCallback(async (tourId, tourData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await updateTour(tourId, tourData)
      if (response.error) {
        const errorMessage = response.message || 'Error al actualizar tour'
        setError(errorMessage)
        handleError(errorMessage)
        return { success: false, error: errorMessage }
      } else {
        handleSuccess('Tour actualizado exitosamente')
        await fetchTours() // Refrescar la lista
        return { success: true, data: response }
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar tour'
      setError(errorMessage)
      handleError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [handleError, handleSuccess, fetchTours])

  // Función para eliminar un tour
  const removeTour = useCallback(async (tourId) => {
    setLoading(true)
    setError(null)
    try {
      const success = await deleteTour(tourId)
      if (success) {
        handleSuccess('Tour eliminado exitosamente')
        await fetchTours() // Refrescar la lista
        return { success: true }
      } else {
        const errorMessage = 'Error al eliminar tour'
        setError(errorMessage)
        handleError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar tour'
      setError(errorMessage)
      handleError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [handleError, handleSuccess, fetchTours])

  // Función para buscar tours
  const searchTours = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return tours
    }

    const filteredTours = tours.filter(tour => 
      tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.destination?.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.tags?.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return filteredTours
  }, [tours])

  // Función para filtrar tours por categoría
  const filterToursByCategory = useCallback((category) => {
    if (!category) return tours
    
    return tours.filter(tour => 
      tour.tags?.some(tag => tag?.toLowerCase() === category.toLowerCase())
    )
  }, [tours])

  // Cargar tours al montar el componente
  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  return {
    tours,
    loading,
    error,
    fetchTours,
    refreshTours,
    getTour,
    addTour,
    editTour,
    removeTour,
    searchTours,
    filterToursByCategory
  }
}

export default useTour