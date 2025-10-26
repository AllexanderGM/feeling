import { Avatar, Chip, Progress } from '@heroui/react'
import {
  getUserName,
  getUserLastName,
  getUserEmail,
  getUserCountry,
  getUserCity,
  getUserVerified,
  getUserCreatedAt,
  getUserLastActive
} from '@schemas'
import { Eye, Calendar, Mail, Clock, Activity, Shield, Globe, Users, Database, CheckCircle } from 'lucide-react'

const ProfileHeader = ({ user, categoryInterestDetails, getCountryData, profileData, profileStats, userHelpers }) => {
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
            alt={`${getUserName(user)} ${getUserLastName(user)}`}
            className='w-24 h-24 sm:w-28 sm:h-28 text-large border-2 border-gray-600'
            src={profileData?.mainImage}
          />
          {/* Mostrar chip de categoría solo si existe */}
          {categoryInterestDetails && (
            <div className='absolute -bottom-1 -right-1 rounded-full'>
              <Chip
                className='bg-primary-900/90 text-primary-300 border border-primary-500/30'
                color='primary'
                size='sm'
                startContent={categoryInterestDetails.icon && <span className='text-sm'>{categoryInterestDetails.icon}</span>}
                variant='flat'>
                {categoryInterestDetails.name || 'Sin categoría'}
              </Chip>
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className='flex-1 text-center sm:text-left'>
          <div className='space-y-2'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-100'>
              {getUserName(user)} {getUserLastName(user)}
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
                  <img alt={`Bandera de ${getCountryData.name}`} className='w-4 h-4 rounded-full object-cover' src={getCountryData.image} />
                )}
                <span className='truncate'>
                  {getUserCity(user)}, {getUserCountry(user)}
                </span>
              </div>
            </div>

            {/* Información adicional */}
            <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm'>
              {/* Correo */}
              <div className='flex items-center gap-2'>
                <Mail className='w-4 h-4 text-gray-400' />
                <span className='text-gray-200 truncate'>{getUserEmail(user)}</span>
              </div>

              {/* Fecha de registro */}
              {getUserCreatedAt(user) && (
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>
                    Miembro desde {new Date(getUserCreatedAt(user)).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}

              {/* Actividad reciente */}
              {getUserLastActive(user) && (
                <div className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-300'>Última actividad: {new Date(getUserLastActive(user)).toLocaleDateString('es-ES')}</span>
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
            aria-label={`Completitud del perfil: ${profileStats?.completionPercentage || 0}%`}
            className='h-2'
            classNames={{
              indicator: 'bg-gradient-to-r from-primary-400 to-primary-600',
              track: 'bg-gray-700'
            }}
            color='primary'
            value={profileStats?.completionPercentage || 0}
          />
        </div>

        {/* Datos de privacidad y configuración */}
        <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 sm:p-4 space-y-3 mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <Shield className='w-4 h-4 text-blue-400' />
            <span className='text-sm font-medium text-gray-200'>Privacidad y Configuración</span>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400'>
            {/* Visibilidad del perfil */}
            <div className='flex items-center gap-2'>
              <Globe className='w-3 h-3' />
              <span>Perfil: {userHelpers.getProfilePrivacy()}</span>
            </div>

            {/* Búsqueda */}
            <div className='flex items-center gap-2'>
              <Users className='w-3 h-3' />
              <span>Búsqueda: {userHelpers.isSearchable() ? 'Visible' : 'Oculto'}</span>
            </div>

            {/* Datos compartidos */}
            <div className='flex items-center gap-2'>
              <Database className='w-3 h-3' />
              <span>Ubicación: {userHelpers.isLocationShared() ? 'Compartida' : 'Privada'}</span>
            </div>

            {/* Estado de verificación */}
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-3 h-3' />
              <span className={getUserVerified(user) ? 'text-green-400' : 'text-yellow-400'}>
                {getUserVerified(user) ? 'Cuenta verificada' : 'Sin verificar'}
              </span>
            </div>
          </div>
        </div>

        {/* Estado del perfil detallado */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Verificación */}
          <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <CheckCircle className={`w-4 h-4 ${userHelpers.isUserVerified?.() ? 'text-green-400' : 'text-gray-400'}`} />
              <span className='text-sm font-medium text-gray-200'>Verificación</span>
            </div>
            <div className='space-y-2'>
              <Chip
                className={
                  userHelpers.isUserVerified?.()
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }
                color={userHelpers.isUserVerified?.() ? 'success' : 'warning'}
                size='sm'
                variant='flat'>
                {userHelpers.isUserVerified?.() ? 'Verificado' : 'No verificado'}
              </Chip>
              {!userHelpers.isUserVerified?.() && <p className='text-xs text-gray-400'>Verifica tu cuenta para acceder a más funciones</p>}
            </div>
          </div>

          {/* Aprobación */}
          <div className='bg-gray-800/50 border border-gray-700/30 rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <Shield className={`w-4 h-4 ${userHelpers.isUserApproved?.() ? 'text-blue-400' : 'text-orange-400'}`} />
              <span className='text-sm font-medium text-gray-200'>Aprobación</span>
            </div>
            <div className='space-y-2'>
              <Chip
                className={
                  userHelpers.isUserApproved?.()
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }
                color={userHelpers.isUserApproved?.() ? 'primary' : 'warning'}
                size='sm'
                variant='flat'>
                {userHelpers.isUserApproved?.() ? 'Aprobado' : 'Pendiente de aprobación'}
              </Chip>
              {!userHelpers.isUserApproved?.() && <p className='text-xs text-orange-300'>Tu perfil será revisado y aprobado pronto</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
