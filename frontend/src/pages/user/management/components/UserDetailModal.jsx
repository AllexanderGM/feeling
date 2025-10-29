import { memo, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Avatar, Progress } from '@heroui/react'
import {
  Activity,
  AlertTriangle,
  Badge,
  Bell,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Crown,
  Database,
  Eye,
  Globe,
  GraduationCap,
  Heart,
  Info,
  Mail,
  MapPin,
  Palette,
  Phone,
  Ruler,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  User,
  UserIcon,
  Users,
  Users2,
  Zap
} from 'lucide-react'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate, calculateAgeFromJavaDate } from '@utils/dateUtils.js'

// Helper function to calculate age
const calculateAge = birthDate => {
  if (!birthDate) return 'N/A'
  try {
    return calculateAgeFromJavaDate(birthDate)
  } catch {
    return 'N/A'
  }
}

const formatLastActive = lastActiveArray => {
  if (!lastActiveArray || !Array.isArray(lastActiveArray)) return 'Nunca'
  try {
    return formatJavaDateForDisplay(lastActiveArray)
  } catch {
    return 'Nunca'
  }
}

const UserDetailModal = memo(({ isOpen, onClose, selectedUser }) => {
  // Computed data from selectedUser
  const userData = useMemo(() => {
    if (!selectedUser) return null

    const { user, status, privacy, metrics, matches, auth, notifications, images: galleryImagesSource } = selectedUser

    const userImages = Array.isArray(user?.images) ? user.images : []
    const galleryImages = Array.isArray(galleryImagesSource) ? galleryImagesSource : []
    const sanitizedImages = [...userImages, ...galleryImages].filter(image => typeof image === 'string' && image.trim() !== '')
    const uniqueImages = Array.from(new Set(sanitizedImages))

    return {
      // Basic Info
      name: `${user?.name || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email,
      phone: user?.phone ? `${user.phoneCode || ''} ${user.phone}`.trim() : 'No especificado',
      age: calculateAge(user?.dateOfBirth),
      location: `${user?.city || ''}, ${user?.country || ''}`.trim(),
      mainImage: user?.mainImage || user?.image || uniqueImages[0],
      images: uniqueImages,
      description: user?.description,

      // Status
      verified: status?.verified,
      approved: status?.approved,
      role: status?.role,
      profileComplete: status?.profileComplete,
      configurationCompleted: status?.configurationCompleted,
      lastActive: formatLastActive(status?.lastActive),
      createdAt: formatJavaDateForDisplay(status?.createdAt),
      daysSinceCreated: daysSinceJavaDate(status?.createdAt),
      accountDeactivated: status?.accountDeactivated,

      // Privacy
      publicAccount: privacy?.publicAccount,
      searchVisibility: privacy?.searchVisibility,
      locationPublic: privacy?.locationPublic,
      showAge: privacy?.showAge,
      showLocation: privacy?.showLocation,
      showPhone: privacy?.showPhone,
      showMeInSearch: privacy?.showMeInSearch,

      // Metrics
      profileViews: metrics?.profileViews || 0,
      likesReceived: metrics?.likesReceived || 0,
      matchesCount: metrics?.matchesCount || 0,
      popularityScore: metrics?.popularityScore || 0,
      profileCompleteness: metrics?.profileCompleteness || 0,

      // Matches
      availableAttempts: matches?.availableAttempts || 0,
      reservedAttempts: matches?.reservedAttempts || 0,
      totalRemainingAttempts: matches?.totalRemainingAttempts || 0,
      todayMatches: matches?.todayMatches || 0,
      sentMatches: matches?.sentMatches || 0,
      receivedMatches: matches?.receivedMatches || 0,
      pendingSent: matches?.pendingSent || 0,
      pendingReceived: matches?.pendingReceived || 0,
      accepted: matches?.accepted || 0,
      favorites: matches?.favorites || 0,

      // Auth
      authProvider: auth?.userAuthProvider,
      externalId: auth?.externalId,

      // Notifications
      emailEnabled: notifications?.notificationsEmailEnabled,
      phoneEnabled: notifications?.notificationsPhoneEnabled,
      matchesEnabled: notifications?.notificationsMatchesEnabled,
      eventsEnabled: notifications?.notificationsEventsEnabled,

      // Personal Info
      profession: user?.profession,
      document: user?.document,
      categoryInterest: user?.categoryInterest,
      gender: user?.gender,
      tags: user?.tags,
      maritalStatus: user?.maritalStatus,
      height: user?.height,
      eyeColor: user?.eyeColor,
      hairColor: user?.hairColor,
      bodyType: user?.bodyType,
      education: user?.education,
      religion: user?.religion,
      sexualRole: user?.sexualRole,
      relationshipType: user?.relationshipType,

      // Preferences
      agePreferenceMin: user?.agePreferenceMin,
      agePreferenceMax: user?.agePreferenceMax,
      locationPreferenceRadius: user?.locationPreferenceRadius
    }
  }, [selectedUser])

  if (!userData) return null

  const totalMatchAttempts = userData.totalRemainingAttempts || 0
  const availableMatchAttempts = userData.availableAttempts || 0
  const reservedMatchAttempts = userData.reservedAttempts || 0
  const committedMatchAttempts = Math.max(totalMatchAttempts - availableMatchAttempts, 0)
  const committedMatchPercentage = totalMatchAttempts > 0 ? (committedMatchAttempts / totalMatchAttempts) * 100 : 0
  const profileCompletion = typeof userData.profileCompleteness === 'number' ? userData.profileCompleteness : 0
  const popularityScore = typeof userData.popularityScore === 'number' ? userData.popularityScore : 0
  const agePreferenceRange =
    typeof userData.agePreferenceMin === 'number' && typeof userData.agePreferenceMax === 'number'
      ? `${userData.agePreferenceMin} - ${userData.agePreferenceMax} años`
      : 'No especificado'
  const locationPreference =
    typeof userData.locationPreferenceRadius === 'number' ? `${userData.locationPreferenceRadius} km` : 'No especificado'
  const galleryImages = Array.isArray(userData.images)
    ? userData.images.filter(image => typeof image === 'string' && image.trim() !== '')
    : []

  return (
    <Modal
      classNames={{
        backdrop: 'bg-gray-900/50 backdrop-blur-sm',
        base: 'bg-gray-900 border border-gray-700 max-h-[90vh]',
        header: 'border-b border-gray-700 flex-shrink-0',
        body: 'py-4 px-6 overflow-y-auto',
        footer: 'border-t border-gray-700 flex-shrink-0'
      }}
      isOpen={isOpen}
      scrollBehavior='inside'
      size='5xl'
      onClose={onClose}>
      <ModalContent className='max-h-[90vh]'>
        <ModalHeader className='flex flex-col gap-1 pb-3'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
              <Eye className='w-5 h-5 text-green-400' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-200'>Perfil de {userData.name}</h3>
              <p className='text-sm text-gray-400'>Resumen de perfil y actividad en la plataforma</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className='space-y-6 px-6 py-0 mb-4'>
          <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 space-y-6'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
              <div className='relative shrink-0'>
                <Avatar
                  className='w-24 h-24 sm:w-28 sm:h-28 border-2 border-gray-600'
                  icon={<UserIcon className='w-10 h-10 sm:w-12 sm:h-12' />}
                  src={userData.mainImage}
                />
                {userData.categoryInterest && (
                  <div className='absolute -bottom-1 -right-1 rounded-full'>
                    <Chip
                      className='bg-primary-900/90 text-primary-300 border border-primary-500/30'
                      color={USER_INTEREST_COLORS[userData.categoryInterest] || 'primary'}
                      size='sm'
                      variant='flat'>
                      {userData.categoryInterest}
                    </Chip>
                  </div>
                )}
              </div>
              <div className='flex-1 text-center sm:text-left space-y-3'>
                <div className='space-y-2'>
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-100'>{userData.name || 'Sin nombre'}</h2>
                  <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-300'>
                    {userData.age !== 'N/A' && (
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        <span>{userData.age} años</span>
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span className='truncate'>{userData.location || 'Ubicación no disponible'}</span>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm text-gray-300'>
                  {userData.email && (
                    <div className='flex items-center gap-2'>
                      <Mail className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-200 break-all'>{userData.email}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-200'>{userData.phone}</span>
                    </div>
                  )}
                </div>
                <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400'>
                  {userData.createdAt && (
                    <div className='flex items-center gap-2'>
                      <Clock className='w-3 h-3 sm:w-4 sm:h-4' />
                      <span>Miembro desde {userData.createdAt}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Activity className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span>Última actividad: {userData.lastActive}</span>
                  </div>
                  {typeof userData.daysSinceCreated === 'number' && (
                    <div className='flex items-center gap-2'>
                      <Info className='w-3 h-3 sm:w-4 sm:h-4' />
                      <span>{userData.daysSinceCreated} días en la plataforma</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='border-t border-gray-700/50 pt-4 sm:pt-6 space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-300'>Completitud del perfil</span>
                  <span className='text-sm font-bold text-gray-200'>{profileCompletion}%</span>
                </div>
                <Progress
                  aria-label={`Completitud del perfil: ${profileCompletion}%`}
                  className='h-2'
                  classNames={{
                    indicator: 'bg-gradient-to-r from-primary-400 to-primary-600',
                    track: 'bg-gray-700'
                  }}
                  value={profileCompletion}
                />
              </div>

              <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 sm:p-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <Shield className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-medium text-gray-200'>Privacidad y Configuración</span>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
                  <div className='flex items-center gap-2'>
                    <Globe className='w-3 h-3' />
                    <span>Perfil: {userData.publicAccount ? 'Público' : 'Privado'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Users className='w-3 h-3' />
                    <span>Búsqueda: {userData.searchVisibility ? 'Visible' : 'Oculta'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Database className='w-3 h-3' />
                    <span>Ubicación: {userData.locationPublic ? 'Compartida' : 'Privada'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-3 h-3' />
                    <span>Teléfono: {userData.showPhone ? 'Visible' : 'Oculto'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-3 h-3' />
                    <span>Edad: {userData.showAge ? 'Visible' : 'Oculta'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Search className='w-3 h-3' />
                    <span>Mostrarme en búsquedas: {userData.showMeInSearch ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className={`w-4 h-4 ${userData.verified ? 'text-green-400' : 'text-yellow-400'}`} />
                    <span className='text-sm font-medium text-gray-200'>Verificación</span>
                  </div>
                  <Chip
                    className={
                      userData.verified
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }
                    color={userData.verified ? 'success' : 'warning'}
                    size='sm'
                    variant='flat'>
                    {userData.verified ? 'Verificado' : 'No verificado'}
                  </Chip>
                  {!userData.verified && <p className='text-xs text-gray-400'>Pendiente de verificación manual.</p>}
                </div>
                <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Shield className={`w-4 h-4 ${userData.approved ? 'text-blue-400' : 'text-orange-400'}`} />
                    <span className='text-sm font-medium text-gray-200'>Aprobación</span>
                  </div>
                  <Chip
                    className={
                      userData.approved
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    }
                    color={userData.approved ? 'success' : 'warning'}
                    size='sm'
                    variant='flat'>
                    {userData.approved ? 'Aprobado' : 'Pendiente'}
                  </Chip>
                  {!userData.approved && <p className='text-xs text-gray-400'>Requiere revisión de cumplimiento.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-purple-900/20 border border-primary-500/30 rounded-xl p-4 sm:p-6 space-y-4'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center'>
                    <Zap className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                  </div>
                  <div className='absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                    <Sparkles className='w-2 h-2 sm:w-3 sm:h-3 text-white' />
                  </div>
                </div>
                <div className='text-center sm:text-left'>
                  <div className='flex items-center gap-2 justify-center sm:justify-start mb-1'>
                    <h4 className='text-base sm:text-lg font-semibold text-gray-100'>Intentos de Match</h4>
                    <Crown className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-400' />
                  </div>
                  <p className='text-xs text-gray-400'>Saldo actual y actividad reciente del usuario.</p>
                </div>
              </div>
              <div className='flex flex-wrap items-center justify-center sm:justify-end gap-4 text-center'>
                <div>
                  <div className='text-lg sm:text-2xl font-bold text-primary-300'>{availableMatchAttempts}</div>
                  <div className='text-[11px] sm:text-xs text-gray-400'>Disponibles</div>
                </div>
                <div className='hidden sm:block w-px h-10 bg-gray-600' />
                <div>
                  <div className='text-lg sm:text-2xl font-bold text-orange-300'>{reservedMatchAttempts}</div>
                  <div className='text-[11px] sm:text-xs text-gray-400'>Reservados</div>
                </div>
                <div className='hidden sm:block w-px h-10 bg-gray-600' />
                <div>
                  <div className='text-lg sm:text-2xl font-bold text-purple-300'>{totalMatchAttempts}</div>
                  <div className='text-[11px] sm:text-xs text-gray-400'>Saldo total</div>
                </div>
                <div className='hidden sm:block w-px h-10 bg-gray-600' />
                <div>
                  <div className='text-lg sm:text-2xl font-bold text-green-300'>{userData.accepted}</div>
                  <div className='text-[11px] sm:text-xs text-gray-400'>Aceptados</div>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center text-xs text-gray-400'>
                <span>Intentos comprometidos</span>
                <span className='text-gray-300'>
                  {committedMatchAttempts} / {totalMatchAttempts}
                </span>
              </div>
              <Progress
                aria-label={`Intentos comprometidos: ${committedMatchAttempts} de ${totalMatchAttempts}`}
                className='h-2'
                classNames={{
                  indicator: 'bg-gradient-to-r from-orange-400 via-primary-400 to-pink-400',
                  track: 'bg-gray-700/50'
                }}
                value={committedMatchPercentage}
              />
            </div>

            <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-3'>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 rounded-full'>
                <span className='text-[11px] text-blue-300 font-medium'>Enviados</span>
                <span className='text-sm font-semibold text-blue-300'>{userData.sentMatches}</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-700/30 rounded-full'>
                <span className='text-[11px] text-purple-300 font-medium'>Recibidos</span>
                <span className='text-sm font-semibold text-purple-300'>{userData.receivedMatches}</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-orange-900/20 border border-orange-700/30 rounded-full'>
                <span className='text-[11px] text-orange-300 font-medium'>Pendientes</span>
                <span className='text-sm font-semibold text-orange-300'>
                  {(userData.pendingSent || 0) + (userData.pendingReceived || 0)}
                </span>
              </div>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-700/30 rounded-full'>
                <span className='text-[11px] text-red-300 font-medium'>Favoritos</span>
                <span className='text-sm font-semibold text-red-300'>{userData.favorites}</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-700/30 rounded-full'>
                <span className='text-[11px] text-green-300 font-medium'>Matches hoy</span>
                <span className='text-sm font-semibold text-green-300'>{userData.todayMatches}</span>
              </div>
            </div>
          </div>

          <div className='bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 sm:p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <Star className='w-4 h-4 text-gray-400' />
              <h4 className='text-sm font-medium text-gray-300'>Métricas del Perfil</h4>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <Eye className='w-3 h-3 text-blue-400' />
                  <span className='text-xs text-gray-400'>Vistas</span>
                </div>
                <div className='text-base font-semibold text-blue-300'>{userData.profileViews}</div>
              </div>
              <div className='bg-pink-500/10 border border-pink-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <Heart className='w-3 h-3 text-pink-400' />
                  <span className='text-xs text-gray-400'>Likes</span>
                </div>
                <div className='text-base font-semibold text-pink-300'>{userData.likesReceived}</div>
              </div>
              <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <Users className='w-3 h-3 text-yellow-400' />
                  <span className='text-xs text-gray-400'>Popularidad</span>
                </div>
                <div className='text-base font-semibold text-yellow-300'>{popularityScore.toFixed(1)}</div>
              </div>
              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <CheckCircle className='w-3 h-3 text-green-400' />
                  <span className='text-xs text-gray-400'>Completitud</span>
                </div>
                <div className='text-base font-semibold text-green-300'>{profileCompletion}%</div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4 text-blue-400' />
                <span className='text-sm font-semibold text-gray-200'>Información Básica</span>
              </div>
              <div className='space-y-2 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <User className='w-3 h-3 text-gray-400' />
                  <span>
                    Profesión: <span className='text-gray-200'>{userData.profession || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Info className='w-3 h-3 text-gray-400' />
                  <span>
                    Documento: <span className='text-gray-200'>{userData.document || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='w-3 h-3 text-gray-400' />
                  <span>
                    Teléfono: <span className='text-gray-200'>{userData.phone || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-3 h-3 text-gray-400' />
                  <span>
                    Género: <span className='text-gray-200'>{userData.gender || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Heart className='w-3 h-3 text-pink-400' />
                  <span>
                    Estado civil: <span className='text-gray-200'>{userData.maritalStatus || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Star className='w-3 h-3 text-primary-400' />
                  <span className='text-gray-400'>Categoría:</span>
                  <Chip color={USER_INTEREST_COLORS[userData.categoryInterest] || 'default'} size='sm' variant='flat'>
                    {userData.categoryInterest || 'N/A'}
                  </Chip>
                </div>
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <Sparkles className='w-4 h-4 text-purple-400' />
                <span className='text-sm font-semibold text-gray-200'>Características Físicas</span>
              </div>
              <div className='space-y-2 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Ruler className='w-3 h-3 text-gray-400' />
                  <span>
                    Altura: <span className='text-gray-200'>{userData.height ? `${userData.height} cm` : 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Eye className='w-3 h-3 text-blue-400' />
                  <span>
                    Color de ojos: <span className='text-gray-200'>{userData.eyeColor || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Palette className='w-3 h-3 text-pink-300' />
                  <span>
                    Color de cabello: <span className='text-gray-200'>{userData.hairColor || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Users2 className='w-3 h-3 text-purple-300' />
                  <span>
                    Tipo de cuerpo: <span className='text-gray-200'>{userData.bodyType || 'No especificado'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <Shield className='w-4 h-4 text-green-400' />
                <span className='text-sm font-semibold text-gray-200'>Educación y Espiritualidad</span>
              </div>
              <div className='space-y-2 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <GraduationCap className='w-3 h-3 text-gray-400' />
                  <span>
                    Educación: <span className='text-gray-200'>{userData.education || 'No especificado'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Sparkles className='w-3 h-3 text-amber-300' />
                  <span>
                    Religión: <span className='text-gray-200'>{userData.religion || 'No especificado'}</span>
                  </span>
                </div>
                {userData.sexualRole && (
                  <div className='flex items-center gap-2'>
                    <Badge className='w-3 h-3 text-purple-300' />
                    <span>
                      Rol sexual: <span className='text-gray-200'>{userData.sexualRole}</span>
                    </span>
                  </div>
                )}
                {userData.relationshipType && (
                  <div className='flex items-center gap-2'>
                    <Heart className='w-3 h-3 text-red-400' />
                    <span>
                      Tipo de relación: <span className='text-gray-200'>{userData.relationshipType}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <Target className='w-4 h-4 text-pink-400' />
                <span className='text-sm font-semibold text-gray-200'>Preferencias de Match</span>
              </div>
              <div className='space-y-2 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-3 h-3 text-gray-400' />
                  <span>
                    Rango de edad: <span className='text-gray-200'>{agePreferenceRange}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-3 h-3 text-gray-400' />
                  <span>
                    Radio de ubicación: <span className='text-gray-200'>{locationPreference}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className='bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Camera className='w-4 h-4 text-blue-400' />
                  <span className='text-sm font-semibold text-gray-200'>Galería de fotos</span>
                </div>
                <span className='text-xs text-gray-400'>
                  {Math.min(galleryImages.length, 10)} de {galleryImages.length}
                </span>
              </div>
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
                {galleryImages.slice(0, 10).map((image, index) => (
                  <div
                    key={index}
                    className='relative rounded-lg overflow-hidden border border-gray-700/40 bg-gray-900/40 w-full pt-[140%]'>
                    <img
                      alt={`Imagen del usuario ${index + 1}`}
                      className='absolute inset-0 h-full w-full object-cover'
                      loading='lazy'
                      src={image}
                      onError={event => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
              {galleryImages.length > 10 && <p className='text-xs text-gray-400'>+{galleryImages.length - 10} imágenes adicionales</p>}
            </div>
          )}

          {userData.tags && userData.tags.length > 0 && (
            <div className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 sm:p-5'>
              <div className='flex items-center gap-2 mb-3'>
                <Star className='w-4 h-4 text-yellow-400' />
                <span className='text-sm font-semibold text-gray-200'>Intereses y etiquetas</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {userData.tags.map((tag, index) => (
                  <Chip key={index} color='primary' size='sm' variant='flat'>
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <Shield className='w-4 h-4 text-blue-400' />
                <span className='text-sm font-semibold text-gray-200'>Autenticación</span>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='w-3 h-3 text-blue-300' />
                  <span className='text-gray-400'>Proveedor:</span>
                  <Chip color={userData.authProvider === 'GOOGLE' ? 'success' : 'default'} size='sm' variant='flat'>
                    {userData.authProvider || 'N/A'}
                  </Chip>
                </div>
                <div className='flex items-center gap-2'>
                  <Shield className='w-3 h-3 text-blue-300' />
                  <span className='text-gray-400'>Rol:</span>
                  <Chip color={USER_ROLE_COLORS[userData.role] || 'default'} size='sm' variant='flat'>
                    {userData.role || 'N/A'}
                  </Chip>
                </div>
              </div>
            </div>

            <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 sm:p-5 space-y-3'>
              <div className='flex items-center gap-2'>
                <Bell className='w-4 h-4 text-yellow-400' />
                <span className='text-sm font-semibold text-gray-200'>Preferencias de notificaciones</span>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='flex items-center justify-between bg-gray-900/40 border border-gray-700/30 px-3 py-2 rounded-lg'>
                  <span className='text-xs text-gray-300'>Email</span>
                  <Chip color={userData.emailEnabled ? 'success' : 'default'} size='sm' variant='dot'>
                    {userData.emailEnabled ? 'On' : 'Off'}
                  </Chip>
                </div>
                <div className='flex items-center justify-between bg-gray-900/40 border border-gray-700/30 px-3 py-2 rounded-lg'>
                  <span className='text-xs text-gray-300'>Teléfono</span>
                  <Chip color={userData.phoneEnabled ? 'success' : 'default'} size='sm' variant='dot'>
                    {userData.phoneEnabled ? 'On' : 'Off'}
                  </Chip>
                </div>
                <div className='flex items-center justify-between bg-gray-900/40 border border-gray-700/30 px-3 py-2 rounded-lg'>
                  <span className='text-xs text-gray-300'>Matches</span>
                  <Chip color={userData.matchesEnabled ? 'success' : 'default'} size='sm' variant='dot'>
                    {userData.matchesEnabled ? 'On' : 'Off'}
                  </Chip>
                </div>
                <div className='flex items-center justify-between bg-gray-900/40 border border-gray-700/30 px-3 py-2 rounded-lg'>
                  <span className='text-xs text-gray-300'>Eventos</span>
                  <Chip color={userData.eventsEnabled ? 'success' : 'default'} size='sm' variant='dot'>
                    {userData.eventsEnabled ? 'On' : 'Off'}
                  </Chip>
                </div>
              </div>
            </div>
          </div>

          {userData.description && (
            <div className='bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 sm:p-5'>
              <div className='flex items-center gap-2 mb-3'>
                <User className='w-4 h-4 text-indigo-400' />
                <span className='text-sm font-semibold text-gray-200'>Sobre el usuario</span>
              </div>
              <div className='bg-gray-900/40 border border-gray-700/30 rounded-lg p-3'>
                <p className='text-sm text-gray-200 whitespace-pre-wrap'>{userData.description}</p>
              </div>
            </div>
          )}

          {userData.accountDeactivated && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-red-400' />
              <span className='text-sm font-semibold text-red-300'>Esta cuenta está desactivada</span>
            </div>
          )}
        </ModalBody>

        <ModalFooter className='pt-4'>
          <Button color='danger' variant='light' onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})

UserDetailModal.displayName = 'UserDetailModal'

export default UserDetailModal
