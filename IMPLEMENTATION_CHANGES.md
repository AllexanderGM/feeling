# Cambios de Implementación - Sistema de Gestión de Estados de Eventos

Este documento contiene todos los cambios necesarios para implementar el sistema de gestión de estados de eventos.

---

## 1. Backend - Event.java

**Archivo**: `backend/src/main/java/com/feeling/packages/event/infrastructure/entities/Event.java`

**Agregar después del método `backToEdition()`**:

```java
public void activate() {
    if (status == EventStatus.CANCELADO) {
        this.status = EventStatus.EN_EDICION;
        this.isActive = false;
    }
}
```

---

## 2. Backend - EventService.java

**Archivo**: `backend/src/main/java/com/feeling/packages/event/domain/services/EventService.java`

**Agregar después del método `backToEdition()`**:

```java
@Transactional
@CacheEvict(value = "events", allEntries = true)
public EventResponseDTO activateEvent(Long eventId, String userEmail) {
    Event event = validateEventAndPermissions(eventId, userEmail);

    if (event.getStatus() != EventStatus.CANCELADO) {
        throw new BadRequestException("Solo se pueden activar eventos cancelados");
    }

    event.activate();
    Event updatedEvent = eventRepository.save(event);
    return convertToResponseDTO(updatedEvent);
}
```

---

## 3. Backend - EventController.java

**Archivo**: `backend/src/main/java/com/feeling/packages/event/application/EventController.java`

**Agregar después del método `backToEdition()`**:

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

---

## 4. Frontend - apiRoutes.js

**Archivo**: `frontend/src/constants/apiRoutes.js`

**En la sección `EVENTS`, agregar antes del cierre del objeto**:

```javascript
// Gestión de estados
PUBLISH: '/events/{id}/publish',
PAUSE: '/events/{id}/pause',
CANCEL: '/events/{id}/cancel',
ACTIVATE: '/events/{id}/activate',
FINISH: '/events/{id}/finish',
BACK_TO_EDITION: '/events/{id}/back-to-edition'
```

---

## 5. Frontend - eventService.js

**Archivo**: `frontend/src/services/event/eventService.js`

**Agregar antes del cierre de la clase EventService**:

