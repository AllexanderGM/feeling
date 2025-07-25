/**
 * HOOK PRINCIPAL PARA GESTIÓN DE IMÁGENES
 *
 * Hook unificado que combina dropzone, sortable y crop
 * para gestión completa de imágenes con validaciones
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNotification } from '@hooks/useNotification'
import { validateImageFile, createPreviewUrl, cleanupPreviewUrl, cleanupPreviewUrls } from '../utils'

const useImageManager = ({
  maxImages = 5,
  required = true,
  initialImages = [],
  onImagesChange,
  enableCrop = true,
  enableReorder = true,
  aspectRatio = 1,
  cropAspectRatio = null // null = free crop
}) => {
  // Hook de notificaciones
  const { showError } = useNotification()
  // Estados principales
  const [images, setImages] = useState(initialImages)
  const [imageErrors, setImageErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Estados de crop
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageIndex: null,
    imageSrc: null,
    originalFile: null
  })

  // Estados de reordenamiento
  const [animatingPositions, setAnimatingPositions] = useState(new Set())

  // Normalizar imágenes para tener siempre el array completo
  const normalizedImages = useMemo(() => {
    const normalized = [...(images || [])]
    while (normalized.length < maxImages) {
      normalized.push(null)
    }
    return normalized.slice(0, maxImages)
  }, [images, maxImages])

  // URLs de previsualización
  const previewUrls = useMemo(() => {
    return normalizedImages.map(image => {
      if (!image) return null
      return createPreviewUrl(image)
    })
  }, [normalizedImages])

  // Validar imagen individual
  const validateSingleImage = useCallback(async (file, index) => {
    setIsValidating(true)

    try {
      const validation = await validateImageFile(file)

      setImageErrors(prev => {
        const newErrors = { ...prev }
        if (validation.isValid) {
          delete newErrors[index]
        } else {
          newErrors[index] = validation.error
        }
        return newErrors
      })

      return validation
    } catch (error) {
      const errorMessage = 'Error al validar imagen'
      setImageErrors(prev => ({
        ...prev,
        [index]: errorMessage
      }))
      return { isValid: false, error: errorMessage }
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Agregar imágenes
  const addImages = useCallback(
    async newFiles => {
      if (!Array.isArray(newFiles)) {
        newFiles = [newFiles]
      }

      // Filtrar archivos válidos
      const validFiles = newFiles.filter(file => file instanceof File)
      if (validFiles.length === 0) return

      setIsValidating(true)

      try {
        // Validar cada archivo individualmente para mostrar errores específicos
        const fileValidations = await Promise.all(
          validFiles.map(async (file, index) => {
            const validation = await validateImageFile(file)
            return { file, validation, index }
          })
        )

        // Separar archivos válidos e inválidos
        const validFileResults = fileValidations.filter(result => result.validation.isValid)
        const invalidFileResults = fileValidations.filter(result => !result.validation.isValid)

        // Mostrar errores para archivos inválidos
        if (invalidFileResults.length > 0) {
          const firstError = invalidFileResults[0].validation.error
          showError(firstError, 'Error de validación')

          // Si todos los archivos son inválidos, no continuar
          if (validFileResults.length === 0) {
            return
          }
        }

        // Continuar solo con archivos válidos
        const validFilesOnly = validFileResults.map(result => result.file)

        // Encontrar posiciones disponibles
        const currentImages = [...normalizedImages]
        const availablePositions = []

        for (let i = 0; i < maxImages && availablePositions.length < validFilesOnly.length; i++) {
          if (!currentImages[i]) {
            availablePositions.push(i)
          }
        }

        if (availablePositions.length === 0) {
          console.warn('No hay posiciones disponibles')
          return
        }

        // Para crop obligatorio: solo agregar la primera imagen y abrir crop modal
        if (validFilesOnly.length > 0 && enableCrop) {
          const firstFile = validFilesOnly[0]
          const firstPosition = availablePositions[0]

          // Crear URL temporal para el crop
          const tempUrl = createPreviewUrl(firstFile)

          // Abrir modal de crop inmediatamente
          setCropModal({
            isOpen: true,
            imageIndex: firstPosition,
            imageSrc: tempUrl,
            originalFile: firstFile
          })

          // No agregar la imagen aún - se agregará después del crop
          return
        }

        // Si crop está deshabilitado, agregar normalmente
        const newImages = [...currentImages]
        validFilesOnly.forEach((file, index) => {
          if (availablePositions[index] !== undefined) {
            newImages[availablePositions[index]] = file
          }
        })

        // Filtrar nulls para el array final
        const filteredImages = newImages.filter(img => img !== null)
        setImages(filteredImages)

        // Notificar cambio
        if (onImagesChange) {
          onImagesChange(filteredImages)
        }
      } catch (error) {
        console.error('Error adding images:', error)
      } finally {
        setIsValidating(false)
      }
    },
    [normalizedImages, maxImages, onImagesChange, validateSingleImage]
  )

  // Remover imagen
  const removeImage = useCallback(
    index => {
      const newImages = [...images]

      // Limpiar URL de previsualización
      const previewUrl = previewUrls[index]
      if (previewUrl) {
        cleanupPreviewUrl(previewUrl)
      }

      // Remover imagen del array
      newImages.splice(index, 1)

      // Limpiar errores
      setImageErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })

      setImages(newImages)

      // Notificar cambio
      if (onImagesChange) {
        onImagesChange(newImages)
      }
    },
    [images, previewUrls, onImagesChange]
  )

  // Reordenar imágenes
  const reorderImages = useCallback(
    (startIndex, endIndex) => {
      if (!enableReorder || startIndex === endIndex) return

      const newImages = [...images]
      const [removed] = newImages.splice(startIndex, 1)
      newImages.splice(endIndex, 0, removed)

      // Animación visual
      setAnimatingPositions(prev => new Set([...prev, startIndex, endIndex]))
      setTimeout(() => {
        setAnimatingPositions(prev => {
          const newSet = new Set(prev)
          newSet.delete(startIndex)
          newSet.delete(endIndex)
          return newSet
        })
      }, 300)

      setImages(newImages)

      // Notificar cambio
      if (onImagesChange) {
        onImagesChange(newImages)
      }
    },
    [images, enableReorder, onImagesChange]
  )

  // Hacer imagen principal (mover a posición 0)
  const setAsMainImage = useCallback(
    index => {
      if (index === 0 || !images[index]) return

      reorderImages(index, 0)
    },
    [images, reorderImages]
  )

  // Abrir modal de crop
  const openCropModal = useCallback(
    index => {
      if (!enableCrop || !normalizedImages[index]) return

      const image = normalizedImages[index]
      const imageSrc = createPreviewUrl(image)

      setCropModal({
        isOpen: true,
        imageIndex: index,
        imageSrc,
        originalFile: image
      })
    },
    [enableCrop, normalizedImages]
  )

  // Cerrar modal de crop
  const closeCropModal = useCallback(() => {
    // Limpiar URL temporal si existe
    if (cropModal.imageSrc && cropModal.imageSrc.startsWith('blob:')) {
      cleanupPreviewUrl(cropModal.imageSrc)
    }

    setCropModal({
      isOpen: false,
      imageIndex: null,
      imageSrc: null,
      originalFile: null
    })
  }, [cropModal.imageSrc])

  // Aplicar crop
  const applyCrop = useCallback(
    (croppedBlob, index = cropModal.imageIndex) => {
      if (index === null || index === undefined || !croppedBlob) return

      // Crear File desde blob
      const croppedFile = new File([croppedBlob], 'cropped_image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      })

      // Actualizar imagen
      const newImages = [...images]
      newImages[index] = croppedFile

      setImages(newImages)

      // Notificar cambio
      if (onImagesChange) {
        onImagesChange(newImages)
      }

      // Cerrar modal
      closeCropModal()
    },
    [images, cropModal.imageIndex, onImagesChange, closeCropModal]
  )

  // Configuración de Dropzone
  const dropzoneConfig = useMemo(
    () => ({
      onDrop: addImages,
      onDragEnter: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
      onDropAccepted: () => setIsDragging(false),
      onDropRejected: () => setIsDragging(false),
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp']
      },
      maxFiles: maxImages - images.length,
      multiple: true,
      disabled: images.length >= maxImages
    }),
    [addImages, maxImages, images.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig)

  // Validación general
  const hasErrors = Object.keys(imageErrors).length > 0
  const isRequired = required && images.length === 0
  const isValid = !hasErrors && !isRequired

  // Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      cleanupPreviewUrls(previewUrls.filter(url => url))
    }
  }, [])

  // API pública del hook
  return {
    // Estados principales
    images: normalizedImages,
    imageErrors,
    isValidating,
    isDragging: isDragging || isDragActive,
    animatingPositions,

    // Estados de validación
    hasErrors,
    isRequired,
    isValid,

    // URLs de previsualización
    previewUrls,

    // Métodos de gestión
    addImages,
    removeImage,
    reorderImages,
    setAsMainImage,

    // Crop
    cropModal,
    openCropModal,
    closeCropModal,
    applyCrop,

    // Dropzone
    dropzoneProps: {
      getRootProps,
      getInputProps,
      isDragActive
    },

    // Configuración
    maxImages,
    enableCrop,
    enableReorder,
    aspectRatio: cropAspectRatio || aspectRatio,

    // Utilidades
    canAddMore: images.filter(img => img).length < maxImages,
    imageCount: images.filter(img => img).length,
    mainImage: images[0] || null
  }
}

export default useImageManager
