import { useState } from 'react'
import {
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Textarea,
  Slider,
  Divider
} from '@heroui/react'
import { useCategoryInterests } from '@hooks/useCategoryInterests'
import useUserAttributes from '@hooks/useUserAttributes.js'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'

const StepPreferences = ({ formData, errors, updateFormData, updateErrors }) => {
  const { categoryOptions, loading: categoriesLoading, error: categoriesError } = useCategoryInterests()
  const { religionOptions, sexualRoleOptions, relationshipTypeOptions, loading: attributesLoading } = useUserAttributes()

  // Estado para el modal
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null)
  const [selectedCategoryCard, setSelectedCategoryCard] = useState(formData.categoryInterest || null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Manejador de cambio con limpieza de errores
  const handleInputChange = (field, value) => {
    updateFormData(field, value)

    // Limpiar error del campo si existe
    if (errors[field]) {
      updateErrors({ ...errors, [field]: null })
    }
  }

  // Función helper para validar keys de Select
  const getValidSelectedKeys = (value, collection) => {
    if (!value) return []
    const exists = collection.some(item => item.key === value)
    return exists ? [value] : []
  }

  // Manejador para seleccionar categoría desde las cards
  const handleCategoryCardSelect = categoryKey => {
    setSelectedCategoryCard(categoryKey)
    handleInputChange('categoryInterest', categoryKey)

    // Limpiar campos específicos cuando cambia la categoría
    if (categoryKey !== 'SPIRIT') {
      handleInputChange('religionId', '')
      handleInputChange('church', '')
      handleInputChange('spiritualMoments', '')
      handleInputChange('spiritualPractices', '')
    }

    if (categoryKey !== 'ROUSE') {
      handleInputChange('sexualRoleId', '')
      handleInputChange('relationshipTypeId', '')
    }
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

  // Verificar si la categoría seleccionada es SPIRIT
  const isSpiritCategory = () => {
    return selectedCategoryCard === 'SPIRIT' || formData.categoryInterest === 'SPIRIT'
  }

  // Verificar si la categoría seleccionada es ROUSE
  const isRoueCategory = () => {
    return selectedCategoryCard === 'ROUSE' || formData.categoryInterest === 'ROUSE'
  }

  if (categoriesLoading || attributesLoading) {
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
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-200">¿Qué tipo de conexiones buscas?</h2>
        <p className="text-gray-400 mt-2">Elige la categoría y configura tus preferencias</p>
      </div>

      {/* SECCIÓN DE CATEGORÍAS DE INTERÉS */}
      <section className="space-y-4">
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
      </section>

      {/* CAMPOS ESPECÍFICOS PARA SPIRIT */}
      {isSpiritCategory() && (
        <section className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200">Información espiritual</h3>
            <p className="text-gray-400 mt-1">Comparte detalles sobre tu fe y vida espiritual</p>
          </div>

          {/* Religión */}
          <Select
            variant="underlined"
            aria-label="Religión"
            placeholder="Selecciona tu religión"
            isRequired
            selectedKeys={getValidSelectedKeys(formData.religionId, religionOptions)}
            onSelectionChange={keys => handleInputChange('religionId', Array.from(keys)[0])}
            isInvalid={!!errors.religionId}
            errorMessage={errors.religionId}
            data-invalid={!!errors.religionId}
            startContent={<span className="material-symbols-outlined">church</span>}
            renderValue={items => {
              return items.map(item => {
                const option = religionOptions.find(opt => opt.key === item.key)
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <AttributeDetailRenderer detail={option?.detail} size="sm" />
                    <span>{option?.label}</span>
                  </div>
                )
              })
            }}>
            {religionOptions.map(option => (
              <SelectItem
                key={option.key}
                value={option.key}
                textValue={option.label}
                classNames={{
                  base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                }}>
                <div className="flex items-center gap-3">
                  <AttributeDetailRenderer detail={option.detail} size="sm" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </Select>

          {/* Iglesia */}
          <Input
            variant="underlined"
            aria-label="Iglesia"
            placeholder="Nombre de tu iglesia o congregación (opcional)"
            value={formData.church || ''}
            onChange={e => handleInputChange('church', e.target.value)}
            isInvalid={!!errors.church}
            errorMessage={errors.church}
            startContent={<span className="material-symbols-outlined">account_balance</span>}
          />

          {/* Momentos espirituales */}
          <Textarea
            variant="bordered"
            label="Momentos espirituales significativos (opcional)"
            placeholder="Comparte experiencias especiales en tu vida espiritual..."
            value={formData.spiritualMoments || ''}
            onChange={e => handleInputChange('spiritualMoments', e.target.value)}
            isInvalid={!!errors.spiritualMoments}
            errorMessage={errors.spiritualMoments}
            minRows={2}
            maxRows={4}
            maxLength={300}
            description={`${(formData.spiritualMoments || '').length}/300 caracteres`}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/30'
            }}
          />

          {/* Prácticas espirituales */}
          <Textarea
            variant="bordered"
            label="Prácticas espirituales (opcional)"
            placeholder="Describe tus prácticas de fe (oración, lectura bíblica, servicio, etc.)"
            value={formData.spiritualPractices || ''}
            onChange={e => handleInputChange('spiritualPractices', e.target.value)}
            isInvalid={!!errors.spiritualPractices}
            errorMessage={errors.spiritualPractices}
            minRows={2}
            maxRows={4}
            maxLength={300}
            description={`${(formData.spiritualPractices || '').length}/300 caracteres`}
            classNames={{
              input: 'text-gray-200',
              inputWrapper: 'bg-gray-800/30'
            }}
          />
        </section>
      )}

      {/* CAMPOS ESPECÍFICOS PARA ROUSE */}
      {isRoueCategory() && (
        <section className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200">Preferencias personales</h3>
            <p className="text-gray-400 mt-1">Información para mejores conexiones en la comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rol sexual */}
            <Select
              variant="underlined"
              aria-label="Rol sexual"
              placeholder="Selecciona tu preferencia"
              isRequired
              selectedKeys={getValidSelectedKeys(formData.sexualRoleId, sexualRoleOptions)}
              onSelectionChange={keys => handleInputChange('sexualRoleId', Array.from(keys)[0])}
              isInvalid={!!errors.sexualRoleId}
              errorMessage={errors.sexualRoleId}
              data-invalid={!!errors.sexualRoleId}
              renderValue={items => {
                return items.map(item => {
                  const option = sexualRoleOptions.find(opt => opt.key === item.key)
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <AttributeDetailRenderer detail={option?.detail} size="sm" />
                      <span>{option?.label}</span>
                    </div>
                  )
                })
              }}>
              {sexualRoleOptions.map(option => (
                <SelectItem
                  key={option.key}
                  value={option.key}
                  textValue={option.label}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}>
                  <div className="flex items-center gap-3">
                    <AttributeDetailRenderer detail={option.detail} size="sm" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {/* Tipo de relación */}
            <Select
              variant="underlined"
              aria-label="Tipo de relación"
              placeholder="Tipo de relación que buscas"
              isRequired
              selectedKeys={getValidSelectedKeys(formData.relationshipTypeId, relationshipTypeOptions)}
              onSelectionChange={keys => handleInputChange('relationshipTypeId', Array.from(keys)[0])}
              isInvalid={!!errors.relationshipTypeId}
              errorMessage={errors.relationshipTypeId}
              data-invalid={!!errors.relationshipTypeId}
              renderValue={items => {
                return items.map(item => {
                  const option = relationshipTypeOptions.find(opt => opt.key === item.key)
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <AttributeDetailRenderer detail={option?.detail} size="sm" />
                      <span>{option?.label}</span>
                    </div>
                  )
                })
              }}>
              {relationshipTypeOptions.map(option => (
                <SelectItem
                  key={option.key}
                  value={option.key}
                  textValue={option.label}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}>
                  <div className="flex items-center gap-3">
                    <AttributeDetailRenderer detail={option.detail} size="sm" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>
        </section>
      )}

      {/* PREFERENCIAS DE EDAD */}
      <section className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-gray-300 text-sm block">
              Rango de edad:{' '}
              <span className="text-primary-400 font-semibold">
                {formData.agePreferenceMin || 18} - {formData.agePreferenceMax || 50} años
              </span>
            </label>
            <Slider
              label="Rango de edad que te interesa para hacer conexiones"
              color="primary"
              minValue={18}
              maxValue={80}
              value={[formData.agePreferenceMin || 18, formData.agePreferenceMax || 50]}
              onChange={value => {
                handleInputChange('agePreferenceMin', value[0])
                handleInputChange('agePreferenceMax', value[1])
              }}
              className="max-w-full"
              showTooltip={true}
              formatOptions={{
                style: 'unit',
                unit: 'year',
                unitDisplay: 'short'
              }}
              aria-label="Rango de edad que te interesa para hacer conexiones"
              marks={[
                { value: 18, label: '18' },
                { value: 30, label: '30 años' },
                { value: 50, label: '50 años' },
                { value: 65, label: '65 años' },
                { value: 80, label: '80' }
              ]}
            />
          </div>
        </div>

        {(errors.agePreferenceMin || errors.agePreferenceMax) && (
          <div className="text-red-400 text-sm">
            {errors.agePreferenceMin && <p>{errors.agePreferenceMin}</p>}
            {errors.agePreferenceMax && <p>{errors.agePreferenceMax}</p>}
          </div>
        )}
      </section>

      <Divider />

      {/* PREFERENCIAS DE UBICACIÓN */}
      <section className="space-y-4">
        <div className="space-y-3">
          <label className="text-gray-300 text-sm block">
            Radio de búsqueda: <span className="text-primary-400 font-semibold">{formData.locationPreferenceRadius || 50} km</span>
          </label>
          <Slider
            label="Seleccionar radio de búsqueda"
            step={10}
            color="primary"
            minValue={5}
            maxValue={200}
            value={formData.locationPreferenceRadius || 50}
            onChange={value => handleInputChange('locationPreferenceRadius', value)}
            className="max-w-full"
            showTooltip={true}
            aria-label="Radio de búsqueda en kilómetros"
            marks={[
              { value: 5, label: '5 km' },
              { value: 50, label: '50 km' },
              { value: 100, label: '100 km' },
              { value: 150, label: '150 km' },
              { value: 200, label: '200 km' }
            ]}
          />
        </div>

        {errors.locationPreferenceRadius && <p className="text-red-400 text-sm">{errors.locationPreferenceRadius}</p>}
      </section>

      {/* Información sobre el paso */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <span className="text-blue-400">💡</span>
          <div className="text-sm">
            <h4 className="text-blue-400 font-medium mb-2">¿Por qué estos datos?</h4>
            <p className="text-blue-300/80">
              {isSpiritCategory()
                ? 'Esta información nos ayuda a conectarte con personas que comparten tu fe, valores espirituales y están en tu rango de edad y ubicación preferidos.'
                : isRoueCategory()
                  ? 'Esta información nos ayuda a conectarte con personas compatibles dentro de la comunidad LGBTI+ en tu área y rango de edad.'
                  : 'Esta información nos ayuda a conectarte con personas que buscan el mismo tipo de relación, comparten valores similares y están en tu zona de preferencia.'}
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
    </div>
  )
}

export default StepPreferences
