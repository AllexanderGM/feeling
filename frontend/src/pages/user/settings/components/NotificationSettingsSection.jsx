import { useState } from 'react'
import { Button, Switch, Chip } from '@heroui/react'
import { Bell, Mail, Smartphone, Heart, MessageCircle, Calendar, Users, Zap, Save } from 'lucide-react'
import useUser from '@hooks/useUser.js'

const NotificationSettingsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    // Notificaciones por email
    emailMatches: user?.emailNotifications?.matches ?? true,
    emailMessages: user?.emailNotifications?.messages ?? true,
    emailEvents: user?.emailNotifications?.events ?? false,
    emailMarketing: user?.emailNotifications?.marketing ?? false,
    
    // Notificaciones push
    pushMatches: user?.pushNotifications?.matches ?? true,
    pushMessages: user?.pushNotifications?.messages ?? true,
    pushEvents: user?.pushNotifications?.events ?? true,
    pushReminders: user?.pushNotifications?.reminders ?? false,
    
    // Notificaciones en la app
    inAppSounds: user?.inAppNotifications?.sounds ?? true,
    inAppVibration: user?.inAppNotifications?.vibration ?? true,
    inAppMessages: user?.inAppNotifications?.messages ?? true
  })

  const { updateUserProfile } = useUser()

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Organizar las notificaciones por categoría
      const notificationSettings = {
        emailNotifications: {
          matches: notifications.emailMatches,
          messages: notifications.emailMessages,
          events: notifications.emailEvents,
          marketing: notifications.emailMarketing
        },
        pushNotifications: {
          matches: notifications.pushMatches,
          messages: notifications.pushMessages,
          events: notifications.pushEvents,
          reminders: notifications.pushReminders
        },
        inAppNotifications: {
          sounds: notifications.inAppSounds,
          vibration: notifications.inAppVibration,
          messages: notifications.inAppMessages
        }
      }
      
      await updateUserProfile(notificationSettings)
    } catch (error) {
      console.error('Error updating notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-200">Configuración de Notificaciones</span>
        </div>
        <Button 
          size="sm" 
          variant="solid" 
          color="primary"
          className="bg-primary-600 hover:bg-primary-700"
          startContent={<Save className="w-3 h-3" />} 
          onPress={handleSave}
          isLoading={loading}
        >
          Guardar
        </Button>
      </div>

      <div className="space-y-4">
        {/* Notificaciones por email */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Notificaciones por email</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-400" />
                <div>
                  <span className="text-sm text-gray-300">Nuevos matches</span>
                  <p className="text-xs text-gray-400">Cuando alguien hace match contigo</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.emailMatches}
                onValueChange={(value) => handleNotificationChange('emailMatches', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3 text-green-400" />
                <div>
                  <span className="text-sm text-gray-300">Nuevos mensajes</span>
                  <p className="text-xs text-gray-400">Cuando recibes un mensaje</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.emailMessages}
                onValueChange={(value) => handleNotificationChange('emailMessages', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-purple-400" />
                <div>
                  <span className="text-sm text-gray-300">Eventos</span>
                  <p className="text-xs text-gray-400">Recordatorios de eventos cerca de ti</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.emailEvents}
                onValueChange={(value) => handleNotificationChange('emailEvents', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-orange-400" />
                <div>
                  <span className="text-sm text-gray-300">Promociones</span>
                  <p className="text-xs text-gray-400">Ofertas especiales y novedades</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.emailMarketing}
                onValueChange={(value) => handleNotificationChange('emailMarketing', value)}
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones push */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-200">Notificaciones push</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-400" />
                <div>
                  <span className="text-sm text-gray-300">Matches</span>
                  <p className="text-xs text-gray-400">Notificación instantánea de matches</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.pushMatches}
                onValueChange={(value) => handleNotificationChange('pushMatches', value)}
                color="success"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3 text-green-400" />
                <div>
                  <span className="text-sm text-gray-300">Mensajes</span>
                  <p className="text-xs text-gray-400">Mensajes nuevos al instante</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.pushMessages}
                onValueChange={(value) => handleNotificationChange('pushMessages', value)}
                color="success"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-purple-400" />
                <div>
                  <span className="text-sm text-gray-300">Eventos</span>
                  <p className="text-xs text-gray-400">Eventos y actividades</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.pushEvents}
                onValueChange={(value) => handleNotificationChange('pushEvents', value)}
                color="success"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-3 h-3 text-yellow-400" />
                <div>
                  <span className="text-sm text-gray-300">Recordatorios</span>
                  <p className="text-xs text-gray-400">Recordatorios de actividad</p>
                </div>
              </div>
              <Switch
                isSelected={notifications.pushReminders}
                onValueChange={(value) => handleNotificationChange('pushReminders', value)}
                color="success"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones en la app */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">Experiencia en la app</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Sonidos</span>
                <p className="text-xs text-gray-400">Reproducir sonidos para notificaciones</p>
              </div>
              <Switch
                isSelected={notifications.inAppSounds}
                onValueChange={(value) => handleNotificationChange('inAppSounds', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Vibración</span>
                <p className="text-xs text-gray-400">Vibrar al recibir notificaciones</p>
              </div>
              <Switch
                isSelected={notifications.inAppVibration}
                onValueChange={(value) => handleNotificationChange('inAppVibration', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Mensajes en vivo</span>
                <p className="text-xs text-gray-400">Ver mensajes instantáneamente</p>
              </div>
              <Switch
                isSelected={notifications.inAppMessages}
                onValueChange={(value) => handleNotificationChange('inAppMessages', value)}
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-300">Notificaciones activas</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {notifications.emailMatches && (
              <Chip size="sm" variant="flat" color="primary" className="text-xs">
                Email: Matches
              </Chip>
            )}
            {notifications.pushMessages && (
              <Chip size="sm" variant="flat" color="success" className="text-xs">
                Push: Mensajes
              </Chip>
            )}
            {notifications.inAppSounds && (
              <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                Sonidos
              </Chip>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettingsSection