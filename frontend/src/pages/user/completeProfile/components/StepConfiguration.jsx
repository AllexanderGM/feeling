import { useCallback, useMemo, memo } from 'react'
import { Switch, Avatar, Card, CardBody, Chip, Divider } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { User, MapPin, Images, Briefcase, Ruler, Building, Calendar, Heart, MessageCircle, Share, Info } from 'lucide-react'

const StepConfiguration = ({ control, errors, watch, setValue, clearErrors, categoryOptions }) => {
  // ========================================
  // Datos del formulario
  // ========================================
  const formValues = watch()
  const {
    showAge,
    showLocation,
    categoryInterest,
    agePreferenceMin,
    agePreferenceMax,
    locationPreferenceRadius,
    church,
    spiritualMoments,
    images,
    selectedProfileImageIndex,
    birthDate,
    name,
    lastName,
    city,
    country,
    description,
    profession,
    height,
    tags
  } = formValues

  // ========================================
  // Manejadores de formulario optimizados
  // ========================================
  const formHandlers = useMemo(
    () => ({
      handleInputChange: (field, value) => {
        setValue(field, value, { shouldValidate: true })
        if (errors[field]) {
          clearErrors(field)
        }
      }
    }),
    [setValue, clearErrors, errors]
  )

  // ========================================
  // Funciones de utilidad memoizadas
  // ========================================
  const imageUtils = useMemo(
    () => ({
      // Función para obtener la URL de una imagen (maneja Files y URLs)
      getImageUrl: image => {
        if (!image) return null

        // String directo (URL)
        if (typeof image === 'string') return image

        // File o Blob - crear URL temporal
        if (image instanceof File || image instanceof Blob) {
          return URL.createObjectURL(image)
        }

        // Objeto con url
        if (image?.url) return image.url

        return null
      }
    }),
    []
  )

  // ========================================
  // Renderizador de Switch optimizado
  // ========================================
  const renderSwitch = useCallback(
    (fieldName, config = {}) => {
      const { icon, label, description, defaultValue = true } = config

      return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">{icon}</span>
            <div>
              <span className="text-gray-200 font-medium">{label}</span>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </div>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Switch
                isSelected={field.value ?? defaultValue}
                onValueChange={value => formHandlers.handleInputChange(fieldName, value)}
                color="primary"
              />
            )}
          />
        </div>
      )
    },
    [control, formHandlers]
  )

  // Función para obtener la imagen principal del perfil
  const getCurrentProfileImageUrl = useCallback(() => {
    if (images && images.length > 0) {
      // Si hay un índice seleccionado específicamente
      if (selectedProfileImageIndex !== undefined && images[selectedProfileImageIndex]) {
        return imageUtils.getImageUrl(images[selectedProfileImageIndex])
      }
      // Si no, usar la primera imagen
      return imageUtils.getImageUrl(images[0])
    }
    return null
  }, [images, selectedProfileImageIndex, imageUtils])

  // Función para obtener todas las imágenes con sus URLs procesadas
  const getAllImages = useCallback(() => {
    if (!images || images.length === 0) return []

    return images
      .map((image, index) => ({
        url: imageUtils.getImageUrl(image),
        index: index,
        isMain: index === (selectedProfileImageIndex || 0),
        original: image
      }))
      .filter(img => img.url)
  }, [images, selectedProfileImageIndex, imageUtils])

  // Función para calcular la edad
  const calculateAge = useCallback(birthDate => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }, [])

  // Función para obtener la categoría seleccionada
  const getSelectedCategory = useCallback(() => {
    if (!categoryInterest || !categoryOptions || categoryOptions.length === 0) {
      return null
    }
    return categoryOptions.find(item => item.key === categoryInterest)
  }, [categoryInterest, categoryOptions])

  // Funciones de categorías memoizadas
  const categoryUtils = useMemo(
    () => ({
      // Función para obtener el nombre de la categoría (fallback)
      getCategoryName: categoryKey => {
        const categories = {
          ESSENCE: 'Essence',
          ROUSE: 'Rouse',
          SPIRIT: 'Spirit'
        }
        return categories[categoryKey] || categoryKey
      },

      // Función para obtener el ícono de la categoría (fallback)
      getCategoryIcon: categoryKey => {
        const icons = {
          ESSENCE: '💝',
          ROUSE: '🏳️‍🌈',
          SPIRIT: '✝️'
        }
        return icons[categoryKey] || '💫'
      }
    }),
    []
  )

  // ========================================
  // Datos computados memoizados
  // ========================================
  const userAge = useMemo(() => calculateAge(birthDate), [calculateAge, birthDate])
  const allImages = useMemo(() => getAllImages(), [getAllImages])
  const selectedCategory = useMemo(() => getSelectedCategory(), [getSelectedCategory])
  const profileImageUrl = useMemo(() => getCurrentProfileImageUrl(), [getCurrentProfileImageUrl])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200">Vista previa y configuración</h2>
        <p className="text-gray-400 mt-2">Revisa cómo se verá tu perfil y configura tu privacidad</p>
      </div>

      {/* VISTA PREVIA DEL PERFIL */}
      <Card className="bg-gray-800/50 border border-gray-700">
        <CardBody className="p-6">
          {/* Header del perfil */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <Avatar
                src={profileImageUrl}
                className="w-20 h-20 ring-2 ring-primary-500"
                isBordered
                fallback={<User className="text-4xl text-gray-400" />}
              />
              {categoryInterest && selectedCategory && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
                  <span className="text-lg">{selectedCategory.icon || categoryUtils.getCategoryIcon(categoryInterest)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-bold text-white truncate">
                  {name} {lastName}
                </h4>
                {showAge && userAge && <span className="text-gray-400">{userAge}</span>}
              </div>

              {showLocation && city && (
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                  <MapPin className="text-sm" />
                  <span>
                    {city}, {country}
                  </span>
                </div>
              )}

              {selectedCategory && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<span>{selectedCategory.icon || categoryUtils.getCategoryIcon(categoryInterest)}</span>}>
                  {selectedCategory.label || categoryUtils.getCategoryName(categoryInterest)}
                </Chip>
              )}
            </div>
          </div>

          {/* Descripción */}
          {description && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            </div>
          )}

          {/* Galería de fotos */}
          {allImages.length > 1 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">
                <Images className="text-primary-400 text-sm" /> Fotos ({allImages.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(1, 5).map((image, index) => (
                  <img key={index} src={image.url} alt={`Foto ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {profession && (
              <div className="flex items-center gap-2">
                <Briefcase className="text-gray-400 text-sm" />
                <span className="text-gray-300">{profession}</span>
              </div>
            )}

            {height && (
              <div className="flex items-center gap-2">
                <Ruler className="text-gray-400 text-sm" />
                <span className="text-gray-300">{height} cm</span>
              </div>
            )}
          </div>

          {/* Tags de intereses */}
          {tags && tags.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">Intereses</p>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 6).map((tag, index) => (
                  <Chip key={index} size="sm" variant="bordered" className="text-xs">
                    {tag}
                  </Chip>
                ))}
                {tags.length > 6 && (
                  <Chip size="sm" variant="bordered" className="text-xs">
                    +{tags.length - 6} más
                  </Chip>
                )}
              </div>
            </div>
          )}

          {/* Información específica por categoría */}
          {categoryInterest === 'SPIRIT' && (church || spiritualMoments) && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-xs mb-2">Información espiritual</p>
              {church && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <Building className="text-gray-400 text-sm" />
                  <span className="text-gray-300">{church}</span>
                </div>
              )}
              {spiritualMoments && <p className="text-gray-300 text-xs">{spiritualMoments.slice(0, 100)}...</p>}
            </div>
          )}

          {/* Información de preferencias */}
          <div className="border-t border-gray-700 pt-4 mb-4">
            <p className="text-gray-400 text-xs mb-2">Preferencias</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-400 text-xs" />
                <span className="text-gray-300">
                  {agePreferenceMin || 18} - {agePreferenceMax || 50} años
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-400 text-xs" />
                <span className="text-gray-300">{locationPreferenceRadius || 50} km</span>
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Footer del perfil */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Activo recientemente</span>
            <div className="flex gap-3">
              <Heart className="cursor-pointer hover:text-primary-400" />
              <MessageCircle className="cursor-pointer hover:text-primary-400" />
              <Share className="cursor-pointer hover:text-primary-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Configuración de privacidad */}
      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-200">Configuración de privacidad</h3>
          <p className="text-gray-400 mt-1">Controla qué información es visible para otros usuarios</p>
        </div>

        <div className="space-y-3">
          {renderSwitch('showAge', {
            icon: 'calendar_today',
            label: 'Mostrar mi edad',
            description: 'Otros usuarios podrán ver tu edad'
          })}

          {renderSwitch('showLocation', {
            icon: 'location_on',
            label: 'Mostrar mi ubicación',
            description: 'Otros usuarios podrán ver tu ciudad'
          })}

          {renderSwitch('showMeInSearch', {
            icon: 'search',
            label: 'Aparecer en búsquedas',
            description: 'Tu perfil aparecerá en los resultados de búsqueda'
          })}

          {renderSwitch('allowNotifications', {
            icon: 'notifications',
            label: 'Recibir notificaciones',
            description: 'Notificaciones de matches, mensajes y actividad'
          })}
        </div>
      </section>

      {/* Información final */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="text-green-400" />
          <div className="text-sm">
            <h4 className="text-green-400 font-medium mb-2">¡Ya casi terminamos!</h4>
            <p className="text-green-300/80">
              Revisa que toda tu información esté correcta. Podrás modificar estas preferencias desde tu perfil después de registrarte.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(StepConfiguration)
