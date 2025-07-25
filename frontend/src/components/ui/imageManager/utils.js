/**
 * UTILIDADES UNIFICADAS PARA IMAGEMANAGER
 *
 * Contiene todas las utilidades técnicas necesarias para el funcionamiento del ImageManager:
 * - Validación técnica de archivos de imagen
 * - Procesamiento de URLs de previsualización  
 * - Utilidades de crop
 */

// ========================================
// CONSTANTES DE VALIDACIÓN
// ========================================

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MIN_DIMENSIONS = { width: 400, height: 400 }
export const MAX_DIMENSIONS = { width: 6500, height: 6500 }

// ========================================
// VALIDACIÓN TÉCNICA DE ARCHIVOS
// ========================================

/**
 * Valida el tipo de archivo
 */
const validateFileType = file => {
  if (!file || !file.type) {
    return { isValid: false, error: 'Archivo inválido' }
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Usa JPEG, PNG o WebP'
    }
  }

  return { isValid: true }
}

/**
 * Valida el tamaño del archivo
 */
const validateFileSize = file => {
  if (!file || !file.size) {
    return { isValid: false, error: 'Archivo inválido' }
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    return {
      isValid: false,
      error: `El archivo es muy grande. Máximo ${maxSizeMB}MB`
    }
  }

  return { isValid: true }
}

/**
 * Valida las dimensiones de la imagen
 */
const validateImageDimensions = file => {
  return new Promise(resolve => {
    const img = new Image()

    img.onload = () => {
      const { width, height } = img

      if (width < MIN_DIMENSIONS.width || height < MIN_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Imagen muy pequeña. Mínimo ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px`
        })
        return
      }

      if (width > MAX_DIMENSIONS.width || height > MAX_DIMENSIONS.height) {
        resolve({
          isValid: false,
          error: `Imagen muy grande. Máximo ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px`
        })
        return
      }

      resolve({ isValid: true, dimensions: { width, height } })
    }

    img.onerror = () => {
      resolve({ isValid: false, error: 'Imagen corrupta o inválida' })
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validación completa de un archivo de imagen
 */
export const validateImageFile = async file => {
  // Validaciones síncronas
  const typeValidation = validateFileType(file)
  if (!typeValidation.isValid) return typeValidation

  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.isValid) return sizeValidation

  // Validación asíncrona de dimensiones
  const dimensionsValidation = await validateImageDimensions(file)
  if (!dimensionsValidation.isValid) return dimensionsValidation

  return {
    isValid: true,
    dimensions: dimensionsValidation.dimensions
  }
}

// ========================================
// PROCESAMIENTO DE URLS
// ========================================

/**
 * Crea una URL temporal para previsualización
 */
export const createPreviewUrl = file => {
  if (!file) return null

  if (typeof file === 'string') return file // URL existente

  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file)
  }

  return null
}

/**
 * Limpia URLs temporales para evitar memory leaks
 */
export const cleanupPreviewUrl = url => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Limpia un array de URLs temporales
 */
export const cleanupPreviewUrls = urls => {
  urls.forEach(url => cleanupPreviewUrl(url))
}

// ========================================
// UTILIDADES DE CROP
// ========================================

/**
 * Crea imagen croppada usando canvas
 */
export const createCroppedImage = (imageSrc, pixelCrop, outputFormat = 'image/jpeg', quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          resolve(blob)
        },
        outputFormat,
        quality
      )
    }
    
    image.onerror = reject
    image.src = imageSrc
  })
}