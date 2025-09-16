# Plan Maestro de Refactoring - User DTOs

## 📋 OBJETIVO
Transformar la estructura actual de DTOs en un sistema mantenible, performante y escalable sin romper la funcionalidad existente.

## 🔍 CONTEXTO Y PROBLEMAS IDENTIFICADOS

### 🚨 PROBLEMAS CRÍTICOS
1. **OVER-ENGINEERING MASIVO**: 7 DTOs diferentes para respuestas de usuario
2. **DTO MONSTRUOSO**: UserModifyDTO con 217 líneas y 38+ campos
3. **DUPLICACIÓN MASIVA**: 90%+ campos duplicados entre DTOs
4. **PROBLEMAS DE PERFORMANCE**: AuthLoginResponseDTO retorna 9 DTOs anidados

### 📊 ESTADO ACTUAL
- **UserBaseResponseDTO**, **UserStandardResponseDTO**, **UserExtendedResponseDTO**, **UserPublicResponseDTO**, **UserSuggestionResponseDTO**, **UserResponseDTO**, **AuthLoginResponseDTO**
- **UserModifyDTO**: 217 líneas, incluye TODO (datos básicos, perfil, ubicación, características, preferencias, privacidad, notificaciones)
- **AuthLoginResponseDTO**: ~73 campos en respuesta de login
- **Duplicación**: UserProfileDataDTO vs UserModifyDTO (90%+), UserStatusDTO vs UserPublicStatusDTO (80%+)

---

## 📊 FASES DEL PLAN

## **FASE 1: PREPARACIÓN Y ANÁLISIS** ⏱️ 1-2 días
*Reducir riesgo y preparar el terreno*

### **1.1 Mapeo de Dependencias** ⏱️ 2 horas ✅ COMPLETADO
- [x] Identificar todos los lugares donde se usan los DTOs actuales
- [x] Crear matriz de dependencias (Controller → Service → DTO)
- [x] Documentar flujos de datos actuales
- [x] Identificar puntos de entrada/salida críticos

#### Tareas específicas:
- [x] Crear diagrama de dependencias actual
- [x] Documentar endpoints que usan cada DTO
- [x] Identificar DTOs expuestos públicamente vs internos
- [x] Mapear relaciones entre DTOs y entidades

#### ✅ RESULTADOS:
- **20 DTOs principales** inventariados con rutas completas
- **Matriz de uso completa**: Controllers (6), Services (3), Mappers (1)
- **Clasificación de riesgo**: 3 HIGH RISK, 4 MEDIUM RISK, 2 LOW RISK, 11 COMPONENT DTOs
- **DTOs críticos identificados**: AuthLoginResponseDTO (73 campos), UserModifyDTO (217 líneas)
- **Endpoints mapeados**: 15+ endpoints públicos afectados
- **Dependencias críticas**: AuthLoginResponseDTO → 9 DTOs anidados

### **1.2 Creación de Tests de Integración** ⏱️ 4 horas ✅ COMPLETADO
```java
// Tests para asegurar que no rompemos nada
@Test
void testUserLoginResponseStructure() {
    // Valida estructura actual de AuthLoginResponseDTO
}

@Test
void testUserProfileUpdateFlow() {
    // Valida flujo completo de actualización
}

@Test
void testUserSuggestionsResponse() {
    // Valida respuesta de sugerencias
}
```

#### Tareas específicas:
- [x] Crear tests de estructura para todos los DTOs principales
- [x] Tests de serialización/deserialización JSON
- [x] Tests de validación de campos
- [x] Tests de integración completos para flujos críticos

#### ✅ RESULTADOS:
- **Tests creados**: UserDTOStructureIntegrationTest.java (8 tests críticos)
- **Tests adicionales**: UserDTOCompatibilityTest.java (5 tests de compatibilidad)
- **Cobertura**: AuthLoginResponseDTO, UserSuggestionResponseDTO, UserExtendedResponseDTO, UserPublicResponseDTO
- **Tests de regresión**: Baseline structure validation para detectar cambios no intencionados
- **Performance tests**: Medición de tamaño de JSON y tiempo de serialización
- **Compatibilidad**: Verificación de nombres de campos JSON consistentes

### **1.3 Backup y Versionado** ⏱️ 1 hora ✅ COMPLETADO
- [x] Crear branch específico: `feature/dto-refactoring`
- [x] Documentar estado actual completo
- [x] Configurar rollback strategy
- [x] Establecer puntos de checkpoint

