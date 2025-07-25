import { useCallback, useMemo, memo } from 'react'
import { Switch, Avatar, Card, CardBody, Chip, Divider } from '@heroui/react'
import { Controller } from 'react-hook-form'
import {
  User,
  MapPin,
  Images,
  Briefcase,
  Ruler,
  Building,
  Calendar,
  Heart,
  MessageCircle,
  Share,
  Info,
  Shield,
  Eye,
  Globe,
  Users,
  Phone,
  Bell,
  Mail,
  Smartphone,
  Lock,
  Settings,
  Zap,
  CreditCard,
  Camera,
  Sparkles,
  GraduationCap,
  UserCheck,
  Palette,
  CreditCard as IdCard
} from 'lucide-react'

const StepConfiguration = ({ control, errors, watch, setValue, clearErrors, categoryOptions, userAttributes }) => {
  // ========================================
  // Datos del formulario
  // ========================================
  const formValues = watch()

  // ========================================
  // Helpers para obtener datos reales
  // ========================================
  const getAttributeLabel = useCallback(
    (type, id) => {
      if (!userAttributes || !id) return 'Por completar'

      const options = userAttributes[`${type}Options`]
      if (!options) return 'Por completar'

      const option = options.find(opt => opt.value === id || opt.id === id)
      return option ? option.label : 'Por completar'
    },
    [userAttributes]
  )
  const {
    showAge,
    showLocation,
    showPhone,
    publicAccount,
    searchVisibility,
    locationPublic,
    showMeInSearch,
    allowNotifications,
    notificationsEmailEnabled,
    notificationsPhoneEnabled,
    notificationsMatchesEnabled,
    notificationsEventsEnabled,
    notificationsLoginEnabled,
    notificationsPaymentsEnabled,
    categoryInterest,
    agePreferenceMin,
    agePreferenceMax,
    locationPreferenceRadius,
    church,
    spiritualMoments,
    spiritualPractices,
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
    tags,
    // Campos adicionales para mostrar más información
    genderId,
    maritalStatusId,
    educationLevelId,
    bodyTypeId,
    eyeColorId,
    hairColorId,
    phone,
    phoneCode,
    document,
    // Campos específicos por categoría
    religionId,
    sexualRoleId,
    relationshipTypeId
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
      },

      // Manejador especial para el control general de notificaciones
      handleAllowNotificationsChange: value => {
        setValue('allowNotifications', value, { shouldValidate: true })

        // Solo desactivar las notificaciones configurables cuando se desactiva el control general
        // No hacer nada cuando se activa (permitir configuración individual)
        if (!value) {
          setValue('notificationsEmailEnabled', false, { shouldValidate: true })
          setValue('notificationsPhoneEnabled', false, { shouldValidate: true })
          setValue('notificationsMatchesEnabled', false, { shouldValidate: true })
          setValue('notificationsEventsEnabled', false, { shouldValidate: true })
          // No modificar notificationsLoginEnabled y notificationsPaymentsEnabled
          // ya que se gestionan desde otra parte
        }
        // Cuando se activa, no modificar las configuraciones individuales
        // Dejar que el usuario configure cada tipo por separado

        if (errors.allowNotifications) {
          clearErrors('allowNotifications')
        }
      },

      // Manejador especial para el control general de privacidad
      handlePublicAccountChange: value => {
        setValue('publicAccount', value, { shouldValidate: true })

        // Si se desactiva el perfil público, activar configuraciones más privadas
        if (!value) {
          setValue('searchVisibility', false, { shouldValidate: true })
          setValue('showMeInSearch', false, { shouldValidate: true })
        } else {
          // Si se activa el perfil público, activar configuraciones básicas
          setValue('searchVisibility', true, { shouldValidate: true })
          setValue('showMeInSearch', true, { shouldValidate: true })
        }

        if (errors.publicAccount) {
          clearErrors('publicAccount')
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
  // Renderizador de Switch mejorado con diseño de settings
  // ========================================
  const renderEnhancedSwitch = useCallback(
    (fieldName, config = {}) => {
      const {
        icon: IconComponent,
        label,
        description,
        defaultValue = true,
        iconColor = 'text-gray-400',
        isNotification = false,
        requiresPublicAccount = false
      } = config

      // Para switches de notificación, verificar si el control general está activo
      // Usar el valor por defecto de allowNotifications como true
      const allowNotificationsValue = allowNotifications !== undefined ? allowNotifications : true
      const isNotificationDisabled = isNotification && !allowNotificationsValue

      // Para switches que requieren perfil público
      const isPrivacyDisabled = requiresPublicAccount && !(publicAccount ?? true)

      const isDisabled = isNotificationDisabled || isPrivacyDisabled

      return (
        <div
          className={`flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
            isDisabled ? 'bg-gray-800/20 border-gray-700/20 opacity-60' : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50'
          }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {IconComponent && <IconComponent className={`w-4 h-4 shrink-0 ${isDisabled ? 'text-gray-500' : iconColor}`} />}
            <div className="min-w-0 flex-1">
              <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-500' : 'text-gray-200'}`}>{label}</span>
              <p className={`text-xs mt-0.5 ${isDisabled ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
            </div>
          </div>
          <div className="shrink-0 ml-2">
            <Controller
              name={fieldName}
              control={control}
              render={({ field }) => (
                <Switch
                  isSelected={field.value ?? defaultValue}
                  onValueChange={value => formHandlers.handleInputChange(fieldName, value)}
                  color="primary"
                  size="sm"
                  isDisabled={isDisabled}
                />
              )}
            />
          </div>
        </div>
      )
    },
    [control, formHandlers, allowNotifications, publicAccount]
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
      {/* Configuración de privacidad */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-6 text-center sm:text-left">
            <div className="p-2 bg-green-500/20 rounded-lg shrink-0">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-200">Configuración de Privacidad</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Controla qué información es visible para otros usuarios</p>
            </div>
          </div>

          {/* Estado actual de configuraciones */}
          <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">Resumen de privacidad</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {(showAge ?? true) && (
                <Chip size="sm" variant="flat" color="primary" className="text-xs">
                  Edad visible
                </Chip>
              )}
              {(showLocation ?? true) && (
                <Chip size="sm" variant="flat" color="primary" className="text-xs">
                  Ubicación visible
                </Chip>
              )}
              {(publicAccount ?? true) && (
                <Chip size="sm" variant="flat" color="success" className="text-xs">
                  Perfil público
                </Chip>
              )}
              {(searchVisibility ?? true) && (
                <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                  Visible en búsquedas
                </Chip>
              )}
              {(showMeInSearch ?? true) && (
                <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                  En recomendaciones
                </Chip>
              )}
              {!(showAge ?? true) && !(showLocation ?? true) && !(publicAccount ?? true) && (
                <Chip size="sm" variant="flat" color="default" className="text-xs">
                  Perfil privado
                </Chip>
              )}
            </div>
          </div>

          {/* Control general de privacidad */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-blue-400 block">Perfil público</span>
                  <p className="text-xs text-gray-400 mt-0.5">Control principal de visibilidad del perfil</p>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                <Controller
                  name="publicAccount"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isSelected={field.value ?? true}
                      onValueChange={formHandlers.handlePublicAccountChange}
                      color="primary"
                      size="sm"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {renderEnhancedSwitch('showAge', {
              icon: Calendar,
              label: 'Mostrar mi edad',
              description: 'Otros usuarios podrán ver tu edad en tu perfil',
              iconColor: 'text-blue-400'
            })}

            {renderEnhancedSwitch('showLocation', {
              icon: MapPin,
              label: 'Mostrar mi ubicación',
              description: 'Otros usuarios podrán ver tu ciudad y país',
              iconColor: 'text-blue-400'
            })}

            <Divider className="my-4" />

            {renderEnhancedSwitch('searchVisibility', {
              icon: Eye,
              label: 'Visible en búsquedas',
              description: 'Aparecer en resultados de búsqueda y exploración',
              iconColor: 'text-purple-400',
              requiresPublicAccount: true
            })}

            {renderEnhancedSwitch('showMeInSearch', {
              icon: Users,
              label: 'Aparecer en recomendaciones',
              description: 'Ser sugerido a otros usuarios con intereses similares',
              iconColor: 'text-purple-400',
              requiresPublicAccount: true
            })}

          </div>
        </CardBody>
      </Card>

      {/* Configuración de notificaciones */}
      <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-6 text-center sm:text-left">
            <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-200">Configuración de Notificaciones</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Personaliza qué notificaciones quieres recibir</p>
            </div>
          </div>

          {/* Control general de notificaciones */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-blue-400 block">Control general</span>
                  <p className="text-xs text-gray-400 mt-0.5">Habilitar o deshabilitar todas las notificaciones</p>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                <Controller
                  name="allowNotifications"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isSelected={field.value ?? true}
                      onValueChange={formHandlers.handleAllowNotificationsChange}
                      color="primary"
                      size="sm"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Estado actual de notificaciones */}
          <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">Notificaciones activas</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {(allowNotifications ?? true) ? (
                <>
                  {(notificationsEmailEnabled ?? true) && (
                    <Chip size="sm" variant="flat" color="primary" className="text-xs">
                      Email
                    </Chip>
                  )}
                  {(notificationsPhoneEnabled ?? false) && (
                    <Chip size="sm" variant="flat" color="primary" className="text-xs">
                      SMS
                    </Chip>
                  )}
                  {(notificationsMatchesEnabled ?? true) && (
                    <Chip size="sm" variant="flat" color="danger" className="text-xs">
                      Matches
                    </Chip>
                  )}
                  {(notificationsEventsEnabled ?? true) && (
                    <Chip size="sm" variant="flat" color="success" className="text-xs">
                      Eventos
                    </Chip>
                  )}
                </>
              ) : (
                <Chip size="sm" variant="flat" color="default" className="text-xs">
                  Todas deshabilitadas
                </Chip>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Notificaciones de comunicación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Canales de comunicación</span>
              </div>

              {renderEnhancedSwitch('notificationsEmailEnabled', {
                icon: Mail,
                label: 'Notificaciones por email',
                description: 'Recibir notificaciones en tu correo electrónico',
                iconColor: 'text-blue-400',
                isNotification: true
              })}

              {renderEnhancedSwitch('notificationsPhoneEnabled', {
                icon: Smartphone,
                label: 'Notificaciones por SMS',
                description: 'Recibir notificaciones por mensaje de texto',
                defaultValue: false,
                iconColor: 'text-green-400',
                isNotification: true
              })}
            </div>

            <Divider className="my-4" />

            {/* Notificaciones de actividad */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-gray-300">Actividad social</span>
              </div>

              {renderEnhancedSwitch('notificationsMatchesEnabled', {
                icon: Heart,
                label: 'Notificaciones de matches',
                description: 'Cuando alguien haga match contigo o te envíe un like',
                iconColor: 'text-red-400',
                isNotification: true
              })}

              {renderEnhancedSwitch('notificationsEventsEnabled', {
                icon: Calendar,
                label: 'Notificaciones de eventos',
                description: 'Eventos, actividades y tours disponibles en tu área',
                iconColor: 'text-purple-400',
                isNotification: true
              })}
            </div>

          </div>
        </CardBody>
      </Card>

      <h2 className="text-center text-gray-300">Vista previa del perfil</h2>

      {/* VISTA PREVIA DEL PERFIL */}
      <div className="w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
        {/* Header del perfil mejorado */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="relative shrink-0">
            <Avatar
              src={profileImageUrl}
              className="w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600"
              isBordered
              fallback={<User className="text-4xl text-gray-400" />}
            />
            {categoryInterest && selectedCategory && (
              <div className="absolute -bottom-1 -right-1 rounded-full">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="bg-primary-900/90 text-primary-300 border border-primary-500/30"
                  startContent={<span>{selectedCategory.icon || categoryUtils.getCategoryIcon(categoryInterest)}</span>}>
                  {selectedCategory.label || categoryUtils.getCategoryName(categoryInterest)}
                </Chip>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-100">
                {name} {lastName}
              </h4>
              {showAge && userAge && (
                <Chip size="sm" variant="flat" color="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {userAge} años
                </Chip>
              )}
            </div>

            {showLocation && city && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm mb-3">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>
                  {city}, {country}
                </span>
              </div>
            )}

            {/* Información básica en el header */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
              {profession && (
                <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
                  <Briefcase className="w-3 h-3 text-orange-400" />
                  <span className="text-gray-300">{profession}</span>
                </div>
              )}

              {height && (
                <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
                  <Ruler className="w-3 h-3 text-cyan-400" />
                  <span className="text-gray-300">{height} cm</span>
                </div>
              )}

              {showPhone && phone && phoneCode && (
                <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
                  <Phone className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300">
                    {phoneCode} {phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción - Siempre visible */}
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Sobre mí</span>
          </div>
          {description ? (
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          ) : (
            <p className="text-sm text-orange-400 italic">Por agregar descripción personal</p>
          )}
        </div>

        {/* Galería de fotos - Similar al perfil real */}
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">Galería de fotos</span>
            </div>
            <span className="text-xs text-gray-400 text-center sm:text-right">{allImages.length} de 5 fotos</span>
          </div>

          {allImages.length > 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {allImages.slice(1, 5).map((image, index) => (
                <div key={index} className="relative group aspect-[3/4]">
                  <img
                    src={image.url}
                    alt={`Foto ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-700/50 hover:border-primary-500 transition-all cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </div>
              ))}

              {/* Placeholders para fotos faltantes */}
              {Array.from({ length: Math.max(0, 4 - (allImages.length - 1)) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="relative aspect-[3/4]">
                  <div className="w-full h-full bg-gray-700/30 border border-gray-600/30 rounded-lg flex flex-col items-center justify-center">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1" />
                    <span className="text-xs text-gray-500 text-center px-1">Vacío</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`empty-${index}`} className="relative aspect-[3/4]">
                    <div className="w-full h-full bg-gray-700/30 border border-gray-600/30 rounded-lg flex flex-col items-center justify-center">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-1">Por agregar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags de intereses - Siempre visible */}
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Intereses</span>
          </div>
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 6).map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-xs">
                  {tag}
                </Chip>
              ))}
              {tags.length > 6 && (
                <Chip size="sm" variant="flat" color="default" className="bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs">
                  +{tags.length - 6} más
                </Chip>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-sm text-orange-400 italic">Por agregar intereses</span>
            </div>
          )}
        </div>

        {/* Información personal completa - Similar al perfil real */}
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-200">Información personal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Género:</span>
              <span className={`${genderId ? 'text-gray-300' : 'text-orange-400 italic'}`}>{getAttributeLabel('gender', genderId)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-gray-400">Estado civil:</span>
              <span className={`${maritalStatusId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                {getAttributeLabel('maritalStatus', maritalStatusId)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">Educación:</span>
              <span className={`${educationLevelId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                {getAttributeLabel('educationLevel', educationLevelId)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-orange-400" />
              <span className="text-gray-400">Tipo de cuerpo:</span>
              <span className={`${bodyTypeId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                {getAttributeLabel('bodyType', bodyTypeId)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">Color de ojos:</span>
              <span className={`${eyeColorId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                {getAttributeLabel('eyeColor', eyeColorId)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-400">Color de cabello:</span>
              <span className={`${hairColorId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                {getAttributeLabel('hairColor', hairColorId)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">Profesión:</span>
              <span className={`${profession ? 'text-gray-300' : 'text-orange-400 italic'}`}>{profession || 'Por completar'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Ruler className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-400">Altura:</span>
              <span className={`${height ? 'text-gray-300' : 'text-orange-400 italic'}`}>{height ? `${height} cm` : 'Por completar'}</span>
            </div>
          </div>
        </div>

        {/* Información específica por categoría - No mostrar para ESSENCE */}
        {categoryInterest && selectedCategory && categoryInterest !== 'ESSENCE' && (
          <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-lg">{selectedCategory.icon}</div>
              <span className="text-sm font-medium text-gray-200">
                Información de {selectedCategory.label}
              </span>
            </div>

            <div className="space-y-3">
              {/* Campos específicos para SPIRIT */}
              {categoryInterest === 'SPIRIT' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Church className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">Religión:</span>
                    <span className={`text-sm ${religionId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                      {getAttributeLabel('religion', religionId)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">Iglesia:</span>
                    <span className={`text-sm ${church ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                      {church || 'Por completar'}
                    </span>
                  </div>

                  {spiritualMoments && (
                    <div>
                      <span className="text-xs font-medium text-gray-300">Momentos espirituales:</span>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">{spiritualMoments.slice(0, 100)}...</p>
                    </div>
                  )}

                  {spiritualPractices && (
                    <div>
                      <span className="text-xs font-medium text-gray-300">Prácticas espirituales:</span>
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">{spiritualPractices.slice(0, 100)}...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Campos específicos para ROUSE */}
              {categoryInterest === 'ROUSE' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">Rol sexual:</span>
                    <span className={`text-sm ${sexualRoleId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                      {getAttributeLabel('sexualRole', sexualRoleId)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">Tipo de relación:</span>
                    <span className={`text-sm ${relationshipTypeId ? 'text-gray-300' : 'text-orange-400 italic'}`}>
                      {getAttributeLabel('relationshipType', relationshipTypeId)}
                    </span>
                  </div>
                </div>
              )}

              {/* Mensaje por defecto si no hay información específica */}
              {categoryInterest === 'SPIRIT' && !church && !religionId && !spiritualMoments && !spiritualPractices && (
                <div className="text-center py-2">
                  <span className="text-sm text-orange-400 italic">Por completar información espiritual</span>
                </div>
              )}

              {categoryInterest === 'ROUSE' && !sexualRoleId && !relationshipTypeId && (
                <div className="text-center py-2">
                  <span className="text-sm text-orange-400 italic">Por completar preferencias personales</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de preferencias */}
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Preferencias de búsqueda</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Edad:</span>
              <span className="text-gray-300 font-medium">
                {agePreferenceMin || 18} - {agePreferenceMax || 40} años
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">Radio:</span>
              <span className="text-gray-300 font-medium">{locationPreferenceRadius || 50} km</span>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Footer del perfil */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Activo recientemente</span>
          </div>
          <div className="flex gap-3">
            <Heart className="w-4 h-4 cursor-pointer hover:text-red-400 transition-colors" />
            <MessageCircle className="w-4 h-4 cursor-pointer hover:text-blue-400 transition-colors" />
            <Share className="w-4 h-4 cursor-pointer hover:text-purple-400 transition-colors" />
          </div>
        </div>
      </div>

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
