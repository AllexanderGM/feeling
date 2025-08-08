import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { CreditCard, Package, TrendingUp } from 'lucide-react'

import { useError, useAuth } from '@hooks'
import { Logger } from '@utils/logger.js'
import GenericTableControls from '@components/ui/GenericTableControls.jsx'
import TablePagination from '@components/ui/TablePagination.jsx'
import { MATCH_PLAN_COLUMNS } from '@constants/tableConstants.js'
import { matchService } from '@services'

import CreatePlanForm from './components/CreatePlanForm.jsx'
import EditPlanForm from './components/EditPlanForm.jsx'
import DeletePlanModal from './components/DeletePlanModal.jsx'
import PlanStatsCards from './components/PlanStatsCards.jsx'
import UnifiedPlanTable from './components/UnifiedPlanTable.jsx'

const PlansManagement = memo(() => {
  const { user: currentUser } = useAuth()
  const { handleError, handleSuccess } = useError()

  // Estados para planes
  const [plans, setPlans] = useState([])
  const [planStats, setPlanStats] = useState(null)
  const [loading, setLoading] = useState(false)

  // Estado para las tabs
  const [selectedTab, setSelectedTab] = useState('active')

  // Table states
  const [filterValue, setFilterValue] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState(new Set(MATCH_PLAN_COLUMNS.filter(col => col.uid !== 'id').map(col => col.uid)))
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  })
  const [page, setPage] = useState(1)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Load data from backend
  const loadPlansData = useCallback(async () => {
    try {
      setLoading(true)
      const [plansResponse, statsResponse] = await Promise.all([matchService.getAllPlansForAdmin(), matchService.getPlanStats()])

      setPlans(plansResponse || [])
      setPlanStats(statsResponse || {})
    } catch (error) {
      Logger.error('Error loading plans data:', error, { category: Logger.CATEGORIES.SERVICE })
      handleError('Error al cargar los datos de planes de match')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => {
    loadPlansData()
  }, [loadPlansData])

  // Debounce filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [filterValue])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [debouncedFilter])

  // Filtered and sorted plans
  const filteredPlans = useMemo(() => {
    // Asegurar que plans sea un array válido
    const validPlans = Array.isArray(plans) ? plans : []
    let filtered = validPlans

    if (debouncedFilter && validPlans.length > 0) {
      filtered = validPlans.filter(
        plan =>
          plan?.name?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
          plan?.description?.toLowerCase().includes(debouncedFilter.toLowerCase())
      )
    }

    return filtered
  }, [plans, debouncedFilter])

  const sortedPlans = useMemo(() => {
    // Asegurar que filteredPlans sea un array válido
    const validFilteredPlans = Array.isArray(filteredPlans) ? filteredPlans : []

    if (validFilteredPlans.length === 0) {
      return []
    }

    return [...validFilteredPlans].sort((a, b) => {
      const first = a?.[sortDescriptor.column]
      const second = b?.[sortDescriptor.column]
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === 'descending' ? -cmp : cmp
    })
  }, [filteredPlans, sortDescriptor])

  // Pagination
  const pages = Math.max(1, Math.ceil(sortedPlans.length / rowsPerPage))
  const paginatedPlans = useMemo(() => {
    if (!Array.isArray(sortedPlans) || sortedPlans.length === 0) {
      return []
    }

    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage
    return sortedPlans.slice(start, end)
  }, [sortedPlans, page, rowsPerPage])

  // Stats computed from backend data
  const computedStats = useMemo(() => {
    if (!planStats) return null

    return {
      totalPlans: planStats.totalPlans || 0,
      activePlans: planStats.activePlans || 0,
      totalRevenue: planStats.totalRevenue || 0,
      totalPurchases: planStats.totalPurchases || 0,
      mostPopularPlan: planStats.mostPopularPlan || 'N/A',
      mostPopularPlanSales: planStats.mostPopularPlanSales || 0,
      averageRemainingAttempts: planStats.averageRemainingAttempts || 0
    }
  }, [planStats])

  // Handlers
  const handleCreatePlan = useCallback(
    async planData => {
      try {
        setLoading(true)
        // TODO: Implement API call
        Logger.info('Creating plan', { planData }, { category: Logger.CATEGORIES.SERVICE })

        const newPlan = {
          id: Date.now(),
          ...planData,
          totalPurchases: 0,
          revenue: 0,
          createdAt: new Date().toISOString()
        }

        setPlans(prev => [...prev, newPlan])
        setIsCreateModalOpen(false)
        handleSuccess('Plan de match creado exitosamente')
      } catch (error) {
        handleError('Error al crear el plan de match', error)
      } finally {
        setLoading(false)
      }
    },
    [handleError, handleSuccess]
  )

  const handleEditPlan = useCallback(
    async planData => {
      try {
        setLoading(true)
        // TODO: Implement API call
        Logger.info('Editing plan', { planData }, { category: Logger.CATEGORIES.SERVICE })

        setPlans(prev => prev.map(plan => (plan.id === selectedPlan.id ? { ...plan, ...planData } : plan)))
        setIsEditModalOpen(false)
        setSelectedPlan(null)
        handleSuccess('Plan de match actualizado exitosamente')
      } catch (error) {
        handleError('Error al actualizar el plan de match', error)
      } finally {
        setLoading(false)
      }
    },
    [selectedPlan, handleError, handleSuccess]
  )

  const handleDeletePlan = useCallback(async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      Logger.info('Deleting plan', { planId: selectedPlan.id }, { category: Logger.CATEGORIES.SERVICE })

      setPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id))
      setIsDeleteModalOpen(false)
      setSelectedPlan(null)
      handleSuccess('Plan de match eliminado exitosamente')
    } catch (error) {
      handleError('Error al eliminar el plan de match', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPlan, handleError, handleSuccess])

  const openEditModal = useCallback(plan => {
    setSelectedPlan(plan)
    setIsEditModalOpen(true)
  }, [])

  const openDeleteModal = useCallback(plan => {
    setSelectedPlan(plan)
    setIsDeleteModalOpen(true)
  }, [])

  return (
    <>
      <Helmet>
        <title>Gestión de Planes de Match - Feeling</title>
        <meta name='description' content='Administra los planes de match disponibles en la plataforma' />
      </Helmet>

      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-100 flex items-center gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                <Package className='w-5 h-5 text-blue-400' />
              </div>
              Gestión de Planes de Match
            </h1>
            <p className='text-gray-400 mt-1'>Administra los planes de match disponibles para los usuarios</p>
          </div>
        </div>

        {/* Stats Cards */}
        <PlanStatsCards stats={computedStats} loading={loading} />

        {/* Main Table */}
        <div className='space-y-4'>
          <GenericTableControls
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            columns={MATCH_PLAN_COLUMNS}
            onCreateNew={() => setIsCreateModalOpen(true)}
            createButtonText='Crear Plan'
            createButtonIcon={<Package className='w-4 h-4' />}
            filterPlaceholder='Buscar planes de match...'
          />

          <UnifiedPlanTable
            plans={paginatedPlans}
            loading={loading}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            visibleColumns={visibleColumns}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          <TablePagination
            page={page}
            pages={pages}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            total={sortedPlans.length}
          />
        </div>
      </div>

      {/* Modals */}
      <CreatePlanForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlan}
        loading={loading}
      />

      <EditPlanForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPlan(null)
        }}
        onSubmit={handleEditPlan}
        loading={loading}
        plan={selectedPlan}
      />

      <DeletePlanModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPlan(null)
        }}
        onConfirm={handleDeletePlan}
        loading={loading}
        plan={selectedPlan}
      />
    </>
  )
})

PlansManagement.displayName = 'PlansManagement'

export default PlansManagement
