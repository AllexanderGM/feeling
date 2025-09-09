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
    onCloseModals,

    // User data
    selectedUser,

    // Actions
    onSendEmail,
    onRejectUser,
    onDeactivateUser,

    // Loading states
    loading = false
  }) => {
    // Estados locales para los formularios
    const [emailForm, setEmailForm] = useState({
      subject: '',
      message: '',
      template: 'custom'
    })

    const [rejectForm, setRejectForm] = useState({
      reason: '',
      customReason: ''
    })

    const [deactivateForm, setDeactivateForm] = useState({
      reason: 'admin_action',
      customReason: ''
    })

    // Reset forms when modals close
    const handleCloseModals = useCallback(() => {
      setEmailForm({ subject: '', message: '', template: 'custom' })
      setRejectForm({ reason: '', customReason: '' })
      setDeactivateForm({ reason: 'admin_action', customReason: '' })
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

    // Razones predefinidas para rechazo
    const rejectReasons = [
      { value: 'inappropriate_content', label: 'Contenido inapropiado' },
      { value: 'fake_profile', label: 'Perfil falso o sospechoso' },
      { value: 'incomplete_information', label: 'Información incompleta' },
      { value: 'terms_violation', label: 'Violación de términos de uso' },
      { value: 'underage', label: 'Menor de edad' },
      { value: 'duplicate_account', label: 'Cuenta duplicada' },
      { value: 'other', label: 'Otra razón (especificar)' }
    ]

    // Razones predefinidas para desactivación
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
      if (!selectedUser || !rejectForm.reason) return

      const reason = rejectForm.reason === 'other' ? rejectForm.customReason : rejectForm.reason
      if (!reason.trim()) return

      try {
        await onRejectUser(selectedUser.id, reason)
        handleCloseModals()
      } catch (error) {
        console.error('Error rejecting user:', error)
      }
    }, [selectedUser, rejectForm, onRejectUser, handleCloseModals])

    const handleDeactivateUser = useCallback(async () => {
      if (!selectedUser || !deactivateForm.reason) return

      const reason = deactivateForm.reason === 'other' ? deactivateForm.customReason : deactivateForm.reason
      if (!reason.trim()) return

      try {
        await onDeactivateUser(selectedUser.id, reason)
        handleCloseModals()
      } catch (error) {
        console.error('Error deactivating user:', error)
      }
    }, [selectedUser, deactivateForm, onDeactivateUser, handleCloseModals])

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
                  <p className='text-sm text-gray-400'>
                    Para: {selectedUser.profile?.name} {selectedUser.profile?.lastName} ({selectedUser.profile?.email})
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className='space-y-6'>
              {/* Advertencia prominente de funcionalidad no disponible */}
              <div className='bg-orange-500/20 border-2 border-orange-500/40 rounded-lg p-6 text-center'>
                <div className='w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <AlertTriangle className='w-8 h-8 text-orange-400' />
                </div>
                <h4 className='text-lg font-semibold text-orange-300 mb-2'>Funcionalidad No Disponible</h4>
                <p className='text-sm text-orange-200 mb-4'>
                  El sistema de envío de correos electrónicos aún está en desarrollo. Esta funcionalidad estará disponible en próximas
                  versiones de la aplicación.
                </p>
                <div className='bg-orange-500/10 rounded-lg p-3'>
                  <p className='text-xs text-orange-300 font-medium'>
                    📧 Próximamente: Plantillas predefinidas, correos personalizados y notificaciones automáticas
                  </p>
                </div>
              </div>

              {/* Formulario deshabilitado para vista previa */}
              <div className='opacity-50 pointer-events-none space-y-4'>
                <Select
                  label='Plantilla de correo'
                  placeholder='Selecciona una plantilla'
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700'
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
                  placeholder='Ejemplo: Bienvenido a Feeling'
                  isDisabled
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700'
                  }}
                />

                <Textarea
                  label='Mensaje'
                  placeholder='Ejemplo: Hola [Nombre], nos complace tenerte en nuestra plataforma...'
                  isDisabled
                  minRows={6}
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700'
                  }}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={handleCloseModals}>
                Cerrar
              </Button>
              <Button color='primary' isDisabled startContent={<Send className='w-4 h-4' />}>
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
              <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-orange-400' />
                  <span className='text-sm font-medium text-orange-300'>Acción de moderación</span>
                </div>
                <p className='text-xs text-orange-200'>
                  Esta acción desaprobará el perfil del usuario. El usuario será notificado y su cuenta quedará en estado pendiente hasta
                  una nueva revisión.
                </p>
              </div>

              <Select
                label='Motivo de desaprobación'
                placeholder='Selecciona un motivo'
                value={rejectForm.reason}
                onChange={e => setRejectForm(prev => ({ ...prev, reason: e.target.value }))}
                classNames={{
                  base: 'max-w-full',
                  trigger: 'bg-gray-800 border-gray-700'
                }}>
                {rejectReasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </Select>

              {rejectForm.reason === 'other' && (
                <Textarea
                  label='Especifica la razón'
                  placeholder='Describe el motivo de desaprobación...'
                  value={rejectForm.customReason}
                  onChange={e => setRejectForm(prev => ({ ...prev, customReason: e.target.value }))}
                  minRows={3}
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700'
                  }}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button
                color='warning'
                onPress={handleRejectUser}
                isLoading={loading}
                isDisabled={!rejectForm.reason || (rejectForm.reason === 'other' && !rejectForm.customReason.trim())}
                startContent={<X className='w-4 h-4' />}>
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
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='w-4 h-4 text-red-400' />
                  <span className='text-sm font-medium text-red-300'>Acción irreversible</span>
                </div>
                <p className='text-xs text-red-200'>
                  Esta acción desactivará permanentemente la cuenta del usuario. El usuario perderá acceso a la plataforma y todos sus datos
                  quedarán inactivos. Esta acción puede ser revertida más tarde.
                </p>
              </div>

              <Select
                label='Motivo de desactivación'
                placeholder='Selecciona un motivo'
                value={deactivateForm.reason}
                onChange={e => setDeactivateForm(prev => ({ ...prev, reason: e.target.value }))}
                classNames={{
                  base: 'max-w-full',
                  trigger: 'bg-gray-800 border-gray-700'
                }}>
                {deactivateReasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </Select>

              {deactivateForm.reason === 'other' && (
                <Textarea
                  label='Especifica la razón'
                  placeholder='Describe el motivo de desactivación...'
                  value={deactivateForm.customReason}
                  onChange={e => setDeactivateForm(prev => ({ ...prev, customReason: e.target.value }))}
                  minRows={3}
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700'
                  }}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color='default' variant='light' onPress={handleCloseModals}>
                Cancelar
              </Button>
              <Button
                color='danger'
                onPress={handleDeactivateUser}
                isLoading={loading}
                isDisabled={!deactivateForm.reason || (deactivateForm.reason === 'other' && !deactivateForm.customReason.trim())}
                startContent={<UserX className='w-4 h-4' />}>
                Desactivar Usuario
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
