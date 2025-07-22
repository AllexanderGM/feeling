# Frontend - Feeling

## 📋 Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes](#componentes)
- [Sistema de Rutas](#sistema-de-rutas)
- [Estado Global](#estado-global)
- [Servicios y APIs](#servicios-y-apis)
- [Estilos](#estilos)
- [Testing](#testing)
- [Build y Despliegue](#build-y-despliegue)
- [Variables de Entorno](#variables-de-entorno)

## 🚀 Stack Tecnológico

- **React 18**: Framework principal con hooks y functional components
- **Vite**: Build tool y dev server ultrarrápido
- **TailwindCSS**: Framework CSS utility-first
- **React Router DOM v6**: Navegación SPA
- **Axios**: Cliente HTTP para APIs
- **Context API**: Gestión de estado global
- **Material Symbols**: Iconografía oficial de Google
- **React Hook Form**: Manejo de formularios (opcional)
- **Date-fns**: Manipulación de fechas

## 🏗️ Arquitectura

El frontend sigue una arquitectura moderna basada en componentes funcionales:

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Input, Card, Modal)
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   ├── forms/          # Formularios específicos del dominio
│   └── shared/         # Componentes compartidos
├── pages/              # Páginas/Vistas principales
│   ├── auth/           # Login, Register, RecoverPassword
│   ├── user/           # Profile, Settings, EditProfile
│   ├── app/            # Home, Matches, Events, Search
│   └── general/        # Welcome, About, Contact, 404
├── routes/             # Configuración de rutas
│   ├── router.jsx      # Definición de rutas
│   ├── RequireAuth.jsx # Guard de autenticación
│   └── PrivateRoute.jsx # Rutas protegidas
├── context/            # Estado global con Context API
│   ├── AuthContext.jsx # Contexto de autenticación
│   ├── UserContext.jsx # Contexto de usuario
│   └── AppContext.jsx  # Contexto general de la app
├── services/           # Comunicación con APIs
│   ├── api.js          # Configuración base de Axios
│   ├── authService.js  # Servicios de autenticación
│   ├── userService.js  # Servicios de usuario
│   ├── matchService.js # Servicios de matching
│   └── eventService.js # Servicios de eventos
├── hooks/              # Custom hooks
│   ├── useAuth.js      # Hook de autenticación
│   ├── useApi.js       # Hook para llamadas API
│   └── useForm.js      # Hook para formularios
├── utils/              # Utilidades
│   ├── validators.js   # Validaciones
│   ├── constants.js    # Constantes
│   ├── helpers.js      # Funciones auxiliares
│   └── formatters.js   # Formateo de datos
├── assets/             # Recursos estáticos
│   ├── images/         # Imágenes y logos
│   ├── icons/          # Iconos SVG personalizados
│   └── styles/         # Estilos globales
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales y Tailwind
```

## 💻 Instalación

```bash
# Navegar al directorio
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Desarrollo

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo en http://localhost:5173
npm run build        # Build de producción
npm run preview      # Preview del build de producción
npm run lint         # Linting con ESLint
npm run format       # Formateo con Prettier
```

### Flujo de desarrollo

1. **Crear rama de feature**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar con hot reload**: `npm run dev`
3. **Verificar linting**: `npm run lint`
4. **Commit con mensajes descriptivos**
5. **Push y crear PR**

## 📁 Estructura del Proyecto

### Componentes UI Base

```javascript
// components/ui/Button.jsx
export const Button = ({ variant, size, children, ...props }) => {
  // Botón reutilizable con variantes
}

// components/ui/Input.jsx
export const Input = ({ type, error, ...props }) => {
  // Input con manejo de errores
}

// components/ui/Card.jsx
export const Card = ({ children, className }) => {
  // Card container reutilizable
}
```

### Páginas

- **Welcome**: Landing page pública
- **Login/Register**: Autenticación de usuarios
- **Home**: Dashboard principal (requiere auth)
- **Profile**: Perfil de usuario editable
- **Search**: Búsqueda con filtros avanzados
- **Matches**: Gestión de matches e intentos
- **Events**: Listado y reserva de eventos

## 🛣️ Sistema de Rutas

```javascript
// routes/router.jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Rutas públicas
      { index: true, element: <Welcome /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Rutas protegidas
      {
        element: <RequireAuth />,
        children: [
          { path: 'home', element: <Home /> },
          { path: 'profile', element: <Profile /> },
          { path: 'matches', element: <Matches /> },
          { path: 'events', element: <Events /> }
        ]
      }
    ]
  }
])
```

### Guards de Autenticación

- **RequireAuth**: Protege rutas que requieren login
- **RequireProfileComplete**: Requiere perfil completo
- **RequireSubscription**: Requiere plan activo

## 🌐 Estado Global

### AuthContext

```javascript
// Maneja:
- Estado de autenticación (isAuthenticated, user)
- Login/Logout
- Refresh token
- Persistencia de sesión
```

### UserContext

```javascript
// Maneja:
- Datos del perfil de usuario
- Preferencias
- Plan actual
- Intentos disponibles
```

### AppContext

```javascript
// Maneja:
- Estado global de la UI
- Notificaciones
- Loading states
- Configuración de la app
```

## 🔌 Servicios y APIs

### Configuración Base

```javascript
// services/api.js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

// Interceptor para auth
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Servicios principales

- **authService**: login, register, logout, refreshToken
- **userService**: getProfile, updateProfile, uploadPhoto
- **matchService**: searchUsers, sendMatch, getMatches
- **eventService**: getEvents, reserveEvent, getMyEvents
- **paymentService**: getPlans, purchasePlan, getPaymentHistory

## 🎨 Estilos

### TailwindCSS

```css
/* Configuración personalizada en tailwind.config.js */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        dark: '#1A1A2E',
      }
    }
  }
}
```

### Componentes estilizados

- Uso de clases utility de Tailwind
- Tema oscuro por defecto
- Diseño responsive mobile-first
- Animaciones y transiciones suaves

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Tipos de tests

- **Unit tests**: Componentes individuales
- **Integration tests**: Flujos completos
- **E2E tests**: Cypress (próximamente)

## 📦 Build y Despliegue

### Build de producción

```bash
# Generar build
npm run build

# Preview local del build
npm run preview
```

### Optimizaciones

- Code splitting automático
- Lazy loading de rutas
- Minificación y tree shaking
- Compresión de assets
- PWA ready

### Despliegue

El frontend se despliega como sitio estático en:

- **Desarrollo**: Vite dev server
- **Producción**: AWS S3 + CloudFront

## 🔐 Variables de Entorno

```bash
# .env
VITE_API_URL=http://localhost:8081/api
VITE_APP_NAME=Feeling
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_MAPS_KEY=your_key_here
VITE_WHATSAPP_NUMBER=573001234567
```

### Acceso en el código

```javascript
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
```

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

Breakpoints de Tailwind:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## 🔒 Seguridad

- Sanitización de inputs
- Validación client-side
- Protección XSS
- HTTPS en producción
- Tokens JWT seguros
- Rate limiting

## 🚀 Mejores Prácticas

1. **Componentes**: Pequeños, reutilizables y testables
2. **Estado**: Mínimo necesario, cerca de donde se usa
3. **Props**: Validación con PropTypes
4. **Hooks**: Custom hooks para lógica compleja
5. **Performance**: Memo, useMemo, useCallback
6. **Accesibilidad**: ARIA labels, navegación por teclado

---

Para más información, consulta la [documentación principal](../README.md)
