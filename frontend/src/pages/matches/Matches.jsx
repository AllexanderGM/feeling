import { useState, useMemo, useEffect } from 'react'
import { Card, CardBody, Chip, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import {
  Heart,
  MessageCircle,
  Users,
  Search,
  Filter,
  Clock,
  Zap,
  Star,
  Calendar,
  Sparkles,
  Flame,
  Eye,
  CreditCard,
  Package,
  Check,
  X,
  Phone,
  Mail,
  ShoppingCart
} from 'lucide-react'

// Hooks
import { useAuth, useUser, useUserInterests, useError, useMatches } from '@hooks'
// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import UserCard from '@components/ui/UserCard.jsx'
import AdvancedFilters from '@pages/home/components/AdvancedFilters.jsx'

// New components for the enhanced experience
import PlanPurchaseModal from './components/PlanPurchaseModal.jsx'
import MatchRequestModal from './components/MatchRequestModal.jsx'
import MatchNotificationModal from './components/MatchNotificationModal.jsx'
import ContactInfoModal from './components/ContactInfoModal.jsx'

const MatchesNew = () => {
  const { user, loading: authLoading } = useAuth()
  const { suggestions, suggestionsPagination, fetchUserSuggestions, loading: userLoading } = useUser()
  const {
    matches,
    matchStats,
    loading: matchesLoading,
    sendMatch,
    acceptMatch,
    rejectMatch,
    addToFavorites,
    removeFromFavorites,
    getMatchContact,
    refreshAllMatches
  } = useMatches()
  const { getInterestByEnum, loading: interestLoading } = useUserInterests()
  const { handleError, handleSuccess } = useError()

  const [activeSection, setActiveSection] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isMatchRequestModalOpen, setIsMatchRequestModalOpen] = useState(false)
  const [isMatchNotificationModalOpen, setIsMatchNotificationModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Selected data
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)

  // Filtros state
  const [appliedFilters, setAppliedFilters] = useState({
    categoryInterest: 'all',
    ageMin: 18,
    ageMax: 65,
    distance: 50,
    relationshipType: 'all',
    showOnlineOnly: false,
    showRecentActivity: false,
    showVerifiedOnly: false,
    showWithPhotosOnly: true,
    minCompatibility: 0,
    educationLevel: 'all',
    hasJob: 'all',
    smokingPreference: 'all',
    drinkingPreference: 'all',
    sortBy: 'compatibility'
  })

  // Usar datos reales de match
  const userMatchData = {
    availableAttempts: matchStats.availableAttempts || 0,
    currentPlan: { name: 'Plan Estándar', attempts: 5 },
    totalMatches: matchStats.totalMatches || 0,
    pendingMatches: matchStats.pendingMatches || 0
  }

  // Mock data for plans
  const mockPlans = useMemo(
    () => [
      {
        id: 1,
        name: 'Plan Básico',
        attempts: 1,
        price: 2.99,
        description: 'Perfecto para conocer gente nueva',
        popular: false
      },
      {
        id: 2,
        name: 'Plan Estándar',
        attempts: 5,
        price: 9.99,
        description: 'Ideal para quienes buscan más oportunidades',
        popular: true
      },
      {
        id: 3,
        name: 'Plan Premium',
        attempts: 10,
        price: 16.99,
        description: 'Máxima cantidad de intentos para encontrar el amor',
        popular: false
      }
    ],
    []
  )

  // Escuchar eventos de filtros desde la navegación
  useEffect(() => {
    const handleMatchFiltersAction = event => {
      const { action } = event.detail
      switch (action) {
        case 'openFilters':
          setIsFiltersOpen(true)
          break
        case 'refresh':
          // Recargar datos de matches/sugerencias
          handleRefreshData()
          break
        default:
          break
      }
    }

    window.addEventListener('matchFiltersAction', handleMatchFiltersAction)
    return () => window.removeEventListener('matchFiltersAction', handleMatchFiltersAction)
  }, [])

  // Handlers para filtros y refresh
  const handleApplyFilters = newFilters => {
    setAppliedFilters(newFilters)
    // Aquí se aplicarían los filtros a los datos reales
    console.log('Filtros aplicados en Matches:', newFilters)
  }

  const handleRefreshData = () => {
    // Recargar sugerencias y matches
    fetchUserSuggestions(0, 10)
    refreshAllMatches()
    console.log('Refrescando datos de matches')
  }

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (appliedFilters.categoryInterest !== 'all') count++
    if (appliedFilters.ageMin !== 18 || appliedFilters.ageMax !== 65) count++
    if (appliedFilters.distance !== 50) count++
    if (appliedFilters.relationshipType !== 'all') count++
    if (appliedFilters.showOnlineOnly) count++
    if (appliedFilters.showRecentActivity) count++
    if (appliedFilters.showVerifiedOnly) count++
    if (!appliedFilters.showWithPhotosOnly) count++
    if (appliedFilters.minCompatibility > 0) count++
    if (appliedFilters.educationLevel !== 'all') count++
    if (appliedFilters.hasJob !== 'all') count++
    if (appliedFilters.smokingPreference !== 'all') count++
    if (appliedFilters.drinkingPreference !== 'all') count++
    if (appliedFilters.sortBy !== 'compatibility') count++
    return count
  }, [appliedFilters])

  // Enviar evento cuando cambien los filtros activos
  useEffect(() => {
    const event = new CustomEvent('updateFiltersCount', {
      detail: { filtersCount: activeFiltersCount }
    })
    window.dispatchEvent(event)
  }, [activeFiltersCount])

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🔥 useEffect - user:', user, 'userLoading:', userLoading)
    if (user && !userLoading) {
      console.log('✅ Calling fetchUserSuggestions')
      fetchUserSuggestions(0, 10)
    }
  }, [user, userLoading, fetchUserSuggestions])

  // Debug suggestions
  useEffect(() => {
    console.log('📋 Suggestions updated:', suggestions)
    console.log('📊 Suggestions length:', suggestions?.length)
  }, [suggestions])

  // Get category icon - usando la estructura estándar
  const getCategoryIcon = user => {
    const category = user?.status?.categoryInterest || user?.profile?.categoryInterest
    switch (category?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-4 h-4 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-4 h-4 text-red-400' />
      case 'SPIRIT':
        return <MessageCircle className='w-4 h-4 text-purple-400' />
      default:
        return <Heart className='w-4 h-4 text-gray-400' />
    }
  }

  // Section configurations - usando datos reales
  const sectionTabs = [
    {
      id: 'discover',
      title: 'Descubrir',
      icon: <Search className='w-4 h-4' />,
      count: suggestions?.length || 0,
      color: 'primary'
    },
    {
      id: 'sent',
      title: 'Enviados',
      icon: <Send className='w-4 h-4' />,
      count: matches.sent?.length || 0,
      color: 'warning'
    },
    {
      id: 'received',
      title: 'Recibidos',
      icon: <Heart className='w-4 h-4' />,
      count: matches.received?.length || 0,
      color: 'danger'
    },
    {
      id: 'matches',
      title: 'Matches',
      icon: <Check className='w-4 h-4' />,
      count: matches.accepted?.length || 0,
      color: 'success'
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      icon: <Star className='w-4 h-4' />,
      count: matches.favorites?.length || 0,
      color: 'secondary'
    }
  ]

  // Handlers
  const handleSendMatch = targetUser => {
    if (userMatchData.availableAttempts <= 0) {
      setIsPlanModalOpen(true)
      return
    }

    setSelectedUser(targetUser)
    setIsMatchRequestModalOpen(true)
  }

  const confirmSendMatch = async () => {
    if (!selectedUser) return

    try {
      // Usar el email como identificador único
      await sendMatch(selectedUser.profile?.email)
      setIsMatchRequestModalOpen(false)
      setSelectedUser(null)
      handleSuccess('Match enviado exitosamente')
    } catch (error) {
      handleError('Error al enviar match', error)
    }
  }

  const handleAcceptMatch = async match => {
    if (userMatchData.availableAttempts <= 0) {
      setIsPlanModalOpen(true)
      return
    }

    try {
      await acceptMatch(match.id)
      handleSuccess('Match aceptado exitosamente')
    } catch (error) {
      handleError('Error al aceptar match', error)
    }
  }

  const handleRejectMatch = async match => {
    try {
      await rejectMatch(match.id)
      handleSuccess('Match rechazado')
    } catch (error) {
      handleError('Error al rechazar match', error)
    }
  }

  const handleAddToFavorites = async user => {
    try {
      // Usar el email como identificador único
      await addToFavorites(user.profile?.email)
      handleSuccess('Usuario agregado a favoritos')
    } catch (error) {
      handleError('Error al agregar a favoritos', error)
    }
  }

  const handleViewContact = async match => {
    if (!match.contactUnlocked) {
      handleError('Información de contacto no disponible')
      return
    }

    try {
      const contactInfo = await getMatchContact(match.id)
      setSelectedContact(contactInfo)
      setIsContactModalOpen(true)
    } catch (error) {
      handleError('Error al obtener información de contacto', error)
    }
  }

  const handlePurchasePlan = plan => {
    // TODO: API call to purchase plan
    setUserMatchData(prev => ({
      ...prev,
      availableAttempts: plan.attempts,
      currentPlan: plan
    }))
    setIsPlanModalOpen(false)
    handleSuccess(`Plan ${plan.name} comprado exitosamente`)
  }

  // Render functions
  const renderDiscoverSection = () => (
    <div className='space-y-6'>
      {!suggestions || suggestions.length === 0 ? (
        <div className='text-center py-12'>
          <div className='w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6'>
            <Users className='w-12 h-12 text-gray-600' />
          </div>
          <h3 className='text-xl font-bold text-gray-300 mb-2'>¡No hay más perfiles!</h3>
          <p className='text-gray-500 mb-6'>No hay perfiles que coincidan con tus filtros actuales.</p>
          <Button
            color='primary'
            variant='bordered'
            startContent={<RotateCcw className='w-4 h-4' />}
            onPress={() => fetchUserSuggestions(0, 10)}
            className=''>
            Cargar nuevas sugerencias
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {suggestions.map((user, index) => (
            <Card
              key={user.profile?.email || index}
              className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50 overflow-hidden hover:scale-105 transition-transform'>
              <CardBody className='p-0'>
                <div className='relative'>
                  <img
                    src={user.profile?.images?.[0] || user.profile?.mainImage || '/api/placeholder/300/400'}
                    alt={user.profile?.name}
                    className='w-full h-64 object-cover'
                  />
                  <div className='absolute top-2 right-2'>{getCategoryIcon(user)}</div>
                  {user.status?.verified && (
                    <div className='absolute top-2 left-2'>
                      <div className='w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
                    </div>
                  )}
                </div>

                <div className='p-4 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-bold text-gray-100'>
                        {user.profile?.name}, {user.profile?.age}
                      </h3>
                      <p className='text-sm text-gray-400'>
                        {user.profile?.city} • {user.profile?.department}
                      </p>
                    </div>
                    <Chip size='sm' color='success' variant='flat'>
                      95%
                    </Chip>
                  </div>

                  <p className='text-sm text-gray-300 line-clamp-2'>{user.profile?.description || 'Sin descripción'}</p>

                  <div className='flex items-center gap-2 flex-wrap'>
                    {user.profile?.tags?.slice(0, 3).map((tag, index) => (
                      <Chip key={index} size='sm' variant='bordered' className='text-xs'>
                        {tag}
                      </Chip>
                    ))}
                  </div>

                  <div className='flex items-center gap-2 pt-2'>
                    <Button
                      color='primary'
                      size='sm'
                      className='flex-1'
                      startContent={<Heart className='w-4 h-4' />}
                      onPress={() => handleSendMatch(user)}>
                      Match
                    </Button>
                    <Button color='secondary' size='sm' variant='bordered' isIconOnly onPress={() => handleAddToFavorites(user)}>
                      <Star className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderSentMatches = () => (
    <div className='space-y-4'>
      {!matches.sent || matches.sent.length === 0 ? (
        <div className='text-center py-12'>
          <h3 className='text-xl font-bold text-gray-300 mb-2'>No tienes matches enviados</h3>
          <p className='text-gray-500'>Ve a la sección Descubrir para enviar matches.</p>
        </div>
      ) : (
        matches.sent.map(match => (
          <Card key={match.id} className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-4'>
                <img src={match.targetUser.images[0]} alt={match.targetUser.name} className='w-16 h-16 rounded-lg object-cover' />
                <div className='flex-1'>
                  <h3 className='font-bold text-gray-100'>
                    {match.targetUser.name}, {match.targetUser.age}
                  </h3>
                  <p className='text-sm text-gray-400'>Enviado {new Date(match.sentAt).toLocaleDateString()}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {getCategoryIcon(match.targetUser.category)}
                  <Chip size='sm' color='warning' variant='flat'>
                    Pendiente
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  )

  const renderReceivedMatches = () => (
    <div className='space-y-4'>
      {!matches.received || matches.received.length === 0 ? (
        <div className='text-center py-12'>
          <h3 className='text-xl font-bold text-gray-300 mb-2'>No tienes matches recibidos</h3>
          <p className='text-gray-500'>Cuando alguien te envíe un match aparecerá aquí.</p>
        </div>
      ) : (
        matches.received.map(match => (
          <Card key={match.id} className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-4'>
                <img src={match.initiatorUser.images[0]} alt={match.initiatorUser.name} className='w-16 h-16 rounded-lg object-cover' />
                <div className='flex-1'>
                  <h3 className='font-bold text-gray-100'>
                    {match.initiatorUser.name}, {match.initiatorUser.age}
                  </h3>
                  <p className='text-sm text-gray-400'>Recibido {new Date(match.receivedAt).toLocaleDateString()}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {getCategoryIcon(match.initiatorUser.category)}
                  <Button color='success' size='sm' startContent={<Check className='w-4 h-4' />} onPress={() => handleAcceptMatch(match)}>
                    Aceptar
                  </Button>
                  <Button color='danger' size='sm' variant='bordered' isIconOnly onPress={() => handleRejectMatch(match)}>
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  )

  const renderAcceptedMatches = () => (
    <div className='space-y-4'>
      {!matches.accepted || matches.accepted.length === 0 ? (
        <div className='text-center py-12'>
          <h3 className='text-xl font-bold text-gray-300 mb-2'>No tienes matches aceptados</h3>
          <p className='text-gray-500'>Cuando tengas matches mutuos aparecerán aquí.</p>
        </div>
      ) : (
        matches.accepted.map(match => (
          <Card key={match.id} className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
            <CardBody className='p-4'>
              <div className='flex items-center gap-4'>
                <img src={match.otherUser.images[0]} alt={match.otherUser.name} className='w-16 h-16 rounded-lg object-cover' />
                <div className='flex-1'>
                  <h3 className='font-bold text-gray-100'>
                    {match.otherUser.name}, {match.otherUser.age}
                  </h3>
                  <p className='text-sm text-gray-400'>Match desde {new Date(match.acceptedAt).toLocaleDateString()}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {getCategoryIcon(match.otherUser.category)}
                  {match.contactUnlocked && (
                    <Button color='primary' size='sm' startContent={<Phone className='w-4 h-4' />} onPress={() => handleViewContact(match)}>
                      Contacto
                    </Button>
                  )}
                  <Chip size='sm' color='success' variant='flat'>
                    Conectados
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  )

  const renderFavorites = () => (
    <div className='space-y-4'>
      {!matches.favorites || matches.favorites.length === 0 ? (
        <div className='text-center py-12'>
          <h3 className='text-xl font-bold text-gray-300 mb-2'>No tienes favoritos</h3>
          <p className='text-gray-500'>Agrega usuarios a tus favoritos desde la sección Descubrir.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {matches.favorites.map(user => (
            <Card key={user.id} className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3'>
                  <img src={user.images[0]} alt={user.name} className='w-12 h-12 rounded-lg object-cover' />
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-100'>
                      {user.name}, {user.age}
                    </h3>
                    <p className='text-sm text-gray-400'>{user.location}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {getCategoryIcon(user.category)}
                    <Button color='primary' size='sm' startContent={<Heart className='w-4 h-4' />} onPress={() => handleSendMatch(user)}>
                      Match
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'discover':
        return renderDiscoverSection()
      case 'sent':
        return renderSentMatches()
      case 'received':
        return renderReceivedMatches()
      case 'matches':
        return renderAcceptedMatches()
      case 'favorites':
        return renderFavorites()
      default:
        return renderDiscoverSection()
    }
  }

  const isLoading = authLoading || interestLoading || userLoading || matchesLoading

  if (isLoading) return <LoadData>Cargando matches...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de matches'>
      {/* Header with user match status */}
      <div className='w-full bg-gradient-to-br from-red-900/20 via-pink-800/10 to-purple-900/20 backdrop-blur-sm rounded-xl border border-red-700/50 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4'>
          <div className='text-center sm:text-left'>
            <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
              <div className='w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center'>
                <Heart className='w-5 h-5 text-red-400' />
              </div>
              <div>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>Mis Matches</h1>
                <p className='text-sm text-gray-400'>Conecta con personas especiales</p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-400'>{userMatchData.availableAttempts}</div>
              <div className='text-xs text-gray-400'>Intentos</div>
            </div>
            <Button color='primary' startContent={<ShoppingCart className='w-4 h-4' />} onPress={() => setIsPlanModalOpen(true)}>
              Comprar Más
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className='mt-4'>
          <Input
            placeholder='Buscar usuarios...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            startContent={<Search className='w-4 h-4 text-gray-400' />}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/50 backdrop-blur-sm border-gray-600'
            }}
          />
        </div>
      </div>

      {/* Navigation tabs */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <div className='flex items-center gap-2 flex-wrap'>
              {sectionTabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeSection === tab.id ? 'solid' : 'bordered'}
                  color={activeSection === tab.id ? tab.color : 'default'}
                  size='sm'
                  className={`flex items-center gap-2 ${
                    activeSection === tab.id ? '' : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'
                  }`}
                  onPress={() => setActiveSection(tab.id)}>
                  {tab.icon}
                  <span>{tab.title}</span>
                  {tab.count > 0 && (
                    <Chip size='sm' variant='flat' className='ml-1'>
                      {tab.count}
                    </Chip>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Content section */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50 min-h-[400px]'>
        <CardBody className='p-4 sm:p-6'>{renderActiveSection()}</CardBody>
      </Card>

      {/* Modals */}
      <PlanPurchaseModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plans={mockPlans}
        onPurchase={handlePurchasePlan}
        currentAttempts={userMatchData.availableAttempts}
      />

      <MatchRequestModal
        isOpen={isMatchRequestModalOpen}
        onClose={() => setIsMatchRequestModalOpen(false)}
        user={selectedUser}
        onConfirm={confirmSendMatch}
      />

      <ContactInfoModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} contact={selectedContact} />

      {/* Panel de filtros avanzados */}
      <AdvancedFilters
        isOpen={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </LiteContainer>
  )
}

export default MatchesNew
