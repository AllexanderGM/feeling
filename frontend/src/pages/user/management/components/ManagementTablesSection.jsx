import { useCallback, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Settings2, Heart, Tags } from 'lucide-react'
import { useError, useUserAnalytics } from '@hooks'
import { Logger } from '@utils/logger.js'

// Importar las secciones de gestión
import UserAttributesSection from './UserAttributesSection.jsx'
import UserInterestsSection from './UserInterestsSection.jsx'
import UserTagsSection from './UserTagsSection.jsx'

const ManagementTablesSection = memo(({ managementCounts, onManagementCountsUpdate }) => {
  const { handleError, handleSuccess } = useError()
  const [selectedManagementTab, setSelectedManagementTab] = useState('attributes')

  const { getAttributeStatistics, getInterestsStatistics, getTagsStatistics } = useUserAnalytics()

  // Cache para evitar recargas innecesarias
  const [dataCache, setDataCache] = useState({
    managementCountsLoaded: false,
    lastLoadTime: null
  })

  // Estados para prevenir llamadas concurrentes
  const [loadingCounts, setLoadingCounts] = useState({
    managementCounts: false
  })

  // Función para cargar conteos de gestión desde analytics
  const loadManagementCounts = useCallback(
    async (forceRefresh = false) => {
      // Verificar cache y prevenir llamadas innecesarias
      if (!forceRefresh && dataCache.managementCountsLoaded) {
        Logger.info('ManagementCounts already loaded from cache, skipping', { category: Logger.CATEGORIES.USER })
        return
      }

      // Prevenir llamadas concurrentes
      if (loadingCounts.managementCounts) {
        Logger.info('loadManagementCounts already in progress, skipping', { category: Logger.CATEGORIES.USER })
        return
      }

      setLoadingCounts(prev => ({ ...prev, managementCounts: true }))

      try {
        // Usar el endpoint de analytics que ya existe
        const [attributesStats, interestsStats, tagsStats] = await Promise.allSettled([
          getAttributeStatistics(),
          getInterestsStatistics(),
          getTagsStatistics()
        ])

        const counts = {
          attributes: attributesStats.status === 'fulfilled' ? attributesStats.value?.totalAttributes || 0 : 0,
          interests: interestsStats.status === 'fulfilled' ? interestsStats.value?.totalInterests || 0 : 0,
          tags: tagsStats.status === 'fulfilled' ? tagsStats.value?.totalTags || 0 : 0
        }

        // Notificar al componente padre sobre la actualización
        onManagementCountsUpdate?.(counts)

        setDataCache(prev => ({
          ...prev,
          managementCountsLoaded: true,
          lastLoadTime: Date.now()
        }))
      } catch (error) {
        Logger.error('Error loading management counts:', error, { category: Logger.CATEGORIES.USER })
        handleError?.('Error al cargar conteos de gestión')
      } finally {
        setLoadingCounts(prev => ({ ...prev, managementCounts: false }))
      }
    },
    [
      handleError,
      loadingCounts.managementCounts,
      dataCache.managementCountsLoaded,
      getAttributeStatistics,
      getInterestsStatistics,
      getTagsStatistics,
      onManagementCountsUpdate
    ]
  )

  // Cargar conteos al montar el componente
  useEffect(() => {
    loadManagementCounts()
  }, [loadManagementCounts])

  // Función para manejar éxito en operaciones de gestión
  const handleManagementSuccess = useCallback(
    message => {
      handleSuccess?.(message)
      // Refrescar conteos de gestión
      loadManagementCounts(true)
    },
    [handleSuccess, loadManagementCounts]
  )

  return (
    <div className='py-4'>
      <Tabs
        selectedKey={selectedManagementTab || 'attributes'}
        onSelectionChange={setSelectedManagementTab}
        aria-label='Gestión de datos'
        color='secondary'
        variant='underlined'>
        {/* Atributos */}
        <Tab
          key='attributes'
          title={
            <div className='flex items-center space-x-2'>
              <Settings2 className='w-4 h-4' />
              <span>Atributos</span>
              {managementCounts.attributes > 0 && (
                <span className='text-xs text-default-600 font-medium'>{managementCounts.attributes}</span>
              )}
            </div>
          }>
          <div className='py-4'>
            <UserAttributesSection onError={handleError} onSuccess={handleManagementSuccess} />
          </div>
        </Tab>

        {/* Categorías de Interés */}
        <Tab
          key='interests'
          title={
            <div className='flex items-center space-x-2'>
              <Heart className='w-4 h-4' />
              <span>Categorías</span>
              {managementCounts.interests > 0 && <span className='text-xs text-danger-600 font-medium'>{managementCounts.interests}</span>}
            </div>
          }>
          <div className='py-4'>
            <UserInterestsSection onError={handleError} onSuccess={handleManagementSuccess} />
          </div>
        </Tab>

        {/* Tags */}
        <Tab
          key='tags'
          title={
            <div className='flex items-center space-x-2'>
              <Tags className='w-4 h-4' />
              <span>Tags</span>
              {managementCounts.tags > 0 && <span className='text-xs text-secondary-600 font-medium'>{managementCounts.tags}</span>}
            </div>
          }>
          <div className='py-4'>
            <UserTagsSection onError={handleError} onSuccess={handleManagementSuccess} />
          </div>
        </Tab>
      </Tabs>
    </div>
  )
})

ManagementTablesSection.displayName = 'ManagementTablesSection'

export default ManagementTablesSection
