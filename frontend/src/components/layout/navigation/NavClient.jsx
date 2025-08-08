import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Search, Calendar, User, Star } from 'lucide-react'
import { Button, Badge } from '@heroui/react'
import { APP_PATHS } from '@constants/paths.js'
import MatchControls from './MatchControls.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

const NavClient = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isNavHidden, setIsNavHidden] = useState(true) // Inicialmente oculto en Home
  const [showMatchControls, setShowMatchControls] = useState(false)

  // Mostrar controles de match solo en página de Home
  useEffect(() => {
    const isHomePage = location.pathname === APP_PATHS.ROOT
    setShowMatchControls(isHomePage)
    setIsNavHidden(isHomePage)
  }, [location.pathname])

  // ========================================
  // CONFIGURACIÓN DE NAVEGACIÓN
  // ========================================

  const navigationItems = [
    {
      id: 'home',
      icon: Heart,
      label: 'Inicio',
      path: APP_PATHS.ROOT,
      description: 'Página principal'
    },
    {
      id: 'search',
      icon: Search,
      label: 'Buscar',
      path: APP_PATHS.USER.SEARCH,
      description: 'Buscar usuarios'
    },
    {
      id: 'matches',
      icon: Star,
      label: 'Matches',
      path: APP_PATHS.USER.MATCHES,
      description: 'Tus matches'
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Eventos',
      path: APP_PATHS.USER.EVENTS,
      description: 'Eventos disponibles'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Perfil',
      path: APP_PATHS.USER.PROFILE,
      description: 'Tu perfil'
    }
  ]

  // ========================================
  // HANDLERS
  // ========================================

  const isActive = path => {
    if (path === APP_PATHS.ROOT) {
      return location.pathname === APP_PATHS.ROOT
    }
    return location.pathname.startsWith(path)
  }

  // Verificar si alguna ruta relacionada con el perfil/usuario está activa
  const isProfileActive = () => {
    const userRelatedPaths = [APP_PATHS.USER.PROFILE, APP_PATHS.USER.SETTINGS, APP_PATHS.USER.NOTIFICATIONS, APP_PATHS.GENERAL.HELP]
    return userRelatedPaths.some(path => location.pathname === path || location.pathname.startsWith(path))
  }

  // ========================================
  // RENDERIZADO DE ELEMENTOS
  // ========================================

  const renderNavigationItem = item => {
    const IconComponent = item.icon
    const isProfileButton = item.id === 'profile'
    const active = isProfileButton ? isProfileActive() : isActive(item.path)

    return (
      <Badge
        key={item.id}
        content=''
        color='secondary'
        placement='top-right'
        shape='circle'
        isInvisible={!active}
        classNames={{
          badge: 'animate-pulse'
        }}>
        {isProfileButton ? (
          <UserProfileMenu user={user} isAdmin={false} isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement='top' />
        ) : (
          <Button
            isIconOnly
            variant={active ? 'solid' : 'light'}
            color={active ? 'primary' : 'default'}
            radius='lg'
            size='md'
            className={`
              transition-all duration-300 ease-in-out
              ${active ? 'transform scale-105' : 'hover:scale-102'}
            `}
            onPress={() => navigate(item.path)}
            aria-label={item.description}>
            <IconComponent size={20} />
          </Button>
        )}
      </Badge>
    )
  }

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  const isHomePage = location.pathname === APP_PATHS.ROOT

  return (
    <>
      {/* Navegación vertical en Home - Solo si no está oculta */}
      {isHomePage && !isNavHidden && (
        <div className='fixed left-6 top-1/2 transform -translate-y-1/2 z-50 py-4 transition-all duration-700 ease-in-out transform translate-x-0 opacity-100 scale-100'>
          <div className='bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-3 py-4 ring-1 ring-primary-500/10'>
            <div className='flex flex-col items-center space-y-2'>{navigationItems.map(item => renderNavigationItem(item))}</div>
          </div>
        </div>
      )}

      {/* Navegación horizontal normal fuera de Home */}
      {!isHomePage && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 transition-all duration-700 ease-in-out ${
            isNavHidden
              ? 'transform translate-y-20 opacity-0 scale-95 pointer-events-none'
              : 'transform translate-y-0 opacity-100 scale-100'
          }`}>
          <div className='bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10'>
            <div className='flex items-center space-x-2'>{navigationItems.map(item => renderNavigationItem(item))}</div>
          </div>
        </div>
      )}

      {/* Controles de match - solo en página Home */}
      {showMatchControls && (
        <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 px-4'>
          <MatchControls user={user} isAdmin={false} />
        </div>
      )}
    </>
  )
}

export default NavClient
