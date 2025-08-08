import { useState } from 'react'
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip } from '@heroui/react'
import { User, Mail, Phone, Calendar, MapPin, Trash2, AlertTriangle, Download, Database, Save } from 'lucide-react'
import { useUser } from '@hooks'
import { Logger } from '@utils/logger.js'

const AccountSettingsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure()
  const { isOpen: isDataOpen, onOpen: onDataOpen, onOpenChange: onDataOpenChange } = useDisclosure()

  const [accountData, setAccountData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || ''
  })

  const { updateUserProfile, deleteUserAccount, exportUserData } = useUser()

  const handleAccountUpdate = async () => {
    try {
      setLoading(true)
      await updateUserProfile(accountData)
    } catch (error) {
      Logger.error('Error updating account settings:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      await deleteUserAccount()
      // Redirigir al usuario después de eliminar la cuenta
      window.location.href = '/auth/login'
    } catch (error) {
      Logger.error('Error deleting account:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      await exportUserData()
      // El archivo se descargará automáticamente
    } catch (error) {
      Logger.error('Error exporting data:', error, { category: Logger.CATEGORIES.USER })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <User className='w-4 h-4 text-purple-400' />
          <span className='text-sm font-medium text-gray-200'>Configuración de Cuenta</span>
        </div>
        <Button
          size='sm'
          variant='solid'
          color='primary'
          className='bg-primary-600 hover:bg-primary-700'
          startContent={<Save className='w-3 h-3' />}
          onPress={handleAccountUpdate}
          isLoading={loading}>
          Guardar
        </Button>
      </div>

      <div className='space-y-4'>
        {/* Información de contacto */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Mail className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Información de contacto</span>
          </div>

          <div className='space-y-3'>
            <Input
              size='sm'
              label='Email'
              value={accountData.email}
              onChange={e => setAccountData(prev => ({ ...prev, email: e.target.value }))}
              startContent={<Mail className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-700/50'
              }}
            />

            <Input
              size='sm'
              label='Teléfono (opcional)'
              value={accountData.phone}
              onChange={e => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
              startContent={<Phone className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-700/50'
              }}
            />

            <Input
              size='sm'
              label='Contacto de emergencia (opcional)'
              value={accountData.emergencyContact}
              onChange={e => setAccountData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              startContent={<User className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-700/50'
              }}
            />
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Database className='w-4 h-4 text-green-400' />
            <span className='text-sm font-medium text-gray-200'>Información de la cuenta</span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-3 h-3' />
              <span>
                Miembro desde:{' '}
                <span className='text-gray-300'>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'No disponible'}
                </span>
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <MapPin className='w-3 h-3' />
              <span>
                Ubicación:{' '}
                <span className='text-gray-300'>
                  {user?.city}, {user?.country}
                </span>
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <User className='w-3 h-3' />
              <span>
                ID de usuario: <span className='text-gray-300 font-mono'>{user?.id}</span>
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <span>Estado: </span>
              <Chip size='sm' color={user?.verified ? 'success' : 'warning'} variant='flat' className='text-xs'>
                {user?.verified ? 'Verificado' : 'Sin verificar'}
              </Chip>
            </div>
          </div>
        </div>

        {/* Gestión de datos */}
        <div className='bg-gray-800/30 border border-gray-700/30 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <Download className='w-4 h-4 text-cyan-400' />
            <span className='text-sm font-medium text-gray-200'>Gestión de datos</span>
          </div>

          <div className='space-y-3'>
            <div>
              <Button
                size='sm'
                variant='bordered'
                className='border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
                startContent={<Download className='w-3 h-3' />}
                onPress={onDataOpen}>
                Descargar mis datos
              </Button>
              <p className='text-xs text-gray-400 mt-1'>Descarga una copia de toda tu información personal</p>
            </div>
          </div>
        </div>

        {/* Zona de peligro */}
        <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <AlertTriangle className='w-4 h-4 text-red-400' />
            <span className='text-sm font-medium text-red-300'>Zona de peligro</span>
          </div>

          <div className='space-y-3'>
            <div>
              <Button
                size='sm'
                color='danger'
                variant='bordered'
                className='border-red-500/50 text-red-400 hover:bg-red-500/10'
                startContent={<Trash2 className='w-3 h-3' />}
                onPress={onDeleteOpen}>
                Eliminar cuenta
              </Button>
              <p className='text-xs text-red-300 mt-1'>Esta acción no se puede deshacer. Se eliminarán todos tus datos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='w-5 h-5 text-red-400' />
                  <h3 className='text-lg font-bold text-red-300'>Eliminar cuenta</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-3'>
                  <p className='text-gray-300'>¿Estás seguro de que quieres eliminar tu cuenta permanentemente?</p>
                  <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3'>
                    <p className='text-red-300 text-sm font-medium mb-2'>Esto eliminará:</p>
                    <ul className='text-red-200 text-sm space-y-1'>
                      <li>• Tu perfil completo</li>
                      <li>• Todas tus fotos</li>
                      <li>• Tus matches y conversaciones</li>
                      <li>• Tu historial de actividad</li>
                    </ul>
                  </div>
                  <p className='text-gray-400 text-sm'>Esta acción no se puede deshacer.</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='danger' onPress={handleDeleteAccount} isLoading={loading}>
                  Sí, eliminar mi cuenta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para descarga de datos */}
      <Modal
        isOpen={isDataOpen}
        onOpenChange={onDataOpenChange}
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <Download className='w-5 h-5 text-cyan-400' />
                  <h3 className='text-lg font-bold text-cyan-300'>Descargar datos</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-3'>
                  <p className='text-gray-300'>Se generará un archivo con toda tu información personal.</p>
                  <div className='bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3'>
                    <p className='text-cyan-300 text-sm font-medium mb-2'>El archivo incluirá:</p>
                    <ul className='text-cyan-200 text-sm space-y-1'>
                      <li>• Información del perfil</li>
                      <li>• Historial de matches</li>
                      <li>• Mensajes enviados y recibidos</li>
                      <li>• Configuraciones de privacidad</li>
                    </ul>
                  </div>
                  <p className='text-gray-400 text-sm'>La descarga comenzará automáticamente.</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='primary' onPress={handleExportData} isLoading={loading} startContent={<Download className='w-4 h-4' />}>
                  Descargar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AccountSettingsSection
