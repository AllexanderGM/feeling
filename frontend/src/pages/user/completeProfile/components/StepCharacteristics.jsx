import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Textarea,
  Input,
  Select,
  SelectItem,
  Slider,
  Button,
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
  AutocompleteItem
} from '@heroui/react'
import AttributeDetailRenderer from '@components/ui/AttributeDetailRenderer.jsx'
import { API_URL } from '@config/config'

const PROFILE_TIPS = [
  { label: 'Descripción auténtica', tip: 'Sé auténtico en tu descripción - muestra tu personalidad real' },
  { label: 'Intereses específicos', tip: 'Agrega intereses específicos para mejores conexiones y matches' },
  { label: 'Sugerencias rápidas', tip: 'Haz clic en las sugerencias para agregarlas rápidamente a tu perfil' },
  { label: 'Información completa', tip: 'Completa toda la información para mejores matches' },
  { label: 'Sé específico', tip: 'Menciona hobbies concretos en lugar de términos generales como "música"' },
  { label: 'Evita negatividad', tip: 'Enfócate en lo que te gusta, no en lo que no quieres' }
]

const StepCharacteristics = ({ formData, errors, updateFormData, updateErrors, userAttributes, userTags }) => {
  // ========================================
  // Hooks y estado local
  // ========================================
  const {
    maritalStatusOptions,
    educationLevelOptions,
    genderOptions,
    eyeColorOptions,
    hairColorOptions,
    bodyTypeOptions,
    isColor,
    createAttribute
  } = userAttributes
  const { popularTags, searchTags, searchResults } = userTags
  const {
    height,
    tags,
    categoryInterest,
    description,
    genderId,
    maritalStatusId,
    educationLevelId,
    profession,
    bodyTypeId,
    eyeColorId,
    hairColorId
  } = formData

  // Estados locales para gestión de tags
  const [categorySuggestions, setCategorySuggestions] = useState([])
  const [tagQuery, setTagQuery] = useState('')
  const [showingSuggestions, setShowingSuggestions] = useState(true)

  // Estado para la estatura
  const [heightInput, setHeightInput] = useState(height?.toString() || '')

  // Estado para el modal de agregar atributo
  const [addAttributeModal, setAddAttributeModal] = useState({
    isOpen: false,
    type: null,
    isLoading: false,
    error: null,
    data: {
      name: '',
      detail: '#000000'
    }
  })

  // ========================================
  // Funciones auxiliares y memoizados
  // ========================================

  // Obtener token de autenticación
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  }, [])

  // Función helper para validar keys de Select
  const getValidSelectedKeys = useCallback((value, collection) => {
    if (!value) return []
    const exists = collection.some(item => item.key === value)
    return exists ? [value] : []
  }, [])

  // Tags sugeridos combinando backend y categoría específica
  const suggestedTags = useMemo(() => {
    // Priorizar sugerencias por categoría si están disponibles
    const categoryTags = categorySuggestions.map(tag => tag.name || tag.tagName || tag)

    // Tags hardcodeados como fallback
    const fallbackTagsByCategory = {
      romantic: ['Romance', 'Citas', 'Relación seria', 'Compromiso', 'Amor', 'Fidelidad', 'Matrimonio'],
      friendship: ['Amistad', 'Compañerismo', 'Conversación', 'Actividades', 'Hobbies', 'Socializar'],
      professional: ['Networking', 'Carrera', 'Negocios', 'Emprendimiento', 'Mentor', 'Colaboración'],
      casual: ['Diversión', 'Sin compromiso', 'Flexibilidad', 'Aventura', 'Espontáneo']
    }

    const fallbackTags = fallbackTagsByCategory[categoryInterest] || []

    // Combinar con tags populares del backend
    const backendTags = popularTags.slice(0, 10).map(tag => tag.name || tag.tagName || tag.label || tag)

    // Priorizar: categoría del backend > fallback de categoría > populares
    const allSuggestions = [...new Set([...categoryTags, ...fallbackTags, ...backendTags])]

    // Filtrar tags ya seleccionados
    return allSuggestions.filter(tag => !tags.includes(tag))
  }, [categoryInterest, popularTags, tags, categorySuggestions])

  // Opciones de tags para el autocomplete

  const getSuggestedTagOptions = useCallback(() => {
    return suggestedTags.slice(0, 15).map(tag => ({
      key: tag,
      name: tag,
      label: tag
    }))
  }, [suggestedTags])

  const getSearchResultTagOptions = useCallback(() => {
    return (searchResults || []).map(tag => ({
      key: tag.id || tag.name || tag.tagName || tag,
      name: tag.name || tag.tagName || tag.label || tag,
      label: tag.name || tag.tagName || tag.label || tag
    }))
  }, [searchResults])

  const tagOptions = useMemo(() => {
    return showingSuggestions ? getSuggestedTagOptions() : getSearchResultTagOptions()
  }, [showingSuggestions, getSuggestedTagOptions, getSearchResultTagOptions])

  // ========================================
  // Manejadores principales
  // ========================================

  // Manejador de cambio con limpieza de errores
  const handleInputChange = useCallback(
    (field, value) => {
      updateFormData(field, value)

      // Limpiar error del campo si existe
      if (errors[field]) {
        updateErrors({ ...errors, [field]: null })
      }
    },
    [updateFormData, updateErrors, errors]
  )

  // Manejador específico para la estatura desde input
  const handleHeightInputChange = useCallback(
    value => {
      setHeightInput(value)
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue >= 140 && numValue <= 220) {
        handleInputChange('height', numValue)
      }
    },
    [handleInputChange]
  )

  // Manejador específico para la estatura desde slider
  const handleHeightSliderChange = useCallback(
    value => {
      setHeightInput(value.toString())
      handleInputChange('height', value)
    },
    [handleInputChange]
  )

  // ========================================
  // Manejadores de tags
  // ========================================

  const addTag = useCallback(
    tag => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
        updateFormData('tags', [...tags, trimmedTag])
      }
    },
    [tags, updateFormData]
  )

  const removeTag = useCallback(
    tagToRemove => {
      updateFormData(
        'tags',
        tags.filter(tag => tag !== tagToRemove)
      )
    },
    [tags, updateFormData]
  )

  // Buscar tags cuando cambia el query
  const handleTagSearch = useCallback(
    async query => {
      setTagQuery(query)
      if (query.trim()) {
        setShowingSuggestions(false)
        await searchTags(query, 20)
      } else {
        setShowingSuggestions(true)
      }
    },
    [searchTags]
  )

  // Agregar tag desde autocomplete o sugerencia
  const handleAddTag = useCallback(
    tagValue => {
      const trimmedTag =
        typeof tagValue === 'string' ? tagValue.trim() : (tagValue?.name || tagValue?.tagName || tagValue?.label || '').trim()

      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
        addTag(trimmedTag)
        setTagQuery('') // Limpiar input

        // Limpiar error de tags si existe
        if (errors.tags) {
          updateErrors({ ...errors, tags: null })
        }
      }
    },
    [tags, addTag, errors, updateErrors]
  )

  // Remover tag
  const handleRemoveTag = useCallback(
    tagToRemove => {
      removeTag(tagToRemove)
    },
    [removeTag]
  )

  // ========================================
  // Manejadores del modal de atributos
  // ========================================

  const openAddAttributeModal = useCallback(type => {
    setAddAttributeModal({
      isOpen: true,
      type,
      isLoading: false,
      error: null,
      data: {
        name: '',
        detail: type === 'eye' || type === 'hair' ? '#000000' : ''
      }
    })
  }, [])

  const closeAddAttributeModal = useCallback(() => {
    setAddAttributeModal({
      isOpen: false,
      type: null,
      isLoading: false,
      error: null,
      data: {
        name: '',
        detail: '#000000'
      }
    })
  }, [])

  const handleAddAttributeInputChange = useCallback((field, value) => {
    setAddAttributeModal(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }))
  }, [])

  const handleSubmitNewAttribute = useCallback(async () => {
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

      // Mostrar mensaje de éxito
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
  }, [addAttributeModal, createAttribute, handleInputChange, closeAddAttributeModal])

  // ========================================
  // Efectos
  // ========================================

  // Cargar sugerencias por categoría si hay token
  useEffect(() => {
    const fetchCategorySuggestions = async () => {
      const token = getAuthToken()

      if (!token || !categoryInterest) {
        setCategorySuggestions([])
        return
      }

      try {
        const response = await fetch(`${API_URL}/tags/popular/category/${categoryInterest}?limit=15`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCategorySuggestions(data || [])
        }
      } catch (error) {
        console.error('Error fetching category suggestions:', error)
        setCategorySuggestions([])
      }
    }

    fetchCategorySuggestions()
  }, [categoryInterest, getAuthToken])

  // ========================================
  // Funciones de renderizado repetidas
  // ========================================

  const renderColorSelector = useCallback(
    (options, selectedId, fieldName, type, label) => {
      return (
        <div className="space-y-2">
          <label className="text-sm text-gray-400">{label}</label>
          <div className="flex flex-wrap gap-2">
            {options.map(option => (
              <Badge
                key={option.key}
                content={<span className="text-white text-xs">✓</span>}
                shape="circle"
                isInvisible={selectedId !== parseInt(option.key)}>
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
                    onPress={() => handleInputChange(fieldName, parseInt(option.key))}
                    aria-label={`Seleccionar ${label.toLowerCase()} ${option.label}`}
                    radius={type === 'eye' ? 'full' : 'lg'}
                    isIconOnly
                    color="neutral"
                    className={`
                    relative group transition-all duration-200 border-2 shadow-md
                    ${selectedId === parseInt(option.key) ? 'scale-110' : 'hover:scale-105'}
                    ${selectedId === parseInt(option.key) ? 'border-gray-300' : 'border-gray-600 hover:border-gray-500'}
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

            {/* Botón para agregar nuevo */}
            <Button
              size="sm"
              variant="bordered"
              onPress={() => openAddAttributeModal(type)}
              radius={type === 'eye' ? 'full' : 'lg'}
              color="primary"
              isIconOnly
              aria-label={`Agregar nuevo ${label.toLowerCase()}`}
              className="border-2 border-dashed border-gray-600 flex items-center justify-center
                hover:border-primary-500 transition-all duration-200
                hover:bg-primary-500/10 group">
              <span className="text-gray-500 group-hover:text-primary-400 text-lg pb-1">+</span>
            </Button>
          </div>
          {errors[fieldName] && <p className="text-red-400 text-sm">{errors[fieldName]}</p>}
        </div>
      )
    },
    [handleInputChange, openAddAttributeModal, isColor, errors]
  )

  // ========================================
  // Render principal
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center">
        <h2 className="text-xl font-bold text-gray-200">Cuéntanos sobre ti</h2>
        <p className="text-gray-400 mt-2">Esta información ayuda a otros usuarios a conocerte mejor</p>
      </header>

      <section className="space-y-4">
        {/* Descripción personal */}
        <Textarea
          variant="bordered"
          isRequired
          label="Descripción personal"
          placeholder="Cuéntanos sobre ti, tus intereses, lo que buscas y qué te hace único..."
          value={description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          isInvalid={!!errors.description}
          errorMessage={errors.description}
          data-invalid={!!errors.description}
          minRows={3}
          maxRows={6}
          maxLength={500}
          description={`${(description || '').length}/500 caracteres`}
          classNames={{
            input: 'text-gray-200',
            inputWrapper: 'bg-gray-800/30'
          }}
        />

        {/* Tips para el perfil */}
        <Accordion variant="splitted" className="mt-6 px-0">
          <AccordionItem
            key="profile-tips"
            aria-label="Tips para tu perfil"
            startContent={<span className="material-symbols-outlined text-blue-400 text-xl pt-1">psychology</span>}
            title="Tips para tu perfil"
            classNames={{
              trigger: 'p-1',
              base: 'bg-blue-500/10 border border-blue-500/20',
              title: 'text-blue-400 text-sm',
              content: 'text-sm'
            }}>
            <ul className="text-blue-300/80 space-y-1 list-disc pl-5">
              {PROFILE_TIPS.map((tip, index) => (
                <li key={index}>
                  <strong>{tip.label}:</strong> {tip.tip}
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>

        {/* Sección de intereses y tags */}
        <div className="space-y-2">
          <Autocomplete
            label="Agregar intereses"
            variant="underlined"
            isRequired
            placeholder="Busca y agrega tus intereses..."
            inputValue={tagQuery}
            onInputChange={handleTagSearch}
            onSelectionChange={key => {
              if (key) {
                const selectedTag = tagOptions.find(option => option.key === key)
                if (selectedTag) {
                  handleAddTag(selectedTag.name)
                }
              }
            }}
            isInvalid={!!errors.tags}
            errorMessage={errors.tags}
            allowsCustomValue={true}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagQuery.trim()) {
                e.preventDefault()
                handleAddTag(tagQuery)
              }
            }}
            startContent={<span className="material-symbols-outlined text-sm">interests</span>}
            classNames={{
              base: 'max-w-full',
              listboxWrapper: 'max-h-72',
              popoverContent: 'w-full'
            }}>
            {tagOptions.map(tag => (
              <AutocompleteItem key={tag.key} textValue={tag.name} className="text-gray-200 data-[hover=true]:bg-gray-700">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-400 text-sm">tag</span>
                  <span>{tag.name}</span>
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>

          {/* Tags seleccionados */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <Chip key={index} onClose={() => handleRemoveTag(tag)} variant="flat" color="primary" className="cursor-pointer">
                  {tag}
                </Chip>
              ))}
            </div>
          )}

          {/* Tags sugeridos */}
          {suggestedTags.length > 0 && tags.length < 10 && showingSuggestions && (
            <div className="space-y-2 mt-4">
              <p className="text-xs text-gray-400">Sugerencias {categoryInterest ? `para tu categoría` : 'populares'}:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.slice(0, 7).map(tag => (
                  <Chip
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    variant="bordered"
                    className="cursor-pointer hover:bg-primary-500/10 hover:border-primary-500/50 transition-colors">
                    + {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Contador de tags */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{tags.length}/10 intereses</span>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Género */}
          <Select
            label="Seleccionar género"
            placeholder="Selecciona tu género"
            isRequired
            selectedKeys={getValidSelectedKeys(genderId, genderOptions)}
            onSelectionChange={keys => {
              const selectedKey = Array.from(keys)[0]
              handleInputChange('genderId', selectedKey)
            }}
            isInvalid={!!errors.genderId}
            errorMessage={errors.genderId}
            variant="underlined"
            renderValue={items => {
              return items.map(item => {
                const option = genderOptions.find(opt => opt.key === item.key)
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <AttributeDetailRenderer detail={option?.detail} size="sm" />
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

          {/* Estado civil */}
          <Select
            variant="underlined"
            label="Estado civil"
            placeholder="Selecciona tu estado civil"
            selectedKeys={getValidSelectedKeys(maritalStatusId, maritalStatusOptions)}
            onSelectionChange={keys => handleInputChange('maritalStatusId', Array.from(keys)[0])}
            isInvalid={!!errors.maritalStatusId}
            errorMessage={errors.maritalStatusId}
            data-invalid={!!errors.maritalStatusId}
            startContent={<span className="material-symbols-outlined text-sm">person_heart</span>}
            renderValue={items => {
              return items.map(item => {
                const option = maritalStatusOptions.find(opt => opt.key === item.key)
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <AttributeDetailRenderer detail={option?.detail} size="sm" />
                    <span>{option?.label}</span>
                  </div>
                )
              })
            }}>
            {maritalStatusOptions.map(option => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nivel de estudios */}
          <Select
            variant="underlined"
            label="Nivel de estudios"
            placeholder="Selecciona tu nivel educativo"
            selectedKeys={getValidSelectedKeys(educationLevelId, educationLevelOptions)}
            onSelectionChange={keys => handleInputChange('educationLevelId', Array.from(keys)[0])}
            isInvalid={!!errors.educationLevelId}
            errorMessage={errors.educationLevelId}
            data-invalid={!!errors.educationLevelId}
            startContent={<span className="material-symbols-outlined text-sm">school</span>}
            renderValue={items => {
              return items.map(item => {
                const option = educationLevelOptions.find(opt => opt.key === item.key)
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <AttributeDetailRenderer detail={option?.detail} size="sm" />
                    <span>{option?.label}</span>
                  </div>
                )
              })
            }}>
            {educationLevelOptions.map(option => (
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

          {/* Profesión */}
          <Input
            variant="underlined"
            label="Profesión"
            placeholder="Tu profesión u ocupación"
            value={profession || ''}
            onChange={e => handleInputChange('profession', e.target.value)}
            isInvalid={!!errors.profession}
            errorMessage={errors.profession}
            data-invalid={!!errors.profession}
            startContent={<span className="material-symbols-outlined text-sm">business_center</span>}
          />
        </div>

        {/* Información física */}
        {/* Tipo de cuerpo */}
        <Select
          variant="underlined"
          label="Seleccionar tipo de cuerpo"
          placeholder="Selecciona tu tipo de cuerpo"
          selectedKeys={getValidSelectedKeys(bodyTypeId?.toString(), bodyTypeOptions)}
          onSelectionChange={keys => {
            const selectedKey = Array.from(keys)[0]
            if (selectedKey) {
              handleInputChange('bodyTypeId', parseInt(selectedKey))
            }
          }}
          isInvalid={!!errors.bodyTypeId}
          errorMessage={errors.bodyTypeId}
          startContent={<span className="material-symbols-outlined text-sm">accessibility</span>}
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
            isInvalid={!!errors.height}
            errorMessage={errors.height}
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
            color="primary"
            minValue={140}
            maxValue={220}
            value={height || 170}
            onChange={handleHeightSliderChange}
            aria-label="Seleccionar estatura en centímetros"
            showTooltip={true}
          />
        </div>

        {/* Colores de ojos y cabello */}
        {renderColorSelector(eyeColorOptions, eyeColorId, 'eyeColorId', 'eye', 'Color de ojos')}
        {renderColorSelector(hairColorOptions, hairColorId, 'hairColorId', 'hair', 'Color de cabello')}
      </section>

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

export default StepCharacteristics
