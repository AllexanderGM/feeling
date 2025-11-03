import { useState, useEffect, useRef } from 'react'
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
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, Edit, Search, Images, CheckCircle, Save, Undo2 } from 'lucide-react'
import { RichTextEditor } from '@components/ui/richtext'
import ImageManager from '@components/ui/imageManager/ImageManager.jsx'
import { EVENT_STATUS_DISPLAY } from '@constants/tableConstants.js'

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
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoImage: ''
  })

  const [errors, setErrors] = useState({})
  const imageManagerRef = useRef(null)
  const [eventImages, setEventImages] = useState([])
  const [imageValidationState, setImageValidationState] = useState({ hasErrors: false, imageCount: 0, errors: {} })
  const [imageManagerKey, setImageManagerKey] = useState(0)

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
        seoTitle: eventData.seoTitle || '',
        seoDescription: eventData.seoDescription || '',
        seoKeywords: eventData.seoKeywords || '',
        seoImage: eventData.seoImage || ''
      })
      setErrors({})
      const initialGallery = [
        eventData.mainImage || eventData.mainImageUrl || null,
        ...(Array.isArray(eventData.images) ? eventData.images : [])
      ].filter(Boolean)

      setEventImages(initialGallery)
      setImageValidationState({ hasErrors: false, imageCount: initialGallery.length, errors: {} })
      setImageManagerKey(prev => prev + 1)
    }
  }, [eventData, isOpen])

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

    if (formData.seoTitle && formData.seoTitle.trim().length > 160) {
      newErrors.seoTitle = 'El título SEO no puede exceder 160 caracteres'
    }

    if (formData.seoDescription && formData.seoDescription.trim().length > 320) {
      newErrors.seoDescription = 'La descripción SEO no puede exceder 320 caracteres'
    }

    if (formData.seoKeywords && formData.seoKeywords.trim().length > 500) {
      newErrors.seoKeywords = 'Las palabras clave SEO no pueden exceder 500 caracteres'
    }

    if (formData.seoImage && formData.seoImage.trim().length > 500) {
      newErrors.seoImage = 'La URL de la imagen SEO no puede exceder 500 caracteres'
    }

    const currentImageCount = imageManagerRef.current?.getImageCount?.() ?? eventImages.filter(image => !!image).length

    if (currentImageCount === 0) {
      newErrors.images = 'Debes mantener al menos una imagen del evento'
    } else if (imageValidationState.hasErrors) {
      const firstError = imageValidationState.errors && Object.values(imageValidationState.errors).find(Boolean)

      if (firstError) {
        newErrors.images = firstError
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (action = 'save') => {
    if (loading) return
    if (!validateForm() || !eventData?.id) return

    const currentImages = imageManagerRef.current?.getImages?.() ?? eventImages
    const orderedImages = Array.isArray(currentImages) ? currentImages.filter(Boolean) : []

    if (orderedImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Debes mantener al menos una imagen del evento' }))

      return
    }

    const updatedEventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: new Date(formData.eventDate).toISOString(),
      location: formData.location.trim(),
      price: parseFloat(formData.price),
      maxCapacity: parseInt(formData.maxCapacity, 10),
      category: formData.category,
      seoTitle: formData.seoTitle.trim() || null,
      seoDescription: formData.seoDescription.trim() || null,
      seoKeywords: formData.seoKeywords.trim() || null,
      seoImage: formData.seoImage.trim() || null
    }

    onSubmit({
      action,
      currentStatus: eventData.status,
      eventId: eventData.id,
      eventData: updatedEventData,
      media: { orderedImages }
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
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      seoImage: ''
    })
    setErrors({})
    setEventImages([])
    setImageValidationState({ hasErrors: false, imageCount: 0, errors: {} })
    imageManagerRef.current?.removeAllImages?.()
    setImageManagerKey(prev => prev + 1)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleEventImagesChange = images => {
    const normalized = Array.isArray(images) ? [...images] : []

    setEventImages(normalized)
    if (normalized.filter(Boolean).length > 0) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }

  const handleEventImageValidation = ({ hasErrors, imageCount, errors: validationErrors }) => {
    setImageValidationState({ hasErrors, imageCount, errors: validationErrors || {} })

    if (hasErrors && validationErrors) {
      const firstError = Object.values(validationErrors).find(Boolean)

      if (firstError) {
        setErrors(prev => ({ ...prev, images: firstError }))

        return
      }
    }

    if (!hasErrors && imageCount > 0) {
      setErrors(prev => ({ ...prev, images: '' }))
    } else if (imageCount === 0) {
      setErrors(prev => ({ ...prev, images: 'Debes mantener al menos una imagen del evento' }))
    }
  }

  const selectedCategory = EVENT_CATEGORIES.find(cat => cat.key === formData.category)
  const statusInfo = eventData?.status ? EVENT_STATUS_DISPLAY[eventData.status] || { label: eventData.status, color: 'default' } : null

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
              {statusInfo && (
                <div className='mt-2'>
                  <Chip color={statusInfo.color || 'default'} size='sm' variant='flat'>
                    {statusInfo.label}
                  </Chip>
                </div>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          <div className='space-y-6'>
            {/* Imágenes del evento */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-medium text-gray-200 flex items-center gap-2'>
                  <Images className='w-5 h-5 text-orange-400' />
                  Imágenes del evento
                </h3>

                <ImageManager
                  key={imageManagerKey}
                  ref={imageManagerRef}
                  enableCrop
                  enableReorder
                  showEmptySlots
                  cropAspectRatio={16 / 9}
                  description='La primera imagen se mostrará como principal. Mantén un máximo de 5 imágenes horizontales (16:9).'
                  imageGridProps={{
                    headerTitle: 'Galería del evento',
                    headerSubtitle: 'Fotos horizontales recomendadas • Máximo 5MB • Resolución mínima 1280x720px',
                    headerHelperText: 'Arrastra para reordenar las imágenes de la galería.',
                    imageAspectClass: 'aspect-[16/9]'
                  }}
                  images={eventImages}
                  maxImages={5}
                  title='Gestiona la galería del evento'
                  onImagesChange={handleEventImagesChange}
                  onValidationChange={handleEventImageValidation}
                />

                {errors.images && (
                  <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>{errors.images}</p>
                )}
              </CardBody>
            </Card>

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
                    label='Precio (COP)'
                    min={0}
                    placeholder='0, 250000, 500000...'
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

            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-medium text-gray-200 flex items-center gap-2'>
                  <Search className='w-5 h-5 text-purple-400' />
                  Configuración SEO
                </h3>

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  description='Máximo 160 caracteres. Si se deja vacío usaremos el título del evento.'
                  errorMessage={errors.seoTitle}
                  isInvalid={!!errors.seoTitle}
                  label='Título SEO (opcional)'
                  maxLength={160}
                  placeholder='Ej: Taller de bienestar emocional | Feeling'
                  value={formData.seoTitle}
                  onChange={e => handleInputChange('seoTitle', e.target.value)}
                />

                <Textarea
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 focus-within:border-primary-500'
                  }}
                  description='Máximo 320 caracteres. Usa una frase atractiva para buscadores.'
                  errorMessage={errors.seoDescription}
                  isInvalid={!!errors.seoDescription}
                  label='Descripción SEO (opcional)'
                  maxLength={320}
                  minRows={3}
                  placeholder='Resume la experiencia del evento para que Google y redes sociales lo destaquen.'
                  value={formData.seoDescription}
                  onValueChange={value => handleInputChange('seoDescription', value)}
                />

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  description='Separa las palabras o frases con comas. Máximo 500 caracteres.'
                  errorMessage={errors.seoKeywords}
                  isInvalid={!!errors.seoKeywords}
                  label='Palabras clave SEO (opcional)'
                  maxLength={500}
                  placeholder='evento, crecimiento personal, networking, feeling'
                  value={formData.seoKeywords}
                  onChange={e => handleInputChange('seoKeywords', e.target.value)}
                />

                <Input
                  classNames={{
                    input: 'text-gray-200',
                    inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                  }}
                  description='Si no se indica, usaremos la imagen principal del evento.'
                  errorMessage={errors.seoImage}
                  isInvalid={!!errors.seoImage}
                  label='URL de imagen para compartir (opcional)'
                  maxLength={500}
                  placeholder='https://cdn.feeling.com/eventos/mi-evento.jpg'
                  value={formData.seoImage}
                  onChange={e => handleInputChange('seoImage', e.target.value)}
                />
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <Button disabled={loading} variant='light' onPress={handleClose}>
            Cancelar
          </Button>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button
              className='bg-warning-500/10 text-warning-400 border border-warning-500/20'
              isDisabled={loading}
              isLoading={loading}
              startContent={!loading && <Undo2 className='w-4 h-4' />}
              variant='flat'
              onPress={() => handleSubmit('draft')}>
              Guardar como borrador
            </Button>
            <Button
              className='border border-gray-600/60'
              isDisabled={loading}
              isLoading={loading}
              startContent={!loading && <Save className='w-4 h-4' />}
              variant='bordered'
              onPress={() => handleSubmit('save')}>
              Guardar cambios
            </Button>
            <Button
              color='primary'
              isDisabled={loading}
              isLoading={loading}
              startContent={!loading && <CheckCircle className='w-4 h-4' />}
              onPress={() => handleSubmit('publish')}>
              Guardar y publicar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditEventForm
