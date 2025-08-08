import { useState, useEffect, useRef, memo } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Chip,
  User,
  ScrollShadow,
  Divider,
  Card,
  CardBody,
  Select,
  SelectItem
} from '@heroui/react'
import { Send, MessageSquare, Clock, User as UserIcon, Shield, AlertTriangle, CheckCircle, XCircle, FileText, Calendar } from 'lucide-react'
import { Logger } from '@utils/logger.js'
// Utility function for relative time formatting
const formatRelativeTime = timestamp => {
  if (!timestamp) return 'N/A'
  try {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'ahora mismo'
    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 30) return `hace ${diffDays}d`

    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths < 12) return `hace ${diffMonths}mes`

    const diffYears = Math.floor(diffDays / 365)
    return `hace ${diffYears}año${diffYears > 1 ? 's' : ''}`
  } catch {
    return 'Fecha inválida'
  }
}
import { COMPLAINT_STATUS, COMPLAINT_STATUS_COLORS, COMPLAINT_PRIORITY_COLORS, COMPLAINT_TYPES } from '@constants/tableConstants.js'

const ComplaintChatModal = memo(({ isOpen, onClose, complaint, isAdmin = false, onSendMessage, onUpdateStatus, loading = false }) => {
  const [newMessage, setNewMessage] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const messagesEndRef = useRef(null)

  // Mock messages - en una implementación real vendrían del backend
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (complaint) {
      // Simular mensajes iniciales
      setMessages([
        {
          id: 1,
          content: complaint.message,
          sender: complaint.user,
          senderType: 'user',
          timestamp: complaint.createdAt,
          isSystemMessage: false
        },
        {
          id: 2,
          content: `Queja creada con prioridad ${complaint.priority}`,
          senderType: 'system',
          timestamp: complaint.createdAt,
          isSystemMessage: true
        }
      ])
      setNewStatus(complaint.status)
    }
  }, [complaint])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      const message = {
        id: Date.now(),
        content: newMessage,
        sender: isAdmin ? { name: 'Administrador', email: 'admin@feeling.com' } : complaint.user,
        senderType: isAdmin ? 'admin' : 'user',
        timestamp: new Date().toISOString(),
        isSystemMessage: false
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')

      await onSendMessage?.(complaint.id, newMessage)
    } catch (error) {
      Logger.error('Error sending message:', error, { category: Logger.CATEGORIES.SERVICE })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status) return

    setUpdatingStatus(true)
    try {
      const systemMessage = {
        id: Date.now(),
        content: `Estado actualizado de ${complaint.status} a ${newStatus}`,
        senderType: 'system',
        timestamp: new Date().toISOString(),
        isSystemMessage: true
      }

      setMessages(prev => [...prev, systemMessage])

      await onUpdateStatus?.(complaint.id, {
        status: newStatus,
        adminNotes: adminNotes
      })
    } catch (error) {
      Logger.error('Error updating status:', error, { category: Logger.CATEGORIES.SERVICE })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'OPEN':
        return <Clock size={16} />
      case 'IN_PROGRESS':
        return <AlertTriangle size={16} />
      case 'RESOLVED':
        return <CheckCircle size={16} />
      case 'CLOSED':
        return <XCircle size={16} />
      case 'ESCALATED':
        return <AlertTriangle size={16} />
      default:
        return <MessageSquare size={16} />
    }
  }

  const formatTimestamp = timestamp => {
    return formatRelativeTime(timestamp)
  }

  if (!complaint) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='4xl'
      scrollBehavior='inside'
      classNames={{
        base: 'max-h-[90vh]'
      }}>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 pb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <MessageSquare className='text-primary' size={24} />
              <div>
                <h3 className='text-lg font-semibold'>Queja #{complaint.id}</h3>
                <p className='text-sm text-gray-500'>{complaint.subject}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Chip size='sm' color={COMPLAINT_PRIORITY_COLORS[complaint.priority]} variant='flat'>
                {complaint.priority}
              </Chip>
              <Chip
                size='sm'
                color={COMPLAINT_STATUS_COLORS[complaint.status]}
                variant='flat'
                startContent={getStatusIcon(complaint.status)}>
                {complaint.status.replace('_', ' ')}
              </Chip>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='px-6 py-0'>
          {/* Información de la queja */}
          <Card className='mb-4'>
            <CardBody className='p-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <UserIcon size={16} />
                    Información del Usuario
                  </h4>
                  <User
                    name={complaint.user?.name}
                    description={complaint.user?.email}
                    avatarProps={{
                      src: complaint.user?.profileImage,
                      size: 'sm'
                    }}
                  />
                </div>
                <div>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <FileText size={16} />
                    Detalles de la Queja
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <p>
                      <span className='font-medium'>Tipo:</span> {COMPLAINT_TYPES[complaint.complaintType]}
                    </p>
                    <p>
                      <span className='font-medium'>Creada:</span> {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                    {complaint.updatedAt !== complaint.createdAt && (
                      <p>
                        <span className='font-medium'>Actualizada:</span> {new Date(complaint.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Chat de mensajes */}
          <div className='flex-1 min-h-[300px] max-h-[400px]'>
            <h4 className='font-semibold mb-3 flex items-center gap-2'>
              <MessageSquare size={16} />
              Conversación
            </h4>

            <ScrollShadow className='h-full'>
              <div className='space-y-3 pr-2'>
                {messages.map(message => (
                  <div key={message.id}>
                    {message.isSystemMessage ? (
                      <div className='flex justify-center'>
                        <Chip size='sm' color='default' variant='flat' startContent={<Calendar size={12} />}>
                          {message.content} • {formatTimestamp(message.timestamp)}
                        </Chip>
                      </div>
                    ) : (
                      <div className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] ${
                            message.senderType === 'admin' ? 'bg-primary text-white' : 'bg-gray-100'
                          } rounded-lg p-3`}>
                          <div className='flex items-center gap-2 mb-1'>
                            {message.senderType === 'admin' ? (
                              <Shield size={12} className='text-white' />
                            ) : (
                              <UserIcon size={12} className='text-gray-600' />
                            )}
                            <span className='text-xs font-medium'>
                              {message.sender?.name || (message.senderType === 'admin' ? 'Administrador' : 'Usuario')}
                            </span>
                            <span className={`text-xs ${message.senderType === 'admin' ? 'text-white/70' : 'text-gray-500'}`}>
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className='text-sm'>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollShadow>
          </div>

          <Divider className='my-4' />

          {/* Controles administrativos */}
          {isAdmin && (
            <div className='space-y-4 mb-4'>
              <h4 className='font-semibold flex items-center gap-2'>
                <Shield size={16} />
                Controles Administrativos
              </h4>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Select
                  label='Cambiar Estado'
                  selectedKeys={newStatus ? [newStatus] : []}
                  onSelectionChange={keys => setNewStatus(Array.from(keys)[0])}>
                  {Object.values(COMPLAINT_STATUS).map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </Select>

                <Button
                  color='primary'
                  variant='flat'
                  onPress={handleStatusUpdate}
                  isLoading={updatingStatus}
                  isDisabled={newStatus === complaint.status}>
                  Actualizar Estado
                </Button>
              </div>

              <Textarea
                label='Notas Administrativas (Opcional)'
                placeholder='Agregar notas internas sobre esta queja...'
                value={adminNotes}
                onValueChange={setAdminNotes}
                maxRows={3}
              />
            </div>
          )}

          {/* Campo de nuevo mensaje */}
          <div className='flex gap-2'>
            <Textarea
              placeholder='Escribir mensaje...'
              value={newMessage}
              onValueChange={setNewMessage}
              maxRows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button isIconOnly color='primary' onPress={handleSendMessage} isLoading={sendingMessage} isDisabled={!newMessage.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant='light' onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

ComplaintChatModal.displayName = 'ComplaintChatModal'

export { ComplaintChatModal }
