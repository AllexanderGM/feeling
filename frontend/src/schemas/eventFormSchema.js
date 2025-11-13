import * as yup from 'yup'

const stripHtml = value => value.replace(/<[^>]+>/g, '').trim()

export const eventFormSchema = yup.object().shape({
  // Información básica
  title: yup.string().required('El título es requerido').trim().max(200, 'El título no puede exceder 200 caracteres'),

  description: yup
    .string()
    .required('La descripción es requerida')
    .test('description-length', 'La descripción no puede exceder 2000 caracteres', value => {
      const plain = stripHtml(value || '')

      return plain.length <= 2000
    })
    .test('description-not-empty', 'La descripción es requerida', value => {
      const plain = stripHtml(value || '')

      return plain.length > 0
    }),

  location: yup.string().required('La ubicación es requerida').trim().max(300, 'La ubicación no puede exceder 300 caracteres'),

  eventDate: yup
    .string()
    .required('La fecha del evento es requerida')
    .test('valid-date', 'La fecha seleccionada no es válida', value => {
      if (!value) return false
      const date = new Date(value)

      return !Number.isNaN(date.getTime())
    }),

  // Configuración del evento
  category: yup.string().required('La categoría es requerida'),

  price: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value
    })
    .min(0, 'El precio debe ser mayor o igual a 0')
    .required('El precio es requerido'),

  maxCapacity: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value
    })
    .min(1, 'La capacidad debe ser mayor a 0')
    .integer('La capacidad debe ser un número entero')
    .required('La capacidad es requerida'),

  // SEO (opcionales)
  seoTitle: yup.string().max(160, 'El título SEO no puede exceder 160 caracteres').nullable(),

  seoDescription: yup.string().max(320, 'La descripción SEO no puede exceder 320 caracteres').nullable(),

  seoKeywords: yup.string().max(500, 'Las palabras clave SEO no pueden exceder 500 caracteres').nullable(),

  seoImage: yup.string().url('Debe ser una URL válida').max(500, 'La URL de la imagen SEO no puede exceder 500 caracteres').nullable()
})
