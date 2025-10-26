import { Sparkles, Crown, Star, Heart } from 'lucide-react'

/**
 * Componente de efectos de fondo premium
 * Incluye gradientes animados y estrellas decorativas
 * Usado en páginas premium para crear una atmósfera visual elegante
 */
const BackgroundPremiumEffect = () => {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Gradientes de luz animados */}
      <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse' />
      <div
        className='absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse'
        style={{ animationDelay: '1000ms' }}
      />
      <div
        className='absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse'
        style={{ animationDelay: '500ms' }}
      />

      {/* Estrellas decorativas flotantes */}
      <div className='absolute top-10 left-10 text-yellow-400/20'>
        <Sparkles className='w-6 h-6 animate-pulse' />
      </div>
      <div className='absolute top-32 right-20 text-primary-400/20' style={{ animationDelay: '300ms' }}>
        <Star className='w-8 h-8 animate-pulse' />
      </div>
      <div className='absolute bottom-40 left-1/3 text-purple-400/20' style={{ animationDelay: '700ms' }}>
        <Crown className='w-7 h-7 animate-pulse' />
      </div>
      <div className='absolute bottom-20 right-1/3 text-pink-400/20' style={{ animationDelay: '1000ms' }}>
        <Heart className='w-6 h-6 animate-pulse' />
      </div>
    </div>
  )
}

export default BackgroundPremiumEffect
