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
          <Button isIconOnly className='mb-0' color='primary' startContent={<Share />} variant='light' />
        </PopoverTrigger>
        <PopoverContent>
          <div className='p-2'>
            <h3 className='text-lg font-semibold mb-3'>Compartir este tour</h3>
            <div className='flex flex-wrap gap-2 mb-4'>
              <FacebookShareButton className='social-share-button' quote={title} url={shareUrl}>
                <FacebookIcon round size={40} />
              </FacebookShareButton>

              <TwitterShareButton className='social-share-button' hashtags={hashtags} title={title} url={shareUrl}>
                <TwitterIcon round size={40} />
              </TwitterShareButton>

              <WhatsappShareButton className='social-share-button' title={title} url={shareUrl}>
                <WhatsappIcon round size={40} />
              </WhatsappShareButton>

              <TelegramShareButton className='social-share-button' title={title} url={shareUrl}>
                <TelegramIcon round size={40} />
              </TelegramShareButton>

              <EmailShareButton body={description} className='social-share-button' subject={title} url={shareUrl}>
                <EmailIcon round size={40} />
              </EmailShareButton>
            </div>

            <div className='mt-3'>
              <div className='flex items-center'>
                <input readOnly className='flex-grow p-2 text-sm border rounded-l-md bg-gray-50' type='text' value={shareUrl} />
                <Tooltip content={copied ? '¡Enlace copiado!' : 'Copiar enlace'}>
                  <Button className='rounded-l-none h-full' color={copied ? 'success' : 'primary'} onPress={handleCopyLink}>
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
