import { useMemo } from 'react'
import { Card, CardBody, Avatar, Chip, Progress } from '@heroui/react'
import { Settings as SettingsIcon, Shield, CheckCircle } from 'lucide-react'

// Hooks
import { useAuth, useLocation, useUser, useUserInterests } from '@hooks'

// Components
import LoadData from '@components/layout/LoadData.jsx'
import LoadDataError from '@components/layout/LoadDataError.jsx'
import LiteContainer from '@components/layout/LiteContainer.jsx'

import PrivacySettingsSection from './components/PrivacySettingsSection.jsx'
import NotificationSettingsSection from './components/NotificationSettingsSection.jsx'
import AccountSettingsSection from './components/AccountSettingsSection.jsx'
import SecuritySettingsSection from './components/SecuritySettingsSection.jsx'

const Settings = () => {
  // Hooks principales
  const { user, loading: authLoading } = useAuth()
  const { getProfileStats } = useUser()
  const { getInterestByEnum, loading: interestLoading, error: interestError } = useUserInterests()

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
  const userInterestDetails = useMemo(() => {
    const interestEnum = user?.categoryInterest || user?.userCategoryInterest?.categoryInterestEnum
    if (!interestEnum) return null

    const interestDetails = getInterestByEnum(interestEnum)
    return interestDetails
  }, [user?.categoryInterest, user?.userCategoryInterest?.categoryInterestEnum, getInterestByEnum])

  // Obtener datos del país con bandera
  const getCountryData = useMemo(() => {
    if (!user?.country || !formattedCountries) return null
    return formattedCountries.find(country => country.name === user.country)
  }, [user?.country, formattedCountries])

  // Estados de carga y error
  const isLoading = authLoading || interestLoading

  if (isLoading) return <LoadData>Cargando configuración...</LoadData>
  if (!user) return <LoadDataError>Error al cargar la información del usuario</LoadDataError>
  if (interestError) return <LoadDataError>Error al cargar categorías de interés</LoadDataError>

  return (
    <LiteContainer className='gap-4' ariaLabel='Página de configuración'>
      {/* Header de configuración */}
      <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6'>
        {/* Header principal */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6'>
          <div className='w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center'>
            <SettingsIcon className='w-5 h-5 text-blue-400' />
          </div>
          <div className='text-center sm:text-left'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Configuración de la Cuenta</h3>
            <p className='text-sm text-gray-400'>Gestiona tu privacidad, notificaciones y configuración general</p>
          </div>
        </div>

        {/* Vista previa del usuario */}
        <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            <Avatar
              src={profileData?.mainImage}
              alt={`${user.name} ${user.lastName}`}
              className='w-20 h-20 sm:w-24 sm:h-24 text-large border-2 border-gray-600'
            />
            {/* Mostrar chip de categoría solo si existe */}
            {userInterestDetails && (
              <div className='absolute -bottom-1 -right-1 rounded-full'>
                <Chip
                  size='sm'
                  variant='flat'
                  color='primary'
                  className='bg-primary-900/90 text-primary-300 border border-primary-500/30'
                  startContent={userInterestDetails.icon && <span className='text-sm'>{userInterestDetails.icon}</span>}>
                  {userInterestDetails.name || 'Sin categoría'}
                </Chip>
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className='flex-1 text-center sm:text-left'>
            <div className='space-y-2'>
              <h1 className='text-lg sm:text-xl font-bold text-gray-100'>
                {user.name} {user.lastName}
              </h1>

              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-300 text-sm'>
                {/* Ubicación */}
                <div className='flex items-center gap-2'>
                  {getCountryData && (
                    <img
                      src={getCountryData.image}
                      alt={`Bandera de ${getCountryData.name}`}
                      className='w-4 h-4 rounded-full object-cover'
                    />
                  )}
                  <span className='truncate'>
                    {user.city}, {user.country}
                  </span>
                </div>

                {/* Estado de verificación */}
                <div className='flex items-center gap-1'>
                  <CheckCircle className={`w-4 h-4 ${user.verified ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span className={user.verified ? 'text-green-400' : 'text-yellow-400'}>
                    {user.verified ? 'Verificado' : 'Sin verificar'}
                  </span>
                </div>
              </div>

              {/* Completitud del perfil */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-gray-400'>Completitud del perfil</span>
                  <span className='text-gray-300 font-medium'>{profileStats?.completionPercentage || 0}%</span>
                </div>
                <Progress
                  value={profileStats?.completionPercentage || 0}
                  className='h-1.5'
                  color='primary'
                  aria-label={`Completitud del perfil: ${profileStats?.completionPercentage || 0}%`}
                  classNames={{
                    indicator: 'bg-gradient-to-r from-primary-400 to-primary-600',
                    track: 'bg-gray-700'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones de configuración */}
      <Card className='w-full bg-gray-800/40 backdrop-blur-sm border-gray-700/50'>
        <CardBody className='p-4 sm:p-6'>
          {/* Header para las secciones */}
          <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-6 pb-4 border-b border-gray-700/30'>
            <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
              <Shield className='w-5 h-5 text-green-400' />
            </div>
            <div className='text-center sm:text-left'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Configuración y Privacidad</h3>
              <p className='text-sm text-gray-400'>Personaliza tu experiencia y controla tu privacidad</p>
            </div>
          </div>

          {/* Secciones de configuración */}
          <div className='space-y-6'>
            {/* Configuración de privacidad */}
            <div className='space-y-6'>
              <PrivacySettingsSection user={user} />
            </div>

            {/* Separador */}
            <div className='border-t border-gray-700/50 pt-6'>
              <NotificationSettingsSection user={user} />
            </div>

            {/* Separador */}
            <div className='border-t border-gray-700/50 pt-6'>
              <AccountSettingsSection user={user} />
            </div>

            {/* Separador */}
            <div className='border-t border-gray-700/50 pt-6'>
              <SecuritySettingsSection user={user} />
            </div>
          </div>
        </CardBody>
      </Card>
    </LiteContainer>
  )
}

export default Settings
