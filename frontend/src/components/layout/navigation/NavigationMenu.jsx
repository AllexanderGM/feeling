import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Search, Calendar, User, Star, Users, FileText, MessageSquare, Settings, BarChart3, Shield } from 'lucide-react'
import { Button, Badge, Chip, Avatar } from '@heroui/react'
import { APP_PATHS } from '@constants/paths.js'
import UserProfileMenu from './UserProfileMenu.jsx'

const NavigationMenu = ({ isOpen, onClose, user, isAdmin }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // ========================================
  // CONFIGURACIÓN DE NAVEGACIÓN
  // ========================================

  const basicNavigationItems = [
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
    }
  ]

  // ========================================
  // HANDLERS
  // ========================================

  const handleNavigate = path => {
    navigate(path)
    onClose()
  }

  const isActive = path => {
    if (path === APP_PATHS.ROOT) {
      return location.pathname === APP_PATHS.ROOT
    }
    if (path === APP_PATHS.ADMIN.ROOT) {
      return location.pathname === APP_PATHS.ADMIN.ROOT
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
        content=""
        color="secondary"
        placement="top-right"
        shape="circle"
        isInvisible={!active}
        classNames={{
          badge: 'animate-pulse'
        }}>
        {isProfileButton ? (
          <UserProfileMenu
            user={user}
            isAdmin={isAdmin}
            isOpen={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            onMenuAction={() => onClose()}
            placement="left"
          />
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
            onPress={() => handleNavigate(item.path)}
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
    <div
      className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ease-out transform ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}>
      <div className="bg-background/90 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl py-4 px-3 ring-1 ring-primary-500/10">
        {isAdmin ? (
          // Renderizado para administradores (con secciones separadas)
          <div className="flex flex-col items-center space-y-6">
            {/* Sección de administración */}
            <div className="flex flex-col items-center space-y-2">
              <Chip size="sm" variant="flat" color="default" className="bg-gray-700/50 text-gray-300 text-xs">
                Admin
              </Chip>
              <div className="flex flex-col space-y-2">{adminNavigationItems.map(item => renderNavigationItem(item))}</div>
            </div>

            {/* Separador horizontal */}
            <div className="border-t border-gray-600/30 w-12"></div>

            {/* Sección básica */}
            <div className="flex flex-col items-center space-y-2">
              <Chip size="sm" variant="flat" color="default" className="bg-gray-700/50 text-gray-300 text-xs">
                Nav
              </Chip>
              <div className="flex flex-col space-y-2">{basicNavigationItems.map(item => renderNavigationItem(item))}</div>
            </div>
          </div>
        ) : (
          // Renderizado para usuarios regulares (una sola columna)
          <div className="flex flex-col items-center space-y-2">{basicNavigationItems.map(item => renderNavigationItem(item))}</div>
        )}
      </div>
    </div>
  )
}

export default NavigationMenu
