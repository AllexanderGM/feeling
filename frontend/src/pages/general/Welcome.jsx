import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import logo from '@assets/logo/logo-grey-dark.svg'

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
    <>
      {/* Contenido principal con animación */}
      <div
        className={`flex flex-col items-center text-center px-6 py-8 mx-auto max-w-lg transition-all duration-700 ease-out transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Logo y título */}
        <div className='mb-8 flex flex-col items-center'>
          <figure className='text-center mb-4'>
            <img src={logo} alt='Logo Feeling' className='w-64 md:w-72 lg:w-80 mx-auto' />
          </figure>
          <p className='text-xl text-gray-300 font-light'>Conexiones significativas</p>
        </div>

        {/* Mensaje principal */}
        <div className='mb-12 text-center'>
          <h2 className='text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-primary-500'>
            ¿Ya eres parte de Feeling?
          </h2>
          <p className='text-gray-300 text-lg mb-4'>
            Descubre relaciones significativas basadas en intereses compartidos, valores y estilos de vida.
          </p>
        </div>

        {/* Botones de acción */}
        <div className='flex flex-col sm:flex-row w-full gap-4'>
          <Button
            color='default'
            size='lg'
            radius='full'
            className='w-full transition-all duration-300 hover:scale-105'
            onPress={handleLogin}>
            Iniciar Sesión
          </Button>
          <Button
            color='primary'
            size='lg'
            radius='full'
            className='w-full transition-all duration-300 hover:scale-105'
            onPress={handleRegister}>
            Registrarme
          </Button>
        </div>

        {/* Testimonios o elementos adicionales como badges */}
        <div className='mt-12 flex flex-wrap justify-center gap-4'>
          <div className='bg-white/10 backdrop-blur-sm p-3 rounded-full text-xs text-gray-300 flex items-center border border-white/20'>
            <span className='material-symbols-outlined text-primary text-sm mr-1'>favorite</span>
            Comunidad con +10,000 miembros
          </div>
          <div className='bg-white/10 backdrop-blur-sm p-3 rounded-full text-xs text-gray-300 flex items-center border border-white/20'>
            <span className='material-symbols-outlined text-primary text-sm mr-1'>event</span>
            Eventos exclusivos
          </div>
          <div className='bg-white/10 backdrop-blur-sm p-3 rounded-full text-xs text-gray-300 flex items-center border border-white/20'>
            <span className='material-symbols-outlined text-primary text-sm mr-1'>verified</span>
            Perfiles verificados
          </div>
        </div>
      </div>
    </>
  )
}

export default Welcome
