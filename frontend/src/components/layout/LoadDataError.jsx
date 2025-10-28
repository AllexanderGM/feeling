import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'
import { AlertCircle } from 'lucide-react'

export default function LoadDataError({ children, message, retryAction, retryButtonText = 'Reintentar' }) {
  const navigate = useNavigate()

  const handleRetry = () => {
    if (retryAction) {
      retryAction()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    navigate(APP_PATHS.ROOT)
  }

  const errorMessage = message || children || 'Ocurrió un error al cargar los datos'

  return (
    <div className='h-full min-h-[calc(100vh-8rem)] flex-1 flex items-center justify-center p-6'>
      <div className='text-center space-y-6 max-w-md'>
        <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto'>
          <AlertCircle className='w-8 h-8 text-red-400' />
        </div>
        <div className='space-y-2'>
          <h3 className='text-xl font-semibold text-gray-100'>Error al cargar</h3>
          <p className='text-gray-400'>{errorMessage}</p>
        </div>
        <div className='flex items-center justify-center gap-3'>
          <Button color='primary' variant='bordered' onPress={handleRetry}>
            {retryButtonText}
          </Button>
          <Button variant='bordered' onPress={handleGoHome}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
