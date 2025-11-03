import { useState, useCallback, useMemo } from 'react'
import userAnalyticsService from '@services/user/userAnalyticsService.js'
import { Logger } from '@utils/logger.js'
import { useError, useAsyncOperation } from '@hooks'

export const useUserAnalytics = () => {
  const { handleApiResponse } = useError()
  const { loading, withLoading } = useAsyncOperation()

  // Estados independientes para cada tipo de datos analytics
  const [overview, setOverview] = useState({
    active: 0,
    deactivated: 0,
    incomplete: 0,
    pending: 0,
    rejected: 0,
    total: 0,
    unverified: 0
  })

  const [userMetrics, setUserMetrics] = useState(null)
  const [userDetailedMetrics, setUserDetailedMetrics] = useState({})
  const [topUsers, setTopUsers] = useState(null)
  const [attributeStatistics, setAttributeStatistics] = useState(null)
  const [interestsStatistics, setInterestsStatistics] = useState(null)
  const [tagsStatistics, setTagsStatistics] = useState(null)
  const [completeAnalytics, setCompleteAnalytics] = useState(null)

  // ========================================
  // MÉTODOS DE ANALYTICS PRINCIPALES
  // ========================================

  const getUserOverview = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getAnalyticsOverview())

      if (result?.data) setOverview(result.data)

      return handleApiResponse(result, 'Contador de usuarios obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getUserMetrics = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getUserMetrics())

      if (result?.data) setUserMetrics(result.data)

      return handleApiResponse(result, 'Métricas de usuarios obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getUserDetailedMetrics = useCallback(
    async (userId, showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getUserDetailedMetrics(userId))

      if (result?.data) {
        // Caso especial: actualizar objeto anidado con clave específica
        setUserDetailedMetrics(prev => ({ ...prev, [userId]: result.data }))
      }

      return handleApiResponse(result, 'Métricas detalladas obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getTopUsers = useCallback(
    async (limit = 10, showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getTopUsers(limit))

      if (result?.data) setTopUsers(result.data)

      return handleApiResponse(result, 'Rankings de usuarios obtenidos', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getAttributeStatistics = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getAttributeStatistics())

      if (result?.data) setAttributeStatistics(result.data)

      return handleApiResponse(result, 'Estadísticas de atributos obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getInterestsStatistics = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getInterestsStatistics())

      if (result?.data) setInterestsStatistics(result.data)

      return handleApiResponse(result, 'Estadísticas de intereses obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getTagsStatistics = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getTagsStatistics())

      if (result?.data) setTagsStatistics(result.data)

      return handleApiResponse(result, 'Estadísticas de tags obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  const getCompleteAnalytics = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => await userAnalyticsService.getCompleteAnalytics())

      if (result?.data) setCompleteAnalytics(result.data)

      return handleApiResponse(result, 'Estadísticas completas obtenidas', { showNotifications })
    },
    [withLoading, handleApiResponse]
  )

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  const refreshAllAnalytics = useCallback(
    async (showNotifications = false) => {
      Logger.info(Logger.CATEGORIES.USER, 'Actualizando todas las estadísticas')

      const result = await withLoading(async () => {
        const promises = [
          getUserOverview(false),
          getUserMetrics(false),
          getTopUsers(10, false),
          getAttributeStatistics(false),
          getInterestsStatistics(false),
          getTagsStatistics(false)
        ]

        const results = await Promise.allSettled(promises)

        // Verificar si alguna promesa falló
        const failures = results.filter(result => result.status === 'rejected')

        if (failures.length > 0) {
          Logger.warn(Logger.CATEGORIES.USER, 'Algunas estadísticas fallaron al actualizarse', {
            failures: failures.length,
            total: promises.length
          })
        }

        return {
          success: true,
          updated: results.length - failures.length,
          failed: failures.length
        }
      })

      return handleApiResponse(result, 'Todas las estadísticas han sido actualizadas', { showNotifications })
    },
    [
      getUserOverview,
      getUserMetrics,
      getTopUsers,
      getAttributeStatistics,
      getInterestsStatistics,
      getTagsStatistics,
      withLoading,
      handleApiResponse
    ]
  )

  const clearAnalyticsData = useCallback(() => {
    Logger.info(Logger.CATEGORIES.USER, 'Limpiando datos de estadísticas')
    setOverview({
      active: 0,
      deactivated: 0,
      incomplete: 0,
      pending: 0,
      rejected: 0,
      total: 0,
      unverified: 0
    })
    setUserMetrics(null)
    setUserDetailedMetrics({})
    setTopUsers(null)
    setAttributeStatistics(null)
    setInterestsStatistics(null)
    setTagsStatistics(null)
    setCompleteAnalytics(null)
  }, [])

  // ========================================
  // DATOS CALCULADOS Y ESTADOS
  // ========================================

  // Estados derivados de los datos
  const hasAnalyticsData = useMemo(() => {
    return (
      overview.total > 0 ||
      userMetrics !== null ||
      Object.keys(userDetailedMetrics).length > 0 ||
      topUsers !== null ||
      attributeStatistics !== null ||
      interestsStatistics !== null ||
      tagsStatistics !== null ||
      completeAnalytics !== null
    )
  }, [overview, userMetrics, userDetailedMetrics, topUsers, attributeStatistics, interestsStatistics, tagsStatistics, completeAnalytics])

  // Estados específicos de cada sección
  const isOverviewReady = useMemo(() => overview.total > 0 && !loading, [overview.total, loading])

  const isUserMetricsReady = useMemo(() => userMetrics !== null && !loading, [userMetrics, loading])

  const isTopUsersReady = useMemo(() => topUsers !== null && !loading, [topUsers, loading])

  const isAttributeStatisticsReady = useMemo(() => attributeStatistics !== null && !loading, [attributeStatistics, loading])

  const isInterestsStatisticsReady = useMemo(() => interestsStatistics !== null && !loading, [interestsStatistics, loading])

  const isTagsStatisticsReady = useMemo(() => tagsStatistics !== null && !loading, [tagsStatistics, loading])

  const isCompleteAnalyticsReady = useMemo(() => completeAnalytics !== null && !loading, [completeAnalytics, loading])

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados principales
    loading,
    hasAnalyticsData,

    // Estados independientes de analytics
    overview,
    userMetrics,
    userDetailedMetrics,
    topUsers,
    attributeStatistics,
    interestsStatistics,
    tagsStatistics,
    completeAnalytics,

    // Estados de secciones específicas
    isOverviewReady,
    isUserMetricsReady,
    isTopUsersReady,
    isAttributeStatisticsReady,
    isInterestsStatisticsReady,
    isTagsStatisticsReady,
    isCompleteAnalyticsReady,

    // Métodos principales de analytics
    getUserOverview,
    getUserMetrics,
    getUserDetailedMetrics,
    getTopUsers,
    getAttributeStatistics,
    getInterestsStatistics,
    getTagsStatistics,
    getCompleteAnalytics,

    // Métodos de utilidad
    refreshAllAnalytics,
    clearAnalyticsData,

    // Setters individuales para manipulación independiente
    setOverview,
    setUserMetrics,
    setUserDetailedMetrics,
    setTopUsers,
    setAttributeStatistics,
    setInterestsStatistics,
    setTagsStatistics,
    setCompleteAnalytics
  }
}

export default useUserAnalytics
