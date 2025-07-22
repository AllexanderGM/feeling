import { useState, useMemo } from 'react'
import { Card, CardBody, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react'
import { 
  Video, 
  Play, 
  Users, 
  Heart, 
  Shield, 
  Camera,
  MessageCircle,
  Settings,
  Search,
  Clock,
  Eye,
  BookOpen,
  Download
} from 'lucide-react'

const TutorialsSection = ({ searchTerm = '' }) => {
  const [localSearch, setLocalSearch] = useState('')
  const [selectedTutorial, setSelectedTutorial] = useState(null)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  
  const currentSearchTerm = searchTerm || localSearch

  const tutorials = [
    {
      id: 'getting-started',
      title: 'Primeros pasos en Feeling',
      description: 'Tutorial completo para nuevos usuarios',
      category: 'Básico',
      duration: '8:45',
      views: 15420,
      difficulty: 'Principiante',
      thumbnail: '🚀',
      icon: <Users className="w-5 h-5" />,
      color: 'primary',
      topics: [
        'Registro y verificación de cuenta',
        'Completar perfil básico',
        'Subir primeras fotos',
        'Configurar preferencias iniciales',
        'Navegar por la interfaz'
      ],
      videoUrl: '#', // En una implementación real, esto sería una URL de video
      transcript: 'Transcripción del video tutorial sobre primeros pasos...'
    },
    {
      id: 'perfect-profile',
      title: 'Cómo crear el perfil perfecto',
      description: 'Consejos para un perfil atractivo y exitoso',
      category: 'Perfil',
      duration: '12:30',
      views: 23150,
      difficulty: 'Intermedio',
      thumbnail: '📸',
      icon: <Camera className="w-5 h-5" />,
      color: 'warning',
      topics: [
        'Selección de fotos ganadoras',
        'Escribir descripción atractiva',
        'Optimizar información personal',
        'Configurar intereses y hobbies',
        'Errores comunes a evitar'
      ],
      videoUrl: '#',
      transcript: 'Transcripción del tutorial sobre creación de perfil perfecto...'
    },
    {
      id: 'matching-strategy',
      title: 'Estrategias de matching exitoso',
      description: 'Cómo aumentar tus matches y conexiones',
      category: 'Matches',
      duration: '10:15',
      views: 18750,
      difficulty: 'Intermedio',
      thumbnail: '💝',
      icon: <Heart className="w-5 h-5" />,
      color: 'danger',
      topics: [
        'Entender el algoritmo de matches',
        'Optimizar filtros de búsqueda',
        'Timing perfecto para dar likes',
        'Analizar perfiles compatibles',
        'Aumentar tu atractivo digital'
      ],
      videoUrl: '#',
      transcript: 'Transcripción del tutorial sobre estrategias de matching...'
    },
    {
      id: 'messaging-mastery',
      title: 'Maestría en mensajería',
      description: 'De match a cita: conversaciones exitosas',
      category: 'Comunicación',
      duration: '15:20',
      views: 31200,
      difficulty: 'Avanzado',
      thumbnail: '💬',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'secondary',
      topics: [
        'Primers mensajes que funcionan',
        'Mantener conversaciones interesantes',
        'Cuándo y cómo proponer una cita',
        'Leer señales de interés',
        'Recuperar conversaciones frías'
      ],
      videoUrl: '#',
      transcript: 'Transcripción del tutorial sobre mensajería efectiva...'
    },
    {
      id: 'privacy-security',
      title: 'Privacidad y seguridad total',
      description: 'Protege tu información y mantente seguro',
      category: 'Seguridad',
      duration: '9:30',
      views: 12350,
      difficulty: 'Intermedio',
      thumbnail: '🔒',
      icon: <Shield className="w-5 h-5" />,
      color: 'success',
      topics: [
        'Configurar privacidad de perfil',
        'Gestionar información visible',
        'Activar autenticación 2FA',
        'Reconocer y reportar perfiles falsos',
        'Consejos para citas seguras'
      ],
      videoUrl: '#',
      transcript: 'Transcripción del tutorial sobre privacidad y seguridad...'
    },
    {
      id: 'advanced-features',
      title: 'Funciones avanzadas',
      description: 'Maximiza tu experiencia con herramientas pro',
      category: 'Avanzado',
      duration: '18:45',
      views: 8900,
      difficulty: 'Avanzado',
      thumbnail: '⚡',
      icon: <Settings className="w-5 h-5" />,
      color: 'primary',
      topics: [
        'Filtros avanzados de búsqueda',
        'Analíticas de perfil',
        'Gestión de múltiples conversaciones',
        'Configuraciones de notificaciones',
        'Trucos y consejos de expertos'
      ],
      videoUrl: '#',
      transcript: 'Transcripción del tutorial sobre funciones avanzadas...'
    }
  ]

  // Filtrar tutoriales basado en el término de búsqueda
  const filteredTutorials = useMemo(() => {
    if (!currentSearchTerm.trim()) return tutorials

    const searchLower = currentSearchTerm.toLowerCase()
    
    return tutorials.filter(tutorial => 
      tutorial.title.toLowerCase().includes(searchLower) ||
      tutorial.description.toLowerCase().includes(searchLower) ||
      tutorial.category.toLowerCase().includes(searchLower) ||
      tutorial.topics.some(topic => topic.toLowerCase().includes(searchLower))
    )
  }, [currentSearchTerm])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Principiante': return 'success'
      case 'Intermedio': return 'warning'
      case 'Avanzado': return 'danger'
      default: return 'default'
    }
  }

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`
    }
    return views.toString()
  }

  const handleWatchTutorial = (tutorial) => {
    setSelectedTutorial(tutorial)
    onOpen()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200 mb-2">Tutoriales en Video</h2>
        <p className="text-gray-400">Aprende visualmente con nuestros tutoriales paso a paso</p>
      </div>

      {/* Buscador local */}
      {!searchTerm && (
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Buscar tutoriales..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            classNames={{
              input: "text-gray-200",
              inputWrapper: "bg-gray-700/50"
            }}
          />
        </div>
      )}

      {/* Estadísticas de búsqueda */}
      {currentSearchTerm && (
        <div className="text-center">
          <Chip color="primary" variant="flat" size="sm">
            {filteredTutorials.length} tutorial(es) encontrado(s) para "{currentSearchTerm}"
          </Chip>
        </div>
      )}

      {/* Grid de tutoriales */}
      {filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTutorials.map((tutorial) => (
            <Card 
              key={tutorial.id} 
              className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <CardBody className="p-0">
                {/* Thumbnail del video */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-40 flex items-center justify-center">
                  <div className="text-4xl">{tutorial.thumbnail}</div>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      isIconOnly
                      color="primary"
                      className="bg-primary-600/90 hover:bg-primary-700"
                      onPress={() => handleWatchTutorial(tutorial)}
                    >
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>

                {/* Contenido del tutorial */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-${tutorial.color}-500/20 flex items-center justify-center shrink-0`}>
                      {tutorial.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-200 mb-1 line-clamp-1">{tutorial.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{tutorial.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Chip color={tutorial.color} variant="flat" size="sm">
                      {tutorial.category}
                    </Chip>
                    <Chip color={getDifficultyColor(tutorial.difficulty)} variant="flat" size="sm">
                      {tutorial.difficulty}
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(tutorial.views)} vistas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>

                  <Button
                    color="primary"
                    size="sm"
                    className="w-full"
                    startContent={<Play className="w-4 h-4" />}
                    onPress={() => handleWatchTutorial(tutorial)}
                  >
                    Ver Tutorial
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron tutoriales</h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Modal del reproductor de video */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="4xl"
        classNames={{
          base: "bg-gray-900/95 backdrop-blur-sm",
          header: "border-b border-gray-700/50",
          body: "py-6",
          closeButton: "hover:bg-gray-800/50"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedTutorial && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${selectedTutorial.color}-500/20 flex items-center justify-center`}>
                      {selectedTutorial.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-200">{selectedTutorial.title}</h3>
                      <p className="text-sm text-gray-400 font-normal">{selectedTutorial.description}</p>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedTutorial && (
                  <div className="space-y-6">
                    {/* Placeholder del reproductor de video */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg h-64 sm:h-80 flex items-center justify-center border border-gray-700/50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{selectedTutorial.thumbnail}</div>
                        <Button
                          color="primary"
                          size="lg"
                          startContent={<Play className="w-5 h-5" />}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          Reproducir Tutorial
                        </Button>
                        <p className="text-sm text-gray-400 mt-2">Duración: {selectedTutorial.duration}</p>
                      </div>
                    </div>

                    {/* Información del tutorial */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Detalles */}
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-3">Detalles del tutorial</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duración:</span>
                            <span className="text-gray-300">{selectedTutorial.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Nivel:</span>
                            <Chip color={getDifficultyColor(selectedTutorial.difficulty)} variant="flat" size="sm">
                              {selectedTutorial.difficulty}
                            </Chip>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vistas:</span>
                            <span className="text-gray-300">{selectedTutorial.views.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Categoría:</span>
                            <Chip color={selectedTutorial.color} variant="flat" size="sm">
                              {selectedTutorial.category}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      {/* Temas cubiertos */}
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-3">Temas cubiertos</h4>
                        <ul className="space-y-2">
                          {selectedTutorial.topics.map((topic, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 shrink-0" />
                              <span className="text-gray-300">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Acciones adicionales */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700/50">
                      <Button
                        variant="bordered"
                        size="sm"
                        startContent={<BookOpen className="w-4 h-4" />}
                        className="border-gray-600 text-gray-300"
                      >
                        Ver Transcripción
                      </Button>
                      <Button
                        variant="bordered"
                        size="sm"
                        startContent={<Download className="w-4 h-4" />}
                        className="border-gray-600 text-gray-300"
                      >
                        Descargar Recursos
                      </Button>
                    </div>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Sección de próximos tutoriales */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="text-center">
          <Video className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="text-blue-300 font-medium mb-2">Próximos tutoriales</h3>
          <p className="text-blue-200 text-sm mb-3">
            Estamos trabajando en nuevos contenidos para ayudarte mejor
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Chip size="sm" variant="flat" color="primary">Dating avanzado</Chip>
            <Chip size="sm" variant="flat" color="primary">Eventos y actividades</Chip>
            <Chip size="sm" variant="flat" color="primary">Análisis de compatibilidad</Chip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialsSection