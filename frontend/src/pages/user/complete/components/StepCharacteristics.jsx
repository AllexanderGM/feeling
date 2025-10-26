import { useState, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Textarea,
  Input,
  Select,
  SelectItem,
  Slider,
  Tooltip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  Chip,
  Autocomplete,
  AutocompleteItem,
  Button
} from '@heroui/react'
import { Brain, Sparkles, Tag, Heart, GraduationCap, Briefcase, Accessibility, Ruler } from 'lucide-react'
import { Controller } from 'react-hook-form'
import AttributeDetailRenderer from '@components/ui/attributes/AttributeDetailRenderer.jsx'

import useStepCharacteristics from '../hooks/useStepCharacteristics'

const noop = () => {}

const PROFILE_TIPS = [
  { label: 'Descripción auténtica', tip: 'Sé auténtico en tu descripción - muestra tu personalidad real' },
  { label: 'Intereses específicos', tip: 'Agrega intereses específicos para mejores conexiones y matches' },
  { label: 'Sugerencias rápidas', tip: 'Haz clic en las sugerencias para agregarlas rápidamente a tu perfil' },
  { label: 'Información completa', tip: 'Completa toda la información para mejores matches' },
  { label: 'Sé específico', tip: 'Menciona hobbies concretos en lugar de términos generales como "música"' },
  { label: 'Evita negatividad', tip: 'Enfócate en lo que te gusta, no en lo que no quieres' }
]

