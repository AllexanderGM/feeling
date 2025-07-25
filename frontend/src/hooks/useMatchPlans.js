import { useState, useEffect, useCallback } from 'react'
import { matchService } from '@services/matchService.js'
import { useError } from './useError.js'

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
      handleError('Error al cargar planes disponibles', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const purchasePlan = useCallback(async (planId) => {
    try {
      setLoading(true)
      const response = await matchService.purchaseMatchPlan(planId)
      
      // Update user plan info after successful purchase
      setUserPlan(response.userPlan)
      
      return response
    } catch (error) {
      handleError('Error al comprar plan', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [handleError])

  // ===============================
  // ADMIN PLAN MANAGEMENT
  // ===============================

  const fetchAllPlans = useCallback(async (page = 0, size = 10) => {
    try {
      setLoading(true)
      const response = await matchService.getAllPlans(page, size)
      setPlans(response.content || response)
      return response
    } catch (error) {
      handleError('Error al cargar todos los planes', error)
      return { content: [], totalElements: 0 }
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const createPlan = useCallback(async (planData) => {
    try {
      setLoading(true)
      const response = await matchService.createPlan(planData)
      
      // Refresh plans list
      await fetchAllPlans()
      
      return response
    } catch (error) {
      handleError('Error al crear plan', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [handleError, fetchAllPlans])

  const updatePlan = useCallback(async (planId, planData) => {
    try {
      setLoading(true)
      const response = await matchService.updatePlan(planId, planData)
      
      // Update local state
      setPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, ...planData } : plan
      ))
      
      return response
    } catch (error) {
      handleError('Error al actualizar plan', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const deletePlan = useCallback(async (planId) => {
    try {
      setLoading(true)
      const response = await matchService.deletePlan(planId)
      
      // Remove from local state
      setPlans(prev => prev.filter(plan => plan.id !== planId))
      
      return response
    } catch (error) {
      handleError('Error al eliminar plan', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const fetchPlanStats = useCallback(async () => {
    try {
      const response = await matchService.getPlanStats()
      setPlanStats(response)
      return response
    } catch (error) {
      handleError('Error al cargar estadísticas de planes', error)
      return {}
    }
  }, [handleError])

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  const getPlanById = useCallback((planId) => {
    return plans.find(plan => plan.id === planId)
  }, [plans])

  const getActivePlans = useCallback(() => {
    return plans.filter(plan => plan.isActive)
  }, [plans])

  const getMostPopularPlan = useCallback(() => {
    return plans.find(plan => plan.popular) || plans[1] // Default to second plan if no popular flag
  }, [plans])

  const calculatePlanValue = useCallback((plan) => {
    if (!plan || !plan.price || !plan.attempts) return 0
    return (plan.price / plan.attempts).toFixed(2)
  }, [])

  // ===============================
  // REFRESH OPERATIONS
  // ===============================

  const refreshPlans = useCallback(async (isAdmin = false) => {
    try {
      if (isAdmin) {
        await Promise.all([
          fetchAllPlans(),
          fetchPlanStats()
        ])
      } else {
        await fetchAvailablePlans()
      }
    } catch (error) {
      handleError('Error al actualizar planes', error)
    }
  }, [fetchAllPlans, fetchAvailablePlans, fetchPlanStats, handleError])

  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(() => {
    // Load available plans by default (public view)
    fetchAvailablePlans()
  }, []) // Only run on mount

  return {
    // Data
    plans,
    planStats,
    userPlan,
    loading,
    
    // Public operations
    fetchAvailablePlans,
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