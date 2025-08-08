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
  { value: 20, label: '20' },
  { value: 50, label: '50' }
]

export const DEFAULT_ROWS_PER_PAGE = 10

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

// ===============================
// CONFIGURACIONES DE COLUMNAS PARA GESTIÓN DE EVENTOS
// ===============================

// Eventos Activos: nombre+imagen, destino, categoría, precio, registrados, estado, fecha
export const ACTIVE_EVENT_COLUMNS = [
  { name: 'EVENTO', uid: 'event', sortable: true },
  { name: 'DESTINO', uid: 'destination', sortable: true },
  { name: 'CATEGORÍA', uid: 'category', sortable: true },
  { name: 'PRECIO', uid: 'price', sortable: true },
  { name: 'REGISTRADOS', uid: 'registrations', sortable: true },
  { name: 'ESTADO', uid: 'isActive', sortable: true },
  { name: 'FECHA INICIO', uid: 'startDate', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Eventos Próximos: mismas columnas que activos
export const UPCOMING_EVENT_COLUMNS = [
  { name: 'EVENTO', uid: 'event', sortable: true },
  { name: 'DESTINO', uid: 'destination', sortable: true },
  { name: 'CATEGORÍA', uid: 'category', sortable: true },
  { name: 'PRECIO', uid: 'price', sortable: true },
  { name: 'REGISTRADOS', uid: 'registrations', sortable: true },
  { name: 'ESTADO', uid: 'isActive', sortable: true },
  { name: 'FECHA INICIO', uid: 'startDate', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Todos los Eventos (Admin): incluye creador y fechas de creación/actualización
export const ALL_EVENT_COLUMNS = [
  { name: 'EVENTO', uid: 'event', sortable: true },
  { name: 'CREADOR', uid: 'creator', sortable: true },
  { name: 'DESTINO', uid: 'destination', sortable: true },
  { name: 'CATEGORÍA', uid: 'category', sortable: true },
  { name: 'PRECIO', uid: 'price', sortable: true },
  { name: 'REGISTRADOS', uid: 'registrations', sortable: true },
  { name: 'ESTADO', uid: 'isActive', sortable: true },
  { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Mapeo de tipos de evento a columnas
export const EVENT_TYPE_COLUMNS = {
  active: ACTIVE_EVENT_COLUMNS,
  upcoming: UPCOMING_EVENT_COLUMNS,
  all: ALL_EVENT_COLUMNS,
  PUBLICADO: ALL_EVENT_COLUMNS,
  EN_EDICION: ALL_EVENT_COLUMNS,
  PAUSADO: ALL_EVENT_COLUMNS,
  CANCELADO: ALL_EVENT_COLUMNS,
  TERMINADO: ALL_EVENT_COLUMNS
}

// ========================================
// COMPLAINTS CONSTANTS
// ========================================

export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_USER: 'WAITING_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED'
}

export const COMPLAINT_STATUS_COLORS = {
  OPEN: 'primary',
  IN_PROGRESS: 'warning',
  WAITING_USER: 'secondary',
  RESOLVED: 'success',
  CLOSED: 'default',
  ESCALATED: 'danger'
}

export const COMPLAINT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

export const COMPLAINT_PRIORITY_COLORS = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  URGENT: 'danger'
}

export const COMPLAINT_TYPES = {
  GENERAL: 'Consulta general',
  TECHNICAL_ISSUE: 'Problema técnico',
  ACCOUNT_ISSUE: 'Problema de cuenta',
  PAYMENT_ISSUE: 'Problema de pago',
  USER_REPORT: 'Reporte de usuario',
  EVENT_ISSUE: 'Problema con evento',
  BOOKING_ISSUE: 'Problema con reserva',
  PRIVACY_CONCERN: 'Preocupación de privacidad',
  FEATURE_REQUEST: 'Solicitud de funcionalidad',
  BUG_REPORT: 'Reporte de error',
  ABUSE_REPORT: 'Reporte de abuso',
  REFUND_REQUEST: 'Solicitud de reembolso'
}

// Columnas para las diferentes vistas de quejas
export const COMPLAINT_TYPE_COLUMNS = {
  all: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'PRIORIDAD', uid: 'priority', sortable: true },
    { name: 'ESTADO', uid: 'status', sortable: true },
    { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
    { name: 'ÚLTIMA ACTUALIZACIÓN', uid: 'updatedAt', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  pending: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'PRIORIDAD', uid: 'priority', sortable: true },
    { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
    { name: 'TIEMPO TRANSCURRIDO', uid: 'elapsed', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  urgent: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
    { name: 'TIEMPO TRANSCURRIDO', uid: 'elapsed', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  overdue: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
    { name: 'TIEMPO VENCIDO', uid: 'overdue', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  resolved: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'USUARIO', uid: 'user', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'RESUELTO POR', uid: 'resolvedBy', sortable: true },
    { name: 'FECHA RESOLUCIÓN', uid: 'resolvedAt', sortable: true },
    { name: 'TIEMPO RESOLUCIÓN', uid: 'resolutionTime', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ],
  my: [
    { name: 'ID', uid: 'id', sortable: true },
    { name: 'ASUNTO', uid: 'subject', sortable: true },
    { name: 'TIPO', uid: 'complaintType', sortable: true },
    { name: 'PRIORIDAD', uid: 'priority', sortable: true },
    { name: 'ESTADO', uid: 'status', sortable: true },
    { name: 'FECHA CREACIÓN', uid: 'createdAt', sortable: true },
    { name: 'ÚLTIMA ACTUALIZACIÓN', uid: 'updatedAt', sortable: true },
    { name: 'ACCIONES', uid: 'actions' }
  ]
}

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
  availability: [
    {
      availableDate: '',
      availableSlots: 10,
      departureTime: '',
      returnTime: ''
    }
  ]
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
  { name: 'DESCRIPCIÓN', uid: 'description', sortable: true },
  { name: 'INTENTOS', uid: 'attempts', sortable: true },
  { name: 'PRECIO', uid: 'price', sortable: true },
  { name: 'ESTADO', uid: 'isActive', sortable: true },
  { name: 'ORDEN', uid: 'sortOrder', sortable: true },
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

// ===============================
// CONFIGURACIONES DE COLUMNAS PARA GESTIÓN DE USUARIOS
// ===============================

// Usuarios Activos: nombre+correo+imagen, interés, completitud, ubicación, rol, matches
export const ACTIVE_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
  { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
  { name: 'UBICACIÓN', uid: 'location', sortable: true },
  { name: 'ROL', uid: 'role', sortable: true },
  { name: 'MATCHES', uid: 'matches', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Usuarios Pendientes: nombre+correo+imagen, interés, completitud, edad, ubicación, teléfono
export const PENDING_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
  { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
  { name: 'EDAD', uid: 'age', sortable: true },
  { name: 'UBICACIÓN', uid: 'location', sortable: true },
  { name: 'TELÉFONO', uid: 'phone', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Usuarios Incompletos: nombre+correo+imagen, fuente de registro, fecha de registro
export const INCOMPLETE_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'FUENTE', uid: 'authProvider', sortable: true },
  { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Usuarios Sin Verificar: igual que incompletos
export const UNVERIFIED_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'FUENTE', uid: 'authProvider', sortable: true },
  { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Usuarios No Aprobados: incluye completitud para mejor análisis
export const NON_APPROVED_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'FUENTE', uid: 'authProvider', sortable: true },
  { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
  { name: 'FECHA REGISTRO', uid: 'createdAt', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Usuarios Desactivados: mismas columnas que usuarios activos
export const DEACTIVATED_USER_COLUMNS = [
  { name: 'USUARIO', uid: 'user', sortable: true },
  { name: 'INTERÉS', uid: 'categoryInterest', sortable: true },
  { name: 'COMPLETITUD', uid: 'profileCompleteness', sortable: true },
  { name: 'UBICACIÓN', uid: 'location', sortable: true },
  { name: 'ROL', uid: 'role', sortable: true },
  { name: 'MATCHES', uid: 'matches', sortable: true },
  { name: 'ACCIONES', uid: 'actions' }
]

// Mapeo de tipos de usuario a columnas
export const USER_TYPE_COLUMNS = {
  active: ACTIVE_USER_COLUMNS,
  pending: PENDING_USER_COLUMNS,
  incomplete: INCOMPLETE_USER_COLUMNS,
  unverified: UNVERIFIED_USER_COLUMNS,
  nonApproved: NON_APPROVED_USER_COLUMNS,
  deactivated: DEACTIVATED_USER_COLUMNS
}

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INCOMPLETE: 'INCOMPLETE',
  UNVERIFIED: 'UNVERIFIED',
  NON_APPROVED: 'NON_APPROVED',
  DEACTIVATED: 'DEACTIVATED'
}

export const USER_STATUS_COLORS = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INCOMPLETE: 'secondary',
  UNVERIFIED: 'danger',
  NON_APPROVED: 'default',
  DEACTIVATED: 'danger'
}

export const USER_AUTH_PROVIDERS = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK'
}

export const USER_AUTH_PROVIDER_COLORS = {
  LOCAL: 'primary',
  GOOGLE: 'success',
  FACEBOOK: 'secondary'
}

export const USER_AUTH_PROVIDER_LABELS = {
  LOCAL: 'Registro Local',
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook'
}
