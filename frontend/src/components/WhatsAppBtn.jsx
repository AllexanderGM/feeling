import { MessageCircle } from 'lucide-react'
import { Button } from '@heroui/react'

const WhatsAppBtn = ({ phoneNumber, message }) => {
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`

  return (
    <a href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
      <Button isIconOnly color='primary' variant='light'>
        <MessageCircle size={24} />
      </Button>
    </a>
  )
}

export default WhatsAppBtn
