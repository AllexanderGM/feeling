import { ServiceNoREST } from '@services/serviceNoREST.js'
import { COOKIE_OPTIONS } from '@config/config'

/**
 * Servicio centralizado para manejo de cookies extendiendo ServiceNoREST
 * Proporciona una API unificada y segura para operaciones con cookies
 */
class CookieService extends ServiceNoREST {
  constructor() {
    super('CookieService')
    this.cookieHandler = null
  }

  /**
   * Inicializa el servicio con las funciones de react-cookie
   * @param {Object} cookieFunctions - { cookies, setCookie, removeCookie }
   */
  initialize({ cookies, setCookie, removeCookie }) {
    return this.executeWithErrorHandling(async () => {
      this.validateParams(
        { cookies, setCookie, removeCookie },
        {
          cookies: { required: true, type: 'object' },
          setCookie: { required: true, type: 'function' },
          removeCookie: { required: true, type: 'function' }
        }
      )

      this.cookieHandler = {
        cookies,
        setCookie,
        removeCookie
      }

      this.markAsInitialized()
    }, 'initialize')
  }

  /**
   * Obtiene el valor de una cookie con parsing automático
   * @param {string} name - Nombre de la cookie
   * @returns {any} Valor de la cookie parseado o null
   */
  get(name) {
    return this.executeWithErrorHandling(async () => {
      this.checkInitialization()

      this.validateParams({ name }, { name: { required: true, type: 'string' } })

      const value = this.cookieHandler.cookies[name]

      // Validar valores nulos o indefinidos
      if (value === undefined || value === 'undefined' || value === null) {
        this.logInfo(`Cookie '${name}' no encontrada o tiene valor nulo`)
        return null
      }

      // Parsing especial para la cookie de usuario
      if (name === 'user' && typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          const isValidObject = parsed && typeof parsed === 'object'

          this.logInfo(`Cookie 'user' parseada: ${isValidObject ? '✅' : '❌'}`)

          if (!isValidObject) {
            throw new Error('Parsed user cookie is not a valid object')
          }

          return parsed
        } catch (parseError) {
          this.logWarn(`Cookie corrupta detectada: ${name}`, parseError.message)

          // Limpiar cookie corrupta automáticamente
          await this.remove(name)

          throw this.createServiceError('CORRUPT_COOKIE', `Cookie '${name}' está corrupta y fue eliminada automáticamente`, {
            cookieName: name,
            parseError: parseError.message
          })
        }
      }

      // Parsing automático para otros objetos JSON
      if (typeof value === 'string' && this.isJsonString(value)) {
        try {
          const parsed = JSON.parse(value)
          this.logInfo(`Cookie '${name}' parseada como JSON`)
          return parsed
        } catch {
          this.logInfo(`Cookie '${name}' devuelta como string (parsing JSON falló)`)
          return value
        }
      }

      return value
    }, `get('${name}')`)
  }

  /**
   * Establece una cookie con serialización automática
   * @param {string} name - Nombre de la cookie
   * @param {any} value - Valor a guardar
   * @param {Object} options - Opciones de la cookie
   * @returns {boolean} True si se guardó correctamente
   */
  set(name, value, options = null) {
    return this.executeWithErrorHandling(async () => {
      this.checkInitialization()

      this.validateParams({ name }, { name: { required: true, type: 'string' } })

      const cookieOptions = options || COOKIE_OPTIONS

      // Serialización automática para objetos
      const valueToSave = typeof value === 'object' && value !== null ? JSON.stringify(value) : value

      this.cookieHandler.setCookie(name, valueToSave, cookieOptions)

      this.logInfo(`Cookie '${name}' guardada ${typeof value === 'object' ? '(como JSON)' : '(como string)'}`)

      return true
    }, `set('${name}')`)
  }

  /**
   * Elimina una cookie
   * @param {string} name - Nombre de la cookie
   * @param {Object} options - Opciones para eliminar
   * @returns {boolean} True si se eliminó correctamente
   */
  remove(name, options = null) {
    return this.executeWithErrorHandling(async () => {
      this.checkInitialization()

      this.validateParams({ name }, { name: { required: true, type: 'string' } })

      const removeOptions = options || { path: '/' }
      this.cookieHandler.removeCookie(name, removeOptions)

      this.logInfo(`Cookie '${name}' eliminada correctamente`)

      return true
    }, `remove('${name}')`)
  }

  /**
   * Verifica si una cookie existe
   * @param {string} name - Nombre de la cookie
   * @returns {boolean}
   */
  exists(name) {
    return this.executeWithErrorHandling(async () => {
      this.checkInitialization()

      this.validateParams({ name }, { name: { required: true, type: 'string' } })

      const value = this.cookieHandler.cookies[name]
      return value !== undefined && value !== null && value !== 'undefined'
    }, `exists('${name}')`)
  }

  /**
   * Obtiene todas las cookies
   * @returns {Object} Objeto con todas las cookies
   */
  getAll() {
    return this.executeWithErrorHandling(async () => {
      this.checkInitialization()

      const allCookies = { ...this.cookieHandler.cookies }
      this.logInfo(`Obtenidas todas las cookies (${Object.keys(allCookies).length} encontradas)`)

      return allCookies
    }, 'getAll')
  }

  /**
   * Limpia múltiples cookies de una vez
   * @param {string[]} cookieNames - Array de nombres de cookies
   * @returns {Object} Resultado de las operaciones
   */
  async clearMultiple(cookieNames) {
    return this.executeWithErrorHandling(async () => {
      this.validateParams(
        { cookieNames },
        {
          cookieNames: {
            required: true,
            validator: value => Array.isArray(value) && value.every(name => typeof name === 'string')
          }
        }
      )

      const results = {
        successful: [],
        failed: []
      }

      for (const name of cookieNames) {
        try {
          await this.remove(name)
          results.successful.push(name)
        } catch (error) {
          results.failed.push({ name, error: error.message })
        }
      }

      this.logInfo(`Limpieza múltiple: ✅ ${results.successful.length} exitosas, ❌ ${results.failed.length} fallidas`)

      return results
    }, 'clearMultiple')
  }

  /**
   * Limpia todas las cookies relacionadas con autenticación
   * @returns {Object} Resultado de la operación
   */
  async clearAuthCookies() {
    const authCookies = ['access_token', 'refresh_token', 'user']
    return this.clearMultiple(authCookies)
  }

  /**
   * Actualiza una cookie existente manteniendo su estructura
   * @param {string} name - Nombre de la cookie
   * @param {Object} updates - Campos a actualizar
   * @returns {Object|null} Valor actualizado o null
   */
  update(name, updates) {
    return this.executeWithErrorHandling(async () => {
      this.validateParams(
        { name, updates },
        {
          name: { required: true, type: 'string' },
          updates: { required: true, type: 'object' }
        }
      )

      const currentValue = await this.get(name)

      if (currentValue && typeof currentValue === 'object') {
        const updatedValue = { ...currentValue, ...updates }
        await this.set(name, updatedValue)

        this.logInfo(`Cookie '${name}' actualizada correctamente`)

        return updatedValue
      } else {
        throw this.createServiceError('COOKIE_UPDATE_ERROR', `No se puede actualizar cookie '${name}': no es un objeto o no existe`, {
          cookieName: name,
          currentValue,
          updates
        })
      }
    }, `update('${name}')`)
  }

  /**
   * Obtiene una cookie con valor por defecto
   * @param {string} name - Nombre de la cookie
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {any}
   */
  async getWithDefault(name, defaultValue) {
    try {
      const value = await this.get(name)
      const result = value !== null ? value : defaultValue

      if (value === null) {
        this.logInfo(`Cookie '${name}' no encontrada, usando valor por defecto`)
      }

      return result
    } catch (error) {
      if (error.errorType === 'CORRUPT_COOKIE') {
        this.logWarn(`Cookie '${name}' corrupta, usando valor por defecto`)
        return defaultValue
      }
      throw error
    }
  }

  /**
   * Valida si una string es JSON válido
   * @param {string} str - String a validar
   * @returns {boolean}
   */
  isJsonString(str) {
    if (typeof str !== 'string') return false

    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object' && parsed !== null
    } catch {
      return false
    }
  }

  /**
   * Crea un handler compatible con authService
   * @returns {Object} Handler con métodos get, set, remove
   */
  createHandler() {
    this.checkInitialization()

    return {
      get: async name => {
        try {
          return await this.get(name)
        } catch (error) {
          this.logError(`Error en cookieHandler.get('${name}'):`, error.message)
          return null // Para compatibilidad con código existente
        }
      },

      set: async (name, value, options) => {
        try {
          return await this.set(name, value, options)
        } catch (error) {
          this.logError(`Error en cookieHandler.set('${name}'):`, error.message)
          return false
        }
      },

      remove: async (name, options) => {
        try {
          return await this.remove(name, options)
        } catch (error) {
          this.logError(`Error en cookieHandler.remove('${name}'):`, error.message)
          return false
        }
      },

      exists: async name => {
        try {
          return await this.exists(name)
        } catch (error) {
          this.logError(`Error en cookieHandler.exists('${name}'):`, error.message)
          return false
        }
      },

      update: async (name, updates) => {
        try {
          return await this.update(name, updates)
        } catch (error) {
          this.logError(`Error en cookieHandler.update('${name}'):`, error.message)
          return null
        }
      },

      getWithDefault: async (name, defaultValue) => {
        try {
          return await this.getWithDefault(name, defaultValue)
        } catch (error) {
          this.logError(`Error en cookieHandler.getWithDefault('${name}'):`, error.message)
          return defaultValue
        }
      },

      clearAuthCookies: async () => {
        try {
          return await this.clearAuthCookies()
        } catch (error) {
          this.logError('Error en cookieHandler.clearAuthCookies():', error.message)
          return { successful: [], failed: [] }
        }
      }
    }
  }
}

// Instancia singleton
const cookieService = new CookieService()

export default cookieService
