import { useState } from 'react'
import { Card, CardBody, Input, Button, Chip } from '@heroui/react'
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  Phone,
  Mail,
  Clock,
  Users,
  Shield,
  Heart,
  Zap,
  Settings
} from 'lucide-react'

// Components
import LiteContainer from '@components/layout/LiteContainer.jsx'
import FAQSection from './components/FAQSection.jsx'
import GuidesSection from './components/GuidesSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import TutorialsSection from './components/TutorialsSection.jsx'

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('faq')

  const helpSections = [
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Respuestas a las dudas más comunes',
      color: 'primary'
    },
    {
      id: 'guides',
      title: 'Guías de Uso',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Aprende a usar todas las funciones',
      color: 'success'
    },
    {
      id: 'tutorials',
      title: 'Tutoriales',
      icon: <Video className="w-5 h-5" />,
      description: 'Videos y tutoriales paso a paso',
      color: 'secondary'
    },
    {
      id: 'contact',
      title: 'Contactar Soporte',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'Obtén ayuda personalizada',
      color: 'warning'
    }
  ]

  const quickActions = [
    {
      title: 'Crear mi perfil',
      description: 'Completa tu perfil para empezar',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      action: () => window.location.href = '/profile'
    },
    {
      title: 'Configurar privacidad',
      description: 'Ajusta tu configuración de privacidad',
      icon: <Shield className="w-5 h-5 text-green-400" />,
      action: () => window.location.href = '/settings'
    },
    {
      title: 'Buscar conexiones',
      description: 'Encuentra personas compatibles',
      icon: <Heart className="w-5 h-5 text-red-400" />,
      action: () => window.location.href = '/search'
    },
    {
      title: 'Ver mis matches',
      description: 'Revisa tus conexiones exitosas',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      action: () => window.location.href = '/matches'
    }
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'faq':
        return <FAQSection searchTerm={searchTerm} />
      case 'guides':
        return <GuidesSection searchTerm={searchTerm} />
      case 'tutorials':
        return <TutorialsSection searchTerm={searchTerm} />
      case 'contact':
        return <ContactSection />
      default:
        return <FAQSection searchTerm={searchTerm} />
    }
  }

  return (
    <LiteContainer className="gap-6" ariaLabel="Página de ayuda y soporte">
      {/* Header de ayuda */}
      <div className="w-full bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-purple-900/20 backdrop-blur-sm rounded-xl border border-blue-700/50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
            Centro de Ayuda
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Encuentra respuestas a tus preguntas, aprende a usar Feeling al máximo y obtén soporte personalizado
          </p>
        </div>

        {/* Buscador */}
        <div className="mt-6 max-w-md mx-auto">
          <Input
            placeholder="Buscar ayuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            classNames={{
              input: "text-gray-200",
              inputWrapper: "bg-gray-800/50 backdrop-blur-sm border-gray-600"
            }}
          />
        </div>
      </div>

      {/* Navegación de secciones */}
      <Card className="w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {helpSections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "solid" : "bordered"}
                color={activeSection === section.id ? section.color : "default"}
                className={`h-auto p-4 flex-col gap-2 ${
                  activeSection === section.id 
                    ? '' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'
                }`}
                onPress={() => setActiveSection(section.id)}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </div>
                <span className="text-xs opacity-80">{section.description}</span>
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Acciones rápidas */}
      <Card className="w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-gray-200">Acciones Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-600/30 hover:border-gray-500/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  {action.icon}
                  <span className="font-medium text-gray-200 text-sm">{action.title}</span>
                </div>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contenido de la sección activa */}
      <Card className="w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          {renderActiveSection()}
        </CardBody>
      </Card>

      {/* Footer de soporte */}
      <Card className="w-full bg-gradient-to-br from-green-900/20 via-green-800/10 to-blue-900/20 border-green-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-300">¿Necesitas más ayuda?</h3>
            </div>
            
            <p className="text-gray-300 max-w-2xl mx-auto">
              Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y resolveremos tus dudas de manera personalizada.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Respuesta en 24-48h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Soporte en español</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>Atención personalizada</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                color="primary"
                startContent={<Mail className="w-4 h-4" />}
                onPress={() => setActiveSection('contact')}
              >
                Contactar Soporte
              </Button>
              <Button
                variant="bordered"
                className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                startContent={<Phone className="w-4 h-4" />}
              >
                Ver Contactos
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Help