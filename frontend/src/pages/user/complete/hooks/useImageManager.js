import { useState, useCallback, useMemo } from 'react'

const useImageManager = (maxImages = 5) => {
  const [isDragging, setIsDragging] = useState({})
  const [animatingPositions, setAnimatingPositions] = useState(new Set())

  // Configuración por defecto para validaciones
  const DEFAULT_VALIDATION_OPTIONS = useMemo(
    () => ({
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      minWidth: 400,
      minHeight: 400,
      maxWidth: 6500,
      maxHeight: 6500
    }),
    []
  )

  // ============= HELPERS =============

  // Normalizar array de imágenes
  const normalizeImages = useCallback(
    images => {
      const normalizedImages = [...(images || [])]
      while (normalizedImages.length < maxImages) normalizedImages.push(null)
      return normalizedImages.slice(0, maxImages)
    },
    [maxImages]
  )

  // Obtener clave de error para posición de imagen
  const getImageErrorKey = useCallback(position => {
    return position === 0 ? 'profileImage' : `image${position}`
  }, [])

  // Estadísticas de imágenes
  const getImageStats = useCallback(
    images => {
      const normalizedImages = normalizeImages(images)
      const valid = normalizedImages.filter(img => img !== null)
      return {
        total: valid.length,
        remaining: maxImages - valid.length
      }
    },
    [normalizeImages, maxImages]
  )

  // ============= VALIDACIONES =============

  // Obtener dimensiones de imagen - MOVIDO ANTES DE validateImageFile
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

  // Validación de imagen mejorada
  const validateImageFile = useCallback(
    async (file, options = {}) => {
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
    },
    [DEFAULT_VALIDATION_OPTIONS, getImageDimensions]
  )

  // Validar conjunto de imágenes
  const validateImageSet = useCallback(
    (images, options = {}) => {
      const { requireMain = true, minImages = 1, maxImages: maxImagesOption = maxImages } = options
      const errors = {}
      const validImages = images.filter(img => img !== null && img !== undefined)

      if (requireMain && !images[0]) {
        errors.main = 'La foto principal es requerida'
      }

      if (validImages.length < minImages) {
        errors.count = `Mínimo ${minImages} imagen${minImages > 1 ? 'es' : ''}`
      }

      if (validImages.length > maxImagesOption) {
        errors.count = `Máximo ${maxImagesOption} imágenes`
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        validCount: validImages.length
      }
    },
    [maxImages]
  )

  // ============= PROCESAMIENTO DE ARCHIVOS =============

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

  // Manejador de archivo desde input
  const handleFileChange = useCallback(
    async (position, event, { images, updateFormData, errors, updateErrors, fileInputRefs }) => {
      const file = event.target.files[0]
      if (!file) return

      const result = await processImageFile(file, position)
      const errorKey = getImageErrorKey(position)

      if (result.success) {
        const normalizedImages = normalizeImages(images)
        normalizedImages[position] = result.file
        updateFormData('images', normalizedImages)

        // Limpiar error si existe
        if (errors[errorKey]) {
          updateErrors({ ...errors, [errorKey]: null })
        }
      } else {
        // Mostrar error
        updateErrors({ ...errors, [errorKey]: result.error })

        // Limpiar input
        if (fileInputRefs.current[position]) {
          fileInputRefs.current[position].value = ''
        }
      }
    },
    [processImageFile, normalizeImages, getImageErrorKey]
  )

  // ============= DRAG & DROP =============

  // Manejadores de drag & drop
  const handleDragOver = useCallback((position, e) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(prev => {
      if (prev[position] === true) return prev
      return { ...prev, [position]: true }
    })
  }, [])

  const handleDragLeave = useCallback((position, e) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(prev => {
        if (prev[position] === false) return prev
        return { ...prev, [position]: false }
      })
    }
  }, [])

  const handleDrop = useCallback(
    async (position, e, { images, updateFormData, errors, updateErrors, options = {} }) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(prev => ({ ...prev, [position]: false }))

      const files = e.dataTransfer.files
      if (files.length === 0) {
        return { success: false, error: 'No se encontraron archivos' }
      }

      const result = await processImageFile(files[0], position, options)
      const errorKey = getImageErrorKey(position)

      if (result.success) {
        const normalizedImages = normalizeImages(images)
        normalizedImages[position] = result.file
        updateFormData('images', normalizedImages)

        if (errors[errorKey]) {
          updateErrors({ ...errors, [errorKey]: null })
        }
      } else {
        updateErrors({ ...errors, [errorKey]: result.error })
      }

      return result
    },
    [processImageFile, normalizeImages, getImageErrorKey]
  )

  // ============= GESTIÓN DE IMÁGENES =============

  // Intercambiar imágenes
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

  // Intercambiar imagen con principal
  const handleSwapToMain = useCallback(
    async (position, { images, updateFormData }) => {
      if (position === 0 || animatingPositions.size > 0) return

      setAnimatingPositions(new Set([0, position]))

      await new Promise(resolve => setTimeout(resolve, 200))

      const normalizedImages = normalizeImages(images)
      const newImages = swapImages(normalizedImages, 0, position)
      updateFormData('images', newImages)

      setTimeout(() => setAnimatingPositions(new Set()), 500)
    },
    [animatingPositions, normalizeImages, swapImages]
  )

  // Eliminar imagen
  const handleRemoveImage = useCallback(
    (position, e, { images, updateFormData, errors, updateErrors, fileInputRefs }) => {
      e.stopPropagation()

      const normalizedImages = normalizeImages(images)
      const newImages = removeImage(normalizedImages, position)
      updateFormData('images', newImages)

      // Limpiar error e input
      const errorKey = getImageErrorKey(position)
      if (errors[errorKey]) {
        updateErrors({ ...errors, [errorKey]: null })
      }

      if (fileInputRefs.current[position]) {
        fileInputRefs.current[position].value = ''
      }
    },
    [normalizeImages, getImageErrorKey, removeImage]
  )

  // ============= UTILIDADES =============

  // Obtener URL de imagen
  const getImageUrl = useCallback(image => {
    if (!image) return null

    // String directo (URL)
    if (typeof image === 'string') return image

    // File o Blob - crear URL temporal
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
    animatingPositions,

    // Helpers
    normalizeImages,
    getImageErrorKey,
    getImageStats,

    // Funciones principales
    processImageFile,
    validateImageFile,
    validateImageSet,
    getImageDimensions, // Agregado al return

    // Manejadores de eventos principales
    handleFileChange,
    handleSwapToMain,
    handleRemoveImage,

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
    DEFAULT_VALIDATION_OPTIONS,
    maxImages
  }
}

export default useImageManager
