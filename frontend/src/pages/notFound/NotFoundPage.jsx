import { Link } from 'react-router-dom'
import { Button } from '@heroui/react'
import bgImg404 from '@assets/Backgrounds/desert-404.webp'

const NotFoundPage = () => {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundImage: `url(${bgImg404})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      <h1 className="text-4xl text-white">404</h1>
      <h2 className="text-7xl text-white">Página no encontrada</h2>
      <Link to="/">
        <Button color="primary" className="bg-[#E86C6E] border-1 border-white mt-4 px-10 py-2 " size="lg">
          Volver al inicio
        </Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
