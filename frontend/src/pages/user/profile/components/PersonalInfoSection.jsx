import { useState, useMemo } from 'react'
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { MapPin, Calendar, Phone, Mail, Edit2, Check, X, IdCard, Camera, User, Briefcase, Eye, ZoomIn, Settings } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser.js'
import useLocation from '@hooks/useLocation.js'
import { stepBasicInfoSchema, getDefaultValuesForStep } from '@schemas'
import StepBasicInfo from '@pages/user/complete/components/StepBasicInfo.jsx'

const PersonalInfoSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { isOpen: isImageOpen, onOpen: onImageOpen, onOpenChange: onImageOpenChange } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()

  const { updateUserProfile } = useUser()

  // Hooks necesarios para StepBasicInfo
  const locationConfig = useMemo(
    () => ({
      defaultCountry: user?.profile?.country || user?.country || 'Colombia',
      defaultCity: user?.profile?.city || user?.city || 'Bogotá',
      loadAll: true
    }),
    [user?.profile?.country, user?.profile?.city, user?.country, user?.city]
  )

  const location = useLocation(locationConfig)

  // Valores por defecto usando esquema centralizado
  const defaultValues = useMemo(() => getDefaultValuesForStep(1, user), [user])

  // React Hook Form para StepBasicInfo
  const {
    control,
    formState: { errors },
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepBasicInfoSchema),
    defaultValues,
    mode: 'onChange'
  })

  const handleEdit = () => {
    reset(defaultValues)
    onEditOpen()
  }

  const handleCancel = () => {
    reset(defaultValues)
    onEditOpenChange()
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const formData = getValues()
      await updateUserProfile(formData)
      onEditOpenChange()
    } catch (error) {
      console.error('Error updating personal info:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular edad
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

  // Obtener imagen principal
  const getMainImage = () => {
    if (!user?.images || user.images.length === 0) return null
    const selectedIndex = user.selectedProfileImageIndex || 0
    return user.images[selectedIndex] || user.images[0]
  }

  const age = calculateAge(user?.birthDate)
  const mainImage = getMainImage()

  // Hook para obtener datos geográficos y banderas (ya inicializado arriba como 'location')

  // Obtener datos del país con bandera
  const getCountryData = useMemo(() => {
    const country = user?.profile?.country || user?.country
    if (!country || !location.formattedCountries) return null
    return location.formattedCountries.find(c => c.name === country)
  }, [user?.profile?.country, user?.country, location.formattedCountries])

  // Obtener datos del país para teléfono
  const getPhoneCountryData = useMemo(() => {
    const phoneCode = user?.profile?.phoneCode || user?.phoneCode
    if (!phoneCode || !location.formattedCountries) return null
    return location.formattedCountries.find(country => country.phone === phoneCode)
  }, [user?.profile?.phoneCode, user?.phoneCode, location.formattedCountries])

  // Datos para StepBasicInfo
  const stepBasicInfoProps = {
    user,
    control,
    errors,
    locationData: {
      formattedCountries: location.formattedCountries,
      formattedCities: location.formattedCities,
      formattedLocalities: location.formattedLocalities,
      loadCitiesByCountry: location.loadCitiesByCountry,
      loadLocalitiesByCity: location.loadLocalitiesByCity
    },
    watch,
    setValue,
    setError,
    clearErrors
  }

  // Preparar imágenes para la galería
  const prepareGalleryImages = () => {
    const allImages = user?.profile?.images || user?.images || []
    return allImages.filter(img => img && img.trim() !== '')
  }

  const galleryImages = prepareGalleryImages()

  // Funciones para la galería
  const openImageModal = (image, index) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
    onImageOpen()
  }

  const navigateImage = direction => {
    const newIndex =
      direction === 'next'
        ? (currentImageIndex + 1) % galleryImages.length
        : (currentImageIndex - 1 + galleryImages.length) % galleryImages.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(galleryImages[newIndex])
  }

  // Vista de solo lectura
  return (
    <div className="space-y-6 w-full">
      {/* Información personal con diseño similar al estado general */}
      <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">Información Personal</span>
          </div>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            className="bg-primary-600 hover:bg-primary-700"
            startContent={<Settings className="w-3 h-3" />}
            onPress={handleEdit}>
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400">
          {/* Nombre completo */}
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>
              Nombre:{' '}
              <span className="text-gray-300">
                {(user?.profile?.name || user?.name) && (user?.profile?.lastName || user?.lastName) 
                  ? `${user?.profile?.name || user?.name} ${user?.profile?.lastName || user?.lastName}` 
                  : 'No especificado'}
              </span>
            </span>
          </div>

          {/* Documento */}
          <div className="flex items-center gap-2">
            <IdCard className="w-3 h-3" />
            <span>
              Documento: <span className="text-gray-300">{user?.profile?.document || user?.document || 'No especificado'}</span>
            </span>
          </div>

          {/* Fecha de nacimiento y edad */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>
              Nacimiento:{' '}
              <span className="text-gray-300">
                {(user?.profile?.dateOfBirth || user?.birthDate || user?.dateOfBirth) ? (
                  <>
                    {new Date(user?.profile?.dateOfBirth || user?.birthDate || user?.dateOfBirth).toLocaleDateString('es-ES')}
                    {calculateAge(user?.profile?.dateOfBirth || user?.birthDate || user?.dateOfBirth) && ` (${calculateAge(user?.profile?.dateOfBirth || user?.birthDate || user?.dateOfBirth)} años)`}
                  </>
                ) : (
                  'No especificado'
                )}
              </span>
            </span>
          </div>

          {/* Teléfono con bandera */}
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>Teléfono: </span>
            {(user?.profile?.phoneCode || user?.phoneCode) && (user?.profile?.phone || user?.phone) ? (
              <div className="flex items-center gap-1">
                {getPhoneCountryData && (
                  <img
                    src={getPhoneCountryData.image}
                    alt={`Bandera de ${getPhoneCountryData.name}`}
                    className="w-3 h-3 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300">
                  {user?.profile?.phoneCode || user?.phoneCode} {user?.profile?.phone || user?.phone}
                </span>
              </div>
            ) : (
              <span className="text-gray-300">No especificado</span>
            )}
          </div>

          {/* Ubicación con bandera */}
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-3 h-3" />
            <span>Ubicación: </span>
            {(user?.profile?.city || user?.city) && (user?.profile?.country || user?.country) ? (
              <div className="flex items-center gap-1">
                {getCountryData && (
                  <img src={getCountryData.image} alt={`Bandera de ${getCountryData.name}`} className="w-3 h-3 rounded-full object-cover" />
                )}
                <span className="text-gray-300">
                  {(user?.profile?.locality || user?.locality) ? `${user?.profile?.locality || user?.locality}, ` : ''}
                  {user?.profile?.city || user?.city}, {user?.profile?.country || user?.country}
                </span>
              </div>
            ) : (
              <span className="text-gray-300">No especificado</span>
            )}
          </div>
        </div>
      </div>

      {/* Galería de imágenes compacta */}
      {galleryImages.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">Galería de Fotos</span>
            </div>
            <span className="text-xs text-gray-400">{galleryImages.length} de 5</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {galleryImages.slice(0, 5).map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 hover:border-primary-500 transition-all duration-300"
                onClick={() => openImageModal(image, index)}>
                <img
                  src={image}
                  alt={`Foto ${index + 1} del perfil`}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 rounded-full p-2">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded">Principal</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para visualizar imágenes */}
      <Modal
        isOpen={isImageOpen}
        onOpenChange={onImageOpenChange}
        size="5xl"
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold text-gray-200">
                    Foto {currentImageIndex + 1} de {galleryImages.length}
                  </h3>
                  <div className="flex items-center gap-2">
                    {currentImageIndex === 0 && <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">Principal</span>}
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="relative">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt={`Foto ${currentImageIndex + 1} del perfil`}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  )}

                  {/* Navegación */}
                  {galleryImages.length > 1 && (
                    <>
                      <Button
                        isIconOnly
                        variant="flat"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                        onPress={() => navigateImage('prev')}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <Button
                        isIconOnly
                        variant="flat"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                        onPress={() => navigateImage('next')}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    {galleryImages.length > 1 && (
                      <div className="flex gap-1">
                        {galleryImages.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-primary-500' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cerrar
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para editar información personal */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-200">Editar Información Personal</h3>
                <p className="text-sm text-gray-400">Actualiza tus datos básicos y fotos de perfil</p>
              </ModalHeader>
              <ModalBody className="py-6">
                <StepBasicInfo {...stepBasicInfoProps} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleCancel} startContent={<X className="w-4 h-4" />} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  startContent={loading ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                  isDisabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default PersonalInfoSection
