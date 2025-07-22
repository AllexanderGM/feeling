import { useState, useMemo } from 'react'
import { Card, CardBody, Button, Chip, Progress, Input } from '@heroui/react'
import { 
  BookOpen, 
  Users, 
  Heart, 
  Shield, 
  Settings, 
  Camera, 
  MessageCircle,
  Search,
  Clock,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react'

const GuidesSection = ({ searchTerm = '' }) => {
  const [localSearch, setLocalSearch] = useState('')
  const [selectedGuide, setSelectedGuide] = useState(null)
  
  const currentSearchTerm = searchTerm || localSearch

  const guides = [
    {
      id: 'complete-profile',
      title: 'Cómo completar tu perfil',
      description: 'Guía paso a paso para crear un perfil atractivo y completo',
      category: 'Primeros Pasos',
      difficulty: 'Fácil',
      estimatedTime: '5-10 min',
      icon: <Users className="w-5 h-5" />,
      color: 'primary',
      completionRate: 85,
      steps: [
        {
          title: 'Información Básica',
          description: 'Completa tu nombre, edad, ubicación y descripción personal',
          details: 'Una buena descripción debe ser auténtica, positiva y mostrar tu personalidad. Evita información muy personal como números de teléfono o direcciones.'
        },
        {
          title: 'Características Personales',
          description: 'Agrega detalles sobre tu físico, educación, profesión y estilo de vida',
          details: 'Estos datos ayudan a encontrar personas más compatibles contigo. Sé honesto pero destaca tus mejores cualidades.'
        },
        {
          title: 'Subir Fotos',
          description: 'Agrega al menos 3 fotos de buena calidad que te representen',
          details: 'Usa fotos recientes, con buena iluminación y donde se te vea claramente. Incluye al menos una foto de cuerpo completo.'
        },
        {
          title: 'Configurar Preferencias',
          description: 'Define qué tipo de conexiones buscas y tus filtros de búsqueda',
          details: 'Elige tu categoría de interés, rango de edad, distancia máxima y otros criterios importantes para ti.'
        }
      ]
    },
    {
      id: 'perfect-match',
      title: 'Cómo hacer matches exitosos',
      description: 'Estrategias para aumentar tus posibilidades de conexión',
      category: 'Conexiones',
      difficulty: 'Intermedio',
      estimatedTime: '10-15 min',
      icon: <Heart className="w-5 h-5" />,
      color: 'danger',
      completionRate: 78,
      steps: [
        {
          title: 'Optimiza tu perfil',
          description: 'Asegúrate de que tu perfil esté completo y sea atractivo',
          details: 'Un perfil completo genera 3x más matches. Revisa tu descripción, fotos y preferencias regularmente.'
        },
        {
          title: 'Usa fotos de calidad',
          description: 'Sube fotos que muestren tu personalidad y estilo de vida',
          details: 'Las fotos con sonrisa genuina, en exteriores y haciendo actividades que disfrutas son más atractivas.'
        },
        {
          title: 'Sé selectivo/a',
          description: 'No des like a todo el mundo, sé estratégico en tus decisiones',
          details: 'La calidad es mejor que la cantidad. Tómate tiempo para leer los perfiles antes de decidir.'
        },
        {
          title: 'Inicia conversaciones interesantes',
          description: 'Envía mensajes personalizados basados en su perfil',
          details: 'Evita saludos genéricos. Menciona algo específico de su perfil o haz una pregunta interesante.'
        }
      ]
    },
    {
      id: 'privacy-security',
      title: 'Configuración de privacidad y seguridad',
      description: 'Protege tu información y controla tu visibilidad',
      category: 'Seguridad',
      difficulty: 'Intermedio',
      estimatedTime: '8-12 min',
      icon: <Shield className="w-5 h-5" />,
      color: 'success',
      completionRate: 92,
      steps: [
        {
          title: 'Configurar visibilidad del perfil',
          description: 'Decide quién puede ver tu perfil y cómo apareces en búsquedas',
          details: 'Puedes hacer tu perfil público, privado o visible solo para conexiones. También puedes ocultar información específica.'
        },
        {
          title: 'Gestionar información personal',
          description: 'Controla qué datos personales compartes públicamente',
          details: 'Considera ocultar tu ubicación exacta, edad o última conexión si prefieres mayor privacidad.'
        },
        {
          title: 'Configurar notificaciones',
          description: 'Personaliza qué notificaciones quieres recibir y cómo',
          details: 'Puedes recibir notificaciones por email, push o dentro de la app para matches, mensajes y actualizaciones.'
        },
        {
          title: 'Activar autenticación de dos factores',
          description: 'Agrega una capa extra de seguridad a tu cuenta',
          details: 'La autenticación de dos factores protege tu cuenta incluso si alguien conoce tu contraseña.'
        }
      ]
    },
    {
      id: 'messaging-tips',
      title: 'Guía de mensajería efectiva',
      description: 'Aprende a mantener conversaciones interesantes y exitosas',
      category: 'Comunicación',
      difficulty: 'Intermedio',
      estimatedTime: '12-18 min',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'secondary',
      completionRate: 71,
      steps: [
        {
          title: 'Primer mensaje perfecto',
          description: 'Cómo romper el hielo de manera efectiva',
          details: 'Lee su perfil completamente, encuentra puntos en común y haz una pregunta específica o comenta algo que te llamó la atención.'
        },
        {
          title: 'Mantener el interés',
          description: 'Técnicas para conversaciones dinámicas y entretenidas',
          details: 'Alterna entre preguntas y comentarios, comparte experiencias personales y muestra interés genuino en sus respuestas.'
        },
        {
          title: 'Cuándo proponer una cita',
          description: 'Timing perfecto para dar el siguiente paso',
          details: 'Generalmente después de 5-10 mensajes cuando sientes conexión. Propón algo casual y en un lugar público.'
        },
        {
          title: 'Evitar errores comunes',
          description: 'Qué no hacer en las conversaciones de dating',
          details: 'Evita mensajes muy largos, preguntas muy personales al inicio, hablar solo de ti mismo o presionar para respuestas inmediatas.'
        }
      ]
    },
    {
      id: 'photo-guide',
      title: 'Guía completa de fotos de perfil',
      description: 'Cómo tomar y seleccionar las mejores fotos para tu perfil',
      category: 'Perfil',
      difficulty: 'Fácil',
      estimatedTime: '15-20 min',
      icon: <Camera className="w-5 h-5" />,
      color: 'warning',
      completionRate: 89,
      steps: [
        {
          title: 'Foto principal perfecta',
          description: 'Cómo elegir y tomar tu foto de portada',
          details: 'Debe ser un primer plano claro de tu rostro, con sonrisa natural, buena iluminación y fondo simple.'
        },
        {
          title: 'Variedad de fotos',
          description: 'Tipos de fotos que debes incluir en tu galería',
          details: 'Incluye: foto de rostro, cuerpo completo, haciendo actividades que disfrutas, con amigos (sin exagerar) y en diferentes contextos.'
        },
        {
          title: 'Calidad técnica',
          description: 'Aspectos técnicos para fotos de alta calidad',
          details: 'Usa buena iluminación (luz natural es mejor), enfoque nítido, resolución adecuada y evita filtros excesivos.'
        },
        {
          title: 'Qué evitar',
          description: 'Errores comunes en fotos de perfil',
          details: 'Evita: fotos borrosas, con ex parejas, demasiado editadas, solo grupales, con lentes de sol en todas, o muy antiguas.'
        }
      ]
    }
  ]

  // Filtrar guías basado en el término de búsqueda
  const filteredGuides = useMemo(() => {
    if (!currentSearchTerm.trim()) return guides

    const searchLower = currentSearchTerm.toLowerCase()
    
    return guides.filter(guide => 
      guide.title.toLowerCase().includes(searchLower) ||
      guide.description.toLowerCase().includes(searchLower) ||
      guide.category.toLowerCase().includes(searchLower) ||
      guide.steps.some(step => 
        step.title.toLowerCase().includes(searchLower) ||
        step.description.toLowerCase().includes(searchLower)
      )
    )
  }, [currentSearchTerm])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'success'
      case 'Intermedio': return 'warning'
      case 'Avanzado': return 'danger'
      default: return 'default'
    }
  }

  if (selectedGuide) {
    const guide = guides.find(g => g.id === selectedGuide)
    return (
      <div className="space-y-6">
        {/* Header de la guía */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-700/50">
          <Button
            variant="light"
            size="sm"
            onPress={() => setSelectedGuide(null)}
            startContent={<ArrowRight className="w-4 h-4 rotate-180" />}
          >
            Volver a guías
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${guide.color}-500/20 flex items-center justify-center`}>
              {guide.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-200">{guide.title}</h2>
              <p className="text-sm text-gray-400">{guide.description}</p>
            </div>
          </div>
        </div>

        {/* Información de la guía */}
        <div className="flex flex-wrap items-center gap-3">
          <Chip color={guide.color} variant="flat" size="sm">
            {guide.category}
          </Chip>
          <Chip color={getDifficultyColor(guide.difficulty)} variant="flat" size="sm">
            {guide.difficulty}
          </Chip>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{guide.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress 
              size="sm" 
              value={guide.completionRate} 
              color="success"
              className="w-20"
              aria-label={`Guía completada por ${guide.completionRate}% de usuarios`}
            />
            <span className="text-xs text-gray-400">{guide.completionRate}% completado por usuarios</span>
          </div>
        </div>

        {/* Pasos de la guía */}
        <div className="space-y-4">
          {guide.steps.map((step, index) => (
            <Card key={index} className="bg-gray-700/30 border-gray-600/30">
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-${guide.color}-500/20 flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold text-${guide.color}-400`}>{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Footer de la guía */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">¡Guía completada!</span>
          </div>
          <p className="text-green-200 text-sm">
            Aplica estos consejos y mejora tu experiencia en Feeling
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200 mb-2">Guías de Uso</h2>
        <p className="text-gray-400">Tutoriales paso a paso para dominar todas las funciones</p>
      </div>

      {/* Buscador local */}
      {!searchTerm && (
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Buscar guías..."
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
            {filteredGuides.length} guía(s) encontrada(s) para "{currentSearchTerm}"
          </Chip>
        </div>
      )}

      {/* Grid de guías */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => (
            <Card 
              key={guide.id} 
              isPressable
              onPress={() => setSelectedGuide(guide.id)}
              className="bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <CardBody className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${guide.color}-500/20 flex items-center justify-center shrink-0`}>
                    {guide.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200 mb-1">{guide.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{guide.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Chip color={guide.color} variant="flat" size="sm">
                    {guide.category}
                  </Chip>
                  <Chip color={getDifficultyColor(guide.difficulty)} variant="flat" size="sm">
                    {guide.difficulty}
                  </Chip>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{guide.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{guide.steps.length} pasos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      size="sm" 
                      value={guide.completionRate} 
                      color="success"
                      className="w-16"
                      aria-label={`Progreso de guía: ${guide.completionRate}%`}
                    />
                    <span className="text-xs text-gray-400">{guide.completionRate}%</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron guías</h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}
    </div>
  )
}

export default GuidesSection