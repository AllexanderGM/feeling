import { useState } from 'react'
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Chip } from '@heroui/react'
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  Send, 
  MapPin,
  Globe,
  AlertTriangle,
  Bug,
  Star,
  HelpCircle,
  Heart,
  Shield,
  Users,
  CheckCircle
} from 'lucide-react'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactMethods = [
    {
      title: 'Email de Soporte',
      description: 'Para consultas generales y soporte técnico',
      icon: <Mail className="w-5 h-5 text-blue-400" />,
      contact: 'soporte@feeling.app',
      responseTime: '24-48 horas',
      color: 'primary'
    },
    {
      title: 'Soporte Técnico',
      description: 'Problemas técnicos y errores de la plataforma',
      icon: <Bug className="w-5 h-5 text-red-400" />,
      contact: 'tech@feeling.app',
      responseTime: '12-24 horas',
      color: 'danger'
    },
    {
      title: 'Reportes de Seguridad',
      description: 'Reportar usuarios o contenido inapropiado',
      icon: <Shield className="w-5 h-5 text-green-400" />,
      contact: 'seguridad@feeling.app',
      responseTime: '2-6 horas',
      color: 'success'
    },
    {
      title: 'Sugerencias',
      description: 'Ideas para mejorar la plataforma',
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      contact: 'feedback@feeling.app',
      responseTime: '3-5 días',
      color: 'warning'
    }
  ]

  const categories = [
    { key: 'technical', label: 'Problema técnico', icon: <Bug className="w-4 h-4" /> },
    { key: 'account', label: 'Problemas de cuenta', icon: <Users className="w-4 h-4" /> },
    { key: 'privacy', label: 'Privacidad y seguridad', icon: <Shield className="w-4 h-4" /> },
    { key: 'billing', label: 'Facturación y pagos', icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'report', label: 'Reportar usuario', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'suggestion', label: 'Sugerencia de mejora', icon: <Star className="w-4 h-4" /> },
    { key: 'other', label: 'Otro', icon: <HelpCircle className="w-4 h-4" /> }
  ]

  const priorities = [
    { key: 'low', label: 'Baja', color: 'default' },
    { key: 'medium', label: 'Media', color: 'primary' },
    { key: 'high', label: 'Alta', color: 'warning' },
    { key: 'urgent', label: 'Urgente', color: 'danger' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simular envío del formulario
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      })
    } catch (error) {
      console.error('Error sending contact form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.email && formData.subject && formData.category && formData.message

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-green-300 mb-2">¡Mensaje enviado exitosamente!</h3>
        <p className="text-gray-300 mb-4">
          Hemos recibido tu consulta y nuestro equipo te responderá pronto.
        </p>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-green-200 text-sm">
            Recibirás una respuesta en tu email dentro de las próximas 24-48 horas.
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => setIsSubmitted(false)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200 mb-2">Contactar Soporte</h2>
        <p className="text-gray-400">Estamos aquí para ayudarte con cualquier consulta</p>
      </div>

      {/* Métodos de contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactMethods.map((method, index) => (
          <Card key={index} className="bg-gray-700/30 border-gray-600/30">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${method.color}-500/20 flex items-center justify-center shrink-0`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-200 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-300">{method.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Respuesta en {method.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Formulario de contacto */}
      <Card className="bg-gray-700/30 border-gray-600/30">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-200">Enviar mensaje directo</h3>
          </div>

          <div className="space-y-4">
            {/* Información personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                isRequired
                classNames={{
                  input: "text-gray-200",
                  inputWrapper: "bg-gray-700/50"
                }}
              />
              <Input
                label="Email"
                placeholder="tu@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                isRequired
                classNames={{
                  input: "text-gray-200",
                  inputWrapper: "bg-gray-700/50"
                }}
              />
            </div>

            {/* Asunto */}
            <Input
              label="Asunto"
              placeholder="Breve descripción del tema"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              isRequired
              classNames={{
                input: "text-gray-200",
                inputWrapper: "bg-gray-700/50"
              }}
            />

            {/* Categoría y prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Categoría"
                placeholder="Selecciona el tipo de consulta"
                selectedKeys={formData.category ? [formData.category] : []}
                onSelectionChange={(keys) => handleInputChange('category', Array.from(keys)[0])}
                isRequired
                classNames={{
                  trigger: "bg-gray-700/50",
                  value: "text-gray-200"
                }}
              >
                {categories.map((category) => (
                  <SelectItem 
                    key={category.key} 
                    value={category.key}
                    textValue={category.label}
                    classNames={{
                      base: "text-gray-200 data-[hover=true]:bg-gray-700"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Prioridad"
                placeholder="Nivel de urgencia"
                selectedKeys={[formData.priority]}
                onSelectionChange={(keys) => handleInputChange('priority', Array.from(keys)[0])}
                classNames={{
                  trigger: "bg-gray-700/50",
                  value: "text-gray-200"
                }}
              >
                {priorities.map((priority) => (
                  <SelectItem 
                    key={priority.key} 
                    value={priority.key}
                    textValue={priority.label}
                    classNames={{
                      base: "text-gray-200 data-[hover=true]:bg-gray-700"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color={priority.color} variant="flat">
                        {priority.label}
                      </Chip>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Mensaje */}
            <Textarea
              label="Mensaje"
              placeholder="Describe tu consulta o problema con el mayor detalle posible..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              minRows={4}
              maxRows={8}
              isRequired
              classNames={{
                input: "text-gray-200",
                inputWrapper: "bg-gray-700/50"
              }}
            />

            {/* Información adicional */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-300 text-sm font-medium mb-1">Información útil para incluir:</p>
              <ul className="text-blue-200 text-xs space-y-1">
                <li>• Sistema operativo y navegador que usas</li>
                <li>• Pasos exactos que realizaste antes del problema</li>
                <li>• Mensajes de error específicos (si los hay)</li>
                <li>• Screenshots o capturas de pantalla</li>
              </ul>
            </div>

            {/* Botón de envío */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-gray-400">
                Al enviar este mensaje, aceptas que procesemos tu información para responder a tu consulta.
              </div>
              <Button
                color="primary"
                size="lg"
                startContent={<Send className="w-4 h-4" />}
                onPress={handleSubmit}
                isDisabled={!isFormValid}
                isLoading={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-700/30 border-gray-600/30">
          <CardBody className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-200 mb-1">Horarios de atención</h4>
            <p className="text-sm text-gray-400">Lunes a Viernes<br />9:00 AM - 6:00 PM (GMT-5)</p>
          </CardBody>
        </Card>

        <Card className="bg-gray-700/30 border-gray-600/30">
          <CardBody className="p-4 text-center">
            <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-200 mb-1">Idiomas disponibles</h4>
            <p className="text-sm text-gray-400">Español<br />English</p>
          </CardBody>
        </Card>

        <Card className="bg-gray-700/30 border-gray-600/30">
          <CardBody className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="font-medium text-gray-200 mb-1">Compromiso</h4>
            <p className="text-sm text-gray-400">Respuesta garantizada<br />en menos de 48 horas</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default ContactSection