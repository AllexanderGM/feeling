import axios from 'axios'
import { ErrorManager } from '@utils/errorManager'

const API_URL = import.meta.env.VITE_URL_BACK || 'http://localhost:8081'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  error => Promise.reject(error)
)

// Interceptor para responses
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          })

          const newToken = response.data.token
          localStorage.setItem('token', newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    error.errorType = ErrorManager.getErrorType(error)
    error.formattedMessage = ErrorManager.getErrorMessage(error)

    return Promise.reject(error)
  }
)

export default api
