import { useState, useEffect, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardBody,
  Chip,
  User,
  Divider
} from '@heroui/react'
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, MessageSquare, FileText, Save } from 'lucide-react'
import { COMPLAINT_STATUS, COMPLAINT_STATUS_COLORS, COMPLAINT_PRIORITY_COLORS, COMPLAINT_TYPES } from '@constants/tableConstants.js'
import { Logger } from '@utils/logger.js'

const UpdateComplaintStatusModal = memo(({ isOpen, onClose, complaint, onUpdate, loading = false }) => {
  const [formData, setFormData] = useState({
    status: '',
    adminNotes: '',
    internalNotes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (complaint) {
      setFormData({
        status: complaint.status || '',
        adminNotes: '',
        internalNotes: ''
      })
    }
  }, [complaint])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.status) {
      newErrors.status = 'Debe seleccionar un estado'
    }

    if (formData.status === 'RESOLVED' && !formData.adminNotes.trim()) {
      newErrors.adminNotes = 'Las notas son requeridas para marcar como resuelto'
    }

    if (formData.adminNotes && formData.adminNotes.length > 1000) {
      newErrors.adminNotes = 'Las notas no pueden exceder 1000 caracteres'
    }

    if (formData.internalNotes && formData.internalNotes.length > 1000) {
      newErrors.internalNotes = 'Las notas internas no pueden exceder 1000 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await onUpdate(complaint.id, formData)
      handleClose()
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'update_complaint_status', 'Error updating complaint status', {
        error,
        complaintId: complaint?.id,
        newStatus: formData.status
      })
    }
  }

  const handleClose = () => {
    setFormData({
      status: '',
      adminNotes: '',
      internalNotes: ''
    })
    setErrors({})
    onClose()
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'OPEN':
        return <Clock size={16} />
      case 'IN_PROGRESS':
        return <AlertTriangle size={16} />
      case 'WAITING_USER':
        return <MessageSquare size={16} />
      case 'RESOLVED':
        return <CheckCircle size={16} />
      case 'CLOSED':
        return <XCircle size={16} />
      case 'ESCALATED':
        return <AlertTriangle size={16} />
      default:
        return <MessageSquare size={16} />
    }
  }

  const getStatusDescription = status => {
    const descriptions = {
      OPEN: 'La queja está abierta y pendiente de revisión',
      IN_PROGRESS: 'El equipo está trabajando en resolver la queja',
      WAITING_USER: 'Esperando respuesta o información adicional del usuario',
      RESOLVED: 'La queja ha sido resuelta satisfactoriamente',
      CLOSED: 'La queja ha sido cerrada (sin resolución o por decisión administrativa)',
      ESCALATED: 'La queja ha sido escalada a un nivel superior'
    }
    return descriptions[status] || ''
  }

  const statusOptions = Object.values(COMPLAINT_STATUS).map(status => ({
    key: status,
    label: status.replace('_', ' '),
    description: getStatusDescription(status),
    icon: getStatusIcon(status),
    color: COMPLAINT_STATUS_COLORS[status]
  }))

  if (!complaint) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='3xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <Shield className='text-primary' size={24} />
            <div>
              <h3 className='text-lg font-semibold'>Actualizar Estado de Queja</h3>
              <p className='text-sm text-gray-500'>
                Queja #{complaint.id} - {complaint.subject}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-4'>
          {/* Información actual de la queja */}
          <Card>
            <CardBody className='p-4'>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                <FileText size={16} />
                Información Actual
              </h4>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <User
                    name={complaint.user?.name}
                    description={complaint.user?.email}
                    avatarProps={{
                      src: complaint.user?.profileImage,
                      size: 'sm'
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>Estado actual:</span>
                    <Chip
                      size='sm'
                      color={COMPLAINT_STATUS_COLORS[complaint.status]}
                      variant='flat'
                      startContent={getStatusIcon(complaint.status)}>
                      {complaint.status?.replace('_', ' ')}
                    </Chip>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>Prioridad:</span>
                    <Chip size='sm' color={COMPLAINT_PRIORITY_COLORS[complaint.priority]} variant='flat'>
                      {complaint.priority}
                    </Chip>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>Tipo:</span>
                    <span className='text-sm'>{COMPLAINT_TYPES[complaint.complaintType]}</span>
                  </div>
                </div>
              </div>

              <Divider className='my-3' />

              <div>
                <p className='text-sm font-medium mb-1'>Mensaje original:</p>
                <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>{complaint.message}</p>
              </div>
            </CardBody>
          </Card>

          {/* Formulario de actualización */}
          <div className='space-y-4'>
            <Select
              label='Nuevo Estado'
              placeholder='Selecciona el nuevo estado'
              selectedKeys={formData.status ? [formData.status] : []}
              onSelectionChange={keys => handleInputChange('status', Array.from(keys)[0])}
              isInvalid={!!errors.status}
              errorMessage={errors.status}
              startContent={<Shield size={16} />}>
              {statusOptions.map(option => (
                <SelectItem key={option.key} value={option.key} description={option.description}>
                  <div className='flex items-center gap-2'>
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {formData.status && (
              <Card className='bg-blue-50 border border-blue-200'>
                <CardBody className='p-3'>
                  <div className='flex items-start gap-2'>
                    {getStatusIcon(formData.status)}
                    <div className='text-sm text-blue-800'>
                      <p className='font-medium'>Cambio de estado:</p>
                      <p>{getStatusDescription(formData.status)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <Textarea
              label='Notas para el Usuario'
              placeholder='Mensaje que será visible para el usuario (opcional, pero requerido para marcar como resuelto)'
              value={formData.adminNotes}
              onValueChange={value => handleInputChange('adminNotes', value)}
              isInvalid={!!errors.adminNotes}
              errorMessage={errors.adminNotes}
              maxLength={1000}
              minRows={3}
              maxRows={6}
              description={`${formData.adminNotes.length}/1000 caracteres`}
            />

            <Textarea
              label='Notas Internas (Solo Administradores)'
              placeholder='Notas internas que solo verán otros administradores'
              value={formData.internalNotes}
              onValueChange={value => handleInputChange('internalNotes', value)}
              isInvalid={!!errors.internalNotes}
              errorMessage={errors.internalNotes}
              maxLength={1000}
              minRows={2}
              maxRows={4}
              description={`${formData.internalNotes.length}/1000 caracteres`}
            />
          </div>

          {/* Alertas importantes */}
          {formData.status === 'RESOLVED' && (
            <Card className='bg-green-50 border border-green-200'>
              <CardBody className='p-3'>
                <div className='flex items-start gap-2'>
                  <CheckCircle className='text-green-600 mt-0.5' size={16} />
                  <div className='text-sm text-green-800'>
                    <p className='font-medium'>Marcar como Resuelto</p>
                    <p>
                      El usuario recibirá una notificación de que su queja ha sido resuelta. Asegúrate de incluir un mensaje explicativo.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {formData.status === 'ESCALATED' && (
            <Card className='bg-red-50 border border-red-200'>
              <CardBody className='p-3'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='text-red-600 mt-0.5' size={16} />
                  <div className='text-sm text-red-800'>
                    <p className='font-medium'>Escalar Queja</p>
                    <p>Esta queja será escalada a un supervisor o equipo especializado. Se notificará automáticamente.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant='light' onPress={handleClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            color='primary'
            onPress={handleSubmit}
            isLoading={loading}
            startContent={!loading ? <Save size={16} /> : null}
            isDisabled={formData.status === complaint.status}>
            {loading ? 'Actualizando...' : 'Actualizar Estado'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

UpdateComplaintStatusModal.displayName = 'UpdateComplaintStatusModal'

export { UpdateComplaintStatusModal }
