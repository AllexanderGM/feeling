import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet-async'
import { parseJavaDate } from '@utils/dateUtils.js'

/**
 * Componente SEO optimizado para eventos individuales
 * Incluye meta tags, Open Graph, Twitter Cards y Schema.org structured data
 */
const EventSEO = ({ event }) => {
  if (!event) return null

  const baseUrl = 'https://feeling.com.co'
  const eventUrl = `${baseUrl}/events/${event.id}`

  // Formatear fecha para structured data (ISO 8601)
  const eventDate = parseJavaDate(event.eventDate)
  const eventDateISO = eventDate ? eventDate.toISOString() : null

  // Crear descripción SEO limpia (sin HTML)
  const cleanDescription = event.description
    ? event.description
        .replace(/<[^>]*>/g, '') // Quitar HTML tags
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim()
        .substring(0, 160) // Límite de 160 caracteres para SEO
    : `Descubre ${event.title} en Feeling. Eventos diseñados para crear conexiones significativas.`

  const title = `${event.title} - Eventos Feeling`

  // Imagen del evento (siempre usar la imagen del evento, nunca genérica)
  const eventImage = event.mainImage || event.images?.[0]

  // Precio formateado
  const priceText =
    event.price > 0
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(event.price)
      : 'Gratis'

  // Keywords dinámicos basados en el evento
  const keywords = [
    event.title,
    event.categoryDisplayName,
    event.location,
    'eventos sociales',
    'conexiones significativas',
    'comunidad feeling',
    'eventos colombia',
    'networking social'
  ]
    .filter(Boolean)
    .join(', ')

  // Structured Data para Google (Schema.org Event)
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: cleanDescription,
    startDate: eventDateISO,
    eventStatus: event.isActive ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCancelled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Por confirmar',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bogotá',
        addressCountry: 'CO'
      }
    },
    ...(eventImage && { image: [eventImage] }),
    organizer: {
      '@type': 'Organization',
      name: 'Feeling',
      url: baseUrl
    },
    offers: {
      '@type': 'Offer',
      url: eventUrl,
      price: event.price || 0,
      priceCurrency: 'COP',
      availability: event.hasAvailableSpots ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      validFrom: eventDateISO
    }
  }

  // Si hay capacidad máxima, agregarla
  if (event.maxCapacity) {
    eventStructuredData.maximumAttendeeCapacity = event.maxCapacity
  }

  // BreadcrumbList structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Eventos',
        item: `${baseUrl}/events`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: event.title,
        item: eventUrl
      }
    ]
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta content={title} name='title' />
      <meta content={cleanDescription} name='description' />
      <meta content={keywords} name='keywords' />
      <link href={eventUrl} rel='canonical' />

      {/* Open Graph / Facebook */}
      <meta content='event' property='og:type' />
      <meta content={eventUrl} property='og:url' />
      <meta content='Feeling' property='og:site_name' />
      <meta content={event.title} property='og:title' />
      <meta content={cleanDescription} property='og:description' />
      {eventImage && (
        <>
          <meta content={eventImage} property='og:image' />
          <meta content='1200' property='og:image:width' />
          <meta content='630' property='og:image:height' />
          <meta content={`Imagen del evento: ${event.title}`} property='og:image:alt' />
        </>
      )}
      <meta content='es_CO' property='og:locale' />

      {/* Event specific Open Graph tags */}
      {eventDateISO && <meta content={eventDateISO} property='event:start_time' />}
      {event.location && <meta content={event.location} property='event:location' />}

      {/* Twitter Card */}
      <meta content='summary_large_image' name='twitter:card' />
      <meta content={eventUrl} name='twitter:url' />
      <meta content={event.title} name='twitter:title' />
      <meta content={cleanDescription} name='twitter:description' />
      {eventImage && (
        <>
          <meta content={eventImage} name='twitter:image' />
          <meta content={`Imagen del evento: ${event.title}`} name='twitter:image:alt' />
        </>
      )}
      <meta content='Fecha' name='twitter:label1' />
      <meta content={eventDate ? eventDate.toLocaleDateString('es-CO', { dateStyle: 'long' }) : 'Por confirmar'} name='twitter:data1' />
      <meta content='Precio' name='twitter:label2' />
      <meta content={priceText} name='twitter:data2' />

      {/* Structured Data (JSON-LD) */}
      <script type='application/ld+json'>{JSON.stringify(eventStructuredData)}</script>

      <script type='application/ld+json'>{JSON.stringify(breadcrumbStructuredData)}</script>
    </Helmet>
  )
}

EventSEO.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    eventDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    location: PropTypes.string,
    price: PropTypes.number,
    maxCapacity: PropTypes.number,
    hasAvailableSpots: PropTypes.bool,
    isActive: PropTypes.bool,
    categoryDisplayName: PropTypes.string,
    mainImage: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string)
  })
}

export default EventSEO
