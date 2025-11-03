# TODO — Event State Management Alignment

## Objetivo
Completar la alineación del frontend con la lógica de estados del backend para la gestión de eventos (`EN_EDICION`, `PUBLICADO`, `PAUSADO`, `CANCELADO`, `TERMINADO`). La vista `http://localhost:5173/admin/events` debe permitir consultar, crear, editar y cambiar el estado de los eventos respetando las transiciones permitidas.

---

## Situación Actual
- ✅ Backend: endpoints y reglas de transición disponibles (`/publish`, `/pause`, `/cancel`, `/finish`, `/back-to-edition`, `/activate`).
- ✅ Respuestas de colecciones de eventos normalizadas en `Page<EventResponseDTO>` (paginación consistente en `/events/**`).
- ⚠️ Frontend: solo existe el _toggle_ genérico `admin-toggle-status`; la UI no refleja estados reales ni permite transiciones específicas.
- ⚠️ Documentación previa duplicada/confusa eliminada. Este archivo es la única fuente de verdad del plan.

---

## Alcance Técnico

### 1. Capa de Servicios (Frontend)
- [x] `frontend/src/constants/apiRoutes.js`
  - Definir rutas de gestión de estados con claves claras y asegurarse de que la sintaxis del objeto sea válida.
- [x] `frontend/src/services/event/eventService.js`
  - Incorporar métodos `publishEvent`, `pauseEvent`, `cancelEvent`, `activateEvent`, `finishEvent`, `backToEdition`.
  - Reutilizar `ServiceREST.handleServiceResponse` y logging consistente.
- [x] `frontend/src/hooks/event/useEvents.js`
  - Exponer funciones con `useCallback` para cada transición.
  - Actualizar colecciones locales (`eventsByStatus`, `allEvents`, etc.) al recibir respuestas del backend.
  - Mantener indicadores de carga y notificaciones mediante `useEventOperations`.

### 2. Componentes UI principales
- [x] `frontend/src/pages/event/admin/components/EventActions.jsx`
  - Corregir imports (`memo`, `useMemo` desde React).
  - Asegurar configuración de acciones por estado y permitir recibir handlers externos.
- [x] `frontend/src/pages/event/admin/components/UnifiedEventTable.jsx`
  - Reemplazar botones sueltos por `<EventActions />`.
  - Renderizar columna `status` con mapeo visual.
  - Recibir y propagar callbacks `onPublish`, `onPause`, `onCancel`, `onActivate`.
- [x] `frontend/src/constants/tableConstants.js`
  - Definir columnas unificadas para la tabla de eventos (incluye estado y acciones).
  - Añadir helpers para mapear colores/labels de estados.
- [x] `frontend/src/pages/event/admin/EventManagement.jsx`
  - Integrar el nuevo flujo: estado local para modal de confirmación, handlers que invocan las funciones del hook y refrescan datos.
  - Renderizar `ConfirmActionModal` y poblarlo según la acción seleccionada.
  - Alinear filtros y contadores de tabs con los nuevos estados.
- [x] `frontend/src/pages/event/admin/components/ConfirmActionModal.jsx`
  - Verificar copy y variantes por acción; añadir soporte si se requiere texto específico para `finish/backToEdition` (dejar parametrizable).

### 3. Formularios de creación/edición
- [x] `frontend/src/pages/event/admin/components/CreateEventForm.jsx`
  - Añadir botones diferenciados "Guardar borrador" (`EN_EDICION`) y "Publicar".
  - Permitir setear estado inicial (query param/prop) y retornar `status` en el payload.
- [x] `frontend/src/pages/event/admin/components/EditEventForm.jsx`
  - Mostrar acciones según estado actual.
  - Reutilizar layout del formulario de creación; propagar `status` y fecha para decidir si se vuelve a `EN_EDICION` o `PUBLICADO`.
  - Integrar botones para transiciones inmediatas (e.g. publicar desde edición).
- [x] `frontend/src/hooks/event/useEvents.js`
  - Ajustar `createEvent` y `updateEvent` para aceptar bandera `publishNow` o `statusTarget` y llamar al endpoint correcto tras crear/editar (si aplica).

### 0. Backend — Colecciones paginadas
- [x] Actualizar `EventController` para que todas las rutas que devuelven eventos respondan con `Page<EventResponseDTO>`.
- [x] Ajustar `EventService` y `IEventRepository` para que los métodos públicos trabajen exclusivamente con `Page` (incluyendo `/events/status`, `/events/my-events`, `/events/my-registrations`).

### 4. Experiencia de Usuario
- [x] Tabs `PUBLICADO`, `EN_EDICION`, `PAUSADO`, `CANCELADO`, `TERMINADO` con contadores y paginación consistente.
- [x] Modal de confirmación reutilizable con mensajes adecuados por acción.
- [x] Notificaciones de éxito/error tras cada transición.
- [x] Validación de reglas: impedir transiciones no permitidas desde la UI (deshabilitar acciones, tooltips explicativos).

### 5. QA & Documentación
- [ ] Smoke test manual de cada transición: editar → publicar → pausar → publicar → cancelar → activar → volver a publicar.
- [ ] Verificar edición de evento terminado (cambia fecha y estado).
- [ ] Actualizar `README_next_steps.md` (o documento relevante) con instrucciones breves de uso si es necesario.
- [ ] Registrar pasos de prueba breves en comentarios de PR o documentación interna.

---

## Consideraciones Técnicas
- Utilizar `EventStatus` del backend como fuente de verdad (mantener enumeraciones en minúsculas).
- Asegurarse de invalidar o refrescar caches (`refreshEventsByStatus`) después de cada acción para mantener la UI sincronizada.
- Evitar duplicar lógica entre tabla y modal; centralizar mensajes en `ConfirmActionModal`.
- Respetar límites de llamadas concurrentes: bloquear botones mientras `loading` o `submitting` estén activos.

---

## Definición de Hecho
- Todas las transiciones se ejecutan en la UI y reflejan cambios inmediatos en las tablas.
- Formularios permiten publicar o guardar borrador desde la creación o edición.
- Backlog y documentación consistente con la implementación actual (sin referencias a archivos obsoletos).
- Código formateado, con tipado/PropTypes actualizados y sin errores de lint/compilación.
