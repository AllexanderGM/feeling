/**
 * COMPONENTE IMAGECARD
 *
 * Tarjeta individual de imagen con soporte para imagen principal circular
 * y imágenes adicionales rectangulares, tema oscuro
 */

import { useState, memo } from 'react'
import { X, Star, Edit3, Camera, AlertCircle } from 'lucide-react'
import { Button, Chip, Tooltip } from '@heroui/react'

const ImageCard = memo(
  ({
    image,
    previewUrl,
    index,
    isMain = false,
    error,
    isAnimating = false,
    enableCrop = true,
    enableReorder = true,
    enableRemove = true,
    onRemove,
    onSetAsMain,
    onOpenCrop,
    onPreview,
    dropzoneProps = {},
    canAddMore = true,
    className = '',
    variant = 'portrait', // 'circular', 'rectangular', 'portrait'
    size = 'default' // 'small', 'medium', 'large'
  }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Si no hay imagen, mostrar slot vacío
    if (!image && !previewUrl) {
      return (
        <EmptyImageSlot
          variant={variant}
          size={size}
          isMain={isMain}
          canAddMore={canAddMore}
          dropzoneProps={dropzoneProps}
          className={className}
          index={index}
        />
      )
    }

    // Clases base según variante
    const getBaseClasses = () => {
      const baseClasses = `
      relative group cursor-pointer transition-all duration-300
      ${isAnimating ? 'scale-105 z-10' : ''}
      ${error ? 'ring-2 ring-red-500/50' : ''}
      ${className}
    `

      if (variant === 'circular') {
        return `${baseClasses} rounded-full border-4 ${error ? 'border-red-500' : 'border-primary-500'}`
      }

      if (variant === 'portrait') {
        return `${baseClasses} rounded-lg border-2 ${
          image ? `border-primary-500/50 hover:border-primary-500` : `border-dashed border-gray-600 hover:border-gray-500 bg-gray-800/30`
        } ${error ? 'border-red-500' : ''}`
      }

      // rectangular (fallback)
      return `${baseClasses} rounded-lg border-2 border-dashed ${error ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'}`
    }

    // Overlay para controles
    const overlayClasses = `
    absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
    transition-opacity duration-200 flex items-center justify-center
    ${variant === 'circular' ? 'rounded-full' : 'rounded-lg'}
  `

    const handleImageLoad = () => {
      setImageLoaded(true)
    }

    const handleRemoveClick = e => {
      e.stopPropagation()
      onRemove?.(index)
    }

    const handleCropClick = e => {
      e.stopPropagation()
      onOpenCrop?.(index)
    }

    const handleSetMainClick = e => {
      e.stopPropagation()
      onSetAsMain?.(index)
    }

    const handlePreviewClick = e => {
      if (onPreview) {
        e.stopPropagation()
        onPreview(index)
      }
    }

    return (
      <div
        className={getBaseClasses()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreviewClick}
        role='button'
        tabIndex={0}
        aria-label={`${isMain ? 'Imagen principal' : `Imagen ${index + 1}`}`}>
        {/* Imagen */}
        <img
          src={previewUrl}
          alt={`${isMain ? 'Imagen principal' : `Imagen ${index + 1}`} del perfil`}
          className={`
          w-full h-full object-cover transition-opacity duration-300
          ${variant === 'circular' ? 'rounded-full' : 'rounded-lg'}
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}
          onLoad={handleImageLoad}
          loading='lazy'
        />

        {/* Loading placeholder */}
        {!imageLoaded && (
          <div
            className={`
          absolute inset-0 bg-gray-800/30 animate-pulse flex items-center justify-center
          ${variant === 'circular' ? 'rounded-full' : 'rounded-lg'}
        `}>
            <Camera className='w-6 h-6 text-gray-400' />
          </div>
        )}

        {/* Overlay con controles */}
        {isHovered && imageLoaded && (
          <div className={overlayClasses}>
            <div className='flex items-center gap-2'>
              {/* Botón editar/crop */}
              {enableCrop && (
                <Tooltip content='Editar imagen' size='sm'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='solid'
                    color='primary'
                    onClick={handleCropClick}
                    className='bg-primary-500/90 hover:bg-primary-500'>
                    <Edit3 className='w-4 h-4' />
                  </Button>
                </Tooltip>
              )}

              {/* Botón hacer principal (solo para imágenes adicionales) */}
              {!isMain && onSetAsMain && (
                <Tooltip content='Hacer principal' size='sm'>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='solid'
                    color='warning'
                    onClick={handleSetMainClick}
                    className='bg-yellow-500/90 hover:bg-yellow-500'>
                    <Star className='w-4 h-4' />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Botón eliminar */}
        {enableRemove && imageLoaded && (
          <button
            type='button'
            onClick={handleRemoveClick}
            className={`
            absolute bg-red-500 rounded-full flex items-center justify-center text-white
            hover:bg-red-600 transition-all hover:scale-110 shadow-lg
            ${variant === 'circular' ? 'w-8 h-8 -top-1 -right-1' : 'w-6 h-6 -top-2 -right-2 opacity-0 group-hover:opacity-100'}
          `}
            aria-label={`Eliminar ${isMain ? 'imagen principal' : `imagen ${index + 1}`}`}>
            <X className={variant === 'circular' ? 'w-4 h-4' : 'w-3 h-3'} />
          </button>
        )}

        {/* Badge de imagen principal */}
        {isMain && (
          <div className='absolute -bottom-2 left-1/2 transform -translate-x-1/2'>
            <Chip color='primary' size='sm' startContent={<Star className='w-3 h-3' />} variant='shadow' className='text-xs font-medium'>
              Principal
            </Chip>
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className='absolute -top-1 -left-1'>
            <Tooltip content={error} color='danger' size='sm'>
              <div className='bg-red-500 rounded-full p-1'>
                <AlertCircle className='w-3 h-3 text-white' />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    )
  }
)

// Componente para slot vacío
const EmptyImageSlot = memo(({ variant, size, isMain, canAddMore, dropzoneProps, className, index }) => {
  // Obtener el estado de arrastre desde dropzoneProps
  const isDragActive = dropzoneProps?.isDragActive || false

  const getEmptyClasses = () => {
    const baseClasses = `
      relative cursor-pointer transition-all duration-300 group
      ${className}
    `

    const dragActiveStyles = isDragActive ? 'border-primary-400 bg-primary-500/10 scale-[1.02]' : ''

    if (variant === 'circular') {
      return `${baseClasses} rounded-full border-4 border-dashed ${isDragActive ? 'border-primary-400' : 'border-gray-600 hover:border-gray-500'} ${isDragActive ? 'bg-primary-500/10' : 'bg-gray-800/30'} ${dragActiveStyles}`
    }

    if (variant === 'portrait') {
      return `${baseClasses} rounded-lg border-2 border-dashed ${isDragActive ? 'border-primary-400' : 'border-gray-600 hover:border-gray-500'} ${isDragActive ? 'bg-primary-500/10' : 'bg-gray-800/30'} ${dragActiveStyles}`
    }

    // rectangular (fallback)
    return `${baseClasses} rounded-lg border-2 border-dashed ${isDragActive ? 'border-primary-400' : 'border-gray-600 hover:border-gray-500'} ${isDragActive ? 'bg-primary-500/10' : 'bg-gray-800/30'} ${dragActiveStyles}`
  }

  const iconSize = variant === 'circular' && isMain ? 'w-6 h-6 md:w-8 md:h-8' : 'w-4 h-4 md:w-6 md:h-6'

  if (!canAddMore) {
    return (
      <div className={getEmptyClasses()}>
        <div
          className={`
          w-full h-full flex flex-col items-center justify-center text-gray-500
          ${variant === 'circular' ? 'rounded-full' : 'rounded-lg'} p-2
        `}>
          <Camera className={iconSize} />
          <span className='text-xs mt-1 text-center leading-tight'>{isMain ? 'Principal' : `Foto ${index + 1}`}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      {...(dropzoneProps?.getRootProps ? dropzoneProps.getRootProps() : {})}
      className={getEmptyClasses()}
      role='button'
      tabIndex={0}
      aria-label={`Agregar ${isMain ? 'imagen principal' : `imagen ${index + 1}`}`}>
      {dropzoneProps?.getInputProps && <input {...dropzoneProps.getInputProps()} />}

      <div
        className={`
        w-full h-full flex flex-col items-center justify-center transition-colors duration-300
        ${isDragActive ? 'text-primary-300' : 'text-gray-400 hover:text-gray-300'}
        ${variant === 'circular' ? 'rounded-full' : 'rounded-lg'} p-2
      `}>
        <Camera className={`${iconSize} mb-1 md:mb-2 transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`} />
        <div className='text-center'>
          <div className='text-xs font-medium leading-tight'>{isDragActive ? 'Suelta aquí' : isMain ? 'Principal' : `Foto ${index}`}</div>
          <div className='text-xs mt-0.5 md:mt-1 leading-tight transition-colors duration-300'>
            {isDragActive ? (
              <span className='text-primary-400'>Agregar imagen</span>
            ) : (
              <span className='text-gray-500'>Clic para agregar</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ImageCard.displayName = 'ImageCard'
EmptyImageSlot.displayName = 'EmptyImageSlot'

export default ImageCard
