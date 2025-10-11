# Plan de Migración a PasswordService

**Fecha:** 2025-01-09
**Estado:** PasswordService creado ✅ - Requiere integración
**Autor:** J. Alexander Gavilán M.

---

## 🎯 OBJETIVO

Separar toda la lógica de gestión de contraseñas de `AuthService` a un servicio dedicado `PasswordService`, mejorando la arquitectura DDD y la separación de responsabilidades.

---

## ✅ COMPLETADO

### 1. PasswordService Creado

**Archivo:** `src/main/java/com/feeling/packages/auth/domain/services/PasswordService.java`

**Métodos implementados:**

```java
// Recuperación de contraseña
✅ forgotPassword(ForgotPasswordRequestDTO)
✅ resetPassword(ResetPasswordRequestDTO)
✅ validateResetToken(String token)

// Cambio de contraseña
✅ changePassword(ChangePasswordRequestDTO, String authHeader)

// Validación (delega a PasswordValidationService)
✅ validatePassword(String password, String userEmail)
✅ isPasswordCompromised(String password)
✅ generatePasswordSuggestions()

// Métodos privados
✅ generatePasswordResetToken()
✅ revokeAllUserAuthTokens(User user)
```

**Características:**
- ✅ JavaDoc completo en todos los métodos
- ✅ Logging estructurado
- ✅ Transaccionalidad correcta
- ✅ Validación con `PasswordValidationService`
- ✅ Métodos de dominio de entidades
- ✅ Manejo de excepciones específico

---

## 🔧 PASOS PENDIENTES

### PASO 1: Actualizar PasswordController

**Archivo:** `src/main/java/com/feeling/packages/auth/application/PasswordController.java`

**Cambio 1: Reemplazar dependencia**

```java
// ANTES:
private final AuthService authService;

// DESPUÉS:
private final PasswordService passwordService;
```

**Cambio 2: Actualizar endpoints**

```java
// ENDPOINT: POST /auth/password/forgot
// ANTES:
MessageResponseDTO response = authService.forgotPassword(request);
// DESPUÉS:
MessageResponseDTO response = passwordService.forgotPassword(request);

// ENDPOINT: POST /auth/password/reset
// ANTES:
MessageResponseDTO response = authService.resetPassword(request);
// DESPUÉS:
MessageResponseDTO response = passwordService.resetPassword(request);

// ENDPOINT: GET /auth/password/validate-reset-token/{token}
// ANTES:
TokenValidationDTO response = authService.validateResetToken(token);
// DESPUÉS:
TokenValidationDTO response = passwordService.validateResetToken(token);

// ENDPOINT: POST /auth/password/change
// ANTES:
MessageResponseDTO response = authService.changePassword(request, authHeader);
// DESPUÉS:
MessageResponseDTO response = passwordService.changePassword(request, authHeader);
```

---

### PASO 2: Eliminar Métodos de AuthService

**Archivo:** `src/main/java/com/feeling/packages/auth/domain/services/AuthService.java`

**Métodos a ELIMINAR:**

```java
// ❌ ELIMINAR - Línea 527
public MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO request) { ... }

// ❌ ELIMINAR - Línea 596
public MessageResponseDTO resetPassword(ResetPasswordRequestDTO request) { ... }

// ❌ ELIMINAR - Línea 666
public TokenValidationDTO validateResetToken(String token) { ... }

// ❌ ELIMINAR - Línea 1145
public MessageResponseDTO changePassword(ChangePasswordRequestDTO request, String authHeader) { ... }

// ❌ ELIMINAR - Línea 799 (método privado)
private String generatePasswordResetToken() { ... }
```

**Imports a ELIMINAR de AuthService:**

```java
import com.feeling.packages.auth.domain.dto.ForgotPasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.ResetPasswordRequestDTO;
import com.feeling.packages.auth.domain.dto.request.ChangePasswordRequestDTO;
```

**Nota:** MANTENER `TokenValidationDTO` si se usa en otros métodos.

---

### PASO 3: Verificar Dependencias Cruzadas

**Verificar que NO haya código en AuthService que llame a:**
- `forgotPassword()`
- `resetPassword()`
- `validateResetToken()`
- `changePassword()`

```bash
# Comando para verificar:
grep -n "forgotPassword\|resetPassword\|validateResetToken\|changePassword\|generatePasswordResetToken" src/main/java/com/feeling/packages/auth/domain/services/AuthService.java
```

---

## 📊 ARQUITECTURA FINAL

### Antes (Monolítico)

```
AuthService (Todo en uno)
├── Registro
├── Login
├── Verificación email
├── Recuperación contraseñas  ← 🔴 Mezclado
├── Cambio contraseñas         ← 🔴 Mezclado
├── Gestión tokens JWT
└── OAuth
```

### Después (Separado)

```
┌─────────────────────┐
│   AuthService       │
│  ✅ Registro         │
│  ✅ Login            │
│  ✅ Verificación     │
│  ✅ Tokens JWT       │
│  ✅ OAuth            │
└─────────────────────┘

┌─────────────────────────────┐
│   PasswordService (NUEVO)   │
│  ✅ Forgot password          │
│  ✅ Reset password           │
│  ✅ Change password          │
│  ✅ Validate token           │
│     └─ Usa ↓                │
└─────────────────────────────┘

┌─────────────────────────────┐
│ PasswordValidationService   │
│  ✅ Validar complejidad      │
│  ✅ Calcular entropía        │
│  ✅ Detectar comprometidas   │
│  ✅ Generar sugerencias      │
└─────────────────────────────┘
```

---

## 🔄 FLUJOS DE USO

### Flujo 1: Olvidé mi contraseña

