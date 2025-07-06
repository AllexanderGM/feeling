import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Heart,
  Search,
  Calendar,
  User,
  Star,
  Users,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
  UserCircle,
  Bell,
  HelpCircle,
  Shield
} from 'lucide-react'
import {
  Button,
  Badge,
  Chip,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import useUser from '@hooks/useUser.js'
import useAuth from '@hooks/useAuth.js'
import { APP_PATHS } from '@constants/paths.js'

const Nav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const { logout } = useAuth()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { isOpen: isLogoutModalOpen, onOpen: onLogoutModalOpen, onClose: onLogoutModalClose } = useDisclosure()

  // Detectar si el usuario es administrador
  const isAdmin = user?.isAdmin || user?.isSuperAdmin || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

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
  }

  const handleLogoutClick = () => {
    setIsPopoverOpen(false)
    onLogoutModalOpen()
  }

  const handleConfirmLogout = async () => {
    try {
      onLogoutModalClose()
      await logout()
      navigate(APP_PATHS.AUTH.LOGIN)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleMenuAction = action => {
    setIsPopoverOpen(false)
    action()
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
  // CONFIGURACIÓN DEL MENÚ DE USUARIO
  // ========================================

  const getUserMenuItems = () => {
    const baseItems = [
      {
        key: 'profile',
        icon: UserCircle,
        label: 'Ver Perfil',
        action: () => navigate(APP_PATHS.USER.PROFILE)
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Configuración',
        action: () => navigate(APP_PATHS.USER.SETTINGS)
      },
      {
        key: 'notifications',
        icon: Bell,
        label: 'Notificaciones',
        action: () => navigate(APP_PATHS.USER.NOTIFICATIONS)
      },
      {
        key: 'help',
        icon: HelpCircle,
        label: 'Ayuda',
        action: () => navigate(APP_PATHS.GENERAL.HELP)
      }
    ]

    // Agregar opción de panel de admin si es administrador
    if (isAdmin) {
      baseItems.splice(1, 0, {
        key: 'admin-panel',
        icon: Shield,
        label: 'Panel de Admin',
        action: () => navigate(APP_PATHS.ADMIN.ROOT)
      })
    }

    // Agregar logout al final
    baseItems.push({
      key: 'logout',
      icon: LogOut,
      label: 'Cerrar Sesión',
      action: handleLogoutClick,
      isDanger: true
    })

    return baseItems
  }

  // ========================================
  // RENDERIZADO DE ELEMENTOS
  // ========================================

  const renderNavigationItem = item => {
    const IconComponent = item.icon
    const isProfileButton = item.id === 'profile'
    // Para el botón de perfil, verificar si alguna ruta relacionada está activa
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
          <Popover placement="top" backdrop="blur" isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger>
              <Avatar
                src={user?.images?.[user?.selectedProfileImageIndex || 0] || user?.avatar}
                name={user?.name || (isAdmin ? 'Admin' : 'Usuario')}
                size="sm"
                className={`
                  cursor-pointer transition-all duration-300 ease-in-out
                  ${active ? 'transform scale-105 ring-2 ring-primary-500' : 'hover:scale-102'}
                `}
                isBordered={active}
                color={active ? 'primary' : 'default'}
              />
            </PopoverTrigger>
            <PopoverContent className="p-1">
              <div className="w-72">
                {/* Header del usuario */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user?.images?.[user?.selectedProfileImageIndex || 0] || user?.avatar}
                      name={user?.name || (isAdmin ? 'Admin' : 'Usuario')}
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {user?.name} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <Chip className="text-xs text-orange-600 ">
                            <div className="flex items-center gap-1">
                              <Shield size={12} className="text-orange-500" />
                              Administrador
                            </div>
                          </Chip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="py-1">
                  {getUserMenuItems().map((menuItem, index) => {
                    const IconComponent = menuItem.icon
                    const isLastItem = index === getUserMenuItems().length - 1

                    return (
                      <div key={menuItem.key}>
                        {isLastItem && <Divider className="my-1" />}
                        <Button
                          variant="light"
                          startContent={<IconComponent size={16} />}
                          className={`
                            w-full justify-start px-4 py-2 h-10
                            ${menuItem.isDanger ? 'text-danger hover:bg-danger-50' : 'text-gray-400 hover:bg-gray-100'}
                          `}
                          onPress={() => handleMenuAction(menuItem.action)}>
                          {menuItem.label}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

  const renderLogoutModal = () => (
    <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose} backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LogOut size={24} className="text-danger" />
            Cerrar Sesión
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onLogoutModalClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={handleConfirmLogout} startContent={<LogOut size={16} />}>
            Cerrar Sesión
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  if (isAdmin) {
    // Renderizado para administradores (con secciones separadas)
    return (
      <>
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10">
            <div className="flex items-center space-x-6">
              {/* Sección de administración */}
              <div className="flex flex-col items-center space-y-2">
                <Chip size="sm" variant="flat" color="default" className="bg-gray-700/50 text-gray-300 text-xs">
                  Administración
                </Chip>
                <div className="flex space-x-2">{adminNavigationItems.map(item => renderNavigationItem(item))}</div>
              </div>

              {/* Separador vertical */}
              <div className="border-l border-gray-600/30 h-12"></div>

              {/* Sección básica */}
              <div className="flex flex-col items-center space-y-2">
                <Chip size="sm" variant="flat" color="default" className="bg-gray-700/50 text-gray-300 text-xs">
                  Navegación
                </Chip>
                <div className="flex space-x-2">{basicNavigationItems.map(item => renderNavigationItem(item))}</div>
              </div>
            </div>
          </div>
        </div>
        {renderLogoutModal()}
      </>
    )
  } else {
    // Renderizado para usuarios regulares (una sola fila)
    return (
      <>
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10">
            <div className="flex items-center space-x-2">{basicNavigationItems.map(item => renderNavigationItem(item))}</div>
          </div>
        </div>
        {renderLogoutModal()}
      </>
    )
  }
}

export default Nav
