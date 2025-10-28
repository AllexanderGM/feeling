import { useState } from 'react'
import {
  Card,
  CardBody,
  Avatar,
  Progress,
  Button,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Chip,
  useDisclosure
} from '@heroui/react'
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Users,
  MapPin,
  Globe,
  Mail,
  Smartphone,
  Heart,
  Calendar,
  Lock,
  CreditCard,
  AlertTriangle,
  Eye,
  CheckCircle
} from 'lucide-react'
import { useAuth, useUser } from '@hooks'
import { getUserName, getUserLastName, getUserCountry, getUserCity, getUserImages, getUserPrivacy, getUserNotifications } from '@schemas'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'

const PRIVACY_TOGGLES = [
  {
    key: 'publicAccount',
    label: 'Perfil público',
    description: 'Controla si tu perfil es visible para la comunidad.',
    icon: Shield,
    accentClass: 'text-blue-400'
  },
  {
    key: 'searchVisibility',
    label: 'Aparecer en búsquedas',
    description: 'Permite que otros usuarios te encuentren mediante filtros.',
    icon: Users,
    accentClass: 'text-purple-400',
    requiresPublicAccount: true
  },
  {
    key: 'showMeInSearch',
    label: 'Sugerencias inteligentes',
    description: 'Incluye tu perfil en las recomendaciones personalizadas.',
    icon: Users,
    accentClass: 'text-purple-400',
    requiresPublicAccount: true
  },
  {
    key: 'showAge',
    label: 'Mostrar edad',
    description: 'Muestra tu edad en la tarjeta de perfil.',
    icon: Calendar,
    accentClass: 'text-cyan-400'
  },
  {
    key: 'showLocation',
    label: 'Mostrar ubicación',
    description: 'Comparte tu ciudad de residencia.',
    icon: MapPin,
    accentClass: 'text-green-400'
  },
  {
    key: 'locationPublic',
    label: 'Ubicación detallada',
    description: 'Permite que otros vean tu localidad específica.',
    icon: Globe,
    accentClass: 'text-emerald-400',
    requiresLocation: true
  }
]

const NOTIFICATION_TOGGLES = [
  {
    key: 'allowNotifications',
    label: 'Recibir notificaciones',
    description: 'Activa o desactiva todas las notificaciones de la plataforma.',
    icon: Bell,
    accentClass: 'text-blue-400',
    isMaster: true
  },
  {
    key: 'notificationsEmailEnabled',
    label: 'Emails importantes',
    description: 'Recibe actualizaciones clave por correo electrónico.',
    icon: Mail,
    accentClass: 'text-sky-400'
  },
  {
    key: 'notificationsPhoneEnabled',
    label: 'Notificaciones por SMS',
    description: 'Te enviaremos SMS para eventos críticos.',
    icon: Smartphone,
    accentClass: 'text-amber-400'
  },
  {
    key: 'notificationsMatchesEnabled',
    label: 'Alertas de matches',
    description: 'Entérate al instante cuando tengas un nuevo match.',
    icon: Heart,
    accentClass: 'text-pink-400'
  },
  {
    key: 'notificationsEventsEnabled',
    label: 'Eventos y actividades',
    description: 'Sigue las actividades y eventos más relevantes.',
    icon: Calendar,
    accentClass: 'text-green-400'
  },
  {
    key: 'notificationsLoginEnabled',
    label: 'Inicios de sesión',
    description: 'Recibe alertas cuando detectemos un acceso a tu cuenta.',
    icon: Lock,
    accentClass: 'text-purple-400'
  },
  {
    key: 'notificationsPaymentsEnabled',
    label: 'Pagos y facturación',
    description: 'Mantente al tanto de cualquier movimiento de pagos.',
    icon: CreditCard,
    accentClass: 'text-teal-400'
  }
]

