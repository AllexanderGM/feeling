import { memo } from 'react'
import { Card, CardBody, Progress, Chip } from '@heroui/react'
import { Users, UserCheck, Shield, TrendingUp, BarChart3, CheckCircle, Clock, UserX, Activity, Database } from 'lucide-react'

const UserStatsCards = memo(({ userStats }) => {
  if (!userStats) return null

  // Usar datos reales de tabCounts (convertir a números para evitar problemas)
  const active = parseInt(userStats.active) || 0
  const pending = parseInt(userStats.pending) || 0
  const incomplete = parseInt(userStats.incomplete) || 0
  const unverified = parseInt(userStats.unverified) || 0
  const nonApproved = parseInt(userStats.nonApproved) || 0
  const deactivated = parseInt(userStats.deactivated) || 0
  // Calcular total siempre desde los conteos individuales para evitar inconsistencias
  const total = active + pending + incomplete + unverified + nonApproved + deactivated

  // Métricas calculadas
  const verifiedUsers = total - unverified
  const activationRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0
  const completionRate = total > 0 ? (((total - incomplete) / total) * 100).toFixed(1) : 0
  const verificationRate = total > 0 ? ((verifiedUsers / total) * 100).toFixed(1) : 0

  // Solo usuarios que REQUIEREN ACCIÓN INMEDIATA del administrador
  const needsAttentionCount = pending + nonApproved // Solo pendientes de aprobación + no aprobados

  // Usuarios que necesitan seguimiento (no acción inmediata)
  const needsFollowUpCount = incomplete + unverified + deactivated // Incompletos + sin verificar + desactivados

  const statsConfig = [
    {
      value: total,
      label: 'Total Registrados',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: Database,
      description: 'Usuarios totales en plataforma'
    },
    {
      value: `${activationRate}%`,
      label: 'Tasa de Activación',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: TrendingUp,
      description: 'Usuarios activos vs total'
    },
    {
      value: `${completionRate}%`,
      label: 'Perfiles Completos',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: CheckCircle,
      description: 'Usuarios con perfil completo'
    },
    {
      value: needsAttentionCount,
      label: 'Requieren Acción',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      icon: Activity,
      description: 'Decisiones administrativas pendientes'
    }
  ]

  return (
    <div className='space-y-4'>
      {/* Estadísticas básicas optimizadas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <Database className='w-4 h-4 text-blue-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Estadísticas Básicas</h3>
              <p className='text-xs text-gray-400'>Resumen rápido de usuarios</p>
            </div>
          </div>

          {/* Estadísticas principales compactas */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {statsConfig.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className='text-right'>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-200 mb-1'>{stat.label}</div>
                    <div className='text-xs text-gray-400'>{stat.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Métricas adicionales */}
          <div className='mt-6 pt-4 border-t border-gray-700/30'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {/* Usuarios que requieren acción inmediata */}
              <div className='text-center'>
                <div className='text-lg font-bold text-orange-400'>{needsAttentionCount}</div>
                <div className='text-xs text-gray-400'>Acción Inmediata</div>
                <div className='text-xs text-gray-500 mt-1'>
                  {pending} pendientes + {nonApproved} rechazados
                </div>
              </div>

              {/* Usuarios para seguimiento */}
              <div className='text-center'>
                <div className='text-lg font-bold text-blue-400'>{needsFollowUpCount}</div>
                <div className='text-xs text-gray-400'>Seguimiento</div>
                <div className='text-xs text-gray-500 mt-1'>
                  {incomplete} incompletos + {unverified} sin verificar + {deactivated} desactivados
                </div>
              </div>

              {/* Tasa de activación */}
              <div className='text-center'>
                <div className='text-lg font-bold text-green-400'>{activationRate}%</div>
                <div className='text-xs text-gray-400'>Activación</div>
                <Progress
                  value={parseFloat(activationRate)}
                  color='success'
                  className='mt-2 max-w-full'
                  size='sm'
                  aria-label={`Tasa de activación: ${activationRate}%`}
                />
              </div>

              {/* Estado general */}
              <div className='text-center'>
                <Chip
                  variant='flat'
                  color={needsAttentionCount === 0 ? 'success' : needsAttentionCount <= 5 ? 'warning' : 'danger'}
                  size='sm'>
                  {needsAttentionCount === 0 ? 'Todo al día' : needsAttentionCount <= 5 ? 'Pocas tareas' : 'Requiere atención'}
                </Chip>
                <div className='text-xs text-gray-400 mt-1'>Estado Administrativo</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
})

UserStatsCards.displayName = 'UserStatsCards'

export default UserStatsCards
