import { Outlet } from 'react-router-dom'
import BackgroundEffect from '@components/layout/BackgroundEffect'

const Layout = () => {
  return (
    <BackgroundEffect>
      <Outlet />
    </BackgroundEffect>
  )
}

export default Layout
