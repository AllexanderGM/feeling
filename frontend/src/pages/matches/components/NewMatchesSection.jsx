import { useState, useMemo } from 'react'
import { Card, CardBody, Avatar, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Eye,
  Clock,
  Zap,
  X,
  Send
} from 'lucide-react'

const NewMatchesSection = ({ matches, searchTerm, getCategoryIcon }) => {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onOpenChange: onProfileOpenChange } = useDisclosure()

  // Filtrar matches basado en el término de búsqueda
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches

    const searchLower = searchTerm.toLowerCase()
    return matches.filter(match => 
      match.name.toLowerCase().includes(searchLower) ||
      match.location.toLowerCase().includes(searchLower) ||
      match.commonInterests.some(interest => interest.toLowerCase().includes(searchLower))
    )
  }, [matches, searchTerm])

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace unos minutos'
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays}d`
  }

  const handleViewProfile = (match) => {
    setSelectedMatch(match)
    onProfileOpen()
  }

  const handleStartConversation = (match) => {
    console.log('Iniciando conversación con:', match.name)
    // Aquí se implementaría la lógica para iniciar conversación
  }

  const handleSuperLike = (match) => {
    console.log('Super like a:', match.name)
    // Aquí se implementaría la lógica para super like
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="text-center py-12">
        {searchTerm ? (
          <>
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron matches</h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </>
        ) : (
          <>
            <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">¡Aún no tienes nuevos matches!</h3>
            <p className="text-gray-500 mb-4">
              Sigue explorando y conectando con personas increíbles
            </p>
            <Button
              color="primary"
              startContent={<Zap className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary-500 to-purple-500"
            >
              Buscar Más Personas
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
          Nuevos Matches ({filteredMatches.length})
        </h2>
        <Chip color="success" variant="flat" size="sm">
          ¡{filteredMatches.filter(m => m.isOnline).length} en línea!
        </Chip>
      </div>

      {/* Grid de matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match) => (
          <Card 
            key={match.id} 
            className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
          >
            <CardBody className="p-4">
              {/* Header del match */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      src={match.image}
                      alt={match.name}
                      className="w-12 h-12"
                    />
                    {match.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-200">{match.name}</h3>
                    <p className="text-sm text-gray-400">{match.age} años</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getCategoryIcon(match.category)}
                  <Chip size="sm" color="danger" variant="flat" className="text-xs">
                    {match.compatibility}% match
                  </Chip>
                </div>
              </div>

              {/* Información básica */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{match.location} • {match.distance} km</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Match {getTimeAgo(match.matchedAt)}</span>
                </div>
              </div>

              {/* Intereses comunes */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Intereses en común:</p>
                <div className="flex flex-wrap gap-1">
                  {match.interests?.slice(0, 3).map((interest, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="text-xs bg-primary-500/20 text-primary-300"
                    >
                      {interest}
                    </Chip>
                  ))}
                  {match.interests?.length > 3 && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="text-xs bg-gray-500/20 text-gray-300"
                    >
                      +{match.interests.length - 3}
                    </Chip>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="bordered"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/30"
                  startContent={<Eye className="w-3 h-3" />}
                  onPress={() => handleViewProfile(match)}
                >
                  Ver Perfil
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  className="flex-1"
                  startContent={<MessageCircle className="w-3 h-3" />}
                  onPress={() => handleStartConversation(match)}
                >
                  Mensaje
                </Button>
              </div>

              {/* Super like badge si aplica */}
              {match.compatibility >= 90 && (
                <div className="mt-2 text-center">
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-xs"
                    startContent={<Star className="w-3 h-3" />}
                    onPress={() => handleSuperLike(match)}
                  >
                    Super Like
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal de perfil detallado */}
      <Modal 
        isOpen={isProfileOpen} 
        onOpenChange={onProfileOpenChange}
        size="3xl"
        classNames={{
          base: "bg-gray-900/95 backdrop-blur-sm",
          header: "border-b border-gray-700/50",
          footer: "border-t border-gray-700/50",
          closeButton: "hover:bg-gray-800/50"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedMatch && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar
                        src={selectedMatch.image}
                        alt={selectedMatch.name}
                        className="w-16 h-16"
                      />
                      {selectedMatch.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-gray-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-200">{selectedMatch.name}</h3>
                      <p className="text-gray-400">{selectedMatch.age} años • {selectedMatch.location}</p>
                    </div>
                    <div className="ml-auto">
                      <Chip color="danger" variant="flat">
                        {selectedMatch.compatibility}% match
                      </Chip>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className="py-6">
                {selectedMatch && (
                  <div className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Información básica</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{selectedMatch.location} ({selectedMatch.distance} km)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{selectedMatch.age} años</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(selectedMatch.category)}
                            <span className="text-gray-300">Categoría {selectedMatch.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">Match {getTimeAgo(selectedMatch.matchedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Estado</h4>
                        <div className="space-y-2">
                          <Chip 
                            size="sm" 
                            color={selectedMatch.isOnline ? "success" : "default"}
                            variant="flat"
                          >
                            {selectedMatch.isOnline ? "En línea" : "Desconectado"}
                          </Chip>
                          <Chip size="sm" color="danger" variant="flat">
                            Nuevo match
                          </Chip>
                        </div>
                      </div>
                    </div>

                    {/* Intereses comunes */}
                    <div>
                      <h4 className="font-semibold text-gray-200 mb-3">Intereses en común</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.commonInterests.map((interest, index) => (
                          <Chip
                            key={index}
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="bg-primary-500/20 text-primary-300"
                          >
                            {interest}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    {/* Compatibilidad */}
                    <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        <span className="font-medium text-red-300">Alta compatibilidad</span>
                      </div>
                      <p className="text-red-200 text-sm">
                        Tienes un {selectedMatch.compatibility}% de compatibilidad con {selectedMatch.name}. 
                        ¡Es una excelente oportunidad para una conexión genuina!
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="light" 
                  onPress={onClose}
                  startContent={<X className="w-4 h-4" />}
                >
                  Cerrar
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    handleStartConversation(selectedMatch)
                    onClose()
                  }}
                  startContent={<Send className="w-4 h-4" />}
                >
                  Enviar Mensaje
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Footer con consejos */}
      {filteredMatches.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Consejo para nuevos matches</span>
          </div>
          <p className="text-blue-200 text-sm">
            ¡No olvides enviar un mensaje personalizado! Menciona algo específico de su perfil 
            o sus intereses para iniciar una conversación más auténtica.
          </p>
        </div>
      )}
    </div>
  )
}

export default NewMatchesSection