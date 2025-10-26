import { useMemo, Suspense, lazy, useEffect, useState } from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import {
  User,
  Bug,
  MessageCircle,
  HelpCircle,
  Send,
  AlertTriangle,
  Star,
  Shield,
  Lock,
  FileText,
  ExternalLink,
  CheckCircle,
  Users,
  Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'
import { useAuth, useLocation, useUser, useUserInterests } from '@hooks'
import {
  getUserCountry,
  getUserCity,
  getUserCategoryInterest,
  getUserMatches,
  getUserPrivacy,
  getUserMetrics,
  getUserDateOfBirth,
  getUserMainImage,
  getUserAccountDeactivated,
  getUserVerified,
  getUserApproved
} from '@schemas'
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import { Logger } from '@utils/logger.js'

import ProfileHeader from './components/ProfileHeader.jsx'
import MatchSection from './components/MatchSection.jsx'

const PersonalInfoSection = lazy(() => import('./components/PersonalInfoSection.jsx'))
const CharacteristicsSection = lazy(() => import('./components/CharacteristicsSection.jsx'))
const PreferencesSection = lazy(() => import('./components/PreferencesSection.jsx'))

const Profile = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading, updateUser } = useAuth()
  const { getProfileStats, getCurrentUser } = useUser()
  const { getInterestByEnum, loading: interestLoading, error: interestError } = useUserInterests()

  const [hasLoadedUser, setHasLoadedUser] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  // Navigation handlers
  const handleReportError = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'bug' } })
  }

  const handleSuggestImprovement = () => {
    navigate(APP_PATHS.GENERAL.CONTACT, { state: { type: 'suggestion' } })
  }

  const handleContactSupport = () => {
    navigate(APP_PATHS.USER.SUPPORT)
  }

  const handleLegalPage = () => {
    navigate(APP_PATHS.LEGAL.PRIVACY)
  }

  // Custom hook for user data helpers
  // Helper functions using centralized accessors
  const userHelpers = useMemo(() => {
    if (!user) return {}

    const matches = getUserMatches(user)
    const privacy = getUserPrivacy(user)
    const metrics = getUserMetrics(user)

    return {
      // Match Information
      getMatchAttempts: () => matches?.availableAttempts || 0,
      getTodayMatches: () => matches?.todayMatches || 0,
      getTotalMatches: () => matches?.totalMatches || 0,
      getMaxDailyAttempts: () => matches?.maxDailyAttempts || 10,
      getPendingSentMatches: () => matches?.pendingSent || 0,
      getPendingReceivedMatches: () => matches?.pendingReceived || 0,
      getAcceptedMattempts: () => matches?.accepted || 0,
      getFavoritesCount: () => matches?.favorites || 0,
      getRemainingAttempts: () => matches?.availableAttempts || 0,

      // Privacy helpers
      getProfilePrivacy: () => (privacy?.publicAccount ? 'Público' : 'Privado'),
      isSearchable: () => privacy?.searchVisibility || false,
      isLocationShared: () => privacy?.locationPublic || false,
      showInSearch: () => privacy?.showMeInSearch || false,
      showAge: () => privacy?.showAge || false,
      showPhone: () => privacy?.showPhone || false,

      // Metrics helpers
      getProfileViews: () => metrics?.profileViews || 0,
      getLikesReceived: () => metrics?.likesReceived || 0,
      getPopularityScore: () => metrics?.popularityScore || 0,
      getProfileCompletenessPercentage: () => metrics?.profileCompleteness || 0,

      // Account helpers
      getAccountType: () => user?.accountType || 'Básica',
      getRegion: () => user?.region || 'América',
      isAccountActive: () => !getUserAccountDeactivated(user),
      isUserVerified: () => getUserVerified(user),
      isUserApproved: () => getUserApproved(user)
    }
  }, [user])

  // Profile data calculations
  const profileData = useMemo(() => {
    if (!user) return null

    const calculateAge = birthDate => {
      if (!birthDate) return null

      let birth

      if (Array.isArray(birthDate) && birthDate.length >= 3) {
        birth = new Date(birthDate[0], birthDate[1] - 1, birthDate[2])
      } else {
        birth = new Date(birthDate)
      }

      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    }

    return {
      mainImage: getUserMainImage(user),
      age: calculateAge(getUserDateOfBirth(user)),
      categoryInterest: getUserCategoryInterest(user)
    }
  }, [user])

  // Hook para obtener datos geográficos y banderas
  const locationConfig = useMemo(
    () => ({
      defaultCountry: getUserCountry(user) || 'Colombia',
      defaultCity: getUserCity(user) || 'Bogotá',
      loadAll: true
    }),
    [user]
  )

  const { formattedCountries } = useLocation(locationConfig)

  // Obtener estadísticas del perfil desde el hook
  const profileStats = useMemo(() => getProfileStats(), [getProfileStats])

  // Obtener categoría de interés con icono
  const categoryInterestDetails = useMemo(() => {
    const categoryEnum = profileData?.categoryInterest

    if (!categoryEnum) return null

    const categoryDetails = getInterestByEnum(categoryEnum)

    return categoryDetails
  }, [profileData?.categoryInterest, getInterestByEnum])

  // Obtener datos del país con bandera
  const getCountryData = useMemo(() => {
    const country = getUserCountry(user)

    if (!country || !formattedCountries) return null

    return formattedCountries.find(c => c.name === country)
  }, [user, formattedCountries])

  // Cargar datos del usuario actual del backend una sola vez
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (hasLoadedUser || isLoadingUser) return
      setIsLoadingUser(true)

      try {
        // Cargar usuario completo (ya incluye métricas de matches desde el backend)
        const userData = await getCurrentUser()

        if (userData?.success) {
          updateUser(userData.data)
        }

        setHasLoadedUser(true)
      } catch (error) {
        Logger.error(Logger.CATEGORIES.USER, 'load_current_user', 'Error cargando datos del usuario', { error })
      } finally {
        setIsLoadingUser(false)
      }
    }

    if (user && !hasLoadedUser && !isLoadingUser) {
      loadCurrentUser()
    }
  }, [user, hasLoadedUser, isLoadingUser, getCurrentUser, updateUser])

  // Verificación de carga
  const isLoading = authLoading || isLoadingUser || interestLoading

  if (isLoading) return <LoadData>Cargando perfil...</LoadData>
  if (!user) return <LoadDataError>No se pudo cargar la información del usuario</LoadDataError>
  if (interestError) return <LoadDataError>Error al cargar intereses de usuario</LoadDataError>

  return (
    <LiteContainer ariaLabel='Página de perfil de usuario' className='gap-4 !pt-0'>
      {/* Profile Header */}
      <ProfileHeader
        categoryInterestDetails={categoryInterestDetails}
        getCountryData={getCountryData}
        profileData={profileData}
        profileStats={profileStats}
        user={user}
        userHelpers={userHelpers}
      />

      {/* Match Section */}
      <MatchSection userHelpers={userHelpers} />

      {/* Profile Metrics Section - Diseño más sutil */}
      <Card className='w-full bg-gray-800/20 backdrop-blur-sm border-gray-700/30'>
        <CardBody className='p-4 sm:p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Star className='w-4 h-4 text-gray-400' />
            <h3 className='text-sm font-medium text-gray-300'>Métricas del Perfil</h3>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {/* Profile Views */}
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <Eye className='w-3 h-3 text-blue-400' />
                <span className='text-xs text-gray-400'>Vistas</span>
              </div>
              <div className='text-base font-semibold text-blue-300'>{userHelpers.getProfileViews()}</div>
            </div>

            {/* Likes Received */}
            <div className='bg-pink-500/10 border border-pink-500/20 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <Star className='w-3 h-3 text-pink-400' />
                <span className='text-xs text-gray-400'>Likes</span>
              </div>
              <div className='text-base font-semibold text-pink-300'>{userHelpers.getLikesReceived()}</div>
            </div>

            {/* Popularity Score */}
            <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <Users className='w-3 h-3 text-yellow-400' />
                <span className='text-xs text-gray-400'>Popularidad</span>
              </div>
              <div className='text-base font-semibold text-yellow-300'>{userHelpers.getPopularityScore()}</div>
            </div>

            {/* Profile Completeness */}
            <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircle className='w-3 h-3 text-green-400' />
                <span className='text-xs text-gray-400'>Completitud</span>
              </div>
              <div className='text-base font-semibold text-green-300'>{userHelpers.getProfileCompletenessPercentage()}%</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Información y Edición del Perfil */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          {/* Header para las secciones */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center'>
              <User className='w-5 h-5 text-primary-400' />
            </div>
            <div className='text-center sm:text-left'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Información y Edición del Perfil</h3>
              <p className='text-sm text-gray-400'>Gestiona y actualiza tu información personal</p>
            </div>
          </div>

          {/* Sección Personal */}
          <div className='space-y-6'>
            <Suspense fallback={<LoadData>Cargando información personal...</LoadData>}>
              <PersonalInfoSection user={user} />
            </Suspense>

            {/* Separador */}
            <div className='border-t border-gray-700/50 pt-6'>
              <Suspense fallback={<LoadData>Cargando características...</LoadData>}>
                <CharacteristicsSection user={user} />
              </Suspense>
            </div>

            {/* Separador */}
            <div className='border-t border-gray-700/50 pt-6'>
              <Suspense fallback={<LoadData>Cargando preferencias...</LoadData>}>
                <PreferencesSection user={user} />
              </Suspense>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sección de soporte */}
      <Card className='w-full bg-gray-800/30 border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          <div className='text-center sm:text-left space-y-4'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6'>
              <div className='w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center'>
                <HelpCircle className='w-5 h-5 text-orange-400' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-base sm:text-lg font-semibold text-gray-200'>¿Necesitas ayuda?</h3>
                <p className='text-sm text-gray-400'>Estamos aquí para ayudarte a mejorar tu experiencia</p>
              </div>
            </div>

            {/* Opciones de soporte */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 max-w-2xl mx-auto'>
              {/* Reportar Error */}
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-center'>
                  <div className='w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center'>
                    <Bug className='w-4 h-4 text-red-400' />
                  </div>
                </div>
                <div className='text-center'>
                  <h4 className='font-medium text-red-300 mb-1'>Reportar Error</h4>
                  <p className='text-xs text-gray-400 mb-3'>¿Encontraste un problema? Ayúdanos a solucionarlo</p>
                  <Button
                    aria-label='Reportar un error o problema técnico'
                    className='border-red-500/50 text-red-400 hover:bg-red-500/10'
                    color='danger'
                    size='sm'
                    startContent={<AlertTriangle className='w-3 h-3' />}
                    variant='bordered'
                    onPress={handleReportError}>
                    Reportar
                  </Button>
                </div>
              </div>

              {/* Sugerir Mejora */}
              <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-center'>
                  <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
                    <Star className='w-4 h-4 text-blue-400' />
                  </div>
                </div>
                <div className='text-center'>
                  <h4 className='font-medium text-blue-300 mb-1'>Sugerir Mejora</h4>
                  <p className='text-xs text-gray-400 mb-3'>¿Tienes una idea genial? Compártela con nosotros</p>
                  <Button
                    aria-label='Sugerir una mejora o nueva funcionalidad'
                    className='border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                    color='primary'
                    size='sm'
                    startContent={<Send className='w-3 h-3' />}
                    variant='bordered'
                    onPress={handleSuggestImprovement}>
                    Sugerir
                  </Button>
                </div>
              </div>

              {/* Contactar Soporte */}
              <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3'>
                <div className='flex items-center justify-center'>
                  <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
                    <MessageCircle className='w-4 h-4 text-green-400' />
                  </div>
                </div>
                <div className='text-center'>
                  <h4 className='font-medium text-green-300 mb-1'>Contactar Soporte</h4>
                  <p className='text-xs text-gray-400 mb-3'>¿Necesitas ayuda personal? Escríbenos directamente</p>
                  <Button
                    aria-label='Contactar con el equipo de soporte'
                    className='border-green-500/50 text-green-400 hover:bg-green-500/10'
                    color='success'
                    size='sm'
                    startContent={<MessageCircle className='w-3 h-3' />}
                    variant='bordered'
                    onPress={handleContactSupport}>
                    Contactar
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer de soporte */}
            <div className='pt-4 border-t border-gray-700/50'>
              <p className='text-xs text-gray-500 mb-2'>Tu feedback es muy importante para nosotros</p>
              <div className='flex items-center justify-center gap-4 text-xs text-gray-400'>
                <span>• Respuesta en 24-48 horas</span>
                <span>• Soporte en español</span>
                <span>• Atención personalizada</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sección de privacidad y políticas de datos */}
      <Card className='w-full bg-gray-800/20 border-gray-700/40'>
        <CardBody className='p-4 sm:p-6'>
          <div className='text-center sm:text-left space-y-4'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6'>
              <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
                <Lock className='w-5 h-5 text-blue-400' />
              </div>
              <div className='text-center sm:text-left'>
                <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Políticas y Datos</h3>
                <p className='text-sm text-gray-400'>Información legal y gestión de datos</p>
              </div>
            </div>

            {/* Enlaces a políticas */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 max-w-lg mx-auto'>
              <Button
                aria-label='Ver política de privacidad completa'
                className='border-blue-500/30 text-blue-300 hover:bg-blue-500/10'
                endContent={<ExternalLink className='w-3 h-3' />}
                size='sm'
                startContent={<FileText className='w-4 h-4' />}
                variant='bordered'
                onPress={handleLegalPage}>
                Política de Privacidad
              </Button>
              <Button
                aria-label='Ver tratamiento de datos personales'
                className='border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                endContent={<ExternalLink className='w-3 h-3' />}
                size='sm'
                startContent={<Shield className='w-4 h-4' />}
                variant='bordered'
                onPress={handleLegalPage}>
                Tratamiento de Datos
              </Button>
            </div>

            {/* Resumen de privacidad */}
            <div className='bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 sm:p-4 mb-4'>
              <p className='text-center text-xs text-gray-400 mb-3'>
                En Feeling, protegemos tu privacidad y te damos control total sobre tus datos personales. Conoce más sobre cómo tratamos tu
                información.
              </p>
              <div className='text-xs text-blue-300 space-y-2 sm:space-y-0'>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4'>
                  <span className='inline-flex items-center gap-1'>
                    <Shield className='w-3 h-3' />
                    Datos encriptados
                  </span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='inline-flex items-center gap-1'>
                    <Eye className='w-3 h-3' />
                    Control de visibilidad
                  </span>
                  <span className='hidden sm:inline'>•</span>
                  <span className='inline-flex items-center gap-1'>
                    <Lock className='w-3 h-3' />
                    Nunca vendemos tus datos
                  </span>
                </div>
              </div>
            </div>

            {/* Footer legal */}
            <div className='text-center pt-3'>
              <p className='text-xs text-gray-500'>
                Última actualización: Enero 2025 •
                <span className='text-blue-400 cursor-pointer hover:underline ml-1'>Historial de cambios</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Profile
