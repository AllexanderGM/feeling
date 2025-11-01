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

const ENABLE_STEP_SAVE_DEBUG = import.meta?.env?.VITE_ENABLE_STEP_SAVE_DEBUG === 'true'

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
export const useStepSave = (user, options = {}) => {
  const { updateCurrentProfile, updateUserProfileByAdmin, submitting } = useUser()
  const { overrideUser = null, overrideSaveFn = null } = options

  const targetUser = overrideUser || user

  const resolveSaveHandler = useCallback(
    (profileData, profileImages = null, replaceImages = false) => {
      if (typeof overrideSaveFn === 'function') {
        return overrideSaveFn(profileData, profileImages, replaceImages)
      }

      if (overrideUser?.id && typeof updateUserProfileByAdmin === 'function') {
        return updateUserProfileByAdmin(overrideUser.id, profileData, profileImages)
      }

      return updateCurrentProfile(profileData, profileImages, replaceImages)
    },
    [overrideSaveFn, overrideUser?.id, updateCurrentProfile, updateUserProfileByAdmin]
  )

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
        const hasDataChanges = hasFormChanges(preparedData, targetUser, stepNumber)

        // Preparar imágenes
        const imagesToSend = images || formImages
        const validImages = imagesToSend ? filterNullValues(imagesToSend) : null

        // Comparar imágenes por separado
        const userImages = targetUser?.user?.images ?? targetUser?.images ?? []
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

          if (ENABLE_STEP_SAVE_DEBUG && hasImageChanges) {
            Logger.debug(Logger.CATEGORIES.UI, 'guardar paso', `Paso ${stepNumber}: Cambios detectados en el orden/contenido de imágenes`, {
              context: {
                formImageSample: formImageIds.slice(0, 2),
                userImageSample: userImageIds.slice(0, 2)
              }
            })
          }
        }

        if (ENABLE_STEP_SAVE_DEBUG) {
          Logger.debug(Logger.CATEGORIES.UI, 'guardar paso', `Paso ${stepNumber}: Comparación de imágenes`, {
            context: {
              formImagesCount,
              userImagesCount,
              hasImageChanges,
              validImagesSample: validImages?.slice(0, 2)
            }
          })
        }

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

        if (ENABLE_STEP_SAVE_DEBUG) {
          Logger.debug(
            Logger.CATEGORIES.UI,
            'guardar paso',
            `Paso ${stepNumber}: Detectados cambios en ${changeTypes.join(' y ')}, guardando...`
          )
        }

        const imageTypes = validImages?.map(img => (typeof img === 'string' ? 'URL' : img instanceof File ? 'File' : 'unknown'))
        const allAreURLs = imageTypes?.every(t => t === 'URL')
        const hasNewFiles = imageTypes?.some(t => t === 'File')

        if (ENABLE_STEP_SAVE_DEBUG) {
          Logger.debug(Logger.CATEGORIES.UI, 'guardar paso', `Paso ${stepNumber}: Datos preparados para enviar`, {
            context: {
              preparedFields: Object.keys(preparedData),
              validImagesCount: validImages?.length,
              validImagesTypes: imageTypes,
              allAreURLs,
              hasNewFiles,
              validImagesSample: validImages?.slice(0, 2)
            }
          })
        }

        // Determinar si necesitamos reemplazar imágenes
        // - Si hay Files nuevos: enviar con replaceImages=true para reemplazar todo
        // - Si todas son URLs: NO enviar imágenes (significa que no hubo cambios reales)
        const shouldReplaceImages = hasNewFiles && hasImageChanges
        const finalImagesToSend = hasNewFiles ? validImages : null

        if (ENABLE_STEP_SAVE_DEBUG) {
          Logger.debug(Logger.CATEGORIES.UI, 'guardar paso', `Paso ${stepNumber}: Estrategia de carga`, {
            context: {
              shouldReplaceImages,
              finalImagesToSendCount: finalImagesToSend?.length ?? 0,
              hasNewFiles,
              allAreURLs,
              hasImageChanges
            }
          })
        }

        if (allAreURLs && hasImageChanges) {
          Logger.warn(
            Logger.CATEGORIES.UI,
            'guardar paso',
            `Paso ${stepNumber}: Se detectaron cambios con solo URLs (posible eliminación de imágenes)`,
            {
              context: {
                userImagesCount,
                formImagesCount
              }
            }
          )
        }

        // Guardar en el backend
        const result = await resolveSaveHandler(
          preparedData,
          finalImagesToSend && finalImagesToSend.length > 0 ? finalImagesToSend : null,
          shouldReplaceImages
        )

        return {
          success: result?.success ?? true,
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
    [targetUser, resolveSaveHandler]
  )

  return {
    saveStepData,
    submitting,
    targetUser
  }
}