```javascript
// ========================================
// GESTIÓN DE ESTADOS DE EVENTOS
// ========================================

async publishEvent(eventId) {
  const context = 'publicar evento'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/publish`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async pauseEvent(eventId) {
  const context = 'pausar evento'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/pause`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async cancelEvent(eventId) {
  const context = 'cancelar evento'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/cancel`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async activateEvent(eventId) {
  const context = 'activar evento cancelado'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/activate`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async finishEvent(eventId) {
  const context = 'finalizar evento'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/finish`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}

async backToEditionEvent(eventId) {
  const context = 'volver evento a edición'

  try {
    const result = await ServiceREST.patch(`${API_ENDPOINTS.EVENTS.BASE}/${encodeURIComponent(eventId)}/back-to-edition`)

    return ServiceREST.handleServiceResponse(result, context)
  } catch (error) {
    this.logError(context, error)
    throw error
  }
}
```

---

## 6. Frontend - useEvents.js Hook

**Archivo**: `frontend/src/hooks/event/useEvents.js`

**Necesitarás agregar los siguientes métodos en el hook personalizado**:

```javascript
const publishEvent = useCallback(async (eventId) => {
  setLoading(true)
  try {
    const result = await eventService.publishEvent(eventId)
    return result
  } catch (error) {
    Logger.error('Error publishing event:', error, { category: Logger.CATEGORIES.SERVICE })
    throw error
  } finally {
    setLoading(false)
  }
}, [])

const pauseEvent = useCallback(async (eventId) => {
  setLoading(true)
  try {
    const result = await eventService.pauseEvent(eventId)
    return result
  } catch (error) {
    Logger.error('Error pausing event:', error, { category: Logger.CATEGORIES.SERVICE })
    throw error
  } finally {
    setLoading(false)
  }
}, [])

const cancelEvent = useCallback(async (eventId) => {
  setLoading(true)
  try {
    const result = await eventService.cancelEvent(eventId)
    return result
  } catch (error) {
    Logger.error('Error cancelling event:', error, { category: Logger.CATEGORIES.SERVICE })
    throw error
  } finally {
    setLoading(false)
  }
}, [])

const activateEvent = useCallback(async (eventId) => {
  setLoading(true)
  try {
    const result = await eventService.activateEvent(eventId)
    return result
  } catch (error) {
    Logger.error('Error activating event:', error, { category: Logger.CATEGORIES.SERVICE })
    throw error
  } finally {
    setLoading(false)
  }
}, [])

// Agregar al return del hook:
// publishEvent,
// pauseEvent,
// cancelEvent,
// activateEvent,
```

---

## 7. Frontend - Componentes Ya Creados ✅

Los siguientes componentes ya han sido creados y están listos para usar:

### 7.1 EventActions.jsx ✅
**Ubicación**: `frontend/src/pages/event/admin/components/EventActions.jsx`

Componente que muestra botones de acción dinámicos según el estado del evento.

**Características**:
- Muestra solo las acciones permitidas por estado
- Soporte para acciones primarias (4 botones visibles) y secundarias (dropdown)
- Tooltips para cada acción
- Colores personalizados por tipo de acción

**Props**:
```javascript
<EventActions
  event={event}  // Debe incluir: { id, status, ... }
  onView={(event) => { /* ... */ }}
  onEdit={(event) => { /* ... */ }}
  onDelete={(event) => { /* ... */ }}
  onPublish={(event) => { /* ... */ }}
  onPause={(event) => { /* ... */ }}
  onCancel={(event) => { /* ... */ }}
  onActivate={(event) => { /* ... */ }}
  loading={false}
/>
```

### 7.2 ConfirmActionModal.jsx ✅
**Ubicación**: `frontend/src/pages/event/admin/components/ConfirmActionModal.jsx`

Modal de confirmación para acciones críticas sobre eventos.

**Características**:
- Mensajes personalizados por tipo de acción
- Advertencias especiales para acciones peligrosas
- Información del evento visible
- Estilos y colores según la acción

**Props**:
```javascript
<ConfirmActionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={() => { /* ejecutar acción */ }}
  actionType="cancel"  // 'publish' | 'pause' | 'cancel' | 'activate' | 'delete' | 'resume'
  eventData={event}
  loading={false}
/>
```

---

## 8. Frontend - tableConstants.js

**Archivo**: `frontend/src/constants/tableConstants.js`

**Agregar columna de status a EVENT_TYPE_COLUMNS**:

Buscar la definición de `EVENT_TYPE_COLUMNS` y agregar:

```javascript
{
  name: 'ESTADO',
  uid: 'status',
  sortable: true
}
```

---

## 9. Frontend - UnifiedEventTable.jsx

**Archivo**: `frontend/src/pages/event/admin/components/UnifiedEventTable.jsx`

### 9.1 Importar EventActions

**Agregar al inicio del archivo**:

```javascript
import EventActions from './EventActions.jsx'
```

### 9.2 Agregar props para eventos de estado

**Actualizar la firma del componente** para incluir:

```javascript
const UnifiedEventTable = memo(({
  events,
  loading,
  tableType,
  onEdit,
  onDelete,
  onToggleStatus,
  // Nuevos props:
  onPublish,
  onPause,
  onCancel,
  onActivate,
  // ... resto de props
}) => {
```

### 9.3 Agregar caso 'status' en renderCell

**En la función `renderCell`, agregar**:

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
      className='capitalize'
    >
      {statusLabels[event.status] || event.status}
    </Chip>
  )
```

### 9.4 Reemplazar botones en caso 'actions'

**Reemplazar el código actual del caso 'actions'**:

```javascript
case 'actions':
  return (
    <EventActions
      event={event}
      loading={loading || actionLoading}
      onView={() => handleViewDetails(event)}
      onEdit={() => onEdit?.(event)}
      onDelete={() => onDelete?.(event)}
      onPublish={() => onPublish?.(event)}
      onPause={() => onPause?.(event)}
      onCancel={() => onCancel?.(event)}
      onActivate={() => onActivate?.(event)}
    />
  )
```

---

## 10. Frontend - EventManagement.jsx

**Archivo**: `frontend/src/pages/event/admin/EventManagement.jsx`

### 10.1 Importar ConfirmActionModal

```javascript
import ConfirmActionModal from './components/ConfirmActionModal.jsx'
```

### 10.2 Agregar estados para confirmación

**Dentro del componente EventManagement**:

```javascript
const [confirmModalState, setConfirmModalState] = useState({
  isOpen: false,
  action: null,
  eventData: null
})
```

### 10.3 Obtener métodos del hook useEvents

**Asegurar que el hook retorna los métodos**:

```javascript
const {
  // ... existentes
  publishEvent,
  pauseEvent,
  cancelEvent,
  activateEvent,
  // ... resto
} = useEvents()
```

### 10.4 Agregar handlers con confirmación

```javascript
// Handler que abre modal de confirmación
const handleOpenConfirmModal = useCallback((action, event) => {
  setConfirmModalState({
    isOpen: true,
    action,
    eventData: event
  })
}, [])

// Handler que ejecuta la acción confirmada
const handleConfirmAction = useCallback(async () => {
  const { action, eventData } = confirmModalState

  try {
    switch (action) {
      case 'publish':
        await publishEvent(eventData.id)
        handleSuccess('Evento publicado exitosamente')
        break
      case 'pause':
        await pauseEvent(eventData.id)
        handleSuccess('Evento pausado exitosamente')
        break
      case 'cancel':
        await cancelEvent(eventData.id)
        handleSuccess('Evento cancelado exitosamente')
        break
      case 'activate':
        await activateEvent(eventData.id)
        handleSuccess('Evento activado exitosamente')
        break
      default:
        break
    }

    handleOperationSuccess()
  } catch (error) {
    handleError(`Error al ${action} el evento`)
  } finally {
    setConfirmModalState({ isOpen: false, action: null, eventData: null })
  }
}, [confirmModalState, publishEvent, pauseEvent, cancelEvent, activateEvent, handleSuccess, handleError, handleOperationSuccess])

// Cerrar modal sin ejecutar
const handleCloseConfirmModal = useCallback(() => {
  setConfirmModalState({ isOpen: false, action: null, eventData: null })
}, [])
```

### 10.5 Pasar handlers a UnifiedEventTable

```javascript
<UnifiedEventTable
  // ... props existentes
  onPublish={(event) => handleOpenConfirmModal('publish', event)}
  onPause={(event) => handleOpenConfirmModal('pause', event)}
  onCancel={(event) => handleOpenConfirmModal('cancel', event)}
  onActivate={(event) => handleOpenConfirmModal('activate', event)}
/>
```

### 10.6 Agregar ConfirmActionModal al render

**Antes del cierre del div principal**:

```javascript
{/* Modal de confirmación para acciones de estado */}
<ConfirmActionModal
  isOpen={confirmModalState.isOpen}
  onClose={handleCloseConfirmModal}
  onConfirm={handleConfirmAction}
  actionType={confirmModalState.action}
  eventData={confirmModalState.eventData}
  loading={loading}
/>
```

---

## Resumen de Archivos a Modificar

### Backend (3 archivos):
1. ✅ `backend/src/main/java/com/feeling/packages/event/infrastructure/entities/Event.java`
2. ✅ `backend/src/main/java/com/feeling/packages/event/domain/services/EventService.java`
3. ✅ `backend/src/main/java/com/feeling/packages/event/application/EventController.java`

### Frontend (3 archivos):
4. ✅ `frontend/src/constants/apiRoutes.js`
5. ✅ `frontend/src/services/event/eventService.js`
6. ✅ `frontend/src/hooks/event/useEvents.js`

---

## Próximos Pasos

Después de aplicar estos cambios:

1. **Crear componente EventActions** (ver TODO.md Fase 3.1)
2. **Actualizar UnifiedEventTable** para usar EventActions (ver TODO.md Fase 3.2)
3. **Agregar columna de status** a la tabla (ver TODO.md Fase 3.3)
4. **Agregar handlers en EventManagement** (ver TODO.md Fase 5)
5. **Actualizar formularios** con botones Publicar/Guardar Borrador (ver TODO.md Fase 4)

---

**Nota**: Los archivos están siendo modificados por algún proceso externo (posiblemente un formatter o auto-save). Es recomendable cerrar todos los editores, aplicar estos cambios, y luego continuar con los componentes visuales.
