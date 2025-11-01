import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Button, Spinner } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { MessageSquare, Plus, RefreshCw, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useError, useComplaints } from '@hooks'
import { COMPLAINT_TYPE_COLUMNS } from '@constants/tableConstants.js'
import LiteContainer from '@components/layout/LiteContainer.jsx'

import { UnifiedComplaintTable } from '../components/UnifiedComplaintTable.jsx'
import { CreateComplaintForm } from '../components/CreateComplaintForm.jsx'
import { ComplaintChatModal } from '../components/ComplaintChatModal.jsx'

const UserComplaints = memo(() => {
  const { showError } = useError()
  const { myComplaints, loading, createComplaint, getMyComplaints, sendMessage } = useComplaints()

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  // Efectos
  useEffect(() => {
    handleLoadMyComplaints()
  }, [])

  // Handlers principales
  const handleLoadMyComplaints = useCallback(async () => {
    try {
      await getMyComplaints()
    } catch (error) {
      showError('Error al cargar las quejas: ' + error.message)
    }
  }, [getMyComplaints, showError])

  const handleRefresh = useCallback(() => {
    handleLoadMyComplaints()
  }, [handleLoadMyComplaints])

  // Handlers para acciones de tabla
  const handleViewComplaint = useCallback(complaint => {
    setSelectedComplaint(complaint)
    setIsChatModalOpen(true)
  }, [])

  const handleOpenChat = useCallback(complaint => {
    setSelectedComplaint(complaint)
    setIsChatModalOpen(true)
  }, [])

  // Handlers para modales
  const handleCreateComplaint = useCallback(
    async formData => {
      try {
        await createComplaint(formData)
        setIsCreateModalOpen(false)
        handleLoadMyComplaints()
      } catch (error) {
        showError('Error al crear la queja: ' + error.message)
        throw error
      }
    },
    [createComplaint, handleLoadMyComplaints, showError]
  )

  const handleSendMessage = useCallback(
    async (complaintId, message) => {
      try {
        await sendMessage(complaintId, message)
        handleLoadMyComplaints()
      } catch (error) {
        showError('Error al enviar mensaje: ' + error.message)
        throw error
      }
    },
    [sendMessage, handleLoadMyComplaints, showError]
  )

  // Estadísticas para mostrar al usuario
  const complaintStats = useMemo(() => {
    if (!myComplaints.length)
      return {
        total: 0,
        open: 0,
        resolved: 0,
        waiting: 0
      }

    const stats = myComplaints.reduce(
      (acc, complaint) => {
        acc.total++
        if (complaint.status === 'RESOLVED') {
          acc.resolved++
        } else if (complaint.status === 'WAITING_USER') {
          acc.waiting++
        } else {
          acc.open++
        }

        return acc
      },
      { total: 0, open: 0, resolved: 0, waiting: 0 }
    )

    return stats
  }, [myComplaints])

  return (
    <>
      <Helmet>
        <title>Soporte - Feeling</title>
        <meta content='Gestiona tus quejas y reclamos' name='description' />
      </Helmet>

      <LiteContainer ariaLabel='Soporte y PQR' className='gap-4 px-4'>
        {/* Header con estilo consistente */}
        <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6'>
          {/* Título principal */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6'>
            <div className='w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center'>
              <MessageSquare className='w-5 h-5 text-purple-400' />
            </div>
            <div className='text-center sm:text-left flex-1'>
              <h1 className='text-lg sm:text-xl font-semibold text-gray-200'>Soporte</h1>
              <p className='text-sm text-gray-400'>Gestiona tus consultas, problemas y sugerencias</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button color='primary' size='sm' startContent={<Plus size={16} />} variant='flat' onPress={() => setIsCreateModalOpen(true)}>
                Nueva Solicitud
              </Button>
              <Button isIconOnly isLoading={loading} size='sm' variant='light' onPress={handleRefresh}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <MessageCircle className='text-blue-400' size={16} />
                <span className='text-xs text-gray-400'>Total</span>
              </div>
              <p className='text-lg font-bold text-gray-200'>{complaintStats.total}</p>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <Clock className='text-orange-400' size={16} />
                <span className='text-xs text-gray-400'>Abiertas</span>
              </div>
              <p className='text-lg font-bold text-gray-200'>{complaintStats.open}</p>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircle className='text-green-400' size={16} />
                <span className='text-xs text-gray-400'>Resueltas</span>
              </div>
              <p className='text-lg font-bold text-gray-200'>{complaintStats.resolved}</p>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <AlertCircle className='text-purple-400' size={16} />
                <span className='text-xs text-gray-400'>En espera</span>
              </div>
              <p className='text-lg font-bold text-gray-200'>{complaintStats.waiting}</p>
            </div>
          </div>
        </div>

        {/* Información útil */}
        <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
              <MessageSquare className='text-blue-400' size={16} />
            </div>
            <div className='text-sm text-gray-300'>
              <p className='font-medium mb-2 text-gray-200'>¿Cómo funciona el sistema de soporte?</p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs'>
                <div className='bg-gray-800/30 border border-gray-700/20 rounded-lg p-3'>
                  <p className='font-medium mb-1 text-gray-200'>1. Crear Solicitud</p>
                  <p className='text-gray-400'>Describe tu problema usando el botón &quot;Nueva Solicitud&quot;</p>
                </div>
                <div className='bg-gray-800/30 border border-gray-700/20 rounded-lg p-3'>
                  <p className='font-medium mb-1 text-gray-200'>2. Seguimiento</p>
                  <p className='text-gray-400'>Haz clic en el ícono de chat para ver el progreso</p>
                </div>
                <div className='bg-gray-800/30 border border-gray-700/20 rounded-lg p-3'>
                  <p className='font-medium mb-1 text-gray-200'>3. Resolución</p>
                  <p className='text-gray-400'>Recibirás notificaciones cuando sea atendida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de quejas */}
        <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden'>
          {loading && myComplaints.length === 0 ? (
            <div className='flex justify-center items-center py-12'>
              <div className='text-center'>
                <Spinner size='lg' />
                <p className='text-gray-400 mt-2 text-sm'>Cargando tus solicitudes...</p>
              </div>
            </div>
          ) : myComplaints.length === 0 ? (
            <div className='text-center py-12 px-4'>
              <div className='w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageSquare className='text-gray-500' size={32} />
              </div>
              <h3 className='text-base font-medium text-gray-200 mb-2'>No tienes solicitudes registradas</h3>
              <p className='text-sm text-gray-400 mb-4'>Cuando tengas algún problema o sugerencia, puedes crear una nueva solicitud</p>
              <Button color='primary' startContent={<Plus size={16} />} onPress={() => setIsCreateModalOpen(true)}>
                Crear Primera Solicitud
              </Button>
            </div>
          ) : (
            <UnifiedComplaintTable
              columns={COMPLAINT_TYPE_COLUMNS.my}
              complaints={myComplaints}
              loading={loading}
              showActions={true}
              viewType='my'
              onOpenChat={handleOpenChat}
              onView={handleViewComplaint}
            />
          )}
        </div>

        {/* Ayuda adicional */}
        <div className='w-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0'>
              <AlertCircle className='text-blue-400' size={16} />
            </div>
            <div className='text-sm'>
              <p className='font-medium mb-1 text-gray-200'>¿Necesitas ayuda inmediata?</p>
              <p className='text-xs text-gray-400'>
                Nuestro equipo responde en un plazo de 24-48 horas. Las solicitudes urgentes son priorizadas automáticamente.
              </p>
            </div>
          </div>
        </div>
      </LiteContainer>

      {/* Modales */}
      <CreateComplaintForm
        isOpen={isCreateModalOpen}
        loading={loading}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateComplaint}
      />

      <ComplaintChatModal
        complaint={selectedComplaint}
        isAdmin={false}
        isOpen={isChatModalOpen}
        loading={loading}
        onClose={() => {
          setIsChatModalOpen(false)
          setSelectedComplaint(null)
        }}
        onSendMessage={handleSendMessage}
      />
    </>
  )
})

UserComplaints.displayName = 'UserComplaints'

export default UserComplaints
