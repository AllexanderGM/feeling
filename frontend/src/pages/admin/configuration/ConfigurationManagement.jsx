import { useEffect, memo, Suspense } from 'react'
import { Card, CardBody } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Settings, Globe, Share2, Mail, Heart, Calendar, Bell, Database, Wrench } from 'lucide-react'
import { useAuth, useConfiguration } from '@hooks'
import LoadData from '@components/layout/LoadData.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { Logger } from '@utils/logger.js'

// Componentes importados pero no utilizados hasta que se implementen los endpoints

const ConfigurationManagement = memo(() => {
  const { user: currentUser } = useAuth()

  const { loading, submitting, maintenanceMode, fetchMaintenanceMode } = useConfiguration()

  // Cargar estado de mantenimiento al montar el componente
  useEffect(() => {
    const loadMaintenanceState = async () => {
      try {
        await fetchMaintenanceMode()
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SYSTEM, 'load_maintenance_mode', 'Error cargando estado de mantenimiento', { error })
        // Fallar silenciosamente, el modo mantenimiento es opcional
      }
    }

    loadMaintenanceState()
  }, [fetchMaintenanceMode])

  // Estados de carga
  const isLoading = loading

  if (isLoading) return <LoadData>Cargando configuraciones...</LoadData>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de configuración del sistema'>
      <Helmet>
        <title>Configuración del Sistema | Admin</title>
        <meta name='description' content='Panel de configuración general del sistema y plataforma' />
      </Helmet>

      {/* Header */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Settings className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-200'>Configuración del Sistema</h1>
                <p className='text-sm text-gray-400'>Gestiona la configuración general de la plataforma</p>
              </div>
            </div>

            {/* Indicador de modo mantenimiento */}
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

      {/* Configuraciones Actuales - Implementadas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <Settings className='w-5 h-5 text-blue-400' />
            </div>
            <div className='text-center sm:text-left'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Configuraciones Actuales</h3>
              <p className='text-sm text-gray-400'>Configuraciones disponibles del sistema</p>
            </div>
          </div>

          {/* Configuración de Variables de Entorno */}
          <div className='space-y-4'>
            <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <Database className='w-5 h-5 text-green-400' />
                <h4 className='font-medium text-gray-200'>Variables de Entorno</h4>
              </div>
              <p className='text-sm text-gray-400 mb-4'>
                Estas configuraciones se gestionan a través de variables de entorno y archivos de propiedades.
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Puerto del Servidor:</span>
                  <span className='text-blue-300 font-mono'>Variable: PORT_BACK</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>URL Frontend:</span>
                  <span className='text-blue-300 font-mono'>Variable: URL_FRONT</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Base de Datos:</span>
                  <span className='text-green-300 font-mono'>MySQL/MariaDB</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Email SMTP:</span>
                  <span className='text-yellow-300 font-mono'>Gmail SMTP</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Almacenamiento:</span>
                  <span className='text-purple-300 font-mono'>MinIO/S3</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Pagos:</span>
                  <span className='text-orange-300 font-mono'>Stripe API</span>
                </div>
              </div>
            </div>

            {/* Configuración JPA y Hibernate */}
            <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <Database className='w-5 h-5 text-purple-400' />
                <h4 className='font-medium text-gray-200'>Base de Datos y JPA</h4>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Modo DDL:</span>
                  <span className='text-green-300 font-mono'>update</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Batch Size:</span>
                  <span className='text-blue-300 font-mono'>20</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Charset:</span>
                  <span className='text-yellow-300 font-mono'>UTF-8</span>
                </div>
                <div className='flex justify-between items-center py-2 px-3 bg-gray-700/30 rounded'>
                  <span className='text-gray-300'>Cache:</span>
                  <span className='text-green-300 font-mono'>Caffeine</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Configuraciones Futuras */}
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
            {/* Configuración Básica */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Globe className='w-6 h-6 text-blue-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración Básica</h4>
              <p className='text-xs text-gray-500 mb-3'>Nombre del sitio, descripción, logos y configuraciones generales</p>
              <span className='inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full'>En desarrollo</span>
            </div>

            {/* Redes Sociales */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Share2 className='w-6 h-6 text-purple-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Redes Sociales</h4>
              <p className='text-xs text-gray-500 mb-3'>Enlaces a perfiles de redes sociales y configuración de APIs</p>
              <span className='inline-block px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full'>Planificado</span>
            </div>

            {/* Email */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Mail className='w-6 h-6 text-green-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración de Email</h4>
              <p className='text-xs text-gray-500 mb-3'>Plantillas de email, configuración SMTP y mensajería masiva</p>
              <span className='inline-block px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full'>En desarrollo</span>
            </div>

            {/* Matching */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Heart className='w-6 h-6 text-pink-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Algoritmo de Matching</h4>
              <p className='text-xs text-gray-500 mb-3'>Parámetros del algoritmo de coincidencias y lógica de citas</p>
              <span className='inline-block px-2 py-1 bg-pink-500/10 text-pink-400 text-xs rounded-full'>Planificado</span>
            </div>

            {/* Eventos */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Calendar className='w-6 h-6 text-orange-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Configuración de Eventos</h4>
              <p className='text-xs text-gray-500 mb-3'>Configuraciones por defecto para eventos, categorías y validaciones</p>
              <span className='inline-block px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full'>Futuro</span>
            </div>

            {/* Notificaciones */}
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Bell className='w-6 h-6 text-yellow-400/60' />
              </div>
              <h4 className='font-medium text-gray-300 mb-2'>Sistema de Notificaciones</h4>
              <p className='text-xs text-gray-500 mb-3'>Configuración de notificaciones push, email y en la aplicación</p>
              <span className='inline-block px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full'>Futuro</span>
            </div>
          </div>

          <div className='mt-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Wrench className='w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-medium text-orange-300 mb-1'>Configuraciones en Desarrollo</h4>
                <p className='text-sm text-orange-200/80'>
                  Estas configuraciones estarán disponibles próximamente. Por ahora, las configuraciones del sistema se gestionan a través
                  de variables de entorno y archivos de propiedades.
                </p>
                <p className='text-xs text-orange-300 mt-2'>
                  <strong>Estado actual:</strong> Las configuraciones básicas funcionan correctamente a través del sistema de archivos de
                  configuración de Spring Boot.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
})

ConfigurationManagement.displayName = 'ConfigurationManagement'

export default ConfigurationManagement
