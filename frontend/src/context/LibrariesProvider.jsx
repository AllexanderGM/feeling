import { HeroUIProvider } from '@heroui/react'
import { useHref, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CookiesProvider } from 'react-cookie'
import PropTypes from 'prop-types'

const LibrariesProvider = ({ children }) => {
  const navigate = useNavigate()

  return (
    <HelmetProvider>
      <CookiesProvider>
        <HeroUIProvider navigate={navigate} useHref={useHref} locale="es-ES">
          {children}
        </HeroUIProvider>
      </CookiesProvider>
    </HelmetProvider>
  )
}

LibrariesProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default LibrariesProvider
