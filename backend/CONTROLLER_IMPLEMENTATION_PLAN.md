# Plan de Implementación de Controladores - Arquitectura DDD

> **IMPORTANTE:** Todos los controladores deben implementarse siguiendo estrictamente las guías establecidas en
`REFACTORING_GUIDE.md`

---

## 📋 Tabla de Contenidos

1. [Análisis de Servicios Especializados](#análisis-de-servicios-especializados)
2. [Estructura de Controladores Propuesta](#estructura-de-controladores-propuesta)
3. [Detalle de Controladores](#detalle-de-controladores)
4. [Resumen de Acciones](#resumen-de-acciones)
5. [Beneficios de Esta Arquitectura](#beneficios-de-esta-arquitectura)
6. [Guías de Implementación](#guías-de-implementación)

---

## Análisis de Servicios Especializados

### Servicios Actuales del Dominio User

1. ✅ **UserService** - Consultas, actualizaciones, cuentas, eliminación
2. ✅ **UserApprovalService** - Aprobación y moderación
3. ✅ **UserRoleService** - Gestión de roles y permisos
4. ✅ **UserMediaService** - Gestión de imágenes
5. ✅ **UserNotificationService** - Emails y notificaciones
6. ✅ **UserAnalyticsService** - Métricas y analytics
7. ✅ **UserAttributeService** - Gestión de atributos
8. ✅ **UserTagService** - Gestión de tags
9. ✅ **UserCategoryInterestService** - Categorías de interés
10. ✅ **UserComplaintService** - Denuncias/quejas

### Servicios Helper (No Expuestos)

11. 🔧 **UserValidationService** - Validaciones de negocio
12. 🔧 **UserAuthorizationService** - Autorizaciones
13. 🔧 **CachedUserService** - Gestión de cache
14. 🔧 **BatchOperationHelper** - Operaciones batch optimizadas

---

## Estructura de Controladores Propuesta

```
com.feeling.packages.user.application/
│
├── UserController.java                    [REFACTORIZAR - 60%]
│   └── Endpoints de perfil básico y consultas
│
├── UserApprovalController.java            [CREAR NUEVO]
│   └── Endpoints de aprobación y moderación
│
├── UserRoleController.java                [CREAR NUEVO]
│   └── Endpoints de gestión de roles
│
├── UserMediaController.java               [CREAR NUEVO]
│   └── Endpoints de gestión de imágenes
│
├── UserNotificationController.java        [CREAR NUEVO]
│   └── Endpoints de notificaciones y emails
│
├── UserAnalyticsController.java           [YA EXISTE - REVISAR]
│   └── Endpoints de métricas y analytics
│
├── UserAttributeController.java           [YA EXISTE - REVISAR]
│   └── Endpoints de atributos
│
├── UserTagController.java                 [YA EXISTE - REVISAR]
│   └── Endpoints de tags
│
├── UserInterestController.java            [YA EXISTE - REVISAR]
│   └── Endpoints de categorías de interés
│
└── UserComplaintController.java           [CREAR NUEVO]
    └── Endpoints de denuncias
```

---

## Detalle de Controladores

### 1. UserController.java [REFACTORIZAR]

**Responsabilidad:** Gestión básica de usuarios
**Base path:** `/user`
**Service principal:** `UserService`

#### Endpoints a MANTENER:

**Cliente Autenticado:**

```
GET    /user/profile                    - Obtener perfil propio con nivel configurable
GET    /user/{email}/public             - Perfil público de otro usuario
GET    /user/compatibility/{email}      - Calcular compatibilidad con otro usuario
GET    /user/suggestions                - Sugerencias de usuarios para matching
PATCH  /user/profile                    - Actualizar perfil parcial (PATCH)
PUT    /user/deactivate                 - Auto-desactivar cuenta (cliente)
```

**Administrador:**

```
GET    /user/all                        - Listar todos los usuarios (paginado)
GET    /user/complaintStatus/{complaintStatus}            - Filtrar usuarios por estado (paginado + búsqueda)
GET    /user/{email}                    - Obtener usuario específico
PUT    /user/{userId}                   - Actualizar usuario específico
PUT    /user/{userId}/deactivate        - Desactivar cuenta (admin)
PUT    /user/{userId}/reactivate        - Reactivar cuenta (admin)
POST   /user/deactivate-batch           - Desactivar múltiples cuentas
POST   /user/reactivate-batch           - Reactivar múltiples cuentas
DELETE /user/{userId}                   - Eliminar usuario permanentemente
POST   /user/delete-batch               - Eliminar múltiples usuarios
```

#### Endpoints a MOVER a otros controladores:

- ❌ Aprobación → `UserApprovalController`
- ❌ Roles → `UserRoleController`
- ❌ Emails → `UserNotificationController`

---

### 2. UserApprovalController.java [CREAR NUEVO]

**Responsabilidad:** Aprobación y moderación de usuarios
**Base path:** `/user-approval`
**Service:** `UserApprovalService`
**Seguridad:** Solo `@PreAuthorize("hasAuthority('ADMIN')")`

#### Endpoints:

```
GET    /user-approval/pending           - Usuarios pendientes de aprobación (paginado + búsqueda)
GET    /user-approval/rejected          - Usuarios rechazados (paginado + búsqueda)

PUT    /user-approval/{userId}/approve  - Aprobar usuario individual
PUT    /user-approval/{userId}/reject   - Rechazar usuario individual
PUT    /user-approval/{userId}/pending  - Reset estado a pendiente

POST   /user-approval/approve-batch     - Aprobar múltiples usuarios
POST   /user-approval/reject-batch      - Rechazar múltiples usuarios
```

**Métodos del servicio a usar:**

- `getPendingApprovalUsers(Pageable, String)`
- `getRejectedUsers(Pageable, String)`
- `approveUser(String userId)`
- `revokeUserApproval(String userId)`
- `resetUserApprovalToPending(String userId)`
- `approveUsersBatch(List<String>)`
- `rejectUsersBatch(List<String>)`

---

### 3. UserRoleController.java [CREAR NUEVO]

**Responsabilidad:** Gestión de roles y permisos
**Base path:** `/user-roles`
**Service:** `UserRoleService`
**Seguridad:** Solo `@PreAuthorize("hasAuthority('ADMIN')")`

#### Endpoints:

```
GET    /user-roles/admins               - Listar usuarios con rol ADMIN (paginado)
GET    /user-roles/clients              - Listar usuarios con rol CLIENT (paginado)
GET    /user-roles/count                - Contar usuarios por rol

PUT    /user-roles/{userId}/grant-admin     - Otorgar rol de administrador
PUT    /user-roles/{userId}/revoke-admin    - Revocar rol de administrador

POST   /user-roles/grant-admin-batch        - Otorgar admin a múltiples usuarios
POST   /user-roles/revoke-admin-batch       - Revocar admin de múltiples usuarios
```

**Métodos del servicio a usar:**

- `getUsersByRole(UserRoleList, Pageable)`
- `countUsersByRole(UserRoleList)`
- `grantAdminRole(String adminEmail, String userId)`
- `revokeAdminRole(String adminEmail, String userId)`
- `grantAdminRoleBatch(String adminEmail, List<String>)`
- `revokeAdminRoleBatch(String adminEmail, List<String>)`

---

### 4. UserMediaController.java [CREAR NUEVO]

**Responsabilidad:** Gestión de imágenes de perfil
**Base path:** `/user-media`
**Service:** `UserMediaService`

#### Endpoints:

**Cliente Autenticado:**

```
GET    /user-media/me                   - Obtener mis imágenes de perfil
POST   /user-media/me                   - Subir nuevas imágenes (multipart/form-data)
PUT    /user-media/me/main              - Cambiar imagen principal
DELETE /user-media/me/{imageId}         - Eliminar una de mis imágenes
```

**Administrador:**

```
GET    /user-media/{userId}             - Obtener imágenes de un usuario
DELETE /user-media/{userId}/{imageId}   - Eliminar imagen de usuario (moderación)
POST   /user-media/{userId}/moderate    - Moderar/reportar imágenes inapropiadas
```

**Métodos del servicio a usar:**

- `uploadImages(String email, List<MultipartFile>)`
- `deleteImage(String email, String imageId)`
- `setMainImage(String email, String imageId)`
- Métodos de moderación (si existen o crear)

---

### 5. UserNotificationController.java [CREAR NUEVO]

**Responsabilidad:** Notificaciones y emails a usuarios
**Base path:** `/user-notifications`
**Service:** `UserNotificationService`
**Seguridad:** Solo `@PreAuthorize("hasAuthority('ADMIN')")`

#### Endpoints:

```
POST   /user-notifications/{userId}/welcome            - Enviar email de bienvenida
POST   /user-notifications/{userId}/profile-reminder   - Enviar recordatorio de completar perfil
POST   /user-notifications/{userId}/approval           - Enviar email de aprobación
POST   /user-notifications/{userId}/rejection          - Enviar email de rechazo
POST   /user-notifications/{userId}/deactivation       - Enviar email de desactivación
POST   /user-notifications/{userId}/reactivation       - Enviar email de reactivación

POST   /user-notifications/profile-reminders-batch     - Enviar recordatorios en batch
POST   /user-notifications/bulk-email                  - Enviar email masivo personalizado
```

**Métodos del servicio a usar:**

- `sendWelcomeEmail(Long userId)`
- `sendProfileCompletionReminder(Long userId)`
- `sendApprovalEmail(Long userId)`
- `sendRejectionEmail(Long userId, String reason)`
- `sendAccountDeactivationEmail(Long userId)`
- `sendAccountReactivationEmail(Long userId)`
- `sendProfileCompletionRemindersBatch(List<Long>)`
- `sendBulkEmail(List<Long>, String subject, String body)`

---

### 6. UserAnalyticsController.java [REVISAR - YA EXISTE]

**Responsabilidad:** Métricas y analytics de usuarios
**Base path:** `/user-analytics`
**Service:** `UserAnalyticsService`
**Seguridad:** Solo `@PreAuthorize("hasAuthority('ADMIN')")`

#### Endpoints actuales a validar:

```
GET    /user-analytics/tabs-count       - Contadores para tabs del panel admin
GET    /user-analytics/stats            - Estadísticas generales de usuarios
GET    /user-analytics/growth           - Métricas de crecimiento
GET    /user-analytics/engagement       - Métricas de engagement
```

**Acción:** Revisar que todos los métodos usen directamente `UserAnalyticsService` sin delegaciones.

---

### 7. UserAttributeController.java [REVISAR - YA EXISTE]

**Responsabilidad:** Gestión de atributos de usuario
**Base path:** `/user-attributes`
**Service:** `UserAttributeService`

**Acción:** Revisar que todos los métodos usen directamente `UserAttributeService` sin delegaciones.

---

### 8. UserTagController.java [REVISAR - YA EXISTE]

**Responsabilidad:** Gestión de tags de usuario
**Base path:** `/user-tags`
**Service:** `UserTagService`

**Acción:** Revisar que todos los métodos usen directamente `UserTagService` sin delegaciones.

---

### 9. UserInterestController.java [REVISAR - YA EXISTE]

**Responsabilidad:** Categorías de interés
**Base path:** `/user-interests`
**Service:** `UserCategoryInterestService`

**Acción:** Revisar que todos los métodos usen directamente `UserCategoryInterestService` sin delegaciones.

---

### 10. UserComplaintController.java [CREAR NUEVO]

**Responsabilidad:** Denuncias y quejas entre usuarios
**Base path:** `/user-complaints`
**Service:** `UserComplaintService`

#### Endpoints:

**Cliente Autenticado:**

```
POST   /user-complaints                 - Crear denuncia contra otro usuario
GET    /user-complaints/me              - Mis denuncias realizadas
```

**Administrador:**

```
GET    /user-complaints/pending         - Denuncias pendientes de revisión (paginado)
GET    /user-complaints/resolved        - Denuncias resueltas (paginado)
GET    /user-complaints/{complaintId}   - Detalle de una denuncia específica

PUT    /user-complaints/{complaintId}/review    - Marcar denuncia como revisada
PUT    /user-complaints/{complaintId}/dismiss   - Desestimar denuncia
PUT    /user-complaints/{complaintId}/action    - Tomar acción (suspender usuario, etc)
```

**Métodos del servicio a usar:**

- `createComplaint(...)`
- `getMyComplaints(String userEmail, Pageable)`
- `getPendingComplaints(Pageable)`
- `getResolvedComplaints(Pageable)`
- `getComplaintById(Long complaintId)`
- `reviewComplaint(Long complaintId, String adminEmail)`
- `dismissComplaint(Long complaintId, String adminEmail)`
- `takeAction(Long complaintId, String action, String adminEmail)`

---

## Resumen de Acciones

### Controladores a CREAR (5 nuevos)

1. ✨ **UserApprovalController.java**
2. ✨ **UserRoleController.java**
3. ✨ **UserMediaController.java**
4. ✨ **UserNotificationController.java**
5. ✨ **UserComplaintController.java**

### Controladores a REFACTORIZAR (1)

1. 🔧 **UserController.java** - Mover endpoints de aprobación, roles y notificaciones a controladores especializados

### Controladores a REVISAR (4)

1. 👁️ **UserAnalyticsController.java** - Verificar sin delegaciones
2. 👁️ **UserAttributeController.java** - Verificar sin delegaciones
3. 👁️ **UserTagController.java** - Verificar sin delegaciones
4. 👁️ **UserInterestController.java** - Verificar sin delegaciones

---

## Beneficios de Esta Arquitectura

### ✅ Separación de Responsabilidades

Cada controlador tiene un propósito claro y bien definido, facilitando el entendimiento del código.

### ✅ Arquitectura DDD

Controladores alineados 1:1 con servicios de dominio especializados.

### ✅ Mantenibilidad

Fácil encontrar y modificar funcionalidad específica sin navegar por controladores gigantes.

### ✅ Escalabilidad

Fácil agregar nuevos endpoints sin inflar controladores existentes.

### ✅ Testing

Tests unitarios más enfocados, simples y rápidos de ejecutar.

### ✅ Documentación API

Swagger tags mejor organizados por dominio de funcionalidad.

### ✅ Seguridad

Permisos más granulares por controlador, facilitando auditorías.

### ✅ Performance

Controladores más pequeños cargan más rápido en memoria.

---

## Guías de Implementación

### ⚠️ REGLAS OBLIGATORIAS

Todos los controladores **DEBEN** cumplir con las siguientes reglas establecidas en `REFACTORING_GUIDE.md`:

#### 1. **NO Delegaciones**

```java
// ❌ INCORRECTO - Delegación innecesaria
public ResponseEntity<MessageResponseDTO> approveUser(String userId) {
    return userService.approveUser(userId);
}

// ✅ CORRECTO - Llamada directa al servicio especializado
public ResponseEntity<MessageResponseDTO> approveUser(String userId) {
    return userApprovalService.approveUser(userId);
}
```

#### 2. **NO Métodos @Deprecated**

```java
// ❌ INCORRECTO
@Deprecated(since = "1.8", forRemoval = true)
public ResponseEntity<UserResponseDTO> getUser() { ...}

// ✅ CORRECTO - Eliminar completamente
// (Si se necesita mantener, documentar claramente por qué)
```

#### 3. **JavaDoc Completa**

```java
/**
 * Controlador para la gestión de aprobación de usuarios.
 * <p>
 * Responsabilidades:
 * - Aprobar/rechazar usuarios pendientes
 * - Operaciones batch de aprobación
 * - Gestión de estados de moderación
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/user-approval")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class UserApprovalController {

    /**
     * Aprueba un usuario específico para usar la plataforma.
     *
     * @param userId ID del usuario a aprobar
     * @return Mensaje de confirmación
     * @throws NotFoundException Si el usuario no existe
     */
    @PutMapping("/{userId}/approve")
    public ResponseEntity<MessageResponseDTO> approveUser(@PathVariable String userId) {
        // implementación
    }
}
```

#### 4. **Manejo de Errores Consistente**

```java
try{
MessageResponseDTO response = userApprovalService.approveUser(userId);
    return ResponseEntity.

ok(response);
}catch(
NotFoundException e){
        log.

error("Usuario no encontrado: {}",userId, e);
    return ResponseEntity.

complaintStatus(HttpStatus.NOT_FOUND)
        .

body(new MessageResponseDTO("Usuario no encontrado"));
        }catch(
Exception e){
        log.

error("Error aprobando usuario: {}",userId, e);
    return ResponseEntity.

complaintStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        .

body(new MessageResponseDTO("Error al aprobar usuario"));
        }
```

#### 5. **Logging Estructurado**

```java
@Slf4j
public class UserApprovalController {

    @PutMapping("/{userId}/approve")
    public ResponseEntity<MessageResponseDTO> approveUser(@PathVariable String userId) {
        log.info("Aprobando usuario: {}", userId);
        try {
            // ...
        } catch (Exception e) {
            log.error("Error aprobando usuario: {}", userId, e);
            // ...
        }
    }
}
```

#### 6. **Swagger/OpenAPI Completo**

```java

@Operation(
        summary = "Aprobar usuario",
        description = "Aprueba un usuario pendiente para permitirle usar la plataforma completa"
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario aprobado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
})
@PutMapping("/{userId}/approve")
public ResponseEntity<MessageResponseDTO> approveUser(
        @Parameter(description = "ID del usuario a aprobar")
        @PathVariable String userId
) {
    // implementación
}
```

#### 7. **Uso de Records para DTOs**

```java
// ✅ Preferir records para DTOs simples
public record ApprovalRequestDTO(
    @NotBlank String userId,
    String reason
) {}
```

#### 8. **Validación de Entrada**

```java
@PutMapping("/{userId}/approve")
public ResponseEntity<MessageResponseDTO> approveUser(
    @PathVariable @NotBlank String userId,
    @Valid @RequestBody ApprovalRequestDTO request
) {
    // implementación
}
```

#### 9. **Imports Organizados**

```java
// 1. Java standard library
import java.util.List;

// 2. Spring framework
import org.springframework.http.ResponseEntity;

// 3. Third party
import lombok.RequiredArgsConstructor;

// 4. Project internal
import com.feeling.packages.user.domain.services.UserApprovalService;
```

#### 10. **Nombres Descriptivos**

```java
// ❌ INCORRECTO
@PostMapping("/batch")
public ResponseEntity<MessageResponseDTO> batch(List<String> ids) { ... }

// ✅ CORRECTO
@PostMapping("/approve-batch")
public ResponseEntity<MessageResponseDTO> approveUsersBatch(
    @RequestBody List<String> userIds
) { ... }
```

---

## Checklist de Implementación

Para cada controlador nuevo o refactorizado, verificar:

- [ ] JavaDoc completa en clase y todos los métodos públicos
- [ ] No hay métodos de delegación
- [ ] No hay métodos @Deprecated
- [ ] Swagger/OpenAPI completo en todos los endpoints
- [ ] Manejo de errores consistente con try-catch
- [ ] Logging estructurado con SLF4J
- [ ] Validación de entrada con @Valid
- [ ] Seguridad con @PreAuthorize apropiado
- [ ] Nombres descriptivos en métodos y parámetros
- [ ] DTOs con validación (records cuando sea posible)
- [ ] Tests unitarios completos
- [ ] Imports organizados y sin código sin uso

---

## Orden de Implementación Recomendado

1. **Fase 1:** Crear controladores nuevos sin tocar UserController
    - UserApprovalController
    - UserRoleController
    - UserMediaController
    - UserNotificationController
    - UserComplaintController

2. **Fase 2:** Refactorizar UserController
    - Mover endpoints duplicados a nuevos controladores
    - Limpiar código sin uso
    - Completar documentación

3. **Fase 3:** Revisar controladores existentes
    - UserAnalyticsController
    - UserAttributeController
    - UserTagController
    - UserInterestController

4. **Fase 4:** Testing y validación
    - Tests unitarios de cada controlador
    - Tests de integración
    - Validación de Swagger
    - Validación de seguridad

---

## Notas Finales

- Cada controlador debe tener su propio archivo de test correspondiente
- Los DTOs específicos de cada controlador deben estar en paquetes apropiados
- Mantener consistencia en nombres de endpoints (usar kebab-case)
- Documentar cualquier decisión de diseño no obvia
- Commits atómicos: un controlador = un commit

---

**Última actualización:** 2025-01-06
**Versión del documento:** 1.0
**Autor:** J. Alexander Gavilán M.
