import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Chip
} from '@heroui/react'
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, ImageIcon, Edit, Upload, X } from 'lucide-react'
import { RichTextEditor } from '@components/ui/richtext'

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
    location: '',
    price: '',
    maxCapacity: '',
    category: '',
    mainImage: ''
  })

  const [errors, setErrors] = useState({})
  const [mainImageFile, setMainImageFile] = useState(null)
  const [removeMainImage, setRemoveMainImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (eventData && isOpen) {
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        eventDate: eventData.eventDate ? formatDateForInput(eventData.eventDate) : '',
        location: eventData.location || '',
        price: eventData.price !== undefined ? String(eventData.price) : '',
        maxCapacity: eventData.maxCapacity !== undefined ? String(eventData.maxCapacity) : '',
        category: eventData.category || '',
        mainImage: eventData.mainImage || eventData.mainImageUrl || ''
      })
      setErrors({})
      setMainImageFile(null)
      setRemoveMainImage(false)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
        setImagePreview('')
      }
    }
  }, [eventData, imagePreview, isOpen])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const formatDateForInput = value => {
    if (!value) return ''
    const date = new Date(value)

    return date.toISOString().slice(0, 16)
  }

  const getMinDateTime = () => {
    const now = new Date()

    return now.toISOString().slice(0, 16)
  }

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

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida'
    } else if (formData.location.length > 300) {
      newErrors.location = 'La ubicación no puede exceder 300 caracteres'
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'La fecha del evento es requerida'
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Debe ser un precio válido (mayor o igual a 0)'
    }

    if (!formData.maxCapacity || parseInt(formData.maxCapacity, 10) <= 0) {
      newErrors.maxCapacity = 'La capacidad debe ser mayor a 0'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (loading) return
    if (!validateForm() || !eventData?.id) return

    const updatedEventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: new Date(formData.eventDate).toISOString(),
      location: formData.location.trim(),
      price: parseFloat(formData.price),
      maxCapacity: parseInt(formData.maxCapacity, 10),
      category: formData.category,
      mainImage: mainImageFile || removeMainImage ? null : formData.mainImage.trim() || null
    }

    onSubmit({
      eventId: eventData.id,
      eventData: updatedEventData,
      mainImageFile,
      removeMainImage
    })
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      price: '',
      maxCapacity: '',
      category: '',
      mainImage: ''
    })
    setErrors({})
    setMainImageFile(null)
    setRemoveMainImage(false)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview('')
    }
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    if (field === 'mainImage') {
      if (value) {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview)
          setImagePreview('')
        }
        setMainImageFile(null)
        setRemoveMainImage(false)
      }
    }
  }

  const handleImageSelection = event => {
    const file = event.target.files?.[0]

    if (!file) return

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setMainImageFile(file)
    setRemoveMainImage(false)
    setImagePreview(URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, mainImage: '' }))
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview('')
    }
    setMainImageFile(null)
    setRemoveMainImage(true)
    setFormData(prev => ({ ...prev, mainImage: '' }))
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

                <div>
                  <label className='block text-sm font-medium text-gray-200 mb-2' htmlFor='event-description-edit'>
                    Descripción
                  </label>
                  <RichTextEditor
                    description='Usa el editor para dar formato al texto'
                    error={errors.description}
                    id='event-description-edit'
                    maxLength={2000}
                    placeholder='Describe el evento, actividades incluidas, lugar, qué esperar...'
                    value={formData.description}
                    onChange={value => handleInputChange('description', value)}
                  />
                </div>

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  errorMessage={errors.location}
                  isInvalid={!!errors.location}
                  label='Ubicación del Evento'
                  maxLength={300}
                  placeholder='Ej: Auditorio Principal, Medellín'
                  startContent={<MapPin className='w-4 h-4 text-gray-400' />}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
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

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-200'>Imagen Principal</p>
                    <div className='flex items-center gap-2'>
                      <Button
                        color='primary'
                        size='sm'
                        startContent={<Upload className='w-4 h-4' />}
                        variant='flat'
                        onPress={() => fileInputRef.current?.click()}>
                        Subir nueva imagen
                      </Button>
                      {(mainImageFile || formData.mainImage || imagePreview) && (
                        <Button
                          color='danger'
                          size='sm'
                          startContent={<X className='w-4 h-4' />}
                          variant='light'
                          onPress={handleRemoveImage}>
                          Quitar
                        </Button>
                      )}
                    </div>
                  </div>
                  <input ref={fileInputRef} accept='image/*' className='hidden' type='file' onChange={handleImageSelection} />

                  {(imagePreview || (formData.mainImage && !removeMainImage)) && (
                    <div className='relative h-40 rounded-xl overflow-hidden border border-dashed border-gray-600 bg-gray-900/40 flex items-center justify-center'>
                      <img alt='Previsualización' className='object-cover w-full h-full' src={imagePreview || formData.mainImage} />
                    </div>
                  )}
                  {removeMainImage && !imagePreview && !mainImageFile && (
                    <Chip className='self-start' color='danger' size='sm' variant='flat'>
                      La imagen se eliminará al guardar
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>

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
                    onSelectionChange={keys => {
                      const selectedKey = Array.from(keys)[0]

                      handleInputChange('category', selectedKey)
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
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                    }}
                    errorMessage={errors.price}
                    isInvalid={!!errors.price}
                    label='Precio de Entrada'
                    min={0}
                    placeholder='0.00'
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
                    min={1}
                    placeholder='Ej: 100'
                    startContent={<Users className='w-4 h-4 text-gray-400' />}
                    type='number'
                    value={formData.maxCapacity}
                    onChange={e => handleInputChange('maxCapacity', e.target.value)}
                  />
                </div>

                {selectedCategory && (
                  <Chip color='primary' size='sm' variant='flat'>
                    Categoría seleccionada: {selectedCategory.label}
                  </Chip>
                )}
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button disabled={loading} variant='light' onPress={handleClose}>
            Cancelar
          </Button>
          <Button color='primary' isDisabled={loading} isLoading={loading} onPress={handleSubmit}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditEventForm
