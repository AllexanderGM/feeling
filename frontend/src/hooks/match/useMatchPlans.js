import { useState, useCallback } from 'react'
import { matchService } from '@services'
import { useError } from '@hooks'

export const useMatchPlans = () => {
  const [plans, setPlans] = useState([])
  const [planStats, setPlanStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalRevenue: 0,
    totalPurchases: 0
  })
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState(null)
  const { handleError } = useError()

  // ===============================
  // PUBLIC PLAN OPERATIONS
  // ===============================

  const fetchAvailablePlans = useCallback(async () => {
    try {
      setLoading(true)
      const response = await matchService.getAvailablePlans()

      setPlans(response)

      return response
    } catch (error) {
      handleError(error, { customMessage: 'Error al cargar planes disponibles' })

      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const createPaymentIntent = useCallback(
    async matchPlanId => {
      try {
        setLoading(true)

        const response = await matchService.createMatchPlanPaymentIntent(matchPlanId)

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al preparar el pago del plan' })

        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const purchasePlan = useCallback(
    async payload => {
      try {
        setLoading(true)
        const response = await matchService.confirmMatchPlanPurchase(payload)

        // Update user plan info after successful purchase
        if (response?.userMatchPlan) {
          setUserPlan(response.userMatchPlan)
        }

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al confirmar la compra del plan' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // ===============================
  // ADMIN PLAN MANAGEMENT
  // ===============================

  const fetchAllPlans = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchService.getAllPlans(page, size)

        setPlans(response.content || response)

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al cargar todos los planes' })

        return { content: [], totalElements: 0 }
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const createPlan = useCallback(
    async planData => {
      try {
        setLoading(true)
        const response = await matchService.createPlan(planData)

        // Refresh plans list
        await fetchAllPlans()

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al crear plan' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError, fetchAllPlans]
  )

  const updatePlan = useCallback(
    async (planId, planData) => {
      try {
        setLoading(true)
        const response = await matchService.updatePlan(planId, planData)

        // Update local state
        setPlans(prev => prev.map(plan => (plan.id === planId ? { ...plan, ...planData } : plan)))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al actualizar plan' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const deletePlan = useCallback(
    async planId => {
      try {
        setLoading(true)
        const response = await matchService.deletePlan(planId)

        // Remove from local state
        setPlans(prev => prev.filter(plan => plan.id !== planId))

        return response
      } catch (error) {
        handleError(error, { customMessage: 'Error al eliminar plan' })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  const fetchPlanStats = useCallback(async () => {
    try {
      const response = await matchService.getPlanStats()

      setPlanStats(response)

      return response
    } catch (error) {
      handleError(error, { customMessage: 'Error al cargar estadísticas de planes' })

      return {}
    }
  }, [handleError])

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const getPlanById = useCallback(
    planId => {
      return plans.find(plan => plan.id === planId)
    },
    [plans]
  )

  const getActivePlans = useCallback(() => {
    return plans.filter(plan => plan.isActive)
  }, [plans])

  const getMostPopularPlan = useCallback(() => {
    return plans.find(plan => plan.popular) || plans[1] // Default to second plan if no popular flag
  }, [plans])

  const calculatePlanValue = useCallback(plan => {
    if (!plan || !plan.price || !plan.attempts) return 0

    return (plan.price / plan.attempts).toFixed(2)
  }, [])

  // ===============================
  // REFRESH OPERATIONS
  // ===============================

  const refreshPlans = useCallback(
    async (isAdmin = false) => {
      try {
        if (isAdmin) {
          await Promise.all([fetchAllPlans(), fetchPlanStats()])
        } else {
          await fetchAvailablePlans()
        }
      } catch (error) {
        handleError(error, { customMessage: 'Error al actualizar planes' })
      }
    },
    [fetchAllPlans, fetchAvailablePlans, fetchPlanStats, handleError]
  )

  // ===============================
  // INITIAL LOAD - REMOVED
  // ===============================
  // NOTE: Los planes ya NO se cargan automáticamente al montar el hook.
  // Deben cargarse manualmente llamando a fetchAvailablePlans() cuando sea necesario
  // (por ejemplo, cuando se abre el modal premium)

  return {
    // Data
    plans,
    planStats,
    userPlan,
    loading,

    // Public operations
    fetchAvailablePlans,
    createPaymentIntent,
    purchasePlan,

    // Admin operations
    fetchAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPlanStats,

    // Utility functions
    getPlanById,
    getActivePlans,
    getMostPopularPlan,
    calculatePlanValue,

    // Refresh
    refreshPlans
  }
}

export default useMatchPlans
