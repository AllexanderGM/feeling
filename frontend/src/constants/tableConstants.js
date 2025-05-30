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

export const USER_COLUMNS = [
  { name: 'ID', uid: 'id' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'EMAIL', uid: 'email' },
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
