import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Chip,
  Card,
  CardBody,
  Spinner,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea
} from '@heroui/react'
import {
  ArrowLeft,
  MapPin,
  Heart,
  X,
  Bookmark,
  Clock,
  CheckCircle2,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mail,
  Info,
  Ruler,
  Eye,
  Palette,
  User as UserIcon,
  GraduationCap,
  Church as ChurchIcon,
  Sparkles,
  Target,
  MoreVertical,
  Flag,
  Ban
} from 'lucide-react'
import { useUser, useMatchInteractions, useMatchFavorites, useError } from '@hooks'
import { useState, useEffect, useCallback } from 'react'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import { complaintService } from '@services'
import {
  getUserName,
  getUserLastName,
  getUserAge,
  getUserProfession,
  getUserCity,
  getUserDepartment,
  getUserLocality,
  getUserDescription,
  getUserImages,
  getUserGender,
  getUserLastActive,
  getUserVerified,
  getUserTags,
  getUserHeight,
  getUserEducation,
  getUserRelationshipType,
  getUserEyeColor,
  getUserHairColor,
  getUserBodyType,
  getUserMaritalStatus,
  getUserSexualRole,
  getUserReligion,
  getUserChurch,
  getUserSpiritualMoments,
  getUserSpiritualPractices,
  getUserCategoryInterest
} from '@schemas'

// Función auxiliar para formatear última actividad
const formatLastActive = lastActiveDate => {
  if (!lastActiveDate) return { text: null, color: 'gray' }

  const lastActive = Array.isArray(lastActiveDate)
    ? new Date(
        lastActiveDate[0],
        lastActiveDate[1] - 1,
        lastActiveDate[2],
        lastActiveDate[3] || 0,
        lastActiveDate[4] || 0,
        lastActiveDate[5] || 0,
        lastActiveDate[6] || 0
      )
    : new Date(lastActiveDate)

  const now = new Date()
  const diffInMs = now - lastActive
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 5) return { text: 'Activo ahora', color: 'success' }
  if (diffInMinutes < 60) return { text: `Hace ${diffInMinutes} min`, color: 'primary' }
  if (diffInHours < 24) return { text: `Hace ${diffInHours}h`, color: 'warning' }
  if (diffInDays === 1) return { text: 'Ayer', color: 'warning' }
  if (diffInDays < 7) return { text: `Hace ${diffInDays}d`, color: 'danger' }

  return { text: null, color: 'default' }
}

