import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks'
import NavAdmin from '@components/layout/navigation/NavAdmin'
import NavClient from '@components/layout/navigation/NavClient'
import BackgroundEffect from '@components/layout/BackgroundEffect'

const Layout = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // Usar únicamente la nueva estructura del backend
  const isAdmin = user?.status?.role === 'ADMIN'
  const isClient = user?.status?.role === 'CLIENT'
  const hasCompletedSetup = user?.status?.profileComplete && user?.status?.configurationCompleted
  const isNotFoundPage = location.pathname.includes('not-found')

  // Decidir qué navegación renderizar según el rol
  const renderNavigation = () => {
    if (!isAuthenticated || (!hasCompletedSetup && !isAdmin) || isNotFoundPage) {
      return null
    }

    if (isAdmin) {
      return <NavAdmin user={user} />
    } else {
      return <NavClient user={user} />
    }
  }

  return (
    <BackgroundEffect className='flex flex-col min-h-screen relative'>
      <main className={`min-h-screen h-full max-h-fit w-full max-w-7xl p-8 mx-auto ${isAdmin ? 'pb-32' : ''} ${isClient ? 'pb-24' : ''}`}>
        <Outlet />
        {renderNavigation()}
      </main>
    </BackgroundEffect>
  )
}

export default Layout
