import { Outlet } from 'react-router-dom'
import BackgroundEffect from '@components/layout/BackgroundEffect'

const AppLayout = () => {
  return (
    <BackgroundEffect>
      <Outlet />
    </BackgroundEffect>
  )
}

export default AppLayout