// Función auxiliar para formatear ubicación completa
const formatLocation = (city, department, locality) => {
  const parts = []

  if (locality) parts.push(locality)
  if (city && city !== locality) parts.push(city)
  if (department && department !== city) parts.push(department)

  return parts.length > 0 ? parts.join(', ') : null
}

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(false)

  // Hooks
  const { getUserProfileById } = useUser()
  const { sendMatch, dismissSuggestion, loading: matchLoading } = useMatchInteractions()
  const { toggleFavorite, checkIfFavorite, loading: favoriteLoading } = useMatchFavorites()
  const { handleError, handleSuccess } = useError()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  // Modal de reporte
  const { isOpen: isReportModalOpen, onOpen: onReportModalOpen, onOpenChange: onReportModalOpenChange } = useDisclosure()
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  // Obtener el usuario por ID
  const fetchUser = useCallback(
    async ({ withLoader = true } = {}) => {
      if (!userId) return

      if (withLoader) setLoading(true)

      try {
        const result = await getUserProfileById(userId, 'public', false)

        if (result?.success && result?.data) {
          setUserData(result.data)
          const favoriteStatus = await checkIfFavorite(userId)

          setIsFavorite(favoriteStatus)
        }
      } finally {
        if (withLoader) setLoading(false)
      }
    },
    [userId, getUserProfileById, checkIfFavorite]
  )

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleBack = () => {
    navigate(-1)
  }

  // Handlers para acciones de match
  const handleLike = useCallback(async () => {
    await sendMatch(userId)
    handleBack()
  }, [userId, sendMatch, handleBack])

  const handlePass = useCallback(async () => {
    await dismissSuggestion(userId)
    handleBack()
  }, [userId, dismissSuggestion, handleBack])

  const handleToggleFavorite = useCallback(async () => {
    const newFavoriteStatus = await toggleFavorite(userId)

    setIsFavorite(newFavoriteStatus)
  }, [userId, toggleFavorite])

  // Handler para reportar usuario
  const handleReportUser = useCallback(async () => {
    if (!reportReason || !reportDescription.trim()) {
      return
    }

    setIsSubmittingReport(true)

    try {
      const complaintData = {
        complaintType: reportReason === 'harassment' || reportReason === 'underage' ? 'ABUSE_REPORT' : 'USER_REPORT',
        priority: reportReason === 'harassment' || reportReason === 'underage' ? 'URGENT' : 'HIGH',
        subject: `Reporte de usuario - ${reportReason}`,
        description: reportDescription,
        reportedUserId: parseInt(userId),
        reportReason: reportReason
      }

      const result = await complaintService.createComplaint(complaintData)

      if (result?.success) {
        handleSuccess('Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.')

        // Cerrar modal y limpiar formulario
        onReportModalOpenChange()
        setReportReason('')
        setReportDescription('')
      }
    } catch (error) {
      handleError(error, { customMessage: 'No pudimos enviar el reporte. Por favor, intenta de nuevo.' })
    } finally {
      setIsSubmittingReport(false)
    }
  }, [userId, reportReason, reportDescription, onReportModalOpenChange])

  // Navegación de imágenes
  const handlePrevious = () => {
    if (images && images.length > 1) {
      setImageLoading(true)
      setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleNext = () => {
    if (images && images.length > 1) {
      setImageLoading(true)
      setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  if (loading) return <LoadData />
  if (!userData) return <LoadDataError message='Usuario no encontrado' />

  // Extraer datos usando accessors centralizados
  const compatibility = userData?.compatibility
  const hasPendingMatch = userData?.hasPendingMatch
  const hasAcceptedMatch = userData?.hasAcceptedMatch

  // Datos del perfil usando accessors
  const name = getUserName(userData)
  const lastName = getUserLastName(userData)
  const age = getUserAge(userData)
  const profession = getUserProfession(userData)
  const city = getUserCity(userData)
  const department = getUserDepartment(userData)
  const locality = getUserLocality(userData)
  const description = getUserDescription(userData)
  const images = getUserImages(userData) || []
  const gender = getUserGender(userData)
  const isVerified = getUserVerified(userData)
  const tags = getUserTags(userData) || []
  const height = getUserHeight(userData)
  const education = getUserEducation(userData)
  const relationshipType = getUserRelationshipType(userData)
  const eyeColor = getUserEyeColor(userData)
  const hairColor = getUserHairColor(userData)
  const bodyType = getUserBodyType(userData)
  const maritalStatus = getUserMaritalStatus(userData)
  const sexualRole = getUserSexualRole(userData)
  const religion = getUserReligion(userData)
  const church = getUserChurch(userData)
  const spiritualMoments = getUserSpiritualMoments(userData)
  const spiritualPractices = getUserSpiritualPractices(userData)
  const categoryInterest = getUserCategoryInterest(userData)

  // Datos de status
  const lastActive = getUserLastActive(userData)

  // Datos de compatibilidad
  const compatibilityPercentage = compatibility?.totalPercentage

  const { text: lastActiveText, color: lastActiveColor } = formatLastActive(lastActive)
  const fullLocation = formatLocation(city, department, locality)

  const hasMultipleImages = images.length > 1

  // Información rápida para mostrar
  const quickInfo = []

  if (age) quickInfo.push(`${age} años`)
  if (height) quickInfo.push(`${height} cm`)
  if (education) quickInfo.push(education)
  if (relationshipType) quickInfo.push(relationshipType)

  return (
    <div className='min-h-screen'>
      {/* Header fijo */}
      <div className='fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <Button isIconOnly className='bg-transparent text-gray-300' radius='full' size='sm' variant='light' onPress={handleBack}>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <div className='flex items-center gap-2'>
            {lastActiveText && (
              <Chip color={lastActiveColor} size='sm' startContent={<Clock className='w-3 h-3' />} variant='flat'>
                {lastActiveText}
              </Chip>
            )}
            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <Button isIconOnly className='bg-transparent text-gray-300' radius='full' size='sm' variant='light'>
                  <MoreVertical className='w-5 h-5' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Opciones de usuario' variant='flat'>
                <DropdownItem
                  key='report'
                  className='text-danger'
                  color='danger'
                  startContent={<Flag className='w-4 h-4' />}
                  onPress={onReportModalOpen}>
                  Reportar usuario
                </DropdownItem>
                <DropdownItem key='block' className='text-danger' color='danger' startContent={<Ban className='w-4 h-4' />}>
                  Bloquear usuario
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      <Modal isOpen={isReportModalOpen} size='lg' onOpenChange={onReportModalOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-lg font-bold'>Reportar usuario</h3>
                <p className='text-sm font-normal text-gray-400'>
                  Ayúdanos a mantener una comunidad segura reportando comportamientos inapropiados.
                </p>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  {/* Razón del reporte */}
                  <div className='space-y-2'>
                    <p aria-label='Motivo del reporte' className='text-sm font-medium text-gray-200' role='group'>
                      Motivo del reporte *
                    </p>
                    <div className='grid grid-cols-1 gap-2'>
                      {[
                        { value: 'inappropriate_content', label: 'Contenido inapropiado' },
                        { value: 'fake_profile', label: 'Perfil falso' },
                        { value: 'harassment', label: 'Acoso o comportamiento abusivo' },
                        { value: 'spam', label: 'Spam o publicidad' },
                        { value: 'underage', label: 'Menor de edad' },
                        { value: 'other', label: 'Otro motivo' }
                      ].map(reason => (
                        <Button
                          key={reason.value}
                          className={`justify-start ${
                            reportReason === reason.value
                              ? 'bg-primary/20 text-primary border-primary'
                              : 'bg-gray-800/40 text-gray-300 border-gray-700/50'
                          }`}
                          size='sm'
                          variant='bordered'
                          onPress={() => setReportReason(reason.value)}>
                          {reason.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Descripción del reporte */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-200' htmlFor='report-description'>
                      Descripción adicional *
                    </label>
                    <Textarea
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/40 border-gray-700/50'
                      }}
                      id='report-description'
                      maxLength={500}
                      minRows={4}
                      placeholder='Describe el problema con más detalle...'
                      value={reportDescription}
                      variant='bordered'
                      onChange={e => setReportDescription(e.target.value)}
                    />
                    <p className='text-xs text-gray-400'>{reportDescription.length}/500 caracteres</p>
                  </div>

                  <div className='bg-amber-500/10 border border-amber-500/30 rounded-lg p-3'>
                    <p className='text-xs text-amber-200'>
                      Los reportes son revisados por nuestro equipo. Si se confirma una violación de nuestras políticas, tomaremos acciones
                      apropiadas.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='flat' onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color='danger'
                  isDisabled={!reportReason || !reportDescription.trim() || isSubmittingReport}
                  isLoading={isSubmittingReport}
                  onPress={handleReportUser}>
                  Enviar reporte
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Contenido principal */}
      <div className='max-w-4xl mx-auto pt-16 pb-32 px-4'>
        <div className='grid lg:grid-cols-[1fr_400px] gap-6'>
          {/* Galería de fotos - Columna izquierda */}
          <div className='space-y-4'>
            {/* Imagen principal con galería */}
            <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50 overflow-hidden'>
              <CardBody className='p-0'>
                <div className='relative h-[500px] sm:h-[600px] lg:h-[700px] group'>
                  <img
                    alt={`${name} - Foto ${currentImageIndex + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    src={images[currentImageIndex]}
                    onLoad={handleImageLoad}
                  />

                  {/* Spinner de carga */}
                  {imageLoading && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
                      <Spinner color='primary' size='lg' />
                    </div>
                  )}

                  {/* Indicadores de fotos */}
                  {hasMultipleImages && (
                    <div className='absolute top-3 left-3 right-3 flex gap-1.5 z-10'>
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-0.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Controles de navegación */}
                  {hasMultipleImages && (
                    <>
                      <button
                        aria-label='Imagen anterior'
                        className='absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'
                        type='button'
                        onClick={handlePrevious}>
                        <ChevronLeft className='w-5 h-5' />
                      </button>

                      <button
                        aria-label='Imagen siguiente'
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70'
                        type='button'
                        onClick={handleNext}>
                        <ChevronRight className='w-5 h-5' />
                      </button>
                    </>
                  )}

                  {/* Contador de fotos */}
                  {hasMultipleImages && (
                    <div className='absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium'>
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Badges superiores */}
                  <div className='absolute top-3 left-3 flex flex-col gap-1.5 z-20'>
                    {compatibilityPercentage && (
                      <Chip
                        className={`${
                          compatibilityPercentage >= 80
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                            : compatibilityPercentage >= 60
                              ? 'bg-gradient-to-r from-primary-500 to-purple-500'
                              : 'bg-gray-600'
                        } text-white font-bold shadow-lg`}
                        size='md'>
                        {compatibilityPercentage}% Compatible
                      </Chip>
                    )}
                    {isVerified && (
                      <Chip
                        className='bg-primary/90 text-white backdrop-blur-md'
                        size='sm'
                        startContent={<CheckCircle2 className='w-3 h-3' />}>
                        Verificado
                      </Chip>
                    )}
                    {hasAcceptedMatch && (
                      <Chip
                        className='bg-gradient-to-r from-green-500 to-emerald-500 text-white backdrop-blur-md'
                        size='sm'
                        startContent={<CheckCircle2 className='w-3 h-3' />}>
                        Match aceptado
                      </Chip>
                    )}
                    {hasPendingMatch && !hasAcceptedMatch && (
                      <Chip
                        className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white backdrop-blur-md'
                        size='sm'
                        startContent={<Mail className='w-3 h-3' />}>
                        Match pendiente
                      </Chip>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className='grid grid-cols-4 sm:grid-cols-6 gap-2'>
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? 'ring-2 ring-primary scale-95'
                        : 'hover:ring-2 hover:ring-gray-500 opacity-70 hover:opacity-100'
                    }`}
                    type='button'
                    onClick={() => {
                      setImageLoading(true)
                      setCurrentImageIndex(index)
                    }}>
                    <img alt={`${name} - Miniatura ${index + 1}`} className='w-full h-full object-cover' src={image} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del usuario - Columna derecha */}
          <div className='space-y-4 lg:sticky lg:top-20 lg:self-start'>
            {/* Nombre y básicos */}
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-5'>
                <div className='space-y-3'>
                  {/* Nombre y edad */}
                  <div>
                    <h1 className='text-2xl font-bold text-gray-100'>
                      {lastName ? `${name} ${lastName[0]}.` : name}
                      {age && <span className='text-gray-400'>, {age}</span>}
                    </h1>
                  </div>

                  {/* Profesión y género */}
                  <div className='flex flex-wrap gap-2'>
                    {profession && (
                      <Chip
                        className='bg-purple-500/20 text-purple-300 border-purple-500/30'
                        size='sm'
                        startContent={<Briefcase className='w-3 h-3' />}
                        variant='bordered'>
                        {profession}
                      </Chip>
                    )}
                    {gender && (
                      <Chip className='bg-blue-500/20 text-blue-300 border-blue-500/30' size='sm' variant='bordered'>
                        {gender}
                      </Chip>
                    )}
                  </div>

                  {/* Ubicación */}
                  {fullLocation && (
                    <div className='flex items-center gap-2 text-gray-300 text-sm'>
                      <MapPin className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{fullLocation}</span>
                    </div>
                  )}

                  {/* Info rápida */}
                  {quickInfo.length > 0 && (
                    <div className='pt-2 border-t border-gray-700/50'>
                      <div className='flex items-start gap-2 text-sm'>
                        <Info className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
                        <span className='text-gray-300'>{quickInfo.join(' • ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Botones de acción */}
            <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
              <CardBody className='p-4'>
                <div className='flex items-center justify-center gap-3'>
                  {/* Botón Pasar */}
                  <Button
                    isIconOnly
                    className='bg-white/10 hover:bg-red-500/20 border-2 border-white/20 hover:border-red-500/60 text-red-400'
                    isDisabled={matchLoading}
                    radius='full'
                    size='lg'
                    variant='flat'
                    onPress={handlePass}>
                    <X className='w-6 h-6' strokeWidth={2.5} />
                  </Button>

                  {/* Botón Match - Centro (más grande) */}
                  <Button
                    isIconOnly
                    className='bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-xl shadow-pink-500/40'
                    isLoading={matchLoading}
                    radius='full'
                    size='lg'
                    style={{ width: '64px', height: '64px' }}
                    variant='solid'
                    onPress={handleLike}>
                    {!matchLoading && <Heart className='w-7 h-7 text-white fill-current' />}
                  </Button>

                  {/* Botón Favorito */}
                  <Button
                    isIconOnly
                    className={`${
                      isFavorite
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/40'
                        : 'bg-white/10 border-2 border-white/20 hover:border-blue-500/60 hover:bg-blue-500/20'
                    } text-blue-300`}
                    isDisabled={favoriteLoading}
                    radius='full'
                    size='lg'
                    variant='flat'
                    onPress={handleToggleFavorite}>
                    <Bookmark className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2.5} />
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Descripción */}
            {description && description !== 'TEMPORAL_DESCRIPTION' && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-primary-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Acerca de {name}</h3>
                    </div>
                    <p className='text-sm text-gray-300 leading-relaxed'>{description}</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Intereses */}
            {tags.length > 0 && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Tag className='w-4 h-4 text-orange-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Intereses</h3>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag, index) => (
                        <Chip key={index} className='bg-primary/15 text-primary-300' size='sm' variant='flat'>
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Características Físicas */}
            {(height || eyeColor || hairColor || bodyType) && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Ruler className='w-4 h-4 text-green-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Características Físicas</h3>
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      {height && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Ruler className='w-3.5 h-3.5' />
                            <span className='text-xs'>Altura</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{height} cm</p>
                        </div>
                      )}
                      {bodyType && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <UserIcon className='w-3.5 h-3.5' />
                            <span className='text-xs'>Complexión</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{bodyType}</p>
                        </div>
                      )}
                      {eyeColor && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Eye className='w-3.5 h-3.5' />
                            <span className='text-xs'>Ojos</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{eyeColor}</p>
                        </div>
                      )}
                      {hairColor && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Palette className='w-3.5 h-3.5' />
                            <span className='text-xs'>Cabello</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{hairColor}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Información Personal */}
            {(education || maritalStatus || categoryInterest) && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <GraduationCap className='w-4 h-4 text-blue-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Información Personal</h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      {education && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <GraduationCap className='w-3.5 h-3.5' />
                            <span className='text-xs'>Educación</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{education}</p>
                        </div>
                      )}
                      {maritalStatus && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Heart className='w-3.5 h-3.5' />
                            <span className='text-xs'>Estado civil</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{maritalStatus}</p>
                        </div>
                      )}
                      {categoryInterest && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Target className='w-3.5 h-3.5' />
                            <span className='text-xs'>Categoría de interés</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{categoryInterest}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Preferencias de Relación */}
            {(relationshipType || sexualRole) && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Heart className='w-4 h-4 text-pink-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Preferencias</h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      {relationshipType && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Heart className='w-3.5 h-3.5' />
                            <span className='text-xs'>Buscando</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{relationshipType}</p>
                        </div>
                      )}
                      {sexualRole && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <UserIcon className='w-3.5 h-3.5' />
                            <span className='text-xs'>Rol sexual</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{sexualRole}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Espiritualidad */}
            {(religion || church || spiritualMoments || spiritualPractices) && (
              <Card className='bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
                <CardBody className='p-5'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <ChurchIcon className='w-4 h-4 text-purple-400' />
                      <h3 className='text-sm font-semibold text-gray-200'>Espiritualidad</h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      {religion && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <ChurchIcon className='w-3.5 h-3.5' />
                            <span className='text-xs'>Religión</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{religion}</p>
                        </div>
                      )}
                      {church && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <ChurchIcon className='w-3.5 h-3.5' />
                            <span className='text-xs'>Iglesia</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{church}</p>
                        </div>
                      )}
                      {spiritualMoments && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Sparkles className='w-3.5 h-3.5' />
                            <span className='text-xs'>Momentos espirituales</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{spiritualMoments}</p>
                        </div>
                      )}
                      {spiritualPractices && (
                        <div className='space-y-1'>
                          <div className='flex items-center gap-1.5 text-gray-400'>
                            <Sparkles className='w-3.5 h-3.5' />
                            <span className='text-xs'>Prácticas espirituales</span>
                          </div>
                          <p className='text-gray-200 font-medium'>{spiritualPractices}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
