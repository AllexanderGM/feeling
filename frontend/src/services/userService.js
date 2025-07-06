import { ServiceREST } from '@services/serviceREST.js'
import { ErrorManager } from '@utils/errorManager.js'

/**
 * Servicio de usuario simplificado - Solo comunicación con API
 */
class UserService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // OPERACIONES BÁSICAS DE USUARIO
  // ========================================

  async getAllUsers(page = 0, size = 10, searchTerm = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      })
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      const result = await ServiceREST.get(`/users?${params.toString()}`)
      return ServiceREST.handleServiceResponse(result, 'obtener lista de usuarios')
    } catch (error) {
      this.logError('obtener usuarios', error)
      throw error
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await ServiceREST.get(`/users/${encodeURIComponent(email)}`)
      return ServiceREST.handleServiceResponse(result, 'obtener usuario por email')
    } catch (error) {
      this.logError('obtener usuario por email', error)
      throw error
    }
  }

  async createUser(userData) {
    try {
      const result = await ServiceREST.post('/users', userData)
      return ServiceREST.handleServiceResponse(result, 'crear usuario')
    } catch (error) {
      this.logError('crear usuario', error)
      throw error
    }
  }

  async updateUserAdmin(email, userData) {
    try {
      const result = await ServiceREST.put(`/users/${encodeURIComponent(email)}`, userData)
      return ServiceREST.handleServiceResponse(result, 'actualizar usuario')
    } catch (error) {
      this.logError('actualizar usuario', error)
      throw error
    }
  }

  async assignAdminRole(email) {
    try {
      const result = await ServiceREST.put(`/users/${encodeURIComponent(email)}/assign-admin`)
      return ServiceREST.handleServiceResponse(result, 'asignar rol de administrador')
    } catch (error) {
      this.logError('asignar rol de administrador', error)
      throw error
    }
  }

  async revokeAdminRole(email) {
    try {
      const result = await ServiceREST.put(`/users/${encodeURIComponent(email)}/revoke-admin`)
      return ServiceREST.handleServiceResponse(result, 'revocar rol de administrador')
    } catch (error) {
      this.logError('revocar rol de administrador', error)
      throw error
    }
  }

  async deleteUser(email) {
    try {
      const result = await ServiceREST.delete(`/users/${encodeURIComponent(email)}`)
      return ServiceREST.handleServiceResponse(result, 'eliminar usuario')
    } catch (error) {
      this.logError('eliminar usuario', error)
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE PERFIL
  // ========================================

  async getMyUser() {
    try {
      const result = await ServiceREST.get('/users/profile')
      return ServiceREST.handleServiceResponse(result, 'obtener perfil del usuario')
    } catch (error) {
      this.logError('obtener perfil', error)
      throw error
    }
  }

  async updateUser(profileData) {
    try {
      const result = await ServiceREST.put('/users/profile', profileData)
      return ServiceREST.handleServiceResponse(result, 'actualizar perfil del usuario')
    } catch (error) {
      this.logError('actualizar perfil', error)
      throw error
    }
  }

  async completeUser(profileData, images = []) {
    try {
      if (!images || images.length === 0) {
        const result = await ServiceREST.post('/users/complete-profile', profileData)
        return ServiceREST.handleServiceResponse(result, 'completar perfil del usuario')
      }

      const formData = new FormData()
      formData.append('profileData', JSON.stringify(profileData))

      const validImages = images.filter(image => image && image instanceof File)
      validImages.forEach(image => {
        formData.append('profileImages', image)
      })

      const result = await ServiceREST.post('/users/complete-profile', formData)
      return ServiceREST.handleServiceResponse(result, 'completar perfil del usuario')
    } catch (error) {
      this.logError('Completar perfil', error)
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE IMÁGENES
  // ========================================

  async uploadProfileImage(imageFile) {
    try {
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error('Se requiere un archivo de imagen válido')
      }

      const formData = new FormData()
      formData.append('profileImage', imageFile)

      const result = await ServiceREST.post('/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return ServiceREST.handleServiceResponse(result, 'subir imagen de perfil')
    } catch (error) {
      this.logError('subir imagen de perfil', error)
      throw error
    }
  }

  // ========================================
  // OPERACIONES DE PREFERENCIAS
  // ========================================

  async getUserPreferences() {
    try {
      const result = await ServiceREST.get('/users/preferences')
      return ServiceREST.handleServiceResponse(result, 'obtener preferencias del usuario')
    } catch (error) {
      this.logError('obtener preferencias', error)
      throw error
    }
  }

  async updateUserPreferences(preferences) {
    try {
      const result = await ServiceREST.put('/users/preferences', preferences)
      return ServiceREST.handleServiceResponse(result, 'actualizar preferencias del usuario')
    } catch (error) {
      this.logError('actualizar preferencias', error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  logError(operation, error) {
    error.operation = operation
    console.error(`❌ Error en ${operation}:`, ErrorManager.formatError(error))
  }
}

// Crear instancia única
const userService = new UserService()

export default userService
