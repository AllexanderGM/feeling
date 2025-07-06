import { Outlet } from 'react-router-dom'
import useAuth from '@hooks/useAuth.js'
import Nav from '@components/layout/Nav'
import BackgroundEffect from '@components/layout/BackgroundEffect'

const Layout = () => {
  const { user, isAuthenticated } = useAuth()

  console.log(user)

  return (
    <BackgroundEffect className="flex flex-col min-h-screen relative">
      <Outlet />
      {isAuthenticated && (user.profileComplete || user.role?.includes('ADMIN')) ? <Nav /> : null}
    </BackgroundEffect>
  )
}

export default Layout