const StepCharacteristicsContent = ({
  control,
  errors: providedErrors = {},
  watch: watchProp,
  setValue: setValueProp,
  clearErrors: clearErrorsProp,
  userAttributes = {},
  userTags = {}
}) => {
  const errors = providedErrors || {}
  const watch = typeof watchProp === 'function' ? watchProp : () => ({})
  const setValue = typeof setValueProp === 'function' ? setValueProp : () => {}
  const clearErrors = typeof clearErrorsProp === 'function' ? clearErrorsProp : () => {}

  const {
    maritalStatusOptions = [],
    educationLevelOptions = [],
    genderOptions = [],
    eyeColorOptions = [],
    hairColorOptions = [],
    bodyTypeOptions = [],
    getSelectOptions,
    isColor,
    createAttribute
  } = userAttributes

  const {
    popularTags = [],
    searchTags: searchTagsProp,
    searchResults = [],
    searchLoading = false,
    clearSearchResults: clearSearchResultsProp,
    hasPopularTags: hasPopularTagsProp,
    hasSearchResults: hasSearchResultsProp
  } = userTags

  const searchTags = typeof searchTagsProp === 'function' ? searchTagsProp : async () => []
  const clearSearchResults = typeof clearSearchResultsProp === 'function' ? clearSearchResultsProp : noop
  const hasPopularTags = typeof hasPopularTagsProp === 'boolean' ? hasPopularTagsProp : popularTags.length > 0
  const hasSearchResults =
    typeof hasSearchResultsProp === 'boolean' ? hasSearchResultsProp : Array.isArray(searchResults) && searchResults.length > 0

  const formValues = watch() || {}
  const tags = Array.isArray(formValues.tags) ? formValues.tags : []
  const height = formValues.height
  const tagsErrorMessage = errors?.tags?.message

  const [tagQuery, setTagQuery] = useState('')
  const [showingSuggestions, setShowingSuggestions] = useState(true)
  const [heightInput, setHeightInput] = useState(() => (height ? String(height) : '170'))
  const [addAttributeModal, setAddAttributeModal] = useState({
    isOpen: false,
    type: null,
    isLoading: false,
    error: null,
    data: { name: '', detail: '#000000' }
  })

  useEffect(() => {
    setHeightInput(height ? String(height) : '170')
  }, [height])

  const tagData = useMemo(() => {
    const currentTags = tags
    const backendTags = hasPopularTags ? popularTags.slice(0, 15).map(tag => tag.name || tag.tagName || tag.label || tag) : []
    const filteredSuggestions = backendTags.filter(tag => !currentTags.includes(tag))

    const suggestedOptions = filteredSuggestions.slice(0, 15).map(tag => ({
      key: tag,
      name: tag,
      label: tag
    }))

    let searchOptions = []

    if (!showingSuggestions && hasSearchResults) {
      searchOptions = searchResults.map(tag => ({
        key: tag.id || tag.name || tag.tagName || tag,
        name: tag.name || tag.tagName || tag.label || tag,
        label: tag.name || tag.tagName || tag.label || tag
      }))
    }

    return {
      suggested: filteredSuggestions,
      options: showingSuggestions ? suggestedOptions : searchOptions,
      currentTags
    }
  }, [tags, popularTags, searchResults, hasPopularTags, hasSearchResults, showingSuggestions])

  const formHandlers = useMemo(
    () => ({
      handleInputChange: (field, value) => {
        setValue(field, value, { shouldValidate: true })
        if (errors && errors[field]) {
          clearErrors(field)
        }
      }
    }),
    [setValue, clearErrors, errors]
  )

  const addTag = useCallback(
    tag => {
      const trimmedTag = (tag || '').trim()

      if (!trimmedTag) return
      if (tags.includes(trimmedTag) || tags.length >= 10) return

      const newTags = [...tags, trimmedTag]

      setValue('tags', newTags, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
      if (newTags.length >= 3) {
        clearErrors('tags')
      }
    },
    [tags, setValue, clearErrors]
  )

  const removeTag = useCallback(
    tagToRemove => {
      const newTags = tags.filter(tag => tag !== tagToRemove)

      setValue('tags', newTags, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    },
    [tags, setValue]
  )

  const handleTagSearch = useCallback(
    async query => {
      setTagQuery(query)
      if (query.trim()) {
        setShowingSuggestions(false)
        await searchTags(query, 20)
      } else {
        setShowingSuggestions(true)
        clearSearchResults()
      }
    },
    [searchTags, clearSearchResults]
  )

  const handleAddTag = useCallback(
    tagValue => {
      const trimmedTag =
        typeof tagValue === 'string' ? tagValue.trim() : (tagValue?.name || tagValue?.tagName || tagValue?.label || '').trim()

      if (trimmedTag) {
        addTag(trimmedTag)
        setTagQuery('')
        if (tagsErrorMessage) {
          clearErrors('tags')
        }
      }
    },
    [addTag, tagsErrorMessage, clearErrors]
  )

  const modalHandlers = useMemo(
    () => ({
      openModal: type => {
        setAddAttributeModal({
          isOpen: true,
          type,
          isLoading: false,
          error: null,
          data: { name: '', detail: type === 'eye' || type === 'hair' ? '#000000' : '' }
        })
      },

      closeModal: () => {
        setAddAttributeModal({
          isOpen: false,
          type: null,
          isLoading: false,
          error: null,
          data: { name: '', detail: '#000000' }
        })
      },

      updateModalData: (field, value) => {
        setAddAttributeModal(prev => ({
          ...prev,
          data: { ...prev.data, [field]: value }
        }))
      },

      submitAttribute: async () => {
        const { type, data } = addAttributeModal

        setAddAttributeModal(prev => ({ ...prev, error: null }))

        if (!data.name.trim()) {
          setAddAttributeModal(prev => ({ ...prev, error: 'El nombre es requerido' }))

          return
        }
        if (data.name.trim().length < 2) {
          setAddAttributeModal(prev => ({ ...prev, error: 'El nombre debe tener al menos 2 caracteres' }))

          return
        }
        if (!data.detail.trim()) {
          setAddAttributeModal(prev => ({ ...prev, error: 'El color es requerido' }))

          return
        }

        setAddAttributeModal(prev => ({ ...prev, isLoading: true }))

        try {
          if (typeof createAttribute === 'function') {
            const attributeType = type === 'eye' ? 'EYE_COLOR' : 'HAIR_COLOR'
            const newAttribute = await createAttribute(attributeType, {
              name: data.name.trim(),
              detail: data.detail.trim()
            })

            const fieldName = type === 'eye' ? 'eyeColorId' : 'hairColorId'

            formHandlers.handleInputChange(fieldName, newAttribute.id)
            modalHandlers.closeModal()
          }
        } catch (error) {
          setAddAttributeModal(prev => ({
            ...prev,
            error: error.message || 'Error inesperado al crear el atributo'
          }))
        } finally {
          setAddAttributeModal(prev => ({ ...prev, isLoading: false }))
        }
      }
    }),
    [addAttributeModal, createAttribute, formHandlers]
  )

  const renderColorSelector = useCallback(
    (options, fieldName, type, label) => {
      const selectedId = formValues[fieldName]
      const mappedOptions = Array.isArray(options) ? options : []

      if (!mappedOptions || mappedOptions.length === 0) {
        return (
          <div className='space-y-2'>
            <label className='text-sm text-gray-400'>{label}</label>
            <p className='text-sm text-red-400'>No hay opciones disponibles para {label}</p>
          </div>
        )
      }

      const isDetailColor =
        typeof isColor === 'function'
          ? isColor
          : detail => {
              if (typeof detail !== 'string') return false
              const value = detail.trim()

              return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)
            }

      return (
        <div className='space-y-2'>
          <label className='text-sm text-gray-400'>{label}</label>
          <div className='flex flex-wrap gap-2'>
            {mappedOptions.map(option => {
              const optionId = parseInt(option.key, 10)
              const isSelected = selectedId === optionId
              const isPending = option.isPending

              return (
                <Badge key={option.key} content={<span className='text-white text-xs'>✓</span>} isInvisible={!isSelected} shape='circle'>
                  <Tooltip
                    className='capitalize'
                    color='primary'
                    content={
                      <div className='flex items-center gap-2'>
                        <span>{option.label}</span>
                        {isPending && (
                          <Badge color='warning' size='sm' variant='solid'>
                            Pendiente
                          </Badge>
                        )}
                      </div>
                    }
                    placement='bottom'>
                    <Button
                      isIconOnly
                      aria-label={`Seleccionar ${label.toLowerCase()} ${option.label}`}
                      className={`
                      relative group transition-all duration-200 border-2 shadow-md
                      ${isSelected ? 'scale-110' : 'hover:scale-105'}
                      ${isSelected ? 'border-gray-300' : 'border-gray-600 hover:border-gray-500'}
                      ${isPending ? 'opacity-70' : ''}
                    `}
                      color='neutral'
                      radius={type === 'eye' ? 'full' : 'lg'}
                      size='sm'
                      style={isDetailColor(option.detail) ? { backgroundColor: option.detail } : { backgroundColor: '#374151' }}
                      onPress={() => formHandlers.handleInputChange(fieldName, optionId)}>
                      {!isDetailColor(option.detail) && option.detail && (
                        <span
                          className='material-symbols-outlined text-white'
                          style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}>
                          {option.detail}
                        </span>
                      )}
                      {isPending && <div className='absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse' />}
                    </Button>
                  </Tooltip>
                </Badge>
              )
            })}

            {typeof createAttribute === 'function' && (
              <Button
                isIconOnly
                aria-label={`Agregar nuevo ${label.toLowerCase()}`}
                className='border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-primary-500 transition-all duration-200 hover:bg-primary-500/10 group'
                color='primary'
                radius={type === 'eye' ? 'full' : 'lg'}
                size='sm'
                variant='bordered'
                onPress={() => modalHandlers.openModal(type)}>
                <span className='text-gray-500 group-hover:text-primary-400 text-lg pb-1'>+</span>
              </Button>
            )}
          </div>
          {errors?.[fieldName] && <p className='text-red-400 text-sm'>{errors[fieldName]?.message || errors[fieldName]}</p>}
        </div>
      )
    },
    [formValues, formHandlers, modalHandlers, isColor, createAttribute, errors]
  )

  return (
    <>
      <section className='space-y-4'>
        <Controller
          control={control}
          name='description'
          render={({ field }) => (
            <Textarea
              {...field}
              isRequired
              classNames={{
                input: 'text-gray-200',
                inputWrapper: 'bg-gray-800/30'
              }}
              description={`${(field.value || '').length}/500 caracteres`}
              errorMessage={errors?.description?.message}
              isInvalid={!!errors?.description}
              label='Descripción personal'
              maxLength={500}
              maxRows={6}
              minRows={3}
              placeholder='Cuéntanos sobre ti, tus intereses, lo que buscas y qué te hace único...'
              variant='bordered'
            />
          )}
        />

        <Accordion className='mt-6 px-0' variant='splitted'>
          <AccordionItem
            key='profile-tips'
            aria-label='Tips para tu perfil'
            classNames={{
              trigger: 'p-1',
              base: 'bg-blue-500/10 border border-blue-500/20',
              title: 'text-blue-400 text-sm',
              content: 'text-sm'
            }}
            startContent={<Brain className='text-blue-400 text-xl pt-1' />}
            title='Tips para tu perfil'>
            <ul className='text-blue-300/80 space-y-1 list-disc pl-5'>
              {PROFILE_TIPS.map((tip, index) => (
                <li key={index}>
                  <strong>{tip.label}:</strong> {tip.tip}
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>

        <div className='space-y-2'>
          <Autocomplete
            allowsCustomValue
            classNames={{
              base: 'max-w-full',
              listboxWrapper: 'max-h-72',
              popoverContent: 'w-full'
            }}
            errorMessage={tagsErrorMessage}
            inputValue={tagQuery}
            isInvalid={!!tagsErrorMessage}
            isLoading={searchLoading}
            label='Agregar intereses'
            placeholder='Busca y agrega tus intereses...'
            startContent={<Sparkles className='text-sm' />}
            variant='underlined'
            onInputChange={handleTagSearch}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagQuery.trim()) {
                e.preventDefault()
                handleAddTag(tagQuery)
              }
            }}
            onSelectionChange={key => {
              if (key) {
                const selectedTag = tagData.options.find(option => option.key === key)

                if (selectedTag) {
                  handleAddTag(selectedTag.name)
                }
              }
            }}>
            {tagData.options.map(tag => (
              <AutocompleteItem key={tag.key} className='text-gray-200 data-[hover=true]:bg-gray-700' textValue={tag.name}>
                <div className='flex items-center gap-2'>
                  <Tag className='text-primary-400 text-sm' />
                  <span>{tag.name}</span>
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>

          {tagData.currentTags.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-3'>
              {tagData.currentTags.map((tag, index) => (
                <Chip key={`${tag}-${index}`} className='cursor-pointer' color='primary' variant='flat' onClose={() => removeTag(tag)}>
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {tagData.suggested.length > 0 && (
            <div className='space-y-2 mt-4'>
              <p className='text-xs text-gray-400'>Sugerencias populares:</p>
              <div className='flex flex-wrap gap-2'>
                {tagData.suggested.slice(0, 7).map(tag => (
                  <button
                    key={tag}
                    className='px-3 py-1 text-sm border border-gray-600 rounded-full cursor-pointer hover:bg-primary-500/10 hover:border-primary-500/50 transition-colors text-gray-300'
                    type='button'
                    onClick={() => handleAddTag(tag)}>
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-between items-center'>
            <span className='text-xs text-gray-500'>{tagData.currentTags.length}/10 intereses</span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='genderId'
            render={({ field }) => (
              <Select
                isRequired
                errorMessage={errors?.genderId?.message}
                isInvalid={!!errors?.genderId}
                label='Seleccionar género'
                placeholder='Selecciona tu género'
                renderValue={items =>
                  items.map(item => {
                    const option = genderOptions.find(opt => opt.key === item.key)

                    return (
                      <div key={item.key} className='flex items-center gap-2'>
                        <AttributeDetailRenderer detail={option?.detail} size='sm' />
                        <span>{option?.label}</span>
                      </div>
                    )
                  })
                }
                selectedKeys={field.value ? [field.value.toString()] : []}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey, 10) : null)
                }}>
                {genderOptions.map(option => (
                  <SelectItem
                    key={option.key}
                    classNames={{
                      base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                    }}
                    textValue={option.label}
                    value={option.key}>
                    <div className='flex items-center gap-3'>
                      <AttributeDetailRenderer detail={option.detail} size='md' />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            control={control}
            name='maritalStatusId'
            render={({ field }) => (
              <Select
                errorMessage={errors?.maritalStatusId?.message}
                isInvalid={!!errors?.maritalStatusId}
                label='Estado civil'
                placeholder='Selecciona tu estado civil'
                renderValue={items =>
                  items.map(item => {
                    const option = maritalStatusOptions.find(opt => opt.key === item.key)

                    return (
                      <div key={item.key} className='flex items-center gap-2'>
                        <AttributeDetailRenderer detail={option?.detail} size='sm' />
                        <span>{option?.label}</span>
                      </div>
                    )
                  })
                }
                selectedKeys={field.value ? [field.value.toString()] : []}
                startContent={<Heart className='text-sm' />}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey, 10) : null)
                }}>
                {maritalStatusOptions.map(option => (
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
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Controller
            control={control}
            name='educationLevelId'
            render={({ field }) => (
              <Select
                errorMessage={errors?.educationLevelId?.message}
                isInvalid={!!errors?.educationLevelId}
                label='Nivel de estudios'
                placeholder='Selecciona tu nivel educativo'
                renderValue={items =>
                  items.map(item => {
                    const option = educationLevelOptions.find(opt => opt.key === item.key)

                    return (
                      <div key={item.key} className='flex items-center gap-2'>
                        <AttributeDetailRenderer detail={option?.detail} size='sm' />
                        <span>{option?.label}</span>
                      </div>
                    )
                  })
                }
                selectedKeys={field.value ? [field.value.toString()] : []}
                startContent={<GraduationCap className='text-sm' />}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey, 10) : null)
                }}>
                {educationLevelOptions.map(option => (
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

          <Controller
            control={control}
            name='profession'
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors?.profession?.message}
                isInvalid={!!errors?.profession}
                label='Profesión'
                placeholder='Tu profesión u ocupación'
                startContent={<Briefcase className='text-sm' />}
                value={field.value || ''}
                variant='underlined'
                onChange={event => {
                  field.onChange(event.target.value)
                  if (errors?.profession) {
                    clearErrors('profession')
                  }
                }}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name='bodyTypeId'
          render={({ field }) => (
            <Select
              errorMessage={errors?.bodyTypeId?.message}
              isInvalid={!!errors?.bodyTypeId}
              label='Seleccionar tipo de cuerpo'
              placeholder='Selecciona tu tipo de cuerpo'
              renderValue={items =>
                items.map(item => {
                  const option = bodyTypeOptions.find(opt => opt.key === item.key)

                  return (
                    <div key={item.key} className='flex items-center gap-2'>
                      <AttributeDetailRenderer detail={option?.detail} size='md' />
                      <span>{option?.label}</span>
                    </div>
                  )
                })
              }
              selectedKeys={field.value ? [field.value.toString()] : []}
              startContent={<Accessibility className='text-sm' />}
              variant='underlined'
              onSelectionChange={keys => {
                const selectedKey = Array.from(keys)[0]

                field.onChange(selectedKey ? parseInt(selectedKey, 10) : null)
              }}>
              {(getSelectOptions ? getSelectOptions('BODY_TYPE') : bodyTypeOptions).map(option => (
                <SelectItem
                  key={option.key}
                  classNames={{
                    base: 'text-gray-200 data-[hover=true]:bg-gray-700 data-[selectable=true]:focus:bg-gray-700'
                  }}
                  textValue={option.label}
                  value={option.key}>
                  <div className='flex items-center gap-3'>
                    <AttributeDetailRenderer detail={option.detail} size='lg' />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}
        />

        <div className='space-y-4'>
          <Controller
            control={control}
            name='height'
            render={({ field }) => (
              <Input
                endContent={<span className='text-gray-500 text-sm'>cm</span>}
                errorMessage={errors?.height?.message}
                isInvalid={!!errors?.height}
                max={220}
                min={140}
                placeholder='Ingresa tu estatura'
                startContent={
                  <div className='flex text-gray-400'>
                    <Ruler />
                    <span className='ml-2'>Estatura: </span>
                  </div>
                }
                type='number'
                value={heightInput}
                variant='underlined'
                onChange={e => {
                  const value = e.target.value

                  setHeightInput(value)
                  const numValue = parseInt(value, 10)

                  if (!Number.isNaN(numValue) && numValue >= 140 && numValue <= 220) {
                    field.onChange(numValue)
                  }
                }}
              />
            )}
          />

          <Controller
            control={control}
            name='height'
            render={({ field }) => (
              <Slider
                showTooltip
                aria-label='Seleccionar estatura en centímetros'
                color='primary'
                maxValue={220}
                minValue={140}
                value={field.value || 170}
                onChange={value => {
                  setHeightInput(value.toString())
                  field.onChange(value)
                }}
              />
            )}
          />
        </div>

        {renderColorSelector(getSelectOptions ? getSelectOptions('EYE_COLOR') : eyeColorOptions, 'eyeColorId', 'eye', 'Color de ojos')}

        {renderColorSelector(
          getSelectOptions ? getSelectOptions('HAIR_COLOR') : hairColorOptions,
          'hairColorId',
          'hair',
          'Color de cabello'
        )}
      </section>

      {typeof createAttribute === 'function' && (
        <Modal
          classNames={{
            base: 'bg-gray-900 text-white',
            header: 'border-b border-gray-700',
            body: 'py-6',
            footer: 'border-t border-gray-700'
          }}
          isDismissable={!addAttributeModal.isLoading}
          isOpen={addAttributeModal.isOpen}
          placement='center'
          size='lg'
          onClose={modalHandlers.closeModal}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  <div className='flex items-center gap-3'>
                    <div className='text-3xl p-2 bg-primary-500/20 rounded-lg'>{addAttributeModal.type === 'eye' ? '👁️' : '💇'}</div>
                    <div>
                      <h3 className='text-xl font-bold'>Agregar nuevo color de {addAttributeModal.type === 'eye' ? 'ojos' : 'cabello'}</h3>
                      <p className='text-sm text-gray-400 font-normal'>Completa la información para crear un nuevo atributo</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className='bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4'>
                    <div className='flex gap-2'>
                      <span className='text-amber-400'>⏳</span>
                      <p className='text-amber-300 text-sm'>
                        Los nuevos atributos requieren aprobación. Aparecerán temporalmente en tu perfil hasta ser revisados.
                      </p>
                    </div>
                  </div>

                  {addAttributeModal.error && (
                    <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4'>
                      <div className='flex gap-2'>
                        <span className='text-red-400'>❌</span>
                        <p className='text-red-300 text-sm'>{addAttributeModal.error}</p>
                      </div>
                    </div>
                  )}

                  <div className='space-y-4'>
                    <div className='flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg'>
                      <div
                        className={`w-12 h-12 border-2 border-gray-600 shadow-lg ${
                          addAttributeModal.type === 'eye' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{ backgroundColor: addAttributeModal.data.detail }}
                      />
                      <div className='flex-1'>
                        <p className='text-sm text-gray-400'>Vista previa</p>
                        <p className='text-white font-medium'>{addAttributeModal.data.name || 'Nuevo color'}</p>
                      </div>
                    </div>

                    <Input
                      classNames={{
                        input: 'text-gray-200',
                        inputWrapper: 'bg-gray-800/50 border-gray-700 hover:border-gray-600 data-[focus=true]:border-primary-500'
                      }}
                      description='Nombre descriptivo que verán los usuarios'
                      isDisabled={addAttributeModal.isLoading}
                      label='Nombre'
                      placeholder={`Ej: ${addAttributeModal.type === 'eye' ? 'Verde esmeralda' : 'Castaño claro'}`}
                      value={addAttributeModal.data.name}
                      variant='bordered'
                      onChange={e => modalHandlers.updateModalData('name', e.target.value)}
                    />

                    <div className='space-y-2'>
                      <label className='text-sm text-gray-400' htmlFor='attribute-color-input'>
                        Color
                      </label>
                      <div className='flex items-center gap-3'>
                        <input
                          className='w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                          disabled={addAttributeModal.isLoading}
                          id='attribute-color-input'
                          type='color'
                          value={addAttributeModal.data.detail}
                          onChange={e => modalHandlers.updateModalData('detail', e.target.value)}
                        />
                        <Input
                          className='flex-1'
                          classNames={{
                            input: 'text-gray-200 font-mono',
                            inputWrapper: 'bg-gray-800/50 border-gray-700 hover:border-gray-600 data-[focus=true]:border-primary-500'
                          }}
                          isDisabled={addAttributeModal.isLoading}
                          placeholder='#000000'
                          startContent={<span className='text-gray-500'>#</span>}
                          value={addAttributeModal.data.detail}
                          variant='bordered'
                          onChange={e => modalHandlers.updateModalData('detail', e.target.value)}
                        />
                      </div>
                      <p className='text-xs text-gray-500'>Selecciona el color usando el selector o ingresa el código hexadecimal</p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button isDisabled={addAttributeModal.isLoading} variant='light' onPress={modalHandlers.closeModal}>
                    Cancelar
                  </Button>
                  <Button
                    className='bg-gradient-to-r from-primary-600 to-primary-700'
                    color='primary'
                    isDisabled={!addAttributeModal.data.name.trim() || !addAttributeModal.data.detail.trim()}
                    isLoading={addAttributeModal.isLoading}
                    onPress={modalHandlers.submitAttribute}>
                    {addAttributeModal.isLoading ? 'Creando...' : 'Crear atributo'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

const StepCharacteristics = forwardRef(({ onStepComplete }, ref) => {
  const {
    control,
    errors,
    watch,
    setValue,
    clearErrors,
    handleFormSubmit,
    userAttributes: resolvedUserAttributes,
    userTags: resolvedUserTags
  } = useStepCharacteristics({ onStepComplete })

  // Exponer método submit al componente padre
  useImperativeHandle(ref, () => ({
    submit: handleFormSubmit
  }))

  return (
    <div className='space-y-8 md:space-y-10 px-2 md:px-0'>
      <StepCharacteristicsContent
        clearErrors={clearErrors}
        control={control}
        errors={errors}
        setValue={setValue}
        userAttributes={resolvedUserAttributes}
        userTags={resolvedUserTags}
        watch={watch}
      />
    </div>
  )
})

StepCharacteristics.displayName = 'StepCharacteristics'

export default StepCharacteristics
