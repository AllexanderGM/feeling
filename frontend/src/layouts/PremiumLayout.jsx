import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks'
import NavAdmin from '@components/layout/navigation/NavAdmin'
import NavClient from '@components/layout/navigation/NavClient'
import BackgroundPremiumEffect from '@components/layout/BackgroundPremiumEffect'

/**
 * Layout Premium con efectos visuales especiales
 * Usado para páginas premium como compra de paquetes, checkout, etc.
 * Incluye el mismo sistema de navegación que el Layout principal
 */
const PremiumLayout = () => {
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
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col'>
      {/* Efectos de fondo premium */}
      <BackgroundPremiumEffect />

      {/* Contenido principal con z-index para estar sobre el fondo */}
      <main
        className={`relative z-10 min-h-screen h-full max-h-fit w-full max-w-7xl p-8 mx-auto ${isAdmin ? 'pb-32' : ''} ${isClient ? 'pb-24' : ''}`}>
        <Outlet />
        {renderNavigation()}
      </main>
    </div>
  )
}

export default PremiumLayout
