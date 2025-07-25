import { Card, CardBody, Button, Progress } from '@heroui/react'
import { Zap, Sparkles, Crown, Heart, Star } from 'lucide-react'

const MatchSection = ({
  getMatchAttempts,
  getTodayMatches,
  getTotalMatches,
  getMaxDailyAttempts
}) => {
  return (
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
              <div className="text-xl font-bold text-primary-400">{getMatchAttempts()}</div>
              <div className="text-xs text-gray-400">Disponibles</div>
            </div>
            <div className="h-8 w-px bg-gray-600"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{getTodayMatches()}</div>
              <div className="text-xs text-gray-400">Hoy</div>
            </div>
            <div className="h-8 w-px bg-gray-600"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{getTotalMatches()}</div>
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
                  <div className="text-2xl font-bold text-primary-400">{getMatchAttempts()}</div>
                  <div className="text-xs text-gray-400">Disponibles</div>
                </div>
                <div className="h-8 w-px bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{getTodayMatches()}</div>
                  <div className="text-xs text-gray-400">Hoy</div>
                </div>
                <div className="h-8 w-px bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{getTotalMatches()}</div>
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
              {getMatchAttempts()} / {getMaxDailyAttempts()}
            </span>
          </div>
          <Progress
            value={(getMatchAttempts() / getMaxDailyAttempts()) * 100}
            className="h-2"
            aria-label={`Intentos de match restantes: ${getMatchAttempts()} de ${getMaxDailyAttempts()}`}
            classNames={{
              indicator: 'bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400',
              track: 'bg-gray-700/50'
            }}
          />
        </div>

        {/* Mensaje motivacional */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-300">
            {getMatchAttempts() > 0 ? (
              <>
                <span className="text-primary-400 font-medium">¡Tienes {getMatchAttempts()} intentos!</span>
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
  )
}

export default MatchSection