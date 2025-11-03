/**
 * COMPONENTE PRINCIPAL IMAGEMANAGER
 *
 * Gestor completo de imágenes que unifica DropZone, ImageGrid, CropModal
 * con funcionalidades de drag & drop, reordenamiento y edición
 */

import { forwardRef, useImperativeHandle } from 'react'

import useImageManager from './hooks/useImageManager'
import ImageGrid from './components/ImageGrid'
import CropModal from './components/CropModal'

const ImageManager = forwardRef(
  (
    {
      // Configuración básica
      images: externalImages = [],
      onImagesChange,
      maxImages = 5,
      required = true,

      // Validaciones
      validationRules = {},

      // Funcionalidades
      enableCrop = true,
      enableReorder = true,
      enablePreview = true,

      // Configuración de crop
      cropAspectRatio = 3 / 4, // 3/4 = portrait por defecto
      cropOutputFormat = 'image/jpeg',
      cropOutputQuality = 0.9,

      // UI/Layout
      layout = 'grid', // 'grid', 'horizontal', 'vertical', 'profile'
      size = 'default', // 'small', 'default', 'large'
      gridCols = 3,
      showEmptySlots = true,

      // Personalización
      className = '',
      imageGridProps = {},
      cropModalProps = {},

      // Callbacks adicionales
      onImageRemove,
      onImageReorder,
      onImageCrop,
      onImagePreview,
      onValidationChange,

      // Textos personalizables
      title,
      description
    },
    ref
  ) => {
    // Hook principal de gestión
    const imageManager = useImageManager({
      maxImages,
      required,
      initialImages: externalImages,
      onImagesChange: newImages => {
        onImagesChange?.(newImages)
        onValidationChange?.({
          isValid: imageManager.isValid,
          hasErrors: imageManager.hasErrors,
          imageCount: newImages.filter(img => img).length,
          errors: imageManager.imageErrors
        })
      },
      validationRules,
      enableCrop,
      enableReorder,
      aspectRatio: cropAspectRatio
    })

    // Exponer métodos para uso externo
    useImperativeHandle(
      ref,
      () => ({
        addImages: imageManager.addImages,
        removeImage: imageManager.removeImage,
        removeAllImages: imageManager.clearAllImages,
        reorderImages: imageManager.reorderImages,
        setAsMainImage: imageManager.setAsMainImage,
        openCropModal: imageManager.openCropModal,
        getImages: () => imageManager.images.filter(img => img),
        getMainImage: () => imageManager.mainImage,
        getImageCount: () => imageManager.imageCount,
        getValidationState: () => ({
          isValid: imageManager.isValid,
          hasErrors: imageManager.hasErrors,
          errors: imageManager.imageErrors
        }),
        validate: () => imageManager.isValid
      }),
      [imageManager]
    )

    const handleImageRemove = index => {
      const removedImage = imageManager.images[index]

      imageManager.removeImage(index)
      onImageRemove?.(index, removedImage)
    }

    const handleImageReorder = (startIndex, endIndex) => {
      imageManager.reorderImages(startIndex, endIndex)
      onImageReorder?.(startIndex, endIndex)
    }

    const handleApplyCrop = (croppedBlob, index) => {
      imageManager.applyCrop(croppedBlob, index)
      onImageCrop?.(croppedBlob, index)
    }

    const handleImagePreview = index => {
      onImagePreview?.(index, imageManager.images[index], imageManager.previewUrls[index])
    }

    return (
      <div className={`image-manager ${className}`}>
        {/* Encabezado */}
        {(title || description) && (
          <div className='mb-6'>
            {title && <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>}
            {description && <p className='text-gray-600 text-sm'>{description}</p>}
          </div>
        )}

        {/* Grid de imágenes - siempre visible para mostrar slots vacíos */}
        <div className='mb-6'>
          <ImageGrid
            animatingPositions={imageManager.animatingPositions}
            canAddMore={imageManager.canAddMore}
            dropzoneProps={imageManager.dropzoneProps}
            enableCrop={enableCrop}
            enableReorder={enableReorder}
            gridCols={gridCols}
            imageErrors={imageManager.imageErrors}
            images={imageManager.images}
            layout={layout}
            maxImages={maxImages}
            previewUrls={imageManager.previewUrls}
            showEmptySlots={showEmptySlots}
            size={size}
            onOpenCrop={imageManager.openCropModal}
            onPreview={enablePreview ? handleImagePreview : undefined}
            onRemove={handleImageRemove}
            onReorder={handleImageReorder}
            onSetAsMain={imageManager.setAsMainImage}
            {...imageGridProps}
          />
        </div>

        {/* Modal de crop */}
        <CropModal
          imageSrc={imageManager.cropModal.imageSrc}
          initialAspectRatio={cropAspectRatio}
          isOpen={imageManager.cropModal.isOpen}
          outputFormat={cropOutputFormat}
          outputQuality={cropOutputQuality}
          showAspectRatioControls={false}
          title='Ajustar imagen'
          onApplyCrop={handleApplyCrop}
          onClose={imageManager.closeCropModal}
          {...cropModalProps}
        />
      </div>
    )
  }
)

ImageManager.displayName = 'ImageManager'

export default ImageManager
