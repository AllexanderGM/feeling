import { useCallback, useMemo, useState } from 'react'
import { configurationService } from '@services'
import { Logger } from '@utils/logger.js'
import { useAsyncOperation } from '@hooks'

const SECTION_DEFINITIONS = {
  basic: {
    stateKey: 'basicConfig',
    fetchAction: 'obtener configuración básica',
    updateAction: 'actualizar configuración básica',
    fetchService: () => configurationService.getBasicConfiguration(),
    updateService: payload => configurationService.updateBasicConfiguration(payload),
    fetchSuccessMessage: 'Configuración básica cargada correctamente.',
    updateSuccessMessage: 'Configuración básica actualizada exitosamente.'
  },
  social: {
    stateKey: 'socialMediaConfig',
    fetchAction: 'obtener configuración redes sociales',
    updateAction: 'actualizar configuración redes sociales',
    fetchService: () => configurationService.getSocialMediaConfiguration(),
    updateService: payload => configurationService.updateSocialMediaConfiguration(payload),
    fetchSuccessMessage: 'Configuración de redes sociales cargada.',
    updateSuccessMessage: 'Configuración de redes sociales actualizada.'
  },
  email: {
    stateKey: 'emailConfig',
    fetchAction: 'obtener configuración email',
    updateAction: 'actualizar configuración email',
    fetchService: () => configurationService.getEmailConfiguration(),
    updateService: payload => configurationService.updateEmailConfiguration(payload),
    fetchSuccessMessage: 'Configuración de email cargada.',
    updateSuccessMessage: 'Configuración de email actualizada.'
  },
  matching: {
    stateKey: 'matchingConfig',
    fetchAction: 'obtener configuración matching',
    updateAction: 'actualizar configuración matching',
    fetchService: () => configurationService.getMatchingConfiguration(),
    updateService: payload => configurationService.updateMatchingConfiguration(payload),
    fetchSuccessMessage: 'Configuración de matching cargada.',
    updateSuccessMessage: 'Configuración de matching actualizada.'
  },
  event: {
    stateKey: 'eventConfig',
    fetchAction: 'obtener configuración eventos',
    updateAction: 'actualizar configuración eventos',
    fetchService: () => configurationService.getEventConfiguration(),
    updateService: payload => configurationService.updateEventConfiguration(payload),
    fetchSuccessMessage: 'Configuración de eventos cargada.',
    updateSuccessMessage: 'Configuración de eventos actualizada.'
  },
  notification: {
    stateKey: 'notificationConfig',
    fetchAction: 'obtener configuración notificaciones',
    updateAction: 'actualizar configuración notificaciones',
    fetchService: () => configurationService.getNotificationConfiguration(),
    updateService: payload => configurationService.updateNotificationConfiguration(payload),
    fetchSuccessMessage: 'Configuración de notificaciones cargada.',
    updateSuccessMessage: 'Configuración de notificaciones actualizada.'
  },
  system: {
    stateKey: 'systemConfig',
    fetchAction: 'obtener configuración sistema',
    updateAction: 'actualizar configuración sistema',
    fetchService: () => configurationService.getSystemConfiguration(),
    updateService: payload => configurationService.updateSystemConfiguration(payload),
    fetchSuccessMessage: 'Configuración del sistema cargada.',
    updateSuccessMessage: 'Configuración del sistema actualizada.'
  }
}

const CONFIG_SECTION_KEYS = Object.keys(SECTION_DEFINITIONS)

const buildInitialState = () =>
  CONFIG_SECTION_KEYS.reduce(
    (acc, section) => {
      acc.data[section] = null
      acc.errors[section] = null
      acc.updatedAt[section] = null

      return acc
    },
    { data: {}, errors: {}, updatedAt: {} }
  )

const normalizeOptions = option =>
  typeof option === 'boolean'
    ? {
        showNotifications: option
      }
    : option || {}

const ensureSectionDefinition = section => {
  const definition = SECTION_DEFINITIONS[section]

  if (!definition) {
    const error = new Error(`Sección de configuración desconocida: ${section}`)

    Logger.error(Logger.CATEGORIES.SYSTEM, 'configuration_section_not_found', error.message, { section })
    throw error
  }

  return definition
}

