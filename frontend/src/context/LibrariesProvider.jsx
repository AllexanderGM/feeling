import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from '@heroui/toast'
import { useHref, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import PropTypes from 'prop-types'

const LibrariesProvider = ({ children }) => {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const navigate = useNavigate()

  // Si no hay client_id, usar un valor por defecto para evitar el crash
  const safeClientId = CLIENT_ID || '884262150346-gi86tg7mmpuh58b8sk1l8uc53qbukq5g.apps.googleusercontent.com'

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="es-ES" skipFramerMotionAnimations={false} disableRipple={false}>
      <HelmetProvider>
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
          <GoogleOAuthProvider clientId={safeClientId}>{children}</GoogleOAuthProvider>
        </CookiesProvider>
      </HelmetProvider>
      <ToastProvider />
    </HeroUIProvider>
  )
}

LibrariesProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default LibrariesProvider
