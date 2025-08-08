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
  Send,
  Check,
  X,
  Phone,
  Mail,
  ShoppingCart
} from 'lucide-react'

// Hooks
import { useAuth, useUserInterests, useError } from '@hooks'
// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import UserCard from '@components/ui/UserCard.jsx'

// New components for the enhanced experience
import PlanPurchaseModal from './components/PlanPurchaseModal.jsx'
import MatchRequestModal from './components/MatchRequestModal.jsx'
import MatchNotificationModal from './components/MatchNotificationModal.jsx'
import ContactInfoModal from './components/ContactInfoModal.jsx'

const MatchesNew = () => {
  const { user, loading: authLoading } = useAuth()
  const { getInterestByEnum, loading: interestLoading } = useUserInterests()
  const { handleError, handleSuccess } = useError()

  const [activeSection, setActiveSection] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [isMatchRequestModalOpen, setIsMatchRequestModalOpen] = useState(false)
  const [isMatchNotificationModalOpen, setIsMatchNotificationModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Selected data
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)

  // User's match data
  const [userMatchData, setUserMatchData] = useState({
    availableAttempts: 3,
    currentPlan: { name: 'Plan Estándar', attempts: 5 },
    totalMatches: 12,
    pendingMatches: 2
  })

  // Mock data for development
  const mockData = useMemo(
    () => ({
      availablePlans: [
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
      suggestedUsers: [
        {
          id: 1,
          name: 'Sofia García',
          age: 28,
          distance: 3,
          location: 'Bogotá',
          category: 'ESSENCE',
          images: ['/api/placeholder/300/400'],
          compatibility: 95,
          isOnline: true,
          interests: ['Música', 'Viajes', 'Fotografía'],
          description: 'Amante de la música y los viajes. Siempre buscando nuevas aventuras.',
          occupation: 'Diseñadora Gráfica',
          isFavorite: false
        },
        {
          id: 2,
          name: 'Carlos Rodríguez',
          age: 32,
          distance: 5,
          location: 'Medellín',
          category: 'SPIRIT',
          images: ['/api/placeholder/300/400'],
          compatibility: 89,
          isOnline: false,
          interests: ['Fe', 'Familia', 'Lectura'],
          description: 'Ingeniero con valores sólidos. La familia es primero.',
          occupation: 'Ingeniero de Sistemas',
          isFavorite: true
        }
      ],
      sentMatches: [
        {
          id: 1,
          targetUser: {
            id: 3,
            name: 'Ana María López',
            age: 26,
            images: ['/api/placeholder/300/400'],
            category: 'ROUSE'
          },
          status: 'PENDING',
          sentAt: '2024-01-15T10:30:00Z'
        }
      ],
      receivedMatches: [
        {
          id: 2,
          initiatorUser: {
            id: 4,
            name: 'Miguel Torres',
            age: 29,
            images: ['/api/placeholder/300/400'],
            category: 'ESSENCE'
          },
          status: 'PENDING',
          receivedAt: '2024-01-15T14:20:00Z'
        }
      ],
      acceptedMatches: [
        {
          id: 3,
          otherUser: {
            id: 5,
            name: 'Valentina Castro',
            age: 27,
            images: ['/api/placeholder/300/400'],
            category: 'SPIRIT'
          },
          status: 'ACCEPTED',
          contactUnlocked: true,
          acceptedAt: '2024-01-14T18:45:00Z'
        }
      ],
      favorites: [
        {
          id: 6,
          name: 'Isabella Moreno',
          age: 25,
          distance: 7,
          location: 'Cali',
          category: 'ESSENCE',
          images: ['/api/placeholder/300/400'],
          addedAt: '2024-01-13T12:00:00Z'
        }
      ]
    }),
    []
  )

  // Get category icon
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
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

  // Section configurations
  const sectionTabs = [
    {
      id: 'discover',
      title: 'Descubrir',
      icon: <Search className='w-4 h-4' />,
      count: mockData.suggestedUsers.length,
      color: 'primary'
    },
    {
      id: 'sent',
      title: 'Enviados',
      icon: <Send className='w-4 h-4' />,
      count: mockData.sentMatches.length,
      color: 'warning'
    },
    {
      id: 'received',
      title: 'Recibidos',
      icon: <Heart className='w-4 h-4' />,
      count: mockData.receivedMatches.length,
      color: 'danger'
    },
    {
      id: 'matches',
      title: 'Matches',
      icon: <Check className='w-4 h-4' />,
      count: mockData.acceptedMatches.length,
      color: 'success'
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      icon: <Star className='w-4 h-4' />,
      count: mockData.favorites.length,
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

  const confirmSendMatch = () => {
    // TODO: API call to send match
    setUserMatchData(prev => ({
      ...prev,
      availableAttempts: prev.availableAttempts - 1
    }))
    setIsMatchRequestModalOpen(false)
    setSelectedUser(null)
    handleSuccess('Match enviado exitosamente')
  }

  const handleAcceptMatch = match => {
    if (userMatchData.availableAttempts <= 0) {
      setIsPlanModalOpen(true)
      return
    }

    // TODO: API call to accept match
    setUserMatchData(prev => ({
      ...prev,
      availableAttempts: prev.availableAttempts - 1
    }))
    handleSuccess('Match aceptado exitosamente')
  }

  const handleRejectMatch = match => {
    // TODO: API call to reject match
    handleSuccess('Match rechazado')
  }

  const handleAddToFavorites = user => {
    // TODO: API call to add to favorites
    handleSuccess('Usuario agregado a favoritos')
  }

  const handleViewContact = match => {
    if (!match.contactUnlocked) {
      handleError('Información de contacto no disponible')
      return
    }

    // Mock contact data
    setSelectedContact({
      email: 'user@example.com',
      phone: '+57 300 123 4567'
    })
    setIsContactModalOpen(true)
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {mockData.suggestedUsers.map(user => (
          <Card
            key={user.id}
            className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50 overflow-hidden hover:scale-105 transition-transform'>
            <CardBody className='p-0'>
              <div className='relative'>
                <img src={user.images[0]} alt={user.name} className='w-full h-64 object-cover' />
                <div className='absolute top-2 right-2'>{getCategoryIcon(user.category)}</div>
                {user.isOnline && (
                  <div className='absolute top-2 left-2'>
                    <div className='w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
                  </div>
                )}
              </div>

              <div className='p-4 space-y-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-bold text-gray-100'>
                      {user.name}, {user.age}
                    </h3>
                    <p className='text-sm text-gray-400'>
                      {user.location} • {user.distance}km
                    </p>
                  </div>
                  <Chip size='sm' color='success' variant='flat'>
                    {user.compatibility}%
                  </Chip>
                </div>

                <p className='text-sm text-gray-300 line-clamp-2'>{user.description}</p>

                <div className='flex items-center gap-2 flex-wrap'>
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <Chip key={index} size='sm' variant='bordered' className='text-xs'>
                      {interest}
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
    </div>
  )

  const renderSentMatches = () => (
    <div className='space-y-4'>
      {mockData.sentMatches.map(match => (
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
      ))}
    </div>
  )

  const renderReceivedMatches = () => (
    <div className='space-y-4'>
      {mockData.receivedMatches.map(match => (
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
      ))}
    </div>
  )

  const renderAcceptedMatches = () => (
    <div className='space-y-4'>
      {mockData.acceptedMatches.map(match => (
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
      ))}
    </div>
  )

  const renderFavorites = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {mockData.favorites.map(user => (
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

  const isLoading = authLoading || interestLoading

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
        plans={mockData.availablePlans}
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
    </LiteContainer>
  )
}

export default MatchesNew
