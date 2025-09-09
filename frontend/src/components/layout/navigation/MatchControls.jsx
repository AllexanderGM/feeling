import { Heart, Settings, X, Bookmark, RotateCcw } from 'lucide-react'
import { Button } from '@heroui/react'

const MatchControls = ({ user, isAdmin }) => {
  // ========================================
  // HANDLERS
  // ========================================

  // Función para enviar eventos de match al Home
  const sendMatchEvent = action => {
    const event = new CustomEvent('matchAction', { detail: { action } })
    window.dispatchEvent(event)
  }

  // Función para enviar eventos de control al Home
  const sendControlEvent = action => {
    const event = new CustomEvent('controlAction', { detail: { action } })
    window.dispatchEvent(event)
  }

  // Función para recargar la página
  const handleRefresh = () => {
    window.location.reload()
  }

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className='relative flex items-center justify-center space-x-4'>
      {/* Botón Filtros - Izquierda (circular, neutral) */}
      <Button
        isIconOnly
        variant='flat'
        size='md'
        className='rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm'
        onPress={() => sendControlEvent('filters')}>
        <Settings className='w-4 h-4' />
      </Button>

      {/* Contenedor principal con los 3 botones de match - mismo estilo que nav */}
      <div className='bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10'>
        <div className='flex items-center justify-center space-x-4'>
          {/* Botón Pass - sólido gris oscuro */}
          <Button
            isIconOnly
            variant='solid'
            size='md'
            color='default'
            className='transition-all duration-300 ease-in-out hover:scale-105'
            onPress={() => sendMatchEvent('pass')}>
            <X className='w-4 h-4' />
          </Button>

          {/* Botón Favoritos - estilo moderado */}
          <Button
            isIconOnly
            variant='solid'
            size='md'
            color='secondary'
            className='bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 shadow-md transition-all duration-300 ease-in-out hover:scale-105'
            onPress={() => sendMatchEvent('superlike')}>
            <Bookmark className='w-4 h-4 text-white' />
          </Button>

          {/* Botón Like/Match - premium con animación sutil */}
          <Button
            isIconOnly
            variant='solid'
            size='md'
            color='danger'
            className='bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-red-400/40 ring-2 ring-red-400/20'
            onPress={() => sendMatchEvent('like')}>
            <Heart className='w-4 h-4 text-white drop-shadow-sm heartbeat-animation' />
          </Button>
        </div>
      </div>

      {/* Botón Recargar - Derecha (circular, neutral) */}
      <Button
        isIconOnly
        variant='flat'
        size='md'
        className='rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm'
        onPress={handleRefresh}>
        <RotateCcw className='w-4 h-4' />
      </Button>
    </div>
  )
}

export default MatchControls
