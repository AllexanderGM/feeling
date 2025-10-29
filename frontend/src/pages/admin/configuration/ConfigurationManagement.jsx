import { useCallback, useEffect, memo } from 'react'
import { Card, CardBody, Chip } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Settings, Globe, Share2, Mail, Heart, Calendar, Bell, Database, Wrench } from 'lucide-react'
import { useConfiguration } from '@hooks'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { Logger } from '@utils/logger.js'

import SystemConfiguration from './components/SystemConfiguration.jsx'

const ConfigurationManagement = memo(() => {
  const {
    loading,
    initializing,
    maintenanceMode,
    maintenanceError,
    loadConfigurations,
    fetchMaintenanceMode,
    getSectionData,
    getSectionError,
    getSectionUpdatedAt
  } = useConfiguration()

  const systemConfig = getSectionData('system')
  const systemConfigError = getSectionError('system')
  const systemConfigUpdatedAt = getSectionUpdatedAt('system')

  const isLoading = initializing || loading
  const hasSystemConfig = Boolean(systemConfig)
  const pageError = systemConfigError || maintenanceError

  useEffect(() => {
    const initialize = async () => {
      try {
        // TODO: Backend endpoints not implemented yet:
        // - GET /api/admin/configuration/system
        // - GET /api/admin/configuration/maintenance
        // Uncomment when backend is ready
        // await Promise.all([loadConfigurations({ sections: ['system'], notifyOnSuccess: false }), fetchMaintenanceMode()])
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, 'initialize_system_configuration', 'Error inicializando configuraciones del sistema', {
          error
        })
      }
    }

    initialize()
  }, [fetchMaintenanceMode, loadConfigurations])

  const handleRetry = useCallback(() => {
    // TODO: Uncomment when backend endpoints are implemented
    // loadConfigurations({ sections: ['system'], notifyOnSuccess: false })
    // fetchMaintenanceMode()
  }, [fetchMaintenanceMode, loadConfigurations])

  if (!isLoading && pageError && !hasSystemConfig) {
    return <LoadDataError message={pageError} retryAction={handleRetry} />
  }

  if (isLoading) {
    return <LoadData>Cargando configuraciones...</LoadData>
  }

  const concurrentLimit = systemConfig?.maxConcurrentUsers ? systemConfig.maxConcurrentUsers.toLocaleString() : '1.000'
  const cacheTimeout = systemConfig?.cacheTimeout ? `${systemConfig.cacheTimeout}s` : '1h'
  const sessionTimeout = systemConfig?.sessionTimeout ? `${systemConfig.sessionTimeout} min` : '30 min'

  return (
    <LiteContainer ariaLabel='Página de configuración del sistema' className='gap-4'>
      <Helmet>
        <title>Configuración del Sistema | Admin</title>
        <meta content='Panel de configuración general del sistema y plataforma' name='description' />
      </Helmet>

      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <Settings className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <h1 className='text-xl sm:text-2xl font-bold text-gray-200'>Configuración del Sistema</h1>
                  <p className='text-sm text-gray-400'>Gestiona la configuración general de la plataforma</p>
                </div>
              </div>
              <Chip color='primary' size='sm' variant='faded'>
                Última actualización:{' '}
                <span className='ml-1 font-semibold'>
                  {systemConfigUpdatedAt ? systemConfigUpdatedAt.toLocaleString() : 'Sin datos registrados'}
                </span>
              </Chip>
            </div>

            {maintenanceError && (
              <div className='bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-sm text-red-200'>
                No fue posible obtener el estado de mantenimiento: {maintenanceError}
              </div>
            )}

            {maintenanceMode && (
              <div className='bg-orange-900/20 border border-orange-700/50 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <Wrench className='w-5 h-5 text-orange-400' />
                  <div>
                    <h3 className='font-medium text-orange-300'>Modo de Mantenimiento Activo</h3>
                    <p className='text-sm text-orange-200/80'>
                      La plataforma está en modo de mantenimiento. Los usuarios no pueden acceder al sistema.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                  <Database className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <h2 className='text-base sm:text-lg font-semibold text-gray-200'>Resumen operativo</h2>
                  <p className='text-sm text-gray-400'>Valores activos según la API de configuración</p>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Nombre del sistema</p>
                <p className='text-base font-semibold text-gray-100'>{systemConfig?.systemName || 'Feeling Platform'}</p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Versión</p>
                <p className='text-base font-semibold text-gray-100'>{systemConfig?.version || '1.0.0'}</p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Entorno</p>
                <p className='text-base font-semibold text-gray-100 capitalize'>{systemConfig?.environment || 'producción'}</p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Logging</p>
                <p className='text-base font-semibold text-gray-100'>
                  {systemConfig?.enableLogging === false ? 'Deshabilitado' : `Activo (${systemConfig?.logLevel || 'info'})`}
                </p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Usuarios concurrentes máximos</p>
                <p className='text-base font-semibold text-gray-100'>{concurrentLimit}</p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Tiempo de sesión</p>
                <p className='text-base font-semibold text-gray-100'>{sessionTimeout}</p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Caché</p>
                <p className='text-base font-semibold text-gray-100'>
                  {systemConfig?.enableCaching === false ? 'Deshabilitada' : `Activa (${cacheTimeout})`}
                </p>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 space-y-1'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Rate limit</p>
                <p className='text-base font-semibold text-gray-100'>
                  {systemConfig?.enableRateLimit === false ? 'Sin límite' : `${systemConfig?.rateLimitPerMinute || 60} req/min`}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <SystemConfiguration />

      <Card className='w-full bg-gray-800/30 border-gray-700/40'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center'>
              <Wrench className='w-5 h-5 text-orange-400' />
            </div>
            <div className='text-center sm:text-left'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Próximamente</h3>
              <p className='text-sm text-gray-400'>Configuraciones que estarán disponibles en futuras versiones</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Globe className='w-6 h-6 text-blue-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración Básica</h4>
              <p className='text-xs text-gray-500 mb-3'>Nombre del sitio, descripción, logos y configuraciones generales</p>
              <span className='inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full'>En desarrollo</span>
            </div>

            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Share2 className='w-6 h-6 text-purple-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Redes Sociales</h4>
              <p className='text-xs text-gray-500 mb-3'>Enlaces a perfiles de redes sociales y configuración de APIs</p>
              <span className='inline-block px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full'>Planificado</span>
            </div>

            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Mail className='w-6 h-6 text-green-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración de Email</h4>
              <p className='text-xs text-gray-500 mb-3'>Plantillas, SMTP y mensajería masiva para equipos de soporte</p>
              <span className='inline-block px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full'>En desarrollo</span>
            </div>

            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Heart className='w-6 h-6 text-pink-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Algoritmo de Matching</h4>
              <p className='text-xs text-gray-500 mb-3'>Parámetros de coincidencia y ponderación de perfiles</p>
              <span className='inline-block px-2 py-1 bg-pink-500/10 text-pink-400 text-xs rounded-full'>Planificado</span>
            </div>

            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Calendar className='w-6 h-6 text-orange-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración de Eventos</h4>
              <p className='text-xs text-gray-500 mb-3'>Automatizaciones para categorías, cupos y recordatorios</p>
              <span className='inline-block px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full'>Futuro</span>
            </div>

            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Bell className='w-6 h-6 text-yellow-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Sistema de Notificaciones</h4>
              <p className='text-xs text-gray-500 mb-3'>Configuración de notificaciones push, email y en-app</p>
              <span className='inline-block px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full'>Futuro</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
})

ConfigurationManagement.displayName = 'ConfigurationManagement'

export default ConfigurationManagement
