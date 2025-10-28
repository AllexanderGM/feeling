# Mis Matches

Página para que los clientes vean y gestionen sus matches, incluyendo matches aceptados, enviados y recibidos.

## 📁 Ubicación

Este módulo reemplaza la vista legacy `Matches.jsx`. Asegúrate de que las rutas usen `APP_PATHS.USER.MY_MATCHES` cuando quieras llevar al usuario a esta pantalla.

## 🎯 Propósito

Permite a los usuarios:

- Ver sus matches activos (aceptados mutuamente)
- Ver solicitudes de match enviadas y su estado
- Ver solicitudes de match recibidas
- Acceder al perfil completo de otros usuarios
- Filtrar y buscar entre sus matches

## ✨ Características

### 1. **Tabs de Navegación**

Tres pestañas principales:

#### 📱 **Matches** (Aceptados)

- Muestra matches mutuos confirmados
- Estado: Ambos usuarios aceptaron
- Información mostrada:
  - Avatar y nombre completo
  - Edad calculada
  - Ubicación (ciudad y país)
  - Categoría de interés
  - Fecha del match

#### 📤 **Enviados**

- Solicitudes que el usuario envió
- Estados posibles:
  - `PENDING`: Esperando respuesta
  - `ACCEPTED`: Aceptada (se convierte en match)
  - `REJECTED`: Rechazada
  - `EXPIRED`: Expirada
- Muestra el usuario destino de la solicitud

#### 📥 **Recibidos**

- Solicitudes que el usuario recibió
- Mismos estados que enviados
- Muestra el usuario que envió la solicitud

### 2. **Tarjetas de Estadísticas**

```
┌──────────────────┬──────────────────┬──────────────────┐
│  Matches Activos │    Enviados      │    Recibidos     │
│        42        │        15        │        8         │
└──────────────────┴──────────────────┴──────────────────┘
```

### 3. **Tabla Genérica Reutilizable**

Usa `GenericDataTable` con:

- ✅ Paginación
- ✅ Búsqueda local
- ✅ Ordenamiento
- ✅ Cambio de filas por página
- ✅ Refresh de datos
- ✅ Renderizado personalizado de celdas

### 4. **Acciones**

- **Ver Perfil**: Navega a `/profile/:userId` para ver detalles completos

## 🔧 Estructura de Datos

### Match Object

```javascript
{
  id: "match-123",
  status: "ACCEPTED" | "PENDING" | "REJECTED" | "EXPIRED",
  sourceUser: {
    id: "user-1",
    name: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    mainImage: { url: "..." },
    dateOfBirth: [1995, 3, 15],
    city: "Bogotá",
    country: "Colombia",
    categoryInterest: "AMISTAD"
  },
  targetUser: {
    // Mismo formato que sourceUser
  },
  createdAt: [2025, 1, 15, 10, 30, 0],
  acceptedAt: [2025, 1, 16, 14, 20, 0]
}
```

### Pagination Object

```javascript
{
  page: 0,           // Página actual (0-indexed)
  totalPages: 5,     // Total de páginas
  totalElements: 42, // Total de elementos
  size: 10          // Elementos por página
}
```

## 🎨 Columnas de la Tabla

### Matches Aceptados

1. **USUARIO**: Avatar + Nombre + Email
2. **EDAD**: Calculada desde fecha de nacimiento
3. **UBICACIÓN**: Ciudad, País
4. **INTERÉS**: Chip con categoría
5. **FECHA MATCH**: Fecha de aceptación
6. **ACCIONES**: Ver perfil

### Enviados/Recibidos

1. **USUARIO**: Avatar + Nombre + Email
2. **EDAD**: Calculada desde fecha de nacimiento
3. **UBICACIÓN**: Ciudad, País
4. **ESTADO**: Chip con estado (Pending/Accepted/Rejected/Expired)
5. **ENVIADO/RECIBIDO**: Fecha de creación
6. **ACCIONES**: Ver perfil

## 📡 Servicios Utilizados

### matchQueryService

```javascript
// Obtener matches aceptados (mutuos)
await matchQueryService.getAcceptedMatches(page, size)

// Obtener matches enviados
await matchQueryService.getSentMatches(page, size)

// Obtener matches recibidos
await matchQueryService.getReceivedMatches(page, size)
```

## 🎭 Estados y Flujos

### Estado de Carga

```javascript
const [loading, setLoading] = useState(false)
```

### Lazy Loading de Tabs

- Solo carga datos cuando el usuario hace clic en la tab
- Evita cargas innecesarias
- Mejora el rendimiento inicial

```javascript
useEffect(() => {
  if (selectedTab === 'sent' && sentMatches.length === 0) {
    loadSentMatches()
  }
}, [selectedTab])
```

### Búsqueda Local

Filtra por:

- Nombre
- Apellido
- Email

```javascript
const filteredMatches = useMemo(() => {
  if (!searchQuery) return matches
  return matches.filter(match => {
    const user = match?.targetUser || match?.sourceUser
    return (
      user.name?.toLowerCase().includes(query) || user.lastName?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
    )
  })
}, [matches, searchQuery])
```

