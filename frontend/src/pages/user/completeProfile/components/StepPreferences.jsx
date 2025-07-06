import { useState, useCallback, useMemo, memo } from 'react'
import { Controller } from 'react-hook-form'
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
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'
import { Church, Building } from 'lucide-react'

const StepPreferences = ({
  control,
  errors,
  watch,
  setValue,
  clearErrors,
  categoryOptions,
  categoriesLoading,
  categoriesError,
  religionOptions,
  sexualRoleOptions,
  relationshipTypeOptions,
  attributesLoading
}) => {
  // ========================================
  // Estados locales
  // ========================================
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // ========================================
  // Datos del formulario
  // ========================================
  const formValues = watch()
  const { categoryInterest, agePreferenceMin, agePreferenceMax, locationPreferenceRadius } = formValues
  const selectedCategoryCard = categoryInterest || null

  // ========================================
  // Manejadores de formulario optimizados
  // ========================================
  const formHandlers = useMemo(
    () => ({
      handleInputChange: (field, value) => {
        setValue(field, value, { shouldValidate: true })
        if (errors[field]) {
          clearErrors(field)
        }
      }
    }),
    [setValue, clearErrors, errors]
  )

  // ========================================
  // Manejadores de categorías optimizados
  // ========================================
  const handleCategoryCardSelect = useCallback(
    categoryKey => {
      formHandlers.handleInputChange('categoryInterest', categoryKey)

      // Limpiar campos específicos cuando cambia la categoría
      if (categoryKey !== 'SPIRIT') {
        formHandlers.handleInputChange('religionId', '')
        formHandlers.handleInputChange('church', '')
        formHandlers.handleInputChange('spiritualMoments', '')
        formHandlers.handleInputChange('spiritualPractices', '')
      }

      if (categoryKey !== 'ROUSE') {
        formHandlers.handleInputChange('sexualRoleId', '')
        formHandlers.handleInputChange('relationshipTypeId', '')
      }
    },
    [formHandlers]
  )

  const handleCategoryInfo = useCallback(
    categoryKey => {
      const category = categoryOptions.find(cat => cat.key === categoryKey)
      if (category) {
        setSelectedCategoryForModal(category)
        onOpen()
      }
    },
    [categoryOptions, onOpen]
  )

  const handleCategorySelectFromModal = useCallback(() => {
    if (selectedCategoryForModal) {
      handleCategoryCardSelect(selectedCategoryForModal.key)
      onClose()
    }
  }, [selectedCategoryForModal, handleCategoryCardSelect, onClose])

  // ========================================
  // Funciones de utilidad memoizadas
  // ========================================
  const categoryUtils = useMemo(
    () => ({
      isSpiritCategory: selectedCategoryCard === 'SPIRIT' || categoryInterest === 'SPIRIT',
      isRoueCategory: selectedCategoryCard === 'ROUSE' || categoryInterest === 'ROUSE'
    }),
    [selectedCategoryCard, categoryInterest]
  )

  // ========================================
  // Renderizador de Select optimizado
  // ========================================
  const renderSelect = useCallback(
    (fieldName, options, config = {}) => {
      const { label, placeholder, isRequired = false, startContent = null, ariaLabel = label } = config

      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Select
              variant="underlined"
              label={label}
              aria-label={ariaLabel}
              placeholder={placeholder}
              isRequired={isRequired}
              selectedKeys={field.value ? [field.value.toString()] : []}
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0]
                field.onChange(selectedKey ? parseInt(selectedKey) : null)
              }}
              isInvalid={!!errors[fieldName]}
              errorMessage={errors[fieldName]?.message}
              startContent={startContent}
              renderValue={items => {
                return items.map(item => {
                  const option = options.find(opt => opt.key === item.key)
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <AttributeDetailRenderer detail={option?.detail} size="sm" />
                      <span>{option?.label}</span>
                    </div>
                  )
                })
              }}>
              {options.map(option => (
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
          )}
        />
      )
    },
    [control, errors]
  )

  // ========================================
  // Renderizador de Textarea optimizado
  // ========================================
  const renderTextarea = useCallback(
    (fieldName, config = {}) => {
      const { label, placeholder, isRequired = false, maxLength = 300, minRows = 2, maxRows = 4 } = config

      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              variant="bordered"
              label={label}
              placeholder={placeholder}
              isRequired={isRequired}
              value={field.value || ''}
              isInvalid={!!errors[fieldName]}
              errorMessage={errors[fieldName]?.message}
              minRows={minRows}
              maxRows={maxRows}
              maxLength={maxLength}
              description={`${(field.value || '').length}/${maxLength} caracteres`}
              onChange={e => formHandlers.handleInputChange(fieldName, e.target.value)}
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/30'
              }}
            />
          )}
        />
      )
    },
    [control, errors, formHandlers]
  )

  // ========================================
  // Renderizador de Input optimizado
  // ========================================
  const renderInput = useCallback(
    (fieldName, config = {}) => {
      const { label, placeholder, isRequired = false, startContent = null, ariaLabel = label } = config

      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              variant="underlined"
              label={label}
              aria-label={ariaLabel}
              placeholder={placeholder}
              isRequired={isRequired}
              value={field.value || ''}
              isInvalid={!!errors[fieldName]}
              errorMessage={errors[fieldName]?.message}
              startContent={startContent}
              onChange={e => formHandlers.handleInputChange(fieldName, e.target.value)}
            />
          )}
        />
      )
    },
    [control, errors, formHandlers]
  )

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
        {errors.categoryInterest && <p className="text-red-400 text-sm text-center">{errors.categoryInterest?.message}</p>}
      </section>

      {/* CAMPOS ESPECÍFICOS PARA SPIRIT */}
      {categoryUtils.isSpiritCategory && (
        <section className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200">Información espiritual</h3>
            <p className="text-gray-400 mt-1">Comparte detalles sobre tu fe y vida espiritual</p>
          </div>

          {/* Religión */}
          {renderSelect('religionId', religionOptions, {
            label: 'Religión',
            placeholder: 'Selecciona tu religión',
            isRequired: true,
            startContent: <Church />,
            ariaLabel: 'Religión'
          })}

          {/* Iglesia */}
          {renderInput('church', {
            placeholder: 'Nombre de tu iglesia o congregación (opcional)',
            startContent: <Building />,
            ariaLabel: 'Iglesia'
          })}

          {/* Momentos espirituales */}
          {renderTextarea('spiritualMoments', {
            label: 'Momentos espirituales significativos (opcional)',
            placeholder: 'Comparte experiencias especiales en tu vida espiritual...'
          })}

          {/* Prácticas espirituales */}
          {renderTextarea('spiritualPractices', {
            label: 'Prácticas espirituales (opcional)',
            placeholder: 'Describe tus prácticas de fe (oración, lectura bíblica, servicio, etc.)'
          })}
        </section>
      )}

      {/* CAMPOS ESPECÍFICOS PARA ROUSE */}
      {categoryUtils.isRoueCategory && (
        <section className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200">Preferencias personales</h3>
            <p className="text-gray-400 mt-1">Información para mejores conexiones en la comunidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rol sexual */}
            {renderSelect('sexualRoleId', sexualRoleOptions, {
              label: 'Rol sexual',
              placeholder: 'Selecciona tu preferencia',
              isRequired: true,
              ariaLabel: 'Rol sexual'
            })}

            {/* Tipo de relación */}
            {renderSelect('relationshipTypeId', relationshipTypeOptions, {
              label: 'Tipo de relación',
              placeholder: 'Tipo de relación que buscas',
              isRequired: true,
              ariaLabel: 'Tipo de relación'
            })}
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
                {agePreferenceMin || 18} - {agePreferenceMax || 50} años
              </span>
            </label>
            <Controller
              name="agePreferenceMin"
              control={control}
              render={({ field: minField }) => (
                <Controller
                  name="agePreferenceMax"
                  control={control}
                  render={({ field: maxField }) => (
                    <Slider
                      label="Rango de edad que te interesa para hacer conexiones"
                      color="primary"
                      minValue={18}
                      maxValue={80}
                      value={[minField.value || 18, maxField.value || 50]}
                      onChange={value => {
                        formHandlers.handleInputChange('agePreferenceMin', value[0])
                        formHandlers.handleInputChange('agePreferenceMax', value[1])
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
                  )}
                />
              )}
            />
          </div>
        </div>

        {(errors.agePreferenceMin || errors.agePreferenceMax) && (
          <div className="text-red-400 text-sm">
            {errors.agePreferenceMin && <p>{errors.agePreferenceMin?.message}</p>}
            {errors.agePreferenceMax && <p>{errors.agePreferenceMax?.message}</p>}
          </div>
        )}
      </section>

      <Divider />

      {/* PREFERENCIAS DE UBICACIÓN */}
      <section className="space-y-4">
        <div className="space-y-3">
          <label className="text-gray-300 text-sm block">
            Radio de búsqueda: <span className="text-primary-400 font-semibold">{locationPreferenceRadius || 50} km</span>
          </label>
          <Controller
            name="locationPreferenceRadius"
            control={control}
            render={({ field }) => (
              <Slider
                label="Seleccionar radio de búsqueda"
                step={10}
                color="primary"
                minValue={5}
                maxValue={200}
                value={field.value || 50}
                onChange={value => formHandlers.handleInputChange('locationPreferenceRadius', value)}
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
            )}
          />
        </div>

        {errors.locationPreferenceRadius && <p className="text-red-400 text-sm">{errors.locationPreferenceRadius?.message}</p>}
      </section>

      {/* Información sobre el paso */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <span className="text-blue-400">💡</span>
          <div className="text-sm">
            <h4 className="text-blue-400 font-medium mb-2">¿Por qué estos datos?</h4>
            <p className="text-blue-300/80">
              {categoryUtils.isSpiritCategory
                ? 'Esta información nos ayuda a conectarte con personas que comparten tu fe, valores espirituales y están en tu rango de edad y ubicación preferidos.'
                : categoryUtils.isRoueCategory
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

export default memo(StepPreferences)
