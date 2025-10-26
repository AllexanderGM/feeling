import { useState, useRef } from 'react'
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { MapPin, Calendar, Phone, Check, X, IdCard, Camera, User, ZoomIn, Settings } from 'lucide-react'
import {
  getUserName,
  getUserLastName,
  getUserDocument,
  getUserDateOfBirth,
  getUserPhone,
  getUserPhoneCode,
  getUserCountry,
  getUserCity,
  getUserLocality,
  getUserImages
} from '@schemas'
import StepBasicInfo from '@pages/user/complete/components/StepBasicInfo.jsx'

const PersonalInfoSection = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { isOpen: isImageOpen, onOpen: onImageOpen, onOpenChange: onImageOpenChange } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()

  // Ref para acceder al método submit de StepBasicInfo
  const stepBasicInfoRef = useRef(null)

  const handleEdit = () => {
    onEditOpen()
  }

  const handleCancel = () => {
    onEditOpenChange()
  }

  // Callback que se ejecuta cuando StepBasicInfo completa el submit
  const handleStepComplete = result => {
    setLoading(false)
    if (result?.success) {
      onEditOpenChange()
    }
  }

  // Handler del botón "Guardar cambios" - llama al submit de StepBasicInfo
  const handleSaveClick = async () => {
    if (stepBasicInfoRef.current) {
      setLoading(true)
      await stepBasicInfoRef.current.submit()
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

  // Preparar imágenes para la galería
  const prepareGalleryImages = () => {
    const allImages = getUserImages(user) || []

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
    <div className='space-y-6 w-full'>
      {/* Información personal con diseño similar al estado general */}
      <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <User className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Información Personal</span>
          </div>
          <Button
            className='bg-primary-600 hover:bg-primary-700'
            color='primary'
            size='sm'
            startContent={<Settings className='w-3 h-3' />}
            variant='solid'
            onPress={handleEdit}>
            Editar
          </Button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400'>
          {/* Nombre completo */}
          <div className='flex items-center gap-2'>
            <User className='w-3 h-3' />
            <span>
              Nombre:{' '}
              <span className='text-gray-300'>
                {getUserName(user) && getUserLastName(user) ? `${getUserName(user)} ${getUserLastName(user)}` : 'No especificado'}
              </span>
            </span>
          </div>

          {/* Documento */}
          <div className='flex items-center gap-2'>
            <IdCard className='w-3 h-3' />
            <span>
              Documento: <span className='text-gray-300'>{getUserDocument(user) || 'No especificado'}</span>
            </span>
          </div>

          {/* Fecha de nacimiento y edad */}
          <div className='flex items-center gap-2'>
            <Calendar className='w-3 h-3' />
            <span>
              Nacimiento:{' '}
              <span className='text-gray-300'>
                {getUserDateOfBirth(user) ? (
                  <>
                    {new Date(getUserDateOfBirth(user)).toLocaleDateString('es-ES')}
                    {calculateAge(getUserDateOfBirth(user)) && ` (${calculateAge(getUserDateOfBirth(user))} años)`}
                  </>
                ) : (
                  'No especificado'
                )}
              </span>
            </span>
          </div>

          {/* Teléfono */}
          <div className='flex items-center gap-2'>
            <Phone className='w-3 h-3' />
            <span>Teléfono: </span>
            {getUserPhoneCode(user) && getUserPhone(user) ? (
              <span className='text-gray-300'>
                {getUserPhoneCode(user)} {getUserPhone(user)}
              </span>
            ) : (
              <span className='text-gray-300'>No especificado</span>
            )}
          </div>

          {/* Ubicación */}
          <div className='flex items-center gap-2 sm:col-span-2'>
            <MapPin className='w-3 h-3' />
            <span>Ubicación: </span>
            {getUserCity(user) && getUserCountry(user) ? (
              <span className='text-gray-300'>
                {getUserLocality(user) ? `${getUserLocality(user)}, ` : ''}
                {getUserCity(user)}, {getUserCountry(user)}
              </span>
            ) : (
              <span className='text-gray-300'>No especificado</span>
            )}
          </div>
        </div>
      </div>

      {/* Galería de imágenes compacta */}
      {galleryImages.length > 0 && (
        <div className='bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Camera className='w-4 h-4 text-blue-400' />
              <span className='text-sm font-medium text-gray-200'>Galería de Fotos</span>
            </div>
            <span className='text-xs text-gray-400'>{galleryImages.length} de 5</span>
          </div>

          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
            {galleryImages.slice(0, 5).map((image, index) => (
              <div
                key={index}
                className='relative group cursor-pointer overflow-hidden rounded-lg border border-gray-700/50 hover:border-primary-500 transition-all duration-300'
                role='button'
                tabIndex={0}
                onClick={() => openImageModal(image, index)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openImageModal(image, index)
                  }
                }}>
                <img
                  alt={`Foto ${index + 1} del perfil`}
                  className='w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105'
                  src={image}
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center'>
                  <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='bg-black/50 rounded-full p-2'>
                      <ZoomIn className='w-4 h-4 text-white' />
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className='absolute top-1 left-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded'>Principal</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para visualizar imágenes */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}
        isOpen={isImageOpen}
        size='5xl'
        onOpenChange={onImageOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center justify-between w-full'>
              <h3 className='text-lg font-bold text-gray-200'>
                Foto {currentImageIndex + 1} de {galleryImages.length}
              </h3>
              <div className='flex items-center gap-2'>
                {currentImageIndex === 0 && <span className='bg-primary-500 text-white text-xs px-2 py-1 rounded-full'>Principal</span>}
              </div>
            </div>
          </ModalHeader>
          <ModalBody className='p-0'>
            <div className='relative'>
              {selectedImage && (
                <img
                  alt={`Foto ${currentImageIndex + 1} del perfil`}
                  className='w-full h-auto max-h-[70vh] object-contain'
                  src={selectedImage}
                />
              )}

              {/* Navegación */}
              {galleryImages.length > 1 && (
                <>
                  <Button
                    isIconOnly
                    className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70'
                    variant='flat'
                    onPress={() => navigateImage('prev')}>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path d='M15 19l-7-7 7-7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
                    </svg>
                  </Button>
                  <Button
                    isIconOnly
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70'
                    variant='flat'
                    onPress={() => navigateImage('next')}>
                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path d='M9 5l7 7-7 7' strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} />
                    </svg>
                  </Button>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className='flex justify-between items-center w-full'>
              <div className='flex items-center gap-2'>
                {galleryImages.length > 1 && (
                  <div className='flex gap-1'>
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
              <Button color='danger' variant='light'>
                Cerrar
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para editar información personal */}
      <Modal
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}
        isOpen={isEditOpen}
        scrollBehavior='inside'
        size='5xl'
        onOpenChange={onEditOpenChange}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-gray-200'>Editar Información Personal</h3>
            <p className='text-sm text-gray-400'>Actualiza tus datos básicos y fotos de perfil</p>
          </ModalHeader>
          <ModalBody className='py-6'>
            <StepBasicInfo ref={stepBasicInfoRef} onStepComplete={handleStepComplete} />
          </ModalBody>
          <ModalFooter>
            <Button color='danger' isDisabled={loading} startContent={<X className='w-4 h-4' />} variant='light' onPress={handleCancel}>
              Cancelar
            </Button>
            <Button
              color='primary'
              isDisabled={loading}
              startContent={loading ? <Spinner size='sm' /> : <Check className='w-4 h-4' />}
              onPress={handleSaveClick}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default PersonalInfoSection
