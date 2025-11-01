# TODO: Sistema de Gestión de Estados de Eventos

## Resumen del Proyecto
Implementar un sistema completo de gestión de estados para eventos, permitiendo controlar el ciclo de vida de cada evento (EN_EDICION, PUBLICADO, PAUSADO, CANCELADO, TERMINADO) con acciones específicas según el estado.

---

## Estados de Eventos

### Estados Disponibles (Backend)
- **EN_EDICION**: Evento en proceso de creación/edición (draft)
- **PUBLICADO**: Evento activo y visible para el público
- **PAUSADO**: Evento publicado pero temporalmente pausado
- **CANCELADO**: Evento cancelado (estado final)
- **TERMINADO**: Evento que ya finalizó (estado final, automático)

### Transiciones de Estado Permitidas
```
EN_EDICION → PUBLICADO (publish)
PUBLICADO → PAUSADO (pause)
PUBLICADO → CANCELADO (cancel)
PAUSADO → PUBLICADO (publish)
PAUSADO → EN_EDICION (back-to-edition)
PAUSADO → CANCELADO (cancel)
CANCELADO → EN_EDICION (activar - reactivación)
TERMINADO → EN_EDICION/PUBLICADO (al editar y cambiar fecha)
```

---

## Acciones por Estado

### 📗 PUBLICADO
- ✅ Ver evento
- ✏️ Editar evento
- ⏸️ Pausar evento
- ❌ Cancelar evento
- 🗑️ Eliminar evento

### 📝 EN_EDICION
- ✅ Ver evento
- ✏️ Editar evento
- 📤 Publicar evento
- ❌ Cancelar evento
- 🗑️ Eliminar evento

### ⏸️ PAUSADO
- ✅ Ver evento
- ✏️ Editar evento
- 📤 Publicar evento (reanudar)
- ❌ Cancelar evento
- 🗑️ Eliminar evento

### ❌ CANCELADO
- ✅ Ver evento
- 🔄 Activar evento (vuelve a EN_EDICION)
- 🗑️ Eliminar evento

### ⏹️ TERMINADO
- ✅ Ver evento
- ✏️ Modificar evento (puede cambiar estado si se modifica fecha)
- 🗑️ Eliminar evento

---

## Fase 1: Backend - Endpoints y Servicios

### ✅ 1.1 Verificar Endpoints Existentes
**Ubicación**: `backend/src/main/java/com/feeling/packages/event/application/EventController.java`

Endpoints ya implementados:
- ✅ `PATCH /events/{id}/publish` - Publicar evento
- ✅ `PATCH /events/{id}/pause` - Pausar evento
- ✅ `PATCH /events/{id}/cancel` - Cancelar evento
- ✅ `PATCH /events/{id}/finish` - Terminar evento
- ✅ `PATCH /events/{id}/back-to-edition` - Volver a edición
- ✅ `GET /events/status/{status}` - Obtener eventos por estado

**Estado**: Endpoints ya están implementados en el backend ✅

### 🔲 1.2 Agregar Endpoint de Activación para Eventos Cancelados
**Ubicación**: `backend/src/main/java/com/feeling/packages/event/application/EventController.java`

Crear nuevo endpoint:
```java
@PatchMapping("/{id}/activate")
@Operation(summary = "Activate cancelled event", description = "Activate a cancelled event (moves to EN_EDICION)")
public ResponseEntity<EventResponseDTO> activateEvent(
    @Parameter(description = "Event ID") @PathVariable Long id,
    Authentication authentication) {

    String userEmail = authentication.getName();
    EventResponseDTO updatedEvent = eventService.activateEvent(id, userEmail);
    return ResponseEntity.ok(updatedEvent);
}
```

**Archivos a modificar**:
- `backend/src/main/java/com/feeling/packages/event/application/EventController.java`
- `backend/src/main/java/com/feeling/packages/event/domain/services/EventService.java`
- `backend/src/main/java/com/feeling/packages/event/infrastructure/entities/Event.java`

### 🔲 1.3 Validar Lógica de Transiciones en Event Entity
**Ubicación**: `backend/src/main/java/com/feeling/packages/event/infrastructure/entities/Event.java`

