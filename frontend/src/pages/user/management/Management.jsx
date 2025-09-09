import { useState, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { Users, BarChart3, Settings2 } from 'lucide-react'

// Importar los nuevos componentes organizados
import UserTablesSection from './components/UserTablesSection.jsx'
import ManagementTablesSection from './components/ManagementTablesSection.jsx'
import AnalyticsSection from './components/AnalyticsSection.jsx'

const Management = memo(() => {
  const [selectedTab, setSelectedTab] = useState('users')

  // Estado para los conteos de pestañas de gestión
  const [managementCounts, setManagementCounts] = useState({
    attributes: 0,
    interests: 0,
    tags: 0
  })

  // Callback para cuando se actualicen los conteos de gestión
  const handleManagementCountsUpdate = counts => {
    setManagementCounts(counts)
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <Helmet>
        <title>Administración de Usuarios | Feeling</title>
        <meta name='description' content='Panel de administración completo para gestión de usuarios, atributos, categorías y tags' />
      </Helmet>

      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-200'>Administración de Usuarios</h1>
          <p className='text-gray-400'>Gestión completa del sistema de usuarios, atributos, categorías e intereses</p>
        </div>
      </div>

      {/* Secciones principales */}
      <div className='flex w-full flex-col'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          aria-label='Administración de usuarios'
          color='primary'
          variant='bordered'>
          {/* SECCIÓN 1: USUARIOS */}
          <Tab
            key='users'
            title={
              <div className='flex items-center space-x-2'>
                <Users className='w-4 h-4' />
                <span>Usuarios</span>
              </div>
            }>
            <UserTablesSection />
          </Tab>

          {/* SECCIÓN 2: GESTIÓN */}
          <Tab
            key='management'
            title={
              <div className='flex items-center space-x-2'>
                <Settings2 className='w-4 h-4' />
                <span>Gestión</span>
              </div>
            }>
            <ManagementTablesSection managementCounts={managementCounts} onManagementCountsUpdate={handleManagementCountsUpdate} />
          </Tab>

          {/* SECCIÓN 3: ANALÍTICAS */}
          <Tab
            key='analytics'
            title={
              <div className='flex items-center space-x-2'>
                <BarChart3 className='w-4 h-4' />
                <span>Analíticas</span>
              </div>
            }>
            <AnalyticsSection />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
})

Management.displayName = 'Management'

export default Management
