import { useState } from 'react'
import { Card, CardBody, CardHeader, Input, Divider, Chip, Progress, Button, Switch } from '@heroui/react'
import { Database, Zap, Shield, Wrench, Lock, Info } from 'lucide-react'

const SystemConfiguration = () => {
  const [formData] = useState({
    systemName: 'Feeling Platform',
    version: '1.0.0',
    environment: 'production'
  })

  // Datos de ejemplo para el preview con blur
  const systemStats = {
    uptime: '15 días 4 horas',
    totalUsers: 1234,
    activeUsers: 89,
    dbSize: '2.4 GB',
    memoryUsage: 68,
    cpuUsage: 24,
    diskUsage: 45
  }

  return (
    <div className='space-y-6'>
      {/* Información de la plataforma - DISPONIBLE */}
      <Card className='bg-gray-800/50 border-gray-700'>
        <CardHeader className='flex gap-3'>
          <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
            <Info className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex flex-col'>
            <p className='text-md font-medium text-gray-200'>Información de la Plataforma</p>
            <p className='text-small text-gray-400'>Datos generales del sistema</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700' />
        <CardBody className='gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              isReadOnly
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Nombre del Sistema'
              value={formData.systemName}
            />

            <Input
              isReadOnly
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Versión'
              value={formData.version}
            />

            <Input
              isReadOnly
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 border-gray-600 data-[hover=true]:border-gray-500'
              }}
              label='Entorno'
              value={formData.environment}
            />
          </div>
        </CardBody>
      </Card>

      {/* SECCIONES CON BLUR - PRÓXIMAMENTE */}
      <div className='relative'>
        {/* Overlay de "Próximamente" */}
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <div className='bg-gray-900/95 backdrop-blur-sm border-2 border-primary/50 rounded-2xl p-8 shadow-2xl max-w-md mx-auto'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center'>
                <Lock className='w-8 h-8 text-primary' />
              </div>
              <div>
                <h3 className='text-2xl font-bold text-gray-100 mb-2'>Próximamente</h3>
                <p className='text-gray-400'>
                  Las configuraciones avanzadas del sistema estarán disponibles en próximas versiones de la plataforma.
                </p>
              </div>
              <Chip color='primary' size='lg' variant='flat'>
                En desarrollo
              </Chip>
            </div>
          </div>
        </div>

        {/* Contenido con blur */}
        <div className='blur-sm pointer-events-none select-none space-y-6'>
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
                  <Chip color='success' size='sm' variant='flat'>
                    Inactivo
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
                    aria-label='Uso de CPU'
                    classNames={{
                      base: 'max-w-md',
                      track: 'bg-gray-700'
                    }}
                    color='success'
                    size='sm'
                    value={systemStats.cpuUsage}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-300'>Uso de Memoria</span>
                    <span className='text-sm text-gray-400'>{systemStats.memoryUsage}%</span>
                  </div>
                  <Progress
                    aria-label='Uso de Memoria'
                    classNames={{
                      base: 'max-w-md',
                      track: 'bg-gray-700'
                    }}
                    color='warning'
                    size='sm'
                    value={systemStats.memoryUsage}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-300'>Uso de Disco</span>
                    <span className='text-sm text-gray-400'>{systemStats.diskUsage}%</span>
                  </div>
                  <Progress
                    aria-label='Uso de Disco'
                    classNames={{
                      base: 'max-w-md',
                      track: 'bg-gray-700'
                    }}
                    color='success'
                    size='sm'
                    value={systemStats.diskUsage}
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
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input label='Usuarios Concurrentes Máximos' type='number' value='1000' />
                <Input label='Timeout de Sesión (minutos)' type='number' value='30' />
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
                      <Switch isSelected color='primary' size='sm' />
                      <span className='text-sm font-medium text-gray-200'>Rate Limiting</span>
                    </div>
                    <Chip color='primary' size='sm' variant='flat'>
                      ON
                    </Chip>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                    <div className='flex items-center gap-2'>
                      <Switch isSelected color='success' size='sm' />
                      <span className='text-sm font-medium text-gray-200'>Security Headers</span>
                    </div>
                    <Chip color='success' size='sm' variant='flat'>
                      ON
                    </Chip>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                    <div className='flex items-center gap-2'>
                      <Switch isSelected color='warning' size='sm' />
                      <span className='text-sm font-medium text-gray-200'>CORS</span>
                    </div>
                    <Chip color='warning' size='sm' variant='flat'>
                      ON
                    </Chip>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/50'>
                    <div className='flex items-center gap-2'>
                      <Switch color='danger' size='sm' />
                      <span className='text-sm font-medium text-gray-200'>Debug Mode</span>
                    </div>
                    <Chip color='default' size='sm' variant='flat'>
                      OFF
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
                  <Button color='danger' startContent={<Wrench className='w-4 h-4' />}>
                    Activar Mantenimiento
                  </Button>
                </div>

                <div className='p-4 bg-orange-900/10 border border-orange-700/30 rounded-lg'>
                  <h4 className='font-medium text-orange-300 mb-2'>Backup del Sistema</h4>
                  <p className='text-sm text-orange-200/80 mb-4'>Crear una copia de seguridad completa del sistema</p>
                  <Button color='warning' startContent={<Database className='w-4 h-4' />}>
                    Crear Backup
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SystemConfiguration
