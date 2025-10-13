import { Heart } from 'lucide-react'
import { Badge } from '@heroui/react'

const FavoritesCount = () => {
  // Aquí puedes implementar la lógica para obtener el conteo real de favoritos
  // Por ahora, retornamos un componente placeholder
  const favoritesCount = 0

  return (
    <div className='relative'>
      <Badge className={favoritesCount > 0 ? '' : 'hidden'} color='primary' content={favoritesCount} size='sm' variant='solid'>
        <Heart className='text-gray-600 hover:text-primary-500 transition-colors cursor-pointer' size={20} />
      </Badge>
    </div>
  )
}

export default FavoritesCount
