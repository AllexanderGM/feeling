import { Cookies } from 'react-cookie'

const cookies = new Cookies()
const URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8080'

// Simula generación de JWT

export const login = async (email, password) => {
  const configFetch = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  }

  const response = await fetch(`${URL}/auth/login`, configFetch)

  if (!response.ok) {
    let errorMessage = 'Error al iniciar sesión'

    switch (response.status) {
      case 400:
        errorMessage = 'No existe una cuenta con este correo electrónico'
        break
      case 401:
        errorMessage = 'Correo electrónico o contraseña incorrectos'
        break
      case 403:
        errorMessage = 'Tu cuenta ha sido bloqueada. Por favor, contacta al administrador'
        break
      case 404:
        errorMessage = 'No existe una cuenta con este correo electrónico'
        break
      case 500:
        errorMessage = 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde'
        break
      default:
        errorMessage = 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente'
    }

    throw new Error(errorMessage)
  }

  const result = await response.json()

  const authenticatedUser = {
    id: result.id,
    email: result.email,
    name: result.name,
    lastName: result.lastName,
    avatar: result.image,
    role: result.role || 'user',
    isAdmin: result.role === 'ADMIN',
    isSuperAdmin: result.email === 'admin@admin.com'
  }

  const token = result.token
  cookies.set('auth_token', token, { path: '/', maxAge: 86400 }) // 24 horas
  localStorage.setItem('user', JSON.stringify(authenticatedUser))

  return { user: authenticatedUser, token }
}

export const logout = () => {
  cookies.remove('auth_token', { path: '/' })
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  // Comprueba si el token existe
  const token = cookies.get('auth_token')
  if (!token) {
    localStorage.removeItem('user')
    return null
  }

  const user = JSON.parse(userStr)

  user.isAuthenticated = true

  return user
}

export const isAuthenticated = () => {
  return cookies.get('auth_token') !== undefined
}

export const hasRole = requiredRole => {
  const user = getCurrentUser()
  if (!user) return false

  if (requiredRole === 'admin') {
    return user.isAdmin === true || user.role === 'admin'
  }

  return true
}

export const register = async userData => {
  const newUser = {
    image: userData.avatar,
    name: userData.name,
    lastName: userData.lastName,
    document: '123456789',
    phone: '300123456',
    dateOfBirth: '1990-05-15',
    email: userData.email,
    password: userData.password,
    address: 'Calle 123 #45-67',
    city: 'Bogotá'
  }

  const response = await fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUser)
  })

  if (!response.ok) {
    console.log(`API Error: ${response.status} ${response.statusText}`)
    throw new Error(`Registration failed: ${response.status}`)
  }

  const result = await response.json()

  return result.message
}

export const getAuthToken = () => cookies.get('auth_token')
