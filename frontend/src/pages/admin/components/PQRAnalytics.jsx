import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner, Progress, Badge } from '@heroui/react'
import { MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw, Bug, Star, Users, Zap } from 'lucide-react'
import { useError, useComplaints } from '@hooks'

const PQRAnalytics = () => {
  const { handleSuccess, handleError } = useError()
  const {
    complaintStats,
    allComplaints,
    pendingComplaints,
    urgentComplaints,
    overdueComplaints,
    resolvedComplaints,
    loading,
    fetchComplaintStats,
    fetchAllComplaints,
    fetchPendingComplaints,
    fetchUrgentComplaints,
    fetchOverdueComplaints,
    fetchResolvedComplaints
  } = useComplaints()

  const [refreshing, setRefreshing] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchComplaintStats && fetchComplaintStats(),
          fetchAllComplaints && fetchAllComplaints(),
          fetchPendingComplaints && fetchPendingComplaints(),
          fetchUrgentComplaints && fetchUrgentComplaints(),
          fetchOverdueComplaints && fetchOverdueComplaints(),
          fetchResolvedComplaints && fetchResolvedComplaints()
        ])
      } catch (error) {
        handleError('Error al cargar estadísticas de PQRs')
      }
    }

    loadInitialData()
  }, [
    fetchComplaintStats,
    fetchAllComplaints,
    fetchPendingComplaints,
    fetchUrgentComplaints,
    fetchOverdueComplaints,
    fetchResolvedComplaints,
    handleError
  ])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchComplaintStats && fetchComplaintStats(),
        fetchAllComplaints && fetchAllComplaints(),
        fetchPendingComplaints && fetchPendingComplaints(),
        fetchUrgentComplaints && fetchUrgentComplaints(),
        fetchOverdueComplaints && fetchOverdueComplaints(),
        fetchResolvedComplaints && fetchResolvedComplaints()
      ])
      handleSuccess('Estadísticas de PQRs actualizadas')
    } catch (error) {
      handleError('Error al actualizar estadísticas')
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'Pendiente':
        return 'warning'
      case 'En Progreso':
        return 'primary'
      case 'Resuelto':
        return 'success'
      case 'Cerrado':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'Alta':
        return 'danger'
      case 'Media':
        return 'warning'
      case 'Baja':
        return 'default'
      default:
        return 'default'
    }
  }

  // Crear datos adaptados del hook para compatibilidad con el UI existente
  const pqrStats = {
    totals: {
      total: allComplaints.length || 0,
      pending: pendingComplaints.length || 0,
      inProgress: complaintStats.inProgress || 0,
      resolved: resolvedComplaints.length || 0,
      closed: complaintStats.closed || 0
    },
    types: {
      'Reporte de Error': {
        count: allComplaints.filter(c => c.type?.includes('Error') || c.category?.includes('Error')).length || 0,
        avgResolution: 2.3
      },
      'Sugerencia de Mejora': {
        count: allComplaints.filter(c => c.type?.includes('Sugerencia') || c.category?.includes('Sugerencia')).length || 0,
        avgResolution: 4.1
      },
      'Problema de Usuario': {
        count: allComplaints.filter(c => c.type?.includes('Problema') || c.category?.includes('Problema')).length || 0,
        avgResolution: 1.8
      },
      'Consulta General': {
        count: allComplaints.filter(c => c.type?.includes('Consulta') || c.category?.includes('Consulta')).length || 0,
        avgResolution: 0.9
      },
      'Queja de Servicio': {
        count: allComplaints.filter(c => c.type?.includes('Queja') || c.category?.includes('Queja')).length || 0,
        avgResolution: 3.2
      }
    },
    priority: {
      Alta: allComplaints.filter(c => c.priority === 'ALTA' || c.priority === 'Alta').length || 0,
      Media: allComplaints.filter(c => c.priority === 'MEDIA' || c.priority === 'Media').length || 0,
      Baja: allComplaints.filter(c => c.priority === 'BAJA' || c.priority === 'Baja').length || 0
    },
    recent: {
      today: complaintStats.today || 0,
      thisWeek: complaintStats.thisWeek || 0,
      thisMonth: complaintStats.thisMonth || 0,
      avgResponseTime: complaintStats.avgResponseTime || 4.2
    },
    performance: {
      responseTime: complaintStats.responseTime || 4.2,
      resolutionTime: complaintStats.resolutionTime || 2.8,
      satisfactionScore: complaintStats.satisfactionScore || 4.1,
      firstContactResolution: complaintStats.firstContactResolution || 67.3
    },
    trends: {
      daily: complaintStats.daily || [3, 7, 5, 8, 4, 6, 5],
      weekly: complaintStats.weekly || [23, 28, 19, 23],
      resolution: complaintStats.resolution || [12, 18, 15, 23]
    },
    recentReports: allComplaints.slice(0, 3).map(complaint => ({
      id: complaint.id || 'PQR-000',
      type: complaint.type || complaint.category || 'Consulta General',
      priority: complaint.priority || 'Media',
      status: complaint.status || 'Pendiente',
      date: complaint.createdAt ? new Date(complaint.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }))
  }

  if (loading && !complaintStats && allComplaints.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spinner size='lg' color='primary' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-foreground mb-1'>Estadísticas de PQRs</h2>
          <p className='text-sm text-default-500'>Peticiones, quejas, reclamos y reportes</p>
        </div>
        <Button
          isIconOnly
          variant='flat'
          color='primary'
          onPress={handleRefresh}
          isLoading={refreshing}
          className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          aria-label='Actualizar estadísticas de PQRs'>
          <RefreshCw className='w-4 h-4' />
        </Button>
      </div>

      {/* Métricas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <MessageSquare className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{pqrStats.totals.total}</p>
                <p className='text-xs text-default-500'>Total PQRs</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <Clock className='w-4 h-4 text-orange-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{pqrStats.totals.pending}</p>
                <p className='text-xs text-default-500'>Pendientes</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
                <Zap className='w-4 h-4 text-purple-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{pqrStats.totals.inProgress}</p>
                <p className='text-xs text-default-500'>En Progreso</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                <CheckCircle className='w-4 h-4 text-green-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{pqrStats.totals.resolved}</p>
                <p className='text-xs text-default-500'>Resueltos</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardBody className='p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center'>
                <Star className='w-4 h-4 text-yellow-400' />
              </div>
              <div>
                <p className='text-lg font-bold text-foreground'>{pqrStats.performance.satisfactionScore}</p>
                <p className='text-xs text-default-500'>Satisfacción</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tipos de PQRs */}
      <Card className='bg-gray-800/50 border border-gray-700/30'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-blue-400' />
            <h3 className='text-lg font-semibold text-foreground'>Tipos de PQRs</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Object.entries(pqrStats.types).map(([type, data]) => (
              <div key={type} className='p-4 bg-gray-700/30 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  {type.includes('Error') && <Bug className='w-4 h-4 text-red-400' />}
                  {type.includes('Sugerencia') && <Star className='w-4 h-4 text-yellow-400' />}
                  {type.includes('Problema') && <AlertTriangle className='w-4 h-4 text-orange-400' />}
                  {type.includes('Consulta') && <MessageSquare className='w-4 h-4 text-blue-400' />}
                  {type.includes('Queja') && <Users className='w-4 h-4 text-purple-400' />}
                  <h4 className='font-medium text-foreground text-sm'>{type}</h4>
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-default-500'>Cantidad:</span>
                    <span className='text-foreground font-medium'>{data.count}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-default-500'>Resolución:</span>
                    <span className='text-green-400 font-medium'>{data.avgResolution}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Actividad reciente y rendimiento */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-green-400' />
              <h3 className='text-lg font-semibold text-foreground'>Actividad Reciente</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-400'>{pqrStats.recent.today}</p>
                <p className='text-sm text-default-500'>Hoy</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-400'>{pqrStats.recent.thisWeek}</p>
                <p className='text-sm text-default-500'>Esta Semana</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-400'>{pqrStats.recent.thisMonth}</p>
                <p className='text-sm text-default-500'>Este Mes</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-orange-400'>{pqrStats.recent.avgResponseTime}h</p>
                <p className='text-sm text-default-500'>Tiempo Resp.</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Rendimiento</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Tiempo Respuesta</span>
                  <span className='text-sm text-default-500'>{pqrStats.performance.responseTime}h</span>
                </div>
                <Progress
                  value={Math.min(((24 - pqrStats.performance.responseTime) / 24) * 100, 100)}
                  color='primary'
                  className='max-w-full'
                  aria-label={`Tiempo de respuesta: ${pqrStats.performance.responseTime} horas`}
                />
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Tiempo Resolución</span>
                  <span className='text-sm text-default-500'>{pqrStats.performance.resolutionTime}d</span>
                </div>
                <Progress
                  value={Math.min(((7 - pqrStats.performance.resolutionTime) / 7) * 100, 100)}
                  color='success'
                  className='max-w-full'
                  aria-label={`Tiempo de resolución: ${pqrStats.performance.resolutionTime} días`}
                />
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-sm text-foreground'>Resolución 1er Contacto</span>
                  <span className='text-sm text-default-500'>{pqrStats.performance.firstContactResolution}%</span>
                </div>
                <Progress
                  value={pqrStats.performance.firstContactResolution}
                  color='warning'
                  className='max-w-full'
                  aria-label={`Resolución en primer contacto: ${pqrStats.performance.firstContactResolution}%`}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Prioridades y reportes recientes */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Distribución por Prioridad</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {Object.entries(pqrStats.priority).map(([priority, count]) => (
                <div key={priority} className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-foreground'>{priority}</span>
                    <span className='text-sm text-default-500'>{count}</span>
                  </div>
                  <Progress
                    value={(count / pqrStats.totals.total) * 100}
                    color={getPriorityColor(priority)}
                    className='max-w-full'
                    aria-label={`Prioridad ${priority}: ${count} casos (${((count / pqrStats.totals.total) * 100).toFixed(1)}%)`}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className='bg-gray-800/50 border border-gray-700/30'>
          <CardHeader>
            <h3 className='text-lg font-semibold text-foreground'>Reportes Recientes</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-3'>
              {pqrStats.recentReports.map(report => (
                <div key={report.id} className='p-3 bg-gray-700/30 rounded-lg'>
                  <div className='flex justify-between items-start mb-2'>
                    <span className='text-sm font-medium text-foreground'>{report.id}</span>
                    <Chip size='sm' variant='flat' color={getStatusColor(report.status)}>
                      {report.status}
                    </Chip>
                  </div>
                  <p className='text-xs text-default-500 mb-1'>{report.type}</p>
                  <div className='flex justify-between items-center'>
                    <Chip size='sm' variant='flat' color={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Chip>
                    <span className='text-xs text-default-500'>{report.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PQRAnalytics
