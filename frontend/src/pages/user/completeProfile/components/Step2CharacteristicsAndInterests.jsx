import { useState } from 'react'
import { Select, SelectItem, Slider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react'
import { useUserAttributes } from '@hooks/useUserAttributes'
import { useCategoryInterests } from '@hooks/useCategoryInterests'

const Step2CharacteristicsAndInterests = ({ formData, errors, updateFormData, updateErrors }) => {
  const { genderOptions, eyeColorOptions, hairColorOptions, bodyTypeOptions, loading: attributesLoading } = useUserAttributes()
  const { categoryOptions, loading: categoriesLoading, error: categoriesError } = useCategoryInterests()

  // Estado para el modal
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null)
  const [selectedCategoryCard, setSelectedCategoryCard] = useState(formData.categoryInterest || null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Mapeo de colores para ojos basado en códigos del backend
  const eyeColorMap = {
    BROWN: '#8B4513',
    BLUE: '#4169E1',
    GREEN: '#228B22',
    GRAY: '#808080',
    BLACK: '#000000',
    HAZEL: '#A0826D'
  }

  // Mapeo de colores para cabello basado en códigos del backend
  const hairColorMap = {
    BLACK: '#000000',
    BROWN: '#964B00',
    BLONDE: '#F0E68C',
    RED: '#B22222',
    GRAY: '#808080',
    WHITE: '#FFFFFF',
    OTHER: 'linear-gradient(45deg, #FF1493, #00CED1, #FFD700)'
  }

  // Iconos para género basado en códigos del backend
  const genderIcons = {
    MALE: '♂️',
    FEMALE: '♀️',
    NON_BINARY: '⚧️',
    OTHER: '🌈',
    PREFER_NOT_TO_SAY: '🤐'
  }

  // Iconos para tipo de cuerpo basado en códigos del backend
  const bodyTypeIcons = {
    SLIM: '🏃',
    ATHLETIC: '💪',
    AVERAGE: '🚶',
    CURVY: '💃',
    PLUS_SIZE: '🤗'
  }

  // Función helper para validar keys usando el id del backend
  const getValidSelectedKeys = (value, collection) => {
    if (!value) return []
    const exists = collection.some(item => item.key === value.toString())
    return exists ? [value.toString()] : []
  }

  // Manejador de cambio con limpieza de errores
  const handleInputChange = (field, value) => {
    updateFormData(field, value)

    // Limpiar error del campo si existe
    if (errors[field]) {
      updateErrors({ ...errors, [field]: null })
    }
  }

  // Manejador para seleccionar categoría desde las cards
  const handleCategoryCardSelect = categoryKey => {
    setSelectedCategoryCard(categoryKey)
    handleInputChange('categoryInterest', categoryKey)
  }

  // Manejador del modal de categoría
  const handleCategoryInfo = categoryKey => {
    const category = categoryOptions.find(cat => cat.key === categoryKey)
    if (category) {
      setSelectedCategoryForModal(category)
      onOpen()
    }
  }

  // Manejador de selección de categoría después del modal
  const handleCategorySelectFromModal = () => {
    if (selectedCategoryForModal) {
      handleCategoryCardSelect(selectedCategoryForModal.key)
      onClose()
    }
  }

  if (attributesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Cargando opciones...</p>
        </div>
      </div>
    )
  }

  if (categoriesError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error al cargar categorías</p>
          <Button variant="bordered" size="sm" onPress={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h4 className="text-xl font-bold text-gray-200">¿Qué tipo de conexiones buscas?</h4>
        <p className="text-gray-400 mt-2">Elige la categoría que mejor represente lo que estás buscando</p>
      </div>

      {/* SECCIÓN DE CATEGORÍAS DE INTERÉS */}
      <div className="space-y-6">
        {/* Cards de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categoryOptions.slice(0, 3).map(category => (
            <div
              key={category.key}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] rounded-xl ${
                selectedCategoryCard === category.key
                  ? 'bg-gradient-to-br from-primary-600/30 to-primary-800/30 border-2 border-primary-400 shadow-lg shadow-primary-500/25'
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
              }`}
              onClick={() => handleCategoryCardSelect(category.key)}>
              <div className="text-center space-y-3 p-6">
                <div className="text-4xl">{category.icon}</div>
                <div className="space-y-1">
                  <h5 className="text-lg font-semibold text-white">{category.label}</h5>
                  <p className="text-sm text-gray-300 leading-relaxed">{category.shortDescription}</p>
                </div>

                <Button
                  type="button"
                  variant="bordered"
                  radius="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onPress={() => handleCategoryInfo(category.key)}>
                  Ver detalles
                </Button>

                {selectedCategoryCard === category.key && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje informativo */}
        {selectedCategoryCard && (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-primary-400">✨</span>
              <div className="text-sm">
                <p className="text-primary-300">Excelente elección. Puedes cambiar tu categoría más tarde desde tu perfil.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error de categoría */}
        {errors.categoryInterest && <p className="text-red-400 text-sm text-center">{errors.categoryInterest}</p>}
      </div>

      {/* SECCIÓN DE CARACTERÍSTICAS PERSONALES */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-300 text-center">Características personales</h4>

        {/* Género - Selector visual */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Género *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {genderOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleInputChange('genderId', parseInt(option.key))}
                aria-label={`Seleccionar género ${option.label}`}
                className={`
                  p-4 rounded-lg border-2 transition-all text-center
                  ${formData.genderId === parseInt(option.key) ? 'border-primary-500 bg-primary-500/20' : 'border-gray-600 hover:border-gray-500'}
                `}>
                <div className="text-2xl mb-1">{genderIcons[option.value] || '👤'}</div>
                <div className="text-sm">{option.label}</div>
              </button>
            ))}
          </div>
          {errors.genderId && <p className="text-red-400 text-sm">{errors.genderId}</p>}
        </div>

        {/* Estatura con visualización */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">Estatura</label>
            <div className="flex items-center gap-2">
              <div className="text-3xl">📏</div>
              <span className="text-2xl font-semibold text-primary-400">{formData.height} cm</span>
            </div>
          </div>
          <Slider
            size="lg"
            step={1}
            color="primary"
            minValue={140}
            maxValue={220}
            value={formData.height}
            onChange={value => handleInputChange('height', value)}
            aria-label="Seleccionar estatura en centímetros"
            classNames={{
              track: 'bg-gradient-to-r from-blue-500 to-primary-500',
              filler: 'bg-gradient-to-r from-primary-500 to-secondary-500'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>140 cm</span>
            <span>220 cm</span>
          </div>
        </div>

        {/* Tipo de cuerpo - Selector visual */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Tipo de cuerpo</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {bodyTypeOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleInputChange('bodyTypeId', parseInt(option.key))}
                aria-label={`Seleccionar tipo de cuerpo ${option.label}`}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${formData.bodyTypeId === parseInt(option.key) ? 'border-primary-500 bg-primary-500/20' : 'border-gray-600 hover:border-gray-500'}
                `}>
                <div className="text-2xl mb-1">{bodyTypeIcons[option.value] || '🚶'}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color de ojos - Selector visual */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Color de ojos</label>
          <div className="flex flex-wrap gap-3">
            {eyeColorOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleInputChange('eyeColorId', parseInt(option.key))}
                aria-label={`Seleccionar color de ojos ${option.label}`}
                className={`
                  relative group transition-all
                  ${formData.eyeColorId === parseInt(option.key) ? 'scale-110' : ''}
                `}>
                <div
                  className={`
                    w-12 h-12 rounded-full border-3 transition-all
                    ${formData.eyeColorId === parseInt(option.key) ? 'border-primary-500 shadow-lg' : 'border-gray-600 hover:border-gray-500'}
                  `}
                  style={{ backgroundColor: eyeColorMap[option.value] || '#808080' }}
                />
                <span
                  className="text-xs text-gray-400 absolute -bottom-5 left-1/2 transform -translate-x-1/2
                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {option.label}
                </span>
                {formData.eyeColorId === parseInt(option.key) && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full
                    flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color de cabello - Selector visual */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">Color de cabello</label>
          <div className="flex flex-wrap gap-3">
            {hairColorOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleInputChange('hairColorId', parseInt(option.key))}
                aria-label={`Seleccionar color de cabello ${option.label}`}
                className={`
                  relative group transition-all
                  ${formData.hairColorId === parseInt(option.key) ? 'scale-110' : ''}
                `}>
                <div
                  className={`
                    w-12 h-12 rounded-lg border-3 transition-all
                    ${formData.hairColorId === parseInt(option.key) ? 'border-primary-500 shadow-lg' : 'border-gray-600 hover:border-gray-500'}
                  `}
                  style={{
                    background: hairColorMap[option.value] || '#808080',
                    backgroundSize: 'cover'
                  }}
                />
                <span
                  className="text-xs text-gray-400 absolute -bottom-5 left-1/2 transform -translate-x-1/2
                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {option.label}
                </span>
                {formData.hairColorId === parseInt(option.key) && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full
                    flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información sobre características */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <span className="text-blue-400">💡</span>
          <div className="text-sm">
            <h4 className="text-blue-400 font-medium mb-2">¿Por qué estas características?</h4>
            <p className="text-blue-300/80">
              Esta información nos ayuda a mostrarte personas compatibles y mejorar tus matches. Toda la información es opcional excepto el
              género.
            </p>
          </div>
        </div>
      </div>

      {/* Modal informativo de categorías */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-gray-900 text-white',
          header: 'border-b border-gray-700',
          body: 'py-6',
          footer: 'border-t border-gray-700'
        }}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-3 bg-primary-500/20 rounded-xl">{selectedCategoryForModal?.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedCategoryForModal?.label}</h3>
                    <p className="text-sm text-gray-400 font-normal mt-1">{selectedCategoryForModal?.shortDescription}</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-4">
                    <h4 className="font-semibold text-primary-400 mb-3 flex items-center gap-2">
                      <span>🎯</span> ¿Qué puedes encontrar?
                    </h4>
                    <p className="text-gray-300 leading-relaxed">{selectedCategoryForModal?.fullDescription}</p>
                  </div>

                  {selectedCategoryForModal?.features && (
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="font-semibold text-primary-400 mb-3 flex items-center gap-2">
                        <span>✨</span> Características principales
                      </h4>
                      <div className="space-y-3">
                        {selectedCategoryForModal.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 bg-gray-700/30 rounded-lg p-3">
                            <span className="text-primary-400 mt-0.5">•</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCategoryForModal?.targetAudience && (
                    <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <span>👥</span> Ideal para
                      </h4>
                      <p className="text-blue-100 leading-relaxed">{selectedCategoryForModal.targetAudience}</p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Regresar
                </Button>
                <Button
                  color="primary"
                  onPress={handleCategorySelectFromModal}
                  startContent={<span>✓</span>}
                  className="bg-gradient-to-r from-primary-600 to-primary-700">
                  Seleccionar {selectedCategoryForModal?.label}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Step2CharacteristicsAndInterests
