import { useState, useMemo } from 'react'
import { Card, CardBody, Chip, Button, Input } from '@heroui/react'
import { Heart, MessageCircle, Search, Filter, Clock, Zap, Star, Calendar, Sparkles, Flame, Eye } from 'lucide-react'

// Hooks
import { useAuth, useUserInterests } from '@hooks'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'

import NewMatchesSection from './components/NewMatchesSection.jsx'
import ActiveConversationsSection from './components/ActiveConversationsSection.jsx'
import MatchHistorySection from './components/MatchHistorySection.jsx'
import ChatSection from './components/ChatSection.jsx'

const Matches = () => {
  const { user, loading: authLoading } = useAuth()
  const { getInterestByEnum, loading: interestLoading } = useUserInterests()

  const [activeSection, setActiveSection] = useState('new')
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Datos simulados de matches
  const matchesData = useMemo(
    () => ({
      newMatches: [
        {
          id: 1,
          name: 'Sofia García',
          age: 28,
          distance: 3,
          location: 'Bogotá',
          category: 'ESSENCE',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250', '/api/placeholder/180/220'],
          compatibility: 95,
          matchedAt: new Date('2024-01-15T10:30:00Z'),
          isOnline: true,
          hasMessage: false,
          interests: ['Música', 'Viajes', 'Fotografía'],
          description: 'Amante de la música y los viajes. Siempre buscando nuevas aventuras y experiencias auténticas.',
          occupation: 'Diseñadora Gráfica',
          education: 'Universidad Nacional'
        },
        {
          id: 2,
          name: 'Carlos Rodríguez',
          age: 32,
          distance: 5,
          location: 'Medellín',
          category: 'SPIRIT',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250'],
          compatibility: 89,
          matchedAt: new Date('2024-01-14T15:20:00Z'),
          isOnline: false,
          hasMessage: false,
          interests: ['Fe', 'Familia', 'Lectura'],
          description: 'Ingeniero de sistemas con valores sólidos. Creo en la importancia de la familia y la fe.',
          occupation: 'Ingeniero de Sistemas',
          education: 'Universidad EAFIT'
        },
        {
          id: 3,
          name: 'Ana María López',
          age: 26,
          distance: 8,
          location: 'Cali',
          category: 'ROUSE',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250', '/api/placeholder/180/220', '/api/placeholder/190/240'],
          compatibility: 92,
          matchedAt: new Date('2024-01-13T18:45:00Z'),
          isOnline: true,
          hasMessage: false,
          interests: ['Arte', 'Naturaleza', 'Yoga'],
          description: 'Artista y yogui. Encuentro inspiración en la naturaleza y en las pequeñas cosas de la vida.',
          occupation: 'Artista Visual',
          education: 'Instituto de Artes'
        }
      ],
      activeConversations: [
        {
          id: 4,
          name: 'Valentina Torres',
          age: 29,
          distance: 2,
          location: 'Bogotá',
          category: 'ESSENCE',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250'],
          lastMessage: 'Me encantaría conocerte mejor 😊',
          lastMessageTime: new Date('2024-01-15T14:20:00Z'),
          unreadCount: 2,
          isOnline: true,
          isTyping: false,
          conversationId: 'conv_1',
          interests: ['Cocina', 'Danza', 'Viajes'],
          description: 'Chef profesional y bailarina en tiempo libre. La vida es para disfrutarla al máximo.',
          occupation: 'Chef Profesional'
        },
        {
          id: 5,
          name: 'Miguel Ángel Ruiz',
          age: 35,
          distance: 6,
          location: 'Medellín',
          category: 'SPIRIT',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250'],
          lastMessage: '¿Te gustaría ir a misa juntos?',
          lastMessageTime: new Date('2024-01-15T09:15:00Z'),
          unreadCount: 0,
          isOnline: false,
          isTyping: false,
          conversationId: 'conv_2',
          interests: ['Fe', 'Deportes', 'Lectura'],
          description: 'Médico especialista que encuentra equilibrio entre el trabajo y la vida personal.',
          occupation: 'Médico Especialista'
        },
        {
          id: 6,
          name: 'Isabella Castro',
          age: 27,
          distance: 4,
          location: 'Cali',
          category: 'ROUSE',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250', '/api/placeholder/180/220'],
          lastMessage: 'Esa foto tuya es increíble! 📸',
          lastMessageTime: new Date('2024-01-14T20:30:00Z'),
          unreadCount: 1,
          isOnline: true,
          isTyping: true,
          conversationId: 'conv_3',
          interests: ['Fotografía', 'Café', 'Literatura'],
          description: 'Fotógrafa freelance y amante del buen café. Siempre con un libro en la mano.',
          occupation: 'Fotógrafa Freelance'
        }
      ],
      matchHistory: [
        {
          id: 7,
          name: 'Alejandra Moreno',
          age: 30,
          distance: 7,
          location: 'Barranquilla',
          category: 'ESSENCE',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150'],
          lastActivity: new Date('2024-01-10T16:00:00Z'),
          status: 'inactive',
          totalMessages: 15,
          interests: ['Música', 'Arte'],
          description: 'Profesora de música con pasión por el arte.',
          occupation: 'Profesora de Música'
        },
        {
          id: 8,
          name: 'David González',
          age: 33,
          distance: 12,
          location: 'Cartagena',
          category: 'SPIRIT',
          image: '/api/placeholder/150/150',
          photos: ['/api/placeholder/150/150', '/api/placeholder/200/250'],
          lastActivity: new Date('2024-01-08T11:30:00Z'),
          status: 'ended',
          totalMessages: 8,
          interests: ['Fe', 'Deportes'],
          description: 'Arquitecto con valores sólidos.',
          occupation: 'Arquitecto'
        }
      ]
    }),
    []
  )

  // Estadísticas de matches
  const matchStats = useMemo(() => {
    const totalMatches = matchesData.newMatches.length + matchesData.activeConversations.length + matchesData.matchHistory.length
    const activeChats = matchesData.activeConversations.length
    const unreadMessages = matchesData.activeConversations.reduce((total, conv) => total + conv.unreadCount, 0)
    const todayMatches = matchesData.newMatches.filter(match => {
      const today = new Date()
      const matchDate = new Date(match.matchedAt)
      return matchDate.toDateString() === today.toDateString()
    }).length

    return {
      totalMatches,
      activeChats,
      unreadMessages,
      todayMatches
    }
  }, [matchesData])

  // Obtener icono de categoría
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

  const sectionTabs = [
    {
      id: 'new',
      title: 'Nuevos Matches',
      icon: <Heart className='w-4 h-4' />,
      count: matchesData.newMatches.length,
      color: 'danger'
    },
    {
      id: 'conversations',
      title: 'Conversaciones',
      icon: <MessageCircle className='w-4 h-4' />,
      count: matchesData.activeConversations.length,
      color: 'primary'
    },
    {
      id: 'history',
      title: 'Historial',
      icon: <Clock className='w-4 h-4' />,
      count: matchesData.matchHistory.length,
      color: 'default'
    }
  ]

  const renderActiveSection = () => {
    if (selectedChat) {
      return <ChatSection chatData={selectedChat} onBack={() => setSelectedChat(null)} getCategoryIcon={getCategoryIcon} />
    }

    switch (activeSection) {
      case 'new':
        return <NewMatchesSection matches={matchesData.newMatches} searchTerm={searchTerm} getCategoryIcon={getCategoryIcon} />
      case 'conversations':
        return (
          <ActiveConversationsSection
            conversations={matchesData.activeConversations}
            searchTerm={searchTerm}
            onSelectChat={setSelectedChat}
            getCategoryIcon={getCategoryIcon}
          />
        )
      case 'history':
        return <MatchHistorySection history={matchesData.matchHistory} searchTerm={searchTerm} getCategoryIcon={getCategoryIcon} />
      default:
        return null
    }
  }

  const isLoading = authLoading || interestLoading

  if (isLoading) return <LoadData>Cargando matches...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de matches'>
      {/* Header de matches */}
      <div className='w-full bg-gradient-to-br from-red-900/20 via-pink-800/10 to-purple-900/20 backdrop-blur-sm rounded-xl border border-red-700/50 p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-4'>
          {/* Información principal */}
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

          {/* Estadísticas rápidas */}
          <div className='flex items-center gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-400'>{matchStats.totalMatches}</div>
              <div className='text-xs text-gray-400'>Total</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-400'>{matchStats.activeChats}</div>
              <div className='text-xs text-gray-400'>Activas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-400'>{matchStats.todayMatches}</div>
              <div className='text-xs text-gray-400'>Hoy</div>
            </div>
            {matchStats.unreadMessages > 0 && (
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-400'>{matchStats.unreadMessages}</div>
                <div className='text-xs text-gray-400'>Nuevos</div>
              </div>
            )}
          </div>
        </div>

        {/* Buscador y filtros */}
        <div className='mt-4 flex flex-col sm:flex-row gap-3'>
          <div className='flex-1'>
            <Input
              placeholder='Buscar en matches...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              startContent={<Search className='w-4 h-4 text-gray-400' />}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/50 backdrop-blur-sm border-gray-600'
              }}
            />
          </div>
          <Button
            variant='bordered'
            startContent={<Filter className='w-4 h-4' />}
            className='border-gray-600 text-gray-300 hover:bg-gray-700/30'>
            Filtros
          </Button>
        </div>
      </div>

      {/* Navegación de secciones */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4'>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <div className='flex items-center gap-2'>
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

            {/* Botón de buscar más matches */}
            <Button
              color='primary'
              startContent={<Zap className='w-4 h-4' />}
              className='bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600'>
              Buscar Más
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Contenido de la sección activa */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50 min-h-[400px]'>
        <CardBody className='p-4 sm:p-6'>{renderActiveSection()}</CardBody>
      </Card>

      {/* Tips y consejos */}
      <Card className='w-full bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-purple-900/20 border-blue-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-2'>
              <Star className='w-5 h-5 text-yellow-400' />
              <h3 className='text-lg font-semibold text-yellow-300'>Consejos para mejores matches</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <MessageCircle className='w-4 h-4 text-blue-400' />
                  <span className='font-medium text-blue-300'>Inicia conversaciones</span>
                </div>
                <p className='text-blue-200 text-xs'>Envía mensajes personalizados basados en sus intereses y perfil</p>
              </div>

              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <Eye className='w-4 h-4 text-green-400' />
                  <span className='font-medium text-green-300'>Mantén tu perfil activo</span>
                </div>
                <p className='text-green-200 text-xs'>Actualiza tus fotos y descripción regularmente para mayor visibilidad</p>
              </div>

              <div className='bg-purple-500/10 border border-purple-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <Calendar className='w-4 h-4 text-purple-400' />
                  <span className='font-medium text-purple-300'>Sé consistente</span>
                </div>
                <p className='text-purple-200 text-xs'>Responde mensajes a tiempo y mantén conversaciones activas</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Matches
