import { useMemo } from 'react'
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
import { Calendar, MapPin, DollarSign, Users, FileText, Tag, Search, Images, CheckCircle, Save, Edit, Undo2 } from 'lucide-react'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import { RichTextEditor } from '@components/ui/richtext'
import ImageManager from '@components/ui/imageManager/ImageManager.jsx'
import { EVENT_CATEGORIES } from '@constants/events.js'
import { useEventForm } from '@hooks/event'

const MAX_GALLERY_IMAGES = 5

const stripHtml = value => value.replace(/<[^>]+>/g, '').trim()

const EventFormModal = ({ mode = 'create', isOpen, onClose, onSubmit, loading = false, eventData = null, statusInfo = null }) => {
  console.log('🎯 EventFormModal - Props:', {
    mode,
    isOpen,
    hasEventData: !!eventData,
    eventData,
    loading
  })

  const {
    // Form control
    control,
    formValues,
    formErrors,

    // Image management
    imageManagerRef,
    eventImages,
    imageCount,
    imageManagerKey,
    handleImagesChange,
    handleImageValidationChange,
    imageError,
    hasInitialized,

    // Form submission
    handleSubmitWithAction,

    // Computed values
    selectedCategory,
    previewPrice,
    previewDate,
    minDateTime,
    isEditMode
  } = useEventForm({ mode, eventData, onSubmit, isOpen })

  console.log('🎯 EventFormModal - After hook:', {
    formValues,
    eventImages,
    hasInitialized,
    isEditMode
  })

  const actionButtons = useMemo(() => {
    if (isEditMode) {
      return [
        {
          key: 'draft',
          label: 'Guardar como borrador',
          className: 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
          variant: 'flat',
          icon: <Save className='w-4 h-4' />,
          showLoader: true
        },
        {
          key: 'publish',
          label: 'Guardar y publicar',
          color: 'primary',
          icon: <CheckCircle className='w-4 h-4' />,
          showLoader: true
        }
      ]
    }

    return [
      {
        key: 'draft',
        label: 'Guardar como borrador',
        className: 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
        variant: 'flat',
        icon: <Save className='w-4 h-4' />,
        showLoader: false
      },
      {
        key: 'publish',
        label: 'Crear y publicar',
        color: 'primary',
        icon: <CheckCircle className='w-4 h-4' />,
        showLoader: true
      }
    ]
  }, [isEditMode])

  const headerConfig = useMemo(
    () =>
      isEditMode
        ? {
            icon: <Edit className='w-5 h-5 text-orange-400' />,
            iconBg: 'bg-orange-500/20',
            title: 'Editar Evento',
            subtitle: 'Modifica la información del evento'
          }
        : {
            icon: <Calendar className='w-5 h-5 text-blue-400' />,
            iconBg: 'bg-blue-500/20',
            title: 'Crear Nuevo Evento',
            subtitle: 'Configura un nuevo evento para la plataforma'
          },
    [isEditMode]
  )

  return (
    <Modal
      classNames={{
        base: 'bg-gray-900/95 border border-gray-700/50 shadow-2xl',
        closeButton: 'text-gray-400 hover:text-white hover:bg-gray-700 transition-colors',
        backdrop: 'bg-black/80 backdrop-blur-sm'
      }}
      isOpen={isOpen}
      placement='center'
      scrollBehavior='inside'
      size='5xl'
      onClose={onClose}>
      <ModalContent className='max-h-[95vh]'>
        <ModalHeader className='flex flex-col gap-2 text-gray-100 border-b border-gray-700/50 pb-4'>
          <div className='flex items-center gap-3'>
            <div className={`w-10 h-10 ${headerConfig.iconBg} rounded-xl flex items-center justify-center`}>{headerConfig.icon}</div>
            <div className='flex-1'>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                {headerConfig.title}
              </h2>
              <p className='text-sm text-gray-400 font-normal mt-1'>{headerConfig.subtitle}</p>
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

        <ModalBody className='gap-6 py-6 px-6'>
          <div className='space-y-6'>
            {/* Sección de Imágenes */}
            <Card className='bg-gray-800/60 border border-gray-700/50 shadow-lg'>
              <CardBody className='gap-5 p-6'>
                <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2.5'>
                  <div className={`p-2 ${isEditMode ? 'bg-orange-500/20' : 'bg-blue-500/20'} rounded-lg`}>
                    <Images className={`w-5 h-5 ${isEditMode ? 'text-orange-400' : 'text-blue-400'}`} />
                  </div>
                  Imágenes del evento
                </h3>

                {!hasInitialized ? (
                  <div className='text-center py-8'>
                    <p className='text-blue-400 text-sm'>Cargando imágenes...</p>
                  </div>
                ) : (
                  <ImageManager
                    key={imageManagerKey}
                    ref={imageManagerRef}
                    enableCrop
                    enableReorder
                    showEmptySlots
                    cropAspectRatio={16 / 9}
                    description='La primera imagen se mostrará como principal. Usa fotos horizontales (16:9) de máximo 5 MB cada una.'
                    imageGridProps={{
                      headerTitle: 'Galería del evento',
                      headerSubtitle: 'Fotos horizontales recomendadas • Máximo 5MB • Resolución mínima 1280x720px',
                      headerHelperText: 'Arrastra para reordenar las imágenes.',
                      imageAspectClass: 'aspect-[16/9]'
                    }}
                    images={eventImages}
                    maxImages={MAX_GALLERY_IMAGES}
                    title={isEditMode ? 'Gestiona la galería del evento' : 'Selecciona hasta 5 imágenes horizontales'}
                    onImagesChange={handleImagesChange}
                    onValidationChange={handleImageValidationChange}
                  />
                )}

                {imageError && (
                  <p className='text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>{imageError}</p>
                )}
              </CardBody>
            </Card>

            {/* Información Básica */}
            <Card className='bg-gray-800/60 border border-gray-700/50 shadow-lg'>
              <CardBody className='gap-5 p-6'>
                <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2.5'>
                  <div className='p-2 bg-blue-500/20 rounded-lg'>
                    <FileText className='w-5 h-5 text-blue-400' />
                  </div>
                  Información Básica
                </h3>

                <Controller
                  control={control}
                  name='title'
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                      }}
                      errorMessage={formErrors.title?.message}
                      isInvalid={!!formErrors.title}
                      label='Título del Evento'
                      maxLength={200}
                      placeholder='Ej: Concierto de Jazz, Tour Cultural, Evento Deportivo'
                      startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                      variant='bordered'
                    />
                  )}
                />

                <div>
                  <label className='block text-sm font-medium text-gray-200 mb-2' htmlFor='event-description'>
                    Descripción <span className='text-red-400'>*</span>
                  </label>
                  <Controller
                    control={control}
                    name='description'
                    render={({ field: { value, onChange } }) => (
                      <RichTextEditor
                        description='Usa el editor para dar formato al texto'
                        error={formErrors.description?.message}
                        id='event-description'
                        maxLength={2000}
                        placeholder='Describe el evento, actividades incluidas, lugar, qué esperar...'
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name='location'
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                      }}
                      errorMessage={formErrors.location?.message}
                      isInvalid={!!formErrors.location}
                      label='Ubicación del Evento'
                      maxLength={300}
                      placeholder='Ej: Teatro Nacional, Bogotá'
                      startContent={<MapPin className='w-4 h-4 text-gray-400' />}
                      variant='bordered'
                    />
                  )}
                />
              </CardBody>
            </Card>

            {/* Configuración del Evento */}
            <Card className='bg-gray-800/60 border border-gray-700/50 shadow-lg'>
              <CardBody className='gap-5 p-6'>
                <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2.5'>
                  <div className='p-2 bg-green-500/20 rounded-lg'>
                    <MapPin className='w-5 h-5 text-green-400' />
                  </div>
                  Configuración del Evento
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='eventDate'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        classNames={{
                          input: 'text-gray-200',
                          inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                        }}
                        errorMessage={formErrors.eventDate?.message}
                        isInvalid={!!formErrors.eventDate}
                        label='Fecha y Hora del Evento'
                        min={minDateTime}
                        startContent={<Calendar className='w-4 h-4 text-gray-400' />}
                        type='datetime-local'
                        variant='bordered'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='category'
                    render={({ field }) => (
                      <Select
                        {...field}
                        isRequired
                        classNames={{
                          trigger: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500',
                          value: 'text-gray-200'
                        }}
                        errorMessage={formErrors.category?.message}
                        isInvalid={!!formErrors.category}
                        label='Categoría'
                        placeholder='Selecciona una categoría'
                        selectedKeys={field.value ? [field.value] : []}
                        startContent={<Tag className='w-4 h-4 text-gray-400' />}
                        variant='bordered'
                        onSelectionChange={keys => field.onChange(Array.from(keys)[0] || '')}>
                        {EVENT_CATEGORIES.map(category => (
                          <SelectItem key={category.key} value={category.key}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='price'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        classNames={{
                          input: 'text-gray-200',
                          inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                        }}
                        errorMessage={formErrors.price?.message}
                        isInvalid={!!formErrors.price}
                        label='Precio (COP)'
                        min='0'
                        placeholder='0, 250000, 500000...'
                        startContent={<DollarSign className='w-4 h-4 text-gray-400' />}
                        step='0.01'
                        type='number'
                        variant='bordered'
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='maxCapacity'
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        classNames={{
                          input: 'text-gray-200',
                          inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                        }}
                        errorMessage={formErrors.maxCapacity?.message}
                        isInvalid={!!formErrors.maxCapacity}
                        label='Capacidad Máxima'
                        min='1'
                        placeholder='10, 50, 200...'
                        startContent={<Users className='w-4 h-4 text-gray-400' />}
                        type='number'
                        variant='bordered'
                      />
                    )}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Configuración SEO */}
            <Card className='bg-gray-800/60 border border-gray-700/50 shadow-lg'>
              <CardBody className='gap-5 p-6'>
                <h3 className='text-lg font-semibold text-gray-100 flex items-center gap-2.5'>
                  <div className='p-2 bg-purple-500/20 rounded-lg'>
                    <Search className='w-5 h-5 text-purple-400' />
                  </div>
                  Configuración SEO (Opcional)
                </h3>

                <Controller
                  control={control}
                  name='seoTitle'
                  render={({ field }) => (
                    <Input
                      {...field}
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                      }}
                      description='Máximo 160 caracteres. Si se deja vacío usaremos el título del evento.'
                      errorMessage={formErrors.seoTitle?.message}
                      isInvalid={!!formErrors.seoTitle}
                      label='Título SEO'
                      maxLength={160}
                      placeholder='Ej: Concierto íntimo de jazz en Bogotá | Feeling'
                      variant='bordered'
                    />
                  )}
                />

                <Controller
                  control={control}
                  name='seoDescription'
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 focus-within:border-primary-500'
                      }}
                      description='Máximo 320 caracteres. Usa una frase atractiva para buscadores.'
                      errorMessage={formErrors.seoDescription?.message}
                      isInvalid={!!formErrors.seoDescription}
                      label='Descripción SEO'
                      maxLength={320}
                      minRows={3}
                      placeholder='Resume la experiencia del evento para que Google y redes sociales lo destaquen.'
                      variant='bordered'
                    />
                  )}
                />

                <Controller
                  control={control}
                  name='seoKeywords'
                  render={({ field }) => (
                    <Input
                      {...field}
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                      }}
                      description='Separa las palabras o frases con comas. Máximo 500 caracteres.'
                      errorMessage={formErrors.seoKeywords?.message}
                      isInvalid={!!formErrors.seoKeywords}
                      label='Palabras clave SEO'
                      maxLength={500}
                      placeholder='evento, bienestar emocional, networking, feeling'
                      variant='bordered'
                    />
                  )}
                />

                <Controller
                  control={control}
                  name='seoImage'
                  render={({ field }) => (
                    <Input
                      {...field}
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
                      }}
                      description='Si no se indica, usaremos la imagen principal del evento.'
                      errorMessage={formErrors.seoImage?.message}
                      isInvalid={!!formErrors.seoImage}
                      label='URL de imagen para compartir'
                      maxLength={500}
                      placeholder='https://cdn.feeling.com/eventos/mi-evento.jpg'
                      variant='bordered'
                    />
                  )}
                />
              </CardBody>
            </Card>

            {/* Vista Previa */}
            {(formValues.title || formValues.price || formValues.maxCapacity || formValues.category) && (
              <Card className='bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-purple-900/30 border border-blue-600/40 shadow-lg'>
                <CardBody className='p-6'>
                  <div className='flex items-center gap-2.5 mb-4'>
                    <div className='p-2 bg-blue-500/20 rounded-lg'>
                      <Calendar className='w-5 h-5 text-blue-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-blue-300'>Vista Previa</h3>
                  </div>
                  <div className='bg-gray-800/50 rounded-lg p-6 border border-gray-600/30'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h4 className='font-bold text-xl text-gray-100 mb-2'>{formValues.title || 'Título del Evento'}</h4>
                        {selectedCategory && (
                          <Chip className='mb-2' color='primary' size='sm' variant='flat'>
                            {selectedCategory.label}
                          </Chip>
                        )}
                        <p className='text-sm text-gray-400 mb-3'>
                          {formValues.description ? stripHtml(formValues.description) : 'Descripción del evento...'}
                        </p>
                      </div>
                      {previewPrice && (
                        <div className='text-right ml-4'>
                          <p className='text-2xl font-bold text-green-400'>{previewPrice}</p>
                          <p className='text-xs text-gray-400'>COP</p>
                        </div>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-600/30'>
                      {previewDate && (
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-blue-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Fecha</p>
                            <p className='text-sm text-gray-200'>{previewDate}</p>
                          </div>
                        </div>
                      )}

                      {formValues.maxCapacity && (
                        <div className='flex items-center gap-2'>
                          <Users className='w-4 h-4 text-purple-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Capacidad</p>
                            <p className='text-sm text-gray-200'>{formValues.maxCapacity} personas</p>
                          </div>
                        </div>
                      )}

                      {formValues.location && (
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-amber-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Ubicación</p>
                            <p className='text-sm text-gray-200'>{formValues.location}</p>
                          </div>
                        </div>
                      )}

                      {imageCount > 0 && (
                        <div className='flex items-center gap-2'>
                          <Images className='w-4 h-4 text-orange-400' />
                          <div>
                            <p className='text-xs text-gray-400'>Galería</p>
                            <p className='text-sm text-gray-200'>
                              {imageCount} imagen{imageCount === 1 ? '' : 'es'} seleccionada{imageCount === 1 ? '' : 's'}
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

        <ModalFooter className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-gray-700/50 pt-4 px-6 pb-6'>
          <Button
            className='border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors'
            disabled={loading}
            size='lg'
            variant='bordered'
            onPress={onClose}>
            Cancelar
          </Button>
          <div className='flex flex-col sm:flex-row gap-2.5'>
            {actionButtons.map(({ key, label, className, variant, color, icon, showLoader }) => (
              <Button
                key={key}
                className={className}
                color={color}
                isDisabled={loading}
                isLoading={loading && showLoader}
                size='lg'
                startContent={!loading && icon}
                variant={variant}
                onPress={() => handleSubmitWithAction(key)}>
                {label}
              </Button>
            ))}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

EventFormModal.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  eventData: PropTypes.object,
  statusInfo: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.string
  })
}

export default EventFormModal
