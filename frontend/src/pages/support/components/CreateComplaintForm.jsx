import { useState, memo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react'
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
    <Modal
      backdrop='blur'
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        header: 'border-b border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-700'
      }}
      isOpen={isOpen}
      scrollBehavior='inside'
      size='3xl'
      onClose={handleClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center'>
              <MessageSquare className='text-purple-400' size={20} />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Nueva Solicitud de Soporte</h3>
              <p className='text-sm text-gray-400 font-normal'>Describe tu problema o sugerencia detalladamente</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-4'>
          {/* Información importante */}
          <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='text-blue-400' size={16} />
              </div>
              <div className='text-sm text-gray-300'>
                <p className='font-medium mb-2 text-gray-200'>Información importante:</p>
                <ul className='list-disc list-inside space-y-1 text-xs text-gray-400'>
                  <li>Describe tu problema de manera clara y detallada</li>
                  <li>Incluye cualquier información relevante (IDs, fechas, etc.)</li>
                  <li>Nuestro equipo te responderá en un plazo de 24 horas</li>
                  <li>Recibirás notificaciones sobre el progreso de tu solicitud</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Formulario principal */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              classNames={{
                trigger: 'bg-gray-700/50 border-gray-600 data-[hover=true]:bg-gray-700',
                value: 'text-gray-200',
                label: 'text-gray-300'
              }}
              errorMessage={errors.complaintType}
              isInvalid={!!errors.complaintType}
              label='Tipo de Queja'
              placeholder='Selecciona el tipo de problema'
              selectedKeys={formData.complaintType ? [formData.complaintType] : []}
              startContent={<FileText className='text-gray-400' size={16} />}
              variant='bordered'
              onSelectionChange={keys => handleInputChange('complaintType', Array.from(keys)[0])}>
              {complaintTypeOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  {option.value}
                </SelectItem>
              ))}
            </Select>

            <Select
              classNames={{
                trigger: 'bg-gray-700/50 border-gray-600 data-[hover=true]:bg-gray-700',
                value: 'text-gray-200',
                label: 'text-gray-300'
              }}
              label='Prioridad'
              placeholder='Selecciona la prioridad'
              selectedKeys={formData.priority ? [formData.priority] : []}
              startContent={<AlertCircle className='text-gray-400' size={16} />}
              variant='bordered'
              onSelectionChange={keys => handleInputChange('priority', Array.from(keys)[0])}>
              {priorityOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  <div className='flex items-center gap-2'>
                    <Chip
                      color={
                        option.key === 'LOW' ? 'success' : option.key === 'MEDIUM' ? 'warning' : option.key === 'HIGH' ? 'danger' : 'danger'
                      }
                      size='sm'
                      variant='flat'>
                      {option.value}
                    </Chip>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          <Input
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-700/50 border-gray-600 data-[hover=true]:bg-gray-700',
              label: 'text-gray-300',
              description: 'text-gray-400'
            }}
            description={`${formData.subject.length}/200 caracteres`}
            errorMessage={errors.subject}
            isInvalid={!!errors.subject}
            label='Asunto'
            maxLength={200}
            placeholder='Describe brevemente tu problema'
            startContent={<MessageSquare className='text-gray-400' size={16} />}
            value={formData.subject}
            variant='bordered'
            onValueChange={value => handleInputChange('subject', value)}
          />

          <Textarea
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-700/50 border-gray-600 data-[hover=true]:bg-gray-700',
              label: 'text-gray-300',
              description: 'text-gray-400'
            }}
            description={`${formData.message.length}/2000 caracteres`}
            errorMessage={errors.message}
            isInvalid={!!errors.message}
            label='Descripción del Problema'
            maxLength={2000}
            maxRows={10}
            minRows={6}
            placeholder='Describe detalladamente tu problema, incluyendo pasos para reproducirlo, capturas de pantalla relevantes, o cualquier información que pueda ayudarnos a resolver tu consulta...'
            value={formData.message}
            variant='bordered'
            onValueChange={value => handleInputChange('message', value)}
          />

          {/* Referencias opcionales */}
          <div className='bg-gray-700/30 border border-gray-600/30 rounded-lg p-4'>
            <h4 className='font-medium mb-3 flex items-center gap-2 text-gray-200'>
              <UserIcon className='text-gray-400' size={16} />
              Referencias Opcionales
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <Input
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-700/50 border-gray-600/50',
                  label: 'text-gray-300 text-xs',
                  description: 'text-gray-500 text-xs'
                }}
                description='Si involucra a otro usuario'
                label='ID de Usuario'
                placeholder='ej: 12345'
                size='sm'
                value={formData.referencedUserId}
                variant='bordered'
                onValueChange={value => handleInputChange('referencedUserId', value)}
              />
              <Input
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-700/50 border-gray-600/50',
                  label: 'text-gray-300 text-xs',
                  description: 'text-gray-500 text-xs'
                }}
                description='Si es sobre un evento'
                label='ID de Evento'
                placeholder='ej: 67890'
                size='sm'
                value={formData.referencedEventId}
                variant='bordered'
                onValueChange={value => handleInputChange('referencedEventId', value)}
              />
              <Input
                classNames={{
                  input: 'text-gray-200',
                  inputWrapper: 'bg-gray-700/50 border-gray-600/50',
                  label: 'text-gray-300 text-xs',
                  description: 'text-gray-500 text-xs'
                }}
                description='Si es sobre una reserva'
                label='ID de Reserva'
                placeholder='ej: 54321'
                size='sm'
                value={formData.referencedBookingId}
                variant='bordered'
                onValueChange={value => handleInputChange('referencedBookingId', value)}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button className='text-gray-300' isDisabled={loading} variant='light' onPress={handleClose}>
            Cancelar
          </Button>
          <Button color='primary' isLoading={loading} startContent={!loading ? <Send size={16} /> : null} onPress={handleSubmit}>
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

CreateComplaintForm.displayName = 'CreateComplaintForm'

export { CreateComplaintForm }
