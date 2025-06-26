import { Switch, Avatar, Card, CardBody, Chip, Divider } from '@heroui/react'
import { useCategoryInterests } from '@hooks/useCategoryInterests'

const StepConfiguration = ({ formData, errors, updateFormData, updateErrors }) => {
  const { categoryOptions } = useCategoryInterests()

  // Manejador de cambio con limpieza de errores
  const handleInputChange = (field, value) => {
    updateFormData(field, value)

    // Limpiar error del campo si existe
    if (errors[field]) {
      updateErrors({ ...errors, [field]: null })
    }
  }

  // Función para obtener la URL de una imagen (maneja Files y URLs)
  const getImageUrl = image => {
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

  // Función para obtener la imagen principal del perfil
  const getCurrentProfileImageUrl = () => {
    if (formData.images && formData.images.length > 0) {
      // Si hay un índice seleccionado específicamente
      if (formData.selectedProfileImageIndex !== undefined && formData.images[formData.selectedProfileImageIndex]) {
        return getImageUrl(formData.images[formData.selectedProfileImageIndex])
      }
      // Si no, usar la primera imagen
      return getImageUrl(formData.images[0])
    }
    return null
  }

  // Función para obtener todas las imágenes con sus URLs procesadas
  const getAllImages = () => {
    if (!formData.images || formData.images.length === 0) return []

    return formData.images
      .map((image, index) => ({
        url: getImageUrl(image),
        index: index,
        isMain: index === (formData.selectedProfileImageIndex || 0),
        original: image // Guardamos la referencia original por si la necesitamos
      }))
      .filter(img => img.url) // Solo incluir imágenes que tienen URL válida
  }

  // Función para calcular la edad
  const calculateAge = birthDate => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Función para obtener la categoría seleccionada
  const getSelectedCategory = () => {
    if (!formData.categoryInterest || !categoryOptions || categoryOptions.length === 0) {
      return null
    }
    return categoryOptions.find(item => item.key === formData.categoryInterest)
  }

  // Función para obtener el nombre de la categoría (fallback)
  const getCategoryName = categoryKey => {
    const categories = {
      ESSENCE: 'Essence',
      ROUSE: 'Rouse',
      SPIRIT: 'Spirit'
    }
    return categories[categoryKey] || categoryKey
  }

  // Función para obtener el ícono de la categoría (fallback)
  const getCategoryIcon = categoryKey => {
    const icons = {
      ESSENCE: '💝',
      ROUSE: '🏳️‍🌈',
      SPIRIT: '✝️'
    }
    return icons[categoryKey] || '💫'
  }

  const userAge = calculateAge(formData.birthDate)
  const allImages = getAllImages()
  const selectedCategory = getSelectedCategory()

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
                src={getCurrentProfileImageUrl()}
                className="w-20 h-20 ring-2 ring-primary-500"
                isBordered
                fallback={<span className="material-symbols-outlined text-4xl text-gray-400">account_circle</span>}
              />
              {formData.categoryInterest && selectedCategory && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
                  <span className="text-lg">{selectedCategory.icon || getCategoryIcon(formData.categoryInterest)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-bold text-white truncate">
                  {formData.name} {formData.lastName}
                </h4>
                {formData.showAge && userAge && <span className="text-gray-400">{userAge}</span>}
              </div>

              {formData.showLocation && formData.city && (
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span>
                    {formData.city}, {formData.country}
                  </span>
                </div>
              )}

              {selectedCategory && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<span>{selectedCategory.icon || getCategoryIcon(formData.categoryInterest)}</span>}>
                  {selectedCategory.label || getCategoryName(formData.categoryInterest)}
                </Chip>
              )}
            </div>
          </div>

          {/* Descripción */}
          {formData.description && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{formData.description}</p>
            </div>
          )}

          {/* Galería de fotos */}
          {allImages.length > 1 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">
                <span className="material-symbols-outlined text-primary-400 text-sm">photo_library</span> Fotos ({allImages.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(1, 5).map((image, index) => (
                  <img key={index} src={image.url} alt={`Foto ${index + 1}`} className="w-full h-16 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {formData.profession && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">business_center</span>
                <span className="text-gray-300">{formData.profession}</span>
              </div>
            )}

            {formData.height && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-sm">straighten</span>
                <span className="text-gray-300">{formData.height} cm</span>
              </div>
            )}
          </div>

          {/* Tags de intereses */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">Intereses</p>
              <div className="flex flex-wrap gap-1">
                {formData.tags.slice(0, 6).map((tag, index) => (
                  <Chip key={index} size="sm" variant="bordered" className="text-xs">
                    {tag}
                  </Chip>
                ))}
                {formData.tags.length > 6 && (
                  <Chip size="sm" variant="bordered" className="text-xs">
                    +{formData.tags.length - 6} más
                  </Chip>
                )}
              </div>
            </div>
          )}

          {/* Información específica por categoría */}
          {formData.categoryInterest === 'SPIRIT' && (formData.church || formData.spiritualMoments) && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-xs mb-2">Información espiritual</p>
              {formData.church && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="material-symbols-outlined text-gray-400 text-sm">account_balance</span>
                  <span className="text-gray-300">{formData.church}</span>
                </div>
              )}
              {formData.spiritualMoments && <p className="text-gray-300 text-xs">{formData.spiritualMoments.slice(0, 100)}...</p>}
            </div>
          )}

          {/* Información de preferencias */}
          <div className="border-t border-gray-700 pt-4 mb-4">
            <p className="text-gray-400 text-xs mb-2">Preferencias</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-xs">calendar_today</span>
                <span className="text-gray-300">
                  {formData.agePreferenceMin || 18} - {formData.agePreferenceMax || 50} años
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-xs">location_on</span>
                <span className="text-gray-300">{formData.locationPreferenceRadius || 50} km</span>
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Footer del perfil */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Activo recientemente</span>
            <div className="flex gap-3">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary-400">favorite</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary-400">chat</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary-400">share</span>
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
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400">calendar_today</span>
              <div>
                <span className="text-gray-200 font-medium">Mostrar mi edad</span>
                <p className="text-xs text-gray-400">Otros usuarios podrán ver tu edad</p>
              </div>
            </div>
            <Switch isSelected={formData.showAge ?? true} onValueChange={value => handleInputChange('showAge', value)} color="primary" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400">location_on</span>
              <div>
                <span className="text-gray-200 font-medium">Mostrar mi ubicación</span>
                <p className="text-xs text-gray-400">Otros usuarios podrán ver tu ciudad</p>
              </div>
            </div>
            <Switch
              isSelected={formData.showLocation ?? true}
              onValueChange={value => handleInputChange('showLocation', value)}
              color="primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <div>
                <span className="text-gray-200 font-medium">Aparecer en búsquedas</span>
                <p className="text-xs text-gray-400">Tu perfil aparecerá en los resultados de búsqueda</p>
              </div>
            </div>
            <Switch
              isSelected={formData.showMeInSearch ?? true}
              onValueChange={value => handleInputChange('showMeInSearch', value)}
              color="primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400">notifications</span>
              <div>
                <span className="text-gray-200 font-medium">Recibir notificaciones</span>
                <p className="text-xs text-gray-400">Notificaciones de matches, mensajes y actividad</p>
              </div>
            </div>
            <Switch
              isSelected={formData.allowNotifications ?? true}
              onValueChange={value => handleInputChange('allowNotifications', value)}
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* Información final */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-green-400">info</span>
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

export default StepConfiguration
