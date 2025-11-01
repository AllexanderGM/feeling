import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Input, Button, Switch, Select, SelectItem, Divider, Chip } from '@heroui/react'
import { Calendar, Save, DollarSign, Users, Clock } from 'lucide-react'
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
    defaultEventCurrency: 'COP',
    maxEventPrice: 1000000,
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
        defaultEventCurrency: config.defaultEventCurrency || 'COP',
        maxEventPrice: config.maxEventPrice || 1000000,
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
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Capacidad Máxima'
              startContent={<Users className='w-4 h-4 text-gray-400' />}
              type='number'
              value={formData.maxEventCapacity.toString()}
              onChange={e => handleInputChange('maxEventCapacity', parseInt(e.target.value) || 0)}
            />

            <Input
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Duración Mínima (horas)'
              startContent={<Clock className='w-4 h-4 text-gray-400' />}
              type='number'
              value={formData.minEventDuration.toString()}
              onChange={e => handleInputChange('minEventDuration', parseInt(e.target.value) || 0)}
            />

            <Input
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Duración Máxima (horas)'
              startContent={<Clock className='w-4 h-4 text-gray-400' />}
              type='number'
              value={formData.maxEventDuration.toString()}
              onChange={e => handleInputChange('maxEventDuration', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              description='Días máximos para reservar con anticipación'
              label='Reserva Anticipada (días)'
              type='number'
              value={formData.advanceBookingDays.toString()}
              onChange={e => handleInputChange('advanceBookingDays', parseInt(e.target.value) || 0)}
            />

            <Input
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              description='Horas antes del evento para cancelar'
              label='Límite de Cancelación (horas)'
              type='number'
              value={formData.cancellationDeadlineHours.toString()}
              onChange={e => handleInputChange('cancellationDeadlineHours', parseInt(e.target.value) || 0)}
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
                color='success'
                isSelected={formData.enablePayments}
                size='sm'
                onValueChange={value => handleInputChange('enablePayments', value)}
              />
              <span className='text-sm font-medium text-gray-200'>Habilitar Pagos</span>
              <Chip color={formData.enablePayments ? 'success' : 'default'} size='sm' variant='flat'>
                {formData.enablePayments ? 'Activo' : 'Inactivo'}
              </Chip>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              classNames={{
                trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                value: 'text-gray-200'
              }}
              label='Moneda por Defecto'
              selectedKeys={formData.defaultEventCurrency ? [formData.defaultEventCurrency] : []}
              onSelectionChange={keys => handleInputChange('defaultEventCurrency', Array.from(keys)[0] || '')}>
              <SelectItem key='COP' value='COP'>
                COP - Peso Colombiano
              </SelectItem>
              <SelectItem key='USD' value='USD'>
                USD - Dólar
              </SelectItem>
              <SelectItem key='EUR' value='EUR'>
                EUR - Euro
              </SelectItem>
            </Select>

            <Input
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              isDisabled={!formData.enablePayments}
              label='Precio Máximo (COP)'
              startContent={<DollarSign className='w-4 h-4 text-gray-400' />}
              type='number'
              value={formData.maxEventPrice.toString()}
              onChange={e => handleInputChange('maxEventPrice', parseInt(e.target.value) || 0)}
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
                    color='primary'
                    isSelected={formData.enableAutoApproval}
                    size='sm'
                    onValueChange={value => handleInputChange('enableAutoApproval', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Aprobación Automática</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='warning'
                    isSelected={formData.enableEventRatings}
                    size='sm'
                    onValueChange={value => handleInputChange('enableEventRatings', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Calificaciones</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='success'
                    isSelected={formData.enableEventComments}
                    size='sm'
                    onValueChange={value => handleInputChange('enableEventComments', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Comentarios</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='secondary'
                    isSelected={formData.enableWaitingList}
                    size='sm'
                    onValueChange={value => handleInputChange('enableWaitingList', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Lista de Espera</span>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='primary'
                    isSelected={formData.enableEventReminders}
                    size='sm'
                    onValueChange={value => handleInputChange('enableEventReminders', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Recordatorios</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='warning'
                    isSelected={formData.enableEventImages}
                    size='sm'
                    onValueChange={value => handleInputChange('enableEventImages', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Imágenes de Eventos</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='danger'
                    isSelected={formData.enablePrivateEvents}
                    size='sm'
                    onValueChange={value => handleInputChange('enablePrivateEvents', value)}
                  />
                  <span className='text-sm font-medium text-gray-200'>Eventos Privados</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    color='success'
                    isSelected={formData.enableRecurringEvents}
                    size='sm'
                    onValueChange={value => handleInputChange('enableRecurringEvents', value)}
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

export default EventConfiguration
