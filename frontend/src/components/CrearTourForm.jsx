import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Tabs, Tab } from '@heroui/react'
import { createTour } from '@services/tourService.js'

import ImageInput from './ImageInput.jsx' // Importamos el nuevo componente
import CountryCitySelector from './CountryCitySelector.jsx' // Importamos el nuevo componente

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

const CrearTourForm = ({ isOpen, onClose, onSuccess }) => {
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
        availableDate: getFutureDateTimeISO(5), // Fecha disponible para reservar (5 días por defecto)
        availableSlots: 10, // Número de cupos por defecto
        departureTime: getFutureDateTimeISO(7), // Hora de salida (7 días por defecto)
        returnTime: getFutureDateTimeISO(14) // Hora de regreso (14 días por defecto)
      }
    ]
  })

  // Estado para los detalles de cada servicio incluido
  const [includesDetails, setIncludesDetails] = useState({})
  const [availabilityCount, setAvailabilityCount] = useState(1)

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.')

      if (parts.length === 2) {
        // Para campos como 'destination.country' o 'availability.availableSlots'
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
          // Para cualquier otro nivel de anidación
          setFormData({
            ...formData,
            [parts[0]]: {
              ...formData[parts[0]],
              [parts[1]]: value
            }
          })
        }
      } else {
        // Para cualquier otro nivel de anidación
        console.warn('Campo con múltiples niveles no esperado:', field)
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

  // Reemplazamos la función handleImageChange por una que maneja el array completo
  const handleImagesChange = newImages => {
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleTagToggle = tag => {
    const currentTags = [...formData.tags]
    const index = currentTags.indexOf(tag)

    if (index === -1) {
      // Añadir tag
      currentTags.push(tag)
    } else {
      // Quitar tag
      currentTags.splice(index, 1)
    }

    setFormData({
      ...formData,
      tags: currentTags
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
      // Quitar servicio
      currentServices.splice(index, 1)
    }

    setFormData({
      ...formData,
      includes: currentServices
    })
  }

  // const handleIncludeDetailChange = (service, field, value) => {
  //   setIncludesDetails({
  //     ...includesDetails,
  //     [service]: {
  //       ...includesDetails[service],
  //       [field]: value
  //     }
  //   })
  // }

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

      // Validar que haya al menos una imagen con URL
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
          throw new Error(`Debe haber al menos un cupo disponible ${i + 1}`)
        }
      }

      // Filtrar imágenes vacías
      const filteredImages = formData.images.filter(img => img.trim() !== '')
      if (filteredImages.length === 0) {
        filteredImages.push('https://via.placeholder.com/800x600?text=Imagen+del+tour')
      }

      // El país ahora es un código ISO, lo dejamos como está
      // El formData.destination.country ya contiene el código ISO

      // Preparar datos para enviar a la API
      const tourData = {
        ...formData,
        images: filteredImages,
        adultPrice: parseFloat(formData.adultPrice),
        childPrice: parseFloat(formData.childPrice || '0'),
        availability: formData.availability.map(avail => ({
          ...avail,
          availableSlots: parseInt(avail.availableSlots)
        }))
      }

      // Enviar solicitud a la API
      const result = await createTour(tourData)

      if (result.error) {
        throw new Error(result.message || 'Error al crear el tour')
      }

      console.log('Tour creado exitosamente:', result)

      // Resetear el formulario
      setFormData({
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
        availability: [
          {
            availableDate: getFutureDateTimeISO(5), // Fecha disponible para reservar (5 días por defecto)
            availableSlots: 10, // Número de cupos por defecto
            departureTime: getFutureDateTimeISO(7), // Hora de salida (7 días por defecto)
            returnTime: getFutureDateTimeISO(14) // Hora de regreso (14 días por defecto)
          }
        ]
      })
      setIncludesDetails({})
      setAvailabilityCount(1)

      // Disparar evento para notificar que se ha creado un tour
      window.dispatchEvent(new CustomEvent('tour-created', { detail: result }))

      // Cerrar modal y notificar éxito
      onSuccess && onSuccess(result)
      onClose()
    } catch (error) {
      console.error('Error al crear el tour:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // CSS personalizado para inputs nativos
  const selectStyle =
    'block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E86C6E] focus:border-[#E86C6E]'
  const checkboxContainerStyle = 'flex items-center gap-2 mb-2'
  const checkboxStyle = 'form-checkbox h-5 w-5 text-[#E86C6E] border-gray-300 rounded focus:ring-[#E86C6E]'
  const labelStyle = 'text-sm font-medium text-gray-700'
  const errorStyle = 'text-red-500 text-sm mt-2'

  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent className="max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <ModalHeader className="flex flex-col gap-1">Crear nuevo tour</ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[70vh]">
            {error && <div className={errorStyle}>{error}</div>}

            <Tabs aria-label="Secciones del formulario">
              <Tab key="informacion" title="Información básica">
                <div className="space-y-4 py-2">
                  <Input
                    label="Nombre del tour"
                    placeholder="Ej: Playas del Caribe"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                  />

                  <Textarea
                    label="Descripción"
                    placeholder="Describe la experiencia del tour..."
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    required
                    minRows={3}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Precio adultos"
                      placeholder="Precio en USD"
                      startContent={<div className="pointer-events-none">$</div>}
                      value={formData.adultPrice}
                      onChange={e => handleInputChange('adultPrice', e.target.value)}
                      required
                    />

                    <Input
                      type="number"
                      label="Precio niños"
                      placeholder="Precio en USD"
                      startContent={<div className="pointer-events-none">$</div>}
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

                  {/* Reemplazamos los inputs de imágenes con nuestro nuevo componente */}
                  <ImageInput images={formData.images} onChange={handleImagesChange} maxImages={5} />
                </div>
              </Tab>

              <Tab key="destino" title="Destino y Hotel">
                <div className="space-y-4 py-2">
                  {/* Región (mantiene el componente existente) */}
                  <div className="mb-4">
                    <label htmlFor="region" className={labelStyle}>
                      Región
                    </label>
                    <select
                      id="region"
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

                  {/* Reemplazar los inputs de país y ciudad individuales con nuestro componente */}
                  <CountryCitySelector
                    initialCountry={formData.destination.country}
                    initialCity={formData.destination.city}
                    onCountryChange={country => handleInputChange('destination.country', country)}
                    onCityChange={city => handleInputChange('destination.city', city)}
                    selectedRegion={formData.destination.region}
                  />

                  {/* Hotel */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Hotel</label>
                    <select
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E86C6E] focus:border-[#E86C6E]"
                      value={formData.hotel}
                      onChange={e => handleInputChange('hotel', parseInt(e.target.value))}
                      required>
                      <option value="">Seleccione un hotel</option>
                      {PREDEFINED_HOTELS.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.stars} ⭐)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Tab>

              <Tab key="categorias" title="Categorías">
                <div className="space-y-4 py-2">
                  <p className="text-sm font-medium mb-3">Categorías del tour</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CATEGORIAS.map(categoria => (
                      <div key={categoria.value} className={checkboxContainerStyle}>
                        <input
                          type="checkbox"
                          id={`categoria-${categoria.value}`}
                          className={checkboxStyle}
                          value={categoria.value}
                          checked={formData.tags.includes(categoria.value)}
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

              <Tab key="servicios" title="Servicios incluidos">
                <div className="space-y-4 py-2">
                  <p className="text-sm font-medium mb-3">Selecciona los servicios incluidos</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SERVICIOS.map(servicio => (
                      <div key={servicio.value} className={checkboxContainerStyle}>
                        <input
                          type="checkbox"
                          id={`servicio-${servicio.value}`}
                          className={checkboxStyle}
                          value={servicio.value}
                          checked={formData.includes.includes(servicio.value)}
                          onChange={() => handleServiceToggle(servicio.value)}
                        />
                        <label htmlFor={`servicio-${servicio.value}`} className={labelStyle}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">{servicio.icon}</span>
                            {servicio.label}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {formData.includes.length > 0 && (
                    <div className="mt-4 border p-4 rounded-lg">
                      <p className="text-sm font-medium mb-3">Detalles de los servicios incluidos</p>
                      <div className="space-y-4">
                        {formData.includes.length > 0 && (
                          <div className="mt-4 border p-4 rounded-lg">
                            <p className="text-sm font-medium mb-3">Detalles de los servicios incluidos</p>
                            <div className="space-y-4">
                              {formData.includes.map(service => {
                                const serviceInfo = SERVICIOS.find(s => s.value === service)
                                return (
                                  <div key={service} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className="material-symbols-outlined">{serviceInfo?.icon || 'check'}</span>
                                      <span className="font-medium">{service}</span>
                                    </div>

                                    <div className="space-y-2">
                                      <Input size="sm" label="Detalles" value={serviceInfo?.defaultDetails} disabled readOnly />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              {/* Nueva pestaña de disponibilidad */}
              <Tab key="disponibilidad" title="Disponibilidad">
                <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium mb-3">Fechas de disponibilidad</p>
                    <Button size="sm" color="primary" variant="flat" onClick={handleAddAvailability}>
                      <span className="material-symbols-outlined mr-1">add</span>
                      Añadir fecha
                    </Button>
                  </div>

                  {formData.availability.map((avail, index) => (
                    <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium">Disponibilidad {index + 1}</h3>
                        {formData.availability.length > 1 && (
                          <Button size="sm" color="danger" variant="light" onClick={() => handleRemoveAvailability(index)}>
                            <span className="material-symbols-outlined">delete</span>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="datetime-local"
                              label="Fecha disponible para reserva"
                              placeholder="Seleccione fecha y hora"
                              value={avail.availableDate}
                              onChange={e => handleAvailabilityChange(index, 'availableDate', e.target.value)}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">Fecha límite para reservar</p>
                          </div>
                          <div>
                            <Input
                              type="number"
                              label="Cupos disponibles"
                              placeholder="Número de plazas"
                              min="1"
                              value={avail.availableSlots}
                              onChange={e => handleAvailabilityChange(index, 'availableSlots', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Input
                              type="datetime-local"
                              label="Fecha y hora de salida"
                              placeholder="Seleccione fecha y hora"
                              value={avail.departureTime}
                              onChange={e => handleAvailabilityChange(index, 'departureTime', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type="datetime-local"
                              label="Fecha y hora de regreso"
                              placeholder="Seleccione fecha y hora"
                              value={avail.returnTime}
                              onChange={e => handleAvailabilityChange(index, 'returnTime', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Nota:</span> Puedes agregar múltiples fechas de disponibilidad para este tour. La fecha
                      de disponibilidad indica hasta cuándo los clientes pueden reservar este tour. Las fechas de salida y regreso definen
                      cuándo comienza y termina el tour.
                    </p>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" type="button" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              Crear Tour
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CrearTourForm
