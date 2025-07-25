/**
 * COMPONENTE CROPMODAL
 *
 * Modal de edición de imágenes con react-easy-crop
 * Tema oscuro consistente con otros modales del proyecto
 */

import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Slider, Chip, Divider, Spinner } from '@heroui/react'
import { RotateCw, ZoomIn, ZoomOut, Square, Smartphone, Save, X, RotateCcw, Edit3 } from 'lucide-react'
import { createCroppedImage } from '../utils'

const CropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCrop,
  initialAspectRatio = 3 / 4, // Retrato por defecto
  title = 'Ajustar imagen',
  showAspectRatioControls = false, // Oculto por defecto
  showZoomControls = true,
  showRotationControls = true,
  minZoom = 1,
  maxZoom = 3,
  outputFormat = 'image/jpeg',
  outputQuality = 0.9
}) => {
  // Estados del cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio)
  const [isProcessing, setIsProcessing] = useState(false)

  // Presets de aspect ratio - solo retrato para perfiles
  const aspectRatioPresets = [
    { label: 'Retrato Estándar', value: 3 / 4, icon: Smartphone },
    { label: 'Retrato Alto', value: 2 / 3, icon: Smartphone },
    { label: 'Cuadrado', value: 1, icon: Square }
  ]

  // Reset estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setAspectRatio(initialAspectRatio)
      setCroppedAreaPixels(null)
      setIsProcessing(false)
    }
  }, [isOpen, initialAspectRatio])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApplyCrop = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return

    setIsProcessing(true)
    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels, rotation, outputFormat, outputQuality)

      onApplyCrop?.(croppedBlob)
      onClose()
    } catch (error) {
      console.error('Error al recortar imagen:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [croppedAreaPixels, imageSrc, rotation, outputFormat, outputQuality, onApplyCrop, onClose])

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  const handleZoomChange = value => {
    setZoom(Array.isArray(value) ? value[0] : value)
  }

  const handleRotationChange = degrees => {
    setRotation(prev => (prev + degrees) % 360)
  }

  const handleAspectRatioChange = newRatio => {
    setAspectRatio(newRatio)
  }

  if (!imageSrc) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      placement="center"
      backdrop="blur"
      isDismissable={!isProcessing}
      isKeyboardDismissDisabled={isProcessing}
      scrollBehavior="inside"
      classNames={{
        wrapper: 'z-[1000] p-0 md:p-4',
        backdrop: 'bg-black/80',
        base: 'bg-gray-900 border border-gray-700 h-full w-full md:h-auto md:w-auto md:max-h-[95vh] md:min-w-[800px] md:rounded-lg',
        header: 'border-b border-gray-700 bg-gray-900/95 p-1 md:p-4',
        body: 'bg-gray-900 p-0 overflow-auto md:overflow-hidden',
        footer: 'border-t border-gray-700 bg-gray-900/95 p-1 md:p-4'
      }}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-lg md:text-2xl p-1.5 md:p-2 bg-primary-500/20 rounded-lg">
                  <Edit3 className="w-4 h-4 md:w-6 md:h-6 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-100 truncate">{title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 font-normal">Ajusta encuadre • Retrato</p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-0">
              {/* Área del cropper - Más espacio para la imagen */}
              <div
                className="relative bg-black"
                style={{
                  height: 'calc(100vh - 220px)',
                  minHeight: '300px',
                  maxHeight: '500px'
                }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={true}
                  style={{
                    containerStyle: {
                      background: '#000000'
                    },
                    cropAreaStyle: {
                      border: '2px solid #3b82f6',
                      borderRadius: '8px'
                    }
                  }}
                />

              </div>

              {/* Controles compactos */}
              <div className="p-1 md:p-6 space-y-1 md:space-y-4">
                {/* Aspect Ratio Controls */}
                {showAspectRatioControls && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300">Formato</h4>
                    <div className="flex gap-2 flex-wrap">
                      {aspectRatioPresets.map(preset => {
                        const IconComponent = preset.icon
                        const isActive = aspectRatio === preset.value

                        return (
                          <Button
                            key={preset.label}
                            size="sm"
                            variant={isActive ? 'solid' : 'bordered'}
                            color={isActive ? 'primary' : 'default'}
                            startContent={<IconComponent className="w-4 h-4" />}
                            onPress={() => handleAspectRatioChange(preset.value)}
                            disabled={isProcessing}
                            className={`
                              ${
                                isActive
                                  ? 'bg-primary-500 text-white border-primary-500'
                                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                              }
                            `}>
                            {preset.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Divider className="bg-gray-700" />

                {/* Zoom Controls - Compacto */}
                {showZoomControls && (
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-300">Zoom</h4>
                      <Chip size="sm" variant="flat" className="bg-gray-800 text-gray-300 text-xs">
                        {Math.round(zoom * 100)}%
                      </Chip>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        onPress={() => setZoom(Math.max(minZoom, zoom - 0.1))}
                        disabled={zoom <= minZoom || isProcessing}
                        className="min-w-8 w-8 h-8">
                        <ZoomOut className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>

                      <Slider
                        size="sm"
                        step={0.1}
                        minValue={minZoom}
                        maxValue={maxZoom}
                        value={zoom}
                        onChange={handleZoomChange}
                        disabled={isProcessing}
                        className="flex-1"
                        aria-label="Control de zoom de la imagen"
                        classNames={{
                          track: 'bg-gray-700',
                          filler: 'bg-primary-500',
                          thumb: 'bg-primary-500 border-2 border-white shadow-lg'
                        }}
                      />

                      <Button
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        onPress={() => setZoom(Math.min(maxZoom, zoom + 0.1))}
                        disabled={zoom >= maxZoom || isProcessing}
                        className="min-w-8 w-8 h-8">
                        <ZoomIn className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rotation Controls - Compacto */}
                {showRotationControls && (
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-300">Rotación</h4>
                      <Chip size="sm" variant="flat" className="bg-gray-800 text-gray-300 text-xs">
                        {rotation}°
                      </Chip>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 justify-center flex-wrap">
                      <Button
                        size="sm"
                        variant="bordered"
                        startContent={<RotateCcw className="w-3 h-3 md:w-4 md:h-4" />}
                        onPress={() => handleRotationChange(-90)}
                        disabled={isProcessing}
                        className="text-xs md:text-sm">
                        -90°
                      </Button>

                      <Button
                        size="sm"
                        variant="bordered"
                        startContent={<RotateCw className="w-3 h-3 md:w-4 md:h-4" />}
                        onPress={() => handleRotationChange(90)}
                        disabled={isProcessing}
                        className="text-xs md:text-sm">
                        +90°
                      </Button>

                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={() => setRotation(0)}
                        disabled={rotation === 0 || isProcessing}
                        className="text-xs md:text-sm">
                        Restablecer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="flex-col gap-3 md:flex-row md:justify-between">
              <Button
                variant="bordered"
                onPress={handleClose}
                disabled={isProcessing}
                className="w-full md:w-auto"
                startContent={<X className="w-4 h-4" />}>
                Cancelar
              </Button>

              <Button
                color="primary"
                onPress={handleApplyCrop}
                disabled={!croppedAreaPixels || isProcessing}
                isLoading={isProcessing}
                startContent={!isProcessing && <Save className="w-4 h-4" />}
                className="w-full md:w-auto">
                {isProcessing ? 'Procesando...' : 'Aplicar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default CropModal
