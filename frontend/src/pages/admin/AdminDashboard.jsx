import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Divider, Button, Chip } from '@heroui/react'
import { BarChart3, Users, Heart, Calendar, MessageSquare, Activity, Tags, RefreshCw, TrendingUp, Package } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Logger } from '@utils/logger.js'

// Componentes de analytics
import GeneralAnalytics from './components/GeneralAnalytics.jsx'
import UserAnalytics from './components/UserAnalytics.jsx'
import MatchAnalytics from './components/MatchAnalytics.jsx'
import EventAnalytics from './components/EventAnalytics.jsx'
import PQRAnalytics from './components/PQRAnalytics.jsx'
import TagAnalytics from './components/TagAnalytics.jsx'

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      // Simular refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastUpdated(new Date())
    } catch (error) {
      Logger.error(Logger.CATEGORIES.SYSTEM, 'dashboard_refresh', 'Error al refrescar dashboard admin', { error })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8'>
      <Helmet>
        <title>Dashboard de Administración | Admin</title>
        <meta name='description' content='Dashboard principal con todas las estadísticas de la plataforma' />
      </Helmet>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
            <BarChart3 className='w-5 h-5 text-blue-400' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Dashboard de Administración</h1>
            <p className='text-sm text-default-500'>Vista general de todas las estadísticas de la plataforma</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Chip variant='flat' color='primary' size='sm'>
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </Chip>
          <Button
            isIconOnly
            variant='flat'
            color='primary'
            onPress={handleRefreshAll}
            isLoading={refreshing}
            size='sm'
            className='bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'>
            <RefreshCw className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales del Sistema */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
            <Activity className='w-5 h-5 text-green-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estado General del Sistema</h2>
            <p className='text-sm text-default-500'>Monitoreo en tiempo real y estadísticas de API</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <GeneralAnalytics />
        </CardBody>
      </Card>

      {/* Estadísticas de Usuarios */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
            <Users className='w-5 h-5 text-purple-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estadísticas de Usuarios</h2>
            <p className='text-sm text-default-500'>Análisis de usuarios registrados, activos y demografía</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <UserAnalytics />
        </CardBody>
      </Card>

      {/* Estadísticas de Eventos */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-orange-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estadísticas de Eventos</h2>
            <p className='text-sm text-default-500'>Análisis de eventos creados, estados y participación</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <EventAnalytics />
        </CardBody>
      </Card>

      {/* Estadísticas de Matches/Paquetes */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center'>
            <Heart className='w-5 h-5 text-pink-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estadísticas de Matches y Paquetes</h2>
            <p className='text-sm text-default-500'>Análisis de coincidencias, planes premium y engagement</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <MatchAnalytics />
        </CardBody>
      </Card>

      {/* Estadísticas de PQRS */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center'>
            <MessageSquare className='w-5 h-5 text-yellow-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estadísticas de PQRS</h2>
            <p className='text-sm text-default-500'>Análisis de peticiones, quejas, reclamos y sugerencias</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <PQRAnalytics />
        </CardBody>
      </Card>

      {/* Estadísticas de Tags (dentro del módulo de usuarios) */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardHeader className='flex gap-3 pb-3'>
          <div className='w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center'>
            <Tags className='w-5 h-5 text-cyan-400' />
          </div>
          <div className='flex flex-col'>
            <h2 className='text-lg font-semibold text-foreground'>Estadísticas de Tags de Usuario</h2>
            <p className='text-sm text-default-500'>Análisis de etiquetas de usuarios e intereses populares</p>
          </div>
        </CardHeader>
        <Divider className='bg-gray-700/30' />
        <CardBody className='p-6'>
          <TagAnalytics />
        </CardBody>
      </Card>
    </div>
  )
}

export default AdminDashboard