#### ✅ RESULTADOS:
- **Branch creado**: `feature/dto-refactoring` desde `main`
- **Commit inicial**: `49f85e7` - Phase 1 completion con todos los cambios
- **Estado documentado**: DTO_REFACTORING_PLAN.md con progreso completo
- **Rollback strategy**: Branch main preservado para rollback inmediato
- **Checkpoint establecido**: Tests de regresión como baseline para siguientes fases

---

## **FASE 2: OPTIMIZACIONES DE BAJO RIESGO** ⏱️ 2-3 días
*Quick wins sin romper APIs*

### **2.1 Eliminar DTOs Redundantes** ⏱️ 3 horas ✅ COMPLETADO

#### TARGETS:
- [x] `UserBaseResponseDTO` → Consolidado en `UserStandardResponseDTO`
- [x] Eliminar duplicados exactos identificados
- [x] Limpiar DTOs internos no expuestos en APIs

#### ESTRATEGIA:
1. [x] Reemplazar referencias internas manteniendo APIs públicas
2. [x] Tests de regresión después de cada cambio
3. [x] Documentar cambios internos

#### ✅ RESULTADOS:
- **UserBaseResponseDTO eliminado**: Era idéntico a UserStandardResponseDTO
- **UserResponseDTO optimizado**: Añadido campo matches para consistencia con UserExtendedResponseDTO
- **Constructor de composición**: UserResponseDTO puede construirse desde UserExtendedResponseDTO + ID
- **Estructura consolidada**: Reducida redundancia manteniendo funcionalidad admin
- **APIs preservadas**: Sin breaking changes en endpoints públicos

### **2.2 Crear DTOs de Validación** ⏱️ 4 horas ✅ COMPLETADO
```java
// Nuevos DTOs para validaciones específicas
public interface CreateUser {}
public interface UpdateUser {}
public interface AdminUpdate {}

public record UserValidationDTO(
    @NotNull(groups = CreateUser.class)
    @Null(groups = UpdateUser.class)
    String email,

    @NotBlank(groups = {CreateUser.class, UpdateUser.class})
    String name
) {}
```

#### Tareas específicas:
- [x] Definir interfaces de validación
- [x] Crear grupos de validación para diferentes operaciones
- [x] Actualizar DTOs existentes con grupos
- [x] Tests de validación por grupos

#### ✅ RESULTADOS:
- **ValidationGroups.java**: 9 grupos de validación definidos (CreateUser, UpdateUser, AdminOperation, etc.)
- **UserValidatedDTO.java**: DTO completo con validación por grupos y validaciones cruzadas
- **DTOs específicos creados**: UserBasicUpdateDTO, UserPreferencesUpdateDTO, UserPrivacyUpdateDTO, UserNotificationUpdateDTO
- **Tests de validación**: ValidationGroupsTest.java con 6 tests de diferentes grupos
- **Validaciones cruzadas**: AgePreference validation, Phone visibility validation
- **UserProfileRequestDTO actualizado**: Añadido import de ValidationGroups para compatibilidad

### **2.3 Implementar JsonViews** ⏱️ 3 horas ✅ COMPLETADO
```java
public class Views {
    public static class Public {}
    public static class Internal {}
    public static class Admin {}
}

public record UserDTO(
    @JsonView(Views.Public.class)
    String name,

    @JsonView(Views.Internal.class)
    String phone,

    @JsonView(Views.Admin.class)
    String adminNotes
) {}
```

#### Tareas específicas:
- [x] Definir clases de vistas
- [x] Aplicar anotaciones JsonView a DTOs existentes
- [x] Configurar controladores para usar vistas
- [x] Tests de serialización por vista

#### ✅ RESULTADOS:
- **UserViews.java**: 8 vistas definidas (Public, Standard, Internal, Admin, Suggestions, Matched, Basic, Metrics)
- **UserExtendedResponseDTO actualizado**: JsonViews aplicadas a todos los campos
- **UserProfileDataDTO actualizado**: Control granular de visibilidad por campo
- **JsonViewsTest.java**: 8 tests verificando serialización correcta por vista
- **Control de teléfono**: Phone solo visible en vistas Matched, Internal y Admin
- **Optimización de tamaño**: Public view significativamente más pequeña que Admin view
- **Compatibilidad**: Sin vista especificada muestra todos los campos (backward compatible)

---

## **FASE 3: RESTRUCTURACIÓN MAJOR** ⏱️ 4-5 días
*Cambios arquitectónicos significativos*

### **3.1 Split UserModifyDTO Monster** ⏱️ 8 horas

