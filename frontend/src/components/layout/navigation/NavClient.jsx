import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Search, Calendar, User, Star } from 'lucide-react'
import { Button, Badge } from '@heroui/react'
import { APP_PATHS } from '@constants/paths.js'
import UserProfileMenu from './UserProfileMenu.jsx'
import { isProfileActive, isActive, getNavigationStyles } from './navigationUtils.js'

const NavClient = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

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

  const styles = getNavigationStyles()

  // ========================================
  // RENDERIZADO DE ELEMENTOS
  // ========================================

  const renderNavigationItem = item => {
    const IconComponent = item.icon
    const isProfileButton = item.id === 'profile'
    const active = isProfileButton ? isProfileActive(location, false, APP_PATHS) : isActive(location, item.path, APP_PATHS)

    return (
      <Badge
        key={item.id}
        content=''
        color='secondary'
        placement='top-right'
        shape='circle'
        isInvisible={!active}
        classNames={{ badge: styles.badge }}>
        {isProfileButton ? (
          <UserProfileMenu
            user={user}
            isAdmin={false}
            isOpen={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            placement='top'
            isActive={active}
          />
        ) : (
          <Button
            isIconOnly
            variant={active ? 'solid' : 'light'}
            color={active ? 'primary' : 'default'}
            radius='lg'
            size='md'
            className={`${styles.button} ${active ? styles.activeButton : styles.inactiveButton}`}
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

  return (
    <>
      {/* Navegación horizontal - siempre visible en todas las páginas */}
      <div className='fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4'>
        <div className={styles.container}>
          <div className='flex items-center space-x-2'>{navigationItems.map(item => renderNavigationItem(item))}</div>
        </div>
      </div>
    </>
  )
}

export default NavClient
