import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@heroui/react'
import LiteContainer from '@components/layout/LiteContainer'
import logo from '@assets/logo/logo-grey-dark.svg'

const NotFoundPage = () => {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Iniciar animación después de montar el componente
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <LiteContainer>
      {/* Logo */}
      <figure className="text-center mb-8">
        <img src={logo} alt="Logo Feeling" className="w-64 md:w-72 lg:w-80 mx-auto" />
      </figure>

      {/* Error principal */}
      <div className="mb-8">
        <h1
          className={`text-8xl md:text-9xl font-bold text-white mb-2 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 text-center transition-all duration-700 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          404
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full mb-6"></div>
      </div>

      {/* Mensaje */}
      <div className="mb-12 text-center">
        <h2
          className={`text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 drop-shadow-lg transition-all duration-700 delay-200 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          Página no encontrada
        </h2>
        <p
          className={`text-lg md:text-xl text-gray-300 mb-6 leading-relaxed transition-all duration-700 delay-300 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          Parece que te has perdido en el espacio digital.
          <br />
          No te preocupes, te ayudamos a encontrar el camino de vuelta.
        </p>
      </div>

      {/* Botones de acción */}
      <div
        className={`flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-md transition-all duration-700 delay-500 ${animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
        <Link to="/" className="flex-1">
          <Button color="primary" className="w-full transition-all duration-300 hover:scale-105" size="lg" radius="full">
            Volver al inicio
          </Button>
        </Link>
        <Link to="/contact" className="flex-1">
          <Button color="default" className="w-full transition-all duration-300 hover:scale-105" size="lg" radius="full">
            Contacto
          </Button>
        </Link>
      </div>
    </LiteContainer>
  )
}

export default NotFoundPage
