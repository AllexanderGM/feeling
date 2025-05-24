import { Link } from 'react-router-dom'
import { Button } from '@heroui/react'
import BackgroundEffect from '@components/layout/BackgroundEffect'
import logo from '@assets/logo/logo-grey-dark.svg'

const NotFoundPage = () => {
  return (
    <BackgroundEffect>
      <figure className="text-center pb-12 mb-8">
        <img src={logo} alt="Logo Feeling" className="w-64 md:w-72 lg:w-80 mx-auto" />
      </figure>
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-lg">
          404
        </h1>
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-white mb-8 drop-shadow-md">
          Página no encontrada
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl drop-shadow-sm">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link to="/">
          <Button 
            color="default"
            className="px-8 py-3 transition-all duration-300 hover:scale-105"
            size="lg"
            radius="full">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </BackgroundEffect>
  )
}

export default NotFoundPage