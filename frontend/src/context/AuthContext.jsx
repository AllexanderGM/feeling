import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cookies } from 'react-cookie'

import { getCurrentUser, isAuthenticated, logout as logoutService, getAuthToken } from '../services/authService.js'

const AuthContext = createContext()
const cookies = new Cookies()
const API_URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

/**
 * Proveedor de autenticación que maneja el estado de autenticación del usuario
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  /**
   * Verifica si un usuario es administrador
   * @param {Object} userObj - Objeto usuario a verificar
   * @returns {boolean} - true si es admin, false si no
   */
  const isUserAdmin = userObj => {
    if (!userObj) return false
    return userObj.isAdmin === true || (userObj.role && userObj.role.toLowerCase() === 'admin')
  }

  /**
   * Verifica el estado de autenticación al montar el componente
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /**
   * Realiza el cierre de sesión del usuario
   */
  const handleLogout = async () => {
    const token = getAuthToken()
    if (!token) {
      console.error('No se encontró el token de autenticación')
      logoutService()
      setUser(null)
      navigate('/')
      return
    }

    try {
      // Intenta hacer logout en el servidor
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Logout falló en el servidor, procediendo con logout local')
      }
    } catch (error) {
      console.error('Error durante el logout:', error)
    } finally {
      logoutService()
      setUser(null)
      navigate('/')
    }
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   * @param {string} requiredRole - Rol requerido para verificar
   * @returns {boolean} - true si tiene el rol, false si no
   */
  const checkRole = requiredRole => {
    if (!user) return false

    if (requiredRole.toLowerCase() === 'admin') return isUserAdmin(user)

    return true
  }

  /**
   * Actualiza el usuario después de iniciar sesión
   * @param {Object} userData - Datos del usuario logueado
   */
  const handleLogin = userData => {
    setUser(userData)
  }

  // Valores proporcionados por el contexto
  const authContextValue = {
    user,
    loading,
    setUser,
    login: handleLogin,
    logout: handleLogout,
    isAdmin: isUserAdmin(user),
    hasRole: checkRole
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} - El contexto de autenticación
 */
export const useAuth = () => useContext(AuthContext)
