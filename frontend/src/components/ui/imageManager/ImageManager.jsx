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
      onImageAdd,
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
        removeAllImages: () => {
          for (let i = imageManager.images.length - 1; i >= 0; i--) {
            if (imageManager.images[i]) {
              imageManager.removeImage(i)
            }
          }
        },
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
          <div className="mb-6">
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
            {description && <p className="text-gray-600 text-sm">{description}</p>}
          </div>
        )}

        {/* Grid de imágenes - siempre visible para mostrar slots vacíos */}
        <div className="mb-6">
          <ImageGrid
            images={imageManager.images}
            previewUrls={imageManager.previewUrls}
            imageErrors={imageManager.imageErrors}
            animatingPositions={imageManager.animatingPositions}
            maxImages={maxImages}
            enableReorder={enableReorder}
            enableCrop={enableCrop}
            onReorder={handleImageReorder}
            onRemove={handleImageRemove}
            onSetAsMain={imageManager.setAsMainImage}
            onOpenCrop={imageManager.openCropModal}
            onPreview={enablePreview ? handleImagePreview : undefined}
            dropzoneProps={imageManager.dropzoneProps}
            canAddMore={imageManager.canAddMore}
            layout={layout}
            size={size}
            gridCols={gridCols}
            showEmptySlots={showEmptySlots}
            {...imageGridProps}
          />
        </div>

        {/* Modal de crop */}
        <CropModal
          isOpen={imageManager.cropModal.isOpen}
          onClose={imageManager.closeCropModal}
          imageSrc={imageManager.cropModal.imageSrc}
          onApplyCrop={handleApplyCrop}
          initialAspectRatio={cropAspectRatio}
          outputFormat={cropOutputFormat}
          outputQuality={cropOutputQuality}
          title="Ajustar imagen"
          showAspectRatioControls={false}
          {...cropModalProps}
        />
      </div>
    )
  }
)

ImageManager.displayName = 'ImageManager'

export default ImageManager
