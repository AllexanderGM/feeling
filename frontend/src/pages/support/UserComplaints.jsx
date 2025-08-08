import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import { Button, Card, CardBody, Input, Chip, Spinner } from '@heroui/react'
import { Helmet } from 'react-helmet-async'
import { MessageSquare, Plus, Search, RefreshCw, MessageCircle, Clock, CheckCircle, Eye } from 'lucide-react'
import { useError, useComplaints } from '@hooks'

import { UnifiedComplaintTable } from './components/UnifiedComplaintTable.jsx'
import { CreateComplaintForm } from './components/CreateComplaintForm.jsx'
import { ComplaintChatModal } from './components/ComplaintChatModal.jsx'
import { COMPLAINT_TYPE_COLUMNS } from '@constants/tableConstants.js'

const UserComplaints = memo(() => {
  const { showError } = useError()
  const { myComplaints, loading, createComplaint, getMyComplaints, sendMessage, pagination, setPagination, searchTerm, setSearchTerm } =
    useComplaints()

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

  const handleSearch = useCallback(
    value => {
      setSearchTerm(value)
      setPagination(prev => ({ ...prev, page: 0 }))
    },
    [setSearchTerm, setPagination]
  )

  const handlePageChange = useCallback(
    newPage => {
      setPagination(prev => ({ ...prev, page: newPage }))
    },
    [setPagination]
  )

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
        // Actualizar la lista de quejas para mostrar la nueva actividad
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
    if (!myComplaints.length) return null

    const stats = myComplaints.reduce(
      (acc, complaint) => {
        acc.total++
        acc[complaint.status] = (acc[complaint.status] || 0) + 1
        return acc
      },
      { total: 0 }
    )

    return stats
  }, [myComplaints])

  // Filtrar quejas basado en búsqueda
  const filteredComplaints = useMemo(() => {
    if (!searchTerm) return myComplaints

    return myComplaints.filter(
      complaint =>
        complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaintType.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [myComplaints, searchTerm])

  return (
    <>
      <Helmet>
        <title>Mis Quejas y Reclamos - Feeling</title>
        <meta name='description' content='Gestiona tus quejas y reclamos' />
      </Helmet>

      <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-200 flex items-center gap-3'>
              <div className='w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                <MessageSquare className='w-5 h-5 text-purple-400' />
              </div>
              Mis Quejas y Reclamos
            </h1>
            <p className='text-gray-400 mt-1'>Gestiona tus consultas, problemas y sugerencias</p>
          </div>

          <div className='flex items-center gap-2 justify-end'>
            <Button color='primary' startContent={<Plus size={16} />} onPress={() => setIsCreateModalOpen(true)}>
              Nueva Queja
            </Button>
            <Button variant='light' isIconOnly onPress={handleRefresh} isLoading={loading}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {complaintStats && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3'>
                  <MessageCircle className='text-blue-400' size={20} />
                  <div>
                    <p className='text-sm text-gray-400'>Total</p>
                    <p className='text-lg font-semibold text-gray-200'>{complaintStats.total}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3'>
                  <Clock className='text-orange-400' size={20} />
                  <div>
                    <p className='text-sm text-gray-400'>Abiertas</p>
                    <p className='text-lg font-semibold text-gray-200'>{(complaintStats.OPEN || 0) + (complaintStats.IN_PROGRESS || 0)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3'>
                  <CheckCircle className='text-green-400' size={20} />
                  <div>
                    <p className='text-sm text-gray-400'>Resueltas</p>
                    <p className='text-lg font-semibold text-gray-200'>{complaintStats.RESOLVED || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center gap-3'>
                  <MessageCircle className='text-purple-400' size={20} />
                  <div>
                    <p className='text-sm text-gray-400'>En espera</p>
                    <p className='text-lg font-semibold text-gray-200'>{complaintStats.WAITING_USER || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Barra de búsqueda */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
          <CardBody className='p-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Input
                placeholder='Buscar por asunto, mensaje o tipo...'
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<Search size={16} />}
                className='flex-1'
                isClearable
                onClear={() => handleSearch('')}
              />
            </div>
          </CardBody>
        </Card>

        {/* Información útil para usuarios */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
          <CardBody className='p-4'>
            <div className='flex items-start gap-3'>
              <MessageSquare className='text-blue-400 mt-1' size={20} />
              <div className='text-sm text-gray-300'>
                <p className='font-medium mb-2 text-gray-200'>¿Cómo funciona el sistema de quejas?</p>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs'>
                  <div>
                    <p className='font-medium mb-1 text-gray-200'>1. Crear Queja</p>
                    <p>Describe tu problema de manera detallada usando el botón "Nueva Queja"</p>
                  </div>
                  <div>
                    <p className='font-medium mb-1 text-gray-200'>2. Seguimiento</p>
                    <p>Haz clic en el ícono de chat para ver el progreso y comunicarte con nuestro equipo</p>
                  </div>
                  <div>
                    <p className='font-medium mb-1 text-gray-200'>3. Resolución</p>
                    <p>Recibirás notificaciones cuando tu queja sea atendida y resuelta</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de quejas */}
        <Card className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/50'>
          <CardBody className='p-0'>
            {loading && myComplaints.length === 0 ? (
              <div className='flex justify-center items-center py-12'>
                <div className='text-center'>
                  <Spinner size='lg' />
                  <p className='text-gray-400 mt-2'>Cargando tus quejas...</p>
                </div>
              </div>
            ) : (
              <UnifiedComplaintTable
                complaints={filteredComplaints}
                columns={COMPLAINT_TYPE_COLUMNS.my}
                loading={loading}
                totalPages={pagination.totalPages}
                currentPage={pagination.page}
                onPageChange={handlePageChange}
                onView={handleViewComplaint}
                onOpenChat={handleOpenChat}
                viewType='my'
                showActions={true}
              />
            )}

            {!loading && myComplaints.length === 0 && (
              <div className='text-center py-12'>
                <MessageSquare className='mx-auto text-gray-500 mb-4' size={64} />
                <h3 className='text-lg font-medium text-gray-200 mb-2'>No tienes quejas registradas</h3>
                <p className='text-gray-400 mb-4'>Cuando tengas algún problema o sugerencia, puedes crear una nueva queja</p>
                <Button color='primary' startContent={<Plus size={16} />} onPress={() => setIsCreateModalOpen(true)}>
                  Crear Primera Queja
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modales */}
      <CreateComplaintForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateComplaint}
        loading={loading}
      />

      <ComplaintChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false)
          setSelectedComplaint(null)
        }}
        complaint={selectedComplaint}
        isAdmin={false}
        onSendMessage={handleSendMessage}
        loading={loading}
      />
    </>
  )
})

UserComplaints.displayName = 'UserComplaints'

export default UserComplaints
