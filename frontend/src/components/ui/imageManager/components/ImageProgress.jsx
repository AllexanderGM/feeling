/**
 * COMPONENTE IMAGEPROGRESS
 *
 * Barra de progreso para mostrar la cantidad de imágenes subidas
 */

import { memo } from 'react'
import { Progress, Chip } from '@heroui/react'
import { Camera, Check } from 'lucide-react'

const ImageProgress = memo(({ imageCount = 0, maxImages = 5, className = '' }) => {
  const percentage = Math.round((imageCount / maxImages) * 100)
  const isComplete = imageCount >= maxImages

  return (
    <div
      className={`space-y-2 ${className}`}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso de subida de fotos: ${imageCount} de ${maxImages} imágenes`}>
      {/* Progreso visual */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-2">
            {isComplete ? (
              <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
            ) : (
              <Camera className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            )}
            <span className="text-xs md:text-sm font-medium text-gray-300">Fotos subidas</span>
          </div>

          <Chip
            size="sm"
            variant="flat"
            color={isComplete ? 'success' : imageCount > 0 ? 'primary' : 'default'}
            className={`
              ${
                isComplete
                  ? 'bg-green-500/20 text-green-400'
                  : imageCount > 0
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-700 text-gray-400'
              }
            `}>
            {imageCount}/{maxImages}
          </Chip>
        </div>

        <Progress
          size="sm"
          value={percentage}
          color={isComplete ? 'success' : imageCount > 0 ? 'primary' : 'default'}
          className="w-full h-1.5"
          aria-label={`Progreso de subida de fotos: ${imageCount} de ${maxImages} imágenes subidas`}
          aria-valuetext={`${percentage}% completado. ${imageCount} de ${maxImages} fotos subidas`}
          classNames={{
            track: 'bg-gray-700 h-1.5',
            indicator: isComplete ? 'bg-green-500' : imageCount > 0 ? 'bg-primary-500' : 'bg-gray-600'
          }}
        />
      </div>

      {/* Estado y mensajes */}
      <div className="text-center px-2" role="status" aria-live="polite">
        {isComplete ? (
          <p className="text-green-400 text-xs md:text-sm font-medium">¡Perfil completo!</p>
        ) : imageCount > 0 ? (
          <p className="text-gray-400 text-xs">Agrega {maxImages - imageCount} más para completar</p>
        ) : (
          <p className="text-gray-500 text-xs">Sube tu primera foto</p>
        )}
      </div>
    </div>
  )
})

ImageProgress.displayName = 'ImageProgress'

export default ImageProgress