#### ANTES:
```java
UserModifyDTO (217 líneas, 38+ campos)
```

#### DESPUÉS:
```java
// DTOs específicos por funcionalidad
public record UserBasicUpdateDTO(
    String name, String lastName, String email, LocalDate dateOfBirth
) {}

public record UserLocationUpdateDTO(
    String country, String city, String department, String locality
) {}

public record UserPreferencesUpdateDTO(
    Integer agePreferenceMin, Integer agePreferenceMax,
    Integer locationRadius, String categoryInterest
) {}

public record UserProfileUpdateDTO(
    String description, List<String> images, String mainImage,
    List<String> tags, String church, String customChurch
) {}

public record UserPrivacyUpdateDTO(
    Boolean publicAccount, Boolean searchVisibility,
    Boolean locationPublic, Boolean showAge, Boolean showPhone
) {}

public record UserNotificationUpdateDTO(
    Boolean emailEnabled, Boolean phoneEnabled, Boolean matchesEnabled,
    Boolean eventsEnabled, Boolean loginEnabled, Boolean paymentsEnabled
) {}

// Solo para admins
public record UserAdminUpdateDTO(
    Boolean verified, String approvalStatus, String role,
    Boolean accountDeactivated, String deactivationReason
) {}
```

#### MIGRATION STRATEGY:
1. [ ] Crear nuevos DTOs específicos
2. [ ] Crear adapter/converter desde UserModifyDTO antiguo
3. [ ] Implementar endpoints nuevos con DTOs específicos
4. [ ] Deprecar UserModifyDTO gradualmente
5. [ ] Remover después de periodo de gracia (2 sprints)

#### Tareas específicas:
- [ ] Diseñar y crear UserBasicUpdateDTO
- [ ] Diseñar y crear UserLocationUpdateDTO
- [ ] Diseñar y crear UserPreferencesUpdateDTO
- [ ] Diseñar y crear UserProfileUpdateDTO
- [ ] Diseñar y crear UserPrivacyUpdateDTO
- [ ] Diseñar y crear UserNotificationUpdateDTO
- [ ] Diseñar y crear UserAdminUpdateDTO
- [ ] Crear converters/adapters
- [ ] Actualizar servicios para usar nuevos DTOs
- [ ] Crear endpoints específicos
- [ ] Deprecar UserModifyDTO
- [ ] Tests completos para todos los nuevos DTOs

### **3.2 Optimizar AuthLoginResponseDTO** ⏱️ 6 horas

#### PROBLEMA ACTUAL:
```java
AuthLoginResponseDTO {
    TokenPairDTO tokens,
    UserStatusDTO status,           // 8 campos
    UserProfileDataDTO profile,     // 32 campos
    UserPrivacyDTO privacy,         // 7 campos
    UserNotificationDTO notifications, // 6 campos
    UserMetricsDTO metrics,         // 5 campos
    UserMatchesDTO matches,         // 8 campos
    UserAuthDTO auth,               // 4 campos
    UserAccountStatusDTO account    // 3 campos
}
// TOTAL: ~73 campos en el login! 🤯
```

#### SOLUCIÓN:
```java
// Login esencial
public record AuthLoginResponseDTO(
    TokenPairDTO tokens,
    UserEssentialDTO user
) {}

public record UserEssentialDTO(
    String name, String email, String role,
    Boolean verified, Boolean profileComplete,
    String mainImage, String categoryInterest
) {}

// Para datos completos usar endpoint separado
GET /user/profile → UserCompleteResponseDTO
```

#### Tareas específicas:
- [ ] Crear UserEssentialDTO con campos mínimos necesarios
- [ ] Actualizar AuthLoginResponseDTO para usar UserEssentialDTO
- [ ] Crear endpoint separado para perfil completo
- [ ] Actualizar AuthService para usar nueva estructura
- [ ] Tests de login con nueva estructura
- [ ] Documentar cambio para frontend
- [ ] Período de migración con soporte dual

### **3.3 Consolidar Response DTOs** ⏱️ 6 horas

