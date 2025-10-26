import { Outlet } from 'react-router-dom'
import ScrollToTop from '@components/layout/navigation/ScrollToTop.jsx'
import LibrariesProvider from '@contexts/LibrariesProvider'
import GeneralProvider from '@contexts/GeneralProvider'
import { RateLimitProvider } from '@contexts/RateLimitContext'

import '@styles/globals.css'

const App = () => {
  return (
    <LibrariesProvider>
      <RateLimitProvider>
        <GeneralProvider>
          <ScrollToTop />
          <Outlet />
        </GeneralProvider>
      </RateLimitProvider>
    </LibrariesProvider>
  )
}

export default App
