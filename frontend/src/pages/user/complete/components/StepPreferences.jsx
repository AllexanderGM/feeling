import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
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
  Textarea,
  Slider,
  Divider
} from '@heroui/react'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'
import { getDefaultValuesForStep, stepPreferencesSchema } from '@schemas'

import { useStepSave } from '../hooks/useStepSave'

const StepPreferences = ({
  user,
  categoryOptions,
  religionOptions,
  churchOptions,
  sexualRoleOptions,
  relationshipTypeOptions,
  onStepComplete,
  onStepBack,
  isFirstStep = false,
  isLastStep = false
}) => {
  const defaultValues = useMemo(() => getDefaultValuesForStep(3, user), [user])
  const safeCategoryOptions = categoryOptions ?? []
  const safeReligionOptions = religionOptions ?? []
  const safeChurchOptions = churchOptions ?? []
  const safeSexualRoleOptions = sexualRoleOptions ?? []
  const safeRelationshipTypeOptions = relationshipTypeOptions ?? []

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(stepPreferencesSchema),
    mode: 'onChange',
    defaultValues
  })

  const { saveStepData, submitting } = useStepSave(user)

  useEffect(() => {
    if (!user) return
    reset(getDefaultValuesForStep(3, user), { keepDefaultValues: false })
  }, [user, reset])

  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const formValues = watch()
  const { categoryInterest, agePreferenceMin, agePreferenceMax, locationPreferenceRadius } = formValues
  const selectedCategoryCard = categoryInterest || null

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

  const handleCategoryCardSelect = useCallback(
    categoryKey => {
      formHandlers.handleInputChange('categoryInterest', categoryKey)

      if (categoryKey !== 'SPIRIT') {
        formHandlers.handleInputChange('religionId', '')
        formHandlers.handleInputChange('spiritualMoments', '')
        formHandlers.handleInputChange('spiritualPractices', '')
      }

      if (categoryKey !== 'ROUSE') {
        formHandlers.handleInputChange('sexualRoleId', '')
        formHandlers.handleInputChange('relationshipId', '')
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

  const categoryUtils = useMemo(
    () => ({
      isSpiritCategory: selectedCategoryCard === 'SPIRIT' || categoryInterest === 'SPIRIT',
      isRoueCategory: selectedCategoryCard === 'ROUSE' || categoryInterest === 'ROUSE'
    }),
    [selectedCategoryCard, categoryInterest]
  )

  const renderSelect = useCallback(
    (fieldName, options, config = {}) => {
      const { label, placeholder, isRequired = false, startContent = null, ariaLabel = label } = config

      return (
        <Controller
          control={control}
          name={fieldName}
          render={({ field }) => (
            <Select
              aria-label={ariaLabel}
              errorMessage={errors[fieldName]?.message}
              isInvalid={!!errors[fieldName]}
              isRequired={isRequired}
              label={label}
              placeholder={placeholder}
              renderValue={items =>
                items.map(item => {
                  const option = options.find(opt => opt.key === item.key)

                  return (
                    <div key={item.key} className='flex items-center gap-2'>
                      <AttributeDetailRenderer detail={option?.detail} size='sm' />
                      <span>{option?.label}</span>
                    </div>
                  )
                })
              }
              selectedKeys={field.value ? [field.value.toString()] : []}
              startContent={startContent}
              variant='underlined'
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0]

                field.onChange(selectedKey ? parseInt(selectedKey) : null)
              }}>
              {options.map(option => (
                <SelectItem
                  key={option.key}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}
                  textValue={option.label}
                  value={option.key}>
                  <div className='flex items-center gap-3'>
                    <AttributeDetailRenderer detail={option.detail} size='sm' />
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

  const renderTextarea = useCallback(
    (fieldName, config = {}) => {
      const { label, placeholder, isRequired = false, maxLength = 300, minRows = 2, maxRows = 4 } = config

      return (
        <Controller
          control={control}
          name={fieldName}
          render={({ field }) => (
            <Textarea
              {...field}
              aria-label={label}
              errorMessage={errors[fieldName]?.message}
              isInvalid={!!errors[fieldName]}
              isRequired={isRequired}
              label={label}
              maxLength={maxLength}
              minRows={minRows}
              placeholder={placeholder}
              variant='bordered'
              onChange={e => {
                field.onChange(e)
                if (errors[fieldName]) {
                  clearErrors(fieldName)
                }
              }}
            />
          )}
        />
      )
    },
    [control, errors, clearErrors]
  )

  const onSubmit = useCallback(
    async data => {
      const result = await saveStepData({
        stepNumber: 3,
        formData: data
      })

      if (result.success) {
        onStepComplete?.()
      }
    },
    [onStepComplete, saveStepData]
  )

  const isSaving = submitting || isSubmitting

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <section className='space-y-4'>
        <Divider />
        <p className='text-gray-300 text-sm'>
          Define tus preferencias y el tipo de conexiones que buscas. Estos datos nos ayudan a encontrar personas compatibles.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {safeCategoryOptions.map(category => (
            <Button
              key={category.key}
              className={`flex flex-col items-start h-full border ${
                categoryInterest === category.key ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700'
              }`}
              size='lg'
              variant='bordered'
              onPress={() => handleCategoryCardSelect(category.key)}>
              <span className='text-sm font-semibold text-left'>{category.label}</span>
              <span className='text-xs text-left text-gray-400'>{category.description}</span>
              <Button size='sm' variant='light' onPress={() => handleCategoryInfo(category.key)}>
                Ver más
              </Button>
            </Button>
          ))}
        </div>

        {errors.categoryInterest && <p className='text-sm text-red-400'>{errors.categoryInterest.message}</p>}
      </section>

      <section className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <span className='text-gray-300 text-sm font-medium'>Rango de edad preferido</span>
            <div className='flex items-center gap-4 mt-3'>
              <Controller
                control={control}
                name='agePreferenceMin'
                render={({ field }) => (
                  <Slider
                    {...field}
                    aria-label='Edad mínima'
                    maxValue={80}
                    minValue={18}
                    step={1}
                    value={field.value || 18}
                    onChange={value => {
                      field.onChange(value)
                      if (errors.agePreferenceMin) {
                        clearErrors('agePreferenceMin')
                      }
                    }}
                  />
                )}
              />
              <span className='text-gray-200 text-sm w-10 text-right'>{agePreferenceMin ?? 18}</span>
            </div>
            {errors.agePreferenceMin && <p className='text-xs text-red-400 mt-1'>{errors.agePreferenceMin.message}</p>}
          </div>

          <div>
            <span className='text-gray-300 text-sm font-medium'>Edad máxima</span>
            <div className='flex items-center gap-4 mt-3'>
              <Controller
                control={control}
                name='agePreferenceMax'
                render={({ field }) => (
                  <Slider
                    {...field}
                    aria-label='Edad máxima'
                    maxValue={80}
                    minValue={18}
                    step={1}
                    value={field.value || 40}
                    onChange={value => {
                      field.onChange(value)
                      if (errors.agePreferenceMax) {
                        clearErrors('agePreferenceMax')
                      }
                    }}
                  />
                )}
              />
              <span className='text-gray-200 text-sm w-10 text-right'>{agePreferenceMax ?? 40}</span>
            </div>
            {errors.agePreferenceMax && <p className='text-xs text-red-400 mt-1'>{errors.agePreferenceMax.message}</p>}
          </div>
        </div>

        <div>
          <span className='text-gray-300 text-sm font-medium'>Radio de ubicación (km)</span>
          <div className='flex items-center gap-4 mt-3'>
            <Controller
              control={control}
              name='locationPreferenceRadius'
              render={({ field }) => (
                <Slider
                  {...field}
                  aria-label='Radio de ubicación'
                  maxValue={200}
                  minValue={5}
                  step={5}
                  value={field.value || 50}
                  onChange={value => {
                    field.onChange(value)
                    if (errors.locationPreferenceRadius) {
                      clearErrors('locationPreferenceRadius')
                    }
                  }}
                />
              )}
            />
            <span className='text-gray-200 text-sm w-12 text-right'>{locationPreferenceRadius ?? 50} km</span>
          </div>
          {errors.locationPreferenceRadius && <p className='text-xs text-red-400 mt-1'>{errors.locationPreferenceRadius.message}</p>}
        </div>
      </section>

      {categoryUtils.isSpiritCategory && (
        <section className='space-y-4'>
          <Divider />
          <h3 className='text-sm text-gray-200 font-semibold'>Intereses espirituales</h3>

          {safeReligionOptions.length > 0 ? (
            renderSelect('religionId', safeReligionOptions, {
              label: 'Religión',
              placeholder: 'Selecciona tu religión',
              isRequired: true
            })
          ) : (
            <p className='text-xs text-gray-500'>No hay opciones de religión disponibles.</p>
          )}

          {safeChurchOptions.length > 0 &&
            renderSelect('churchId', safeChurchOptions, {
              label: 'Iglesia / Comunidad',
              placeholder: 'Selecciona tu comunidad',
              isRequired: false
            })}

          {renderTextarea('spiritualMoments', {
            label: 'Momentos espirituales importantes',
            placeholder: 'Describe brevemente momentos espirituales significativos en tu vida'
          })}

          {renderTextarea('spiritualPractices', {
            label: 'Prácticas espirituales',
            placeholder: 'Ej. oración, estudio bíblico, servicio comunitario...'
          })}
        </section>
      )}

      {categoryUtils.isRoueCategory && (
        <section className='space-y-4'>
          <Divider />
          <h3 className='text-sm text-gray-200 font-semibold'>Preferencias románticas</h3>

          {safeSexualRoleOptions.length > 0 ? (
            renderSelect('sexualRoleId', safeSexualRoleOptions, {
              label: 'Rol en la relación',
              placeholder: 'Selecciona tu rol',
              isRequired: true
            })
          ) : (
            <p className='text-xs text-gray-500'>No hay roles disponibles.</p>
          )}

          {safeRelationshipTypeOptions.length > 0 ? (
            renderSelect('relationshipId', safeRelationshipTypeOptions, {
              label: 'Tipo de relación',
              placeholder: 'Selecciona el tipo de relación',
              isRequired: true
            })
          ) : (
            <p className='text-xs text-gray-500'>No hay tipos de relación configurados.</p>
          )}
        </section>
      )}

      <div className='flex justify-between items-center pt-6'>
        {!isFirstStep ? (
          <Button variant='bordered' onPress={onStepBack}>
            Anterior
          </Button>
        ) : (
          <span />
        )}

        <Button color='primary' isLoading={isSaving} type='submit'>
          {isLastStep ? 'Guardar y finalizar' : 'Guardar y continuar'}
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Información de la categoría</ModalHeader>
              <ModalBody>
                <p className='text-sm text-gray-300'>{selectedCategoryForModal?.description}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cerrar
                </Button>
                <Button color='primary' onPress={handleCategorySelectFromModal}>
                  Seleccionar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </form>
  )
}

export default memo(StepPreferences)
