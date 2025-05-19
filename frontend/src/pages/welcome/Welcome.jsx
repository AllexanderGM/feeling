import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'

const Welcome = () => {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Iniciar animación después de montar el componente
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = () => {
    // Navegación basada en window.location para evitar dependencias
    window.location.href = '/login'
  }

  const handleRegister = () => {
    window.location.href = '/register'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background-secondary relative overflow-hidden">
      {/* Patrón de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Contenido principal con animación */}
      <div
        className={`flex flex-col items-center text-center px-6 py-8 mx-auto max-w-lg transition-all duration-700 ease-out transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Logo y título */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-48 h-48 flex items-center justify-center mb-4">
            <svg className="w-full" viewBox="0 0 800 739.2">
              <g>
                <path
                  fill="#ff0062"
                  d="M385.8,669.7c8.9,4.4,19.4,4.4,28.4,0c28.8-14.3,49.9-33.4,67.7-47.6c36.9-29.5,94.8-73.8,178.4-18.5
                    c49.2,36.9,76.3,59.1,76.3,59.1l-1.2-230.1c0,0,2.5-19.7-14.8-38.1c-18.5-18.5-80-75.1-110.8-72.6l18.6-62.1
                    c0,0,120.4,43.7,166,137.2c9.8,24.6,3.7,300.3,3.7,300.3s-1.2,61.5-62.8,35.7c-61.5-38.1-94.8-75.6-125.5-87.6
                    c-30.8-12-40.6-5.9-60.3,5.2c-19.7,11.1-105.8,89-147.7,88.8h-3.7c-41.8,0.2-128-77.7-147.7-88.8c-19.7-11.1-29.5-17.2-60.3-5.2
                    c-30.8,12-64,49.5-125.5,87.6C3.1,758.7,1.9,697.1,1.9,697.1s-6.2-275.7,3.7-300.3c45.5-93.5,166-137.2,166-137.2l18.6,62.1
                    c-30.8-2.5-92.3,54.1-110.8,72.6c-17.2,18.5-14.8,38.1-14.8,38.1l-1.2,230.1c0,0,27.1-22.2,76.3-59.1
                    c83.7-55.4,141.5-11.1,178.4,18.5C335.9,636.3,357,655.4,385.8,669.7z"
                />
                <path
                  fill="#ff0062"
                  d="M400.5,0L400.5,0c0,0-0.2,0-0.5,0c-0.3,0-0.5,0-0.5,0v0c-15.2,0.3-198.1,7.1-193.1,169.8
                    c4.9,159.9,107.6,289.4,153.1,331.1c3,2.8,10.6,9.2,14.2,11.2c8.1,4.6,13,7,25.8,7.2v0c0.2,0,0.3,0,0.5,0c0.2,0,0.3,0,0.5,0v0
                    c12.8-0.1,17.7-2.6,25.8-7.2c3.6-2,11.2-8.4,14.2-11.2c45.5-41.8,148.2-171.2,153.1-331.1C598.6,7.1,415.7,0.3,400.5,0z M399.9,267
                    c-53.7,0-97.2-43.5-97.2-97.2s43.5-97.2,97.2-97.2c53.7,0,97.2,43.5,97.2,97.2S453.6,267,399.9,267z"
                />
              </g>
            </svg>
          </div>
          <h1 className="text-6xl font-bebas-neue text-white tracking-wider mb-2">FEELING</h1>
          <p className="text-xl text-gray-300 font-light">Conexiones significativas</p>
        </div>

        {/* Mensaje principal */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-primary-500">
            ¿Ya eres parte de Feeling?
          </h2>
          <p className="text-gray-300 text-lg mb-4">
            Descubre relaciones significativas basadas en intereses compartidos, valores y estilos de vida.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row w-full gap-4">
          <Button
            size="lg"
            radius="full"
            className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors py-6"
            variant="solid"
            onPress={handleLogin}>
            Iniciar Sesión
          </Button>
          <Button
            size="lg"
            radius="full"
            className="w-full bg-primary hover:bg-primary-600 transition-colors py-6"
            variant="solid"
            onPress={handleRegister}>
            Registrarme
          </Button>
        </div>

        {/* Testimonios o elementos adicionales como badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="bg-background-tertiary p-3 rounded-full text-xs text-gray-300 flex items-center">
            <span className="material-symbols-outlined text-primary text-sm mr-1">favorite</span>
            Comunidad con +10,000 miembros
          </div>
          <div className="bg-background-tertiary p-3 rounded-full text-xs text-gray-300 flex items-center">
            <span className="material-symbols-outlined text-primary text-sm mr-1">event</span>
            Eventos exclusivos
          </div>
          <div className="bg-background-tertiary p-3 rounded-full text-xs text-gray-300 flex items-center">
            <span className="material-symbols-outlined text-primary text-sm mr-1">verified</span>
            Perfiles verificados
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
