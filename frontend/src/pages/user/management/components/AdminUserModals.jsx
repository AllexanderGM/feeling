import { useState, useCallback, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider
} from '@heroui/react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Star,
  Eye,
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  UserX,
  Send,
  Globe,
  Search,
  MessageCircle,
  Lock,
  UserIcon,
  Tags,
  Clock,
  Check,
  Trash2
} from 'lucide-react'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate, calculateAgeFromJavaDate } from '@utils/dateUtils.js'

// Helper function to calculate age
const calculateAge = birthDate => {
  if (!birthDate) return 'N/A'
  try {
    return calculateAgeFromJavaDate(birthDate)
  } catch (error) {
    return 'N/A'
  }
}

const AdminUserModals = memo(
  ({
    // Modal states
    isViewModalOpen,
    isEmailModalOpen,
    isRejectModalOpen,
    isDeactivateModalOpen,
    isApproveModalOpen,
    isReactivateModalOpen,
    onCloseModals,

    // User data
    selectedUser,

    // Actions
    onSendEmail,
    onRejectUser,
    onDeactivateUser,
    onApproveUser,
    onReactivateUser,

    // Loading states
    loading = false
  }) => {
    // Estados locales para los formularios
    const [emailForm, setEmailForm] = useState({
      subject: '',
      message: '',
      template: 'custom'
    })

    // Estados simplificados para confirmación
    const [confirmationReason, setConfirmationReason] = useState('')

    // Reset forms when modals close
    const handleCloseModals = useCallback(() => {
      setEmailForm({ subject: '', message: '', template: 'custom' })
      setConfirmationReason('')
      onCloseModals()
    }, [onCloseModals])

    // Email templates predefinidos
    const emailTemplates = {
      welcome: {
        subject: 'Bienvenido a Feeling',
        message: 'Nos complace tenerte en nuestra plataforma. Tu perfil ha sido aprobado y ya puedes comenzar a hacer matches.'
      },
      verification: {
        subject: 'Verificación de cuenta requerida',
        message:
          'Para completar tu registro en Feeling, necesitamos que verifiques tu cuenta. Por favor revisa tu email y sigue las instrucciones.'
      },
      profile_incomplete: {
        subject: 'Completa tu perfil en Feeling',
        message:
          'Te falta completar algunos datos importantes en tu perfil para poder hacer matches. Te invitamos a completar tu información.'
      },
      custom: {
        subject: '',
        message: ''
      }
    }

    // Razón genérica para acciones sin motivos personalizados
    const genericModerationReason = 'Acción administrativa - Sistema de motivos en desarrollo'

    // Razones predefinidas (deshabilitadas)
    const rejectReasons = [
      { value: 'inappropriate_content', label: 'Contenido inapropiado' },
      { value: 'fake_profile', label: 'Perfil falso o sospechoso' },
      { value: 'incomplete_information', label: 'Información incompleta' },
      { value: 'terms_violation', label: 'Violación de términos de uso' },
      { value: 'underage', label: 'Menor de edad' },
      { value: 'duplicate_account', label: 'Cuenta duplicada' },
      { value: 'other', label: 'Otra razón (especificar)' }
    ]

    // Razones predefinidas para desactivación (deshabilitadas)
    const deactivateReasons = [
      { value: 'admin_action', label: 'Acción administrativa' },
      { value: 'user_request', label: 'Solicitud del usuario' },
      { value: 'policy_violation', label: 'Violación de políticas' },
      { value: 'security_concern', label: 'Problema de seguridad' },
      { value: 'spam_behavior', label: 'Comportamiento spam' },
      { value: 'harassment', label: 'Acoso a otros usuarios' },
      { value: 'other', label: 'Otra razón (especificar)' }
    ]

    // Handle template change
    const handleTemplateChange = useCallback(template => {
      setEmailForm(prev => ({
        ...prev,
        template,
        subject: emailTemplates[template]?.subject || '',
        message: emailTemplates[template]?.message || ''
      }))
    }, [])

    // Handle form submissions
    const handleSendEmail = useCallback(async () => {
      if (!selectedUser || !emailForm.subject.trim() || !emailForm.message.trim()) return

      try {
        await onSendEmail(selectedUser.id, {
          subject: emailForm.subject,
          message: emailForm.message,
          template: emailForm.template
        })
        handleCloseModals()
      } catch (error) {
        console.error('Error sending email:', error)
      }
    }, [selectedUser, emailForm, onSendEmail, handleCloseModals])

    const handleRejectUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onRejectUser(selectedUser.id, genericModerationReason)
        handleCloseModals()
      } catch (error) {
        console.error('Error rejecting user:', error)
      }
    }, [selectedUser, genericModerationReason, onRejectUser, handleCloseModals])

    const handleDeactivateUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onDeactivateUser(selectedUser.id, genericModerationReason)
        handleCloseModals()
      } catch (error) {
        console.error('Error deactivating user:', error)
      }
    }, [selectedUser, genericModerationReason, onDeactivateUser, handleCloseModals])

    const handleApproveUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onApproveUser(selectedUser.id)
        handleCloseModals()
      } catch (error) {
        console.error('Error approving user:', error)
      }
    }, [selectedUser, onApproveUser, handleCloseModals])

    const handleReactivateUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onReactivateUser(selectedUser.id)
        handleCloseModals()
      } catch (error) {
        console.error('Error reactivating user:', error)
      }
    }, [selectedUser, onReactivateUser, handleCloseModals])

    if (!selectedUser) return null

    return (
      <>
        {/* Modal para ver perfil completo del usuario */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={handleCloseModals}
          size='5xl'
          scrollBehavior='inside'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700 max-h-[90vh]',
            header: 'border-b border-gray-700 flex-shrink-0',
            body: 'py-4 px-6 overflow-y-auto',
            footer: 'border-t border-gray-700 flex-shrink-0'
          }}>
          <ModalContent className='max-h-[90vh]'>
            <ModalHeader className='flex flex-col gap-1 pb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <User className='w-4 h-4 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>
                    Perfil de {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                  </h3>
                  <p className='text-sm text-gray-400'>Vista completa para administrador</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4 px-6 py-0'>
              {/* Header del usuario - más compacto */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-start gap-4'>
                  <div className='flex flex-col items-center gap-2'>
                    <Avatar
                      src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                      className='w-16 h-16'
                      icon={<UserIcon className='w-8 h-8 text-default-500' />}
                    />
                    <Chip size='sm' color={selectedUser.status?.active ? 'success' : 'danger'} variant='flat'>
                      {selectedUser.status?.active ? 'Activo' : 'Inactivo'}
                    </Chip>
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-lg font-semibold text-white mb-3'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </h4>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <p className='text-xs font-medium text-gray-400'>Email</p>
                        <p className='text-gray-200'>{selectedUser.profile?.email}</p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-400'>Documento</p>
                        <p className='text-gray-200'>{selectedUser.profile?.document || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-400'>Teléfono</p>
                        <p className='text-gray-200'>
                          {selectedUser.profile?.phone
                            ? `${selectedUser.profile.phoneCode || ''} ${selectedUser.profile.phone}`.trim()
                            : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-400'>Edad</p>
                        <p className='text-gray-200'>{calculateAge(selectedUser.profile?.dateOfBirth)} años</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas del perfil - más compacto */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center'>
                    <Star className='w-3 h-3 text-purple-400' />
                  </div>
                  <h5 className='text-base font-semibold text-white'>Métricas del Perfil</h5>
                </div>
                <div className='grid grid-cols-4 gap-3'>
                  <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center'>
                    <div className='text-base font-bold text-blue-300'>{selectedUser.metrics?.profileViews || 0}</div>
                    <div className='text-xs text-gray-400'>Visualizaciones</div>
                  </div>
                  <div className='bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 text-center'>
                    <div className='text-base font-bold text-pink-300'>{selectedUser.metrics?.likesReceived || 0}</div>
                    <div className='text-xs text-gray-400'>Likes</div>
                  </div>
                  <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center'>
                    <div className='text-base font-bold text-yellow-300'>{selectedUser.metrics?.popularityScore || 0}</div>
                    <div className='text-xs text-gray-400'>Popularidad</div>
                  </div>
                  <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center'>
                    <div className='text-base font-bold text-green-300'>{selectedUser.metrics?.profileCompleteness || 0}%</div>
                    <div className='text-xs text-gray-400'>Completitud</div>
                  </div>
                </div>
              </div>

              {/* Información completa en una sola sección */}
              <div className='grid grid-cols-2 gap-4'>
                {/* Ubicación y demografía */}
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <MapPin className='w-4 h-4 text-green-400' />
                    <h5 className='text-sm font-semibold text-white'>Ubicación</h5>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <div>
                      <p className='text-xs text-gray-400'>País</p>
                      <p className='text-gray-200'>{selectedUser.profile?.country || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400'>Ciudad</p>
                      <p className='text-gray-200'>{selectedUser.profile?.city || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400'>Categoría de Interés</p>
                      <Chip size='sm' color={USER_INTEREST_COLORS[selectedUser.profile?.categoryInterest] || 'default'} variant='flat'>
                        {selectedUser.profile?.categoryInterest || 'No especificado'}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Estado de la cuenta */}
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Shield className='w-4 h-4 text-blue-400' />
                    <h5 className='text-sm font-semibold text-white'>Estado</h5>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>Verificado:</span>
                      <Chip size='sm' color={selectedUser.status?.verified ? 'success' : 'danger'} variant='flat'>
                        {selectedUser.status?.verified ? 'Sí' : 'No'}
                      </Chip>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>Aprobado:</span>
                      <Chip size='sm' color={selectedUser.status?.approved ? 'success' : 'warning'} variant='flat'>
                        {selectedUser.status?.approved ? 'Sí' : 'Pendiente'}
                      </Chip>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>Rol:</span>
                      <Chip size='sm' color={USER_ROLE_COLORS[selectedUser.status?.role] || 'default'} variant='flat'>
                        {selectedUser.status?.role || 'CLIENT'}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información temporal */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <Calendar className='w-4 h-4 text-purple-400' />
                  <h5 className='text-sm font-semibold text-white'>Información Temporal</h5>
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-xs text-gray-400'>Fecha de Registro</p>
                    <p className='text-gray-200'>{formatJavaDateForDisplay(selectedUser.status?.createdAt)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Días desde registro</p>
                    <p className='text-gray-200'>{daysSinceJavaDate(selectedUser.status?.createdAt)} días</p>
                  </div>
                </div>
              </div>

              {/* Descripción del perfil */}
              {selectedUser.profile?.description && (
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <MessageCircle className='w-4 h-4 text-indigo-400' />
                    <h5 className='text-sm font-semibold text-white'>Descripción del Perfil</h5>
                  </div>
                  <div className='bg-gray-900 p-3 rounded-lg'>
                    <p className='text-sm text-gray-200 whitespace-pre-wrap'>{selectedUser.profile.description}</p>
                  </div>
                </div>
              )}

              {/* Espaciado adicional al final */}
              <div className='h-4'></div>
            </ModalBody>
            <ModalFooter className='pt-4'>
              <Button color='danger' variant='light' onPress={handleCloseModals}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para enviar correo electrónico */}
        <Modal
          isOpen={isEmailModalOpen}
          onClose={handleCloseModals}
          size='2xl'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                  <Mail className='w-4 h-4 text-purple-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Enviar Correo Electrónico</h3>
                  <p className='text-sm text-gray-400'>Sistema de notificaciones</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4'>
              {/* Advertencia sobre correos electrónicos */}
              <div className='bg-orange-500/20 border border-orange-500/40 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-orange-400' />
                  <span className='text-sm font-medium text-orange-300'>Sistema de Correos en Desarrollo</span>
                </div>
                <p className='text-xs text-orange-200'>
                  El sistema de envío de correos electrónicos aún está en desarrollo. Las plantillas y notificaciones automáticas estarán
                  disponibles próximamente.
                </p>
              </div>

              {/* Información del destinatario */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <User className='w-4 h-4 text-purple-400' />
                  <span className='text-sm font-medium text-gray-200'>Destinatario</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Avatar
                    src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.profile?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip size='sm' color={selectedUser.status?.active ? 'success' : 'danger'} variant='flat'>
                        {selectedUser.status?.active ? 'Activo' : 'Inactivo'}
                      </Chip>
                      {selectedUser.status?.verified && (
                        <Chip size='sm' color='success' variant='dot'>
                          Verificado
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plantillas y formulario (deshabilitados) */}
              <div className='space-y-4'>
                <Select
                  label='Plantilla de correo'
                  placeholder='Selección de plantillas no disponible'
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}>
                  {Object.entries(emailTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {key === 'custom'
                        ? 'Personalizado'
                        : key === 'welcome'
                          ? 'Bienvenida'
                          : key === 'verification'
                            ? 'Verificación'
                            : 'Perfil incompleto'}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label='Asunto'
                  placeholder='Personalización de asunto no disponible'
                  isDisabled
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700 opacity-50'
                  }}
                />

                <Textarea
                  label='Mensaje'
                  placeholder='Editor de mensaje no disponible'
                  isDisabled
                  minRows={4}
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700 opacity-50'
                  }}
                />

                <div className='bg-gray-800 border border-gray-600 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Clock className='w-3 h-3 text-gray-400' />
                    <span className='text-xs font-medium text-gray-400'>Próximamente disponible</span>
                  </div>
                  <p className='text-xs text-gray-300'>
                    📧 Plantillas personalizables, editor de contenido y envío automático de notificaciones
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cerrar
              </Button>
              <Button color='primary' isDisabled startContent={<Lock className='w-4 h-4' />}>
                Enviar Correo (No disponible)
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para desaprobar usuario */}
        <Modal
          isOpen={isRejectModalOpen}
          onClose={handleCloseModals}
          size='lg'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
                  <X className='w-4 h-4 text-orange-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Desaprobar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4'>
              {/* Advertencia sobre motivos personalizados */}
              <div className='bg-orange-500/20 border border-orange-500/40 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-orange-400' />
                  <span className='text-sm font-medium text-orange-300'>Sistema de Motivos en Desarrollo</span>
                </div>
                <p className='text-xs text-orange-200'>
                  La acción de desaprobación está disponible, pero el sistema de motivos personalizados aún está en desarrollo. Se aplicará
                  un motivo genérico hasta que esté implementado.
                </p>
              </div>

              {/* Información del usuario */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <Avatar
                    src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Motivos (deshabilitados) */}
              <div className='space-y-4'>
                <Select
                  label='Motivo de desaprobación'
                  placeholder='Selección de motivos no disponible'
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}>
                  {rejectReasons.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className='bg-gray-800 border border-gray-600 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Clock className='w-3 h-3 text-gray-400' />
                    <span className='text-xs font-medium text-gray-400'>Motivo temporal</span>
                  </div>
                  <p className='text-xs text-gray-300'>{genericModerationReason}</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button color='warning' onPress={handleRejectUser} isLoading={loading} startContent={<X className='w-4 h-4' />}>
                Desaprobar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para desactivar usuario */}
        <Modal
          isOpen={isDeactivateModalOpen}
          onClose={handleCloseModals}
          size='lg'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center'>
                  <UserX className='w-4 h-4 text-red-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Desactivar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4'>
              {/* Advertencia sobre motivos personalizados */}
              <div className='bg-orange-500/20 border border-orange-500/40 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-orange-400' />
                  <span className='text-sm font-medium text-orange-300'>Sistema de Motivos en Desarrollo</span>
                </div>
                <p className='text-xs text-orange-200'>
                  La acción de desactivación está disponible, pero el sistema de motivos personalizados aún está en desarrollo. Se aplicará
                  un motivo genérico hasta que esté implementado.
                </p>
              </div>

              {/* Información de reversibilidad */}
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckCircle className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-blue-300'>Acción Reversible</span>
                </div>
                <p className='text-xs text-blue-200'>
                  A diferencia de la eliminación, la desactivación es reversible. Los usuarios desactivados pueden ser reactivados
                  posteriormente manteniendo todos sus datos.
                </p>
              </div>

              {/* Información del usuario */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <Avatar
                    src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.profile?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip size='sm' color={selectedUser.status?.active ? 'success' : 'danger'} variant='flat'>
                        {selectedUser.status?.active ? 'Activo' : 'Inactivo'}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivos (deshabilitados) */}
              <div className='space-y-4'>
                <Select
                  label='Motivo de desactivación'
                  placeholder='Selección de motivos no disponible'
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}>
                  {deactivateReasons.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className='bg-gray-800 border border-gray-600 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Clock className='w-3 h-3 text-gray-400' />
                    <span className='text-xs font-medium text-gray-400'>Motivo temporal</span>
                  </div>
                  <p className='text-xs text-gray-300'>{genericModerationReason}</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button color='danger' onPress={handleDeactivateUser} isLoading={loading} startContent={<UserX className='w-4 h-4' />}>
                Desactivar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para aprobar usuario */}
        <Modal
          isOpen={isApproveModalOpen}
          onClose={handleCloseModals}
          size='lg'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Aprobar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4'>
              {/* Información de la acción */}
              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Check className='w-4 h-4 text-green-400' />
                  <span className='text-sm font-medium text-green-300'>Acción de Aprobación</span>
                </div>
                <p className='text-xs text-green-200'>
                  Esta acción aprobará el perfil del usuario. El usuario será notificado y podrá acceder completamente a todas las
                  funcionalidades de la plataforma.
                </p>
              </div>

              {/* Información del usuario */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <User className='w-4 h-4 text-green-400' />
                  <span className='text-sm font-medium text-gray-200'>Usuario a Aprobar</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Avatar
                    src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.profile?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip size='sm' color={selectedUser.status?.verified ? 'success' : 'warning'} variant='flat'>
                        {selectedUser.status?.verified ? 'Verificado' : 'Sin verificar'}
                      </Chip>
                      <Chip size='sm' color='warning' variant='dot'>
                        Pendiente aprobación
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmación */}
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Shield className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-blue-300'>Confirmación</span>
                </div>
                <p className='text-xs text-blue-200'>
                  ¿Confirmas que deseas aprobar este usuario? Una vez aprobado, tendrá acceso completo a la plataforma y podrá interactuar
                  con otros usuarios.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button color='success' onPress={handleApproveUser} isLoading={loading} startContent={<CheckCircle className='w-4 h-4' />}>
                Aprobar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para reactivar usuario */}
        <Modal
          isOpen={isReactivateModalOpen}
          onClose={handleCloseModals}
          size='lg'
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Reactivar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-4'>
              {/* Advertencia de reactivación */}
              <div className='bg-blue-500/20 border border-blue-500/40 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-blue-300'>Acción de Reactivación</span>
                </div>
                <p className='text-xs text-blue-200'>
                  Vas a reactivar un usuario que estaba desactivado. El usuario recuperará acceso completo a la plataforma y podrá volver a
                  interactuar normalmente.
                </p>
              </div>

              {/* Información del usuario */}
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <User className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-gray-200'>Usuario a Reactivar</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Avatar
                    src={selectedUser.profile?.mainImage || selectedUser.profile?.image}
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.profile?.name} {selectedUser.profile?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.profile?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip size='sm' color='danger' variant='flat'>
                        Desactivado
                      </Chip>
                      {selectedUser.status?.verified && (
                        <Chip size='sm' color='success' variant='dot'>
                          Verificado
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validación de reactivación */}
              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Shield className='w-4 h-4 text-green-400' />
                  <span className='text-sm font-medium text-green-300'>Validación de Seguridad</span>
                </div>
                <div className='space-y-2 text-xs text-green-200'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-3 h-3 text-green-400' />
                    <span>El usuario mantiene todos sus datos preservados</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-3 h-3 text-green-400' />
                    <span>Los matches y conversaciones se restaurarán</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-3 h-3 text-green-400' />
                    <span>El perfil volverá a ser visible para otros usuarios</span>
                  </div>
                </div>
              </div>

              {/* Confirmación */}
              <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckCircle className='w-4 h-4 text-gray-400' />
                  <span className='text-sm font-medium text-gray-300'>Confirmación de Reactivación</span>
                </div>
                <p className='text-xs text-gray-300'>
                  ¿Confirmas que deseas reactivar este usuario? Una vez reactivado, podrá acceder inmediatamente a todas las funcionalidades
                  de la plataforma.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button color='primary' onPress={handleReactivateUser} isLoading={loading} startContent={<CheckCircle className='w-4 h-4' />}>
                Reactivar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)

AdminUserModals.displayName = 'AdminUserModals'

export default AdminUserModals
