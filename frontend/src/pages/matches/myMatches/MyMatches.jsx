import { useState, useCallback, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Tabs, Tab, Chip, Avatar, Card, CardBody } from '@heroui/react'
import { Heart, Send, Inbox, Eye } from 'lucide-react'
import { useError } from '@hooks'
import { matchQueryService } from '@services'
import { APP_PATHS } from '@constants/paths'
import { Logger } from '@utils/logger.js'
import { formatJavaDateForDisplay, calculateAgeFromJavaDate } from '@utils/dateUtils.js'
import GenericDataTable from '@components/common/GenericDataTable.jsx'
import GenericTableActions from '@components/common/GenericTableActions.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'

// Definición de columnas para cada tipo de match
const MATCH_COLUMNS = {
  accepted: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'EDAD', uid: 'age', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'INTERÉS', uid: 'interest', sortable: true },
    { name: 'FECHA MATCH', uid: 'matchDate', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  sent: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'EDAD', uid: 'age', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'ESTADO', uid: 'status', sortable: true },
    { name: 'ENVIADO', uid: 'sentDate', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  received: [
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'EDAD', uid: 'age', sortable: true },
    { name: 'UBICACIÓN', uid: 'location', sortable: true },
    { name: 'ESTADO', uid: 'status', sortable: true },
    { name: 'RECIBIDO', uid: 'receivedDate', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ]
}

