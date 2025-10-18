# Guía de Refactorización - Proyecto Feeling

## 📋 Tabla de Contenidos

1. [Principios Generales](#principios-generales)
2. [Proceso de Refactorización](#proceso-de-refactorización)
3. [Guías por Tipo de Componente](#guías-por-tipo-de-componente)
4. [Patrones y Arquitectura DDD](#patrones-y-arquitectura-ddd)
5. [Checklist de Verificación](#checklist-de-verificación)

---

## 🎯 Objetivo

Refactorizar el proyecto siguiendo las mejores prácticas establecidas en `User.java` y `UserService.java` como
referencias de calidad, aplicando arquitectura DDD (Domain-Driven Design) y principios SOLID.

---

## 📐 Principios Generales

### 1. Documentación JavaDoc

#### Para Clases

```java
/**
 * Descripción clara del propósito de la clase.
 * <p>
 * Detalles adicionales si son necesarios.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
```

#### Para Métodos

```java
/**
 * Descripción concisa del propósito (1-2 líneas).
 * <p>
 * Detalles adicionales solo si son necesarios.
 *
 * @param nombreParam Descripción breve del parámetro
 * @param otroParam Descripción breve del parámetro
 * @return Explicación de qué retorna
 */
```

**Reglas:**

- ✅ Conciso y profesional
- ✅ Enfocado en el "qué" y "por qué", no en el "cómo"
- ❌ Sin información redundante o innecesaria
- ❌ Sin explicar delegaciones obvias

---

### 2. Eliminación de Código

| Tipo                                 | Acción                                       | Notas                                                            |
|--------------------------------------|----------------------------------------------|------------------------------------------------------------------|
| **Dead code**                        | ⚠️ **REPORTAR AL USUARIO** antes de eliminar | Puede ser funcionalidad planificada para admin panel             |
| **Duplicados**                       | ❌ Eliminar el método menos completo          | Consolidar lógica, mantener el más eficiente                     |
| **@Deprecated**                      | ❌ Eliminar completamente                     | NO mantener métodos deprecated, actualizar todas las referencias |
| **Delegaciones innecesarias**        | ❌ Eliminar, usar referencia directa          | Evitar métodos que solo delegan a otros servicios                |
| **Hardcoded values**                 | ❌ Eliminar valores hardcodeados              | Usar constantes, @Value o propiedades                            |
| **Lógica duplicada entre servicios** | ❌ Consolidar en servicio correcto            | Buscar y eliminar duplicados entre servicios relacionados        |

#### ⚠️ Proceso para Métodos Sin Uso

**IMPORTANTE: NO eliminar automáticamente. Seguir este proceso:**

1. **Usar Grep** para buscar llamadas al método
2. **Si NO tiene usos → REPORTAR AL USUARIO**:
    - ⏸️ **DETENER** y notificar sobre el método sin uso
    - 📝 **EXPLICAR** el propósito según JavaDoc
    - 🤔 **EVALUAR** con el usuario:
        - ¿Debe implementarse endpoint en panel admin?
        - ¿Es método básico del dominio para uso futuro?
        - ¿Es realmente dead code a eliminar?
3. **ESPERAR** decisión del usuario antes de proceder

---

### 3. Optimización de Queries

| Técnica              | Cuándo Usar                                   | Ejemplo                                         |
|----------------------|-----------------------------------------------|-------------------------------------------------|
| **FETCH JOIN**       | Queries que retornan entidades con relaciones | `LEFT JOIN FETCH u.roles`                       |
| **Paginación**       | Retornos de grandes volúmenes                 | `Page<T>` en vez de `List<T>`                   |
| **Índices**          | Queries frecuentes en campos de búsqueda      | Verificar índices en BD                         |
| **Batch Operations** | Múltiples búsquedas por ID                    | `findAllById()` en vez de loop con `findById()` |
| **Evitar N+1**       | Operaciones en lote                           | FETCH JOIN o DTOs con proyecciones              |

---

### 4. Naming Conventions

#### Spring Data JPA

```java
// ✅ Correcto - Spring Data genera automáticamente
List<User> findByEmailAndActiveTrue(String email);

// ❌ Incorrecto - Sufijos redundantes
List<User> findByEmailAndActiveTrueOptimized(String email);
```

#### Variables y Parámetros

```java
// ✅ Correcto
@Query("... WHERE ua.attributeType = :attributeType")
List<UserAttribute> findByType(@Param("attributeType") String attributeType);

// ❌ Incorrecto - Nombres diferentes causan confusión
@Query("... WHERE ua.attributeType = :type")
List<UserAttribute> findByType(@Param("type") String attributeType);
```

**Reglas:**

- ✅ Nombres claros y descriptivos
- ✅ Consistencia en toda la clase
- ❌ Evitar redeclarar variables en el mismo scope
- ❌ Sin sufijos innecesarios ("Optimized", "New", "V2")

---

### 5. Organización de Código

#### Estructura de Clases (Controladores y Servicios)

```
┌─────────────────────────────────────────┐
│  1. ESTADÍSTICAS (si aplica)            │
│     - Métricas y analytics primero      │
├─────────────────────────────────────────┤
│  2. CLIENTE - CRUD                      │
│     ├── Lecturas (reads)                │
│     ├── Creación (creates)              │
│     ├── Actualizaciones (singular)      │
│     ├── Actualizaciones (batch)         │
│     └── Eliminaciones                   │
├─────────────────────────────────────────┤
│  3. ADMIN - CRUD                        │
│     ├── Lecturas (reads)                │
│     ├── Creación (creates)              │
│     ├── Actualizaciones (singular)      │
│     ├── Actualizaciones (batch)         │
│     └── Eliminaciones                   │
├─────────────────────────────────────────┤
│  4. MÉTODOS DE UTILIDAD (privados)      │
│     - Helpers internos al final         │
└─────────────────────────────────────────┘
```

#### Comentarios de Sección

```java
// ========================================
// ESTADÍSTICAS
// ========================================

// ========================================
// CLIENTE - OPERACIONES CRUD
// ========================================

// ----- LECTURAS (Cliente) -----

// ----- CREACIÓN (Cliente) -----

// ========================================
// ADMIN - OPERACIONES CRUD
// ========================================

// ========================================
// MÉTODOS DE UTILIDAD
// ========================================
```

---

### 6. Imports (Buenas Prácticas)

#### Reglas de Imports

| Regla                   | Ejemplo                                               | Notas                                |
|-------------------------|-------------------------------------------------------|--------------------------------------|
| **Sin wildcards (*)**   | ❌ `import com.feeling.packages.user.domain.dto.*;`    | Expandir a imports específicos       |
| **Excepción permitida** | ✅ `import org.springframework.web.bind.annotation.*;` | Solo en controladores REST           |
| **Sin inline imports**  | ❌ `new com.feeling.dto.UserDTO()`                     | Declarar import al inicio            |
| **Sin imports sin uso** | ❌ Imports no utilizados                               | Eliminar completamente               |
| **Organización**        | Ver tabla abajo                                       | Grupos separados por línea en blanco |

#### Orden de Imports

```java
// 1. Imports java.* (alfabéticamente)
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// 2. Imports javax.*/jakarta.* (alfabéticamente)
import jakarta.persistence.Entity;
import jakarta.validation.Valid;

// 3. Imports terceros - Spring, Lombok, etc. (alfabéticamente)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 4. Imports del proyecto (com.feeling.*) (alfabéticamente)
import com.feeling.exception.ResourceNotFoundException;
import com.feeling.packages.user.domain.dto.UserDTO;
import com.feeling.packages.user.infrastructure.entities.User;
```

#### Conflictos de Anotaciones

```java
// ✅ Importar la más usada

import org.springframework.web.bind.annotation.RequestBody;

// ✅ Usar ruta completa para la otra

@Operation(
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "..."
        )
)
public ResponseEntity<?> method(@RequestBody UserDTO dto) {
    // ...
}
```

---

## 🔄 Proceso de Refactorización

### Verificación Método por Método

Para cada método en la clase, ejecutar estas verificaciones en orden:

#### 1. ¿Tiene usos activos?

```bash
# Buscar llamadas al método
grep -r "nombreMetodo" src/
```

**Si NO tiene usos → REPORTAR AL USUARIO**

- ⏸️ Detener y notificar
- 📝 Explicar propósito
- 🤔 Evaluar con usuario
- ⏳ Esperar decisión

#### 2. ¿Está duplicado?

**Buscar en la misma clase:**

```bash
grep "public.*nombreSimilar" ArchivoActual.java
```

**Buscar en servicios relacionados:**

```bash
grep -r "nombreSimilar\|funcionSimilar" src/main/java/*/domain/services/
```

**Acción:**

- Si existe duplicado → Consolidar al más completo/eficiente
- Si existe en otro servicio → Eliminar duplicado, mantener en servicio correcto
- Actualizar todas las referencias

#### 3. ¿Tiene optimizaciones?

**Verificar:**

- [ ] FETCH JOIN en relaciones
- [ ] Paginación para colecciones grandes
- [ ] @Query optimizada si es necesario
- [ ] Evita N+1 queries en batch operations

#### 4. ¿El nombre es correcto?

**Verificar:**

- [ ] Sigue convenciones Spring Data JPA
- [ ] Sin sufijos innecesarios
- [ ] Claro y descriptivo
- [ ] Sin causar conflictos de variables

#### 5. ¿Está documentado?

**Agregar JavaDoc:**

- [ ] Descripción concisa del propósito
- [ ] @param con descripciones breves
- [ ] @return explicando qué retorna
- [ ] Sin información de delegación (eliminar esos métodos)

---

### Orden de Refactorización por Tipo

```
1. REPOSITORIOS
   └─> Optimizar queries, eliminar duplicados

2. SERVICIOS
   └─> Delegar a servicios especializados
   └─> Eliminar duplicados ENTRE servicios

3. DTOs y MAPPERS
   └─> Consolidar y documentar

4. CONTROLADORES
   └─> Validar endpoints y delegación
   └─> Asegurar uso de DTOs

5. ENTIDADES
   └─> Optimizar relaciones JPA
```

---

## 🧩 Guías por Tipo de Componente

### 1️⃣ REPOSITORIOS

#### Checklist

- [ ] Eliminar métodos sin uso (previa consulta al usuario)
- [ ] Consolidar métodos duplicados
- [ ] Agregar FETCH JOIN donde corresponda
- [ ] Documentar todos los métodos con JavaDoc
- [ ] Documentar la clase con propósito y autor
- [ ] Organizar por secciones lógicas
- [ ] Verificar naming conventions de Spring Data
- [ ] Optimizar queries con índices

#### Ejemplo de Refactorización

**❌ Antes:**

```java
// Sin documentación
@Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :type")
List<UserAttribute> findByAttributeTypeOrderedByDisplay(@Param("type") String type);

// Método duplicado sin uso
List<UserAttribute> findByAttributeTypeAndActiveTrue(String type);

// Método "optimizado" redundante
@Query("SELECT ua FROM UserAttribute ua LEFT JOIN FETCH ua.user WHERE...")
List<UserAttribute> findByTypeOptimized(@Param("type") String type);
```

**✅ Después:**

```java
/**
 * Busca todos los atributos activos de un tipo específico ordenados por displayOrder.
 *
 * @param attributeType Tipo de atributo
 * @return Lista de atributos activos ordenados
 */
@Query("SELECT ua FROM UserAttribute ua WHERE ua.attributeType = :attributeType AND ua.active = true ORDER BY ua.displayOrder ASC")
List<UserAttribute> findByAttributeTypeAndActiveTrueOrderByDisplayOrderAsc(@Param("attributeType") String attributeType);
```

#### Estructura de Repositorio

```java
/**
 * Repositorio para gestión de [Entidad].
 * <p>
 * Proporciona métodos de consulta optimizados para [casos de uso].
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Repository
public interface IEntityRepository extends JpaRepository<Entity, Long> {

    // ========================================
    // BÚSQUEDAS BÁSICAS
    // ========================================

    Optional<Entity> findByEmail(String email);

    // ========================================
    // BÚSQUEDAS CON JOINS
    // ========================================

    @Query("SELECT e FROM Entity e LEFT JOIN FETCH e.relations WHERE e.id = :id")
    Optional<Entity> findByIdWithRelations(@Param("id") Long id);

    // ========================================
    // BÚSQUEDAS PAGINADAS
    // ========================================

    Page<Entity> findByActiveTrue(Pageable pageable);

    // ========================================
    // ESTADÍSTICAS Y CONTEOS
    // ========================================

    @Query("SELECT COUNT(e) FROM Entity e WHERE e.active = true")
    long countActiveEntities();
}
```

---

### 2️⃣ SERVICIOS

#### Checklist

- [ ] **Verificar duplicados ENTRE servicios** (revisar servicios especializados)
- [ ] Delegar lógica especializada a servicios dedicados
- [ ] Actualizar llamadas a métodos renombrados
- [ ] Verificar Single Responsibility Principle (SRP)
- [ ] Documentar métodos públicos con JavaDoc
- [ ] Indicar delegación con `DELEGADO A: {@link ...}` cuando corresponda
- [ ] Eliminar código comentado
- [ ] Evitar N+1 queries en operaciones batch
- [ ] Organizar métodos con comentarios de sección
- [ ] Evitar redeclaración de variables en mismo scope
- [ ] **Aplicar orden estándar de métodos** (ver sección de Organización)

#### Ejemplo: Delegación a Servicios Especializados

**❌ Antes (UserService.java - Lógica mezclada):**

```java
public MessageResponseDTO sendEmailsBatch(List<Long> userIds) {
    logger.info("Enviando correos en lote", Map.of("totalRequested", userIds.size()));

    List<User> users = userRepository.findAllById(userIds);
    List<User> usersNeedingReminder = users.stream()
            .filter(user -> !user.isApproved() && !user.isProfileComplete())
            .toList();

    int sent = 0;
    int skipped = users.size() - usersNeedingReminder.size();
    int failed = userIds.size() - users.size();

    for (User user : usersNeedingReminder) {
        try {
            userNotificationService.sendProfileCompletionReminder(user.getId());
            sent++;
        } catch (Exception e) {
            logger.error("Error enviando correo a: " + user.getEmail(), e);
            failed++;
        }
    }

    String message = String.format("Operación completada: %d correos enviados, %d omitidos, %d fallos",
            sent, skipped, failed);
    return new MessageResponseDTO(message);
}
```

**✅ Después - Paso 1: Crear método en servicio especializado**

**UserNotificationService.java:**

```java
/**
 * Envía recordatorios de completar perfil a usuarios específicos seleccionados.
 * <p>
 * Versión batch que permite a administradores seleccionar exactamente
 * qué usuarios recibirán el recordatorio.
 *
 * @param userIds Lista de IDs de usuarios seleccionados
 * @return Mensaje con estadísticas de la operación
 */
@Transactional(readOnly = true)
public MessageResponseDTO sendProfileCompletionRemindersBatch(List<Long> userIds) {
    logger.info("Enviando recordatorios de perfil en lote", Map.of("totalRequested", userIds.size()));

    List<User> users = userRepository.findAllById(userIds);
    List<User> usersNeedingReminder = users.stream()
            .filter(user -> !user.isApproved() && !user.isProfileComplete())
            .toList();

    int sent = 0;
    int skipped = users.size() - usersNeedingReminder.size();
    int failed = userIds.size() - users.size();

    for (User user : usersNeedingReminder) {
        try {
            sendProfileCompletionReminder(user.getId());
            sent++;
        } catch (Exception e) {
            logger.error("Error enviando recordatorio a: " + user.getEmail(), e);
            failed++;
        }
    }

    logger.info("Operación de recordatorios completada",
            Map.of("sent", sent, "skipped", skipped, "failed", failed));

    String message = String.format(
            "Operación completada: %d correos enviados, %d omitidos (perfil completo/aprobado), %d fallos",
            sent, skipped, failed);

    return new MessageResponseDTO(message);
}
```

**✅ Después - Paso 2: Delegar desde servicio principal**

**UserService.java:**

```java
/**
 * Envía emails de recordatorio de completar perfil en batch.
 * <p>
 * DELEGADO A: {@link UserNotificationService#sendProfileCompletionRemindersBatch(List)}
 *
 * @param userIds IDs de usuarios a notificar
 * @return Mensaje con contadores (sent, skipped, failed)
 */
public MessageResponseDTO sendEmailsBatch(List<Long> userIds) {
    return userNotificationService.sendProfileCompletionRemindersBatch(userIds);
}
```

**Ventajas:**

- ✅ Lógica de notificaciones centralizada
- ✅ Responsabilidad única por servicio
- ✅ Reducción de líneas (45 → 1)
- ✅ Reutilizable desde múltiples puntos
- ✅ Facilita testing y mantenimiento

#### Proceso de Identificación de Duplicados entre Servicios

1. **Extraer métodos del servicio principal:**

```bash
grep "public.*(" UserService.java
```

2. **Buscar métodos similares en servicios especializados:**

```bash
grep -r "sendEmail\|notify\|approve\|reject" src/main/java/*/domain/services/
```

3. **Evaluar si debe delegarse:**
    - ¿La responsabilidad pertenece al servicio especializado? → Delegar
    - ¿El método hace lo mismo o similar? → Delegar
    - ¿El método tiene lógica de negocio específica? → Mover a servicio especializado

4. **Refactorizar:**
    - Crear método en servicio especializado (si no existe)
    - Cambiar método en servicio principal a delegación simple
    - Documentar con `DELEGADO A: {@link ...}`
    - Actualizar todos los usos si es necesario

#### ⚠️ IMPORTANTE: Patrón Facade

**NO implementar patrón Facade a menos que se solicite explícitamente.**

Los servicios principales deben contener lógica de negocio, no solo delegar.

**❌ Incorrecto (Facade innecesario):**

```java
// UserService que solo delega - es un Facade innecesario
public UserDTO getUser(Long id) {
    return userCachedService.getUserById(id);
}

public void updateUser(Long id, UserDTO dto) {
    userValidationService.validate(dto);
}
```

**✅ Correcto (Lógica de negocio en servicio):**

```java
// UserService con lógica de negocio real
public UserDTO getUser(Long id) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return userMapper.toDTO(user);
}

public void updateUser(Long id, UserDTO dto) {
    // Lógica de negocio aquí, delegando solo tareas especializadas
    userValidationService.validateUpdate(dto);
    User user = findUserById(id);
    userMapper.updateEntity(user, dto);
    userRepository.save(user);
    userNotificationService.notifyProfileUpdate(user.getId());
}
```

#### Estructura de Servicio

```java
/**
 * Servicio principal para gestión de [Entidad].
 * <p>
 * Responsabilidades:
 * - CRUD básico de [entidad]
 * - Coordinación de operaciones de negocio
 * - Delegación a servicios especializados
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class EntityService {

    private final IEntityRepository entityRepository;
    private final SpecializedService specializedService;
    private final StructuredLogger logger = StructuredLoggerFactory.getLogger(EntityService.class);

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    /**
     * Obtiene estadísticas generales de [entidad].
     *
     * @return DTO con estadísticas
     */
    @Transactional(readOnly = true)
    public StatsDTO getStats() {
        // Lógica de estadísticas
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Cliente) -----

    /**
     * Obtiene [entidad] por ID para cliente.
     *
     * @param id ID de la entidad
     * @return DTO de la entidad
     */
    @Transactional(readOnly = true)
    public EntityDTO getById(Long id) {
        // Lógica de lectura
    }

    // ----- CREACIÓN (Cliente) -----

    /**
     * Crea nueva [entidad].
     *
     * @param dto Datos de la entidad
     * @return DTO de la entidad creada
     */
    @Transactional
    public EntityDTO create(CreateEntityDTO dto) {
        // Lógica de creación
    }

    // ----- ACTUALIZACIONES (Cliente) -----

    /**
     * Actualiza [entidad] existente.
     *
     * @param id ID de la entidad
     * @param dto Datos actualizados
     * @return DTO de la entidad actualizada
     */
    @Transactional
    public EntityDTO update(Long id, UpdateEntityDTO dto) {
        // Lógica de actualización
    }

    // ----- ELIMINACIONES (Cliente) -----

    // ========================================
    // ADMIN - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Admin) -----

    /**
     * Obtiene todas las [entidades] paginadas.
     *
     * @param pageable Configuración de paginación
     * @return Página de entidades
     */
    @Transactional(readOnly = true)
    public Page<EntityDTO> getAll(Pageable pageable) {
        // Lógica de lectura admin
    }

    // ----- ACTUALIZACIONES (Admin) -----

    /**
     * Actualiza múltiples [entidades] en batch.
     *
     * @param ids IDs de entidades
     * @param action Acción a aplicar
     * @return Resultado de la operación batch
     */
    @Transactional
    public BatchResultDTO updateBatch(List<Long> ids, ActionDTO action) {
        // Lógica de actualización batch
    }

    // ----- ELIMINACIONES (Admin) -----

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    /**
     * Encuentra [entidad] por ID o lanza excepción.
     *
     * @param id ID de la entidad
     * @return Entidad encontrada
     */
    private Entity findEntityOrThrow(Long id) {
        return entityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entity not found: " + id));
    }
}
```

---

### 3️⃣ CONTROLADORES

#### Checklist

- [ ] Verificar endpoints RESTful (GET, POST, PUT, DELETE)
- [ ] **Usar DTOs en todos los endpoints** - NO retornar tipos genéricos
- [ ] **NO orquestar lógica de negocio** - Delegar al servicio
- [ ] Documentar con @Operation (Swagger) de forma concisa
- [ ] Validar permisos (@PreAuthorize)
- [ ] Validar DTOs de entrada (@Valid)
- [ ] **Aplicar orden estándar de métodos** (igual que servicios)

#### ❌ Antipatrón: Tipos Genéricos Directos

**Problemas:**

- ❌ No type-safe - fácil equivocarse con claves
- ❌ Sin autocompletado en frontend
- ❌ Documentación Swagger pobre
- ❌ Difícil de mantener

**❌ Antes (INCORRECTO):**

```java

@GetMapping("/attributes/by-types")
public ResponseEntity<Map<String, List<UserAttributeDTO>>> getAttributesByTypes(
        @RequestParam String types) {
    Map<String, List<UserAttributeDTO>> attributes = service.getAttributesByTypes(types);
    return ResponseEntity.ok(attributes);
}

@GetMapping("/attributes/types")
public ResponseEntity<List<String>> getActiveAttributeTypes() {
    return ResponseEntity.ok(service.getActiveAttributeTypes());
}

@GetMapping("/attributes/count")
public ResponseEntity<Map<String, Long>> countAttributes() {
    return ResponseEntity.ok(Map.of("count", service.count()));
}
```

**✅ Después (CORRECTO):**

**Paso 1: Crear DTOs específicos**

```java
public record AttributesByTypeResponseDTO(
        Map<String, List<UserAttributeDTO>> attributesByType
) {
}

public record AttributeTypesResponseDTO(
        List<String> types
) {
}

public record CountResponseDTO(
        Long count
) {
}
```

**Paso 2: Usar en controlador**

```java

@GetMapping("/attributes/by-types")
public ResponseEntity<AttributesByTypeResponseDTO> getAttributesByTypes(
        @RequestParam String types) {
    Map<String, List<UserAttributeDTO>> attributes = service.getAttributesByTypes(types);
    return ResponseEntity.ok(new AttributesByTypeResponseDTO(attributes));
}

@GetMapping("/attributes/types")
public ResponseEntity<AttributeTypesResponseDTO> getActiveAttributeTypes() {
    List<String> types = service.getActiveAttributeTypes();
    return ResponseEntity.ok(new AttributeTypesResponseDTO(types));
}

@GetMapping("/attributes/count")
public ResponseEntity<CountResponseDTO> countAttributes() {
    long count = service.count();
    return ResponseEntity.ok(new CountResponseDTO(count));
}
```

**Ventajas:**

- ✅ Type-safe con validación en compilación
- ✅ Autocompletado en IDEs y frontend TypeScript
- ✅ Swagger genera esquemas claros
- ✅ Fácil agregar campos sin romper compatibilidad
- ✅ Documentación JavaDoc específica

#### ❌ Antipatrón: Orquestación en Controlador

**El controlador NO debe combinar múltiples llamadas al servicio.**

**❌ Antes (INCORRECTO):**

```java
// Controlador
@GetMapping("/analytics/comprehensive")
public ResponseEntity<UserComprehensiveMetricsDTO> getComprehensiveMetrics() {
    // ❌ Controlador orquestando múltiples llamadas y creando el DTO
    UserComprehensiveMetricsDTO metrics = new UserComprehensiveMetricsDTO(
            userAnalyticsService.getUserTabsCount(),
            userAnalyticsService.getEngagementStats(),
            userAnalyticsService.getGrowthStats("monthly"),
            userAnalyticsService.getGeographicDistribution()
    );
    return ResponseEntity.ok(metrics);
}
```

**Problemas:**

- ❌ Lógica de negocio (orquestación) en controlador
- ❌ Controlador conoce detalles de implementación
- ❌ Difícil de testear la lógica de agregación
- ❌ Viola Single Responsibility Principle

**✅ Después (CORRECTO):**

**Paso 1: Crear método en servicio**

```java
// UserAnalyticsService
/**
 * Obtiene métricas comprehensivas agregando todas las dimensiones de analytics.
 *
 * @return DTO comprehensivo con todas las métricas agregadas
 */
@Transactional(readOnly = true)
public UserComprehensiveMetricsDTO getComprehensiveUserMetrics() {
    logger.info("Generando métricas comprehensivas de usuarios");

    return new UserComprehensiveMetricsDTO(
            getUserTabsCount(),
            getEngagementStats(),
            getGrowthStats("monthly"),
            getGeographicDistribution()
    );
}
```

**Paso 2: Delegar desde controlador**

```java
// Controlador
@GetMapping("/analytics/comprehensive")
public ResponseEntity<UserComprehensiveMetricsDTO> getComprehensiveMetrics() {
    // ✅ Controlador solo delega al servicio
    return ResponseEntity.ok(userAnalyticsService.getComprehensiveUserMetrics());
}
```

**Ventajas:**

- ✅ Lógica de negocio en la capa correcta
- ✅ Thin controller
- ✅ Fácil de testear
- ✅ Respeta SRP
- ✅ Reutilizable

**Regla:** Si el controlador necesita combinar resultados de múltiples métodos del servicio, crear un método en el
servicio que haga esa agregación.

#### Documentación Swagger Concisa

**❌ Antes (Excesivo):**

```java
@Operation(
        summary = "Obtener sugerencias de usuarios con control de respuesta optimizado",
        description = "Recupera sugerencias de usuarios paginadas con niveles de inclusión de datos configurables. " +
                "Endpoint optimizado que reemplaza /suggestions con mejor rendimiento y control de datos flexible. " +
                "Los resultados se cachean automáticamente para mejorar el rendimiento.",
        tags = {"User Matching"}
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Sugerencias recuperadas exitosamente",
                content = @Content(
                        schema = @Schema(implementation = Page.class),
                        examples = {
                                @ExampleObject(
                                        name = "Paginated Suggestions",
                                        summary = "Página de sugerencias de usuarios",
                                        description = "Respuesta paginada con usuarios sugeridos basados en preferencias y compatibilidad"
                                )
                        }
                )
        ),
        @ApiResponse(responseCode = "400", description = "Nivel de inclusión o parámetros de paginación inválidos"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
})
```

**✅ Después (Conciso):**

```java
@Operation(
        summary = "Obtener sugerencias de usuarios",
        description = "Sugerencias paginadas basadas en compatibilidad"
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sugerencias recuperadas exitosamente"),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
        @ApiResponse(responseCode = "401", description = "Usuario no autenticado")
})
```

**Principio:** Swagger debe documentar la API, no repetir lo obvio.

#### Estructura de Controlador

```java
/**
 * Controlador REST para gestión de [Entidad].
 * <p>
 * Endpoints:
 * - Cliente: Operaciones básicas CRUD
 * - Admin: Operaciones avanzadas y batch
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@RestController
@RequestMapping("/api/entities")
@RequiredArgsConstructor
@Tag(name = "Entity Management", description = "Endpoints para gestión de entidades")
public class EntityController {

    private final EntityService entityService;

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener estadísticas", description = "Estadísticas generales de entidades")
    public ResponseEntity<StatsResponseDTO> getStats() {
        return ResponseEntity.ok(entityService.getStats());
    }

    // ========================================
    // CLIENTE - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Cliente) -----

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener entidad por ID")
    public ResponseEntity<EntityDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(entityService.getById(id));
    }

    // ----- CREACIÓN (Cliente) -----

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Crear nueva entidad")
    public ResponseEntity<EntityDTO> create(
            @Valid @RequestBody CreateEntityDTO dto) {
        return ResponseEntity.ok(entityService.create(dto));
    }

    // ----- ACTUALIZACIONES (Cliente) -----

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Actualizar entidad")
    public ResponseEntity<EntityDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEntityDTO dto) {
        return ResponseEntity.ok(entityService.update(id, dto));
    }

    // ========================================
    // ADMIN - OPERACIONES CRUD
    // ========================================

    // ----- LECTURAS (Admin) -----

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todas las entidades")
    public ResponseEntity<Page<EntityDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(entityService.getAll(pageable));
    }

    // ----- ACTUALIZACIONES (Admin) -----

    @PutMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar entidades en batch")
    public ResponseEntity<BatchResultDTO> updateBatch(
            @Valid @RequestBody BatchUpdateDTO dto) {
        return ResponseEntity.ok(entityService.updateBatch(dto.getIds(), dto.getAction()));
    }

    // ----- ELIMINACIONES (Admin) -----

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar entidad")
    public ResponseEntity<MessageDTO> delete(@PathVariable Long id) {
        entityService.delete(id);
        return ResponseEntity.ok(new MessageDTO("Entidad eliminada exitosamente"));
    }
}
```

---

### 4️⃣ DTOs (Data Transfer Objects)

#### Checklist

- [ ] Usar `record` para DTOs inmutables (Java 17+)
- [ ] Documentar con JavaDoc la clase y campos importantes
- [ ] Agrupar DTOs por funcionalidad (request, response, analytics, etc.)
- [ ] Usar validaciones Jakarta Bean Validation cuando corresponda
- [ ] **NUNCA retornar tipos genéricos directamente** (Map, List) en endpoints

#### Estructura de DTOs

```
com.feeling.packages.[package].domain.dto/
├── request/                          # DTOs de entrada
│   ├── CreateEntityDTO.java
│   ├── UpdateEntityDTO.java
│   └── BatchActionDTO.java
├── response/                         # DTOs de salida
│   ├── EntityResponseDTO.java
│   ├── EntityListResponseDTO.java
│   └── EntityStatsResponseDTO.java
├── analytics/                        # DTOs de métricas
│   ├── EntityAnalyticsDTO.java
│   └── EntityMetricsDTO.java
└── mapper/                           # Mappers
    └── EntityDTOMapper.java
```

#### Ejemplo de DTO (Record)

```java
/**
 * DTO para respuesta de [Entidad].
 * <p>
 * Contiene información [completa/parcial] de la entidad para [uso específico].
 *
 * @param id ID de la entidad
 * @param name Nombre de la entidad
 * @param createdAt Fecha de creación
 */
public record EntityResponseDTO(
                @Schema(description = "ID único de la entidad", example = "1")
                Long id,

                @Schema(description = "Nombre de la entidad", example = "Example")
                @NotBlank(message = "El nombre no puede estar vacío")
                String name,

                @Schema(description = "Fecha de creación")
                LocalDateTime createdAt
        ) {
}
```

#### DTOs para Tipos Genéricos

**Siempre crear DTOs específicos en lugar de usar Map o List directamente.**

```java
// ✅ Para Map<String, List<X>>
public record GroupedEntitiesResponseDTO(
    Map<String, List<EntityDTO>> entitiesByCategory
) {}

// ✅ Para List<String>
public record NamesResponseDTO(
    List<String> names
) {}

// ✅ Para conteos
public record CountResponseDTO(
    Long count
) {}

// ✅ Para tipos anidados
public record EntityStatsResponseDTO(
    Long total,
    Map<String, Long> countByStatus,
    List<TopEntityDTO> topEntities
) {}
```

---

### 5️⃣ ENTIDADES

#### Checklist

- [ ] Verificar relaciones JPA (OneToMany, ManyToOne, etc.)
- [ ] Documentar campos importantes con JavaDoc
- [ ] Optimizar lazy/eager loading según casos de uso
- [ ] Agregar métodos de dominio cuando corresponda
- [ ] Usar @JsonView para controlar serialización
- [ ] Evitar @Data de Lombok (preferir @Getter/@Setter específicos)

#### Ejemplo de Entidad

```java
/**
 * Entidad que representa [descripción].
 * <p>
 * Relaciones:
 * - [Relación 1]
 * - [Relación 2]
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Entity
@Table(name = "entities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    // Relaciones - LAZY por defecto
    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore // Evitar serialización circular
    private List<RelatedEntity> relatedEntities = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Entity parent;

    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Métodos de dominio

    /**
     * Verifica si la entidad está activa.
     *
     * @return true si está activa
     */
    public boolean isActive() {
        return this.active != null && this.active;
    }

    /**
     * Agrega una entidad relacionada.
     *
     * @param related Entidad relacionada a agregar
     */
    public void addRelatedEntity(RelatedEntity related) {
        relatedEntities.add(related);
        related.setEntity(this);
    }
}
```

---

### 6️⃣ MAPPERS

#### Checklist

- [ ] Documentar métodos de mapeo
- [ ] Manejar casos null de forma segura
- [ ] Optimizar mapeo de colecciones (usar streams)
- [ ] Centralizar lógica de transformación
- [ ] Considerar usar MapStruct para mapeos complejos

#### Ejemplo de Mapper

```java
/**
 * Mapper para conversión entre Entity y DTOs.
 * <p>
 * Centraliza la lógica de transformación de datos.
 *
 * @author J. Alexander Gavilán M.
 * @version 1.0
 */
@Component
public class EntityDTOMapper {

    /**
     * Convierte entidad a DTO de respuesta.
     *
     * @param entity Entidad fuente
     * @return DTO de respuesta
     */
    public EntityResponseDTO toResponseDTO(Entity entity) {
        if (entity == null) return null;

        return new EntityResponseDTO(
            entity.getId(),
            entity.getName(),
            entity.getCreatedAt()
        );
    }

    /**
     * Convierte lista de entidades a lista de DTOs.
     *
     * @param entities Lista de entidades
     * @return Lista de DTOs
     */
    public List<EntityResponseDTO> toResponseDTOList(List<Entity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }

        return entities.stream()
            .map(this::toResponseDTO)
            .toList();
    }

    /**
     * Actualiza entidad con datos del DTO.
     *
     * @param entity Entidad a actualizar
     * @param dto DTO con nuevos datos
     */
    public void updateEntityFromDTO(Entity entity, UpdateEntityDTO dto) {
        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        // Actualizar otros campos...
    }
}
```

---

## 🏗️ Patrones y Arquitectura DDD

### Servicios Principales vs Especializados

#### Servicio Principal

- Contiene métodos de dominio core (CRUD básico)
- Coordina operaciones entre servicios especializados
- Implementa lógica de negocio principal del dominio
- **NO es un Facade** - tiene lógica propia

#### Servicios Especializados

- Responsabilidad única y bien definida
- Contienen lógica de negocio específica
- Son reutilizables desde múltiples puntos
- Facilitan testing y mantenimiento

### Ejemplo de Estructura (Dominio User)

```
UserService (Principal)
├── UserApprovalService         # Aprobación/rechazo
├── UserNotificationService     # Emails y notificaciones
├── UserMediaService            # Gestión multimedia
├── UserRoleService             # Roles y permisos
├── UserAnalyticsService        # Métricas y estadísticas
└── UserValidationService       # Validaciones de negocio
```

### Cuándo Delegar a Servicio Especializado

**Delegar cuando:**

- ✅ La responsabilidad pertenece claramente a otro dominio
- ✅ El método tiene lógica de negocio específica y compleja
- ✅ La funcionalidad es reutilizable desde múltiples puntos
- ✅ Mejora la separación de responsabilidades (SRP)

**NO delegar cuando:**

- ❌ Es lógica core del dominio principal
- ❌ Crea Facade innecesario (solo delega, sin lógica propia)
- ❌ La delegación no aporta valor (solo mueve código)

---

## ✅ Checklist de Verificación

### Por Archivo

#### ✅ Repositorios

```
[ ] Eliminar métodos sin uso (previa consulta)
[ ] Consolidar métodos duplicados
[ ] Agregar FETCH JOIN donde corresponda
[ ] Documentar todos los métodos
[ ] Documentar la clase
[ ] Organizar por secciones
[ ] Verificar naming conventions Spring Data
[ ] Optimizar queries con índices
[ ] Verificar imports (sin wildcards)
```

#### ✅ Servicios

```
[ ] Verificar duplicados ENTRE servicios
[ ] Delegar lógica especializada
[ ] Actualizar llamadas a métodos renombrados
[ ] Verificar SRP
[ ] Documentar métodos públicos
[ ] Indicar delegación cuando corresponda
[ ] Eliminar código comentado
[ ] Evitar N+1 queries
[ ] Organizar con comentarios de sección
[ ] Evitar redeclaración de variables
[ ] Aplicar orden estándar de métodos
[ ] Verificar imports (sin wildcards)
```

#### ✅ Controladores

```
[ ] Verificar endpoints RESTful
[ ] Usar DTOs en todos los endpoints
[ ] NO orquestar lógica de negocio
[ ] Documentar con @Operation (conciso)
[ ] Validar permisos (@PreAuthorize)
[ ] Validar DTOs de entrada (@Valid)
[ ] Aplicar orden estándar de métodos
[ ] Delegar lógica de negocio a servicios
[ ] Verificar imports (sin wildcards, excepto @*)
```

#### ✅ Entidades

```
[ ] Verificar relaciones JPA
[ ] Documentar campos importantes
[ ] Optimizar lazy/eager loading
[ ] Agregar métodos de dominio
[ ] Usar @JsonView para serialización
[ ] Evitar @Data de Lombok
[ ] Verificar imports (sin wildcards)
```

#### ✅ DTOs

```
[ ] Usar record cuando sea posible
[ ] Documentar clase y campos
[ ] Agrupar por funcionalidad
[ ] Usar validaciones Jakarta
[ ] NO exponer tipos genéricos (Map, List)
[ ] Verificar imports (sin wildcards)
```

### Verificación General

```
[ ] Compilación exitosa
[ ] Tests pasando
[ ] Sin warnings de imports
[ ] Sin código comentado
[ ] JavaDoc completo
[ ] Naming conventions consistentes
[ ] Organización por secciones clara
[ ] Separación de responsabilidades
[ ] Sin duplicados entre servicios
[ ] Optimizaciones de queries
```

---

## 📚 Referencias

- **Archivos de referencia**: `User.java`, `UserService.java`
- **Principios**: SOLID, DDD
- **Framework**: Spring Boot, Spring Data JPA
- **Documentación**: JavaDoc, Swagger/OpenAPI

---

**Autor**: J. Alexander Gavilán M.
**Versión**: 2.0
**Última actualización**: 2025
