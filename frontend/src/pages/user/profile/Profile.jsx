import { useMemo, Suspense, lazy } from 'react'
import { Card, CardBody, Button, Chip } from '@heroui/react'

// Icons for remaining sections
import {
  User, Bug, MessageCircle, HelpCircle, Send, AlertTriangle, Star,
  Shield, Lock, FileText, ExternalLink, CheckCircle, Globe, Search,
  MapPin, Users, Eye
} from 'lucide-react'

// Hooks
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
import useLocation from '@hooks/useLocation.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests.js'
import { useProfileData } from './hooks/useProfileData.js'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'
import ProfileHeader from './components/ProfileHeader.jsx'
import MatchSection from './components/MatchSection.jsx'

// Lazy-loaded components for better performance
const PersonalInfoSection = lazy(() => import('./components/PersonalInfoSection.jsx'))
const CharacteristicsSection = lazy(() => import('./components/CharacteristicsSection.jsx'))
const PreferencesSection = lazy(() => import('./components/PreferencesSection.jsx'))

const Profile = () => {
  // Hooks principales
  const { user, loading: authLoading } = useAuth()
  const { getProfileStats } = useUser()
  const { getCategoryByEnum, loading: categoryLoading, error: categoryError } = useCategoryInterests()
  
  // Custom hook for user data helpers
  const {
    getUserName, getUserLastName, getUserEmail, getUserImages, getUserCountry, getUserCity, getUserId,
    isUserVerified, isUserApproved, isProfileComplete, getUserCreatedAt, getUserLastActive,
    getMatchAttempts, getTodayMatches, getTotalMatches, getMaxDailyAttempts,
    getProfilePrivacy, isSearchable, isLocationShared, showInSearch,
    getAccountType, getRegion, isAccountActive, profileData
  } = useProfileData(user)

  // Verificación de carga
  if (authLoading) return <LoadData />
  if (!user) return <LoadDataError message="No se pudo cargar la información del usuario" />

  // Hook para obtener datos geográficos y banderas
  const locationConfig = useMemo(
    () => ({
      defaultCountry: getUserCountry() || 'Colombia',
      defaultCity: getUserCity() || 'Bogotá',
      loadAll: true
    }),
    [getUserCountry(), getUserCity()]
  )

  const { formattedCountries } = useLocation(locationConfig)

  // Obtener estadísticas del perfil desde el hook
  const profileStats = useMemo(() => getProfileStats(), [getProfileStats])

  // Obtener categoría de interés con icono
  const categoryInterestDetails = useMemo(() => {
    // Verificar múltiples formas de obtener la categoría
    const categoryEnum = user?.profile?.categoryInterest || user?.categoryInterest
    if (!categoryEnum) return null

    const categoryDetails = getCategoryByEnum(categoryEnum)
    return categoryDetails
  }, [user?.profile?.categoryInterest, user?.categoryInterest, getCategoryByEnum])

  // Obtener datos del país con bandera
  const getCountryData = useMemo(() => {
    const country = getUserCountry()
    if (!country || !formattedCountries) return null
    return formattedCountries.find(c => c.name === country)
  }, [getUserCountry(), formattedCountries])

  // Estados de carga y error
  const isLoading = authLoading || categoryLoading

  if (isLoading) return <LoadData>Cargando perfil...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (categoryError) return <LoadDataError>Error al cargar categorías de interés</LoadDataError>

  return (
    <LiteContainer className="gap-4" ariaLabel="Página de perfil de usuario">
      {/* Profile Header */}
      <ProfileHeader
        profileData={profileData}
        getUserName={getUserName}
        getUserLastName={getUserLastName}
        getUserEmail={getUserEmail}
        getUserCreatedAt={getUserCreatedAt}
        getUserLastActive={getUserLastActive}
        getUserId={getUserId}
        getAccountType={getAccountType}
        getRegion={getRegion}
        profileStats={profileStats}
        categoryInterestDetails={categoryInterestDetails}
        getCountryData={getCountryData}
        getUserCity={getUserCity}
        getUserCountry={getUserCountry}
        getProfilePrivacy={getProfilePrivacy}
        isSearchable={isSearchable}
        isLocationShared={isLocationShared}
        isUserVerified={isUserVerified}
        isProfileComplete={isProfileComplete}
        isAccountActive={isAccountActive}
      />

      {/* Match Section */}
      <MatchSection
        getMatchAttempts={getMatchAttempts}
        getTodayMatches={getTodayMatches}
        getTotalMatches={getTotalMatches}
        getMaxDailyAttempts={getMaxDailyAttempts}
      />

      {/* Información y Edición del Perfil */}
      <Card className="w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          {/* Header para las secciones */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30">
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-400" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-gray-200">Información y Edición del Perfil</h3>
              <p className="text-sm text-gray-400">Gestiona y actualiza tu información personal</p>
            </div>
          </div>

          {/* Sección Personal */}
          <div className="space-y-6">
            <Suspense fallback={<LoadData>Cargando información personal...</LoadData>}>
              <PersonalInfoSection user={user} />
            </Suspense>

            {/* Separador */}
            <div className="border-t border-gray-700/50 pt-6">
              <Suspense fallback={<LoadData>Cargando características...</LoadData>}>
                <CharacteristicsSection user={user} />
              </Suspense>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-700/50 pt-6">
              <Suspense fallback={<LoadData>Cargando preferencias...</LoadData>}>
                <PreferencesSection user={user} />
              </Suspense>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sección de soporte */}
      <Card className="w-full bg-gray-800/30 border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="text-center sm:text-left space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200">¿Necesitas ayuda?</h3>
                <p className="text-sm text-gray-400">Estamos aquí para ayudarte a mejorar tu experiencia</p>
              </div>
            </div>

            {/* Opciones de soporte */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 max-w-2xl mx-auto">
              {/* Reportar Error */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Bug className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-red-300 mb-1">Reportar Error</h4>
                  <p className="text-xs text-gray-400 mb-3">¿Encontraste un problema? Ayúdanos a solucionarlo</p>
                  <Button
                    size="sm"
                    color="danger"
                    variant="bordered"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    startContent={<AlertTriangle className="w-3 h-3" />}
                    aria-label="Reportar un error o problema técnico">
                    Reportar
                  </Button>
                </div>
              </div>

              {/* Sugerir Mejora */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-blue-300 mb-1">Sugerir Mejora</h4>
                  <p className="text-xs text-gray-400 mb-3">¿Tienes una idea genial? Compártela con nosotros</p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="bordered"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    startContent={<Send className="w-3 h-3" />}
                    aria-label="Sugerir una mejora o nueva funcionalidad">
                    Sugerir
                  </Button>
                </div>
              </div>

              {/* Contactar Soporte */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-green-300 mb-1">Contactar Soporte</h4>
                  <p className="text-xs text-gray-400 mb-3">¿Necesitas ayuda personal? Escríbenos directamente</p>
                  <Button
                    size="sm"
                    color="success"
                    variant="bordered"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    startContent={<MessageCircle className="w-3 h-3" />}
                    aria-label="Contactar con el equipo de soporte">
                    Contactar
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer de soporte */}
            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 mb-2">Tu feedback es muy importante para nosotros</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>• Respuesta en 24-48 horas</span>
                <span>• Soporte en español</span>
                <span>• Atención personalizada</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sección de configuración de privacidad */}
      <Card className="w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-4 sm:p-6">
          <div className="text-center sm:text-left space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200">Configuración de Privacidad</h3>
                <p className="text-sm text-gray-400">Estado actual de tu perfil y configuraciones de privacidad</p>
              </div>
            </div>

            {/* Estado del perfil detallado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Verificación */}
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className={`w-4 h-4 ${isUserVerified() ? 'text-green-400' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-200">Verificación</span>
                </div>
                <div className="space-y-2">
                  <Chip
                    size="sm"
                    color={isUserVerified() ? 'success' : 'warning'}
                    variant="flat"
                    className={
                      isUserVerified()
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }>
                    {isUserVerified() ? 'Verificado' : 'No verificado'}
                  </Chip>
                  {!isUserVerified() && <p className="text-xs text-gray-400">Verifica tu cuenta para acceder a más funciones</p>}
                </div>
              </div>

              {/* Aprobación */}
              <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-4 h-4 ${isUserApproved() ? 'text-blue-400' : 'text-orange-400'}`} />
                  <span className="text-sm font-medium text-gray-200">Aprobación</span>
                </div>
                <div className="space-y-2">
                  <Chip
                    size="sm"
                    color={isUserApproved() ? 'primary' : 'warning'}
                    variant="flat"
                    className={
                      isUserApproved()
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    }>
                    {isUserApproved() ? 'Aprobado' : 'Pendiente de aprobación'}
                  </Chip>
                  {!isUserApproved() && <p className="text-xs text-orange-300">Tu perfil será revisado y aprobado pronto</p>}
                </div>
              </div>
            </div>

            {/* Configuraciones de privacidad */}
            <div className="bg-gray-800/30 border border-gray-700/20 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-200 mb-3">Configuraciones de Privacidad</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Perfil público/privado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">Perfil público:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={getProfilePrivacy() === 'Público' ? 'success' : 'default'}
                      variant="flat"
                      className={getProfilePrivacy() === 'Público' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {getProfilePrivacy() || 'Privado'}
                    </Chip>
                    {!isUserApproved() && getProfilePrivacy() === 'Público' && <span className="text-orange-300 text-xs">*</span>}
                  </div>
                </div>

                {/* Búsqueda */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">Aparecer en búsquedas:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={isSearchable() ? 'success' : 'default'}
                      variant="flat"
                      className={isSearchable() ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {isSearchable() ? 'Sí' : 'No'}
                    </Chip>
                    {!isUserApproved() && isSearchable() && <span className="text-orange-300 text-xs">*</span>}
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">Compartir ubicación:</span>
                  </div>
                  <Chip
                    size="sm"
                    color={isLocationShared() ? 'success' : 'default'}
                    variant="flat"
                    className={isLocationShared() ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                    {isLocationShared() ? 'Sí' : 'No'}
                  </Chip>
                </div>

                {/* Mostrar en búsquedas */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">Mostrar en matches:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={showInSearch() ? 'success' : 'default'}
                      variant="flat"
                      className={showInSearch() ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {showInSearch() ? 'Sí' : 'No'}
                    </Chip>
                    {!isUserApproved() && showInSearch() && <span className="text-orange-300 text-xs">*</span>}
                  </div>
                </div>
              </div>

              {/* Aclaración para perfiles no aprobados */}
              {!isUserApproved() && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-orange-300">Perfil pendiente de aprobación</p>
                      <p className="text-xs text-orange-200">
                        Aunque hayas configurado tu perfil como público y habilitado las búsquedas,
                        <strong className="text-orange-300">
                          {' '}
                          no aparecerás en búsquedas ni tu perfil será público hasta que sea aprobado
                        </strong>
                        .
                      </p>
                      <p className="text-xs text-orange-200">
                        Una vez aprobado, tus configuraciones de privacidad (marcadas con *) se aplicarán automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resumen de privacidad */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-sm text-gray-300 mb-3">
                En Feeling, protegemos tu privacidad y te damos control total sobre tus datos personales. Conoce más sobre cómo tratamos tu
                información.
              </p>
              <div className="text-xs text-blue-300 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Datos encriptados
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Control de visibilidad
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Nunca vendemos tus datos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sección de privacidad y políticas de datos */}
      <Card className="w-full bg-gray-800/20 border-gray-700/40">
        <CardBody className="p-4 sm:p-6">
          <div className="text-center sm:text-left space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold text-gray-200">Políticas y Datos</h3>
                <p className="text-sm text-gray-400">Información legal y gestión de datos</p>
              </div>
            </div>

            {/* Enlaces a políticas */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 max-w-lg mx-auto">
              <Button
                size="sm"
                variant="bordered"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                startContent={<FileText className="w-4 h-4" />}
                endContent={<ExternalLink className="w-3 h-3" />}
                aria-label="Ver política de privacidad completa">
                Política de Privacidad
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                startContent={<Shield className="w-4 h-4" />}
                endContent={<ExternalLink className="w-3 h-3" />}
                aria-label="Ver tratamiento de datos personales">
                Tratamiento de Datos
              </Button>
            </div>

            {/* Footer legal */}
            <div className="text-center pt-3">
              <p className="text-xs text-gray-500">
                Última actualización: Enero 2025 •
                <span className="text-blue-400 cursor-pointer hover:underline ml-1">Historial de cambios</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Profile
