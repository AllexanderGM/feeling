import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Input, Button, Switch, Select, SelectItem, Divider, Chip, Slider } from '@heroui/react'
import { Calendar, Save, MapPin, DollarSign, Users, Clock } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const EventConfiguration = ({ config, loading }) => {
  const { updateEventConfiguration } = useConfiguration()

  const [formData, setFormData] = useState({
    enableAutoApproval: false,
    maxEventCapacity: 200,
    minEventDuration: 1,
    maxEventDuration: 48,
    advanceBookingDays: 30,
    cancellationDeadlineHours: 24,
    enableEventRatings: true,
    enableEventComments: true,
    requireEventApproval: true,
    enablePayments: true,
    defaultEventCurrency: 'USD',
    maxEventPrice: 1000,
    enableEventReminders: true,
    reminderHours: [24, 2],
    enableWaitingList: true,
    maxWaitingList: 50,
    enableEventImages: true,
    maxEventImages: 5,
    enablePrivateEvents: true,
    enableRecurringEvents: false
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        enableAutoApproval: config.enableAutoApproval || false,
        maxEventCapacity: config.maxEventCapacity || 200,
        minEventDuration: config.minEventDuration || 1,
        maxEventDuration: config.maxEventDuration || 48,
        advanceBookingDays: config.advanceBookingDays || 30,
        cancellationDeadlineHours: config.cancellationDeadlineHours || 24,
        enableEventRatings: config.enableEventRatings !== false,
        enableEventComments: config.enableEventComments !== false,
        requireEventApproval: config.requireEventApproval !== false,
        enablePayments: config.enablePayments !== false,
        defaultEventCurrency: config.defaultEventCurrency || 'USD',
        maxEventPrice: config.maxEventPrice || 1000,
        enableEventReminders: config.enableEventReminders !== false,
        reminderHours: config.reminderHours || [24, 2],
        enableWaitingList: config.enableWaitingList !== false,
        maxWaitingList: config.maxWaitingList || 50,
        enableEventImages: config.enableEventImages !== false,
        maxEventImages: config.maxEventImages || 5,
        enablePrivateEvents: config.enablePrivateEvents !== false,
        enableRecurringEvents: config.enableRecurringEvents || false
      })
    }
  }, [config])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await updateEventConfiguration(formData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_event_config', 'Error guardando configuración de eventos admin', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='space-y-6'>
      {/* Configuración básica de eventos */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración de Eventos</p>
            <p className='text-small text-gray-400'>Parámetros generales para eventos</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              type='number'
              label='Capacidad Máxima'
              value={formData.maxEventCapacity.toString()}
              onChange={e => handleInputChange('maxEventCapacity', parseInt(e.target.value) || 0)}
              startContent={<Users className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Duración Mínima (horas)'
              value={formData.minEventDuration.toString()}
              onChange={e => handleInputChange('minEventDuration', parseInt(e.target.value) || 0)}
              startContent={<Clock className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Duración Máxima (horas)'
              value={formData.maxEventDuration.toString()}
              onChange={e => handleInputChange('maxEventDuration', parseInt(e.target.value) || 0)}
              startContent={<Clock className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              type='number'
              label='Reserva Anticipada (días)'
              value={formData.advanceBookingDays.toString()}
              onChange={e => handleInputChange('advanceBookingDays', parseInt(e.target.value) || 0)}
              description='Días máximos para reservar con anticipación'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Límite de Cancelación (horas)'
              value={formData.cancellationDeadlineHours.toString()}
              onChange={e => handleInputChange('cancellationDeadlineHours', parseInt(e.target.value) || 0)}
              description='Horas antes del evento para cancelar'
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuración de pagos */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <DollarSign className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración de Pagos</p>
            <p className='text-small text-gray-400'>Sistema de pagos para eventos</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
            <div className='flex items-center gap-3'>
              <Switch
                isSelected={formData.enablePayments}
                onValueChange={value => handleInputChange('enablePayments', value)}
                color='success'
                size='sm'
              />
              <span className='text-sm font-medium text-gray-200'>Habilitar Pagos</span>
              <Chip size='sm' variant='flat' color={formData.enablePayments ? 'success' : 'default'}>
                {formData.enablePayments ? 'Activo' : 'Inactivo'}
              </Chip>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              label='Moneda por Defecto'
              selectedKeys={formData.defaultEventCurrency ? [formData.defaultEventCurrency] : []}
              onSelectionChange={keys => handleInputChange('defaultEventCurrency', Array.from(keys)[0] || '')}
              classNames={{
                trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                value: 'text-gray-200'
              }}>
              <SelectItem key='USD' value='USD'>
                USD - Dólar
              </SelectItem>
              <SelectItem key='EUR' value='EUR'>
                EUR - Euro
              </SelectItem>
              <SelectItem key='COP' value='COP'>
                COP - Peso Colombiano
              </SelectItem>
            </Select>

            <Input
              type='number'
              label='Precio Máximo'
              value={formData.maxEventPrice.toString()}
              onChange={e => handleInputChange('maxEventPrice', parseInt(e.target.value) || 0)}
              startContent={<DollarSign className='w-4 h-4 text-gray-400' />}
              isDisabled={!formData.enablePayments}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Funcionalidades de eventos */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Funcionalidades</p>
            <p className='text-small text-gray-400'>Características adicionales de eventos</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableAutoApproval}
                    onValueChange={value => handleInputChange('enableAutoApproval', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Aprobación Automática</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableEventRatings}
                    onValueChange={value => handleInputChange('enableEventRatings', value)}
                    color='warning'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Calificaciones</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableEventComments}
                    onValueChange={value => handleInputChange('enableEventComments', value)}
                    color='success'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Comentarios</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableWaitingList}
                    onValueChange={value => handleInputChange('enableWaitingList', value)}
                    color='secondary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Lista de Espera</span>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableEventReminders}
                    onValueChange={value => handleInputChange('enableEventReminders', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Recordatorios</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableEventImages}
                    onValueChange={value => handleInputChange('enableEventImages', value)}
                    color='warning'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Imágenes de Eventos</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enablePrivateEvents}
                    onValueChange={value => handleInputChange('enablePrivateEvents', value)}
                    color='danger'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Eventos Privados</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableRecurringEvents}
                    onValueChange={value => handleInputChange('enableRecurringEvents', value)}
                    color='success'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Eventos Recurrentes</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Botón de guardar */}
      <div className='flex justify-end'>
        <Button
          color='primary'
          onPress={handleSubmit}
          isLoading={saving || loading}
          startContent={!saving && !loading && <Save className='w-3 h-3' />}
          size='sm'>
          Guardar
        </Button>
      </div>
    </div>
  )
}

export default EventConfiguration
