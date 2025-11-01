import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Calendar, User, Star, Users } from 'lucide-react'
import { Button, Badge, Tooltip } from '@heroui/react'
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
      id: 'favorites',
      icon: Star,
      label: 'Favoritos',
      path: APP_PATHS.USER.FAVORITES,
      description: 'Tus favoritos'
    },
    {
      id: 'matches',
      icon: Users,
      label: 'Matches',
      path: APP_PATHS.USER.MY_MATCHES,
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
        <Tooltip showArrow content={item.description} delay={200} placement='top'>
          {isProfileButton ? (
            <div>
              <UserProfileMenu
                isActive={active}
                isAdmin={false}
                isOpen={isPopoverOpen}
                placement='top'
                user={user}
                onOpenChange={setIsPopoverOpen}
              />
            </div>
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
        </Tooltip>
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
