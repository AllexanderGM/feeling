import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Chip, Badge } from '@heroui/react'
import { Heart, Check, X, Clock, Bell, User, Sparkles, Flame, MessageCircle } from 'lucide-react'

const MatchNotificationModal = ({ isOpen, onClose, notifications, onAccept, onReject, onMarkAsRead }) => {
  const getCategoryIcon = categoryKey => {
    switch (categoryKey?.toUpperCase()) {
      case 'ESSENCE':
        return <Sparkles className='w-4 h-4 text-blue-400' />
      case 'ROUSE':
        return <Flame className='w-4 h-4 text-red-400' />
      case 'SPIRIT':
        return <MessageCircle className='w-4 h-4 text-purple-400' />
      default:
        return <Heart className='w-4 h-4 text-gray-400' />
    }
  }

  const getNotificationTypeIcon = type => {
    switch (type) {
      case 'MATCH_RECEIVED':
        return <Heart className='w-5 h-5 text-red-400' />
      case 'MATCH_ACCEPTED':
        return <Check className='w-5 h-5 text-green-400' />
      case 'MATCH_REJECTED':
        return <X className='w-5 h-5 text-red-400' />
      default:
        return <Bell className='w-5 h-5 text-blue-400' />
    }
  }

  const getNotificationTitle = notification => {
    switch (notification.type) {
      case 'MATCH_RECEIVED':
        return '¡Nuevo Match Recibido!'
      case 'MATCH_ACCEPTED':
        return '¡Match Aceptado!'
      case 'MATCH_REJECTED':
        return 'Match Rechazado'
      default:
        return 'Notificación'
    }
  }

  const getNotificationMessage = notification => {
    switch (notification.type) {
      case 'MATCH_RECEIVED':
        return `${notification.user?.name} quiere hacer match contigo`
      case 'MATCH_ACCEPTED':
        return `${notification.user?.name} aceptó tu match`
      case 'MATCH_REJECTED':
        return `${notification.user?.name} rechazó tu match`
      default:
        return notification.message || 'Nueva notificación'
    }
  }

  const formatTime = dateString => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement='center'
      size='2xl'
      scrollBehavior='inside'
      classNames={{
        base: 'bg-gray-800 border border-gray-700',
        closeButton: 'text-gray-400 hover:text-gray-200'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 text-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                <Bell className='w-5 h-5 text-blue-400' />
              </div>
              {unreadCount > 0 && (
                <Badge content={unreadCount > 99 ? '99+' : unreadCount} color='danger' size='sm' className='absolute -top-1 -right-1' />
              )}
            </div>
            <div>
              <h2 className='text-xl font-bold'>Notificaciones de Matches</h2>
              <p className='text-sm text-gray-400 font-normal'>
                {unreadCount > 0 ? `${unreadCount} nuevas notificaciones` : 'Todas las notificaciones están al día'}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='gap-4'>
          {!notifications || notifications.length === 0 ? (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Bell className='w-8 h-8 text-gray-500' />
              </div>
              <h3 className='text-lg font-medium text-gray-400 mb-2'>No hay notificaciones</h3>
              <p className='text-sm text-gray-500'>Cuando recibas matches o respuestas, aparecerán aquí</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {notifications.map(notification => (
                <Card
                  key={notification.id}
                  className={`border transition-all hover:border-blue-500/50 ${
                    notification.read ? 'bg-gray-700/30 border-gray-600/50' : 'bg-blue-900/20 border-blue-500/30'
                  }`}>
                  <CardBody className='p-4'>
                    <div className='flex items-start gap-4'>
                      {/* Notification type icon */}
                      <div className='flex-shrink-0'>
                        <div className='w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center'>
                          {getNotificationTypeIcon(notification.type)}
                        </div>
                      </div>

                      {/* User info and message */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-3'>
                          <div>
                            <h4 className='font-bold text-gray-100 mb-1'>{getNotificationTitle(notification)}</h4>
                            <p className='text-gray-300 text-sm mb-2'>{getNotificationMessage(notification)}</p>

                            {/* User details */}
                            {notification.user && (
                              <div className='flex items-center gap-3 text-sm text-gray-400'>
                                <div className='flex items-center gap-2'>
                                  <User className='w-4 h-4' />
                                  <span>{notification.user.age} años</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                  {getCategoryIcon(notification.user.category)}
                                  <span>{notification.user.location}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Time and read status */}
                          <div className='flex flex-col items-end gap-2'>
                            <div className='flex items-center gap-2'>
                              <Clock className='w-3 h-3 text-gray-500' />
                              <span className='text-xs text-gray-500'>{formatTime(notification.createdAt)}</span>
                            </div>
                            {!notification.read && <div className='w-2 h-2 bg-blue-400 rounded-full'></div>}
                          </div>
                        </div>

                        {/* Action buttons for match requests */}
                        {notification.type === 'MATCH_RECEIVED' && !notification.responded && (
                          <div className='flex items-center gap-2 mt-3 pt-3 border-t border-gray-600/30'>
                            <Button
                              size='sm'
                              color='success'
                              startContent={<Check className='w-4 h-4' />}
                              onPress={() => {
                                onAccept?.(notification)
                                onMarkAsRead?.(notification.id)
                              }}>
                              Aceptar
                            </Button>
                            <Button
                              size='sm'
                              color='danger'
                              variant='bordered'
                              startContent={<X className='w-4 h-4' />}
                              onPress={() => {
                                onReject?.(notification)
                                onMarkAsRead?.(notification.id)
                              }}>
                              Rechazar
                            </Button>
                            {!notification.read && (
                              <Button
                                size='sm'
                                variant='light'
                                className='text-blue-400 hover:bg-blue-500/20'
                                onPress={() => onMarkAsRead?.(notification.id)}>
                                Marcar como leída
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Mark as read button for other notifications */}
                        {notification.type !== 'MATCH_RECEIVED' && !notification.read && (
                          <div className='mt-3 pt-3 border-t border-gray-600/30'>
                            <Button
                              size='sm'
                              variant='light'
                              className='text-blue-400 hover:bg-blue-500/20'
                              onPress={() => onMarkAsRead?.(notification.id)}>
                              Marcar como leída
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {notifications && notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant='bordered'
              className='border-gray-600 text-gray-300'
              onPress={() => {
                notifications.forEach(notification => {
                  if (!notification.read) {
                    onMarkAsRead?.(notification.id)
                  }
                })
              }}>
              Marcar todas como leídas
            </Button>
          )}
          <Button color='primary' onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MatchNotificationModal
