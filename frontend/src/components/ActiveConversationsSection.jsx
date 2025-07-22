import { useState, useMemo } from 'react'
import { Card, CardBody, Avatar, Button, Chip, Badge } from '@heroui/react'
import { 
  MessageCircle, 
  Users, 
  Send, 
  Clock, 
  Eye,
  MoreHorizontal,
  Trash2,
  Archive,
  VolumeX,
  Pin,
  Search
} from 'lucide-react'

const ActiveConversationsSection = ({ conversations, searchTerm, onSelectChat, getCategoryIcon }) => {
  const [hoveredConv, setHoveredConv] = useState(null)

  // Filtrar conversaciones basado en el término de búsqueda
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations

    const searchLower = searchTerm.toLowerCase()
    return conversations.filter(conv => 
      conv.name.toLowerCase().includes(searchLower) ||
      conv.location.toLowerCase().includes(searchLower) ||
      conv.lastMessage.toLowerCase().includes(searchLower)
    )
  }, [conversations, searchTerm])

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace unos minutos'
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays}d`
    return `Hace ${Math.floor(diffInDays / 7)}sem`
  }

  const handleArchiveConversation = (e, convId) => {
    e.stopPropagation()
    console.log('Archivar conversación:', convId)
  }

  const handleMuteConversation = (e, convId) => {
    e.stopPropagation()
    console.log('Silenciar conversación:', convId)
  }

  const handleDeleteConversation = (e, convId) => {
    e.stopPropagation()
    console.log('Eliminar conversación:', convId)
  }

  const handlePinConversation = (e, convId) => {
    e.stopPropagation()
    console.log('Fijar conversación:', convId)
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="text-center py-12">
        {searchTerm ? (
          <>
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron conversaciones</h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </>
        ) : (
          <>
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">¡Aún no tienes conversaciones activas!</h3>
            <p className="text-gray-500 mb-4">
              Cuando tengas nuevos matches, podrás iniciar conversaciones aquí
            </p>
            <Button
              color="primary"
              startContent={<Users className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary-500 to-purple-500"
            >
              Ver Nuevos Matches
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-200">
          Conversaciones Activas ({filteredConversations.length})
        </h2>
        <Chip color="primary" variant="flat" size="sm">
          {filteredConversations.filter(conv => conv.unreadCount > 0).length} con mensajes nuevos
        </Chip>
      </div>

      {/* Lista de conversaciones */}
      <div className="space-y-3">
        {filteredConversations.map((conversation) => (
          <Card 
            key={conversation.id}
            className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredConv(conversation.id)}
            onMouseLeave={() => setHoveredConv(null)}
          >
            <CardBody 
              className="p-4"
              onClick={() => onSelectChat(conversation)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar con estado */}
                <div className="relative shrink-0">
                  <Avatar
                    src={conversation.image}
                    alt={conversation.name}
                    className="w-14 h-14"
                  />
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full" />
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge
                      content={conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      color="danger"
                      size="sm"
                      className="absolute -top-1 -left-1"
                    />
                  )}
                </div>

                {/* Información de la conversación */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-200 truncate">{conversation.name}</h3>
                      {getCategoryIcon(conversation.category)}
                      <span className="text-xs text-gray-400">{conversation.age} años</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(conversation.lastMessageTime)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {conversation.isTyping ? (
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-primary-400 italic">escribiendo...</span>
                          </div>
                        ) : (
                          <p className={`text-sm truncate ${
                            conversation.unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-400'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{conversation.location} • {conversation.distance} km</span>
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className={`flex items-center gap-1 transition-opacity ${
                      hoveredConv === conversation.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-400 hover:text-blue-400"
                        onPress={(e) => handlePinConversation(e, conversation.id)}
                      >
                        <Pin className="w-3 h-3" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-400 hover:text-yellow-400"
                        onPress={(e) => handleMuteConversation(e, conversation.id)}
                      >
                        <VolumeX className="w-3 h-3" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-400 hover:text-gray-300"
                        onPress={(e) => handleArchiveConversation(e, conversation.id)}
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Botón de mensaje rápido */}
                <div className="shrink-0">
                  <Button
                    size="sm"
                    color="primary"
                    variant={conversation.unreadCount > 0 ? "solid" : "bordered"}
                    className={conversation.unreadCount > 0 ? "" : "border-gray-600 text-gray-300"}
                    startContent={<Send className="w-3 h-3" />}
                    onPress={() => onSelectChat(conversation)}
                  >
                    {conversation.unreadCount > 0 ? 'Responder' : 'Mensaje'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Consejos para conversaciones */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-300 font-medium">Consejos para mejores conversaciones</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-green-200 text-sm">
          <div>• Responde dentro de las primeras 24 horas</div>
          <div>• Haz preguntas abiertas para mantener el diálogo</div>
          <div>• Muestra interés genuino en sus respuestas</div>
          <div>• Comparte experiencias personales relevantes</div>
        </div>
      </div>

      {/* Estadísticas de conversaciones */}
      {filteredConversations.length > 3 && (
        <Card className="bg-gray-700/20 border-gray-600/20">
          <CardBody className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {filteredConversations.length}
                </div>
                <div className="text-xs text-gray-400">Total activas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">
                  {filteredConversations.filter(c => c.unreadCount > 0).length}
                </div>
                <div className="text-xs text-gray-400">Con mensajes nuevos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">
                  {filteredConversations.filter(c => c.isOnline).length}
                </div>
                <div className="text-xs text-gray-400">En línea ahora</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {filteredConversations.filter(c => c.isTyping).length}
                </div>
                <div className="text-xs text-gray-400">Escribiendo</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default ActiveConversationsSection