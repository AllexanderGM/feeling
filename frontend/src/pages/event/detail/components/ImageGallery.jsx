import { useState, useMemo } from 'react'
import { Card, CardBody, Spinner } from '@heroui/react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

const ImageGallery = ({ mainImage, images = [], title = 'Galería' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)

  // Combinar mainImage con images array
  const allImages = useMemo(() => {
    const imageList = []

    if (mainImage) {
      imageList.push(mainImage)
    }
    if (Array.isArray(images) && images.length > 0) {
      imageList.push(...images)
    }

    return imageList
  }, [mainImage, images])

  const hasImages = allImages.length > 0
  const hasMultipleImages = allImages.length > 1

  const handlePrevious = () => {
    setImageLoading(true)
    setSelectedIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setImageLoading(true)
    setSelectedIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  if (!hasImages) {
    return (
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-0'>
          <div className='flex h-48 sm:h-64 md:h-80 flex-col items-center justify-center gap-3 text-center'>
            <div className='w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center'>
              <ImageIcon className='w-8 h-8 text-gray-500' />
            </div>
            <p className='text-sm text-gray-400'>No hay imágenes disponibles para este evento</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
      <CardBody className='p-0'>
        {/* Main Image con estilo UserCard */}
        <div className='relative h-48 sm:h-64 md:h-80 group overflow-hidden rounded-t-xl'>
          <img
            alt={`${title} - Imagen ${selectedIndex + 1}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            src={allImages[selectedIndex]}
            onLoad={handleImageLoad}
          />

          {/* Spinner de carga */}
          {imageLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
              <Spinner color='primary' size='lg' />
            </div>
          )}

          {/* Indicadores de fotos - estilo UserCard */}
          {hasMultipleImages && (
            <div className='absolute top-2 left-3 right-3 flex gap-1.5 z-10'>
              {allImages.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-0.5 rounded-full transition-all ${index === selectedIndex ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}

          {/* Controles de navegación - aparecen en hover */}
          {hasMultipleImages && (
            <>
              <button
                aria-label='Imagen anterior'
                className='absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                type='button'
                onClick={handlePrevious}>
                <ChevronLeft className='w-4 h-4' />
              </button>

              <button
                aria-label='Imagen siguiente'
                className='absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity'
                type='button'
                onClick={handleNext}>
                <ChevronRight className='w-4 h-4' />
              </button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default ImageGallery
