import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Divider,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import { Database, Save, Wrench, HardDrive, Zap, Shield, AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { useConfiguration } from '@hooks'
import { Logger } from '@utils/logger.js'

const SystemConfiguration = ({ config, maintenanceMode, loading }) => {
  const { updateSystemConfiguration, toggleMaintenanceMode, createSystemBackup } = useConfiguration()

  const [formData, setFormData] = useState({
    systemName: 'Feeling Platform',
    version: '1.0.0',
    environment: 'production',
    debugMode: false,
    enableLogging: true,
    logLevel: 'info',
    maxConcurrentUsers: 1000,
    sessionTimeout: 30,
    enableCaching: true,
    cacheTimeout: 3600,
    enableRateLimit: true,
    rateLimitPerMinute: 60,
    enableSecurityHeaders: true,
    enableCORS: true,
    allowedOrigins: 'https://feeling.com',
    enableBackupSchedule: true,
    backupFrequency: 'daily',
    retentionDays: 30
  })

  const [saving, setSaving] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [systemStats] = useState({
    uptime: '15 días 4 horas',
    totalUsers: 1234,
    activeUsers: 89,
    dbSize: '2.4 GB',
    memoryUsage: 68,
    cpuUsage: 24,
    diskUsage: 45
  })

  useEffect(() => {
    if (config) {
      setFormData({
        systemName: config.systemName || 'Feeling Platform',
        version: config.version || '1.0.0',
        environment: config.environment || 'production',
        debugMode: config.debugMode || false,
        enableLogging: config.enableLogging !== false,
        logLevel: config.logLevel || 'info',
        maxConcurrentUsers: config.maxConcurrentUsers || 1000,
        sessionTimeout: config.sessionTimeout || 30,
        enableCaching: config.enableCaching !== false,
        cacheTimeout: config.cacheTimeout || 3600,
        enableRateLimit: config.enableRateLimit !== false,
        rateLimitPerMinute: config.rateLimitPerMinute || 60,
        enableSecurityHeaders: config.enableSecurityHeaders !== false,
        enableCORS: config.enableCORS !== false,
        allowedOrigins: config.allowedOrigins || 'https://feeling.com',
        enableBackupSchedule: config.enableBackupSchedule !== false,
        backupFrequency: config.backupFrequency || 'daily',
        retentionDays: config.retentionDays || 30
      })
    }
  }, [config])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await updateSystemConfiguration(formData)
    } catch (error) {
      Logger.error('Error guardando configuración del sistema:', error, { category: Logger.CATEGORIES.SYSTEM })
    } finally {
      setSaving(false)
    }
  }

  const handleMaintenanceToggle = async () => {
    try {
      await toggleMaintenanceMode(!maintenanceMode)
      setShowMaintenanceModal(false)
    } catch (error) {
      Logger.error('Error cambiando modo de mantenimiento:', error, { category: Logger.CATEGORIES.SYSTEM })
    }
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    try {
      await createSystemBackup()
    } catch (error) {
      Logger.error('Error creando backup:', error, { category: Logger.CATEGORIES.SYSTEM })
    } finally {
      setCreatingBackup(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className='space-y-6'>
      {/* Estado del sistema */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
            <Zap className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Estado del Sistema</p>
            <p className='text-small text-gray-400'>Información en tiempo real</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-2 mb-2'>
                <Zap className='w-4 h-4 text-green-400' />
                <span className='text-sm font-medium text-gray-200'>Uptime</span>
              </div>
              <p className='text-lg font-bold text-green-400'>{systemStats.uptime}</p>
            </div>

            <div className='p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-2 mb-2'>
                <Database className='w-4 h-4 text-blue-400' />
                <span className='text-sm font-medium text-gray-200'>Base de Datos</span>
              </div>
              <p className='text-lg font-bold text-blue-400'>{systemStats.dbSize}</p>
            </div>

            <div className='p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm font-medium text-gray-200'>Usuarios Activos</span>
              </div>
              <p className='text-lg font-bold text-purple-400'>
                {systemStats.activeUsers}/{systemStats.totalUsers}
              </p>
            </div>

            <div className='p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
              <div className='flex items-center gap-2 mb-2'>
                <Wrench className='w-4 h-4 text-orange-400' />
                <span className='text-sm font-medium text-gray-200'>Mantenimiento</span>
              </div>
              <Chip size='sm' variant='flat' color={maintenanceMode ? 'danger' : 'success'}>
                {maintenanceMode ? 'Activo' : 'Inactivo'}
              </Chip>
            </div>
          </div>

          {/* Métricas del sistema */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Uso de CPU</span>
                <span className='text-sm text-gray-400'>{systemStats.cpuUsage}%</span>
              </div>
              <Progress
                value={systemStats.cpuUsage}
                color={systemStats.cpuUsage > 80 ? 'danger' : systemStats.cpuUsage > 60 ? 'warning' : 'success'}
                size='sm'
                classNames={{
                  base: 'max-w-md',
                  track: 'bg-gray-700'
                }}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Uso de Memoria</span>
                <span className='text-sm text-gray-400'>{systemStats.memoryUsage}%</span>
              </div>
              <Progress
                value={systemStats.memoryUsage}
                color={systemStats.memoryUsage > 80 ? 'danger' : systemStats.memoryUsage > 60 ? 'warning' : 'success'}
                size='sm'
                classNames={{
                  base: 'max-w-md',
                  track: 'bg-gray-700'
                }}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Uso de Disco</span>
                <span className='text-sm text-gray-400'>{systemStats.diskUsage}%</span>
              </div>
              <Progress
                value={systemStats.diskUsage}
                color={systemStats.diskUsage > 80 ? 'danger' : systemStats.diskUsage > 60 ? 'warning' : 'success'}
                size='sm'
                classNames={{
                  base: 'max-w-md',
                  track: 'bg-gray-700'
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Configuración del sistema */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Database className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración General</p>
            <p className='text-small text-gray-400'>Parámetros del sistema</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              label='Nombre del Sistema'
              value={formData.systemName}
              onChange={e => handleInputChange('systemName', e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Versión'
              value={formData.version}
              onChange={e => handleInputChange('version', e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              label='Entorno'
              value={formData.environment}
              onChange={e => handleInputChange('environment', e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              type='number'
              label='Usuarios Concurrentes Máximos'
              value={formData.maxConcurrentUsers.toString()}
              onChange={e => handleInputChange('maxConcurrentUsers', parseInt(e.target.value) || 0)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />

            <Input
              type='number'
              label='Timeout de Sesión (minutos)'
              value={formData.sessionTimeout.toString()}
              onChange={e => handleInputChange('sessionTimeout', parseInt(e.target.value) || 0)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Configuración de seguridad */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center'>
            <Shield className='w-5 h-5 text-red-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Configuración de Seguridad</p>
            <p className='text-small text-gray-400'>Protecciones y límites</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableRateLimit}
                    onValueChange={value => handleInputChange('enableRateLimit', value)}
                    color='primary'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Rate Limiting</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableRateLimit ? 'primary' : 'default'}>
                  {formData.enableRateLimit ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableSecurityHeaders}
                    onValueChange={value => handleInputChange('enableSecurityHeaders', value)}
                    color='success'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Security Headers</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableSecurityHeaders ? 'success' : 'default'}>
                  {formData.enableSecurityHeaders ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.enableCORS}
                    onValueChange={value => handleInputChange('enableCORS', value)}
                    color='warning'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>CORS</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.enableCORS ? 'warning' : 'default'}>
                  {formData.enableCORS ? 'ON' : 'OFF'}
                </Chip>
              </div>

              <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                <div className='flex items-center gap-2'>
                  <Switch
                    isSelected={formData.debugMode}
                    onValueChange={value => handleInputChange('debugMode', value)}
                    color='danger'
                    size='sm'
                  />
                  <span className='text-sm font-medium text-gray-200'>Debug Mode</span>
                </div>
                <Chip size='sm' variant='flat' color={formData.debugMode ? 'danger' : 'default'}>
                  {formData.debugMode ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mantenimiento y backups */}
      <Card className='bg-gradient-to-br from-orange-900/20 via-orange-800/10 to-red-900/20 border-orange-700/50'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
            <Wrench className='w-5 h-5 text-orange-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-orange-200'>Mantenimiento y Backups</p>
            <p className='text-small text-orange-300/80'>Operaciones críticas del sistema</p>
          </div>
        </CardHeader>
        <Divider className='bg-orange-700/50' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-orange-900/10 border border-orange-700/30 rounded-lg'>
              <h4 className='font-medium text-orange-300 mb-2'>Modo de Mantenimiento</h4>
              <p className='text-sm text-orange-200/80 mb-4'>Desactiva temporalmente el acceso de usuarios al sistema</p>
              <Button
                color={maintenanceMode ? 'success' : 'danger'}
                onPress={() => setShowMaintenanceModal(true)}
                startContent={<Wrench className='w-4 h-4' />}>
                {maintenanceMode ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento'}
              </Button>
            </div>

            <div className='p-4 bg-orange-900/10 border border-orange-700/30 rounded-lg'>
              <h4 className='font-medium text-orange-300 mb-2'>Backup del Sistema</h4>
              <p className='text-sm text-orange-200/80 mb-4'>Crear una copia de seguridad completa del sistema</p>
              <Button
                color='warning'
                onPress={handleCreateBackup}
                isLoading={creatingBackup}
                startContent={!creatingBackup && <Download className='w-4 h-4' />}>
                Crear Backup
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Botón de guardar */}
      <div className='flex justify-end'>
        <Button
          color='primary'
          onPress={handleSubmit}
          isLoading={saving || loading}
          startContent={!saving && !loading && <Save className='w-3 h-3' />}
          size='sm'>
          Guardar
        </Button>
      </div>

      {/* Modal de confirmación de mantenimiento */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        placement='center'
        classNames={{
          base: 'bg-gray-800 border border-gray-700',
          closeButton: 'text-gray-400 hover:text-gray-200'
        }}>
        <ModalContent>
          <ModalHeader className='text-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center'>
                <AlertTriangle className='w-5 h-5 text-orange-400' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>{maintenanceMode ? 'Desactivar' : 'Activar'} Modo de Mantenimiento</h2>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className='space-y-4'>
              <div className='p-4 bg-orange-900/20 rounded-lg border border-orange-700/50'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-orange-300'>Advertencia</p>
                    <p className='text-xs text-orange-200/80'>
                      {maintenanceMode
                        ? 'Al desactivar el modo de mantenimiento, los usuarios podrán acceder nuevamente al sistema.'
                        : 'Al activar el modo de mantenimiento, todos los usuarios serán desconectados y no podrán acceder al sistema.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant='bordered' onPress={() => setShowMaintenanceModal(false)} className='border-gray-600 text-gray-300'>
              Cancelar
            </Button>
            <Button
              color={maintenanceMode ? 'success' : 'danger'}
              onPress={handleMaintenanceToggle}
              startContent={<Wrench className='w-4 h-4' />}>
              {maintenanceMode ? 'Desactivar' : 'Activar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default SystemConfiguration
