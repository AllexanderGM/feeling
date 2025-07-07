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

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="es-ES">
      <HelmetProvider>
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
          <GoogleOAuthProvider clientId={CLIENT_ID}>{children}</GoogleOAuthProvider>
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
