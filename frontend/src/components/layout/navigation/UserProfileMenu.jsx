import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle, Settings, HelpCircle, Shield } from 'lucide-react'
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

import imgProfile from '/profile.png'

const UserProfileMenu = ({ user, isAdmin, isOpen, onOpenChange, onMenuAction, placement = 'top' }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isOpen: isLogoutModalOpen, onOpen: onLogoutModalOpen, onClose: onLogoutModalClose } = useDisclosure()

  // ========================================
  // HELPERS PARA NUEVA ESTRUCTURA DE USUARIO
  // ========================================

  const getUserData = () => {
    // Si el usuario tiene la nueva estructura organizada
    if (user?.profile) {
      return {
        name: user.profile.name,
        lastName: user.profile.lastName,
        email: user.profile.email,
        images: user.profile.images || [],
        displayName: user.profile.name || (isAdmin ? 'Admin' : 'Usuario'),
        fullName: `${user.profile.name || ''} ${user.profile.lastName || ''}`.trim(),
        avatar: user.profile.images?.[0] || imgProfile
      }
    }

    // Fallback para estructura legacy o datos incompletos
    return {
      name: user?.name,
      lastName: user?.lastName,
      email: user?.email,
      images: user?.images || [],
      displayName: user?.name || (isAdmin ? 'Admin' : 'Usuario'),
      fullName: `${user?.name || ''} ${user?.lastName || ''}`.trim(),
      avatar: user?.images?.[0] || user?.avatar || imgProfile
    }
  }

  const userData = getUserData()

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
      },
      {
        key: 'help',
        icon: HelpCircle,
        label: 'Ayuda',
        action: () => navigate(isAdmin ? APP_PATHS.ADMIN.HELP : APP_PATHS.GENERAL.HELP)
      }
    ]

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
      <Popover placement={placement} backdrop='blur' isOpen={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Avatar
            src={userData.avatar}
            name={userData.displayName}
            size='sm'
            className={`
              cursor-pointer transition-all duration-300 ease-in-out
              hover:scale-102
            `}
            isBordered={false}
            color='default'
          />
        </PopoverTrigger>
        <PopoverContent className='p-1'>
          <div className='w-72'>
            {/* Header del usuario */}
            <div className='px-4 py-3 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <Avatar src={userData.avatar} name={userData.displayName} size='md' className='flex-shrink-0' />
                <div className='flex flex-col flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-200 truncate'>{userData.fullName}</p>
                  <p className='text-xs text-gray-500 truncate'>{userData.email}</p>
                  {isAdmin && (
                    <div className='flex items-center gap-1 mt-1'>
                      <Chip className='text-xs text-orange-600 '>
                        <div className='flex items-center gap-1'>
                          <Shield size={12} className='text-orange-500' />
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
                      variant='light'
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

      {/* Modal de confirmación de logout */}
      <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose} backdrop='blur'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <LogOut size={24} className='text-danger' />
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
            <Button color='danger' onPress={handleConfirmLogout} startContent={<LogOut size={16} />}>
              Cerrar Sesión
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UserProfileMenu
