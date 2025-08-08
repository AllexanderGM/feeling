import { useState, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip
} from '@heroui/react'
import { MessageSquare, AlertCircle, Send, FileText, User as UserIcon } from 'lucide-react'
import { COMPLAINT_TYPES, COMPLAINT_PRIORITY } from '@constants/tableConstants.js'
import { Logger } from '@utils/logger.js'

const CreateComplaintForm = memo(({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    complaintType: '',
    priority: 'MEDIUM',
    referencedUserId: '',
    referencedEventId: '',
    referencedBookingId: ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido'
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'El asunto debe tener al menos 5 caracteres'
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'El asunto no puede exceder 200 caracteres'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    } else if (formData.message.length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    } else if (formData.message.length > 2000) {
      newErrors.message = 'El mensaje no puede exceder 2000 caracteres'
    }

    if (!formData.complaintType) {
      newErrors.complaintType = 'El tipo de queja es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      handleClose()
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'create_complaint', 'Error creating complaint', {
        error,
        complaintType: formData.complaintType,
        priority: formData.priority
      })
    }
  }

  const handleClose = () => {
    setFormData({
      subject: '',
      message: '',
      complaintType: '',
      priority: 'MEDIUM',
      referencedUserId: '',
      referencedEventId: '',
      referencedBookingId: ''
    })
    setErrors({})
    onClose()
  }

  const complaintTypeOptions = Object.entries(COMPLAINT_TYPES).map(([key, value]) => ({
    key,
    value
  }))

  const priorityOptions = Object.entries(COMPLAINT_PRIORITY).map(([key]) => ({
    key,
    value: key.toLowerCase()
  }))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='3xl' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <MessageSquare className='text-primary' size={24} />
            <div>
              <h3 className='text-lg font-semibold'>Nueva Queja o Reclamo</h3>
              <p className='text-sm text-gray-500'>Describe tu problema o sugerencia detalladamente</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-4'>
          {/* Información importante */}
          <Card className='bg-blue-50 border border-blue-200'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='text-blue-600 mt-1' size={20} />
                <div className='text-sm text-blue-800'>
                  <p className='font-medium mb-1'>Información importante:</p>
                  <ul className='list-disc list-inside space-y-1 text-xs'>
                    <li>Describe tu problema de manera clara y detallada</li>
                    <li>Incluye cualquier información relevante (IDs, fechas, etc.)</li>
                    <li>Nuestro equipo te responderá en un plazo de 24 horas</li>
                    <li>Recibirás notificaciones sobre el progreso de tu queja</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Formulario principal */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              label='Tipo de Queja'
              placeholder='Selecciona el tipo de problema'
              selectedKeys={formData.complaintType ? [formData.complaintType] : []}
              onSelectionChange={keys => handleInputChange('complaintType', Array.from(keys)[0])}
              isInvalid={!!errors.complaintType}
              errorMessage={errors.complaintType}
              startContent={<FileText size={16} />}>
              {complaintTypeOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  {option.value}
                </SelectItem>
              ))}
            </Select>

            <Select
              label='Prioridad'
              placeholder='Selecciona la prioridad'
              selectedKeys={formData.priority ? [formData.priority] : []}
              onSelectionChange={keys => handleInputChange('priority', Array.from(keys)[0])}
              startContent={<AlertCircle size={16} />}>
              {priorityOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  <div className='flex items-center gap-2'>
                    <Chip
                      size='sm'
                      color={
                        option.key === 'LOW' ? 'success' : option.key === 'MEDIUM' ? 'warning' : option.key === 'HIGH' ? 'danger' : 'danger'
                      }
                      variant='flat'>
                      {option.value}
                    </Chip>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          <Input
            label='Asunto'
            placeholder='Describe brevemente tu problema'
            value={formData.subject}
            onValueChange={value => handleInputChange('subject', value)}
            isInvalid={!!errors.subject}
            errorMessage={errors.subject}
            maxLength={200}
            startContent={<MessageSquare size={16} />}
            description={`${formData.subject.length}/200 caracteres`}
          />

          <Textarea
            label='Descripción del Problema'
            placeholder='Describe detalladamente tu problema, incluyendo pasos para reproducirlo, capturas de pantalla relevantes, o cualquier información que pueda ayudarnos a resolver tu consulta...'
            value={formData.message}
            onValueChange={value => handleInputChange('message', value)}
            isInvalid={!!errors.message}
            errorMessage={errors.message}
            maxLength={2000}
            minRows={6}
            maxRows={10}
            description={`${formData.message.length}/2000 caracteres`}
          />

          {/* Referencias opcionales */}
          <Card className='bg-gray-50'>
            <CardBody className='p-4'>
              <h4 className='font-medium mb-3 flex items-center gap-2'>
                <UserIcon size={16} />
                Referencias Opcionales
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <Input
                  label='ID de Usuario'
                  placeholder='ej: 12345'
                  value={formData.referencedUserId}
                  onValueChange={value => handleInputChange('referencedUserId', value)}
                  size='sm'
                  description='Si tu queja involucra a otro usuario'
                />
                <Input
                  label='ID de Evento'
                  placeholder='ej: 67890'
                  value={formData.referencedEventId}
                  onValueChange={value => handleInputChange('referencedEventId', value)}
                  size='sm'
                  description='Si tu queja es sobre un evento específico'
                />
                <Input
                  label='ID de Reserva'
                  placeholder='ej: 54321'
                  value={formData.referencedBookingId}
                  onValueChange={value => handleInputChange('referencedBookingId', value)}
                  size='sm'
                  description='Si tu queja es sobre una reserva'
                />
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button variant='light' onPress={handleClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button color='primary' onPress={handleSubmit} isLoading={loading} startContent={!loading ? <Send size={16} /> : null}>
            {loading ? 'Enviando...' : 'Enviar Queja'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

CreateComplaintForm.displayName = 'CreateComplaintForm'

export { CreateComplaintForm }
