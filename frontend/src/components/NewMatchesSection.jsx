import { useMemo } from 'react'
import { Button, Chip } from '@heroui/react'
import { Heart, Users, Zap } from 'lucide-react'
import UserCard from '@components/ui/UserCard.jsx'
import { Logger } from '@utils/logger.js'

const NewMatchesSection = ({ matches, searchTerm, getCategoryIcon }) => {
  // Filtrar matches basado en el término de búsqueda
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches

    const searchLower = searchTerm.toLowerCase()
    return matches.filter(
      match =>
        match.name.toLowerCase().includes(searchLower) ||
        match.location.toLowerCase().includes(searchLower) ||
        match.interests.some(interest => interest.toLowerCase().includes(searchLower))
    )
  }, [matches, searchTerm])

  const handleViewProfile = match => {
    Logger.info('Viendo perfil de nuevo match', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  const handleStartConversation = match => {
    Logger.info('Iniciando conversación con nuevo match', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  const handleSuperLike = match => {
    Logger.info('Enviando super like', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  if (filteredMatches.length === 0) {
    return (
      <div className='text-center py-12'>
        {searchTerm ? (
          <>
            <Users className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>No se encontraron matches</h3>
            <p className='text-gray-500'>Intenta con otros términos de búsqueda</p>
          </>
        ) : (
          <>
            <Heart className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>¡Aún no tienes nuevos matches!</h3>
            <p className='text-gray-500 mb-4'>Sigue explorando y conectando con personas increíbles</p>
            <Button color='primary' startContent={<Zap className='w-4 h-4' />} className='bg-gradient-to-r from-primary-500 to-purple-500'>
              Buscar Más Personas
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-200'>Nuevos Matches ({filteredMatches.length})</h2>
        <Chip color='success' variant='flat' size='sm'>
          ¡{filteredMatches.filter(m => m.isOnline).length} en línea!
        </Chip>
      </div>

      {/* Grid de matches usando UserCard */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredMatches.map(match => (
          <UserCard
            key={match.id}
            user={match}
            variant='default'
            onViewProfile={handleViewProfile}
            onMessage={handleStartConversation}
            showCompatibility={true}
            showDistance={true}
          />
        ))}
      </div>

      {/* Footer con consejos */}
      {filteredMatches.length > 0 && (
        <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Heart className='w-4 h-4 text-blue-400' />
            <span className='text-blue-300 font-medium'>Consejo para nuevos matches</span>
          </div>
          <p className='text-blue-200 text-sm'>
            ¡No olvides enviar un mensaje personalizado! Menciona algo específico de su perfil o sus intereses para iniciar una conversación
            más auténtica.
          </p>
        </div>
      )}
    </div>
  )
}

export default NewMatchesSection
