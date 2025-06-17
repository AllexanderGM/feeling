import { useState } from 'react'

const useImageManager = (initialData = {}) => {
  const [formData, setFormData] = useState({
    profileImage: null,
    profileImageUrl: '',
    additionalImages: [null, null, null],
    additionalImageUrls: ['', '', ''],
    selectedProfileImageIndex: 0,
    ...initialData
  })

  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingAdditional, setIsDraggingAdditional] = useState([false, false, false])

  // Función para procesar archivos de imagen
  const processImageFile = (file, type = 'main', additionalIndex = null) => {
    if (!file.type.startsWith('image/')) {
      const errorKey = type === 'main' ? 'profileImage' : `additionalImage${additionalIndex}`
      setErrors(prev => ({ ...prev, [errorKey]: 'Por favor selecciona una imagen válida' }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorKey = type === 'main' ? 'profileImage' : `additionalImage${additionalIndex}`
      setErrors(prev => ({ ...prev, [errorKey]: 'La imagen no puede superar los 5MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      if (type === 'main') {
        setFormData(prev => ({
          ...prev,
          profileImage: file,
          profileImageUrl: e.target.result
        }))

        if (errors.profileImage) {
          setErrors(prev => ({ ...prev, profileImage: null }))
        }
      } else {
        const newAdditionalImages = [...formData.additionalImages]
        const newAdditionalUrls = [...formData.additionalImageUrls]

        newAdditionalImages[additionalIndex] = file
        newAdditionalUrls[additionalIndex] = e.target.result

        setFormData(prev => ({
          ...prev,
          additionalImages: newAdditionalImages,
          additionalImageUrls: newAdditionalUrls
        }))

        const errorKey = `additionalImage${additionalIndex}`
        if (errors[errorKey]) {
          setErrors(prev => ({ ...prev, [errorKey]: null }))
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Handlers de archivos
  const handleFileChange = event => {
    const file = event.target.files[0]
    if (file) {
      processImageFile(file, 'main')
    }
  }

  const handleAdditionalFileChange = (index, event) => {
    const file = event.target.files[0]
    if (file) {
      processImageFile(file, 'additional', index)
    }
  }

  // Handlers de drag & drop
  const handleDragOver = e => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0], 'main')
    }
  }

  const handleAdditionalDragOver = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = true
    setIsDraggingAdditional(newDragging)
  }

  const handleAdditionalDragLeave = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = false
    setIsDraggingAdditional(newDragging)
  }

  const handleAdditionalDrop = (index, e) => {
    e.preventDefault()
    const newDragging = [...isDraggingAdditional]
    newDragging[index] = false
    setIsDraggingAdditional(newDragging)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processImageFile(files[0], 'additional', index)
    }
  }

  // Funciones para obtener todas las imágenes organizadas
  const getAllImagesArray = () => {
    const images = []

    if (formData.profileImageUrl) {
      images.push({
        url: formData.profileImageUrl,
        file: formData.profileImage,
        position: 0,
        type: 'main',
        id: 'main'
      })
    }

    formData.additionalImageUrls.forEach((url, index) => {
      if (url) {
        images.push({
          url,
          file: formData.additionalImages[index],
          position: index + 1,
          type: 'additional',
          id: `additional-${index}`
        })
      }
    })

    return images
  }

  // Función para intercambiar imágenes
  const swapImages = selectedIndex => {
    if (selectedIndex === 0) return

    const currentMainUrl = formData.profileImageUrl
    const currentMainFile = formData.profileImage

    const additionalIndex = selectedIndex - 1
    const selectedUrl = formData.additionalImageUrls[additionalIndex]
    const selectedFile = formData.additionalImages[additionalIndex]

    const newAdditionalImages = [...formData.additionalImages]
    const newAdditionalUrls = [...formData.additionalImageUrls]

    newAdditionalUrls[additionalIndex] = currentMainUrl
    newAdditionalImages[additionalIndex] = currentMainFile

    setFormData(prev => ({
      ...prev,
      profileImageUrl: selectedUrl,
      profileImage: selectedFile,
      additionalImageUrls: newAdditionalUrls,
      additionalImages: newAdditionalImages,
      selectedProfileImageIndex: 0
    }))
  }

  // Función para eliminar imagen
  const removeImageAtPosition = position => {
    if (position === 0) {
      const firstAdditionalIndex = formData.additionalImageUrls.findIndex(url => url !== '')

      if (firstAdditionalIndex !== -1) {
        const newAdditionalImages = [...formData.additionalImages]
        const newAdditionalUrls = [...formData.additionalImageUrls]

        const promotedUrl = newAdditionalUrls[firstAdditionalIndex]
        const promotedFile = newAdditionalImages[firstAdditionalIndex]

        newAdditionalUrls[firstAdditionalIndex] = ''
        newAdditionalImages[firstAdditionalIndex] = null

        setFormData(prev => ({
          ...prev,
          profileImageUrl: promotedUrl,
          profileImage: promotedFile,
          additionalImageUrls: newAdditionalUrls,
          additionalImages: newAdditionalImages,
          selectedProfileImageIndex: 0
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          profileImage: null,
          profileImageUrl: '',
          selectedProfileImageIndex: 0
        }))
      }
    } else {
      const additionalIndex = position - 1
      const newAdditionalImages = [...formData.additionalImages]
      const newAdditionalUrls = [...formData.additionalImageUrls]

      newAdditionalImages[additionalIndex] = null
      newAdditionalUrls[additionalIndex] = ''

      setFormData(prev => ({
        ...prev,
        additionalImages: newAdditionalImages,
        additionalImageUrls: newAdditionalUrls,
        selectedProfileImageIndex: prev.selectedProfileImageIndex === position ? 0 : prev.selectedProfileImageIndex
      }))
    }
  }

  // Funciones utilitarias
  const getImageStatus = position => {
    const isMain = position === 0
    const isSelected = formData.selectedProfileImageIndex === position
    const hasImage = position === 0 ? formData.profileImageUrl : formData.additionalImageUrls[position - 1]

    return {
      isMain,
      isSelected,
      hasImage: !!hasImage,
      canPromote: !isMain && hasImage && !isSelected,
      canDemote: isMain && hasImage
    }
  }

  const getImageUrlByPosition = position => {
    if (position === 0) {
      return formData.profileImageUrl
    }
    return formData.additionalImageUrls[position - 1] || ''
  }

  const getCurrentProfileImageUrl = () => {
    return formData.profileImageUrl || ''
  }

  // Función para actualizar datos del formulario externamente
  const updateFormData = newData => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  // Función para limpiar errores
  const clearError = field => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return {
    // Estados
    formData,
    errors,
    isDragging,
    isDraggingAdditional,

    // Handlers de archivos
    handleFileChange,
    handleAdditionalFileChange,

    // Handlers de drag & drop
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAdditionalDragOver,
    handleAdditionalDragLeave,
    handleAdditionalDrop,

    // Funciones de gestión de imágenes
    getAllImagesArray,
    swapImages,
    removeImageAtPosition,
    getImageStatus,
    getImageUrlByPosition,
    getCurrentProfileImageUrl,

    // Funciones utilitarias
    updateFormData,
    clearError,
    setErrors
  }
}

export default useImageManager
