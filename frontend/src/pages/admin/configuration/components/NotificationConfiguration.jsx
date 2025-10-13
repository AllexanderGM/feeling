import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Switch, Divider, Chip, Slider } from '@heroui/react'
import { Bell, Save, Mail, Smartphone, Volume2 } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const NotificationConfiguration = ({ config, loading }) => {
  const { updateNotificationConfiguration } = useConfiguration()

  const [formData, setFormData] = useState({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSMSNotifications: false,
    enableInAppNotifications: true,
    enableMatchNotifications: true,
    enableEventNotifications: true,
    enableMessageNotifications: true,
    enableMarketingNotifications: false,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    maxDailyNotifications: 10,
    enableQuietHours: true,
    enableInstantNotifications: true,
    enableDigestNotifications: true,
    digestFrequency: 'daily'
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        enableEmailNotifications: config.enableEmailNotifications !== false,
        enablePushNotifications: config.enablePushNotifications !== false,
        enableSMSNotifications: config.enableSMSNotifications || false,
        enableInAppNotifications: config.enableInAppNotifications !== false,
        enableMatchNotifications: config.enableMatchNotifications !== false,
        enableEventNotifications: config.enableEventNotifications !== false,
        enableMessageNotifications: config.enableMessageNotifications !== false,
        enableMarketingNotifications: config.enableMarketingNotifications || false,
        quietHoursStart: config.quietHoursStart || 22,
        quietHoursEnd: config.quietHoursEnd || 8,
        maxDailyNotifications: config.maxDailyNotifications || 10,
        enableQuietHours: config.enableQuietHours !== false,
        enableInstantNotifications: config.enableInstantNotifications !== false,
        enableDigestNotifications: config.enableDigestNotifications !== false,
        digestFrequency: config.digestFrequency || 'daily'
      })
    }
  }, [config])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await updateNotificationConfiguration(formData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_notification_config', 'Error guardando configuración de notificaciones admin', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='space-y-6'>
      {/* Canales de notificación */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Bell className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Canales de Notificación</p>
            <p className='text-small text-gray-400'>Métodos de envío de notificaciones</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-3'>
                  <Mail className='w-5 h-5 text-blue-400' />
                  <div className='flex items-center gap-2'>
                    <Switch
                      color='primary'
                      isSelected={formData.enableEmailNotifications}
                      size='sm'
                      onValueChange={value => handleInputChange('enableEmailNotifications', value)}
                    />
                    <span className='text-sm font-medium text-gray-200'>Email</span>
                  </div>
                  <Chip color={formData.enableEmailNotifications ? 'primary' : 'default'} size='sm' variant='flat'>
                    {formData.enableEmailNotifications ? 'ON' : 'OFF'}
                  </Chip>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-3'>
                  <Smartphone className='w-5 h-5 text-green-400' />
                  <div className='flex items-center gap-2'>
                    <Switch
                      color='success'
                      isSelected={formData.enablePushNotifications}
                      size='sm'
                      onValueChange={value => handleInputChange('enablePushNotifications', value)}
                    />
                    <span className='text-sm font-medium text-gray-200'>Push</span>
                  </div>
                  <Chip color={formData.enablePushNotifications ? 'success' : 'default'} size='sm' variant='flat'>
                    {formData.enablePushNotifications ? 'ON' : 'OFF'}
                  </Chip>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-3'>
                  <Smartphone className='w-5 h-5 text-orange-400' />
                  <div className='flex items-center gap-2'>
                    <Switch
                      color='warning'
                      isSelected={formData.enableSMSNotifications}
                      size='sm'
                      onValueChange={value => handleInputChange('enableSMSNotifications', value)}
                    />
                    <span className='text-sm font-medium text-gray-200'>SMS</span>
                  </div>
                  <Chip color={formData.enableSMSNotifications ? 'warning' : 'default'} size='sm' variant='flat'>
                    {formData.enableSMSNotifications ? 'ON' : 'OFF'}
                  </Chip>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-3'>
                  <Bell className='w-5 h-5 text-purple-400' />
                  <div className='flex items-center gap-2'>
                    <Switch
                      color='secondary'
                      isSelected={formData.enableInAppNotifications}
                      size='sm'
                      onValueChange={value => handleInputChange('enableInAppNotifications', value)}
                    />
                    <span className='text-sm font-medium text-gray-200'>In-App</span>
                  </div>
                  <Chip color={formData.enableInAppNotifications ? 'secondary' : 'default'} size='sm' variant='flat'>
                    {formData.enableInAppNotifications ? 'ON' : 'OFF'}
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tipos de notificación */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
            <Volume2 className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Tipos de Notificación</p>
            <p className='text-small text-gray-400'>Categorías de notificaciones</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='danger'
                    isSelected={formData.enableMatchNotifications}
                    size='sm'
                    onValueChange={value => handleInputChange('enableMatchNotifications', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Notificaciones de Matches</span>
                </div>
                <Chip color={formData.enableMatchNotifications ? 'danger' : 'default'} size='sm' variant='flat'>
                  {formData.enableMatchNotifications ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='primary'
                    isSelected={formData.enableEventNotifications}
                    size='sm'
                    onValueChange={value => handleInputChange('enableEventNotifications', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Notificaciones de Eventos</span>
                </div>
                <Chip color={formData.enableEventNotifications ? 'primary' : 'default'} size='sm' variant='flat'>
                  {formData.enableEventNotifications ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='success'
                    isSelected={formData.enableMessageNotifications}
                    size='sm'
                    onValueChange={value => handleInputChange('enableMessageNotifications', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Notificaciones de Mensajes</span>
                </div>
                <Chip color={formData.enableMessageNotifications ? 'success' : 'default'} size='sm' variant='flat'>
                  {formData.enableMessageNotifications ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='warning'
                    isSelected={formData.enableMarketingNotifications}
                    size='sm'
                    onValueChange={value => handleInputChange('enableMarketingNotifications', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Notificaciones de Marketing</span>
                </div>
                <Chip color={formData.enableMarketingNotifications ? 'warning' : 'default'} size='sm' variant='flat'>
                  {formData.enableMarketingNotifications ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Configuración de horarios */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
            <Bell className='w-5 h-5 text-orange-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración de Horarios</p>
            <p className='text-small text-gray-400'>Horarios de silencio y límites</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-6'>
          <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
            <div className='flex items-center gap-2'>
              <Switch
                color='primary'
                isSelected={formData.enableQuietHours}
                size='sm'
                onValueChange={value => handleInputChange('enableQuietHours', value)}
              />
              <span className='text-sm font-medium text-gray-200'>Habilitar Horario de Silencio</span>
            </div>
            <Chip color={formData.enableQuietHours ? 'primary' : 'default'} size='sm' variant='flat'>
              {formData.enableQuietHours ? 'ON' : 'OFF'}
            </Chip>
          </div>

          {formData.enableQuietHours && (
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>Inicio de Silencio: {formData.quietHoursStart}:00</label>
                <Slider
                  className='max-w-md'
                  classNames={{
                    track: 'bg-gray-700',
                    filler: 'bg-orange-500'
                  }}
                  maxValue={23}
                  minValue={0}
                  size='md'
                  step={1}
                  value={formData.quietHoursStart}
                  onChange={value => handleInputChange('quietHoursStart', value)}
                />
              </div>

              <div>
                <label className='text-sm font-medium text-gray-300 mb-2 block'>Fin de Silencio: {formData.quietHoursEnd}:00</label>
                <Slider
                  className='max-w-md'
                  classNames={{
                    track: 'bg-gray-700',
                    filler: 'bg-orange-500'
                  }}
                  maxValue={23}
                  minValue={0}
                  size='md'
                  step={1}
                  value={formData.quietHoursEnd}
                  onChange={value => handleInputChange('quietHoursEnd', value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className='text-sm font-medium text-gray-300 mb-2 block'>
              Máximo de Notificaciones Diarias: {formData.maxDailyNotifications}
            </label>
            <Slider
              className='max-w-md'
              classNames={{
                track: 'bg-gray-700',
                filler: 'bg-purple-500'
              }}
              maxValue={50}
              minValue={5}
              size='md'
              step={5}
              value={formData.maxDailyNotifications}
              onChange={value => handleInputChange('maxDailyNotifications', value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Botón de guardar */}
      <div className='flex justify-end'>
        <Button
          color='primary'
          isLoading={saving || loading}
          size='sm'
          startContent={!saving && !loading && <Save className='w-3 h-3' />}
          onPress={handleSubmit}>
          Guardar
        </Button>
      </div>
    </div>
  )
}

export default NotificationConfiguration
