export const INITIAL_VISIBLE_COLUMNS = [
  { name: 'NOMBRE', uid: 'nombre' },
  { name: 'DESTINO', uid: 'destino' },
  { name: 'CATEGORÍA', uid: 'categoria' },
  { name: 'PRECIO', uid: 'precio' },
  { name: 'ACCIONES', uid: 'actions' }
]

export const STATUS_COLOR_MAP = {
  BEACH: 'primary',
  VACATION: 'success',
  ADVENTURE: 'warning',
  ECOTOURISM: 'secondary',
  LUXURY: 'success',
  CITY: 'danger',
  MOUNTAIN: 'warning',
  CRUISE: 'primary',
  ADRENALIN: 'danger'
}

export const ROWS_PER_PAGE_OPTIONS = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' }
]

export const TOUR_COLUMNS = [
  { name: 'NOMBRE', uid: 'nombre' },
  { name: 'DESTINO', uid: 'destino' },
  { name: 'CATEGORÍA', uid: 'categoria' },
  { name: 'PRECIO', uid: 'precio' },
  { name: 'ACCIONES', uid: 'actions' }
]

export const TOUR_STATUS_COLOR_MAP = {
  BEACH: 'primary',
  VACATION: 'success',
  ADVENTURE: 'warning',
  ECOTOURISM: 'secondary',
  LUXURY: 'success',
  CITY: 'danger',
  MOUNTAIN: 'warning',
  CRUISE: 'primary',
  ADRENALIN: 'danger'
}

// Users
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT'
}

export const USER_ROLE_COLORS = {
  ADMIN: 'danger',
  CLIENT: 'success'
}

export const USER_INTEREST_COLORS = {
  ROSE: 'danger',
  ESSENCE: 'primary',
  ROUSE: 'warning'
}

export const USER_COLUMNS = [
  { name: 'ID', uid: 'id' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'EDAD', uid: 'age' },
  { name: 'INTERÉS', uid: 'categoryInterest' },
  { name: 'UBICACIÓN', uid: 'location' },
  { name: 'MATCHES', uid: 'matches' },
  { name: 'COMPLETITUD', uid: 'profileCompleteness' },
  { name: 'VERIFICADO', uid: 'verified' },
  { name: 'ROL', uid: 'role' },
  { name: 'ACCIONES', uid: 'actions' }
]

export const USER_FORM_VALIDATIONS = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{9}$/,
  PASSWORD_MIN_LENGTH: 6
}

export const DEFAULT_USER_FORM_DATA = {
  image: '',
  name: '',
  lastName: '',
  document: '',
  phone: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  city: '',
  role: USER_ROLES.CLIENT
}

// Events
export const EVENT_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  AGOTADO: 'AGOTADO',
  CANCELADO: 'CANCELADO',
  PENDIENTE: 'PENDIENTE'
}

export const EVENT_STATUS_COLORS = {
  DISPONIBLE: 'success',
  AGOTADO: 'warning',
  CANCELADO: 'danger',
  PENDIENTE: 'secondary'
}

export const EVENT_CATEGORIES = {
  CULTURAL: 'CULTURAL',
  ADVENTURE: 'ADVENTURE',
  BEACH: 'BEACH',
  CITY: 'CITY',
  LUXURY: 'LUXURY',
  ECOTOURISM: 'ECOTOURISM'
}

export const EVENT_CATEGORY_COLORS = {
  CULTURAL: 'primary',
  ADVENTURE: 'warning',
  BEACH: 'primary',
  CITY: 'danger',
  LUXURY: 'success',
  ECOTOURISM: 'secondary'
}

export const EVENT_COLUMNS = [
  { name: 'ID', uid: 'id' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'DESTINO', uid: 'destination' },
  { name: 'PRECIO', uid: 'price' },
  { name: 'ETIQUETAS', uid: 'tags' },
  { name: 'DISPONIBILIDAD', uid: 'availability' },
  { name: 'ESTADO', uid: 'status' },
  { name: 'FECHA CREACIÓN', uid: 'createdAt' },
  { name: 'ACCIONES', uid: 'actions' }
]

export const DEFAULT_EVENT_FORM_DATA = {
  name: '',
  description: '',
  destination: {
    city: '',
    country: ''
  },
  adultPrice: 0,
  childPrice: 0,
  images: [],
  status: EVENT_STATUS.DISPONIBLE,
  tags: [],
  includes: [],
  hotel: 4,
  availability: [{
    availableDate: '',
    availableSlots: 10,
    departureTime: '',
    returnTime: ''
  }]
}

// ===============================
// MATCH PLANS CONSTANTS
// ===============================

export const MATCH_PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}

export const MATCH_PLAN_STATUS_COLORS = {
  ACTIVE: 'success',
  INACTIVE: 'default'
}

export const MATCH_PLAN_COLUMNS = [
  { name: 'NOMBRE', uid: 'name', sortable: true },
  { name: 'INTENTOS', uid: 'attempts', sortable: true },
  { name: 'PRECIO', uid: 'price', sortable: true },
  { name: 'COMPRAS', uid: 'totalPurchases', sortable: true },
  { name: 'INGRESOS', uid: 'revenue', sortable: true },
  { name: 'ESTADO', uid: 'isActive', sortable: true },
  { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

export const DEFAULT_MATCH_PLAN_FORM_DATA = {
  name: '',
  description: '',
  attempts: 1,
  price: 0,
  isActive: true
}

// ===============================
// MATCHES CONSTANTS
// ===============================

export const MATCH_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const MATCH_STATUS_COLORS = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger'
}

export const MATCH_STATUS_LABELS = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado'
}

export const MATCH_SECTIONS = {
  DISCOVER: 'discover',
  SENT: 'sent',
  RECEIVED: 'received',
  ACCEPTED: 'accepted',
  FAVORITES: 'favorites'
}

export const MATCH_SECTION_LABELS = {
  [MATCH_SECTIONS.DISCOVER]: 'Descubrir',
  [MATCH_SECTIONS.SENT]: 'Enviados',
  [MATCH_SECTIONS.RECEIVED]: 'Recibidos',
  [MATCH_SECTIONS.ACCEPTED]: 'Matches',
  [MATCH_SECTIONS.FAVORITES]: 'Favoritos'
}

// ===============================
// CATEGORY INTEREST CONSTANTS
// ===============================

export const CATEGORY_INTEREST_ICONS = {
  ESSENCE: 'sparkles',
  ROUSE: 'flame',
  SPIRIT: 'message-circle'
}

export const CATEGORY_INTEREST_COLORS = {
  ESSENCE: 'primary',
  ROUSE: 'danger',
  SPIRIT: 'secondary'
}