#### ESTRATEGIA: Single Configurable DTO
```java
public record UserResponseDTO(
    UserStatusDTO status,
    UserProfileDataDTO profile,

    // Secciones opcionales (null si no se requieren)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserPrivacyDTO privacy,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserMetricsDTO metrics,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserMatchesDTO matches,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserAuthDTO auth,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    UserAccountStatusDTO account
) {
    // Factory methods para diferentes casos
    public static UserResponseDTO publicView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            null, null, null, null, null
        );
    }

    public static UserResponseDTO fullView(User user) {
        return new UserResponseDTO(
            UserDTOMapper.toUserStatusDTO(user),
            UserDTOMapper.toUserProfileDataDTO(user),
            UserDTOMapper.toUserPrivacyDTO(user),
            UserDTOMapper.toUserMetricsDTO(user),
            UserDTOMapper.toUserMatchesDTO(user),
            UserDTOMapper.toUserAuthDTO(user),
            UserDTOMapper.toUserAccountStatusDTO(user)
        );
    }
}
```

#### Tareas específicas:
- [ ] Crear nuevo UserResponseDTO configurable
- [ ] Implementar factory methods para diferentes vistas
- [ ] Crear builders/helpers para casos comunes
- [ ] Migrar controladores gradualmente
- [ ] Tests para todos los factory methods
- [ ] Deprecar DTOs antiguos gradualmente

---

## **FASE 4: API MODERNIZATION** ⏱️ 3-4 días
*Nuevas APIs con arquitectura optimizada*

### **4.1 Partial Update Support** ⏱️ 5 horas
```java
// Para PATCH operations
public record UserPartialUpdateDTO(
    Optional<String> name,
    Optional<String> description,
    Optional<List<String>> tags,
    Optional<UserLocationUpdateDTO> location,
    Optional<UserPreferencesUpdateDTO> preferences
) {}

@PatchMapping("/profile")
public ResponseEntity<UserResponseDTO> updateUserPartial(
    @RequestBody UserPartialUpdateDTO updates,
    Authentication auth
) {
    // Solo actualizar campos presentes
}
```

#### Tareas específicas:
- [ ] Crear UserPartialUpdateDTO con Optional fields
- [ ] Implementar lógica de actualización parcial en servicios
- [ ] Crear endpoints PATCH específicos
- [ ] Tests para actualizaciones parciales
- [ ] Validación de campos parciales
- [ ] Documentación de APIs PATCH

### **4.2 Query Parameters para Response Control** ⏱️ 4 horas
```java
@GetMapping("/profile")
public ResponseEntity<UserResponseDTO> getUserProfile(
    @RequestParam(defaultValue = "basic") String include,
    // include: basic,privacy,metrics,matches,all
    Authentication auth
) {}

@GetMapping("/suggestions")
public ResponseEntity<Page<UserResponseDTO>> getUserSuggestions(
    @RequestParam(defaultValue = "public") String include,
    Pageable pageable,
    Authentication auth
) {}
```

#### Tareas específicas:
- [ ] Definir niveles de inclusión (basic, full, admin, etc.)
- [ ] Implementar lógica de construcción de DTOs según parámetros
- [ ] Actualizar controladores para soportar parámetros include
- [ ] Tests para diferentes niveles de inclusión
- [ ] Documentación de parámetros de query
- [ ] Validación de valores de include

### **4.3 Response Caching Strategy** ⏱️ 3 horas
```java
// Cache para respuestas costosas
@Cacheable(value = "userProfiles", key = "#email + '_' + #include")
public UserResponseDTO getUserProfile(String email, String include) {}

@CacheEvict(value = "userProfiles", key = "#email + '_*'")
public void evictUserCache(String email) {}
```

#### Tareas específicas:
- [ ] Configurar Redis/cache provider
- [ ] Implementar estrategia de caching por include level
- [ ] Configurar cache eviction en updates
- [ ] Tests de caching
- [ ] Métricas de cache hit/miss
- [ ] Configuración de TTL apropiada

---

## **FASE 5: CLEANUP Y DOCUMENTATION** ⏱️ 2 días
*Finalización y documentación*

### **5.1 Deprecated DTOs Removal** ⏱️ 4 horas
#### Tareas específicas:
- [ ] Revisar uso de DTOs deprecados
- [ ] Remover DTOs obsoletos después de periodo de gracia
- [ ] Actualizar imports en todo el codebase
- [ ] Limpiar mappers obsoletos
- [ ] Tests de que no quedan referencias
- [ ] Commit de limpieza final

### **5.2 API Documentation** ⏱️ 4 horas
```java
@Operation(
    summary = "Get user profile",
    description = "Returns user profile with configurable detail level"
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Profile retrieved",
        content = @Content(schema = @Schema(implementation = UserResponseDTO.class))),
    @ApiResponse(responseCode = "404", description = "User not found")
})
```

