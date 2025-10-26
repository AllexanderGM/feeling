import { useState } from 'react'
import { Card, CardBody, Button, Accordion, AccordionItem, Chip } from '@heroui/react'
import {
  HelpCircle,
  Heart,
  Calendar,
  MessageSquare,
  User,
  Shield,
  CreditCard,
  Settings,
  Bug,
  AlertCircle,
  Send,
  Mail,
  ChevronRight,
  CheckCircle,
  BookOpen,
  FileText,
  Lock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'
import LiteContainer from '@components/layout/LiteContainer.jsx'

const Help = () => {
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState(new Set(['matches']))

  // FAQs por categoría
  const faqCategories = [
    {
      key: 'matches',
      title: 'Matches y Conexiones',
      icon: Heart,
      color: 'text-pink-400',
      questions: [
        {
          q: '¿Cómo funcionan los intentos de match?',
          a: 'Cada día recibes un número limitado de intentos para conectar con otros usuarios. Puedes comprar paquetes adicionales si necesitas más intentos.'
        },
        {
          q: '¿Qué pasa cuando hago match con alguien?',
          a: 'Cuando ambos se dan like mutuamente, se crea un match. Podrás ver el perfil completo de la persona y comenzar a chatear si ambos lo desean.'
        },
        {
          q: '¿Puedo cancelar un match?',
          a: 'Sí, puedes deshacer un match en cualquier momento desde tu lista de matches. La otra persona no será notificada.'
        },
        {
          q: '¿Cómo puedo ver quién me dio like?',
          a: 'Los usuarios con cuenta premium pueden ver quién les ha dado like antes de hacer match.'
        }
      ]
    },
    {
      key: 'events',
      title: 'Eventos y Actividades',
      icon: Calendar,
      color: 'text-blue-400',
      questions: [
        {
          q: '¿Cómo me inscribo a un evento?',
          a: 'Ve a la sección de Eventos, selecciona el evento que te interesa y haz clic en "Inscribirse". Algunos eventos pueden requerir pago.'
        },
        {
          q: '¿Puedo cancelar mi inscripción?',
          a: 'Sí, puedes cancelar tu inscripción hasta 24 horas antes del evento. Si pagaste, se te reembolsará el monto completo.'
        },
        {
          q: '¿Cómo sé si un evento fue confirmado?',
          a: 'Recibirás una notificación por email y en la app cuando tu inscripción sea confirmada. También puedes ver el estado en "Mis Eventos".'
        },
        {
          q: '¿Qué pasa si un evento se cancela?',
          a: 'Si el organizador cancela un evento, todos los participantes serán notificados y los pagos serán reembolsados automáticamente.'
        }
      ]
    },
    {
      key: 'account',
      title: 'Cuenta y Perfil',
      icon: User,
      color: 'text-purple-400',
      questions: [
        {
          q: '¿Cómo completo mi perfil?',
          a: 'Ve a tu perfil y haz clic en "Editar". Asegúrate de agregar fotos, completar tu descripción y responder las preguntas de compatibilidad.'
        },
        {
          q: '¿Puedo cambiar mi email o teléfono?',
          a: 'Sí, ve a Configuración > Información Personal para actualizar tu email o número de teléfono. Se requiere verificación.'
        },
        {
          q: '¿Cómo desactivo mi cuenta?',
          a: 'En Configuración, al final de la página encontrarás la opción "Desactivar cuenta". Tu perfil dejará de ser visible pero podrás reactivarlo después.'
        },
        {
          q: '¿Cómo elimino mi cuenta permanentemente?',
          a: 'Contacta a soporte para solicitar la eliminación permanente de tu cuenta. Este proceso es irreversible.'
        }
      ]
    },
    {
      key: 'privacy',
      title: 'Privacidad y Seguridad',
      icon: Shield,
      color: 'text-green-400',
      questions: [
        {
          q: '¿Quién puede ver mi perfil?',
          a: 'Puedes controlar la visibilidad de tu perfil en Configuración > Privacidad. Puedes elegir entre perfil público o privado.'
        },
        {
          q: '¿Cómo reporto a un usuario?',
          a: 'En el perfil del usuario, haz clic en los tres puntos y selecciona "Reportar". Describe el motivo y nuestro equipo lo revisará.'
        },
        {
          q: '¿Mis datos están seguros?',
          a: 'Sí, utilizamos encriptación de nivel bancario (SSL 256-bit) para proteger toda tu información. Nunca vendemos tus datos.'
        },
        {
          q: '¿Puedo bloquear a alguien?',
          a: 'Sí, puedes bloquear usuarios desde su perfil. No podrán ver tu perfil ni contactarte.'
        }
      ]
    },
    {
      key: 'payments',
      title: 'Pagos y Paquetes',
      icon: CreditCard,
      color: 'text-yellow-400',
      questions: [
        {
          q: '¿Qué métodos de pago aceptan?',
          a: 'Aceptamos tarjetas de crédito/débito, PSE y otros métodos locales a través de nuestra pasarela de pagos Wompi.'
        },
        {
          q: '¿Los paquetes de intentos expiran?',
          a: 'Sí, los intentos comprados son válidos por 30 días desde la fecha de compra. Después de ese tiempo, los intentos no utilizados expirarán.'
        },
        {
          q: '¿Puedo obtener un reembolso?',
          a: 'Los intentos no utilizados pueden ser reembolsados dentro de los primeros 7 días de la compra. Contacta a soporte para solicitarlo.'
        },
        {
          q: '¿Cómo veo mi historial de pagos?',
          a: 'Ve a Configuración > Pagos y Facturación para ver todas tus transacciones y descargar facturas.'
        }
      ]
    }
  ]

  // Guías rápidas
  const quickGuides = [
    {
      title: 'Cómo hacer tu primer match',
      steps: [
        'Completa tu perfil al 100%',
        'Ve a "Descubrir" o "Sugerencias"',
        'Dale like a los perfiles que te interesen',
        'Espera a que te den like de vuelta',
        '¡Match! Ahora pueden chatear'
      ],
      icon: Heart,
      color: 'pink'
    },
    {
      title: 'Inscríbete a eventos',
      steps: [
        'Explora eventos disponibles',
        'Selecciona uno que te guste',
        'Revisa detalles y requisitos',
        'Completa el pago si es necesario',
        'Confirma tu asistencia'
      ],
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Gestiona tu privacidad',
      steps: [
        'Ve a Configuración',
        'Selecciona "Privacidad y visibilidad"',
        'Ajusta quién puede ver tu perfil',
        'Controla qué información compartes',
        'Guarda los cambios'
      ],
      icon: Shield,
      color: 'green'
    }
  ]

  // Handlers de navegación
  const handleReportBug = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'bug' } })
  }

  const handleComplaint = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'complaint' } })
  }

  const handleSuggestion = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'suggestion' } })
  }

  const handleContactSupport = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'general' } })
  }

  return (
    <LiteContainer ariaLabel='Centro de ayuda' className='gap-4'>
      {/* Header */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <HelpCircle className='w-5 h-5 text-blue-400' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-gray-200'>Centro de Ayuda</h1>
              <p className='text-sm text-gray-400'>Encuentra respuestas, aprende y obtén soporte personalizado</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Preguntas Frecuentes */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-purple-500/20 rounded-lg'>
              <MessageSquare className='w-5 h-5 text-purple-400' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-200'>Preguntas Frecuentes</h2>
              <p className='text-sm text-gray-400'>Respuestas a las dudas más comunes por categoría</p>
            </div>
          </div>

          <Accordion selectedKeys={selectedKeys} selectionMode='multiple' variant='bordered' onSelectionChange={setSelectedKeys}>
            {faqCategories.map(category => {
              const Icon = category.icon

              return (
                <AccordionItem
                  key={category.key}
                  classNames={{
                    base: 'bg-gray-800/30 border-gray-700/30',
                    title: 'text-gray-200 font-medium',
                    content: 'text-gray-400 text-sm'
                  }}
                  startContent={<Icon className={`w-4 h-4 ${category.color}`} />}
                  title={category.title}>
                  <div className='space-y-4 pt-2'>
                    {category.questions.map((item, index) => (
                      <div key={index} className='bg-gray-700/20 rounded-lg p-3 space-y-2'>
                        <div className='flex items-start gap-2'>
                          <AlertCircle className='w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5' />
                          <p className='font-medium text-gray-200 text-sm'>{item.q}</p>
                        </div>
                        <p className='text-xs text-gray-400 pl-6'>{item.a}</p>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardBody>
      </Card>

      {/* Guías Rápidas */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-green-500/20 rounded-lg'>
              <BookOpen className='w-5 h-5 text-green-400' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-200'>Guías Rápidas</h2>
              <p className='text-sm text-gray-400'>Tutoriales paso a paso para las funcionalidades clave</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {quickGuides.map((guide, index) => {
              const Icon = guide.icon
              const colorMap = {
                pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', icon: 'text-pink-400' },
                blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
                green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'text-green-400' }
              }
              const colors = colorMap[guide.color]

              return (
                <div key={index} className={`${colors.bg} border ${colors.border} rounded-lg p-4 space-y-3`}>
                  <div className='flex items-center gap-2'>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                    <h3 className={`font-semibold ${colors.text} text-sm`}>{guide.title}</h3>
                  </div>
                  <ol className='space-y-2'>
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className='flex items-start gap-2 text-xs text-gray-300'>
                        <span className={`${colors.text} font-bold flex-shrink-0`}>{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Soporte y PQR */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-orange-500/20 rounded-lg'>
              <Mail className='w-5 h-5 text-orange-400' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-200'>Soporte y PQR</h2>
              <p className='text-sm text-gray-400'>Reporta problemas, envía sugerencias o contacta a nuestro equipo</p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Reportar Error */}
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <Bug className='w-5 h-5 text-red-400' />
                <h3 className='font-semibold text-red-300 text-sm'>Reportar Error</h3>
              </div>
              <p className='text-xs text-gray-400'>¿Encontraste un problema técnico? Ayúdanos a solucionarlo rápidamente.</p>
              <Button
                className='w-full border-red-500/50 text-red-400 hover:bg-red-500/10'
                size='sm'
                startContent={<AlertCircle className='w-4 h-4' />}
                variant='bordered'
                onPress={handleReportBug}>
                Reportar Error
              </Button>
            </div>

            {/* Quejas y Reclamos */}
            <div className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-5 h-5 text-orange-400' />
                <h3 className='font-semibold text-orange-300 text-sm'>Quejas y Reclamos</h3>
              </div>
              <p className='text-xs text-gray-400'>¿Tuviste una mala experiencia? Queremos saberlo para mejorar.</p>
              <Button
                className='w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
                size='sm'
                startContent={<AlertCircle className='w-4 h-4' />}
                variant='bordered'
                onPress={handleComplaint}>
                Enviar Queja
              </Button>
            </div>

            {/* Sugerencias */}
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <Send className='w-5 h-5 text-blue-400' />
                <h3 className='font-semibold text-blue-300 text-sm'>Sugerencias</h3>
              </div>
              <p className='text-xs text-gray-400'>¿Tienes una idea genial? Compártela y ayúdanos a mejorar.</p>
              <Button
                className='w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                size='sm'
                startContent={<Send className='w-4 h-4' />}
                variant='bordered'
                onPress={handleSuggestion}>
                Enviar Sugerencia
              </Button>
            </div>

            {/* Contacto General */}
            <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <MessageSquare className='w-5 h-5 text-green-400' />
                <h3 className='font-semibold text-green-300 text-sm'>Contacto General</h3>
              </div>
              <p className='text-xs text-gray-400'>¿Necesitas ayuda personalizada? Escríbenos directamente.</p>
              <Button
                className='w-full border-green-500/50 text-green-400 hover:bg-green-500/10'
                size='sm'
                startContent={<Mail className='w-4 h-4' />}
                variant='bordered'
                onPress={handleContactSupport}>
                Contactar Soporte
              </Button>
            </div>
          </div>

          {/* Footer de soporte */}
          <div className='mt-4 pt-4 border-t border-gray-700/50'>
            <div className='bg-gray-700/20 border border-gray-600/30 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-2'>
                <CheckCircle className='w-4 h-4 text-green-400' />
                <span className='text-sm font-medium text-gray-300'>Nuestro compromiso</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Chip className='text-xs' color='primary' size='sm' variant='flat'>
                  Respuesta en 24-48h
                </Chip>
                <Chip className='text-xs' color='secondary' size='sm' variant='flat'>
                  Soporte en español
                </Chip>
                <Chip className='text-xs' color='success' size='sm' variant='flat'>
                  Atención personalizada
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Recursos Adicionales */}
      <Card className='w-full bg-gray-800/30 border-gray-700/40'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-purple-500/20 rounded-lg'>
              <FileText className='w-5 h-5 text-purple-400' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-200'>Recursos Adicionales</h2>
              <p className='text-sm text-gray-400'>Información legal y documentación</p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<Shield className='w-4 h-4 text-blue-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.LEGAL.PRIVACY)}>
              Política de Privacidad
            </Button>

            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<FileText className='w-4 h-4 text-purple-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.LEGAL.TERMS)}>
              Términos y Condiciones
            </Button>

            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<Lock className='w-4 h-4 text-green-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.LEGAL.DATA)}>
              Tratamiento de Datos
            </Button>

            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<Settings className='w-4 h-4 text-gray-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.USER.SETTINGS)}>
              Configuración
            </Button>

            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<User className='w-4 h-4 text-primary-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.USER.ME)}>
              Mi Perfil
            </Button>

            <Button
              className='justify-between bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
              endContent={<ChevronRight className='w-4 h-4' />}
              size='sm'
              startContent={<Heart className='w-4 h-4 text-pink-400' />}
              variant='bordered'
              onPress={() => navigate(APP_PATHS.USER.MATCHES)}>
              Mis Matches
            </Button>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Help
