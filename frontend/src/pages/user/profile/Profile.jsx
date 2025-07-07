import { useMemo } from 'react'
import { Avatar, Chip, Progress, Tabs, Tab } from '@heroui/react'
import { User, MapPin, Calendar, Camera, Shield, Eye, IdCard, Heart, Target } from 'lucide-react'
// Hooks
import useAuth from '@hooks/useAuth.js'
import useUser from '@hooks/useUser.js'
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

  // Configuración de las pestañas
  const tabsConfig = useMemo(
    () => [
      {
        key: 'personal',
        title: 'Personal',
        icon: IdCard,
        component: PersonalInfoSection
      },
      {
        key: 'characteristics',
        title: 'Características',
        icon: Heart,
        component: CharacteristicsSection
      },
      {
        key: 'preferences',
        title: 'Preferencias',
        icon: Target,
        component: PreferencesSection
      }
    ],
    []
  )

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
    if (!user?.categoryInterest) return null
    return getCategoryByEnum(user.categoryInterest)
  }, [user?.categoryInterest, getCategoryByEnum])

  // Estados de carga y error
  const isLoading = authLoading || categoryLoading

  if (isLoading) return <LoadData>Cargando perfil...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (categoryError) return <LoadDataError>Error al cargar categorías de interés</LoadDataError>

  return (
    <LiteContainer className="gap-4">
      {/* Vista previa del perfil */}
      <div className="w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
        {/* Layout mobile-first: vertical en móvil, horizontal en desktop */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={profileData?.mainImage}
              alt={`${user.name} ${user.lastName}`}
              className="w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full">
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                className="bg-primary-900/90 text-primary-300 border border-primary-500/30"
                startContent={<span className="text-sm">{categoryInterestDetails.icon}</span>}>
                {categoryInterestDetails.name}
              </Chip>
            </div>
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
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {user.city}, {user.country}
                  </span>
                </div>
              </div>

              {/* Categoría de interés */}
              {categoryInterestDetails && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-gray-400 text-sm">Correo:</span>
                  <span className="text-gray-200 text-sm">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completitud del perfil */}
        <div className="mt-4 sm:mt-6 space-y-2">
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

        {/* Estado de verificación */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
          <Chip
            size="sm"
            color={user.verified ? 'success' : 'warning'}
            variant="flat"
            startContent={user.verified ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            className={`${user.verified ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
            {user.verified ? 'Verificado' : 'Sin verificar'}
          </Chip>
          <Chip
            size="sm"
            color={user.profileComplete ? 'success' : 'warning'}
            variant="flat"
            startContent={<User className="w-3 h-3" />}
            className={`${user.profileComplete ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
            {user.profileComplete ? 'Perfil completo' : 'Perfil incompleto'}
          </Chip>
        </div>
      </div>

      {/* Pestañas del perfil */}
      <Tabs aria-label="Secciones del perfil" variant="bordered" className="w-full">
        {tabsConfig.map(tab => {
          const IconComponent = tab.icon
          const ContentComponent = tab.component

          return (
            <Tab
              className="w-full"
              key={tab.key}
              title={
                <div className="flex items-center justify-center space-x-2 text-center">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{tab.title}</span>
                </div>
              }>
              <ContentComponent user={user} />
            </Tab>
          )
        })}
      </Tabs>
    </LiteContainer>
  )
}

export default Profile
