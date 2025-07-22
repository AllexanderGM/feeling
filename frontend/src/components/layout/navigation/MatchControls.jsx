import { useState, useEffect } from 'react'
import { Heart, Settings, X, Bookmark, Menu } from 'lucide-react'
import { Button } from '@heroui/react'
import NavigationMenu from './NavigationMenu.jsx'

const MatchControls = ({ user, isAdmin }) => {
  const [isNavigationMenuOpen, setIsNavigationMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Hook para detectar si es mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Efecto para manejar la apertura automática del menú
  useEffect(() => {
    if (!isMobile) {
      // En desktop: abrir inmediatamente al montar
      setIsNavigationMenuOpen(true)
    } else {
      // En mobile: abrir al montar, cerrar después de 1 segundo
      setIsNavigationMenuOpen(true)
      const timer = setTimeout(() => {
        setIsNavigationMenuOpen(false)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isMobile])

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

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="relative flex items-center justify-center space-x-4">
      {/* Botón Filtros - Izquierda (circular, neutral) */}
      <Button
        isIconOnly
        variant="flat"
        size="md"
        className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
        onPress={() => sendControlEvent('filters')}>
        <Settings className="w-4 h-4" />
      </Button>

      {/* Contenedor principal con los 3 botones de match - mismo estilo que nav */}
      <div className="bg-background/75 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl px-4 py-3 ring-1 ring-primary-500/10">
        <div className="flex items-center justify-center space-x-4">
          {/* Botón Pass - sólido gris oscuro */}
          <Button
            isIconOnly
            variant="solid"
            size="md"
            color="default"
            className="transition-all duration-300 ease-in-out hover:scale-105"
            onPress={() => sendMatchEvent('pass')}>
            <X className="w-4 h-4" />
          </Button>

          {/* Botón Favoritos - estilo moderado */}
          <Button
            isIconOnly
            variant="solid"
            size="md"
            color="secondary"
            className="bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 shadow-md transition-all duration-300 ease-in-out hover:scale-105"
            onPress={() => sendMatchEvent('superlike')}>
            <Bookmark className="w-4 h-4 text-white" />
          </Button>

          {/* Botón Like/Match - premium con animación sutil */}
          <Button
            isIconOnly
            variant="solid"
            size="md"
            color="danger"
            className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-red-400/40 ring-2 ring-red-400/20"
            onPress={() => sendMatchEvent('like')}>
            <Heart className="w-4 h-4 text-white drop-shadow-sm heartbeat-animation" />
          </Button>
        </div>
      </div>

      {/* Botón Menú de Navegación - Derecha (circular, neutral) */}
      <div className="relative">
        <Button
          isIconOnly
          variant="flat"
          size="md"
          className={`rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm ${
            isNavigationMenuOpen ? 'bg-gray-600 scale-105' : ''
          }`}
          onPress={() => setIsNavigationMenuOpen(!isNavigationMenuOpen)}>
          <Menu className="w-4 h-4" />
        </Button>

        {/* Menú desplegable de navegación */}
        <NavigationMenu isOpen={isNavigationMenuOpen} onClose={() => setIsNavigationMenuOpen(false)} user={user} isAdmin={isAdmin} />
      </div>
    </div>
  )
}

export default MatchControls
