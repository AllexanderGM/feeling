import { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Tabs, Tab } from '@heroui/react'
import { updateTour } from '@services'
import { Logger } from '@utils/logger.js'

import ImageInput from './ImageInput.jsx'
import CountryCitySelector from './CountryCitySelector.jsx'

// Constantes compartidas para categorías, servicios y regiones
const CATEGORIAS = [
  { value: 'BEACH', label: 'Playa' },
  { value: 'VACATION', label: 'Vacaciones' },
  { value: 'ADVENTURE', label: 'Aventura' },
  { value: 'ECOTOURISM', label: 'Ecoturismo' },
  { value: 'LUXURY', label: 'Lujo' },
  { value: 'CITY', label: 'Ciudad' },
  { value: 'MOUNTAIN', label: 'Montaña' },
  { value: 'CRUISE', label: 'Crucero' },
  { value: 'ADRENALIN', label: 'Adrenalina' }
]

const SERVICIOS = [
  {
    value: 'Alojamiento',
    label: 'Alojamiento',
    icon: 'hotel',
    defaultDetails: '2 Alcobas',
    description: 'Hospedaje en hotel, hostal o cabaña'
  },
  {
    value: 'Transporte',
    label: 'Transporte',
    icon: 'directions_car',
    defaultDetails: '2 Vuelos',
    description: 'Traslados terrestres, aéreos o marítimos'
  },
  {
    value: 'Boletos',
    label: 'Boletos',
    icon: 'local_activity',
    defaultDetails: 'Entradas',
    description: 'Tickets de acceso a atracciones o eventos'
  },
  {
    value: 'Snacks',
    label: 'Snacks',
    icon: 'cookie',
    defaultDetails: 'Todo el día',
    description: 'Aperitivos entre comidas'
  },
  {
    value: 'Bebidas',
    label: 'Bebidas',
    icon: 'wine_bar',
    defaultDetails: 'Ilimitadas',
    description: 'Bebidas sin alcohol incluidas en la experiencia'
  },
  {
    value: 'Desayuno',
    label: 'Desayuno',
    icon: 'egg_alt',
    defaultDetails: '7:00 - 9:00',
    description: 'Primera comida del día incluida'
  },
  {
    value: 'Almuerzo',
    label: 'Almuerzo',
    icon: 'dinner_dining',
    defaultDetails: '12:00 - 14:00',
    description: 'Comida principal del mediodía'
  },
  {
    value: 'Cena',
    label: 'Cena',
    icon: 'restaurant',
    defaultDetails: '19:00 - 21:00',
    description: 'Comida de la noche'
  },
  {
    value: 'Guía turístico',
    label: 'Guía turístico',
    icon: 'tour',
    defaultDetails: 'Personal',
    description: 'Acompañamiento profesional durante el recorrido'
  },
  {
    value: 'Seguro de viaje',
    label: 'Seguro de viaje',
    icon: 'health_and_safety',
    defaultDetails: 'Cobertura total',
    description: 'Protección y asistencia durante el viaje'
  },
  {
    value: 'Actividades',
    label: 'Actividades',
    icon: 'theater_comedy',
    defaultDetails: '2 Experiencias',
    description: 'Excursiones, deportes o experiencias guiadas'
  },
  {
    value: 'Fotografías',
    label: 'Fotografías',
    icon: 'photo_camera',
    defaultDetails: 'Sesión',
    description: 'Servicio fotográfico durante la experiencia'
  },
  {
    value: 'Souvenirs',
    label: 'Souvenirs',
    icon: 'redeem',
    defaultDetails: 'Recuerdos',
    description: 'Objetos conmemorativos del destino'
  },
  {
    value: 'Equipamiento',
    label: 'Equipamiento',
    icon: 'hiking',
    defaultDetails: 'Completo',
    description: 'Material necesario para actividades específicas'
  },
  {
    value: 'Wifi',
    label: 'Wifi',
    icon: 'wifi',
    defaultDetails: 'Conexión',
    description: 'Conectividad a internet en el transporte o alojamiento'
  },
  {
    value: 'Propinas',
    label: 'Propinas',
    icon: 'paid',
    defaultDetails: 'Incluidas',
    description: 'Gratificaciones para el personal de servicio'
  },
  {
    value: 'Asistencia 24/7',
    label: 'Asistencia 24/7',
    icon: 'support_agent',
    defaultDetails: '24/7',
    description: 'Ayuda disponible durante toda la experiencia'
  }
]

