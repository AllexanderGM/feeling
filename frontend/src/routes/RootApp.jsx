import { Outlet } from 'react-router-dom'
import LibrariesProvider from '@context/LibrariesProvider'
import GeneralProvider from '@context/GeneralProvider'

import '@styles/_tailwind.scss'
import '@styles/global.scss'

const RootApp = () => {
  return (
    <LibrariesProvider>
      <GeneralProvider>
        <Outlet />
      </GeneralProvider>
    </LibrariesProvider>
  )
}

export default RootApp
