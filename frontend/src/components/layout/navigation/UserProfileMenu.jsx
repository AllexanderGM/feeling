import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle, Settings, HelpCircle, Shield, ShoppingCart } from 'lucide-react'
import {
  Button,
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
import { useAuth } from '@hooks'
import { APP_PATHS } from '@constants/paths.js'
import { Logger } from '@utils/logger.js'
import { getUserName, getUserFullName, getUserEmail, getUserAvatar } from '@schemas'

import imgProfile from '/profile.png'

const UserProfileMenu = ({ user, isAdmin, isOpen, onOpenChange, onMenuAction, placement = 'top', isActive = false }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isOpen: isLogoutModalOpen, onOpen: onLogoutModalOpen, onClose: onLogoutModalClose } = useDisclosure()

  // Obtener datos del usuario usando accessors individuales
  const displayName = getUserName(user) || (isAdmin ? 'Admin' : 'Usuario')
  const fullName = getUserFullName(user) || displayName
  const email = getUserEmail(user)
  const avatar = getUserAvatar(user, imgProfile)

  // ========================================
  // HANDLERS
  // ========================================

  const handleLogoutClick = () => {
    onOpenChange(false)
    onLogoutModalOpen()
  }

  const handleConfirmLogout = async () => {
    try {
      onLogoutModalClose()
      await logout()
      navigate(APP_PATHS.AUTH.LOGIN)
    } catch (error) {
      Logger.error('Error al cerrar sesión', Logger.CATEGORIES.USER, { userId: user?.id, error: error.message })
    }
  }

  const handleMenuAction = action => {
    onOpenChange(false)
    if (onMenuAction) onMenuAction()
    action()
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
        action: () => navigate(isAdmin ? APP_PATHS.ADMIN.PROFILE : APP_PATHS.USER.PROFILE)
      },
      {
        key: 'settings',
        icon: Settings,
        label: 'Configuración',
        action: () => navigate(isAdmin ? APP_PATHS.ADMIN.SETTINGS_PROFILE : APP_PATHS.USER.SETTINGS)
      }
    ]

    // Agregar "Comprar Intentos" solo para clientes (no admin)
    if (!isAdmin) {
      baseItems.push({
        key: 'purchase',
        icon: ShoppingCart,
        label: 'Comprar Intentos',
        action: () => navigate(APP_PATHS.USER.PURCHASE_PLANS),
        isPremium: true
      })
    }

    // Agregar Ayuda
    baseItems.push({
      key: 'help',
      icon: HelpCircle,
      label: 'Ayuda',
      action: () => navigate(isAdmin ? APP_PATHS.ADMIN.HELP : APP_PATHS.GENERAL.HELP)
    })

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
  // RENDERIZADO
  // ========================================

  return (
    <>
      <Popover backdrop='blur' isOpen={isOpen} placement={placement} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Avatar
            className={`
              cursor-pointer transition-all duration-300 ease-in-out hover:scale-105
              ${isOpen ? 'ring-2 ring-primary-400 ring-offset-2' : ''}
            `}
            color={isActive ? 'primary' : 'default'}
            isBordered={true}
            name={displayName}
            size='sm'
            src={avatar}
          />
        </PopoverTrigger>
        <PopoverContent className='p-1'>
          <div className='w-72'>
            {/* Header del usuario */}
            <div className='px-4 py-3 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <Avatar className='flex-shrink-0' name={displayName} size='md' src={avatar} />
                <div className='flex flex-col flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-200 truncate'>{fullName}</p>
                  <p className='text-xs text-gray-500 truncate'>{email}</p>
                  {isAdmin && (
                    <div className='flex items-center gap-1 mt-1'>
                      <Chip className='text-xs text-orange-600 '>
                        <div className='flex items-center gap-1'>
                          <Shield className='text-orange-500' size={12} />
                          Administrador
                        </div>
                      </Chip>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className='py-1'>
              {getUserMenuItems().map((menuItem, index) => {
                const IconComponent = menuItem.icon
                const isLastItem = index === getUserMenuItems().length - 1

                return (
                  <div key={menuItem.key}>
                    {isLastItem && <Divider className='my-1' />}
                    <Button
                      className={`
                        w-full justify-start px-4 py-2 h-10
                        ${
                          menuItem.isPremium
                            ? 'bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 hover:from-primary-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-primary-500/20'
                            : menuItem.isDanger
                              ? 'text-danger hover:bg-danger-50'
                              : 'text-gray-400 hover:bg-gray-100'
                        }
                      `}
                      startContent={
                        menuItem.isPremium ? (
                          <div className='relative'>
                            <IconComponent className='text-primary-400' size={16} />
                            <div className='absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse' />
                          </div>
                        ) : (
                          <IconComponent size={16} />
                        )
                      }
                      variant='light'
                      onPress={() => handleMenuAction(menuItem.action)}>
                      <span
                        className={
                          menuItem.isPremium
                            ? 'text-transparent bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text font-semibold'
                            : ''
                        }>
                        {menuItem.label}
                      </span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Modal de confirmación de logout */}
      <Modal backdrop='blur' isOpen={isLogoutModalOpen} onClose={onLogoutModalClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <LogOut className='text-danger' size={24} />
              Cerrar Sesión
            </div>
          </ModalHeader>
          <ModalBody>
            <p className='text-gray-600'>
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onLogoutModalClose}>
              Cancelar
            </Button>
            <Button color='danger' startContent={<LogOut size={16} />} onPress={handleConfirmLogout}>
              Cerrar Sesión
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UserProfileMenu
