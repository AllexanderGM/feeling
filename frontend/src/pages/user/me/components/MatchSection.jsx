import { Card, CardBody, Button, Progress } from '@heroui/react'
import { Link } from 'react-router-dom'
import { APP_PATHS } from '@constants/paths'
import { Zap, Sparkles, Crown, Heart, Star } from 'lucide-react'

const MatchSection = ({ userHelpers = {} }) => {
  const getValue = fn => {
    if (typeof fn !== 'function') {
      return 0
    }

    const value = fn()

    const numericValue = Number(value)

    return Number.isFinite(numericValue) ? numericValue : 0
  }

  const availableAttempts = getValue(userHelpers.getMatchAttempts)
  const reservedAttempts = getValue(userHelpers.getReservedAttempts)
  const balanceAttempts = getValue(userHelpers.getAttemptBalance)
  const todayMatches = getValue(userHelpers.getTodayMatches)
  const acceptedMatches = getValue(userHelpers.getAcceptedMatches)
  const sentMatches = getValue(userHelpers.getSentMatches)
  const receivedMatches = getValue(userHelpers.getReceivedMatches)
  const pendingSent = getValue(userHelpers.getPendingSentMatches)
  const pendingReceived = getValue(userHelpers.getPendingReceivedMatches)
  const favorites = getValue(userHelpers.getFavoritesCount)

  const hasAttempts = availableAttempts > 0

  return (
    <Card className='w-full bg-gradient-to-br from-primary-900/20 via-primary-800/10 to-purple-900/20 border-primary-500/30'>
      <CardBody className='p-4 sm:p-6'>
        {/* Layout móvil */}
        <div className='flex flex-col items-center gap-4 sm:hidden'>
          {/* Header mobile */}
          <div className='flex items-center gap-3 w-full justify-center'>
            <div className='relative'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center'>
                <Zap className='w-5 h-5 text-white' />
              </div>
              <div className='absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                <Sparkles className='w-2 h-2 text-white' />
              </div>
            </div>

            <div className='text-center'>
              <div className='flex items-center gap-2 mb-1 justify-center'>
                <h3 className='text-base font-bold text-gray-100'>Intentos de Match</h3>
                <Crown className='w-4 h-4 text-yellow-400' />
              </div>
              <p className='text-xs text-gray-400'>Controla tu saldo y los matches activos.</p>
            </div>
          </div>

          {/* Estadísticas móvil */}
          <div className='flex items-center justify-center gap-4 w-full'>
            <div className='text-center'>
              <div className='text-xl font-bold text-primary-400'>{availableAttempts}</div>
              <div className='text-xs text-gray-400'>Disponibles</div>
            </div>
            <div className='h-8 w-px bg-gray-600' />
            <div className='text-center'>
              <div className='text-xl font-bold text-orange-300'>{reservedAttempts}</div>
              <div className='text-xs text-gray-400'>Reservados</div>
            </div>
            <div className='h-8 w-px bg-gray-600' />
            <div className='text-center'>
              <div className='text-xl font-bold text-green-400'>{acceptedMatches}</div>
              <div className='text-xs text-gray-400'>Aceptados</div>
            </div>
          </div>

          {/* Botones de acción mobile */}
          <div className='flex flex-col gap-2 w-full max-w-sm'>
            <Button
              aria-label='Buscar nuevo match'
              as={Link}
              className='bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 w-full'
              color='primary'
              size='sm'
              startContent={<Heart className='w-4 h-4' />}
              to={APP_PATHS.ROOT}
              variant='solid'>
              Buscar Match
            </Button>
            <Button
              aria-label='Obtener más intentos de match'
              as={Link}
              className='border-purple-500/50 text-purple-300 hover:bg-purple-500/10 w-full'
              color='secondary'
              size='sm'
              startContent={<Star className='w-4 h-4' />}
              to={APP_PATHS.USER.PURCHASE_PLANS}
              variant='bordered'>
              Obtener Más
            </Button>
          </div>
        </div>

        {/* Layout desktop */}
        <div className='hidden sm:flex flex-row items-center justify-between gap-6'>
          {/* Información de intentos */}
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center'>
                <Zap className='w-6 h-6 text-white' />
              </div>
              <div className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                <Sparkles className='w-3 h-3 text-white' />
              </div>
            </div>

            <div className='text-left'>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='text-lg font-bold text-gray-100'>Intentos de Match</h3>
                <Crown className='w-5 h-5 text-yellow-400' />
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary-400'>{availableAttempts}</div>
                  <div className='text-xs text-gray-400'>Disponibles</div>
                </div>
                <div className='h-8 w-px bg-gray-600' />
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-300'>{reservedAttempts}</div>
                  <div className='text-xs text-gray-400'>Reservados</div>
                </div>
                <div className='h-8 w-px bg-gray-600' />
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-300'>{balanceAttempts}</div>
                  <div className='text-xs text-gray-400'>Saldo total</div>
                </div>
                <div className='h-8 w-px bg-gray-600' />
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-400'>{acceptedMatches}</div>
                  <div className='text-xs text-gray-400'>Aceptados</div>
                </div>
                <div className='h-8 w-px bg-gray-600' />
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-300'>{todayMatches}</div>
                  <div className='text-xs text-gray-400'>Hoy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción desktop */}
          <div className='flex flex-row gap-3'>
            <Button
              aria-label='Buscar nuevo match'
              as={Link}
              className='bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600'
              color='primary'
              size='sm'
              startContent={<Heart className='w-4 h-4' />}
              to={APP_PATHS.ROOT}
              variant='solid'>
              Buscar Match
            </Button>
            <Button
              aria-label='Obtener más intentos de match'
              as={Link}
              className='border-purple-500/50 text-purple-300 hover:bg-purple-500/10'
              color='secondary'
              size='sm'
              startContent={<Star className='w-4 h-4' />}
              to={APP_PATHS.USER.PURCHASE_PLANS}
              variant='bordered'>
              Obtener Más
            </Button>
          </div>
        </div>

        {/* Barra de progreso para intentos */}
        <div className='mt-4 space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-400'>Intentos comprometidos</span>
            <span className='text-sm font-medium text-gray-300'>
              {reservedAttempts} / {balanceAttempts}
            </span>
          </div>
          <Progress
            aria-label={`Intentos reservados: ${reservedAttempts} de ${balanceAttempts}`}
            className='h-2'
            classNames={{
              indicator: 'bg-gradient-to-r from-orange-400 via-primary-400 to-pink-400',
              track: 'bg-gray-700/50'
            }}
            value={balanceAttempts > 0 ? (reservedAttempts / balanceAttempts) * 100 : 0}
          />
        </div>

        {/* Estadísticas adicionales compactas */}
        <div className='mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 rounded-full'>
            <span className='text-xs text-blue-300 font-medium'>Enviados</span>
            <span className='text-sm font-bold text-blue-400'>{sentMatches}</span>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-700/30 rounded-full'>
            <span className='text-xs text-purple-300 font-medium'>Recibidos</span>
            <span className='text-sm font-bold text-purple-400'>{receivedMatches}</span>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-700/30 rounded-full'>
            <span className='text-xs text-amber-300 font-medium'>Pend. Enviados</span>
            <span className='text-sm font-bold text-amber-400'>{pendingSent}</span>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-orange-900/20 border border-orange-700/30 rounded-full'>
            <span className='text-xs text-orange-300 font-medium'>Pend. Recibidos</span>
            <span className='text-sm font-bold text-orange-400'>{pendingReceived}</span>
          </div>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-pink-900/20 border border-pink-700/30 rounded-full'>
            <span className='text-xs text-pink-300 font-medium'>Favoritos</span>
            <span className='text-sm font-bold text-pink-400'>{favorites}</span>
          </div>
        </div>

        {/* Mensaje motivacional compacto */}
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-300'>
            {hasAttempts ? (
              <>
                <span className='text-primary-400 font-medium'>Tienes {availableAttempts} matches disponibles.</span>
                <span className='text-gray-400'> Aprovéchalos para iniciar nuevas conexiones cuando lo desees.</span>
              </>
            ) : (
              <>
                <span className='text-orange-400 font-medium'>Sin intentos disponibles.</span>
                <span className='text-gray-400'> Obtén más para seguir conectando con personas increíbles.</span>
              </>
            )}
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

export default MatchSection
