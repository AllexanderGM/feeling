import { useState, useRef } from 'react'
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
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, Search, Images, CheckCircle, Save } from 'lucide-react'
import { RichTextEditor } from '@components/ui/richtext'
import ImageManager from '@components/ui/imageManager/ImageManager.jsx'

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
      newErrors.images = 'Debes subir al menos una imagen del evento'
    } else if (imageValidationState.hasErrors) {
      const firstError = imageValidationState.errors && Object.values(imageValidationState.errors).find(Boolean)

      if (firstError) {
        newErrors.images = firstError
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (action = 'draft') => {
    if (loading) return
    if (!validateForm()) return

    const currentImages = imageManagerRef.current?.getImages?.() ?? eventImages
    const orderedImages = Array.isArray(currentImages) ? currentImages.filter(Boolean) : []

    if (orderedImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Debes subir al menos una imagen del evento' }))

      return
    }

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: new Date(formData.eventDate).toISOString(),
      location: formData.location.trim(),
      price: parseFloat(formData.price),
      maxCapacity: parseInt(formData.maxCapacity),
      category: formData.category,
      seoTitle: formData.seoTitle.trim() || null,
      seoDescription: formData.seoDescription.trim() || null,
      seoKeywords: formData.seoKeywords.trim() || null,
      seoImage: formData.seoImage.trim() || null
    }

    onSubmit({
      action,
      eventData,
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
    setImageManagerKey(prev => prev + 1)
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
      setErrors(prev => ({ ...prev, images: 'Debes subir al menos una imagen del evento' }))
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
            {/* Imágenes del evento */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-medium text-gray-200 flex items-center gap-2'>
                  <Images className='w-5 h-5 text-blue-400' />
                  Imágenes del evento
                </h3>

                <ImageManager
                  key={imageManagerKey}
                  ref={imageManagerRef}
                  enableCrop
                  enableReorder
                  showEmptySlots
                  cropAspectRatio={16 / 9}
                  description='La primera imagen se mostrará como principal. Usa fotos en formato 16:9 de máximo 5 MB cada una.'
                  imageGridProps={{
                    headerTitle: 'Galería del evento',
                    headerSubtitle: 'Fotos horizontales recomendadas • Máximo 5MB • Resolución mínima 1280x720px',
                    headerHelperText: 'Arrastra para reordenar las imágenes.',
                    imageAspectClass: 'aspect-[16/9]'
                  }}
                  images={eventImages}
                  maxImages={5}
                  title='Selecciona hasta 5 imágenes horizontales'
                  onImagesChange={handleEventImagesChange}
                  onValidationChange={handleEventImageValidation}
                />

                {errors.images && (
                  <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>{errors.images}</p>
                )}
              </CardBody>
            </Card>

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

                <div>
                  <label className='block text-sm font-medium text-gray-200 mb-2' htmlFor='event-description'>
                    Descripción
                  </label>
                  <RichTextEditor
                    description='Usa el editor para dar formato al texto'
                    error={errors.description}
                    id='event-description'
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
                  placeholder='Ej: Teatro Nacional, Bogotá'
                  startContent={<MapPin className='w-4 h-4 text-gray-400' />}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
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
                    label='Precio (COP)'
                    min='0'
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

            {/* Configuración SEO */}
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
                  placeholder='Ej: Concierto íntimo de jazz en Bogotá | Feeling'
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
                  placeholder='evento, bienestar emocional, networking, feeling'
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
                          <p className='text-2xl font-bold text-green-400'>
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              maximumFractionDigits: 0
                            }).format(Number.parseFloat(formData.price || 0))}
                          </p>
                          <p className='text-xs text-gray-400'>COP</p>
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

                      {formData.location && (
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-amber-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Ubicación</p>
                            <p className='text-sm text-gray-200'>{formData.location}</p>
                          </div>
                        </div>
                      )}

                      {eventImages.filter(Boolean).length > 0 && (
                        <div className='flex items-center gap-2'>
                          <Images className='w-4 h-4 text-orange-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Galería</p>
                            <p className='text-sm text-gray-200'>
                              {eventImages.filter(Boolean).length} imagen{eventImages.filter(Boolean).length === 1 ? '' : 'es'} seleccionada
                              {eventImages.filter(Boolean).length === 1 ? '' : 's'}
                            </p>
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

        <ModalFooter className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <Button className='border-gray-600 text-gray-300' disabled={loading} variant='bordered' onPress={handleClose}>
            Cancelar
          </Button>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button
              className='bg-warning-500/10 text-warning-400 border border-warning-500/20'
              isDisabled={loading}
              startContent={!loading && <Save className='w-4 h-4' />}
              variant='flat'
              onPress={() => handleSubmit('draft')}>
              Guardar como borrador
            </Button>
            <Button
              color='primary'
              isLoading={loading}
              startContent={!loading && <CheckCircle className='w-4 h-4' />}
              onPress={() => handleSubmit('publish')}>
              Crear y publicar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateEventForm
