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
  Divider
} from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { createEventSchema } from '@schemas/event/eventSchemas.js'
import { DEFAULT_EVENT_FORM_DATA, EVENT_STATUS, EVENT_CATEGORIES } from '@constants/tableConstants.js'
import useTour from '@hooks/useTour.js'
import { Plus, Calendar, MapPin, DollarSign, Tag, Image as ImageIcon } from 'lucide-react'

const CreateEventForm = memo(({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addTour } = useTour()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(createEventSchema),
    defaultValues: DEFAULT_EVENT_FORM_DATA
  })

  // Estados locales para campos complejos
  const [tags, setTags] = useState([])
  const [includes, setIncludes] = useState([])
  const [images, setImages] = useState([''])

  // Observar cambios en campos específicos
  const watchedTags = watch('tags')

  const handleClose = () => {
    reset(DEFAULT_EVENT_FORM_DATA)
    setTags([])
    setIncludes([])
    setImages([''])
    onClose()
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Preparar datos para el backend
      const eventData = {
        ...data,
        tags: tags,
        includes: includes,
        images: images.filter(img => img.trim() !== ''),
        availability: [{
          availableDate: data.availability?.[0]?.availableDate || '',
          availableSlots: parseInt(data.availability?.[0]?.availableSlots || 10),
          departureTime: data.availability?.[0]?.departureTime || '08:00',
          returnTime: data.availability?.[0]?.returnTime || '18:00'
        }]
      }

      const result = await addTour(eventData)
      
      if (result.success) {
        onSuccess()
        handleClose()
      }
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funciones para manejar tags
  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag]
      setTags(newTags)
      setValue('tags', newTags)
    }
  }

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }

  // Funciones para manejar includes
  const addInclude = (include) => {
    if (include && !includes.includes(include)) {
      const newIncludes = [...includes, include]
      setIncludes(newIncludes)
      setValue('includes', newIncludes)
    }
  }

  const removeInclude = (includeToRemove) => {
    const newIncludes = includes.filter(include => include !== includeToRemove)
    setIncludes(newIncludes)
    setValue('includes', newIncludes)
  }

  // Funciones para manejar imágenes
  const addImage = () => {
    setImages([...images, ''])
  }

  const updateImage = (index, value) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
    setValue('images', newImages.filter(img => img.trim() !== ''))
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages.length === 0 ? [''] : newImages)
    setValue('images', newImages.filter(img => img.trim() !== ''))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        modal: "bg-background",
        header: "border-b border-divider",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Crear Nuevo Evento</h2>
            <p className="text-sm text-default-500">
              Complete la información para crear un nuevo evento o tour
            </p>
          </ModalHeader>

          <ModalBody className="gap-6">
            {/* Información Básica */}
            <Card>
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Nombre del Evento"
                        placeholder="Ej: Tour por Cartagena"
                        isInvalid={!!errors.name}
                        errorMessage={errors.name?.message}
                        isRequired
                      />
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Estado"
                        placeholder="Seleccionar estado"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        isInvalid={!!errors.status}
                        errorMessage={errors.status?.message}
                      >
                        {Object.values(EVENT_STATUS).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Descripción"
                      placeholder="Describe el evento o tour en detalle..."
                      minRows={3}
                      maxRows={5}
                      isInvalid={!!errors.description}
                      errorMessage={errors.description?.message}
                      isRequired
                    />
                  )}
                />
              </CardBody>
            </Card>

            {/* Destino */}
            <Card>
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Destino
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="destination.country"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="País"
                        placeholder="Ej: Colombia"
                        isInvalid={!!errors.destination?.country}
                        errorMessage={errors.destination?.country?.message}
                        isRequired
                      />
                    )}
                  />

                  <Controller
                    name="destination.city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Ciudad"
                        placeholder="Ej: Cartagena"
                        isInvalid={!!errors.destination?.city}
                        errorMessage={errors.destination?.city?.message}
                        isRequired
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Precios */}
            <Card>
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Precios
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="adultPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Precio Adultos"
                        placeholder="0"
                        startContent={<span className="text-default-400">$</span>}
                        isInvalid={!!errors.adultPrice}
                        errorMessage={errors.adultPrice?.message}
                        isRequired
                      />
                    )}
                  />

                  <Controller
                    name="childPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Precio Niños"
                        placeholder="0"
                        startContent={<span className="text-default-400">$</span>}
                        isInvalid={!!errors.childPrice}
                        errorMessage={errors.childPrice?.message}
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Disponibilidad */}
            <Card>
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold">Disponibilidad</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="availability.0.availableDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        label="Fecha Disponible"
                        isInvalid={!!errors.availability?.[0]?.availableDate}
                        errorMessage={errors.availability?.[0]?.availableDate?.message}
                      />
                    )}
                  />

                  <Controller
                    name="availability.0.availableSlots"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Plazas Disponibles"
                        placeholder="10"
                        isInvalid={!!errors.availability?.[0]?.availableSlots}
                        errorMessage={errors.availability?.[0]?.availableSlots?.message}
                      />
                    )}
                  />

                  <Controller
                    name="hotel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Estrellas Hotel"
                        placeholder="Seleccionar"
                        selectedKeys={field.value ? [field.value.toString()] : []}
                        onSelectionChange={(keys) => field.onChange(parseInt(Array.from(keys)[0]))}
                      >
                        {[1, 2, 3, 4, 5].map((stars) => (
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
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Etiquetas y Categorías
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.values(EVENT_CATEGORIES).map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={tags.includes(category) ? "solid" : "bordered"}
                      color={tags.includes(category) ? "primary" : "default"}
                      onPress={() => {
                        if (tags.includes(category)) {
                          removeTag(category)
                        } else {
                          addTag(category)
                        }
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-default-500">Seleccionadas:</span>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Imágenes */}
            <Card>
              <CardBody className="gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imágenes
                  </h3>
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={addImage}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    Agregar Imagen
                  </Button>
                </div>

                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder="URL de la imagen"
                        className="flex-1"
                      />
                      {images.length > 1 && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeImage(index)}
                        >
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
            <Button
              variant="light"
              onPress={handleClose}
              isDisabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Evento'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
})

CreateEventForm.displayName = 'CreateEventForm'

export default CreateEventForm