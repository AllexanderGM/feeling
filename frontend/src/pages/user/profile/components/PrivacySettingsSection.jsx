import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Switch, Spinner } from '@heroui/react'
import { Settings, Calendar, MapPin, Search, Bell, Edit2, Check, X, Eye, EyeOff } from 'lucide-react'
import useUser from '@hooks/useUser.js'

const PrivacySettingsSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    showAge: user?.showAge ?? true,
    showLocation: user?.showLocation ?? true,
    showMeInSearch: user?.showMeInSearch ?? true,
    allowNotifications: user?.allowNotifications ?? true
  })
  const [loading, setLoading] = useState(false)

  const { updateUserProfile } = useUser()

  const handleEdit = () => {
    setEditData({
      showAge: user?.showAge ?? true,
      showLocation: user?.showLocation ?? true,
      showMeInSearch: user?.showMeInSearch ?? true,
      allowNotifications: user?.allowNotifications ?? true
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditData({
      showAge: user?.showAge ?? true,
      showLocation: user?.showLocation ?? true,
      showMeInSearch: user?.showMeInSearch ?? true,
      allowNotifications: user?.allowNotifications ?? true
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateUserProfile(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const privacySettings = [
    {
      key: 'showAge',
      label: 'Mostrar edad',
      description: 'Permite que otros usuarios vean tu edad',
      icon: Calendar,
      value: isEditing ? editData.showAge : user?.showAge
    },
    {
      key: 'showLocation',
      label: 'Mostrar ubicación',
      description: 'Permite que otros usuarios vean tu ubicación',
      icon: MapPin,
      value: isEditing ? editData.showLocation : user?.showLocation
    },
    {
      key: 'showMeInSearch',
      label: 'Aparecer en búsquedas',
      description: 'Permite que tu perfil aparezca en los resultados de búsqueda',
      icon: Search,
      value: isEditing ? editData.showMeInSearch : user?.showMeInSearch
    },
    {
      key: 'allowNotifications',
      label: 'Notificaciones',
      description: 'Recibir notificaciones de la aplicación',
      icon: Bell,
      value: isEditing ? editData.allowNotifications : user?.allowNotifications
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Configuración de privacidad</h2>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                  onPress={handleSave}
                  isDisabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  startContent={<X className="w-4 h-4" />}
                  onPress={handleCancel}
                  isDisabled={loading}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button size="sm" color="primary" variant="light" startContent={<Edit2 className="w-4 h-4" />} onPress={handleEdit}>
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {privacySettings.map(setting => {
            const IconComponent = setting.icon
            const isEnabled = setting.value ?? true

            return (
              <div key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{setting.label}</h3>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <Switch
                      isSelected={isEnabled}
                      onValueChange={value => handleSwitchChange(setting.key, value)}
                      color="primary"
                      size="sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {isEnabled ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      <span className={`text-sm font-medium ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {isEnabled ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {!isEditing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Mantener tu información visible ayuda a que otros usuarios puedan encontrarte y conectar contigo más
              fácilmente.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default PrivacySettingsSection