## 🔄 Paginación

### Cliente → Backend

- Frontend usa páginas 1-indexed
- Backend usa páginas 0-indexed
- Conversión automática en handlers

```javascript
const handlePageChange = (newPage, tab) => {
  const page = newPage - 1 // Convertir a 0-indexed
  loadMatches(page, size)
}
```

## 🎨 Identidad Gráfica

### Colores por Tab

- **Matches**: Verde (`green-500`)
- **Enviados**: Azul (`blue-500`)
- **Recibidos**: Púrpura (`purple-500`)

### Colores por Estado

- **PENDING**: Amarillo (`warning`)
- **ACCEPTED**: Verde (`success`)
- **REJECTED**: Rojo (`danger`)
- **EXPIRED**: Gris (`default`)

## 🚀 Navegación

### Ver Perfil de Usuario

```javascript
navigate(`/profile/${userId}`)
```

Lleva a `src/pages/user/profile/Profile.jsx` donde se muestra:

- Información completa del usuario
- Galería de imágenes
- Intereses y preferencias
- Botones de acción

## 📱 Responsive Design

### Mobile (< 640px)

- Stats cards: 1 columna
- Tabla: Scroll horizontal
- Tabs: Stack vertical

### Tablet (640px - 1024px)

- Stats cards: 3 columnas
- Tabla: Optimizada

### Desktop (> 1024px)

- Layout completo
- Todas las columnas visibles

## 🔐 Protección

Ruta protegida con:

```jsx
<RequireCompleteProfile>
  <MyMatches />
</RequireCompleteProfile>
```

Requiere:

1. Usuario autenticado
2. Perfil completado
3. Email verificado

## 🐛 Manejo de Errores

### Errores de Carga

```javascript
try {
  const response = await matchQueryService.getAcceptedMatches()
  // Procesar datos
} catch (error) {
  Logger.error('load_matches', error)
  handleError('Error al cargar tus matches')
}
```

### Estados Vacíos

- Mensajes personalizados por tab
- "No tienes matches aceptados aún"
- "No has enviado solicitudes de match"
- "No has recibido solicitudes de match"

## 🎯 Próximas Mejoras

### Implementar Backend

- [ ] Búsqueda en backend (actualmente es local)
- [ ] Ordenamiento en backend
- [ ] Filtros avanzados (por fecha, estado, etc.)

### Funcionalidades

- [ ] Aceptar/Rechazar desde tabla de recibidos
- [ ] Cancelar solicitud enviada
- [ ] Chat directo desde la tabla
- [ ] Exportar lista de matches
- [ ] Notificaciones en tiempo real

### UX Improvements

- [ ] Skeleton loading
- [ ] Transiciones suaves entre tabs
- [ ] Infinite scroll
- [ ] Filtros rápidos (última semana, mes, etc.)

## 📊 Métricas

La página registra:

- Tiempo de carga de cada tab
- Errores de API
- Clics en "Ver perfil"
- Búsquedas realizadas

## 🔗 Rutas Relacionadas

- `/matches` - Página principal de matches (sugerencias)
- `/profile/:userId` - Perfil de usuario
- `/my-matches` - Esta página
- `/favorites` - Usuarios favoritos

## 🎓 Ejemplo de Uso

```jsx
// Cargar matches aceptados
loadAcceptedMatches(0, 10) // página 0, 10 por página

// Navegar a perfil
handleViewProfile(match) // Extrae userId y navega

// Buscar
handleSearch('Juan', 'accepted') // Busca en matches aceptados
```

## 🏗️ Arquitectura

```
MyMatches.jsx
├── Header & Stats
├── Tabs (Accepted, Sent, Received)
│   ├── GenericDataTable
│   │   ├── Search
│   │   ├── Refresh
│   │   ├── Table
│   │   │   ├── renderCell (custom)
│   │   │   └── GenericTableActions
│   │   └── Pagination
│   └── Empty State
└── LiteContainer (layout)
```

## 📝 Notas Importantes

1. **Diferencia entre sourceUser y targetUser**:

   - `sourceUser`: Quien envió la solicitud
   - `targetUser`: Quien recibió la solicitud
   - En "Enviados": Mostrar `targetUser`
   - En "Recibidos": Mostrar `sourceUser`
   - En "Aceptados": Mostrar el que NO es el usuario actual

2. **Formato de Fecha Java**:

   - Backend devuelve: `[2025, 1, 15, 10, 30, 0]`
   - Usar `formatJavaDateForDisplay()` para mostrar
   - Usar `calculateAgeFromJavaDate()` para edad

3. **Paginación 0-indexed**:

   - Backend usa 0-indexed
   - UI muestra 1-indexed
   - Conversión en handlers

4. **Búsqueda Local**:
   - Actualmente es filtro local
   - TODO: Migrar a búsqueda en backend
   - Funciona bien con < 100 items
