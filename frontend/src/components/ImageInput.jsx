import { useState, useEffect } from 'react'
import { Input, Button } from '@heroui/react'

const ImageInput = ({ images = [''], onChange, maxImages = 5 }) => {
  const [imageUrls, setImageUrls] = useState(images.length > 0 ? images : [''])

  useEffect(() => {
    // Actualizar el estado local cuando cambian las imágenes desde el exterior
    if (JSON.stringify(images) !== JSON.stringify(imageUrls)) {
      setImageUrls(images.length > 0 ? images : [''])
    }
  }, [images, imageUrls])

  const handleImageChange = (index, value) => {
    const newImages = [...imageUrls]
    newImages[index] = value
    setImageUrls(newImages)
    onChange(newImages)
  }

  const handleAddImage = () => {
    if (imageUrls.length < maxImages) {
      const newImages = [...imageUrls, '']
      setImageUrls(newImages)
      onChange(newImages)
    }
  }

  const handleRemoveImage = index => {
    if (imageUrls.length <= 1) {
      // Siempre debe haber al menos una imagen
      const resetImages = ['']
      setImageUrls(resetImages)
      onChange(resetImages)
      return
    }

    const newImages = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newImages)
    onChange(newImages)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">
          Imágenes (URLs) - {imageUrls.length}/{maxImages}
        </p>
        {imageUrls.length < maxImages && (
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={handleAddImage}
            startContent={<span className="material-symbols-outlined">add</span>}>
            Añadir imagen
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {imageUrls.map((url, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder={`URL de la imagen ${index + 1}`}
              value={url}
              onChange={e => handleImageChange(index, e.target.value)}
              className="flex-grow"
            />
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="danger"
              onPress={() => handleRemoveImage(index)}
              disabled={imageUrls.length === 1 && index === 0}>
              <span className="material-symbols-outlined">delete</span>
            </Button>
          </div>
        ))}
      </div>

      {imageUrls.length >= maxImages && <p className="text-xs text-gray-500">Has alcanzado el límite máximo de {maxImages} imágenes.</p>}
    </div>
  )
}

export default ImageInput
