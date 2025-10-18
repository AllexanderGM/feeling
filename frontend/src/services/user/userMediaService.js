import { ServiceREST } from '@services'
import { Logger } from '@utils/logger.js'
import { API_ENDPOINTS } from '@constants/apiRoutes.js'

/**
 * Servicio de media de usuario - UserMediaController
 * Gestiona imágenes de perfil y galería de usuarios
 */
class UserMediaService extends ServiceREST {
  constructor() {
    super()
  }

  // ========================================
  // CLIENTE - PERSONAL MEDIA
  // ========================================

  /**
   * POST /user-media/me - Subir imágenes
   */
  async uploadImages(images) {
    const context = 'subir imágenes'

    try {
      const formData = new FormData()

      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image)
        })
      }

      const result = await ServiceREST.post(API_ENDPOINTS.USER_MEDIA.UPLOAD, formData, {
        'Content-Type': 'multipart/form-data'
      })

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * GET /user-media/me - Obtener mis imágenes
   */
  async getMyImages() {
    const context = 'obtener mis imágenes'

    try {
      const result = await ServiceREST.get(API_ENDPOINTS.USER_MEDIA.MY_MEDIA)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * PUT /user-media/me/main - Cambiar imagen principal
   */
  async setMainImage(imageUrl) {
    const context = 'cambiar imagen principal'

    try {
      const params = new URLSearchParams({
        imageUrl: imageUrl
      })

      const result = await ServiceREST.put(`${API_ENDPOINTS.USER_MEDIA.SET_MAIN}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * DELETE /user-media/me - Eliminar mi imagen
   */
  async deleteMyImage(imageUrl) {
    const context = 'eliminar mi imagen'

    try {
      const params = new URLSearchParams({
        imageUrl: imageUrl
      })

      const result = await ServiceREST.delete(`${API_ENDPOINTS.USER_MEDIA.DELETE_MY_IMAGE}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // ADMIN - MEDIA MODERATION
  // ========================================

  /**
   * GET /user-media/{userId} - Obtener imágenes de usuario (admin)
   */
  async getUserImages(userId) {
    const context = 'obtener imágenes de usuario'

    try {
      const url = API_ENDPOINTS.USER_MEDIA.USER_MEDIA.replace('{userId}', userId)
      const result = await ServiceREST.get(url)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  /**
   * DELETE /user-media/{userId} - Eliminar imagen por moderación (admin)
   */
  async deleteUserImage(userId, imageUrl) {
    const context = 'eliminar imagen por moderación'

    try {
      const params = new URLSearchParams({
        imageUrl: imageUrl
      })

      const url = API_ENDPOINTS.USER_MEDIA.DELETE_USER_IMAGE.replace('{userId}', userId)
      const result = await ServiceREST.delete(`${url}?${params}`)

      return ServiceREST.handleServiceResponse(result, context)
    } catch (error) {
      this.logError(context, error)
      throw error
    }
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Validar archivo de imagen
   */
  validateImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Use: JPG, PNG, GIF o WEBP'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'La imagen es muy grande. Máximo 5MB'
      }
    }

    return { valid: true }
  }

  /**
   * Validar múltiples imágenes
   */
  validateImages(files) {
    const maxImages = 6

    if (!files || files.length === 0) {
      return {
        valid: false,
        error: 'Seleccione al menos una imagen'
      }
    }

    if (files.length > maxImages) {
      return {
        valid: false,
        error: `Puede subir máximo ${maxImages} imágenes a la vez`
      }
    }

    for (let file of files) {
      const validation = this.validateImage(file)

      if (!validation.valid) {
        return validation
      }
    }

    return { valid: true }
  }

  /**
   * Obtener información de formato de imagen
   */
  getImageFormats() {
    return [
      { extension: 'jpg', mimeType: 'image/jpeg', description: 'JPEG' },
      { extension: 'jpeg', mimeType: 'image/jpeg', description: 'JPEG' },
      { extension: 'png', mimeType: 'image/png', description: 'PNG' },
      { extension: 'gif', mimeType: 'image/gif', description: 'GIF' },
      { extension: 'webp', mimeType: 'image/webp', description: 'WebP' }
    ]
  }

  /**
   * Comprimir imagen antes de subir (simulado - requiere implementación real)
   */
  async compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = e => {
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calcular nuevas dimensiones manteniendo aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            blob => {
              resolve(
                new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
              )
            },
            file.type,
            quality
          )
        }

        img.onerror = reject
        img.src = e.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Manejo de errores específico del servicio
   */
  logError(operation, error) {
    error.operation = operation
    Logger.serviceError(operation, error, 'userMediaService')
  }
}

// Crear instancia única
const userMediaService = new UserMediaService()

export default userMediaService
