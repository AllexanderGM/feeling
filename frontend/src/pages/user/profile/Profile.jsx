import { useMemo } from 'react'
import { Avatar, Chip, Progress, Card, CardBody, Button } from '@heroui/react'
import {
  User,
  Calendar,
  Shield,
  Eye,
  Heart,
  Zap,
  Star,
  Crown,
  Sparkles,
  Bug,
  MessageCircle,
  HelpCircle,
  Send,
  AlertTriangle,
  Lock,
  FileText,
  ExternalLink,
  Mail,
  Clock,
  Activity,
  Share2,
  Settings,
  Globe,
  Users,
  Database,
  CheckCircle
} from 'lucide-react'
// Hooks
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
import useLocation from '@hooks/useLocation.js'
import { useCategoryInterests } from '@hooks/useCategoryInterests.js'
// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'

import PersonalInfoSection from './components/PersonalInfoSection.jsx'
import CharacteristicsSection from './components/CharacteristicsSection.jsx'
import PreferencesSection from './components/PreferencesSection.jsx'

const Profile = () => {
  // Hooks principales
  const { user, loading: authLoading } = useAuth()
  const { getProfileStats } = useUser()
  const { getCategoryByEnum, loading: categoryLoading, error: categoryError } = useCategoryInterests()

  // Hook para obtener datos geográficos y banderas
  const locationConfig = useMemo(
    () => ({
      defaultCountry: user?.country || 'Colombia',
      defaultCity: user?.city || 'Bogotá',
      loadAll: true
    }),
    [user?.country, user?.city]
  )

  const { formattedCountries } = useLocation(locationConfig)

  // Obtener estadísticas del perfil desde el hook
  const profileStats = useMemo(() => getProfileStats(), [getProfileStats])

  // Utilidades memoizadas
  const profileData = useMemo(() => {
    if (!user) return null

    // Obtener imagen principal
    const getMainImage = () => {
      if (!user?.images || user.images.length === 0) return null
      const selectedIndex = user.selectedProfileImageIndex || 0
      return user.images[selectedIndex] || user.images[0]
    }

    // Calcular edad
    const calculateAge = birthDate => {
      if (!birthDate) return null
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }

    return {
      mainImage: getMainImage(),
      age: calculateAge(user.birthDate)
    }
  }, [user])

  // Obtener categoría de interés con icono
  const categoryInterestDetails = useMemo(() => {
    // Verificar múltiples formas de obtener la categoría
    const categoryEnum = user?.categoryInterest || user?.userCategoryInterest?.categoryInterestEnum
    if (!categoryEnum) return null

    const categoryDetails = getCategoryByEnum(categoryEnum)
    return categoryDetails
  }, [user?.categoryInterest, user?.userCategoryInterest?.categoryInterestEnum, getCategoryByEnum])

  // Obtener datos del país con bandera
  const getCountryData = useMemo(() => {
    if (!user?.country || !formattedCountries) return null
    return formattedCountries.find(country => country.name === user.country)
  }, [user?.country, formattedCountries])

  // Estados de carga y error
  const isLoading = authLoading || categoryLoading

  if (isLoading) return <LoadData>Cargando perfil...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (categoryError) return <LoadDataError>Error al cargar categorías de interés</LoadDataError>

  return (
    <LiteContainer className="gap-4" ariaLabel="Página de perfil de usuario">
      {/* Vista previa del perfil */}
      <div className="w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
        {/* Header para vista previa */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-200">Estado General de la Cuenta</h3>
            <p className="text-sm text-gray-400">Resumen de tu perfil y actividad en la plataforma</p>
          </div>
        </div>
        {/* Layout mobile-first: vertical en móvil, horizontal en desktop */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={profileData?.mainImage}
              alt={`${user.name} ${user.lastName}`}
              className="w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600"
            />
            {/* Mostrar chip de categoría solo si existe */}
            {categoryInterestDetails && (
              <div className="absolute -bottom-1 -right-1 rounded-full">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="bg-primary-900/90 text-primary-300 border border-primary-500/30"
                  startContent={categoryInterestDetails.icon && <span className="text-sm">{categoryInterestDetails.icon}</span>}>
                  {categoryInterestDetails.name || 'Sin categoría'}
                </Chip>
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className="flex-1 text-center sm:text-left">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
                {user.name} {user.lastName}
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-300 text-sm sm:text-base">
                {/* Edad */}
                {profileData?.age && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{profileData.age} años</span>
                  </div>
                )}

                {/* Ubicación */}
                <div className="flex items-center gap-2">
                  {getCountryData && (
                    <img
                      src={getCountryData.image}
                      alt={`Bandera de ${getCountryData.name}`}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span className="truncate">
                    {user.city}, {user.country}
                  </span>
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm">
                {/* Correo */}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-200 truncate">{user.email}</span>
                </div>

                {/* Fecha de registro */}
                {user.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                )}

                {/* Actividad reciente */}
                {user.lastLoginAt && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Última actividad: {new Date(user.lastLoginAt).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="mt-4 sm:mt-6 border-t border-gray-700/50 pt-4 sm:pt-6">
          {/* Completitud del perfil */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Completitud del perfil</span>
              <span className="text-sm font-bold text-gray-200">{profileStats?.completionPercentage || 0}%</span>
            </div>
            <Progress
              value={profileStats?.completionPercentage || 0}
              className="h-2"
              color="primary"
              aria-label={`Completitud del perfil: ${profileStats?.completionPercentage || 0}%`}
              classNames={{
                indicator: 'bg-gradient-to-r from-primary-400 to-primary-600',
                track: 'bg-gray-700'
              }}
            />
          </div>

          {/* Datos de privacidad y configuración */}
          <div className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-200">Privacidad y Configuración</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
              {/* Visibilidad del perfil */}
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>Perfil: {user.profilePrivacy || 'Público'}</span>
              </div>

              {/* Búsqueda */}
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>Búsqueda: {user.searchable ? 'Visible' : 'Oculto'}</span>
              </div>

              {/* Datos compartidos */}
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3" />
                <span>Ubicación: {user.shareLocation ? 'Compartida' : 'Privada'}</span>
              </div>

              {/* Estado de verificación */}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                <span className={user.verified ? 'text-green-400' : 'text-yellow-400'}>
                  {user.verified ? 'Cuenta verificada' : 'Sin verificar'}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-700/30">
              <Button
                size="sm"
                variant="light"
                className="text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                startContent={<Share2 className="w-3 h-3" />}
                aria-label="Compartir perfil">
                Compartir Perfil
              </Button>
              <Button
                size="sm"
                variant="light"
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                startContent={<Settings className="w-3 h-3" />}
                aria-label="Configuración de privacidad">
                Configuración
              </Button>
            </div>
          </div>

          {/* Metadatos adicionales */}
          <div className="mt-3 space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs text-gray-400">
              {/* ID de usuario */}
              <div className="flex items-center gap-1">
                <span>ID:</span>
                <span className="text-gray-300 font-mono">{user.id}</span>
              </div>

              {/* Tipo de cuenta */}
              <div className="flex items-center gap-1">
                <span>Tipo:</span>
                <span className="text-gray-300">{user.accountType || 'Básica'}</span>
              </div>

              {/* Región */}
              <div className="flex items-center gap-1">
                <span>Región:</span>
                <span className="text-gray-300">{user.region || 'América'}</span>
              </div>
            </div>

            {/* Estado del perfil */}
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
              <Chip
                size="sm"
                color={user.profileComplete ? 'success' : 'warning'}
                variant="flat"
                startContent={<User className="w-3 h-3" />}
                className={`${user.profileComplete ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                {user.profileComplete ? 'Perfil completo' : 'Perfil incompleto'}
              </Chip>

              {/* Estado de actividad */}
              <Chip
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Activity className="w-3 h-3" />}
                className="bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Chip>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de intentos de match */}
      <Card className="w-full bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-purple-900/20 border-primary-500/30">
        <CardBody className="p-4 sm:p-6">
          {/* Layout móvil */}
          <div className="flex flex-col items-center gap-4 sm:hidden">
            {/* Header mobile */}
            <div className="flex items-center gap-3 w-full justify-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 mb-1 justify-center">
                  <h3 className="text-base font-bold text-gray-100">Intentos de Match</h3>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Estadísticas móvil */}
            <div className="flex items-center justify-center gap-4 w-full">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-400">{user?.matchAttempts || 5}</div>
                <div className="text-xs text-gray-400">Disponibles</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{user?.todayMatches || 0}</div>
                <div className="text-xs text-gray-400">Hoy</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{user?.totalMatches || 0}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>

            {/* Botones de acción mobile */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <Button
                size="sm"
                color="primary"
                variant="solid"
                className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 w-full"
                startContent={<Heart className="w-4 h-4" />}
                aria-label="Buscar nuevo match">
                Buscar Match
              </Button>
              <Button
                size="sm"
                color="secondary"
                variant="bordered"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 w-full"
                startContent={<Star className="w-4 h-4" />}
                aria-label="Obtener más intentos de match">
                Obtener Más
              </Button>
            </div>
          </div>

          {/* Layout desktop */}
          <div className="hidden sm:flex flex-row items-center justify-between gap-6">
            {/* Información de intentos */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-100">Intentos de Match</h3>
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-400">{user?.matchAttempts || 5}</div>
                    <div className="text-xs text-gray-400">Disponibles</div>
                  </div>
                  <div className="h-8 w-px bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{user?.todayMatches || 0}</div>
                    <div className="text-xs text-gray-400">Hoy</div>
                  </div>
                  <div className="h-8 w-px bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{user?.totalMatches || 0}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción desktop */}
            <div className="flex flex-row gap-3">
              <Button
                size="sm"
                color="primary"
                variant="solid"
                className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
                startContent={<Heart className="w-4 h-4" />}
                aria-label="Buscar nuevo match">
                Buscar Match
              </Button>
              <Button
                size="sm"
                color="secondary"
                variant="bordered"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                startContent={<Star className="w-4 h-4" />}
                aria-label="Obtener más intentos de match">
                Obtener Más
              </Button>
            </div>
          </div>

          {/* Barra de progreso para intentos */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Intentos restantes hoy</span>
              <span className="text-sm font-medium text-gray-300">
                {user?.matchAttempts || 5} / {user?.maxDailyAttempts || 10}
              </span>
            </div>
            <Progress
              value={((user?.matchAttempts || 5) / (user?.maxDailyAttempts || 10)) * 100}
              className="h-2"
              aria-label={`Intentos de match restantes: ${user?.matchAttempts || 5} de ${user?.maxDailyAttempts || 10}`}
              classNames={{
                indicator: 'bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400',
                track: 'bg-gray-700/50'
              }}
            />
          </div>

          {/* Mensaje motivacional */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-300">
              {(user?.matchAttempts || 5) > 0 ? (
                <>
                  <span className="text-primary-400 font-medium">¡Tienes {user?.matchAttempts || 5} intentos!</span>
                  <span className="text-gray-400"> Encuentra tu conexión perfecta hoy.</span>
                </>
              ) : (
                <>
                  <span className="text-orange-400 font-medium">Sin intentos disponibles.</span>
                  <span className="text-gray-400"> Los intentos se renovarán mañana o puedes obtener más.</span>
                </>
              )}
            </p>
          </div>
        </CardBody>
      </Card>

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
            <PersonalInfoSection user={user} />

            {/* Separador */}
            <div className="border-t border-gray-700/50 pt-6">
              <CharacteristicsSection user={user} />
            </div>

            {/* Separador */}
            <div className="border-t border-gray-700/50 pt-6">
              <PreferencesSection user={user} />
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
                <h3 className="text-base sm:text-lg font-semibold text-gray-200">Privacidad y Datos</h3>
                <p className="text-sm text-gray-400">Tu información está protegida y bajo tu control</p>
              </div>
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