const MyMatches = memo(() => {
  const navigate = useNavigate()
  const { handleError } = useError()

  const [selectedTab, setSelectedTab] = useState('accepted')
  const [loading, setLoading] = useState(false)

  // Estados para cada tipo de match
  const [acceptedMatches, setAcceptedMatches] = useState([])
  const [sentMatches, setSentMatches] = useState([])
  const [receivedMatches, setReceivedMatches] = useState([])

  // Paginación
  const [acceptedPagination, setAcceptedPagination] = useState({ page: 0, totalPages: 0, totalElements: 0, size: 10 })
  const [sentPagination, setSentPagination] = useState({ page: 0, totalPages: 0, totalElements: 0, size: 10 })
  const [receivedPagination, setReceivedPagination] = useState({ page: 0, totalPages: 0, totalElements: 0, size: 10 })

  // Búsqueda
  const [searchQueries, setSearchQueries] = useState({
    accepted: '',
    sent: '',
    received: ''
  })

  // Cargar matches aceptados
  const loadAcceptedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getAcceptedMatches(page, size)

        if (response?.success && response?.data) {
          const content = response.data.content || response.data

          setAcceptedMatches(Array.isArray(content) ? content : [content])

          if (response.data.page !== undefined) {
            setAcceptedPagination({
              page: response.data.page,
              totalPages: response.data.totalPages,
              totalElements: response.data.totalElements,
              size: response.data.size
            })
          }
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'load_accepted_matches', 'Error cargando matches aceptados', { error })
        handleError('Error al cargar tus matches')
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // Cargar matches enviados
  const loadSentMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getSentMatches(page, size)

        if (response?.success && response?.data) {
          const content = response.data.content || response.data

          setSentMatches(Array.isArray(content) ? content : [content])

          if (response.data.page !== undefined) {
            setSentPagination({
              page: response.data.page,
              totalPages: response.data.totalPages,
              totalElements: response.data.totalElements,
              size: response.data.size
            })
          }
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'load_sent_matches', 'Error cargando matches enviados', { error })
        handleError('Error al cargar matches enviados')
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // Cargar matches recibidos
  const loadReceivedMatches = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true)
        const response = await matchQueryService.getReceivedMatches(page, size)

        if (response?.success && response?.data) {
          const content = response.data.content || response.data

          setReceivedMatches(Array.isArray(content) ? content : [content])

          if (response.data.page !== undefined) {
            setReceivedPagination({
              page: response.data.page,
              totalPages: response.data.totalPages,
              totalElements: response.data.totalElements,
              size: response.data.size
            })
          }
        }
      } catch (error) {
        Logger.error(Logger.CATEGORIES.SERVICE, 'load_received_matches', 'Error cargando matches recibidos', { error })
        handleError('Error al cargar matches recibidos')
      } finally {
        setLoading(false)
      }
    },
    [handleError]
  )

  // Cargar datos iniciales
  useEffect(() => {
    loadAcceptedMatches()
  }, [loadAcceptedMatches])

  // Lazy loading cuando cambia de tab
  useEffect(() => {
    if (selectedTab === 'sent' && sentMatches.length === 0) {
      loadSentMatches()
    } else if (selectedTab === 'received' && receivedMatches.length === 0) {
      loadReceivedMatches()
    }
  }, [selectedTab, sentMatches.length, receivedMatches.length, loadSentMatches, loadReceivedMatches])

  // Ver perfil de usuario
  const handleViewProfile = useCallback(
    matchData => {
      const userId = matchData?.targetUser?.id || matchData?.sourceUser?.id

      if (userId) {
        navigate(`${APP_PATHS.USER.PROFILE_BY_ID.replace(':userId', userId)}`)
      }
    },
    [navigate]
  )

  // Renderizar celda de la tabla
  const renderCell = useCallback(
    (match, columnKey) => {
      // Determinar el usuario a mostrar (el otro usuario del match)
      const otherUser = match?.targetUser || match?.sourceUser || {}
      const cellValue = otherUser[columnKey]

      switch (columnKey) {
        case 'user':
          return (
            <div className='flex items-center gap-3'>
              <Avatar
                className='flex-shrink-0'
                color='primary'
                name={`${otherUser.name || ''} ${otherUser.lastName || ''}`}
                size='sm'
                src={otherUser.mainImage?.url || otherUser.profileImageUrl}
              />
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-gray-200'>
                  {otherUser.name} {otherUser.lastName}
                </span>
                <span className='text-xs text-gray-400'>{otherUser.email}</span>
              </div>
            </div>
          )

        case 'age':
          const age = otherUser.dateOfBirth ? calculateAgeFromJavaDate(otherUser.dateOfBirth) : null

          return <span className='text-sm text-gray-300'>{age ? `${age} años` : 'N/A'}</span>

        case 'location':
          return (
            <div className='flex flex-col'>
              <span className='text-sm text-gray-300'>{otherUser.city || 'N/A'}</span>
              <span className='text-xs text-gray-400'>{otherUser.country || ''}</span>
            </div>
          )

        case 'interest':
          const interest = otherUser.categoryInterest || 'N/A'

          return (
            <Chip className='capitalize' color='secondary' size='sm' variant='flat'>
              {interest}
            </Chip>
          )

        case 'status':
          const statusMap = {
            PENDING: { label: 'Pendiente', color: 'warning' },
            ACCEPTED: { label: 'Aceptado', color: 'success' },
            REJECTED: { label: 'Rechazado', color: 'danger' },
            EXPIRED: { label: 'Expirado', color: 'default' }
          }
          const status = statusMap[match.status] || { label: match.status, color: 'default' }

          return (
            <Chip color={status.color} size='sm' variant='flat'>
              {status.label}
            </Chip>
          )

        case 'matchDate':
          return <span className='text-sm text-gray-400'>{match.acceptedAt ? formatJavaDateForDisplay(match.acceptedAt) : 'N/A'}</span>

        case 'sentDate':
          return <span className='text-sm text-gray-400'>{match.createdAt ? formatJavaDateForDisplay(match.createdAt) : 'N/A'}</span>

        case 'receivedDate':
          return <span className='text-sm text-gray-400'>{match.createdAt ? formatJavaDateForDisplay(match.createdAt) : 'N/A'}</span>

        case 'actions':
          return (
            <GenericTableActions
              actions={[
                {
                  icon: Eye,
                  label: 'Ver perfil',
                  color: 'primary',
                  onPress: () => handleViewProfile(match)
                }
              ]}
            />
          )

        default:
          return <span className='text-sm text-gray-300'>{cellValue || 'N/A'}</span>
      }
    },
    [handleViewProfile]
  )

  // Handlers de paginación
  const handlePageChange = useCallback(
    (newPage, tab) => {
      const page = newPage - 1 // Convertir a 0-indexed

      if (tab === 'accepted') {
        loadAcceptedMatches(page, acceptedPagination.size)
      } else if (tab === 'sent') {
        loadSentMatches(page, sentPagination.size)
      } else if (tab === 'received') {
        loadReceivedMatches(page, receivedPagination.size)
      }
    },
    [acceptedPagination.size, sentPagination.size, receivedPagination.size, loadAcceptedMatches, loadSentMatches, loadReceivedMatches]
  )

  const handleRowsPerPageChange = useCallback(
    (newSize, tab) => {
      if (tab === 'accepted') {
        loadAcceptedMatches(0, newSize)
      } else if (tab === 'sent') {
        loadSentMatches(0, newSize)
      } else if (tab === 'received') {
        loadReceivedMatches(0, newSize)
      }
    },
    [loadAcceptedMatches, loadSentMatches, loadReceivedMatches]
  )

  // Handler de búsqueda
  const handleSearch = useCallback((searchValue, tab) => {
    setSearchQueries(prev => ({ ...prev, [tab]: searchValue }))
    // TODO: Implementar búsqueda en el backend
  }, [])

  // Datos filtrados por búsqueda (filtro local mientras no hay backend)
  const filteredAcceptedMatches = useMemo(() => {
    if (!searchQueries.accepted) return acceptedMatches
    const query = searchQueries.accepted.toLowerCase()

    return acceptedMatches.filter(match => {
      const user = match?.targetUser || match?.sourceUser || {}

      return (
        user.name?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    })
  }, [acceptedMatches, searchQueries.accepted])

  const filteredSentMatches = useMemo(() => {
    if (!searchQueries.sent) return sentMatches
    const query = searchQueries.sent.toLowerCase()

    return sentMatches.filter(match => {
      const user = match?.targetUser || {}

      return (
        user.name?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    })
  }, [sentMatches, searchQueries.sent])

  const filteredReceivedMatches = useMemo(() => {
    if (!searchQueries.received) return receivedMatches
    const query = searchQueries.received.toLowerCase()

    return receivedMatches.filter(match => {
      const user = match?.sourceUser || {}

      return (
        user.name?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      )
    })
  }, [receivedMatches, searchQueries.received])

  return (
    <>
      <Helmet>
        <title>Mis Matches - Feeling</title>
        <meta content='Administra tus matches, conexiones y solicitudes' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Página de mis matches' className='gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center'>
              <Heart className='w-6 h-6 text-pink-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-100'>Mis Matches</h1>
              <p className='text-gray-400'>Gestiona tus conexiones y solicitudes de match</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <Card className='bg-green-500/10 border border-green-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center'>
                  <Heart className='w-5 h-5 text-green-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-green-400'>{acceptedPagination.totalElements || 0}</p>
                  <p className='text-xs text-gray-400'>Matches Activos</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-blue-500/10 border border-blue-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                  <Send className='w-5 h-5 text-blue-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-400'>{sentPagination.totalElements || 0}</p>
                  <p className='text-xs text-gray-400'>Enviados</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className='bg-purple-500/10 border border-purple-500/20'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                  <Inbox className='w-5 h-5 text-purple-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-purple-400'>{receivedPagination.totalElements || 0}</p>
                  <p className='text-xs text-gray-400'>Recibidos</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs with Tables */}
        <div className='flex w-full flex-col'>
          <Tabs
            aria-label='Tipos de matches'
            color='primary'
            selectedKey={selectedTab}
            variant='bordered'
            onSelectionChange={setSelectedTab}>
            {/* Matches Aceptados */}
            <Tab
              key='accepted'
              title={
                <div className='flex items-center gap-2'>
                  <Heart className='w-4 h-4' />
                  <span>Matches</span>
                  <Chip color='success' size='sm' variant='flat'>
                    {acceptedPagination.totalElements || 0}
                  </Chip>
                </div>
              }>
              <Card className='mt-4 bg-gray-800/40 border-gray-700/50'>
                <CardBody className='p-0'>
                  <GenericDataTable
                    columns={MATCH_COLUMNS.accepted}
                    data={filteredAcceptedMatches}
                    emptyMessage='No tienes matches aceptados aún'
                    getItemKey={match => match.id || match.matchId}
                    loading={loading}
                    loadingMessage='Cargando tus matches...'
                    pagination={acceptedPagination}
                    renderCell={renderCell}
                    searchPlaceholder='Buscar por nombre o email...'
                    showCreateButton={false}
                    showRefreshButton={true}
                    tableId='accepted-matches-table'
                    onPageChange={page => handlePageChange(page, 'accepted')}
                    onRefresh={() => loadAcceptedMatches(acceptedPagination.page, acceptedPagination.size)}
                    onRowsPerPageChange={size => handleRowsPerPageChange(size, 'accepted')}
                    onSearch={value => handleSearch(value, 'accepted')}
                  />
                </CardBody>
              </Card>
            </Tab>

            {/* Matches Enviados */}
            <Tab
              key='sent'
              title={
                <div className='flex items-center gap-2'>
                  <Send className='w-4 h-4' />
                  <span>Enviados</span>
                  <Chip color='primary' size='sm' variant='flat'>
                    {sentPagination.totalElements || 0}
                  </Chip>
                </div>
              }>
              <Card className='mt-4 bg-gray-800/40 border-gray-700/50'>
                <CardBody className='p-0'>
                  <GenericDataTable
                    columns={MATCH_COLUMNS.sent}
                    data={filteredSentMatches}
                    emptyMessage='No has enviado solicitudes de match'
                    getItemKey={match => match.id || match.matchId}
                    loading={loading}
                    loadingMessage='Cargando matches enviados...'
                    pagination={sentPagination}
                    renderCell={renderCell}
                    searchPlaceholder='Buscar por nombre o email...'
                    showCreateButton={false}
                    showRefreshButton={true}
                    tableId='sent-matches-table'
                    onPageChange={page => handlePageChange(page, 'sent')}
                    onRefresh={() => loadSentMatches(sentPagination.page, sentPagination.size)}
                    onRowsPerPageChange={size => handleRowsPerPageChange(size, 'sent')}
                    onSearch={value => handleSearch(value, 'sent')}
                  />
                </CardBody>
              </Card>
            </Tab>

            {/* Matches Recibidos */}
            <Tab
              key='received'
              title={
                <div className='flex items-center gap-2'>
                  <Inbox className='w-4 h-4' />
                  <span>Recibidos</span>
                  <Chip color='secondary' size='sm' variant='flat'>
                    {receivedPagination.totalElements || 0}
                  </Chip>
                </div>
              }>
              <Card className='mt-4 bg-gray-800/40 border-gray-700/50'>
                <CardBody className='p-0'>
                  <GenericDataTable
                    columns={MATCH_COLUMNS.received}
                    data={filteredReceivedMatches}
                    emptyMessage='No has recibido solicitudes de match'
                    getItemKey={match => match.id || match.matchId}
                    loading={loading}
                    loadingMessage='Cargando matches recibidos...'
                    pagination={receivedPagination}
                    renderCell={renderCell}
                    searchPlaceholder='Buscar por nombre o email...'
                    showCreateButton={false}
                    showRefreshButton={true}
                    tableId='received-matches-table'
                    onPageChange={page => handlePageChange(page, 'received')}
                    onRefresh={() => loadReceivedMatches(receivedPagination.page, receivedPagination.size)}
                    onRowsPerPageChange={size => handleRowsPerPageChange(size, 'received')}
                    onSearch={value => handleSearch(value, 'received')}
                  />
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </LiteContainer>
    </>
  )
})

MyMatches.displayName = 'MyMatches'

export default MyMatches
