import { useState, useEffect } from 'react'
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
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, ImageIcon, Edit } from 'lucide-react'

const EVENT_CATEGORIES = [
  { key: 'CULTURAL', label: 'Cultural' },
  { key: 'DEPORTIVO', label: 'Deportivo' },
  { key: 'MUSICAL', label: 'Musical' },
  { key: 'SOCIAL', label: 'Social' }
]

const EditEventForm = ({ isOpen, onClose, onSubmit, loading, eventData }) => {
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

  // Llenar formulario cuando cambie eventData
  useEffect(() => {
    if (eventData && isOpen) {
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        eventDate: eventData.eventDate ? formatDateForInput(eventData.eventDate) : '',
        price: eventData.price ? eventData.price.toString() : '',
        maxCapacity: eventData.maxCapacity ? eventData.maxCapacity.toString() : '',
        category: eventData.category || '',
        mainImage: eventData.mainImage || eventData.mainImageUrl || ''
      })
      setErrors({})
    }
  }, [eventData, isOpen])

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

    const updatedEventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: new Date(formData.eventDate).toISOString(),
      price: parseFloat(formData.price),
      maxCapacity: parseInt(formData.maxCapacity),
      category: formData.category,
      mainImage: formData.mainImage.trim() || null
    }

    onSubmit(eventData.id, updatedEventData)
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

  // Formatear fecha para el input datetime-local
  const formatDateForInput = dateString => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  // Obtener fecha mínima (ahora)
  const getMinDateTime = () => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  }

  const selectedCategory = EVENT_CATEGORIES.find(cat => cat.key === formData.category)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement='center'
      size='4xl'
      scrollBehavior='inside'
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
              <Edit className='w-5 h-5 text-orange-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Editar Evento</h2>
              <p className='text-sm text-gray-400 font-normal'>Modifica la información del evento</p>
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
                  label='Título del Evento'
                  placeholder='Ej: Concierto de Jazz, Tour Cultural, Evento Deportivo'
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                  maxLength={200}
                  startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                />

                <Textarea
                  label='Descripción'
                  placeholder='Describe el evento, actividades incluidas, lugar, qué esperar...'
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                  minRows={3}
                  maxRows={6}
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                />

                <Input
                  label='URL de Imagen Principal (Opcional)'
                  placeholder='https://ejemplo.com/imagen.jpg'
                  value={formData.mainImage}
                  onChange={e => handleInputChange('mainImage', e.target.value)}
                  startContent={<ImageIcon className='w-4 h-4 text-gray-400' />}
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
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
                    type='datetime-local'
                    label='Fecha y Hora del Evento'
                    value={formData.eventDate}
                    onChange={e => handleInputChange('eventDate', e.target.value)}
                    isInvalid={!!errors.eventDate}
                    errorMessage={errors.eventDate}
                    min={getMinDateTime()}
                    startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                  />

                  <Select
                    label='Categoría'
                    placeholder='Selecciona una categoría'
                    selectedKeys={formData.category ? [formData.category] : []}
                    onSelectionChange={keys => handleInputChange('category', Array.from(keys)[0] || '')}
                    isInvalid={!!errors.category}
                    errorMessage={errors.category}
                    startContent={<Tag className='w-4 h-4 text-gray-400' />}
                    classNames={{
                      trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                      value: 'text-gray-200'
                    }}>
                    {EVENT_CATEGORIES.map(category => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Input
                    type='number'
                    label='Precio (USD)'
                    placeholder='0.00, 25.00, 150.00...'
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price}
                    min='0'
                    step='0.01'
                    startContent={<DollarSign className='w-4 h-4 text-gray-400' />}
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                  />

                  <Input
                    type='number'
                    label='Capacidad Máxima'
                    placeholder='10, 50, 200...'
                    value={formData.maxCapacity}
                    onChange={e => handleInputChange('maxCapacity', e.target.value)}
                    isInvalid={!!errors.maxCapacity}
                    errorMessage={errors.maxCapacity}
                    min='1'
                    startContent={<Users className='w-4 h-4 text-gray-400' />}
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Preview actualizado */}
            {(formData.title || formData.price || formData.maxCapacity || formData.category) && (
              <Card className='bg-gradient-to-br from-orange-900/20 via-orange-800/10 to-red-900/20 border-orange-700/50'>
                <CardBody>
                  <h3 className='text-lg font-medium text-orange-300 mb-3'>Vista Previa Actualizada</h3>
                  <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-600/30'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h4 className='font-bold text-xl text-gray-100 mb-2'>{formData.title || 'Título del Evento'}</h4>
                        {selectedCategory && (
                          <Chip size='sm' variant='flat' color='warning' className='mb-2'>
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
          <Button variant='bordered' onPress={handleClose} className='border-gray-600 text-gray-300' disabled={loading}>
            Cancelar
          </Button>
          <Button color='warning' onPress={handleSubmit} isLoading={loading} startContent={!loading && <Edit className='w-4 h-4' />}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditEventForm
