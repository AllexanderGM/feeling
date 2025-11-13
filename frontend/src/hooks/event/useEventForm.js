import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { eventFormSchema } from '@schemas'
import { DEFAULT_EVENT_FORM_VALUES, EVENT_CATEGORIES } from '@constants/events.js'
import { usePersistentImages } from '@pages/user/complete/hooks/usePersistentImages'
import { convertTimestamp, isTimestampArray } from '@utils/convertTimestamp.js'

const MAX_GALLERY_IMAGES = 5
const MIN_EVENT_LEAD_MINUTES = 60

const clampToLocalDateTime = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const normalizeInputDateValue = rawValue => {
  if (!rawValue) return ''

  // Si es array (formato backend), convertir usando la utilidad
  if (isTimestampArray(rawValue)) {
    const isoString = convertTimestamp(rawValue)

    if (!isoString) return ''

    const date = new Date(isoString)

    return clampToLocalDateTime(date)
  }

  // Si es string ISO, parsear
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim()

    if (!trimmed) return ''

    const parsed = new Date(trimmed)

    if (Number.isNaN(parsed.getTime())) return ''

    return clampToLocalDateTime(parsed)
  }

  // Si es Date object
  if (rawValue instanceof Date) {
    if (Number.isNaN(rawValue.getTime())) return ''

    return clampToLocalDateTime(rawValue)
  }

  return ''
}

const formatEventDateForSubmit = value => {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.length === 16 ? `${value}:00` : value
  }

  return value
}

const getMinDateTimeValue = () => {
  const now = new Date()

  now.setMinutes(now.getMinutes() + MIN_EVENT_LEAD_MINUTES)

  return clampToLocalDateTime(now)
}

const buildInitialFormState = (mode, eventData) => {
  if (mode !== 'edit' || !eventData) {
    console.log('🔴 buildInitialFormState - Returning DEFAULT values:', { mode, hasEventData: !!eventData })

    return { ...DEFAULT_EVENT_FORM_VALUES }
  }

  // Helper para valores que pueden ser null
  const safeString = value => (value !== null && value !== undefined ? String(value) : '')

  const normalizedDate = normalizeInputDateValue(eventData.eventDate)

  console.log('🟣 buildInitialFormState - Converting eventDate:', {
    raw: eventData.eventDate,
    normalized: normalizedDate
  })

  const result = {
    title: safeString(eventData.title),
    description: safeString(eventData.description),
    eventDate: normalizedDate,
    location: safeString(eventData.location),
    price: eventData.price !== undefined && eventData.price !== null ? eventData.price : '',
    maxCapacity: eventData.maxCapacity !== undefined && eventData.maxCapacity !== null ? eventData.maxCapacity : '',
    category: eventData.category || '',
    seoTitle: safeString(eventData.seoTitle),
    seoDescription: safeString(eventData.seoDescription),
    seoKeywords: safeString(eventData.seoKeywords),
    seoImage: safeString(eventData.seoImage)
  }

  console.log('🟣 buildInitialFormState - Result:', result)

  return result
}

const buildInitialGallery = eventData => {
  if (!eventData) return []

  const gallery = [
    eventData.mainImage || eventData.mainImageUrl || null,
    ...(Array.isArray(eventData.images) ? eventData.images : [])
  ].filter(Boolean)

  return [...new Set(gallery)].slice(0, MAX_GALLERY_IMAGES)
}

