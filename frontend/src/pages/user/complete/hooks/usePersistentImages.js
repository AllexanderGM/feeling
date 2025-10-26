/**
 * HOOK PARA IMÁGENES PERSISTENTES
 *
 * Maneja la conversión de File objects a base64 para persistencia
 * entre navegación de pasos del formulario
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Logger } from '@utils/logger.js'

/**
 * Convierte un File a base64
 */
const fileToBase64 = file => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)

      return
    }

    // Si ya es una string base64, devolverla
    if (typeof file === 'string') {
      resolve(file)

      return
    }

    // Si no es un File, rechazar
    if (!(file instanceof File)) {
      resolve(null)

      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(new Error('Error al convertir archivo a base64'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convierte base64 a File object
 */
const base64ToFile = (base64String, fileName = 'image.jpg') => {
  if (!base64String || typeof base64String !== 'string') {
    return null
  }

  try {
    // Extraer el tipo de archivo del base64
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/)

    if (!matches) {
      return null
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Convertir base64 a bytes
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    // Crear File object
    return new File([byteArray], fileName, { type: mimeType })
  } catch (error) {
    Logger.error('Error converting base64 to file:', error, { category: Logger.CATEGORIES.SYSTEM })

    return null
  }
}

/**
 * Convierte una URL de imagen a File object descargándola
 */
const urlToFile = async (url, fileName = 'image.jpg') => {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    // Fetch la imagen
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Convertir a blob
    const blob = await response.blob()

    // Crear File object
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' })
  } catch (error) {
    Logger.error('Error converting URL to file:', error, { category: Logger.CATEGORIES.SYSTEM })

    return null
  }
}

/**
 * Convierte una imagen (File, URL o base64) a formato persistente (string)
 */
const imageToStorageFormat = async image => {
  if (!image) return null

  // Si ya es string (base64 o URL), mantenerlo
  if (typeof image === 'string') {
    return image
  }

  // Si es File, convertir a base64
  if (image instanceof File) {
    return await fileToBase64(image)
  }

  return null
}

/**
 * Hook para manejar imágenes persistentes
 * @param {Array} initialImages - Imágenes iniciales (File, URL o base64)
 * @param {Function} onImagesChange - Callback cuando las imágenes cambian
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onValidationChange - Callback para validación de imágenes
 */
export const usePersistentImages = (initialImages = [], onImagesChange, options = {}) => {
  const { onValidationChange } = options
  const [persistentImages, setPersistentImages] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const conversionInProgress = useRef(false)
  const failedRemoteDownloads = useRef(new Set())
  const pruneFailedDownloads = useCallback(images => {
    if (failedRemoteDownloads.current.size === 0) return

    const availableUrls = new Set(images.filter(imageData => typeof imageData === 'string' && imageData.startsWith('http')))

    failedRemoteDownloads.current = new Set([...failedRemoteDownloads.current].filter(url => availableUrls.has(url)))
  }, [])

  // Convertir imágenes iniciales a base64 si son File objects
  useEffect(() => {
    // Si no hay imágenes, resetear
    if (initialImages.length === 0) {
      setPersistentImages([])
      setHasInitialized(true)

      return
    }

    // Evitar conversión duplicada solo si ya estamos en proceso
    if (conversionInProgress.current) return

    const convertInitialImages = async () => {
      conversionInProgress.current = true
      setIsConverting(true)

      try {
        const convertedImages = await Promise.all(initialImages.map(imageToStorageFormat))

        const validImages = convertedImages.filter(img => img !== null)

        // Solo actualizar si realmente hay un cambio
        setPersistentImages(prev => {
          const prevStr = JSON.stringify(prev)
          const newStr = JSON.stringify(validImages)

          if (prevStr === newStr) return prev

          return validImages
        })
        pruneFailedDownloads(validImages)
        setHasInitialized(true)
      } catch (error) {
        Logger.error('Error converting initial images:', error, { category: Logger.CATEGORIES.UI })
        setHasInitialized(true)
      } finally {
        setIsConverting(false)
        conversionInProgress.current = false
      }
    }

    convertInitialImages()
  }, [initialImages.length, JSON.stringify(initialImages.map(img => (typeof img === 'string' ? img : img?.name))), pruneFailedDownloads])

  // Función para manejar cambios completos en las imágenes (reemplazar todo)
  const handleImagesChange = useCallback(
    async newImages => {
      if (!Array.isArray(newImages)) return

      setIsConverting(true)

      try {
        // Convertir todas las imágenes a formato de almacenamiento
        const convertedImages = await Promise.all(newImages.map(imageToStorageFormat))

        const validImages = convertedImages.filter(img => img !== null)

        // Actualizar estado local
        setPersistentImages(validImages)

        pruneFailedDownloads(validImages)

        // Notificar validación si hay callback
        if (onValidationChange) {
          onValidationChange({
            hasErrors: false,
            imageCount: validImages.length,
            errors: {}
          })
        }

        // Notificar cambio intentando convertir las imágenes a File cuando sea posible
        const processedImages = await Promise.all(
          validImages.map(async (imageData, index) => {
            // Si es una URL (empieza con http), descargarla y convertirla a File
            if (typeof imageData === 'string' && imageData.startsWith('http')) {
              if (failedRemoteDownloads.current.has(imageData)) {
                return imageData
              }

              const file = await urlToFile(imageData, `image_${index}.jpg`)

              if (!file) {
                failedRemoteDownloads.current.add(imageData)

                return imageData
              }

              return file
            }
            // Si es base64, convertir a File
            if (typeof imageData === 'string' && imageData.startsWith('data:')) {
              return base64ToFile(imageData, `image_${index}.jpg`)
            }
            // Si ya es un File, retornarlo directamente
            if (imageData instanceof File) {
              return imageData
            }

            return null
          })
        )

        const validProcessedImages = processedImages.filter(img => img !== null)

        onImagesChange?.(validProcessedImages)
      } catch (error) {
        Logger.error('Error updating images:', error, { category: Logger.CATEGORIES.UI })
      } finally {
        setIsConverting(false)
      }
    },
    [onImagesChange, pruneFailedDownloads, onValidationChange]
  )

  // Función para remover imagen
  const removeImage = useCallback(
    index => {
      const updatedImages = persistentImages.filter((_, i) => i !== index)

      setPersistentImages(updatedImages)

      pruneFailedDownloads(updatedImages)

      // Convertir a File objects cuando sea posible y notificar
      Promise.all(
        updatedImages.map(async (imageData, idx) => {
          // Si es URL, descargar y convertir a File
          if (typeof imageData === 'string' && imageData.startsWith('http')) {
            if (failedRemoteDownloads.current.has(imageData)) {
              return imageData
            }

            const file = await urlToFile(imageData, `image_${idx}.jpg`)

            if (!file) {
              failedRemoteDownloads.current.add(imageData)

              return imageData
            }

            return file
          }
          // Si es base64, convertir a File
          if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            return base64ToFile(imageData, `image_${idx}.jpg`)
          }
          // Si ya es File, retornar directamente
          if (imageData instanceof File) {
            return imageData
          }

          return null
        })
      ).then(files => {
        const validFiles = files.filter(file => file !== null)

        onImagesChange?.(validFiles)
      })
    },
    [persistentImages, onImagesChange, pruneFailedDownloads]
  )

  // Función para reordenar imágenes
  const reorderImages = useCallback(
    (startIndex, endIndex) => {
      const reorderedImages = [...persistentImages]
      const [removed] = reorderedImages.splice(startIndex, 1)

      reorderedImages.splice(endIndex, 0, removed)

      setPersistentImages(reorderedImages)

      pruneFailedDownloads(reorderedImages)

      // Convertir a File objects cuando sea posible y notificar
      Promise.all(
        reorderedImages.map(async (imageData, idx) => {
          // Si es URL, descargar y convertir a File
          if (typeof imageData === 'string' && imageData.startsWith('http')) {
            if (failedRemoteDownloads.current.has(imageData)) {
              return imageData
            }

            const file = await urlToFile(imageData, `image_${idx}.jpg`)

            if (!file) {
              failedRemoteDownloads.current.add(imageData)

              return imageData
            }

            return file
          }
          // Si es base64, convertir a File
          if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            return base64ToFile(imageData, `image_${idx}.jpg`)
          }
          // Si ya es File, retornar directamente
          if (imageData instanceof File) {
            return imageData
          }

          return null
        })
      ).then(files => {
        const validFiles = files.filter(file => file !== null)

        onImagesChange?.(validFiles)
      })
    },
    [persistentImages, onImagesChange, pruneFailedDownloads]
  )

  // Obtener File objects para el ImageManager
  const getFileObjects = useCallback(async () => {
    const fileObjects = await Promise.all(
      persistentImages.map(async (base64String, index) => {
        return base64ToFile(base64String, `image_${index}.jpg`)
      })
    )

    return fileObjects.filter(file => file !== null)
  }, [persistentImages])

  // Generar File objects solo después de la inicialización
  // NOTA: Este useMemo es solo para MOSTRAR las imágenes en el UI (ImageManager)
  // Para enviar al backend, se usan las conversiones asíncronas en handleImagesChange/removeImage/reorderImages
  const fileObjects = useMemo(() => {
    if (!hasInitialized) {
      return []
    }

    return persistentImages
      .map((imageData, index) => {
        // Si es base64, convertir a File
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          return base64ToFile(imageData, `image_${index}.jpg`)
        }
        // Si es URL, retornar la URL directamente (el ImageManager puede mostrarla)
        if (typeof imageData === 'string') {
          return imageData
        }
        // Si ya es File, retornar directamente
        if (imageData instanceof File) {
          return imageData
        }

        return null
      })
      .filter(Boolean)
  }, [persistentImages, hasInitialized])

  return {
    persistentImages,
    fileObjects,
    handleImagesChange,
    removeImage,
    reorderImages,
    getFileObjects,
    isConverting,
    hasInitialized,
    hasImages: persistentImages.length > 0,
    imageCount: persistentImages.length
  }
}
