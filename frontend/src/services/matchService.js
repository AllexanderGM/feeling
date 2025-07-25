import { serviceREST } from './serviceREST.js'

class MatchService {
  constructor() {
    this.basePath = '/api/matches'
  }

  // ===============================
  // MATCH PLANS MANAGEMENT
  // ===============================

  /**
   * Get available match plans
   */
  async getAvailablePlans() {
    try {
      const response = await serviceREST.get(`${this.basePath}/plans`)
      return response
    } catch (error) {
      console.error('Error fetching match plans:', error)
      throw error
    }
  }

  /**
   * Purchase a match plan
   */
  async purchaseMatchPlan(planId) {
    try {
      const response = await serviceREST.post(`${this.basePath}/plans/purchase`, { planId })
      return response
    } catch (error) {
      console.error('Error purchasing match plan:', error)
      throw error
    }
  }

  /**
   * Get user's remaining attempts
   */
  async getRemainingAttempts() {
    try {
      const response = await serviceREST.get(`${this.basePath}/attempts`)
      return response
    } catch (error) {
      console.error('Error fetching remaining attempts:', error)
      throw error
    }
  }

  // ===============================
  // MATCH OPERATIONS
  // ===============================

  /**
   * Send a match request to another user
   */
  async sendMatch(targetUserId) {
    try {
      const response = await serviceREST.post(`${this.basePath}/send`, { targetUserId })
      return response
    } catch (error) {
      console.error('Error sending match:', error)
      throw error
    }
  }

  /**
   * Accept a received match
   */
  async acceptMatch(matchId) {
    try {
      const response = await serviceREST.post(`${this.basePath}/${matchId}/accept`)
      return response
    } catch (error) {
      console.error('Error accepting match:', error)
      throw error
    }
  }

  /**
   * Reject a received match
   */
  async rejectMatch(matchId) {
    try {
      const response = await serviceREST.post(`${this.basePath}/${matchId}/reject`)
      return response
    } catch (error) {
      console.error('Error rejecting match:', error)
      throw error
    }
  }

  /**
   * Get contact information for a matched user
   */
  async getMatchContact(matchId) {
    try {
      const response = await serviceREST.get(`${this.basePath}/${matchId}/contact`)
      return response
    } catch (error) {
      console.error('Error fetching match contact:', error)
      throw error
    }
  }

  // ===============================
  // MATCH LISTS
  // ===============================

  /**
   * Get matches sent by current user
   */
  async getSentMatches(page = 0, size = 10) {
    try {
      const response = await serviceREST.get(`${this.basePath}/sent`, {
        params: { page, size }
      })
      return response
    } catch (error) {
      console.error('Error fetching sent matches:', error)
      throw error
    }
  }

  /**
   * Get matches received by current user
   */
  async getReceivedMatches(page = 0, size = 10) {
    try {
      const response = await serviceREST.get(`${this.basePath}/received`, {
        params: { page, size }
      })
      return response
    } catch (error) {
      console.error('Error fetching received matches:', error)
      throw error
    }
  }

  /**
   * Get accepted matches (mutual matches)
   */
  async getAcceptedMatches(page = 0, size = 10) {
    try {
      const response = await serviceREST.get(`${this.basePath}/accepted`, {
        params: { page, size }
      })
      return response
    } catch (error) {
      console.error('Error fetching accepted matches:', error)
      throw error
    }
  }

  // ===============================
  // FAVORITES MANAGEMENT
  // ===============================

  /**
   * Add user to favorites
   */
  async addToFavorites(userId) {
    try {
      const response = await serviceREST.post(`${this.basePath}/favorites`, { userId })
      return response
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }

  /**
   * Remove user from favorites
   */
  async removeFromFavorites(userId) {
    try {
      const response = await serviceREST.delete(`${this.basePath}/favorites/${userId}`)
      return response
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  }

  /**
   * Get user's favorites list
   */
  async getFavorites(page = 0, size = 10) {
    try {
      const response = await serviceREST.get(`${this.basePath}/favorites`, {
        params: { page, size }
      })
      return response
    } catch (error) {
      console.error('Error fetching favorites:', error)
      throw error
    }
  }

  // ===============================
  // STATISTICS & NOTIFICATIONS
  // ===============================

  /**
   * Get match statistics for current user
   */
  async getMatchStats() {
    try {
      const response = await serviceREST.get(`${this.basePath}/stats`)
      return response
    } catch (error) {
      console.error('Error fetching match stats:', error)
      throw error
    }
  }

  /**
   * Get match notifications
   */
  async getMatchNotifications() {
    try {
      const response = await serviceREST.get(`${this.basePath}/notifications`)
      return response
    } catch (error) {
      console.error('Error fetching match notifications:', error)
      throw error
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await serviceREST.patch(`${this.basePath}/notifications/${notificationId}/read`)
      return response
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // ===============================
  // ADMIN ENDPOINTS (Plan Management)
  // ===============================

  /**
   * Get all match plans (admin only)
   */
  async getAllPlans(page = 0, size = 10) {
    try {
      const response = await serviceREST.get('/api/admin/match-plans', {
        params: { page, size }
      })
      return response
    } catch (error) {
      console.error('Error fetching all match plans:', error)
      throw error
    }
  }

  /**
   * Create new match plan (admin only)
   */
  async createPlan(planData) {
    try {
      const response = await serviceREST.post('/api/admin/match-plans', planData)
      return response
    } catch (error) {
      console.error('Error creating match plan:', error)
      throw error
    }
  }

  /**
   * Update match plan (admin only)
   */
  async updatePlan(planId, planData) {
    try {
      const response = await serviceREST.put(`/api/admin/match-plans/${planId}`, planData)
      return response
    } catch (error) {
      console.error('Error updating match plan:', error)
      throw error
    }
  }

  /**
   * Delete match plan (admin only)
   */
  async deletePlan(planId) {
    try {
      const response = await serviceREST.delete(`/api/admin/match-plans/${planId}`)
      return response
    } catch (error) {
      console.error('Error deleting match plan:', error)
      throw error
    }
  }

  /**
   * Get match plans statistics (admin only)
   */
  async getPlanStats() {
    try {
      const response = await serviceREST.get('/api/admin/match-plans/stats')
      return response
    } catch (error) {
      console.error('Error fetching plan stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const matchService = new MatchService()
export default matchService