Agregar método:
```java
public void activate() {
    if (status == EventStatus.CANCELADO) {
        this.status = EventStatus.EN_EDICION;
        this.isActive = false; // En edición no es activo públicamente
    }
}
```

### 🔲 1.4 Implementar Lógica de Terminación Automática
**Ubicación**: `backend/src/main/java/com/feeling/packages/event/domain/services/EventService.java`

Crear método para verificar y actualizar eventos terminados automáticamente:
```java
@Scheduled(cron = "0 0 * * * *") // Cada hora
public void checkAndFinishExpiredEvents() {
    // Buscar eventos PUBLICADOS cuya fecha ya pasó
    // Cambiar su estado a TERMINADO
}
```

---

## Fase 2: Frontend - Servicios y Hooks

### 🔲 2.1 Actualizar eventService con Nuevos Métodos
**Ubicación**: `frontend/src/services/event/eventService.js`

Agregar métodos:
```javascript
async publishEvent(eventId) {
  const context = 'publicar evento'
  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}/publish`)
    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async pauseEvent(eventId) {
  const context = 'pausar evento'
  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}/pause`)
    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async cancelEvent(eventId) {
  const context = 'cancelar evento'
  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}/cancel`)
    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async activateEvent(eventId) {
  const context = 'activar evento'
  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${eventId}/activate`)
    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}
```

### 🔲 2.2 Actualizar apiRoutes con Nuevos Endpoints
**Ubicación**: `frontend/src/constants/apiRoutes.js`

Agregar en `API_ENDPOINTS.EVENTS`:
```javascript
EVENTS: {
  // ... endpoints existentes
  PUBLISH: '/events/{id}/publish',
  PAUSE: '/events/{id}/pause',
  CANCEL: '/events/{id}/cancel',
  ACTIVATE: '/events/{id}/activate',
  FINISH: '/events/{id}/finish',
  BACK_TO_EDITION: '/events/{id}/back-to-edition'
}
```

### 🔲 2.3 Actualizar useEvents Hook
**Ubicación**: `frontend/src/hooks/event/useEvents.js`

Agregar métodos:
```javascript
const publishEvent = useCallback(async (eventId) => {
  setLoading(true)
  try {
    const result = await eventService.publishEvent(eventId)
    return result
  } catch (error) {
    handleError(error)
    throw error
  } finally {
    setLoading(false)
  }
}, [handleError])

// Similar para pauseEvent, cancelEvent, activateEvent
```

---

## Fase 3: Frontend - Componentes de Tabla

### 🔲 3.1 Crear Componente de Acciones Dinámicas
**Nuevo archivo**: `frontend/src/pages/event/admin/components/EventActions.jsx`

Componente que renderiza botones de acción según el estado del evento:

```javascript
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Eye, Edit, Trash2, Play, Pause, X, CheckCircle, MoreVertical } from 'lucide-react'

const EventActions = ({ event, onView, onEdit, onDelete, onPublish, onPause, onCancel, onActivate, loading }) => {
  const getActionsByStatus = (status) => {
    switch (status) {
      case 'PUBLICADO':
        return ['view', 'edit', 'pause', 'cancel', 'delete']
      case 'EN_EDICION':
        return ['view', 'edit', 'publish', 'cancel', 'delete']
      case 'PAUSADO':
        return ['view', 'edit', 'publish', 'cancel', 'delete']
      case 'CANCELADO':
        return ['view', 'activate', 'delete']
      case 'TERMINADO':
        return ['view', 'edit', 'delete']
      default:
        return ['view', 'edit', 'delete']
    }
  }

  const actions = getActionsByStatus(event.status)

  // Renderizar botones según las acciones permitidas
  // ...
}
```

### 🔲 3.2 Actualizar UnifiedEventTable para Usar Acciones Dinámicas
**Ubicación**: `frontend/src/pages/event/admin/components/UnifiedEventTable.jsx`

Modificar el caso `actions` en `renderCell`:
```javascript
case 'actions':
  return (
    <EventActions
      event={event}
      loading={loading || actionLoading}
      onActivate={() => onActivate?.(event)}
      onCancel={() => onCancel?.(event)}
      onDelete={() => onDelete?.(event)}
      onEdit={() => onEdit?.(event)}
      onPause={() => onPause?.(event)}
      onPublish={() => onPublish?.(event)}
      onView={() => handleViewDetails(event)}
    />
  )
```

### 🔲 3.3 Agregar Columna de Estado (status) a la Tabla
**Ubicación**: `frontend/src/constants/tableConstants.js`

Actualizar `EVENT_TYPE_COLUMNS`:
```javascript
{
  name: 'ESTADO',
  uid: 'status',
  sortable: true
}
```

Y renderizar en UnifiedEventTable:
```javascript
case 'status':
  const statusColors = {
    'PUBLICADO': 'success',
    'EN_EDICION': 'warning',
    'PAUSADO': 'default',
    'CANCELADO': 'danger',
    'TERMINADO': 'secondary'
  }

  const statusLabels = {
    'PUBLICADO': 'Publicado',
    'EN_EDICION': 'En Edición',
    'PAUSADO': 'Pausado',
    'CANCELADO': 'Cancelado',
    'TERMINADO': 'Terminado'
  }

  return (
    <Chip
      color={statusColors[event.status] || 'default'}
      size='sm'
      variant='flat'
    >
      {statusLabels[event.status] || event.status}
    </Chip>
  )
```

---

## Fase 4: Frontend - Formularios de Creación/Edición

### 🔲 4.1 Agregar Botones de Acción en CreateEventForm
**Ubicación**: `frontend/src/pages/event/admin/components/CreateEventForm.jsx`

En el footer del modal, agregar dos botones:
```javascript
<ModalFooter>
  <Button color='danger' variant='light' onPress={onClose}>
    Cancelar
  </Button>
  <Button
    color='warning'
    variant='flat'
    isLoading={loading}
    onPress={() => handleSubmit('EN_EDICION')}
  >
    Guardar como Borrador
  </Button>
  <Button
    color='success'
    isLoading={loading}
    onPress={() => handleSubmit('PUBLICADO')}
  >
    Publicar Evento
  </Button>
</ModalFooter>
```

Modificar `handleSubmit` para aceptar el estado deseado:
```javascript
const handleSubmit = async (desiredStatus) => {
  // ... validaciones

  const eventData = {
    ...formData,
    status: desiredStatus
  }

  await onSubmit({ eventData, media })
}
```

### 🔲 4.2 Agregar Botones de Acción en EditEventForm
**Ubicación**: `frontend/src/pages/event/admin/components/EditEventForm.jsx`

Similar a CreateEventForm, pero los botones cambian según el estado actual:

```javascript
const renderActionButtons = () => {
  const currentStatus = eventData?.status

  switch (currentStatus) {
    case 'EN_EDICION':
      return (
        <>
          <Button color='warning' variant='flat' onPress={() => handleSubmit('EN_EDICION')}>
            Guardar Borrador
          </Button>
          <Button color='success' onPress={() => handleSubmit('PUBLICADO')}>
            Publicar Evento
          </Button>
        </>
      )
    case 'PUBLICADO':
      return (
        <Button color='primary' onPress={() => handleSubmit('PUBLICADO')}>
          Guardar Cambios
        </Button>
      )
    case 'PAUSADO':
      return (
        <>
          <Button color='warning' variant='flat' onPress={() => handleSubmit('EN_EDICION')}>
            Guardar como Borrador
          </Button>
          <Button color='success' onPress={() => handleSubmit('PUBLICADO')}>
            Reanudar Evento
          </Button>
        </>
      )
    // ... otros estados
  }
}
```

### 🔲 4.3 Unificar CreateEventForm y EditEventForm en un Solo Componente
**Nuevo archivo**: `frontend/src/pages/event/admin/components/EventForm.jsx`

Crear un componente unificado que sirva tanto para crear como para editar:
```javascript
const EventForm = ({
  isOpen,
  onClose,
  onSubmit,
  eventData = null, // null para crear, objeto para editar
  mode = 'create' // 'create' | 'edit'
}) => {
  // ... lógica común
}
```

Esto simplifica el mantenimiento y asegura consistencia entre creación y edición.

---

## Fase 5: Frontend - Gestión de Estado en EventManagement

### 🔲 5.1 Agregar Handlers para Nuevas Acciones
**Ubicación**: `frontend/src/pages/event/admin/EventManagement.jsx`

Agregar callbacks:
```javascript
const handlePublishEvent = useCallback(async (eventId) => {
  try {
    await publishEvent(eventId)
    handleSuccess('Evento publicado exitosamente')
    handleOperationSuccess()
  } catch (error) {
    handleError('Error al publicar el evento')
  }
}, [publishEvent, handleSuccess, handleError, handleOperationSuccess])

const handlePauseEvent = useCallback(async (eventId) => {
  try {
    await pauseEvent(eventId)
    handleSuccess('Evento pausado exitosamente')
    handleOperationSuccess()
  } catch (error) {
    handleError('Error al pausar el evento')
  }
}, [pauseEvent, handleSuccess, handleError, handleOperationSuccess])

const handleCancelEvent = useCallback(async (eventId) => {
  try {
    await cancelEvent(eventId)
    handleSuccess('Evento cancelado exitosamente')
    handleOperationSuccess()
  } catch (error) {
    handleError('Error al cancelar el evento')
  }
}, [cancelEvent, handleSuccess, handleError, handleOperationSuccess])

const handleActivateEvent = useCallback(async (eventId) => {
  try {
    await activateEvent(eventId)
    handleSuccess('Evento activado exitosamente')
    handleOperationSuccess()
  } catch (error) {
    handleError('Error al activar el evento')
  }
}, [activateEvent, handleSuccess, handleError, handleOperationSuccess])
```

### 🔲 5.2 Pasar Nuevos Handlers a UnifiedEventTable
```javascript
<UnifiedEventTable
  // ... props existentes
  onPublish={handlePublishEvent}
  onPause={handlePauseEvent}
  onCancel={handleCancelEvent}
  onActivate={handleActivateEvent}
/>
```

---

## Fase 6: Frontend - Modales de Confirmación

### 🔲 6.1 Crear Modal de Confirmación Genérico
**Nuevo archivo**: `frontend/src/pages/event/admin/components/ConfirmActionModal.jsx`

```javascript
const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionType, // 'publish', 'pause', 'cancel', 'activate', 'delete'
  eventData,
  loading
}) => {
  // Renderizar modal con mensajes y estilos según actionType
}
```

### 🔲 6.2 Implementar Confirmaciones para Acciones Críticas
**Ubicación**: `frontend/src/pages/event/admin/EventManagement.jsx`

Agregar estados para modales:
```javascript
const [confirmModalState, setConfirmModalState] = useState({
  isOpen: false,
  action: null,
  eventData: null
})
```

Modificar handlers para mostrar confirmación antes de ejecutar:
```javascript
const handleCancelEvent = useCallback((event) => {
  setConfirmModalState({
    isOpen: true,
    action: 'cancel',
    eventData: event
  })
}, [])

const executeAction = useCallback(async () => {
  const { action, eventData } = confirmModalState

  switch (action) {
    case 'cancel':
      await cancelEvent(eventData.id)
      break
    // ... otros casos
  }

  setConfirmModalState({ isOpen: false, action: null, eventData: null })
}, [confirmModalState, cancelEvent, /* otros métodos */])
```

---

## Fase 7: Testing y Validación

### 🔲 7.1 Testing Backend
**Tests a crear**:
- `EventStatusTransitionTest.java` - Validar todas las transiciones de estado
- `EventServiceTest.java` - Actualizar con nuevos métodos
- Validar que no se puedan hacer transiciones inválidas

### 🔲 7.2 Testing Frontend - Componentes
**Tests a crear**:
- `EventActions.test.jsx` - Validar que se muestren las acciones correctas por estado
- `EventForm.test.jsx` - Validar botones de guardar/publicar
- `ConfirmActionModal.test.jsx` - Validar confirmaciones

### 🔲 7.3 Testing de Integración
- Crear evento como borrador → Publicar → Pausar → Publicar nuevamente
- Crear evento publicado directamente
- Cancelar evento → Reactivar
- Editar evento terminado y cambiar fecha (debería volver a EN_EDICION o PUBLICADO)

### 🔲 7.4 Validación Manual
Probar en ambiente de desarrollo:
1. Crear eventos en diferentes estados
2. Verificar que solo aparezcan las acciones permitidas
3. Verificar transiciones de estado
4. Verificar que los eventos se muevan entre tabs correctamente
5. Verificar mensajes de éxito/error

---

## Fase 8: Documentación y Cleanup

### 🔲 8.1 Actualizar Documentación de API
**Ubicación**: Swagger / OpenAPI docs

Documentar:
- Nuevos endpoints de gestión de estado
- Transiciones permitidas
- Códigos de error específicos

### 🔲 8.2 Crear Guía de Usuario
**Nuevo archivo**: `docs/EVENT_MANAGEMENT_GUIDE.md`

Documentar:
- Flujo de trabajo para gestión de eventos
- Estados y sus significados
- Acciones disponibles por estado
- Best practices

### 🔲 8.3 Actualizar README
Agregar sección sobre gestión de estados de eventos

### 🔲 8.4 Code Review y Refactoring
- Revisar código duplicado
- Optimizar renders innecesarios
- Validar accesibilidad (a11y)
- Validar responsive design

---

## Priorización y Estimación

### Sprint 1 (Alta Prioridad) - 3-4 días
- ✅ Fase 1.1: Verificar endpoints existentes
- 🔲 Fase 1.2: Endpoint de activación
- 🔲 Fase 1.3: Validar lógica de transiciones
- 🔲 Fase 2.1: Actualizar eventService
- 🔲 Fase 2.2: Actualizar apiRoutes
- 🔲 Fase 2.3: Actualizar useEvents hook

### Sprint 2 (Alta Prioridad) - 3-4 días
- 🔲 Fase 3.1: Componente EventActions
- 🔲 Fase 3.2: Actualizar UnifiedEventTable
- 🔲 Fase 3.3: Agregar columna de estado
- 🔲 Fase 5.1: Handlers en EventManagement
- 🔲 Fase 5.2: Pasar handlers a tabla

### Sprint 3 (Media Prioridad) - 2-3 días
- 🔲 Fase 4.1: Botones en CreateEventForm
- 🔲 Fase 4.2: Botones en EditEventForm
- 🔲 Fase 4.3: Unificar formularios
- 🔲 Fase 6.1: Modal de confirmación
- 🔲 Fase 6.2: Implementar confirmaciones

### Sprint 4 (Media Prioridad) - 2-3 días
- 🔲 Fase 7.1: Testing backend
- 🔲 Fase 7.2: Testing frontend
- 🔲 Fase 7.3: Testing integración
- 🔲 Fase 7.4: Validación manual

### Sprint 5 (Baja Prioridad) - 1-2 días
- 🔲 Fase 1.4: Terminación automática (scheduled job)
- 🔲 Fase 8.1: Documentación API
- 🔲 Fase 8.2: Guía de usuario
- 🔲 Fase 8.3: Actualizar README
- 🔲 Fase 8.4: Code review y refactoring

---

## Notas Importantes

### 🚨 Consideraciones de Seguridad
- Validar permisos en backend para cada acción de cambio de estado
- Solo admin o creador del evento pueden cambiar estados
- Validar que las transiciones sean válidas antes de ejecutar

### 💡 Mejoras Futuras (Backlog)
- Agregar historial de cambios de estado
- Notificaciones a usuarios registrados cuando un evento cambia de estado
- Dashboard de métricas por estado
- Filtros avanzados por estado y fecha
- Exportar eventos por estado

### 🔄 Dependencias
- Todas las fases del Frontend dependen de que los endpoints del Backend estén funcionando
- La Fase 4 (formularios) puede desarrollarse en paralelo con Fase 3 (tabla)
- La Fase 6 (modales) depende de Fase 5 (handlers)

---

## Checklist de Completitud

- [ ] Todos los endpoints de backend implementados y probados
- [ ] Servicio frontend con todos los métodos necesarios
- [ ] Componente EventActions creado y funcionando
- [ ] Tabla muestra acciones correctas según estado
- [ ] Formularios tienen botones de Publicar/Guardar borrador
- [ ] Modales de confirmación implementados
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Validación manual completada
- [ ] Documentación actualizada
- [ ] Code review completado

---

**Fecha de creación**: 2025-11-01
**Última actualización**: 2025-11-01
**Estado general**: 🟡 En progreso (10% completado - endpoints backend verificados)
