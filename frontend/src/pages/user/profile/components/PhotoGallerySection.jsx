import { useState } from 'react'
import { Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button } from '@heroui/react'
import { Camera, Eye } from 'lucide-react'

const PhotoGallerySection = ({ user, onImageClick }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [selectedImage, setSelectedImage] = useState(null)

  const showImageModal = imageUrl => {
    setSelectedImage(imageUrl)
    onOpen()
  }

  // Obtener imagen principal
  const getMainImage = () => {
    if (!user?.images || user.images.length === 0) return null
    const selectedIndex = user.selectedProfileImageIndex || 0
    return user.images[selectedIndex] || user.images[0]
  }

  const mainImage = getMainImage()
  const additionalImages =
    user?.images?.filter((_, index) => {
      const selectedIndex = user.selectedProfileImageIndex || 0
      return index !== selectedIndex
    }) || []

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-bold text-gray-200">Galería de Fotos</h3>
        </div>
      </CardHeader>
      <CardBody>
        {user?.images && user.images.length > 0 ? (
          <div className="space-y-4">
            {/* Imagen principal */}
            {mainImage && (
              <div className="text-center space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Foto principal</h4>
                <div className="relative mx-auto w-40 h-40">
                  <img
                    src={mainImage}
                    alt="Foto principal del perfil"
                    className="w-full h-full object-cover rounded-full border-2 border-primary-500 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => showImageModal(mainImage)}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Imágenes adicionales */}
            {additionalImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 text-center">Fotos adicionales</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Foto adicional ${index + 1} del perfil`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => showImageModal(image)}
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-gray-500">Total: {user.images.length} de 5 fotos</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-300">No hay fotos</h4>
              <p className="text-sm text-gray-500">Las fotos se pueden gestionar desde la sección de edición de información personal</p>
            </div>
          </div>
        )}
      </CardBody>

      {/* Modal para mostrar imagen */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">Foto de perfil</ModalHeader>
              <ModalBody>
                {selectedImage && (
                  <img src={selectedImage} alt="Foto de perfil" className="w-full h-auto max-h-96 object-contain rounded-lg" />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  )
}

export default PhotoGallerySection
