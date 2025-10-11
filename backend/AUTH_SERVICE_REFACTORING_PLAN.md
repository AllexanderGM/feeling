# Plan de Refactorización - AuthService

**Archivo:** `src/main/java/com/feeling/packages/auth/domain/services/AuthService.java`
**Fecha:** 2025-01-09
**Autor:** Análisis basado en REFACTORING_GUIDE.md

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Refactorizaciones Críticas](#refactorizaciones-críticas)
3. [Métodos a Eliminar](#métodos-a-eliminar)
4. [JavaDoc Faltante](#javadoc-faltante)
5. [Mejoras Opcionales](#mejoras-opcionales)
6. [Métodos Core Confirmados](#métodos-core-confirmados)
7. [Checklist de Verificación](#checklist-de-verificación)

---

## 📊 RESUMEN EJECUTIVO

### Métricas del Servicio

| Métrica | Cantidad |
|---------|----------|
| **Métodos Core Confirmados** | 19 |
| **Métodos a Eliminar** | 5 |
| **Refactorizaciones Críticas** | 3 |
| **JavaDoc Faltante** | 7 |
| **Mejoras Opcionales** | 2 |

### Estado General

✅ **BUENO** - La mayoría de métodos están bien implementados
🔴 **CRÍTICO** - Violación de separación de capas (import de controlador)
🟡 **MEJORABLE** - Falta JavaDoc en métodos públicos

---

## 🔴 REFACTORIZACIONES CRÍTICAS

### 1️⃣ CRÍTICO: Eliminar Import de Controlador en Servicio

**Problema:**
```java
// Línea 5 - AuthService.java
import com.feeling.packages.auth.application.PasswordController;

// Línea 1122
public MessageResponseDTO changePassword(
    PasswordController.ChangePasswordRequestDTO request,
    String authHeader
) {
    // ...
}
```

**Violación:** Capa de dominio (servicio) importando capa de aplicación (controlador) - Viola arquitectura DDD

**Solución:**

#### Paso 1: Crear DTO en capa de dominio
**Archivo:** `src/main/java/com/feeling/packages/auth/domain/dto/request/ChangePasswordRequestDTO.java`

```java
package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para solicitud de cambio de contraseña.
 *
 * @param currentPassword Contraseña actual del usuario
 * @param newPassword Nueva contraseña
 * @param confirmPassword Confirmación de la nueva contraseña
 */
public record ChangePasswordRequestDTO(
    @NotBlank(message = "La contraseña actual es obligatoria")
    String currentPassword,

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String newPassword,

    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    String confirmPassword
) {
    /**
     * Valida que las contraseñas coincidan.
     *
     * @return true si newPassword y confirmPassword son iguales
     */
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
```

#### Paso 2: Actualizar AuthService

```java
// ELIMINAR esta línea:
import com.feeling.packages.auth.application.PasswordController;

// AGREGAR esta línea:
import com.feeling.packages.auth.domain.dto.request.ChangePasswordRequestDTO;

// Línea 1122 - Actualizar firma del método:
public MessageResponseDTO changePassword(
    ChangePasswordRequestDTO request,  // ← Cambiar tipo
    String authHeader
) {
    // El resto del método permanece igual
}
```

#### Paso 3: Actualizar PasswordController

**Archivo:** `src/main/java/com/feeling/packages/auth/application/PasswordController.java`

```java
// AGREGAR import:
import com.feeling.packages.auth.domain.dto.request.ChangePasswordRequestDTO;

// ELIMINAR el record interno ChangePasswordRequestDTO del controlador

// El endpoint ya usa el DTO del dominio automáticamente
```

---

### 2️⃣ CRÍTICO: Expandir Wildcard Import

**Problema:**
```java
// Línea 6 - AuthService.java
import com.feeling.packages.auth.domain.dto.*;
```

**Violación:** Guía prohíbe wildcards (excepto `@*` en controladores REST)

**Solución:**

Reemplazar línea 6 con imports específicos:

```java
// Eliminar:
import com.feeling.packages.auth.domain.dto.*;

// Reemplazar con:
import com.feeling.packages.auth.domain.dto.external.GoogleUserInfoDTO;
import com.feeling.packages.auth.domain.dto.request.AuthLoginRequestDTO;
import com.feeling.packages.auth.domain.dto.request.AuthRegisterRequestDTO;
import com.feeling.packages.auth.domain.dto.request.AuthVerifyCodeDTO;
import com.feeling.packages.auth.domain.dto.request.GoogleTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.request.RefreshTokenRequestDTO;
import com.feeling.packages.auth.domain.dto.request.UnlinkOAuthRequestDTO;
import com.feeling.packages.auth.domain.dto.response.AuthLoginResponseDTO;
import com.feeling.packages.auth.domain.dto.response.AuthMethodInfoDTO;
import com.feeling.packages.auth.domain.dto.response.AuthUserStatusDTO;
import com.feeling.packages.auth.domain.dto.response.EmailAvailabilityDTO;
import com.feeling.packages.auth.domain.dto.response.RefreshTokenResponseDTO;
import com.feeling.packages.auth.domain.dto.response.SessionInfoDTO;
import com.feeling.packages.auth.domain.dto.response.TokenValidationDTO;
```

**Nota:** Verificar en IDE que estos sean todos los DTOs usados en el archivo.

---

### 3️⃣ CRÍTICO: Implementar Logout en AuthController

**Problema:**
```java
// AuthController.java - Línea 311
@PostMapping("/logout")
public ResponseEntity<MessageResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
    logger.info("Solicitud de logout");
    // Nota: La lógica de logout se manejará en el SecurityConfiguration
    // ❌ NO llama a authService.logout()
    return ResponseEntity.ok(new MessageResponseDTO("Sesión cerrada exitosamente"));
}
```

**Problema:** El endpoint no revoca tokens, solo retorna mensaje

**Solución:**

**Archivo:** `src/main/java/com/feeling/packages/auth/application/AuthController.java`

```java
@PostMapping("/logout")
@Operation(
    summary = "Cerrar sesión",
    description = "Invalida todos los tokens JWT del usuario"
)
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Sesión cerrada exitosamente"),
    @ApiResponse(responseCode = "401", description = "Token inválido")
})
public ResponseEntity<MessageResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
    try {
        logger.info("Solicitud de logout");
        // ✅ Llamar al servicio para revocar tokens
        MessageResponseDTO response = authService.logout(authHeader);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        logger.error("Error en logout: {}", e.getMessage());
        throw e;
    }
}
```

---

## ❌ MÉTODOS A ELIMINAR

### 1. `verifyEmail()` - Línea 1152

**Razón:** Delegación innecesaria a `verifyCode()`

```java
// ❌ ELIMINAR ESTE MÉTODO:
public MessageResponseDTO verifyEmail(AuthVerifyCodeDTO verifyCodeDTO) {
    return verifyCode(verifyCodeDTO);
}
```

**Actualizar controladores:**

```java
// VerificationController.java - Línea 62
// ANTES:
MessageResponseDTO response = authService.verifyEmail(verifyCodeDTO);

// DESPUÉS:
MessageResponseDTO response = authService.verifyCode(verifyCodeDTO);
```

```java
// AuthController.java - Línea 103
// ANTES:
MessageResponseDTO response = authService.verifyEmail(verifyCodeDTO);

// DESPUÉS:
MessageResponseDTO response = authService.verifyCode(verifyCodeDTO);
```

---

### 2. `resendVerificationCode()` - Línea 1159

**Razón:** Delegación innecesaria a `resendCode()`

```java
// ❌ ELIMINAR ESTE MÉTODO:
public MessageResponseDTO resendVerificationCode(AuthResendCodeRequestDTO resendCodeDTO) {
    return resendCode(resendCodeDTO.email());
}
```

**Actualizar controladores:**

```java
// VerificationController.java - Línea 95
// ANTES:
MessageResponseDTO response = authService.resendVerificationCode(resendCodeDTO);

// DESPUÉS:
MessageResponseDTO response = authService.resendCode(resendCodeDTO.email());
```

```java
// AuthController.java - Línea 125
// ANTES:
MessageResponseDTO response = authService.resendVerificationCode(request);

// DESPUÉS:
MessageResponseDTO response = authService.resendCode(request.email());
```

---

### 3. `getUserByEmail()` - Línea 1069

**Razón:** Delega directamente al repositorio sin lógica adicional

```java
// ❌ ELIMINAR ESTE MÉTODO:
public Optional<User> getUserByEmail(String email) {
    return userRepository.findByEmail(email.toLowerCase().trim());
}
```

**Actualizar controladores:**

```java
// AuthController.java - Línea 196
// ANTES:
Optional<User> userOptional = authService.getUserByEmail(email);

// DESPUÉS:
@Autowired
private IUserRepository userRepository;  // Inyectar repositorio en controlador

Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase().trim());
```

```java
// AuthController.java - Línea 236
// ANTES:
Optional<User> userOptional = authService.getUserByEmail(email);

// DESPUÉS:
Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase().trim());
```

```java
// AuthController.java - Línea 410
// ANTES:
authService.getUserByEmail(email).map(User::isVerified).orElse(false)

// DESPUÉS:
userRepository.findByEmail(email.toLowerCase().trim()).map(User::isVerified).orElse(false)
```

**ALTERNATIVA:** Si prefieres mantener la encapsulación y NO exponer el repositorio al controlador, entonces **MANTENER** este método pero agregarle JavaDoc:

```java
/**
 * Busca un usuario por email.
 * <p>
 * Normaliza el email (lowercase y trim) antes de la búsqueda.
 *
 * @param email Email del usuario
 * @return Optional con el usuario si existe
 */
public Optional<User> getUserByEmail(String email) {
    return userRepository.findByEmail(email.toLowerCase().trim());
}
```

---

### 4. `extractEmailFromToken()` - Línea 1271

**Razón:** Delega directamente a JwtService sin lógica adicional

```java
// ❌ ELIMINAR ESTE MÉTODO:
public String extractEmailFromToken(String authHeader) {
    try {
        String token = authHeader.replace("Bearer ", "");
        return jwtService.extractUsername(token);
    } catch (Exception e) {
        logger.error("Error extrayendo email del token", e);
        throw new UnauthorizedException("Token inválido");
    }
}
```

**Nota:** Buscar usos de este método en el proyecto antes de eliminar.

```bash
grep -r "extractEmailFromToken" src/
```

Si hay usos, reemplazar con llamada directa a `jwtService.extractUsername()`.

---

### 5. `isPasswordResetTokenValid()` - Línea 1101

**Razón:** Duplicado de `validateResetToken()`

```java
// ❌ ELIMINAR ESTE MÉTODO:
public boolean isPasswordResetTokenValid(String token) {
    try {
        Optional<AuthPasswordResetToken> resetTokenOpt = userPasswordResetTokenRepository.findByToken(token);

        if (resetTokenOpt.isEmpty()) {
            return false;
        }

        AuthPasswordResetToken resetToken = resetTokenOpt.get();
        return resetToken.isValid();
    } catch (Exception e) {
        logger.error("Error validando token de recuperación", e);
        return false;
    }
}
```

**Razón:** `validateResetToken()` (línea 651) hace lo mismo pero retorna información más detallada.

**Actualizar usos:**

```bash
# Buscar usos:
grep -r "isPasswordResetTokenValid" src/

# Reemplazar con:
TokenValidationDTO validation = authService.validateResetToken(token);
boolean isValid = validation.valid();
```

---

## 📝 JAVADOC FALTANTE

### 1. `logout()` - Línea 1284

**Agregar antes del método:**

```java
/**
 * Cierra la sesión del usuario revocando todos sus tokens.
 * <p>
 * Invalida tanto access tokens como refresh tokens para forzar
 * cierre de sesión en todos los dispositivos del usuario.
 *
 * @param authHeader Header Authorization con el token JWT (formato: "Bearer {token}")
 * @return Mensaje de confirmación del cierre de sesión
 * @throws UnauthorizedException si el token es inválido
 * @throws RuntimeException si hay un error al revocar tokens
 */
public MessageResponseDTO logout(String authHeader) {
```

---

### 2. `getAuthMethodInfo()` - Línea 1367

**Agregar antes del método:**

```java
/**
 * Obtiene información del método de autenticación para un email.
 * <p>
 * Identifica con qué proveedor (LOCAL, GOOGLE, FACEBOOK) está registrado
 * el email y qué métodos de autenticación puede usar para iniciar sesión.
 * Si el email no está registrado, retorna que puede usar cualquier método.
 *
 * @param email Email a verificar
 * @return DTO con proveedor actual, mensaje descriptivo y métodos disponibles
 */
public AuthMethodInfoDTO getAuthMethodInfo(String email) {
```

---

### 3. `checkEmailAvailability()` - Línea 1166

**Agregar antes del método:**

```java
/**
 * Verifica si un email está disponible para registro.
 * <p>
 * Indica si el email puede usarse para crear una cuenta nueva
 * y con qué métodos de autenticación. Si el email ya existe,
 * proporciona sugerencias sobre cómo iniciar sesión.
 *
 * @param email Email a verificar
 * @return DTO con disponibilidad, proveedor existente (si aplica) y sugerencias
 */
public EmailAvailabilityDTO checkEmailAvailability(String email) {
```

---

### 4. `getUserVerificationStatus()` - Línea 1192

**Agregar antes del método:**

```java
/**
 * Obtiene el estado de verificación de un usuario.
 * <p>
 * Retorna información sobre si el usuario existe, está verificado
 * y tiene su perfil completo. Útil para validaciones en frontend.
 *
 * @param email Email del usuario
 * @return DTO con estado de registro, verificación y perfil completo
 */
public AuthUserStatusDTO getUserVerificationStatus(String email) {
```

---

### 5. `isVerificationCodeValid()` - Línea 1217

**Agregar antes del método:**

```java
/**
 * Valida si un código de verificación es válido sin consumirlo.
 * <p>
 * Verifica que el código exista, pertenezca al usuario, no esté
 * ya verificado y no haya expirado. No marca el código como usado,
 * permitiendo validaciones previas antes de la verificación final.
 *
 * @param email Email del usuario
 * @param code Código de verificación a validar
 * @return true si el código es válido y no ha expirado
 */
public boolean isVerificationCodeValid(String email, String code) {
```

---

### 6. `isUserFullyRegistered()` - Línea 1055

**Agregar antes del método:**

```java
/**
 * Verifica si un usuario está completamente registrado y verificado.
 * <p>
 * Un usuario está completamente registrado si:
 * - Existe en la base de datos
 * - Ha verificado su email
 * - Su cuenta está habilitada
 *
 * @param email Email del usuario a verificar
 * @return true si el usuario está completamente registrado
 */
public boolean isUserFullyRegistered(String email) {
```

---

### 7. `cleanupExpiredVerificationCodes()` - Línea 1247

**Agregar antes del método:**

```java
/**
 * Limpia códigos de verificación expirados de la base de datos.
 * <p>
 * Utiliza operación @Modifying optimizada para eliminar en batch
 * todos los códigos cuya fecha de expiración ya pasó. Diseñado
 * para ser llamado por tareas programadas (@Scheduled).
 *
 * @return Cantidad de códigos eliminados
 */
@Transactional
public int cleanupExpiredVerificationCodes() {
```

---

### 8. `cleanupOldTokens()` - Línea 920

**Mejorar JavaDoc existente:**

```java
/**
 * Limpia tokens JWT expirados y revocados antiguos.
 * <p>
 * Elimina físicamente de la base de datos los tokens que están
 * expirados o revocados y tienen más de 7 días de antigüedad.
 * Esto previene acumulación infinita de tokens en la BD.
 * <p>
 * Este método no lanza excepciones para evitar afectar el flujo
 * de autenticación si la limpieza falla. Los errores se registran
 * como warnings.
 */
@Transactional
public void cleanupOldTokens() {
```

---

## 🟡 MEJORAS OPCIONALES

### 1. Optimizar Carga Lazy en `login()` - Línea 293-296

**Problema Actual:**

```java
// Líneas 293-296
// Inicializar collections necesarias para el DTO (forzar carga lazy)
userWithCollections.getImages().isEmpty();
if (userWithCollections.getTags() != null) {
    userWithCollections.getTags().isEmpty();
}
```

**Mejora:** Crear query con FETCH JOIN en repositorio

**Archivo:** `src/main/java/com/feeling/packages/user/infrastructure/repositories/IUserRepository.java`

```java
/**
 * Busca usuario por email con todas las relaciones necesarias para login.
 * <p>
 * Usa FETCH JOIN para evitar N+1 queries y carga lazy manual.
 *
 * @param email Email del usuario
 * @return Optional con usuario y relaciones cargadas
 */
@Query("""
    SELECT DISTINCT u FROM User u
    LEFT JOIN FETCH u.images
    LEFT JOIN FETCH u.tags
    LEFT JOIN FETCH u.userRole
    WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))
    """)
Optional<User> findByEmailWithLoginData(@Param("email") String email);
```

**Actualizar AuthService:**

```java
// Línea 290 - Reemplazar:
User userWithCollections = userRepository.findByEmail(normalizedEmail).orElseThrow();

// Por:
User userWithCollections = userRepository.findByEmailWithLoginData(normalizedEmail).orElseThrow();

// Eliminar líneas 293-296 (ya no necesarias)
```

---

### 2. Reemplazar `BadRequestException` de Apache Coyote

**Problema:**

```java
// Línea 21
import org.apache.coyote.BadRequestException;

// Línea 712
public RefreshTokenResponseDTO refreshToken(final RefreshTokenRequestDTO request)
    throws BadRequestException {
```

**Mejora:** Usar excepción del paquete de excepciones del proyecto

**Opción A: Crear excepción propia**

**Archivo:** `src/main/java/com/feeling/exception/BadRequestException.java`

```java
package com.feeling.exception;

/**
 * Excepción lanzada cuando una solicitud tiene parámetros inválidos.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

**Opción B: Usar excepción existente**

Verificar si existe `IllegalArgumentException` o similar en el paquete de excepciones.

**Actualizar AuthService:**

```java
// ELIMINAR:
import org.apache.coyote.BadRequestException;

// AGREGAR:
import com.feeling.exception.BadRequestException;

// El resto del método queda igual
```

---

## ✅ MÉTODOS CORE CONFIRMADOS

Total: **19 métodos** que soportan los endpoints solicitados

### GRUPO 1: REGISTRO Y VERIFICACIÓN (4 métodos)

| Método | Línea | Estado | Acción |
|--------|-------|--------|--------|
| `register()` | 83 | ✅ EXCELENTE | Mantener |
| `registerWithGoogle()` | 110 | ✅ EXCELENTE | Mantener |
| `verifyCode()` | 391 | ✅ EXCELENTE | Mantener |
| `resendCode()` | 453 | ✅ EXCELENTE | Mantener |

### GRUPO 2: AUTENTICACIÓN (4 métodos)

| Método | Línea | Estado | Acción |
|--------|-------|--------|--------|
| `login()` | 240 | ✅ BUENO | Mantener (mejora opcional) |
| `loginWithGoogle()` | 157 | ✅ EXCELENTE | Mantener |
| `refreshToken()` | 712 | ✅ BUENO | Mantener (mejora opcional) |
| `logout()` | 1284 | 🟡 BUENO | Agregar JavaDoc |

### GRUPO 3: CONSULTAS DE AUTENTICACIÓN (5 métodos)

| Método | Línea | Estado | Acción |
|--------|-------|--------|--------|
| `getAuthMethodInfo()` | 1367 | 🟡 BUENO | Agregar JavaDoc |
| `checkEmailAvailability()` | 1166 | 🟡 BUENO | Agregar JavaDoc |
| `getUserVerificationStatus()` | 1192 | 🟡 BUENO | Agregar JavaDoc |
| `isVerificationCodeValid()` | 1217 | 🟡 BUENO | Agregar JavaDoc |
| `isUserFullyRegistered()` | 1055 | 🟡 BUENO | Agregar JavaDoc |

### GRUPO 4: GESTIÓN DE CONTRASEÑAS (4 métodos)

| Método | Línea | Estado | Acción |
|--------|-------|--------|--------|
| `forgotPassword()` | 512 | ✅ EXCELENTE | Mantener |
| `resetPassword()` | 581 | ✅ EXCELENTE | Mantener |
| `validateResetToken()` | 651 | ✅ EXCELENTE | Mantener |
| `changePassword()` | 1122 | 🔴 CRÍTICO | Refactorizar DTO |

### GRUPO 5: LIMPIEZA Y MANTENIMIENTO (2 métodos)

| Método | Línea | Estado | Acción |
|--------|-------|--------|--------|
| `cleanupExpiredVerificationCodes()` | 1247 | 🟡 EXCELENTE | Agregar JavaDoc |
| `cleanupOldTokens()` | 920 | 🟡 EXCELENTE | Mejorar JavaDoc |

---

## ☑️ CHECKLIST DE VERIFICACIÓN

### Antes de Empezar

- [ ] Hacer commit de cambios actuales
- [ ] Crear branch de refactorización: `git checkout -b refactor/auth-service`
- [ ] Hacer backup del archivo original

### Refactorizaciones Críticas

- [ ] **CRÍTICO 1:** Mover `ChangePasswordRequestDTO` de PasswordController a domain.dto.request
- [ ] **CRÍTICO 2:** Expandir wildcard import en línea 6
- [ ] **CRÍTICO 3:** Eliminar import de `PasswordController` en línea 5
- [ ] **CRÍTICO 4:** Actualizar firma de `changePassword()` en línea 1122
- [ ] **CRÍTICO 5:** Actualizar PasswordController para usar DTO del dominio
- [ ] **CRÍTICO 6:** Implementar llamada a `logout()` en AuthController línea 311

### Métodos a Eliminar

- [ ] Buscar usos de `verifyEmail()` con grep
- [ ] Eliminar `verifyEmail()` línea 1152
- [ ] Actualizar VerificationController línea 62
- [ ] Actualizar AuthController línea 103
- [ ] Buscar usos de `resendVerificationCode()` con grep
- [ ] Eliminar `resendVerificationCode()` línea 1159
- [ ] Actualizar VerificationController línea 95
- [ ] Actualizar AuthController línea 125
- [ ] Buscar usos de `getUserByEmail()` con grep
- [ ] Eliminar `getUserByEmail()` línea 1069 O agregar JavaDoc si se mantiene
- [ ] Actualizar controladores que lo usan (si se elimina)
- [ ] Buscar usos de `extractEmailFromToken()` con grep
- [ ] Eliminar `extractEmailFromToken()` línea 1271 (si no tiene usos)
- [ ] Buscar usos de `isPasswordResetTokenValid()` con grep
- [ ] Eliminar `isPasswordResetTokenValid()` línea 1101
- [ ] Actualizar usos para usar `validateResetToken()` en su lugar

### JavaDoc Faltante

- [ ] Agregar JavaDoc a `logout()` línea 1284
- [ ] Agregar JavaDoc a `getAuthMethodInfo()` línea 1367
- [ ] Agregar JavaDoc a `checkEmailAvailability()` línea 1166
- [ ] Agregar JavaDoc a `getUserVerificationStatus()` línea 1192
- [ ] Agregar JavaDoc a `isVerificationCodeValid()` línea 1217
- [ ] Agregar JavaDoc a `isUserFullyRegistered()` línea 1055
- [ ] Agregar JavaDoc a `cleanupExpiredVerificationCodes()` línea 1247
- [ ] Mejorar JavaDoc de `cleanupOldTokens()` línea 920

### Mejoras Opcionales (Decidir si implementar)

- [ ] Crear query `findByEmailWithLoginData()` en IUserRepository
- [ ] Actualizar `login()` para usar query optimizada
- [ ] Eliminar carga lazy manual en líneas 293-296
- [ ] Crear excepción `BadRequestException` propia
- [ ] Reemplazar import de Apache Coyote en línea 21
- [ ] Actualizar `refreshToken()` para usar nueva excepción

### Verificación Final

- [ ] Compilar proyecto: `./mvnw clean compile`
- [ ] Ejecutar tests: `./mvnw test`
- [ ] Verificar que no hay imports sin uso
- [ ] Verificar que no hay warnings del IDE
- [ ] Verificar organización de métodos según guía
- [ ] Ejecutar aplicación y probar endpoints afectados
- [ ] Revisar logs de Structured Logger

### Post-Refactorización

- [ ] Commit de cambios: `git commit -m "refactor(auth): Apply DDD principles to AuthService"`
- [ ] Crear PR para revisión
- [ ] Actualizar documentación si es necesario

---

## 📌 NOTAS IMPORTANTES

### Decisiones Pendientes

1. **getUserByEmail()** - Decidir si eliminarlo o mantenerlo con JavaDoc
   - **Eliminar:** Si se prefiere exponer repositorio a controladores
   - **Mantener:** Si se prefiere encapsulación (recomendado)

2. **Mejoras opcionales** - Decidir prioridad
   - **FETCH JOIN:** Beneficio alto, esfuerzo medio
   - **BadRequestException:** Beneficio bajo, esfuerzo bajo

### Orden Recomendado de Ejecución

1. Refactorizaciones Críticas (obligatorias)
2. Métodos a Eliminar (limpieza)
3. JavaDoc Faltante (documentación)
4. Mejoras Opcionales (performance)

### Archivos Afectados

```
src/main/java/com/feeling/
├── packages/auth/
│   ├── application/
│   │   ├── AuthController.java (actualizar endpoints)
│   │   ├── PasswordController.java (actualizar DTO)
│   │   └── VerificationController.java (actualizar endpoints)
│   └── domain/
│       ├── dto/
│       │   └── request/
│       │       └── ChangePasswordRequestDTO.java (CREAR)
│       └── services/
│           └── AuthService.java (REFACTORIZAR)
└── user/
    └── infrastructure/
        └── repositories/
            └── IUserRepository.java (query opcional)
```

---

**Fecha de creación:** 2025-01-09
**Basado en:** REFACTORING_GUIDE.md v2.0
**Autor:** J. Alexander Gavilán M.
