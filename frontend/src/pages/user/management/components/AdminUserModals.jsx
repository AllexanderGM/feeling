import { useCallback, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Avatar,
  Input,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react'
import { User, Mail, Shield, CheckCircle, AlertTriangle, X, UserX, Lock, UserIcon, Clock, Check } from 'lucide-react'
import { Logger } from '@utils/logger'

import UserDetailModal from './UserDetailModal.jsx'

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
    onRejectUser,
    onDeactivateUser,
    onApproveUser,
    onReactivateUser,

    // Loading states
    loading = false
  }) => {
    // Reset forms when modals close
    const handleCloseModals = useCallback(() => {
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

    const handleRejectUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onRejectUser(selectedUser.user?.id || selectedUser.id, genericModerationReason)
        handleCloseModals()
      } catch (error) {
        Logger.error('AdminUserModals', 'handleRejectUser', 'Error rejecting user', error)
      }
    }, [selectedUser, genericModerationReason, onRejectUser, handleCloseModals])

    const handleDeactivateUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onDeactivateUser(selectedUser.user?.id || selectedUser.id, genericModerationReason)
        handleCloseModals()
      } catch (error) {
        Logger.error('AdminUserModals', 'handleDeactivateUser', 'Error deactivating user', error)
      }
    }, [selectedUser, genericModerationReason, onDeactivateUser, handleCloseModals])

    const handleApproveUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onApproveUser(selectedUser.user?.id || selectedUser.id)
        handleCloseModals()
      } catch (error) {
        Logger.error('AdminUserModals', 'handleApproveUser', 'Error approving user', error)
      }
    }, [selectedUser, onApproveUser, handleCloseModals])

    const handleReactivateUser = useCallback(async () => {
      if (!selectedUser) return

      try {
        await onReactivateUser(selectedUser.user?.id || selectedUser.id)
        handleCloseModals()
      } catch (error) {
        Logger.error('AdminUserModals', 'handleReactivateUser', 'Error reactivating user', error)
      }
    }, [selectedUser, onReactivateUser, handleCloseModals])

    if (!selectedUser) return null

    return (
      <>
        {/* Modal para ver perfil completo del usuario */}
        <UserDetailModal isOpen={isViewModalOpen} selectedUser={selectedUser} onClose={handleCloseModals} />

        {/* Modal para enviar correo electrónico */}
        <Modal
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isOpen={isEmailModalOpen}
          size='2xl'
          onClose={handleCloseModals}>
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
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                    src={selectedUser.user?.mainImage || selectedUser.user?.image}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.user?.name} {selectedUser.user?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.user?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip color={selectedUser.status?.active ? 'success' : 'danger'} size='sm' variant='flat'>
                        {selectedUser.status?.active ? 'Activo' : 'Inactivo'}
                      </Chip>
                      {selectedUser.status?.verified && (
                        <Chip color='success' size='sm' variant='dot'>
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
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}
                  label='Plantilla de correo'
                  placeholder='Selección de plantillas no disponible'>
                  {Object.entries(emailTemplates).map(([key]) => (
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
                  isDisabled
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700 opacity-50'
                  }}
                  label='Asunto'
                  placeholder='Personalización de asunto no disponible'
                />

                <Textarea
                  isDisabled
                  classNames={{
                    input: 'bg-gray-800',
                    inputWrapper: 'border-gray-700 opacity-50'
                  }}
                  label='Mensaje'
                  minRows={4}
                  placeholder='Editor de mensaje no disponible'
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
              <Button isDisabled color='primary' startContent={<Lock className='w-4 h-4' />}>
                Enviar Correo (No disponible)
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para desaprobar usuario */}
        <Modal
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isOpen={isRejectModalOpen}
          size='lg'
          onClose={handleCloseModals}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
                  <X className='w-4 h-4 text-orange-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Desaprobar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.user?.name} {selectedUser.user?.lastName}
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
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                    src={selectedUser.user?.mainImage || selectedUser.user?.image}
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.user?.name} {selectedUser.user?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Motivos (deshabilitados) */}
              <div className='space-y-4'>
                <Select
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}
                  label='Motivo de desaprobación'
                  placeholder='Selección de motivos no disponible'>
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
              <Button color='warning' isLoading={loading} startContent={<X className='w-4 h-4' />} onPress={handleRejectUser}>
                Desaprobar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para desactivar usuario */}
        <Modal
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isOpen={isDeactivateModalOpen}
          size='lg'
          onClose={handleCloseModals}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center'>
                  <UserX className='w-4 h-4 text-red-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Desactivar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.user?.name} {selectedUser.user?.lastName}
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
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                    src={selectedUser.user?.mainImage || selectedUser.user?.image}
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.user?.name} {selectedUser.user?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.user?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip color={selectedUser.status?.active ? 'success' : 'danger'} size='sm' variant='flat'>
                        {selectedUser.status?.active ? 'Activo' : 'Inactivo'}
                      </Chip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivos (deshabilitados) */}
              <div className='space-y-4'>
                <Select
                  isDisabled
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'bg-gray-800 border-gray-700 opacity-50'
                  }}
                  label='Motivo de desactivación'
                  placeholder='Selección de motivos no disponible'>
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
              <Button color='danger' isLoading={loading} startContent={<UserX className='w-4 h-4' />} onPress={handleDeactivateUser}>
                Desactivar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para aprobar usuario */}
        <Modal
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isOpen={isApproveModalOpen}
          size='lg'
          onClose={handleCloseModals}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Aprobar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.user?.name} {selectedUser.user?.lastName}
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
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                    src={selectedUser.user?.mainImage || selectedUser.user?.image}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.user?.name} {selectedUser.user?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.user?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip color={selectedUser.status?.verified ? 'success' : 'warning'} size='sm' variant='flat'>
                        {selectedUser.status?.verified ? 'Verificado' : 'Sin verificar'}
                      </Chip>
                      <Chip color='warning' size='sm' variant='dot'>
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
              <Button color='success' isLoading={loading} startContent={<CheckCircle className='w-4 h-4' />} onPress={handleApproveUser}>
                Aprobar Usuario
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación para reactivar usuario */}
        <Modal
          classNames={{
            backdrop: 'bg-gray-900/50 backdrop-blur-sm',
            base: 'bg-gray-900 border border-gray-700',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isOpen={isReactivateModalOpen}
          size='lg'
          onClose={handleCloseModals}>
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-blue-400' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-200'>Reactivar Usuario</h3>
                  <p className='text-sm text-gray-400'>
                    {selectedUser.user?.name} {selectedUser.user?.lastName}
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
                    className='w-12 h-12'
                    icon={<UserIcon className='w-6 h-6 text-default-500' />}
                    src={selectedUser.user?.mainImage || selectedUser.user?.image}
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-200'>
                      {selectedUser.user?.name} {selectedUser.user?.lastName}
                    </p>
                    <p className='text-xs text-gray-400'>{selectedUser.user?.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Chip color='danger' size='sm' variant='flat'>
                        Desactivado
                      </Chip>
                      {selectedUser.status?.verified && (
                        <Chip color='success' size='sm' variant='dot'>
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
              <Button color='primary' isLoading={loading} startContent={<CheckCircle className='w-4 h-4' />} onPress={handleReactivateUser}>
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
