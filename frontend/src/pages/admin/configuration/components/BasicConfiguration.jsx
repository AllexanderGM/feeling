import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Input, Textarea, Button, Switch, Select, SelectItem, Divider, Chip } from '@heroui/react'
import { Globe, Save, Image, Mail, Phone, MapPin, Clock, Eye, EyeOff } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const SUPPORTED_LANGUAGES = [
  { key: 'es', label: 'Español' },
  { key: 'en', label: 'English' },
  { key: 'pt', label: 'Português' }
]

const SUPPORTED_TIMEZONES = [
  { key: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { key: 'America/New_York', label: 'New York (GMT-4/-5)' },
  { key: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
  { key: 'America/Mexico_City', label: 'México (GMT-6)' }
]

const BasicConfiguration = ({ config, loading }) => {
  const { updateBasicConfiguration } = useConfiguration()

  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    supportEmail: '',
    phone: '',
    address: '',
    logoUrl: '',
    faviconUrl: '',
    defaultLanguage: 'es',
    timezone: 'America/Bogota',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxFileUploadSize: '5',
    sessionTimeout: '30',
    siteStatus: 'active'
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Cargar datos cuando llegue la configuración
  useEffect(() => {
    if (config) {
      setFormData({
        siteName: config.siteName || 'Feeling',
        siteDescription: config.siteDescription || 'Plataforma de citas y eventos',
        siteUrl: config.siteUrl || 'https://feeling.com',
        adminEmail: config.adminEmail || 'admin@feeling.com',
        supportEmail: config.supportEmail || 'support@feeling.com',
        phone: config.phone || '+57 300 123 4567',
        address: config.address || 'Bogotá, Colombia',
        logoUrl: config.logoUrl || '',
        faviconUrl: config.faviconUrl || '',
        defaultLanguage: config.defaultLanguage || 'es',
        timezone: config.timezone || 'America/Bogota',
        maintenanceMode: config.maintenanceMode || false,
        allowRegistrations: config.allowRegistrations !== false,
        requireEmailVerification: config.requireEmailVerification !== false,
        maxFileUploadSize: config.maxFileUploadSize?.toString() || '5',
        sessionTimeout: config.sessionTimeout?.toString() || '30',
        siteStatus: config.siteStatus || 'active'
      })
    }
  }, [config])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.siteName.trim()) {
      newErrors.siteName = 'El nombre del sitio es requerido'
    }

    if (!formData.siteDescription.trim()) {
      newErrors.siteDescription = 'La descripción es requerida'
    }

    if (!formData.siteUrl.trim()) {
      newErrors.siteUrl = 'La URL del sitio es requerida'
    } else if (!/^https?:\/\//.test(formData.siteUrl)) {
      newErrors.siteUrl = 'La URL debe comenzar con http:// o https://'
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'El email del administrador es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email inválido'
    }

    if (!formData.supportEmail.trim()) {
      newErrors.supportEmail = 'El email de soporte es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const configData = {
        ...formData,
        maxFileUploadSize: parseInt(formData.maxFileUploadSize),
        sessionTimeout: parseInt(formData.sessionTimeout)
      }

      await updateBasicConfiguration(configData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_basic_config', 'Error guardando configuración básica admin', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className='space-y-6'>
      {/* Información básica del sitio */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Globe className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Información Básica</p>
            <p className='text-small text-gray-400'>Configuración principal del sitio web</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Nombre del Sitio'
              placeholder='Feeling'
              value={formData.siteName}
              onChange={e => handleInputChange('siteName', e.target.value)}
              isInvalid={!!errors.siteName}
              errorMessage={errors.siteName}
              startContent={<Globe className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='URL del Sitio'
              placeholder='https://feeling.com'
              value={formData.siteUrl}
              onChange={e => handleInputChange('siteUrl', e.target.value)}
              isInvalid={!!errors.siteUrl}
              errorMessage={errors.siteUrl}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <Textarea
            label='Descripción del Sitio'
            placeholder='Plataforma de citas y eventos que conecta personas...'
            value={formData.siteDescription}
            onChange={e => handleInputChange('siteDescription', e.target.value)}
            isInvalid={!!errors.siteDescription}
            errorMessage={errors.siteDescription}
            minRows={2}
            maxRows={4}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
            }}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='URL del Logo'
              placeholder='https://ejemplo.com/logo.png'
              value={formData.logoUrl}
              onChange={e => handleInputChange('logoUrl', e.target.value)}
              startContent={<Image className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='URL del Favicon'
              placeholder='https://ejemplo.com/favicon.ico'
              value={formData.faviconUrl}
              onChange={e => handleInputChange('faviconUrl', e.target.value)}
              startContent={<Image className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Información de contacto */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <Mail className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Información de Contacto</p>
            <p className='text-small text-gray-400'>Datos de contacto y soporte</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Email del Administrador'
              placeholder='admin@feeling.com'
              value={formData.adminEmail}
              onChange={e => handleInputChange('adminEmail', e.target.value)}
              isInvalid={!!errors.adminEmail}
              errorMessage={errors.adminEmail}
              startContent={<Mail className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Email de Soporte'
              placeholder='support@feeling.com'
              value={formData.supportEmail}
              onChange={e => handleInputChange('supportEmail', e.target.value)}
              isInvalid={!!errors.supportEmail}
              errorMessage={errors.supportEmail}
              startContent={<Mail className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Teléfono'
              placeholder='+57 300 123 4567'
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              startContent={<Phone className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Dirección'
              placeholder='Bogotá, Colombia'
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              startContent={<MapPin className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuraciones básicas */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
            <Clock className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración Regional</p>
            <p className='text-small text-gray-400'>Idioma y zona horaria</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              label='Idioma por Defecto'
              selectedKeys={formData.defaultLanguage ? [formData.defaultLanguage] : []}
              onSelectionChange={keys => handleInputChange('defaultLanguage', Array.from(keys)[0] || '')}
              classNames={{
                trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                value: 'text-gray-200'
              }}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.key} value={lang.key}>
                  {lang.label}
                </SelectItem>
              ))}
            </Select>

            <Select
              label='Zona Horaria'
              selectedKeys={formData.timezone ? [formData.timezone] : []}
              onSelectionChange={keys => handleInputChange('timezone', Array.from(keys)[0] || '')}
              classNames={{
                trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                value: 'text-gray-200'
              }}>
              {SUPPORTED_TIMEZONES.map(tz => (
                <SelectItem key={tz.key} value={tz.key}>
                  {tz.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Switch
                  isSelected={formData.allowRegistrations}
                  onValueChange={value => handleInputChange('allowRegistrations', value)}
                  color='success'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Permitir Registros</span>
              </div>
              <Chip size='sm' variant='flat' color={formData.allowRegistrations ? 'success' : 'danger'}>
                {formData.allowRegistrations ? 'Activo' : 'Inactivo'}
              </Chip>
            </div>
            <p className='text-xs text-gray-400'>Permite que nuevos usuarios se registren</p>
          </div>

          <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Switch
                  isSelected={formData.requireEmailVerification}
                  onValueChange={value => handleInputChange('requireEmailVerification', value)}
                  color='primary'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Verificación de Email</span>
              </div>
              <Chip size='sm' variant='flat' color={formData.requireEmailVerification ? 'primary' : 'default'}>
                {formData.requireEmailVerification ? 'Requerida' : 'Opcional'}
              </Chip>
            </div>
            <p className='text-xs text-gray-400'>Requiere verificación de email para nuevos usuarios</p>
          </div>
        </CardBody>
      </Card>

      {/* Configuración avanzada (colapsable) */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3 cursor-pointer' onClick={() => setShowAdvanced(!showAdvanced)}>
          <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
            {showAdvanced ? <EyeOff className='w-5 h-5 text-orange-400' /> : <Eye className='w-5 h-5 text-orange-400' />}
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración Avanzada</p>
            <p className='text-small text-gray-400'>
              {showAdvanced ? 'Ocultar configuraciones técnicas' : 'Mostrar configuraciones técnicas'}
            </p>
          </div>
        </CardHeader>

        {showAdvanced && (
          <>
            <Divider className='bg-gray-700' />
            <CardBody className='gap-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  type='number'
                  label='Tamaño Máximo de Archivo (MB)'
                  placeholder='5'
                  value={formData.maxFileUploadSize}
                  onChange={e => handleInputChange('maxFileUploadSize', e.target.value)}
                  min='1'
                  max='100'
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                />

                <Input
                  type='number'
                  label='Timeout de Sesión (minutos)'
                  placeholder='30'
                  value={formData.sessionTimeout}
                  onChange={e => handleInputChange('sessionTimeout', e.target.value)}
                  min='5'
                  max='1440'
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                />
              </div>
            </CardBody>
          </>
        )}
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

export default BasicConfiguration
