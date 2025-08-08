import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Input, Button, Switch, Divider, Chip } from '@heroui/react'
import { Share2, Save, Facebook, Twitter, Instagram, Youtube, Linkedin, ExternalLink } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const SocialMediaConfiguration = ({ config, loading }) => {
  const { updateSocialMediaConfiguration } = useConfiguration()

  const [formData, setFormData] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    tiktok: '',
    whatsapp: '',
    telegram: '',
    enableSocialLogin: true,
    enableSocialSharing: true,
    showSocialLinksInFooter: true,
    enableOpenGraph: true
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Cargar datos cuando llegue la configuración
  useEffect(() => {
    if (config) {
      setFormData({
        facebook: config.facebook || '',
        twitter: config.twitter || '',
        instagram: config.instagram || '',
        youtube: config.youtube || '',
        linkedin: config.linkedin || '',
        tiktok: config.tiktok || '',
        whatsapp: config.whatsapp || '',
        telegram: config.telegram || '',
        enableSocialLogin: config.enableSocialLogin !== false,
        enableSocialSharing: config.enableSocialSharing !== false,
        showSocialLinksInFooter: config.showSocialLinksInFooter !== false,
        enableOpenGraph: config.enableOpenGraph !== false
      })
    }
  }, [config])

  const validateUrl = url => {
    if (!url) return true // URLs vacías son válidas
    return /^https?:\/\//.test(url)
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar URLs de redes sociales
    const socialFields = ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'tiktok']

    socialFields.forEach(field => {
      if (formData[field] && !validateUrl(formData[field])) {
        newErrors[field] = 'URL inválida (debe comenzar con http:// o https://)'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      await updateSocialMediaConfiguration(formData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_social_config', 'Error guardando configuración de redes sociales admin', { error })
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

  const socialNetworks = [
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <Facebook className='w-4 h-4' />,
      placeholder: 'https://facebook.com/feeling',
      color: 'text-blue-500'
    },
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: <Twitter className='w-4 h-4' />,
      placeholder: 'https://twitter.com/feeling',
      color: 'text-sky-500'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: <Instagram className='w-4 h-4' />,
      placeholder: 'https://instagram.com/feeling',
      color: 'text-pink-500'
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: <Youtube className='w-4 h-4' />,
      placeholder: 'https://youtube.com/@feeling',
      color: 'text-red-500'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className='w-4 h-4' />,
      placeholder: 'https://linkedin.com/company/feeling',
      color: 'text-blue-600'
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      icon: <Share2 className='w-4 h-4' />,
      placeholder: 'https://tiktok.com/@feeling',
      color: 'text-gray-400'
    }
  ]

  return (
    <div className='space-y-6'>
      {/* Enlaces de redes sociales */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
            <Share2 className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Enlaces de Redes Sociales</p>
            <p className='text-small text-gray-400'>Configura los perfiles oficiales de la plataforma</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {socialNetworks.map(network => (
              <Input
                key={network.key}
                label={network.label}
                placeholder={network.placeholder}
                value={formData[network.key]}
                onChange={e => handleInputChange(network.key, e.target.value)}
                isInvalid={!!errors[network.key]}
                errorMessage={errors[network.key]}
                startContent={<div className={network.color}>{network.icon}</div>}
                endContent={
                  formData[network.key] && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      as='a'
                      href={formData[network.key]}
                      target='_blank'
                      rel='noopener noreferrer'>
                      <ExternalLink className='w-4 h-4 text-gray-400' />
                    </Button>
                  )
                }
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                }}
              />
            ))}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
            <Input
              label='WhatsApp'
              placeholder='+57 300 123 4567'
              value={formData.whatsapp}
              onChange={e => handleInputChange('whatsapp', e.target.value)}
              startContent={
                <div className='text-green-500'>
                  <Share2 className='w-4 h-4' />
                </div>
              }
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Telegram'
              placeholder='@feeling_oficial'
              value={formData.telegram}
              onChange={e => handleInputChange('telegram', e.target.value)}
              startContent={
                <div className='text-blue-400'>
                  <Share2 className='w-4 h-4' />
                </div>
              }
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuraciones de funcionalidad social */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <Share2 className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Funcionalidades Sociales</p>
            <p className='text-small text-gray-400'>Configuración de características sociales</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableSocialLogin}
                    onValueChange={value => handleInputChange('enableSocialLogin', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Login Social</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableSocialLogin ? 'primary' : 'default'}>
                  {formData.enableSocialLogin ? 'Habilitado' : 'Deshabilitado'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Permite login con Google, Facebook, etc.</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableSocialSharing}
                    onValueChange={value => handleInputChange('enableSocialSharing', value)}
                    color='success'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Compartir en Redes</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableSocialSharing ? 'success' : 'default'}>
                  {formData.enableSocialSharing ? 'Habilitado' : 'Deshabilitado'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Botones para compartir eventos y perfiles</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.showSocialLinksInFooter}
                    onValueChange={value => handleInputChange('showSocialLinksInFooter', value)}
                    color='warning'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Enlaces en Footer</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.showSocialLinksInFooter ? 'warning' : 'default'}>
                  {formData.showSocialLinksInFooter ? 'Visible' : 'Oculto'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Mostrar enlaces sociales en el pie de página</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableOpenGraph}
                    onValueChange={value => handleInputChange('enableOpenGraph', value)}
                    color='secondary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Open Graph</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableOpenGraph ? 'secondary' : 'default'}>
                  {formData.enableOpenGraph ? 'Habilitado' : 'Deshabilitado'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Metadatos para vista previa en redes sociales</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Vista previa de enlaces activos */}
      {Object.values(formData).some(value => typeof value === 'string' && value.includes('http')) && (
        <Card className='bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-blue-900/20 border-purple-700/50'>
          <CardHeader>
            <div className='flex gap-3'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                <ExternalLink className='w-5 h-5 text-purple-400' />
              </div>
              <div className='flex flex-col'>
                <p className='text-md font-medium text-purple-300'>Enlaces Configurados</p>
                <p className='text-small text-purple-200/80'>Redes sociales activas</p>
              </div>
            </div>
          </CardHeader>
          <Divider className='bg-purple-700/50' />
          <CardBody>
            <div className='flex flex-wrap gap-2'>
              {socialNetworks.map(network => {
                if (!formData[network.key]) return null
                return (
                  <Chip
                    key={network.key}
                    startContent={<div className={network.color}>{network.icon}</div>}
                    variant='flat'
                    color='primary'
                    size='sm'
                    as='a'
                    href={formData[network.key]}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='cursor-pointer'>
                    {network.label}
                  </Chip>
                )
              })}
              {formData.whatsapp && (
                <Chip
                  startContent={
                    <div className='text-green-500'>
                      <Share2 className='w-4 h-4' />
                    </div>
                  }
                  variant='flat'
                  color='success'
                  size='sm'>
                  WhatsApp
                </Chip>
              )}
              {formData.telegram && (
                <Chip
                  startContent={
                    <div className='text-blue-400'>
                      <Share2 className='w-4 h-4' />
                    </div>
                  }
                  variant='flat'
                  color='primary'
                  size='sm'>
                  Telegram
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      )}

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

export default SocialMediaConfiguration
