/**
 * HOOK PARA IMÁGENES PERSISTENTES
 * 
 * Maneja la conversión de File objects a base64 para persistencia
 * entre navegación de pasos del formulario
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/**
 * Convierte un File a base64
 */
const fileToBase64 = (file) => {
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
    console.error('Error converting base64 to file:', error)
    return null
  }
}

/**
 * Hook para manejar imágenes persistentes
 */
export const usePersistentImages = (initialImages = [], onImagesChange) => {
  const [persistentImages, setPersistentImages] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const conversionInProgress = useRef(false)

  // Convertir imágenes iniciales a base64 si son File objects
  useEffect(() => {
    if (initialImages.length === 0) {
      setPersistentImages([])
      setHasInitialized(true)
      return
    }
    
    if (conversionInProgress.current) {
      return
    }

    const convertInitialImages = async () => {
      conversionInProgress.current = true
      setIsConverting(true)

      try {
        const convertedImages = await Promise.all(
          initialImages.map(async (image) => {
            if (!image) return null
            
            // Si ya es base64, mantenerlo
            if (typeof image === 'string') {
              return image
            }
            
            // Si es File, convertir a base64
            if (image instanceof File) {
              return await fileToBase64(image)
            }
            
            return null
          })
        )

        const validImages = convertedImages.filter(img => img !== null)
        setPersistentImages(validImages)
        setHasInitialized(true)
      } catch (error) {
        console.error('Error converting initial images:', error)
        setHasInitialized(true)
      } finally {
        setIsConverting(false)
        conversionInProgress.current = false
      }
    }

    convertInitialImages()
  }, [initialImages])

  // Función para manejar cambios completos en las imágenes (reemplazar todo)
  const handleImagesChange = useCallback(async (newImages) => {
    if (!Array.isArray(newImages)) {
      return
    }

    setIsConverting(true)

    try {
      // Convertir todas las imágenes a base64
      const convertedImages = await Promise.all(
        newImages.map(async (image) => {
          if (!image) return null
          
          if (typeof image === 'string') {
            return image
          }
          
          if (image instanceof File) {
            return await fileToBase64(image)
          }
          
          return null
        })
      )

      const validImages = convertedImages.filter(img => img !== null)
      
      // Actualizar estado local
      setPersistentImages(validImages)
      
      // Notificar cambio con File objects
      const fileObjects = await Promise.all(
        validImages.map(async (base64String, index) => {
          return base64ToFile(base64String, `image_${index}.jpg`)
        })
      ).then(files => files.filter(file => file !== null))
      
      onImagesChange?.(fileObjects)
    } catch (error) {
      console.error('Error updating images:', error)
    } finally {
      setIsConverting(false)
    }
  }, [onImagesChange])

  // Función para remover imagen
  const removeImage = useCallback((index) => {
    const updatedImages = persistentImages.filter((_, i) => i !== index)
    setPersistentImages(updatedImages)
    
    // Convertir a File objects y notificar
    Promise.all(
      updatedImages.map(async (base64String, idx) => {
        return base64ToFile(base64String, `image_${idx}.jpg`)
      })
    ).then(files => {
      const validFiles = files.filter(file => file !== null)
      onImagesChange?.(validFiles)
    })
  }, [persistentImages, onImagesChange])

  // Función para reordenar imágenes
  const reorderImages = useCallback((startIndex, endIndex) => {
    const reorderedImages = [...persistentImages]
    const [removed] = reorderedImages.splice(startIndex, 1)
    reorderedImages.splice(endIndex, 0, removed)
    
    setPersistentImages(reorderedImages)
    
    // Convertir a File objects y notificar
    Promise.all(
      reorderedImages.map(async (base64String, idx) => {
        return base64ToFile(base64String, `image_${idx}.jpg`)
      })
    ).then(files => {
      const validFiles = files.filter(file => file !== null)
      onImagesChange?.(validFiles)
    })
  }, [persistentImages, onImagesChange])

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
  const fileObjects = useMemo(() => {
    if (!hasInitialized) {
      return []
    }
    
    return persistentImages.map((base64, index) => base64ToFile(base64, `image_${index}.jpg`)).filter(Boolean)
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