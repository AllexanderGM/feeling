import { useState, memo, useEffect } from 'react'
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
  CardBody
} from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { editEventSchema } from '@schemas/event/eventSchemas.js'
import { EVENT_STATUS, EVENT_CATEGORIES } from '@constants/tableConstants.js'
import { useTour } from '@hooks'
import { Plus, Calendar, MapPin, DollarSign, Tag, Image as ImageIcon } from 'lucide-react'
import { Logger } from '@utils/logger.js'

const EditEventForm = memo(({ isOpen, onClose, onSuccess, eventData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { editTour } = useTour()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    resolver: yupResolver(editEventSchema),
    defaultValues: eventData || {}
  })

  // Estados locales para campos complejos
  const [tags, setTags] = useState(eventData?.tags || [])
  const [includes, setIncludes] = useState(eventData?.includes || [])
  const [images, setImages] = useState(eventData?.images?.length > 0 ? eventData.images : [''])

  // Actualizar formulario cuando cambian los datos del evento
  useEffect(() => {
    if (eventData) {
      reset(eventData)
      setTags(eventData.tags || [])
      setIncludes(eventData.includes || [])
      setImages(eventData.images?.length > 0 ? eventData.images : [''])
    }
  }, [eventData, reset])

  const handleClose = () => {
    reset()
    setTags([])
    setIncludes([])
    setImages([''])
    onClose()
  }

  const onSubmit = async data => {
    setIsSubmitting(true)
    try {
      // Preparar datos para el backend
      const updatedEventData = {
        ...data,
        tags: tags,
        includes: includes,
        images: images.filter(img => img.trim() !== ''),
        availability: eventData?.availability || [
          {
            availableDate: data.availability?.[0]?.availableDate || '',
            availableSlots: parseInt(data.availability?.[0]?.availableSlots || 10),
            departureTime: data.availability?.[0]?.departureTime || '08:00',
            returnTime: data.availability?.[0]?.returnTime || '18:00'
          }
        ]
      }

      const result = await editTour(eventData.id, updatedEventData)

      if (result.success) {
        onSuccess()
        handleClose()
      }
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SERVICE, 'update_event', 'Error updating event', { error, eventId: eventData?.id })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funciones para manejar tags
  const addTag = tag => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag]

      setTags(newTags)
      setValue('tags', newTags)
    }
  }

  const removeTag = tagToRemove => {
    const newTags = tags.filter(tag => tag !== tagToRemove)

    setTags(newTags)
    setValue('tags', newTags)
  }

  // Funciones para manejar imágenes
  const addImage = () => {
    setImages([...images, ''])
  }

  const updateImage = (index, value) => {
    const newImages = [...images]

    newImages[index] = value
    setImages(newImages)
    setValue(
      'images',
      newImages.filter(img => img.trim() !== '')
    )
  }

  const removeImage = index => {
    const newImages = images.filter((_, i) => i !== index)

    setImages(newImages.length === 0 ? [''] : newImages)
    setValue(
      'images',
      newImages.filter(img => img.trim() !== '')
    )
  }

  if (!eventData) {
    return null
  }

  return (
    <Modal
      classNames={{
        modal: 'bg-background',
        header: 'border-b border-divider',
        footer: 'border-t border-divider'
      }}
      isOpen={isOpen}
      scrollBehavior='inside'
      size='3xl'
      onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className='flex flex-col gap-1'>
            <h2 className='text-xl font-semibold'>Editar Evento</h2>
            <p className='text-sm text-default-500'>Modifica la información del evento: {eventData.name}</p>
          </ModalHeader>

          <ModalBody className='gap-6'>
            {/* Información Básica */}
            <Card>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Calendar className='w-5 h-5' />
                  Información Básica
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        errorMessage={errors.name?.message}
                        isInvalid={!!errors.name}
                        label='Nombre del Evento'
                        placeholder='Ej: Tour por Cartagena'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='status'
                    render={({ field }) => (
                      <Select
                        {...field}
                        errorMessage={errors.status?.message}
                        isInvalid={!!errors.status}
                        label='Estado'
                        placeholder='Seleccionar estado'
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={keys => field.onChange(Array.from(keys)[0])}>
                        {Object.values(EVENT_STATUS).map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name='description'
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      isRequired
                      errorMessage={errors.description?.message}
                      isInvalid={!!errors.description}
                      label='Descripción'
                      maxRows={5}
                      minRows={3}
                      placeholder='Describe el evento o tour en detalle...'
                    />
                  )}
                />
              </CardBody>
            </Card>

            {/* Destino */}
            <Card>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <MapPin className='w-5 h-5' />
                  Destino
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='destination.country'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        errorMessage={errors.destination?.country?.message}
                        isInvalid={!!errors.destination?.country}
                        label='País'
                        placeholder='Ej: Colombia'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='destination.city'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        errorMessage={errors.destination?.city?.message}
                        isInvalid={!!errors.destination?.city}
                        label='Ciudad'
                        placeholder='Ej: Cartagena'
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Precios */}
            <Card>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <DollarSign className='w-5 h-5' />
                  Precios
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='adultPrice'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        errorMessage={errors.adultPrice?.message}
                        isInvalid={!!errors.adultPrice}
                        label='Precio Adultos'
                        placeholder='0'
                        startContent={<span className='text-default-400'>$</span>}
                        type='number'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='childPrice'
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.childPrice?.message}
                        isInvalid={!!errors.childPrice}
                        label='Precio Niños'
                        placeholder='0'
                        startContent={<span className='text-default-400'>$</span>}
                        type='number'
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Disponibilidad */}
            <Card>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-semibold'>Disponibilidad</h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Controller
                    control={control}
                    name='availability.0.availableDate'
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.availability?.[0]?.availableDate?.message}
                        isInvalid={!!errors.availability?.[0]?.availableDate}
                        label='Fecha Disponible'
                        type='date'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='availability.0.availableSlots'
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.availability?.[0]?.availableSlots?.message}
                        isInvalid={!!errors.availability?.[0]?.availableSlots}
                        label='Plazas Disponibles'
                        placeholder='10'
                        type='number'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='hotel'
                    render={({ field }) => (
                      <Select
                        {...field}
                        label='Estrellas Hotel'
                        placeholder='Seleccionar'
                        selectedKeys={field.value ? [field.value.toString()] : []}
                        onSelectionChange={keys => field.onChange(parseInt(Array.from(keys)[0]))}>
                        {[1, 2, 3, 4, 5].map(stars => (
                          <SelectItem key={stars} value={stars}>
                            {stars} Estrella{stars !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Etiquetas */}
            <Card>
              <CardBody className='gap-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Tag className='w-5 h-5' />
                  Etiquetas y Categorías
                </h3>

                <div className='flex flex-wrap gap-2 mb-4'>
                  {Object.values(EVENT_CATEGORIES).map(category => (
                    <Button
                      key={category}
                      color={tags.includes(category) ? 'primary' : 'default'}
                      size='sm'
                      variant={tags.includes(category) ? 'solid' : 'bordered'}
                      onPress={() => {
                        if (tags.includes(category)) {
                          removeTag(category)
                        } else {
                          addTag(category)
                        }
                      }}>
                      {category}
                    </Button>
                  ))}
                </div>

                {tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    <span className='text-sm text-default-500'>Seleccionadas:</span>
                    {tags.map(tag => (
                      <button
                        key={tag}
                        aria-label={`Eliminar etiqueta ${tag}`}
                        className='bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500'
                        tabIndex={0}
                        type='button'
                        onClick={() => removeTag(tag)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            removeTag(tag)
                          }
                        }}>
                        {tag} ×
                      </button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardBody className='gap-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold flex items-center gap-2'>
                    <ImageIcon className='w-5 h-5' />
                    Imágenes
                  </h3>
                  <Button size='sm' startContent={<Plus className='w-4 h-4' />} variant='bordered' onPress={addImage}>
                    Agregar Imagen
                  </Button>
                </div>

                <div className='space-y-2'>
                  {images.map((image, index) => (
                    <div key={index} className='flex gap-2'>
                      <Input
                        className='flex-1'
                        placeholder='URL de la imagen'
                        value={image}
                        onChange={e => updateImage(index, e.target.value)}
                      />
                      {images.length > 1 && (
                        <Button color='danger' size='sm' variant='light' onPress={() => removeImage(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button isDisabled={isSubmitting} variant='light' onPress={handleClose}>
              Cancelar
            </Button>
            <Button color='primary' isDisabled={isSubmitting} isLoading={isSubmitting} type='submit'>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Evento'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
})

EditEventForm.displayName = 'EditEventForm'

export default EditEventForm
