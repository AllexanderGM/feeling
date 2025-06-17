import { Outlet } from 'react-router-dom'
import LibrariesProvider from '@context/LibrariesProvider'
import GeneralProvider from '@context/GeneralProvider'

import '@styles/globals.css'

const App = () => {
  return (
    <LibrariesProvider>
      <GeneralProvider>
        <Outlet />
      </GeneralProvider>
    </LibrariesProvider>
  )
}

export default App