#### Tareas específicas:
- [ ] Actualizar anotaciones Swagger en controladores
- [ ] Crear ejemplos de request/response
- [ ] Documentar todos los niveles de include
- [ ] Documentar DTOs de actualización parcial
- [ ] Crear guías de uso para diferentes casos
- [ ] Verificar documentación generada

### **5.3 Migration Guide** ⏱️ 2 horas
#### Tareas específicas:
- [ ] Crear guía de migración para frontend
- [ ] Documentar breaking changes con fechas
- [ ] Proporcionar ejemplos de migración
- [ ] Crear checklist de migración
- [ ] FAQ de problemas comunes
- [ ] Timeline de deprecación

---

## **🚦 CONTROL DE RIESGOS**

### **CHECKPOINTS OBLIGATORIOS**
- ✅ **Después de cada fase**: Tests completos + code review
- ✅ **Antes de FASE 3**: Aprobación de arquitectura + stakeholder sign-off
- ✅ **Antes de FASE 4**: Review de breaking changes + frontend coordination
- ✅ **Antes de deployment**: Tests de performance + load testing

### **ROLLBACK STRATEGY**
- [ ] Mantener DTOs antiguos como `@Deprecated` por 2 sprints mínimo
- [ ] Feature flags para nuevos endpoints
- [ ] Database rollback scripts si es necesario
- [ ] Monitoring de errores post-deployment
- [ ] Plan de rollback completo documentado

### **MÉTRICAS DE ÉXITO**
#### Performance:
- [ ] Response size reducido 40-60%
- [ ] Tiempo de serialización reducido 30%
- [ ] Memory footprint reducido 25%

#### Maintainability:
- [ ] Líneas de código DTO reducidas 50%
- [ ] Complejidad ciclomática reducida
- [ ] Test coverage mantenido >90%

#### Developer Experience:
- [ ] Tiempo de desarrollo de nuevas features reducido 30%
- [ ] Menos confusión entre DTOs similares
- [ ] APIs más intuitivas y consistentes

---

## **📅 CRONOGRAMA Y RECURSOS**

| Fase | Duración | Desarrolladores | Risk Level | Dependencies |
|------|----------|----------------|------------|--------------|
| Fase 1 | 1-2 días | 1 dev | 🟢 LOW | None |
| Fase 2 | 2-3 días | 1-2 devs | 🟡 MEDIUM | Fase 1 complete |
| Fase 3 | 4-5 días | 2 devs | 🔴 HIGH | Fase 1-2 complete, architecture approval |
| Fase 4 | 3-4 días | 1-2 devs | 🟡 MEDIUM | Fase 3 complete, frontend coordination |
| Fase 5 | 2 días | 1 dev | 🟢 LOW | All phases complete |

**TOTAL ESTIMADO**: 12-16 días con 1-2 desarrolladores

### **ROLES Y RESPONSABILIDADES**
- **Lead Developer**: Arquitectura, Fase 3, code reviews
- **Backend Developer**: Implementación, tests, documentación
- **Frontend Coordinator**: Review de breaking changes, migration guide
- **QA**: Tests de integración, performance testing
- **DevOps**: Cache configuration, deployment strategy

---

## **📝 NOTAS Y DECISIONES**

### **Decisiones Arquitectónicas**
- [ ] **Fecha**: ______ **Decisión**: Usar single configurable DTO vs múltiples DTOs específicos
- [ ] **Fecha**: ______ **Decisión**: Estrategia de caching seleccionada
- [ ] **Fecha**: ______ **Decisión**: Período de deprecación acordado

### **Issues y Resoluciones**
- [ ] **Issue**: ______ **Resolución**: ______
- [ ] **Issue**: ______ **Resolución**: ______

### **Lessons Learned**
- [ ] **Lección**: ______
- [ ] **Lección**: ______

---

## **🔗 REFERENCIAS**

### **Documentación Relacionada**
- [ ] Current DTO Analysis Report
- [ ] API Documentation
- [ ] Database Schema
- [ ] Frontend Integration Guide

### **External Resources**
- [ ] Spring Boot Best Practices for DTOs
- [ ] Jackson JsonView Documentation
- [ ] Validation Groups Documentation
- [ ] Performance Optimization Guidelines

---

**Última actualización**: [Fecha]
**Próxima revisión**: [Fecha]
**Estado actual**: Planificación completa

---

## **APROBACIONES**

- [ ] **Arquitecto de Software**: ________________ **Fecha**: ______
- [ ] **Tech Lead**: ________________ **Fecha**: ______
- [ ] **Product Owner**: ________________ **Fecha**: ______
- [ ] **Frontend Lead**: ________________ **Fecha**: ______