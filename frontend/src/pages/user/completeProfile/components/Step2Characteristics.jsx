import { useState } from 'react'
import {
  Select,
  SelectItem,
  Slider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Tooltip,
  Badge
} from '@heroui/react'
import { useUserAttributes } from '@hooks/useUserAttributes'
import { useCategoryInterests } from '@hooks/useCategoryInterests'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'

const Step2Characteristics = ({ formData, errors, updateFormData, updateErrors }) => {
  const { genderId, categoryInterest, height, eyeColorId, hairColorId, bodyTypeId } = formData
  const {
    genderOptions,
    eyeColorOptions,
    hairColorOptions,
    bodyTypeOptions,
    isColor,
    loading: attributesLoading,
    createAttribute
  } = useUserAttributes()
  const { categoryOptions, loading: categoriesLoading, error: categoriesError } = useCategoryInterests()

  // Estado para el modal
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null)
  const [selectedCategoryCard, setSelectedCategoryCard] = useState(categoryInterest || null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Estado para el modal de agregar atributo
  const [addAttributeModal, setAddAttributeModal] = useState({
    isOpen: false,
    type: null,
    isLoading: false,
    error: null, // Nuevo campo para errores
    data: {
      name: '',
      detail: '#000000'
    }
  })

  // Estado para la estatura input
  const [heightInput, setHeightInput] = useState(height?.toString() || '')

  // Manejador de cambio con limpieza de errores
  const handleInputChange = (field, value) => {
    updateFormData(field, value)

    // Limpiar error del campo si existe
    if (errors[field]) {
      updateErrors({ ...errors, [field]: null })
    }
  }

  // Manejador específico para la estatura desde input
  const handleHeightInputChange = value => {
    setHeightInput(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 140 && numValue <= 220) {
      handleInputChange('height', numValue)
    }
  }

  // Manejador específico para la estatura desde slider
  const handleHeightSliderChange = value => {
    setHeightInput(value.toString())
    handleInputChange('height', value)
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

  // Manejadores para el modal de agregar atributo
  const openAddAttributeModal = type => {
    setAddAttributeModal({
      isOpen: true,
      type,
      isLoading: false,
      error: null, // Limpiar errores previos
      data: {
        name: '',
        detail: type === 'eye' || type === 'hair' ? '#000000' : ''
      }
    })
  }

  const closeAddAttributeModal = () => {
    setAddAttributeModal({
      isOpen: false,
      type: null,
      isLoading: false,
      error: null, // Limpiar errores
      data: {
        name: '',
        detail: '#000000'
      }
    })
  }

  const handleAddAttributeInputChange = (field, value) => {
    setAddAttributeModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }))
  }

  const handleSubmitNewAttribute = async () => {
    const { type, data } = addAttributeModal

    // Limpiar errores previos
    setAddAttributeModal(prev => ({ ...prev, error: null }))

    // Validaciones básicas en el frontend
    if (!data.name.trim()) {
      setAddAttributeModal(prev => ({
        ...prev,
        error: 'El nombre es requerido'
      }))
      return
    }

    if (data.name.trim().length < 2) {
      setAddAttributeModal(prev => ({
        ...prev,
        error: 'El nombre debe tener al menos 2 caracteres'
      }))
      return
    }

    if (!data.detail.trim()) {
      setAddAttributeModal(prev => ({
        ...prev,
        error: 'El color es requerido'
      }))
      return
    }

    setAddAttributeModal(prev => ({ ...prev, isLoading: true }))

    try {
      // Determinar el tipo de atributo para el API
      const attributeType = type === 'eye' ? 'EYE_COLOR' : 'HAIR_COLOR'

      // Crear el atributo usando el hook
      const newAttribute = await createAttribute(attributeType, {
        name: data.name.trim(),
        detail: data.detail.trim()
      })

      console.log('✅ Atributo creado exitosamente:', newAttribute)

      // Seleccionar automáticamente el nuevo atributo temporal
      const fieldName = type === 'eye' ? 'eyeColorId' : 'hairColorId'
      handleInputChange(fieldName, newAttribute.id)

      // Cerrar modal
      closeAddAttributeModal()

      // Mostrar mensaje de éxito (opcional: podrías usar un toast aquí)
      console.log('🎉 Atributo agregado temporalmente y seleccionado')
    } catch (error) {
      console.error('❌ Error creando atributo:', error)

      // Mostrar error específico en el modal
      setAddAttributeModal(prev => ({
        ...prev,
        error: error.message || 'Error inesperado al crear el atributo'
      }))
    } finally {
      setAddAttributeModal(prev => ({ ...prev, isLoading: false }))
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h4 className="text-xl font-bold text-gray-200">¿Qué tipo de conexiones buscas?</h4>
        <p className="text-gray-400 mt-2">Elige la categoría que mejor represente lo que estás buscando</p>
      </div>

      {/* SECCIÓN DE CATEGORÍAS DE INTERÉS */}
      <div className="space-y-4">
        {/* Cards de categorías */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {categoryOptions.slice(0, 3).map(category => (
            <div
              key={category.key}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] rounded-xl ${
                selectedCategoryCard === category.key
                  ? 'bg-gradient-to-br from-primary-600/30 to-primary-800/30 border-2 border-primary-400 shadow-lg shadow-primary-500/25'
                  : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
              }`}
              onClick={() => handleCategoryCardSelect(category.key)}>
              <div className="text-center space-y-4 p-4">
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
      <div className="space-y-4">
        {/* Género */}
        <Select
          aria-label="Seleccionar género"
          placeholder="Selecciona tu género"
          selectedKeys={genderId ? [genderId] : ['']}
          onSelectionChange={keys => {
            const selectedKey = Array.from(keys)[0]
            updateFormData('genderId', selectedKey)
          }}
          isInvalid={!!errors.genderId}
          errorMessage={errors.genderId}
          variant="underlined"
          labelPlacement="outside"
          renderValue={items => {
            return items.map(item => {
              const option = genderOptions.find(opt => opt.key === item.key)
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <AttributeDetailRenderer detail={option?.detail} size="md" />
                  <span>{option?.label}</span>
                </div>
              )
            })
          }}>
          {genderOptions.map(option => (
            <SelectItem
              key={option.key}
              value={option.key}
              textValue={option.label}
              classNames={{
                base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
              }}>
              <div className="flex items-center gap-3">
                <AttributeDetailRenderer detail={option.detail} size="md" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </Select>

        {/* Tipo de cuerpo*/}
        <Select
          variant="underlined"
          aria-label="Seleccionar tipo de cuerpo"
          placeholder="Selecciona tu tipo de cuerpo"
          selectedKeys={bodyTypeId ? [bodyTypeId.toString()] : []}
          onSelectionChange={keys => {
            const selectedKey = Array.from(keys)[0]
            if (selectedKey) {
              handleInputChange('bodyTypeId', parseInt(selectedKey))
            }
          }}
          labelPlacement="outside"
          renderValue={items => {
            return items.map(item => {
              const option = bodyTypeOptions.find(opt => opt.key === item.key)
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <AttributeDetailRenderer detail={option?.detail} size="md" />
                  <span>{option?.label}</span>
                </div>
              )
            })
          }}>
          {bodyTypeOptions.map(option => (
            <SelectItem
              key={option.key}
              value={option.key}
              textValue={option.label}
              classNames={{
                base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
              }}>
              <div className="flex items-center gap-3">
                <AttributeDetailRenderer detail={option.detail} size="lg" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </Select>

        {/* Estatura con input y slider */}
        <div className="space-y-4">
          {/* Input de texto para la estatura */}
          <Input
            type="number"
            placeholder="Ingresa tu estatura"
            value={heightInput}
            onChange={e => handleHeightInputChange(e.target.value)}
            min={140}
            max={220}
            variant="underlined"
            startContent={
              <div className="flex text-gray-400">
                <span className="material-symbols-outlined">straighten</span>
                <span className="ml-2">Estatura: </span>
              </div>
            }
            endContent={<span className="text-gray-500 text-sm">cm</span>}
          />

          {/* Slider para la estatura */}
          <Slider
            step={1}
            color="primary"
            minValue={120}
            maxValue={220}
            value={height}
            onChange={handleHeightSliderChange}
            aria-label="Seleccionar estatura en centímetros"
            showTooltip={true}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>140 cm</span>
            <span>220 cm</span>
          </div>
        </div>

        {/* Color de ojos */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Color de ojos</label>
          <div className="flex flex-wrap gap-2">
            {eyeColorOptions.map(option => (
              <Badge
                key={option.key}
                content={<span className="text-white text-xs">✓</span>}
                shape="circle"
                isInvisible={eyeColorId !== parseInt(option.key)}>
                <Tooltip
                  content={
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.isPending && (
                        <Badge color="warning" variant="solid" size="sm">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  }
                  placement="bottom"
                  className="capitalize"
                  color="primary">
                  <Button
                    size="sm"
                    onPress={() => handleInputChange('eyeColorId', parseInt(option.key))}
                    aria-label={`Seleccionar color de ojos ${option.label}`}
                    radius="full"
                    isIconOnly
                    color="neutral"
                    className={`
                      relative group transition-all duration-200 border-2 shadow-md
                      ${eyeColorId === parseInt(option.key) ? 'scale-110' : 'hover:scale-105'}
                      ${eyeColorId === parseInt(option.key) ? 'border-gray-300' : 'border-gray-600 hover:border-gray-500'}
                      ${option.isPending ? 'opacity-70' : ''}
                    `}
                    style={{ backgroundColor: option.detail || '#808080' }}>
                    {option.isPending && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />}
                  </Button>
                </Tooltip>
              </Badge>
            ))}

            {/* Botón para agregar nuevo color de ojos */}
            <Button
              size="sm"
              variant="bordered"
              onPress={() => openAddAttributeModal('eye')}
              radius="full"
              color="primary"
              isIconOnly
              aria-label="Agregar nuevo color de ojos"
              className="border-2 border-dashed border-gray-600 flex items-center justify-center
                hover:border-primary-500 transition-all duration-200
                hover:bg-primary-500/10 group">
              <span className="text-gray-500 group-hover:text-primary-400 text-lg pb-1">+</span>
            </Button>
          </div>
        </div>

        {/* Color de cabello */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Color de cabello</label>
          <div className="flex flex-wrap gap-2">
            {hairColorOptions.map(option => (
              <Badge
                key={option.key}
                content={<span className="text-white text-xs">✓</span>}
                shape="circle"
                isInvisible={hairColorId !== parseInt(option.key)}>
                <Tooltip
                  content={
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.isPending && (
                        <Badge color="warning" variant="solid" size="sm">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  }
                  placement="bottom"
                  className="capitalize"
                  color="primary">
                  <Button
                    size="sm"
                    onPress={() => handleInputChange('hairColorId', parseInt(option.key))}
                    aria-label={`Seleccionar color de cabello ${option.label}`}
                    radius="lg"
                    isIconOnly
                    color="neutral"
                    className={`
                      relative group transition-all duration-200 border-2 shadow-md
                      ${hairColorId === parseInt(option.key) ? 'scale-110' : 'hover:scale-105'}
                      ${hairColorId === parseInt(option.key) ? 'border-gray-300' : 'border-gray-600 hover:border-gray-500'}
                      ${option.isPending ? 'opacity-70' : ''}
                    `}
                    style={isColor(option.detail) ? { backgroundColor: option.detail } : { backgroundColor: '#374151' }}>
                    {/* Si no es color, mostrar icono */}
                    {!isColor(option.detail) && option.detail && (
                      <span
                        className="material-symbols-outlined text-white"
                        style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}>
                        {option.detail}
                      </span>
                    )}
                    {option.isPending && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />}
                  </Button>
                </Tooltip>
              </Badge>
            ))}

            {/* Botón para agregar nuevo color de cabello */}
            <Button
              size="sm"
              variant="bordered"
              onPress={() => openAddAttributeModal('hair')}
              radius="lg"
              color="primary"
              isIconOnly
              aria-label="Agregar nuevo color de cabello"
              className="border-2 border-dashed border-gray-600 flex items-center justify-center
                hover:border-primary-500 transition-all duration-200
                hover:bg-primary-500/10 group">
              <span className="text-gray-500 group-hover:text-primary-400 text-lg pb-1">+</span>
            </Button>
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
                <div className="space-y-4">
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
                      <div className="space-y-4">
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

      {/* Modal para agregar nuevo atributo */}
      <Modal
        isOpen={addAttributeModal.isOpen}
        onClose={closeAddAttributeModal}
        size="lg"
        placement="center"
        isDismissable={!addAttributeModal.isLoading}
        classNames={{
          base: 'bg-gray-900 text-white',
          header: 'border-b border-gray-700',
          body: 'py-6',
          footer: 'border-t border-gray-700'
        }}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-primary-500/20 rounded-lg">{addAttributeModal.type === 'eye' ? '👁️' : '💇'}</div>
                  <div>
                    <h3 className="text-xl font-bold">Agregar nuevo color de {addAttributeModal.type === 'eye' ? 'ojos' : 'cabello'}</h3>
                    <p className="text-sm text-gray-400 font-normal">Completa la información para crear un nuevo atributo</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                  <div className="flex gap-2">
                    <span className="text-amber-400">⏳</span>
                    <p className="text-amber-300 text-sm">
                      Los nuevos atributos requieren aprobación. Aparecerán temporalmente en tu perfil hasta ser revisados.
                    </p>
                  </div>
                </div>

                {/* Mostrar error si existe */}
                {addAttributeModal.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <span className="text-red-400">❌</span>
                      <p className="text-red-300 text-sm">{addAttributeModal.error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Vista previa del color */}
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div
                      className={`w-12 h-12 border-2 border-gray-600 shadow-lg ${
                        addAttributeModal.type === 'eye' ? 'rounded-full' : 'rounded-lg'
                      }`}
                      style={{ backgroundColor: addAttributeModal.data.detail }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Vista previa</p>
                      <p className="text-white font-medium">{addAttributeModal.data.name || 'Nuevo color'}</p>
                    </div>
                  </div>

                  {/* Nombre del atributo */}
                  <Input
                    label="Nombre"
                    placeholder={`Ej: ${addAttributeModal.type === 'eye' ? 'Verde esmeralda' : 'Castaño claro'}`}
                    value={addAttributeModal.data.name}
                    onChange={e => handleAddAttributeInputChange('name', e.target.value)}
                    variant="bordered"
                    isDisabled={addAttributeModal.isLoading}
                    classNames={{
                      input: 'text-gray-200',
                      inputWrapper: 'bg-gray-800/50 border-gray-700 hover:border-gray-600 data-[focus=true]:border-primary-500'
                    }}
                    description="Nombre descriptivo que verán los usuarios"
                  />

                  {/* Selector de color */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={addAttributeModal.data.detail}
                        onChange={e => handleAddAttributeInputChange('detail', e.target.value)}
                        disabled={addAttributeModal.isLoading}
                        className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <Input
                        placeholder="#000000"
                        value={addAttributeModal.data.detail}
                        onChange={e => handleAddAttributeInputChange('detail', e.target.value)}
                        variant="bordered"
                        isDisabled={addAttributeModal.isLoading}
                        className="flex-1"
                        classNames={{
                          input: 'text-gray-200 font-mono',
                          inputWrapper: 'bg-gray-800/50 border-gray-700 hover:border-gray-600 data-[focus=true]:border-primary-500'
                        }}
                        startContent={<span className="text-gray-500">#</span>}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Selecciona el color usando el selector o ingresa el código hexadecimal</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeAddAttributeModal} isDisabled={addAttributeModal.isLoading}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmitNewAttribute}
                  isDisabled={!addAttributeModal.data.name.trim() || !addAttributeModal.data.detail.trim()}
                  isLoading={addAttributeModal.isLoading}
                  className="bg-gradient-to-r from-primary-600 to-primary-700">
                  {addAttributeModal.isLoading ? 'Creando...' : 'Crear atributo'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Step2Characteristics
