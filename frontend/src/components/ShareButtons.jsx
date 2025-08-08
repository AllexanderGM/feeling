import { useState } from 'react'
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon
} from 'react-share'
import { Button, Popover, PopoverTrigger, PopoverContent, Tooltip } from '@heroui/react'
import { Share, Check, Copy } from 'lucide-react'

const ShareButtons = ({ tour, currentUrl }) => {
  // Estados para controlar la visibilidad y mensajes de éxito
  const [copied, setCopied] = useState(false)

  // Construir la data para compartir
  const title = `¡Mira este increíble tour: ${tour.name}!`
  const description = tour.description || 'Un tour increíble que no te puedes perder.'

  // URL para compartir (usar el URL actual si no se proporciona)
  const shareUrl = currentUrl || window.location.href

  // Hashtags para Twitter
  const hashtags = ['GlocalTour', 'Viajes', 'Turismo']

  // Copiar al portapapeles
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='flex flex-col items-start'>
      <Popover placement='bottom'>
        <PopoverTrigger>
          <Button isIconOnly color='primary' variant='light' startContent={<Share />} className='mb-0'></Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className='p-2'>
            <h3 className='text-lg font-semibold mb-3'>Compartir este tour</h3>
            <div className='flex flex-wrap gap-2 mb-4'>
              <FacebookShareButton url={shareUrl} quote={title} className='social-share-button'>
                <FacebookIcon size={40} round />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={title} hashtags={hashtags} className='social-share-button'>
                <TwitterIcon size={40} round />
              </TwitterShareButton>

              <WhatsappShareButton url={shareUrl} title={title} className='social-share-button'>
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>

              <TelegramShareButton url={shareUrl} title={title} className='social-share-button'>
                <TelegramIcon size={40} round />
              </TelegramShareButton>

              <EmailShareButton url={shareUrl} subject={title} body={description} className='social-share-button'>
                <EmailIcon size={40} round />
              </EmailShareButton>
            </div>

            <div className='mt-3'>
              <div className='flex items-center'>
                <input type='text' value={shareUrl} readOnly className='flex-grow p-2 text-sm border rounded-l-md bg-gray-50' />
                <Tooltip content={copied ? '¡Enlace copiado!' : 'Copiar enlace'}>
                  <Button color={copied ? 'success' : 'primary'} onPress={handleCopyLink} className='rounded-l-none h-full'>
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ShareButtons
