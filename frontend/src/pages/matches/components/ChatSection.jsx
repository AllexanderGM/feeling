import { useState, useRef, useEffect } from 'react'
import {
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip
} from '@heroui/react'
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  VolumeX,
  Shield,
  Flag,
  Image as ImageIcon,
  Check,
  CheckCheck,
  MapPin
} from 'lucide-react'
import { Logger } from '@utils/logger.js'

const ChatSection = ({ chatData, onBack, getCategoryIcon }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  // Datos simulados de mensajes
  useEffect(() => {
    const simulatedMessages = [
      {
        id: 1,
        text: '¡Hola! Me alegra mucho que hayamos hecho match 😊',
        sender: 'other',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        status: 'read'
      },
      {
        id: 2,
        text: '¡Hola! Sí, yo también me alegro. Vi que te gusta la fotografía, ¿qué tipo de fotos sueles tomar?',
        sender: 'me',
        timestamp: new Date('2024-01-15T10:05:00Z'),
        status: 'read'
      },
      {
        id: 3,
        text: 'Me encanta la fotografía de paisajes y retratos. Especialmente cuando viajo. ¿Has estado en Medellín? Tengo fotos increíbles de allá',
        sender: 'other',
        timestamp: new Date('2024-01-15T10:10:00Z'),
        status: 'read'
      },
      {
        id: 4,
        text: '¡Sí! Medellín es hermoso. Me encantaría ver esas fotos. Yo también disfruto mucho fotografiando cuando viajo',
        sender: 'me',
        timestamp: new Date('2024-01-15T10:15:00Z'),
        status: 'read'
      },
      {
        id: 5,
        text: chatData.lastMessage,
        sender: 'other',
        timestamp: new Date(chatData.lastMessageTime),
        status: 'delivered'
      }
    ]

    setMessages(simulatedMessages)
  }, [chatData])

  // Auto-scroll a los mensajes más recientes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: message.trim(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Simular respuesta automática después de un momento
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const responseMessage = {
          id: messages.length + 2,
          text: 'Gracias por tu mensaje, ¡me gusta mucho conversar contigo! 😊',
          sender: 'other',
          timestamp: new Date(),
          status: 'delivered'
        }

        setMessages(prev => [...prev, responseMessage])
      }, 2000)
    }, 1000)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = date => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = date => {
    const today = new Date()
    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy'
    }

    const yesterday = new Date(today)

    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    }

    return messageDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getMessageStatusIcon = status => {
    switch (status) {
      case 'sent':
        return <Check className='w-3 h-3 text-gray-400' />
      case 'delivered':
        return <CheckCheck className='w-3 h-3 text-gray-400' />
      case 'read':
        return <CheckCheck className='w-3 h-3 text-blue-400' />
      default:
        return null
    }
  }

  const handleMuteChat = () => {
    Logger.info('Silenciar chat', { chatUser: chatData.name }, { category: Logger.CATEGORIES.UI })
  }

  const handleBlockUser = () => {
    Logger.info('Bloquear usuario', { chatUser: chatData.name }, { category: Logger.CATEGORIES.USER })
  }

  const handleReportUser = () => {
    Logger.info('Reportar usuario', { chatUser: chatData.name }, { category: Logger.CATEGORIES.USER })
  }

  const handleVideoCall = () => {
    Logger.info('Iniciar videollamada', { chatUser: chatData.name }, { category: Logger.CATEGORIES.UI })
  }

  const handleVoiceCall = () => {
    Logger.info('Iniciar llamada de voz', { chatUser: chatData.name }, { category: Logger.CATEGORIES.UI })
  }

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)

    return groups
  }, {})

  return (
    <div className='flex flex-col h-[600px] max-h-[80vh]'>
      {/* Header del chat */}
      <CardHeader className='flex items-center justify-between p-4 border-b border-gray-700/50'>
        <div className='flex items-center gap-3'>
          <Button isIconOnly className='text-gray-400 hover:text-gray-200' size='sm' variant='light' onPress={onBack}>
            <ArrowLeft className='w-4 h-4' />
          </Button>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Avatar alt={chatData.name} className='w-10 h-10' src={chatData.image} />
              {chatData.isOnline && (
                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full' />
              )}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-gray-200'>{chatData.name}</h3>
                {getCategoryIcon(chatData.category)}
                <span className='text-xs text-gray-400'>{chatData.age} años</span>
              </div>
              <div className='flex items-center gap-2 text-xs text-gray-400'>
                <MapPin className='w-3 h-3' />
                <span>
                  {chatData.location} • {chatData.distance} km
                </span>
                {chatData.isOnline ? (
                  <Chip className='text-xs' color='success' size='sm' variant='flat'>
                    En línea
                  </Chip>
                ) : (
                  <span>Desconectado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Tooltip content='Llamada de voz'>
            <Button isIconOnly className='text-gray-400 hover:text-green-400' size='sm' variant='light' onPress={handleVoiceCall}>
              <Phone className='w-4 h-4' />
            </Button>
          </Tooltip>

          <Tooltip content='Videollamada'>
            <Button isIconOnly className='text-gray-400 hover:text-blue-400' size='sm' variant='light' onPress={handleVideoCall}>
              <Video className='w-4 h-4' />
            </Button>
          </Tooltip>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly className='text-gray-400 hover:text-gray-200' size='sm' variant='light'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label='Opciones del chat'
              classNames={{
                base: 'bg-gray-800 border-gray-600',
                content: 'bg-gray-800'
              }}>
              <DropdownItem key='info' className='text-gray-200 hover:bg-gray-700' startContent={<Info className='w-4 h-4' />}>
                Ver perfil
              </DropdownItem>
              <DropdownItem
                key='mute'
                className='text-gray-200 hover:bg-gray-700'
                startContent={<VolumeX className='w-4 h-4' />}
                onPress={handleMuteChat}>
                Silenciar
              </DropdownItem>
              <DropdownItem
                key='block'
                className='text-warning-400 hover:bg-warning-400/10'
                startContent={<Shield className='w-4 h-4' />}
                onPress={handleBlockUser}>
                Bloquear
              </DropdownItem>
              <DropdownItem
                key='report'
                className='text-danger-400 hover:bg-danger-400/10'
                startContent={<Flag className='w-4 h-4' />}
                onPress={handleReportUser}>
                Reportar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>

      {/* Área de mensajes */}
      <CardBody className='flex-1 overflow-y-auto p-4 space-y-4'>
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Separador de fecha */}
            <div className='flex items-center justify-center my-4'>
              <div className='bg-gray-700/50 px-3 py-1 rounded-full'>
                <span className='text-xs text-gray-400'>{date}</span>
              </div>
            </div>

            {/* Mensajes del día */}
            {dayMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.sender === 'me' ? 'bg-primary-500 text-white' : 'bg-gray-700/50 text-gray-200'
                  }`}>
                  <p className='text-sm'>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <span className='text-xs opacity-70'>{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'me' && getMessageStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Indicador de que está escribiendo */}
        {isTyping && (
          <div className='flex justify-start'>
            <div className='bg-gray-700/50 px-4 py-2 rounded-2xl'>
              <div className='flex items-center gap-2'>
                <div className='flex space-x-1'>
                  <div className='w-1 h-1 bg-gray-400 rounded-full animate-bounce' />
                  <div className='w-1 h-1 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }} />
                  <div className='w-1 h-1 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }} />
                </div>
                <span className='text-xs text-gray-400'>{chatData.name} está escribiendo...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardBody>

      {/* Input de mensaje */}
      <div className='p-4 border-t border-gray-700/50'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Tooltip content='Adjuntar archivo'>
              <Button isIconOnly className='text-gray-400 hover:text-gray-200' size='sm' variant='light'>
                <Paperclip className='w-4 h-4' />
              </Button>
            </Tooltip>

            <Tooltip content='Enviar imagen'>
              <Button isIconOnly className='text-gray-400 hover:text-gray-200' size='sm' variant='light'>
                <ImageIcon className='w-4 h-4' />
              </Button>
            </Tooltip>

            <Tooltip content='Emojis'>
              <Button isIconOnly className='text-gray-400 hover:text-gray-200' size='sm' variant='light'>
                <Smile className='w-4 h-4' />
              </Button>
            </Tooltip>
          </div>

          <Input
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-700/30 border-gray-600 focus-within:border-primary-500'
            }}
            endContent={
              <Button
                isIconOnly
                className={!message.trim() ? 'text-gray-400' : ''}
                color='primary'
                isDisabled={!message.trim()}
                size='sm'
                variant={message.trim() ? 'solid' : 'light'}
                onPress={handleSendMessage}>
                <Send className='w-4 h-4' />
              </Button>
            }
            placeholder='Escribe un mensaje...'
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Tips de conversación */}
        <div className='mt-3 text-center'>
          <p className='text-xs text-gray-500'>💡 Tip: Haz preguntas abiertas para mantener una conversación fluida</p>
        </div>
      </div>
    </div>
  )
}

export default ChatSection
