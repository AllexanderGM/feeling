import { Avatar, Chip, Progress, Button } from '@heroui/react'
import { Eye, Calendar, Mail, Clock, Activity, Share2, Settings, Shield, Globe, Users, Database, CheckCircle, User } from 'lucide-react'

const ProfileHeader = ({
  profileData,
  getUserName,
  getUserLastName,
  getUserEmail,
  getUserCreatedAt,
  getUserLastActive,
  getUserId,
  getAccountType,
  getRegion,
  profileStats,
  categoryInterestDetails,
  getCountryData,
  getUserCity,
  getUserCountry,
  getProfilePrivacy,
  isSearchable,
  isLocationShared,
  isUserVerified,
  isProfileComplete,
  isAccountActive
}) => {
  return (
    <div className='w-full bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6'>
      {/* Header para vista previa */}
      <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 mb-4 sm:mb-6'>
        <div className='w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center'>
          <Eye className='w-5 h-5 text-green-400' />
        </div>
        <div className='text-center sm:text-left'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-200'>Estado General de la Cuenta</h3>
          <p className='text-sm text-gray-400'>Resumen de tu perfil y actividad en la plataforma</p>
        </div>
      </div>

      {/* Layout mobile-first: vertical en móvil, horizontal en desktop */}
      <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'>
        {/* Avatar */}
        <div className='relative shrink-0'>
          <Avatar
            src={profileData?.mainImage}
            alt={`${getUserName()} ${getUserLastName()}`}
            className='w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600'
          />
          {/* Mostrar chip de categoría solo si existe */}
          {categoryInterestDetails && (
            <div className='absolute -bottom-1 -right-1 rounded-full'>
              <Chip
                size='sm'
                variant='flat'
                color='primary'
                className='bg-primary-900/90 text-primary-300 border border-primary-500/30'
                startContent={categoryInterestDetails.icon && <span className='text-sm'>{categoryInterestDetails.icon}</span>}>
                {categoryInterestDetails.name || 'Sin categoría'}
              </Chip>
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className='flex-1 text-center sm:text-left'>
          <div className='space-y-2'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>
              {getUserName()} {getUserLastName()}
            </h1>

            <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-300 text-sm sm:text-base'>
              {/* Edad */}
              {profileData?.age && (
                <div className='flex items-center gap-1'>
                  <Calendar className='w-4 h-4' />
                  <span>{profileData.age} años</span>
                </div>
              )}

              {/* Ubicación */}
              <div className='flex items-center gap-2'>
                {getCountryData && (
                  <img src={getCountryData.image} alt={`Bandera de ${getCountryData.name}`} className='w-4 h-4 rounded-full object-cover' />
                )}
                <span className='truncate'>
                  {getUserCity()}, {getUserCountry()}
                </span>
              </div>
            </div>

            {/* Información adicional */}
            <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm'>
              {/* Correo */}
              <div className='flex items-center gap-2'>
                <Mail className='w-4 h-4 text-gray-400' />
                <span className='text-gray-200 truncate'>{getUserEmail()}</span>
              </div>

              {/* Fecha de registro */}
              {getUserCreatedAt() && (
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>
                    Miembro desde {new Date(getUserCreatedAt()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}

              {/* Actividad reciente */}
              {getUserLastActive() && (
                <div className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>Última actividad: {new Date(getUserLastActive()).toLocaleDateString('es-ES')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className='mt-4 sm:mt-6 border-t border-gray-700/50 pt-4 sm:pt-6'>
        {/* Completitud del perfil */}
        <div className='space-y-2 mb-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-300'>Completitud del perfil</span>
            <span className='text-sm font-bold text-gray-200'>{profileStats?.completionPercentage || 0}%</span>
          </div>
          <Progress
            value={profileStats?.completionPercentage || 0}
            className='h-2'
            color='primary'
            aria-label={`Completitud del perfil: ${profileStats?.completionPercentage || 0}%`}
            classNames={{
              indicator: 'bg-gradient-to-r from-primary-400 to-primary-600',
              track: 'bg-gray-700'
            }}
          />
        </div>

        {/* Datos de privacidad y configuración */}
        <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 sm:p-4 space-y-3'>
          <div className='flex items-center gap-2 mb-2'>
            <Shield className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Privacidad y Configuración</span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
            {/* Visibilidad del perfil */}
            <div className='flex items-center gap-2'>
              <Globe className='w-3 h-3' />
              <span>Perfil: {getProfilePrivacy()}</span>
            </div>

            {/* Búsqueda */}
            <div className='flex items-center gap-2'>
              <Users className='w-3 h-3' />
              <span>Búsqueda: {isSearchable() ? 'Visible' : 'Oculto'}</span>
            </div>

            {/* Datos compartidos */}
            <div className='flex items-center gap-2'>
              <Database className='w-3 h-3' />
              <span>Ubicación: {isLocationShared() ? 'Compartida' : 'Privada'}</span>
            </div>

            {/* Estado de verificación */}
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-3 h-3' />
              <span className={isUserVerified() ? 'text-green-400' : 'text-yellow-400'}>
                {isUserVerified() ? 'Cuenta verificada' : 'Sin verificar'}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className='flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-700/30'>
            <Button
              size='sm'
              variant='light'
              className='text-primary-400 hover:text-primary-300 hover:bg-primary-500/10'
              startContent={<Share2 className='w-3 h-3' />}
              aria-label='Compartir perfil'>
              Compartir Perfil
            </Button>
            <Button
              size='sm'
              variant='light'
              className='text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              startContent={<Settings className='w-3 h-3' />}
              aria-label='Configuración de privacidad'>
              Configuración
            </Button>
          </div>
        </div>

        {/* Metadatos adicionales */}
        <div className='mt-3 space-y-2'>
          <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs text-gray-400'>
            {/* ID de usuario */}
            <div className='flex items-center gap-1'>
              <span>ID:</span>
              <span className='text-gray-300 font-mono'>{getUserId()}</span>
            </div>

            {/* Tipo de cuenta */}
            <div className='flex items-center gap-1'>
              <span>Tipo:</span>
              <span className='text-gray-300'>{getAccountType()}</span>
            </div>

            {/* Región */}
            <div className='flex items-center gap-1'>
              <span>Región:</span>
              <span className='text-gray-300'>{getRegion()}</span>
            </div>
          </div>

          {/* Estado del perfil */}
          <div className='flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap'>
            <Chip
              size='sm'
              color={isProfileComplete() ? 'success' : 'warning'}
              variant='flat'
              startContent={<User className='w-3 h-3' />}
              className={`${isProfileComplete() ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
              {isProfileComplete() ? 'Perfil completo' : 'Perfil incompleto'}
            </Chip>

            {/* Estado de actividad */}
            <Chip
              size='sm'
              color='primary'
              variant='flat'
              startContent={<Activity className='w-3 h-3' />}
              className='bg-primary-500/20 text-primary-300 border border-primary-500/30'>
              {isAccountActive() ? 'Activo' : 'Inactivo'}
            </Chip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
