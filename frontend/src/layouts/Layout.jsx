import { Outlet, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth.js'
import Nav from '@components/layout/Nav'
import BackgroundEffect from '@components/layout/BackgroundEffect'

const Layout = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const isAdmin = user?.isAdmin || user?.isSuperAdmin || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isClient = user?.role === 'CLIENT'
  const isNotFoundPage = location.pathname.includes('not-found')

  return (
    <BackgroundEffect className={`flex flex-col min-h-screen relative`}>
      <main className={`h-full max-h-fit w-full max-w-7xl px-8 py-14 ${isAdmin ? 'pb-32' : ''} ${isClient ? 'pb-24' : ''}`}>
        <Outlet />
        {isAuthenticated && (user.profileComplete || isAdmin) && !isNotFoundPage ? <Nav /> : null}
      </main>
    </BackgroundEffect>
  )
}

export default Layout