const Settings = () => {
  const { user, loading: authLoading } = useAuth()
  const { getProfileStats, updateCurrentProfile, deactivateCurrentAccount } = useUser()
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure()
  const { onOpen: onFarewellOpen } = useDisclosure()

  // Obtener valores iniciales del usuario
  const privacy = getUserPrivacy(user)
  const notifications = getUserNotifications(user)
  const images = getUserImages(user)
  const mainImage = images && images.length > 0 ? images[0] : null

  // Estado local para privacidad
  const [privacyState, setPrivacyState] = useState({
    publicAccount: privacy?.publicAccount ?? true,
    searchVisibility: privacy?.searchVisibility ?? true,
    locationPublic: privacy?.locationPublic ?? true,
    showAge: privacy?.showAge ?? true,
    showLocation: privacy?.showLocation ?? true,
    showMeInSearch: privacy?.showMeInSearch ?? true
  })

  // Estado local para notificaciones
  const [notificationState, setNotificationState] = useState({
    allowNotifications: privacy?.allowNotifications ?? true,
    notificationsEmailEnabled: notifications?.notificationsEmailEnabled ?? true,
    notificationsPhoneEnabled: notifications?.notificationsPhoneEnabled ?? false,
    notificationsMatchesEnabled: notifications?.notificationsMatchesEnabled ?? true,
    notificationsEventsEnabled: notifications?.notificationsEventsEnabled ?? true,
    notificationsLoginEnabled: notifications?.notificationsLoginEnabled ?? true,
    notificationsPaymentsEnabled: notifications?.notificationsPaymentsEnabled ?? true
  })

  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState('')

  const profileStats = getProfileStats()

  const handlePrivacyChange = (key, value) => {
    setPrivacyState(prev => {
      const next = { ...prev, [key]: value }

      if (key === 'publicAccount' && !value) {
        next.searchVisibility = false
        next.showMeInSearch = false
      }

      if (key === 'showLocation' && !value) {
        next.locationPublic = false
      }

      return next
    })
  }

  const handleNotificationChange = (key, value) => {
    setNotificationState(prev => {
      if (key === 'allowNotifications') {
        const next = { ...prev, allowNotifications: value }

        if (!value) {
          next.notificationsEmailEnabled = false
          next.notificationsPhoneEnabled = false
          next.notificationsMatchesEnabled = false
          next.notificationsEventsEnabled = false
          next.notificationsLoginEnabled = false
          next.notificationsPaymentsEnabled = false
        }

        return next
      }

      if (!prev.allowNotifications) return prev

      return { ...prev, [key]: value }
    })
  }

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true)
    try {
      await updateCurrentProfile(privacyState)
    } catch {
      // console.error('Error saving privacy settings', error)
    } finally {
      setSavingPrivacy(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    try {
      await updateCurrentProfile(notificationState)
    } catch {
      // console.error('Error saving notification settings', error)
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    try {
      await deactivateCurrentAccount(deactivationReason)
      onDeactivateClose()
      onFarewellOpen()
      onDeactivateClose()
    } catch {
      // console.error('Error deactivating account', error)
    } finally {
      setIsDeactivating(false)
    }
  }

  // Chips de resumen para privacidad
  const privacySummaryChips = [
    privacyState.publicAccount ? { label: 'Perfil público', color: 'success' } : { label: 'Perfil privado', color: 'default' },
    privacyState.searchVisibility && privacyState.publicAccount ? { label: 'En búsquedas', color: 'secondary' } : null,
    privacyState.showMeInSearch && privacyState.publicAccount ? { label: 'En recomendaciones', color: 'secondary' } : null,
    privacyState.showAge ? { label: 'Edad visible', color: 'primary' } : null,
    privacyState.showLocation ? { label: 'Ubicación visible', color: 'primary' } : null
  ].filter(Boolean)

  // Chips de notificaciones activas
  const activeNotificationChips = NOTIFICATION_TOGGLES.filter(toggle => !toggle.isMaster && notificationState[toggle.key]).map(toggle => ({
    label: toggle.label,
    color: 'primary'
  }))

  if (authLoading) return <LoadData>Cargando configuración...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <LiteContainer ariaLabel='Página de configuración' className='gap-4'>
      {/* Header */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-start gap-3 mb-4'>
            <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <SettingsIcon className='w-5 h-5 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Configuración de la Cuenta</h3>
              <p className='text-sm text-gray-400'>Gestiona tu privacidad, notificaciones y configuración general</p>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <Avatar alt={`${getUserName(user)} ${getUserLastName(user)}`} className='w-20 h-20 border-2 border-gray-600' src={mainImage} />
            <div className='flex-1'>
              <h1 className='text-xl font-bold text-gray-100'>
                {getUserName(user)} {getUserLastName(user)}
              </h1>
              <p className='text-sm text-gray-300'>
                {getUserCity(user)}, {getUserCountry(user)}
              </p>
              <div className='mt-2'>
                <div className='flex justify-between text-xs mb-1'>
                  <span className='text-gray-400'>Completitud del perfil</span>
                  <span className='text-gray-300'>{profileStats?.completionPercentage || 0}%</span>
                </div>
                <Progress
                  aria-label='Completitud del perfil'
                  className='h-1.5'
                  classNames={{ indicator: 'bg-gradient-to-r from-primary-400 to-primary-600', track: 'bg-gray-700' }}
                  value={profileStats?.completionPercentage || 0}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Privacidad */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-500/20 rounded-lg'>
              <Shield className='w-5 h-5 text-green-400' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-200'>Privacidad y visibilidad</h3>
              <p className='text-sm text-gray-400'>Controla qué información compartes con la comunidad.</p>
            </div>
          </div>

          {/* Resumen de configuración de privacidad */}
          <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <Eye className='w-4 h-4 text-gray-300' />
              <span className='text-sm font-medium text-gray-300'>Estado actual de tu perfil</span>
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {privacySummaryChips.map(({ label, color }) => (
                <Chip key={label} className='text-xs' color={color} size='sm' variant='flat'>
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {PRIVACY_TOGGLES.map(toggle => {
            const Icon = toggle.icon
            const isDisabled =
              (!privacyState.publicAccount && toggle.requiresPublicAccount) || (toggle.requiresLocation && !privacyState.showLocation)

            return (
              <div
                key={toggle.key}
                className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${isDisabled ? 'bg-gray-800/20 border-gray-700/20 opacity-60' : 'bg-gray-800/30 border-gray-700/30'}`}>
                <div className='flex items-center gap-3 flex-1'>
                  <Icon className={`w-4 h-4 ${isDisabled ? 'text-gray-500' : toggle.accentClass}`} />
                  <div className='flex-1'>
                    <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-500' : 'text-gray-200'}`}>{toggle.label}</span>
                    <p className={`text-xs ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>{toggle.description}</p>
                  </div>
                </div>
                <Switch
                  color='primary'
                  isDisabled={isDisabled}
                  isSelected={privacyState[toggle.key]}
                  size='sm'
                  onValueChange={value => handlePrivacyChange(toggle.key, value)}
                />
              </div>
            )
          })}

          <div className='flex justify-end'>
            <Button className='bg-primary-600' color='primary' isLoading={savingPrivacy} size='sm' onPress={handleSavePrivacy}>
              Guardar privacidad
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Notificaciones */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-yellow-500/20 rounded-lg'>
              <Bell className='w-5 h-5 text-yellow-400' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-200'>Notificaciones</h3>
              <p className='text-sm text-gray-400'>Configura cómo quieres recibir tus alertas.</p>
            </div>
          </div>

          {/* Resumen de notificaciones activas */}
          <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <CheckCircle className='w-4 h-4 text-gray-300' />
              <span className='text-sm font-medium text-gray-300'>Canales activos</span>
            </div>
            {notificationState.allowNotifications ? (
              activeNotificationChips.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
                  {activeNotificationChips.map(({ label, color }) => (
                    <Chip key={label} className='text-xs' color={color} size='sm' variant='flat'>
                      {label}
                    </Chip>
                  ))}
                </div>
              ) : (
                <span className='text-xs text-gray-500'>No tienes canales activos</span>
              )
            ) : (
              <span className='text-xs text-gray-500'>Has desactivado todas las notificaciones</span>
            )}
          </div>

          {NOTIFICATION_TOGGLES.map(toggle => {
            const Icon = toggle.icon
            const isMaster = toggle.isMaster
            const isDisabled = !notificationState.allowNotifications && !isMaster

            return (
              <div
                key={toggle.key}
                className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${isDisabled ? 'bg-gray-800/20 border-gray-700/20 opacity-60' : 'bg-gray-800/30 border-gray-700/30'}`}>
                <div className='flex items-center gap-3 flex-1'>
                  <Icon className={`w-4 h-4 ${isDisabled ? 'text-gray-500' : toggle.accentClass}`} />
                  <div className='flex-1'>
                    <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-500' : 'text-gray-200'}`}>{toggle.label}</span>
                    <p className={`text-xs ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>{toggle.description}</p>
                  </div>
                </div>
                <Switch
                  color='primary'
                  isDisabled={isDisabled}
                  isSelected={notificationState[toggle.key]}
                  size='sm'
                  onValueChange={value => handleNotificationChange(toggle.key, value)}
                />
              </div>
            )
          })}

          <div className='flex justify-end'>
            <Button className='bg-primary-600' color='primary' isLoading={savingNotifications} size='sm' onPress={handleSaveNotifications}>
              Guardar notificaciones
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Zona de peligro - Desactivar cuenta */}
      <Card className='w-full bg-red-500/10 border border-red-500/30'>
        <CardBody className='p-4 sm:p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-red-500/20 rounded-full'>
              <AlertTriangle className='w-5 h-5 text-red-400' />
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-red-200'>Zona de peligro</h3>
              <p className='text-sm text-red-200/80'>
                Desactiva tu cuenta si deseas dejar de aparecer en la plataforma. Puedes reactivarla contactando soporte.
              </p>
            </div>
            <Button color='danger' size='sm' variant='solid' onPress={onDeactivateOpen}>
              Desactivar cuenta
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal de confirmación de desactivación */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50'
        }}
        isOpen={isDeactivateOpen}
        onOpenChange={onDeactivateClose}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex items-center gap-3'>
                <AlertTriangle className='w-5 h-5 text-red-400' />
                <span className='text-lg font-semibold text-red-200'>Confirmar desactivación</span>
              </ModalHeader>
              <ModalBody className='space-y-4 text-sm text-gray-300'>
                <p>Tu perfil dejará de aparecer en búsquedas y recomendaciones inmediatamente.</p>
                <p>Puedes solicitar la reactivación contactando a soporte cuando lo necesites.</p>
                <Textarea
                  classNames={{ input: 'text-gray-200', inputWrapper: 'bg-gray-800/50' }}
                  label='Razón de desactivación (opcional)'
                  maxRows={4}
                  minRows={3}
                  placeholder='Cuéntanos por qué deseas desactivar tu cuenta...'
                  value={deactivationReason}
                  variant='bordered'
                  onChange={e => setDeactivationReason(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancelar
                </Button>
                <Button color='danger' isLoading={isDeactivating} onPress={handleDeactivateAccount}>
                  Desactivar cuenta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </LiteContainer>
  )
}

export default Settings
