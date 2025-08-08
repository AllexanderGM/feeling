import { useCallback, useState } from 'react'
import { configurationService } from '@services'
import { Logger } from '@utils/logger.js'

import { useError } from '@hooks/utils/useError.js'
import { useAsyncOperation } from '@hooks/utils/useAsyncOperation.js'

const useConfiguration = () => {
  const { handleApiResponse } = useError()
  const { loading, submitting, withLoading, withSubmitting } = useAsyncOperation()

  // Estado para las diferentes configuraciones
  const [basicConfig, setBasicConfig] = useState(null)
  const [socialMediaConfig, setSocialMediaConfig] = useState(null)
  const [emailConfig, setEmailConfig] = useState(null)
  const [matchingConfig, setMatchingConfig] = useState(null)
  const [eventConfig, setEventConfig] = useState(null)
  const [notificationConfig, setNotificationConfig] = useState(null)
  const [systemConfig, setSystemConfig] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // ========================================
  // CONFIGURACIÓN BÁSICA DEL SITIO
  // ========================================

  const fetchBasicConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración básica', 'Iniciando carga')
        const config = await configurationService.getBasicConfiguration()
        setBasicConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración básica', config)
        return config
      }, 'obtener configuración básica')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración básica cargada correctamente.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateBasicConfiguration = useCallback(
    async (configData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración básica', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateBasicConfiguration(configData)
        setBasicConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración básica', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración básica')

      return handleApiResponse(result, 'Configuración básica actualizada exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // REDES SOCIALES
  // ========================================

  const fetchSocialMediaConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración redes sociales', 'Iniciando carga')
        const config = await configurationService.getSocialMediaConfiguration()
        setSocialMediaConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración redes sociales', config)
        return config
      }, 'obtener configuración de redes sociales')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración de redes sociales cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateSocialMediaConfiguration = useCallback(
    async (socialData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración redes sociales', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateSocialMediaConfiguration(socialData)
        setSocialMediaConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración redes sociales', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración de redes sociales')

      return handleApiResponse(result, 'Configuración de redes sociales actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // CONFIGURACIÓN DE EMAILS
  // ========================================

  const fetchEmailConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración email', 'Iniciando carga')
        const config = await configurationService.getEmailConfiguration()
        setEmailConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración email', config)
        return config
      }, 'obtener configuración de email')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración de email cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateEmailConfiguration = useCallback(
    async (emailData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración email', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateEmailConfiguration(emailData)
        setEmailConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración email', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración de email')

      return handleApiResponse(result, 'Configuración de email actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const sendMassEmail = useCallback(
    async (emailData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'enviar email masivo', 'Iniciando envío masivo')
        const response = await configurationService.sendMassEmail(emailData)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'enviar email masivo', 'Email masivo enviado exitosamente')
        return response
      }, 'enviar email masivo')

      return handleApiResponse(result, 'Email masivo enviado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // CONFIGURACIÓN DE MATCHING
  // ========================================

  const fetchMatchingConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración matching', 'Iniciando carga')
        const config = await configurationService.getMatchingConfiguration()
        setMatchingConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración matching', config)
        return config
      }, 'obtener configuración de matching')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración de matching cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateMatchingConfiguration = useCallback(
    async (matchingData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración matching', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateMatchingConfiguration(matchingData)
        setMatchingConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración matching', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración de matching')

      return handleApiResponse(result, 'Configuración de matching actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // CONFIGURACIÓN DE EVENTOS
  // ========================================

  const fetchEventConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración eventos', 'Iniciando carga')
        const config = await configurationService.getEventConfiguration()
        setEventConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración eventos', config)
        return config
      }, 'obtener configuración de eventos')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración de eventos cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateEventConfiguration = useCallback(
    async (eventData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración eventos', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateEventConfiguration(eventData)
        setEventConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración eventos', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración de eventos')

      return handleApiResponse(result, 'Configuración de eventos actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // ========================================

  const fetchNotificationConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración notificaciones', 'Iniciando carga')
        const config = await configurationService.getNotificationConfiguration()
        setNotificationConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración notificaciones', config)
        return config
      }, 'obtener configuración de notificaciones')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración de notificaciones cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateNotificationConfiguration = useCallback(
    async (notificationData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración notificaciones', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateNotificationConfiguration(notificationData)
        setNotificationConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración notificaciones', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración de notificaciones')

      return handleApiResponse(result, 'Configuración de notificaciones actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // CONFIGURACIÓN DEL SISTEMA
  // ========================================

  const fetchSystemConfiguration = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener configuración sistema', 'Iniciando carga')
        const config = await configurationService.getSystemConfiguration()
        setSystemConfig(config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener configuración sistema', config)
        return config
      }, 'obtener configuración del sistema')

      if (showNotifications) {
        return handleApiResponse(result, 'Configuración del sistema cargada.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const updateSystemConfiguration = useCallback(
    async (systemData, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración sistema', 'Iniciando actualización')
        const updatedConfig = await configurationService.updateSystemConfiguration(systemData)
        setSystemConfig(updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, 'actualizar configuración sistema', 'Configuración actualizada exitosamente')
        return updatedConfig
      }, 'actualizar configuración del sistema')

      return handleApiResponse(result, 'Configuración del sistema actualizada.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // MANTENIMIENTO Y BACKUP
  // ========================================

  const createSystemBackup = useCallback(
    async (showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'crear backup', 'Iniciando creación de backup')
        const response = await configurationService.createSystemBackup()
        Logger.info(Logger.CATEGORIES.SYSTEM, 'crear backup', 'Backup creado exitosamente')
        return response
      }, 'crear backup del sistema')

      return handleApiResponse(result, 'Backup del sistema creado exitosamente.', { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  const fetchMaintenanceMode = useCallback(
    async (showNotifications = false) => {
      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener modo mantenimiento', 'Iniciando consulta')
        const response = await configurationService.getMaintenanceMode()
        setMaintenanceMode(response.enabled || false)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener modo mantenimiento', response)
        return response
      }, 'obtener estado de mantenimiento')

      if (showNotifications) {
        return handleApiResponse(result, 'Estado de mantenimiento cargado.', { showNotifications: true })
      }
      return result
    },
    [withLoading, handleApiResponse]
  )

  const toggleMaintenanceMode = useCallback(
    async (enabled, showNotifications = true) => {
      const result = await withSubmitting(async () => {
        Logger.info(
          Logger.CATEGORIES.SYSTEM,
          'cambiar modo mantenimiento',
          `${enabled ? 'Activando' : 'Desactivando'} modo de mantenimiento`
        )
        const response = await configurationService.toggleMaintenanceMode(enabled)
        setMaintenanceMode(enabled)
        Logger.info(
          Logger.CATEGORIES.SYSTEM,
          'cambiar modo mantenimiento',
          `Modo de mantenimiento ${enabled ? 'activado' : 'desactivado'} exitosamente`
        )
        return response
      }, 'cambiar modo de mantenimiento')

      return handleApiResponse(result, `Modo de mantenimiento ${enabled ? 'activado' : 'desactivado'} exitosamente.`, { showNotifications })
    },
    [withSubmitting, handleApiResponse]
  )

  // ========================================
  // API PÚBLICA DEL HOOK
  // ========================================

  return {
    // Estados generales
    loading,
    submitting,

    // Configuración básica
    basicConfig,
    fetchBasicConfiguration,
    updateBasicConfiguration,

    // Redes sociales
    socialMediaConfig,
    fetchSocialMediaConfiguration,
    updateSocialMediaConfiguration,

    // Email
    emailConfig,
    fetchEmailConfiguration,
    updateEmailConfiguration,
    sendMassEmail,

    // Matching
    matchingConfig,
    fetchMatchingConfiguration,
    updateMatchingConfiguration,

    // Eventos
    eventConfig,
    fetchEventConfiguration,
    updateEventConfiguration,

    // Notificaciones
    notificationConfig,
    fetchNotificationConfiguration,
    updateNotificationConfiguration,

    // Sistema
    systemConfig,
    fetchSystemConfiguration,
    updateSystemConfiguration,

    // Mantenimiento
    maintenanceMode,
    fetchMaintenanceMode,
    toggleMaintenanceMode,
    createSystemBackup
  }
}

export default useConfiguration
