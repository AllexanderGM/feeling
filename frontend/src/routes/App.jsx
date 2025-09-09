import { Outlet } from 'react-router-dom'
import LibrariesProvider from '@context/LibrariesProvider'
import GeneralProvider from '@context/GeneralProvider'
import { RateLimitProvider } from '../contexts/RateLimitContext'

import '@styles/globals.css'

const App = () => {
  return (
    <LibrariesProvider>
      <RateLimitProvider>
        <GeneralProvider>
          <Outlet />
        </GeneralProvider>
      </RateLimitProvider>
    </LibrariesProvider>
  )
}

export default App
