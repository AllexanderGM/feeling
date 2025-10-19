import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'

export default function LoadDataError({ children }) {
  const navigate = useNavigate()

  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate(APP_PATHS.ROOT)
  }

  return (
    <div className='h-full min-h-[calc(100vh-8rem)] flex-1 flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <p className='text-primary-400'>{children}</p>
        <div className='flex items-center justify-center space-x-2'>
          <Button variant='bordered' onPress={handleRetry}>
            Reintentar
          </Button>

          <Button variant='bordered' onPress={handleGoHome}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
