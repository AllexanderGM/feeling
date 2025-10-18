export const API_URL = import.meta.env.VITE_URL_BACK || 'https://api.feeling.app'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Calcular maxAge desde JWT_REFRESH_EXPIRATION (milisegundos a segundos)
const JWT_REFRESH_MS = parseInt(import.meta.env.VITE_JWT_REFRESH_EXPIRATION || '2592000000', 10) // 30 días por defecto
const COOKIE_MAX_AGE = Math.floor(JWT_REFRESH_MS / 1000) // Convertir ms a segundos

export const COOKIE_OPTIONS = {
  path: '/',
  secure: import.meta.env.VITE_ENV === 'production',
  sameSite: 'strict',
  maxAge: COOKIE_MAX_AGE // Sincronizado con JWT_REFRESH_EXPIRATION del backend
}
