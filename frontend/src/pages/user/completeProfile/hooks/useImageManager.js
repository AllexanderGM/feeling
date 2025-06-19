import { useState, useCallback } from 'react'

const useImageManager = () => {
  const [isDragging, setIsDragging] = useState({})

  // Configuración por defecto para validaciones
  const DEFAULT_VALIDATION_OPTIONS = {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth: 400,
    minHeight: 400,
    maxWidth: 6500,
    maxHeight: 6500
  }

  // Validación de imagen mejorada
  const validateImageFile = useCallback(async (file, options = {}) => {
    const config = { ...DEFAULT_VALIDATION_OPTIONS, ...options }

    if (!file) return 'Debes seleccionar una imagen'
    if (!(file instanceof File)) return 'El archivo seleccionado no es válido'

    // Validar tipo
    if (!config.allowedTypes.includes(file.type)) {
      const extensions = config.allowedTypes.map(t => t.split('/')[1]).join(', ')
      return `Solo se permiten: ${extensions}`
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > config.maxSizeMB) {
      return `Máximo ${config.maxSizeMB}MB. Actual: ${sizeMB.toFixed(1)}MB`
    }

    // Validar dimensiones
    try {
      const dimensions = await getImageDimensions(file)

      if (dimensions.width < config.minWidth || dimensions.height < config.minHeight) {
        return `Mínimo ${config.minWidth}x${config.minHeight}px`
      }

      if (dimensions.width > config.maxWidth || dimensions.height > config.maxHeight) {
        return `Máximo ${config.maxWidth}x${config.maxHeight}px`
      }
    } catch {
      return 'Error al validar dimensiones'
    }

    return null
  }, [])

  // Obtener dimensiones de imagen
  const getImageDimensions = useCallback(file => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('No se pudo cargar la imagen'))
      }

      img.src = url
    })
  }, [])

  // Procesar archivo con validación
  const processImageFile = useCallback(
    async (file, position, options = {}) => {
      const validationError = await validateImageFile(file, options)

      if (validationError) {
        return {
          success: false,
          error: validationError,
          position
        }
      }

      return {
        success: true,
        file,
        position,
        url: URL.createObjectURL(file)
      }
    },
    [validateImageFile]
  )

  // Manejadores de drag & drop simplificados
  const handleDragOver = useCallback((position, e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(prev => ({ ...prev, [position]: true }))
  }, [])

  const handleDragLeave = useCallback((position, e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(prev => ({ ...prev, [position]: false }))
  }, [])

  const handleDrop = useCallback(
    async (position, e, options = {}) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(prev => ({ ...prev, [position]: false }))

      const files = e.dataTransfer.files
      if (files.length > 0) {
        return await processImageFile(files[0], position, options)
      }

      return { success: false, error: 'No se encontraron archivos' }
    },
    [processImageFile]
  )

  // Intercambiar imágenes mejorado
  const swapImages = useCallback((images, fromIndex, toIndex) => {
    const newImages = [...images]
    ;[newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]]
    return newImages
  }, [])

  // Eliminar imagen en posición
  const removeImage = useCallback((images, position) => {
    const newImages = [...images]

    // Si hay URL de objeto, limpiarla
    if (newImages[position] && typeof newImages[position] === 'object' && newImages[position].url) {
      URL.revokeObjectURL(newImages[position].url)
    }

    newImages[position] = null
    return newImages
  }, [])

  // Obtener URL de imagen
  const getImageUrl = useCallback(image => {
    if (!image) return null

    // String directo (URL)
    if (typeof image === 'string') return image

    // File o Blob
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image)
    }

    // Objeto con url
    if (image?.url) return image.url

    return null
  }, [])

  // Obtener clases CSS para imagen
  const getImageClasses = useCallback(
    (position, hasImage = false) => {
      const baseClasses = 'relative cursor-pointer transition-all duration-300 group overflow-hidden'
      const draggingClass = isDragging[position] ? 'scale-105 border-primary-400' : ''

      if (position === 0) {
        // Imagen principal - circular
        const borderClass = hasImage ? 'border-primary-500' : 'border-gray-600'
        return `${baseClasses} w-36 h-36 rounded-full border-4 ${borderClass} ${draggingClass}`
      }

      // Imágenes adicionales - cuadradas
      const borderClass = hasImage ? 'border-primary-500' : 'border-gray-600'
      return `${baseClasses} w-32 h-32 rounded-lg border-2 border-dashed ${borderClass} ${draggingClass}`
    },
    [isDragging]
  )

  // Validar conjunto de imágenes
  const validateImageSet = useCallback((images, options = {}) => {
    const { requireMain = true, minImages = 1, maxImages = 5 } = options
    const errors = {}
    const validImages = images.filter(img => img !== null && img !== undefined)

    if (requireMain && !images[0]) {
      errors.main = 'La foto principal es requerida'
    }

    if (validImages.length < minImages) {
      errors.count = `Mínimo ${minImages} imagen${minImages > 1 ? 'es' : ''}`
    }

    if (validImages.length > maxImages) {
      errors.count = `Máximo ${maxImages} imágenes`
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      validCount: validImages.length
    }
  }, [])

  // Limpiar URLs de objetos
  const cleanupImageUrls = useCallback(images => {
    images.forEach(image => {
      if (image && typeof image === 'object' && image.url && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
    })
  }, [])

  return {
    // Estados
    isDragging,

    // Funciones principales
    processImageFile,
    validateImageFile,
    validateImageSet,

    // Drag & drop
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Gestión de imágenes
    swapImages,
    removeImage,
    getImageUrl,
    getImageClasses,
    cleanupImageUrls,

    // Constantes útiles
    DEFAULT_VALIDATION_OPTIONS
  }
}

export default useImageManager