const useConfiguration = () => {
  const { loading, submitting, withLoading, withSubmitting, handleApiResponse, handleSuccess } = useAsyncOperation()

  const [{ data, errors, updatedAt }, setConfigState] = useState(buildInitialState)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceError, setMaintenanceError] = useState(null)
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const setSectionData = useCallback((section, config) => {
    setConfigState(prev => ({
      data: {
        ...prev.data,
        [section]: config
      },
      errors: {
        ...prev.errors,
        [section]: null
      },
      updatedAt: {
        ...prev.updatedAt,
        [section]: new Date()
      }
    }))
  }, [])

  const setSectionError = useCallback((section, message) => {
    setConfigState(prev => ({
      data: prev.data,
      updatedAt: prev.updatedAt,
      errors: {
        ...prev.errors,
        [section]: message
      }
    }))
  }, [])

  const fetchSection = useCallback(
    async (section, options) => {
      const normalized = normalizeOptions(options)
      const { showNotifications = false } = normalized
      const definition = ensureSectionDefinition(section)
      const { fetchAction, fetchService, fetchSuccessMessage } = definition

      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, fetchAction, 'Iniciando carga')
        const config = await fetchService()

        setSectionData(section, config)
        Logger.debug(Logger.CATEGORIES.SYSTEM, fetchAction, config)

        return config
      }, fetchAction)

      if (!result.success) {
        setSectionError(section, result.message || 'No se pudo cargar la configuración.')
      }

      if (showNotifications) {
        return handleApiResponse(result, fetchSuccessMessage, { showNotifications: true })
      }

      return result
    },
    [handleApiResponse, setSectionData, setSectionError, withLoading]
  )

  const updateSection = useCallback(
    async (section, payload, options) => {
      const normalized = normalizeOptions(options)
      const { showNotifications = true, successMessage } = normalized
      const definition = ensureSectionDefinition(section)
      const { updateAction, updateService, updateSuccessMessage } = definition

      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, updateAction, 'Iniciando actualización')
        const updatedConfig = await updateService(payload)

        setSectionData(section, updatedConfig)
        Logger.info(Logger.CATEGORIES.SYSTEM, updateAction, 'Configuración actualizada exitosamente')

        return updatedConfig
      }, updateAction)

      if (!result.success) {
        setSectionError(section, result.message || 'No se pudo actualizar la configuración.')
      }

      return handleApiResponse(result, successMessage || updateSuccessMessage, {
        showNotifications
      })
    },
    [handleApiResponse, setSectionData, setSectionError, withSubmitting]
  )

  const loadConfigurations = useCallback(
    async (options = {}) => {
      const { sections = CONFIG_SECTION_KEYS, notifyOnSuccess = false } = options

      setInitializing(true)

      try {
        const results = []

        for (const section of sections) {
          const result = await fetchSection(section, { showNotifications: false })

          results.push({ section, result })
        }

        const everySuccess = results.every(item => item.result.success)

        if (everySuccess) {
          setInitialized(true)

          if (notifyOnSuccess) {
            handleSuccess('Configuraciones cargadas correctamente.')
          }
        }

        return results
      } finally {
        setInitializing(false)
      }
    },
    [fetchSection, handleSuccess]
  )

  const sendMassEmail = useCallback(
    async (emailData, options) => {
      const { showNotifications = true } = normalizeOptions(options)

      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'enviar email masivo', 'Iniciando envío masivo')
        const response = await configurationService.sendMassEmail(emailData)

        Logger.info(Logger.CATEGORIES.SYSTEM, 'enviar email masivo', 'Email masivo enviado exitosamente')

        return response
      }, 'enviar email masivo')

      return handleApiResponse(result, 'Email masivo enviado exitosamente.', { showNotifications })
    },
    [handleApiResponse, withSubmitting]
  )

  const fetchMaintenanceMode = useCallback(
    async options => {
      const { showNotifications = false } = normalizeOptions(options)

      const result = await withLoading(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'obtener modo mantenimiento', 'Iniciando consulta')
        const response = await configurationService.getMaintenanceMode()

        setMaintenanceMode(response.enabled || false)
        setMaintenanceError(null)
        Logger.debug(Logger.CATEGORIES.SYSTEM, 'obtener modo mantenimiento', response)

        return response
      }, 'obtener estado de mantenimiento')

      if (!result.success) {
        setMaintenanceError(result.message || 'No se pudo cargar el modo mantenimiento.')
      }

      if (showNotifications) {
        return handleApiResponse(result, 'Estado de mantenimiento cargado.', { showNotifications: true })
      }

      return result
    },
    [handleApiResponse, withLoading]
  )

  const toggleMaintenanceMode = useCallback(
    async (enabled, options) => {
      const { showNotifications = true } = normalizeOptions(options)

      const result = await withSubmitting(async () => {
        const actionLabel = enabled ? 'Activando' : 'Desactivando'

        Logger.info(Logger.CATEGORIES.SYSTEM, 'cambiar modo mantenimiento', `${actionLabel} modo de mantenimiento`)
        const response = await configurationService.toggleMaintenanceMode(enabled)

        setMaintenanceMode(enabled)
        setMaintenanceError(null)
        Logger.info(
          Logger.CATEGORIES.SYSTEM,
          'cambiar modo mantenimiento',
          `Modo de mantenimiento ${enabled ? 'activado' : 'desactivado'} exitosamente`
        )

        return response
      }, 'cambiar modo de mantenimiento')

      if (!result.success) {
        setMaintenanceError(result.message || 'No se pudo actualizar el modo mantenimiento.')
      }

      return handleApiResponse(result, `Modo de mantenimiento ${enabled ? 'activado' : 'desactivado'} exitosamente.`, {
        showNotifications
      })
    },
    [handleApiResponse, withSubmitting]
  )

  const createSystemBackup = useCallback(
    async options => {
      const { showNotifications = true } = normalizeOptions(options)

      const result = await withSubmitting(async () => {
        Logger.info(Logger.CATEGORIES.SYSTEM, 'crear backup', 'Iniciando creación de backup')
        const response = await configurationService.createSystemBackup()

        Logger.info(Logger.CATEGORIES.SYSTEM, 'crear backup', 'Backup creado exitosamente')

        return response
      }, 'crear backup del sistema')

      return handleApiResponse(result, 'Backup del sistema creado exitosamente.', { showNotifications })
    },
    [handleApiResponse, withSubmitting]
  )

  const getSectionData = useCallback(section => data[section] ?? null, [data])
  const getSectionError = useCallback(section => errors[section] ?? null, [errors])
  const getSectionUpdatedAt = useCallback(section => updatedAt[section] ?? null, [updatedAt])

  const fetchers = useMemo(
    () => ({
      fetchBasicConfiguration: options => fetchSection('basic', options),
      fetchSocialMediaConfiguration: options => fetchSection('social', options),
      fetchEmailConfiguration: options => fetchSection('email', options),
      fetchMatchingConfiguration: options => fetchSection('matching', options),
      fetchEventConfiguration: options => fetchSection('event', options),
      fetchNotificationConfiguration: options => fetchSection('notification', options),
      fetchSystemConfiguration: options => fetchSection('system', options)
    }),
    [fetchSection]
  )

  const updaters = useMemo(
    () => ({
      updateBasicConfiguration: (payload, options) => updateSection('basic', payload, options),
      updateSocialMediaConfiguration: (payload, options) => updateSection('social', payload, options),
      updateEmailConfiguration: (payload, options) => updateSection('email', payload, options),
      updateMatchingConfiguration: (payload, options) => updateSection('matching', payload, options),
      updateEventConfiguration: (payload, options) => updateSection('event', payload, options),
      updateNotificationConfiguration: (payload, options) => updateSection('notification', payload, options),
      updateSystemConfiguration: (payload, options) => updateSection('system', payload, options)
    }),
    [updateSection]
  )

  return {
    // Estados generales
    loading,
    submitting,
    initializing,
    initialized,

    // Estados por sección
    basicConfig: data.basic,
    socialMediaConfig: data.social,
    emailConfig: data.email,
    matchingConfig: data.matching,
    eventConfig: data.event,
    notificationConfig: data.notification,
    systemConfig: data.system,

    // Errores y metadatos
    sectionErrors: errors,
    sectionUpdatedAt: updatedAt,
    getSectionData,
    getSectionError,
    getSectionUpdatedAt,

    // Carga masiva
    loadConfigurations,

    // Fetchers
    ...fetchers,

    // Updaters
    ...updaters,

    // Operaciones complementarias
    sendMassEmail,
    maintenanceMode,
    maintenanceError,
    fetchMaintenanceMode,
    toggleMaintenanceMode,
    createSystemBackup
  }
}

export default useConfiguration
