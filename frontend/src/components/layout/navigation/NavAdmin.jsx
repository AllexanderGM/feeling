import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, Users, FileText, MessageSquare, Settings, BarChart3, Package } from 'lucide-react'
import { Button, Badge } from '@heroui/react'
import { APP_PATHS } from '@constants/paths.js'
import UserProfileMenu from './UserProfileMenu.jsx'

const NavAdmin = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // ========================================
  // CONFIGURACIÓN DE NAVEGACIÓN
  // ========================================

  const adminNavigationItems = [
    {
      id: 'admin-dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      path: APP_PATHS.ADMIN.ROOT,
      description: 'Panel de administración principal'
    },
    {
      id: 'admin-users',
      icon: Users,
      label: 'Usuarios',
      path: APP_PATHS.ADMIN.USERS,
      description: 'Gestión de usuarios'
    },
    {
      id: 'admin-events',
      icon: FileText,
      label: 'Eventos',
      path: APP_PATHS.ADMIN.EVENTS,
      description: 'Gestión de eventos'
    },
    {
      id: 'admin-match-plans',
      icon: Package,
      label: 'Planes Match',
      path: APP_PATHS.ADMIN.MATCH_PLANS,
      description: 'Gestión de planes de match'
    },
    {
      id: 'admin-pqr',
      icon: MessageSquare,
      label: 'PQR',
      path: APP_PATHS.ADMIN.REQUESTS,
      description: 'Gestión de peticiones, quejas y reclamos'
    },
    {
      id: 'admin-settings',
      icon: Settings,
      label: 'Configuración',
      path: APP_PATHS.ADMIN.SETTINGS,
      description: 'Configuración de la plataforma'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Perfil',
      path: APP_PATHS.ADMIN.PROFILE,
      description: 'Tu perfil'
    }
  ]

  // ========================================
  // HANDLERS
  // ========================================

  const isActive = path => {
    if (path === APP_PATHS.ADMIN.ROOT) {
      return location.pathname === APP_PATHS.ADMIN.ROOT
    }
    return location.pathname.startsWith(path)
  }

  // Verificar si alguna ruta relacionada con el perfil/usuario está activa
  const isProfileActive = () => {
    const userRelatedPaths = [APP_PATHS.ADMIN.PROFILE, APP_PATHS.ADMIN.SETTINGS, APP_PATHS.GENERAL.HELP]
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
        content=""
        color="secondary"
        placement="top-right"
        shape="circle"
        isInvisible={!active}
        classNames={{
          badge: 'animate-pulse'
        }}>
        {isProfileButton ? (
          <UserProfileMenu user={user} isAdmin={true} isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement="top" />
        ) : (
          <Button
            isIconOnly
            variant={active ? 'solid' : 'light'}
            color={active ? 'primary' : 'default'}
            radius="lg"
            size="md"
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

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4">
      <div className="bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10">
        <div className="flex items-center space-x-2">{adminNavigationItems.map(item => renderNavigationItem(item))}</div>
      </div>
    </div>
  )
}

export default NavAdmin
