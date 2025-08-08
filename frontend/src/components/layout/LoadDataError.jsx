import { Button } from '@heroui/react'

export default function LoadDataError({ children }) {
  return (
    <div className='flex-1 flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <p className='text-red-400'>{children}</p>
        <div className='flex items-center justify-center space-x-2'>
          <Button variant='bordered' onPress={() => window.location.reload()}>
            Reintentar
          </Button>

          <Button variant='bordered' onPress={() => (window.location.href = '/user/complete-profile')}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
