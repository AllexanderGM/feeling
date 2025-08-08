import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Switch,
  Select,
  SelectItem,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import { Mail, Save, Send, Users, Eye, AlertTriangle } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const EMAIL_TEMPLATES = [
  { key: 'welcome', label: 'Bienvenida' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'announcement', label: 'Anuncio' },
  { key: 'event_reminder', label: 'Recordatorio de Evento' },
  { key: 'custom', label: 'Personalizado' }
]

const TARGET_AUDIENCES = [
  { key: 'all', label: 'Todos los usuarios' },
  { key: 'verified', label: 'Usuarios verificados' },
  { key: 'active', label: 'Usuarios activos (últimos 30 días)' },
  { key: 'premium', label: 'Usuarios premium' },
  { key: 'event_participants', label: 'Participantes de eventos' },
  { key: 'match_users', label: 'Usuarios con matches' }
]

const EmailConfiguration = ({ config, loading }) => {
  const { updateEmailConfiguration, sendMassEmail } = useConfiguration()

  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableEmailNotifications: true,
    enableWelcomeEmails: true,
    enableEventReminders: true,
    enableMatchNotifications: true,
    emailSignature: ''
  })

  const [massEmailData, setMassEmailData] = useState({
    subject: '',
    content: '',
    template: 'custom',
    targetAudience: 'all',
    includeUnsubscribe: true
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [showMassEmailModal, setShowMassEmailModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Cargar datos cuando llegue la configuración
  useEffect(() => {
    if (config) {
      setFormData({
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort?.toString() || '587',
        smtpUser: config.smtpUser || '',
        smtpPassword: config.smtpPassword || '',
        fromEmail: config.fromEmail || 'noreply@feeling.com',
        fromName: config.fromName || 'Feeling',
        enableEmailNotifications: config.enableEmailNotifications !== false,
        enableWelcomeEmails: config.enableWelcomeEmails !== false,
        enableEventReminders: config.enableEventReminders !== false,
        enableMatchNotifications: config.enableMatchNotifications !== false,
        emailSignature: config.emailSignature || ''
      })
    }
  }, [config])

  const validateEmailConfig = () => {
    const newErrors = {}

    if (!formData.smtpHost.trim()) {
      newErrors.smtpHost = 'El host SMTP es requerido'
    }

    if (!formData.smtpPort.trim()) {
      newErrors.smtpPort = 'El puerto SMTP es requerido'
    } else if (!/^\d+$/.test(formData.smtpPort)) {
      newErrors.smtpPort = 'El puerto debe ser numérico'
    }

    if (!formData.fromEmail.trim()) {
      newErrors.fromEmail = 'El email remitente es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = 'Email inválido'
    }

    if (!formData.fromName.trim()) {
      newErrors.fromName = 'El nombre remitente es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateMassEmail = () => {
    return massEmailData.subject.trim() && massEmailData.content.trim()
  }

  const handleSubmit = async () => {
    if (!validateEmailConfig()) return

    setSaving(true)
    try {
      const configData = {
        ...formData,
        smtpPort: parseInt(formData.smtpPort)
      }

      await updateEmailConfiguration(configData)
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'save_email_config', 'Error guardando configuración de email admin', { error })
    } finally {
      setSaving(false)
    }
  }

  const handleSendMassEmail = async () => {
    if (!validateMassEmail()) return

    setSending(true)
    try {
      await sendMassEmail(massEmailData)
      setShowMassEmailModal(false)
      setMassEmailData({
        subject: '',
        content: '',
        template: 'custom',
        targetAudience: 'all',
        includeUnsubscribe: true
      })
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'send_bulk_email', 'Error enviando email masivo', { error })
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleMassEmailChange = (field, value) => {
    setMassEmailData(prev => ({ ...prev, [field]: value }))
  }

  const getAudienceCount = audience => {
    const counts = {
      all: '1,234',
      verified: '987',
      active: '654',
      premium: '123',
      event_participants: '456',
      match_users: '789'
    }
    return counts[audience] || '0'
  }

  return (
    <div className='space-y-6'>
      {/* Configuración SMTP */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Mail className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración SMTP</p>
            <p className='text-small text-gray-400'>Servidor de correo saliente</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Host SMTP'
              placeholder='smtp.gmail.com'
              value={formData.smtpHost}
              onChange={e => handleInputChange('smtpHost', e.target.value)}
              isInvalid={!!errors.smtpHost}
              errorMessage={errors.smtpHost}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Puerto SMTP'
              placeholder='587'
              value={formData.smtpPort}
              onChange={e => handleInputChange('smtpPort', e.target.value)}
              isInvalid={!!errors.smtpPort}
              errorMessage={errors.smtpPort}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Usuario SMTP'
              placeholder='your-email@gmail.com'
              value={formData.smtpUser}
              onChange={e => handleInputChange('smtpUser', e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='password'
              label='Contraseña SMTP'
              placeholder='••••••••'
              value={formData.smtpPassword}
              onChange={e => handleInputChange('smtpPassword', e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuración del remitente */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <Send className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Remitente</p>
            <p className='text-small text-gray-400'>Información del remitente de emails</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Email Remitente'
              placeholder='noreply@feeling.com'
              value={formData.fromEmail}
              onChange={e => handleInputChange('fromEmail', e.target.value)}
              isInvalid={!!errors.fromEmail}
              errorMessage={errors.fromEmail}
              startContent={<Mail className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Nombre Remitente'
              placeholder='Feeling'
              value={formData.fromName}
              onChange={e => handleInputChange('fromName', e.target.value)}
              isInvalid={!!errors.fromName}
              errorMessage={errors.fromName}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <Textarea
            label='Firma de Email'
            placeholder='--&#10;Equipo de Feeling&#10;www.feeling.com'
            value={formData.emailSignature}
            onChange={e => handleInputChange('emailSignature', e.target.value)}
            minRows={3}
            maxRows={5}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
            }}
          />
        </CardBody>
      </Card>

      {/* Configuración de notificaciones */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
            <Mail className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Notificaciones por Email</p>
            <p className='text-small text-gray-400'>Configuración de emails automáticos</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableEmailNotifications}
                  onValueChange={value => handleInputChange('enableEmailNotifications', value)}
                  color='primary'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Notificaciones por Email</span>
                <Chip size='sm' variant='flat' color={formData.enableEmailNotifications ? 'primary' : 'default'}>
                  {formData.enableEmailNotifications ? 'Habilitadas' : 'Deshabilitadas'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Sistema general de notificaciones</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableWelcomeEmails}
                  onValueChange={value => handleInputChange('enableWelcomeEmails', value)}
                  color='success'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Emails de Bienvenida</span>
                <Chip size='sm' variant='flat' color={formData.enableWelcomeEmails ? 'success' : 'default'}>
                  {formData.enableWelcomeEmails ? 'Activos' : 'Inactivos'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Email automático para nuevos usuarios</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableEventReminders}
                  onValueChange={value => handleInputChange('enableEventReminders', value)}
                  color='warning'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Recordatorios de Eventos</span>
                <Chip size='sm' variant='flat' color={formData.enableEventReminders ? 'warning' : 'default'}>
                  {formData.enableEventReminders ? 'Activos' : 'Inactivos'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Recordatorios antes de eventos</p>
            </div>

            <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-3'>
                <Switch
                  isSelected={formData.enableMatchNotifications}
                  onValueChange={value => handleInputChange('enableMatchNotifications', value)}
                  color='secondary'
                  size='sm'
                />
                <span className='text-sm font-medium text-gray-200'>Notificaciones de Matches</span>
                <Chip size='sm' variant='flat' color={formData.enableMatchNotifications ? 'secondary' : 'default'}>
                  {formData.enableMatchNotifications ? 'Activas' : 'Inactivas'}
                </Chip>
              </div>
              <p className='text-xs text-gray-400'>Notificaciones de nuevos matches</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Email masivo */}
      <Card className='bg-gradient-to-br from-orange-900/20 via-orange-800/10 to-red-900/20 border-orange-700/50'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
            <Users className='w-5 h-5 text-orange-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-orange-200'>Email Masivo</p>
            <p className='text-small text-orange-300/80'>Enviar emails a múltiples usuarios</p>
          </div>
        </CardHeader>
        <Divider className='bg-orange-700/50' />
        <CardBody>
          <div className='text-center'>
            <p className='text-sm text-orange-200/80 mb-4'>Envía comunicaciones importantes a grupos específicos de usuarios</p>
            <Button color='warning' onPress={() => setShowMassEmailModal(true)} startContent={<Send className='w-4 h-4' />}>
              Crear Email Masivo
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Botones de acción */}
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

      {/* Modal de email masivo */}
      <Modal
        isOpen={showMassEmailModal}
        onClose={() => setShowMassEmailModal(false)}
        placement='center'
        size='4xl'
        scrollBehavior='inside'
        classNames={{
          base: 'bg-gray-800 border border-gray-700',
          closeButton: 'text-gray-400 hover:text-gray-200'
        }}>
        <ModalContent>
          <ModalHeader className='text-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
                <Send className='w-5 h-5 text-orange-400' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>Crear Email Masivo</h2>
                <p className='text-sm text-gray-400 font-normal'>Envía un mensaje a múltiples usuarios</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className='gap-4'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Select
                  label='Plantilla'
                  selectedKeys={massEmailData.template ? [massEmailData.template] : []}
                  onSelectionChange={keys => handleMassEmailChange('template', Array.from(keys)[0] || '')}
                  classNames={{
                    trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                    value: 'text-gray-200'
                  }}>
                  {EMAIL_TEMPLATES.map(template => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label='Audiencia'
                  selectedKeys={massEmailData.targetAudience ? [massEmailData.targetAudience] : []}
                  onSelectionChange={keys => handleMassEmailChange('targetAudience', Array.from(keys)[0] || '')}
                  classNames={{
                    trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                    value: 'text-gray-200'
                  }}>
                  {TARGET_AUDIENCES.map(audience => (
                    <SelectItem key={audience.key} value={audience.key} description={`~${getAudienceCount(audience.key)} usuarios`}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Input
                label='Asunto'
                placeholder='Asunto del email...'
                value={massEmailData.subject}
                onChange={e => handleMassEmailChange('subject', e.target.value)}
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                }}
              />

              <Textarea
                label='Contenido'
                placeholder='Escribe el contenido del email...'
                value={massEmailData.content}
                onChange={e => handleMassEmailChange('content', e.target.value)}
                minRows={6}
                maxRows={10}
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                }}
              />

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={massEmailData.includeUnsubscribe}
                    onValueChange={value => handleMassEmailChange('includeUnsubscribe', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Incluir enlace de desuscripción</span>
                </div>
                <Chip size='sm' variant='flat' color='primary'>
                  Recomendado
                </Chip>
              </div>

              {/* Advertencia */}
              <div className='flex items-start gap-3 p-4 bg-red-900/20 rounded-lg border border-red-700/50'>
                <AlertTriangle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-300'>Importante</p>
                  <p className='text-xs text-red-200/80'>
                    Asegúrate de revisar el contenido antes de enviar. Los emails masivos no se pueden deshacer.
                  </p>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant='bordered'
              onPress={() => setShowPreview(!showPreview)}
              className='border-gray-600 text-gray-300'
              startContent={<Eye className='w-4 h-4' />}>
              {showPreview ? 'Ocultar' : 'Vista Previa'}
            </Button>
            <Button variant='bordered' onPress={() => setShowMassEmailModal(false)} className='border-gray-600 text-gray-300'>
              Cancelar
            </Button>
            <Button
              color='warning'
              onPress={handleSendMassEmail}
              isLoading={sending}
              isDisabled={!validateMassEmail()}
              startContent={!sending && <Send className='w-4 h-4' />}>
              Enviar Email
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default EmailConfiguration
