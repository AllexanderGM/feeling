import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import {
  Textarea,
  Input,
  Select,
  SelectItem,
  Slider,
  Button,
  Accordion,
  AccordionItem,
  Chip,
  Autocomplete,
  AutocompleteItem
} from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Brain, Sparkles, Tag, Ruler } from 'lucide-react'
import { getDefaultValuesForStep, stepCharacteristicsSchema } from '@schemas'

import { useStepSave } from '../hooks/useStepSave'

const PROFILE_TIPS = [
  { label: 'Descripción auténtica', tip: 'Sé auténtico en tu descripción - muestra tu personalidad real' },
  { label: 'Intereses específicos', tip: 'Agrega intereses específicos para mejores conexiones y matches' },
  { label: 'Sugerencias rápidas', tip: 'Haz clic en las sugerencias para agregarlas rápidamente a tu perfil' },
  { label: 'Información completa', tip: 'Completa toda la información para mejores matches' },
  { label: 'Sé específico', tip: 'Menciona hobbies concretos en lugar de términos generales como "música"' },
  { label: 'Evita negatividad', tip: 'Enfócate en lo que te gusta, no en lo que no quieres' }
]

const StepCharacteristics = ({ user, userAttributes, userTags, onStepComplete, onStepBack, isFirstStep = false, isLastStep = false }) => {
  const defaultValues = useMemo(() => getDefaultValuesForStep(2, user), [user])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors,
    reset,
    getValues
  } = useForm({
    resolver: yupResolver(stepCharacteristicsSchema),
    mode: 'onChange',
    defaultValues
  })

  const { saveStepData, submitting } = useStepSave(user)

  useEffect(() => {
    if (!user) return
    reset(getDefaultValuesForStep(2, user), { keepDefaultValues: false })
  }, [user, reset])

  const { maritalStatusOptions = [], educationLevelOptions = [], genderOptions = [] } = userAttributes

  const { popularTags, searchTags, searchResults, searchLoading, clearSearchResults, hasPopularTags, hasSearchResults } = userTags

  const [tagQuery, setTagQuery] = useState('')
  const [showingSuggestions, setShowingSuggestions] = useState(true)
  const [heightInput, setHeightInput] = useState('170')
  const formValues = watch()
  const { tags, height } = formValues

  useEffect(() => {
    setHeightInput(height?.toString() || '170')
  }, [height])

  const tagData = useMemo(() => {
    const currentTags = tags || []
    const backendTags = hasPopularTags ? popularTags.slice(0, 15).map(tag => tag.name || tag.tagName || tag.label || tag) : []
    const filteredSuggestions = backendTags.filter(tag => !currentTags.includes(tag))

    const suggestedOptions = filteredSuggestions.slice(0, 15).map(tag => ({
      key: tag,
      name: tag,
      label: tag
    }))

    let searchOptions = []

    if (hasSearchResults) {
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
        if (errors[field]) {
          clearErrors(field)
        }
      }
    }),
    [setValue, clearErrors, errors]
  )

  const addTag = useCallback(
    tag => {
      const trimmedTag = tag.trim()
      const currentTags = tags || []

      if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 10) {
        const newTags = [...currentTags, trimmedTag]

        setValue('tags', newTags, { shouldValidate: true, shouldDirty: true })
      }
    },
    [tags, setValue]
  )

  const removeTag = useCallback(
    tagToRemove => {
      const currentTags = tags || []
      const newTags = currentTags.filter(tag => tag !== tagToRemove)

      setValue('tags', newTags, { shouldValidate: true, shouldDirty: true })
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
        if (errors.tags) {
          clearErrors('tags')
        }
      }
    },
    [addTag, errors.tags, clearErrors]
  )

  const handleRemoveTag = useCallback(
    tagToRemove => {
      removeTag(tagToRemove)
    },
    [removeTag]
  )

  const descriptionValue = watch('description') || ''
  const descriptionMinLength = 40
  const descriptionMaxLength = 500

  const maxTagsReached = (tags || []).length >= 10

  const onSubmit = useCallback(
    async data => {
      const result = await saveStepData({
        stepNumber: 2,
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
        <Accordion variant='splitted'>
          <AccordionItem
            key='profile-tips'
            aria-label='Tips para descripción'
            classNames={{
              trigger: 'p-1',
              base: 'bg-purple-500/10 border border-purple-500/20',
              title: 'text-purple-300 text-sm',
              content: 'text-sm'
            }}
            startContent={<Sparkles aria-hidden='true' className='text-purple-300 text-xl pt-1' />}
            title='Tips para destacar tu perfil'>
            <ul className='text-purple-200/80 space-y-1 list-disc pl-6'>
              {PROFILE_TIPS.map((tip, index) => (
                <li key={index}>
                  <strong>{tip.label}:</strong> {tip.tip}
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>

        <Controller
          control={control}
          name='description'
          render={({ field }) => (
            <Textarea
              {...field}
              isRequired
              aria-label='Descripción personal'
              description='Cuenta sobre ti: intereses, actividades, aquello que te apasiona.'
              errorMessage={errors.description?.message}
              isInvalid={!!errors.description}
              label='Descripción'
              maxLength={descriptionMaxLength}
              minRows={4}
              placeholder='Ejemplo: Amo servir en mi iglesia, disfruto la fotografía y la música. Busco construir algo significativo con alguien que valore la fe y la honestidad...'
              variant='bordered'
              onChange={e => {
                field.onChange(e)
                if (errors.description) {
                  clearErrors('description')
                }
              }}
            />
          )}
        />

        <div className='flex justify-between items-center text-sm text-gray-400'>
          <span>Mínimo {descriptionMinLength} caracteres</span>
          <span>
            {descriptionValue.length}/{descriptionMaxLength}
          </span>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Controller
            control={control}
            name='genderId'
            render={({ field }) => (
              <Select
                isRequired
                aria-label='Seleccionar género'
                errorMessage={errors.genderId?.message}
                isInvalid={!!errors.genderId}
                label='Género'
                placeholder='Selecciona tu género'
                selectedKeys={field.value ? [field.value.toString()] : []}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey) : null)
                }}>
                {genderOptions.map(option => (
                  <SelectItem key={option.key} textValue={option.label}>
                    {option.label}
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
                aria-label='Seleccionar estado civil'
                errorMessage={errors.maritalStatusId?.message}
                isInvalid={!!errors.maritalStatusId}
                label='Estado civil'
                placeholder='Selecciona tu estado civil'
                selectedKeys={field.value ? [field.value.toString()] : []}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey) : null)
                }}>
                {maritalStatusOptions.map(option => (
                  <SelectItem key={option.key} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            control={control}
            name='educationLevelId'
            render={({ field }) => (
              <Select
                aria-label='Seleccionar nivel educativo'
                errorMessage={errors.educationLevelId?.message}
                isInvalid={!!errors.educationLevelId}
                label='Nivel educativo'
                placeholder='Selecciona tu nivel educativo'
                selectedKeys={field.value ? [field.value.toString()] : []}
                variant='underlined'
                onSelectionChange={keys => {
                  const selectedKey = Array.from(keys)[0]

                  field.onChange(selectedKey ? parseInt(selectedKey) : null)
                }}>
                {educationLevelOptions.map(option => (
                  <SelectItem key={option.key} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>

        <Controller
          control={control}
          name='profession'
          render={({ field }) => (
            <Input
              {...field}
              aria-label='Profesión u ocupación'
              errorMessage={errors.profession?.message}
              id='profession-input'
              isInvalid={!!errors.profession}
              label='Profesión / Ocupación'
              placeholder='Ej. Ingeniero civil, Diseñadora UX, Emprendedor, etc.'
              variant='underlined'
            />
          )}
        />
      </section>

      <section className='space-y-6'>
        <div className='flex items-center gap-3'>
          <Ruler className='text-blue-300' size={20} />
          <div>
            <p className='text-gray-200 font-medium text-sm'>Tu estatura</p>
            <p className='text-gray-400 text-xs'>Ayuda a crear mejores matches</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center'>
          <Controller
            control={control}
            name='height'
            render={({ field }) => (
              <Slider
                {...field}
                aria-label='Estatura'
                maxValue={220}
                minValue={140}
                step={1}
                value={field.value || 170}
                onChange={value => {
                  field.onChange(value)
                  setHeightInput(value.toString())
                }}
              />
            )}
          />

          <Input
            aria-label='Estatura en centímetros'
            className='max-w-[120px]'
            placeholder='170'
            value={heightInput}
            variant='bordered'
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '')

              setHeightInput(value)
              const parsed = parseInt(value, 10)

              if (!Number.isNaN(parsed)) {
                formHandlers.handleInputChange('height', parsed)
              }
            }}
          />
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Tag className='text-yellow-300' size={20} />
          <div>
            <p className='text-gray-200 font-medium text-sm'>Intereses y gustos</p>
            <p className='text-gray-400 text-xs'>Agrega hasta 10 intereses que te representen</p>
          </div>
        </div>

        <Autocomplete
          aria-label='Buscar intereses'
          inputValue={tagQuery}
          isLoading={searchLoading}
          label='Buscar intereses'
          placeholder='Escribe para buscar intereses...'
          startContent={<Brain className='text-gray-400' size={16} />}
          variant='bordered'
          onInputChange={handleTagSearch}
          onSelectionChange={key => {
            const option = tagData.options.find(opt => opt.key === key)

            if (option) {
              handleAddTag(option.label)
            }
          }}>
          {tagData.options.map(option => (
            <AutocompleteItem key={option.key} textValue={option.label}>
              {option.label}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        <div className='flex flex-wrap gap-2'>
          {(tags || []).map(tag => (
            <Chip key={tag} color='primary' variant='flat' onClose={() => handleRemoveTag(tag)}>
              {tag}
            </Chip>
          ))}
          {!tags?.length && <span className='text-gray-400 text-sm'>Aún no agregas intereses</span>}
        </div>

        <div className='flex flex-wrap gap-2'>
          {tagData.suggested.slice(0, 6).map(suggestedTag => (
            <Button
              key={suggestedTag}
              color='secondary'
              isDisabled={maxTagsReached}
              size='sm'
              variant='flat'
              onPress={() => handleAddTag(suggestedTag)}>
              <Sparkles size={14} />
              <span>{suggestedTag}</span>
            </Button>
          ))}
        </div>

        {errors.tags && <p className='text-sm text-red-400'>{errors.tags.message}</p>}
      </section>

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
    </form>
  )
}

export default memo(StepCharacteristics)
