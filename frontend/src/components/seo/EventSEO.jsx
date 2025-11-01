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

  const sanitizeText = value =>
    value
      ? value
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : ''

  const truncate = (value, maxLength) => {
    if (!value) return ''
    if (value.length <= maxLength) return value

    return `${value.slice(0, maxLength).trim()}`
  }

  const fallbackDescription =
    sanitizeText(event.description) || `Descubre ${event.title} en Feeling. Eventos diseñados para crear conexiones significativas.`
  const configuredDescription = sanitizeText(event.seoDescription)
  const structuredDescription = configuredDescription || fallbackDescription
  const metaDescription = truncate(structuredDescription, 320)

  const fallbackTitle = `${event.title} - Eventos Feeling`
  const metaTitle = event.seoTitle && event.seoTitle.trim().length ? event.seoTitle.trim() : fallbackTitle

  const normalizeImage = value => {
    if (!value) return null
    const trimmed = value.trim()

    return trimmed.length ? trimmed : null
  }

  const eventImage = normalizeImage(event.seoImage) || event.mainImage || event.images?.[0]

  // Precio formateado
  const priceText =
    event.price > 0
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(event.price)
      : 'Gratis'

  // Keywords dinámicos basados en el evento
  const defaultKeywords = [
    event.title,
    event.categoryDisplayName,
    event.location,
    'eventos sociales',
    'conexiones significativas',
    'comunidad feeling',
    'eventos colombia',
    'networking social'
  ].filter(Boolean)

  const configuredKeywords = event.seoKeywords
    ? event.seoKeywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean)
    : null

  const metaKeywords = (configuredKeywords?.length ? configuredKeywords : defaultKeywords).join(', ')

  // Structured Data para Google (Schema.org Event)
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: structuredDescription,
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
      <title>{metaTitle}</title>
      <meta content={metaTitle} name='title' />
      <meta content={metaDescription} name='description' />
      <meta content={metaKeywords} name='keywords' />
      <link href={eventUrl} rel='canonical' />

      {/* Open Graph / Facebook */}
      <meta content='event' property='og:type' />
      <meta content={eventUrl} property='og:url' />
      <meta content='Feeling' property='og:site_name' />
      <meta content={metaTitle} property='og:title' />
      <meta content={metaDescription} property='og:description' />
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
      <meta content={metaTitle} name='twitter:title' />
      <meta content={metaDescription} name='twitter:description' />
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
    images: PropTypes.arrayOf(PropTypes.string),
    seoTitle: PropTypes.string,
    seoDescription: PropTypes.string,
    seoKeywords: PropTypes.string,
    seoImage: PropTypes.string
  })
}

export default EventSEO
