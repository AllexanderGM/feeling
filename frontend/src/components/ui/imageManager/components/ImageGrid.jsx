/**
 * COMPONENTE IMAGEGRID
 *
 * Grid dinámico que muestra imágenes existentes + slot "agregar" al lado
 * Layout limpio sin confusión de posiciones
 */

import { memo, useMemo } from 'react'
import { ReactSortable } from 'react-sortablejs'
import ImageCard from './ImageCard'
import ImageProgress from './ImageProgress'

const ImageGrid = memo(
  ({
    images = [],
    previewUrls = [],
    imageErrors = {},
    animatingPositions = new Set(),
    maxImages = 5,
    enableReorder = true,
    enableCrop = true,
    onReorder,
    onRemove,
    onSetAsMain,
    onOpenCrop,
    onPreview,
    dropzoneProps = {},
    canAddMore = true,
    layout = 'dynamic',
    size = 'default',
    className = ''
  }) => {
    // Filtrar solo imágenes existentes
    const existingImages = useMemo(() => {
      return images
        .map((image, index) => ({
          id: `image-${index}`,
          index,
          image,
          url: previewUrls[index],
          error: imageErrors[index],
          isAnimating: animatingPositions.has(index)
        }))
        .filter(item => item.image)
    }, [images, previewUrls, imageErrors, animatingPositions])

    const imageCount = existingImages.length

    // Configuración de react-sortablejs
    const sortableOptions = {
      animation: 200,
      ghostClass: 'opacity-30',
      chosenClass: 'scale-105',
      dragClass: 'rotate-2',
      disabled: !enableReorder,
      filter: '.no-drag',
      preventOnFilter: false,
      forceFallback: false,
      fallbackOnBody: true,
      swapThreshold: 0.65
    }

    const handleSortableChange = newItems => {
      if (!enableReorder || !onReorder) return

      // Mapear el nuevo orden
      const oldOrder = existingImages.map(item => item.index)
      const newOrder = newItems.map(item => item.index)

      // Encontrar cambios y aplicarlos
      for (let i = 0; i < newOrder.length; i++) {
        if (oldOrder[i] !== newOrder[i]) {
          onReorder(oldOrder[i], newOrder[i])
          break
        }
      }
    }

    // Layout dinámico
    if (layout === 'dynamic') {
      return (
        <div className={`space-y-6 ${className}`}>
          {/* Título simplificado */}
          <div className='text-center'>
            <h3 className='text-gray-300 font-medium mb-1'>Fotos de perfil</h3>
            <p className='text-gray-500 text-xs'>Sube fotos verticales • Máximo 5MB • Mínimo 400x400px</p>
            <p className='text-gray-500 text-xs mt-1'>Arrastra para reordenar • Formatos: JPG, PNG, WebP</p>
          </div>

          {/* Grid dinámico de imágenes */}
          <div className='space-y-4'>
            {/* Grid centrado y dinámico - Responsive */}
            <div className='flex flex-wrap justify-center gap-3 md:gap-4'>
              {/* Imágenes existentes con sortable */}
              {existingImages.length > 0 && (
                <ReactSortable
                  list={existingImages}
                  setList={handleSortableChange}
                  {...sortableOptions}
                  className='flex flex-wrap justify-center gap-3 md:gap-4'>
                  {existingImages.map(item => (
                    <div key={item.id} className='w-[100px] sm:w-[110px] md:w-[120px] flex-shrink-0'>
                      <ImageCard
                        image={item.image}
                        previewUrl={item.url}
                        error={item.error}
                        index={item.index}
                        isMain={item.index === 0} // Primera imagen es principal
                        isAnimating={item.isAnimating}
                        enableCrop={enableCrop}
                        enableReorder={enableReorder}
                        onRemove={onRemove}
                        onSetAsMain={onSetAsMain}
                        onOpenCrop={onOpenCrop}
                        onPreview={onPreview}
                        dropzoneProps={dropzoneProps}
                        canAddMore={canAddMore}
                        variant='portrait'
                        size={size}
                        className='w-full aspect-[3/4]'
                      />
                    </div>
                  ))}
                </ReactSortable>
              )}

              {/* Card "Agregar imagen" */}
              {canAddMore && imageCount < maxImages && (
                <div className='w-[100px] sm:w-[110px] md:w-[120px] flex-shrink-0'>
                  <ImageCard
                    image={null}
                    previewUrl={null}
                    error={null}
                    index={imageCount} // Siguiente posición disponible
                    isMain={imageCount === 0}
                    isAnimating={false}
                    enableCrop={enableCrop}
                    enableReorder={false}
                    onRemove={onRemove}
                    onSetAsMain={onSetAsMain}
                    onOpenCrop={onOpenCrop}
                    onPreview={onPreview}
                    dropzoneProps={dropzoneProps}
                    canAddMore={canAddMore}
                    variant='portrait'
                    size={size}
                    className='w-full aspect-[3/4]'
                  />
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className='max-w-md mx-auto pt-2'>
              <ImageProgress imageCount={imageCount} maxImages={maxImages} />
            </div>
          </div>
        </div>
      )
    }

    // Layout grid tradicional (fallback)
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Título */}
        <div className='text-center'>
          <h3 className='text-gray-300 font-medium mb-1'>Fotos de perfil</h3>
          <p className='text-gray-500 text-xs'>Sube hasta {maxImages} fotos verticales</p>
        </div>

        {/* Grid tradicional responsive */}
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 justify-items-center'>
          {Array.from({ length: maxImages }, (_, index) => {
            const item = existingImages.find(img => img.index === index)

            return (
              <div key={`slot-${index}`} className='w-full'>
                <ImageCard
                  image={item?.image || null}
                  previewUrl={item?.url || null}
                  error={item?.error || null}
                  index={index}
                  isMain={index === 0}
                  isAnimating={item?.isAnimating || false}
                  enableCrop={enableCrop}
                  enableReorder={enableReorder}
                  onRemove={onRemove}
                  onSetAsMain={onSetAsMain}
                  onOpenCrop={onOpenCrop}
                  onPreview={onPreview}
                  dropzoneProps={dropzoneProps}
                  canAddMore={canAddMore}
                  variant='portrait'
                  size={size}
                  className='w-full aspect-[3/4]'
                />
              </div>
            )
          })}
        </div>

        {/* Progreso */}
        <div className='max-w-md mx-auto pt-2'>
          <ImageProgress imageCount={imageCount} maxImages={maxImages} />
        </div>
      </div>
    )
  }
)

ImageGrid.displayName = 'ImageGrid'

export default ImageGrid
