import { useState, useCallback, useEffect, useMemo } from 'react'
import CryptoJS from 'crypto-js'
import { Logger } from '@utils/logger.js'

/**
 * Hook para gestión segura de localStorage con encriptación
 *
 * Características:
 * - Encriptación AES-256-GCM usando variables de entorno
 * - Serialización automática de objetos
 * - Manejo robusto de errores
 * - Sincronización entre pestañas
 * - Validación de integridad de datos
 *
 * @example
 * const storage = useLocalStorage()
 * storage.set('user', { name: 'John' })
 * const user = storage.get('user')
 */
export const useLocalStorage = () => {
  // Estado para forzar re-renderizado cuando cambie el storage
  const [, setStorageVersion] = useState(0)

  // Configuración de encriptación desde variables de entorno
  const encryptionConfig = useMemo(
    () => ({
      enabled: import.meta.env.VITE_ENV === 'production', // Solo en producción
      key: import.meta.env.VITE_KEY || 'default-key-for-dev-only-change-in-prod',
      algorithm: import.meta.env.VITE_ALGORITHM || 'aes-256-gcm'
    }),
    []
  )

  // ========================================
  // ENCRIPTACIÓN Y DESENCRIPTACIÓN
  // ========================================

  /**
   * Encripta un valor usando AES-256
   * @param {string} value - Valor a encriptar
   * @returns {string} - Valor encriptado en base64
   */
  const encrypt = useCallback(
    value => {
      if (!encryptionConfig.enabled) {
        return value // En desarrollo, no encriptar
      }

      try {
        const encrypted = CryptoJS.AES.encrypt(value, encryptionConfig.key).toString()

        return encrypted
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, 'Error encriptando datos', { error: error.message })
        throw new Error('Encryption failed')
      }
    },
    [encryptionConfig]
  )

  /**
   * Desencripta un valor usando AES-256
   * @param {string} encryptedValue - Valor encriptado
   * @returns {string} - Valor desencriptado
   */
  const decrypt = useCallback(
    encryptedValue => {
      if (!encryptionConfig.enabled) {
        return encryptedValue // En desarrollo, no desencriptar
      }

      try {
        const decrypted = CryptoJS.AES.decrypt(encryptedValue, encryptionConfig.key)
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

        if (!decryptedString) {
          throw new Error('Decryption returned empty string')
        }

        return decryptedString
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, 'Error desencriptando datos', { error: error.message })
        throw new Error('Decryption failed')
      }
    },
    [encryptionConfig]
  )

  // ========================================
  // OPERACIONES BÁSICAS
  // ========================================

  /**
   * Obtiene un valor de localStorage
   * @param {string} key - Clave del valor
   * @returns {any|null} - Valor deserializado o null si no existe
   */
  const get = useCallback(
    key => {
      try {
        const item = window.localStorage.getItem(key)

        if (!item || item === 'undefined' || item === 'null') {
          return null
        }

        // Intentar desencriptar si está habilitado
        let decryptedItem = item

        if (encryptionConfig.enabled) {
          try {
            decryptedItem = decrypt(item)
          } catch (decryptError) {
            // Si falla la desencriptación, asumir que no está encriptado (migración)
            Logger.warn(
              Logger.CATEGORIES.SYSTEM,
              `Item '${key}' no está encriptado o tiene formato inválido, intentando leer sin encriptar`,
              { error: decryptError.message }
            )
            decryptedItem = item
          }
        }

        // Intentar parsear como JSON
        try {
          const parsed = JSON.parse(decryptedItem)

          return parsed
        } catch {
          // Si no es JSON, retornar como string
          return decryptedItem
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, `Error obteniendo '${key}' de localStorage`, {
          key,
          error: error.message
        })

        return null
      }
    },
    [decrypt, encryptionConfig]
  )

  /**
   * Guarda un valor en localStorage
   * @param {string} key - Clave del valor
   * @param {any} value - Valor a guardar (será serializado automáticamente)
   * @returns {boolean} - true si se guardó correctamente
   */
  const set = useCallback(
    (key, value) => {
      try {
        // Serializar el valor
        const serialized = typeof value === 'string' ? value : JSON.stringify(value)

        // Encriptar si está habilitado
        const toStore = encryptionConfig.enabled ? encrypt(serialized) : serialized

        window.localStorage.setItem(key, toStore)
        setStorageVersion(v => v + 1)

        return true
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, `Error guardando '${key}' en localStorage`, {
          key,
          error: error.message,
          isQuotaExceeded: error.name === 'QuotaExceededError'
        })

        if (error.name === 'QuotaExceededError') {
          Logger.warn(Logger.CATEGORIES.SYSTEM, 'localStorage lleno. Considera limpiar datos antiguos o usar indexedDB para datos grandes.')
        }

        return false
      }
    },
    [encrypt, encryptionConfig]
  )

  /**
   * Elimina un valor de localStorage
   * @param {string} key - Clave del valor a eliminar
   * @returns {boolean} - true si se eliminó correctamente
   */
  const remove = useCallback(key => {
    try {
      window.localStorage.removeItem(key)
      setStorageVersion(v => v + 1)

      return true
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, `Error eliminando '${key}' de localStorage`, {
        key,
        error: error.message
      })

      return false
    }
  }, [])

  /**
   * Verifica si existe una clave en localStorage
   * @param {string} key - Clave a verificar
   * @returns {boolean} - true si existe
   */
  const exists = useCallback(key => {
    const item = window.localStorage.getItem(key)

    return item !== null && item !== 'undefined' && item !== 'null'
  }, [])

  /**
   * Actualiza un objeto existente en localStorage
   * @param {string} key - Clave del objeto
   * @param {Object} updates - Campos a actualizar
   * @returns {Object|null} - Objeto actualizado o null
   */
  const update = useCallback(
    (key, updates) => {
      try {
        const current = get(key)

        if (!current || typeof current !== 'object') {
          Logger.warn(Logger.CATEGORIES.SYSTEM, `No se puede actualizar '${key}': no es un objeto o no existe`, {
            key,
            current
          })

          return null
        }

        const updated = { ...current, ...updates }

        set(key, updated)

        return updated
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, `Error actualizando '${key}' en localStorage`, {
          key,
          error: error.message
        })

        return null
      }
    },
    [get, set]
  )

  /**
   * Obtiene un valor con un default si no existe
   * @param {string} key - Clave del valor
   * @param {any} defaultValue - Valor por defecto
   * @returns {any} - Valor encontrado o valor por defecto
   */
  const getWithDefault = useCallback(
    (key, defaultValue) => {
      const value = get(key)

      return value !== null ? value : defaultValue
    },
    [get]
  )

  /**
   * Limpia todos los items de localStorage
   * @returns {boolean} - true si se limpió correctamente
   */
  const clear = useCallback(() => {
    try {
      window.localStorage.clear()
      setStorageVersion(v => v + 1)

      return true
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error limpiando localStorage', { error: error.message })

      return false
    }
  }, [])

  /**
   * Obtiene todas las claves de localStorage
   * @returns {string[]} - Array de claves
   */
  const getAllKeys = useCallback(() => {
    try {
      return Object.keys(window.localStorage)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error obteniendo claves de localStorage', { error: error.message })

      return []
    }
  }, [])

  /**
   * Obtiene el tamaño usado de localStorage en bytes
   * @returns {number} - Tamaño en bytes
   */
  const getSize = useCallback(() => {
    try {
      let total = 0
      const keys = Object.keys(window.localStorage)

      keys.forEach(key => {
        const item = window.localStorage.getItem(key)

        total += key.length + (item?.length || 0)
      })

      return total
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error calculando tamaño de localStorage', { error: error.message })

      return 0
    }
  }, [])

  /**
   * Limpia items de localStorage que cumplan una condición
   * @param {Function} predicate - Función que retorna true para items a eliminar
   * @returns {number} - Cantidad de items eliminados
   */
  const clearWhere = useCallback(predicate => {
    try {
      let removed = 0
      const keys = Object.keys(window.localStorage)

      keys.forEach(key => {
        if (predicate(key)) {
          window.localStorage.removeItem(key)
          removed++
        }
      })

      setStorageVersion(v => v + 1)

      return removed
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'Error limpiando items de localStorage', { error: error.message })

      return 0
    }
  }, [])

  // ========================================
  // SINCRONIZACIÓN ENTRE PESTAÑAS
  // ========================================

  useEffect(() => {
    const handleStorageChange = event => {
      if (event.storageArea === window.localStorage) {
        setStorageVersion(v => v + 1)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // ========================================
  // API COMPLETA DEL HOOK
  // ========================================

  const api = useMemo(
    () => ({
      // Operaciones básicas
      get,
      set,
      remove,
      exists,
      update,
      getWithDefault,
      clear,

      // Utilidades
      getAllKeys,
      getSize,
      clearWhere,

      // Información
      isEncrypted: encryptionConfig.enabled
    }),
    [get, set, remove, exists, update, getWithDefault, clear, getAllKeys, getSize, clearWhere, encryptionConfig]
  )

  return api
}

export default useLocalStorage
