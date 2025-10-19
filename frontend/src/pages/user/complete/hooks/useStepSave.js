/**
 * HOOK: useStepSave
 *
 * Hook personalizado para manejar la lógica de guardar datos de un paso del perfil
 * Incluye comparación de cambios, preparación de datos y guardado optimizado
 */
import { useCallback } from 'react'
import { Logger } from '@utils/logger.js'
import { prepareDataForBackend, hasFormChanges, filterNullValues } from '@utils/formHelpers.js'
import { useUser } from '@hooks'

/**
 * Hook para manejar el guardado de pasos del perfil con optimización
 *
 * @param {Object} user - Usuario actual
 * @returns {Object} - Funciones para guardar datos del paso
 *
 * @example
 * const { saveStepData, submitting } = useStepSave(user)
 *
 * // Guardar datos de un paso específico
 * const result = await saveStepData({
 *   stepNumber: 1,
 *   formData: { name: "Juan", lastName: "Pérez" },
 *   images: [file1, file2]
 * })
 */
export const useStepSave = user => {
  const { updateCurrentProfile, submitting } = useUser()

  /**
   * Guarda los datos de un paso del perfil
   * Solo hace la solicitud al backend si hay cambios reales
   *
   * @param {Object} options - Opciones de guardado
   * @param {number} options.stepNumber - Número del paso actual
   * @param {Object} options.formData - Datos del formulario (sin preparar)
   * @param {Array} options.images - Array de imágenes (opcional)
   * @returns {Object} - { success: boolean, hasChanges: boolean, result: Object }
   */
  const saveStepData = useCallback(
    async ({ stepNumber, formData, images = null }) => {
      try {
        // Separar images de los demás datos
        const { images: formImages, ...profileData } = formData

        // Preparar datos para el backend (convertir CalendarDate, etc.)
        const preparedData = prepareDataForBackend(profileData)

        // Verificar si hay cambios en los DATOS del paso actual (sin images)
        const hasDataChanges = hasFormChanges(preparedData, user, stepNumber)

        // Preparar imágenes
        const imagesToSend = images || formImages
        const validImages = imagesToSend ? filterNullValues(imagesToSend) : null

        // Comparar imágenes por separado
        const userImages = user?.user?.images ?? user?.images ?? []
        const formImagesCount = validImages ? validImages.length : 0
        const userImagesCount = Array.isArray(userImages) ? userImages.filter(img => img).length : 0

        // Comparar cantidad
        let hasImageChanges = formImagesCount !== userImagesCount

        // Si la cantidad es igual, comparar contenido (URLs o Files)
        if (!hasImageChanges && validImages && validImages.length > 0) {
          // Extraer URLs/nombres de las imágenes del form
          const formImageIds = validImages.map(img => {
            if (typeof img === 'string') return img // URL
            if (img instanceof File) return img.name // File name

            return JSON.stringify(img)
          })

          // Extraer URLs de las imágenes del usuario
          const userImageIds = userImages.filter(img => img).map(img => img)

          // Comparar arrays (orden y contenido)
          const formStr = JSON.stringify(formImageIds)
          const userStr = JSON.stringify(userImageIds)

          hasImageChanges = formStr !== userStr

          if (hasImageChanges) {
            console.log('📸 [useStepSave] Image content/order changed:', {
              formImageIds: formImageIds.slice(0, 2),
              userImageIds: userImageIds.slice(0, 2)
            })
          }
        }

        console.log('📸 [useStepSave] Image comparison:', {
          formImagesCount,
          userImagesCount,
          hasImageChanges,
          validImages: validImages?.slice(0, 2) // Solo mostrar primeras 2 para debug
        })

        // Si NO hay cambios en datos NI en imágenes, omitir guardado
        if (!hasDataChanges && !hasImageChanges) {
          Logger.info(Logger.CATEGORIES.UI, 'guardar paso', `Paso ${stepNumber}: No hay cambios en datos ni imágenes, omitiendo guardado`)

          return {
            success: true,
            hasChanges: false,
            skipped: true
          }
        }

        // Hay cambios, proceder con el guardado
        const changeTypes = []

        if (hasDataChanges) changeTypes.push('datos')
        if (hasImageChanges) changeTypes.push('imágenes')

        Logger.debug(
          Logger.CATEGORIES.UI,
          'guardar paso',
          `Paso ${stepNumber}: Detectados cambios en ${changeTypes.join(' y ')}, guardando...`
        )

        const imageTypes = validImages?.map(img => (typeof img === 'string' ? 'URL' : img instanceof File ? 'File' : 'unknown'))
        const allAreURLs = imageTypes?.every(t => t === 'URL')
        const hasNewFiles = imageTypes?.some(t => t === 'File')

        console.log('📤 [useStepSave] Sending to backend:', {
          preparedData: Object.keys(preparedData),
          validImagesCount: validImages?.length,
          validImagesTypes: imageTypes,
          allAreURLs,
          hasNewFiles,
          validImagesPreview: validImages?.slice(0, 2)
        })

        // Determinar si necesitamos reemplazar imágenes
        // - Si hay Files nuevos: enviar con replaceImages=true para reemplazar todo
        // - Si todas son URLs: NO enviar imágenes (significa que no hubo cambios reales)
        const shouldReplaceImages = hasNewFiles && hasImageChanges
        const finalImagesToSend = hasNewFiles ? validImages : null

        console.log('📤 [useStepSave] Upload strategy:', {
          shouldReplaceImages,
          finalImagesToSendCount: finalImagesToSend?.length ?? 0,
          hasNewFiles,
          allAreURLs,
          hasImageChanges
        })

        if (allAreURLs && hasImageChanges) {
          console.log('⚠️ [useStepSave] Detected image changes but all are URLs - user deleted images')
          console.log('   User had:', userImagesCount, 'images')
          console.log('   Form has:', formImagesCount, 'images')
          console.log('   → This should not happen anymore with new replaceImages logic')
        }

        // Guardar en el backend
        const result = await updateCurrentProfile(
          preparedData,
          finalImagesToSend && finalImagesToSend.length > 0 ? finalImagesToSend : null,
          shouldReplaceImages // Si hay nuevos Files, reemplazar todas las imágenes existentes
        )

        return {
          success: result.success,
          hasChanges: true,
          skipped: false,
          result
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.UI, 'guardar paso', `Error al guardar paso ${stepNumber}`, {
          context: { error }
        })

        return {
          success: false,
          hasChanges: true,
          skipped: false,
          error
        }
      }
    },
    [user, updateCurrentProfile]
  )

  return {
    saveStepData,
    submitting
  }
}
