/**
 * UTILIDAD DE COMPRESIÓN DE IMÁGENES
 *
 * Sistema de compresión inteligente que mantiene calidad visual
 * mientras reduce significativamente el tamaño del archivo
 */

import { Logger } from '@utils/logger.js'

// ========================================
// CONFIGURACIÓN DE COMPRESIÓN
// ========================================

export const COMPRESSION_CONFIG = {
  // Calidad base por tipo de imagen
  QUALITY: {
    HIGH: 0.92, // Para imágenes pequeñas o ya comprimidas
    MEDIUM: 0.85, // Para imágenes medianas
    LOW: 0.8 // Para imágenes muy grandes
  },

  // Dimensiones máximas (mantiene aspect ratio)
  MAX_DIMENSIONS: {
    width: 1920, // Full HD width
    height: 1920 // Full HD height
  },

  // Tamaños de archivo para determinar calidad
  SIZE_THRESHOLDS: {
    SMALL: 1 * 1024 * 1024, // < 1MB
    MEDIUM: 2.5 * 1024 * 1024, // < 2.5MB
    LARGE: 5 * 1024 * 1024 // < 5MB
  },

  // Formato de salida
  OUTPUT_FORMAT: 'image/jpeg',

  // Límite objetivo después de compresión
  TARGET_SIZE: 1.5 * 1024 * 1024 // 1.5MB por imagen
}

/**
 * Formatea bytes a tamaño legible
 */
const formatBytes = bytes => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Determina la calidad de compresión basada en el tamaño del archivo
 */
const getQualityForSize = fileSize => {
  const { SMALL, MEDIUM } = COMPRESSION_CONFIG.SIZE_THRESHOLDS
  const { HIGH, MEDIUM: MED, LOW } = COMPRESSION_CONFIG.QUALITY

  if (fileSize < SMALL) return HIGH
  if (fileSize < MEDIUM) return MED

  return LOW
}

/**
 * Redimensiona una imagen manteniendo el aspect ratio
 */
const calculateNewDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth
  let height = originalHeight

  // Si la imagen es más pequeña que los límites, no redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height, wasResized: false }
  }

  // Calcular el ratio de aspecto
  const aspectRatio = width / height

  // Redimensionar basándose en qué dimensión excede más el límite
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
    wasResized: true
  }
}

/**
 * Comprime una imagen usando Canvas
 *
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<{file: File, stats: Object}>}
 */
export const compressImage = async (file, options = {}) => {
  const startTime = performance.now()

  // Opciones con valores por defecto
  const {
    quality = null, // Si es null, se calcula automáticamente
    maxWidth = COMPRESSION_CONFIG.MAX_DIMENSIONS.width,
    maxHeight = COMPRESSION_CONFIG.MAX_DIMENSIONS.height,
    outputFormat = COMPRESSION_CONFIG.OUTPUT_FORMAT,
    maintainFileName = true
  } = options

  return new Promise((resolve, reject) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen'))

      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Error al leer el archivo'))

    reader.onload = e => {
      const img = new Image()

      img.onerror = () => reject(new Error('Error al cargar la imagen'))

      img.onload = () => {
        try {
          // Calcular nuevas dimensiones
          const { width, height, wasResized } = calculateNewDimensions(img.width, img.height, maxWidth, maxHeight)

          // Determinar calidad óptima
          const compressionQuality = quality !== null ? quality : getQualityForSize(file.size)

          // Crear canvas
          const canvas = document.createElement('canvas')

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d', {
            alpha: false, // Deshabilitar canal alpha para mejor compresión
            desynchronized: true // Mejor rendimiento
          })

          // Configurar canvas para mejor calidad
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height)

          // Convertir a Blob
          canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'))

                return
              }

              // Crear nuevo File con el blob comprimido
              const compressedFile = new File([blob], maintainFileName ? file.name.replace(/\.[^.]+$/, '.jpg') : 'compressed_image.jpg', {
                type: outputFormat,
                lastModified: Date.now()
              })

              // Estadísticas de compresión
              const endTime = performance.now()
              const originalSize = file.size
              const compressedSize = compressedFile.size
              const reduction = ((originalSize - compressedSize) / originalSize) * 100
              const compressionTime = endTime - startTime

              const stats = {
                originalSize,
                compressedSize,
                originalSizeFormatted: formatBytes(originalSize),
                compressedSizeFormatted: formatBytes(compressedSize),
                reduction: reduction.toFixed(2),
                compressionTime: compressionTime.toFixed(2),
                quality: compressionQuality,
                wasResized,
                originalDimensions: { width: img.width, height: img.height },
                newDimensions: { width, height }
              }

              resolve({ file: compressedFile, stats })
            },
            outputFormat,
            compressionQuality
          )
        } catch (error) {
          reject(new Error(`Error en el proceso de compresión: ${error.message}`))
        }
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Comprime múltiples imágenes en lote
 *
 * @param {File[]} files - Array de archivos de imagen
 * @param {Object} options - Opciones de compresión
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Array<{file: File, stats: Object}>>}
 */
export const compressImages = async (files, options = {}, onProgress = null) => {
  const results = []
  const totalFiles = files.length

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImage(files[i], options)

      results.push(result)

      // Callback de progreso
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          percentage: Math.round(((i + 1) / totalFiles) * 100),
          currentFile: files[i].name,
          stats: result.stats
        })
      }
    } catch (error) {
      Logger.error(`Error comprimiendo imagen ${files[i].name}`, error.message || error)

      // En caso de error, mantener la imagen original
      results.push({
        file: files[i],
        stats: {
          originalSize: files[i].size,
          compressedSize: files[i].size,
          reduction: 0,
          error: error.message
        }
      })
    }
  }

  return results
}

/**
 * Comprueba si una imagen necesita compresión
 *
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{needsCompression: boolean, reason: string}>}
 */
export const shouldCompress = async file => {
  // Siempre comprimir si es mayor que el tamaño objetivo
  if (file.size > COMPRESSION_CONFIG.TARGET_SIZE) {
    return {
      needsCompression: true,
      reason: `Archivo mayor que ${formatBytes(COMPRESSION_CONFIG.TARGET_SIZE)}`
    }
  }

  // Verificar dimensiones
  return new Promise(resolve => {
    const img = new Image()

    img.onload = () => {
      const { wasResized } = calculateNewDimensions(
        img.width,
        img.height,
        COMPRESSION_CONFIG.MAX_DIMENSIONS.width,
        COMPRESSION_CONFIG.MAX_DIMENSIONS.height
      )

      if (wasResized) {
        resolve({
          needsCompression: true,
          reason: 'Dimensiones exceden el límite'
        })
      } else {
        resolve({
          needsCompression: false,
          reason: 'Imagen ya optimizada'
        })
      }
    }

    img.onerror = () => {
      resolve({
        needsCompression: true,
        reason: 'No se pudo verificar dimensiones, comprimir por seguridad'
      })
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compresión inteligente que solo comprime si es necesario
 *
 * @param {File} file - Archivo de imagen
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<{file: File, stats: Object, wasCompressed: boolean}>}
 */
export const smartCompress = async (file, options = {}) => {
  const check = await shouldCompress(file)

  if (!check.needsCompression) {
    return {
      file,
      stats: {
        originalSize: file.size,
        compressedSize: file.size,
        reduction: 0
      },
      wasCompressed: false
    }
  }

  const result = await compressImage(file, options)

  return {
    ...result,
    wasCompressed: true
  }
}
