import { Heart } from 'lucide-react'
import { Badge } from '@heroui/react'

const FavoritesCount = () => {
  // Aquí puedes implementar la lógica para obtener el conteo real de favoritos
  // Por ahora, retornamos un componente placeholder
  const favoritesCount = 0

  return (
    <div className='relative'>
      <Badge content={favoritesCount} color='primary' variant='solid' size='sm' className={favoritesCount > 0 ? '' : 'hidden'}>
        <Heart size={20} className='text-gray-600 hover:text-primary-500 transition-colors cursor-pointer' />
      </Badge>
    </div>
  )
}

export default FavoritesCount
