import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip } from '@heroui/react'
import { Heart, Sparkles, Flame, MessageCircle, Send, MapPin, Briefcase } from 'lucide-react'

const MatchRequestModal = ({ isOpen, onClose, user, onConfirm }) => {
  if (!user) return null

  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-5 h-5 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-5 h-5 text-red-400' />
      case 'SPIRIT':
        return <MessageCircle className='w-5 h-5 text-purple-400' />
      default:
        return <Heart className='w-5 h-5 text-gray-400' />
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement='center'
      size='lg'
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center'>
              <Heart className='w-5 h-5 text-red-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Enviar Match</h2>
              <p className='text-sm text-gray-400 font-normal'>¿Quieres conectar con esta persona?</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-6'>
          {/* User profile preview */}
          <Card className='bg-gray-700/30 border-gray-600/50 overflow-hidden'>
            <CardBody className='p-0'>
              <div className='relative'>
                <img src={user.images?.[0] || '/api/placeholder/400/300'} alt={user.name} className='w-full h-48 object-cover' />
                <div className='absolute top-3 right-3'>
                  <div className='w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center'>
                    {getCategoryIcon(user.category)}
                  </div>
                </div>
                {user.compatibility && (
                  <div className='absolute top-3 left-3'>
                    <Chip size='sm' color='success' variant='solid'>
                      {user.compatibility}% compatible
                    </Chip>
                  </div>
                )}
              </div>

              <div className='p-4 space-y-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-100'>
                      {user.name}, {user.age}
                    </h3>
                    <div className='flex items-center gap-1 text-gray-400'>
                      <MapPin className='w-4 h-4' />
                      <span className='text-sm'>{user.location}</span>
                      {user.distance && <span className='text-sm'>• {user.distance}km</span>}
                    </div>
                  </div>
                  {user.isOnline && (
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                      <span className='text-xs text-green-400'>En línea</span>
                    </div>
                  )}
                </div>

                {user.occupation && (
                  <div className='flex items-center gap-2'>
                    <Briefcase className='w-4 h-4 text-gray-400' />
                    <span className='text-sm text-gray-300'>{user.occupation}</span>
                  </div>
                )}

                {user.description && <p className='text-sm text-gray-300'>{user.description}</p>}

                {user.interests && user.interests.length > 0 && (
                  <div className='flex items-center gap-2 flex-wrap'>
                    {user.interests.slice(0, 4).map((interest, index) => (
                      <Chip key={index} size='sm' variant='bordered' className='text-xs'>
                        {interest}
                      </Chip>
                    ))}
                    {user.interests.length > 4 && (
                      <Chip size='sm' variant='bordered' className='text-xs'>
                        +{user.interests.length - 4} más
                      </Chip>
                    )}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Match info */}
          <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Send className='w-4 h-4 text-blue-400' />
              </div>
              <div>
                <p className='font-medium text-blue-400 mb-1'>¿Cómo funciona?</p>
                <ul className='text-sm text-blue-300 space-y-1'>
                  <li>• Se enviará una notificación a {user.name}</li>
                  <li>• Si acepta tu match, podrán verse mutuamente</li>
                  <li>• Una vez conectados, se desbloqueará la información de contacto</li>
                  <li>• Esto consumirá 1 intento de tu plan actual</li>
                </ul>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant='bordered' onPress={onClose} className='border-gray-600 text-gray-300'>
            Cancelar
          </Button>
          <Button color='primary' onPress={onConfirm} startContent={<Heart className='w-4 h-4' />}>
            Enviar Match
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MatchRequestModal
