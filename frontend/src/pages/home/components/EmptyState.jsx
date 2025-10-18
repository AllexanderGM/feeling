import { Button, Card, CardBody } from '@heroui/react'
import { Users, RotateCcw, Heart, MessageCircle, HelpCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths.js'

const EmptyState = ({ removedCards, onResetStack }) => (
  <div className='text-center px-4 max-w-md mx-auto space-y-5'>
    {/* Icono principal */}
    <div className='w-24 h-24 bg-gradient-to-br from-gray-800/50 to-secondary-900/20 rounded-full flex items-center justify-center mx-auto border border-secondary-500/10 shadow-lg shadow-secondary-500/5'>
      <Users className='w-12 h-12 text-secondary-400/60' />
    </div>

    {/* Título y descripción */}
    <div className='space-y-2'>
      <h3 className='text-xl font-bold text-gray-200'>¡No hay más perfiles!</h3>
      <p className='text-sm text-gray-400 leading-relaxed'>
        {removedCards.size > 0
          ? 'Has visto todos los perfiles disponibles. Vuelve más tarde para descubrir nuevas personas.'
          : 'No hay perfiles disponibles en este momento. Intenta más tarde.'}
      </p>
    </div>

    {/* Botones principales */}
    <div className='space-y-3 pt-2'>
      {removedCards.size > 0 && (
        <Button
          className='w-full'
          color='primary'
          startContent={<RotateCcw className='w-5 h-5' />}
          variant='bordered'
          onPress={onResetStack}>
          Ver de nuevo
        </Button>
      )}
      <Button
        as={Link}
        className='w-full bg-gradient-to-r from-primary-500 to-pink-600 text-white hover:from-primary-600 hover:to-pink-700 shadow-lg shadow-primary-500/30'
        startContent={<Heart className='w-5 h-5 fill-current' />}
        to={APP_PATHS.USER.FAVORITES}
        variant='solid'>
        Ver mis favoritos
      </Button>
      <Button
        className='w-full border-gray-600/50 text-gray-400 hover:bg-gray-700/20'
        startContent={<RefreshCw className='w-5 h-5' />}
        variant='bordered'
        onPress={() => window.location.reload()}>
        Recargar página
      </Button>
    </div>

    {/* Sección de soporte */}
    <Card className='w-full bg-gray-800/30 border-gray-700/50 backdrop-blur-sm mt-6'>
      <CardBody className='p-5'>
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-center justify-center gap-2.5'>
            <div className='w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center'>
              <HelpCircle className='w-5 h-5 text-orange-400' />
            </div>
            <div>
              <h4 className='text-base font-semibold text-gray-200'>¿Necesitas ayuda?</h4>
            </div>
          </div>

          {/* Descripción */}
          <p className='text-xs text-gray-400 text-center'>Si experimentas algún problema o tienes dudas, contáctanos y te ayudaremos.</p>

          {/* Botón de soporte */}
          <Button
            aria-label='Contactar con soporte'
            className='w-full border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500/70'
            startContent={<MessageCircle className='w-5 h-5' />}
            variant='bordered'>
            Contactar soporte
          </Button>

          {/* Footer */}
          <p className='text-xs text-gray-500 text-center pt-1'>Respuesta en 24-48 horas • Soporte en español</p>
        </div>
      </CardBody>
    </Card>
  </div>
)

export default EmptyState
