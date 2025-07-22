import { useState } from 'react'
import { Button, Switch, Select, SelectItem, Chip } from '@heroui/react'
import { Shield, Eye, Users, Globe, MapPin, Calendar, Lock, Save, Settings } from 'lucide-react'
import useUser from '@hooks/useUser.js'

const PrivacySettingsSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    profilePrivacy: user?.profilePrivacy || 'public',
    searchable: user?.searchable ?? true,
    shareLocation: user?.shareLocation ?? true,
    showDistance: user?.showDistance ?? true,
    showAge: user?.showAge ?? true,
    showLastSeen: user?.showLastSeen ?? false,
    allowMessages: user?.allowMessages ?? true,
    requireVerification: user?.requireVerification ?? false
  })

  const { updateUserProfile } = useUser()

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateUserProfile(settings)
    } catch (error) {
      console.error('Error updating privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const privacyOptions = [
    { key: 'public', label: 'Público', description: 'Cualquier usuario puede ver tu perfil' },
    { key: 'private', label: 'Privado', description: 'Solo usuarios con match pueden ver tu perfil completo' },
    { key: 'friends', label: 'Conexiones', description: 'Solo tus conexiones pueden ver tu perfil' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Configuración de Privacidad</span>
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
        {/* Privacidad del perfil */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Visibilidad del perfil</span>
          </div>
          <Select
            size="sm"
            label="¿Quién puede ver tu perfil?"
            selectedKeys={[settings.profilePrivacy]}
            onSelectionChange={(keys) => handleSettingChange('profilePrivacy', Array.from(keys)[0])}
            className="max-w-xs"
            classNames={{
              trigger: "bg-gray-700/50 border-gray-600",
              value: "text-gray-200"
            }}
          >
            {privacyOptions.map((option) => (
              <SelectItem 
                key={option.key} 
                value={option.key}
                textValue={option.label}
                classNames={{
                  base: "text-gray-200 data-[hover=true]:bg-gray-700"
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-gray-400">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Configuraciones de búsqueda */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Búsqueda y descubrimiento</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Aparecer en búsquedas</span>
                <p className="text-xs text-gray-400">Permite que otros usuarios te encuentren</p>
              </div>
              <Switch
                isSelected={settings.searchable}
                onValueChange={(value) => handleSettingChange('searchable', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Compartir ubicación</span>
                <p className="text-xs text-gray-400">Mostrar tu ciudad en el perfil</p>
              </div>
              <Switch
                isSelected={settings.shareLocation}
                onValueChange={(value) => handleSettingChange('shareLocation', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Solo usuarios verificados</span>
                <p className="text-xs text-gray-400">Filtrar búsquedas a usuarios verificados</p>
              </div>
              <Switch
                isSelected={settings.requireVerification}
                onValueChange={(value) => handleSettingChange('requireVerification', value)}
                color="success"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Información visible */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">Información visible</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Mostrar distancia</span>
                <p className="text-xs text-gray-400">Otros pueden ver la distancia hasta ti</p>
              </div>
              <Switch
                isSelected={settings.showDistance}
                onValueChange={(value) => handleSettingChange('showDistance', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Mostrar edad</span>
                <p className="text-xs text-gray-400">Mostrar tu edad en el perfil</p>
              </div>
              <Switch
                isSelected={settings.showAge}
                onValueChange={(value) => handleSettingChange('showAge', value)}
                color="primary"
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-300">Última conexión</span>
                <p className="text-xs text-gray-400">Mostrar cuándo estuviste activo</p>
              </div>
              <Switch
                isSelected={settings.showLastSeen}
                onValueChange={(value) => handleSettingChange('showLastSeen', value)}
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Configuración de mensajes */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-gray-200">Mensajes y conexiones</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-300">Permitir mensajes</span>
              <p className="text-xs text-gray-400">Recibir mensajes de otros usuarios</p>
            </div>
            <Switch
              isSelected={settings.allowMessages}
              onValueChange={(value) => handleSettingChange('allowMessages', value)}
              color="primary"
              size="sm"
            />
          </div>
        </div>

        {/* Estado actual */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Estado actual de privacidad</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Chip size="sm" variant="flat" color="primary" className="text-xs">
              Perfil: {privacyOptions.find(opt => opt.key === settings.profilePrivacy)?.label}
            </Chip>
            {settings.searchable && (
              <Chip size="sm" variant="flat" color="success" className="text-xs">
                Visible en búsquedas
              </Chip>
            )}
            {settings.requireVerification && (
              <Chip size="sm" variant="flat" color="warning" className="text-xs">
                Solo verificados
              </Chip>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettingsSection