import { useState } from 'react'
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
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, ImageIcon } from 'lucide-react'

const EVENT_CATEGORIES = [
  { key: 'CULTURAL', label: 'Cultural' },
  { key: 'DEPORTIVO', label: 'Deportivo' },
  { key: 'MUSICAL', label: 'Musical' },
  { key: 'SOCIAL', label: 'Social' }
]

const CreateEventForm = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    price: '',
    maxCapacity: '',
    category: '',
    mainImage: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    } else if (formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'La fecha del evento es requerida'
    } else {
      const selectedDate = new Date(formData.eventDate)
      const now = new Date()

      if (selectedDate <= now) {
        newErrors.eventDate = 'La fecha debe ser en el futuro'
      }
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Debe ser un precio válido (mayor o igual a 0)'
    }

    if (!formData.maxCapacity || parseInt(formData.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'La capacidad debe ser mayor a 0'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: new Date(formData.eventDate).toISOString(),
      price: parseFloat(formData.price),
      maxCapacity: parseInt(formData.maxCapacity),
      category: formData.category,
      mainImage: formData.mainImage.trim() || null
    }

    onSubmit(eventData)
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      price: '',
      maxCapacity: '',
      category: '',
      mainImage: ''
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Obtener fecha mínima (ahora + 1 hora)
  const getMinDateTime = () => {
    const now = new Date()

    now.setHours(now.getHours() + 1)

    return now.toISOString().slice(0, 16)
  }

  const selectedCategory = EVENT_CATEGORIES.find(cat => cat.key === formData.category)

  return (
    <Modal
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}
      isOpen={isOpen}
      placement='center'
      scrollBehavior='inside'
      size='4xl'
      onClose={handleClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
              <Calendar className='w-5 h-5 text-blue-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Crear Nuevo Evento</h2>
              <p className='text-sm text-gray-400 font-normal'>Configura un nuevo evento para la plataforma</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          <div className='space-y-6'>
            {/* Información básica */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-medium text-gray-200 flex items-center gap-2'>
                  <FileText className='w-5 h-5 text-blue-400' />
                  Información Básica
                </h3>

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  errorMessage={errors.title}
                  isInvalid={!!errors.title}
                  label='Título del Evento'
                  maxLength={200}
                  placeholder='Ej: Concierto de Jazz, Tour Cultural, Evento Deportivo'
                  startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                />

                <Textarea
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  errorMessage={errors.description}
                  isInvalid={!!errors.description}
                  label='Descripción'
                  maxRows={6}
                  minRows={3}
                  placeholder='Describe el evento, actividades incluidas, lugar, qué esperar...'
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                />

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  label='URL de Imagen Principal (Opcional)'
                  placeholder='https://ejemplo.com/imagen.jpg'
                  startContent={<ImageIcon className='w-4 h-4 text-gray-400' />}
                  value={formData.mainImage}
                  onChange={e => handleInputChange('mainImage', e.target.value)}
                />
              </CardBody>
            </Card>

            {/* Configuración del evento */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-medium text-gray-200 flex items-center gap-2'>
                  <MapPin className='w-5 h-5 text-green-400' />
                  Configuración del Evento
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                    errorMessage={errors.eventDate}
                    isInvalid={!!errors.eventDate}
                    label='Fecha y Hora del Evento'
                    min={getMinDateTime()}
                    startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                    type='datetime-local'
                    value={formData.eventDate}
                    onChange={e => handleInputChange('eventDate', e.target.value)}
                  />

                  <Select
                    classNames={{
                      trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                      value: 'text-gray-200'
                    }}
                    errorMessage={errors.category}
                    isInvalid={!!errors.category}
                    label='Categoría'
                    placeholder='Selecciona una categoría'
                    selectedKeys={formData.category ? [formData.category] : []}
                    startContent={<Tag className='w-4 h-4 text-gray-400' />}
                    onSelectionChange={keys => handleInputChange('category', Array.from(keys)[0] || '')}>
                    {EVENT_CATEGORIES.map(category => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                    errorMessage={errors.price}
                    isInvalid={!!errors.price}
                    label='Precio (USD)'
                    min='0'
                    placeholder='0.00, 25.00, 150.00...'
                    startContent={<DollarSign className='w-4 h-4 text-gray-400' />}
                    step='0.01'
                    type='number'
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                  />

                  <Input
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                    errorMessage={errors.maxCapacity}
                    isInvalid={!!errors.maxCapacity}
                    label='Capacidad Máxima'
                    min='1'
                    placeholder='10, 50, 200...'
                    startContent={<Users className='w-4 h-4 text-gray-400' />}
                    type='number'
                    value={formData.maxCapacity}
                    onChange={e => handleInputChange('maxCapacity', e.target.value)}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Preview */}
            {(formData.title || formData.price || formData.maxCapacity || formData.category) && (
              <Card className='bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-purple-900/20 border-blue-700/50'>
                <CardBody>
                  <h3 className='text-lg font-medium text-blue-300 mb-3'>Vista Previa</h3>
                  <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-600/30'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h4 className='font-bold text-xl text-gray-100 mb-2'>{formData.title || 'Título del Evento'}</h4>
                        {selectedCategory && (
                          <Chip className='mb-2' color='primary' size='sm' variant='flat'>
                            {selectedCategory.label}
                          </Chip>
                        )}
                        <p className='text-sm text-gray-400 mb-3'>{formData.description || 'Descripción del evento...'}</p>
                      </div>
                      {formData.price && (
                        <div className='text-right ml-4'>
                          <p className='text-2xl font-bold text-green-400'>${parseFloat(formData.price || 0).toFixed(2)}</p>
                          <p className='text-xs text-gray-400'>USD</p>
                        </div>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-600/30'>
                      {formData.eventDate && (
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-blue-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Fecha</p>
                            <p className='text-sm text-gray-200'>
                              {new Date(formData.eventDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.maxCapacity && (
                        <div className='flex items-center gap-2'>
                          <Users className='w-4 h-4 text-purple-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Capacidad</p>
                            <p className='text-sm text-gray-200'>{formData.maxCapacity} personas</p>
                          </div>
                        </div>
                      )}

                      {formData.mainImage && (
                        <div className='flex items-center gap-2'>
                          <ImageIcon className='w-4 h-4 text-orange-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Imagen</p>
                            <p className='text-sm text-gray-200'>Configurada</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button className='border-gray-600 text-gray-300' disabled={loading} variant='bordered' onPress={handleClose}>
            Cancelar
          </Button>
          <Button color='primary' isLoading={loading} startContent={!loading && <Calendar className='w-4 h-4' />} onPress={handleSubmit}>
            Crear Evento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateEventForm
