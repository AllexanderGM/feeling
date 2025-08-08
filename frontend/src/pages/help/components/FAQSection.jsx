import { useState, useMemo } from 'react'
import { Accordion, AccordionItem, Chip, Input } from '@heroui/react'
import { Search, ChevronDown, Heart, Users, Shield, Settings, Zap, MessageCircle } from 'lucide-react'

const FAQSection = ({ searchTerm = '' }) => {
  const [localSearch, setLocalSearch] = useState('')

  // Usar el término de búsqueda global o local
  const currentSearchTerm = searchTerm || localSearch

  const faqData = [
    {
      category: 'Primeros Pasos',
      icon: <Users className='w-4 h-4' />,
      color: 'primary',
      questions: [
        {
          id: 'getting-started-1',
          question: '¿Cómo creo mi perfil en Feeling?',
          answer:
            'Para crear tu perfil, primero regístrate con tu email, verifica tu cuenta y luego completa el proceso de configuración del perfil que incluye información básica, características personales y preferencias de búsqueda.'
        },
        {
          id: 'getting-started-2',
          question: '¿Qué son las categorías Essence, Rouse y Spirit?',
          answer:
            'Son las tres categorías principales de conexión en Feeling: Essence se enfoca en conexiones emocionales y románticas tradicionales, Rouse está dirigida a la comunidad LGBTI+ con opciones específicas, y Spirit se centra en conexiones basadas en valores espirituales y religiosos.'
        },
        {
          id: 'getting-started-3',
          question: '¿Es obligatorio completar todo el perfil?',
          answer:
            'Aunque no es obligatorio completar el 100% del perfil, recomendamos hacerlo para obtener mejores matches. Un perfil completo aumenta tus posibilidades de encontrar conexiones compatibles.'
        },
        {
          id: 'getting-started-4',
          question: '¿Puedo cambiar mi categoría después de registrarme?',
          answer:
            'Sí, puedes cambiar tu categoría de interés en cualquier momento desde tu perfil. Ve a la sección de Preferencias y selecciona la categoría que mejor se adapte a lo que buscas.'
        }
      ]
    },
    {
      category: 'Matches y Conexiones',
      icon: <Heart className='w-4 h-4' />,
      color: 'danger',
      questions: [
        {
          id: 'matches-1',
          question: '¿Cómo funciona el sistema de matches?',
          answer:
            'El sistema de matches utiliza tus preferencias de edad, ubicación, categoría de interés y características personales para sugerir personas compatibles. Cuando ambas personas se dan "like", se genera un match.'
        },
        {
          id: 'matches-2',
          question: '¿Cuántos intentos de match tengo por día?',
          answer:
            'Tienes un número limitado de intentos de match por día que se renueva automáticamente cada 24 horas. Puedes ver tus intentos restantes en la página principal.'
        },
        {
          id: 'matches-3',
          question: '¿Puedo ver quién me dio like?',
          answer:
            'Los matches solo se revelan cuando hay compatibilidad mutua. No puedes ver quién te dio like hasta que tú también le des like a esa persona.'
        },
        {
          id: 'matches-4',
          question: '¿Qué pasa si no me gusta un match?',
          answer:
            'Puedes deshacer un match o simplemente no interactuar con esa persona. También puedes ajustar tus preferencias de búsqueda para obtener sugerencias más acordes a lo que buscas.'
        }
      ]
    },
    {
      category: 'Privacidad y Seguridad',
      icon: <Shield className='w-4 h-4' />,
      color: 'success',
      questions: [
        {
          id: 'privacy-1',
          question: '¿Mis datos están seguros en Feeling?',
          answer:
            'Sí, utilizamos encriptación de datos y seguimos las mejores prácticas de seguridad. Nunca vendemos tu información personal y tienes control total sobre la visibilidad de tu perfil.'
        },
        {
          id: 'privacy-2',
          question: '¿Puedo controlar quién ve mi perfil?',
          answer:
            'Absolutamente. Puedes configurar tu perfil como público, privado o solo visible para tus conexiones. También puedes controlar qué información específica mostrar.'
        },
        {
          id: 'privacy-3',
          question: '¿Cómo reporto a un usuario inapropiado?',
          answer:
            'Puedes reportar cualquier comportamiento inapropiado usando el botón de reporte en el perfil del usuario. Nuestro equipo revisa todos los reportes y toma las medidas necesarias.'
        },
        {
          id: 'privacy-4',
          question: '¿Puedo bloquear a alguien?',
          answer:
            'Sí, puedes bloquear a cualquier usuario. Una vez bloqueado, no podrán verte en búsquedas ni contactarte, y tú tampoco los verás.'
        }
      ]
    },
    {
      category: 'Configuración de Cuenta',
      icon: <Settings className='w-4 h-4' />,
      color: 'warning',
      questions: [
        {
          id: 'settings-1',
          question: '¿Cómo cambio mi contraseña?',
          answer:
            'Ve a Configuración > Seguridad > Cambiar contraseña. Necesitarás tu contraseña actual y la nueva contraseña debe cumplir con los requisitos de seguridad.'
        },
        {
          id: 'settings-2',
          question: '¿Qué es la autenticación de dos factores?',
          answer:
            'Es una capa adicional de seguridad que requiere un código de verificación además de tu contraseña. Te recomendamos activarla para mayor protección de tu cuenta.'
        },
        {
          id: 'settings-3',
          question: '¿Cómo actualizo mi ubicación?',
          answer:
            'Puedes actualizar tu ubicación desde tu perfil en la sección de información personal. Esto afectará las sugerencias de personas cerca de ti.'
        },
        {
          id: 'settings-4',
          question: '¿Puedo pausar mi cuenta temporalmente?',
          answer:
            'Actualmente no hay opción de pausa, pero puedes hacer tu perfil invisible en búsquedas desde la configuración de privacidad.'
        }
      ]
    },
    {
      category: 'Mensajes y Comunicación',
      icon: <MessageCircle className='w-4 h-4' />,
      color: 'secondary',
      questions: [
        {
          id: 'messages-1',
          question: '¿Cuándo puedo enviar mensajes?',
          answer:
            'Puedes enviar mensajes una vez que hayas hecho match con alguien. Esto asegura que ambas personas están interesadas en conversar.'
        },
        {
          id: 'messages-2',
          question: '¿Hay límite en los mensajes?',
          answer:
            'No hay límite en el número de mensajes que puedes enviar a tus matches. Puedes conversar libremente una vez establecida la conexión.'
        },
        {
          id: 'messages-3',
          question: '¿Puedo enviar fotos en los mensajes?',
          answer:
            'Actualmente solo se permiten mensajes de texto. Estamos trabajando en agregar más opciones de comunicación en futuras actualizaciones.'
        },
        {
          id: 'messages-4',
          question: '¿Cómo sé si leyeron mi mensaje?',
          answer: 'El sistema muestra indicadores de entrega y lectura de mensajes para que sepas el estado de tus conversaciones.'
        }
      ]
    },
    {
      category: 'Problemas Técnicos',
      icon: <Zap className='w-4 h-4' />,
      color: 'primary',
      questions: [
        {
          id: 'technical-1',
          question: 'La aplicación no carga correctamente',
          answer:
            'Intenta refrescar la página o limpiar el caché del navegador. Si el problema persiste, contacta al soporte técnico con detalles sobre tu navegador y sistema operativo.'
        },
        {
          id: 'technical-2',
          question: 'No puedo subir fotos a mi perfil',
          answer:
            'Verifica que las imágenes sean en formato JPG, PNG o WebP y no excedan 5MB cada una. También asegúrate de tener una conexión estable a internet.'
        },
        {
          id: 'technical-3',
          question: 'No recibo notificaciones',
          answer:
            'Revisa la configuración de notificaciones en tu perfil y asegúrate de que tu navegador tiene permisos para mostrar notificaciones de Feeling.'
        },
        {
          id: 'technical-4',
          question: '¿Hay una aplicación móvil?',
          answer:
            'Feeling está optimizada para funcionar en navegadores móviles. Puedes agregar un acceso directo a tu pantalla de inicio para una experiencia similar a una app nativa.'
        }
      ]
    }
  ]

  // Filtrar preguntas basado en el término de búsqueda
  const filteredFAQ = useMemo(() => {
    if (!currentSearchTerm.trim()) return faqData

    const searchLower = currentSearchTerm.toLowerCase()

    return faqData
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.question.toLowerCase().includes(searchLower) || q.answer.toLowerCase().includes(searchLower)
        )
      }))
      .filter(category => category.questions.length > 0)
  }, [currentSearchTerm])

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-xl font-bold text-gray-200 mb-2'>Preguntas Frecuentes</h2>
        <p className='text-gray-400'>Encuentra respuestas rápidas a las dudas más comunes</p>
      </div>

      {/* Buscador local si no hay término global */}
      {!searchTerm && (
        <div className='max-w-md mx-auto'>
          <Input
            placeholder='Buscar en preguntas frecuentes...'
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            startContent={<Search className='w-4 h-4 text-gray-400' />}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-700/50'
            }}
          />
        </div>
      )}

      {/* Estadísticas de búsqueda */}
      {currentSearchTerm && (
        <div className='text-center'>
          <Chip color='primary' variant='flat' size='sm'>
            {filteredFAQ.reduce((total, category) => total + category.questions.length, 0)} resultado(s) para "{currentSearchTerm}"
          </Chip>
        </div>
      )}

      {/* Categorías y preguntas */}
      <div className='space-y-6'>
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map(category => (
            <div key={category.category} className='space-y-3'>
              {/* Header de categoría */}
              <div className='flex items-center gap-2 pb-2 border-b border-gray-700/50'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${category.color}-500/20`}>{category.icon}</div>
                <h3 className='text-lg font-semibold text-gray-200'>{category.category}</h3>
                <Chip size='sm' color={category.color} variant='flat'>
                  {category.questions.length}
                </Chip>
              </div>

              {/* Accordion de preguntas */}
              <Accordion
                variant='splitted'
                className='px-0'
                itemClasses={{
                  base: 'bg-gray-700/30 border border-gray-600/30',
                  title: 'text-gray-200 text-sm font-medium',
                  content: 'text-gray-300 text-sm pb-4',
                  trigger: 'hover:bg-gray-600/30',
                  indicator: 'text-gray-400'
                }}>
                {category.questions.map(faq => (
                  <AccordionItem
                    key={faq.id}
                    aria-label={faq.question}
                    title={faq.question}
                    indicator={<ChevronDown className='w-4 h-4' />}>
                    <div className='text-gray-300 leading-relaxed'>{faq.answer}</div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className='text-center py-12'>
            <Search className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>No se encontraron resultados</h3>
            <p className='text-gray-500'>Intenta con otros términos de búsqueda o explora las categorías disponibles</p>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center'>
        <p className='text-blue-300 text-sm mb-2'>¿No encontraste lo que buscabas?</p>
        <p className='text-blue-200 text-xs'>Contacta a nuestro equipo de soporte para obtener ayuda personalizada</p>
      </div>
    </div>
  )
}

export default FAQSection
