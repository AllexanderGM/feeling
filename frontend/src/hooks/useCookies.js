import { useMemo, useCallback } from 'react'
import { useCookies as useReactCookies } from 'react-cookie'
import { COOKIE_OPTIONS } from '@config/config'

/**
 * Hook unificado para manejo completo de cookies
 * Incluye operaciones básicas y valores reactivos
 */
export const useCookies = () => {
  const [cookies, setCookie, removeCookie] = useReactCookies()

  // ========================================
  // OPERACIONES BÁSICAS DE COOKIES
  // ========================================

  const get = useCallback(
    name => {
      try {
        const value = cookies[name]

        if (value === undefined || value === 'undefined' || value === null) {
          return null
        }

        // Parsing especial para user
        if (name === 'user' && typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            return parsed && typeof parsed === 'object' ? parsed : null
          } catch (error) {
            console.warn(`Cookie '${name}' corrupta, eliminando...`, error.message)
            removeCookie(name, { path: '/' })
            return null
          }
        }

        // Parsing automático para JSON
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            return typeof parsed === 'object' && parsed !== null ? parsed : value
          } catch {
            return value
          }
        }

        return value
      } catch (error) {
        console.warn(`Error obteniendo cookie '${name}':`, error.message)
        return null
      }
    },
    [cookies, removeCookie]
  )

  const set = useCallback(
    (name, value, options = null) => {
      try {
        const cookieOptions = options || COOKIE_OPTIONS
        const valueToSave = typeof value === 'object' && value !== null ? JSON.stringify(value) : value

        setCookie(name, valueToSave, cookieOptions)
        return true
      } catch (error) {
        console.error(`Error guardando cookie '${name}':`, error.message)
        return false
      }
    },
    [setCookie]
  )

  const remove = useCallback(
    (name, options = null) => {
      try {
        const removeOptions = options || { path: '/' }
        removeCookie(name, removeOptions)
        return true
      } catch (error) {
        console.error(`Error eliminando cookie '${name}':`, error.message)
        return false
      }
    },
    [removeCookie]
  )

  const exists = useCallback(
    name => {
      const value = cookies[name]
      return value !== undefined && value !== null && value !== 'undefined'
    },
    [cookies]
  )

  const update = useCallback(
    (name, updates) => {
      try {
        const currentValue = get(name)

        if (currentValue && typeof currentValue === 'object') {
          const updatedValue = { ...currentValue, ...updates }
          return set(name, updatedValue)
        } else {
          console.warn(`No se puede actualizar cookie '${name}': no es un objeto o no existe`)
          return false
        }
      } catch (error) {
        console.error(`Error actualizando cookie '${name}':`, error.message)
        return false
      }
    },
    [get, set]
  )

  const getWithDefault = useCallback(
    (name, defaultValue) => {
      const value = get(name)
      return value !== null ? value : defaultValue
    },
    [get]
  )

  const clearAuthCookies = useCallback(() => {
    const authCookies = ['access_token', 'refresh_token', 'user']
    const results = {
      successful: [],
      failed: []
    }

    authCookies.forEach(cookieName => {
      if (remove(cookieName)) {
        results.successful.push(cookieName)
      } else {
        results.failed.push(cookieName)
      }
    })

    return results
  }, [remove])

  const getAll = useCallback(() => {
    return { ...cookies }
  }, [cookies])

  // ========================================
  // UTILIDADES Y HELPERS
  // ========================================

  const createAuthServiceHandler = useCallback(
    () => ({
      get: name => get(name),
      set: (name, value, options) => set(name, value, options),
      remove: (name, options) => remove(name, options)
    }),
    [get, set, remove]
  )

  const useValue = useCallback(
    (cookieName, defaultValue = null) => {
      if (!cookieName) return defaultValue

      try {
        return getWithDefault(cookieName, defaultValue)
      } catch (error) {
        console.warn(`Error obteniendo valor de cookie '${cookieName}':`, error.message)
        return defaultValue
      }
    },
    [getWithDefault]
  )

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
      clearAuthCookies,
      getAll,

      // Utilidades
      createAuthServiceHandler,
      useValue,

      // Acceso directo
      allCookies: cookies,
      isInitialized: true
    }),
    [cookies]
  )

  return api
}

export default useCookies