```
Cliente → POST /auth/password/forgot
  ↓
PasswordController.forgotPassword()
  ↓
PasswordService.forgotPassword()
  ↓
1. Valida usuario existe y está verificado
2. Valida es usuario LOCAL (no OAuth)
3. Genera token UUID + timestamp
4. Elimina tokens anteriores
5. Guarda token en BD (expira en 1h)
6. Envía email con enlace
  ↓
Response: "Enlace enviado a tu email"
```

### Flujo 2: Restablecer contraseña

```
Cliente → POST /auth/password/reset
  ↓
PasswordController.resetPassword()
  ↓
PasswordService.resetPassword()
  ↓
1. Valida token existe y es válido
2. Valida contraseñas coinciden
3. Valida nueva contraseña (PasswordValidationService)
4. Actualiza contraseña (bcrypt)
5. Marca token como usado
6. Revoca todas las sesiones
7. Envía email de confirmación
  ↓
Response: "Contraseña restablecida"
```

### Flujo 3: Cambiar contraseña (autenticado)

```
Cliente → POST /auth/password/change (con JWT)
  ↓
PasswordController.changePassword()
  ↓
PasswordService.changePassword()
  ↓
1. Extrae email del JWT
2. Valida contraseña actual
3. Valida contraseñas nuevas coinciden
4. Valida nueva contraseña (PasswordValidationService)
5. Verifica no sea la misma contraseña
6. Actualiza contraseña (bcrypt)
7. Envía email de notificación
8. NO revoca sesiones (usuario sigue auth)
  ↓
Response: "Contraseña cambiada"
```

---

## 🎨 BENEFICIOS DE LA SEPARACIÓN

### 1. Separación de Responsabilidades (SRP)
- **AuthService:** Autenticación y autorización
- **PasswordService:** Gestión de contraseñas
- **PasswordValidationService:** Validación y políticas

### 2. Mantenibilidad
- Código más fácil de encontrar
- Menos acoplamiento
- Pruebas más focalizadas

### 3. Reutilización
- PasswordService puede usarse independientemente
- Otros servicios pueden delegar a PasswordService
- Validación centralizada

### 4. Testabilidad
- Tests unitarios más simples
- Mocking más fácil
- Cobertura más clara

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-implementación
- [x] Crear PasswordService con todos los métodos
- [x] Documentar con JavaDoc completo
- [x] Integrar PasswordValidationService
- [ ] Revisar este plan con el equipo

### Implementación
- [ ] **PASO 1:** Actualizar PasswordController
  - [ ] Cambiar dependencia a PasswordService
  - [ ] Actualizar 4 endpoints
  - [ ] Verificar imports

- [ ] **PASO 2:** Eliminar métodos de AuthService
  - [ ] Eliminar `forgotPassword()`
  - [ ] Eliminar `resetPassword()`
  - [ ] Eliminar `validateResetToken()`
  - [ ] Eliminar `changePassword()`
  - [ ] Eliminar `generatePasswordResetToken()`
  - [ ] Limpiar imports no usados

- [ ] **PASO 3:** Verificación
  - [ ] Compilar: `./mvnw clean compile`
  - [ ] Ejecutar tests: `./mvnw test`
  - [ ] Probar endpoints en Postman
  - [ ] Verificar logs estructurados

### Post-implementación
- [ ] Actualizar documentación de API
- [ ] Crear/actualizar tests unitarios
- [ ] Crear/actualizar tests de integración
- [ ] Code review
- [ ] Merge a develop

---

## 🚨 NOTAS IMPORTANTES

### ⚠️ Cambios Breaking

**NO hay cambios breaking** - Los endpoints mantienen las mismas rutas y contratos:
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /auth/password/validate-reset-token/{token}`
- `POST /auth/password/change`

### 🔒 Seguridad

El nuevo `PasswordService` **MEJORA** la seguridad:
- ✅ Validación de contraseñas más robusta
- ✅ Integración con `PasswordValidationService`
- ✅ Verifica contraseñas comprometidas
- ✅ Calcula entropía
- ✅ Valida contra información personal

### 📧 Emails

Todos los emails de contraseñas ahora se envían desde `PasswordService`:
- Email de recuperación (forgot password)
- Email de confirmación (reset password)
- Email de notificación (change password)

---

## 📝 COMANDOS ÚTILES

### Verificar usos de métodos antes de eliminar

```bash
# Buscar usos de forgotPassword
grep -rn "forgotPassword" src/ --include="*.java" | grep -v "PasswordService"

# Buscar usos de resetPassword
grep -rn "resetPassword" src/ --include="*.java" | grep -v "PasswordService"

# Buscar usos de changePassword
grep -rn "changePassword" src/ --include="*.java" | grep -v "PasswordService"

# Buscar usos de validateResetToken
grep -rn "validateResetToken" src/ --include="*.java" | grep -v "PasswordService"
```

### Compilar y probar

```bash
# Compilar sin tests
./mvnw clean compile -DskipTests

# Ejecutar solo tests de password
./mvnw test -Dtest=*Password*

# Ejecutar aplicación
./mvnw spring-boot:run
```

---

## 📚 REFERENCIAS

- **REFACTORING_GUIDE.md** - Guía de refactorización del proyecto
- **AUTH_SERVICE_REFACTORING_PLAN.md** - Plan de refactorización de AuthService
- **PasswordService.java** - Servicio implementado
- **PasswordValidationService.java** - Servicio de validación existente

---

**Siguiente paso:** Ejecutar PASO 1 - Actualizar PasswordController

**Fecha de actualización:** 2025-01-09
**Estado:** ✅ PasswordService creado - ⏳ Pendiente integración