// Regiones disponibles
const REGIONES = [
  { value: 'Americas', label: 'América' },
  { value: 'Europe', label: 'Europa' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Africa', label: 'África' },
  { value: 'Oceania', label: 'Oceanía' }
]

// Hoteles predefinidos
const PREDEFINED_HOTELS = [
  { id: 1, name: 'Grand Oasis Cancun', stars: 5 },
  { id: 2, name: 'Hotel Caribe', stars: 4 },
  { id: 3, name: 'Ritz Paris', stars: 5 },
  { id: 4, name: 'Hotel Hassler Roma', stars: 5 },
  { id: 5, name: 'Four Seasons Bali', stars: 5 },
  { id: 6, name: 'Plaza Hotel NYC', stars: 5 },
  { id: 7, name: 'Belmond Sanctuary', stars: 5 },
  { id: 8, name: 'Copacabana Palace', stars: 5 },
  { id: 9, name: 'Burj Al Arab', stars: 7 },
  { id: 10, name: 'W Barcelona', stars: 5 }
]

// Función para obtener fecha futura (en días) en formato ISO
const getFutureDateTimeISO = days => {
  const future = new Date()
  future.setDate(future.getDate() + days)
  future.setMinutes(future.getMinutes() - future.getTimezoneOffset())
  return future.toISOString().slice(0, 16)
}

const EditarTourForm = ({ isOpen, onClose, onSuccess, tourData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adultPrice: '',
    childPrice: '',
    images: [''],
    status: 'Disponible',
    tags: [],
    includes: [],
    destination: {
      region: 'Americas',
      country: '',
      city: ''
    },
    hotelName: '',
    hotel: 4,
    //hotelNumber: '',
    availability: [
      {
        availableDate: getFutureDateTimeISO(5),
        availableSlots: 1,
        departureTime: getFutureDateTimeISO(7),
        returnTime: getFutureDateTimeISO(14)
      }
    ]
  })

  // Estado para los detalles de cada servicio incluido
  const [includesDetails, setIncludesDetails] = useState({})
  const [availabilityCount, setAvailabilityCount] = useState(1)

  // Cargar datos del tour cuando cambia tourData
  useEffect(() => {
    if (tourData && isOpen) {
      Logger.info('Cargando datos del tour para editar', Logger.CATEGORIES.UI, { tourId: tourData?.idPaquete })

      // Preparar imágenes (asegurar que siempre hay al menos dos slots para imágenes)
      let images = []
      if (Array.isArray(tourData.imagenes) && tourData.imagenes.length > 0) {
        images = [...tourData.imagenes]
      } else if (Array.isArray(tourData.images) && tourData.images.length > 0) {
        images = [...tourData.images]
      } else {
        images = [''] // Al menos un campo vacío
      }

      // Convertir precio a string para input
      const adultPrice = tourData.precio ? tourData.precio.toString() : ''
      const childPrice = tourData.childPrice ? tourData.childPrice.toString() : ''

      // Extraer ciudad y país del destino
      let country = ''
      let city = ''

      Logger.debug('Procesando datos de destino', Logger.CATEGORIES.UI, { destination: tourData.destination })

      // Para el país, puede venir como un código ISO o como el nombre completo
      if (tourData.destination) {
        // Para compatibilidad, intentamos tratar country tanto como código como nombre
        country = tourData.destination.country || ''

        // Para la ciudad, puede venir como un objeto completo o como una cadena
        if (typeof tourData.destination.city === 'object') {
          city = tourData.destination.city?.name || ''
        } else {
          city = tourData.destination.city || ''
        }
      }

      Logger.debug('País y ciudad extraídos', Logger.CATEGORIES.UI, { country, city })

      // Determinar región basada en el país si no está explícita
      let region = 'Americas' // valor por defecto
      if (tourData.destination?.region) {
        region = tourData.destination.region
      }

      // Determinar el ID del hotel correcto
      let hotelId = 4 // valor por defecto
      if (tourData.hotel) {
        if (typeof tourData.hotel === 'object') {
          // Buscar el hotel en PREDEFINED_HOTELS por nombre
          const foundHotel = PREDEFINED_HOTELS.find(h => h.name === tourData.hotel.name)
          if (foundHotel) {
            hotelId = foundHotel.id
          }
        } else if (typeof tourData.hotel === 'number') {
          // Si es un número, verificar que exista en PREDEFINED_HOTELS
          if (PREDEFINED_HOTELS.some(h => h.id === tourData.hotel)) {
            hotelId = tourData.hotel
          }
        }
      }

      Logger.debug('Hotel ID seleccionado', Logger.CATEGORIES.UI, { hotelId, hotelName: tourData.hotel?.name })

      // FILTRAR TAGS - ASEGURARSE DE QUE SEAN VALORES ENUM VÁLIDOS
      let tags = []
      if (Array.isArray(tourData.tags)) {
        tags = tourData.tags.map(tag => {
          const matchedCategory = CATEGORIAS.find(cat => cat.value === tag)
          return matchedCategory ? matchedCategory.label : tag // Usar el label en español
        })
      } else if (tourData.categoria) {
        // Si solo tenemos la categoría principal, usarla solo si es un valor ENUM válido
        if (CATEGORIAS.some(cat => cat.value === tourData.categoria)) {
          tags = [tourData.categoria]
        }
      }

      if (tourData) {
        setFormData(prevData => ({
          ...prevData,
          tags: tourData.tags.map(tag => {
            const matchedCategory = CATEGORIAS.find(cat => cat.value === tag)
            return matchedCategory ? matchedCategory.label : tag // Convertir inglés → español
          })
        }))
      }

      Logger.debug('Tags procesados para edición', Logger.CATEGORIES.UI, { originalTags: tourData.tags, processedTags: tags })

      // Preparar datos de disponibilidad
      let availability = [
        {
          availableDate: getFutureDateTimeISO(5),
          availableSlots: 1,
          departureTime: getFutureDateTimeISO(7),
          returnTime: getFutureDateTimeISO(14)
        }
      ]

      // Si el tour tiene datos de disponibilidad, usarlos
      if (tourData.availability) {
        if (Array.isArray(tourData.availability)) {
          availability = [...tourData.availability]
          setAvailabilityCount(tourData.availability.length)
        } else {
          availability = [
            {
              availableDate: tourData.availability.availableDate || availability[0].availableDate,
              availableSlots: tourData.availability.availableSlots || availability[0].availableSlots,
              departureTime: tourData.availability.departureTime || availability[0].departureTime,
              returnTime: tourData.availability.returnTime || availability[0].returnTime
            }
          ]
        }
      }

      // Inicializar detalles de servicios incluidos
      const details = {}
      if (Array.isArray(tourData.includes)) {
        tourData.includes.forEach(include => {
          if (typeof include === 'object') {
            details[include.type] = {
              details: include.details || '',
              description: include.description || ''
            }
          }
        })
      }
      setIncludesDetails(details)

      // Initialize formData with existing tourData
      setFormData({
        name: tourData.nombre || '',
        description: tourData.description || '',
        adultPrice,
        childPrice,
        images,
        status: tourData.status || 'Disponible',
        tags: tags,
        includes: Array.isArray(tourData.includes) ? tourData.includes.map(inc => (typeof inc === 'object' ? inc.type : inc)) : [],
        destination: {
          region,
          country,
          city
        },
        hotel: hotelId,
        availability
      })
    }
  }, [tourData, isOpen])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.')

      if (parts.length === 2) {
        if (parts[0] === 'destination') {
          const updatedDestination = { ...formData.destination }

          // Si cambia la región, resetear país y ciudad
          if (parts[1] === 'region') {
            updatedDestination.region = value
            updatedDestination.country = ''
            updatedDestination.city = ''
          }
          // Si cambia el país, resetear ciudad
          else if (parts[1] === 'country') {
            updatedDestination.country = value
            updatedDestination.city = ''
          } else {
            updatedDestination[parts[1]] = value
          }

          setFormData({
            ...formData,
            destination: updatedDestination
          })
        } else {
          setFormData({
            ...formData,
            [parts[0]]: {
              ...formData[parts[0]],
              [parts[1]]: value
            }
          })
        }
      } else {
        setFormData({
          ...formData,
          [field]: value
        })
      }
    } else {
      setFormData({
        ...formData,
        [field]: value
      })
    }
  }

  const handleImagesChange = newImages => {
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleTagToggle = tagValue => {
    setFormData(prevData => {
      // Convertir de inglés a español
      const matchedCategory = CATEGORIAS.find(cat => cat.value === tagValue)
      const tagLabel = matchedCategory ? matchedCategory.label : tagValue

      // Alternar selección
      const updatedTags = prevData.tags.includes(tagLabel)
        ? prevData.tags.filter(tag => tag !== tagLabel) // Remueve si ya estaba
        : [...prevData.tags, tagLabel] // Agrega si no estaba

      return { ...prevData, tags: updatedTags }
    })
  }

  const handleServiceToggle = service => {
    const currentServices = [...formData.includes]
    const index = currentServices.indexOf(service)

    if (index === -1) {
      currentServices.push(service)

      // Inicializar los detalles si no existen
      const serviceInfo = SERVICIOS.find(s => s.value === service)

      if (serviceInfo && !includesDetails[service]) {
        setIncludesDetails({
          ...includesDetails,
          [service]: {
            details: serviceInfo.defaultDetails,
            description: serviceInfo.description
          }
        })
      }
    } else {
      currentServices.splice(index, 1)
    }

    setFormData({
      ...formData,
      includes: currentServices
    })
  }

  const handleIncludeDetailChange = (service, field, value) => {
    setIncludesDetails({
      ...includesDetails,
      [service]: {
        ...includesDetails[service],
        [field]: value
      }
    })
  }

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...formData.availability]

    // Asegurarse de que el objeto existe en ese índice
    if (!newAvailability[index]) {
      newAvailability[index] = {
        availableDate: getFutureDateTimeISO(5), // 5 días antes de la salida
        availableSlots: 10,
        departureTime: getFutureDateTimeISO(7),
        returnTime: getFutureDateTimeISO(14)
      }
    }

    // Actualizar campo específico
    newAvailability[index][field] = value

    // Si se está actualizando la fecha de salida, ajustar la fecha disponible
    if (field === 'departureTime') {
      const departureDate = new Date(value)
      const availableDate = new Date(departureDate)
      availableDate.setDate(availableDate.getDate() - 2) // 2 días antes de la salida
      newAvailability[index].availableDate = availableDate.toISOString().slice(0, 16)
    }

    setFormData({
      ...formData,
      availability: newAvailability
    })
  }

  const handleAddAvailability = () => {
    const newAvailability = [...formData.availability]
    newAvailability.push({
      availableDate: getFutureDateTimeISO(5 + availabilityCount * 7), // 5 días antes de la salida
      availableSlots: 10,
      departureTime: getFutureDateTimeISO(7 + availabilityCount * 7),
      returnTime: getFutureDateTimeISO(14 + availabilityCount * 7)
    })

    setFormData({
      ...formData,
      availability: newAvailability
    })

    setAvailabilityCount(availabilityCount + 1)
  }

  const handleRemoveAvailability = index => {
    if (formData.availability.length <= 1) {
      return
    }

    const newAvailability = formData.availability.filter((_, i) => i !== index)

    setFormData({
      ...formData,
      availability: newAvailability
    })
    setAvailabilityCount(availabilityCount - 1)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar datos mínimos requeridos
      if (!formData.name) {
        throw new Error('El nombre del tour es obligatorio')
      }

      if (!formData.description) {
        throw new Error('La descripción del tour es obligatoria')
      }

      if (!formData.adultPrice) {
        throw new Error('El precio para adultos es obligatorio')
      }

      if (!formData.destination.country || !formData.destination.city) {
        throw new Error('El destino (país y ciudad) es obligatorio')
      }

      if (formData.tags.length === 0) {
        throw new Error('Debes seleccionar al menos una categoría')
      }

      if (formData.includes.length === 0) {
        throw new Error('Debes seleccionar al menos un servicio incluido')
      }

      const validImages = formData.images.filter(img => img.trim() !== '')
      if (validImages.length === 0) {
        throw new Error('Debes proporcionar al menos una URL de imagen')
      }

      // Validar cada objeto de disponibilidad
      for (let i = 0; i < formData.availability.length; i++) {
        const avail = formData.availability[i]

        if (!avail.availableDate) {
          throw new Error(`Fecha disponible para reserva ${i + 1} es obligatoria`)
        }

        if (!avail.departureTime) {
          throw new Error(`Fecha y hora de salida ${i + 1} es obligatoria`)
        }

        if (!avail.returnTime) {
          throw new Error(`Fecha y hora de regreso ${i + 1} es obligatoria`)
        }

        // Verificar que la fecha límite de reserva sea anterior a la fecha de salida
        const availableDate = new Date(avail.availableDate)
        const departureDate = new Date(avail.departureTime)
        const returnDate = new Date(avail.returnTime)

        if (availableDate >= departureDate) {
          throw new Error(`La fecha límite de reserva ${i + 1} debe ser anterior a la fecha de salida`)
        }

        // Verificar que la fecha de regreso sea posterior a la de salida
        if (returnDate <= departureDate) {
          throw new Error(`La fecha de regreso ${i + 1} debe ser posterior a la fecha de salida`)
        }

        // Verificar que haya al menos un cupo disponible
        if (parseInt(avail.availableSlots) < 1) {
          throw new Error(`Debe haber al menos un cupo disponible en la disponibilidad ${i + 1}`)
        }
      }

      // Filtrar imágenes vacías
      const filteredImages = formData.images.filter(img => img.trim() !== '')
      if (filteredImages.length === 0) {
        filteredImages.push('https://via.placeholder.com/800x600?text=Imagen+del+tour')
      }

      // ASEGURAR QUE LOS TAGS SEAN VALORES ENUM VÁLIDOS
      const validTags = formData.tags.map(tag => {
        const matchedCategory = CATEGORIAS.find(cat => cat.label === tag)
        return matchedCategory ? matchedCategory.value : tag // Convertir español → inglés
      })

      Logger.info('Tags validados para actualización', Logger.CATEGORIES.UI, { spanishTags: formData.tags, englishTags: validTags })

      // Asegurar que las fechas tengan el formato ISO correcto
      const modifiedAvailability = formData.availability.map(avail => {
        const modifiedAvail = { ...avail }

        if (modifiedAvail.availableDate) {
          if (typeof modifiedAvail.availableDate === 'string' && modifiedAvail.availableDate.includes(' ')) {
            Logger.debug('Corrigiendo formato de availableDate', Logger.CATEGORIES.UI, { original: modifiedAvail.availableDate })
            modifiedAvail.availableDate = modifiedAvail.availableDate.replace(' ', 'T')
          }
        }

        if (modifiedAvail.departureTime) {
          if (typeof modifiedAvail.departureTime === 'string' && modifiedAvail.departureTime.includes(' ')) {
            Logger.debug('Corrigiendo formato de departureTime', Logger.CATEGORIES.UI, { original: modifiedAvail.departureTime })
            modifiedAvail.departureTime = modifiedAvail.departureTime.replace(' ', 'T')
          }
        }

        if (modifiedAvail.returnTime) {
          if (typeof modifiedAvail.returnTime === 'string' && modifiedAvail.returnTime.includes(' ')) {
            Logger.debug('Corrigiendo formato de returnTime', Logger.CATEGORIES.UI, { original: modifiedAvail.returnTime })
            modifiedAvail.returnTime = modifiedAvail.returnTime.replace(' ', 'T')
          }
        }

        return {
          ...modifiedAvail,
          availableSlots: parseInt(modifiedAvail.availableSlots)
        }
      })

      // IMPORTANTE: Crear el objeto exactamente como lo espera el backend según Swagger
      // Obtener el nombre completo del país a partir del código ISO
      let countryName = formData.destination.country
      try {
        Logger.debug('Procesando país para conversión', Logger.CATEGORIES.SERVICE, { countryInput: formData.destination.country })

        // Si el país parece ser un código ISO de 2 letras
        if (formData.destination.country && formData.destination.country.length <= 2) {
          const countriesResponse = await fetch('/data/countries.json')
          if (countriesResponse.ok) {
            const countriesData = await countriesResponse.json()
            if (countriesData[formData.destination.country]) {
              countryName = countriesData[formData.destination.country].name
              Logger.info('País convertido desde código ISO', Logger.CATEGORIES.SERVICE, {
                isoCode: formData.destination.country,
                countryName
              })
            }
          }
        } else {
          Logger.debug('País detectado como nombre completo', Logger.CATEGORIES.SERVICE, { countryName: formData.destination.country })
        }
      } catch (error) {
        Logger.error('Error obteniendo nombre del país', Logger.CATEGORIES.SERVICE, {
          error: error.message,
          country: formData.destination.country
        })
        // Fallback: usar el valor actual si no podemos obtener el nombre
      }

      const requestData = {
        name: formData.name,
        description: formData.description,
        adultPrice: parseFloat(formData.adultPrice),
        childPrice: parseFloat(formData.childPrice || '0'),
        images: filteredImages,
        status: 'Disponible',
        tags: validTags,
        includes: formData.includes,
        destination: {
          country: countryName,
          city: formData.destination.city
        },
        hotel: parseInt(formData.hotel),
        availability: modifiedAvailability
      }

      Logger.info('Datos preparados para actualización', Logger.CATEGORIES.SERVICE, { tourId: tourData.idPaquete, requestData })

      // Enviar solicitud de actualización con el ID exacto del paquete
      const result = await updateTour(tourData.idPaquete, requestData)

      if (result.error) {
        throw new Error(result.message || 'Error al actualizar el tour')
      }

      Logger.info('Tour actualizado exitosamente', Logger.CATEGORIES.SERVICE, { tourId: tourData.idPaquete, result })

      // Notificar éxito y cerrar
      onSuccess && onSuccess(result)
      onClose()
    } catch (error) {
      Logger.error('Error al actualizar el tour', Logger.CATEGORIES.SERVICE, {
        tourId: tourData.idPaquete,
        error: error.message,
        stack: error.stack
      })
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Estilos para componentes nativos
  const selectStyle =
    'block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E86C6E] focus:border-[#E86C6E]'
  const checkboxContainerStyle = 'flex items-center gap-2 mb-2'
  const checkboxStyle = 'form-checkbox h-5 w-5 text-[#E86C6E] border-gray-300 rounded focus:ring-[#E86C6E]'
  const labelStyle = 'text-sm font-medium text-gray-700'
  const errorStyle = 'text-red-500 text-sm mt-2'

  return (
    <Modal size='3xl' isOpen={isOpen} onClose={onClose}>
      <ModalContent className='max-h-[90vh]'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
          <ModalHeader className='flex flex-col gap-1'>Editar tour</ModalHeader>
          <ModalBody className='overflow-y-auto max-h-[70vh]'>
            {error && <div className={errorStyle}>{error}</div>}

            <Tabs aria-label='Secciones del formulario'>
              <Tab key='informacion' title='Información básica'>
                <div className='space-y-4 py-2'>
                  <Input
                    label='Nombre del tour'
                    placeholder='Ej: Playas del Caribe'
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                  />

                  <Textarea
                    label='Descripción'
                    placeholder='Describe la experiencia del tour...'
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    required
                    minRows={3}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Input
                      type='number'
                      label='Precio adultos'
                      placeholder='Precio en USD'
                      startContent={<div className='pointer-events-none'>$</div>}
                      value={formData.adultPrice}
                      onChange={e => handleInputChange('adultPrice', e.target.value)}
                      required
                    />

                    <Input
                      type='number'
                      label='Precio niños'
                      placeholder='Precio en USD'
                      startContent={<div className='pointer-events-none'>$</div>}
                      value={formData.childPrice}
                      onChange={e => handleInputChange('childPrice', e.target.value)}
                    />
                  </div>

                  {/* <Input
                    label="Numero de contacto"
                    placeholder="Ej: Codigo del Pais+Numero Telefonico"
                    value={formData.hotelNumber}
                    onChange={e => handleInputChange('hotelNumber', e.target.value)}
                    required
                  /> */}

                  <ImageInput images={formData.images} onChange={handleImagesChange} maxImages={5} />
                </div>
              </Tab>

              <Tab key='destino' title='Destino y Hotel'>
                <div className='space-y-4 py-2'>
                  <div className='mb-4'>
                    <label htmlFor='region' className={labelStyle}>
                      Región
                    </label>
                    <select
                      id='region'
                      className={selectStyle}
                      value={formData.destination.region}
                      onChange={e => handleInputChange('destination.region', e.target.value)}
                      required>
                      {REGIONES.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pasar el código de país si está en formato ISO-2, o buscar el código correspondiente si es nombre completo */}
                  <CountryCitySelector
                    key={`${formData.destination.region}-${formData.destination.country}`}
                    initialCountry={formData.destination.country}
                    initialCity={formData.destination.city}
                    onCountryChange={country => handleInputChange('destination.country', country)}
                    onCityChange={city => handleInputChange('destination.city', city)}
                    selectedRegion={formData.destination.region}
                  />

                  {/* Hotel - Selector de hoteles predefinidos */}
                  <div className='mb-4'>
                    <label className='text-sm font-medium text-gray-700'>Hotel</label>
                    <select
                      className={selectStyle}
                      value={formData.hotel}
                      onChange={e => handleInputChange('hotel', parseInt(e.target.value))}
                      required>
                      <option value=''>Seleccione un hotel</option>
                      {PREDEFINED_HOTELS.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.stars} ⭐)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Tab>

              <Tab key='categorias' title='Categorías'>
                <div className='space-y-4 py-2'>
                  <p className='text-sm font-medium mb-3'>Categorías del tour</p>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {CATEGORIAS.map(categoria => (
                      <div key={categoria.value} className={checkboxContainerStyle}>
                        <input
                          type='checkbox'
                          id={`categoria-${categoria.value}`}
                          className={checkboxStyle}
                          value={categoria.value}
                          checked={formData.tags.includes(categoria.label)}
                          onChange={() => handleTagToggle(categoria.value)}
                        />
                        <label htmlFor={`categoria-${categoria.value}`} className={labelStyle}>
                          {categoria.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>

              <Tab key='servicios' title='Servicios incluidos'>
                <div className='space-y-4 py-2'>
                  <p className='text-sm font-medium mb-3'>Selecciona los servicios incluidos</p>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {SERVICIOS.map(servicio => (
                      <div key={servicio.value} className={checkboxContainerStyle}>
                        <input
                          type='checkbox'
                          id={`servicio-${servicio.value}`}
                          className={checkboxStyle}
                          value={servicio.value}
                          checked={formData.includes.includes(servicio.value)}
                          onChange={() => handleServiceToggle(servicio.value)}
                        />
                        <label htmlFor={`servicio-${servicio.value}`} className={labelStyle}>
                          <div className='flex items-center gap-2'>
                            <span className='material-symbols-outlined'>{servicio.icon}</span>
                            {servicio.label}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {formData.includes.length > 0 && (
                    <div className='mt-4 border p-4 rounded-lg'>
                      <p className='text-sm font-medium mb-3'>Detalles de los servicios incluidos</p>
                      <div className='space-y-4'>
                        {formData.includes.map(service => {
                          const serviceInfo = SERVICIOS.find(s => s.value === service)
                          const details = includesDetails[service] || {
                            details: serviceInfo?.defaultDetails || '',
                            description: serviceInfo?.description || ''
                          }

                          return (
                            <div key={service} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <div className='flex items-center gap-2'>
                                <span className='material-symbols-outlined'>{serviceInfo?.icon || 'check'}</span>
                                <span className='font-medium'>{service}</span>
                              </div>

                              <div className='space-y-2'>
                                <Input
                                  size='sm'
                                  label='Detalles'
                                  placeholder='Ej: 2 Alcobas, Ilimitado, etc.'
                                  value={details.details}
                                  onChange={e => handleIncludeDetailChange(service, 'details', e.target.value)}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              {/* Pestaña de disponibilidad */}
              <Tab key='disponibilidad' title='Disponibilidad'>
                <div className='space-y-4 py-2'>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm font-medium mb-3'>Fechas de disponibilidad</p>
                    <Button size='sm' color='primary' variant='flat' onPress={handleAddAvailability}>
                      <span className='material-symbols-outlined mr-1'>add</span>
                      Añadir fecha
                    </Button>
                  </div>

                  {formData.availability.map((avail, index) => (
                    <div key={index} className='mb-8 p-4 border rounded-lg bg-gray-50'>
                      <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-md font-medium'>Disponibilidad {index + 1}</h3>
                        {formData.availability.length > 1 && (
                          <Button size='sm' color='danger' variant='light' onPress={() => handleRemoveAvailability(index)}>
                            <span className='material-symbols-outlined'>delete</span>
                          </Button>
                        )}
                      </div>

                      <div className='grid grid-cols-1 gap-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <Input
                              type='datetime-local'
                              label='Fecha disponible para reserva'
                              placeholder='Seleccione fecha y hora'
                              value={avail.availableDate}
                              onChange={e => handleAvailabilityChange(index, 'availableDate', e.target.value)}
                              required
                            />
                            <p className='text-xs text-gray-500 mt-1'>Fecha límite para reservar</p>
                          </div>
                          <div>
                            <Input
                              type='number'
                              label='Cupos disponibles'
                              placeholder='Número de plazas'
                              min='1'
                              value={avail.availableSlots}
                              onChange={e => handleAvailabilityChange(index, 'availableSlots', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                          <div>
                            <Input
                              type='datetime-local'
                              label='Fecha y hora de salida'
                              placeholder='Seleccione fecha y hora'
                              value={avail.departureTime}
                              onChange={e => handleAvailabilityChange(index, 'departureTime', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type='datetime-local'
                              label='Fecha y hora de regreso'
                              placeholder='Seleccione fecha y hora'
                              value={avail.returnTime}
                              onChange={e => handleAvailabilityChange(index, 'returnTime', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-md mt-4'>
                    <p className='text-sm text-blue-800'>
                      <span className='font-medium'>Nota:</span> Puedes agregar múltiples fechas de disponibilidad para este tour. La fecha
                      de disponibilidad indica hasta cuándo los clientes pueden reservar este tour. Las fechas de salida y regreso definen
                      cuándo comienza y termina el tour.
                    </p>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant='flat' type='button' onPress={onClose}>
              Cancelar
            </Button>
            <Button color='primary' type='submit' isLoading={loading}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default EditarTourForm
