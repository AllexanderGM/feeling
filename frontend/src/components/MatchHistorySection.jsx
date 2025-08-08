import { useState, useMemo } from 'react'
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import {
  Archive,
  Clock,
  MessageCircle,
  Eye,
  Trash2,
  RotateCcw,
  Calendar,
  MapPin,
  Star,
  Users,
  Search,
  TrendingUp,
  Filter
} from 'lucide-react'
import { Logger } from '@utils/logger.js'

const MatchHistorySection = ({ history, searchTerm, getCategoryIcon }) => {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onOpenChange: onHistoryOpenChange } = useDisclosure()

  // Filtrar historial basado en el término de búsqueda y estado
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        match => match.name.toLowerCase().includes(searchLower) || match.location.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => match.status === filterStatus)
    }

    return filtered.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  }, [history, searchTerm, filterStatus])

  const getTimeAgo = date => {
    const now = new Date()
    const diffInDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} sem`
    return `Hace ${Math.floor(diffInDays / 30)} meses`
  }

  const getStatusInfo = status => {
    switch (status) {
      case 'inactive':
        return {
          label: 'Inactiva',
          color: 'warning',
          description: 'Conversación sin actividad reciente'
        }
      case 'ended':
        return {
          label: 'Finalizada',
          color: 'danger',
          description: 'Conversación terminada'
        }
      case 'archived':
        return {
          label: 'Archivada',
          color: 'default',
          description: 'Conversación archivada por el usuario'
        }
      default:
        return {
          label: 'Desconocido',
          color: 'default',
          description: 'Estado desconocido'
        }
    }
  }

  const handleViewHistory = match => {
    setSelectedMatch(match)
    onHistoryOpen()
  }

  const handleRestoreConversation = match => {
    Logger.info('Restaurando conversación', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  const handleDeleteForever = match => {
    Logger.warn('Eliminando conversación permanentemente', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  const handleArchiveMatch = match => {
    Logger.info('Archivando match', Logger.CATEGORIES.USER, { matchName: match.name, matchId: match.id })
  }

  const statusFilters = [
    { id: 'all', label: 'Todos', count: history.length },
    { id: 'inactive', label: 'Inactivas', count: history.filter(h => h.status === 'inactive').length },
    { id: 'ended', label: 'Finalizadas', count: history.filter(h => h.status === 'ended').length },
    { id: 'archived', label: 'Archivadas', count: history.filter(h => h.status === 'archived').length }
  ]

  if (filteredHistory.length === 0) {
    return (
      <div className='text-center py-12'>
        {searchTerm || filterStatus !== 'all' ? (
          <>
            <Search className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>No se encontraron resultados</h3>
            <p className='text-gray-500 mb-4'>Intenta ajustar los filtros o términos de búsqueda</p>
            <Button
              variant='bordered'
              className='border-gray-600 text-gray-300'
              onPress={() => {
                setFilterStatus('all')
              }}>
              Limpiar filtros
            </Button>
          </>
        ) : (
          <>
            <Archive className='w-12 h-12 text-gray-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-400 mb-2'>¡Aún no tienes historial de matches!</h3>
            <p className='text-gray-500 mb-4'>Cuando tengas conversaciones que terminen o se vuelvan inactivas, aparecerán aquí</p>
            <Button
              color='primary'
              startContent={<Users className='w-4 h-4' />}
              className='bg-gradient-to-r from-primary-500 to-purple-500'>
              Ver Matches Activos
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header con filtros */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <h2 className='text-lg font-semibold text-gray-200'>Historial de Matches ({filteredHistory.length})</h2>

        {/* Filtros de estado */}
        <div className='flex items-center gap-2 flex-wrap'>
          {statusFilters.map(filter => (
            <Button
              key={filter.id}
              size='sm'
              variant={filterStatus === filter.id ? 'solid' : 'bordered'}
              color={filterStatus === filter.id ? 'primary' : 'default'}
              className={filterStatus === filter.id ? '' : 'border-gray-600 text-gray-300 hover:bg-gray-700/30'}
              onPress={() => setFilterStatus(filter.id)}>
              {filter.label}
              {filter.count > 0 && (
                <Chip size='sm' variant='flat' className='ml-1'>
                  {filter.count}
                </Chip>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de historial */}
      <div className='space-y-3'>
        {filteredHistory.map(match => {
          const statusInfo = getStatusInfo(match.status)
          return (
            <Card key={match.id} className='bg-gray-700/20 border-gray-600/20 hover:bg-gray-700/30 transition-all duration-200'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-4'>
                  {/* Avatar */}
                  <div className='relative shrink-0'>
                    <Avatar src={match.image} alt={match.name} className='w-14 h-14 opacity-80' />
                    <div className='absolute -top-1 -right-1'>
                      <Chip size='sm' color={statusInfo.color} variant='flat' className='text-xs'>
                        {statusInfo.label}
                      </Chip>
                    </div>
                  </div>

                  {/* Información del match */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-semibold text-gray-200'>{match.name}</h3>
                        {getCategoryIcon(match.category)}
                        <span className='text-xs text-gray-400'>{match.age} años</span>
                      </div>
                      <div className='text-xs text-gray-400'>{getTimeAgo(match.lastActivity)}</div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                          <MapPin className='w-3 h-3' />
                          <span>
                            {match.location} • {match.distance} km
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                          <MessageCircle className='w-3 h-3' />
                          <span>{match.totalMessages} mensajes intercambiados</span>
                        </div>
                        <p className='text-xs text-gray-500'>{statusInfo.description}</p>
                      </div>

                      {/* Acciones */}
                      <div className='flex items-center gap-2'>
                        <Button
                          size='sm'
                          variant='bordered'
                          className='border-gray-600 text-gray-300 hover:bg-gray-700/30'
                          startContent={<Eye className='w-3 h-3' />}
                          onPress={() => handleViewHistory(match)}>
                          Ver Detalles
                        </Button>

                        {match.status === 'inactive' && (
                          <Button
                            size='sm'
                            color='success'
                            variant='flat'
                            startContent={<RotateCcw className='w-3 h-3' />}
                            onPress={() => handleRestoreConversation(match)}>
                            Restaurar
                          </Button>
                        )}

                        {match.status !== 'archived' && (
                          <Button
                            size='sm'
                            variant='flat'
                            className='text-warning-400 hover:bg-warning-400/10'
                            startContent={<Archive className='w-3 h-3' />}
                            onPress={() => handleArchiveMatch(match)}>
                            Archivar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Modal de detalles del historial */}
      <Modal
        isOpen={isHistoryOpen}
        onOpenChange={onHistoryOpenChange}
        size='2xl'
        classNames={{
          base: 'bg-gray-900/95 backdrop-blur-sm',
          header: 'border-b border-gray-700/50',
          footer: 'border-t border-gray-700/50',
          closeButton: 'hover:bg-gray-800/50'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {selectedMatch && (
                  <div className='flex items-center gap-3'>
                    <Avatar src={selectedMatch.image} alt={selectedMatch.name} className='w-16 h-16' />
                    <div>
                      <h3 className='text-xl font-bold text-gray-200'>{selectedMatch.name}</h3>
                      <p className='text-gray-400'>
                        {selectedMatch.age} años • {selectedMatch.location}
                      </p>
                      <Chip size='sm' color={getStatusInfo(selectedMatch.status).color} variant='flat' className='mt-1'>
                        {getStatusInfo(selectedMatch.status).label}
                      </Chip>
                    </div>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className='py-6'>
                {selectedMatch && (
                  <div className='space-y-6'>
                    {/* Estadísticas de la conversación */}
                    <div className='grid grid-cols-2 gap-4'>
                      <Card className='bg-gray-700/30 border-gray-600/30'>
                        <CardBody className='p-4 text-center'>
                          <MessageCircle className='w-6 h-6 text-blue-400 mx-auto mb-2' />
                          <div className='text-lg font-bold text-blue-400'>{selectedMatch.totalMessages}</div>
                          <div className='text-xs text-gray-400'>Mensajes totales</div>
                        </CardBody>
                      </Card>
                      <Card className='bg-gray-700/30 border-gray-600/30'>
                        <CardBody className='p-4 text-center'>
                          <Clock className='w-6 h-6 text-green-400 mx-auto mb-2' />
                          <div className='text-lg font-bold text-green-400'>{getTimeAgo(selectedMatch.lastActivity)}</div>
                          <div className='text-xs text-gray-400'>Última actividad</div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Información del match */}
                    <div>
                      <h4 className='font-semibold text-gray-200 mb-3'>Información del Match</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-gray-400' />
                          <span className='text-gray-300'>
                            {selectedMatch.location} ({selectedMatch.distance} km)
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-gray-400' />
                          <span className='text-gray-300'>{selectedMatch.age} años</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          {getCategoryIcon(selectedMatch.category)}
                          <span className='text-gray-300'>Categoría {selectedMatch.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estado y descripción */}
                    <div className='bg-gray-700/30 border border-gray-600/30 rounded-lg p-4'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Archive className='w-4 h-4 text-gray-400' />
                        <span className='font-medium text-gray-200'>Estado de la conversación</span>
                      </div>
                      <p className='text-gray-300 text-sm'>{getStatusInfo(selectedMatch.status).description}</p>
                    </div>

                    {/* Consejos para reactivar */}
                    {selectedMatch.status === 'inactive' && (
                      <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
                        <div className='flex items-center gap-2 mb-2'>
                          <TrendingUp className='w-4 h-4 text-blue-400' />
                          <span className='font-medium text-blue-300'>Consejos para reactivar</span>
                        </div>
                        <ul className='text-blue-200 text-sm space-y-1'>
                          <li>• Envía un mensaje casual preguntando cómo está</li>
                          <li>• Comparte algo interesante que hayas visto</li>
                          <li>• Haz referencia a una conversación anterior</li>
                          <li>• Sugiere una actividad en común</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cerrar
                </Button>
                {selectedMatch?.status === 'inactive' && (
                  <Button
                    color='success'
                    startContent={<RotateCcw className='w-4 h-4' />}
                    onPress={() => {
                      handleRestoreConversation(selectedMatch)
                      onClose()
                    }}>
                    Restaurar Conversación
                  </Button>
                )}
                <Button
                  color='danger'
                  variant='flat'
                  startContent={<Trash2 className='w-4 h-4' />}
                  onPress={() => {
                    handleDeleteForever(selectedMatch)
                    onClose()
                  }}>
                  Eliminar Permanentemente
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Estadísticas del historial */}
      {filteredHistory.length > 3 && (
        <Card className='bg-gray-700/20 border-gray-600/20'>
          <CardBody className='p-4'>
            <div className='text-center mb-4'>
              <h3 className='font-semibold text-gray-200'>Resumen del Historial</h3>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-yellow-400'>{history.filter(h => h.status === 'inactive').length}</div>
                <div className='text-xs text-gray-400'>Conversaciones inactivas</div>
              </div>
              <div>
                <div className='text-lg font-bold text-red-400'>{history.filter(h => h.status === 'ended').length}</div>
                <div className='text-xs text-gray-400'>Conversaciones finalizadas</div>
              </div>
              <div>
                <div className='text-lg font-bold text-blue-400'>{history.reduce((total, h) => total + h.totalMessages, 0)}</div>
                <div className='text-xs text-gray-400'>Mensajes totales</div>
              </div>
              <div>
                <div className='text-lg font-bold text-purple-400'>
                  {Math.round(history.reduce((total, h) => total + h.totalMessages, 0) / history.length)}
                </div>
                <div className='text-xs text-gray-400'>Promedio por conversación</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default MatchHistorySection
