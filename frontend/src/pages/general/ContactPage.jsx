import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Textarea, Accordion, AccordionItem, Spinner } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import {
  Facebook,
  Instagram,
  MessageCircle,
  Github,
  Mail,
  Phone,
  User,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Contact,
  Share,
  Headphones,
  HelpCircle
} from 'lucide-react'

import './contactPage.scss'

const url_facebook = 'https://www.facebook.com/p/Beautiful-places-in-the-world-100064591513384/'
const url_insta = 'https://www.instagram.com/lugares_del_mundo/'
const url_github = 'https://github.com/AllexanderGM/DH-G2-Final.git'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Simulación de envío de formulario
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulación de respuesta exitosa
      setSubmitStatus({
        type: 'success',
        message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.'
      })

      // Restablecer formulario
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqItems = [
    {
      title: '¿Cómo puedo cancelar mi reserva?',
      content:
        'Para cancelar una reserva, inicia sesión en tu cuenta, ve a "Mis Reservas" y selecciona la opción de cancelación. Ten en cuenta que las cancelaciones dentro de las 48 horas previas a la fecha del tour pueden generar cargos adicionales.'
    },
    {
      title: '¿Ofrecen descuentos para grupos?',
      content:
        'Sí, ofrecemos descuentos especiales para grupos de 6 o más personas. Contáctanos directamente para recibir una cotización personalizada para tu grupo.'
    },
    {
      title: '¿Qué debo llevar a los tours?',
      content:
        'Recomendamos llevar ropa y calzado cómodo, protector solar, gorra o sombrero, botella de agua, y una mochila pequeña para tus pertenencias. Dependiendo del tour específico, te enviaremos una lista detallada en tu correo de confirmación.'
    },
    {
      title: '¿Los tours son adecuados para niños?',
      content:
        'La mayoría de nuestros tours son aptos para toda la familia. En la descripción de cada tour indicamos si hay restricciones de edad o si se recomienda para ciertos grupos de edad.'
    },
    {
      title: '¿Qué ocurre en caso de mal tiempo?',
      content:
        'En caso de condiciones climáticas adversas que puedan afectar la seguridad o la experiencia, nos reservamos el derecho de modificar, posponer o cancelar el tour. En estos casos, ofrecemos la posibilidad de reprogramar o recibir un reembolso completo.'
    }
  ]

  const contactInfo = [
    {
      icon: <Phone className='text-2xl text-red-500' />,
      title: 'Teléfono',
      content: '+57 305 332 8285'
    },
    {
      icon: <Mail className='text-2xl text-red-500' />,
      title: 'Email',
      content: 'preguntepues.glocal@gmail.com'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Contacto | Glocal Tours</title>
        <meta
          name='description'
          content='Contáctanos para obtener más información sobre nuestros tours o para resolver cualquier duda que tengas.'
        />
      </Helmet>

      {/* Hero Section */}
      <div className='contact-hero'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Contáctanos</h1>
        <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
          Estamos aquí para ayudarte con cualquier consulta sobre nuestros tours y servicios. Completa el formulario y nos pondremos en
          contacto contigo lo antes posible.
        </p>
      </div>

      <div className='contact-content'>
        <div className='contact-grid'>
          {/* Formulario de Contacto */}
          <div className='contact-form-container'>
            <Card className='w-full'>
              <CardHeader className='pb-3'>
                <div>
                  <h2 className='text-xl font-bold text-gray-800'>Envíanos un mensaje</h2>
                  <p className='text-sm text-gray-600 mt-1'>Completa el formulario a continuación</p>
                </div>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <Input
                    type='text'
                    label='Nombre completo'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Ingresa tu nombre completo'
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    variant='bordered'
                    startContent={<User className='text-gray-400' />}
                  />

                  <Input
                    type='email'
                    label='Correo electrónico'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='tucorreo@ejemplo.com'
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    variant='bordered'
                    startContent={<Mail className='text-gray-400' />}
                  />

                  <Input
                    type='text'
                    label='Asunto'
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder='¿Sobre qué quieres hablar?'
                    isInvalid={!!errors.subject}
                    errorMessage={errors.subject}
                    variant='bordered'
                    startContent={<FileText className='text-gray-400' />}
                  />

                  <Textarea
                    label='Mensaje'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    placeholder='Escribe tu mensaje aquí...'
                    isInvalid={!!errors.message}
                    errorMessage={errors.message}
                    variant='bordered'
                    minRows={4}
                  />

                  {submitStatus && (
                    <div
                      className={`p-3 rounded-lg ${
                        submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                      <div className='flex items-start gap-2'>
                        {submitStatus.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                        <span>{submitStatus.message}</span>
                      </div>
                    </div>
                  )}

                  <Button type='submit' color='primary' className='w-full' disabled={isSubmitting} startContent={!isSubmitting && <Send />}>
                    {isSubmitting ? (
                      <>
                        <Spinner size='sm' color='white' className='mr-2' />
                        Enviando...
                      </>
                    ) : (
                      'Enviar mensaje'
                    )}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Información de Contacto y Mapa */}
          <div className='contact-info-container'>
            <Card className='w-full mb-6'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                  <Contact className='text-lg text-primary' />
                  <h2 className='text-xl font-bold text-gray-800'>Información de contacto</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className='space-y-6'>
                  {contactInfo.map((item, index) => (
                    <div key={index} className='flex items-start gap-4'>
                      <div className='flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>{item.icon}</div>
                      <div>
                        <h3 className='text-lg font-medium text-gray-800'>{item.title}</h3>
                        <p className='text-gray-600'>{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Redes Sociales */}
            <Card className='w-full'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  <Share className='text-xl text-primary' />
                  <h2 className='text-xl font-bold text-gray-800'>Nuestras redes sociales</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className='flex gap-4'>
                  <Button
                    as='a'
                    href={url_facebook}
                    target='_blank'
                    rel='noopener noreferrer'
                    isIconOnly
                    color='primary'
                    variant='light'
                    aria-label='Facebook'
                    className='bg-blue-100'>
                    <Facebook className='text-blue-600' />
                  </Button>
                  <Button
                    as='a'
                    href={url_insta}
                    target='_blank'
                    rel='noopener noreferrer'
                    isIconOnly
                    color='primary'
                    variant='light'
                    aria-label='Instagram'
                    className='bg-pink-100'>
                    <Instagram className='text-pink-600' />
                  </Button>
                  <Button
                    as='a'
                    href={url_github}
                    target='_blank'
                    rel='noopener noreferrer'
                    isIconOnly
                    color='primary'
                    variant='light'
                    aria-label='GitHub'
                    className='bg-gray-100'>
                    <Github className='text-gray-600' />
                  </Button>
                  <Button
                    as='a'
                    href='https://wa.me/573053328285'
                    target='_blank'
                    rel='noopener noreferrer'
                    isIconOnly
                    color='primary'
                    variant='light'
                    aria-label='WhatsApp'
                    className='bg-green-100'>
                    <MessageCircle className='text-green-600' />
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Panel de Asistencia 24/7 */}
            <Card className='w-full'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-3'>
                  <Headphones className='text-xl text-primary' />
                  <h2 className='text-xl font-bold text-gray-800'>Asistencia 24/7</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className='p-4 bg-primary-50 rounded-lg'>
                  <div className='flex flex-col gap-2'>
                    <h3 className='font-medium text-gray-800'>Siempre a tu disposición</h3>
                    <p className='text-gray-600'>Para emergencias durante un tour, contáctanos al:</p>
                    <p className='font-medium text-primary text-lg'>+57 305 332 8285</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <Card className='w-full mt-12'>
          <CardHeader className='pb-3'>
            <div>
              <h2 className='text-2xl font-bold text-gray-800'>Preguntas frecuentes</h2>
              <p className='text-gray-600 mt-1'>Encuentra respuestas rápidas a las consultas más comunes</p>
            </div>
          </CardHeader>
          <CardBody>
            <Accordion variant='splitted' className='p-2'>
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  aria-label={item.title}
                  title={item.title}
                  startContent={<HelpCircle className='text-primary' />}>
                  <div className='px-2 py-1'>
                    <p className='text-gray-700'>{item.content}</p>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
          <CardFooter>
            <p className='text-sm text-gray-600 text-center w-full'>
              ¿No encuentras lo que buscas?{' '}
              <Button color='primary' variant='light' className='px-2 py-0'>
                Contáctanos
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

export default ContactPage