export const useEventForm = ({ mode = 'create', eventData = null, onSubmit, isOpen = false }) => {
  const isEditMode = mode === 'edit'
  const imageManagerRef = useRef(null)

  // Serialize eventData for memoization
  const eventDataKey = useMemo(() => {
    if (!eventData) return 'null'

    return JSON.stringify({
      id: eventData.id,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      eventDate: eventData.eventDate,
      price: eventData.price,
      maxCapacity: eventData.maxCapacity,
      category: eventData.category
    })
  }, [eventData])

  // Memoized form values - will update when eventData changes
  const formInitialValues = useMemo(() => {
    const values = buildInitialFormState(mode, eventData)

    console.log('🔵 useEventForm - formInitialValues recalculated:', {
      mode,
      eventDataKey,
      hasEventData: !!eventData,
      eventData: eventData,
      values: values
    })

    return values
  }, [mode, eventDataKey, eventData])

  // Default values for useForm initialization
  const defaultValues = useMemo(() => {
    return { ...formInitialValues }
  }, [formInitialValues])

  // React Hook Form setup
  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors: formErrors },
    setValue,
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(eventFormSchema),
    mode: 'onChange',
    defaultValues
  })

  const formValues = watch()

  // Initial images from eventData
  const initialEventImages = useMemo(() => buildInitialGallery(eventData), [eventData])

  // Image validation state
  const [imageValidationState, setImageValidationState] = useState({
    hasErrors: false,
    imageCount: initialEventImages.length,
    errors: {}
  })
  const [imageManagerKey, setImageManagerKey] = useState(0)
  const [internalImages, setInternalImages] = useState([])

  // Callback for image validation
  const handleImageValidationChange = useCallback(
    ({ hasErrors, imageCount, errors: validationErrors }) => {
      setImageValidationState({ hasErrors, imageCount, errors: validationErrors || {} })

      if (hasErrors && validationErrors) {
        const firstError = Object.values(validationErrors).find(Boolean)

        if (firstError) {
          setError('images', { message: firstError })
        }
      } else if (!hasErrors && imageCount > 0) {
        clearErrors('images')
      } else if (imageCount === 0) {
        setError('images', {
          message: isEditMode ? 'Debes mantener al menos una imagen del evento' : 'Debes subir al menos una imagen del evento'
        })
      }
    },
    [isEditMode, setError, clearErrors]
  )

  // Callback to update internal images state
  const handleInternalImagesChange = useCallback(
    images => {
      setInternalImages(images)
      setImageManagerKey(prev => prev + 1)

      if (images && images.length > 0) {
        clearErrors('images')
      }
    },
    [clearErrors]
  )

  // Use persistent images hook
  const {
    fileObjects: persistentFileObjects,
    handleImagesChange: handlePersistentImagesChange,
    hasInitialized
  } = usePersistentImages(initialEventImages, handleInternalImagesChange, {
    onValidationChange: handleImageValidationChange
  })

  // Reset form when modal opens or when event data changes
  useEffect(() => {
    console.log('🟢 useEventForm - useEffect triggered:', {
      isOpen,
      formInitialValues,
      initialEventImagesLength: initialEventImages.length
    })

    if (!isOpen) return

    console.log('🟡 useEventForm - Calling reset() with:', formInitialValues)
    reset(formInitialValues, { keepDefaultValues: false })
    setImageValidationState({
      hasErrors: false,
      imageCount: initialEventImages.length,
      errors: {}
    })
    setImageManagerKey(prev => prev + 1)
  }, [isOpen, formInitialValues, initialEventImages.length, reset])

  const getImageRequirementMessage = useCallback(() => {
    return isEditMode ? 'Debes mantener al menos una imagen del evento' : 'Debes subir al menos una imagen del evento'
  }, [isEditMode])

  // Form submission
  const onSubmitForm = useCallback(
    (formData, action) => {
      console.log('🚀 useEventForm - onSubmitForm called:', {
        action,
        formData,
        isEditMode
      })

      const currentImages = imageManagerRef.current?.getImages?.() ?? internalImages
      const orderedImages = Array.isArray(currentImages) ? currentImages.filter(Boolean) : []

      console.log('🖼️ useEventForm - Images for submission:', {
        currentImages,
        orderedImages,
        imageCount: orderedImages.length
      })

      if (orderedImages.length === 0) {
        console.log('❌ useEventForm - No images, aborting submit')
        setError('images', { message: getImageRequirementMessage() })

        return
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventDate: formatEventDateForSubmit(formData.eventDate),
        location: formData.location.trim(),
        price: Number(formData.price),
        maxCapacity: Number(formData.maxCapacity),
        category: formData.category,
        seoTitle: formData.seoTitle?.trim() || null,
        seoDescription: formData.seoDescription?.trim() || null,
        seoKeywords: formData.seoKeywords?.trim() || null,
        seoImage: formData.seoImage?.trim() || null
      }

      console.log('📦 useEventForm - Final payload:', {
        action,
        payload,
        mediaCount: orderedImages.length
      })

      if (typeof onSubmit === 'function') {
        onSubmit({
          action,
          eventData: payload,
          media: { orderedImages }
        })
      } else {
        console.log('❌ useEventForm - onSubmit is not a function!')
      }
    },
    [internalImages, getImageRequirementMessage, setError, onSubmit, isEditMode]
  )

  // Handle different submit actions
  const handleSubmitWithAction = useCallback(
    action => {
      handleFormSubmit(formData => onSubmitForm(formData, action))()
    },
    [handleFormSubmit, onSubmitForm]
  )

  // Computed values for preview
  const selectedCategory = useMemo(() => EVENT_CATEGORIES.find(cat => cat.key === formValues.category), [formValues.category])

  const previewPrice = useMemo(() => {
    const priceValue = Number(formValues.price)

    if (Number.isNaN(priceValue)) return null

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(priceValue)
  }, [formValues.price])

  const previewDate = useMemo(() => {
    if (!formValues.eventDate) return null

    const parsed = new Date(formValues.eventDate)

    if (Number.isNaN(parsed.getTime())) return null

    return parsed.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [formValues.eventDate])

  const imageCount = persistentFileObjects.filter(Boolean).length
  const minDateTime = isEditMode ? undefined : getMinDateTimeValue()

  // Image error from formErrors or custom validation
  const imageError =
    formErrors.images?.message || (imageValidationState.hasErrors && Object.values(imageValidationState.errors).find(Boolean))

  return {
    // Form control
    control,
    formValues,
    formErrors,
    setValue,

    // Image management
    imageManagerRef,
    eventImages: persistentFileObjects, // File objects para mostrar en ImageManager
    imageCount,
    imageManagerKey,
    handleImagesChange: handlePersistentImagesChange, // Callback from usePersistentImages
    handleImageValidationChange,
    imageError,
    hasInitialized, // Para saber si las imágenes ya se cargaron

    // Form submission
    handleSubmitWithAction,

    // Computed values
    selectedCategory,
    previewPrice,
    previewDate,
    minDateTime,
    isEditMode
  }
}
