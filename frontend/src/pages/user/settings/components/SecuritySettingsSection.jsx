import { useState } from 'react'
import { Button, Input, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from '@heroui/react'
import { Shield, Key, Smartphone, Eye, EyeOff, CheckCircle, Clock, Save } from 'lucide-react'
import { useUser } from '@hooks'
import { Logger } from '@utils/logger.js'

const SecuritySettingsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onOpenChange: onPasswordOpenChange } = useDisclosure()

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: user?.twoFactorAuth?.enabled ?? false,
    sessionTimeout: user?.sessionTimeout ?? 30,
    loginNotifications: user?.loginNotifications ?? true,
    deviceRestriction: user?.deviceRestriction ?? false
  })

  const { updateUserProfile, changePassword, enable2FA, disable2FA } = useUser()

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')

      return
    }

    try {
      setLoading(true)
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onPasswordOpenChange(false)
    } catch (error) {
      Logger.error('Error changing password:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityUpdate = async () => {
    try {
      setLoading(true)
      await updateUserProfile(securitySettings)
    } catch (error) {
      Logger.error('Error updating security settings:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  const handle2FAToggle = async () => {
    try {
      setLoading(true)
      if (securitySettings.twoFactorAuth) {
        await disable2FA()
      } else {
        await enable2FA()
      }
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorAuth: !prev.twoFactorAuth
      }))
    } catch (error) {
      Logger.error('Error toggling 2FA:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  // Datos simulados de sesiones activas
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome en Windows',
      location: 'Bogotá, Colombia',
      lastActive: '2024-01-15T10:30:00Z',
      current: true
    },
    {
      id: 2,
      device: 'Mobile App iOS',
      location: 'Bogotá, Colombia',
      lastActive: '2024-01-14T15:20:00Z',
      current: false
    }
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Shield className='w-4 h-4 text-red-400' />
          <span className='text-sm font-medium text-gray-200'>Configuración de Seguridad</span>
        </div>
        <Button
          className='bg-primary-600 hover:bg-primary-700'
          color='primary'
          isLoading={loading}
          size='sm'
          startContent={<Save className='w-3 h-3' />}
          variant='solid'
          onPress={handleSecurityUpdate}>
          Guardar
        </Button>
      </div>

      <div className='space-y-4'>
        {/* Contraseña */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Key className='w-4 h-4 text-yellow-400' />
              <span className='text-sm font-medium text-gray-200'>Contraseña</span>
            </div>
            <Button
              className='border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10'
              size='sm'
              variant='bordered'
              onPress={onPasswordOpen}>
              Cambiar contraseña
            </Button>
          </div>

          <div className='text-xs text-gray-400'>
            <p>
              Última actualización:{' '}
              {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString('es-ES') : 'No disponible'}
            </p>
          </div>
        </div>

        {/* Autenticación de dos factores */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <Smartphone className='w-4 h-4 text-green-400' />
              <div>
                <span className='text-sm font-medium text-gray-200'>Autenticación de dos factores</span>
                <p className='text-xs text-gray-400'>Capa adicional de seguridad para tu cuenta</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {securitySettings.twoFactorAuth && (
                <Chip className='text-xs' color='success' size='sm' variant='flat'>
                  Activo
                </Chip>
              )}
              <Switch
                color='success'
                isDisabled={loading}
                isSelected={securitySettings.twoFactorAuth}
                size='sm'
                onValueChange={handle2FAToggle}
              />
            </div>
          </div>

          {!securitySettings.twoFactorAuth && (
            <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-3'>
              <p className='text-orange-300 text-xs'>Recomendamos activar la autenticación de dos factores para mayor seguridad.</p>
            </div>
          )}
        </div>

        {/* Configuraciones de sesión */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Clock className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Gestión de sesiones</span>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <span className='text-sm text-gray-300'>Notificar inicios de sesión</span>
                <p className='text-xs text-gray-400'>Recibir alertas de nuevos accesos</p>
              </div>
              <Switch
                color='primary'
                isSelected={securitySettings.loginNotifications}
                size='sm'
                onValueChange={value =>
                  setSecuritySettings(prev => ({
                    ...prev,
                    loginNotifications: value
                  }))
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <span className='text-sm text-gray-300'>Restringir dispositivos</span>
                <p className='text-xs text-gray-400'>Solo permitir dispositivos autorizados</p>
              </div>
              <Switch
                color='warning'
                isSelected={securitySettings.deviceRestriction}
                size='sm'
                onValueChange={value =>
                  setSecuritySettings(prev => ({
                    ...prev,
                    deviceRestriction: value
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Sesiones activas */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Smartphone className='w-4 h-4 text-purple-400' />
            <span className='text-sm font-medium text-gray-200'>Sesiones activas</span>
          </div>

          <div className='space-y-2'>
            {activeSessions.map(session => (
              <div key={session.id} className='bg-gray-700/30 rounded-lg p-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-300'>{session.device}</span>
                        {session.current && (
                          <Chip className='text-xs' color='success' size='sm' variant='flat'>
                            Actual
                          </Chip>
                        )}
                      </div>
                      <p className='text-xs text-gray-400'>
                        {session.location} • {new Date(session.lastActive).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button className='text-xs' color='danger' size='sm' variant='light'>
                      Cerrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de seguridad */}
        <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <CheckCircle className='w-3 h-3 text-green-400' />
            <span className='text-xs font-medium text-green-300'>Estado de seguridad</span>
          </div>
          <div className='flex flex-wrap gap-1'>
            <Chip className='text-xs' color='success' size='sm' variant='flat'>
              Contraseña fuerte
            </Chip>
            {securitySettings.twoFactorAuth && (
              <Chip className='text-xs' color='success' size='sm' variant='flat'>
                2FA activado
              </Chip>
            )}
            {securitySettings.loginNotifications && (
              <Chip className='text-xs' color='primary' size='sm' variant='flat'>
                Alertas activas
              </Chip>
            )}
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50'
        }}
        isOpen={isPasswordOpen}
        onOpenChange={onPasswordOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Key className='w-5 h-5 text-yellow-400' />
                  <h3 className='text-lg font-bold text-yellow-300'>Cambiar contraseña</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-3'>
                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-700/50'
                    }}
                    endContent={
                      <button className='focus:outline-none' type='button' onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? <EyeOff className='w-4 h-4 text-gray-400' /> : <Eye className='w-4 h-4 text-gray-400' />}
                      </button>
                    }
                    label='Contraseña actual'
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={e =>
                      setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))
                    }
                  />

                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-700/50'
                    }}
                    endContent={
                      <button className='focus:outline-none' type='button' onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff className='w-4 h-4 text-gray-400' /> : <Eye className='w-4 h-4 text-gray-400' />}
                      </button>
                    }
                    label='Nueva contraseña'
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e =>
                      setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))
                    }
                  />

                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-700/50'
                    }}
                    endContent={
                      <button className='focus:outline-none' type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className='w-4 h-4 text-gray-400' /> : <Eye className='w-4 h-4 text-gray-400' />}
                      </button>
                    }
                    label='Confirmar nueva contraseña'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e =>
                      setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))
                    }
                  />

                  <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'>
                    <p className='text-blue-300 text-sm font-medium mb-1'>Requisitos de contraseña:</p>
                    <ul className='text-blue-200 text-xs space-y-1'>
                      <li>• Mínimo 8 caracteres</li>
                      <li>• Al menos una letra mayúscula</li>
                      <li>• Al menos un número</li>
                      <li>• Al menos un carácter especial</li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='primary' isLoading={loading} onPress={handlePasswordChange}>
                  Cambiar contraseña
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default SecuritySettingsSection
