import { useState, useCallback } from 'react'
import userService from '@services'
import { Logger } from '@utils/logger.js'

/**
 * Hook personalizado para manejo de analytics de usuarios
 */
export const useUserAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    geographic: null,
    engagement: null,
    topUsers: null,
    growth: null
  })

  const [loading, setLoading] = useState({
    overview: false,
    geographic: false,
    engagement: false,
    topUsers: false,
    growth: false
  })

  const [error, setError] = useState({
    overview: null,
    geographic: null,
    engagement: null,
    topUsers: null,
    growth: null
  })

  // Función para manejar loading y errores
  const handleRequest = useCallback(async (type, requestFn) => {
    setLoading(prev => ({ ...prev, [type]: true }))
    setError(prev => ({ ...prev, [type]: null }))

    try {
      const result = await requestFn()
      setAnalyticsData(prev => ({ ...prev, [type]: result }))
      return result
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, `Error in ${type} analytics`, err)
      setError(prev => ({ ...prev, [type]: err.message || 'Error desconocido' }))
      throw err
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }, [])

  // ========================================
  // MÉTODOS DE ANALYTICS
  // ========================================

  const getOverview = useCallback(
    async (force = false) => {
      if (!force && analyticsData.overview) return analyticsData.overview
      return handleRequest('overview', userService.getAnalyticsOverview)
    },
    [analyticsData.overview, handleRequest]
  )

  const getGeographicDistribution = useCallback(
    async (force = false) => {
      if (!force && analyticsData.geographic) return analyticsData.geographic
      return handleRequest('geographic', userService.getGeographicDistribution)
    },
    [analyticsData.geographic, handleRequest]
  )

  const getEngagementStats = useCallback(
    async (force = false) => {
      if (!force && analyticsData.engagement) return analyticsData.engagement
      return handleRequest('engagement', userService.getEngagementStats)
    },
    [analyticsData.engagement, handleRequest]
  )

  const getTopUsers = useCallback(
    async (limit = 10, force = false) => {
      if (!force && analyticsData.topUsers) return analyticsData.topUsers
      return handleRequest('topUsers', () => userService.getTopUsers(limit))
    },
    [analyticsData.topUsers, handleRequest]
  )

  const getGrowthStats = useCallback(
    async (period = 'monthly', force = false) => {
      if (!force && analyticsData.growth) return analyticsData.growth
      return handleRequest('growth', () => userService.getGrowthStats(period))
    },
    [analyticsData.growth, handleRequest]
  )

  const getUserMetrics = useCallback(async userId => {
    setLoading(prev => ({ ...prev, userMetrics: true }))
    setError(prev => ({ ...prev, userMetrics: null }))

    try {
      const result = await userService.getUserDetailedMetrics(userId)
      return result
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error getting user metrics', err)
      setError(prev => ({ ...prev, userMetrics: err.message || 'Error desconocido' }))
      throw err
    } finally {
      setLoading(prev => ({ ...prev, userMetrics: false }))
    }
  }, [])

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  const refreshAll = useCallback(async () => {
    Logger.debug(Logger.CATEGORIES.USER, 'Refreshing all analytics', {})

    try {
      await Promise.all([
        getOverview(true),
        getGeographicDistribution(true),
        getEngagementStats(true),
        getTopUsers(10, true),
        getGrowthStats('monthly', true)
      ])
      Logger.debug(Logger.CATEGORIES.USER, 'Analytics refreshed successfully', {})
    } catch (err) {
      Logger.error(Logger.CATEGORIES.USER, 'Error refreshing analytics', err)
    }
  }, [getOverview, getGeographicDistribution, getEngagementStats, getTopUsers, getGrowthStats])

  const clearData = useCallback(() => {
    setAnalyticsData({
      overview: null,
      geographic: null,
      engagement: null,
      topUsers: null,
      growth: null
    })
    setError({
      overview: null,
      geographic: null,
      engagement: null,
      topUsers: null,
      growth: null
    })
  }, [])

  // ========================================
  // DATOS CALCULADOS
  // ========================================

  const isLoading = Object.values(loading).some(Boolean)
  const hasError = Object.values(error).some(Boolean)
  const hasData = Object.values(analyticsData).some(Boolean)

  // Estados específicos de cada sección
  const overviewReady = analyticsData.overview && !loading.overview && !error.overview
  const geographicReady = analyticsData.geographic && !loading.geographic && !error.geographic
  const engagementReady = analyticsData.engagement && !loading.engagement && !error.engagement
  const topUsersReady = analyticsData.topUsers && !loading.topUsers && !error.topUsers
  const growthReady = analyticsData.growth && !loading.growth && !error.growth

  return {
    // Datos
    analyticsData,

    // Estados de carga
    loading,
    isLoading,

    // Estados de error
    error,
    hasError,

    // Estados de datos
    hasData,
    overviewReady,
    geographicReady,
    engagementReady,
    topUsersReady,
    growthReady,

    // Métodos
    getOverview,
    getGeographicDistribution,
    getEngagementStats,
    getTopUsers,
    getGrowthStats,
    getUserMetrics,
    refreshAll,
    clearData
  }
}

export default useUserAnalytics
