export const API_URL = import.meta.env.VITE_URL_BACK || 'https://api.feeling.app'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const COOKIE_OPTIONS = {
  path: '/',
  secure: import.meta.env.VITE_ENV === 'production',
  sameSite: 'strict'
}
