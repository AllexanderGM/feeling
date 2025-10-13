import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from '@heroui/react'
import { Phone, Mail, Copy, MessageCircle, ExternalLink } from 'lucide-react'
import { Logger } from '@utils/logger.js'

const ContactInfoModal = ({ isOpen, onClose, contact }) => {
  if (!contact) return null

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    // TODO: Show toast notification
    Logger.info(Logger.CATEGORIES.UI, 'copy_contact_info', `${label} copiado al portapapeles`, {
      label,
      contactId: contact?.id
    })
  }

  const handleOpenWhatsApp = () => {
    const phoneNumber = contact.phone.replace(/\D/g, '') // Remove non-numeric characters
    const message = encodeURIComponent('¡Hola! Nos conectamos a través de Feeling 😊')

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent('Conexión desde Feeling')
    const body = encodeURIComponent('¡Hola! Me gustaría conocerte mejor. Nos conectamos a través de Feeling.')

    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <Modal
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}
      isOpen={isOpen}
      placement='center'
      size='lg'
      onClose={onClose}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center'>
              <Phone className='w-5 h-5 text-green-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Información de Contacto</h2>
              <p className='text-sm text-gray-400 font-normal'>¡Felicitaciones! Ya pueden contactarse directamente</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          {/* Success message */}
          <div className='bg-green-500/10 border border-green-500/30 rounded-lg p-4'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Phone className='w-6 h-6 text-green-400' />
              </div>
              <p className='font-medium text-green-400 mb-1'>¡Match Confirmado!</p>
              <p className='text-sm text-green-300'>Ambos han aceptado el match. Ahora pueden contactarse directamente.</p>
            </div>
          </div>

          {/* Contact information */}
          <div className='space-y-4'>
            {/* Email */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                    <Mail className='w-5 h-5 text-blue-400' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-400 mb-1'>Correo Electrónico</p>
                    <p className='font-medium text-gray-100'>{contact.email}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      isIconOnly
                      className='border-gray-600 text-gray-300'
                      size='sm'
                      variant='bordered'
                      onPress={() => handleCopyToClipboard(contact.email, 'Email')}>
                      <Copy className='w-4 h-4' />
                    </Button>
                    <Button color='primary' size='sm' startContent={<ExternalLink className='w-4 h-4' />} onPress={handleSendEmail}>
                      Enviar Email
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Phone */}
            <Card className='bg-gray-700/30 border-gray-600/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center'>
                    <Phone className='w-5 h-5 text-green-400' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-400 mb-1'>Teléfono / WhatsApp</p>
                    <p className='font-medium text-gray-100'>{contact.phone}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      isIconOnly
                      className='border-gray-600 text-gray-300'
                      size='sm'
                      variant='bordered'
                      onPress={() => handleCopyToClipboard(contact.phone, 'Teléfono')}>
                      <Copy className='w-4 h-4' />
                    </Button>
                    <Button color='success' size='sm' startContent={<MessageCircle className='w-4 h-4' />} onPress={handleOpenWhatsApp}>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tips */}
          <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-4'>
            <div className='text-center'>
              <p className='font-medium text-blue-400 mb-2'>💡 Consejos para el primer contacto</p>
              <ul className='text-sm text-blue-300 space-y-1 text-left'>
                <li>• Sé auténtico y respetuoso en tu primer mensaje</li>
                <li>• Menciona algo específico de su perfil que te llamó la atención</li>
                <li>• Propón una actividad relacionada con sus intereses</li>
                <li>• Mantén la conversación ligera y positiva</li>
              </ul>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button className='w-full' color='primary' onPress={onClose}>
            Entendido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ContactInfoModal
