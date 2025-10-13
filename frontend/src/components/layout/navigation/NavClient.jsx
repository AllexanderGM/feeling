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
        classNames={{ badge: styles.badge }}
        color='secondary'
        content=''
        isInvisible={!active}
        placement='top-right'
        shape='circle'>
        {isProfileButton ? (
          <UserProfileMenu
            isActive={active}
            isAdmin={false}
            isOpen={isPopoverOpen}
            placement='top'
            user={user}
            onOpenChange={setIsPopoverOpen}
          />
        ) : (
          <Button
            isIconOnly
            aria-label={item.description}
            className={`${styles.button} ${active ? styles.activeButton : styles.inactiveButton}`}
            color={active ? 'primary' : 'default'}
            radius='lg'
            size='md'
            variant={active ? 'solid' : 'light'}
            onPress={() => navigate(item.path)}>
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
